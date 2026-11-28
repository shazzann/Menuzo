import type { User } from '@/types';

/** A plan's permanent ID. Free, Plus and Enterprise are built in; admins can add more. */
export type PlanSlug = string;

/** Features a plan can unlock. Mirrors the has_* columns of subscription_plans. */
export type PlanFeatureKey =
  | 'custom_themes'
  | 'qr_branding'
  | 'custom_url'
  | 'advanced_analytics'
  | 'priority_support'
  | 'advanced_customization'
  | 'all_features';

export type PlanFeatures = Record<PlanFeatureKey, boolean>;

export const PLAN_FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  custom_themes: 'Custom themes',
  qr_branding: 'QR branding',
  custom_url: 'Custom menu URL',
  advanced_analytics: 'Advanced analytics',
  priority_support: 'Priority support',
  advanced_customization: 'Advanced customization',
  all_features: 'All available features',
};

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  description: string;
  highlights: string[];
  excluded: string[];
  badge: string | null;
  isPopular: boolean;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  maxItems: number;
  maxCategories: number;
  features: PlanFeatures;
}

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

const noFeatures: PlanFeatures = {
  custom_themes: false, qr_branding: false, custom_url: false, advanced_analytics: false,
  priority_support: false, advanced_customization: false, all_features: false,
};

/** Used until the database catalog loads, and if it cannot be read. Matches the seeded rows. */
export const BUILT_IN_PLANS: readonly PlanDefinition[] = [
  {
    slug: 'free', name: 'Free', description: '', highlights: [], excluded: [], badge: null,
    isPopular: false, isPublic: true, isActive: true, sortOrder: 0,
    maxItems: FREE_PLAN_LIMITS.items, maxCategories: FREE_PLAN_LIMITS.categories, features: { ...noFeatures },
  },
  {
    slug: 'plus', name: 'Plus', description: '', highlights: [], excluded: [], badge: 'Popular',
    isPopular: true, isPublic: true, isActive: true, sortOrder: 10,
    maxItems: PLUS_PLAN_LIMITS.items, maxCategories: PLUS_PLAN_LIMITS.categories,
    features: { ...noFeatures, custom_themes: true, qr_branding: true, custom_url: true, advanced_analytics: true },
  },
  {
    slug: 'enterprise', name: 'Enterprise', description: '', highlights: [], excluded: [], badge: 'Advanced',
    isPopular: false, isPublic: true, isActive: true, sortOrder: 20,
    maxItems: ENTERPRISE_PLAN_LIMITS.items, maxCategories: ENTERPRISE_PLAN_LIMITS.categories,
    features: {
      custom_themes: true, qr_branding: true, custom_url: true, advanced_analytics: true,
      priority_support: true, advanced_customization: true, all_features: true,
    },
  },
];

// The plan catalog is module state so the synchronous plan checks below can read it;
// usePlanCatalog() (src/lib/plan-catalog.ts) re-renders components when it changes.
let planCatalog: readonly PlanDefinition[] = BUILT_IN_PLANS;
let planCatalogVersion = 0;
const planCatalogListeners = new Set<() => void>();

export function setPlanCatalog(plans: readonly PlanDefinition[]) {
  const bySlug = new Map(plans.map(plan => [plan.slug, plan]));
  // Free must always exist: every unpaid shop falls back to it.
  if (!bySlug.has('free')) bySlug.set('free', BUILT_IN_PLANS[0]);
  planCatalog = [...bySlug.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  planCatalogVersion++;
  planCatalogListeners.forEach(listener => listener());
}

export function getPlanCatalog(): readonly PlanDefinition[] {
  return planCatalog;
}

export function getPlanCatalogVersion() {
  return planCatalogVersion;
}

export function subscribePlanCatalog(listener: () => void) {
  planCatalogListeners.add(listener);
  return () => { planCatalogListeners.delete(listener); };
}

/** 'pro' is the old name for Plus; an empty plan means Free. */
export function normalizePlanSlug(slug: string | null | undefined): PlanSlug {
  const value = (slug || '').trim().toLowerCase();
  if (!value) return 'free';
  return value === 'pro' ? 'plus' : value;
}

export function getPlanDefinition(slug: string | null | undefined): PlanDefinition | undefined {
  const normalized = normalizePlanSlug(slug);
  return planCatalog.find(plan => plan.slug === normalized);
}

/** Paid means any known plan other than Free, retired or not (matches is_paid_plan()). */
export function isPaidPlanSlug(slug: string | null | undefined): boolean {
  const normalized = normalizePlanSlug(slug);
  return normalized !== 'free' && !!getPlanDefinition(normalized);
}

/** Paid plans a shop can buy now, in display order. */
export function purchasablePlans(): PlanDefinition[] {
  return planCatalog.filter(plan => plan.slug !== 'free' && plan.isActive);
}

export function planDisplayName(slug: string | null | undefined): string {
  return getPlanDefinition(slug)?.name ?? 'Free';
}

/** @deprecated Paid plans are now dynamic; use isPaidPlanSlug(). */
export const PAID_PLANS: readonly PlanSlug[] = ['plus', 'pro', 'enterprise'];

export function freeSubscription(): User['subscription'] {
  return { plan: 'free', status: 'active', expiresAt: null };
}

export function isPaidActive(subscription: User['subscription'] | undefined, now = Date.now()): boolean {
  return !!subscription && isPaidPlanSlug(subscription.plan)
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
  const plan = normalizePlanSlug(profile?.subscription_plan);
  // The plan ID is kept even if the catalog has not loaded yet; paid checks consult the
  // catalog at call time, so a plan that turns out unknown never grants access.
  if (!profile || plan === 'free') {
    return freeSubscription();
  }
  const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const status = profile.subscription_status === 'cancelled'
    ? 'cancelled'
    : profile.subscription_status === 'active' && expiresAt && expiresAt.getTime() > Date.now()
      ? 'active'
      : 'expired';
  return { plan, status, expiresAt };
}

// After a paid plan ends, the shop keeps every item visible for this many days before
// Free plan limits apply. Mirrors shop_has_paid_access() in the database.
export const PLUS_GRACE_DAYS = 3;
export const PLUS_ENDING_SOON_DAYS = 7;
export const PRO_GRACE_DAYS = PLUS_GRACE_DAYS;
export const PRO_ENDING_SOON_DAYS = PLUS_ENDING_SOON_DAYS;

const legacyFeatureKeys = {
  digitalMenu: null,
  qrCode: null,
  customThemes: 'custom_themes',
  qrBranding: 'qr_branding',
  customUrl: 'custom_url',
  analytics: null,
  prioritySupport: 'priority_support',
  advancedCustomization: 'advanced_customization',
  allFeatures: 'all_features',
} as const satisfies Record<string, PlanFeatureKey | null>;

/** Feature switches per built-in plan, in the older camelCase shape. */
export const PLAN_FEATURES = {
  free: { digitalMenu: true, qrCode: true, customThemes: false, qrBranding: false, customUrl: false, analytics: 'basic', prioritySupport: false, advancedCustomization: false, allFeatures: false },
  plus: { digitalMenu: true, qrCode: true, customThemes: true, qrBranding: true, customUrl: true, analytics: 'advanced', prioritySupport: false, advancedCustomization: false, allFeatures: false },
  pro: { digitalMenu: true, qrCode: true, customThemes: true, qrBranding: true, customUrl: true, analytics: 'advanced', prioritySupport: false, advancedCustomization: false, allFeatures: false },
  enterprise: { digitalMenu: true, qrCode: true, customThemes: true, qrBranding: true, customUrl: true, analytics: 'advanced', prioritySupport: true, advancedCustomization: true, allFeatures: true },
} as const;

/** The plan whose item and category limits apply now: the paid plan (including grace), else Free. */
export function effectivePlan(subscription: User['subscription'] | undefined, now = Date.now()): PlanDefinition {
  const free = getPlanDefinition('free') ?? BUILT_IN_PLANS[0];
  if (!hasPaidMenuAccess(subscription, now)) return free;
  return getPlanDefinition(subscription?.plan) ?? BUILT_IN_PLANS[1];
}

export function getPlanLimits(subscription: User['subscription'] | undefined, now = Date.now()) {
  const plan = effectivePlan(subscription, now);
  return { items: plan.maxItems, categories: plan.maxCategories };
}

/** The message for a reached item or category limit, naming the next bigger plan if one can be bought. */
export function planLimitMessage(
  subscription: User['subscription'] | undefined,
  kind: 'items' | 'categories',
  now = Date.now()
): { message: string; canUpgrade: boolean } {
  const current = effectivePlan(subscription, now);
  const limitOf = (plan: PlanDefinition) => (kind === 'items' ? plan.maxItems : plan.maxCategories);
  const noun = kind === 'items' ? 'food items' : 'categories';
  const limit = limitOf(current);
  const next = purchasablePlans()
    .filter(plan => limitOf(plan) > limit)
    .sort((a, b) => limitOf(a) - limitOf(b))[0];
  return next
    ? { message: `The ${current.name} plan allows up to ${limit} ${noun}. Upgrade to ${next.name} to add up to ${limitOf(next)} ${noun}.`, canUpgrade: true }
    : { message: `The ${current.name} plan allows up to ${limit} ${noun}. Plan limit reached.`, canUpgrade: false };
}

/**
 * The plan whose features (themes, QR branding, custom URL, analytics, no "Powered by")
 * a shop has. A shop keeps its paid plan's features after the plan expires or an admin
 * suspends or revokes it; only the item and category limits drop to Free (effectivePlan).
 */
export function featurePlan(subscription: User['subscription'] | undefined): PlanDefinition {
  const free = getPlanDefinition('free') ?? BUILT_IN_PLANS[0];
  if (!subscription || !isPaidPlanSlug(subscription.plan)) return free;
  return getPlanDefinition(subscription.plan) ?? free;
}

/** True for any shop on a paid plan, active or ended: it keeps paid features. */
export function hasPaidFeatures(subscription: User['subscription'] | undefined): boolean {
  return featurePlan(subscription).slug !== 'free';
}

// `now` is kept for existing callers; features no longer depend on the plan being active.
export function hasPlanFeature(subscription: User['subscription'] | undefined, feature: PlanFeatureKey, _now = Date.now()): boolean {
  void _now;
  return featurePlan(subscription).features[feature];
}

export function hasFeatureAccess(
  subscription: User['subscription'] | undefined,
  feature: keyof typeof legacyFeatureKeys,
  now = Date.now()
): boolean {
  const key = legacyFeatureKeys[feature];
  return key === null ? true : hasPlanFeature(subscription, key, now);
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
  if (!subscription || !isPaidPlanSlug(subscription.plan) || !subscription.expiresAt) {
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
