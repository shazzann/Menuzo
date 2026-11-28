-- Run in the same disposable database as the billing fixtures (menuzo_billing_test), never production:
-- psql -v ON_ERROR_STOP=1 -d menuzo_billing_test -f tests/plan-prices-db.sql
\ir menu-url-history-db.sql
\ir ../supabase/migrations/20261128000002_plan_prices.sql
UPDATE public.billing_payment_requests SET status = 'rejected' WHERE status = 'pending';

-- Seed: Plus keeps billing_periods' price (local fixture has none, so the documented default), Enterprise is 6,000 / 65,000.
SELECT pg_temp.assert_true((SELECT count(*) = 4 FROM public.plan_prices), 'Plus and Enterprise each have monthly and yearly prices');
SELECT pg_temp.assert_true((SELECT amount = 6000 AND currency = 'LKR' FROM public.plan_prices WHERE plan_slug = 'enterprise' AND period_id = 'monthly'), 'Enterprise monthly is LKR 6,000');
SELECT pg_temp.assert_true((SELECT amount = 65000 AND currency = 'LKR' FROM public.plan_prices WHERE plan_slug = 'enterprise' AND period_id = 'yearly'), 'Enterprise yearly is LKR 65,000');

-- Anyone can read prices; nobody but an admin can change them.
SET ROLE anon;
SELECT pg_temp.assert_true((SELECT count(*) = 4 FROM public.plan_prices), 'anon reads prices for the landing page');
SELECT pg_temp.expect_error($q$SELECT public.admin_set_plan_price('enterprise','monthly',1)$q$, 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.expect_error($q$UPDATE public.plan_prices SET amount = 1$q$, 'permission denied%');
SELECT pg_temp.expect_error($q$SELECT public.admin_set_plan_price('enterprise','monthly',1)$q$, 'Company admin access required%');

-- Checkout charges the chosen plan's price, not the Plus price.
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001','monthly','Test Payer','ENT-REF-1',current_date,
  (SELECT amount FROM public.plan_prices WHERE plan_slug = 'plus' AND period_id = 'monthly'),'LKR',1,NULL,NULL,'enterprise')$q$, 'Pricing changed%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001','monthly','Test Payer','ENT-REF-1',current_date,6000,'LKR',1,NULL,NULL,'free')$q$, 'Choose the Plus or Enterprise plan%');
SELECT pg_temp.assert_true((SELECT amount = 6000 AND currency = 'LKR' AND plan_slug = 'enterprise' AND status = 'pending'
  FROM public.submit_payment_request('10000000-0000-0000-0000-000000000001','monthly','Test Payer','ENT-REF-1',current_date,6000,'LKR',1,NULL,NULL,'enterprise')),
  'Enterprise request records the Enterprise price');
RESET ROLE;
UPDATE public.billing_payment_requests SET status = 'rejected' WHERE status = 'pending';

-- Admin edits take effect for the next checkout.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.expect_error($q$SELECT public.admin_set_plan_price('enterprise','monthly',0)$q$, 'Enter a price above zero%');
SELECT pg_temp.expect_error($q$SELECT public.admin_set_plan_price('enterprise','monthly',10.005)$q$, 'Enter a price above zero%');
SELECT pg_temp.expect_error($q$SELECT public.admin_set_plan_price('free','monthly',100)$q$, 'That plan price does not exist%');
SELECT pg_temp.assert_true((SELECT amount = 6500 AND updated_by = '00000000-0000-0000-0000-000000000003'
  FROM public.admin_set_plan_price('enterprise','monthly',6500)), 'admin updates Enterprise monthly and is recorded');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000001','monthly','Test Payer','ENT-REF-2',current_date,6000,'LKR',1,NULL,NULL,'enterprise')$q$, 'Pricing changed%');
SELECT pg_temp.assert_true((SELECT amount = 6500 FROM public.submit_payment_request('10000000-0000-0000-0000-000000000001','monthly','Test Payer','ENT-REF-2',current_date,6500,'LKR',1,NULL,NULL,'enterprise')),
  'checkout uses the edited price');
RESET ROLE;

\echo 'Per-plan prices, admin-only editing and plan-aware checkout checks passed.'
