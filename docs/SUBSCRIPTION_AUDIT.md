# Menuzo Subscription Restructuring — Comprehensive Project Audit (Phase 1)

**Date:** 2026-11-18  
**Project:** Menuzo (Digital Menu SaaS for Restaurants)  
**Task:** Pro → Plus rebranding, New Enterprise tier introduction, centralized subscription engine, pricing update, database migration, landing page, customer dashboard, company admin, and testing.

---

## 1. Executive Summary & Objective

The objective of this restructuring is to upgrade Menuzo's subscription system from a 2-tier model (Free & Pro) to a scalable 3-tier model:
1. **Free** (Starter) — LKR 0 (10 food items, 2 categories)
2. **Plus** (Previously Pro) — LKR 1,500/month or LKR 15,000/year (100 food items, 20 categories)
3. **Enterprise** (Advanced) — LKR 6,000/month or LKR 65,000/year (500 food items, 50 categories, all Plus features + priority support + advanced customization + advanced analytics + all current features)

This audit establishes the baseline across the frontend, backend, database schema, payment workflows, and automated tests.

---

## 2. Existing System Architecture Analysis

### 2.1 Database Schema (Supabase PostgreSQL)
- **`profiles` table**:
  - `subscription_plan` (`text`, default `'free'`): currently stores `'free'`, `'pro'`, or `'enterprise'`.
  - `subscription_status` (`text`, default `'active'`): values `'active'`, `'expired'`, `'cancelled'`.
  - `subscription_expires_at` (`timestamptz`): tracks when paid access ends.
  - Trigger `protect_profile_entitlements`: restricts direct mutations to `subscription_plan`, `subscription_status`, and `subscription_expires_at` from non-admins.
- **`billing_periods` table**:
  - Stores billing frequencies (`monthly`, `yearly`), `amount` (numeric), `currency` (`LKR`), `months` (1, 12), and `active` (`boolean`).
  - Previously tied to single Pro plan pricing.
- **`billing_payment_requests` table**:
  - Tracks customer bank transfer submissions: `user_id`, `shop_id`, `period_id`, `amount`, `currency`, `payer_name`, `transfer_reference`, `status` (`pending`, `approved`, `rejected`), `requested_slug`.
- **`shop_custom_urls` table**:
  - Maps shop aliases. Only accessible when owner has active paid subscription.
- **`shops` and `food_items` tables**:
  - `shops` linked to `user_id`.
  - `food_items` linked to `shop_id`.
  - Triggers currently enforce Pro themes (`enforce_pro_shop_themes`).

### 2.2 Frontend & Application Logic
- **`src/lib/subscription.ts`**:
  - Central place where `isProActive`, `subscriptionFromProfile`, `FREE_PLAN_LIMITS` (10 items, 2 categories), and `PRO_PLAN_LIMITS` (100 items, 20 categories) are defined.
  - Grace period is 3 days (`PRO_GRACE_DAYS = 3`), warning period is 7 days (`PRO_ENDING_SOON_DAYS = 7`).
- **`src/services/pricing.service.ts`**:
  - Local definitions for `PricingPlan[]` with Free and Pro. Uses `localStorage` cache (`menuzo_pricing_plans`).
- **`src/services/billing.service.ts`**:
  - Interacts with `billing_periods`, `bank_transfer_settings`, `billing_payment_requests`, and RPC `submit_payment_request`.
- **`src/services/company-billing.service.ts`**:
  - Company admin RPC calls for reviewing payments (`admin_review_billing_payment`), listing requests, setting expiry dates, revoking subscriptions, etc.
- **Customer Pages**:
  - `src/pages/SubscriptionPage.tsx`: multi-step checkout (Select period -> Bank transfer -> Verify payment via WhatsApp).
  - `src/components/subscription/SubscriptionPlanComparison.tsx`: 2-column comparison card for Free and Pro.
  - `src/pages/AdminAddFoodPage.tsx`: checks `atItemLimit` and `atCategoryLimit` against `PRO_PLAN_LIMITS` / `FREE_PLAN_LIMITS`.
  - `src/pages/UserDashboardPage.tsx`: shows current plan and upgrade link.
- **Landing Page**:
  - `src/components/landing/PricingSection.tsx`: displays 2 plans (Free and Pro) with monthly/yearly toggle.
  - `src/components/landing/FAQSection.tsx` and `Navbar.tsx`: contain Pro references.
- **Company Admin Panel**:
  - `src/components/company-admin/CompanyPlans.tsx`: lists pricing cards, allows price editing.
  - `src/components/company-admin/CompanyBilling.tsx`: handles payment approval/rejection.
  - `src/components/company-admin/CompanyShopList.tsx`: displays shop plans with badge filters.

---

## 3. Inventory of Pro / Free / Subscription References

| Component / File | Current Reference | Required Change |
|---|---|---|
| `src/types/index.ts` | `User.subscription.plan: 'free' \| 'pro' \| 'enterprise'` | Add `'plus'`, maintain `'pro'` for backward compatibility (`'free' \| 'plus' \| 'pro' \| 'enterprise'`). |
| `src/types/billing.ts` | `PaymentRequest` and `BillingPeriod` lack plan slug | Add plan support to checkout input, request types, and plan configuration types. |
| `src/lib/subscription.ts` | `PRO_PLAN_LIMITS` = 100/20, `isProActive` | Rename to Plus (keep alias `isPaidActive`/`isProActive`), add `ENTERPRISE_PLAN_LIMITS` = 500/50, centralized `PLAN_LIMITS`, `PLAN_FEATURES`. |
| `src/services/subscription.service.ts` | Minimal profile reader | Expand into centralized subscription engine (`getPlan`, `getPlanLimits`, `hasFeatureAccess`, `canCreateItem`, `canCreateCategory`, etc.). |
| `src/services/pricing.service.ts` | Only Free and Pro (1,500) | Update to Free, Plus (1,500/mo, 15,000/yr), Enterprise (6,000/mo, 65,000/yr). |
| `src/components/landing/PricingSection.tsx` | 2 cards (Free, Pro) | Redesign to 3 cards (Free, Plus, Enterprise), monthly/annual toggle with savings & effective monthly price for Enterprise (LKR 65,000/yr, saving LKR 7,000/yr = 9.7%). |
| `src/components/subscription/SubscriptionPlanComparison.tsx` | 2 cards (Free, Pro) | Support 3 plans (Free, Plus, Enterprise) or tier selection, comparison matrix. |
| `src/pages/SubscriptionPage.tsx` | Assumes upgrade = Pro | Support selecting between Plus and Enterprise, correct amounts, display current plan and usage. |
| `src/pages/AdminAddFoodPage.tsx` | Only checks Free vs Pro limits | Check user plan dynamically (Free: 10/2, Plus: 100/20, Enterprise: 500/50). |
| `src/pages/UserDashboardPage.tsx` | Pro badge | Plus / Enterprise badge, usage counters (food items & categories capacity). |
| `src/components/company-admin/CompanyPlans.tsx` | Displays Free & Pro | Display Free, Plus, Enterprise with editing for prices, limits, and active status. |
| `src/components/company-admin/CompanyBilling.tsx` | Hardcoded Pro logic in approvals | Handle Plus and Enterprise plans, dynamic plan display, and review activation. |
| `src/components/company-admin/CompanyShopList.tsx` | Plan badges | Add Plus badge, update Pro styling to Plus, retain Enterprise. |
| `src/components/admin/theme/*` | `isPro` theme flags | Rebrand UI labels from Pro to Plus/Enterprise, retain functional access for all paid tiers. |

---

## 4. Database Restructuring Design (Phase 2 & 3 Plan)

### 4.1 Schema Migration (`subscription_plans` table)
Introduce the authoritative `subscription_plans` table:
```sql
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  monthly_price integer NOT NULL DEFAULT 0,
  annual_price integer NOT NULL DEFAULT 0,
  max_items integer NOT NULL DEFAULT 10,
  max_categories integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

Initial seeded records:
- **Free**: slug `'free'`, monthly 0, annual 0, max_items 10, max_categories 2
- **Plus**: slug `'plus'`, monthly 1500, annual 15000, max_items 100, max_categories 20
- **Enterprise**: slug `'enterprise'`, monthly 6000, annual 65000, max_items 500, max_categories 50

### 4.2 Preserving Existing Data & Backward Compatibility
- In `profiles`, existing records with `'pro'` are treated as `'plus'` with full privileges.
- New subscriptions will write `'plus'` or `'enterprise'`.
- All SQL functions (`resolve_menu_shop`, `admin_review_billing_payment`, `enforce_pro_shop_themes`, etc.) are updated to treat `'plus'`, `'pro'`, and `'enterprise'` as paid plans.
- In `billing_payment_requests`, add optional `plan_slug text DEFAULT 'plus'` so future payments accurately store whether the user purchased Plus or Enterprise.

### 4.3 Server-Side Enforcement Trigger
Create database trigger `enforce_menu_plan_limits()` on `food_items` to ensure API calls cannot bypass item limits:
- Reads the shop owner's active plan.
- Calculates max items from plan (Free: 10, Plus: 100, Enterprise: 500).
- Raises exception `'Plan limit reached for food items.'` if exceeded on insertion.

---

## 5. Potential Compatibility Risks & Mitigation

1. **Risk:** Existing Pro subscribers lose paid features during the rename.  
   **Mitigation:** Subscription checks check `['plus', 'pro', 'enterprise'].includes(plan)`. All Pro entitlements continue uninterrupted.
2. **Risk:** Existing unit tests fail because they assert `isProActive` or Pro plan limits.  
   **Mitigation:** `isProActive` is maintained as an alias/wrapper around `isPaidActive`. `PRO_PLAN_LIMITS` is preserved alongside `PLUS_PLAN_LIMITS`.
3. **Risk:** Payment amount mismatch during checkout.  
   **Mitigation:** Checkout quote verification compares against the selected plan and billing period amount dynamically.
4. **Risk:** Race conditions during concurrent item creation.  
   **Mitigation:** Add row-level or advisory lock in backend trigger `enforce_menu_plan_limits` during item insertion.

---

## 6. Audit Conclusion & Approval to Proceed

The codebase is clean, well-tested (154/154 passing tests), and modular. We are ready to proceed with Phase 2 (New Subscription Structure) and Phase 3 (Database Implementation).
