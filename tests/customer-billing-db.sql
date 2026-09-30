-- Run ONLY in a fresh, disposable local database named menuzo_billing_test:
-- psql -v ON_ERROR_STOP=1 -d menuzo_billing_test -f tests/customer-billing-db.sql
-- These fixtures never read project credentials or connect to Supabase.
\set ON_ERROR_STOP on

DO $$ BEGIN
  IF current_database() <> 'menuzo_billing_test' THEN
    RAISE EXCEPTION 'Use an isolated database named menuzo_billing_test.';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.role', true), '');
$$;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  subscription_plan text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'active',
  subscription_expires_at timestamptz
);
CREATE TABLE public.shops (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  username text UNIQUE,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shops TO authenticated;
GRANT SELECT ON public.shops TO anon;
GRANT ALL ON public.shops, public.profiles TO service_role;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY owner_shops ON public.shops FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY open_shops ON public.shops FOR SELECT TO anon, authenticated USING (is_open);

\ir ../supabase/migrations/20260929000001_customer_billing.sql

CREATE FUNCTION pg_temp.assert_true(p_result boolean, p_message text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  IF p_result IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', p_message; END IF;
END $$;
CREATE FUNCTION pg_temp.expect_error(p_statement text, p_message_pattern text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  BEGIN
    EXECUTE p_statement;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE p_message_pattern THEN
      RAISE EXCEPTION 'Expected %, got %', p_message_pattern, SQLERRM;
    END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'Statement unexpectedly succeeded: %', p_statement;
END $$;

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.profiles (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'one@example.test'),
  ('00000000-0000-0000-0000-000000000002', 'two@example.test');
INSERT INTO public.shops (id, user_id, name, username) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Free Cafe', 'free-cafe-11'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Premium Bistro', 'paid-cafe-22');
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.billing_periods WHERE amount IS NULL), 'prices start unconfigured');
SELECT pg_temp.assert_true((SELECT NOT enabled AND bank_name = '' AND whatsapp_number = '' FROM public.bank_transfer_settings), 'bank details are empty and disabled');

SET ROLE anon;
SELECT set_config('request.jwt.claim.role', 'anon', false);
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.billing_periods), 'public can read periods');
SELECT pg_temp.expect_error('SELECT * FROM public.bank_transfer_settings', 'permission denied%');
SELECT pg_temp.expect_error('SELECT * FROM public.billing_payment_requests', 'permission denied%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1)$q$, 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role', 'authenticated', false);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1)$q$, 'Pricing is not available%');
SELECT pg_temp.expect_error('INSERT INTO public.billing_payment_requests DEFAULT VALUES', 'permission denied%');
SELECT pg_temp.expect_error($q$INSERT INTO public.shop_custom_urls (shop_id, slug) VALUES ('10000000-0000-0000-0000-000000000001', 'free-vanity')$q$, 'permission denied%');
SELECT pg_temp.expect_error($q$UPDATE public.profiles SET subscription_plan = 'pro'$q$, 'Subscription and role changes%');
SELECT pg_temp.expect_error($q$UPDATE public.profiles SET subscription_expires_at = now() + interval '10 years'$q$, 'Subscription and role changes%');
SELECT pg_temp.expect_error($q$UPDATE public.profiles SET subscription_status = 'cancelled'$q$, 'Subscription and role changes%');
SELECT pg_temp.expect_error($q$UPDATE public.profiles SET role = 'admin'$q$, 'Subscription and role changes%');
UPDATE public.profiles SET email = 'updated@example.test' WHERE id = auth.uid();
SELECT pg_temp.assert_true((SELECT email = 'updated@example.test' FROM public.profiles), 'ordinary profile changes remain allowed');
RESET ROLE;
SELECT set_config('request.jwt.claim.role', '', false);

-- These deliberately fake fixtures exist only in the disposable test database.
UPDATE public.billing_periods SET amount = 100, currency = 'LKR' WHERE id = 'monthly';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role', 'authenticated', false);
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1)$q$, 'Bank transfer payments are not available%');
RESET ROLE;
SELECT set_config('request.jwt.claim.role', '', false);
UPDATE public.bank_transfer_settings SET bank_name = 'Test Bank', account_name = 'Test Account', account_number = '000000', branch = 'Test Branch', whatsapp_number = '94770000000', enabled = true;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role', 'authenticated', false);
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000002', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1)$q$, 'You can only submit%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 1, 'LKR', 1)$q$, 'Pricing changed%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'USD', 1)$q$, 'Pricing changed%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 12)$q$, 'Pricing changed%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', (now() AT TIME ZONE 'Asia/Colombo')::date + 1, 100, 'LKR', 1)$q$, 'Choose a transfer date%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1, 'admin-login')$q$, 'Choose a custom URL%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1, 'bad--slug')$q$, 'Choose a custom URL%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-1', current_date, 100, 'LKR', 1, 'paid-cafe-22')$q$, 'That custom URL is already in use%');
SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', ' Test Payer ', ' REF-1 ', (now() AT TIME ZONE 'Asia/Colombo')::date, 100, 'LKR', 1, 'my-custom-cafe', 'Payment proof sent separately');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.billing_payment_requests WHERE status = 'pending' AND amount = 100 AND months = 1 AND payer_name = 'Test Payer' AND transfer_reference = 'REF-1'), 'request snapshots server price and starts pending');
SELECT pg_temp.assert_true((SELECT subscription_plan = 'free' FROM public.profiles), 'submitting does not activate Pro');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001', 'monthly', 'Test Payer', 'REF-2', current_date, 100, 'LKR', 1)$q$, 'You already have a payment request%');
SELECT pg_temp.expect_error($q$UPDATE public.billing_payment_requests SET status = 'approved'$q$, 'permission denied%');
SELECT pg_temp.expect_error('DELETE FROM public.billing_payment_requests', 'permission denied%');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.billing_payment_requests), 'other owners cannot see requests');
RESET ROLE;
SELECT set_config('request.jwt.claim.role', '', false);

INSERT INTO public.shop_custom_urls (shop_id, slug) VALUES ('10000000-0000-0000-0000-000000000002', 'premium-bistro');
SELECT pg_temp.expect_error($q$UPDATE public.shop_custom_urls SET slug = 'admin-login'$q$, 'Choose a valid custom URL%');
SELECT pg_temp.expect_error($q$UPDATE public.shop_custom_urls SET slug = 'free-cafe-11'$q$, 'This menu URL is already in use%');
SELECT pg_temp.expect_error($q$INSERT INTO public.shops (id, user_id, name, username) VALUES ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Collision', 'premium-bistro')$q$, 'This menu URL is already in use%');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('premium-bistro')), 'assigned aliases stay inactive on Free');
UPDATE public.profiles SET subscription_plan = 'pro', subscription_expires_at = now() + interval '1 month' WHERE id = '00000000-0000-0000-0000-000000000002';
SET ROLE anon;
SELECT set_config('request.jwt.claim.role', 'anon', false);
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.resolve_menu_shop('premium-bistro')), 'active paid alias resolves publicly');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.resolve_menu_shop('paid-cafe-22')), 'permanent link also works');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('free-cafe')), 'shop names cannot create free vanity aliases');
RESET ROLE;
SELECT set_config('request.jwt.claim.role', '', false);
UPDATE public.profiles SET subscription_expires_at = now() - interval '1 second' WHERE id = '00000000-0000-0000-0000-000000000002';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('premium-bistro')), 'expired alias cannot fall through to matching shop name');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.resolve_menu_shop('paid-cafe-22')), 'expiry preserves permanent menu URL');
UPDATE public.profiles SET subscription_expires_at = now() + interval '1 month', subscription_status = 'cancelled' WHERE id = '00000000-0000-0000-0000-000000000002';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('premium-bistro')), 'cancelled subscription disables alias');
UPDATE public.profiles SET subscription_status = 'active' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.shops SET is_open = false WHERE id = '10000000-0000-0000-0000-000000000002';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('premium-bistro')), 'closed shops do not resolve through aliases');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.resolve_menu_shop('paid-cafe-22')), 'closed shops do not resolve through permanent links');

\echo 'Customer billing migration and security checks passed.'
