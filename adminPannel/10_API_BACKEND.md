# 10 — API / Backend Audit

---

## Overview

Menuzo uses Supabase as its only backend. There are no custom API routes or server-side functions in the company admin panel. All operations go directly through the Supabase JS client from the browser.

---

## Admin Panel Backend Operations

| Operation | File | Type | Real? |
|-----------|------|------|-------|
| Fetch all shops | CompanyShopList.tsx | Supabase SELECT | ✅ YES |
| Verify admin role | CompanyAdminPage.tsx | Supabase SELECT | ✅ YES (but table missing) |
| Sign out | CompanyAdminPage.tsx | supabase.auth.signOut() | ✅ YES |
| Update plan price | CompanyPlans.tsx | localStorage only | ❌ NO (client-only) |
| All other admin actions | — | None | ❌ MISSING |

---

## Finding API-001

### ID
API-001

### Severity
CRITICAL

### Category
API — Pricing plans are stored in localStorage, not the database

### Location
`src/services/pricing.service.ts`

### Problem
The entire subscription plan management system stores plan data in `localStorage`. When an admin edits a plan price, it only changes in their own browser session. No other admin or customer sees the update. There is no database table for plans.

### Evidence
```typescript
updatePlanPrice: (id: string, newPrice: string): void => {
  const plans = PricingService.getPlans();
  const updated = plans.map(p => p.id === id ? { ...p, price: newPrice } : p);
  localStorage.setItem('menuzo_pricing_plans', JSON.stringify(updated));
  window.dispatchEvent(new Event('pricing_updated'));
}
```

### Impact
Pricing changes never persist. Every browser starts with hardcoded default prices. This is completely broken for production.

### Recommended Fix
Create a `plans` table in Supabase and load/save plan data from there.

### Confidence
HIGH — Confirmed from source code.

---

## Finding API-002

### ID
API-002

### Severity
HIGH

### Category
API — No admin-specific API protection

### Problem
All Supabase queries in admin components use the **anonymous/user JWT**. There are no Supabase Edge Functions with service-role key for admin operations. This means:
1. RLS applies to admin queries — admin can only see data their JWT is allowed to see
2. Admin cannot bypass RLS to update any shop or profile without proper admin RLS policies

### Impact
Admin operations either silently fail or are blocked by RLS.

### Confidence
HIGH — No Edge Functions found, only client-side supabase calls.

---

## Finding API-003

### ID
API-003

### Severity
HIGH

### Category
API — Shop fetch query does not have admin-level RLS access

### Location
`src/components/company-admin/CompanyShopList.tsx` — fetchShops()

### Problem
The shop list query fetches all shops without any user_id filter. However, the RLS policy `"Shop owners can manage their own shop"` only allows SELECT WHERE `user_id = auth.uid()`, and the public policy only shows `is_open = true` shops. An admin querying without admin-level RLS will either see only their own shop or all open shops — not all shops.

### Impact
Admin shop list may show incomplete or incorrect data depending on actual RLS state in production.

### Confidence
HIGH — Confirmed from RLS migrations.

---

## Finding API-004

### ID
API-004

### Severity
MEDIUM

### Category
API — No error handling UI for failed queries

### Location
`src/components/company-admin/CompanyShopList.tsx`

### Problem
When `fetchShops()` fails, it logs to console but shows an empty list with no error state UI. Admin sees an empty page with no indication that a fetch error occurred.

### Evidence
```typescript
} catch (err) {
  console.error('Failed to fetch shops', err);
} finally {
  setIsLoading(false);
}
```
No error state is set. The `filtered` array remains empty and the UI shows nothing with no error message.

### Confidence
HIGH — Confirmed from source code.

---

## Finding API-005

### ID
API-005

### Severity
MEDIUM

### Category
API — No pagination for shop list

### Problem
The shop list query fetches ALL shops with no `limit`/`offset`. As Menuzo grows, this will become a performance and memory issue.

### Confidence
HIGH — Confirmed from source code.

---

## Summary

The admin panel effectively has **zero backend infrastructure** for admin-specific operations. The one real backend call (shop list fetch) has RLS access issues. Everything else is either mock data or localStorage.
