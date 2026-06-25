import { AppProvider, useApp } from '@/store';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { CustomerMenuPage } from '@/pages/CustomerMenuPage';
import { FoodDetailPage } from '@/pages/FoodDetailPage';
import { ShopDetailPage } from '@/pages/ShopDetailPage';
import { AdminPreviewPage } from '@/pages/AdminPreviewPage';
import { AdminShopDetailsPage } from '@/pages/AdminShopDetailsPage';
import { AdminAddFoodPage } from '@/pages/AdminAddFoodPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';

function AppContent() {
  const { state } = useApp();
  const { currentView } = state;

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'customer-menu':
      return <CustomerMenuPage />;
    case 'customer-food-detail':
      return <FoodDetailPage />;
    case 'customer-shop-detail':
      return <ShopDetailPage />;
    case 'admin-preview':
      return <AdminPreviewPage />;
    case 'admin-shop-details':
      return <AdminShopDetailsPage />;
    case 'admin-add-food':
      return <AdminAddFoodPage />;
    case 'admin-analytics':
      return <AdminAnalyticsPage />;
    case 'admin-settings':
      return <AdminSettingsPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
