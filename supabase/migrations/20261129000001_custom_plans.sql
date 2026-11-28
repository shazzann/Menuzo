BEGIN;

-- Fully custom subscription plans.
--
-- subscription_plans becomes the single description of every plan: its customer-facing
-- copy, its item and category limits, and which features it unlocks. Prices stay in
-- plan_prices. Free is the baseline plan; every other plan is paid. The database's
-- access checks now ask the plan row instead of comparing plan names, which also fixes
-- shops approved on 'plus' being treated as Free by shop_has_paid_access.
--
-- Function bodies marked "from production" were copied from the live schema
-- (supabase/production/schema.sql, 2026-11-28); only their plan checks changed.

-- Production already has this table; local databases get the same shape.
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  monthly_price integer DEFAULT 0 NOT NULL,
  annual_price integer DEFAULT 0 NOT NULL,
  max_items integer DEFAULT 10 NOT NULL,
  max_categories integer DEFAULT 2 NOT NULL,
  features jsonb DEFAULT '{}'::jsonb NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- is_public starts false so any unexpected existing row stays off the pricing pages.
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS highlights text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS has_custom_themes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_qr_branding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_custom_url boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_advanced_analytics boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_priority_support boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_advanced_customization boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_all_features boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.subscription_plans ALTER COLUMN is_public SET DEFAULT true;

-- New and edited rows must be well formed; legacy rows are left as they are.
ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_slug_format
    CHECK (char_length(slug) BETWEEN 2 AND 32 AND slug ~ '^[a-z][a-z0-9]*(-[a-z0-9]+)*$') NOT VALID,
  ADD CONSTRAINT subscription_plans_limits_positive
    CHECK (max_items BETWEEN 1 AND 100000 AND max_categories BETWEEN 1 AND 1000) NOT VALID,
  ADD CONSTRAINT subscription_plans_copy_length
    CHECK (char_length(name) BETWEEN 1 AND 60 AND char_length(description) <= 500
      AND cardinality(highlights) <= 30 AND cardinality(excluded) <= 30
      AND (badge IS NULL OR char_length(badge) <= 30)) NOT VALID;

-- The three existing plans, with today's limits, features and copy.
INSERT INTO public.subscription_plans (
  slug, name, description, highlights, excluded, badge, is_popular, is_public, is_active, sort_order,
  max_items, max_categories, has_custom_themes, has_qr_branding, has_custom_url, has_advanced_analytics,
  has_priority_support, has_advanced_customization, has_all_features
) VALUES
  ('free', 'Free', 'For small restaurants and cafés getting started with digital menus.',
   ARRAY['10 Food Items', '2 Categories', 'Digital Menu', 'QR Code Generation', 'Limited Themes (3–5 preset themes)',
         'Basic QR Branding', 'Restaurant Profile', 'Shareable Menu Link', 'Standard Support'],
   ARRAY['Custom Themes', 'QR Branding', 'Custom Menu URL', 'Analytics Dashboard', 'Advanced Customization', 'Priority Support'],
   NULL, false, true, true, 0, 10, 2, false, false, false, false, false, false, false),
  ('plus', 'Plus', 'Everything you need to run a professional digital menu with custom themes, QR branding, analytics, and higher limits.',
   ARRAY['100 Food Items', '20 Categories', 'Digital Menu & QR Code', 'Custom Themes', 'QR Branding', 'Custom Menu URL',
         'Analytics Dashboard', 'Restaurant Profile', 'Shareable Menu Link'],
   ARRAY['Advanced Customization', 'Priority Support', 'All Enterprise Features'],
   'Popular', true, true, true, 10, 100, 20, true, true, true, true, false, false, false),
  ('enterprise', 'Enterprise', 'For established restaurants and growing businesses wanting full feature access, advanced customization, and priority support.',
   ARRAY['500 Food Items', '50 Categories', 'All Plus Features', 'Digital Menu & QR Code', 'Custom Themes & QR Branding',
         'Custom Menu URL', 'Advanced Analytics', 'Advanced Customization', 'Priority Support', 'All Available Menuzo Features'],
   ARRAY[]::text[],
   'Advanced', false, true, true, 20, 500, 50, true, true, true, true, true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, highlights = EXCLUDED.highlights,
  excluded = EXCLUDED.excluded, badge = EXCLUDED.badge, is_popular = EXCLUDED.is_popular,
  is_public = EXCLUDED.is_public, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order,
  max_items = EXCLUDED.max_items, max_categories = EXCLUDED.max_categories,
  has_custom_themes = EXCLUDED.has_custom_themes, has_qr_branding = EXCLUDED.has_qr_branding,
  has_custom_url = EXCLUDED.has_custom_url, has_advanced_analytics = EXCLUDED.has_advanced_analytics,
  has_priority_support = EXCLUDED.has_priority_support,
  has_advanced_customization = EXCLUDED.has_advanced_customization,
  has_all_features = EXCLUDED.has_all_features, updated_at = now();

-- 'pro' is the old name for Plus; shops on it are treated as Plus everywhere.
UPDATE public.subscription_plans SET is_active = false, is_public = false WHERE slug = 'pro';

-- Keep the legacy whole-number price columns in step with plan_prices.
UPDATE public.subscription_plans sp SET
  monthly_price = coalesce((SELECT round(pp.amount)::integer FROM public.plan_prices pp WHERE pp.plan_slug = sp.slug AND pp.period_id = 'monthly'), 0),
  annual_price = coalesce((SELECT round(pp.amount)::integer FROM public.plan_prices pp WHERE pp.plan_slug = sp.slug AND pp.period_id = 'yearly'), 0)
WHERE sp.slug IN ('free', 'plus', 'enterprise');

-- Plan data is public (pricing pages), and shops on a retired plan still need to read it.
DROP POLICY IF EXISTS "Anyone can read active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can read subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can read subscription plans"
  ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON TABLE public.subscription_plans FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;

-- Prices may now exist for any plan, not just Plus and Enterprise.
ALTER TABLE public.plan_prices DROP CONSTRAINT IF EXISTS plan_prices_plan_slug_check;
ALTER TABLE public.plan_prices
  ADD CONSTRAINT plan_prices_plan_slug_fkey FOREIGN KEY (plan_slug)
    REFERENCES public.subscription_plans(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  ADD CONSTRAINT plan_prices_not_free CHECK (plan_slug <> 'free');

-- Plan helpers. A plan stays paid (and keeps its features) after it is retired, so
-- shops already on it keep what they paid for; retiring only stops new purchases.
CREATE OR REPLACE FUNCTION public.normalize_plan_slug(p_slug text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public, pg_temp AS $$
  SELECT CASE WHEN p_slug IS NULL OR btrim(p_slug) = '' THEN 'free'
              WHEN lower(btrim(p_slug)) = 'pro' THEN 'plus'
              ELSE lower(btrim(p_slug)) END;
$$;

CREATE OR REPLACE FUNCTION public.is_paid_plan(p_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT public.normalize_plan_slug(p_slug) <> 'free'
     AND EXISTS (SELECT 1 FROM public.subscription_plans WHERE slug = public.normalize_plan_slug(p_slug));
$$;

CREATE OR REPLACE FUNCTION public.plan_has_feature(p_slug text, p_feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT coalesce((
    SELECT CASE p_feature
      WHEN 'custom_themes' THEN sp.has_custom_themes
      WHEN 'qr_branding' THEN sp.has_qr_branding
      WHEN 'custom_url' THEN sp.has_custom_url
      WHEN 'advanced_analytics' THEN sp.has_advanced_analytics
      WHEN 'priority_support' THEN sp.has_priority_support
      WHEN 'advanced_customization' THEN sp.has_advanced_customization
      WHEN 'all_features' THEN sp.has_all_features
      ELSE false END
    FROM public.subscription_plans sp WHERE sp.slug = public.normalize_plan_slug(p_slug)), false);
$$;

-- The plan whose limits apply to a shop right now: its paid plan while active, else Free.
CREATE OR REPLACE FUNCTION public.shop_effective_plan(p_shop_id uuid)
RETURNS public.subscription_plans LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_slug text;
  v_plan public.subscription_plans%ROWTYPE;
BEGIN
  SELECT CASE WHEN public.is_paid_plan(p.subscription_plan) AND p.subscription_status = 'active'
                   AND p.subscription_expires_at > now()
              THEN public.normalize_plan_slug(p.subscription_plan) ELSE 'free' END
    INTO v_slug
  FROM public.shops s JOIN public.profiles p ON p.id = s.user_id
  WHERE s.id = p_shop_id;
  SELECT * INTO v_plan FROM public.subscription_plans WHERE slug = coalesce(v_slug, 'free');
  IF NOT FOUND THEN
    SELECT * INTO v_plan FROM public.subscription_plans WHERE slug = 'free';
  END IF;
  RETURN v_plan;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_plan_slug(text), public.is_paid_plan(text),
  public.plan_has_feature(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.normalize_plan_slug(text), public.is_paid_plan(text),
  public.plan_has_feature(text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.shop_effective_plan(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Existing functions, from production, with plan-name checks replaced.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_assign_shop_url(p_shop_id uuid, p_slug text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE; v_previous text;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Owner profile is missing.'; END IF;
  SELECT slug INTO v_previous FROM public.shop_custom_urls WHERE shop_id = p_shop_id;
  IF nullif(btrim(p_slug), '') IS NULL THEN
    DELETE FROM public.shop_custom_urls WHERE shop_id = p_shop_id;
  ELSE
    IF NOT coalesce(public.is_paid_plan(v_profile.subscription_plan) AND v_profile.subscription_status = 'active'
      AND v_profile.subscription_expires_at > now(), false) THEN
      RAISE EXCEPTION 'An active paid subscription is required to assign a URL.';
    END IF;
    INSERT INTO public.shop_custom_urls (shop_id, slug) VALUES (p_shop_id, lower(btrim(p_slug)))
      ON CONFLICT (shop_id) DO UPDATE SET slug = excluded.slug;
  END IF;
  INSERT INTO public.billing_admin_events (actor_id, shop_id, action, details)
    VALUES (auth.uid(), p_shop_id, 'custom_url_changed', jsonb_build_object('previous_slug', v_previous, 'slug', nullif(lower(btrim(p_slug)), '')));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_change_subscription_status(p_shop_id uuid, p_status text, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('active', 'cancelled') THEN RAISE EXCEPTION 'Invalid subscription status.'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR NOT public.is_paid_plan(v_profile.subscription_plan) THEN
    RAISE EXCEPTION 'This owner has no paid subscription.';
  END IF;
  IF v_profile.subscription_status = p_status THEN RAISE EXCEPTION 'Subscription already has this status. Refresh the list.'; END IF;
  IF p_status = 'active' AND (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at <= now()) THEN
    RAISE EXCEPTION 'This subscription has expired. Approve a new payment to renew it.';
  END IF;
  UPDATE public.profiles SET subscription_status = p_status WHERE id = v_owner;
  INSERT INTO public.billing_admin_events (actor_id, shop_id, action, reason, details)
    VALUES (auth.uid(), p_shop_id, 'subscription_' || p_status, btrim(p_reason), jsonb_build_object('owner_id', v_owner, 'previous_status', v_profile.subscription_status));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_shop_billing(p_shop_id uuid, p_status text DEFAULT 'all'::text, p_offset integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_shop jsonb; v_payments jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('all','pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid payment status.'; END IF;
  SELECT jsonb_build_object('shop_id',s.id,'shop_name',s.name,'username',s.username,'user_id',s.user_id,
    'owner_email',p.email,'subscription_plan',p.subscription_plan,'subscription_status',p.subscription_status,
    'subscription_expires_at',p.subscription_expires_at,'slug',c.slug,
    'pro_active',coalesce(public.is_paid_plan(p.subscription_plan) AND p.subscription_status='active' AND p.subscription_expires_at>now(),false))
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

CREATE OR REPLACE FUNCTION public.admin_list_shop_subscriptions(p_query text DEFAULT ''::text, p_offset integer DEFAULT 0) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  WITH matching AS (
    SELECT s.id AS shop_id, s.name AS shop_name, s.username, s.user_id, p.email AS owner_email,
      p.subscription_plan, p.subscription_status, p.subscription_expires_at, c.slug,
      coalesce(public.is_paid_plan(p.subscription_plan) AND p.subscription_status = 'active' AND p.subscription_expires_at > now(), false) AS pro_active
    FROM public.shops s JOIN public.profiles p ON p.id = s.user_id
    LEFT JOIN public.shop_custom_urls c ON c.shop_id = s.id
    WHERE coalesce(p_query, '') = '' OR concat_ws(' ', s.name, p.email, c.slug) ILIKE '%' || left(p_query, 120) || '%'
  ), page AS (SELECT * FROM matching ORDER BY shop_name, shop_id LIMIT 50 OFFSET greatest(coalesce(p_offset, 0), 0))
  SELECT jsonb_build_object('rows', coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page), '[]'::jsonb),
    'total', (SELECT count(*) FROM matching)) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_subscription(p_shop_id uuid, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'Shop no longer exists. Refresh the list.'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR NOT public.is_paid_plan(v_profile.subscription_plan) THEN
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

CREATE OR REPLACE FUNCTION public.admin_set_subscription_expiry(p_shop_id uuid, p_expires_at timestamp with time zone, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE v_owner uuid; v_profile public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Enter a reason (3-1000 characters).'; END IF;
  IF p_expires_at IS NULL OR p_expires_at <= now() THEN RAISE EXCEPTION 'Choose an end date in the future. Use Revoke to end access now.'; END IF;
  IF p_expires_at > now() + interval '10 years' THEN RAISE EXCEPTION 'Choose an end date within 10 years.'; END IF;
  SELECT user_id INTO v_owner FROM public.shops WHERE id = p_shop_id FOR SHARE;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'Shop no longer exists. Refresh the list.'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_owner FOR UPDATE;
  IF NOT FOUND OR NOT public.is_paid_plan(v_profile.subscription_plan) THEN
    RAISE EXCEPTION 'This owner has no paid subscription. Approve a payment to start one.';
  END IF;
  UPDATE public.profiles SET subscription_expires_at = p_expires_at WHERE id = v_owner;
  INSERT INTO public.billing_admin_events (actor_id, shop_id, action, reason, details)
    VALUES (auth.uid(), p_shop_id, 'subscription_expiry_changed', btrim(p_reason), jsonb_build_object(
      'owner_id', v_owner, 'status', v_profile.subscription_status,
      'previous_expiry', v_profile.subscription_expires_at, 'new_expiry', p_expires_at));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_billing_payment(p_request_id uuid, p_decision text, p_reason text DEFAULT NULL::text, p_custom_slug text DEFAULT NULL::text, p_receipt_verified boolean DEFAULT false) RETURNS public.billing_payment_requests
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_request public.billing_payment_requests%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_until timestamptz;
  v_slug text := nullif(lower(btrim(p_custom_slug)), '');
  v_new_plan text;
BEGIN
  IF NOT public.is_company_billing_admin() THEN RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('approved', 'rejected') THEN RAISE EXCEPTION 'Choose approve or reject.'; END IF;
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
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_request.user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Owner profile is missing.'; END IF;
    IF EXISTS (SELECT 1 FROM public.billing_payment_requests WHERE user_id = v_request.user_id
      AND status = 'approved' AND lower(btrim(transfer_reference)) = lower(btrim(v_request.transfer_reference))) THEN
      RAISE EXCEPTION 'This transfer reference has already been approved for this owner.';
    END IF;
    v_until := (CASE WHEN public.is_paid_plan(v_profile.subscription_plan)
      AND v_profile.subscription_status = 'active' AND v_profile.subscription_expires_at > now()
      THEN v_profile.subscription_expires_at ELSE now() END) + make_interval(months => v_request.months);
    IF v_slug IS NOT NULL THEN
      INSERT INTO public.shop_custom_urls (shop_id, slug) VALUES (v_request.shop_id, v_slug)
        ON CONFLICT (shop_id) DO UPDATE SET slug = excluded.slug;
    END IF;

    -- The request's plan wins; an old request without one keeps the owner's current paid plan.
    v_new_plan := CASE
      WHEN public.is_paid_plan(v_request.plan_slug) THEN public.normalize_plan_slug(v_request.plan_slug)
      WHEN v_request.plan_slug IS NULL AND public.is_paid_plan(v_profile.subscription_plan)
        THEN public.normalize_plan_slug(v_profile.subscription_plan)
      ELSE 'plus'
    END;

    UPDATE public.profiles SET subscription_plan = v_new_plan,
      subscription_status = 'active', subscription_expires_at = v_until WHERE id = v_request.user_id;
  END IF;

  UPDATE public.billing_payment_requests SET status = p_decision, reviewed_at = now(), reviewed_by = auth.uid(),
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN btrim(p_reason) ELSE NULL END,
    activated_until = v_until WHERE id = p_request_id RETURNING * INTO v_request;

  INSERT INTO public.billing_admin_events (actor_id, shop_id, request_id, action, reason, details)
    VALUES (auth.uid(), v_request.shop_id, v_request.id, p_decision, v_request.rejection_reason,
      jsonb_build_object('previous_expiry', v_profile.subscription_expires_at, 'activated_until', v_until,
        'months', v_request.months, 'amount', v_request.amount, 'currency', v_request.currency,
        'assigned_slug', v_slug, 'plan', v_new_plan));
  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.shop_has_paid_access(p_shop_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
  SELECT coalesce((
    SELECT public.is_paid_plan(p.subscription_plan)
       AND p.subscription_status = 'active'
       AND p.subscription_expires_at + interval '3 days' > now()
    FROM public.shops s JOIN public.profiles p ON p.id = s.user_id
    WHERE s.id = p_shop_id), false);
$$;

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
        AND public.plan_has_feature(p.subscription_plan, 'custom_url')
        AND p.subscription_status = 'active'
        AND p.subscription_expires_at > now();
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

  SELECT coalesce(public.plan_has_feature(p.subscription_plan, 'custom_themes')
      AND p.subscription_status = 'active'
      AND p.subscription_expires_at > now(), false)
    INTO v_paid
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF NOT coalesce(v_paid, false) THEN
    RAISE EXCEPTION 'This is a premium theme. Upgrade to a plan with custom themes to apply it.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.free_plan_listed_food_item_ids(p_shop_id uuid) RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
  WITH lim AS (
    SELECT coalesce(max(max_items), 10) AS max_items, coalesce(max(max_categories), 2) AS max_categories
    FROM public.subscription_plans WHERE slug = 'free'
  ), cats AS (
    SELECT coalesce(f.category, '') AS category,
           array_position(s.category_order, f.category) AS pos,
           max(f.created_at) AS newest
    FROM public.food_items f JOIN public.shops s ON s.id = f.shop_id
    WHERE f.shop_id = p_shop_id
    GROUP BY 1, 2
  ), ranked AS (
    SELECT category, row_number() OVER (ORDER BY category = '', pos NULLS LAST, newest DESC, category) AS rnk
    FROM cats
  )
  SELECT f.id
  FROM public.food_items f JOIN ranked r ON r.category = coalesce(f.category, '')
  WHERE f.shop_id = p_shop_id AND r.rnk <= (SELECT max_categories FROM lim)
  ORDER BY r.rnk, f.created_at DESC, f.id
  LIMIT (SELECT max_items FROM lim);
$$;

-- ---------------------------------------------------------------------------
-- Menu limits: one trigger, reading the shop's current plan (Free when not paid).
-- Replaces the Free-only trigger and the item-only plan trigger.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS enforce_free_plan_menu_limits ON public.food_items;
DROP FUNCTION IF EXISTS public.enforce_free_plan_menu_limits();

CREATE OR REPLACE FUNCTION public.enforce_menu_plan_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_plan public.subscription_plans%ROWTYPE;
  v_items integer;
  v_categories integer;
  v_existing_category boolean;
BEGIN
  -- Backend jobs and the SQL editor run without a signed-in user.
  IF coalesce(auth.role(), '') <> 'authenticated' THEN
    RETURN NEW;
  END IF;
  -- Company admins may manage other owners' menus; their own shops follow the plan rules.
  IF public.is_company_billing_admin()
     AND NOT EXISTS (SELECT 1 FROM public.shops WHERE id = NEW.shop_id AND user_id = auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Serialise concurrent inserts for the same shop so a limit cannot be raced past.
  PERFORM pg_advisory_xact_lock(hashtext('shop-food-items'), hashtext(NEW.shop_id::text));
  v_plan := public.shop_effective_plan(NEW.shop_id);
  SELECT count(*),
         count(DISTINCT coalesce(category, '')),
         coalesce(bool_or(coalesce(category, '') = coalesce(NEW.category, '')), false)
    INTO v_items, v_categories, v_existing_category
  FROM public.food_items WHERE shop_id = NEW.shop_id;

  IF v_items >= coalesce(v_plan.max_items, 10) THEN
    RAISE EXCEPTION 'The % plan allows up to % menu items. Upgrade your plan to add more.',
      coalesce(v_plan.name, 'Free'), coalesce(v_plan.max_items, 10) USING ERRCODE = 'P0001';
  END IF;
  IF NOT v_existing_category AND v_categories >= coalesce(v_plan.max_categories, 2) THEN
    RAISE EXCEPTION 'The % plan allows up to % categories. Add this item to an existing category or upgrade your plan.',
      coalesce(v_plan.name, 'Free'), coalesce(v_plan.max_categories, 2) USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_menu_plan_limits() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_menu_plan_limits ON public.food_items;
CREATE TRIGGER enforce_menu_plan_limits
  BEFORE INSERT ON public.food_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_menu_plan_limits();

-- ---------------------------------------------------------------------------
-- Checkout: any active paid plan can be bought at its plan_prices price.
-- ---------------------------------------------------------------------------
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
  p_customer_note text DEFAULT NULL,
  p_plan_slug text DEFAULT 'plus'
)
RETURNS public.billing_payment_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_plan text := public.normalize_plan_slug(coalesce(p_plan_slug, 'plus'));
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
  IF v_plan = 'free' OR NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE slug = v_plan AND is_active) THEN
    RAISE EXCEPTION 'This plan is not available to buy. Choose another plan.';
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
    p_transferred_on, v_slug, nullif(btrim(p_customer_note), ''), v_plan
  ) RETURNING * INTO v_request;
  RETURN v_request;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'You already have a payment request awaiting review.' USING ERRCODE = '23505';
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin plan management.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_plan_json(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'id', sp.id, 'slug', sp.slug, 'name', sp.name, 'description', sp.description,
    'highlights', to_jsonb(sp.highlights), 'excluded', to_jsonb(sp.excluded),
    'badge', sp.badge, 'is_popular', sp.is_popular, 'is_public', sp.is_public,
    'is_active', sp.is_active, 'sort_order', sp.sort_order,
    'max_items', sp.max_items, 'max_categories', sp.max_categories,
    'features', jsonb_build_object(
      'custom_themes', sp.has_custom_themes, 'qr_branding', sp.has_qr_branding,
      'custom_url', sp.has_custom_url, 'advanced_analytics', sp.has_advanced_analytics,
      'priority_support', sp.has_priority_support, 'advanced_customization', sp.has_advanced_customization,
      'all_features', sp.has_all_features),
    'prices', coalesce((SELECT jsonb_object_agg(pp.period_id, jsonb_build_object('amount', pp.amount, 'currency', pp.currency))
                        FROM public.plan_prices pp WHERE pp.plan_slug = sp.slug), '{}'::jsonb),
    'active_shops', (SELECT count(*) FROM public.profiles p
                     WHERE public.normalize_plan_slug(p.subscription_plan) = sp.slug
                       AND sp.slug <> 'free' AND p.subscription_status = 'active'
                       AND p.subscription_expires_at > now()),
    'updated_at', sp.updated_at)
  FROM public.subscription_plans sp WHERE sp.slug = p_slug;
$$;
REVOKE ALL ON FUNCTION public.admin_plan_json(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_plans()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;
  RETURN coalesce((SELECT jsonb_agg(public.admin_plan_json(slug) ORDER BY sort_order, name)
                   FROM public.subscription_plans WHERE slug <> 'pro'), '[]'::jsonb);
END;
$$;

-- p_create = true adds a new plan (its slug must be unused); false edits an existing one.
-- A plan's slug is permanent because shops and payments refer to it.
CREATE OR REPLACE FUNCTION public.admin_save_plan(p_plan jsonb, p_create boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_slug text := lower(btrim(coalesce(p_plan->>'slug', '')));
  v_exists boolean;
  v_is_free boolean;
  v_name text := btrim(coalesce(p_plan->>'name', ''));
  v_description text := btrim(coalesce(p_plan->>'description', ''));
  v_badge text := nullif(btrim(coalesce(p_plan->>'badge', '')), '');
  v_highlights text[];
  v_excluded text[];
  v_items integer;
  v_categories integer;
  v_sort integer;
  v_monthly numeric;
  v_yearly numeric;
  v_features jsonb := coalesce(p_plan->'features', '{}'::jsonb);
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_plan) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Send the plan details.';
  END IF;

  PERFORM 1 FROM public.subscription_plans WHERE slug = v_slug FOR UPDATE;
  v_exists := FOUND;
  IF p_create THEN
    IF char_length(v_slug) NOT BETWEEN 2 AND 32 OR v_slug !~ '^[a-z][a-z0-9]*(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Use a plan ID of 2-32 lowercase letters, numbers and single hyphens, starting with a letter.';
    END IF;
    IF v_exists OR v_slug IN ('free', 'pro') THEN
      RAISE EXCEPTION 'A plan with the ID "%" already exists. Choose another ID.', v_slug;
    END IF;
  ELSIF NOT v_exists OR v_slug = 'pro' THEN
    RAISE EXCEPTION 'That plan no longer exists. Refresh and try again.';
  END IF;
  v_is_free := v_slug = 'free';

  IF char_length(v_name) NOT BETWEEN 1 AND 60 THEN
    RAISE EXCEPTION 'Enter a plan name of 1-60 characters.';
  END IF;
  IF char_length(v_description) > 500 THEN
    RAISE EXCEPTION 'Keep the description within 500 characters.';
  END IF;
  IF v_badge IS NOT NULL AND char_length(v_badge) > 30 THEN
    RAISE EXCEPTION 'Keep the badge within 30 characters.';
  END IF;
  BEGIN
    SELECT coalesce(array_agg(btrim(x)) FILTER (WHERE btrim(x) <> ''), '{}') INTO v_highlights
      FROM jsonb_array_elements_text(coalesce(p_plan->'highlights', '[]'::jsonb)) x;
    SELECT coalesce(array_agg(btrim(x)) FILTER (WHERE btrim(x) <> ''), '{}') INTO v_excluded
      FROM jsonb_array_elements_text(coalesce(p_plan->'excluded', '[]'::jsonb)) x;
    v_items := (p_plan->>'max_items')::integer;
    v_categories := (p_plan->>'max_categories')::integer;
    v_sort := coalesce((p_plan->>'sort_order')::integer, 100);
    v_monthly := (nullif(btrim(p_plan->'prices'->>'monthly'), ''))::numeric;
    v_yearly := (nullif(btrim(p_plan->'prices'->>'yearly'), ''))::numeric;
  EXCEPTION WHEN data_exception THEN
    RAISE EXCEPTION 'Check the plan details: limits must be whole numbers and prices must be numbers.';
  END;
  IF cardinality(v_highlights) > 30 OR cardinality(v_excluded) > 30
     OR EXISTS (SELECT 1 FROM unnest(v_highlights || v_excluded) x WHERE char_length(x) > 120) THEN
    RAISE EXCEPTION 'Keep each feature list to 30 lines of up to 120 characters.';
  END IF;
  IF v_items IS NULL OR v_items NOT BETWEEN 1 AND 100000 THEN
    RAISE EXCEPTION 'Set a food item limit between 1 and 100,000.';
  END IF;
  IF v_categories IS NULL OR v_categories NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'Set a category limit between 1 and 1,000.';
  END IF;
  IF v_sort NOT BETWEEN 0 AND 10000 THEN
    RAISE EXCEPTION 'Set a display order between 0 and 10,000.';
  END IF;
  IF NOT v_is_free THEN
    IF p_create AND (v_monthly IS NULL OR v_yearly IS NULL) THEN
      RAISE EXCEPTION 'Enter a monthly and a yearly price for the new plan.';
    END IF;
    IF (v_monthly IS NOT NULL AND (v_monthly <= 0 OR v_monthly > 9999999999 OR v_monthly <> round(v_monthly, 2)))
       OR (v_yearly IS NOT NULL AND (v_yearly <= 0 OR v_yearly > 9999999999 OR v_yearly <> round(v_yearly, 2))) THEN
      RAISE EXCEPTION 'Enter prices above zero with at most two decimal places.';
    END IF;
  END IF;

  INSERT INTO public.subscription_plans (
    slug, name, description, highlights, excluded, badge, is_popular, is_public, is_active, sort_order,
    max_items, max_categories, has_custom_themes, has_qr_branding, has_custom_url, has_advanced_analytics,
    has_priority_support, has_advanced_customization, has_all_features, updated_by, updated_at
  ) VALUES (
    v_slug, v_name, v_description, v_highlights, v_excluded, v_badge,
    coalesce((p_plan->>'is_popular')::boolean, false),
    coalesce((p_plan->>'is_public')::boolean, true),
    v_is_free OR coalesce((p_plan->>'is_active')::boolean, true),
    v_sort, v_items, v_categories,
    coalesce((v_features->>'custom_themes')::boolean, false),
    coalesce((v_features->>'qr_branding')::boolean, false),
    coalesce((v_features->>'custom_url')::boolean, false),
    coalesce((v_features->>'advanced_analytics')::boolean, false),
    coalesce((v_features->>'priority_support')::boolean, false),
    coalesce((v_features->>'advanced_customization')::boolean, false),
    coalesce((v_features->>'all_features')::boolean, false),
    auth.uid(), now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, highlights = EXCLUDED.highlights,
    excluded = EXCLUDED.excluded, badge = EXCLUDED.badge, is_popular = EXCLUDED.is_popular,
    is_public = EXCLUDED.is_public, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order,
    max_items = EXCLUDED.max_items, max_categories = EXCLUDED.max_categories,
    has_custom_themes = EXCLUDED.has_custom_themes, has_qr_branding = EXCLUDED.has_qr_branding,
    has_custom_url = EXCLUDED.has_custom_url, has_advanced_analytics = EXCLUDED.has_advanced_analytics,
    has_priority_support = EXCLUDED.has_priority_support,
    has_advanced_customization = EXCLUDED.has_advanced_customization,
    has_all_features = EXCLUDED.has_all_features, updated_by = EXCLUDED.updated_by, updated_at = now();

  IF NOT v_is_free THEN
    IF v_monthly IS NOT NULL THEN
      INSERT INTO public.plan_prices (plan_slug, period_id, amount, currency, updated_at, updated_by)
        VALUES (v_slug, 'monthly', v_monthly, 'LKR', now(), auth.uid())
        ON CONFLICT (plan_slug, period_id) DO UPDATE SET amount = EXCLUDED.amount, updated_at = now(), updated_by = auth.uid();
    END IF;
    IF v_yearly IS NOT NULL THEN
      INSERT INTO public.plan_prices (plan_slug, period_id, amount, currency, updated_at, updated_by)
        VALUES (v_slug, 'yearly', v_yearly, 'LKR', now(), auth.uid())
        ON CONFLICT (plan_slug, period_id) DO UPDATE SET amount = EXCLUDED.amount, updated_at = now(), updated_by = auth.uid();
    END IF;
    UPDATE public.subscription_plans sp SET
      monthly_price = coalesce((SELECT round(amount)::integer FROM public.plan_prices WHERE plan_slug = v_slug AND period_id = 'monthly'), 0),
      annual_price = coalesce((SELECT round(amount)::integer FROM public.plan_prices WHERE plan_slug = v_slug AND period_id = 'yearly'), 0)
    WHERE sp.slug = v_slug;
  END IF;

  RETURN public.admin_plan_json(v_slug);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_plans(), public.admin_save_plan(jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_plans(), public.admin_save_plan(jsonb, boolean) TO authenticated;

COMMIT;
