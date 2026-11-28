-- Run against a disposable copy of the production schema, never production.
-- psql -f tests/admin-dashboard-db.sql (after loading the schema and the migration)
\set ON_ERROR_STOP 1
\ir ../supabase/migrations/20261130000001_admin_dashboard_stats.sql
\ir ../supabase/migrations/20261130000002_admin_dashboard_sections.sql

CREATE FUNCTION pg_temp.assert_true(p_result boolean, p_message text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  IF p_result IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', p_message; END IF;
END $$;
CREATE FUNCTION pg_temp.expect_error(p_statement text, p_message_pattern text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  BEGIN EXECUTE p_statement;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE p_message_pattern THEN RAISE EXCEPTION 'Expected %, got %', p_message_pattern, SQLERRM; END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'Statement unexpectedly succeeded: %', p_statement;
END $$;

INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'owner1@example.test', now()),
  ('d0000000-0000-0000-0000-000000000002', 'owner2@example.test', now()),
  ('d0000000-0000-0000-0000-000000000003', 'owner3@example.test', now()),
  ('d0000000-0000-0000-0000-000000000009', 'boss@example.test', now());
INSERT INTO public.profiles (id, email) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'owner1@example.test'),
  ('d0000000-0000-0000-0000-000000000002', 'owner2@example.test'),
  ('d0000000-0000-0000-0000-000000000003', 'owner3@example.test')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.admins (email, is_active) VALUES ('boss@example.test', true);
INSERT INTO public.billing_periods (id, label, months, currency) VALUES
  ('monthly', 'Monthly', 1, 'LKR'), ('yearly', 'Yearly', 12, 'LKR')
ON CONFLICT (id) DO NOTHING;

-- Two shops this month (one closed), one from three months ago.
INSERT INTO public.shops (id, user_id, name, is_open, created_at, location) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'New Open', true, now(), 'Kandy, Sri Lanka'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'New Closed', false, now(), 'colombo 03'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Old', true, now() - interval '3 months', 'Kandy');
-- Owner 1 on Plus expiring in 3 days, owner 3 on Enterprise for a year, owner 2's Plus already ended.
UPDATE public.profiles SET subscription_plan = 'plus', subscription_status = 'active', subscription_expires_at = now() + interval '3 days'
  WHERE id = 'd0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET subscription_plan = 'enterprise', subscription_status = 'active', subscription_expires_at = now() + interval '1 year'
  WHERE id = 'd0000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET subscription_plan = 'plus', subscription_status = 'active', subscription_expires_at = now() - interval '1 minute'
  WHERE id = 'd0000000-0000-0000-0000-000000000002';
INSERT INTO public.food_items (shop_id, name, original_price, final_price) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'Rice', 500, 500), ('e0000000-0000-0000-0000-000000000003', 'Tea', 100, 100);

INSERT INTO public.billing_payment_requests
  (user_id, shop_id, period_id, period_label, months, amount, currency, payer_name, transfer_reference, transferred_on, status, reviewed_at, created_at)
VALUES
  -- approved this month: counts toward month and year
  ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner One', 'REF-001', current_date, 'approved', now(), now()),
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'yearly', 'Yearly', 12, 65000, 'LKR', 'Owner Three', 'REF-002', current_date, 'approved', now(), now()),
  -- pending and rejected: not revenue
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner Two', 'REF-003', current_date, 'pending', NULL, now()),
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'monthly', 'Monthly', 1, 6000, 'LKR', 'Owner Two', 'REF-004', current_date, 'rejected', now(), now()),
  -- approved two years ago: outside every window
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'monthly', 'Monthly', 1, 9999, 'LKR', 'Owner Three', 'REF-005', current_date, 'approved', now() - interval '2 years', now() - interval '2 years');

SET ROLE anon;
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_stats()', 'permission denied%');
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_overview()', 'permission denied%');
SELECT pg_temp.expect_error($q$SELECT public.admin_dashboard_revenue('monthly')$q$, 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'd0000000-0000-0000-0000-000000000001', false);
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_stats()', 'Company admin access required%');
SELECT pg_temp.expect_error('SELECT public.admin_dashboard_overview()', 'Company admin access required%');
SELECT pg_temp.expect_error($q$SELECT public.admin_dashboard_revenue('monthly')$q$, 'Company admin access required%');

SELECT set_config('request.jwt.claim.sub', 'd0000000-0000-0000-0000-000000000009', false);
CREATE TEMP TABLE s AS SELECT public.admin_dashboard_stats() AS j;
SELECT pg_temp.assert_true((SELECT (j->>'total_shops')::int = 3 FROM s), 'total shops');
SELECT pg_temp.assert_true((SELECT (j->>'total_shops_before_month')::int = 1 FROM s), 'shops before this month');
SELECT pg_temp.assert_true((SELECT (j->>'open_shops')::int = 2 AND (j->>'closed_shops')::int = 1 FROM s), 'open and closed shops');
SELECT pg_temp.assert_true((SELECT (j->>'new_shops_month')::int = 2 FROM s), 'new shops this month');
SELECT pg_temp.assert_true((SELECT (j->>'pending_payments')::int = 1 FROM s), 'pending payments');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_month')::numeric = 71000 FROM s), 'revenue this month ignores pending, rejected and old payments');
SELECT pg_temp.assert_true((SELECT (j->>'paying_shops_month')::int = 2 FROM s), 'paying shops this month');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_year')::numeric = 71000 FROM s), 'revenue this year');
SELECT pg_temp.assert_true((SELECT (j->>'revenue_prev_year')::numeric = 0 FROM s), 'nothing last year');
SELECT pg_temp.assert_true((SELECT j->>'currency' = 'LKR' FROM s), 'currency');

-- Revenue series: both approvals land in the current month. Owner Three paid two years ago, so their payment is a renewal.
CREATE TEMP TABLE rv AS SELECT public.admin_dashboard_revenue('monthly') AS j;
SELECT pg_temp.assert_true((SELECT jsonb_array_length(j->'points') = 12 FROM rv), '12 monthly points');
SELECT pg_temp.assert_true((SELECT (j->'points'->11->>'revenue')::numeric = 71000 FROM rv), 'current month revenue');
SELECT pg_temp.assert_true((SELECT (j->'points'->11->>'newPlans')::numeric = 6000 FROM rv), 'first payment counts as new');
SELECT pg_temp.assert_true((SELECT (j->'points'->11->>'renewals')::numeric = 65000 FROM rv), 'repeat payment counts as renewal');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(public.admin_dashboard_revenue('daily')->'points') = 14), 'daily points');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(public.admin_dashboard_revenue('weekly')->'points') = 12), 'weekly points');
SELECT pg_temp.assert_true((SELECT (public.admin_dashboard_revenue('yearly')->'points'->4->>'revenue')::numeric = 71000), 'yearly current');
SELECT pg_temp.assert_true((SELECT (public.admin_dashboard_revenue('yearly')->'points'->2->>'revenue')::numeric = 9999), 'yearly two years ago');
SELECT pg_temp.expect_error($q$SELECT public.admin_dashboard_revenue('hourly')$q$, 'Unknown range%');

CREATE TEMP TABLE ov AS SELECT public.admin_dashboard_overview() AS j;
SELECT pg_temp.assert_true((SELECT (SELECT (e->>'value')::int FROM jsonb_array_elements(j->'plan_distribution') e WHERE e->>'slug' = 'free') = 1 FROM ov), 'expired plus counts as free');
SELECT pg_temp.assert_true((SELECT (SELECT (e->>'value')::int FROM jsonb_array_elements(j->'plan_distribution') e WHERE e->>'slug' = 'plus') = 1 FROM ov), 'one plus shop');
SELECT pg_temp.assert_true((SELECT (SELECT (e->>'value')::int FROM jsonb_array_elements(j->'plan_distribution') e WHERE e->>'slug' = 'enterprise') = 1 FROM ov), 'one enterprise shop');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(j->'growth') = 7 FROM ov), 'seven growth months');
SELECT pg_temp.assert_true((SELECT (j->'growth'->6->>'registrations')::int = 2 AND (j->'growth'->6->>'churn')::int = 1 FROM ov), 'this month: 2 new shops, 1 plan ended');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(j->'activity') = 10 FROM ov), 'activity capped at 10');
SELECT pg_temp.assert_true((SELECT (j->'activity'->0->>'at')::timestamptz >= (j->'activity'->9->>'at')::timestamptz FROM ov), 'activity newest first');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(j->'top_shops') = 2 FROM ov), 'two shops with revenue');
SELECT pg_temp.assert_true((SELECT j->'top_shops'->0->>'name' = 'Old' AND (j->'top_shops'->0->>'revenue')::numeric = 74999
  AND (j->'top_shops'->0->>'items')::int = 2 AND j->'top_shops'->0->>'plan' = 'enterprise' FROM ov), 'top shop details');
SELECT pg_temp.assert_true((SELECT (j->>'expiring_soon')::int = 1 FROM ov), 'one plan expiring in 7 days');
SELECT pg_temp.assert_true((SELECT j->'top_city'->>'city' = 'Kandy' AND (j->'top_city'->>'shops')::int = 2 FROM ov), 'top city');
RESET ROLE;

\echo admin dashboard checks passed
