import { ArrowRight, Check, Crown, Minus, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPaymentAmount } from '@/lib/billing';
import type { BillingPeriod } from '@/types/billing';

type Props = {
  periods: BillingPeriod[];
  selectedId: string;
  loading: boolean;
  ready: boolean;
  onSelect: (id: string) => void;
  onUpgrade: () => void;
  onKeepFree: () => void;
};

const features = [
  { label: 'Menu items', free: 'Up to 10', pro: 'Up to 100', detail: 'Room for your full menu, specials, and seasonal dishes.' },
  { label: 'Menu categories', free: 'Up to 2', pro: 'Up to 20', detail: 'Keep a growing menu easy for guests to explore.' },
  { label: 'QR menu & restaurant profile', free: true, pro: true },
  { label: 'Custom themes & QR branding', free: true, pro: true },
  { label: 'Analytics', free: 'Dashboard', pro: 'Advanced dashboard' },
  { label: 'Custom menu URL', free: false, pro: true, detail: 'Give guests a memorable link that matches your restaurant.' },
  { label: 'Priority support', free: false, pro: true },
];

export function SubscriptionPlanComparison({ periods, selectedId, loading, ready, onSelect, onUpgrade, onKeepFree }: Props) {
  const selected = periods.find(period => period.id === selectedId);
  const monthly = periods.find(period => period.id === 'monthly' && period.months === 1 && period.active);
  const yearly = periods.find(period => period.id === 'yearly' && period.months === 12 && period.active);
  const savings = monthly?.amount && yearly?.amount && monthly.currency === yearly.currency
    ? monthly.amount * 12 - yearly.amount : 0;
  const payable = selected?.active && selected.amount !== null && selected.amount > 0;

  return <section aria-label="Compare Free and Pro plans" className="space-y-7">
    <div className="flex flex-col items-center gap-3">
      <fieldset className="inline-flex max-w-full gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm">
        <legend className="sr-only">Subscription period</legend>
        {periods.filter(period => period.active).map(period => <label key={period.id} className="relative cursor-pointer">
          <input type="radio" name="comparison-period" value={period.id} checked={selectedId === period.id} onChange={() => onSelect(period.id)} className="peer sr-only" />
          <span className="block rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">{period.label}</span>
        </label>)}
      </fieldset>
      <p className="min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">{!loading && savings > 0 && yearly
        ? <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Sparkles className="h-3.5 w-3.5" />Save {formatPaymentAmount(savings,yearly.currency)} a year with yearly Pro</span>
        : 'Choose the period that works for your restaurant.'}</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {(['free','pro'] as const).map(tier => {
        const pro = tier === 'pro';
        const Icon = pro ? Crown : Store;
        return <article key={tier} className={`relative flex flex-col overflow-hidden rounded-3xl border bg-card ${pro ? 'border-primary/60 shadow-xl shadow-primary/10' : 'border-border'}`}>
          {pro && <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />}
          <div className="relative flex h-full flex-col p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pro ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}><Icon className="h-6 w-6" /></div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${pro ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{pro ? 'More room to grow' : 'Your current plan'}</span>
            </div>
            <h3 className="text-2xl font-bold">{pro ? 'Menuzo Pro' : 'Free'}</h3>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{pro ? 'For a fuller menu, a memorable link, and a growing restaurant.' : 'Everything you need to put your first digital menu on the table.'}</p>
            <div className="my-6 min-h-20" aria-live={pro ? 'polite' : undefined}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="text-3xl font-bold tracking-tight sm:text-4xl">{pro ? loading ? 'Loading…' : payable && selected ? formatPaymentAmount(selected.amount,selected.currency) : 'Coming soon' : 'Free'}</strong>
                <span className="text-sm text-muted-foreground">{pro ? payable && selected ? selected.months === 1 ? '/ month' : selected.months === 12 ? '/ year' : `/ ${selected.months} months` : '' : 'forever'}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{pro ? payable && selected ? `One payment for ${selected.months} ${selected.months === 1 ? 'month' : 'months'}. No automatic renewals.` : 'Published pricing will appear here when available.' : 'No payment needed. Keep your standard menu link.'}</p>
            </div>
            <Button className="h-12 w-full gap-2 rounded-xl" variant={pro ? 'default' : 'outline'} disabled={pro && !ready} onClick={pro ? onUpgrade : onKeepFree}>{pro ? <>Upgrade to Pro<ArrowRight className="h-4 w-4" /></> : 'Continue with Free'}</Button>
            <div className="my-6 border-t border-border" />
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{pro ? 'Your upgrade includes' : 'Your essentials'}</p>
            <ul className="space-y-4">
              {features.map(feature => {
                const value = feature[tier];
                return <li key={feature.label} className="flex items-start gap-3 text-sm">
                  {value === false ? <Minus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" /> : <Check aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${pro ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <div className="min-w-0"><span className={value === false ? 'text-muted-foreground' : 'font-medium'}>{typeof value === 'string' ? `${feature.label}: ${value}` : feature.label}</span>{value === false && <span className="ml-1 text-xs text-muted-foreground">· Pro only</span>}{pro && feature.detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.detail}</p>}</div>
                </li>;
              })}
            </ul>
          </div>
        </article>;
      })}
    </div>
    <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
      <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Your menu stays with you when you upgrade.</p>
      <p className="max-w-xl text-xs leading-relaxed">Pay by bank transfer, send your receipt on WhatsApp, and submit it for review. Pro benefits start after approval.</p>
      {!loading && !ready && <p role="status" className="mt-1 text-xs">Checkout is currently unavailable. Please refresh or try again later.</p>}
    </div>
  </section>;
}
