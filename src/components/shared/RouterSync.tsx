import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/store';
import type { AppState, View } from '@/types';
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
    const ownerReady = state.user && state.shopDataContext === `owner:${state.user.id}` && state.shopDataStatus === 'ready';
    if (isOwnerShopView(state.currentView) && !ownerReady) return;
    const slug = isPublicShopView(state.currentView) && isPublicShopView(route.view)
      ? route.slug || state.shop.username : state.shop.username;
    const expected = getUrlForView(state.currentView, slug, state, route.foodId);
    if (expected && expected !== location.pathname) {
      pendingPath.current = expected;
      lastPath.current = expected;
      navigate(expected, { replace: true });
    }
  }, [state, location.pathname, navigate, dispatch]);
  return null;
}
