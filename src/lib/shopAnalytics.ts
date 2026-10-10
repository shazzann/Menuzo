import type { DailyStat } from '@/types';

export type AnalyticsRange = 'today' | 'week' | 'month';
export const ANALYTICS_RANGE_LABELS = {
  today: 'Today', week: 'Last 7 days', month: 'Last 30 days',
} as const;

// Match increment_shop_visits, which buckets visits by Asia/Colombo dates.
export function analyticsDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function analyticsDates(range: AnalyticsRange, now = new Date()): string[] {
  const days = { today: 1, week: 7, month: 30 }[range];
  const end = new Date(`${analyticsDate(now)}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

export function summarizeShopViews(stats: DailyStat[] | undefined, range: AnalyticsRange, now = new Date()) {
  const byDate = new Map((stats || []).map(stat => [stat.date, stat]));
  const data = analyticsDates(range, now).map(date => ({
    date,
    label: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', timeZone: 'UTC',
    }),
    views: byDate.get(date)?.views || 0,
    qrScans: byDate.get(date)?.qr_scans || 0,
  }));
  return {
    data,
    views: data.reduce((total, day) => total + day.views, 0),
    qrScans: data.reduce((total, day) => total + day.qrScans, 0),
  };
}

const RANGE_DAYS = { today: 1, week: 7, month: 30 } as const;

// Percentage change in menu visits against the previous period of the same length.
// Only 30 days of stats are loaded, so the 30-day range has nothing to compare against.
export function viewsTrend(stats: DailyStat[] | undefined, range: AnalyticsRange, now = new Date()): number | null {
  if (range === 'month' || !stats) return null;
  // Sri Lanka has no daylight saving, so whole days shift the window cleanly.
  const previousNow = new Date(now.getTime() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
  const previous = summarizeShopViews(stats, range, previousNow).views;
  if (previous === 0) return null;
  return Math.round(((summarizeShopViews(stats, range, now).views - previous) / previous) * 100);
}
