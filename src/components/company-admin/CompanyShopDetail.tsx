import { useState } from 'react';
import { useApp } from '@/store';
import {
  ArrowLeft, CheckCircle2, MapPin, Phone, Mail, Star, Eye,
  QrCode, TrendingUp, Users, Clock, Calendar, CreditCard,
  Activity, Share2, Heart, MoreHorizontal, BarChart3, UtensilsCrossed,
  Image as ImageIcon, Video, FileText, Monitor, Smartphone, Laptop, Link
} from 'lucide-react';
import { getShopThemeStyles } from '@/lib/themeUtils';
import { supabase } from '@/lib/supabase';

export function CompanyShopDetail() {
  const { state, dispatch } = useApp();
  const shop = state.selectedManagedShop;
  const [activeTab, setActiveTab] = useState('overview');

  if (!shop) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'url', label: 'URL Assignment', icon: <Link className="w-4 h-4" /> },
    { id: 'theme', label: 'Theme Colors', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const [usernameInput, setUsernameInput] = useState(shop.username || '');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const handleSaveUsername = async () => {
    if (!usernameInput.trim()) return;
    setIsSavingUrl(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({ username: usernameInput.trim() })
        .eq('id', shop.id);

      if (error) throw error;
      alert('Username updated successfully. Please re-fetch shops to see changes globally.');
    } catch (err: any) {
      alert(err.message || 'Failed to update username');
    } finally {
      setIsSavingUrl(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up bg-background text-foreground min-h-[calc(100vh-6rem)] -m-4 lg:-m-6 p-4 lg:p-6" style={getShopThemeStyles(shop.theme)}>
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_COMPANY_ADMIN_SECTION', payload: 'shops' })}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Shop Details</h1>
      </div>

      {/* Shop Hero */}
      <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <div className="h-32 relative bg-primary/10">
          {shop.banner && (
            <img src={shop.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button className="p-2 rounded-lg bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 -mt-10 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            {shop.logo ? (
              <div className="w-20 h-20 rounded-2xl shadow-xl border-4 border-card overflow-hidden bg-card z-10 shrink-0">
                <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-xl border-4 border-card z-10 shrink-0">
                {shop.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{shop.name}</h2>
                {shop.verified && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${shop.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                    shop.status === 'suspended' ? 'bg-red-500/10 text-red-500' :
                      shop.status === 'trial' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-500'
                  }`}>
                  {shop.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{shop.owner}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{shop.location}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{shop.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                Message
              </button>
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to ${shop.status === 'suspended' ? 'reinstate' : 'suspend'} this shop?`)) {
                    const newStatus = shop.status === 'suspended' ? 'active' : 'suspended';
                    const { error } = await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', shop.userId);
                    if (error) alert('Failed: ' + error.message);
                    else alert(`Shop successfully ${shop.status === 'suspended' ? 'reinstated' : 'suspended'}. Please return to shop list to refresh.`);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${shop.status === 'suspended'
                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}
              >
                {shop.status === 'suspended' ? 'Reinstate Shop' : 'Suspend Shop'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Revenue', value: `$${shop.revenue.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'QR Scans', value: shop.qrScans.toLocaleString(), icon: <QrCode className="w-4 h-4" />, color: 'text-blue-500' },
          { label: 'Visitors', value: shop.visitors.toLocaleString(), icon: <Eye className="w-4 h-4" />, color: 'text-violet-500' },
          { label: 'Menu Items', value: shop.menuItems, icon: <UtensilsCrossed className="w-4 h-4" />, color: 'text-amber-500' },
          { label: 'Plan', value: shop.plan, icon: <CreditCard className="w-4 h-4" />, color: 'text-orange-500' },
          { label: 'Expires', value: shop.expiresAt, icon: <Calendar className="w-4 h-4" />, color: 'text-pink-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card backdrop-blur-sm border border-border/50 rounded-xl p-3 text-center">
            <div className={`flex justify-center mb-1.5 ${stat.color}`}>{stat.icon}</div>
            <p className="text-sm font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl">
        <div className="flex items-center gap-1 p-2 border-b border-border/50 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Business Information</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Owner', value: shop.owner, icon: <Users className="w-4 h-4" /> },
                    { label: 'Email', value: shop.ownerEmail, icon: <Mail className="w-4 h-4" /> },
                    { label: 'Phone', value: shop.phone, icon: <Phone className="w-4 h-4" /> },
                    { label: 'Location', value: shop.location, icon: <MapPin className="w-4 h-4" /> },
                    { label: 'Rating', value: `${shop.rating} / 5.0`, icon: <Star className="w-4 h-4" /> },
                    { label: 'Created', value: shop.createdAt, icon: <Calendar className="w-4 h-4" /> },
                  ].map((info) => (
                    <div key={info.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <div className="text-muted-foreground">{info.icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{info.label}</p>
                        <p className="text-sm font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance Metrics</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total Revenue', value: `$${shop.revenue.toLocaleString()}`, color: 'text-emerald-500' },
                    { label: 'Total QR Scans', value: shop.qrScans.toLocaleString(), color: 'text-blue-500' },
                    { label: 'Total Visitors', value: shop.visitors.toLocaleString(), color: 'text-violet-500' },
                    { label: 'Menu Items', value: `${shop.menuItems} items`, color: 'text-amber-500' },
                    { label: 'Conversion Rate', value: `${((shop.qrScans / shop.visitors) * 100).toFixed(1)}%`, color: 'text-pink-500' },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <span className={`text-sm font-bold ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-violet-500/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="text-xl font-bold capitalize">{shop.plan} Plan</p>
                  </div>
                  <select
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium focus:outline-none appearance-none cursor-pointer"
                    value={shop.plan}
                    disabled={isChangingPlan}
                    onChange={async (e) => {
                      const newPlan = e.target.value;
                      if (window.confirm(`Change plan to ${newPlan}?`)) {
                        setIsChangingPlan(true);
                        try {
                          const expiresAt = new Date();
                          expiresAt.setMonth(expiresAt.getMonth() + 1);
                          const { error } = await supabase.from('profiles').update({
                            subscription_plan: newPlan,
                            subscription_expires_at: expiresAt.toISOString(),
                          }).eq('id', shop.userId);
                          if (error) throw error;
                          alert('Plan changed successfully. Return to shop list to refresh.');
                        } catch (err: any) {
                          alert('Failed: ' + err.message);
                        } finally {
                          setIsChangingPlan(false);
                        }
                      }
                    }}
                  >
                    <option value="free" className="bg-background text-foreground">Free</option>
                    <option value="starter" className="bg-background text-foreground">Starter</option>
                    <option value="pro" className="bg-background text-foreground">Pro</option>
                    <option value="enterprise" className="bg-background text-foreground">Enterprise</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted text-center">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-semibold">{shop.createdAt}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted text-center">
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="text-sm font-semibold">{shop.expiresAt}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted text-center">
                  <p className="text-xs text-muted-foreground">Auto Renew</p>
                  <p className="text-sm font-semibold text-emerald-500">Enabled</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custom URL Assignment</h3>
              <div className="p-4 rounded-xl bg-muted border border-border/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Set the shop's username. This updates their custom URL routing.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter username"
                    className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={isSavingUrl}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {isSavingUrl ? 'Saving...' : 'Save URL'}
                  </button>
                </div>
                <div className="mt-4 p-3 bg-background/50 rounded-lg text-xs text-muted-foreground space-y-1">
                  <p><strong>Free URL:</strong> /shop/{usernameInput || shop.username}</p>
                  <p><strong>Pro URL:</strong> /{usernameInput || shop.username}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && shop.theme && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shop Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Primary Color</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: shop.theme.primary }} />
                    <span className="text-sm font-medium">{shop.theme.primary}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Secondary Color</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: shop.theme.secondary }} />
                    <span className="text-sm font-medium">{shop.theme.secondary}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Accent Color</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: shop.theme.accent }} />
                    <span className="text-sm font-medium">{shop.theme.accent}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
