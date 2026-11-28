BEGIN;

-- Per-plan subscription prices. billing_periods keeps the period definitions
-- (label, months); the price a shop pays now depends on the plan as well.
-- Plus keeps whatever billing_periods currently charges; Enterprise moves out of
-- the app code into the database at LKR 6,000 / month and LKR 65,000 / year.
CREATE TABLE public.plan_prices (
  plan_slug text NOT NULL CHECK (plan_slug IN ('plus', 'enterprise')),
  period_id text NOT NULL REFERENCES public.billing_periods(id) ON UPDATE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'LKR' CHECK (currency ~ '^[A-Z]{3}$'),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (plan_slug, period_id)
);

INSERT INTO public.plan_prices (plan_slug, period_id, amount, currency)
SELECT 'plus', p.id,
       coalesce(p.amount, CASE p.months WHEN 12 THEN 15000.00 ELSE 1500.00 END),
       CASE WHEN p.amount IS NULL THEN 'LKR' ELSE p.currency END
FROM public.billing_periods p
WHERE p.id IN ('monthly', 'yearly');

INSERT INTO public.plan_prices (plan_slug, period_id, amount, currency)
SELECT 'enterprise', p.id, CASE p.months WHEN 12 THEN 65000.00 ELSE 6000.00 END, 'LKR'
FROM public.billing_periods p
WHERE p.id IN ('monthly', 'yearly');

ALTER TABLE public.plan_prices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.plan_prices FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.plan_prices TO anon, authenticated;
GRANT ALL ON public.plan_prices TO service_role;
-- Prices are public (landing page). Writes go only through admin_set_plan_price.
CREATE POLICY "Anyone can read plan prices"
  ON public.plan_prices FOR SELECT TO anon, authenticated USING (true);

CREATE FUNCTION public.admin_set_plan_price(p_plan_slug text, p_period_id text, p_amount numeric)
RETURNS public.plan_prices
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_row public.plan_prices%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 9999999999 OR p_amount <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'Enter a price above zero with at most two decimal places.';
  END IF;
  UPDATE public.plan_prices
  SET amount = p_amount, updated_at = now(), updated_by = auth.uid()
  WHERE plan_slug = p_plan_slug AND period_id = p_period_id
  RETURNING * INTO v_row;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'That plan price does not exist.';
  END IF;
  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_plan_price(text, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_plan_price(text, text, numeric) TO authenticated;

-- Production's subscription restructure added plan_slug; keep local databases in step.
ALTER TABLE public.billing_payment_requests ADD COLUMN IF NOT EXISTS plan_slug text DEFAULT 'plus';

-- The checkout price now comes from plan_prices for the chosen plan. The old
-- plan-less overload priced everything as Plus, so it is removed.
DROP FUNCTION IF EXISTS public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text);
DROP FUNCTION IF EXISTS public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text, text);

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
  p_customer_note text DEFAULT NULL,
  p_plan_slug text DEFAULT 'plus'
)
RETURNS public.billing_payment_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_plan text := CASE WHEN coalesce(p_plan_slug, 'plus') = 'pro' THEN 'plus' ELSE coalesce(p_plan_slug, 'plus') END;
  v_period public.billing_periods%ROWTYPE;
  v_price public.plan_prices%ROWTYPE;
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
  IF v_plan NOT IN ('plus', 'enterprise') THEN
    RAISE EXCEPTION 'Choose the Plus or Enterprise plan.';
  END IF;

  SELECT * INTO v_period FROM public.billing_periods WHERE id = p_period_id AND active;
  SELECT * INTO v_price FROM public.plan_prices WHERE plan_slug = v_plan AND period_id = p_period_id;
  IF v_period.id IS NULL OR v_price.plan_slug IS NULL THEN
    RAISE EXCEPTION 'Pricing is not available for this period yet. Please try again later.';
  END IF;
  IF p_expected_amount IS DISTINCT FROM v_price.amount
     OR p_expected_currency IS DISTINCT FROM v_price.currency
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
       OR EXISTS (SELECT 1 FROM public.shop_custom_urls c WHERE c.slug = v_slug AND c.shop_id <> p_shop_id)
       OR EXISTS (SELECT 1 FROM public.shop_url_history h WHERE h.slug = v_slug AND h.shop_id <> p_shop_id) THEN
      RAISE EXCEPTION 'That custom URL is already in use. Choose another one.';
    END IF;
  END IF;

  -- Price, currency, duration, plan, identity, and pending status are always set here.
  -- The request records a payment claim, never proof of payment or entitlement.
  INSERT INTO public.billing_payment_requests (
    user_id, shop_id, period_id, period_label, months, amount, currency,
    payer_name, transfer_reference, transferred_on, requested_slug, customer_note, plan_slug
  ) VALUES (
    v_user_id, p_shop_id, v_period.id, v_period.label, v_period.months,
    v_price.amount, v_price.currency, btrim(p_payer_name), btrim(p_transfer_reference),
    p_transferred_on, v_slug, nullif(btrim(p_customer_note), ''), coalesce(p_plan_slug, 'plus')
  ) RETURNING * INTO v_request;
  RETURN v_request;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'You already have a payment request awaiting review.' USING ERRCODE = '23505';
END;
$$;
REVOKE ALL ON FUNCTION public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_payment_request(uuid, text, text, text, date, numeric, text, integer, text, text, text) TO authenticated;

COMMIT;
