# 01 — Project Overview

## Technology Stack (Confirmed from Codebase)

| Layer | Technology |
|-------|-----------|
| Build Tool | Vite |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS v3, shadcn/ui components |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| State | React Context + useReducer (single global store) |
| Routing | Custom view-based switching (not React Router paths) |
| Auth | Supabase Auth — email/password + Google OAuth |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── App.tsx                   — Main view router (switch on currentView)
├── store/index.tsx            — Global app state (Context + useReducer)
├── types/index.ts             — All TypeScript types
├── types/supabase.ts          — Supabase DB type definitions
├── pages/
│   ├── CompanyAdminPage.tsx   — Company Admin shell (sidebar + layout)
│   └── CompanyAdminLoginPage.tsx — Admin login page
├── components/company-admin/
│   ├── CompanyDashboard.tsx   — Dashboard with KPI cards, charts
│   ├── CompanyShopList.tsx    — Shop listing (grid + table view)
│   ├── CompanyShopDetail.tsx  — Shop detail tabs view
│   ├── CompanyPlans.tsx       — Subscription plan management
│   ├── CompanyReports.tsx     — Reports section
│   ├── CompanySupport.tsx     — Support tickets
│   ├── CompanyThemeLibrary.tsx — Theme management
│   ├── CompanySettings.tsx    — Admin settings
│   ├── CompanyAuditLogs.tsx   — Audit log viewer
│   └── CompanySystemHealth.tsx — System health
├── services/
│   └── pricing.service.ts    — Plan pricing (localStorage-based)
├── data/
│   └── companyAdminData.ts   — Mock data for dashboard
└── supabase/migrations/
    ├── 20260716000001_create_profile_trigger.sql
    ├── 20260716000002_setup_rls.sql
    ├── 20260716000003_storage_policies.sql
    ├── 20260716000004_add_constraints.sql
    ├── 20260716000005_audit_logs.sql
    └── 20260716000006_add_opening_hours.sql
```

---

## Database Tables (Confirmed from supabase.ts)

| Table | Purpose |
|-------|---------|
| `profiles` | User account data — email, role, subscription_plan, subscription_status, subscription_expires_at |
| `shops` | Restaurant/shop data — name, username, theme, logo, banner, contact_number, location, etc |
| `food_items` | Menu items per shop |
| `shop_daily_stats` | Daily view/QR scan counters per shop |
| `activity_logs` | Admin audit trail (INSERT via trigger, SELECT for admins) |

**Missing database tables (critical):**
- No `admins` table in migrations — but `CompanyAdminPage.tsx` queries `supabase.from('admins')` 
- No `payment_requests` table
- No `subscriptions` table (subscription data lives in `profiles` columns)
- No `themes` table (themes appear to be per-shop JSON in `shops.theme`)
- No `coupons` table
- No `promotions` table
- No `support_tickets` table

---

## Admin Routes

| URL Path | Result |
|----------|--------|
| `/admin` | → `company-admin-login` view |
| `/admin-portal` or `/admin-login` | → `company-admin` view (bypasses login!) |

---

## Current Company Admin Sections

The admin panel nav has **9 groups** with **27 sub-sections**. Most map to only 10 actual components (multiple sections reuse the same component).

| Nav Group | Sections | Component |
|-----------|----------|-----------|
| Business | Shops, Verification, Requests | CompanyShopList |
| Plans | Subscription Plans, Coupons, Promotions | CompanyPlans |
| Themes | Theme Library, Marketplace | CompanyThemeLibrary |
| Marketing | Campaigns, Notifications | (no dedicated component — falls to default) |
| Reports | Revenue, Shops, Usage Analytics, Growth | CompanyReports |
| Support | Tickets, Live Chat, Messages | CompanySupport |
| Content | Blog, Help Center, FAQ | (no dedicated component) |
| Settings | General, Security, Billing, Integrations, Email, Notifications | CompanySettings |
| System | Audit Logs, System Health | CompanyAuditLogs / CompanySystemHealth |
