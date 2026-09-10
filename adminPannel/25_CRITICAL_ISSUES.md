# 25 — Critical Issues

Priority-ranked issues that must be addressed before production.

---

## P0 — CRITICAL (Launch Blockers with Security Risk)

### P0-001 — Admin login form is completely fake
- **ID**: AUTH-001
- **Location**: `src/pages/CompanyAdminLoginPage.tsx`
- **Problem**: Email/password form uses `setTimeout` mock. No real authentication.
- **Impact**: Any person can access admin UI by submitting any credentials.
- **Fix**: Replace with `supabase.auth.signInWithPassword()`.

### P0-002 — `/admin-portal` URL bypasses login entirely
- **ID**: AUTH-002
- **Location**: `src/store/index.tsx` — `getInitialView()`
- **Problem**: Direct URL access loads admin panel without any auth.
- **Impact**: Anyone who knows the URL has full admin UI access.
- **Fix**: Remove the `admin-portal` path shortcut from `getInitialView()`.

### P0-003 — `admins` table does not exist
- **ID**: AUTH-003, DB-001
- **Location**: `supabase/migrations/` — missing migration
- **Problem**: Admin verification queries a table that doesn't exist. Auth gate is broken.
- **Impact**: Legitimate admins cannot log in reliably. The security gate is non-functional.
- **Fix**: Create `admins` table migration and seed super admin.

### P0-004 — `company-admin` view not protected by auth guard
- **ID**: ROLE-001
- **Location**: `src/App.tsx` — `isPrivateView` check
- **Problem**: Regular authenticated users can access admin panel.
- **Impact**: Any customer account can access all admin UI.
- **Fix**: Add `company-admin` to `isPrivateView` and add admin role check.

---

## P1 — HIGH (Launch Blockers without Security Risk)

### P1-001 — No payment request system
- **ID**: BIZ-002, DB-002
- **Problem**: The core business operation (manual payment → approval → subscription) has no implementation.
- **Impact**: Cannot process any paying customer.
- **Fix**: Create `payment_requests` table + admin UI + approval workflow.

### P1-002 — No subscription activation mechanism
- **ID**: BIZ-001
- **Problem**: Admin cannot activate or change a shop's subscription.
- **Impact**: Even if a customer pays, there is no way to give them Pro access.
- **Fix**: Admin function to update `profiles.subscription_plan/status/expires_at`.

### P1-003 — Pricing plans stored in localStorage only
- **ID**: API-001
- **Problem**: Plan price changes are per-browser and not persisted to database.
- **Impact**: Every admin browser shows default prices; changes don't propagate.
- **Fix**: Create `plans` table; load/save from Supabase.

### P1-004 — Admin shop actions (suspend, edit, delete) are UI-only
- **ID**: MGT-001
- **Problem**: All action buttons have no `onClick` handlers.
- **Impact**: Admin panel cannot perform any shop management operation.
- **Fix**: Implement Supabase mutations for each action.

### P1-005 — No admin-level RLS policies
- **ID**: ROLE-003, API-003
- **Problem**: Admin queries are blocked by user-level RLS.
- **Impact**: Admin shop list may show incomplete or wrong data.
- **Fix**: Add admin RLS policies for `shops`, `profiles`, `food_items`.

---

## P2 — MEDIUM (Should Fix Soon)

### P2-001 — Dashboard uses 100% mock data
- **ID**: DASH-001
- **Problem**: All KPI cards, charts, and activity feed are fake.
- **Fix**: Connect to real Supabase queries or show empty states.

### P2-002 — Multiple nav items silently load Dashboard
- **ID**: NAV-001, UX-001
- **Fix**: Add "Coming Soon" placeholder for unimplemented sections.

### P2-003 — No error states for failed queries
- **ID**: API-004, LOAD-002
- **Fix**: Add error state components and toast notifications.

### P2-004 — Debug console.log in production render
- **ID**: CQ-004, SEC-007
- **Fix**: Remove the `console.log('Rendering section:', currentSection)` line.

### P2-005 — `supabase.ts` types out of sync with schema
- **ID**: CQ-003, DB-006
- **Fix**: Regenerate or manually update supabase.ts to include `role`, `username`, `updated_at`.

---

## P3 — LOW (Improvements)

- Shop detail tabs (Analytics, Staff, Devices, Activity) show fake data → replace with real or hide
- Notification bell does nothing → implement or remove dot indicator
- Search bar does nothing → implement global search or remove
- Revenue column always $0 → map from real data or hide until implemented
- Rating always 5.0 → remove until real ratings exist
- Remove hardcoded names ("Ashen Kumar", "Nisala Perera") from staff tab
- "Auto Renew: Enabled" hardcoded in subscription tab → derive from real data
- Forgot Password link dead (`href="#"`) → implement password reset
- Remember Me checkbox non-functional → implement or remove
