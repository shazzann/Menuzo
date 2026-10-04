import { useEffect } from 'react';
import { useApp } from '@/store';
import { RestaurantService } from '@/services/restaurant.service';

// Both pages display the same store snapshot, refreshed without reloading the
// shop or resetting its menu, forms, and selected analytics range.
export function ShopAnalyticsDataLoader() {
  const { state, dispatch } = useApp();
  const userId = state.user?.id;
  const shopId = state.shop.id;
  const view = state.currentView;
  const active = (view === 'user-dashboard' || view === 'admin-analytics')
    && !!userId && !!shopId && state.shopDataStatus === 'ready'
    && state.shopDataContext === `owner:${userId}`;
  useEffect(() => {
    if (!active || !userId) return;
    let cancelled = false;
    let loading = false;
    const refresh = async () => {
      if (cancelled || loading || document.hidden) return;
      loading = true;
      try {
        const stats = await RestaurantService.getShopDailyStats(shopId);
        if (!cancelled) dispatch({ type: 'SET_SHOP_STATS', payload: { userId, shopId, stats: stats || [] } });
      } catch {
        if (!cancelled) dispatch({ type: 'SET_SHOP_STATS', payload: {
          userId, shopId, error: 'Could not refresh visits. Showing the last loaded statistics.',
        } });
      } finally { loading = false; }
    };
    void Promise.resolve().then(refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(() => { void refresh(); }, 30000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, [active, userId, shopId, view, dispatch]);
  return null;
}
