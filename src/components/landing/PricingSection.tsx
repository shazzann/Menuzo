import { Check, CheckCircle2, Minus, Sparkles, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useApp } from '@/store';
import { useEffect, useState } from 'react';
import { BillingService } from '@/services/billing.service';
import type { BillingPeriod } from '@/types/billing';
import { PricingService } from '@/services/pricing.service';
import { PLAN_PRICING, PLAN_LIMITS } from '@/lib/subscription';

export function PricingSection() {
  const { state, dispatch } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [basePlans, setBasePlans] = useState(PricingService.getPlans);

  useEffect(() => {
    const handleUpdate = () => setBasePlans(PricingService.getPlans());
    window.addEventListener('pricing_updated', handleUpdate);
    return () => window.removeEventListener('pricing_updated', handleUpdate);
  }, []);

  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  useEffect(() => {
    let cancelled = false;
    void BillingService.getPeriods().then(data => {
      if (!cancelled) setPeriods(data);
    }).catch(() => {
      // Unpublished pricing stays unavailable; checkout uses same source.
    });
    return () => { cancelled = true; };
  }, []);

  const isYearly = billingCycle === 'yearly';
  const currency = 'LKR';

  // Plus pricing
  const plusMonthly = periods.find(p => p.id === 'monthly' && p.active && p.amount)?.amount ?? PLAN_PRICING.plus.monthly;
  const plusYearly = periods.find(p => p.id === 'yearly' && p.active && p.amount)?.amount ?? PLAN_PRICING.plus.annual;
  const plusYearlyRegular = plusMonthly * 12;
  const plusYearlySavings = plusYearlyRegular - plusYearly;
  const plusSavingsPercent = Math.round((plusYearlySavings / plusYearlyRegular) * 1000) / 10;
  const plusMonthlyEquiv = Math.round(plusYearly / 12);

  // Enterprise pricing
  const enterpriseMonthly = PLAN_PRICING.enterprise.monthly;
  const enterpriseYearly = PLAN_PRICING.enterprise.annual;
  const enterpriseYearlyRegular = PLAN_PRICING.enterprise.annualRegular; // 72,000
  const enterpriseYearlySavings = PLAN_PRICING.enterprise.annualSavings; // 7,000
  const enterpriseSavingsPercent = Math.round((enterpriseYearlySavings / enterpriseYearlyRegular) * 1000) / 10; // 9.7%
  const enterpriseMonthlyEquiv = Math.round(enterpriseYearly / 12); // ~5,417

  const formatPrice = (amount: number) => `${currency} ${amount.toLocaleString('en-US')}`;

  const plans = basePlans.map(plan => {
    if (plan.id === 'free') {
      return {
        ...plan,
        price: `${currency} 0`,
        period: 'Forever free',
        billingNote: undefined,
        cta: 'Get Started Free',
      };
    }

    if (plan.id === 'plus' || plan.id === 'pro') {
      return {
        ...plan,
        id: 'plus',
        name: 'Plus',
        price: isYearly ? formatPrice(plusMonthlyEquiv) : formatPrice(plusMonthly),
        period: '/month',
        badge: isYearly ? `Save ${plusSavingsPercent}%` : 'Popular',
        billingNote: isYearly
          ? `Billed ${formatPrice(plusYearly)} annually · Save ${formatPrice(plusYearlySavings)}/year (${plusSavingsPercent}%)`
          : `Monthly plan: ${formatPrice(plusMonthly)} per month.`,
        cta: 'Choose Plus',
      };
    }

    if (plan.id === 'enterprise') {
      return {
        ...plan,
        name: 'Enterprise',
        price: isYearly ? formatPrice(enterpriseMonthlyEquiv) : formatPrice(enterpriseMonthly),
        period: '/month',
        badge: isYearly ? `Save ${formatPrice(enterpriseYearlySavings)}/yr` : 'Full Access',
        billingNote: isYearly
          ? `Billed ${formatPrice(enterpriseYearly)} annually (was ${formatPrice(enterpriseYearlyRegular)}) · Save ${enterpriseSavingsPercent}%`
          : `Monthly plan: ${formatPrice(enterpriseMonthly)} per month.`,
        cta: 'Choose Enterprise',
      };
    }

    return plan;
  });

  const comparisonRows = [
    { feature: 'Food items', free: '10', plus: '100', enterprise: '500' },
    { feature: 'Categories', free: '2', plus: '20', enterprise: '50' },
    { feature: 'Digital menu', free: true, plus: true, enterprise: true },
    { feature: 'QR code generation', free: true, plus: true, enterprise: true },
    { feature: 'Custom themes', free: false, plus: true, enterprise: true },
    { feature: 'QR branding', free: false, plus: true, enterprise: true },
    { feature: 'Custom menu URL', free: false, plus: true, enterprise: true },
    { feature: 'Analytics', free: 'Basic', plus: 'Advanced', enterprise: 'Advanced' },
    { feature: 'Portion / size variants', free: 'Basic', plus: true, enterprise: true },
    { feature: 'Menu customization', free: 'Basic', plus: 'Standard', enterprise: 'Advanced' },
    { feature: 'Advanced customization', free: false, plus: false, enterprise: true },
    { feature: 'Priority support', free: false, plus: false, enterprise: true },
    { feature: 'All available features', free: false, plus: false, enterprise: true },
  ];

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
                Up to 16.7% off
              </span>
            </button>
          </div>
          <p className="mt-3 min-h-5 text-center text-xs sm:text-sm text-muted-foreground" aria-live="polite">
            {isYearly ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Annual savings: Save {formatPrice(plusYearlySavings)} on Plus · Save {formatPrice(enterpriseYearlySavings)} on Enterprise
              </span>
            ) : (
              'Switch to annual billing to save on paid plans.'
            )}
          </p>
        </motion.div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mx-auto max-w-6xl mb-16">
          {plans.map((plan, i) => {
            const isPlus = plan.id === 'plus' || plan.name === 'Plus';
            const isEnterprise = plan.id === 'enterprise' || plan.name === 'Enterprise';

            return (
              <motion.div 
                key={plan.id || i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 ${
                  isPlus
                    ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02] z-10'
                    : isEnterprise
                    ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/5 to-transparent shadow-xl'
                    : 'border-border/60 bg-card shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg ${
                      isPlus
                        ? 'bg-primary text-primary-foreground'
                        : isEnterprise
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
                  <p className="text-sm font-semibold text-foreground">
                    {plan.id === 'free' ? `${PLAN_LIMITS.free.items} food items · ${PLAN_LIMITS.free.categories} categories`
                      : isPlus ? `${PLAN_LIMITS.plus.items} food items · ${PLAN_LIMITS.plus.categories} categories`
                      : `${PLAN_LIMITS.enterprise.items} food items · ${PLAN_LIMITS.enterprise.categories} categories`}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isPlus ? 'text-primary' : isEnterprise ? 'text-purple-400' : 'text-muted-foreground'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((feat, idx) => (
                    <li key={`not-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-muted-foreground/40">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/30" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-12 rounded-xl text-sm sm:text-base font-semibold gap-2 ${
                    isEnterprise ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                  }`}
                  variant={isPlus ? 'default' : isEnterprise ? 'default' : 'outline'}
                  onClick={() => {
                    try {
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem('menuzo_upgrade_period', isYearly ? 'yearly' : 'monthly');
                        if (isPlus && !state.user) {
                          sessionStorage.setItem('menuzo_upgrade_intent', 'plus');
                        } else if (isEnterprise && !state.user) {
                          sessionStorage.setItem('menuzo_upgrade_intent', 'enterprise');
                        }
                      }
                    } catch {}
                    dispatch({
                      type: 'SET_VIEW',
                      payload: (isPlus || isEnterprise)
                        ? (state.user ? 'admin-subscription' : 'login')
                        : (state.user ? 'user-dashboard' : 'signup'),
                    });
                  }}
                >
                  {plan.cta}
                  {(isPlus || isEnterprise) && <ArrowRight className="w-4 h-4 ml-1" />}
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
                <th className="py-3 px-3 sm:px-4 font-semibold text-center text-foreground">Free</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-center text-primary">Plus</th>
                <th className="py-3 px-3 sm:px-4 font-semibold text-center text-purple-400">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-3 sm:px-4 font-medium">{row.feature}</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-muted-foreground">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <Check className="w-4 h-4 mx-auto text-muted-foreground" /> : <Minus className="w-4 h-4 mx-auto text-muted-foreground/40" />
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center font-semibold text-foreground">
                    {typeof row.plus === 'boolean' ? (
                      row.plus ? <Check className="w-4 h-4 mx-auto text-primary" /> : <Minus className="w-4 h-4 mx-auto text-muted-foreground/40" />
                    ) : (
                      row.plus
                    )}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-foreground">
                    {typeof row.enterprise === 'boolean' ? (
                      row.enterprise ? <Check className="w-4 h-4 mx-auto text-purple-400" /> : <Minus className="w-4 h-4 mx-auto text-muted-foreground/40" />
                    ) : (
                      row.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
