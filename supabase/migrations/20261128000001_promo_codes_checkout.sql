-- Shop owners enter a promo code at checkout. The code is checked before they transfer
-- (preview_promo_code), then applied atomically with the payment request
-- (submit_payment_request_with_promo): the request records the discounted amount to
-- transfer, the original price and the code, and the shop's redemption is linked to it.
-- A rejected payment frees the redemption so the owner can try again.
-- Requires the subscription restructure (submit_payment_request with p_plan_slug).
BEGIN;

ALTER TABLE public.billing_payment_requests
  ADD COLUMN promo_code text,
  ADD COLUMN promo_discount_percent numeric(5,2),
  ADD COLUMN original_amount numeric;

ALTER TABLE public.promo_code_redemptions
  ADD COLUMN payment_request_id uuid UNIQUE REFERENCES public.billing_payment_requests(id) ON DELETE CASCADE;

-- Redemptions now only happen together with a payment request.
DROP FUNCTION public.redeem_promo_code(text, uuid, text);

-- Shared checks for preview and checkout. Not callable by clients.
CREATE FUNCTION public.promo_code_checkout_check(p_code text, p_shop_id uuid, p_plan text, p_lock boolean)
RETURNS public.promo_codes LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_code public.promo_codes%ROWTYPE; v_used integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to use a promo code.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You can only use promo codes for your own shop.' USING ERRCODE = '42501';
  END IF;
  IF p_lock THEN
    SELECT * INTO v_code FROM public.promo_codes WHERE code = upper(btrim(coalesce(p_code, ''))) FOR UPDATE;
  ELSE
    SELECT * INTO v_code FROM public.promo_codes WHERE code = upper(btrim(coalesce(p_code, '')));
  END IF;
  IF NOT FOUND OR NOT v_code.is_active THEN RAISE EXCEPTION 'This promo code is not valid.'; END IF;
  IF now() < v_code.valid_from THEN RAISE EXCEPTION 'This promo code is not active yet.'; END IF;
  IF now() > v_code.valid_until THEN RAISE EXCEPTION 'This promo code has expired.'; END IF;
  IF p_plan IS NULL OR NOT (p_plan = ANY (v_code.applicable_plans)) THEN
    RAISE EXCEPTION 'This promo code does not apply to the selected plan.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.promo_code_redemptions WHERE promo_code_id = v_code.id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'This shop has already used this promo code.';
  END IF;
  SELECT count(*) INTO v_used FROM public.promo_code_redemptions WHERE promo_code_id = v_code.id;
  IF v_used >= v_code.max_redemptions THEN RAISE EXCEPTION 'This promo code has reached its usage limit.'; END IF;
  RETURN v_code;
END;
$$;

-- Lets the owner see the discount before transferring. Does not reserve the code.
CREATE FUNCTION public.preview_promo_code(p_code text, p_shop_id uuid, p_plan text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_code public.promo_codes%ROWTYPE;
BEGIN
  v_code := public.promo_code_checkout_check(p_code, p_shop_id, CASE WHEN p_plan = 'pro' THEN 'plus' ELSE p_plan END, false);
  RETURN jsonb_build_object('code', v_code.code, 'discount_percent', v_code.discount_percent,
    'valid_until', v_code.valid_until);
END;
$$;

CREATE FUNCTION public.submit_payment_request_with_promo(
  p_shop_id uuid,
  p_period_id text,
  p_payer_name text,
  p_transfer_reference text,
  p_transferred_on date,
  p_expected_amount numeric,
  p_expected_currency text,
  p_expected_months integer,
  p_requested_slug text,
  p_customer_note text,
  p_plan_slug text,
  p_promo_code text,
  p_expected_discounted_amount numeric
)
RETURNS public.billing_payment_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_plan text := CASE WHEN coalesce(p_plan_slug, 'plus') = 'pro' THEN 'plus' ELSE coalesce(p_plan_slug, 'plus') END;
  v_code public.promo_codes%ROWTYPE;
  v_request public.billing_payment_requests%ROWTYPE;
  v_amount numeric;
BEGIN
  -- Locks the code row so concurrent checkouts cannot exceed the usage limit.
  v_code := public.promo_code_checkout_check(p_promo_code, p_shop_id, v_plan, true);
  -- The standard checks (ownership, price, bank details, pending request) still apply.
  v_request := public.submit_payment_request(
    p_shop_id => p_shop_id, p_period_id => p_period_id, p_payer_name => p_payer_name,
    p_transfer_reference => p_transfer_reference, p_transferred_on => p_transferred_on,
    p_expected_amount => p_expected_amount, p_expected_currency => p_expected_currency,
    p_expected_months => p_expected_months, p_requested_slug => p_requested_slug,
    p_customer_note => p_customer_note, p_plan_slug => p_plan_slug);
  v_amount := round(v_request.amount * (100 - v_code.discount_percent) / 100, 2);
  IF p_expected_discounted_amount IS NULL OR abs(p_expected_discounted_amount - v_amount) >= 0.01 THEN
    RAISE EXCEPTION 'The promo discount changed. Go back and review the amount before making a transfer.';
  END IF;
  UPDATE public.billing_payment_requests
    SET original_amount = amount, amount = v_amount,
        promo_code = v_code.code, promo_discount_percent = v_code.discount_percent
    WHERE id = v_request.id RETURNING * INTO v_request;
  INSERT INTO public.promo_code_redemptions (promo_code_id, shop_id, user_id, plan, discount_percent, payment_request_id)
    VALUES (v_code.id, p_shop_id, auth.uid(), v_plan, v_code.discount_percent, v_request.id);
  RETURN v_request;
END;
$$;

-- A rejected payment does not use up the code.
CREATE FUNCTION public.release_promo_on_payment_rejection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM public.promo_code_redemptions WHERE payment_request_id = NEW.id;
  RETURN NULL;
END;
$$;
CREATE TRIGGER release_promo_on_payment_rejection
  AFTER UPDATE OF status ON public.billing_payment_requests
  FOR EACH ROW WHEN (NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected')
  EXECUTE FUNCTION public.release_promo_on_payment_rejection();

-- Usage now shows whether each shop's payment is pending or approved.
CREATE OR REPLACE FUNCTION public.admin_list_promo_code_usage(p_promo_code_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.promo_codes WHERE id = p_promo_code_id) THEN
    RAISE EXCEPTION 'This promo code no longer exists. Refresh the list.';
  END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'redemption_id', r.id, 'shop_id', r.shop_id, 'shop_name', s.name, 'username', s.username,
      'owner_email', p.email, 'plan', r.plan, 'discount_percent', r.discount_percent,
      'redeemed_at', r.redeemed_at, 'subscription_plan', p.subscription_plan,
      'subscription_status', p.subscription_status, 'subscription_expires_at', p.subscription_expires_at,
      'payment_request_id', r.payment_request_id, 'payment_status', b.status,
      'amount', b.amount, 'original_amount', b.original_amount, 'currency', b.currency
    ) ORDER BY r.redeemed_at DESC, r.id DESC)
    FROM public.promo_code_redemptions r
    JOIN public.shops s ON s.id = r.shop_id
    LEFT JOIN public.profiles p ON p.id = r.user_id
    LEFT JOIN public.billing_payment_requests b ON b.id = r.payment_request_id
    WHERE r.promo_code_id = p_promo_code_id
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.promo_code_checkout_check(text, uuid, text, boolean),
  public.preview_promo_code(text, uuid, text),
  public.submit_payment_request_with_promo(uuid, text, text, text, date, numeric, text, integer, text, text, text, text, numeric),
  public.release_promo_on_payment_rejection() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.preview_promo_code(text, uuid, text),
  public.submit_payment_request_with_promo(uuid, text, text, text, date, numeric, text, integer, text, text, text, text, numeric)
  TO authenticated;

COMMIT;
