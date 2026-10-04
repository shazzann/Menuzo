import { AppProvider, useApp } from '@/store';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DemoPage } from '@/pages/DemoPage';
import { SeoLandingPage } from '@/pages/SeoLandingPage';
import { ContactPage } from '@/pages/ContactPage';
import { LegalPage } from '@/pages/LegalPage';
import { CustomerMenuPage } from '@/pages/CustomerMenuPage';
import { FoodDetailPage } from '@/pages/FoodDetailPage';
import { ShopDetailPage } from '@/pages/ShopDetailPage';
import { AdminPreviewPage } from '@/pages/AdminPreviewPage';
import { AdminAddFoodPage } from '@/pages/AdminAddFoodPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { AdminShopDetailsPage } from '@/pages/AdminShopDetailsPage';
import { AdminThemePage } from '@/pages/AdminThemePage';
import { AdminQrPage } from '@/pages/AdminQrPage';
import { AdminSecurityPage } from '@/pages/AdminSecurityPage';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { CompanyAdminPage } from '@/pages/CompanyAdminPage';
import { CompanyAdminLoginPage } from '@/pages/CompanyAdminLoginPage';
import { ShopNotFoundPage } from '@/pages/ShopNotFoundPage';
import { BrandBookPage } from '@/pages/BrandBookPage';
import { Toaster } from '@/components/ui/sonner';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { RouterSync } from '@/components/shared/RouterSync';
import { PublicDataLoader } from '@/components/shared/PublicDataLoader';
import { AdminDataLoader } from '@/components/shared/AdminDataLoader';
import { ShopThemeApplier } from '@/components/shared/ShopThemeApplier';
import { SubscriptionDataLoader } from '@/components/shared/SubscriptionDataLoader';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { freeSubscription } from '@/lib/subscription';
import { isOwnerShopView, isPublicShopView, parseShopRoute } from '@/lib/shopRoutes';

function AppContent() {
  const { state, dispatch } = useApp();
  const { currentView } = state;
  const location = useLocation();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase getSession error:', error);
        }

        if (session?.user && mounted) {
          dispatch({
            type: 'LOGIN',
            payload: {
              id: session.user.id,
              email: session.user.email || '',
              shopName: '',
              shopId: '',
              subscription: freeSubscription(),
            },
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    };

    handleAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: session.user.id,
            email: session.user.email || '',
            shopName: '',
            shopId: '',
            subscription: freeSubscription(),
          },
        });
      } else if (event === 'SIGNED_OUT' && mounted) {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const isPrivateView = currentView.startsWith('admin-') || currentView === 'user-dashboard' || currentView === 'onboarding';

  useEffect(() => {
    if (!isAuthLoading && isPrivateView && !state.user) {
      if (currentView === 'admin-subscription') sessionStorage.setItem('menuzo_upgrade_intent', 'pro');
      dispatch({ type: 'SET_VIEW', payload: 'login' });
    }
  }, [isAuthLoading, isPrivateView, currentView, state.user, dispatch]);

  useEffect(() => {
    if (state.user && state.shop.id && isOwnerShopView(currentView)
      && state.shopDataContext === `owner:${state.user.id}` && state.shopDataStatus === 'ready'
      && sessionStorage.getItem('menuzo_upgrade_intent') === 'pro') {
      sessionStorage.removeItem('menuzo_upgrade_intent');
      dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' });
    }
  }, [state.user?.id, state.shop.id, state.shopDataContext, state.shopDataStatus, currentView, dispatch]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isPrivateView && !state.user) {
    return null; // Prevents flash before redirect happens
  }

  const shopContext = isPublicShopView(currentView)
    ? `public:${parseShopRoute(location.pathname).slug || ''}`
    : isOwnerShopView(currentView) && state.user ? `owner:${state.user.id}` : null;
  if (shopContext) {
    const matchingContext = state.shopDataContext === shopContext;
    if (matchingContext && state.shopDataStatus === 'not-found' && isPublicShopView(currentView)) return <ShopNotFoundPage />;
    if (!matchingContext || state.shopDataStatus !== 'ready') {
      const failed = matchingContext && state.shopDataStatus === 'error';
      return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p role={failed ? 'alert' : 'status'}>{failed ? state.shopLoadError : 'Loading shop details…'}</p>
        {failed && <button className="rounded-xl bg-primary px-5 py-2 text-primary-foreground" onClick={() => dispatch({ type: 'RETRY_SHOP_LOAD' })}>Try again</button>}
      </div>;
    }
  }

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'onboarding':
      return <OnboardingPage />;
    case 'admin-subscription':
      return <SubscriptionPage key={`${state.user?.id}:${state.shop.id}`} />;
    case 'demo':
      return <DemoPage />;
    case 'contact':
      return <ContactPage />;
    case 'privacy':
      return <LegalPage type="privacy" />;
    case 'terms':
      return <LegalPage type="terms" />;
    case 'seo-qr-menu':
    case 'seo-digital-menu':
    case 'seo-restaurant-menu':
      return <SeoLandingPage />;
    case 'user-dashboard':
      return <UserDashboardPage />;
    case 'customer-menu':
      return <CustomerMenuPage key={state.shop.id} />;
    case 'customer-food-detail':
    case 'admin-food-detail':
    case 'admin-add-food-detail':
      return <FoodDetailPage />;
    case 'customer-shop-detail':
      return <ShopDetailPage />;
    case 'admin-preview':
      return <AdminPreviewPage />;
    case 'admin-add-food':
      return <AdminAddFoodPage />;
    case 'admin-analytics':
      return <AdminAnalyticsPage />;
    case 'admin-settings':
      return <AdminSettingsPage />;
    case 'admin-shop-details':
      return <AdminShopDetailsPage key={state.shop.id} />;
    case 'admin-theme':
      return <AdminThemePage />;
    case 'admin-qr':
      return <AdminQrPage />;
    case 'admin-security':
      return <AdminSecurityPage />;
    case 'company-admin':
      return <CompanyAdminPage />;
    case 'company-admin-login':
      return <CompanyAdminLoginPage />;
    case 'brand-book':
      return <BrandBookPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppProvider>
        <BrowserRouter>
          <RouterSync />
          <PublicDataLoader />
          <AdminDataLoader />
          <SubscriptionDataLoader />
          <ShopThemeApplier />
          <AppContent />
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
