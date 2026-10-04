import { useState } from 'react';
import { Settings, CreditCard, Calendar, QrCode, Eye, Utensils, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab } from '@/types';
import { cn } from '@/lib/utils';
import { isProActive } from '@/lib/subscription';
import { ANALYTICS_RANGE_LABELS, summarizeShopViews, type AnalyticsRange } from '@/lib/shopAnalytics';
import { MenuViewsChart } from '@/components/admin/MenuViewsChart';

export function AdminAnalyticsPage() {
  const { state, dispatch } = useApp();
  const { user, foodItems, categories, shop } = state;
  const proActive = isProActive(user?.subscription);
  const currentPlan = proActive ? 'pro' : 'free';
  const [timeRange, setTimeRange] = useState<AnalyticsRange>('week');

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
        // Already here
        break;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-primary';
      case 'enterprise': return 'text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-primary/20 text-primary';
      case 'enterprise': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const viewStats = summarizeShopViews(shop?.daily_stats, timeRange);
  const statsAvailable = shop?.daily_stats !== undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Analytics</h1>
              <p className="text-xs text-muted-foreground">Shop performance</p>
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

      <div className="px-4 py-4 space-y-6">
        {/* Subscription Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 card-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Plan</p>
                <p className={cn('font-bold text-lg capitalize', getPlanColor(currentPlan))}>
                  {currentPlan}
                </p>
              </div>
            </div>
            <span className={cn('px-3 py-1 text-xs font-mono uppercase rounded-full', getPlanBadge(currentPlan))}>
              {proActive ? 'Pro Active' : 'Free Plan'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              {proActive && user?.subscription.expiresAt
                ? `Expires ${new Date(user.subscription.expiresAt).toLocaleDateString()}`
                : 'Upgrade with a bank transfer'}
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' })}
          >
            {proActive ? 'Manage Subscription' : 'Choose Pro'}
          </Button>
        </div>

        {/* Shop Content Stats */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Menu Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{foodItems.length}</p>
                <p className="text-xs text-muted-foreground">Food Items</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.filter(c => c.id !== 'all').length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Views & Performance */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-sm">Shop Performance</h3>
            <div className="flex bg-muted rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  aria-pressed={timeRange === range}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors",
                    timeRange === range ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {ANALYTICS_RANGE_LABELS[range]}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{ANALYTICS_RANGE_LABELS[timeRange]} · Sri Lanka time · Includes today</p>
          {shop.dailyStatsError && statsAvailable && <p role="alert" className="text-xs text-muted-foreground mb-3">{shop.dailyStatsError}</p>}
          {!statsAvailable && (
            <div role="alert" className="mb-3 p-4 rounded-xl bg-muted text-sm">
              Daily statistics could not be loaded.
              <Button variant="link" onClick={() => dispatch({ type: 'RETRY_SHOP_LOAD' })}>Retry</Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 p-3 sm:p-5 rounded-xl bg-card border border-border flex items-center">
              <div className="min-w-0 flex items-center gap-2 sm:gap-4">
                <div className="shrink-0 p-2 sm:p-3 bg-primary/10 rounded-xl">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 break-words">
                  <p className="text-sm text-muted-foreground">Menu Views</p>
                  <p className="text-2xl font-bold">{statsAvailable ? viewStats.views.toLocaleString() : '—'}</p>
                </div>
              </div>

            </div>

            <div className="min-w-0 p-3 sm:p-5 rounded-xl bg-card border border-border flex items-center">
              <div className="min-w-0 flex items-center gap-2 sm:gap-4">
                <div className="shrink-0 p-2 sm:p-3 bg-blue-500/10 rounded-xl">
                  <QrCode className="w-6 h-6 text-blue-500" />
                </div>
                <div className="min-w-0 break-words">
                  <p className="text-sm text-muted-foreground">QR Visits</p>
                  <p className="text-2xl font-bold">{statsAvailable ? viewStats.qrScans.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>
          {statsAvailable && (
            <div className="mt-4 p-4 rounded-xl bg-card border border-border min-w-0">
              <h3 className="font-semibold text-sm mb-1">Daily visits</h3>
              <p className="text-xs text-muted-foreground mb-4">{ANALYTICS_RANGE_LABELS[timeRange]} · {viewStats.data[0].label}{viewStats.data.length > 1 ? ` – ${viewStats.data[viewStats.data.length - 1].label}` : ''}</p>
              <MenuViewsChart data={viewStats.data} />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Menu views include QR visits. Repeat opens in the same browser tab session are counted once per entry method (link or QR), not on every refresh. These are visits, not unique people.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="analytics"
        onTabChange={handleTabChange}
        isAdmin={true}
      />
    </div>
  );
}
