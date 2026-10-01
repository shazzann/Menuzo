import type { View } from '@/types';

export const isPublicShopView = (view: View) => ['customer-menu','customer-shop-detail','customer-food-detail'].includes(view);
export const isOwnerShopView = (view: View) => view === 'user-dashboard' || view.startsWith('admin-');

const exactRoutes: Record<string, View> = {
  '/': 'landing', '/login': 'login', '/signup': 'signup', '/onboarding': 'onboarding',
  '/subscription': 'admin-subscription', '/demo': 'demo', '/contact': 'contact',
  '/privacy': 'privacy', '/terms': 'terms', '/brand-book': 'brand-book',
  '/qr-menu': 'seo-qr-menu', '/digital-menu': 'seo-digital-menu', '/restaurant-menu': 'seo-restaurant-menu',
  '/admin': 'company-admin-login', '/admin-login': 'company-admin-login', '/admin-portal': 'company-admin',
};

export function parseShopRoute(pathname: string): { view: View; slug?: string; foodId?: string } {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (exactRoutes[path]) return { view: exactRoutes[path] };
  const [slug, page, detail] = path.split('/').filter(Boolean);
  if (!slug) return { view: 'landing' };
  if (page === 'settings') {
    const settings: Record<string, View> = { shop:'admin-shop-details',theme:'admin-theme',qr:'admin-qr',security:'admin-security' };
    return { view: settings[detail] || 'admin-settings', slug };
  }
  const pages: Record<string, View> = { menu:'customer-menu',shop:'customer-shop-detail',food:'customer-food-detail',
    dashboard:'user-dashboard',menupreview:'admin-preview','add-food':'admin-add-food',analytics:'admin-analytics' };
  return { view: pages[page || 'menu'] || 'customer-menu', slug, foodId: page === 'food' ? detail : undefined };
}
