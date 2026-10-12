-- Company admins can end a paid subscription immediately or set its end date.
BEGIN;

-- Ends paid access now. Unlike suspension it cannot be restored: the owner renews
-- with a new payment (approval re-activates from today), or an admin sets a new end date.
CREATE OR REPLACE FUNCTION public.admin_revoke_subscription(p_shop_id uuid, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'Shop no longer exists. Refresh the list.'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR v_profile.subscription_plan IS NULL OR v_profile.subscription_plan NOT IN ('pro','enterprise') THEN
    RAISE EXCEPTION 'This owner has no paid subscription.';
  END IF;
  IF v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at <= now() THEN
    RAISE EXCEPTION 'This subscription has already ended. Refresh the list.';
  END IF;
  UPDATE public.profiles SET subscription_status = 'cancelled', subscription_expires_at = now() WHERE id = v_owner;
  INSERT INTO public.billing_admin_events (actor_id, shop_id, action, reason, details)
    VALUES (auth.uid(), p_shop_id, 'subscription_revoked', btrim(p_reason), jsonb_build_object(
      'owner_id', v_owner, 'previous_status', v_profile.subscription_status, 'previous_expiry', v_profile.subscription_expires_at));
END;
$$;

-- Moves the end date earlier or later. The status (active or suspended) is kept, so a
-- suspended owner stays suspended until restored; a later date re-opens a revoked or
-- expired subscription for restoring.
CREATE OR REPLACE FUNCTION public.admin_set_subscription_expiry(p_shop_id uuid, p_expires_at timestamptz, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  IF p_expires_at IS NULL OR p_expires_at <= now() THEN RAISE EXCEPTION 'Choose an end date in the future. Use Revoke to end access now.'; END IF;
  IF p_expires_at > now() + interval '10 years' THEN RAISE EXCEPTION 'Choose an end date within 10 years.'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'Shop no longer exists. Refresh the list.'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR v_profile.subscription_plan IS NULL OR v_profile.subscription_plan NOT IN ('pro','enterprise') THEN
    RAISE EXCEPTION 'This owner has no paid subscription. Approve a payment to start one.';
  END IF;
  UPDATE public.profiles SET subscription_expires_at = p_expires_at WHERE id = v_owner;
  INSERT INTO public.billing_admin_events (actor_id, shop_id, action, reason, details)
    VALUES (auth.uid(), p_shop_id, 'subscription_expiry_changed', btrim(p_reason), jsonb_build_object(
      'owner_id', v_owner, 'status', v_profile.subscription_status,
      'previous_expiry', v_profile.subscription_expires_at, 'new_expiry', p_expires_at));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_subscription(uuid, text),
  public.admin_set_subscription_expiry(uuid, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_subscription(uuid, text),
  public.admin_set_subscription_expiry(uuid, timestamptz, text) TO authenticated;

COMMIT;
