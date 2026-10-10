import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { summarizeShopViews } from '@/lib/shopAnalytics';
import { cn } from '@/lib/utils';

type ChartData = ReturnType<typeof summarizeShopViews>['data'];

export function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      up ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
    )}>
      <Icon className="w-3 h-3" />
      {up ? '+' : ''}{value}%
    </span>
  );
}

function VisitsTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartData[number] }[] }) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-card border border-border shadow-md text-xs">
      <span className="text-muted-foreground">{day.label} · </span>
      <span className="font-semibold">{day.views.toLocaleString()} {day.views === 1 ? 'visit' : 'visits'}</span>
    </div>
  );
}

export function MenuViewsChart({ data, className }: { data: ChartData; className?: string }) {
  const empty = data.every(day => day.views === 0);
  return (
    <div>
      <div className={cn('h-36 w-full min-w-0', className)} role="img" aria-label="Menu visits by day for the selected period">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="menu-visits-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<VisitsTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />
            <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#menu-visits-fill)"
              dot={data.length === 1} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {empty && <p className="text-center text-sm text-muted-foreground mt-2">No visits yet — share your menu link or QR code to get started.</p>}
      <table className="sr-only">
        <caption>Menu visits by day</caption>
        <thead><tr><th>Date</th><th>Menu visits</th><th>QR scans</th></tr></thead>
        <tbody>{data.map(day => <tr key={day.date}><th>{day.date}</th><td>{day.views}</td><td>{day.qrScans}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
