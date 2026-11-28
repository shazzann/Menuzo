import { Check, CheckCircle2, Minus, Sparkles, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useApp } from '@/store';
import { useEffect, useState } from 'react';
import { BillingService } from '@/services/billing.service';
import type { PlanPrice } from '@/types/billing';
import { PricingService } from '@/services/pricing.service';
import { PLAN_FEATURE_LABELS, type PlanDefinition, type PlanFeatureKey } from '@/lib/subscription';
import { usePlanCatalog } from '@/lib/plan-catalog';

type CardTone = 'popular' | 'premium' | 'standard' | 'free';

// The rows compared across plans, all read from each plan's settings.
const comparisonFeatures: PlanFeatureKey[] = [
  'custom_themes', 'qr_branding', 'custom_url', 'advanced_customization', 'priority_support', 'all_features',
];

export function PricingSection() {
  const { state, dispatch } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const catalog = usePlanCatalog();
  // Copy shipped with the app, used only while a built-in plan's database copy is empty.
  const [fallbackCopy] = useState(() => new Map(PricingService.getPlans().map(plan => [plan.id === 'pro' ? 'plus' : plan.id, plan])));

  // Prices come from plan_prices, the same rows checkout charges.
  const [prices, setPrices] = useState<PlanPrice[] | null>(null);
  const [pricesFailed, setPricesFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void BillingService.getPlanPrices().then(data => {
      if (!cancelled) setPrices(data);
    }).catch(() => {
      if (!cancelled) setPricesFailed(true);
    });
    return () => { cancelled = true; };
  }, []);

  const isYearly = billingCycle === 'yearly';
  const currency = 'LKR';
  const unpricedLabel = pricesFailed || prices ? 'Price coming soon' : 'Loading…';
  const formatPrice = (amount: number) => `${currency} ${amount.toLocaleString('en-US')}`;

  const planPricing = (slug: string) => {
    const monthly = prices?.find(p => p.plan_slug === slug && p.period_id === 'monthly');
    const yearly = prices?.find(p => p.plan_slug === slug && p.period_id === 'yearly');
    if (!monthly || !yearly) return null;
    const monthlyAmount = Number(monthly.amount);
    const yearlyAmount = Number(yearly.amount);
    const yearlyRegular = monthlyAmount * 12;
    const yearlySavings = Math.max(0, yearlyRegular - yearlyAmount);
    return {
      monthly: monthlyAmount,
      yearly: yearlyAmount,
      yearlyRegular,
      yearlySavings,
      savingsPercent: yearlyRegular > 0 ? Math.round((yearlySavings / yearlyRegular) * 1000) / 10 : 0,
      monthlyEquiv: Math.round(yearlyAmount / 12),
    };
  };

  // Shown plans: Free plus every public paid plan that can be bought, in display order.
  const shownPlans: PlanDefinition[] = catalog.filter(plan => plan.isPublic && (plan.slug === 'free' || plan.isActive));
  const paidPricing = shownPlans.filter(plan => plan.slug !== 'free')
    .map(plan => ({ plan, pricing: planPricing(plan.slug) }));
  const maxSavingsPercent = Math.max(0, ...paidPricing.map(({ pricing }) => pricing?.savingsPercent ?? 0));
  const annualSavingsText = paidPricing
    .filter(({ pricing }) => pricing && pricing.yearlySavings > 0)
    .map(({ plan, pricing }) => `Save ${formatPrice(pricing!.yearlySavings)} on ${plan.name}`)
    .join(' · ');

  const toneOf = (plan: PlanDefinition): CardTone =>
    plan.slug === 'free' ? 'free' : plan.isPopular ? 'popular' : plan.features.all_features ? 'premium' : 'standard';

  const plans = shownPlans.map(plan => {
    const copy = fallbackCopy.get(plan.slug);
    const description = plan.description || copy?.description || '';
    const features = plan.highlights.length ? plan.highlights : copy?.features ?? [];
    const notIncluded = plan.highlights.length || plan.excluded.length ? plan.excluded : copy?.notIncluded ?? [];
    const base = { slug: plan.slug, name: plan.name, description, features, notIncluded, tone: toneOf(plan),
      limits: `${plan.maxItems.toLocaleString('en-US')} food items · ${plan.maxCategories.toLocaleString('en-US')} categories` };

    if (plan.slug === 'free') {
      return { ...base, price: `${currency} 0`, period: 'Forever free', badge: plan.badge ?? undefined, billingNote: undefined, cta: 'Get Started Free' };
    }
    const pricing = planPricing(plan.slug);
    return {
      ...base,
      price: !pricing ? unpricedLabel : isYearly ? formatPrice(pricing.monthlyEquiv) : formatPrice(pricing.monthly),
      period: pricing ? '/month' : undefined,
      badge: isYearly && pricing && pricing.yearlySavings > 0 ? `Save ${pricing.savingsPercent}%` : plan.badge ?? undefined,
      billingNote: !pricing ? undefined : isYearly
        ? `Billed ${formatPrice(pricing.yearly)} annually${pricing.yearlySavings > 0 ? ` · Save ${formatPrice(pricing.yearlySavings)}/year (${pricing.savingsPercent}%)` : ''}`
        : `Monthly plan: ${formatPrice(pricing.monthly)} per month.`,
      cta: `Choose ${plan.name}`,
    };
  });

  const comparisonRows: { feature: string; values: (string | boolean)[] }[] = [
    { feature: 'Food items', values: shownPlans.map(plan => plan.maxItems.toLocaleString('en-US')) },
    { feature: 'Categories', values: shownPlans.map(plan => plan.maxCategories.toLocaleString('en-US')) },
    { feature: 'Digital menu', values: shownPlans.map(() => true) },
    { feature: 'QR code generation', values: shownPlans.map(() => true) },
    { feature: 'Analytics', values: shownPlans.map(plan => (plan.features.advanced_analytics ? 'Advanced' : 'Basic')) },
    ...comparisonFeatures.map(key => ({ feature: PLAN_FEATURE_LABELS[key], values: shownPlans.map(plan => plan.features[key]) })),
  ];
  const toneText: Record<CardTone, string> = {
    free: 'text-muted-foreground', standard: 'text-foreground', popular: 'text-primary', premium: 'text-purple-400',
  };

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 bg-muted/20 relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
            Simple pricing. More possibilities.
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the right Menuzo plan for your restaurant.
          </p>
        </motion.div>

        {/* Monthly / Annually Segmented Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center mb-12 sm:mb-16"
        >
          <div 
            role="radiogroup" 
            aria-label="Billing frequency" 
            className="inline-flex items-center p-1.5 rounded-full bg-card/90 dark:bg-[#1C1E22] border border-border/80 shadow-md backdrop-blur-sm transition-all"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!isYearly}
              onClick={() => setBillingCycle('monthly')}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                !isYearly
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isYearly}
              onClick={() => setBillingCycle('yearly')}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isYearly
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Annually</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${
                  isYearly
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary/10 text-primary dark:text-[#FB8500]'
                }`}
              >
                {maxSavingsPercent > 0 ? `Up to ${maxSavingsPercent}% off` : 'Billed yearly'}
              </span>
            </button>
          </div>
          <p className="mt-3 min-h-5 text-center text-xs sm:text-sm text-muted-foreground" aria-live="polite">
            {isYearly && annualSavingsText ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Annual savings: {annualSavingsText}
              </span>
            ) : (
              isYearly ? '' : 'Switch to annual billing to save on paid plans.'
            )}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${plans.length >= 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-6 sm:gap-8 items-stretch mx-auto max-w-7xl mb-16`}>
          {plans.map((plan, i) => {
            const isPaid = plan.tone !== 'free';
            const isPopular = plan.tone === 'popular';
            const isPremium = plan.tone === 'premium';

            return (
              <motion.div
                key={plan.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 ${
                  isPopular
                    ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02] z-10'
                    : isPremium
                    ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/5 to-transparent shadow-xl'
                    : 'border-border/60 bg-card shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg ${
                      isPopular
                        ? 'bg-primary text-primary-foreground'
                        : isPremium
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground min-h-[2.5rem]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-4 pb-4 border-b border-border/50">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground font-medium text-sm sm:text-base">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.billingNote && (
                    <p className="mt-2 text-xs text-muted-foreground font-medium">
                      {plan.billingNote}
                    </p>
                  )}
                </div>

                <div className="mb-6 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Limits & Highlights
                  </p>
                  <p className="text-sm font-semibold text-foreground">{plan.limits}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isPopular ? 'text-primary' : isPremium ? 'text-purple-400' : 'text-muted-foreground'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feat, idx) => (
                    <li key={`not-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-muted-foreground/40">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/30" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-12 rounded-xl text-sm sm:text-base font-semibold gap-2 ${
                    isPremium ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                  }`}
                  variant={isPaid ? 'default' : 'outline'}
                  onClick={() => {
                    try {
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem('menuzo_upgrade_period', isYearly ? 'yearly' : 'monthly');
                        if (isPaid && !state.user) sessionStorage.setItem('menuzo_upgrade_intent', plan.slug);
                      }
                    } catch {
                      // Storage can be unavailable (private mode); the choice is only a convenience.
                    }
                    dispatch({
                      type: 'SET_VIEW',
                      payload: isPaid
                        ? (state.user ? 'admin-subscription' : 'login')
                        : (state.user ? 'user-dashboard' : 'signup'),
                    });
                  }}
                >
                  {plan.cta}
                  {isPaid && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 max-w-5xl mx-auto rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-lg overflow-x-auto"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Feature Comparison</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Compare features and capabilities across all Menuzo tiers.
            </p>
          </div>

          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/80">
                <th className="py-3 px-3 sm:px-4 font-semibold text-foreground">Feature</th>
                {plans.map(plan => (
                  <th key={plan.slug} className={`py-3 px-3 sm:px-4 font-semibold text-center ${toneText[plan.tone]}`}>{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {comparisonRows.map(row => (
                <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-3 sm:px-4 font-medium">{row.feature}</td>
                  {row.values.map((value, idx) => (
                    <td key={plans[idx].slug} className={`py-3.5 px-3 sm:px-4 text-center ${plans[idx].tone === 'free' ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                      {typeof value === 'boolean' ? (
                        value
                          ? <Check className={`w-4 h-4 mx-auto ${plans[idx].tone === 'free' ? 'text-muted-foreground' : toneText[plans[idx].tone]}`} />
                          : <Minus className="w-4 h-4 mx-auto text-muted-foreground/40" />
                      ) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
