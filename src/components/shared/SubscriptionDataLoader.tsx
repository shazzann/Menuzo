import { useEffect } from 'react';
import { useApp } from '@/store';
import { freeSubscription } from '@/lib/subscription';
import { SubscriptionService } from '@/services/subscription.service';
import { RestaurantService } from '@/services/restaurant.service';

export function SubscriptionDataLoader() {
  const { state, dispatch } = useApp();
  const userId = state.user?.id;
  const ownerShopId = state.shopDataContext === `owner:${userId}` ? state.shop.id : '';
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const [subscription, menuUrl] = await Promise.all([
          SubscriptionService.getSubscription(userId),
          ownerShopId ? RestaurantService.getShopMenuUrl(ownerShopId).catch(() => null) : Promise.resolve(null),
        ]);
        if (!cancelled) {
          dispatch({ type: 'SET_SUBSCRIPTION', payload: { userId, subscription } });
          if (menuUrl?.menu_slug) dispatch({ type: 'SET_SHOP_MENU_URL', payload: { userId, shopId: ownerShopId, slug: menuUrl.menu_slug } });
        }
      } catch {
        // An unavailable profile never grants paid access.
        if (!cancelled) dispatch({ type: 'SET_SUBSCRIPTION', payload: { userId, subscription: freeSubscription() } });
      } finally {
        loading = false;
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
    };
  }, [userId, ownerShopId, dispatch]);
  return null;
}
