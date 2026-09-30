-- Run in the same disposable database as the customer fixture, never production.
\ir customer-billing-db.sql
ALTER TABLE auth.users ADD COLUMN email text;
ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz;
\ir ../supabase/migrations/20260930000001_company_billing.sql

INSERT INTO auth.users (id,email,email_confirmed_at) VALUES
  ('00000000-0000-0000-0000-000000000003','admin@example.test',now()),
  ('00000000-0000-0000-0000-000000000004','disabled@example.test',now()),
  ('00000000-0000-0000-0000-000000000005','unverified@example.test',NULL);
INSERT INTO public.admins (email,is_active) VALUES
  ('ADMIN@example.test',true),('disabled@example.test',false),('unverified@example.test',true);
UPDATE public.shops SET is_open = true;

SET ROLE anon;
SELECT pg_temp.expect_error('SELECT public.is_company_billing_admin()', 'permission denied%');
SELECT pg_temp.expect_error('SELECT public.admin_list_billing_requests()', 'permission denied%');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.assert_true(NOT public.is_company_billing_admin(),'customer is not an admin');
SELECT pg_temp.expect_error('SELECT public.admin_list_billing_requests()', 'Company admin access required%');
SELECT pg_temp.expect_error('SELECT public.admin_list_shop_subscriptions()', 'Company admin access required%');
SELECT pg_temp.expect_error($q$SELECT public.admin_review_billing_payment('00000000-0000-0000-0000-000000000000','approved',NULL,NULL,true)$q$,'Company admin access required%');
SELECT pg_temp.expect_error($q$SELECT public.admin_change_subscription_status('10000000-0000-0000-0000-000000000001','active','forged')$q$,'Company admin access required%');
SELECT pg_temp.expect_error($q$SELECT public.admin_assign_shop_url('10000000-0000-0000-0000-000000000001','forged')$q$,'Company admin access required%');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.billing_admin_events),'customer cannot read audit events');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
SELECT pg_temp.assert_true(NOT public.is_company_billing_admin(),'inactive admin denied');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000005',false);
SELECT pg_temp.assert_true(NOT public.is_company_billing_admin(),'unverified email cannot claim admin access');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.assert_true(public.is_company_billing_admin(),'verified admin email works with legacy registry IDs');
SELECT pg_temp.assert_true((public.admin_list_billing_requests()->>'total')::int = 1,'admin sees pending customer request');
SELECT pg_temp.assert_true((public.admin_list_shop_subscriptions()->>'total')::int = 2,'admin sees shops');
SELECT pg_temp.assert_true((public.admin_list_billing_requests('pending','no-match')->>'total')::int = 0,'server search filters requests');
RESET ROLE;
SELECT id AS request_id FROM public.billing_payment_requests WHERE status='pending' \gset
SET ROLE authenticated;
SELECT pg_temp.expect_error(format('SELECT public.admin_review_billing_payment(%L,%L)', :'request_id','approved'),'Confirm the bank transfer%');
SELECT pg_temp.expect_error(format('SELECT public.admin_review_billing_payment(%L,%L,NULL,%L,true)', :'request_id','approved','paid-cafe-22'),'This menu URL is already in use%');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT status='pending' FROM public.billing_payment_requests WHERE id=:'request_id'),'URL conflict rolls back approval');
SELECT pg_temp.assert_true((SELECT subscription_plan='free' FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001'),'URL conflict leaves entitlement unchanged');
SET ROLE authenticated;
SELECT public.admin_review_billing_payment(:'request_id','approved',NULL,'my-custom-cafe',true);
SELECT pg_temp.expect_error(format('SELECT public.admin_review_billing_payment(%L,%L,NULL,NULL,true)', :'request_id','approved'),'This request has already been reviewed%');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT subscription_plan='pro' AND subscription_status='active' AND subscription_expires_at BETWEEN now()+interval '1 month'-interval '1 minute' AND now()+interval '1 month'+interval '1 minute' FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001'),'monthly approval activates one month');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.resolve_menu_shop('my-custom-cafe')),'approved URL resolves');
SELECT subscription_expires_at AS first_expiry FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001' \gset

-- New annual payment uses its stored twelve months, irrespective of later pricing.
INSERT INTO public.billing_payment_requests(user_id,shop_id,period_id,period_label,months,amount,currency,payer_name,transfer_reference,transferred_on)
VALUES ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','yearly','Yearly',12,15000,'LKR','Test Payer','YEAR-1',current_date) RETURNING id AS annual_id \gset
SET ROLE authenticated;
SELECT public.admin_review_billing_payment(:'annual_id','approved',NULL,NULL,true);
RESET ROLE;
SELECT pg_temp.assert_true((SELECT subscription_expires_at=:'first_expiry'::timestamptz+interval '12 months' FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001'),'annual renewal preserves remaining paid time');
SELECT subscription_expires_at AS renewed_expiry FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001' \gset
INSERT INTO public.billing_payment_requests(user_id,shop_id,period_id,period_label,months,amount,currency,payer_name,transfer_reference,transferred_on)
VALUES ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','monthly','Monthly',1,1500,'LKR','Test Payer',' year-1 ',current_date) RETURNING id AS duplicate_id \gset
SET ROLE authenticated;
SELECT pg_temp.expect_error(format('SELECT public.admin_review_billing_payment(%L,%L,NULL,NULL,true)', :'duplicate_id','approved'),'This transfer reference has already been approved%');
SELECT pg_temp.expect_error(format('SELECT public.admin_review_billing_payment(%L,%L,%L)', :'duplicate_id','rejected',''),'Enter a rejection reason%');
SELECT public.admin_review_billing_payment(:'duplicate_id','rejected','Duplicate bank transfer');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT subscription_expires_at=:'renewed_expiry'::timestamptz AND subscription_status='active' FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001'),'rejection preserves existing paid access');
SET ROLE authenticated;
SELECT public.admin_change_subscription_status('10000000-0000-0000-0000-000000000001','cancelled','Owner requested suspension');
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.resolve_menu_shop('my-custom-cafe')),'suspension disables custom URL');
SELECT pg_temp.expect_error($q$SELECT public.admin_assign_shop_url('10000000-0000-0000-0000-000000000001','new-custom-cafe')$q$,'An active paid subscription%');
SELECT public.admin_change_subscription_status('10000000-0000-0000-0000-000000000001','active','Owner requested restoration');
SELECT public.admin_assign_shop_url('10000000-0000-0000-0000-000000000001','new-custom-cafe');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.resolve_menu_shop('new-custom-cafe')),'new custom URL works');
SELECT public.admin_assign_shop_url('10000000-0000-0000-0000-000000000001','');
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.resolve_menu_shop('new-custom-cafe')),'removal disables alias');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.resolve_menu_shop('free-cafe-11')),'permanent menu URL survives');
SELECT pg_temp.assert_true((SELECT count(*)=7 FROM public.billing_admin_events),'every successful mutation has an audit event');
SELECT pg_temp.expect_error('DELETE FROM public.billing_admin_events','permission denied%');
RESET ROLE;
UPDATE public.profiles SET subscription_expires_at=now()-interval '1 day',subscription_status='cancelled' WHERE id='00000000-0000-0000-0000-000000000001';
SET ROLE authenticated;
SELECT pg_temp.expect_error($q$SELECT public.admin_change_subscription_status('10000000-0000-0000-0000-000000000001','active','Restore expired')$q$,'This subscription has expired%');
RESET ROLE;
\echo 'Company billing authorization, review, renewal, URL, and audit checks passed.'
