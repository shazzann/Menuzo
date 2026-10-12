-- Theme directory shared by the company Theme Library and every shop owner's theme picker.
BEGIN;

CREATE TABLE IF NOT EXISTS public.shop_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  tagline text NOT NULL DEFAULT '' CHECK (length(tagline) <= 120),
  categories text[] NOT NULL DEFAULT '{}',
  primary_color text NOT NULL CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text NOT NULL CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text NOT NULL CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  is_premium boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_shop_themes_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shop_themes_updated_at ON public.shop_themes;
CREATE TRIGGER shop_themes_updated_at
  BEFORE UPDATE ON public.shop_themes
  FOR EACH ROW EXECUTE FUNCTION public.set_shop_themes_updated_at();

ALTER TABLE public.shop_themes ENABLE ROW LEVEL SECURITY;

-- Shop owners (and the public menu) read the directory; only company admins change it.
DROP POLICY IF EXISTS "Anyone can view shop themes" ON public.shop_themes;
CREATE POLICY "Anyone can view shop themes"
  ON public.shop_themes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Company admins manage shop themes" ON public.shop_themes;
CREATE POLICY "Company admins manage shop themes"
  ON public.shop_themes FOR ALL TO authenticated
  USING (public.is_company_billing_admin())
  WITH CHECK (public.is_company_billing_admin());

GRANT SELECT ON public.shop_themes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shop_themes TO authenticated;

-- How many shops currently use each theme's exact colours (admins only).
CREATE OR REPLACE FUNCTION public.admin_shop_theme_usage()
RETURNS TABLE (theme_id uuid, shop_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_company_billing_admin() THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT t.id, count(s.id)
    FROM public.shop_themes t
    LEFT JOIN public.shops s
      ON upper(s.theme->>'primary') = upper(t.primary_color)
     AND upper(s.theme->>'secondary') = upper(t.secondary_color)
     AND upper(s.theme->>'accent') = upper(t.accent_color)
    GROUP BY t.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_shop_theme_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_shop_theme_usage() TO authenticated;

-- Start with the themes shop owners already had in the app.
INSERT INTO public.shop_themes (slug, name, tagline, categories, primary_color, secondary_color, accent_color, is_premium, sort_order, created_by)
VALUES
  ('menuzo-signature', 'Menuzo Signature', 'Warm, bold, and energetic.', '{Burger,Grill,Modern}', '#090A0C', '#1C1E22', '#FB8500', false, 10, NULL),
  ('classic-elegance', 'Classic Elegance', 'Timeless sophistication for every table.', '{Bistro,Restaurant,"Fine Dining"}', '#1F2937', '#F9FAFB', '#D4AF37', false, 20, NULL),
  ('ocean-breeze', 'Ocean Breeze', 'Fresh, calm, and inviting coastal tones.', '{Seafood,Cafe}', '#0F4C5C', '#E8F4F8', '#3A9D9B', false, 30, NULL),
  ('forest-retreat', 'Forest Retreat', 'Natural shades with a refined organic touch.', '{Vegan,Healthy}', '#234E3F', '#F3F1E7', '#A3B18A', false, 40, NULL),
  ('urban-minimal', 'Urban Minimal', 'Clean modern design with crisp contrast.', '{Cafe,Modern}', '#374151', '#FFFFFF', '#9CA3AF', false, 50, NULL),
  ('warm-terracotta', 'Warm Terracotta', 'Earthy warmth for welcoming dining.', '{Italian,Bakery,Pizzeria}', '#A44A3F', '#FFF3E6', '#DDA15E', true, 60, NULL),
  ('midnight-luxe', 'Midnight Luxe', 'Bold contrast with premium character.', '{"Fine Dining",Bar}', '#111827', '#F3F4F6', '#C6A667', true, 70, NULL),
  ('golden-harvest', 'Golden Harvest', 'Warm, welcoming, and full of character.', '{Cafe,Breakfast,Brunch}', '#7C4A21', '#FFF8E7', '#D9A441', true, 80, NULL),
  ('rosewood-charm', 'Rosewood Charm', 'Rich tones with a gentle romantic touch.', '{Bistro,Desserts}', '#722F37', '#FFF5F2', '#C98C8C', true, 90, NULL),
  ('coastal-sand', 'Coastal Sand', 'Relaxed golden tones inspired by the shore.', '{Seafood,Beach}', '#2D6A73', '#FAF3E8', '#D9A441', true, 100, NULL),
  ('royal-plum', 'Royal Plum', 'Distinctive elegance and deep wine contrast.', '{Lounge,"Wine Bar",Cocktails}', '#4A2545', '#FCF7FA', '#B784A7', true, 110, NULL),
  ('olive-garden', 'Olive Garden', 'Organic simplicity and culinary natural warmth.', '{Mediterranean,Italian}', '#556B2F', '#F8F5EB', '#C2A878', true, 120, NULL),
  ('crimson-table', 'Crimson Table', 'Rich, expressive, and appetite-enticing.', '{Steakhouse,Restaurant}', '#8B2635', '#FFF8F0', '#D9A05B', true, 130, NULL)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
