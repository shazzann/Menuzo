-- Promo codes: company admins create percentage discounts for paid plans; shop owners
-- redeem them. Only company admins (public.admins via is_company_billing_admin()) can
-- create, read, change or delete codes. Owners never read the codes table directly:
-- they redeem through redeem_promo_code(), which checks every rule under a row lock.
BEGIN;

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_percent numeric(5,2) NOT NULL,
  applicable_plans text[] NOT NULL,
  max_redemptions integer NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_code_format CHECK (code ~ '^[A-Z0-9_-]{3,32}$'),
  CONSTRAINT promo_codes_code_key UNIQUE (code),
  CONSTRAINT promo_codes_description_length CHECK (char_length(description) <= 500),
  CONSTRAINT promo_codes_discount_range CHECK (discount_percent > 0 AND discount_percent <= 100),
  CONSTRAINT promo_codes_plans_valid CHECK (
    cardinality(applicable_plans) > 0 AND applicable_plans <@ ARRAY['plus','pro','enterprise']::text[]),
  CONSTRAINT promo_codes_max_redemptions_positive CHECK (max_redemptions > 0),
  CONSTRAINT promo_codes_validity_order CHECK (valid_until > valid_from)
);

-- One redemption per shop per code. A redemption keeps the discount it was granted,
-- so later edits to the code never change what a shop already received.
CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- RESTRICT: a code that shops are using cannot be deleted; deactivate it instead.
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE RESTRICT,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('plus','pro','enterprise')),
  discount_percent numeric(5,2) NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_code_redemptions_once_per_shop UNIQUE (promo_code_id, shop_id)
);
CREATE INDEX promo_code_redemptions_shop ON public.promo_code_redemptions (shop_id);
CREATE INDEX promo_codes_created_at ON public.promo_codes (created_at DESC, id DESC);

-- Normalises the code, records the creating admin, and keeps authorship immutable.
CREATE FUNCTION public.promo_codes_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_used integer;
BEGIN
  NEW.code := upper(btrim(NEW.code));
  NEW.description := btrim(coalesce(NEW.description, ''));
  NEW.applicable_plans := ARRAY(SELECT DISTINCT p FROM unnest(NEW.applicable_plans) AS p ORDER BY p);
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
CREATE TRIGGER promo_codes_before_write BEFORE INSERT OR UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.promo_codes_before_write();

-- Admin changes to codes go to the same audit stream as other billing admin actions.
CREATE FUNCTION public.promo_codes_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_row public.promo_codes%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  v_row := CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  INSERT INTO public.billing_admin_events (actor_id, action, details)
    VALUES (auth.uid(), 'promo_code_' || lower(TG_OP), jsonb_build_object(
      'promo_code_id', v_row.id, 'code', v_row.code, 'discount_percent', v_row.discount_percent,
      'applicable_plans', v_row.applicable_plans, 'max_redemptions', v_row.max_redemptions,
      'valid_from', v_row.valid_from, 'valid_until', v_row.valid_until, 'is_active', v_row.is_active));
  RETURN NULL;
END;
$$;
CREATE TRIGGER promo_codes_audit AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.promo_codes_audit();

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promo_codes, public.promo_code_redemptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT SELECT ON public.promo_code_redemptions TO authenticated;
GRANT ALL ON public.promo_codes, public.promo_code_redemptions TO service_role;

CREATE POLICY promo_codes_admin_read ON public.promo_codes
  FOR SELECT TO authenticated USING ((SELECT public.is_company_billing_admin()));
CREATE POLICY promo_codes_admin_insert ON public.promo_codes
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_company_billing_admin()));
CREATE POLICY promo_codes_admin_update ON public.promo_codes
  FOR UPDATE TO authenticated USING ((SELECT public.is_company_billing_admin()))
  WITH CHECK ((SELECT public.is_company_billing_admin()));
CREATE POLICY promo_codes_admin_delete ON public.promo_codes
  FOR DELETE TO authenticated USING ((SELECT public.is_company_billing_admin()));

-- Redemptions are written only by redeem_promo_code(); admins see all, owners their own.
CREATE POLICY promo_redemptions_admin_read ON public.promo_code_redemptions
  FOR SELECT TO authenticated USING ((SELECT public.is_company_billing_admin()));
CREATE POLICY promo_redemptions_owner_read ON public.promo_code_redemptions
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- Codes with usage counts, newest first.
CREATE FUNCTION public.admin_list_promo_codes()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(to_jsonb(c) || jsonb_build_object('redemption_count', coalesce(r.n, 0))
      ORDER BY c.created_at DESC, c.id DESC)
    FROM public.promo_codes c
    LEFT JOIN (SELECT promo_code_id, count(*) AS n FROM public.promo_code_redemptions GROUP BY promo_code_id) r
      ON r.promo_code_id = c.id
  ), '[]'::jsonb);
END;
$$;

-- Shops that redeemed a code, with each owner's current subscription.
CREATE FUNCTION public.admin_list_promo_code_usage(p_promo_code_id uuid)
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
      'subscription_status', p.subscription_status, 'subscription_expires_at', p.subscription_expires_at
    ) ORDER BY r.redeemed_at DESC, r.id DESC)
    FROM public.promo_code_redemptions r
    JOIN public.shops s ON s.id = r.shop_id
    LEFT JOIN public.profiles p ON p.id = r.user_id
    WHERE r.promo_code_id = p_promo_code_id
  ), '[]'::jsonb);
END;
$$;

-- Shop owners redeem a code for one of their shops and a paid plan. The code row is
-- locked so concurrent redemptions cannot exceed max_redemptions.
CREATE FUNCTION public.redeem_promo_code(p_code text, p_shop_id uuid, p_plan text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_code public.promo_codes%ROWTYPE; v_used integer; v_row public.promo_code_redemptions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to use a promo code.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You can only use promo codes for your own shop.' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_code FROM public.promo_codes WHERE code = upper(btrim(coalesce(p_code, ''))) FOR UPDATE;
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
  INSERT INTO public.promo_code_redemptions (promo_code_id, shop_id, user_id, plan, discount_percent)
    VALUES (v_code.id, p_shop_id, auth.uid(), p_plan, v_code.discount_percent) RETURNING * INTO v_row;
  RETURN jsonb_build_object('redemption_id', v_row.id, 'code', v_code.code, 'plan', v_row.plan,
    'discount_percent', v_row.discount_percent, 'redeemed_at', v_row.redeemed_at);
END;
$$;

REVOKE ALL ON FUNCTION public.promo_codes_before_write(), public.promo_codes_audit(),
  public.admin_list_promo_codes(), public.admin_list_promo_code_usage(uuid),
  public.redeem_promo_code(text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_promo_codes(), public.admin_list_promo_code_usage(uuid),
  public.redeem_promo_code(text, uuid, text) TO authenticated;

COMMIT;
