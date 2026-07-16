-- Ensure essential fields are not null
ALTER TABLE public.shops
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.food_items
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN original_price SET NOT NULL,
  ALTER COLUMN final_price SET NOT NULL,
  ALTER COLUMN shop_id SET NOT NULL;

-- Unique constraints
ALTER TABLE public.shops ADD CONSTRAINT unique_shop_username UNIQUE (username);

-- Price constraints (Prevent negative prices)
ALTER TABLE public.food_items
  ADD CONSTRAINT check_positive_original_price CHECK (original_price >= 0),
  ADD CONSTRAINT check_positive_final_price CHECK (final_price >= 0),
  ADD CONSTRAINT check_positive_discount CHECK (discount >= 0);

-- Trigger to prevent shop username modifications by normal users
CREATE OR REPLACE FUNCTION public.prevent_username_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    -- Allow bypass for super admins/system via specific role/metadata check if needed
    -- For now, completely block it unless it's setting it from NULL to a value
    IF OLD.username IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot update username directly. Contact support.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_shop_username_update ON public.shops;
CREATE TRIGGER prevent_shop_username_update
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.prevent_username_update();
