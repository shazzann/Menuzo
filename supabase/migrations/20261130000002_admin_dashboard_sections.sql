-- Real data for the company admin dashboard charts, activity feed, insights and top shops.
-- Revenue is approved billing payments, dated by approval, in Sri Lanka time.

-- The plan a shop is on, ignoring expiry (callers check the expiry date against now()).
CREATE OR REPLACE FUNCTION public.admin_dashboard_shop_plan(p_plan text, p_status text, p_expires_at timestamptz)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_plan IS NULL OR lower(btrim(p_plan)) IN ('', 'free') THEN 'free'
    WHEN coalesce(p_status, 'active') <> 'active' THEN 'free'
    WHEN p_expires_at IS NULL THEN 'free'
    WHEN lower(btrim(p_plan)) = 'pro' THEN 'plus'
    ELSE lower(btrim(p_plan))
  END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_revenue(p_range text DEFAULT 'monthly')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_tz constant text := 'Asia/Colombo';
  v_local timestamp := now() AT TIME ZONE v_tz;
  v_unit text;
  v_step interval;
  v_count int;
  v_format text;
  v_currency text;
  v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;

  CASE coalesce(p_range, 'monthly')
    WHEN 'daily' THEN v_unit := 'day'; v_step := interval '1 day'; v_count := 14; v_format := 'Mon DD';
    WHEN 'weekly' THEN v_unit := 'week'; v_step := interval '1 week'; v_count := 12; v_format := 'Mon DD';
    WHEN 'monthly' THEN v_unit := 'month'; v_step := interval '1 month'; v_count := 12; v_format := 'Mon YY';
    WHEN 'yearly' THEN v_unit := 'year'; v_step := interval '1 year'; v_count := 5; v_format := 'YYYY';
    ELSE RAISE EXCEPTION 'Unknown range.' USING ERRCODE = '22023';
  END CASE;

  SELECT r.currency INTO v_currency
  FROM public.billing_payment_requests r
  WHERE r.status = 'approved'
  GROUP BY r.currency ORDER BY count(*) DESC, r.currency LIMIT 1;
  v_currency := coalesce(v_currency, 'LKR');

  WITH buckets AS (
    SELECT b AS bucket_start
    FROM generate_series(date_trunc(v_unit, v_local) - v_step * (v_count - 1), date_trunc(v_unit, v_local), v_step) AS b
  ), paid AS (
    SELECT r.amount,
      date_trunc(v_unit, coalesce(r.reviewed_at, r.created_at) AT TIME ZONE v_tz) AS bucket_start,
      row_number() OVER (PARTITION BY r.shop_id ORDER BY coalesce(r.reviewed_at, r.created_at), r.id) = 1 AS is_first
    FROM public.billing_payment_requests r
    WHERE r.status = 'approved' AND r.currency = v_currency
  )
  SELECT jsonb_build_object(
    'currency', v_currency,
    'points', coalesce(jsonb_agg(jsonb_build_object(
      'label', to_char(b.bucket_start, v_format),
      'revenue', coalesce((SELECT sum(p.amount) FROM paid p WHERE p.bucket_start = b.bucket_start), 0),
      'renewals', coalesce((SELECT sum(p.amount) FROM paid p WHERE p.bucket_start = b.bucket_start AND NOT p.is_first), 0),
      'newPlans', coalesce((SELECT sum(p.amount) FROM paid p WHERE p.bucket_start = b.bucket_start AND p.is_first), 0)
    ) ORDER BY b.bucket_start), '[]'::jsonb)
  ) INTO v_result
  FROM buckets b;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_tz constant text := 'Asia/Colombo';
  v_local timestamp := now() AT TIME ZONE v_tz;
  v_currency text;
  v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;

  SELECT r.currency INTO v_currency
  FROM public.billing_payment_requests r
  WHERE r.status = 'approved'
  GROUP BY r.currency ORDER BY count(*) DESC, r.currency LIMIT 1;
  v_currency := coalesce(v_currency, 'LKR');

  WITH shop_plans AS (
    SELECT s.id, s.name, s.location, s.is_open, s.created_at, p.email AS owner_email,
      s.logo, s.banner, s.theme, s.contact_number, p.subscription_status, p.subscription_expires_at,
      CASE WHEN p.subscription_expires_at > now()
        THEN public.admin_dashboard_shop_plan(p.subscription_plan, p.subscription_status, p.subscription_expires_at)
        ELSE 'free' END AS plan_slug
    FROM public.shops s
    LEFT JOIN public.profiles p ON p.id = s.user_id
  ), plan_counts AS (
    SELECT sp.plan_slug, count(*) AS shops,
      coalesce(max(pl.name), initcap(sp.plan_slug)) AS plan_name
    FROM shop_plans sp
    LEFT JOIN public.subscription_plans pl ON lower(pl.slug) = sp.plan_slug
    GROUP BY sp.plan_slug
  ), months AS (
    SELECT m AS month_start
    FROM generate_series(date_trunc('month', v_local) - interval '6 months', date_trunc('month', v_local), interval '1 month') AS m
  ), revenue_by_shop AS (
    SELECT r.shop_id, sum(r.amount) AS revenue
    FROM public.billing_payment_requests r
    WHERE r.status = 'approved' AND r.currency = v_currency
    GROUP BY r.shop_id
  ), events AS (
    SELECT 'registration' AS type, 'New shop registered' AS message, s.name AS shop_name, s.created_at AS at
    FROM public.shops s
    UNION ALL
    SELECT 'payment-submitted', 'Payment submitted — ' || initcap(r.plan_slug) || ' plan', s.name, r.created_at
    FROM public.billing_payment_requests r JOIN public.shops s ON s.id = r.shop_id
    UNION ALL
    SELECT CASE r.status WHEN 'approved' THEN 'payment' ELSE 'rejected' END,
      CASE r.status WHEN 'approved' THEN 'Payment approved — ' ELSE 'Payment rejected — ' END || initcap(r.plan_slug) || ' plan',
      s.name, r.reviewed_at
    FROM public.billing_payment_requests r JOIN public.shops s ON s.id = r.shop_id
    WHERE r.status IN ('approved', 'rejected') AND r.reviewed_at IS NOT NULL
  ), cities AS (
    SELECT initcap(btrim(split_part(location, ',', 1))) AS city, count(*) AS shops
    FROM public.shops
    WHERE nullif(btrim(location), '') IS NOT NULL
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'currency', v_currency,
    'plan_distribution', coalesce((
      SELECT jsonb_agg(jsonb_build_object('slug', plan_slug, 'name', plan_name, 'value', shops)
        ORDER BY (plan_slug = 'free') DESC, shops DESC, plan_slug)
      FROM plan_counts), '[]'::jsonb),
    'growth', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'month', to_char(m.month_start, 'Mon'),
        'registrations', (SELECT count(*) FROM shop_plans sp
          WHERE sp.created_at >= m.month_start AT TIME ZONE v_tz
            AND sp.created_at < (m.month_start + interval '1 month') AT TIME ZONE v_tz),
        'churn', (SELECT count(*) FROM shop_plans sp
          WHERE sp.subscription_expires_at >= m.month_start AT TIME ZONE v_tz
            AND sp.subscription_expires_at < (m.month_start + interval '1 month') AT TIME ZONE v_tz
            AND sp.subscription_expires_at <= now())
      ) ORDER BY m.month_start)
      FROM months m), '[]'::jsonb),
    'activity', coalesce((
      SELECT jsonb_agg(jsonb_build_object('type', type, 'message', message, 'shopName', shop_name, 'at', at) ORDER BY at DESC)
      FROM (SELECT * FROM events WHERE at IS NOT NULL ORDER BY at DESC LIMIT 10) e), '[]'::jsonb),
    'top_shops', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'name', t.name, 'owner', t.owner_email, 'location', t.location,
        'revenue', t.revenue, 'plan', t.plan_slug, 'items', t.items,
        'phone', t.contact_number, 'logo', t.logo, 'banner', t.banner, 'theme', t.theme,
        'status', t.subscription_status, 'createdAt', t.created_at, 'expiresAt', t.subscription_expires_at
      ) ORDER BY t.revenue DESC, t.name)
      FROM (
        SELECT sp.id, sp.name, sp.owner_email, sp.location, sp.plan_slug, rb.revenue,
          sp.contact_number, sp.logo, sp.banner, sp.theme, sp.subscription_status, sp.created_at, sp.subscription_expires_at,
          (SELECT count(*) FROM public.food_items f WHERE f.shop_id = sp.id) AS items
        FROM shop_plans sp JOIN revenue_by_shop rb ON rb.shop_id = sp.id
        ORDER BY rb.revenue DESC, sp.name
        LIMIT 5
      ) t), '[]'::jsonb),
    'expiring_soon', (SELECT count(*) FROM shop_plans
      WHERE plan_slug <> 'free' AND subscription_expires_at <= now() + interval '7 days'),
    'top_city', (SELECT jsonb_build_object('city', city, 'shops', shops) FROM cities ORDER BY shops DESC, city LIMIT 1)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_revenue(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_dashboard_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_revenue(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_overview() TO authenticated;
