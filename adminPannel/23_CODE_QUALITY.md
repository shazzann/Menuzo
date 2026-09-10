# 23 — Code Quality Audit

---

## Finding CQ-001

### ID
CQ-001

### Severity
MEDIUM

### Category
Code Quality — Mock data file used as production data source

### Location
`src/data/companyAdminData.ts`

### Problem
A dedicated mock data file (`companyAdminData.ts`) is imported directly into production components (`CompanyDashboard.tsx`). This pattern makes it easy to accidentally ship fake data to production and harder to disconnect later.

### Confidence
HIGH — Confirmed from imports in CompanyDashboard.tsx.

---

## Finding CQ-002

### ID
CQ-002

### Severity
MEDIUM

### Category
Code Quality — Multiple nav sections map to the same component without context

### Problem
`renderContent()` in CompanyAdminPage maps `shops`, `shop-verification`, and `shop-requests` to `CompanyShopList` — but `CompanyShopList` doesn't know which section it's rendering for. No `currentSection` prop is passed.

### Recommended Fix
Pass `currentSection` as a prop to allow components to adapt their display.

### Confidence
HIGH — Confirmed from source code.

---

## Finding CQ-003

### ID
CQ-003

### Severity
MEDIUM

### Category
Code Quality — `supabase.ts` types are out of sync with database schema

### Problem
The `profiles` table type in `supabase.ts` is missing columns added in migration 001 (`role`, `username`, `updated_at`). TypeScript gives false safety when querying these fields.

### Confidence
HIGH — Confirmed by comparing migration and types.

---

## Finding CQ-004

### ID
CQ-004

### Severity
LOW

### Category
Code Quality — Debug console.log in CompanyAdminPage

### Location
`src/pages/CompanyAdminPage.tsx` line 186

### Problem
```typescript
// Force Vite to re-compile
console.log('Rendering section:', currentSection);
```
Debug code with a comment indicating it was a workaround. Should be removed.

### Confidence
HIGH — Confirmed from source code.

---

## Finding CQ-005

### ID
CQ-005

### Severity
LOW

### Category
Code Quality — Hardcoded `"Ashen Kumar"` and `"Nisala Perera"` as fake staff

### Location
`src/components/company-admin/CompanyShopDetail.tsx` lines 307–309

### Problem
Real person names are hardcoded as fake staff members in a UI prototype. This could cause confusion in testing/staging.

### Confidence
HIGH — Confirmed from source code.

---

## Positive Code Quality Observations

- TypeScript is used throughout
- Consistent component file naming
- Clean separation of company-admin components into their own directory
- Shared UI components (shadcn/ui) used consistently
- Tailwind utility classes are consistent
- No circular imports detected
- React hooks used correctly (no obvious stale closure issues)
