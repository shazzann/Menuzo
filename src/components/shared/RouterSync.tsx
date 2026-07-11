import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/store';
import type { View } from '@/types';

function getUrlForView(view: View, username: string): string | null {
  switch (view) {
    case 'landing': return '/';
    case 'login': return '/login';
    case 'company-admin': return '/admin-portal';
    case 'company-admin-login': return '/admin-login';
    case 'customer-menu': return `/${username}/menu`;
    case 'customer-shop-detail': return `/${username}/shop`;
    case 'user-dashboard': return `/${username}/dashboard`;
    case 'admin-preview': return `/${username}/menupreview`;
    case 'admin-settings': return `/${username}/settings`;
    case 'admin-add-food': return `/${username}/add-food`;
    case 'admin-analytics': return `/${username}/analytics`;
    default: return null; // We don't map popup/detail views to primary routes yet, they stay in place
  }
}

export function RouterSync() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { shop, currentView } = state;
  const username = shop.username || 'menuzo';
  const lastPathname = useRef(location.pathname);
  const lastView = useRef(currentView);

  // Sync State -> URL
  useEffect(() => {
    if (currentView !== lastView.current) {
      lastView.current = currentView;
      const expectedUrl = getUrlForView(currentView, username);
      if (expectedUrl && expectedUrl !== location.pathname) {
        lastPathname.current = expectedUrl;
        navigate(expectedUrl);
      }
    }
  }, [currentView, username, navigate, location.pathname]);

  // Sync URL -> State
  useEffect(() => {
    if (location.pathname !== lastPathname.current) {
      lastPathname.current = location.pathname;
      const path = location.pathname;
      
      if (path === '/' || path === '') {
        dispatch({ type: 'SET_VIEW', payload: 'landing' });
        lastView.current = 'landing';
      } else if (path === '/login') {
        dispatch({ type: 'SET_VIEW', payload: 'login' });
        lastView.current = 'login';
      } else if (path === '/admin-portal') {
        dispatch({ type: 'SET_VIEW', payload: 'company-admin' });
        lastView.current = 'company-admin';
      } else if (path === '/admin-login') {
        dispatch({ type: 'SET_VIEW', payload: 'company-admin-login' });
        lastView.current = 'company-admin-login';
      } else {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          const [urlUsername, page] = parts;
          
          if (shop.username !== urlUsername) {
             dispatch({ type: 'UPDATE_SHOP', payload: { username: urlUsername } });
          }
          
          let nextView: View | null = null;
          switch (page) {
            case 'menu': nextView = 'customer-menu'; break;
            case 'shop': nextView = 'customer-shop-detail'; break;
            case 'dashboard': nextView = 'user-dashboard'; break;
            case 'menupreview': nextView = 'admin-preview'; break;
            case 'settings': nextView = 'admin-settings'; break;
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
