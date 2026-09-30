-- Run against the local Supabase database after `supabase start`.
-- All fixtures are rolled back; no customer or payment data is retained.
\set ON_ERROR_STOP on
BEGIN;

SELECT gen_random_uuid() AS smoke_user_id, gen_random_uuid() AS smoke_shop_id \gset
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (:'smoke_user_id', 'migration-smoke@example.test', '{"username":"migration-smoke"}'::jsonb);

SELECT set_config('request.jwt.claim.sub', :'smoke_user_id', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
      AND subscription_plan = 'free' AND subscription_status = 'active' AND role = 'user'
  ) THEN RAISE EXCEPTION 'Signup did not create a Free profile.'; END IF;
END $$;

INSERT INTO public.shops (id, user_id, name, username)
VALUES (:'smoke_shop_id', :'smoke_user_id', 'Migration smoke cafe', 'smoke-' || :'smoke_shop_id');
INSERT INTO public.food_items (shop_id, name, original_price, final_price)
VALUES (:'smoke_shop_id', 'Smoke test item', 100, 100);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE user_id = auth.uid() AND opening_hours = '[]'::jsonb) THEN
    RAISE EXCEPTION 'Opening hours did not default to the app schedule array.';
  END IF;
  IF (SELECT count(*) FROM public.billing_periods WHERE active AND amount IS NULL) <> 2 THEN
    RAISE EXCEPTION 'Monthly and yearly placeholder prices are missing.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.bank_transfer_settings WHERE NOT enabled) THEN
    RAISE EXCEPTION 'Unconfigured bank payments must stay disabled.';
  END IF;
END $$;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claim.role', 'anon', true);
SELECT public.increment_shop_visits(:'smoke_shop_id', false);
SELECT public.increment_shop_visits(:'smoke_shop_id', true);

SELECT set_config('request.jwt.claim.sub', :'smoke_user_id', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.shop_daily_stats WHERE views = 2 AND qr_scans = 1) THEN
    RAISE EXCEPTION 'Public visits were not counted or owner statistics are unreadable.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE user_id = auth.uid() AND view_count = 2 AND qr_scan_count = 1) THEN
    RAISE EXCEPTION 'Shop totals were not updated.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.shops s CROSS JOIN LATERAL public.resolve_menu_shop(s.username) r
    WHERE s.user_id = auth.uid() AND r.id = s.id
  ) THEN RAISE EXCEPTION 'The permanent menu URL could not be resolved.'; END IF;
END $$;

ROLLBACK;
\echo 'Full local schema smoke checks passed; test fixtures rolled back.'
