import { useCallback, useEffect, useState } from 'react';
import { Check, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/store';
import { BillingService } from '@/services/billing.service';
import type { BillingPeriod } from '@/types/billing';
import { trackEvent } from '@/lib/analytics';
import { getPublicEmailUrl, getPublicWhatsAppUrl } from '@/lib/contact';
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
    <section id="pricing" className="landing-section landing-paper border-b landing-divider">
      <div className="landing-container">
        <div className="landing-reveal flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-xl">
            <span className="landing-rule" aria-hidden="true" />
            <h2 className="landing-h2 text-foreground mb-5">
              Transparent plans for every stage
            </h2>
            <p className="landing-lede">
              Start on the Free plan and upgrade to Plus when your menu grows
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div
              role="radiogroup"
              aria-label="Billing cycle"
              className="inline-flex p-1 bg-card border landing-divider rounded-full shadow-[var(--landing-shadow-sm)]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'monthly'}
                onClick={() => handleToggleCycle('monthly')}
                className={`px-5 min-h-[44px] sm:min-h-[38px] text-sm font-medium rounded-full transition-[color,background-color,box-shadow] duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'yearly'}
                onClick={() => handleToggleCycle('yearly')}
                className={`px-5 min-h-[44px] sm:min-h-[38px] text-sm font-medium rounded-full transition-[color,background-color,box-shadow] duration-300 ${
                  billingCycle === 'yearly'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mb-12 items-stretch">
          {model.plans.map((plan, index) => {
            const isPlus = plan.id === 'plus';
            const isBusiness = plan.id === 'business';
            const periodFormatted = plan.periodText
              ? plan.periodText.startsWith('/')
                ? `/ ${plan.periodText.slice(1)}`
                : plan.periodText
              : '';

            return (
              <div
                key={plan.id}
                className="landing-reveal flex"
                style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
              >
              <Card
                className={`flex flex-col flex-1 p-7 sm:p-8 rounded-[1.5rem] gap-0 ${
                  isPlus ? 'landing-plan-featured lg:-my-3 lg:py-11' : 'landing-card'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{plan.name}</h3>
                  {plan.badgeText && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#12261F] bg-primary rounded-full px-2.5 py-1">
                      {plan.badgeText}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground min-h-[2.75rem] mb-5">{plan.tagline}</p>

                <div className="pb-6 mb-6 border-b landing-divider">
                  <div className="flex items-baseline gap-1.5 min-h-[2.5rem] flex-wrap">
                    <span className="landing-num text-4xl sm:text-[2.75rem] leading-none font-semibold text-foreground">
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

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span
                        className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${
                          isPlus ? 'bg-primary/15 text-[#C2530A] dark:text-primary' : 'bg-foreground/[0.06] text-foreground/70'
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {isBusiness ? (
                  <Button variant="outline" size="lg" asChild className="landing-ghost w-full h-12 rounded-full font-medium">
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
                    className={`w-full h-12 rounded-full ${
                      isPlus ? 'landing-cta bg-primary text-[#12261F] hover:bg-primary/95 font-semibold' : 'landing-ghost font-medium'
                    }`}
                  >
                    {plan.ctaLabel}
                  </Button>
                )}
              </Card>
              </div>
            );
          })}
        </div>

        {/* Overflow-safe Semantic Comparison Table */}
        <Card className="landing-reveal landing-card w-full min-w-0 overflow-hidden p-0 gap-0">
          <div className="px-4 sm:px-6 py-5 border-b landing-divider">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Plan comparison</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Verified limits and features across Free, Plus, and Business
            </p>
          </div>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="sr-only">Comparison of Menuzo Free, Plus, and Business plans</caption>
              <thead>
                <tr className="border-b landing-divider landing-paper">
                  <th scope="col" className="py-3 px-2.5 sm:px-4 font-medium text-foreground">
                    Capability
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-medium text-center text-foreground">
                    Free
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-semibold text-center text-[#C2530A] dark:text-primary bg-primary/[0.06]">
                    Plus
                  </th>
                  <th scope="col" className="py-3 px-2 sm:px-4 font-medium text-center text-foreground">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--landing-hairline))]">
                {model.comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/20 transition-colors">
                    <th scope="row" className="py-3 px-2.5 sm:px-4 font-normal text-foreground">
                      {row.feature}
                    </th>
                    {(['free', 'plus', 'business'] as const).map((tier) => {
                      const value = row[tier];
                      return (
                        <td key={tier} className={`py-3.5 px-2 sm:px-4 text-center text-muted-foreground tabular-nums ${tier === 'plus' ? 'bg-primary/[0.04]' : ''}`}>
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
      </div>
    </section>
  );
}
