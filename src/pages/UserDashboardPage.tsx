import { 
  Utensils, 
  TrendingUp, 
  Settings, 
  QrCode,
  Crown,
  Calendar,
  Plus,
  Copy,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Download
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { SmallQrPreview, type SmallQrPreviewRef } from '@/components/admin/SmallQrPreview';
import type { AdminTab } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock data for the chart
const chartData = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 550 },
  { name: 'Thu', views: 450 },
  { name: 'Fri', views: 700 },
  { name: 'Sat', views: 1200 },
  { name: 'Sun', views: 1400 },
];

export function UserDashboardPage() {
  const { state, dispatch } = useApp();
  const { shop, foodItems, user } = state;
  const [isLoadingData, setIsLoadingData] = useState(true);
  const qrRef = useRef<SmallQrPreviewRef>(null);

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

        {/* Subscription / Plan Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm capitalize">{user?.subscription?.plan || 'Pro'} Plan Active</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Renews {user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : 'Dec 31, 2025'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
            Manage
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
        ) : (
          <>
            {/* Chart Section */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Menu Views</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">5,000</p>
              <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1">
                <TrendingUp className="w-3 h-3" />
                +24%
              </span>
            </div>
          </div>
          <div className="h-40 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

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
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">QR Scans Today</p>
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
                   shopUrl={`${window.location.origin}/${shop.username || 'menuzo'}/menu`}
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
                    {typeof window !== 'undefined' ? `${window.location.host}/${shop.username || 'menuzo'}/menu` : `menuzo.com/${shop.username || 'menuzo'}/menu`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background rounded-lg flex-shrink-0 text-muted-foreground hover:text-foreground shadow-sm" onClick={() => {
                      if (qrRef.current) {
                        qrRef.current.download(`${shop.name.toLowerCase().replace(/\s+/g, '-')}-qr`);
                        toast.success('QR Code downloaded!');
                      }
                    }}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background rounded-lg flex-shrink-0 text-muted-foreground hover:text-foreground shadow-sm" onClick={() => {
                      const url = `${window.location.origin}/${shop.username || 'menuzo'}/menu`;
                      navigator.clipboard.writeText(url);
                      toast.success('Menu link copied!');
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="default" 
                      className="h-8 w-8 rounded-lg flex-shrink-0 bg-[#FB8500] hover:bg-[#FB8500]/90 text-black shadow-sm"
                      onClick={() => window.open(`/${shop.username || 'menuzo'}/menu`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Information */}
            <div className="p-4 border-b border-border/50 bg-muted/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Style</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (shop.theme as any)?.qrStyle === 'brand' ? shop.theme?.accent || '#FB8500' : '#000' }} />
                  <span className="text-sm font-medium capitalize">{(shop.theme as any)?.qrStyle === 'brand' ? 'Brand QR' : 'Classic QR'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Logo</p>
                <span className="text-sm font-medium">{shop.logo ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 flex flex-col sm:flex-row gap-2 bg-muted/5">
              <Button 
                variant="default" 
                className="w-full text-xs h-9"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              >
                Customize QR
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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
          </div>
        </div>
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
