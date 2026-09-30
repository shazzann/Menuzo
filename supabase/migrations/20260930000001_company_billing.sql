BEGIN;

CREATE OR REPLACE FUNCTION public.is_reserved_menu_slug(p_slug text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public, pg_temp AS $$
  SELECT lower(p_slug) = ANY (ARRAY[
    'admin', 'admin-login', 'admin-portal', 'api', 'assets', 'brand-book',
    'company-admin', 'dashboard', 'contact', 'demo', 'digital-menu', 'login',
    'onboarding', 'privacy', 'qr-menu', 'restaurant-menu', 'signup', 'subscription', 'terms', 'www'
  ]::text[]);
$$;

-- Existing production installations already have this admin registry.
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'superadmin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.is_company_billing_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a JOIN auth.users u ON u.id = auth.uid()
    WHERE a.is_active = true AND (a.id = u.id OR
      (u.email_confirmed_at IS NOT NULL AND lower(a.email) = lower(u.email)))
  );
$$;
REVOKE ALL ON FUNCTION public.is_company_billing_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_company_billing_admin() TO authenticated;

ALTER TABLE public.billing_payment_requests ADD COLUMN reviewed_by uuid;
ALTER TABLE public.billing_payment_requests ADD COLUMN activated_until timestamptz;
-- A transfer cannot buy multiple renewals for the same owner.
CREATE UNIQUE INDEX billing_unique_approved_transfer
  ON public.billing_payment_requests (user_id, lower(btrim(transfer_reference)))
  WHERE status = 'approved';

CREATE TABLE public.billing_admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.billing_payment_requests(id) ON DELETE SET NULL,
  action text NOT NULL,
  reason text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_admin_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.billing_admin_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.billing_admin_events TO authenticated;
GRANT ALL ON public.billing_admin_events TO service_role;
CREATE POLICY billing_admin_event_read ON public.billing_admin_events
  FOR SELECT TO authenticated USING ((SELECT public.is_company_billing_admin()));

CREATE FUNCTION public.admin_list_billing_requests(
  p_status text DEFAULT 'pending', p_query text DEFAULT '', p_offset integer DEFAULT 0
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('all', 'pending', 'approved', 'rejected') THEN RAISE EXCEPTION 'Invalid payment status.'; END IF;
  WITH matching AS (
    SELECT r.*, s.name AS shop_name, s.username, p.email AS owner_email
    FROM public.billing_payment_requests r JOIN public.shops s ON s.id = r.shop_id
    JOIN public.profiles p ON p.id = r.user_id
    WHERE (p_status = 'all' OR r.status = p_status)
      AND (coalesce(p_query, '') = '' OR concat_ws(' ',s.name,p.email,r.transfer_reference,r.id::text) ILIKE '%' || left(p_query,120) || '%')
  ), page AS (SELECT * FROM matching ORDER BY created_at DESC, id LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
  SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'::jsonb),
    'total',(SELECT count(*) FROM matching)) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE FUNCTION public.admin_list_shop_subscriptions(p_query text DEFAULT '', p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  WITH matching AS (
    SELECT s.id AS shop_id,s.name AS shop_name,s.username,s.user_id,p.email AS owner_email,
      p.subscription_plan,p.subscription_status,p.subscription_expires_at,c.slug,
      coalesce(p.subscription_plan IN ('pro','enterprise') AND p.subscription_status = 'active' AND p.subscription_expires_at > now(),false) AS pro_active
    FROM public.shops s JOIN public.profiles p ON p.id = s.user_id
    LEFT JOIN public.shop_custom_urls c ON c.shop_id = s.id
    WHERE coalesce(p_query,'') = '' OR concat_ws(' ',s.name,p.email,c.slug) ILIKE '%' || left(p_query,120) || '%'
  ), page AS (SELECT * FROM matching ORDER BY shop_name,shop_id LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
  SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'::jsonb),
    'total',(SELECT count(*) FROM matching)) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE FUNCTION public.admin_review_billing_payment(
  p_request_id uuid, p_decision text, p_reason text DEFAULT NULL,
  p_custom_slug text DEFAULT NULL, p_receipt_verified boolean DEFAULT false
)
RETURNS public.billing_payment_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_request public.billing_payment_requests%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_until timestamptz;
  v_slug text := nullif(lower(btrim(p_custom_slug)), '');
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Choose approve or reject.'; END IF;
  SELECT * INTO v_request FROM public.billing_payment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment request no longer exists.'; END IF;
  IF v_request.status <> 'pending' THEN RAISE EXCEPTION 'This request has already been reviewed. Refresh the list.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = v_request.shop_id AND user_id = v_request.user_id FOR SHARE) THEN
    RAISE EXCEPTION 'Shop ownership changed. Do not approve this request.';
  END IF;
  IF p_decision = 'rejected' THEN
    IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a rejection reason (3-1000 characters).'; END IF;
  ELSE
    IF p_receipt_verified IS DISTINCT FROM true THEN RAISE EXCEPTION 'Confirm the bank transfer and receipt before approval.'; END IF;
    -- Serialize all renewals for the owner, even when they own multiple shops.
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_request.user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Owner profile is missing.'; END IF;
    IF EXISTS (SELECT 1 FROM public.billing_payment_requests WHERE user_id = v_request.user_id
      AND status = 'approved' AND lower(btrim(transfer_reference)) = lower(btrim(v_request.transfer_reference))) THEN
      RAISE EXCEPTION 'This transfer reference has already been approved for this owner.';
    END IF;
    v_until := (CASE WHEN v_profile.subscription_plan IN ('pro','enterprise')
      AND v_profile.subscription_status = 'active' AND v_profile.subscription_expires_at > now()
      THEN v_profile.subscription_expires_at ELSE now() END) + make_interval(months => v_request.months);
    IF v_slug IS NOT NULL THEN
      INSERT INTO public.shop_custom_urls (shop_id,slug) VALUES (v_request.shop_id,v_slug)
        ON CONFLICT (shop_id) DO UPDATE SET slug = excluded.slug;
    END IF;
    UPDATE public.profiles SET subscription_plan = CASE WHEN v_profile.subscription_plan = 'enterprise' THEN 'enterprise' ELSE 'pro' END,
      subscription_status = 'active', subscription_expires_at = v_until WHERE id = v_request.user_id;
  END IF;
  UPDATE public.billing_payment_requests SET status = p_decision, reviewed_at = now(), reviewed_by = auth.uid(),
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN btrim(p_reason) ELSE NULL END,
    activated_until = v_until WHERE id = p_request_id RETURNING * INTO v_request;
  INSERT INTO public.billing_admin_events (actor_id,shop_id,request_id,action,reason,details)
    VALUES (auth.uid(),v_request.shop_id,v_request.id,p_decision,v_request.rejection_reason,
      jsonb_build_object('previous_expiry',v_profile.subscription_expires_at,'activated_until',v_until,
        'months',v_request.months,'amount',v_request.amount,'currency',v_request.currency,'assigned_slug',v_slug));
  RETURN v_request;
END;
$$;

CREATE FUNCTION public.admin_change_subscription_status(p_shop_id uuid,p_status text,p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('active','cancelled') THEN RAISE EXCEPTION 'Invalid subscription status.'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR v_profile.subscription_plan NOT IN ('pro','enterprise') OR v_profile.subscription_plan IS NULL THEN RAISE EXCEPTION 'This owner has no paid subscription.'; END IF;
  IF v_profile.subscription_status = p_status THEN RAISE EXCEPTION 'Subscription already has this status. Refresh the list.'; END IF;
  IF p_status = 'active' AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at <= now()) THEN
    RAISE EXCEPTION 'This subscription has expired. Approve a new payment to renew it.';
  END IF;
  UPDATE public.profiles SET subscription_status = p_status WHERE id = v_owner;
  INSERT INTO public.billing_admin_events (actor_id,shop_id,action,reason,details)
    VALUES (auth.uid(),p_shop_id,'subscription_' || p_status,btrim(p_reason),jsonb_build_object('owner_id',v_owner,'previous_status',v_profile.subscription_status));
END;
$$;

CREATE FUNCTION public.admin_assign_shop_url(p_shop_id uuid,p_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE; v_previous text;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Owner profile is missing.'; END IF;
  SELECT slug INTO v_previous FROM public.shop_custom_urls WHERE shop_id = p_shop_id;
  IF nullif(btrim(p_slug),'') IS NULL THEN
    DELETE FROM public.shop_custom_urls WHERE shop_id = p_shop_id;
  ELSE
    IF NOT coalesce(v_profile.subscription_plan IN ('pro','enterprise') AND v_profile.subscription_status = 'active'
      AND v_profile.subscription_expires_at > now(),false) THEN RAISE EXCEPTION 'An active paid subscription is required to assign a URL.'; END IF;
    INSERT INTO public.shop_custom_urls (shop_id,slug) VALUES (p_shop_id,lower(btrim(p_slug)))
      ON CONFLICT (shop_id) DO UPDATE SET slug = excluded.slug;
  END IF;
  INSERT INTO public.billing_admin_events (actor_id,shop_id,action,details)
    VALUES (auth.uid(),p_shop_id,'custom_url_changed',jsonb_build_object('previous_slug',v_previous,'slug',nullif(lower(btrim(p_slug)),'')));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_billing_requests(text,text,integer),
  public.admin_list_shop_subscriptions(text,integer),
  public.admin_review_billing_payment(uuid,text,text,text,boolean),
  public.admin_change_subscription_status(uuid,text,text),public.admin_assign_shop_url(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_billing_requests(text,text,integer),
  public.admin_list_shop_subscriptions(text,integer),
  public.admin_review_billing_payment(uuid,text,text,text,boolean),
  public.admin_change_subscription_status(uuid,text,text),public.admin_assign_shop_url(uuid,text) TO authenticated;

COMMIT;
