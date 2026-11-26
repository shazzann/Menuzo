# Menuzo Database Migration & Deployment Guide

**Migration Script:** `supabase/migrations/20261118000001_subscription_restructure.sql`  
**Applied At:** Restructure Phase 2 & 3  
**Target Environment:** Supabase PostgreSQL

---

## 1. Migration Summary

This migration upgrades the database from the single-tier paid model to the structured 3-tier model (Free, Plus, Enterprise) without dropping data, breaking foreign keys, or invalidating historical payment records.

### Key Changes
1. **`subscription_plans` Table Creation:**
   - Stores plan metadata (`id`, `name`, `slug`, `monthly_price`, `annual_price`, `max_items`, `max_categories`, `features`, `is_active`, `sort_order`).
   - Seeded with `free`, `plus`, and `enterprise`.
2. **`billing_payment_requests` Table Upgrade:**
   - Adds `plan_slug text DEFAULT 'plus'` column with foreign key reference to `subscription_plans(slug)`.
3. **RPC Upgrades:**
   - `submit_payment_request`: Accepts optional `p_plan_slug text DEFAULT 'plus'`.
   - `admin_review_billing_payment`: When approving, assigns the plan (`req.plan_slug` or profile's plan or `'plus'`).
   - `resolve_menu_shop`: Supports vanity URLs for `'plus'`, `'pro'`, and `'enterprise'`.
   - `enforce_pro_shop_themes`: Allows theme customization for `'plus'`, `'pro'`, and `'enterprise'`.
   - `admin_list_shop_subscriptions`: Queries and displays plan slugs.
   - `admin_change_subscription_status`: Updates status while accepting `'plus'` or `'enterprise'`.
   - `admin_assign_shop_url`: Grants custom URLs for `'plus'`, `'pro'`, and `'enterprise'`.
   - `admin_revoke_subscription` & `admin_set_subscription_expiry`: Enforce permissions consistently.
4. **Item Limit Trigger:**
   - `enforce_menu_plan_limits()` trigger on `public.food_items` executes `BEFORE INSERT` to ensure API calls cannot bypass subscription plan limits.

---

## 2. Pre-Migration Safety Checks

Before applying the migration in production, run the following verification queries in the Supabase SQL Editor:

```sql
-- 1. Verify existing profiles distribution
SELECT subscription_plan, subscription_status, count(*)
FROM public.profiles
GROUP BY subscription_plan, subscription_status;

-- 2. Verify pending payment requests
SELECT id, shop_id, period_id, amount, status
FROM public.billing_payment_requests
WHERE status = 'pending';

-- 3. Verify existing custom URLs
SELECT count(*) FROM public.shop_custom_urls;
```

---

## 3. Execution Instructions

1. Navigate to your Supabase project dashboard -> **SQL Editor**.
2. Open `supabase/migrations/20261118000001_subscription_restructure.sql`.
3. Execute the script within a single transaction block:
```sql
BEGIN;
\i supabase/migrations/20261118000001_subscription_restructure.sql
COMMIT;
```
4. Verify the newly seeded plans:
```sql
SELECT slug, name, monthly_price, annual_price, max_items, max_categories, is_active
FROM public.subscription_plans
ORDER BY sort_order ASC;
```

Expected result:
```
slug        | name       | monthly_price | annual_price | max_items | max_categories | is_active
------------+------------+---------------+--------------+-----------+----------------+----------
free        | Free       |             0 |            0 |        10 |              2 | t
plus        | Plus       |          1500 |        15000 |       100 |             20 | t
enterprise  | Enterprise |          6000 |        65000 |       500 |             50 | t
```

---

## 4. Post-Migration Verification

Run these validation queries to ensure all RPCs and triggers are operating as expected:

```sql
-- 1. Test plan limit trigger with a dry-run insert
-- Ensure a Free shop with 10 items throws an exception on the 11th item:
-- ERROR:  Free plan limit reached (maximum 10 food items). Upgrade to Plus or Enterprise to add more items.

-- 2. Verify payment requests schema:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'billing_payment_requests' AND column_name = 'plan_slug';
```

---

## 5. Rollback Procedure

If emergency rollback is required, execute the following script:

```sql
BEGIN;

-- Drop food items limit trigger
DROP TRIGGER IF EXISTS trigger_enforce_menu_plan_limits ON public.food_items;
DROP FUNCTION IF EXISTS public.enforce_menu_plan_limits();

-- Remove plan_slug column from billing_payment_requests
ALTER TABLE public.billing_payment_requests DROP COLUMN IF EXISTS plan_slug;

-- Drop subscription_plans table
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- Revert submit_payment_request RPC to original signature
-- (See commit 3903316 for exact previous version)

COMMIT;
```
