import { useEffect } from 'react';
import { useApp } from '@/store';
import { RestaurantService, MenuService } from '@/services';
import { isOwnerShopView } from '@/lib/shopRoutes';
import { formatShop, formatFood } from '@/lib/shopData';
import { CompanyBillingService } from '@/services/company-billing.service';

export function AdminDataLoader() {
  const { state, dispatch } = useApp();
  const userId = state.user?.id;
  const active = isOwnerShopView(state.currentView) || state.currentView === 'onboarding';
  const version = state.shopLoadVersion;
  useEffect(() => {
    if (state.currentView === 'onboarding' && userId && state.shopDataContext === `owner:${userId}` && state.shopDataStatus === 'ready') {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
    }
  }, [state.currentView, userId, state.shopDataContext, state.shopDataStatus, dispatch]);
  useEffect(() => {
    if (!active || !userId) return;
    let cancelled = false;
    const context = `owner:${userId}`;
    // Defer until setup completes so StrictMode cleanup can cancel the first load.
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      dispatch({ type: 'SHOP_LOAD_START', payload: context });
      try {
        const row = await RestaurantService.getRestaurantByUserId(userId);
        if (cancelled) return;
        if (!row) {
          const admin = await CompanyBillingService.isAdmin();
          if (cancelled) return;
          if (admin) {
            dispatch({ type: 'SET_VIEW', payload: 'company-admin' });
            return;
          }
          dispatch({ type: 'SHOP_LOAD_ERROR', payload: { context, message: 'Create your shop to continue.', notFound: true } });
          dispatch({ type: 'SET_VIEW', payload: 'onboarding' });
          return;
        }
        const [food, stats] = await Promise.all([
          MenuService.getMenuByShopId(row.id),
          RestaurantService.getShopDailyStats(row.id).catch(() => undefined),
        ]);
        if (cancelled) return;
        dispatch({ type: 'SHOP_LOAD_SUCCESS', payload: { context,
          shop: { ...formatShop(row), daily_stats: stats ?? undefined }, food: formatFood(food || []) } });
      } catch {
        if (!cancelled) dispatch({ type: 'SHOP_LOAD_ERROR', payload: { context, message: 'Your shop details could not be loaded. Please try again.' } });
      }
    });
    return () => { cancelled = true; };
  }, [active, userId, version, dispatch]);
  return null;
}
