import { getShopMenuUrl } from '@/lib/shopUrls';
import { 
  Utensils, 
  Settings, 
  QrCode,
  Crown,
  Calendar,
  Plus,
  Copy,
  ChevronRight,
  Download,
  Eye,
  Share2
} from 'lucide-react';
import { MenuViewsChart, TrendBadge } from '@/components/admin/MenuViewsChart';
import { summarizeShopViews, viewsTrend } from '@/lib/shopAnalytics';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { ShopLogoAvatar } from '@/components/shared/ShopLogoAvatar';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { PlanStatusBanner } from '@/components/subscription/PlanStatusBanner';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { SmallQrPreview, type SmallQrPreviewRef } from '@/components/admin/SmallQrPreview';
import type { AdminTab } from '@/types';
import { isProActive, planNotice } from '@/lib/subscription';
import { markQrGenerated } from '@/lib/qrProgress';
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
  const userPlan = user?.subscription?.plan || 'free';
  const isEnterprise = userPlan === 'enterprise' && proActive;
  const isPlus = (userPlan === 'plus' || userPlan === 'pro') && proActive;
  const planDisplayName = isEnterprise ? 'Enterprise' : isPlus ? 'Plus' : 'Free';
  const showPlanNotice = planNotice(user?.subscription, state.planHiddenItemIds.length) !== null;
  const isLoadingData = state.shopDataStatus === 'loading';
  const qrRef = useRef<SmallQrPreviewRef>(null);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const viewStats = summarizeShopViews(shop?.daily_stats, 'week');
  const statsAvailable = shop.daily_stats !== undefined;
  const { isComplete: onboardingComplete } = useOnboardingStatus();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shopMenuUrl = getShopMenuUrl(shop, origin);

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

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shop.name || 'Menuzo Menu',
          text: `Check out our digital menu at ${shop.name}!`,
          url: shopMenuUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shopMenuUrl);
      toast.success('Menu link copied to clipboard!');
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
            <ShopLogoAvatar logo={shop.logo} name={shop.name} />
            <div>
              <h1 className="font-bold text-base sm:text-lg text-foreground leading-tight">Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
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
            Hi{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="text-muted-foreground text-sm">Here is what is happening with your menu today.</p>
        </div>

        {/* Quick Action Buttons (Preview, Add Food, Share) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleTabChange('menu-preview')}
            className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-border bg-card hover:bg-muted/70 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">Preview</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleTabChange('add-food')}
            className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-border bg-card hover:bg-muted/70 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">Add Food</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-border bg-card hover:bg-muted/70 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">Share</span>
          </Button>
        </div>

        <OnboardingChecklist />

        <PlanStatusBanner />

        {/* Quick Stats Grid (Moved above the graph) */}
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
                   shopUrl={shopMenuUrl}
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
                    {shopMenuUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" disabled={isDownloadingQr} aria-label="Download high-resolution QR code" className="h-8 w-8 hover:bg-background rounded-lg flex-shrink-0 text-muted-foreground hover:text-foreground shadow-sm" onClick={async () => {
                      if (qrRef.current) {
                        setIsDownloadingQr(true);
                        try {
                          await qrRef.current.download(`${shop.name.toLowerCase().replace(/\s+/g, '-')}-qr`);
                          // Complete the checklist only after the export succeeds.
                          void markQrGenerated(shop, dispatch);
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
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(shopMenuUrl);
                        toast.success('Menu link copied!');
                      }
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

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

        {/* Subscription / Plan Status (Moved to last) */}
        {!showPlanNotice && (
          <div
            className={`p-5 rounded-2xl border shadow-sm transition-all ${
              isEnterprise
                ? 'bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/30'
                : proActive
                ? 'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/25'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
                    isEnterprise
                      ? 'bg-purple-600 text-white'
                      : proActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm sm:text-base">{planDisplayName} Plan</p>
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        proActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {proActive ? 'Active' : 'Starter'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {proActive && user?.subscription.expiresAt
                        ? `Renews / expires ${new Date(user.subscription.expiresAt).toLocaleDateString()}`
                        : 'Upgrade anytime with bank transfer'}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant={isEnterprise ? 'outline' : 'default'}
                size="sm"
                className={`rounded-xl shrink-0 font-medium ${
                  isEnterprise ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' : ''
                }`}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' })}
              >
                {proActive ? 'Manage' : 'Upgrade to Plus'}
              </Button>
            </div>
          </div>
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
