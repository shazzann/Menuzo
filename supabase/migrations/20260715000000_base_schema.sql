-- The original migrations altered tables from a hosted schema. These prerequisites
-- let the same migration sequence also run against a fresh local database.
BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_plan text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  subscription_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  username text,
  tagline text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  banner text DEFAULT '',
  location text DEFAULT '',
  contact_number text DEFAULT '',
  contacts jsonb DEFAULT '[]'::jsonb,
  email text DEFAULT '',
  is_open boolean DEFAULT true,
  instagram text DEFAULT '',
  facebook text DEFAULT '',
  website text DEFAULT '',
  category_order text[] DEFAULT ARRAY[]::text[],
  theme jsonb DEFAULT '{}'::jsonb,
  view_count integer DEFAULT 0,
  qr_scan_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  tagline text DEFAULT '',
  category text DEFAULT 'unassigned',
  image text DEFAULT '',
  original_price numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  final_price numeric NOT NULL DEFAULT 0,
  is_special_offer boolean DEFAULT false,
  is_available boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  date date NOT NULL,
  views integer NOT NULL DEFAULT 0,
  qr_scans integer NOT NULL DEFAULT 0,
  CONSTRAINT shop_daily_stats_shop_date_key UNIQUE (shop_id, date)
);

CREATE INDEX IF NOT EXISTS shops_user_id_idx ON public.shops(user_id);
CREATE INDEX IF NOT EXISTS food_items_shop_id_idx ON public.food_items(shop_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_daily_stats ENABLE ROW LEVEL SECURITY;

-- The policies here and in the following migrations filter access to these tables.
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.shops, public.food_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shops, public.food_items TO authenticated;
GRANT SELECT ON public.shop_daily_stats TO authenticated;
GRANT ALL ON public.profiles, public.shops, public.food_items, public.shop_daily_stats TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'shop_daily_stats' AND policyname = 'Owners can read daily shop statistics'
  ) THEN
    CREATE POLICY "Owners can read daily shop statistics"
      ON public.shop_daily_stats FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.user_id = (SELECT auth.uid())
      ));
  END IF;
END;
$$;

-- Existing public menu visit tracking. Clients cannot set arbitrary totals or
-- use this function to read private data; only open shops are counted.
CREATE OR REPLACE FUNCTION public.increment_shop_visits(p_shop_id uuid, p_is_qr boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_qr integer := CASE WHEN p_is_qr THEN 1 ELSE 0 END;
BEGIN
  UPDATE public.shops
    SET view_count = coalesce(view_count, 0) + 1,
        qr_scan_count = coalesce(qr_scan_count, 0) + v_qr
    WHERE id = p_shop_id AND is_open = true;
  IF NOT FOUND THEN RETURN; END IF;

  INSERT INTO public.shop_daily_stats (shop_id, date, views, qr_scans)
    VALUES (p_shop_id, (now() AT TIME ZONE 'Asia/Colombo')::date, 1, v_qr)
    ON CONFLICT (shop_id, date) DO UPDATE
      SET views = shop_daily_stats.views + 1,
          qr_scans = shop_daily_stats.qr_scans + v_qr;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_shop_visits(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_shop_visits(uuid, boolean) TO anon, authenticated, service_role;

COMMIT;
