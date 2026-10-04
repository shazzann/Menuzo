\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database()<>'menuzo_analytics_test' THEN RAISE EXCEPTION 'Use a disposable menuzo_analytics_test database.'; END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
CREATE TABLE public.shops(id uuid PRIMARY KEY,user_id uuid NOT NULL,is_open boolean DEFAULT true,view_count int DEFAULT 0,qr_scan_count int DEFAULT 0);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.shops TO anon,authenticated;
CREATE POLICY visible_shops ON public.shops FOR SELECT USING(is_open OR user_id=auth.uid());
CREATE TABLE public.shop_daily_stats(id uuid DEFAULT gen_random_uuid(),shop_id uuid REFERENCES public.shops(id),date date,views int DEFAULT 0,qr_scans int DEFAULT 0,UNIQUE(shop_id,date));
-- Reproduce production: RLS enabled, grants present, but no policies.
ALTER TABLE public.shop_daily_stats ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.shop_daily_stats TO anon,authenticated;
INSERT INTO public.shops(id,user_id) VALUES
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002');
INSERT INTO public.shop_daily_stats(shop_id,date,views,qr_scans) VALUES
 ('10000000-0000-0000-0000-000000000001',(now() AT TIME ZONE 'Asia/Colombo')::date-2,7,2),
 ('10000000-0000-0000-0000-000000000002',(now() AT TIME ZONE 'Asia/Colombo')::date,99,20);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.shop_daily_stats) THEN RAISE EXCEPTION 'Expected unreadable stats before repair.'; END IF; END $$;
RESET ROLE;
\ir ../supabase/migrations/20261004000002_shop_analytics_access.sql
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub','',false);
SELECT public.increment_shop_visits('10000000-0000-0000-0000-000000000001',false);
SELECT public.increment_shop_visits('10000000-0000-0000-0000-000000000001',true);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.shop_daily_stats) THEN RAISE EXCEPTION 'Anonymous can read private analytics.'; END IF; END $$;
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
DO $$ BEGIN
 IF (SELECT sum(views) FROM public.shop_daily_stats)<>9 THEN RAISE EXCEPTION 'Owner weekly graph total incorrect.'; END IF;
 IF (SELECT sum(qr_scans) FROM public.shop_daily_stats)<>3 THEN RAISE EXCEPTION 'Owner QR total incorrect.'; END IF;
 IF EXISTS(SELECT 1 FROM public.shop_daily_stats WHERE shop_id<>'10000000-0000-0000-0000-000000000001') THEN RAISE EXCEPTION 'Another owner statistics leaked.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.shop_daily_stats WHERE date=(now() AT TIME ZONE 'Asia/Colombo')::date AND views=2 AND qr_scans=1) THEN RAISE EXCEPTION 'Visit reporting date or counts incorrect.'; END IF;
 BEGIN UPDATE public.shop_daily_stats SET views=1000; RAISE EXCEPTION 'Owner can forge visits.'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
DO $$ BEGIN IF (SELECT sum(views) FROM public.shop_daily_stats)<>99 THEN RAISE EXCEPTION 'Second owner statistics incorrect.'; END IF; END $$;
RESET ROLE;
UPDATE public.shops SET is_open=false WHERE id='10000000-0000-0000-0000-000000000001';
SET ROLE anon;
SELECT public.increment_shop_visits('10000000-0000-0000-0000-000000000001',true);
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.shops WHERE id='10000000-0000-0000-0000-000000000001' AND view_count=2 AND qr_scan_count=1) THEN RAISE EXCEPTION 'Closed shop visit was counted.'; END IF;
END $$;
\echo 'Owner graph data, private access, reporting dates and public visit tracking passed.'
