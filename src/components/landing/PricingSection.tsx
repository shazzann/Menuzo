import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useApp } from '@/store';
import { useEffect, useState } from 'react';
import { BillingService } from '@/services/billing.service';
import type { BillingPeriod } from '@/types/billing';
import { PricingService } from '@/services/pricing.service';

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
      // Unpublished pricing stays unavailable; checkout uses the same source.
    });
    return () => { cancelled = true; };
  }, []);

  const isYearly = billingCycle === 'yearly';
  const monthly = periods.find(p => p.id === 'monthly' && p.active && p.amount !== null && p.amount > 0);
  const yearly = periods.find(p => p.id === 'yearly' && p.active && p.amount !== null && p.amount > 0);

  // Standard rates: LKR 1,500/mo and LKR 15,000/yr (with dynamic fallback if configured in DB)
  const monthlyAmount = monthly?.amount ?? 1500;
  const yearlyAmount = yearly?.amount ?? 15000;
  const currency = monthly?.currency ?? yearly?.currency ?? 'LKR';

  const monthlyEquivalent = Math.round(yearlyAmount / 12); // 15,000 / 12 = 1,250
  const yearlySavings = (monthlyAmount * 12) - yearlyAmount; // 18,000 - 15,000 = 3,000
  const savingsPercent = Math.round((yearlySavings / (monthlyAmount * 12)) * 1000) / 10; // 16.7%

  const formatPrice = (amount: number) => `${currency} ${amount.toLocaleString('en-US')}`;

  const plans = basePlans.map(plan => {
    if (plan.id === 'free') {
      return {
        ...plan,
        price: `${currency} 0`,
        period: 'Forever free',
        billingNote: undefined,
      };
    }

    if (plan.id === 'pro') {
      return {
        ...plan,
        price: isYearly ? formatPrice(monthlyEquivalent) : formatPrice(monthlyAmount),
        period: '/month',
        badge: isYearly ? `Save ${savingsPercent}%` : plan.badge,
        billingNote: isYearly
          ? `Billed ${formatPrice(yearlyAmount)} annually · Save ${formatPrice(yearlySavings)}/year (${savingsPercent}%)`
          : `Monthly plan: ${formatPrice(monthlyAmount)} per month.`,
      };
    }

    return plan;
  });

  return (
    <section id="pricing" className="py-32 px-4 bg-muted/20 relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works for your restaurant.
          </p>
        </motion.div>

        {/* Monthly / Annually Segmented Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center mb-16"
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
                Save {savingsPercent}%
              </span>
            </button>
          </div>
          <p className="mt-3 min-h-5 text-center text-xs sm:text-sm text-muted-foreground" aria-live="polite">
            {isYearly ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Save {savingsPercent}% with annual billing ({formatPrice(yearlySavings)}/year)
              </span>
            ) : (
              'Choose the plan that works for your restaurant.'
            )}
          </p>
        </motion.div>

        <div 
          className={`grid gap-8 items-center mx-auto max-w-5xl ${
            plans.length === 1
              ? "grid-cols-1 max-w-md"
              : plans.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? 'border-primary bg-primary/5 shadow-2xl scale-105 z-10' : 'border-border/50 bg-card shadow-lg hover:shadow-xl'}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6 flex flex-wrap items-baseline gap-1.5">
                <span className={`${plan.name === 'Pro' ? 'text-4xl' : 'text-5xl'} font-bold tracking-tight`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground font-medium text-lg">
                    {plan.period}
                  </span>
                )}
              </div>
              {plan.billingNote && (
                <p className="-mt-3 mb-6 text-sm text-muted-foreground font-medium">
                  {plan.billingNote}
                </p>
              )}
              <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50 text-lg">
                {plan.description}
              </p>
              <ul className="space-y-5 mb-10">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-base font-medium">
                    <CheckCircle2 className={`w-6 h-6 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    {feat}
                  </li>
                ))}
                {plan.notIncluded?.map((feat, idx) => (
                  <li key={`not-${idx}`} className="flex items-center gap-4 text-base font-medium text-muted-foreground/40">
                    <XCircle className="w-6 h-6 shrink-0 text-muted-foreground/30" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-semibold" 
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => {
                  try {
                    if (typeof sessionStorage !== 'undefined') {
                      sessionStorage.setItem('menuzo_upgrade_period', isYearly ? 'yearly' : 'monthly');
                      if (plan.name === 'Pro' && !state.user) {
                        sessionStorage.setItem('menuzo_upgrade_intent', 'pro');
                      }
                    }
                  } catch {}
                  dispatch({
                    type: 'SET_VIEW',
                    payload: plan.name === 'Pro'
                      ? (state.user ? 'admin-subscription' : 'login')
                      : (state.user ? 'user-dashboard' : 'signup'),
                  });
                }}
              >
                {plan.cta}
                {plan.popular && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
