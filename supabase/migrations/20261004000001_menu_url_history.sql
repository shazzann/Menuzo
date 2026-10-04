BEGIN;

-- Keep every published URL bound to its shop, even after a rename/removal.
CREATE TABLE public.shop_url_history (
  slug text PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shop_url_history_shop_id ON public.shop_url_history(shop_id);
ALTER TABLE public.shop_url_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_url_history FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.shop_url_history TO service_role;

INSERT INTO public.shop_url_history(slug,shop_id)
  SELECT lower(username),id FROM public.shops WHERE nullif(btrim(username),'') IS NOT NULL;
INSERT INTO public.shop_url_history(slug,shop_id)
  SELECT slug,shop_id FROM public.shop_custom_urls;
-- Recover previously assigned aliases from trusted admin events, where available.
-- A URL currently assigned to a different shop must never be taken away.
INSERT INTO public.shop_url_history(slug,shop_id)
  SELECT DISTINCT ON (candidate.slug) candidate.slug,e.shop_id
  FROM public.billing_admin_events e JOIN public.shops s ON s.id=e.shop_id
  CROSS JOIN LATERAL (VALUES (e.details->>'previous_slug'),(e.details->>'assigned_slug'),
    (CASE WHEN e.action='custom_url_changed' THEN e.details->>'slug' END)) candidate(slug)
  WHERE candidate.slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND NOT public.is_reserved_menu_slug(candidate.slug)
  ORDER BY candidate.slug,e.created_at,e.id
  ON CONFLICT (slug) DO NOTHING;

CREATE FUNCTION public.remember_shop_menu_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_slug text; v_shop_id uuid;
BEGIN
  IF TG_TABLE_NAME='shops' THEN v_slug:=lower(NEW.username); v_shop_id:=NEW.id;
  ELSE v_slug:=NEW.slug; v_shop_id:=NEW.shop_id; END IF;
  IF nullif(btrim(v_slug),'') IS NOT NULL THEN
    INSERT INTO public.shop_url_history(slug,shop_id) VALUES(v_slug,v_shop_id) ON CONFLICT(slug) DO NOTHING;
    IF EXISTS(SELECT 1 FROM public.shop_url_history WHERE slug=v_slug AND shop_id<>v_shop_id) THEN
      RAISE EXCEPTION 'This menu URL belongs to another shop.' USING ERRCODE='23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.remember_shop_menu_slug() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER remember_shop_username AFTER INSERT OR UPDATE OF username ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.remember_shop_menu_slug();
CREATE TRIGGER remember_shop_custom_url AFTER INSERT OR UPDATE OF slug ON public.shop_custom_urls
  FOR EACH ROW EXECUTE FUNCTION public.remember_shop_menu_slug();

CREATE OR REPLACE FUNCTION public.validate_custom_shop_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug<>lower(btrim(NEW.slug))
    OR char_length(NEW.slug) NOT BETWEEN 3 AND 50 OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR public.is_reserved_menu_slug(NEW.slug) THEN
    RAISE EXCEPTION 'Choose a valid custom URL using 3-50 lowercase letters, numbers, or single hyphens.';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('menuzo-shop-slug'),hashtext(NEW.slug));
  IF EXISTS(SELECT 1 FROM public.shops WHERE lower(username)=NEW.slug)
    OR EXISTS(SELECT 1 FROM public.shop_url_history WHERE slug=NEW.slug AND shop_id<>NEW.shop_id) THEN
    RAISE EXCEPTION 'This menu URL is already in use.' USING ERRCODE='23505';
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.protect_shop_slug_namespace()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_slug text:=lower(NEW.username);
BEGIN
  IF NEW.username IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='UPDATE' AND NEW.username IS NOT DISTINCT FROM OLD.username THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('menuzo-shop-slug'),hashtext(v_slug));
  IF public.is_reserved_menu_slug(v_slug)
    OR EXISTS(SELECT 1 FROM public.shop_custom_urls WHERE slug=v_slug)
    OR EXISTS(SELECT 1 FROM public.shops WHERE lower(username)=v_slug AND id<>NEW.id)
    OR EXISTS(SELECT 1 FROM public.shop_url_history WHERE slug=v_slug AND shop_id<>NEW.id) THEN
    RAISE EXCEPTION 'This menu URL is already in use or reserved.' USING ERRCODE='23505';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_payment_request(
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
       OR EXISTS (SELECT 1 FROM public.shop_custom_urls c WHERE c.slug = v_slug AND c.shop_id <> p_shop_id)
       OR EXISTS (SELECT 1 FROM public.shop_url_history h WHERE h.slug = v_slug AND h.shop_id <> p_shop_id) THEN
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

-- Old links always resolve the same open shop. A purchased custom URL stays
-- preferred after Pro expires; subscription expiry never breaks printed QR codes.
CREATE OR REPLACE FUNCTION public.resolve_menu_shop(p_slug text)
RETURNS SETOF public.shops
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_slug text:=lower(btrim(p_slug)); v_shop_id uuid;
BEGIN
  IF v_slug IS NULL OR v_slug='' OR char_length(v_slug)>100 OR public.is_reserved_menu_slug(v_slug) THEN RETURN; END IF;
  SELECT h.shop_id INTO v_shop_id FROM public.shop_url_history h WHERE h.slug=v_slug;
  IF FOUND THEN
    RETURN QUERY SELECT s.* FROM public.shops s WHERE s.id=v_shop_id AND s.is_open=true;
    RETURN;
  END IF;
  RETURN QUERY SELECT s.* FROM public.shops s
    WHERE nullif(btrim(s.username),'') IS NULL AND s.is_open=true AND lower(s.name)=replace(v_slug,'-',' ')
    ORDER BY s.created_at,s.id LIMIT 1;
END;
$$;

CREATE FUNCTION public.get_shop_menu_url(p_shop_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT jsonb_build_object('menu_slug',coalesce(c.slug,s.username))
  FROM public.shops s
  LEFT JOIN public.shop_custom_urls c ON c.shop_id=s.id
  WHERE s.id=p_shop_id AND (s.is_open=true OR s.user_id=auth.uid() OR public.is_company_billing_admin());
$$;
CREATE FUNCTION public.resolve_menu_shop_url(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT to_jsonb(s) || public.get_shop_menu_url(s.id) FROM public.resolve_menu_shop(p_slug) s LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_shop_menu_url(uuid),public.resolve_menu_shop_url(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_menu_url(uuid),public.resolve_menu_shop_url(text) TO anon,authenticated,service_role;

COMMIT;
