# 07 — Company/Shop Management Audit

---

## Shop Management (CompanyShopList + CompanyShopDetail)

### Status: PARTIALLY IMPLEMENTED — Real data fetch, but actions are UI-only

---

## CompanyShopList Analysis

### Data Source
**REAL** — `CompanyShopList.tsx` performs an actual Supabase query:
```typescript
const { data, error } = await supabase
  .from('shops')
  .select(`
    *,
    theme,
    profiles:user_id (
      email,
      subscription_plan,
      subscription_status,
      subscription_expires_at
    ),
    food_items ( count )
  `);
```

### What Works
- Fetches real shop data from Supabase
- Grid and table view toggle
- Client-side search (name, owner, location)
- Client-side filter (status, plan)
- Loading spinner while fetching
- Navigates to shop detail on click

### What is Broken or Mock

#### Finding MGT-001

### ID
MGT-001

### Severity
HIGH

### Category
Shop Management — All action buttons are non-functional

### Location
`src/components/company-admin/CompanyShopList.tsx`

### Problem
Every action button (Edit, Message, Pause/Suspend, Trash/Delete, Pencil in table view) has no `onClick` handler. They are decorative buttons.

### Evidence
```tsx
<button className="p-2 rounded-lg hover:bg-muted/50">
  <Pencil className="w-3.5 h-3.5" />
</button>
<button className="p-2 rounded-lg hover:bg-red-500/10">
  <Pause className="w-3.5 h-3.5" />
</button>
```
No `onClick` attached.

### Impact
Admin cannot suspend, edit, or delete a shop.

### Confidence
HIGH — Confirmed from source code.

---

#### Finding MGT-002

### ID
MGT-002

### Severity
HIGH

### Category
Shop Management — Revenue is always $0

### Location
`src/components/company-admin/CompanyShopList.tsx` — line 68

### Problem
Revenue is hardcoded to `0` for all shops. No revenue tracking table exists in the database.

### Evidence
```typescript
revenue: 0,
```

### Confidence
HIGH — Confirmed from source code and schema.

---

#### Finding MGT-003

### ID
MGT-003

### Severity
HIGH

### Category
Shop Management — Rating is always 5.0, QR scans and visitors always 0

### Location
`src/components/company-admin/CompanyShopList.tsx`

### Problem
```typescript
rating: 5.0,
qrScans: 0,
visitors: 0
```
These fields are hardcoded. The `shops` table has `view_count` and `qr_scan_count` fields but they are not mapped.

### Confidence
HIGH — Confirmed from source code.

---

#### Finding MGT-004

### ID
MGT-004

### Severity
MEDIUM

### Category
Shop Management — Export, Import, Refresh buttons are non-functional

### Problem
Three header buttons (Export, Import, Refresh) have no `onClick` handlers.

### Confidence
HIGH — Confirmed from source code.

---

## CompanyShopDetail Analysis

### Status: UI PROTOTYPE — All tab content is static/mock

The Shop Detail page renders correctly from `state.selectedManagedShop` (set when clicking a shop). It has 8 tabs:

| Tab | Data Source |
|-----|-------------|
| Overview | Real shop data (name, owner, email, phone, location) |
| Subscription | Mix of real (plan, expiresAt) and hardcoded invoices |
| Analytics | **Hardcoded** mock stats |
| Menu Stats | Menu item count is real; all other stats hardcoded |
| Media | Placeholder grid with empty icons |
| Staff | **Hardcoded** — fake staff members including "Ashen Kumar" |
| Devices | **Hardcoded** — fake device sessions |
| Activity | **Hardcoded** — fake activity log |

---

#### Finding MGT-005

### ID
MGT-005

### Severity
HIGH

### Category
Shop Detail — "Change Plan", "Message", "Edit" buttons do nothing

### Location
`src/components/company-admin/CompanyShopDetail.tsx`

### Problem
The "Change Plan", "Message", and "Edit" buttons have no `onClick` handlers.

### Confidence
HIGH — Confirmed from source code.

---

#### Finding MGT-006

### ID
MGT-006

### Severity
MEDIUM

### Category
Shop Detail — Subscription tab shows hardcoded invoices

### Problem
```typescript
{ id: 'INV-001', date: '2026-07-01', amount: '$24.99', status: 'Paid' },
{ id: 'INV-002', date: '2026-06-01', amount: '$24.99', status: 'Paid' },
```
No payment/invoice table exists. These are fake.

### Confidence
HIGH — Confirmed from source code and schema.

---

#### Finding MGT-007

### ID
MGT-007

### Severity
MEDIUM

### Category
Shop Detail — "Auto Renew: Enabled" is hardcoded

### Problem
Auto-renewal status is hardcoded as "Enabled" for every shop regardless of actual subscription state.

### Confidence
HIGH — Confirmed from source code.

---

## Missing Functionality (Critical for MVP)

1. **No payment request management** — No way for admin to see or process payment requests
2. **No subscription activation** — No way to activate/upgrade a shop's subscription manually
3. **No custom URL assignment** — No UI to assign or change a shop's URL slug
4. **No Pro activation workflow** — No way to enable Pro features for a specific shop
5. **No shop suspension/reinstatement** — Buttons exist but do nothing
6. **No admin notes per shop** — Cannot add internal notes about a shop

---

## Summary

| Feature | Status |
|---------|--------|
| Fetch real shops | ✅ EXISTS |
| Search/filter | ✅ EXISTS (client-side) |
| Shop detail view | ✅ EXISTS (UI only) |
| Edit shop | ❌ MISSING |
| Suspend/reinstate | ❌ UI ONLY |
| Delete shop | ❌ UI ONLY |
| Change subscription | ❌ MISSING |
| Payment management | ❌ MISSING |
| Pro activation | ❌ MISSING |
| Custom URL assignment | ❌ MISSING |
| Revenue data | ❌ HARDCODED $0 |
| Analytics | ❌ MOCK DATA |
