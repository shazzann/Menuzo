import { ArrowRight, Check, Crown, Minus, ShieldCheck, Sparkles, Store, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPaymentAmount } from '@/lib/billing';
import type { BillingPeriod } from '@/types/billing';
import type { PlanDefinition } from '@/lib/subscription';

/** A plan shown in the comparison, with its billing periods priced for that plan. */
export type ComparisonPlan = { plan: PlanDefinition; periods: BillingPeriod[] };

type Props = {
  free: PlanDefinition;
  /** Paid plans a shop can buy, in display order. */
  plans: ComparisonPlan[];
  /** Billing periods (used for the period toggle). */
  periods: BillingPeriod[];
  selectedId: string;
  loading: boolean;
  ready: boolean;
  onSelect: (id: string) => void;
  onUpgrade: (plan: string) => void;
  onKeepFree: () => void;
};

type FeatureValue = string | boolean;
type FeatureRow = { label: string; detail: string; value: (plan: PlanDefinition) => FeatureValue };

// Every row is read from the plan's own limits and feature switches.
const featureRows: FeatureRow[] = [
  { label: 'Food items', detail: 'Room for your full menu, specials, and seasonal dishes.', value: plan => plan.maxItems.toLocaleString('en-US') },
  { label: 'Categories', detail: 'Keep a growing menu easy for guests to explore.', value: plan => plan.maxCategories.toLocaleString('en-US') },
  { label: 'QR menu', detail: 'Contactless digital menu accessible via QR scan.', value: () => true },
  { label: 'Custom theme', detail: 'Choose from preset themes or fully customize brand colors.', value: plan => (plan.features.custom_themes ? 'Full customization' : 'Limited (3–5 preset themes)') },
  { label: 'Custom QR branding', detail: 'Generate standard QR or customize with brand colors, shapes & logo.', value: plan => (plan.features.qr_branding ? 'Advanced' : 'Basic') },
  { label: 'Analytics dashboard', detail: 'Track daily views, scans, and guest trends.', value: plan => plan.features.advanced_analytics },
  { label: 'Restaurant profile', detail: 'Showcase your restaurant bio, opening hours, and location.', value: () => true },
  { label: 'Shareable menu link', detail: 'Direct link to share on social media or messaging apps.', value: () => true },
  { label: 'Custom menu URL', detail: 'Give guests a memorable short link that matches your restaurant.', value: plan => plan.features.custom_url },
  { label: 'Support', detail: 'Get dedicated assistance whenever you need help.', value: plan => (plan.features.priority_support ? 'Priority' : 'Standard') },
  { label: 'Advanced customization', detail: 'Advanced layout controls, styling and branding.', value: plan => plan.features.advanced_customization },
  { label: 'All available features', detail: 'Full access to all released Menuzo features.', value: plan => plan.features.all_features },
];

const tones = {
  popular: {
    card: 'border-primary/60 shadow-xl shadow-primary/10', glow: 'from-primary/10', icon: 'bg-primary/15 text-primary',
    chip: 'bg-primary/10 text-primary', price: '', check: 'text-primary', button: '',
  },
  premium: {
    card: 'border-purple-500/50 shadow-xl shadow-purple-500/10', glow: 'from-purple-500/15', icon: 'bg-purple-500/20 text-purple-400',
    chip: 'bg-purple-500/20 text-purple-400', price: 'text-purple-400', check: 'text-purple-400', button: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  standard: {
    card: 'border-border shadow-lg', glow: 'from-muted/40', icon: 'bg-primary/10 text-primary',
    chip: 'bg-muted text-muted-foreground', price: '', check: 'text-primary', button: '',
  },
} as const;

const toneOf = (plan: PlanDefinition) => (plan.isPopular ? 'popular' : plan.features.all_features ? 'premium' : 'standard');

const perPeriod = (period: BillingPeriod) =>
  period.months === 1 ? '/ month' : period.months === 12 ? '/ year' : `/ ${period.months} months`;

function FeatureList({ plan, checkClass, showDetail }: { plan: PlanDefinition; checkClass: string; showDetail: boolean }) {
  return (
    <ul className="space-y-3 sm:space-y-4 flex-1">
      {featureRows.map(feature => {
        const value = feature.value(plan);
        return (
          <li key={feature.label} className="flex items-start gap-2 text-xs sm:text-sm">
            {value === false ? (
              <Minus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
            ) : (
              <Check aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${checkClass}`} />
            )}
            <div className="min-w-0">
              <span className={value === false ? 'text-muted-foreground' : 'font-medium'}>
                {typeof value === 'string' ? `${feature.label}: ${value}` : feature.label}
              </span>
              {value === false && (
                <span className="ml-1 text-[11px] sm:text-xs text-muted-foreground">· Paid plans only</span>
              )}
              {showDetail && value !== false && (
                <p className="mt-0.5 hidden sm:block text-xs leading-relaxed text-muted-foreground">{feature.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SubscriptionPlanComparison({
  free,
  plans,
  periods,
  selectedId,
  loading,
  ready,
  onSelect,
  onUpgrade,
  onKeepFree,
}: Props) {
  const isYearly = selectedId === 'yearly';
  const yearlySavings = plans.map(({ plan, periods: priced }) => {
    const monthly = priced.find(period => period.id === 'monthly' && period.months === 1 && period.active);
    const yearly = priced.find(period => period.id === 'yearly' && period.months === 12 && period.active);
    const amount = monthly?.amount && yearly?.amount && monthly.currency === yearly.currency
      ? monthly.amount * 12 - yearly.amount : 0;
    return { plan, amount, currency: yearly?.currency ?? 'LKR' };
  });
  const bestSaving = yearlySavings.reduce((best, item) => (item.amount > best.amount ? item : best), { plan: null as PlanDefinition | null, amount: 0, currency: 'LKR' });
  const columns = plans.length + 1;

  return (
    <section aria-label="Compare Free and paid plans" className="space-y-7">
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
          {!loading && bestSaving.plan && bestSaving.amount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Save {formatPaymentAmount(bestSaving.amount, bestSaving.currency)} a year with yearly {bestSaving.plan.name}
            </span>
          ) : (
            'Choose the period that works for your restaurant.'
          )}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-3 sm:gap-6 ${columns >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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

            <h3 className="text-lg sm:text-2xl font-bold leading-tight">{free.name}</h3>
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

            <Button className="h-10 sm:h-12 w-full rounded-xl px-2 text-xs sm:text-sm" variant="outline" onClick={onKeepFree}>
              Continue with {free.name}
            </Button>

            <div className="my-4 sm:my-6 border-t border-border" />
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your essentials</p>
            <FeatureList plan={free} checkClass="text-muted-foreground" showDetail={false} />
          </div>
        </article>

        {plans.map(({ plan, periods: priced }) => {
          const tone = tones[toneOf(plan)];
          const selected = priced.find(period => period.id === selectedId);
          const payable = !!selected?.active && selected.amount !== null && selected.amount > 0;
          const saving = yearlySavings.find(item => item.plan.slug === plan.slug);
          const Icon = toneOf(plan) === 'premium' ? Zap : Crown;
          return (
            <article key={plan.slug} className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border bg-card ${tone.card}`}>
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b ${tone.glow} to-transparent`} aria-hidden="true" />
              <div className="relative flex h-full flex-col p-4 sm:p-7">
                <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
                  <div className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${tone.icon}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  {plan.badge && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}>{plan.badge}</span>}
                </div>

                <h3 className="text-lg sm:text-2xl font-bold leading-tight">{plan.name}</h3>
                <p className="mt-1.5 sm:mt-2 min-h-[3rem] text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {plan.description || `${plan.maxItems.toLocaleString('en-US')} items and ${plan.maxCategories.toLocaleString('en-US')} categories for a growing restaurant.`}
                </p>

                <div className="my-3 sm:my-6 min-h-[4.5rem]" aria-live="polite">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <strong className={`text-xl sm:text-4xl font-bold tracking-tight ${tone.price}`}>
                      {loading ? 'Loading…' : payable && selected ? formatPaymentAmount(selected.amount, selected.currency) : 'Coming soon'}
                    </strong>
                    <span className="text-xs sm:text-sm text-muted-foreground">{payable && selected ? perPeriod(selected) : ''}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-muted-foreground">
                    {payable && selected
                      ? `One payment for ${selected.months} ${selected.months === 1 ? 'month' : 'months'}.${isYearly && saving && saving.amount > 0 ? ` Save ${formatPaymentAmount(saving.amount, saving.currency)}/yr.` : ' No automatic renewals.'}`
                      : 'Published pricing will appear here when available.'}
                  </p>
                </div>

                <Button
                  className={`h-10 sm:h-12 w-full gap-1.5 sm:gap-2 rounded-xl px-2 text-xs sm:text-sm ${tone.button}`}
                  variant="default"
                  disabled={!ready || !payable}
                  onClick={() => onUpgrade(plan.slug)}
                >
                  Upgrade to {plan.name}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                </Button>

                <div className="my-4 sm:my-6 border-t border-border" />
                <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your upgrade includes</p>
                <FeatureList plan={plan} checkClass={tone.check} showDetail />
              </div>
            </article>
          );
        })}
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
