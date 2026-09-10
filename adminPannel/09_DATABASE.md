# 09 — Database Audit

---

## Confirmed Schema (from migrations + supabase.ts)

### Table: `profiles`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | NOT NULL | FK → auth.users |
| email | text | NOT NULL | |
| username | text | nullable | Added in migration 001 |
| role | text | DEFAULT 'user' | 'user' or 'admin' |
| subscription_plan | text | nullable | 'free' or 'pro' |
| subscription_status | text | nullable | 'active', 'expired', 'cancelled' |
| subscription_expires_at | timestamptz | nullable | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### Table: `shops`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | NOT NULL PK | |
| user_id | uuid | NOT NULL | FK → auth.users |
| name | text | NOT NULL | |
| username | text | nullable | Unique, slug-based URL |
| tagline | text | nullable | |
| description | text | nullable | |
| logo | text | nullable | URL |
| banner | text | nullable | URL |
| location | text | nullable | |
| contact_number | text | nullable | |
| email | text | nullable | |
| is_open | boolean | nullable | |
| instagram | text | nullable | |
| facebook | text | nullable | |
| website | text | nullable | |
| category_order | text[] | nullable | |
| contacts | jsonb | nullable | Array of contact objects |
| theme | jsonb | nullable | {primary, secondary, accent} |
| opening_hours | jsonb | nullable | |
| view_count | integer | nullable | |
| qr_scan_count | integer | nullable | |
| created_at | timestamptz | NOT NULL | |

### Table: `food_items`

| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | NOT NULL PK |
| shop_id | uuid | NOT NULL |
| name | text | NOT NULL |
| description | text | nullable |
| tagline | text | nullable |
| category | text | nullable |
| image | text | nullable |
| original_price | numeric | NOT NULL (≥0) |
| final_price | numeric | NOT NULL (≥0) |
| discount | numeric | nullable (≥0) |
| is_available | boolean | nullable |
| is_special_offer | boolean | nullable |
| created_at | timestamptz | NOT NULL |

### Table: `shop_daily_stats`

| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | NOT NULL PK |
| shop_id | uuid | NOT NULL FK → shops |
| date | date | NOT NULL |
| views | integer | DEFAULT 0 |
| qr_scans | integer | DEFAULT 0 |

### Table: `activity_logs`

| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | NOT NULL PK |
| user_id | uuid | nullable FK → auth.users |
| action | text | NOT NULL |
| table_name | text | NOT NULL |
| record_id | uuid | nullable |
| old_data | jsonb | nullable |
| new_data | jsonb | nullable |
| created_at | timestamptz | DEFAULT now() |

---

## Finding DB-001

### ID
DB-001

### Severity
CRITICAL

### Category
Database — `admins` table does not exist

### Problem
`CompanyAdminPage.tsx` queries `supabase.from('admins')` but no `admins` table is defined in any migration. The admin verification gate is therefore completely broken.

### Confidence
HIGH — All 6 migrations reviewed, no `admins` table found.

---

## Finding DB-002

### ID
DB-002

### Severity
CRITICAL

### Category
Database — No payment/subscription tables

### Problem
There is no `payment_requests`, `payments`, `subscriptions`, or `invoices` table. The entire manual payment verification workflow — which is the most critical business operation — has no database foundation.

Subscription data is stored as flat columns in `profiles` (`subscription_plan`, `subscription_status`, `subscription_expires_at`). This is acceptable for a small MVP but cannot support:
- Payment history
- Multiple subscriptions
- Payment approval/rejection audit trail
- Admin reviewer tracking

### Impact
Cannot build the payment verification workflow without database changes.

### Confidence
HIGH — Confirmed from complete schema review.

---

## Finding DB-003

### ID
DB-003

### Severity
HIGH

### Category
Database — `username` change blocked by trigger for all users including admin

### Location
`supabase/migrations/20260716000004_add_constraints.sql`

### Problem
The `prevent_username_update` trigger prevents ANY update to `shops.username` once it has been set. This means the admin also cannot change a shop's custom URL slug.

### Evidence
```sql
IF OLD.username IS NOT NULL THEN
  RAISE EXCEPTION 'Cannot update username directly. Contact support.';
END IF;
```

### Impact
Custom URL management by admin is database-blocked. Would require trigger modification or a bypass mechanism.

### Recommended Fix
Modify trigger to allow updates from service role or add an `is_admin_override` mechanism.

### Confidence
HIGH — Confirmed from migration.

---

## Finding DB-004

### ID
DB-004

### Severity
HIGH

### Category
Database — No themes table

### Problem
The `CompanyThemeLibrary` component manages "global themes" but there is no `themes` table. Theme data lives as JSON in `shops.theme` (a per-shop config). There is no shared theme library in the database.

### Confidence
HIGH — No `themes` table in any migration.

---

## Finding DB-005

### ID
DB-005

### Severity
MEDIUM

### Category
Database — `activity_logs` only captures shops and food_items

### Problem
The audit trigger is only applied to `shops` and `food_items`. Admin actions (subscription changes, payment approvals, etc.) are not logged.

### Confidence
HIGH — Confirmed from migration 005.

---

## Finding DB-006

### ID
DB-006

### Severity
MEDIUM

### Category
Database — `profiles` has no `role` column in supabase.ts type definition

### Problem
The `supabase.ts` type definition for `profiles` does not include the `role`, `username`, or `updated_at` columns added in migration 001. This means TypeScript has no type safety for these fields when querying profiles.

### Evidence
```typescript
profiles: {
  Row: {
    created_at: string
    email: string
    id: string
    subscription_expires_at: string | null
    subscription_plan: string | null
    subscription_status: string | null
  }
  // No role, username, or updated_at
}
```

### Confidence
HIGH — Confirmed by comparing migration 001 with supabase.ts.

---

## Missing Tables Required for MVP

```sql
-- MUST CREATE:
CREATE TABLE public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id),
  profile_id uuid REFERENCES public.profiles(id),
  plan_id text NOT NULL, -- 'free', 'pro'
  amount numeric NOT NULL,
  currency text DEFAULT 'LKR',
  reference text, -- Customer's payment reference
  proof_url text, -- Screenshot/receipt URL
  status text DEFAULT 'pending', -- pending, under_review, approved, rejected, cancelled
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES public.admins(id),
  reviewed_at timestamptz,
  rejection_reason text,
  notes text
);
```
