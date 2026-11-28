import type { KPICard, ManagedShop, ThemeConfig } from '@/types';

/** What the admin_dashboard_stats RPC returns. Counts may arrive as strings from Postgres. */
export interface AdminDashboardStats {
  currency: string;
  total_shops: number | string;
  total_shops_before_month: number | string;
  open_shops: number | string;
  closed_shops: number | string;
  new_shops_month: number | string;
  new_shops_prev_month: number | string;
  pending_payments: number | string;
  revenue_month: number | string;
  revenue_prev_month: number | string;
  paying_shops_month: number | string;
  paying_shops_prev_month: number | string;
  revenue_year: number | string;
  revenue_prev_year: number | string;
}

const num = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export function formatMoney(amount: number, currency: string) {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 10_000) return `${currency} ${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${currency} ${Math.round(amount).toLocaleString('en-US')}`;
}

/** Percent change from previous to current, rounded to one decimal. Null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function compared(
  base: Omit<KPICard, 'value' | 'previousValue' | 'change' | 'trend'>,
  current: number,
  previous: number,
  format: (n: number) => string | number,
  previousLabel: string,
): KPICard {
  const change = percentChange(current, previous);
  return {
    ...base,
    value: format(current),
    previousValue: `${format(previous)} ${previousLabel}`,
    change: change ?? 0,
    trend: change === null || change === 0 ? 'neutral' : change > 0 ? 'up' : 'down',
    hideChange: change === null,
  };
}

export function buildDashboardKpis(stats: AdminDashboardStats): KPICard[] {
  const currency = stats.currency || 'LKR';
  const money = (n: number) => formatMoney(n, currency);
  const count = (n: number) => n.toLocaleString('en-US');

  const revenueMonth = num(stats.revenue_month);
  const revenuePrevMonth = num(stats.revenue_prev_month);
  const payingMonth = num(stats.paying_shops_month);
  const payingPrevMonth = num(stats.paying_shops_prev_month);
  const avg = payingMonth ? revenueMonth / payingMonth : 0;
  const avgPrev = payingPrevMonth ? revenuePrevMonth / payingPrevMonth : 0;

  return [
    compared({ title: 'Total Shops', icon: 'Store', color: 'from-blue-500 to-blue-600' },
      num(stats.total_shops), num(stats.total_shops_before_month), count, 'at start of month'),
    {
      title: 'Active Shops', icon: 'CheckCircle', color: 'from-emerald-500 to-emerald-600',
      value: count(num(stats.open_shops)), previousValue: 'Menu open to customers',
      change: 0, trend: 'neutral', hideChange: true,
    },
    compared({ title: 'Monthly Revenue', icon: 'DollarSign', color: 'from-violet-500 to-violet-600' },
      revenueMonth, revenuePrevMonth, money, 'last month'),
    compared({ title: 'Annual Revenue', icon: 'TrendingUp', color: 'from-cyan-500 to-cyan-600' },
      num(stats.revenue_year), num(stats.revenue_prev_year), money, 'last year'),
    compared({ title: 'New Registrations', icon: 'UserPlus', color: 'from-pink-500 to-pink-600' },
      num(stats.new_shops_month), num(stats.new_shops_prev_month), count, 'last month'),
    {
      title: 'Pending Verification', icon: 'ShieldCheck', color: 'from-orange-500 to-orange-600',
      value: count(num(stats.pending_payments)), previousValue: 'Payments waiting for review',
      change: 0, trend: 'neutral', hideChange: true,
    },
    compared({ title: 'Avg Revenue/Shop', icon: 'BarChart3', color: 'from-teal-500 to-teal-600' },
      avg, avgPrev, money, 'last month'),
    {
      title: 'Inactive Shops', icon: 'PauseCircle', color: 'from-slate-500 to-slate-600',
      value: count(num(stats.closed_shops)), previousValue: 'Menu closed to customers',
      change: 0, trend: 'neutral', hideChange: true,
    },
  ];
}

export type RevenueRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RevenuePoint { label: string; revenue: number; renewals: number; newPlans: number }
export interface AdminDashboardRevenue { currency: string; points: RevenuePoint[] }

export interface DashboardActivity {
  type: 'registration' | 'payment-submitted' | 'payment' | 'rejected';
  message: string;
  shopName: string;
  at: string;
}

export interface DashboardTopShop {
  id: string;
  name: string;
  owner: string | null;
  location: string | null;
  revenue: number;
  plan: string;
  items: number;
  phone: string | null;
  logo: string | null;
  banner: string | null;
  theme: ThemeConfig | null;
  status: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface AdminDashboardOverview {
  currency: string;
  plan_distribution: { slug: string; name: string; value: number }[];
  growth: { month: string; registrations: number; churn: number }[];
  activity: DashboardActivity[];
  top_shops: DashboardTopShop[];
  expiring_soon: number;
  top_city: { city: string; shops: number } | null;
}

export interface DashboardInsight { text: string; type: 'positive' | 'warning' | 'negative' | 'info' }

const PLAN_COLORS: Record<string, string> = {
  free: '#64748b',
  plus: '#f97316',
  enterprise: '#8b5cf6',
};
const EXTRA_COLORS = ['#3b82f6', '#14b8a6', '#ec4899', '#eab308', '#22c55e'];

/** Adds a chart color to each plan; known plans keep a fixed color, others share a rotating set. */
export function withPlanColors(plans: AdminDashboardOverview['plan_distribution']) {
  let extra = 0;
  return plans.map((plan) => ({
    ...plan,
    value: num(plan.value),
    fill: PLAN_COLORS[plan.slug] ?? EXTRA_COLORS[extra++ % EXTRA_COLORS.length],
  }));
}

export function timeAgo(iso: string, now: Date = new Date()) {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Plain-language observations built from the live numbers. Only says things that are true right now. */
export function buildInsights(stats: AdminDashboardStats | null, overview: AdminDashboardOverview | null): DashboardInsight[] {
  const insights: DashboardInsight[] = [];
  if (stats) {
    const change = percentChange(num(stats.revenue_month), num(stats.revenue_prev_month));
    if (change !== null && change !== 0) {
      insights.push({
        text: `Revenue is ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% compared with the same point last month`,
        type: change > 0 ? 'positive' : 'negative',
      });
    } else if (num(stats.revenue_month) > 0) {
      insights.push({ text: `${formatMoney(num(stats.revenue_month), stats.currency || 'LKR')} approved so far this month`, type: 'positive' });
    }
    const pending = num(stats.pending_payments);
    if (pending > 0) {
      insights.push({ text: `${pending} payment${pending === 1 ? '' : 's'} waiting for your review`, type: 'warning' });
    }
    const closed = num(stats.closed_shops);
    if (closed > 0) {
      insights.push({ text: `${closed} shop${closed === 1 ? ' has its' : 's have their'} menu closed to customers`, type: 'negative' });
    }
  }
  if (overview) {
    const expiring = num(overview.expiring_soon);
    if (expiring > 0) {
      insights.push({ text: `${expiring} paid plan${expiring === 1 ? '' : 's'} expiring in the next 7 days`, type: 'warning' });
    }
    const paid = overview.plan_distribution.filter((p) => p.slug !== 'free' && num(p.value) > 0)
      .sort((a, b) => num(b.value) - num(a.value));
    if (paid.length) {
      insights.push({ text: `${paid[0].name} is the most used paid plan (${num(paid[0].value)} shops)`, type: 'info' });
    }
    if (overview.top_city) {
      const shops = num(overview.top_city.shops);
      insights.push({ text: `${overview.top_city.city} has the most shops (${shops})`, type: 'positive' });
    }
  }
  return insights;
}

/** The shape the shop detail screen expects, filled from a top-shop row. */
export function topShopToManaged(shop: DashboardTopShop): ManagedShop {
  const email = shop.owner || '';
  return {
    id: shop.id,
    name: shop.name || 'Unnamed Shop',
    owner: email ? email.split('@')[0] : 'Shop Owner',
    ownerEmail: email,
    phone: shop.phone || 'No Phone',
    location: shop.location || 'No location',
    plan: shop.plan as ManagedShop['plan'],
    status: (shop.status || 'active') as ManagedShop['status'],
    revenue: num(shop.revenue),
    menuItems: num(shop.items),
    rating: 0,
    verified: true,
    createdAt: new Date(shop.createdAt).toLocaleDateString(),
    expiresAt: shop.expiresAt ? new Date(shop.expiresAt).toLocaleDateString() : 'Never',
    logo: shop.logo || '',
    banner: shop.banner || '',
    theme: shop.theme || { primary: '#FB8500', secondary: '#1C1E22', accent: '#FB8500' } as ThemeConfig,
    qrScans: 0,
    visitors: 0,
  };
}
