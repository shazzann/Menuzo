# 20 — Business Logic Audit

---

## Subscription Business Logic

### Current State
Subscription data is stored as three flat columns in `profiles`:
- `subscription_plan`: `'free'` | `'pro'`
- `subscription_status`: `'active'` | `'expired'` | `'cancelled'`
- `subscription_expires_at`: date

### Finding BIZ-001

### ID
BIZ-001

### Severity
HIGH

### Category
Business Logic — No mechanism to activate subscriptions manually

### Problem
The business requires admins to manually approve payments and activate subscriptions. There is no UI, no backend endpoint, and no database mutation to change `profiles.subscription_plan` or `profiles.subscription_status`. Admin cannot do the core business operation.

### Confidence
HIGH — No subscription mutation found in any admin component.

---

### Finding BIZ-002

### ID
BIZ-002

### Severity
HIGH

### Category
Business Logic — No payment verification workflow

### Problem
The intended payment flow is:
1. Customer pays manually → contacts via WhatsApp
2. Admin receives request → reviews it
3. Admin approves → subscription activates

Steps 1 (customer side) and 3 (admin side) are completely missing. There is no payment request table, no approval UI, and no subscription activation function.

### Confidence
HIGH — Confirmed from complete codebase review.

---

### Finding BIZ-003

### ID
BIZ-003

### Severity
HIGH

### Category
Business Logic — Subscription status is not enforced at platform level

### Problem
`App.tsx` dispatches LOGIN with hardcoded `plan: 'pro'` for all users. The actual platform feature restrictions based on subscription plan are not being enforced from the real database subscription state. A free user always gets Pro features in the UI.

### Confidence
HIGH — Confirmed from App.tsx lines 67 and 89.

---

### Finding BIZ-004

### ID
BIZ-004

### Severity
MEDIUM

### Category
Business Logic — Custom URL policy is unclear and technically blocked

### Problem
There are two URL types:
- Standard: `/shop/[username]` for free users
- Custom: `/[username]` for Pro users (conceptual)

The `shops.username` field is unique and exists. However:
1. The admin cannot change it (trigger blocks it)
2. The platform doesn't differentiate between standard and custom URL routing
3. There is no policy enforcing that only Pro customers get custom slugs

### Confidence
HIGH — Confirmed from migrations and routing.

---

### Finding BIZ-005

### ID
BIZ-005

### Severity
MEDIUM

### Category
Business Logic — Plans defined in frontend only, not database

### Problem
Business logic defines two plans (Free, Pro). However, these are defined in `pricing.service.ts` (localStorage-backed) and not in a database table. Plan features and limits are not enforced anywhere server-side.

### Confidence
HIGH — No plans table found.

---

## Payment Verification Flow Mapping

### What Exists vs. Required

| Step | Required | Exists |
|------|---------|--------|
| Customer selects plan | ✅ Landing page has pricing | ✅ YES |
| Customer sees payment instructions | ✅ Required | ❌ MISSING |
| Customer makes manual payment | External (bank) | N/A |
| Customer contacts via WhatsApp | External | N/A |
| Payment request created | ✅ Required | ❌ MISSING |
| Admin sees payment queue | ✅ Required | ❌ MISSING |
| Admin reviews payment details | ✅ Required | ❌ MISSING |
| Admin approves/rejects | ✅ Required | ❌ MISSING |
| Subscription activates on approval | ✅ Required | ❌ MISSING |
| Pro features enable | ✅ Required | ❌ NOT ENFORCED |
| Custom URL activates | ✅ Required | ❌ MISSING |
| Audit trail created | ✅ Required | ❌ MISSING |
