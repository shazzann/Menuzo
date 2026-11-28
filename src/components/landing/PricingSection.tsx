import { useCallback, useEffect, useState } from 'react';
import { Check, Info, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/store';
import { BillingService } from '@/services/billing.service';
import type { BillingPeriod } from '@/types/billing';
import { trackEvent } from '@/lib/analytics';
import { getPublicEmailUrl, getPublicWhatsAppUrl } from '@/lib/contact';
import { FREE_PLAN_LIMITS, PLUS_GRACE_DAYS } from '@/lib/subscription';
import {
  buildLandingPricingModel,
  type LandingBillingCycle,
  type LandingPricingStatus,
} from '@/lib/landingPricing';

export function PricingSection() {
  const { state, dispatch } = useApp();
  const [billingCycle, setBillingCycle] = useState<LandingBillingCycle>('monthly');
  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  const [status, setStatus] = useState<LandingPricingStatus>('loading');

  const loadPeriods = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await BillingService.getPeriods();
      setPeriods(data);
      setStatus('ready');
    } catch {
      setPeriods([]);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let active = true;
    void BillingService.getPeriods()
      .then((data) => {
        if (!active) return;
        setPeriods(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setPeriods([]);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const model = buildLandingPricingModel(periods, billingCycle, status);
  const businessMessage =
    'Hello Menuzo, I would like to discuss the Business plan for our restaurant.';
  const businessWhatsappUrl = getPublicWhatsAppUrl(businessMessage);
  const businessContactHref =
    businessWhatsappUrl || getPublicEmailUrl('Menuzo Business Plan Enquiry', businessMessage);

  const handleToggleCycle = (nextCycle: LandingBillingCycle) => {
    if (nextCycle === billingCycle) return;
    setBillingCycle(nextCycle);
    trackEvent('pricing_toggled', { billing_cycle: nextCycle });
  };

  const handleFreeClick = () => {
    trackEvent('pricing_cta_clicked', {
      source: 'pricing',
      plan: 'free',
      billing_cycle: billingCycle,
    });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source: 'pricing' });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  const handlePlusClick = () => {
    trackEvent('pricing_cta_clicked', {
      source: 'pricing',
      plan: 'plus',
      billing_cycle: billingCycle,
    });
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('menuzo_upgrade_period', billingCycle);
        if (!state.user) {
          sessionStorage.setItem('menuzo_upgrade_intent', 'plus');
        }
      }
    } catch {
      // Ignore storage access errors in restricted browsers.
    }
    dispatch({
      type: 'SET_VIEW',
      payload: state.user ? 'admin-subscription' : 'login',
    });
  };

  const handleBusinessContact = () => {
    trackEvent('pricing_cta_clicked', {
      source: 'pricing',
      plan: 'business',
      billing_cycle: billingCycle,
    });
    trackEvent('whatsapp_clicked', {
      source: businessWhatsappUrl ? 'pricing_business_whatsapp' : 'pricing_business_email',
    });
  };

  return (
    <section id="pricing" className="landing-section bg-muted/30 border-b border-border">
      <div className="landing-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
              Transparent plans for every stage
            </h2>
            <p className="text-base text-muted-foreground">
              Start on the Free plan and upgrade to Plus when your menu grows
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div
              role="radiogroup"
              aria-label="Billing cycle"
              className="inline-flex p-1 bg-muted border border-border rounded-xl"
            >
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'monthly'}
                onClick={() => handleToggleCycle('monthly')}
                className={`px-4 min-h-[44px] sm:min-h-[38px] text-sm font-medium rounded-lg transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-[#12261F]'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'yearly'}
                onClick={() => handleToggleCycle('yearly')}
                className={`px-4 min-h-[44px] sm:min-h-[38px] text-sm font-medium rounded-lg transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-[#12261F]'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                Annual
              </button>
            </div>
            <p className="min-h-[1.25rem] text-xs text-muted-foreground" aria-live="polite">
              {billingCycle === 'yearly' && model.hasConfirmedAnnualSavings ? (
                <span className="font-medium text-[#18753F] dark:text-emerald-400">
                  {model.annualSavingsLabel}
                </span>
              ) : model.hasConfirmedAnnualSavings ? (
                'Annual billing lowers your monthly cost on Plus'
              ) : (
                'Clear LKR pricing with no hidden card fees'
              )}
            </p>
          </div>
        </div>

        {/* Three Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-stretch">
          {model.plans.map((plan) => {
            const isPlus = plan.id === 'plus';
            const isBusiness = plan.id === 'business';
            const periodFormatted = plan.periodText
              ? plan.periodText.startsWith('/')
                ? `/ ${plan.periodText.slice(1)}`
                : plan.periodText
              : '';

            return (
              <Card
                key={plan.id}
                className={`flex flex-col p-6 rounded-2xl bg-card shadow-xs gap-0 ${
                  isPlus ? 'border-2 border-primary' : 'border border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
                  {plan.badgeText && (
                    <span className="text-xs font-medium text-[#C2530A] dark:text-primary">
                      {plan.badgeText}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground min-h-[2.75rem] mb-5">{plan.tagline}</p>

                <div className="pb-5 mb-5 border-b border-border">
                  <div className="flex items-baseline gap-1.5 min-h-[2.5rem]">
                    <span className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                      {plan.priceText}
                    </span>
                    {periodFormatted && (
                      <span className="text-sm text-muted-foreground">
                        {periodFormatted}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground min-h-[2rem]">
                    {plan.billingNote}
                  </p>

                  {isPlus && status === 'error' && (
                    <button
                      type="button"
                      onClick={() => void loadPeriods()}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#C2530A] dark:text-primary underline underline-offset-2 min-h-[44px] sm:min-h-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Retry loading rate
                    </button>
                  )}
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isPlus ? 'text-[#C2530A] dark:text-primary' : 'text-muted-foreground'
                        }`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {isBusiness ? (
                  <Button variant="outline" size="lg" asChild className="w-full h-11 rounded-xl font-medium transition-[color,background-color,transform] active:scale-[0.98]">
                    <a
                      href={businessContactHref}
                      target={businessWhatsappUrl ? '_blank' : undefined}
                      rel={businessWhatsappUrl ? 'noopener noreferrer' : undefined}
                      onClick={handleBusinessContact}
                    >
                      {plan.ctaLabel}
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant={isPlus ? 'default' : 'outline'}
                    size="lg"
                    onClick={plan.id === 'free' ? handleFreeClick : handlePlusClick}
                    className={`w-full h-11 rounded-xl font-medium transition-[color,background-color,transform] active:scale-[0.98] ${
                      isPlus ? 'bg-primary text-[#12261F] hover:bg-primary/90' : ''
                    }`}
                  >
                    {plan.ctaLabel}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Overflow-safe Semantic Comparison Table */}
        <Card className="w-full min-w-0 rounded-2xl border-border bg-card shadow-xs overflow-hidden p-0 gap-0 mb-6">
          <div className="px-4 sm:px-5 py-4 border-b border-border">
            <h3 className="text-base font-medium text-foreground">Plan comparison</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Verified limits and features across Free, Plus, and Business
            </p>
          </div>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="sr-only">Comparison of Menuzo Free, Plus, and Business plans</caption>
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th scope="col" className="py-3 px-2.5 sm:px-4 font-medium text-foreground">
                    Capability
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-medium text-center text-foreground">
                    Free
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-medium text-center text-[#C2530A] dark:text-primary">
                    Plus
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-medium text-center text-foreground">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {model.comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/20 transition-colors">
                    <th scope="row" className="py-3 px-2.5 sm:px-4 font-normal text-foreground">
                      {row.feature}
                    </th>
                    {(['free', 'plus', 'business'] as const).map((tier) => {
                      const value = row[tier];
                      return (
                        <td key={tier} className="py-3 px-2 sm:px-4 text-center text-muted-foreground tabular-nums">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <span className="inline-flex items-center justify-center">
                                <Check
                                  className={`w-4 h-4 ${
                                    tier === 'plus' ? 'text-[#C2530A] dark:text-primary' : 'text-muted-foreground'
                                  }`}
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Included</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center">
                                <Minus className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} aria-hidden="true" />
                                <span className="sr-only">Not included</span>
                              </span>
                            )
                          ) : (
                            <span className="font-medium text-foreground">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Limit Enforcement Note */}
        <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden="true" />
          <p>
            <span className="font-medium text-foreground">What happens when a plan limit is reached? </span>
            Creating new items or categories stops once your active limit is reached. If a Plus plan expires, your menu keeps everything visible for a {PLUS_GRACE_DAYS}-day grace period, then items above the Free allowance ({FREE_PLAN_LIMITS.items} dishes, {FREE_PLAN_LIMITS.categories} categories) remain safely saved in your dashboard and are simply hidden from the public menu until you upgrade.
          </p>
        </div>
      </div>
    </section>
  );
}
