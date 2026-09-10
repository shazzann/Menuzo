# 17 — Loading & State Management Audit

---

## Finding LOAD-001

### ID
LOAD-001

### Severity
MEDIUM

### Category
Loading — Only one component has a loading state

### Problem
Only `CompanyShopList` has a loading state (spinner while fetching). All other components render instantly with mock/hardcoded data — they have nothing to wait for.

### Impact
When real data is connected to other components, there will be no loading UX.

### Confidence
HIGH — Only CompanyShopList.tsx contains `isLoading` state.

---

## Finding LOAD-002

### ID
LOAD-002

### Severity
MEDIUM

### Category
State — No error state in shop list

### Problem
When shop fetch fails, `isLoading` is set to false and `shops` remains empty `[]`. The component renders an empty grid with no error message.

### Confidence
HIGH — Confirmed from CompanyShopList.tsx.

---

## Finding LOAD-003

### ID
LOAD-003

### Severity
MEDIUM

### Category
State — Global state holds selected shop in memory only

### Problem
`state.selectedManagedShop` is held in memory. If the admin refreshes the browser while viewing a shop detail, `selectedManagedShop` is `null` and the detail renders nothing (`if (!shop) return null`). There is no persistence or URL-based routing for shop detail.

### Impact
Browser refresh loses context. Admin must navigate back to shop list and re-select.

### Confidence
HIGH — Confirmed from store and CompanyShopDetail.tsx.

---

## Finding LOAD-004

### ID
LOAD-004

### Severity
LOW

### Category
State — No cache invalidation for shop list

### Problem
The shop list is fetched once on component mount. There is no mechanism to refetch after an admin action (e.g., after suspending a shop). The "Refresh" button exists but has no onClick.

### Confidence
HIGH — Confirmed from source code.
