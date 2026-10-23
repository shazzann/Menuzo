import { useEffect } from 'react';
import { useApp } from '@/store';
import { MenuService } from '@/services/menu.service';
import { isOwnerShopView } from '@/lib/shopRoutes';
import { subscriptionPhase } from '@/lib/subscription';

// Keeps the owner's list of items hidden by the Free plan limits in sync with the
// database, which decides visibility (see free_plan_listed_food_item_ids).
export function PlanVisibilityLoader() {
  const { state, dispatch } = useApp();
  const { shop, user } = state;
  const ownerReady = !!user && state.shopDataContext === `owner:${user.id}` && state.shopDataStatus === 'ready'
    && isOwnerShopView(state.currentView) && !!shop.id && shop.id !== 'shop-1';
  // Recheck when items, categories, their order, or the plan change.
  const menuKey = state.foodItems.map(item => `${item.id}:${item.category}`).join('|');
  const orderKey = (shop.categoryOrder || []).join('|');
  const planKey = `${user?.subscription.plan}:${user?.subscription.status}:${user?.subscription.expiresAt}:${subscriptionPhase(user?.subscription).phase}`;

  useEffect(() => {
    if (!ownerReady) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      MenuService.getPlanHiddenItemIds(shop.id)
        .then(ids => { if (!cancelled) dispatch({ type: 'SET_PLAN_HIDDEN_ITEMS', payload: ids }); })
        .catch(err => console.error('Could not check plan visibility:', err));
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ownerReady, shop.id, menuKey, orderKey, planKey, dispatch]);
  return null;
}
