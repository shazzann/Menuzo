# 11 — Forms & Validation Audit

---

## Admin Forms Inventory

| Form | Location | Status |
|------|----------|--------|
| Admin Login | CompanyAdminLoginPage.tsx | UI ONLY — no real auth |
| Edit Plan Price | CompanyPlans.tsx | WORKS (but saves to localStorage only) |
| Create Plan | CompanyPlans.tsx | UI ONLY — button exists, no modal/form |
| Create Coupon | CompanyPlans.tsx | UI ONLY — Add button, no modal/form |
| Create Promotion | CompanyPlans.tsx | UI ONLY — Add button, no modal/form |
| Edit Shop | CompanyShopDetail.tsx | UI ONLY — Edit button, no form |
| Change Plan | CompanyShopDetail.tsx | UI ONLY — button, no modal |
| Shop Suspension | CompanyShopList.tsx | UI ONLY — button, no action |

---

## Finding FORM-001

### ID
FORM-001

### Severity
HIGH

### Category
Forms — Login form has no validation and fake authentication

### Location
`src/pages/CompanyAdminLoginPage.tsx`

### Problem
The login form accepts ANY input and submits without contacting Supabase. There is no validation beyond HTML `required` attributes.

### Confidence
HIGH — Confirmed from source code.

---

## Finding FORM-002

### ID
FORM-002

### Severity
MEDIUM

### Category
Forms — Plan price edit is input-only with no data type validation

### Location
`src/components/company-admin/CompanyPlans.tsx`

### Problem
The plan price edit input is a free-text field. Admin can enter `"abc"` as a price. No numeric validation, no minimum/maximum price check.

### Evidence
```tsx
<Input 
  value={editPrice}
  onChange={(e) => setEditPrice(e.target.value)}
  className="text-2xl font-bold tracking-tight h-10 w-28 px-2"
  autoFocus
/>
```
Input type is text (default), no `type="number"`.

### Confidence
HIGH — Confirmed from source code.

---

## Finding FORM-003

### ID
FORM-003

### Severity
MEDIUM

### Category
Forms — No confirmation dialogs for destructive actions

### Problem
Buttons like "Suspend Shop", "Delete Shop", "Trash2" have no confirmation dialogs. In the current state they do nothing, but when implemented, a single mis-click could suspend a real customer.

### Confidence
HIGH — No `window.confirm()` or modal confirmation components found in any admin component.

---

## Finding FORM-004

### ID
FORM-004

### Severity
LOW

### Category
Forms — No unsaved changes warning

### Problem
If an admin edits a plan price and navigates away before saving, no warning is shown.

### Confidence
HIGH — No `beforeunload` or dirty-state tracking found.

---

## Missing Forms (Required for MVP)

1. **Payment Request Review Form** — approve/reject with notes and reason
2. **Subscription Activation Form** — manually activate/change a shop's subscription
3. **Custom URL Assignment Form** — set/change a shop's slug
4. **Admin User Creation Form** — add new admin accounts
5. **Shop Edit Form** — edit shop basic info
