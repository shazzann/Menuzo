-- When a paid plan expires, or an admin suspends or revokes it, the shop only drops to
-- Free plan item and category limits (shop_has_paid_access / shop_effective_plan, unchanged).
-- Every other feature of the plan keeps working: the custom menu URL still resolves and
-- premium themes can still be applied. Features follow the plan the owner bought
-- (plan_has_feature on subscription_plan), not whether it is currently active.
BEGIN;

CREATE OR REPLACE FUNCTION public.resolve_menu_shop(p_slug text) RETURNS SETOF public.shops
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
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
        AND public.plan_has_feature(p.subscription_plan, 'custom_url');
    RETURN;
  END IF;

  RETURN QUERY SELECT s.* FROM public.shops s
    WHERE nullif(btrim(s.username), '') IS NULL AND s.is_open = true
      AND lower(s.name) = replace(v_slug, '-', ' ')
    ORDER BY s.created_at, s.id LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_pro_shop_themes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_paid boolean;
BEGIN
  IF coalesce(auth.role(), '') <> 'authenticated' OR NEW.theme IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
    AND upper(coalesce(NEW.theme->>'primary', '')) = upper(coalesce(OLD.theme->>'primary', ''))
    AND upper(coalesce(NEW.theme->>'secondary', '')) = upper(coalesce(OLD.theme->>'secondary', ''))
    AND upper(coalesce(NEW.theme->>'accent', '')) = upper(coalesce(OLD.theme->>'accent', '')) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.shop_themes t
    WHERE t.is_premium
      AND upper(t.primary_color) = upper(NEW.theme->>'primary')
      AND upper(t.secondary_color) = upper(NEW.theme->>'secondary')
      AND upper(t.accent_color) = upper(NEW.theme->>'accent')
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM auth.uid() AND public.is_company_billing_admin() THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(public.plan_has_feature(p.subscription_plan, 'custom_themes'), false)
    INTO v_paid
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF NOT coalesce(v_paid, false) THEN
    RAISE EXCEPTION 'This is a premium theme. Upgrade to a plan with custom themes to apply it.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
