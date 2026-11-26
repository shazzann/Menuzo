-- Run in the same disposable database as the billing fixtures (menuzo_billing_test), never production:
-- psql -v ON_ERROR_STOP=1 -d menuzo_billing_test -f tests/promo-codes-db.sql
\ir company-billing-db.sql
\ir ../supabase/migrations/20261126000001_promo_codes.sql
\ir ../supabase/migrations/20261127000001_promo_codes_merge_pro_into_plus.sql

-- Users from the fixtures: ...0001 owns shop ...0001, ...0002 owns shop ...0002, ...0003 is an admin.
SET ROLE anon;
SELECT pg_temp.expect_error('SELECT count(*) FROM public.promo_codes', 'permission denied%');
SELECT pg_temp.expect_error('SELECT public.admin_list_promo_codes()', 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
-- Shop owners cannot manage or read codes.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('FORGED',50,'{pro}',10,now(),now()+interval '1 day')$q$, 'new row violates row-level security%');
SELECT pg_temp.expect_error('SELECT public.admin_list_promo_codes()', 'Company admin access required%');

-- Admin creates codes; authorship and normalisation come from the trigger.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
INSERT INTO public.promo_codes (code,description,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until,created_by,created_by_email)
  VALUES ('  launch20 ',' Launch ',20,'{pro,plus,pro}',1,now()-interval '1 day',now()+interval '30 days',
    '00000000-0000-0000-0000-000000000001','forged@example.test');
SELECT pg_temp.assert_true((SELECT code='LAUNCH20' AND description='Launch' AND applicable_plans='{plus}'
  AND created_by='00000000-0000-0000-0000-000000000003' AND created_by_email='admin@example.test'
  FROM public.promo_codes), 'code normalised, pro merged into plus, creator recorded from the session');
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('Launch20',10,'{pro}',5,now(),now()+interval '1 day')$q$, 'duplicate key%');
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('BADPCT',150,'{pro}',5,now(),now()+interval '1 day')$q$, '%promo_codes_discount_range%');
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('BADPLAN',10,'{free}',5,now(),now()+interval '1 day')$q$, '%promo_codes_plans_valid%');
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('BADDATES',10,'{pro}',5,now(),now()-interval '1 day')$q$, '%promo_codes_validity_order%');
INSERT INTO public.promo_codes (code,discount_percent,applicable_plans,max_redemptions,valid_from,valid_until)
  VALUES ('LATER',15,'{enterprise}',5,now()+interval '5 days',now()+interval '10 days');
UPDATE public.promo_codes SET created_by = NULL, created_by_email = 'x' WHERE code = 'LAUNCH20';
SELECT pg_temp.assert_true((SELECT created_by_email='admin@example.test' FROM public.promo_codes WHERE code='LAUNCH20'), 'authorship is immutable');
SELECT pg_temp.assert_true((SELECT count(*) >= 3 FROM public.billing_admin_events WHERE action LIKE 'promo_code_%'), 'admin changes are audited');

-- Owners redeem through the RPC only.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.promo_codes), 'owners cannot read codes');
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('launch20','10000000-0000-0000-0000-000000000002','pro')$q$, 'You can only use promo codes for your own shop%');
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('launch20','10000000-0000-0000-0000-000000000001','enterprise')$q$, '%does not apply to the selected plan%');
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('later','10000000-0000-0000-0000-000000000001','enterprise')$q$, '%not active yet%');
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('nope','10000000-0000-0000-0000-000000000001','pro')$q$, '%not valid%');
SELECT pg_temp.assert_true((SELECT (public.redeem_promo_code(' launch20','10000000-0000-0000-0000-000000000001','pro')->>'discount_percent')::numeric = 20), 'owner redeems');
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('LAUNCH20','10000000-0000-0000-0000-000000000001','pro')$q$, '%already used this promo code%');
SELECT pg_temp.expect_error($q$INSERT INTO public.promo_code_redemptions (promo_code_id,shop_id,user_id,plan,discount_percent)
  SELECT id,'10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','pro',100 FROM public.promo_codes$q$, 'permission denied%');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.promo_code_redemptions), 'owner sees own redemption');
SELECT pg_temp.assert_true((SELECT plan = 'plus' FROM public.promo_code_redemptions), 'legacy pro subscriber redeems as plus');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('LAUNCH20','10000000-0000-0000-0000-000000000002','pro')$q$, '%reached its usage limit%');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.promo_code_redemptions), 'other owners cannot see redemptions');

-- Admin views usage, cannot drop the limit below usage or delete a used code, can deactivate.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
SELECT pg_temp.assert_true((SELECT (e->>'redemption_count')::int = 1 FROM jsonb_array_elements(public.admin_list_promo_codes()) e WHERE e->>'code'='LAUNCH20'), 'list includes usage count');
SELECT pg_temp.assert_true((SELECT u->>'shop_name' = 'Free Cafe' AND u->>'owner_email' IS NOT NULL AND u->>'plan' = 'plus'
  FROM jsonb_array_elements(public.admin_list_promo_code_usage((SELECT id FROM public.promo_codes WHERE code='LAUNCH20'))) u), 'usage lists the shop');
SELECT pg_temp.expect_error($q$UPDATE public.promo_codes SET max_redemptions = 0 WHERE code='LAUNCH20'$q$, '%already used by 1 shops%');
SELECT pg_temp.expect_error($q$DELETE FROM public.promo_codes WHERE code='LAUNCH20'$q$, '%violates RESTRICT setting%');
UPDATE public.promo_codes SET is_active = false, max_redemptions = 2 WHERE code = 'LAUNCH20';
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
SELECT pg_temp.expect_error($q$SELECT public.redeem_promo_code('LAUNCH20','10000000-0000-0000-0000-000000000002','pro')$q$, '%not valid%');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
DELETE FROM public.promo_codes WHERE code = 'LATER';
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.promo_codes), 'unused code deleted');
RESET ROLE;
\echo 'Promo code authorization, validation, redemption, usage, and audit checks passed.'
