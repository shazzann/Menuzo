import type { KPICard } from '@/types';

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
