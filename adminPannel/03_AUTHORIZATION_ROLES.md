# 03 — Authorization & Roles Audit

---

## Finding ROLE-001

### ID
ROLE-001

### Severity
CRITICAL

### Category
Authorization — Admin panel is accessible to any authenticated user

### Location
`src/pages/CompanyAdminPage.tsx` — `verifyAdmin()` (lines 118–149), `src/App.tsx` — (lines 103–121)

### Problem
The `App.tsx` only treats views starting with `admin-` (shop admin views) and `user-dashboard` as private views requiring authentication. The `company-admin` view **is NOT included** in the `isPrivateView` check.

### Evidence
```typescript
const isPrivateView = currentView.startsWith('admin-') || 
  currentView === 'user-dashboard' || 
  currentView === 'onboarding';
```
`company-admin` is not listed. This means any logged-in customer can navigate to `company-admin` view programmatically.

### Impact
A regular shop owner could access the company admin panel by dispatching `SET_VIEW` from browser console or navigating to `/admin-portal`.

### Recommended Fix
Add `company-admin` to the `isPrivateView` check AND add an additional `isAdminView` check that verifies admin role.

### Confidence
HIGH — Confirmed from source code.

---

## Finding ROLE-002

### ID
ROLE-002

### Severity
HIGH

### Category
Authorization — Admin check is frontend-only

### Location
`src/pages/CompanyAdminPage.tsx` — `verifyAdmin()` (lines 128–136)

### Problem
The admin authorization check is performed in a React `useEffect` that runs **after** the component has already rendered and displayed all admin data to the browser. This is a frontend-only check — no server-side enforcement exists for admin panel operations.

### Evidence
The `verifyAdmin()` runs after mount, meaning the admin UI fully renders before the check completes. A fast user could see/interact with admin data before being redirected.

### Impact
Data visible in the admin UI renders before auth check completes. More critically, all Supabase queries in admin components run with the user's client credentials — not a service role. There is no RLS policy enforcing admin-only access on any admin-relevant table.

### Confidence
HIGH — Confirmed from source code and RLS review.

---

## Finding ROLE-003

### ID
ROLE-003

### Severity
HIGH

### Category
Authorization — No RLS protection for admin read operations

### Location
`supabase/migrations/20260716000002_setup_rls.sql`

### Problem
The `shops` table has a public SELECT policy: `USING (is_open = true)`. This means only open shops are publicly visible. However, the `CompanyShopList` component performs a SELECT without any admin filter — it relies on the Supabase client JWT to pass RLS. If an ordinary user's JWT is used to query, they can only see their own shop.

There is no RLS policy granting admins unrestricted SELECT on `shops`, `profiles`, or `food_items`. The admin component depends on the `admins` table existing (which it doesn't) to prove identity — and even then, there is no `USING` clause for admin read access.

### Impact
The admin Shop List will either show nothing (if RLS blocks) or show only limited data. Admin cannot see all shops without a proper admin RLS policy or service role.

### Recommended Fix
Add admin RLS policies:
```sql
CREATE POLICY "Admins can view all shops"
  ON public.shops FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );
```
Or use Supabase Edge Functions with service role for all admin operations.

### Confidence
HIGH — Confirmed from migrations.

---

## Finding ROLE-004

### ID
ROLE-004

### Severity
MEDIUM

### Category
Authorization — Role system is undefined in the admin panel

### Location
`src/types/index.ts` (CompanyAdminSection), `src/pages/CompanyAdminPage.tsx`

### Problem
The admin panel has no concept of different admin roles with different permissions. "Super Admin" is hardcoded as a display label. All admin users see the same navigation and have access to all sections.

### Impact
When multiple admins are added, there is no way to restrict one admin from accessing sensitive operations (e.g., billing, security settings).

### Confidence
HIGH — No role-based rendering found anywhere in company-admin components.

---

## Finding ROLE-005

### ID
ROLE-005

### Severity
MEDIUM

### Category
Authorization — No server-side enforcement for destructive admin actions

### Location
All company-admin components (CompanyShopList, CompanyShopDetail, etc.)

### Problem
All admin action buttons (suspend, delete, change plan, etc.) in the UI have no actual backend calls. They are UI-only. When backend calls are eventually added, there is no server-side admin role verification for these operations.

### Confidence
HIGH — No Supabase mutations found in any company-admin component except `CompanyShopList.fetchShops()`.

---

## Summary

| Finding | Severity |
|---------|----------|
| ROLE-001 — `company-admin` view not in private view guard | CRITICAL |
| ROLE-002 — Admin auth check is client-side and post-render | HIGH |
| ROLE-003 — No RLS policy for admin reading all shops/profiles | HIGH |
| ROLE-004 — No multi-role admin system | MEDIUM |
| ROLE-005 — No server-side enforcement for admin actions | MEDIUM |
