import { mockRevenueData, mockGrowthData, mockPlanDistribution } from '@/data/companyAdminData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, Store, Download, Calendar,
  ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon,
} from 'lucide-react';
import { useState } from 'react';

export function CompanyReports() {
  const [reportType, setReportType] = useState<'revenue' | 'shops' | 'usage' | 'growth'>('revenue');

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'shops' as const, label: 'Shops', icon: <Store className="w-4 h-4" /> },
    { id: 'usage' as const, label: 'Usage', icon: <PieChartIcon className="w-4 h-4" /> },
    { id: 'growth' as const, label: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Comprehensive platform insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              reportType === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: '$524K', change: '+12%', positive: true, icon: <DollarSign className="w-5 h-5" /> },
          { label: 'Active Shops', value: '2,134', change: '+6.2%', positive: true, icon: <Store className="w-5 h-5" /> },
          { label: 'New Users', value: '167', change: '+16.8%', positive: true, icon: <Users className="w-5 h-5" /> },
          { label: 'Churn Rate', value: '2.1%', change: '-0.5%', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-foreground">{kpi.icon}</div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Revenue Trend */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="reportRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(31.8, 100%, 49.2%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(31.8, 100%, 49.2%)" stopOpacity={0} />
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
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(31.8, 100%, 49.2%)" fill="url(#reportRevenueGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockPlanDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
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
          <div className="flex items-center justify-center gap-4 mt-2">
            {mockPlanDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: plan.fill }} />
                <span>{plan.name}</span>
                <span className="font-semibold">({plan.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Shop Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="active" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="registrations" stroke="hsl(31.8, 100%, 49.2%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Registrations vs Churn */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Registrations vs Churn</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
      </div>

      {/* Top Regions */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
        <div className="space-y-3">
          {[
            { region: 'Colombo', shops: 842, revenue: '$18.2K', percentage: 38 },
            { region: 'Kandy', shops: 356, revenue: '$8.4K', percentage: 18 },
            { region: 'Galle', shops: 284, revenue: '$6.1K', percentage: 13 },
            { region: 'Jaffna', shops: 198, revenue: '$3.8K', percentage: 8 },
            { region: 'Ella', shops: 165, revenue: '$4.2K', percentage: 9 },
            { region: 'Other', shops: 289, revenue: '$7.5K', percentage: 14 },
          ].map((region) => (
            <div key={region.region} className="flex items-center gap-4">
              <span className="text-sm font-medium w-20">{region.region}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-20 text-right">{region.shops} shops</span>
              <span className="text-sm font-semibold text-emerald-500 w-20 text-right">{region.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
