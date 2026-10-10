import { getShopMenuUrl } from '@/lib/shopUrls';
import { 
  Utensils, 
  Settings, 
  QrCode,
  Crown,
  Calendar,
  Plus,
  Copy,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { MenuViewsChart, TrendBadge } from '@/components/admin/MenuViewsChart';
import { summarizeShopViews, viewsTrend } from '@/lib/shopAnalytics';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { OnboardingChecklist, useOnboardingStatus } from '@/components/dashboard/OnboardingChecklist';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { SmallQrPreview, type SmallQrPreviewRef } from '@/components/admin/SmallQrPreview';
import type { AdminTab } from '@/types';
import { isBrandTheme } from '@/lib/themeUtils';
import { normalizeQrColorStyle, normalizeQrPattern, QR_COLOR_STYLES, QR_PATTERNS } from '@/lib/qrCode';
import { isProActive } from '@/lib/subscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';



export function UserDashboardPage() {
  const { state, dispatch } = useApp();
  const { shop, foodItems, user } = state;
  const proActive = isProActive(user?.subscription);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const qrRef = useRef<SmallQrPreviewRef>(null);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const viewStats = summarizeShopViews(shop?.daily_stats, 'week');
  const statsAvailable = shop.daily_stats !== undefined;
  const { isComplete: onboardingComplete } = useOnboardingStatus();
  const qrTheme = shop.theme as { qrStyle?: string; qrPattern?: string } | undefined;
  const qrColorStyle = normalizeQrColorStyle(qrTheme?.qrStyle);
  const qrPattern = normalizeQrPattern(qrTheme?.qrPattern);

  useEffect(() => {
    // Data is now loaded globally by AdminDataLoader
    setIsLoadingData(false);
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'dashboard':
        dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
        break;
      case 'menu-preview':
        dispatch({ type: 'SET_VIEW', payload: 'admin-preview' });
        break;
      case 'settings':
        dispatch({ type: 'SET_VIEW', payload: 'admin-settings' });
        break;
      case 'add-food':
        dispatch({ type: 'SET_VIEW', payload: 'admin-add-food' });
        break;
      case 'analytics':
        dispatch({ type: 'SET_VIEW', payload: 'admin-analytics' });
        break;
    }
  };

  const needsSetup = !isLoadingData && (shop.name === 'My Kitchen' || shop.name === 'My Awesome Shop' || !shop.name);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Setup Profile Prompt */}
      <AlertDialog open={needsSetup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to Menuzo!</AlertDialogTitle>
            <AlertDialogDescription>
              Let's get started by setting up your shop profile. You'll need to provide your shop name and a few basic details to unlock the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
               dispatch({ type: 'SET_ADMIN_TAB', payload: 'settings' });
               dispatch({ type: 'SET_VIEW', payload: 'admin-settings' });
            }}>
              Setup Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {isLoadingData ? 'Loading...' : shop.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="px-4 py-6 space-y-6">

        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h2>
          <p className="text-muted-foreground">Here is what is happening with your menu today.</p>
        </div>

        <OnboardingChecklist />

        {/* Subscription / Plan Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{proActive ? 'Pro Active' : 'Free Plan'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {proActive && user?.subscription.expiresAt
                  ? `Expires ${new Date(user.subscription.expiresAt).toLocaleDateString()}`
                  : 'Upgrade with a bank transfer'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' })}
          >
            {proActive ? 'Manage' : 'Choose Pro'}
          </Button>
        </div>

        {foodItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-card border border-dashed border-border shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your menu is empty</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Create your first category and add a food item to start building your beautiful digital menu.
            </p>
            <Button
              onClick={() => handleTabChange('add-food')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : null}

        {/* Chart Section */}
        <div className="pt-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4">
            <div>
              <h3 className="font-semibold">Menu Views</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none text-primary">
                {statsAvailable ? viewStats.views.toLocaleString() : '—'}
              </p>
              <TrendBadge value={viewsTrend(shop.daily_stats, 'week')} />
            </div>
          </div>
          {shop.dailyStatsError && statsAvailable && <p role="alert" className="text-xs text-muted-foreground mt-3 px-4">{shop.dailyStatsError}</p>}
          {statsAvailable ? (
            <>
              <MenuViewsChart data={viewStats.data} className="mt-2" />
              <div className="flex items-center gap-2 px-4 py-3 border-t border-border/50 text-xs text-muted-foreground">
                <QrCode className="w-3.5 h-3.5 text-foreground" />
                <span><span className="font-semibold text-foreground">{viewStats.qrScans.toLocaleString()}</span> from QR scans</span>
              </div>
            </>
          ) : (
            <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground">
              Daily statistics could not be loaded.
              <Button variant="link" onClick={() => dispatch({ type: 'RETRY_SHOP_LOAD' })}>Retry</Button>
            </div>
          )}
        </div>

        {foodItems.length > 0 && (
          <>
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
              <Utensils className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{foodItems.length}</p>
            <p className="text-xs text-muted-foreground">Active Items</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <QrCode className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{statsAvailable ? viewStats.qrScans.toLocaleString() : '—'}</p>
            <p className="text-xs text-muted-foreground">QR scans · Last 7 days</p>
          </div>
        </div>

        {/* QR Menu Section */}
        <div>
          <h2 className="text-lg font-bold mb-1">QR Menu</h2>
          <p className="text-sm text-muted-foreground mb-4">Your customers access your menu here</p>
          
          <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            {/* Top Section: QR Preview & URL */}
            <div className="p-5 border-b border-border/50 flex flex-col items-center gap-5">
              {/* QR Preview Card */}
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50 flex flex-col items-center justify-center w-full max-w-[260px]">
                <SmallQrPreview 
                   ref={qrRef}
                   shopUrl={getShopMenuUrl(shop, window.location.origin)}
                   theme={shop.theme || { primary: '#090A0C', secondary: '#1C1E22', accent: '#FB8500' }}
                   shopLogo={shop.logo}
                   size={200}
                 />
              </div>
              
              {/* URL Display */}
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Your Menu Link</p>
                <div className="flex items-center gap-2 bg-muted/70 p-2 rounded-xl border border-border/50">
                  <span className="text-sm text-foreground truncate flex-1 ml-2 font-medium select-all">
                    {getShopMenuUrl(shop, window.location.origin).replace(/^https?:\/\//, '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" disabled={isDownloadingQr} aria-label="Download high-resolution QR code" className="h-8 w-8 hover:bg-background rounded-lg flex-shrink-0 text-muted-foreground hover:text-foreground shadow-sm" onClick={async () => {
                      if (qrRef.current) {
                        setIsDownloadingQr(true);
                        try {
                          await qrRef.current.download(`${shop.name.toLowerCase().replace(/\s+/g, '-')}-qr`);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem(`qr_generated_${shop.id}`, 'true');
                            // Refresh the checklist only after the export succeeds.
                            dispatch({ type: 'UPDATE_SHOP', payload: {} });
                          }
                          toast.success('High-resolution QR code downloaded!');
                        } catch {
                          toast.error('Could not download the QR code. Please try again.');
                        } finally {
                          setIsDownloadingQr(false);
                        }
                      }
                    }}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background rounded-lg flex-shrink-0 text-muted-foreground hover:text-foreground shadow-sm" onClick={() => {
                      const url = getShopMenuUrl(shop, window.location.origin);
                      navigator.clipboard.writeText(url);
                      toast.success('Menu link copied!');
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="default" 
                      className={`h-8 w-8 rounded-lg flex-shrink-0 shadow-sm ${isBrandTheme(shop.theme) ? 'bg-[#FB8500] hover:bg-[#FB8500]/90 text-black' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                      onClick={() => window.open(getShopMenuUrl(shop, window.location.origin), '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Information */}
            {/* <div className="p-4 border-b border-border/50 bg-muted/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Style</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: qrColorStyle === 'brand' ? shop.theme?.accent || '#FB8500' : '#000' }} />
                  <span className="text-sm font-medium">
                    {QR_PATTERNS.find(p => p.value === qrPattern)?.label} · {QR_COLOR_STYLES.find(c => c.value === qrColorStyle)?.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Logo</p>
                <span className="text-sm font-medium">{shop.logo ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div> */}

            {/* Actions */}
            <div className="p-2 flex flex-col sm:flex-row gap-2 bg-muted/5">
              <Button 
                variant="default" 
                className="w-full text-xs h-9"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-qr' })}
              >
                Customize QR
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions — only while the shop is still being set up */}
        {!onboardingComplete && (
        <div>
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => handleTabChange('add-food')}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Add Menu Item</p>
                <p className="text-xs text-muted-foreground">Create a new dish or combo</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => handleTabChange('settings')}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Shop Settings</p>
                <p className="text-xs text-muted-foreground">Update hours, location, and info</p>
              </div>
            </Button>
            
            {/* Developer Action */}
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-3 px-4 border-dashed border-primary text-primary hover:bg-primary/5"
              onClick={async () => {
                const { loadDemoRestaurant } = await import('@/lib/seeder');
                loadDemoRestaurant(dispatch);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Load Demo Restaurant</p>
                <p className="text-xs opacity-70">Fill dashboard with dummy data</p>
              </div>
            </Button>
          </div>
        </div>
        )}
        </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="dashboard"
        onTabChange={handleTabChange}
        isAdmin={true}
      />
    </div>
  );
}
