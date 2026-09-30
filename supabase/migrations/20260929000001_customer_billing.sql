BEGIN;

-- Customer checkout data only. Payment review and subscription activation remain
-- trusted server operations; this migration exposes no customer approval API.
CREATE TABLE public.billing_periods (
  id text PRIMARY KEY,
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 80),
  months integer NOT NULL CHECK (months BETWEEN 1 AND 120),
  amount numeric(12, 2) CHECK (amount IS NULL OR amount > 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  active boolean NOT NULL DEFAULT true
);

-- Pricing will be supplied later. NULL is deliberately not a payable price.
INSERT INTO public.billing_periods (id, label, months, amount, currency)
VALUES ('monthly', 'Monthly', 1, NULL, 'USD'),
       ('yearly', 'Yearly', 12, NULL, 'USD');

CREATE TABLE public.bank_transfer_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  bank_name text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  branch text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false
);

-- No bank account or contact number is fabricated. Checkout stays disabled until
-- a trusted operator supplies the real details and explicitly enables it.
INSERT INTO public.bank_transfer_settings (id) VALUES (true);

CREATE TABLE public.billing_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  period_id text NOT NULL REFERENCES public.billing_periods(id),
  period_label text NOT NULL,
  months integer NOT NULL CHECK (months BETWEEN 1 AND 120),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  payer_name text NOT NULL CHECK (char_length(btrim(payer_name)) BETWEEN 2 AND 120),
  transfer_reference text NOT NULL CHECK (char_length(btrim(transfer_reference)) BETWEEN 3 AND 120),
  transferred_on date NOT NULL,
  requested_slug text CHECK (
    requested_slug IS NULL OR
    (char_length(requested_slug) BETWEEN 3 AND 50 AND requested_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  ),
  customer_note text CHECK (customer_note IS NULL OR char_length(customer_note) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE UNIQUE INDEX billing_payment_requests_one_pending_per_shop
  ON public.billing_payment_requests (shop_id) WHERE status = 'pending';
CREATE INDEX billing_payment_requests_owner_created_at
  ON public.billing_payment_requests (user_id, created_at DESC);

CREATE TABLE public.shop_custom_urls (
  shop_id uuid PRIMARY KEY REFERENCES public.shops(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE CHECK (
    char_length(slug) BETWEEN 3 AND 50 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_custom_urls ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.billing_periods, public.bank_transfer_settings,
  public.billing_payment_requests, public.shop_custom_urls FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.billing_periods TO anon, authenticated;
GRANT SELECT ON public.bank_transfer_settings, public.billing_payment_requests,
  public.shop_custom_urls TO authenticated;
GRANT ALL ON public.billing_periods, public.bank_transfer_settings,
  public.billing_payment_requests, public.shop_custom_urls TO service_role;

CREATE POLICY "Anyone can read active billing periods"
  ON public.billing_periods FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Customers can read bank transfer settings"
  ON public.bank_transfer_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers can read their payment requests"
  ON public.billing_payment_requests FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Owners can read their assigned custom URL"
  ON public.shop_custom_urls FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shops s
    WHERE s.id = shop_id AND s.user_id = (SELECT auth.uid())
  ));

-- Shared validation keeps paid aliases out of the application's root routes.
CREATE FUNCTION public.is_reserved_menu_slug(p_slug text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public, pg_temp AS $$
  SELECT lower(p_slug) = ANY (ARRAY[
    'admin', 'admin-login', 'admin-portal', 'api', 'assets', 'brand-book',
    'contact', 'demo', 'digital-menu', 'login', 'onboarding', 'privacy',
    'qr-menu', 'restaurant-menu', 'signup', 'subscription', 'terms', 'www'
  ]::text[]);
$$;
REVOKE ALL ON FUNCTION public.is_reserved_menu_slug(text) FROM PUBLIC, anon, authenticated;

-- Canonical usernames remain stable. Custom URLs occupy a separate namespace
-- shared with usernames, and only trusted server operations can assign them.
CREATE FUNCTION public.validate_custom_shop_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug <> lower(btrim(NEW.slug))
     OR char_length(NEW.slug) NOT BETWEEN 3 AND 50
     OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     OR public.is_reserved_menu_slug(NEW.slug) THEN
    RAISE EXCEPTION 'Choose a valid custom URL using 3-50 lowercase letters, numbers, or single hyphens.';
  END IF;

  -- All insertions into either namespace take the same lock for this slug.
  PERFORM pg_advisory_xact_lock(hashtext('menuzo-shop-slug'), hashtext(NEW.slug));
  IF EXISTS (SELECT 1 FROM public.shops s WHERE lower(s.username) = NEW.slug) THEN
    RAISE EXCEPTION 'This menu URL is already in use.' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_custom_shop_slug() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_custom_shop_slug
  BEFORE INSERT OR UPDATE OF slug ON public.shop_custom_urls
  FOR EACH ROW EXECUTE FUNCTION public.validate_custom_shop_slug();

CREATE FUNCTION public.protect_shop_slug_namespace()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_slug text := lower(NEW.username);
BEGIN
  IF NEW.username IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.username IS NOT DISTINCT FROM OLD.username THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('menuzo-shop-slug'), hashtext(v_slug));
  IF public.is_reserved_menu_slug(v_slug)
     OR EXISTS (SELECT 1 FROM public.shop_custom_urls c WHERE c.slug = v_slug)
     OR EXISTS (SELECT 1 FROM public.shops s WHERE lower(s.username) = v_slug AND s.id <> NEW.id) THEN
    RAISE EXCEPTION 'This menu URL is already in use or reserved.' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_shop_slug_namespace() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_shop_slug_namespace
  BEFORE INSERT OR UPDATE OF username ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.protect_shop_slug_namespace();

CREATE FUNCTION public.submit_payment_request(
  p_shop_id uuid,
  p_period_id text,
  p_payer_name text,
  p_transfer_reference text,
  p_transferred_on date,
  p_expected_amount numeric,
  p_expected_currency text,
  p_expected_months integer,
  p_requested_slug text DEFAULT NULL,
  p_customer_note text DEFAULT NULL
)
RETURNS public.billing_payment_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_period public.billing_periods%ROWTYPE;
  v_bank public.bank_transfer_settings%ROWTYPE;
  v_request public.billing_payment_requests%ROWTYPE;
  v_slug text := nullif(lower(btrim(p_requested_slug)), '');
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in before submitting a payment request.' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops s WHERE s.id = p_shop_id AND s.user_id = v_user_id) THEN
    RAISE EXCEPTION 'You can only submit a payment request for your own shop.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_period FROM public.billing_periods WHERE id = p_period_id AND active;
  IF NOT FOUND OR v_period.amount IS NULL OR v_period.amount <= 0 THEN
    RAISE EXCEPTION 'Pricing is not available for this period yet. Please try again later.';
  END IF;
  IF p_expected_amount IS DISTINCT FROM v_period.amount
     OR p_expected_currency IS DISTINCT FROM v_period.currency
     OR p_expected_months IS DISTINCT FROM v_period.months THEN
    RAISE EXCEPTION 'Pricing changed. Please review the latest price before making a transfer.';
  END IF;
  SELECT * INTO v_bank FROM public.bank_transfer_settings WHERE id = true;
  IF NOT FOUND OR NOT v_bank.enabled
     OR btrim(v_bank.bank_name) = '' OR btrim(v_bank.account_name) = ''
     OR btrim(v_bank.account_number) = '' OR btrim(v_bank.branch) = ''
     OR v_bank.whatsapp_number !~ '^[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION 'Bank transfer payments are not available yet. Please try again later.';
  END IF;
  IF p_payer_name IS NULL OR char_length(btrim(p_payer_name)) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Enter the account holder name used for the transfer (2-120 characters).';
  END IF;
  IF p_transfer_reference IS NULL OR char_length(btrim(p_transfer_reference)) NOT BETWEEN 3 AND 120 THEN
    RAISE EXCEPTION 'Enter a bank transfer reference of 3-120 characters.';
  END IF;
  IF p_transferred_on IS NULL OR p_transferred_on > (now() AT TIME ZONE 'Asia/Colombo')::date THEN
    RAISE EXCEPTION 'Choose a transfer date that is today or earlier.';
  END IF;
  IF p_customer_note IS NOT NULL AND char_length(btrim(p_customer_note)) > 1000 THEN
    RAISE EXCEPTION 'Keep your note within 1000 characters.';
  END IF;
  IF v_slug IS NOT NULL THEN
    IF char_length(v_slug) NOT BETWEEN 3 AND 50
       OR v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
       OR public.is_reserved_menu_slug(v_slug) THEN
      RAISE EXCEPTION 'Choose a custom URL with 3-50 letters, numbers, or single hyphens, avoiding reserved page names.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.shops s WHERE lower(s.username) = v_slug)
       OR EXISTS (SELECT 1 FROM public.shop_custom_urls c WHERE c.slug = v_slug AND c.shop_id <> p_shop_id) THEN
      RAISE EXCEPTION 'That custom URL is already in use. Choose another one.';
    END IF;
  END IF;

  -- Price, currency, duration, identity, and pending status are always set here.
  -- The request records a payment claim, never proof of payment or entitlement.
  INSERT INTO public.billing_payment_requests (
    user_id, shop_id, period_id, period_label, months, amount, currency,
    payer_name, transfer_reference, transferred_on, requested_slug, customer_note
  ) VALUES (
    v_user_id, p_shop_id, v_period.id, v_period.label, v_period.months,
    v_period.amount, v_period.currency, btrim(p_payer_name), btrim(p_transfer_reference),
    p_transferred_on, v_slug, nullif(btrim(p_customer_note), '')
  ) RETURNING * INTO v_request;
  RETURN v_request;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'You already have a payment request awaiting review.' USING ERRCODE = '23505';
END;
$$;
REVOKE ALL ON FUNCTION public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text)
  TO authenticated;

-- Resolve both permanent menu links and paid aliases without exposing profiles.
-- Registered but expired aliases cannot fall through to a legacy shop-name match.
CREATE FUNCTION public.resolve_menu_shop(p_slug text)
RETURNS SETOF public.shops
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_slug text := lower(btrim(p_slug));
  v_alias_shop_id uuid;
BEGIN
  IF v_slug IS NULL OR v_slug = '' OR char_length(v_slug) > 100
     OR public.is_reserved_menu_slug(v_slug) THEN
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM public.shops s WHERE lower(s.username) = v_slug) THEN
    RETURN QUERY SELECT s.* FROM public.shops s
      WHERE lower(s.username) = v_slug AND s.is_open = true LIMIT 1;
    RETURN;
  END IF;

  SELECT c.shop_id INTO v_alias_shop_id FROM public.shop_custom_urls c WHERE c.slug = v_slug;
  IF FOUND THEN
    RETURN QUERY SELECT s.* FROM public.shops s
      JOIN public.profiles p ON p.id = s.user_id
      WHERE s.id = v_alias_shop_id AND s.is_open = true
        AND p.subscription_plan IN ('pro', 'enterprise')
        AND p.subscription_status = 'active'
        AND p.subscription_expires_at > now();
    RETURN;
  END IF;

  -- Only old shops without a permanent username need the name-based fallback.
  RETURN QUERY SELECT s.* FROM public.shops s
    WHERE nullif(btrim(s.username), '') IS NULL AND s.is_open = true
      AND lower(s.name) = replace(v_slug, '-', ' ')
    ORDER BY s.created_at, s.id LIMIT 1;
END;
$$;
REVOKE ALL ON FUNCTION public.resolve_menu_shop(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_menu_shop(text) TO anon, authenticated, service_role;

-- Protect every entitlement column, including expiry. The old policy used
-- recursive same-table reads and left expiry mutable by the customer.
CREATE FUNCTION public.protect_profile_entitlements()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_existing_admin boolean := false;
BEGIN
  -- Keep the existing production admin permissions and trusted review functions.
  -- Fresh installations need no admins table for customer protections to work.
  IF current_user IN ('anon', 'authenticated')
     AND (NEW.role IS DISTINCT FROM OLD.role
       OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
       OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
       OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at) THEN
    IF to_regclass('public.admins') IS NOT NULL THEN
      EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.admins WHERE id = $1 AND is_active = true)'
        INTO v_existing_admin USING auth.uid();
    END IF;
    IF NOT v_existing_admin THEN
      RAISE EXCEPTION 'Subscription and role changes require a trusted server operation.' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_entitlements() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_profile_entitlements
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_entitlements();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

COMMIT;
