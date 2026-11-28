import { supabase } from '@/lib/supabase';
import type { PlanDefinition } from '@/lib/subscription';
import type { AdminPlan, AdminPlanInput, SubscriptionPlanRow } from '@/types/plans';

const PLAN_COLUMNS = 'id, slug, name, description, highlights, excluded, badge, is_popular, is_public, is_active, '
  + 'sort_order, max_items, max_categories, has_custom_themes, has_qr_branding, has_custom_url, '
  + 'has_advanced_analytics, has_priority_support, has_advanced_customization, has_all_features';

export function planFromRow(row: SubscriptionPlanRow): PlanDefinition {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    highlights: row.highlights ?? [],
    excluded: row.excluded ?? [],
    badge: row.badge ?? null,
    isPopular: !!row.is_popular,
    isPublic: !!row.is_public,
    isActive: !!row.is_active,
    sortOrder: row.sort_order ?? 100,
    maxItems: row.max_items,
    maxCategories: row.max_categories,
    features: {
      custom_themes: !!row.has_custom_themes,
      qr_branding: !!row.has_qr_branding,
      custom_url: !!row.has_custom_url,
      advanced_analytics: !!row.has_advanced_analytics,
      priority_support: !!row.has_priority_support,
      advanced_customization: !!row.has_advanced_customization,
      all_features: !!row.has_all_features,
    },
  };
}

export const PlansService = {
  /** Every plan, including retired ones (shops on them still need their limits). */
  async getCatalog(): Promise<PlanDefinition[]> {
    const { data, error } = await supabase.from('subscription_plans').select(PLAN_COLUMNS).neq('slug', 'pro');
    if (error) throw error;
    return ((data || []) as unknown as SubscriptionPlanRow[]).map(planFromRow);
  },

  async adminList(): Promise<AdminPlan[]> {
    const { data, error } = await supabase.rpc('admin_list_plans');
    if (error) throw error;
    return data || [];
  },

  async adminSave(plan: AdminPlanInput, create: boolean): Promise<AdminPlan> {
    const { data, error } = await supabase.rpc('admin_save_plan', { p_plan: plan, p_create: create });
    if (error) throw error;
    if (!data) throw new Error('The plan could not be saved. Please try again.');
    return data;
  },
};
