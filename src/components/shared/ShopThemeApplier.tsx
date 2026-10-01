import { useEffect } from 'react';
import { useApp } from '@/store';
import { getShopThemeStyles, isBrandTheme, isDarkColor, normalizeShopTheme } from '@/lib/themeUtils';

const SHOP_VIEWS: string[] = [
  'user-dashboard',
  'customer-menu',
  'customer-food-detail',
  'customer-shop-detail',
  'admin-preview',
  'admin-add-food',
  'admin-add-food-detail',
  'admin-analytics',
  'admin-settings',
  'admin-shop-details',
  'admin-theme',
  'admin-qr',
  'admin-security',
  'admin-food-detail',
];

export function ShopThemeApplier() {
  const { state } = useApp();
  const { currentView, shop } = state;

  useEffect(() => {
    const root = document.documentElement;

    const restorePlatformTheme = () => {
      Object.keys(getShopThemeStyles()).forEach(prop => root.style.removeProperty(prop));
      root.removeAttribute('data-shop-theme');
      const savedTheme = localStorage.getItem('vite-ui-theme') || 'light';
      const mode = savedTheme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : (savedTheme === 'dark' ? 'dark' : 'light');
      root.classList.remove('light', 'dark');
      root.classList.add(mode);
    };

    if (!SHOP_VIEWS.includes(currentView)) {
      restorePlatformTheme();
      return;
    }

    const theme = normalizeShopTheme(shop?.theme);
    root.classList.remove('light', 'dark');
    root.classList.add(isDarkColor(theme.primary) ? 'dark' : 'light');
    root.setAttribute('data-shop-theme', isBrandTheme(theme) ? 'brand' : 'custom');
    Object.entries(getShopThemeStyles(theme)).forEach(([property, value]) => {
      root.style.setProperty(property, String(value));
    });
    return restorePlatformTheme;
  }, [currentView, shop?.theme]);

  return null;
}
