import { lazy, Suspense, type ComponentType } from 'react';

function PageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function lazyNamed<TProps extends object>(
  loader: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string
) {
  const LazyComponent = lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] };
  });

  return function LazyRoute(props: TProps) {
    return (
      <Suspense fallback={<PageFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export const LoginPage = lazyNamed(() => import('@/pages/LoginPage'), 'LoginPage');
export const SignupPage = lazyNamed(() => import('@/pages/SignupPage'), 'SignupPage');
export const OnboardingPage = lazyNamed(() => import('@/pages/OnboardingPage'), 'OnboardingPage');
export const DemoPage = lazyNamed(() => import('@/pages/DemoPage'), 'DemoPage');
export const ContactPage = lazyNamed(() => import('@/pages/ContactPage'), 'ContactPage');
export const LegalPage = lazyNamed<{ type: 'privacy' | 'terms' }>(() => import('@/pages/LegalPage'), 'LegalPage');
export const AboutPage = lazyNamed(() => import('@/pages/AboutPage'), 'AboutPage');
export const CustomerMenuPage = lazyNamed(() => import('@/pages/CustomerMenuPage'), 'CustomerMenuPage');
export const FoodDetailPage = lazyNamed(() => import('@/pages/FoodDetailPage'), 'FoodDetailPage');
export const ShopDetailPage = lazyNamed(() => import('@/pages/ShopDetailPage'), 'ShopDetailPage');
export const AdminPreviewPage = lazyNamed(() => import('@/pages/AdminPreviewPage'), 'AdminPreviewPage');
export const AdminAddFoodPage = lazyNamed(() => import('@/pages/AdminAddFoodPage'), 'AdminAddFoodPage');
export const AdminAnalyticsPage = lazyNamed(() => import('@/pages/AdminAnalyticsPage'), 'AdminAnalyticsPage');
export const AdminSettingsPage = lazyNamed(() => import('@/pages/AdminSettingsPage'), 'AdminSettingsPage');
export const AdminThemePage = lazyNamed(() => import('@/pages/AdminThemePage'), 'AdminThemePage');
export const AdminQrPage = lazyNamed(() => import('@/pages/AdminQrPage'), 'AdminQrPage');
export const AdminSecurityPage = lazyNamed(() => import('@/pages/AdminSecurityPage'), 'AdminSecurityPage');
export const UserDashboardPage = lazyNamed(() => import('@/pages/UserDashboardPage'), 'UserDashboardPage');
export const CompanyAdminPage = lazyNamed(() => import('@/pages/CompanyAdminPage'), 'CompanyAdminPage');
export const CompanyAdminLoginPage = lazyNamed(() => import('@/pages/CompanyAdminLoginPage'), 'CompanyAdminLoginPage');
export const BrandBookPage = lazyNamed(() => import('@/pages/BrandBookPage'), 'BrandBookPage');
export const SubscriptionPage = lazyNamed(() => import('@/pages/SubscriptionPage'), 'SubscriptionPage');
export const ShopNotFoundPage = lazyNamed(() => import('@/pages/ShopNotFoundPage'), 'ShopNotFoundPage');
