# 04 — Dashboard Audit

---

## Status: UI PROTOTYPE / MOCK DATA

---

## What Exists

The `CompanyDashboard.tsx` component is visually impressive. It contains:

- **KPI Cards** (5 cards): Total Shops, Active Shops, Pending Requests, Revenue, New This Month
- **Revenue Analytics Chart** (Area chart — daily/weekly/monthly/yearly toggle)
- **Plan Distribution** (Pie chart)
- **Shop Growth Chart** (Bar chart — registrations vs churn)
- **Activity Timeline** (Live-labeled feed)
- **Quick Insights** (labeled "AI-powered analysis")
- **Top Revenue Shops** (leaderboard table with Eye action)
- **Quick Actions** (Add Shop, Send Notification, Create Coupon, Create Theme, View Reports)

---

## Data Source Analysis

| Widget | Data Source | Real? |
|--------|------------|-------|
| KPI Cards | `mockKPICards` from `companyAdminData.ts` | **MOCK** |
| Revenue Chart | `mockRevenueData` from `companyAdminData.ts` | **MOCK** |
| Plan Distribution | `mockPlanDistribution` from `companyAdminData.ts` | **MOCK** |
| Shop Growth | `mockGrowthData` from `companyAdminData.ts` | **MOCK** |
| Activity Timeline | `mockActivities` from `companyAdminData.ts` | **MOCK** |
| Top Revenue Shops | `mockManagedShops` filtered | **MOCK** |
| AI Quick Insights | Hardcoded strings | **STATIC** |
| Active Users Badge | Hardcoded `2,134 Online` | **STATIC** |
| "All systems operational" footer | Hardcoded string | **STATIC** |

**Confirmed:** 100% of dashboard data is mock/hardcoded. Nothing is connected to Supabase.

---

## Finding DASH-001

### ID
DASH-001

### Severity
HIGH

### Category
Dashboard — All data is mock, zero real data

### Location
`src/components/company-admin/CompanyDashboard.tsx`, `src/data/companyAdminData.ts`

### Problem
The entire dashboard renders fabricated data. No Supabase queries exist in this component.

### Impact
Admin cannot make any operational decisions from the dashboard. Every number shown is fake.

### Confidence
HIGH — No Supabase imports or queries in `CompanyDashboard.tsx`.

---

## Finding DASH-002

### ID
DASH-002

### Severity
MEDIUM

### Category
Dashboard — Quick Actions do nothing

### Location
`src/components/company-admin/CompanyDashboard.tsx` — `quickActions` array

### Problem
The 5 Quick Action buttons (Add Shop, Send Notification, Create Coupon, etc.) have no `onClick` handlers — they are rendered but non-functional.

### Evidence
```tsx
{quickActions.map((action) => (
  <button key={action.label} className={`...`}>
    {action.icon}
    <span>{action.label}</span>
  </button>
))}
```
No `onClick` is attached to any quick action button.

### Confidence
HIGH — Confirmed from source code.

---

## Finding DASH-003

### ID
DASH-003

### Severity
LOW

### Category
Dashboard — Missing operationally critical metrics for Menuzo's stage

### Problem
The dashboard does not show the metrics that matter most for a manual-payment SaaS:
- **Pending payment requests** (most important operational metric)
- **Subscriptions expiring in next 7/14/30 days**
- **Expired subscriptions**

The current KPI cards show revenue figures that are all mock data.

### Confidence
HIGH — No payment/subscription tables exist, confirmed from schema.

---

## Finding DASH-004

### ID
DASH-004

### Severity
LOW

### Category
Dashboard — "AI-powered analysis" label is misleading

### Problem
The "Quick Insights" section is labeled "AI-powered analysis" but contains hardcoded static strings.

### Evidence
```typescript
const insights = [
  { text: 'Revenue increased 14.5% compared to last month', type: 'positive' },
  ...
]
```

### Confidence
HIGH — Confirmed from source code.
