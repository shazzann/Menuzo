-- Checks 20261129000001_custom_plans.sql against the production schema.
-- Run ONLY in a disposable database loaded with Supabase stand-ins and the production
-- schema dump (supabase/production/schema.sql), never against production itself:
--   psql -v ON_ERROR_STOP=1 -d <scratch db> -f tests/custom-plans-db.sql
\set ON_ERROR_STOP on

CREATE FUNCTION pg_temp.assert_true(p_result boolean, p_message text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  IF p_result IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', p_message; END IF;
END $$;
CREATE FUNCTION pg_temp.expect_error(p_statement text, p_message_pattern text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
  BEGIN
    EXECUTE p_statement;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE p_message_pattern THEN
      RAISE EXCEPTION 'Expected %, got %', p_message_pattern, SQLERRM;
    END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'Statement unexpectedly succeeded: %', p_statement;
END $$;
CREATE FUNCTION pg_temp.as_user(p_id text) RETURNS void LANGUAGE sql AS $$
  SELECT set_config('request.jwt.claim.sub', p_id, false), set_config('request.jwt.claim.role', 'authenticated', false);
$$;

-- Production-like data. 1: Plus owner, 2: legacy 'pro' owner, 3: Free owner, 9: company admin.
INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'plus@example.test', now()),
  ('00000000-0000-0000-0000-000000000002', 'pro@example.test', now()),
  ('00000000-0000-0000-0000-000000000003', 'free@example.test', now()),
  ('00000000-0000-0000-0000-000000000009', 'admin@example.test', now());
INSERT INTO public.profiles (id, email, subscription_plan, subscription_status, subscription_expires_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'plus@example.test', 'plus', 'active', now() + interval '20 days'),
  ('00000000-0000-0000-0000-000000000002', 'pro@example.test', 'pro', 'active', now() + interval '20 days'),
  ('00000000-0000-0000-0000-000000000003', 'free@example.test', 'free', 'active', NULL),
  ('00000000-0000-0000-0000-000000000009', 'admin@example.test', 'free', 'active', NULL);
INSERT INTO public.admins (id, email, is_active) VALUES ('00000000-0000-0000-0000-000000000009', 'admin@example.test', true);
INSERT INTO public.shops (id, user_id, name, username) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Plus Cafe', 'plus-cafe'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Pro Cafe', 'pro-cafe'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Free Cafe', 'free-cafe');
INSERT INTO public.billing_periods (id, label, months, amount, currency, active) VALUES
  ('monthly', 'Monthly', 1, 3500, 'LKR', true), ('yearly', 'Yearly', 12, 33600, 'LKR', true)
  ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, currency = EXCLUDED.currency, active = true;
INSERT INTO public.plan_prices (plan_slug, period_id, amount, currency) VALUES
  ('plus', 'monthly', 3500, 'LKR'), ('plus', 'yearly', 33600, 'LKR'),
  ('enterprise', 'monthly', 6000, 'LKR'), ('enterprise', 'yearly', 65000, 'LKR');
INSERT INTO public.bank_transfer_settings (id, bank_name, account_name, account_number, branch, whatsapp_number, enabled)
  VALUES (true, 'Test Bank', 'Test Account', '000000', 'Test Branch', '94770000000', true)
  ON CONFLICT (id) DO UPDATE SET enabled = true, bank_name = 'Test Bank', account_name = 'Test Account',
    account_number = '000000', branch = 'Test Branch', whatsapp_number = '94770000000';
-- Whatever production's subscription_plans holds today, including an old 'pro' row.
INSERT INTO public.subscription_plans (name, slug, max_items, max_categories, features) VALUES
  ('Free', 'free', 10, 2, '{"legacy": true}'), ('Pro', 'pro', 100, 20, '{}'), ('Plus', 'plus', 100, 20, '{}');

-- The bug this fixes: production treats a shop approved on 'plus' as Free.
SELECT pg_temp.assert_true(NOT public.shop_has_paid_access('10000000-0000-0000-0000-000000000001'), 'before: Plus shop is treated as Free (known bug)');

\ir ../supabase/migrations/20261129000001_custom_plans.sql

-- Seeded plans.
SELECT pg_temp.assert_true((SELECT count(*) = 3 FROM public.subscription_plans WHERE slug IN ('free','plus','enterprise') AND is_active AND is_public), 'free, plus, enterprise seeded and public');
SELECT pg_temp.assert_true((SELECT NOT is_active AND NOT is_public FROM public.subscription_plans WHERE slug = 'pro'), 'legacy pro row retired and hidden');
SELECT pg_temp.assert_true((SELECT max_items = 500 AND max_categories = 50 AND has_all_features AND monthly_price = 6000 AND annual_price = 65000
  FROM public.subscription_plans WHERE slug = 'enterprise'), 'enterprise limits, features and synced prices');
SELECT pg_temp.assert_true((SELECT has_custom_url AND has_custom_themes AND NOT has_priority_support FROM public.subscription_plans WHERE slug = 'plus'), 'plus features');

-- Paid access now follows the plan table; the Plus bug is gone and 'pro' still counts as Plus.
SELECT pg_temp.assert_true(public.shop_has_paid_access('10000000-0000-0000-0000-000000000001'), 'after: Plus shop has paid access');
SELECT pg_temp.assert_true(public.shop_has_paid_access('10000000-0000-0000-0000-000000000002'), 'legacy pro shop has paid access');
SELECT pg_temp.assert_true(NOT public.shop_has_paid_access('10000000-0000-0000-0000-000000000003'), 'free shop has no paid access');
SELECT pg_temp.assert_true(public.is_paid_plan('pro') AND public.is_paid_plan('PLUS') AND NOT public.is_paid_plan('free') AND NOT public.is_paid_plan('nonexistent') AND NOT public.is_paid_plan(NULL), 'is_paid_plan');
SELECT pg_temp.assert_true(public.plan_has_feature('pro', 'custom_url') AND NOT public.plan_has_feature('free', 'custom_url') AND NOT public.plan_has_feature('plus', 'bogus'), 'plan_has_feature');

-- Anyone may read plans, nobody but the RPC may write them.
SET ROLE anon;
SELECT pg_temp.assert_true((SELECT count(*) >= 3 FROM public.subscription_plans), 'anon reads plans');
SELECT pg_temp.expect_error($q$SELECT public.admin_list_plans()$q$, 'permission denied%');
RESET ROLE;

SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_error($q$UPDATE public.subscription_plans SET max_items = 99999$q$, 'permission denied%');
SELECT pg_temp.expect_error($q$SELECT public.admin_list_plans()$q$, 'Company admin access required%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"x"}'::jsonb, true)$q$, 'Company admin access required%');

-- Free menu limits come from the Free plan row: 10 items, 2 categories.
INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  SELECT '10000000-0000-0000-0000-000000000003', 'Item ' || g, 100, 100, CASE WHEN g <= 5 THEN 'Mains' ELSE 'Drinks' END FROM generate_series(1, 10) g;
SELECT pg_temp.expect_error($q$INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  VALUES ('10000000-0000-0000-0000-000000000003', 'Eleventh', 100, 100, 'Mains')$q$, 'The Free plan allows up to 10 menu items%');
RESET ROLE;
DELETE FROM public.food_items WHERE shop_id = '10000000-0000-0000-0000-000000000003' AND name = 'Item 10';
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_error($q$INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  VALUES ('10000000-0000-0000-0000-000000000003', 'Dessert', 100, 100, 'Desserts')$q$, 'The Free plan allows up to 2 categories%');
RESET ROLE;

-- Admin creates a custom plan.
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000009');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"Bad Slug","name":"X","max_items":5,"max_categories":1,"prices":{"monthly":1,"yearly":1}}'::jsonb, true)$q$, 'Use a plan ID%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"plus","name":"Again","max_items":5,"max_categories":1,"prices":{"monthly":1,"yearly":1}}'::jsonb, true)$q$, 'A plan with the ID "plus" already exists%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"business","name":"Business","max_items":250,"max_categories":30}'::jsonb, true)$q$, 'Enter a monthly and a yearly price%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"business","name":"Business","max_items":0,"max_categories":30,"prices":{"monthly":4800,"yearly":48000}}'::jsonb, true)$q$, 'Set a food item limit%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"business","name":"Business","max_items":"lots","max_categories":30,"prices":{"monthly":4800,"yearly":48000}}'::jsonb, true)$q$, 'Check the plan details%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"business","name":"Business","max_items":250,"max_categories":30,"prices":{"monthly":4800.555,"yearly":48000}}'::jsonb, true)$q$, 'Enter prices above zero%');
SELECT pg_temp.expect_error($q$SELECT public.admin_save_plan('{"slug":"nope","name":"Nope","max_items":5,"max_categories":1}'::jsonb, false)$q$, 'That plan no longer exists%');
SELECT pg_temp.assert_true((SELECT (p->>'slug') = 'business' AND (p->'prices'->'monthly'->>'amount')::numeric = 4800
    AND (p->'features'->>'custom_url')::boolean AND NOT (p->'features'->>'custom_themes')::boolean
    AND (p->>'max_items')::int = 250 AND (p->'highlights'->>0) = '250 Food Items' AND jsonb_array_length(p->'highlights') = 2
  FROM public.admin_save_plan('{"slug":" Business ","name":" Business ","description":"For busy cafes","highlights":["250 Food Items","  ","Custom URL"],
    "max_items":250,"max_categories":30,"sort_order":15,"features":{"custom_url":true,"qr_branding":true},
    "prices":{"monthly":"4800","yearly":48000}}'::jsonb, true) p), 'admin creates Business with trimmed copy, limits, features and prices');
SELECT pg_temp.assert_true((SELECT jsonb_array_length(public.admin_list_plans()) = 4), 'admin list shows free, plus, business, enterprise (not pro)');
SELECT pg_temp.assert_true((SELECT (public.admin_list_plans()->3->>'slug') = 'enterprise' AND (public.admin_list_plans()->2->>'slug') = 'business'), 'admin list is in display order');
RESET ROLE;

-- An owner buys Business at its own price; approval activates exactly that plan.
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000003','monthly','Test Payer','BIZ-REF-1',current_date,3500,'LKR',1,NULL,NULL,'business')$q$, 'Pricing changed%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000003','monthly','Test Payer','BIZ-REF-1',current_date,4800,'LKR',1,NULL,NULL,'free')$q$, 'This plan is not available to buy%');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000003','monthly','Test Payer','BIZ-REF-1',current_date,4800,'LKR',1,NULL,NULL,'pro')$q$, 'Pricing changed%');
SELECT pg_temp.assert_true((SELECT amount = 4800 AND plan_slug = 'business' AND status = 'pending'
  FROM public.submit_payment_request('10000000-0000-0000-0000-000000000003','monthly','Test Payer','BIZ-REF-1',current_date,4800,'LKR',1,NULL,NULL,'business')),
  'Business request records the Business price and plan');
RESET ROLE;
SELECT id AS biz_request FROM public.billing_payment_requests WHERE transfer_reference = 'BIZ-REF-1' \gset
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000009');
SELECT public.admin_review_billing_payment(:'biz_request', 'approved', NULL, NULL, true);
RESET ROLE;
SELECT pg_temp.assert_true((SELECT subscription_plan = 'business' AND subscription_status = 'active' AND subscription_expires_at > now() + interval '25 days'
  FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000003'), 'approval activates Business');
SELECT pg_temp.assert_true(public.shop_has_paid_access('10000000-0000-0000-0000-000000000003'), 'Business shop has paid access');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.plan_hidden_food_item_ids('10000000-0000-0000-0000-000000000003')), 'a paid Business shop has no hidden items');

-- Business limits apply: categories now allowed up to 30, items up to 250.
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  VALUES ('10000000-0000-0000-0000-000000000003', 'Dessert', 100, 100, 'Desserts');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT count(*) = 10 FROM public.food_items WHERE shop_id = '10000000-0000-0000-0000-000000000003'), 'Business shop added an item in a third category');

-- Features: Business has a custom URL but not custom themes.
INSERT INTO public.shop_custom_urls (shop_id, slug) VALUES ('10000000-0000-0000-0000-000000000003', 'biz-cafe');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.resolve_menu_shop('biz-cafe')), 'custom URL resolves for a plan with custom_url');
INSERT INTO public.shop_themes (slug, name, primary_color, secondary_color, accent_color, is_premium)
  VALUES ('premium-test', 'Premium Test', '#111111', '#222222', '#333333', true);
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_error($q$UPDATE public.shops SET theme = '{"primary":"#111111","secondary":"#222222","accent":"#333333"}'
  WHERE id = '10000000-0000-0000-0000-000000000003'$q$, 'This is a premium theme%');
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000001');
UPDATE public.shops SET theme = '{"primary":"#111111","secondary":"#222222","accent":"#333333"}' WHERE id = '10000000-0000-0000-0000-000000000001';
RESET ROLE;
SELECT pg_temp.assert_true((SELECT theme->>'primary' = '#111111' FROM public.shops WHERE id = '10000000-0000-0000-0000-000000000001'), 'Plus shop may use a premium theme');

-- Admin screens see the Business shop as paid.
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000009');
SELECT pg_temp.assert_true((SELECT (public.admin_get_shop_billing('10000000-0000-0000-0000-000000000003')->'shop'->>'pro_active')::boolean), 'admin shop billing shows Business as active');
SELECT pg_temp.assert_true((SELECT (public.admin_list_plans()->2->>'active_shops')::int = 1 AND (public.admin_list_plans()->2->>'slug') = 'business'), 'Business counts one active shop');

-- Retiring Business stops new purchases but keeps the shop's access.
SELECT public.admin_save_plan('{"slug":"business","name":"Business","max_items":250,"max_categories":30,"sort_order":15,"is_active":false,"features":{"custom_url":true}}'::jsonb, false);
SELECT pg_temp.assert_true((SELECT amount = 4800 FROM public.plan_prices WHERE plan_slug = 'business' AND period_id = 'monthly'), 'editing without prices keeps prices');
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_error($q$SELECT public.submit_payment_request('10000000-0000-0000-0000-000000000003','monthly','Test Payer','BIZ-REF-2',current_date,4800,'LKR',1,NULL,NULL,'business')$q$, 'This plan is not available to buy%');
RESET ROLE;
SELECT pg_temp.assert_true(public.shop_has_paid_access('10000000-0000-0000-0000-000000000003'), 'retired plan keeps access for current shops');

-- Free can be edited (limits) but not retired or priced.
SET ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-000000000009');
SELECT pg_temp.assert_true((SELECT (p->>'is_active')::boolean AND (p->>'max_items')::int = 12 AND p->'prices' = '{}'::jsonb
  FROM public.admin_save_plan('{"slug":"free","name":"Free","max_items":12,"max_categories":2,"is_active":false,"prices":{"monthly":1,"yearly":1}}'::jsonb, false) p),
  'Free stays active and unpriced');
RESET ROLE;
-- The Free listing now reads the Free row. Mains (11 items) and Desserts (1) are the first two
-- categories; the old hardcoded limit would show 10 of those 12 items, the edited Free limit shows all 12.
SELECT set_config('request.jwt.claim.role', '', false);
UPDATE public.profiles SET subscription_plan = 'free', subscription_expires_at = NULL WHERE id = '00000000-0000-0000-0000-000000000003';
DELETE FROM public.food_items WHERE shop_id = '10000000-0000-0000-0000-000000000003' AND category = 'Drinks';
INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  SELECT '10000000-0000-0000-0000-000000000003', 'Main ' || g, 100, 100, 'Mains' FROM generate_series(1, 6) g;
INSERT INTO public.food_items (shop_id, name, original_price, final_price, category)
  VALUES ('10000000-0000-0000-0000-000000000003', 'Late drink', 100, 100, 'Drinks');
UPDATE public.shops SET category_order = ARRAY['Mains', 'Desserts', 'Drinks'] WHERE id = '10000000-0000-0000-0000-000000000003';
SELECT pg_temp.assert_true((SELECT count(*) = 11 FROM public.food_items WHERE shop_id = '10000000-0000-0000-0000-000000000003' AND category = 'Mains'), 'fixture: 11 Mains');
SELECT pg_temp.assert_true((SELECT count(*) = 12 FROM public.free_plan_listed_food_item_ids('10000000-0000-0000-0000-000000000003')),
  'Free listing uses the edited 12-item limit within the first 2 categories');
SELECT pg_temp.assert_true(NOT EXISTS (SELECT 1 FROM public.free_plan_listed_food_item_ids('10000000-0000-0000-0000-000000000003') i
  JOIN public.food_items f ON f.id = i WHERE f.category = 'Drinks'), 'a third category stays hidden on Free');

\echo 'Custom plan checks passed.'
