\ir company-billing-db.sql
\ir ../supabase/migrations/20260930000002_shop_billing_history.sql

SET ROLE anon;
SELECT pg_temp.expect_error($q$SELECT public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001')$q$,'permission denied%');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.expect_error($q$SELECT public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001')$q$,'Company admin access required%');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
SELECT pg_temp.expect_error($q$SELECT public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001')$q$,'Company admin access required%');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.assert_true((public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001')->'shop'->>'shop_name')='Free Cafe','shop details are returned');
SELECT pg_temp.assert_true((public.admin_get_shop_billing('10000000-0000-0000-0000-000000000002')->'payments'->>'total')::int=0,'other shop has empty history');
SELECT pg_temp.assert_true((public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001','rejected')->'payments'->>'total')::int=1,'rejected payments are filterable');
SELECT pg_temp.expect_error($q$SELECT public.admin_get_shop_billing('10000000-0000-0000-0000-000000000099')$q$,'This shop is no longer available%');
SELECT pg_temp.expect_error($q$SELECT public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001','invalid')$q$,'Invalid payment status%');
RESET ROLE;
INSERT INTO public.shops(id,user_id,name,username) VALUES
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Second Shop','second-shop');
INSERT INTO public.billing_payment_requests(user_id,shop_id,period_id,period_label,months,amount,currency,payer_name,transfer_reference,transferred_on,status,created_at)
SELECT '00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','monthly','Monthly',1,100,'LKR','Test Payer','HISTORY-'||n,current_date,'approved',now()+make_interval(secs=>n)
FROM generate_series(1,51) n;
SET ROLE authenticated;
SELECT pg_temp.assert_true((public.admin_get_shop_billing('10000000-0000-0000-0000-000000000003')->'payments'->>'total')::int=51,'same owner other shop has separate history');
SELECT pg_temp.assert_true(jsonb_array_length(public.admin_get_shop_billing('10000000-0000-0000-0000-000000000003')->'payments'->'rows')=50,'history is paginated');
SELECT pg_temp.assert_true(jsonb_array_length(public.admin_get_shop_billing('10000000-0000-0000-0000-000000000003','all',50)->'payments'->'rows')=1,'next page contains remaining payment');
SELECT pg_temp.assert_true((public.admin_get_shop_billing('10000000-0000-0000-0000-000000000003')->'payments'->'rows'->0->>'transfer_reference')='HISTORY-51','newest payments appear first');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM jsonb_array_elements(public.admin_get_shop_billing('10000000-0000-0000-0000-000000000001')->'payments'->'rows') r WHERE r->>'shop_id'<>'10000000-0000-0000-0000-000000000001'),'history never includes another shop owned by same owner');
RESET ROLE;
\echo 'Shop payment history authorization, isolation, filtering, and pagination checks passed.'
