import { AppProvider, useApp } from '@/store';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { CustomerMenuPage } from '@/pages/CustomerMenuPage';
import { FoodDetailPage } from '@/pages/FoodDetailPage';
import { ShopDetailPage } from '@/pages/ShopDetailPage';
import { AdminPreviewPage } from '@/pages/AdminPreviewPage';
import { AdminAddFoodPage } from '@/pages/AdminAddFoodPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { CompanyAdminPage } from '@/pages/CompanyAdminPage';
import { CompanyAdminLoginPage } from '@/pages/CompanyAdminLoginPage';
import { Toaster } from '@/components/ui/sonner';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BrowserRouter } from 'react-router-dom';
import { RouterSync } from '@/components/shared/RouterSync';
import { PublicDataLoader } from '@/components/shared/PublicDataLoader';

function AppContent() {
  const { state, dispatch } = useApp();
  const { currentView } = state;
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      try {
        let isGoogleRedirect = false;

        // Check if Google just redirected us back with a token or code
        if (window.location.hash.includes('access_token') || window.location.search.includes('code')) {
          isGoogleRedirect = true;
          // Note: Do NOT clear the URL here! Supabase needs to read the access_token from the hash.
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase getSession error:', error);
        }

        // If we have a valid session OR we just came from Google, force the login!
        if ((session?.user || isGoogleRedirect) && mounted) {
          dispatch({
            type: 'LOGIN',
            payload: {
              id: session?.user?.id || '',
              email: session?.user?.email || '',
              shopName: '',
              shopId: '',
              subscription: { plan: 'pro', expiresAt: new Date('2025-12-31'), status: 'active' },
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
            subscription: { plan: 'pro', expiresAt: new Date('2025-12-31'), status: 'active' },
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'user-dashboard':
      return <UserDashboardPage />;
    case 'login':
      return <LoginPage />;
    case 'customer-menu':
      return <CustomerMenuPage />;
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
    case 'company-admin':
      return <CompanyAdminPage />;
    case 'company-admin-login':
      return <CompanyAdminLoginPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppProvider>
        <BrowserRouter>
          <RouterSync />
          <PublicDataLoader />
          <AppContent />
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
