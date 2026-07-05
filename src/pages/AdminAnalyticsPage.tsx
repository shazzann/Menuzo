import { useState } from 'react';
import { Settings, CreditCard, Calendar, TrendingUp, Users, Eye, Utensils, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab } from '@/types';
import { cn } from '@/lib/utils';

export function AdminAnalyticsPage() {
  const { state, dispatch } = useApp();
  const { user, foodItems, categories } = state;
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

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

  // Mock data for analytics
  const viewStats = {
    today: { views: 245, trend: '+12%', orders: 45 },
    week: { views: 1840, trend: '+5%', orders: 320 },
    month: { views: 8450, trend: '+18%', orders: 1450 }
  };

  const currentStats = viewStats[timeRange];

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
                <p className={cn('font-bold text-lg capitalize', getPlanColor(user?.subscription?.plan || 'free'))}>
                  {user?.subscription?.plan || 'Free'}
                </p>
              </div>
            </div>
            <span className={cn('px-3 py-1 text-xs font-mono uppercase rounded-full', getPlanBadge(user?.subscription?.plan || 'free'))}>
              {user?.subscription?.status || 'Active'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span>Expires {user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : 'N/A'}</span>
          </div>

          <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
            Upgrade Plan
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Shop Performance</h3>
            <div className="flex bg-muted rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors",
                    timeRange === range ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Menu Views</p>
                  <p className="text-2xl font-bold">{currentStats.views.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {currentStats.trend}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Orders</p>
                  <p className="text-2xl font-bold">{currentStats.orders.toLocaleString()}</p>
                </div>
              </div>
            </div>
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
