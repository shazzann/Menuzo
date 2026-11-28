-- "Sold out for today": an item stays hidden from customers until this time, then
-- returns on its own (no scheduled job). The app sets it to the shop's next opening
-- time. is_available = false remains the "unavailable until turned back on" switch.
BEGIN;
ALTER TABLE public.food_items ADD COLUMN IF NOT EXISTS unavailable_until timestamptz;
COMMENT ON COLUMN public.food_items.unavailable_until IS
  'Item is unavailable until this time (e.g. sold out for today); NULL or a past time means no temporary hold.';
COMMIT;
