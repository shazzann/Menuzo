-- Menuzo has three plans: Free, Plus and Enterprise. "pro" is the legacy name of Plus
-- (paid approvals still store subscription_plan = 'pro'), so promo codes treat it as Plus:
-- codes target only plus/enterprise, and a 'pro' subscriber redeems Plus codes.
BEGIN;

-- Accept 'pro' from older clients and store it as 'plus'.
CREATE OR REPLACE FUNCTION public.promo_codes_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_used integer;
BEGIN
  NEW.code := upper(btrim(NEW.code));
  NEW.description := btrim(coalesce(NEW.description, ''));
  NEW.applicable_plans := ARRAY(
    SELECT DISTINCT CASE WHEN p = 'pro' THEN 'plus' ELSE p END
    FROM unnest(NEW.applicable_plans) AS p ORDER BY 1);
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    NEW.created_by_email := (SELECT email FROM auth.users WHERE id = auth.uid());
    NEW.created_at := now();
  ELSE
    NEW.id := OLD.id;
    NEW.created_by := OLD.created_by;
    NEW.created_by_email := OLD.created_by_email;
    NEW.created_at := OLD.created_at;
    SELECT count(*) INTO v_used FROM public.promo_code_redemptions WHERE promo_code_id = OLD.id;
    IF NEW.max_redemptions < v_used THEN
      RAISE EXCEPTION 'This code is already used by % shops. Set the limit to at least %.', v_used, v_used;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

ALTER TABLE public.promo_codes DROP CONSTRAINT promo_codes_plans_valid;
UPDATE public.promo_codes SET applicable_plans = applicable_plans WHERE 'pro' = ANY (applicable_plans);
ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_plans_valid CHECK (
  cardinality(applicable_plans) > 0 AND applicable_plans <@ ARRAY['plus','enterprise']::text[]);

ALTER TABLE public.promo_code_redemptions DROP CONSTRAINT promo_code_redemptions_plan_check;
UPDATE public.promo_code_redemptions SET plan = 'plus' WHERE plan = 'pro';
ALTER TABLE public.promo_code_redemptions ADD CONSTRAINT promo_code_redemptions_plan_check
  CHECK (plan IN ('plus','enterprise'));

CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code text, p_shop_id uuid, p_plan text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_code public.promo_codes%ROWTYPE; v_used integer; v_row public.promo_code_redemptions%ROWTYPE;
  v_plan text := CASE WHEN p_plan = 'pro' THEN 'plus' ELSE p_plan END;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to use a promo code.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You can only use promo codes for your own shop.' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_code FROM public.promo_codes WHERE code = upper(btrim(coalesce(p_code, ''))) FOR UPDATE;
  IF NOT FOUND OR NOT v_code.is_active THEN RAISE EXCEPTION 'This promo code is not valid.'; END IF;
  IF now() < v_code.valid_from THEN RAISE EXCEPTION 'This promo code is not active yet.'; END IF;
  IF now() > v_code.valid_until THEN RAISE EXCEPTION 'This promo code has expired.'; END IF;
  IF v_plan IS NULL OR NOT (v_plan = ANY (v_code.applicable_plans)) THEN
    RAISE EXCEPTION 'This promo code does not apply to the selected plan.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.promo_code_redemptions WHERE promo_code_id = v_code.id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'This shop has already used this promo code.';
  END IF;
  SELECT count(*) INTO v_used FROM public.promo_code_redemptions WHERE promo_code_id = v_code.id;
  IF v_used >= v_code.max_redemptions THEN RAISE EXCEPTION 'This promo code has reached its usage limit.'; END IF;
  INSERT INTO public.promo_code_redemptions (promo_code_id, shop_id, user_id, plan, discount_percent)
    VALUES (v_code.id, p_shop_id, auth.uid(), v_plan, v_code.discount_percent) RETURNING * INTO v_row;
  RETURN jsonb_build_object('redemption_id', v_row.id, 'code', v_code.code, 'plan', v_row.plan,
    'discount_percent', v_row.discount_percent, 'redeemed_at', v_row.redeemed_at);
END;
$$;

COMMIT;
