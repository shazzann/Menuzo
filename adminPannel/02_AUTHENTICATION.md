# 02 — Authentication Audit

---

## Finding AUTH-001

### ID
AUTH-001

### Severity
CRITICAL

### Category
Authentication — Login bypasses real auth

### Location
`src/pages/CompanyAdminLoginPage.tsx` — `handleLogin()` function (lines 13–25)

### Problem
The **email/password login form does not perform any Supabase authentication**. It simulates a 1-second delay and then navigates directly to the admin panel regardless of what credentials were entered.

### Evidence
```typescript
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  // Simulate auth
  setTimeout(() => {
    setIsLoading(false);
    dispatch({ type: 'SET_VIEW', payload: 'company-admin' });
    ...
  }, 1000);
};
```
There is no `supabase.auth.signInWithPassword()` call. Any email and any password logs in successfully.

### Impact
Anyone who navigates to `/admin` can enter any credentials and gain full access to the admin panel UI.

### Recommended Fix
Replace the `setTimeout` mock with:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) { /* show error */ return; }
// Only then navigate
dispatch({ type: 'SET_VIEW', payload: 'company-admin' });
```

### Confidence
HIGH — Confirmed from source code.

---

## Finding AUTH-002

### ID
AUTH-002

### Severity
CRITICAL

### Category
Authentication — Direct URL bypass to admin panel

### Location
`src/store/index.tsx` — `getInitialView()` function (line 43)

### Problem
Navigating directly to `/admin-portal` or `/admin-login` in the browser **immediately loads the full company admin panel** without any authentication check.

### Evidence
```typescript
if (path.startsWith('/admin-portal') || path === '/admin-login') return 'company-admin';
```
This is the initial view resolution — it runs before any auth check and before the `CompanyAdminPage.tsx` admin verification effect fires.

### Impact
Anyone who knows the URL `/admin-portal` can access the admin panel directly without any login.

### Recommended Fix
Remove this bypass from `getInitialView()`. The admin panel should always require authentication. The `verifyAdmin()` effect in `CompanyAdminPage` provides a server-side check, but only after the UI has already rendered.

### Confidence
HIGH — Confirmed from source code.

---

## Finding AUTH-003

### ID
AUTH-003

### Severity
HIGH

### Category
Authentication — Admin verification queries non-existent table

### Location
`src/pages/CompanyAdminPage.tsx` — `verifyAdmin()` function (lines 128–136)

### Problem
The admin verification queries `supabase.from('admins')` — but there is no `admins` table defined in any migration file.

### Evidence
```typescript
const { data, error } = await supabase
  .from('admins')
  .select('role')
  .eq('email', session.user.email)
  .maybeSingle();

if (error || !data) {
  throw new Error('Unauthorized');
}
```
The migration files (`20260716000001` through `20260716000006`) contain no `CREATE TABLE admins` statement. The query will always fail with a 404/error, meaning **every user would be redirected away** — or if Supabase silently returns empty data, the check effectively fails.

### Impact
If the `admins` table doesn't exist, every admin will be immediately logged out of the admin panel. The intended authorization gate is completely broken.

### Recommended Fix
Create an `admins` table migration:
```sql
CREATE TABLE public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- Only service_role can read admins (no client-side RLS needed — use Edge Functions for verification)
```

### Confidence
HIGH — No `admins` table found in any migration.

---

## Finding AUTH-004

### ID
AUTH-004

### Severity
HIGH

### Category
Authentication — Google OAuth redirect allows admin panel access without role check

### Location
`src/App.tsx` — `handleAuth()` (lines 47–70) and `CompanyAdminLoginPage.tsx` — `handleGoogleLogin()` (lines 27–47)

### Problem
When a user signs in with Google OAuth and the URL contains `access_token` or `code`, `App.tsx` dispatches a `LOGIN` action. The login action redirects to `user-dashboard` — however, `getInitialView()` in store returns `company-admin` for `/admin-portal`. This means any Google-authenticated user landing on `/admin-portal` could access the admin panel.

### Impact
Any authenticated Google user can potentially access the admin panel if they know the URL.

### Recommended Fix
The Google OAuth flow in `CompanyAdminLoginPage` should verify admin role after OAuth callback before allowing access.

### Confidence
MEDIUM — Requires runtime verification but the path exists.

---

## Finding AUTH-005

### ID
AUTH-005

### Severity
MEDIUM

### Category
Authentication — Hardcoded subscription in login handler

### Location
`src/App.tsx` — lines 67 and 89

### Problem
Every user who logs in is given `plan: 'pro'` and `expiresAt: new Date('2025-12-31')` hardcoded in the login dispatch. The expiry date is already in the past (2025).

### Evidence
```typescript
subscription: { plan: 'pro', expiresAt: new Date('2025-12-31'), status: 'active' },
```

### Impact
Subscription state in the Redux-like store is not real. UI elements that depend on `state.user.subscription` will always show Pro features regardless of actual subscription status.

### Recommended Fix
Fetch the actual profile after login and populate subscription from `profiles.subscription_plan`, `subscription_status`, and `subscription_expires_at`.

### Confidence
HIGH — Confirmed from source code.

---

## Finding AUTH-006

### ID
AUTH-006

### Severity
LOW

### Category
Authentication — "Forgot password" link is a dead `href="#"`

### Location
`src/pages/CompanyAdminLoginPage.tsx` — line 137

### Problem
The Forgot password link goes nowhere.

### Evidence
```tsx
<a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
```

### Confidence
HIGH — Confirmed from source code.

---

## Finding AUTH-007

### ID
AUTH-007

### Severity
LOW

### Category
Authentication — "Remember me" checkbox has no functionality

### Location
`src/pages/CompanyAdminLoginPage.tsx` — lines 158–167

### Problem
The "Remember me for 30 days" checkbox is rendered but its value is never used.

### Confidence
HIGH — Confirmed from source code.

---

## Summary

| Finding | Severity |
|---------|----------|
| AUTH-001 — Email/password login is fake (no real auth) | CRITICAL |
| AUTH-002 — Direct URL `/admin-portal` bypasses login entirely | CRITICAL |
| AUTH-003 — Admin role verification queries non-existent `admins` table | HIGH |
| AUTH-004 — Google OAuth can allow any authenticated user into admin | HIGH |
| AUTH-005 — Hardcoded Pro subscription with expired date | MEDIUM |
| AUTH-006 — Forgot password is dead link | LOW |
| AUTH-007 — Remember me checkbox is non-functional | LOW |
