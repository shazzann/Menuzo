-- Modify the username update trigger to allow admins to change it
CREATE OR REPLACE FUNCTION public.prevent_username_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin boolean;
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    -- Check if caller is an admin
    SELECT true INTO v_is_admin FROM public.admins WHERE id = auth.uid() AND is_active = true;
    
    -- Block if not admin and not setting it for the first time
    IF v_is_admin IS NULL OR NOT v_is_admin THEN
      IF OLD.username IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot update username directly. Contact support.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
