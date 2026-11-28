-- Run against a disposable copy of the production schema, never production.
-- psql -f tests/admin-dashboard-db.sql (after loading the schema and the migration)
\set ON_ERROR_STOP 1
\ir ../supabase/migrations/20261130000001_admin_dashboard_stats.sql

CREATE FUNCTION pg_temp.assert_true(p_result boolean, p_message text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  IF p_result IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', p_message; END IF;
END $$;
CREATE FUNCTION pg_temp.expect_error(p_statement text, p_message_pattern text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  BEGIN EXECUTE p_statement;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE p_message_pattern THEN RAISE EXCEPTION 'Expected %, got %', p_message_pattern, SQLERRM; END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'Statement unexpectedly succeeded: %', p_statement;
END $$;

INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'owner1@example.test', now()),
  ('d0000000-0000-0000-0000-000000000002', 'owner2@example.test', now()),
  ('d0000000-0000-0000-0000-000000000003', 'owner3@example.test', now()),
  ('d0000000-0000-0000-0000-000000000009', 'boss@example.test', now());
INSERT INTO public.profiles (id, email) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'owner1@example.test'),
  ('d0000000-0000-0000-0000-000000000002', 'owner2@example.test'),
  ('d0000000-0000-0000-0000-000000000003', 'owner3@example.test')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.admins (email, is_active) VALUES ('boss@example.test', true);
INSERT INTO public.billing_periods (id, label, months, currency) VALUES
  ('monthly', 'Monthly', 1, 'LKR'), ('yearly', 'Yearly', 12, 'LKR')
ON CONFLICT (id) DO NOTHING;

-- Two shops this month (one closed), one from three months ago.
INSERT INTO public.shops (id, user_id, name, is_open, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'New Open', true, now()),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'New Closed', false, now()),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Old', true, now() - interval '3 months');

INSERT INTO public.billing_payment_requests
  (user_id, shop_id, period_id, period_label, months, amount, currency, payer_name, transfer_reference, transferred_on, status, reviewed_at, created_at)
VALUES
  -- approved this month: counts toward month and year
  ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner One', 'REF-001', current_date, 'approved', now(), now()),
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'yearly', 'Yearly', 12, 65000, 'LKR', 'Owner Three', 'REF-002', current_date, 'approved', now(), now()),
  -- pending and rejected: not revenue
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner Two', 'REF-003', current_date, 'pending', NULL, now()),
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner Two', 'REF-004', current_date, 'rejected', now(), now()),
  -- approved two years ago: outside every window
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'monthly', 'Monthly', 1, 9999, 'LKR', 'Owner Three', 'REF-005', current_date, 'approved', now() - interval '2 years', now() - interval '2 years');

SET ROLE anon;
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_stats()', 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'd0000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_stats()', 'Company admin access required%');

SELECT set_config('request.jwt.claim.sub', 'd0000000-0000-0000-0000-000000000009', false);
CREATE TEMP TABLE s AS SELECT public.admin_dashboard_stats() AS j;
SELECT pg_temp.assert_true((SELECT (j->>'total_shops')::int = 3 FROM s), 'total shops');
SELECT pg_temp.assert_true((SELECT (j->>'total_shops_before_month')::int = 1 FROM s), 'shops before this month');
SELECT pg_temp.assert_true((SELECT (j->>'open_shops')::int = 2 AND (j->>'closed_shops')::int = 1 FROM s), 'open and closed shops');
SELECT pg_temp.assert_true((SELECT (j->>'new_shops_month')::int = 2 FROM s), 'new shops this month');
SELECT pg_temp.assert_true((SELECT (j->>'pending_payments')::int = 1 FROM s), 'pending payments');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_month')::numeric = 71000 FROM s), 'revenue this month ignores pending, rejected and old payments');
SELECT pg_temp.assert_true((SELECT (j->>'paying_shops_month')::int = 2 FROM s), 'paying shops this month');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_year')::numeric = 71000 FROM s), 'revenue this year');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_prev_year')::numeric = 0 FROM s), 'nothing last year');
SELECT pg_temp.assert_true((SELECT j->>'currency' = 'LKR' FROM s), 'currency');
RESET ROLE;

\echo admin dashboard checks passed
