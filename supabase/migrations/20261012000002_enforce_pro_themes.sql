-- Only shops with an active paid plan (Pro or Enterprise) can apply a Pro theme.
BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_pro_shop_themes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_paid boolean;
BEGIN
  -- Backend jobs and the SQL editor run without a signed-in user.
  IF coalesce(auth.role(), '') <> 'authenticated' OR NEW.theme IS NULL THEN
    RETURN NEW;
  END IF;

  -- Saving other theme settings (QR style, etc.) keeps an already applied theme,
  -- including a Pro theme applied before the plan expired.
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

  -- Company admins may restyle other owners' shops; their own shops follow the plan rules.
  IF NEW.user_id IS DISTINCT FROM auth.uid() AND public.is_company_billing_admin() THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(p.subscription_plan IN ('pro', 'enterprise')
      AND p.subscription_status = 'active'
      AND p.subscription_expires_at > now(), false)
    INTO v_paid
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF NOT coalesce(v_paid, false) THEN
    RAISE EXCEPTION 'This is a Pro theme. Upgrade to Pro to apply it.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_pro_shop_themes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_pro_shop_themes ON public.shops;
CREATE TRIGGER enforce_pro_shop_themes
  BEFORE INSERT OR UPDATE OF theme ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pro_shop_themes();

COMMIT;
