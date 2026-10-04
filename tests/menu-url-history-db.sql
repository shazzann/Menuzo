\ir company-shop-history-db.sql
\ir ../supabase/migrations/20261004000001_menu_url_history.sql

SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.resolve_menu_shop('my-custom-cafe')),'backfills approved historical aliases');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.resolve_menu_shop('new-custom-cafe')),'backfills removed aliases from audit history');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
SELECT public.admin_assign_shop_url('10000000-0000-0000-0000-000000000001','current-cafe');
RESET ROLE;
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub','',false);
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('free-cafe-11')->>'menu_slug'='current-cafe','original QR resolves current custom URL');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('my-custom-cafe')->>'id'='10000000-0000-0000-0000-000000000001','old custom URL preserves shop identity');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('new-custom-cafe')->>'menu_slug'='current-cafe','older custom URL points directly to latest');
SELECT pg_temp.expect_error('SELECT * FROM public.shop_url_history','permission denied%');
SELECT pg_temp.expect_error($q$INSERT INTO public.shop_url_history(slug,shop_id) VALUES('forged','10000000-0000-0000-0000-000000000001')$q$,'permission denied%');
RESET ROLE;
UPDATE public.profiles SET subscription_expires_at=now()-interval '1 day' WHERE id='00000000-0000-0000-0000-000000000001';
SET ROLE anon;
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('current-cafe')->>'menu_slug'='current-cafe','purchased custom URL stays preferred after expiry');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('free-cafe-11')->>'menu_slug'='current-cafe','old QR still redirects to custom after expiry');
RESET ROLE;
UPDATE public.profiles SET subscription_status='cancelled' WHERE id='00000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true(public.get_shop_menu_url('10000000-0000-0000-0000-000000000001')->>'menu_slug'='current-cafe','subscription cancellation does not remove purchased URL');
SELECT pg_temp.expect_error($q$UPDATE public.shop_custom_urls SET slug='my-custom-cafe' WHERE shop_id='10000000-0000-0000-0000-000000000002'$q$,'This menu URL is already in use%');
SELECT pg_temp.expect_error($q$UPDATE public.shops SET username='new-custom-cafe' WHERE id='10000000-0000-0000-0000-000000000002'$q$,'This menu URL is already in use%');
UPDATE public.shops SET username='updated-standard-name' WHERE id='10000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('free-cafe-11')->>'menu_slug'='current-cafe','standard username changes retain original links');
UPDATE public.shops SET is_open=false WHERE id='10000000-0000-0000-0000-000000000001';
SET ROLE anon;
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('current-cafe') IS NULL,'closed shop not exposed via custom URL');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('my-custom-cafe') IS NULL,'closed shop not exposed via history');
SELECT pg_temp.assert_true(public.get_shop_menu_url('10000000-0000-0000-0000-000000000001') IS NULL,'anonymous cannot read closed shop metadata');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.assert_true(public.get_shop_menu_url('10000000-0000-0000-0000-000000000001')->>'menu_slug'='current-cafe','owner can generate correct QR while shop closed');
SELECT pg_temp.expect_error('DELETE FROM public.shop_url_history','permission denied%');
RESET ROLE;
UPDATE public.shops SET is_open=true WHERE id='10000000-0000-0000-0000-000000000001';
DELETE FROM public.shop_custom_urls WHERE shop_id='10000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('current-cafe')->>'menu_slug'='updated-standard-name','explicit URL removal retains redirects to the shop');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('no-such-shop') IS NULL,'unknown URLs remain not found');
SELECT pg_temp.assert_true(public.resolve_menu_shop_url('login') IS NULL,'reserved app routes cannot resolve as shops');
\echo 'Permanent custom URLs, historical redirects, expiry and namespace security checks passed.'
