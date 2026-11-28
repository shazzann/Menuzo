import { useState } from 'react';
import { Settings, Calendar, QrCode, Utensils, LayoutGrid, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { ShopLogoAvatar } from '@/components/shared/ShopLogoAvatar';
import type { AdminTab } from '@/types';
import { cn } from '@/lib/utils';
import { isProActive, isPaidActive, getPlanLimits } from '@/lib/subscription';
import { ANALYTICS_RANGE_LABELS, summarizeShopViews, viewsTrend, type AnalyticsRange } from '@/lib/shopAnalytics';
import { MenuViewsChart, TrendBadge } from '@/components/admin/MenuViewsChart';

export function AdminAnalyticsPage() {
  const { state, dispatch } = useApp();
  const { user, foodItems, categories, shop } = state;
  const proActive = typeof isPaidActive === 'function' ? isPaidActive(user?.subscription) : isProActive(user?.subscription);
  const activePlanTier = user?.subscription?.plan ?? (proActive ? 'plus' : 'free');
  const isEnterprise = proActive && activePlanTier === 'enterprise';
  const planDisplayName = isEnterprise ? 'Enterprise' : proActive ? 'Plus' : 'Free';
  const planLimits = typeof getPlanLimits === 'function' ? getPlanLimits(user?.subscription) : { items: 10, categories: 2 };
  const currentCategories = (categories || []).filter((c) => c.id !== 'all');
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

  const viewStats = summarizeShopViews(shop?.daily_stats, timeRange);
  const statsAvailable = shop?.daily_stats !== undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ShopLogoAvatar logo={shop.logo} name={shop.name} />
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
        {/* Subscription & Usage Limits Card */}
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

        {!proActive && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Analytics Dashboard is a Plus Feature</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upgrade to Menuzo Plus for full access to live menu view tracking, QR scan analytics, and customer engagement trends.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' })}
            >
              Upgrade to Plus
            </Button>
          </div>
        )}

        {/* Shop Content Stats */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Menu Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg shrink-0">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums">{foodItems.length}</span>
                    <span className="text-xs text-muted-foreground font-normal">/ {planLimits.items}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Food Items</p>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-background overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    foodItems.length >= planLimits.items
                      ? 'bg-destructive'
                      : isEnterprise
                      ? 'bg-purple-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((foodItems.length / planLimits.items) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg shrink-0">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums">{currentCategories.length}</span>
                    <span className="text-xs text-muted-foreground font-normal">/ {planLimits.categories}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Categories</p>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-background overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentCategories.length >= planLimits.categories
                      ? 'bg-destructive'
                      : isEnterprise
                      ? 'bg-purple-500'
                      : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((currentCategories.length / planLimits.categories) * 100))}%`,
                  }}
                />
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
          
          {shop.dailyStatsError && statsAvailable && <p role="alert" className="text-xs text-muted-foreground mb-3">{shop.dailyStatsError}</p>}
          {!statsAvailable && (
            <div role="alert" className="mb-3 p-4 rounded-xl bg-muted text-sm">
              Daily statistics could not be loaded.
              <Button variant="link" onClick={() => dispatch({ type: 'RETRY_SHOP_LOAD' })}>Retry</Button>
            </div>
          )}
          <div className="pt-4 rounded-2xl bg-card border border-border overflow-hidden min-w-0">
            <div className="flex items-start justify-between gap-3 px-4">
              <div>
                <h3 className="font-semibold">Menu Views</h3>
                <p className="text-sm text-muted-foreground">{ANALYTICS_RANGE_LABELS[timeRange]}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none text-primary">
                  {statsAvailable ? viewStats.views.toLocaleString() : '—'}
                </p>
                <TrendBadge value={viewsTrend(shop?.daily_stats, timeRange)} />
              </div>
            </div>
            {statsAvailable ? <MenuViewsChart data={viewStats.data} className="mt-2" /> : <div className="h-6" />}
          </div>

          <div className="mt-3 p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-muted rounded-xl"><QrCode className="w-5 h-5 text-foreground" /></span>
              <div>
                <p className="font-semibold text-sm">QR Scans</p>
                <p className="text-xs text-muted-foreground">Opened from your QR code</p>
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none">
              {statsAvailable ? viewStats.qrScans.toLocaleString() : '—'}
            </p>
          </div>
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
