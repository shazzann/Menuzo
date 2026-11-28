-- Real numbers for the company admin dashboard cards.
-- Revenue counts approved billing payments by the date they were approved.
-- Months and years follow Sri Lanka time so "this month" matches the admin's calendar.

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_tz constant text := 'Asia/Colombo';
  v_local timestamp := now() AT TIME ZONE v_tz;
  v_month_start timestamptz := date_trunc('month', v_local) AT TIME ZONE v_tz;
  v_prev_month_start timestamptz := (date_trunc('month', v_local) - interval '1 month') AT TIME ZONE v_tz;
  -- Same point in last month, so a half-finished month is compared fairly.
  v_prev_month_cutoff timestamptz := (v_local - interval '1 month') AT TIME ZONE v_tz;
  v_year_start timestamptz := date_trunc('year', v_local) AT TIME ZONE v_tz;
  v_prev_year_start timestamptz := (date_trunc('year', v_local) - interval '1 year') AT TIME ZONE v_tz;
  v_prev_year_cutoff timestamptz := (v_local - interval '1 year') AT TIME ZONE v_tz;
  v_currency text;
  v_result jsonb;
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Company admin access required.' USING ERRCODE = '42501';
  END IF;

  -- Revenue is only added up in one currency; pick the one most payments use.
  SELECT r.currency INTO v_currency
  FROM public.billing_payment_requests r
  WHERE r.status = 'approved'
  GROUP BY r.currency
  ORDER BY count(*) DESC, r.currency
  LIMIT 1;
  v_currency := coalesce(v_currency, 'LKR');

  WITH paid AS (
    SELECT r.shop_id, r.amount, coalesce(r.reviewed_at, r.created_at) AS paid_at
    FROM public.billing_payment_requests r
    WHERE r.status = 'approved' AND r.currency = v_currency
  )
  SELECT jsonb_build_object(
    'currency', v_currency,
    'total_shops', (SELECT count(*) FROM public.shops),
    'total_shops_before_month', (SELECT count(*) FROM public.shops WHERE created_at < v_month_start),
    'open_shops', (SELECT count(*) FROM public.shops WHERE coalesce(is_open, true)),
    'closed_shops', (SELECT count(*) FROM public.shops WHERE NOT coalesce(is_open, true)),
    'new_shops_month', (SELECT count(*) FROM public.shops WHERE created_at >= v_month_start),
    'new_shops_prev_month', (SELECT count(*) FROM public.shops
      WHERE created_at >= v_prev_month_start AND created_at < v_prev_month_cutoff),
    'pending_payments', (SELECT count(*) FROM public.billing_payment_requests WHERE status = 'pending'),
    'revenue_month', (SELECT coalesce(sum(amount), 0) FROM paid WHERE paid_at >= v_month_start),
    'revenue_prev_month', (SELECT coalesce(sum(amount), 0) FROM paid
      WHERE paid_at >= v_prev_month_start AND paid_at < v_prev_month_cutoff),
    'paying_shops_month', (SELECT count(DISTINCT shop_id) FROM paid WHERE paid_at >= v_month_start),
    'paying_shops_prev_month', (SELECT count(DISTINCT shop_id) FROM paid
      WHERE paid_at >= v_prev_month_start AND paid_at < v_prev_month_cutoff),
    'revenue_year', (SELECT coalesce(sum(amount), 0) FROM paid WHERE paid_at >= v_year_start),
    'revenue_prev_year', (SELECT coalesce(sum(amount), 0) FROM paid
      WHERE paid_at >= v_prev_year_start AND paid_at < v_prev_year_cutoff)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;
