# 15 — Security Audit

---

## Finding SEC-001

### ID
SEC-001

### Severity
CRITICAL

### Category
Security — Admin panel has no real authentication gate

### Problem
Email/password login is simulated (AUTH-001). The URL `/admin-portal` bypasses login entirely (AUTH-002). Any person who discovers the admin URL gets full admin UI access.

### Impact
Complete admin panel exposure to anyone who knows the URL.

### Confidence
HIGH — Confirmed from source code.

---

## Finding SEC-002

### ID
SEC-002

### Severity
CRITICAL

### Category
Security — No server-side admin authorization enforcement

### Problem
All admin operations use the user's JWT. Without proper admin RLS policies, the database allows whatever the RLS permits for any authenticated user. There is no service-role-based enforcement for admin operations. An authenticated regular user with console access could potentially call Supabase APIs with their JWT and attempt admin operations.

### Confidence
HIGH — Confirmed from RLS review.

---

## Finding SEC-003

### ID
SEC-003

### Severity
HIGH

### Category
Security — Admin verification queries missing table — security gate is non-functional

### Problem
`CompanyAdminPage.verifyAdmin()` queries `admins` table which doesn't exist. This means the intended security gate always fails with an error — causing legitimate admins to be signed out, while leaving the URL-bypass route open.

### Confidence
HIGH — Confirmed from migrations and source code.

---

## Finding SEC-004

### ID
SEC-004

### Severity
HIGH

### Category
Security — Pricing plan data stored in localStorage

### Problem
Subscription plan pricing lives in `localStorage`. This can be manipulated by any user in their own browser. While this doesn't affect server-side enforcement, it could cause confusion or be exploited if any client-side subscription check relies on these values.

### Evidence
`src/services/pricing.service.ts` — `localStorage.setItem('menuzo_pricing_plans', ...)`

### Confidence
HIGH — Confirmed from source code.

---

## Finding SEC-005

### ID
SEC-005

### Severity
MEDIUM

### Category
Security — Admin email exposed in sidebar

### Problem
The admin's email is rendered in the sidebar bottom section using `state.user?.email`. This is the authenticated user's email. If screen-sharing or screenshots are taken, the admin's email is always visible.

### Confidence
HIGH — Confirmed from CompanyAdminPage.tsx line 308.

---

## Finding SEC-006

### ID
SEC-006

### Severity
MEDIUM

### Category
Security — RLS policy allows any authenticated user to see all open shops with sensitive data

### Problem
The `shops` SELECT policy for public users allows reading ALL columns of open shops. This includes `contact_number`, `email`, and `contacts` (JSON with all contact details). These are potentially sensitive business details.

### Recommended Fix
Restrict public SELECT to only necessary columns, or use a view that filters sensitive fields.

### Confidence
HIGH — Confirmed from RLS migration.

---

## Finding SEC-007

### ID
SEC-007

### Severity
LOW

### Category
Security — Hardcoded `console.log` in production render

### Location
`src/pages/CompanyAdminPage.tsx` — line 186

### Problem
```typescript
// Force Vite to re-compile
console.log('Rendering section:', currentSection);
```
This debug log exposes internal navigation state in the browser console and should not be in production code.

### Confidence
HIGH — Confirmed from source code.

---

## Positive Security Observations

- RLS is enabled on all tables
- Profile UPDATE policy prevents users from modifying their own subscription/role
- Username update trigger prevents self-URL manipulation
- `activity_logs` table exists for audit trail
- Supabase Auth handles token management (no custom JWT implementation)
