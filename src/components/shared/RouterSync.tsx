import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/store';
import type { View } from '@/types';

function getUrlForView(view: View, username: string): string | null {
  switch (view) {
    case 'landing': return '/';
    case 'login': return '/login';
    case 'signup': return '/signup';
    case 'onboarding': return '/onboarding';
    case 'demo': return '/demo';
    case 'contact': return '/contact';
    case 'privacy': return '/privacy';
    case 'terms': return '/terms';
    case 'seo-qr-menu': return '/qr-menu';
    case 'seo-digital-menu': return '/digital-menu';
    case 'seo-restaurant-menu': return '/restaurant-menu';
    case 'company-admin': return '/admin-portal';
    case 'company-admin-login': return '/admin-login';
    case 'customer-menu': return `/${username}`;
    case 'customer-shop-detail': return `/${username}/shop`;
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
  const { shop, currentView } = state;
  const username = shop.username || 'menuzo';
  const lastPathname = useRef('');
  const lastView = useRef(currentView);

  // Sync State -> URL
  useEffect(() => {
    const expectedUrl = getUrlForView(currentView, username);
    if (expectedUrl && expectedUrl !== location.pathname) {
      lastView.current = currentView;
      lastPathname.current = expectedUrl;
      navigate(expectedUrl, { replace: true });
    } else {
      lastView.current = currentView;
    }
  }, [currentView, username, navigate, location.pathname]);

  // Sync URL -> State
  useEffect(() => {
    if (location.pathname !== lastPathname.current) {
      lastPathname.current = location.pathname;
      const path = location.pathname;
      
      const exactRoutes: Record<string, View> = {
        '/': 'landing',
        '/login': 'login',
        '/signup': 'signup',
        '/onboarding': 'onboarding',
        '/demo': 'demo',
        '/contact': 'contact',
        '/privacy': 'privacy',
        '/terms': 'terms',
        '/qr-menu': 'seo-qr-menu',
        '/digital-menu': 'seo-digital-menu',
        '/restaurant-menu': 'seo-restaurant-menu',
        '/admin-portal': 'company-admin',
        '/admin-login': 'company-admin-login',
      };

      if (exactRoutes[path]) {
        dispatch({ type: 'SET_VIEW', payload: exactRoutes[path] });
        lastView.current = exactRoutes[path];
      } else {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 1) {
          const urlUsername = parts[0];
          const page = parts[1] || 'menu';
          
          if (shop.username !== urlUsername) {
             dispatch({ type: 'UPDATE_SHOP', payload: { username: urlUsername } });
          }
          
          let nextView: View | null = null;
          switch (page) {
            case 'menu': nextView = 'customer-menu'; break;
            case 'shop': nextView = 'customer-shop-detail'; break;
            case 'dashboard': nextView = 'user-dashboard'; break;
            case 'menupreview': nextView = 'admin-preview'; break;
            case 'settings':
              if (parts.length >= 3) {
                switch (parts[2]) {
                  case 'shop': nextView = 'admin-shop-details'; break;
                  case 'theme': nextView = 'admin-theme'; break;
                  case 'qr': nextView = 'admin-qr'; break;
                  case 'security': nextView = 'admin-security'; break;
                  default: nextView = 'admin-settings'; break;
                }
              } else {
                nextView = 'admin-settings';
              }
              break;
            case 'add-food': nextView = 'admin-add-food'; break;
            case 'analytics': nextView = 'admin-analytics'; break;
          }
          
          if (nextView) {
            dispatch({ type: 'SET_VIEW', payload: nextView });
            lastView.current = nextView;
          }
        }
      }
    }
  }, [location.pathname, dispatch, shop.username]);

  return null;
}
