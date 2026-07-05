import { useState } from 'react';
import {
  Store, UserPlus, Tag, Palette, BarChart3, Bell, TrendingUp, TrendingDown,
  ArrowUpRight, DollarSign, CheckCircle, Clock, AlertCircle, ShieldCheck,
  PauseCircle, CreditCard, RefreshCw, Ban, UtensilsCrossed, Zap, Eye,
  ChevronRight, Send,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  mockKPICards, mockActivities, mockRevenueData, mockGrowthData,
  mockPlanDistribution, mockManagedShops,
} from '@/data/companyAdminData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const iconMap: Record<string, React.ReactNode> = {
  Store: <Store className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  UserPlus: <UserPlus className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  PauseCircle: <PauseCircle className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Ban: <Ban className="w-5 h-5" />,
};

export function CompanyDashboard() {
  const { dispatch } = useApp();
  const [revenueRange, setRevenueRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const quickActions = [
    { label: 'Add Shop', icon: <Store className="w-4 h-4" />, color: 'from-blue-500 to-blue-600' },
    { label: 'Send Notification', icon: <Send className="w-4 h-4" />, color: 'from-violet-500 to-violet-600' },
    { label: 'Create Coupon', icon: <Tag className="w-4 h-4" />, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Create Theme', icon: <Palette className="w-4 h-4" />, color: 'from-pink-500 to-pink-600' },
    { label: 'View Reports', icon: <BarChart3 className="w-4 h-4" />, color: 'from-amber-500 to-amber-600' },
  ];

  const insights = [
    { text: 'Revenue increased 14.5% compared to last month', type: 'positive' as const },
    { text: '20 subscriptions expiring in the next 7 days', type: 'warning' as const },
    { text: '5 businesses inactive for over 30 days', type: 'negative' as const },
    { text: 'Pro Plan is the most popular plan this quarter', type: 'info' as const },
    { text: 'Colombo is the highest performing city', type: 'positive' as const },
  ];

  const topShops = mockManagedShops
    .filter((s) => s.status === 'active')
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening with Menuzo today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r ${action.color} hover:opacity-90 transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5`}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {mockKPICards.map((kpi, index) => (
          <div
            key={kpi.title}
            className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
                {iconMap[kpi.icon] || <BarChart3 className="w-5 h-5" />}
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                kpi.trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : kpi.trend === 'down'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-slate-500/10 text-slate-500'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground/70">
              Previous: {kpi.previousValue}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold">Revenue Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue breakdown</p>
            </div>
            <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setRevenueRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    revenueRange === range
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(31.8, 100%, 49.2%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(31.8, 100%, 49.2%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="renewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(31.8, 100%, 49.2%)" fill="url(#revenueGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="renewals" stroke="#22c55e" fill="url(#renewGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="newPlans" stroke="#8b5cf6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-orange-500" />
              Revenue
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-emerald-500" />
              Renewals
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-violet-500" />
              New Plans
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-1">Plan Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Active subscriber breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockPlanDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
                stroke="none"
              >
                {mockPlanDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {mockPlanDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: plan.fill }} />
                  <span>{plan.name}</span>
                </div>
                <span className="font-semibold">{plan.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth + Activity + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Growth Chart */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-1">Shop Growth</h3>
          <p className="text-xs text-muted-foreground mb-4">Registration & active shop trends</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="registrations" fill="hsl(31.8, 100%, 49.2%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="churn" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time feed</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-hide pr-1">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.type === 'registration' ? 'bg-blue-500/10 text-blue-500' :
                  activity.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' :
                  activity.type === 'renewal' ? 'bg-violet-500/10 text-violet-500' :
                  activity.type === 'theme' ? 'bg-pink-500/10 text-pink-500' :
                  activity.type === 'menu-update' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {iconMap[activity.icon] || <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.shopName}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Insights</h3>
              <p className="text-xs text-muted-foreground">AI-powered analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${
                  insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                  insight.type === 'negative' ? 'bg-red-500/5 border-red-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  insight.type === 'positive' ? 'bg-emerald-500' :
                  insight.type === 'warning' ? 'bg-amber-500' :
                  insight.type === 'negative' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <p className="text-sm leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Top Revenue Shops</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Highest performing businesses</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_COMPANY_ADMIN_SECTION', payload: 'shops' })}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">#</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Shop</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Owner</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Location</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Revenue</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Plan</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 pr-4">Rating</th>
                <th className="text-right text-xs font-semibold text-muted-foreground py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {topShops.map((shop, i) => (
                <tr key={shop.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-700' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                        {shop.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{shop.name}</p>
                        <p className="text-[11px] text-muted-foreground">{shop.menuItems} items</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{shop.owner}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{shop.location}</td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-semibold text-emerald-500">${shop.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      shop.plan === 'enterprise' ? 'bg-violet-500/10 text-violet-500' :
                      shop.plan === 'pro' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>{shop.plan}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-amber-500">★</span>
                      {shop.rating}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        dispatch({ type: 'SELECT_MANAGED_SHOP', payload: shop });
                        dispatch({ type: 'SET_COMPANY_ADMIN_SECTION', payload: 'shop-detail' });
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
