import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { summarizeShopViews } from '@/lib/shopAnalytics';

export function MenuViewsChart({ data }: { data: ReturnType<typeof summarizeShopViews>['data'] }) {
  const empty = data.every(day => day.views === 0 && day.qrScans === 0);
  return (
    <div>
      <div className="h-56 w-full min-w-0" role="img" aria-label="Daily menu views and QR visits for the selected period">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--foreground))' }} />
            <Area name="Menu views" type="linear" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} dot={data.length === 1} isAnimationActive={false} />
            <Line name="QR visits" type="linear" dataKey="qrScans" stroke="hsl(var(--foreground))" strokeDasharray="4 4" strokeWidth={2} dot={data.length === 1} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-primary" />Menu views</span>
        <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-foreground" />QR visits</span>
      </div>
      {empty && <p className="text-center text-sm text-muted-foreground mt-3">No recorded visits in this period.</p>}
      <table className="sr-only">
        <caption>Daily visits in Sri Lanka time</caption>
        <thead><tr><th>Date</th><th>Menu views</th><th>QR visits</th></tr></thead>
        <tbody>{data.map(day => <tr key={day.date}><th>{day.date}</th><td>{day.views}</td><td>{day.qrScans}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
