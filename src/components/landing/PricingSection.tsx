import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, Minus, RefreshCw } from 'lucide-react';
import { useApp } from '@/store';
import { BillingService } from '@/services/billing.service';
import type { BillingPeriod } from '@/types/billing';
import { trackEvent } from '@/lib/analytics';
import { getPublicWhatsAppUrl } from '@/lib/contact';
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
  const businessWhatsappUrl = getPublicWhatsAppUrl(
    'Hello Menuzo, I would like to discuss the Business plan for our restaurant.'
  );

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
    if (!businessWhatsappUrl) {
      dispatch({ type: 'SET_VIEW', payload: 'contact' });
    } else {
      trackEvent('whatsapp_clicked', { source: 'pricing_business' });
    }
  };

  return (
    <section id="pricing" className="landing-section border-b border-[#D2D8CF]">
      <div className="landing-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-2">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#12261F] mb-3">
              A plan that fits your restaurant.
            </h2>
            <p className="text-base sm:text-lg text-[#3D4A44]">
              Start free and upgrade when your menu needs more.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div
              role="radiogroup"
              aria-label="Billing cycle"
              className="inline-flex p-1 bg-white border border-[#D2D8CF] rounded-[4px]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'monthly'}
                onClick={() => handleToggleCycle('monthly')}
                className={`px-4 py-2 text-sm font-semibold rounded-[4px] transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#12261F] text-white'
                    : 'text-[#3D4A44] hover:text-[#12261F]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'yearly'}
                onClick={() => handleToggleCycle('yearly')}
                className={`px-4 py-2 text-sm font-semibold rounded-[4px] transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#12261F] text-white'
                    : 'text-[#3D4A44] hover:text-[#12261F]'
                }`}
              >
                Annual
              </button>
            </div>
            <p className="min-h-[1.25rem] text-xs font-medium text-[#3D4A44]" aria-live="polite">
              {billingCycle === 'yearly' && model.hasConfirmedAnnualSavings
                ? model.annualSavingsLabel
                : model.hasConfirmedAnnualSavings
                  ? 'Annual billing lowers your monthly cost on Plus.'
                  : 'Clear LKR pricing with no hidden card fees.'}
            </p>
          </div>
        </div>

        {/* Three Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 items-stretch">
          {model.plans.map((plan) => {
            const isPlus = plan.id === 'plus';
            const isBusiness = plan.id === 'business';

            return (
              <article
                key={plan.id}
                className={`flex flex-col p-6 sm:p-7 rounded-[4px] bg-white ${
                  isPlus
                    ? 'border-2 border-[#12261F]'
                    : 'border border-[#D2D8CF]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-[#12261F]">{plan.name}</h3>
                  {plan.badgeText && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-[4px] bg-[#F97316]/15 text-[#12261F] border border-[#F97316]/40">
                      {plan.badgeText}
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#3D4A44] min-h-[2.75rem] mb-5">{plan.tagline}</p>

                <div className="pb-5 mb-5 border-b border-[#EAECE6]">
                  <div className="flex items-baseline gap-1.5 min-h-[2.75rem]">
                    <span className="text-3xl sm:text-4xl font-bold text-[#12261F] tabular-nums">
                      {plan.priceText}
                    </span>
                    {plan.periodText && (
                      <span className="text-sm font-medium text-[#3D4A44]">{plan.periodText}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-[#3D4A44] min-h-[2rem]">{plan.billingNote}</p>

                  {isPlus && status === 'error' && (
                    <button
                      type="button"
                      onClick={() => void loadPeriods()}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#12261F] underline underline-offset-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Retry loading rate
                    </button>
                  )}
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#3D4A44] mb-3">
                  {plan.limitsSummary}
                </p>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-[#12261F]">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0 text-[#1F8A4C]"
                        aria-hidden="true"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {isBusiness && businessWhatsappUrl ? (
                  <a
                    href={businessWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleBusinessContact}
                    className="landing-btn landing-btn-secondary w-full"
                  >
                    {plan.ctaLabel}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={
                      plan.id === 'free'
                        ? handleFreeClick
                        : isPlus
                          ? handlePlusClick
                          : handleBusinessContact
                    }
                    className={`landing-btn w-full ${
                      isPlus ? 'landing-btn-primary' : 'landing-btn-dark'
                    }`}
                  >
                    {plan.ctaLabel}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {/* Compact Semantic Comparison Table */}
        <div className="landing-card bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAECE6]">
            <h3 className="text-lg font-bold text-[#12261F]">Plan comparison</h3>
            <p className="text-xs sm:text-sm text-[#3D4A44]">
              Verified limits and features across Free, Plus, and Business.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse text-sm">
              <caption className="sr-only">Comparison of Menuzo Free, Plus, and Business plans</caption>
              <thead>
                <tr className="border-b border-[#D2D8CF] bg-[#F3F5F0]">
                  <th scope="col" className="py-3 px-4 font-semibold text-[#12261F]">
                    Capability
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center text-[#12261F]">
                    Free
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center text-[#12261F]">
                    Plus
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center text-[#12261F]">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECE6]">
                {model.comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row" className="py-3 px-4 font-medium text-[#12261F]">
                      {row.feature}
                    </th>
                    {(['free', 'plus', 'business'] as const).map((tier) => {
                      const value = row[tier];
                      return (
                        <td key={tier} className="py-3 px-4 text-center text-[#3D4A44]">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <span className="inline-flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#1F8A4C]" aria-hidden="true" />
                                <span className="sr-only">Included</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center">
                                <Minus className="w-4 h-4 text-[#B6C0B3]" aria-hidden="true" />
                                <span className="sr-only">Not included</span>
                              </span>
                            )
                          ) : (
                            <span className="font-medium text-[#12261F]">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
