import {
  FREE_PLAN_LIMITS,
  PLUS_PLAN_LIMITS,
  PLAN_FEATURES,
} from '@/lib/subscription';
import type { BillingPeriod } from '@/types/billing';

export type LandingBillingCycle = 'monthly' | 'yearly';
export type LandingPricingStatus = 'loading' | 'ready' | 'error';

export interface LandingPlanCardModel {
  id: 'free' | 'plus' | 'business';
  name: string;
  tagline: string;
  priceText: string;
  periodText: string;
  billingNote: string;
  highlight?: boolean;
  badgeText?: string;
  limitsSummary: string;
  features: string[];
  ctaLabel: string;
}

export interface LandingComparisonRow {
  feature: string;
  free: string | boolean;
  plus: string | boolean;
  business: string | boolean;
}

export interface LandingPricingViewModel {
  plans: LandingPlanCardModel[];
  comparisonRows: LandingComparisonRow[];
  hasConfirmedAnnualSavings: boolean;
  annualSavingsLabel: string;
  pricingUnavailable: boolean;
}

function formatLkr(amount: number, currency = 'LKR'): string {
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

/**
 * Single adapter producing both the 3 landing pricing cards and the feature
 * comparison table from verified subscription constants and live billing data.
 */
export function buildLandingPricingModel(
  periods: BillingPeriod[],
  billingCycle: LandingBillingCycle,
  status: LandingPricingStatus
): LandingPricingViewModel {
  const monthlyPeriod = periods.find(
    (p) => p.id === 'monthly' && p.active && typeof p.amount === 'number' && p.amount > 0
  );
  const yearlyPeriod = periods.find(
    (p) => p.id === 'yearly' && p.active && typeof p.amount === 'number' && p.amount > 0
  );

  const currency = monthlyPeriod?.currency || yearlyPeriod?.currency || 'LKR';
  const monthlyAmount = monthlyPeriod?.amount ?? null;
  const yearlyAmount = yearlyPeriod?.amount ?? null;
  const yearlyMonths = yearlyPeriod?.months && yearlyPeriod.months > 0 ? yearlyPeriod.months : 12;

  const hasConfirmedMonthly = monthlyAmount !== null && monthlyAmount > 0;
  const hasConfirmedYearly = yearlyAmount !== null && yearlyAmount > 0;
  const hasConfirmedAnnualSavings =
    hasConfirmedMonthly &&
    hasConfirmedYearly &&
    monthlyAmount * yearlyMonths > yearlyAmount;

  const annualRegular = hasConfirmedAnnualSavings ? monthlyAmount * yearlyMonths : 0;
  const annualSavings = hasConfirmedAnnualSavings ? annualRegular - yearlyAmount : 0;
  const annualSavingsPercent =
    hasConfirmedAnnualSavings && annualRegular > 0
      ? Math.round((annualSavings / annualRegular) * 1000) / 10
      : 0;
  const monthlyEquivalent = hasConfirmedYearly ? Math.round(yearlyAmount / yearlyMonths) : 0;

  let plusPriceText = 'Rate unavailable';
  let plusPeriodText = '';
  let plusBillingNote = 'Current rate is shown during checkout.';
  let pricingUnavailable = false;

  if (status === 'loading') {
    plusPriceText = 'Loading…';
    plusPeriodText = '';
    plusBillingNote = 'Checking current plan rates.';
  } else if (billingCycle === 'yearly') {
    if (hasConfirmedYearly) {
      plusPriceText = formatLkr(monthlyEquivalent, currency);
      plusPeriodText = '/month';
      plusBillingNote = hasConfirmedAnnualSavings
        ? `Billed ${formatLkr(yearlyAmount, currency)} per year — save ${formatLkr(annualSavings, currency)} (${annualSavingsPercent}%)`
        : `Billed ${formatLkr(yearlyAmount, currency)} per ${yearlyMonths} months.`;
    } else {
      pricingUnavailable = true;
      plusPriceText = 'Unavailable';
      plusPeriodText = '';
      plusBillingNote =
        status === 'error'
          ? 'Could not load live annual pricing right now. You can still start free or retry.'
          : 'Annual pricing will appear here once published.';
    }
  } else if (hasConfirmedMonthly) {
    plusPriceText = formatLkr(monthlyAmount, currency);
    plusPeriodText = '/month';
    plusBillingNote = `Monthly billing — ${formatLkr(monthlyAmount, currency)} per month.`;
  } else {
    pricingUnavailable = true;
    plusPriceText = 'Unavailable';
    plusPeriodText = '';
    plusBillingNote =
      status === 'error'
        ? 'Could not load live monthly pricing right now. You can still start free or retry.'
        : 'Monthly pricing will appear here once published.';
  }

  const freeFeatures = [
    `${FREE_PLAN_LIMITS.items} food items`,
    `${FREE_PLAN_LIMITS.categories} menu categories`,
    'Digital menu & standard QR code',
    'Preset menu themes (3–5 themes)',
    'Shareable Menuzo menu link',
    'Basic view counts',
  ];

  const plusFeatures = [
    `${PLUS_PLAN_LIMITS.items} food items`,
    `${PLUS_PLAN_LIMITS.categories} menu categories`,
    'Everything in Free',
    PLAN_FEATURES.plus.customThemes ? 'Plus themes' : '',
    PLAN_FEATURES.plus.qrBranding ? 'Branded QR export' : '',
    PLAN_FEATURES.plus.customUrl ? 'Custom menu URL' : '',
    PLAN_FEATURES.plus.analytics === 'advanced' ? '7 & 30-day view & scan insights' : '',
  ].filter(Boolean);

  const businessFeatures = [
    'Custom menu volume & setup guidance',
    'Onboarding assistance for larger menus',
    'Direct support with the Menuzo team',
    'Custom arrangement tailored to your venue',
  ];

  const plans: LandingPlanCardModel[] = [
    {
      id: 'free',
      name: 'Free',
      tagline: 'Start using Menuzo on tables with zero upfront commitment.',
      priceText: formatLkr(0, currency),
      periodText: 'forever',
      billingNote: 'No card required.',
      limitsSummary: `${FREE_PLAN_LIMITS.items} dishes, ${FREE_PLAN_LIMITS.categories} categories`,
      features: freeFeatures,
      ctaLabel: 'Get started free',
    },
    {
      id: 'plus',
      name: 'Plus',
      tagline: 'Grow your restaurant with more dishes, custom branding, and insights.',
      priceText: plusPriceText,
      periodText: plusPeriodText,
      billingNote: plusBillingNote,
      highlight: true,
      badgeText:
        billingCycle === 'yearly' && hasConfirmedAnnualSavings
          ? `Save ${annualSavingsPercent}%`
          : 'Most popular',
      limitsSummary: `${PLUS_PLAN_LIMITS.items} dishes, ${PLUS_PLAN_LIMITS.categories} categories`,
      features: plusFeatures,
      ctaLabel: 'Choose Plus',
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'Larger operations and hospitality venues with expanded requirements.',
      priceText: 'Custom',
      periodText: '',
      billingNote: 'Discuss tailored setup with our team.',
      limitsSummary: 'Tailored menu capacity',
      features: businessFeatures,
      ctaLabel: 'Contact sales',
    },
  ];

  const comparisonRows: LandingComparisonRow[] = [
    {
      feature: 'Food items',
      free: String(FREE_PLAN_LIMITS.items),
      plus: String(PLUS_PLAN_LIMITS.items),
      business: 'Custom',
    },
    {
      feature: 'Categories',
      free: String(FREE_PLAN_LIMITS.categories),
      plus: String(PLUS_PLAN_LIMITS.categories),
      business: 'Custom',
    },
    {
      feature: 'Browser QR menu (no app)',
      free: PLAN_FEATURES.free.digitalMenu,
      plus: PLAN_FEATURES.plus.digitalMenu,
      business: true,
    },
    {
      feature: 'Portion options & discounts',
      free: true,
      plus: true,
      business: true,
    },
    {
      feature: 'Downloadable QR (PNG/SVG)',
      free: PLAN_FEATURES.free.qrCode,
      plus: PLAN_FEATURES.plus.qrCode,
      business: true,
    },
    {
      feature: 'Menu themes',
      free: '5 preset themes',
      plus: 'Custom brand',
      business: 'Custom brand',
    },
    {
      feature: 'QR styling & logo',
      free: 'Standard',
      plus: 'Branded',
      business: 'Branded',
    },
    {
      feature: 'Custom menu URL',
      free: PLAN_FEATURES.free.customUrl,
      plus: PLAN_FEATURES.plus.customUrl,
      business: true,
    },
    {
      feature: 'Menu insights',
      free: 'Basic views',
      plus: '30-day charts',
      business: '30-day charts',
    },
    {
      feature: 'Dedicated onboarding',
      free: false,
      plus: false,
      business: true,
    },
  ];

  return {
    plans,
    comparisonRows,
    hasConfirmedAnnualSavings,
    annualSavingsLabel: hasConfirmedAnnualSavings
      ? `Save ${formatLkr(annualSavings, currency)} a year with annual billing (${annualSavingsPercent}% off).`
      : '',
    pricingUnavailable,
  };
}
