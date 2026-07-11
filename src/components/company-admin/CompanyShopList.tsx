import { useState, useEffect } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import type { ManagedShop } from '@/types';
import {
  Search, Filter, Download, Upload, RefreshCw, LayoutGrid, List,
  Eye, Pencil, Pause, Trash2, MessageSquare, MapPin,
  Star, CheckCircle2, XCircle, Clock, ChevronDown,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  trial: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  expired: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const planColors: Record<string, string> = {
  free: 'bg-slate-500/10 text-slate-500',
  starter: 'bg-blue-500/10 text-blue-500',
  pro: 'bg-orange-500/10 text-orange-500',
  enterprise: 'bg-violet-500/10 text-violet-500',
};

export function CompanyShopList() {
  const { dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<ManagedShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          profiles:user_id (
            email,
            subscription_plan,
            subscription_status,
            subscription_expires_at
          ),
          food_items ( count )
        `);
      
      if (error) throw error;

      const mappedShops: ManagedShop[] = ((data as any) || []).map((shop: any) => {
        const profile = Array.isArray(shop.profiles) ? shop.profiles[0] : shop.profiles;
        const itemsCount = shop.food_items?.[0]?.count || 0;
        return {
          id: shop.id,
          name: shop.name || 'Unnamed Shop',
          owner: profile?.email ? profile.email.split('@')[0] : 'Shop Owner',
          ownerEmail: profile?.email || shop.email || '',
          phone: shop.contact_number || 'No Phone',
          location: shop.location || 'No location',
          plan: (profile?.subscription_plan || 'free') as ManagedShop['plan'],
          status: (profile?.subscription_status || 'active') as ManagedShop['status'],
          revenue: 0,
          menuItems: itemsCount,
          rating: 5.0,
          verified: true,
          createdAt: new Date(shop.created_at).toLocaleDateString(),
          expiresAt: profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'Never',
          logo: shop.logo || '',
          banner: shop.banner || '',
          qrScans: 0,
          visitors: 0
        };
      });
      setShops(mappedShops);
    } catch (err) {
      console.error('Failed to fetch shops', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filtered = shops.filter((shop) => {
    const matchSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || shop.status === statusFilter;
    const matchPlan = planFilter === 'all' || shop.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const openShopDetail = (shop: ManagedShop) => {
    dispatch({ type: 'SELECT_MANAGED_SHOP', payload: shop });
    dispatch({ type: 'SET_COMPANY_ADMIN_SECTION', payload: 'shop-detail' });
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shop Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} shops found</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shops, owners, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid View / Table View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading shops...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((shop) => (
            <div
              key={shop.id}
              className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="relative h-24 bg-gradient-to-br from-orange-500/10 to-violet-500/10">
                {shop.banner && (
                  <img src={shop.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[shop.status]}`}>
                    {shop.status}
                  </span>
                  {shop.verified && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-6 left-4 z-10">
                  {shop.logo ? (
                    <div className="w-14 h-14 rounded-xl shadow-lg border-4 border-card overflow-hidden bg-card">
                      <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-lg border-4 border-card">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-8 px-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{shop.name}</h3>
                    <p className="text-xs text-muted-foreground">{shop.owner}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${planColors[shop.plan]}`}>
                    {shop.plan}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  {shop.location}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-emerald-500">${shop.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="text-sm font-semibold">{shop.menuItems}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-semibold flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {shop.rating}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  Expires: {shop.expiresAt}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                  <button
                    onClick={() => openShopDetail(shop)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Shop</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Owner</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Revenue</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Plan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Verified</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Expires</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((shop) => (
                  <tr key={shop.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {shop.logo ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-card shrink-0">
                            <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {shop.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{shop.name}</p>
                          <p className="text-[11px] text-muted-foreground">{shop.menuItems} items</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{shop.owner}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{shop.location}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-emerald-500">${shop.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${planColors[shop.plan]}`}>
                        {shop.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[shop.status]}`}>
                        {shop.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {shop.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{shop.expiresAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openShopDetail(shop)}
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
