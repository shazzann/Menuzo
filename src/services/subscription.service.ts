import { supabase } from '@/lib/supabase';
import {
  subscriptionFromProfile,
  getPlanLimits,
  hasFeatureAccess,
  canCreateItem,
  canCreateCategory,
  calculateSubscriptionExpiry,
} from '@/lib/subscription';
import type { User } from '@/types';

// Plan definitions (limits, features, prices) live in the plan catalog: see PlansService
// and src/lib/subscription.ts.
export const SubscriptionService = {
  async getSubscription(userId: string): Promise<User['subscription']> {
    const { data, error } = await supabase.from('profiles')
      .select('subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', userId).maybeSingle();
    if (error) throw error;
    return subscriptionFromProfile(data);
  },

  getPlanLimits(subscription: User['subscription'] | undefined) {
    return getPlanLimits(subscription);
  },

  hasFeatureAccess(subscription: User['subscription'] | undefined, feature: Parameters<typeof hasFeatureAccess>[1]) {
    return hasFeatureAccess(subscription, feature);
  },

  canCreateItem(currentCount: number, subscription: User['subscription'] | undefined) {
    return canCreateItem(currentCount, subscription);
  },

  canCreateCategory(currentCount: number, subscription: User['subscription'] | undefined) {
    return canCreateCategory(currentCount, subscription);
  },

  calculateSubscriptionExpiry(startDate: Date, months: number): Date {
    return calculateSubscriptionExpiry(startDate, months);
  },
};
