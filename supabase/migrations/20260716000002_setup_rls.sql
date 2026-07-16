-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

--------------------------------------------------
-- PROFILES POLICIES
--------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile, but cannot modify role/subscription/billing
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    subscription_plan = (SELECT subscription_plan FROM public.profiles WHERE id = auth.uid()) AND
    subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
  );

--------------------------------------------------
-- SHOPS POLICIES
--------------------------------------------------
-- Owners can manage their own shop
CREATE POLICY "Shop owners can manage their own shop" 
  ON public.shops FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view open shops
CREATE POLICY "Public can view open shops" 
  ON public.shops FOR SELECT 
  USING (is_open = true);

--------------------------------------------------
-- FOOD ITEMS POLICIES
--------------------------------------------------
-- Owners can manage their food items
CREATE POLICY "Shop owners can manage their food items" 
  ON public.food_items FOR ALL 
  USING (
    shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid())
  );

-- Public can view available food items for open shops
CREATE POLICY "Public can view available food items" 
  ON public.food_items FOR SELECT 
  USING (
    is_available = true AND 
    shop_id IN (SELECT id FROM public.shops WHERE is_open = true)
  );
