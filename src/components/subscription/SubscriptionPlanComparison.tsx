import { ArrowRight, Check, Crown, Minus, ShieldCheck, Sparkles, Store, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPaymentAmount } from '@/lib/billing';
import type { BillingPeriod } from '@/types/billing';

type Props = {
  periods: BillingPeriod[];
  selectedId: string;
  loading: boolean;
  ready: boolean;
  onSelect: (id: string) => void;
  onUpgrade: (plan?: 'plus' | 'enterprise') => void;
  onKeepFree: () => void;
};

const DEFAULT_PRICING = {
  plus: { monthly: 1500, annual: 15000 },
  enterprise: { monthly: 6000, annual: 65000, annualRegular: 72000, annualSavings: 7000 },
};

const features = [
  { label: 'Food items', free: '10', plus: '100', pro: '100', enterprise: '500', detail: 'Room for your full menu, specials, and seasonal dishes.' },
  { label: 'Categories', free: '2', plus: '20', pro: '20', enterprise: '50', detail: 'Keep a growing menu easy for guests to explore.' },
  { label: 'QR menu', free: true, plus: true, pro: true, enterprise: true, detail: 'Contactless digital menu accessible via QR scan.' },
  { label: 'Custom theme', free: 'Limited (3–5 preset themes)', plus: 'Full customization', pro: 'Full customization', enterprise: 'Full customization', detail: 'Choose from preset themes or fully customize brand colors.' },
  { label: 'Custom QR branding', free: 'Basic', plus: 'Advanced', pro: 'Advanced', enterprise: 'Advanced', detail: 'Generate standard QR or customize with brand colors, shapes & logo.' },
  { label: 'Analytics dashboard', free: false, plus: true, pro: true, enterprise: true, detail: 'Track daily views, scans, and guest trends.' },
  { label: 'Restaurant profile', free: true, plus: true, pro: true, enterprise: true, detail: 'Showcase your restaurant bio, opening hours, and location.' },
  { label: 'Shareable menu link', free: true, plus: true, pro: true, enterprise: true, detail: 'Direct link to share on social media or messaging apps.' },
  { label: 'Custom menu URL', free: false, plus: true, pro: true, enterprise: true, detail: 'Give guests a memorable short link that matches your restaurant.' },
  { label: 'Support', free: 'Standard', plus: 'Priority', pro: 'Priority', enterprise: 'Priority', detail: 'Get dedicated assistance whenever you need help.' },
  { label: 'Advanced customization', free: false, plus: false, pro: false, enterprise: true, detail: 'Enterprise layout controls, styling and branding.' },
  { label: 'All available features', free: false, plus: false, pro: false, enterprise: true, detail: 'Full enterprise-level access to all released Menuzo features.' },
];

export function SubscriptionPlanComparison({
  periods,
  selectedId,
  loading,
  ready,
  onSelect,
  onUpgrade,
  onKeepFree,
}: Props) {
  const selected = periods.find(period => period.id === selectedId);
  const monthly = periods.find(period => period.id === 'monthly' && period.months === 1 && period.active);
  const yearly = periods.find(period => period.id === 'yearly' && period.months === 12 && period.active);
  const isYearly = selectedId === 'yearly';

  const savings = monthly?.amount && yearly?.amount && monthly.currency === yearly.currency
    ? monthly.amount * 12 - yearly.amount : 0;
  const payable = selected?.active && selected.amount !== null && selected.amount > 0;

  return (
    <section aria-label="Compare Free and Pro plans" className="space-y-7">
      <div className="flex flex-col items-center gap-3">
        <fieldset className="inline-flex max-w-full gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm">
          <legend className="sr-only">Subscription period</legend>
          {periods.filter(period => period.active).map(period => (
            <label key={period.id} className="relative cursor-pointer">
              <input
                type="radio"
                name="comparison-period"
                value={period.id}
                checked={selectedId === period.id}
                onChange={() => onSelect(period.id)}
                className="peer sr-only"
              />
              <span className="block rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                {period.label}
              </span>
            </label>
          ))}
        </fieldset>
        <p className="min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">
          {!loading && savings > 0 && yearly ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Save {formatPaymentAmount(savings, yearly.currency)} a year with yearly Plus
            </span>
          ) : (
            'Choose the period that works for your restaurant.'
          )}
        </p>
      </div>

      {/* 3 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        {/* FREE */}
        <article className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card">
          <div className="relative flex h-full flex-col p-4 sm:p-7">
            <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-muted text-muted-foreground">
                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground">
                Your current plan
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold leading-tight">Free</h3>
            <p className="mt-1.5 sm:mt-2 min-h-[3rem] text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Everything you need to put your first digital menu on the table.
            </p>

            <div className="my-3 sm:my-6 min-h-[4.5rem]">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="text-xl sm:text-4xl font-bold tracking-tight">Free</strong>
                <span className="text-xs sm:text-sm text-muted-foreground">forever</span>
              </div>
              <p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-muted-foreground">
                No payment needed. Keep your standard menu link.
              </p>
            </div>

            <Button
              className="h-10 sm:h-12 w-full rounded-xl px-2 text-xs sm:text-sm"
              variant="outline"
              onClick={onKeepFree}
            >
              Continue with Free
            </Button>

            <div className="my-4 sm:my-6 border-t border-border" />
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your essentials
            </p>

            <ul className="space-y-3 sm:space-y-4 flex-1">
              {features.map(feature => {
                const value = feature.free;
                return (
                  <li key={feature.label} className="flex items-start gap-2 text-xs sm:text-sm">
                    {value === false ? (
                      <Minus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                    ) : (
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <span className={value === false ? 'text-muted-foreground' : 'font-medium'}>
                        {typeof value === 'string' ? `${feature.label}: ${value}` : feature.label}
                      </span>
                      {value === false && (
                        <span className="ml-1 text-[11px] sm:text-xs text-muted-foreground">· Pro only</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>

        {/* PLUS (PREVIOUSLY PRO) */}
        <article className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/60 bg-card shadow-xl shadow-primary/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
          <div className="relative flex h-full flex-col p-4 sm:p-7">
            <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/15 text-primary">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
                More room to grow
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold leading-tight">Menuzo Plus</h3>
            <p className="mt-1.5 sm:mt-2 min-h-[3rem] text-xs sm:text-sm leading-relaxed text-muted-foreground">
              For a fuller menu, a memorable link, custom themes, analytics and a growing restaurant.
            </p>

            <div className="my-3 sm:my-6 min-h-[4.5rem]" aria-live="polite">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="text-xl sm:text-4xl font-bold tracking-tight">
                  {loading ? 'Loading…' : payable && selected ? formatPaymentAmount(selected.amount, selected.currency) : 'Coming soon'}
                </strong>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {payable && selected ? selected.months === 1 ? '/ month' : selected.months === 12 ? '/ year' : `/ ${selected.months} months` : ''}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-muted-foreground">
                {payable && selected
                  ? `One payment for ${selected.months} ${selected.months === 1 ? 'month' : 'months'}. No automatic renewals.`
                  : 'Published pricing will appear here when available.'}
              </p>
            </div>

            <Button
              className="h-10 sm:h-12 w-full gap-1.5 sm:gap-2 rounded-xl px-2 text-xs sm:text-sm"
              variant="default"
              disabled={!ready}
              onClick={() => onUpgrade('plus')}
            >
              Upgrade to Plus
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </Button>

            <div className="my-4 sm:my-6 border-t border-border" />
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your upgrade includes
            </p>

            <ul className="space-y-3 sm:space-y-4 flex-1">
              {features.map(feature => {
                const value = feature.plus;
                return (
                  <li key={feature.label} className="flex items-start gap-2 text-xs sm:text-sm">
                    {value === false ? (
                      <Minus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                    ) : (
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0">
                      <span className={value === false ? 'text-muted-foreground' : 'font-medium'}>
                        {typeof value === 'string' ? `${feature.label}: ${value}` : feature.label}
                      </span>
                      {feature.detail && (
                        <p className="mt-0.5 hidden sm:block text-xs leading-relaxed text-muted-foreground">
                          {feature.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>

        {/* ENTERPRISE */}
        <article className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/50 bg-card shadow-xl shadow-purple-500/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-purple-500/15 to-transparent" aria-hidden="true" />
          <div className="relative flex h-full flex-col p-4 sm:p-7">
            <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-500/20 text-purple-400">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400">
                Full Access
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold leading-tight">Enterprise</h3>
            <p className="mt-1.5 sm:mt-2 min-h-[3rem] text-xs sm:text-sm leading-relaxed text-muted-foreground">
              500 items, 50 categories, advanced customization, priority support & full feature access.
            </p>

            <div className="my-3 sm:my-6 min-h-[4.5rem]">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="text-xl sm:text-4xl font-bold tracking-tight text-purple-400">
                  {loading
                    ? 'Loading…'
                    : isYearly
                    ? formatPaymentAmount(DEFAULT_PRICING.enterprise.annual, selected?.currency || 'LKR')
                    : formatPaymentAmount(DEFAULT_PRICING.enterprise.monthly, selected?.currency || 'LKR')}
                </strong>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {isYearly ? '/ year' : '/ month'}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-muted-foreground">
                {isYearly
                  ? `One payment for 12 months. Save ${formatPaymentAmount(DEFAULT_PRICING.enterprise.annualSavings, selected?.currency || 'LKR')}/yr.`
                  : 'Pay once for 1 month. Full platform capabilities.'}
              </p>
            </div>

            <Button
              className="h-10 sm:h-12 w-full gap-1.5 sm:gap-2 rounded-xl px-2 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => onUpgrade('enterprise')}
            >
              Choose Enterprise
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </Button>

            <div className="my-4 sm:my-6 border-t border-border" />
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Everything in Plus, and:
            </p>

            <ul className="space-y-3 sm:space-y-4 flex-1">
              {features.map(feature => {
                const value = feature.enterprise;
                return (
                  <li key={feature.label} className="flex items-start gap-2 text-xs sm:text-sm">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">
                        {typeof value === 'string' ? `${feature.label}: ${value}` : feature.label}
                      </span>
                      {feature.detail && (
                        <p className="mt-0.5 hidden sm:block text-xs leading-relaxed text-muted-foreground">
                          {feature.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>
      </div>

      <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Your menu stays with you when you upgrade.
        </p>
        <p className="max-w-xl text-xs leading-relaxed">
          Pay by bank transfer, send your receipt on WhatsApp, and submit it for review. Plan benefits start after approval.
        </p>
        {!loading && !ready && (
          <p role="status" className="mt-1 text-xs">Checkout is currently unavailable. Please refresh or try again later.</p>
        )}
      </div>
    </section>
  );
}
