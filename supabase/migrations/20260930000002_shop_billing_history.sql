BEGIN;
CREATE FUNCTION public.admin_get_shop_billing(p_shop_id uuid,p_status text DEFAULT 'all',p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_shop jsonb; v_payments jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('all','pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid payment status.'; END IF;
  SELECT jsonb_build_object('shop_id',s.id,'shop_name',s.name,'username',s.username,'user_id',s.user_id,
    'owner_email',p.email,'subscription_plan',p.subscription_plan,'subscription_status',p.subscription_status,
    'subscription_expires_at',p.subscription_expires_at,'slug',c.slug,
    'pro_active',coalesce(p.subscription_plan IN ('pro','enterprise') AND p.subscription_status='active' AND p.subscription_expires_at>now(),false))
  INTO v_shop FROM public.shops s JOIN public.profiles p ON p.id=s.user_id
    LEFT JOIN public.shop_custom_urls c ON c.shop_id=s.id WHERE s.id=p_shop_id;
  IF v_shop IS NULL THEN RAISE EXCEPTION 'This shop is no longer available.'; END IF;
  WITH matching AS (
    SELECT r.*,s.name AS shop_name,s.username,p.email AS owner_email
    FROM public.billing_payment_requests r JOIN public.shops s ON s.id=r.shop_id
    JOIN public.profiles p ON p.id=r.user_id
    WHERE r.shop_id=p_shop_id AND (p_status='all' OR r.status=p_status)
  ), page AS (
    SELECT * FROM matching ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0)
  )
  SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC,page.id DESC) FROM page),'[]'::jsonb),
    'total',(SELECT count(*) FROM matching)) INTO v_payments;
  RETURN jsonb_build_object('shop',v_shop,'payments',v_payments);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_shop_billing(uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_shop_billing(uuid,text,integer) TO authenticated;
CREATE INDEX billing_requests_shop_history ON public.billing_payment_requests (shop_id,created_at DESC,id DESC);
COMMIT;
