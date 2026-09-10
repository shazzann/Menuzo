# 26 — Recommendations

---

## Immediate — Must Fix Before Selling

### 1. Fix Authentication (1–2 days)
- Replace fake login with `supabase.auth.signInWithPassword()`
- Remove `/admin-portal` URL bypass from `getInitialView()`
- Add `company-admin` to `isPrivateView` in App.tsx
- Create `admins` table migration; seed super admin email
- Add admin-level RLS policies for shops and profiles

### 2. Build Payment Request System (3–5 days)
- Create `payment_requests` table migration
- Build customer-side "Submit Payment" flow (WhatsApp details + reference form)
- Build admin-side Payment Queue UI (table of pending requests)
- Build approval/rejection modal with reason field
- On approval: update `profiles.subscription_plan`, `subscription_status`, `subscription_expires_at`
- Log approval to `activity_logs`

### 3. Build Subscription Activation (1 day, depends on #2)
- Create Supabase Edge Function or service-role function to update subscription
- Admin can also manually activate from Shop Detail → Subscription tab

### 4. Remove Debug Code (30 minutes)
- Remove `console.log('Rendering section:', currentSection)` from CompanyAdminPage.tsx

### 5. Fix Supabase Types (30 minutes)
- Update `supabase.ts` to include `role`, `username`, `updated_at` in profiles type

---

## High Priority — Should Build Soon

### 6. Replace Mock Dashboard Data (2–3 days)
- Connect KPI cards to real Supabase aggregations
- Remove `companyAdminData.ts` mock import from CompanyDashboard
- Show meaningful empty states when data is unavailable

### 7. Implement Shop Action Buttons (1–2 days)
- Add onClick handlers to: Suspend, Reinstate, Refresh
- Add confirmation dialogs for destructive actions
- Add toast feedback for every action

### 8. Fix Shop List Error States (0.5 days)
- Show error message when shop fetch fails
- Make Refresh button functional

### 9. Add Coming Soon Placeholders (0.5 days)
- Replace `default: return <CompanyDashboard />` with a proper "Under Construction" component for unimplemented sections

### 10. Simplify Navigation for MVP (0.5 days)
- Collapse nav to only sections that have real functionality:
  Dashboard, Shops, Payments, Subscriptions, Themes, Settings, Audit Logs

---

## Medium Priority — Improves Reliability

- Implement custom URL assignment for Pro shops (with admin RLS override or Edge Function)
- Add pagination to shop list
- Add shop detail URL routing so browser refresh works
- Add session expiry handling (redirect to login on 401)
- Remove hardcoded fake data from shop detail tabs or replace with real data

---

## Long Term — Scale

- Build Supabase Edge Functions for all sensitive admin operations (use service role)
- Implement multi-admin role system (super admin, support admin, read-only)
- Add real revenue tracking table
- Build analytics with real shop_daily_stats data
- Add automated subscription expiry monitoring
- Implement WhatsApp notification integration for payment status
- Implement automated subscription renewal reminders

---

## Recommended Admin Information Architecture (MVP)

```
Dashboard
  - Real KPIs: Total shops, pending payments, expiring this week
  - Quick actions: View payment queue, view expiring subscriptions

Shops
  - Shop List (search, filter by status/plan, pagination)
  - Shop Detail
    → Overview (real data)
    → Subscription (real + history)
    → Payments (real payment requests for this shop)
    → URL Management

Payments
  - Payment Queue (pending requests, sortable)
  - Payment History (approved/rejected)
  - Payment Detail / Approval Modal

Themes
  - Global Theme Library (create/edit/publish themes)

Settings
  - Admin Users
  - Platform Settings (WhatsApp number, bank details)

Audit Logs
  - Real activity_logs data
```
