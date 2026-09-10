-- Create the admins table for company admin users
-- This table is separate from profiles (which is for shop owners/customers)

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'admin')),
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure columns exist in case the table was previously created with a different schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admins' AND column_name='is_active') THEN
        ALTER TABLE public.admins ADD COLUMN is_active boolean NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admins' AND column_name='display_name') THEN
        ALTER TABLE public.admins ADD COLUMN display_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admins' AND column_name='role') THEN
        ALTER TABLE public.admins ADD COLUMN role text NOT NULL DEFAULT 'super_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admins' AND column_name='created_at') THEN
        ALTER TABLE public.admins ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admins' AND column_name='updated_at') THEN
        ALTER TABLE public.admins ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
END $$;

-- RLS: Only admins can view admin records (prevent any client from reading this table)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their own record
CREATE POLICY "Admins can view own record"
  ON public.admins FOR SELECT
  USING (auth.uid() = id);

-- Only super_admin can view all admin records (for future multi-admin management)
CREATE POLICY "Super admins can view all admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role = 'super_admin')
  );

-- No public insert — admins are only added via Supabase dashboard or migrations
-- This prevents any client from creating admin accounts

-- Admin-level RLS policies for existing tables
-- These allow admins to read ALL shops and profiles (not just their own)

-- Allow admins to read all shops
CREATE POLICY "Admins can view all shops"
  ON public.shops FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Allow admins to update any shop (for suspend, reinstate, url change, etc.)
CREATE POLICY "Admins can update all shops"
  ON public.shops FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Allow admins to update any profile (for subscription management)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Allow admins to read all food items (for menu inspection)
CREATE POLICY "Admins can view all food items"
  ON public.food_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );



-- Updated_at trigger for admins table
CREATE OR REPLACE FUNCTION public.update_admins_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_admins_updated_at();

-- NOTE: To create your first super admin, run this in the Supabase dashboard:
-- First create the user via Supabase Auth dashboard or sign them up normally.
-- Then insert their admin record:
--
-- INSERT INTO public.admins (id, email, role, display_name)
-- VALUES ('<auth.users.id>', 'your-admin@email.com', 'super_admin', 'Super Admin');
