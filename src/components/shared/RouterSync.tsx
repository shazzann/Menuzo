import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/store';
import type { AppState, View } from '@/types';
import { getShopMenuSlug, replaceMenuSlug } from '@/lib/shopUrls';
import { isOwnerShopView, isPublicShopView, parseShopRoute } from '@/lib/shopRoutes';

function getUrlForView(view: View, username: string, state: AppState, foodId?: string): string | null {
  switch (view) {
    case 'landing': return '/';
    case 'login': return '/login';
    case 'signup': return '/signup';
    case 'onboarding': return '/onboarding';
    case 'admin-subscription': return '/subscription';
    case 'demo': return '/demo';
    case 'contact': return '/contact';
    case 'privacy': return '/privacy';
    case 'terms': return '/terms';
    case 'seo-qr-menu': return '/qr-menu';
    case 'seo-digital-menu': return '/digital-menu';
    case 'seo-restaurant-menu': return '/restaurant-menu';
    case 'brand-book': return '/brand-book';
    case 'company-admin': return '/admin-portal';
    case 'company-admin-login': return '/admin-login';
    case 'customer-menu': return `/${username}`;
    case 'customer-shop-detail': return `/${username}/shop`;
    case 'customer-food-detail': 
       return `/${username}/food${state.selectedFoodItem || foodId ? `/${state.selectedFoodItem?.id || foodId}` : ''}`;
    case 'user-dashboard': return `/${username}/dashboard`;
    case 'admin-preview': return `/${username}/menupreview`;
    case 'admin-settings': return `/${username}/settings`;
    case 'admin-add-food': return `/${username}/add-food`;
    case 'admin-analytics': return `/${username}/analytics`;
    case 'admin-theme': return `/${username}/settings/theme`;
    case 'admin-qr': return `/${username}/settings/qr`;
    case 'admin-security': return `/${username}/settings/security`;
    case 'admin-shop-details': return `/${username}/settings/shop`;
    default: return null;
  }
}

export function RouterSync() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const lastPath = useRef(location.pathname);
  const pendingPath = useRef<string | null>(null);

  useEffect(() => {
    if (pendingPath.current) {
      if (location.pathname !== pendingPath.current) return;
      pendingPath.current = null;
    }
    // Browser navigation owns the view. Never derive a public slug from owner data.
    if (location.pathname !== lastPath.current) {
      lastPath.current = location.pathname;
      const route = parseShopRoute(location.pathname);
      if (state.currentView !== route.view) dispatch({ type: 'SET_VIEW', payload: route.view });
      return;
    }
    const route = parseShopRoute(location.pathname);
    const publicReady = isPublicShopView(state.currentView) && isPublicShopView(route.view)
      && state.shopDataContext === `public:${route.slug}` && state.shopDataStatus === 'ready';
    const menuSlug = getShopMenuSlug(state.shop);
    if (publicReady && menuSlug && route.slug !== menuSlug) {
      const pathname = replaceMenuSlug(location.pathname, menuSlug);
      pendingPath.current = pathname;
      lastPath.current = pathname;
      dispatch({ type: 'REKEY_PUBLIC_SHOP', payload: { shopId: state.shop.id, from: route.slug!, to: menuSlug } });
      navigate(pathname + (location.search || '') + (location.hash || ''), {
        replace: true,
        state: location.state?.menuReturnPath
          ? { ...location.state, menuReturnPath: replaceMenuSlug(location.state.menuReturnPath, menuSlug) } : location.state,
      });
      return;
    }
    const ownerReady = state.user && state.shopDataContext === `owner:${state.user.id}` && state.shopDataStatus === 'ready';
    if (isOwnerShopView(state.currentView) && !ownerReady) return;
    const slug = isPublicShopView(state.currentView) && isPublicShopView(route.view)
      ? route.slug || getShopMenuSlug(state.shop) : getShopMenuSlug(state.shop);
    const expected = getUrlForView(state.currentView, slug, state, route.foodId);
    if (expected && expected !== location.pathname) {
      pendingPath.current = expected;
      lastPath.current = expected;
      const openingFood = route.view === 'customer-menu' && state.currentView === 'customer-food-detail';
      navigate(expected, {
        replace: !openingFood,
        state: openingFood ? { menuReturnPath: location.pathname } : null,
      });
    }
  }, [state, location.pathname, location.search, location.hash, location.state, navigate, dispatch]);
  return null;
}
