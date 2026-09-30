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
