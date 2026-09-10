# 05 — Navigation Audit

---

## Current Navigation Structure

The sidebar renders 9 collapsible groups with 27 sub-items plus 1 standalone Dashboard item:

```
Dashboard (standalone)
│
├── Business
│   ├── Shops
│   ├── Verification
│   └── Requests
│
├── Plans
│   ├── Subscription Plans
│   ├── Coupons
│   └── Promotions
│
├── Themes
│   ├── Theme Library
│   └── Marketplace
│
├── Marketing
│   ├── Campaigns
│   └── Notifications
│
├── Reports
│   ├── Revenue
│   ├── Shops
│   ├── Usage Analytics
│   └── Growth
│
├── Support
│   ├── Tickets
│   ├── Live Chat
│   └── Messages
│
├── Content
│   ├── Blog
│   ├── Help Center
│   └── FAQ
│
├── Settings
│   ├── General
│   ├── Security
│   ├── Billing
│   ├── Integrations
│   ├── Email Templates
│   └── Notifications
│
└── System
    ├── Audit Logs
    └── System Health
```

---

## Finding NAV-001

### ID
NAV-001

### Severity
HIGH

### Category
Navigation — Many nav items have no corresponding component

### Problem
Multiple navigation sections (campaigns, notifications, blog, help-center, faq, theme-marketplace) fall to the `default:` case in `renderContent()` which renders `<CompanyDashboard />`. 

Clicking "Campaigns", "Notifications", "Blog", "Help Center", "FAQ", or "Theme Marketplace" silently loads the Dashboard instead of any relevant content.

### Evidence
```typescript
switch (currentSection) {
  // ...
  default:
    return <CompanyDashboard />;
}
```
Sections `campaigns`, `notifications`, `blog`, `help-center`, `faq`, `theme-marketplace` are not handled.

### Impact
Admin is confused when clicking nav items that silently load the wrong content with no error message.

### Confidence
HIGH — Confirmed from CompanyAdminPage.tsx renderContent().

---

## Finding NAV-002

### ID
NAV-002

### Severity
MEDIUM

### Category
Navigation — All nav groups collapse to the same component

### Problem
The nav has 27 sections but only ~10 unique components. Multiple different nav items open the identical view:
- Shops, Verification, Requests → all show CompanyShopList
- Tickets, Live Chat, Messages → all show CompanySupport
- Revenue, Shops, Usage Analytics, Growth → all show CompanyReports

There is no tab/context switching inside the components based on which sub-section was clicked.

### Impact
Nav structure implies much more functionality than exists. Admin selecting "Verification" gets the same shop list as "Shops" with no indication of a filtered view.

### Confidence
HIGH — Confirmed from renderContent() in CompanyAdminPage.tsx.

---

## Finding NAV-003

### ID
NAV-003

### Severity
MEDIUM

### Category
Navigation — Over-engineered nav for current product stage

### Problem
The nav includes enterprise-level sections (Campaigns, Marketing, Blog, Help Center, Live Chat, FAQ, Theme Marketplace) that are not relevant for a small SaaS at the current manual-payment stage. These create cognitive overhead and give a false impression of complete functionality.

### Impact
Admin is overwhelmed by navigation that implies far more capability than exists.

### Confidence
HIGH — Confirmed from nav structure and business context.

---

## Finding NAV-004

### ID
NAV-004

### Severity
LOW

### Category
Navigation — No active state breadcrumb or page title system

### Problem
When a nav item is selected, the only indication is the sidebar highlight. The main content area has no breadcrumbs showing where the user is. Each component renders its own `<h1>` title independently.

### Confidence
HIGH — Confirmed from component inspection.

---

## Finding NAV-005

### ID
NAV-005

### Severity
LOW

### Category
Navigation — Search bar is non-functional

### Problem
The header search input has no search logic connected. Typing into it does nothing.

### Evidence
The input has no `onChange` handler beyond managing `searchOpen` state. No search results appear.

### Confidence
HIGH — Confirmed from CompanyAdminPage.tsx.

---

## Recommended Navigation (MVP Only)

For Menuzo's current manual-payment stage, the admin nav should be:

```
Dashboard
Shops
  └── All Shops
  └── Shop Detail (contextual)
Payments
  └── Payment Requests
  └── Payment History
Subscriptions
Themes
Settings
  └── Admin Users
  └── Platform Settings
Audit Logs
```

This is 8–10 items — all with real functionality.
