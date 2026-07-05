import { useState } from 'react';
import { useApp } from '@/store';
import {
  ArrowLeft, CheckCircle2, MapPin, Phone, Mail, Globe, Star, Eye,
  QrCode, TrendingUp, Users, Clock, Calendar, CreditCard, Shield,
  Activity, Share2, Heart, MoreHorizontal, BarChart3, UtensilsCrossed,
  Image as ImageIcon, Video, FileText, Monitor, Smartphone, Laptop,
} from 'lucide-react';

export function CompanyShopDetail() {
  const { state, dispatch } = useApp();
  const shop = state.selectedManagedShop;
  const [activeTab, setActiveTab] = useState('overview');

  if (!shop) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu Stats', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Monitor className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
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
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-500/20 via-violet-500/10 to-blue-500/20 relative">
          <div className="absolute top-3 right-3 flex items-center gap-2">
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
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-card">
              {shop.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{shop.name}</h2>
                {shop.verified && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shop.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
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
              <button className="px-4 py-2 rounded-xl bg-muted/50 text-sm font-medium hover:bg-muted/70 transition-colors">
                Edit
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
          <div key={stat.label} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-center">
            <div className={`flex justify-center mb-1.5 ${stat.color}`}>{stat.icon}</div>
            <p className="text-sm font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
        <div className="flex items-center gap-1 p-2 border-b border-border/50 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
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
                    <div key={info.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
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
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
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
                  <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    Change Plan
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-semibold">{shop.createdAt}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="text-sm font-semibold">{shop.expiresAt}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Auto Renew</p>
                  <p className="text-sm font-semibold text-emerald-500">Enabled</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Recent Invoices</h4>
                {[
                  { id: 'INV-001', date: '2026-07-01', amount: '$24.99', status: 'Paid' },
                  { id: 'INV-002', date: '2026-06-01', amount: '$24.99', status: 'Paid' },
                  { id: 'INV-003', date: '2026-05-01', amount: '$24.99', status: 'Paid' },
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{inv.amount}</p>
                      <p className="text-xs text-emerald-500">{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Daily Views', value: '1,240', change: '+12%' },
                { label: 'QR Scans Today', value: '89', change: '+8%' },
                { label: 'Peak Hours', value: '12-2 PM', change: '' },
                { label: 'Bounce Rate', value: '24%', change: '-3%' },
                { label: 'Avg Session', value: '2m 34s', change: '+15%' },
                { label: 'Top Category', value: 'Main Course', change: '' },
                { label: 'Popular Item', value: 'Chicken Rice', change: '' },
                { label: 'Conversion', value: '36.4%', change: '+5%' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-xs mt-0.5 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.change}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Categories', value: '8', icon: <BarChart3 className="w-5 h-5 text-blue-500" /> },
                { label: 'Total Items', value: `${shop.menuItems}`, icon: <UtensilsCrossed className="w-5 h-5 text-orange-500" /> },
                { label: 'Active Offers', value: '5', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
                { label: 'Hidden Items', value: '3', icon: <Eye className="w-5 h-5 text-slate-500" /> },
                { label: 'Unavailable', value: '7', icon: <Clock className="w-5 h-5 text-red-500" /> },
                { label: 'Images', value: '64', icon: <ImageIcon className="w-5 h-5 text-violet-500" /> },
                { label: 'Videos', value: '2', icon: <Video className="w-5 h-5 text-pink-500" /> },
                { label: 'PDF Menus', value: '1', icon: <FileText className="w-5 h-5 text-amber-500" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/20">
                  {stat.icon}
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">Media Gallery</h3>
              <p className="text-sm text-muted-foreground">All uploaded images, videos, logos and banners for this shop</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-3">
              {[
                { name: shop.owner, role: 'Owner', email: shop.ownerEmail, lastLogin: '2h ago', status: 'Online' },
                { name: 'Ashen Kumar', role: 'Manager', email: 'ashen@example.com', lastLogin: '1d ago', status: 'Offline' },
                { name: 'Nisala Perera', role: 'Staff', email: 'nisala@example.com', lastLogin: '5h ago', status: 'Online' },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${member.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role} • {member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Last login</p>
                    <p className="text-sm font-medium">{member.lastLogin}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-3">
              {[
                { device: 'Chrome on Windows', icon: <Laptop className="w-5 h-5" />, location: 'Colombo, LK', lastActive: 'Now', current: true },
                { device: 'Safari on iPhone', icon: <Smartphone className="w-5 h-5" />, location: 'Colombo, LK', lastActive: '2h ago', current: false },
                { device: 'Firefox on MacOS', icon: <Monitor className="w-5 h-5" />, location: 'Kandy, LK', lastActive: '3d ago', current: false },
              ].map((device, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">{device.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{device.device}</p>
                        {device.current && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-medium">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{device.location} • {device.lastActive}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <button className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                      Logout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {[
                { action: 'Menu updated — Added 3 new items', time: '2h ago', type: 'info' },
                { action: 'Theme changed to "Ocean Breeze"', time: '1d ago', type: 'info' },
                { action: 'Subscription renewed — Pro Plan', time: '3d ago', type: 'success' },
                { action: 'QR Code regenerated', time: '5d ago', type: 'info' },
                { action: 'Payment received — $24.99', time: '1w ago', type: 'success' },
                { action: 'Profile image updated', time: '2w ago', type: 'info' },
                { action: 'Login from new device — iPhone', time: '2w ago', type: 'warning' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
