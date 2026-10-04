import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/store';
import { RestaurantService, MenuService } from '@/services';
import { isPublicShopView, parseShopRoute } from '@/lib/shopRoutes';
import { formatShop, formatFood } from '@/lib/shopData';

export function PublicDataLoader() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const route = parseShopRoute(location.pathname);
  const slug = isPublicShopView(state.currentView) && isPublicShopView(route.view) ? route.slug : undefined;
  const version = state.shopLoadVersion;
  const foodId = route.foodId;
  const latestState = useRef(state);
  useEffect(() => { latestState.current = state; }, [state]);
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const context = `public:${slug}`;
    const cached = latestState.current;
    if (cached.shopDataContext === context && cached.shopDataStatus === 'ready') {
      // A food/detail URL in the same shop only changes the selection. Reloading
      // here cleared filters and unmounted the menu on every round trip.
      if (foodId && cached.selectedFoodItem?.id !== foodId) {
        dispatch({ type: 'SELECT_FOOD_ITEM', payload: cached.foodItems.find(item => item.id === foodId) || null });
      }
      return;
    }
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      dispatch({ type: 'SHOP_LOAD_START', payload: context });
      try {
        const row = await RestaurantService.getRestaurantByUsername(slug);
        if (cancelled) return;
        if (!row) {
          dispatch({ type: 'SHOP_LOAD_ERROR', payload: { context, message: '', notFound: true } });
          return;
        }
        const food = await MenuService.getMenuByShopId(row.id);
        if (cancelled) return;
        dispatch({ type: 'SHOP_LOAD_SUCCESS', payload: { context, shop: formatShop(row, slug), food: formatFood(food || []), selectedFoodId: foodId } });
      } catch {
        if (!cancelled) dispatch({ type: 'SHOP_LOAD_ERROR', payload: { context, message: 'This menu could not be loaded. Please try again.' } });
      }
    });
    return () => { cancelled = true; };
  }, [slug, foodId, version, dispatch]);
  return null;
}
