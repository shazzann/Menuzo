import type { PlanFeatureKey } from '@/lib/subscription';

/** A row of public.subscription_plans as the client reads it. */
export type SubscriptionPlanRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  highlights: string[];
  excluded: string[];
  badge: string | null;
  is_popular: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  max_items: number;
  max_categories: number;
  has_custom_themes: boolean;
  has_qr_branding: boolean;
  has_custom_url: boolean;
  has_advanced_analytics: boolean;
  has_priority_support: boolean;
  has_advanced_customization: boolean;
  has_all_features: boolean;
};

export type PlanPriceSummary = { amount: number; currency: string };

/** A plan as admin_list_plans / admin_save_plan return it. */
export type AdminPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  highlights: string[];
  excluded: string[];
  badge: string | null;
  is_popular: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  max_items: number;
  max_categories: number;
  features: Record<PlanFeatureKey, boolean>;
  prices: Partial<Record<'monthly' | 'yearly', PlanPriceSummary>>;
  active_shops: number;
  updated_at: string;
};

/** What the admin form sends to admin_save_plan. Prices are omitted for Free. */
export type AdminPlanInput = {
  slug: string;
  name: string;
  description: string;
  highlights: string[];
  excluded: string[];
  badge: string | null;
  is_popular: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  max_items: number;
  max_categories: number;
  features: Record<PlanFeatureKey, boolean>;
  prices?: { monthly: number; yearly: number };
};
