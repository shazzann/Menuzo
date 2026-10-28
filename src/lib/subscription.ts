import type { User } from '@/types';

export function freeSubscription(): User['subscription'] {
  return { plan: 'free', status: 'active', expiresAt: null };
}

export function isProActive(subscription: User['subscription'] | undefined, now = Date.now()): boolean {
  return !!subscription && ['pro', 'enterprise'].includes(subscription.plan)
    && subscription.status === 'active' && !!subscription.expiresAt
    && new Date(subscription.expiresAt).getTime() > now;
}

export function subscriptionFromProfile(profile: {
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
} | null): User['subscription'] {
  if (!profile || !['pro', 'enterprise'].includes(profile.subscription_plan || '')) return freeSubscription();
  const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const status = profile.subscription_status === 'cancelled' ? 'cancelled'
    : profile.subscription_status === 'active' && expiresAt && expiresAt.getTime() > Date.now() ? 'active' : 'expired';
  return { plan: profile.subscription_plan as 'pro' | 'enterprise', status, expiresAt };
}

// After Pro ends, the shop keeps every item visible for this many days before the
// Free plan limits apply. Mirrors shop_has_paid_access() in the database.
export const PRO_GRACE_DAYS = 3;
export const PRO_ENDING_SOON_DAYS = 7;
export const FREE_PLAN_LIMITS = { items: 10, categories: 2 } as const;
export const PRO_PLAN_LIMITS = { items: 100, categories: 20 } as const;

export function getPlanLimits(subscription: User['subscription'] | undefined, now = Date.now()) {
  return hasPaidMenuAccess(subscription, now) ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type PlanPhase =
  | { phase: 'free' }
  | { phase: 'active'; endsAt: Date }
  | { phase: 'ending-soon'; endsAt: Date }
  | { phase: 'grace'; endedAt: Date; graceEndsAt: Date };

export function subscriptionPhase(subscription: User['subscription'] | undefined, now = Date.now()): PlanPhase {
  if (!subscription || !['pro', 'enterprise'].includes(subscription.plan) || !subscription.expiresAt) return { phase: 'free' };
  const endsAt = new Date(subscription.expiresAt);
  if (isProActive(subscription, now)) {
    return endsAt.getTime() - now <= PRO_ENDING_SOON_DAYS * DAY_MS ? { phase: 'ending-soon', endsAt } : { phase: 'active', endsAt };
  }
  // Suspended or revoked plans are 'cancelled' and get no grace period.
  const graceEndsAt = new Date(endsAt.getTime() + PRO_GRACE_DAYS * DAY_MS);
  if (subscription.status === 'expired' && graceEndsAt.getTime() > now) return { phase: 'grace', endedAt: endsAt, graceEndsAt };
  return { phase: 'free' };
}

// Pro features, including the grace period: every menu item stays visible.
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
