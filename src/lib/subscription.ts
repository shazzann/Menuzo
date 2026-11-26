import type { User } from '@/types';

export type PlanSlug = 'free' | 'plus' | 'pro' | 'enterprise';

export const PAID_PLANS: readonly PlanSlug[] = ['plus', 'pro', 'enterprise'];

export function freeSubscription(): User['subscription'] {
  return { plan: 'free', status: 'active', expiresAt: null };
}

export function isPaidActive(subscription: User['subscription'] | undefined, now = Date.now()): boolean {
  return !!subscription && PAID_PLANS.includes(subscription.plan as PlanSlug)
    && subscription.status === 'active' && !!subscription.expiresAt
    && new Date(subscription.expiresAt).getTime() > now;
}

// Backward-compatible alias for isPaidActive
export const isProActive = isPaidActive;

export function subscriptionFromProfile(profile: {
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
} | null): User['subscription'] {
  if (!profile || !PAID_PLANS.includes((profile.subscription_plan || '') as PlanSlug)) {
    return freeSubscription();
  }
  const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const status = profile.subscription_status === 'cancelled'
    ? 'cancelled'
    : profile.subscription_status === 'active' && expiresAt && expiresAt.getTime() > Date.now()
      ? 'active'
      : 'expired';
  return { plan: profile.subscription_plan as 'free' | 'plus' | 'pro' | 'enterprise', status, expiresAt };
}

// After a paid plan ends, the shop keeps every item visible for this many days before
// Free plan limits apply. Mirrors shop_has_paid_access() in the database.
export const PLUS_GRACE_DAYS = 3;
export const PLUS_ENDING_SOON_DAYS = 7;
export const PRO_GRACE_DAYS = PLUS_GRACE_DAYS;
export const PRO_ENDING_SOON_DAYS = PLUS_ENDING_SOON_DAYS;

export const FREE_PLAN_LIMITS = { items: 10, categories: 2 } as const;
export const PLUS_PLAN_LIMITS = { items: 100, categories: 20 } as const;
export const PRO_PLAN_LIMITS = PLUS_PLAN_LIMITS; // Backward compatibility
export const ENTERPRISE_PLAN_LIMITS = { items: 500, categories: 50 } as const;

export const PLAN_LIMITS = {
  free: FREE_PLAN_LIMITS,
  plus: PLUS_PLAN_LIMITS,
  pro: PRO_PLAN_LIMITS,
  enterprise: ENTERPRISE_PLAN_LIMITS,
} as const;

export const PLAN_FEATURES = {
  free: {
    digitalMenu: true,
    qrCode: true,
    customThemes: false,
    qrBranding: false,
    customUrl: false,
    analytics: 'basic',
    prioritySupport: false,
    advancedCustomization: false,
    allFeatures: false,
  },
  plus: {
    digitalMenu: true,
    qrCode: true,
    customThemes: true,
    qrBranding: true,
    customUrl: true,
    analytics: 'advanced',
    prioritySupport: false,
    advancedCustomization: false,
    allFeatures: false,
  },
  pro: {
    digitalMenu: true,
    qrCode: true,
    customThemes: true,
    qrBranding: true,
    customUrl: true,
    analytics: 'advanced',
    prioritySupport: false,
    advancedCustomization: false,
    allFeatures: false,
  },
  enterprise: {
    digitalMenu: true,
    qrCode: true,
    customThemes: true,
    qrBranding: true,
    customUrl: true,
    analytics: 'advanced',
    prioritySupport: true,
    advancedCustomization: true,
    allFeatures: true,
  },
} as const;

export const PLAN_PRICING = {
  free: { monthly: 0, annual: 0 },
  plus: { monthly: 1500, annual: 15000, annualRegular: 18000, annualSavings: 3000 },
  enterprise: { monthly: 6000, annual: 65000, annualRegular: 72000, annualSavings: 7000 },
} as const;

export function getPlanLimits(subscription: User['subscription'] | undefined, now = Date.now()) {
  if (!hasPaidMenuAccess(subscription, now)) {
    return FREE_PLAN_LIMITS;
  }
  if (subscription?.plan === 'enterprise') {
    return ENTERPRISE_PLAN_LIMITS;
  }
  return PLUS_PLAN_LIMITS;
}

export function hasFeatureAccess(
  subscription: User['subscription'] | undefined,
  feature: keyof typeof PLAN_FEATURES['enterprise'],
  now = Date.now()
): boolean {
  if (!hasPaidMenuAccess(subscription, now)) {
    return !!PLAN_FEATURES.free[feature];
  }
  const plan = (subscription?.plan || 'free') as keyof typeof PLAN_FEATURES;
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.plus;
  return !!features[feature];
}

export function canCreateItem(
  currentCount: number,
  subscription: User['subscription'] | undefined,
  now = Date.now()
): boolean {
  return currentCount < getPlanLimits(subscription, now).items;
}

export function canCreateCategory(
  currentCount: number,
  subscription: User['subscription'] | undefined,
  now = Date.now()
): boolean {
  return currentCount < getPlanLimits(subscription, now).categories;
}

export function calculateSubscriptionExpiry(startDate: Date, months: number): Date {
  const result = new Date(startDate);
  result.setMonth(result.getMonth() + months);
  return result;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type PlanPhase =
  | { phase: 'free' }
  | { phase: 'active'; endsAt: Date }
  | { phase: 'ending-soon'; endsAt: Date }
  | { phase: 'grace'; endedAt: Date; graceEndsAt: Date };

export function subscriptionPhase(subscription: User['subscription'] | undefined, now = Date.now()): PlanPhase {
  if (!subscription || !PAID_PLANS.includes(subscription.plan as PlanSlug) || !subscription.expiresAt) {
    return { phase: 'free' };
  }
  const endsAt = new Date(subscription.expiresAt);
  if (isPaidActive(subscription, now)) {
    return endsAt.getTime() - now <= PLUS_ENDING_SOON_DAYS * DAY_MS
      ? { phase: 'ending-soon', endsAt }
      : { phase: 'active', endsAt };
  }
  // Suspended or revoked plans are 'cancelled' and get no grace period.
  const graceEndsAt = new Date(endsAt.getTime() + PLUS_GRACE_DAYS * DAY_MS);
  if (subscription.status === 'expired' && graceEndsAt.getTime() > now) {
    return { phase: 'grace', endedAt: endsAt, graceEndsAt };
  }
  return { phase: 'free' };
}

// Paid features, including the grace period: every menu item stays visible.
export function hasPaidMenuAccess(subscription: User['subscription'] | undefined, now = Date.now()): boolean {
  const { phase } = subscriptionPhase(subscription, now);
  return phase !== 'free';
}

export type PlanNoticeKind = 'ending-soon' | 'grace' | 'hidden';

// Which plan notice the owner should see, if any.
export function planNotice(subscription: User['subscription'] | undefined, hiddenItemCount: number, now = Date.now()): PlanNoticeKind | null {
  const { phase } = subscriptionPhase(subscription, now);
  if (phase === 'ending-soon' || phase === 'grace') return phase;
  if (phase === 'free' && hiddenItemCount > 0) return 'hidden';
  return null;
}
