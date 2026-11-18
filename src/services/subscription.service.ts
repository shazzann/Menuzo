import { supabase } from '@/lib/supabase';
import {
  subscriptionFromProfile,
  getPlanLimits,
  hasFeatureAccess,
  canCreateItem,
  canCreateCategory,
  PLAN_LIMITS,
  PLAN_FEATURES,
  PLAN_PRICING,
  calculateSubscriptionExpiry,
  type PlanSlug,
} from '@/lib/subscription';
import type { User } from '@/types';
import type { SubscriptionPlan } from '@/types/billing';

export const SubscriptionService = {
  async getSubscription(userId: string): Promise<User['subscription']> {
    const { data, error } = await supabase.from('profiles')
      .select('subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', userId).maybeSingle();
    if (error) throw error;
    return subscriptionFromProfile(data);
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price');

      if (!error && data && data.length > 0) {
        return data as SubscriptionPlan[];
      }
    } catch {
      // Fallback to default plans if table is not yet available in current environment
    }

    return [
      {
        id: 'plan-free',
        name: 'Free',
        slug: 'free',
        monthly_price: PLAN_PRICING.free.monthly,
        annual_price: PLAN_PRICING.free.annual,
        max_items: PLAN_LIMITS.free.items,
        max_categories: PLAN_LIMITS.free.categories,
        features: PLAN_FEATURES.free,
        is_active: true,
      },
      {
        id: 'plan-plus',
        name: 'Plus',
        slug: 'plus',
        monthly_price: PLAN_PRICING.plus.monthly,
        annual_price: PLAN_PRICING.plus.annual,
        max_items: PLAN_LIMITS.plus.items,
        max_categories: PLAN_LIMITS.plus.categories,
        features: PLAN_FEATURES.plus,
        is_active: true,
      },
      {
        id: 'plan-enterprise',
        name: 'Enterprise',
        slug: 'enterprise',
        monthly_price: PLAN_PRICING.enterprise.monthly,
        annual_price: PLAN_PRICING.enterprise.annual,
        max_items: PLAN_LIMITS.enterprise.items,
        max_categories: PLAN_LIMITS.enterprise.categories,
        features: PLAN_FEATURES.enterprise,
        is_active: true,
      },
    ];
  },

  async getPlan(slug: PlanSlug): Promise<SubscriptionPlan | undefined> {
    const plans = await this.getPlans();
    const normalized = slug === 'pro' ? 'plus' : slug;
    return plans.find(p => p.slug === normalized || (slug === 'pro' && p.slug === 'plus'));
  },

  getPlanLimits(subscription: User['subscription'] | undefined) {
    return getPlanLimits(subscription);
  },

  getPlanFeatures(subscription: User['subscription'] | undefined) {
    const plan = (subscription?.plan === 'pro' ? 'plus' : subscription?.plan || 'free') as keyof typeof PLAN_FEATURES;
    return PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  },

  hasFeatureAccess(subscription: User['subscription'] | undefined, feature: keyof typeof PLAN_FEATURES['enterprise']) {
    return hasFeatureAccess(subscription, feature);
  },

  canCreateItem(currentCount: number, subscription: User['subscription'] | undefined) {
    return canCreateItem(currentCount, subscription);
  },

  canCreateCategory(currentCount: number, subscription: User['subscription'] | undefined) {
    return canCreateCategory(currentCount, subscription);
  },

  calculateSubscriptionPrice(plan: 'free' | 'plus' | 'enterprise', period: 'monthly' | 'yearly'): number {
    const pricing = PLAN_PRICING[plan] || PLAN_PRICING.free;
    return period === 'yearly' ? pricing.annual : pricing.monthly;
  },

  calculateSubscriptionExpiry(startDate: Date, months: number): Date {
    return calculateSubscriptionExpiry(startDate, months);
  },

  canUpgradePlan(currentPlan: PlanSlug, targetPlan: PlanSlug): boolean {
    const tierWeight: Record<PlanSlug, number> = {
      free: 0,
      plus: 1,
      pro: 1,
      enterprise: 2,
    };
    return (tierWeight[targetPlan] ?? 0) > (tierWeight[currentPlan] ?? 0);
  },

  canDowngradePlan(currentPlan: PlanSlug, targetPlan: PlanSlug): boolean {
    const tierWeight: Record<PlanSlug, number> = {
      free: 0,
      plus: 1,
      pro: 1,
      enterprise: 2,
    };
    return (tierWeight[targetPlan] ?? 0) < (tierWeight[currentPlan] ?? 0);
  },
};
