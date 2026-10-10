-- Shop owners sign up with Google only, and onboarding repairs a missing profile.
BEGIN;

-- A profile deleted by hand (which also cascades away its shops) is never
-- recreated by on_auth_user_created, so shop creation then fails on
-- shops_user_id_fkey. Onboarding calls this first to restore it.
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.profiles (id, email, username, role, subscription_plan, subscription_status, created_at, updated_at)
  SELECT u.id, u.email, u.raw_user_meta_data->>'username', 'user', 'free', 'active', now(), now()
  FROM auth.users u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;

-- Only Google-linked accounts may create a shop. Email/password sign-in stays
-- available to company admins, who never create shops.
DROP POLICY IF EXISTS "Users can create their shop" ON public.shops;
CREATE POLICY "Users can create their shop"
  ON public.shops FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND COALESCE((auth.jwt() -> 'app_metadata' -> 'providers') ? 'google', false)
  );

-- Restore profiles for any existing accounts that lost theirs.
INSERT INTO public.profiles (id, email, username, role, subscription_plan, subscription_status, created_at, updated_at)
SELECT u.id, u.email, u.raw_user_meta_data->>'username', 'user', 'free', 'active', now(), now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

COMMIT;
