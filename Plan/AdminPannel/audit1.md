Yes. Since the goal is to have an AI coding agent **inspect the existing Menuzo Company Admin Panel and produce an implementation-ready audit**, the prompt should make the agent investigate the actual codebase rather than just give generic UI advice.

Use this as the **master audit prompt**:

# MENUZO COMPANY ADMIN PANEL

## Complete Product, UI/UX, Architecture & Functionality Audit

You are acting as a **senior SaaS product architect, UX/UI auditor, frontend engineer, backend architect, security reviewer, and technical product manager**.

Your task is to perform a **complete forensic audit of the existing Menuzo Company Admin Panel**.

This is NOT a redesign task yet.

Your first responsibility is to **understand exactly what currently exists**, how it is structured, how it works, what is incomplete, what is incorrectly structured, what is missing, and what must be changed before Menuzo is ready for real customers.

Do not immediately start modifying code.

First inspect, understand, document, and audit the existing implementation.

---

# 1. PROJECT CONTEXT

Menuzo is a SaaS platform for restaurants/shops to create and manage digital QR menus.

The customer-facing platform already has a functioning MVP.

The Company Admin Panel is an internal platform used by the Menuzo company/team to manage the entire SaaS operation.

The company admin panel will eventually be responsible for things such as:

* Managing shops
* Viewing shop information
* Managing subscriptions
* Managing Pro activation
* Manually verifying payments
* Approving/rejecting payment requests
* Managing custom shop URLs
* Managing themes
* Managing customers
* Managing customer support information
* Monitoring platform activity
* Managing subscription status
* Handling operational issues
* Maintaining platform-level configuration
* Eventually supporting more automation as Menuzo scales

At the current stage, Menuzo will use **manual payment verification** because the business is small.

The intended payment workflow is approximately:

1. Customer selects a subscription.
2. Platform displays Menuzo bank/payment details.
3. Customer makes the payment manually.
4. Customer contacts Menuzo through WhatsApp.
5. A payment/subscription request must be created and visible to the company admin.
6. Customer provides payment/reference/proof information through the appropriate process.
7. Company admin reviews the request.
8. Admin approves or rejects it.
9. If approved, the subscription becomes active.
10. If the customer purchased Pro, the relevant Pro features become available.
11. A Pro customer may receive a custom shop URL.
12. The company must be able to see the subscription/payment history associated with the shop.

The current URL concept is:

### Free/basic customers

They receive a generated URL based on the shop name plus an identifier/number.

Example:

`menuzo.com/shop/cafe-example-123`

### Pro customers

They can receive a more specific/custom URL.

Example:

`menuzo.com/cafeexample`

The exact implementation must be verified from the codebase. Do NOT assume the examples above are the actual implementation.

---

# 2. MOST IMPORTANT RULE

## DO NOT ASSUME FEATURES EXIST.

You must inspect the actual codebase.

For every feature, determine whether it is:

* Fully implemented
* Partially implemented
* UI only
* Mock data only
* Hardcoded
* Connected to backend
* Connected to database
* Connected to authentication
* Functional but incomplete
* Broken
* Missing completely

Clearly distinguish between:

**EXISTS**

**PARTIALLY EXISTS**

**UI ONLY**

**MOCK / PLACEHOLDER**

**MISSING**

**BROKEN**

Do not treat a visually impressive UI as a completed feature.

---

# 3. AUDIT OBJECTIVES

The audit must answer:

### A. What do we currently have?

### B. How is the admin panel currently structured?

### C. What pages exist?

### D. What navigation items/tabs exist?

### E. What components exist?

### F. What backend/database functionality is connected?

### G. What functionality is missing?

### H. What functionality is incorrectly structured?

### I. What must be changed before launch?

### J. What should be postponed until later?

### K. What should the company admin be able to do?

### L. What should the customer be able to do instead?

### M. How should payment verification work?

### N. How should subscription activation work?

### O. How should shop URLs be managed?

### P. How should themes be managed?

### Q. How should customer support operations work?

### R. Are there security or authorization problems?

### S. Is the current architecture scalable?

### T. What should the final admin-panel information architecture look like?

---

# 4. STEP 1 — UNDERSTAND THE ENTIRE CODEBASE

Before auditing the UI, inspect the project structure.

Inspect:

* package.json
* source directories
* routing
* pages
* layouts
* components
* hooks
* services
* utilities
* API calls
* Supabase configuration
* authentication
* database queries
* database types
* environment variable usage
* storage integration
* state management
* form handling
* validation
* error handling
* permissions
* reusable components
* styling system
* Tailwind configuration if applicable
* theme system
* URL generation logic
* subscription logic
* payment-related logic
* shop-related logic
* admin-related logic

Identify the technology stack actually being used.

Do not rely on assumptions from project documentation if the code says otherwise.

---

# 5. STEP 2 — MAP THE ADMIN PANEL

Create a complete information architecture map.

Example structure:

Company Admin
│
├── Dashboard
├── Shops
│   ├── All Shops
│   ├── Shop Details
│   └── ...
├── Payments
│   ├── Pending
│   ├── Approved
│   ├── Rejected
│   └── Payment Details
├── Subscriptions
│   ├── Active
│   ├── Expiring
│   ├── Expired
│   └── ...
├── Themes
│   ├── Theme Library
│   ├── Create Theme
│   └── ...
├── Customers
├── Support
├── Analytics
├── Settings
└── Admin Management

IMPORTANT:

This example is only a conceptual reference.

Do NOT implement or assume these pages yet.

First determine what already exists.

Then recommend the correct final structure based on Menuzo's actual requirements.

---

# 6. PAGE-BY-PAGE AUDIT

Inspect EVERY existing admin-panel page.

For each page document:

## Page Name

## Route

## Purpose

## Current Status

Choose one:

* Complete
* Mostly complete
* Partially complete
* UI prototype
* Mock data
* Broken
* Missing backend
* Missing entirely

## What the page currently contains

List:

* Header
* Sidebar
* Navigation
* Tabs
* Cards
* Tables
* Filters
* Search
* Forms
* Modals
* Dropdowns
* Buttons
* Actions
* Charts
* Empty states
* Loading states
* Error states
* Notifications

## Data Source

Determine whether data comes from:

* Supabase
* API
* Local state
* Static data
* Mock data
* Hardcoded values

## CRUD Capability

Determine whether the admin can:

* Create
* Read
* Update
* Delete

## User Actions

Document every available action.

For example:

* View
* Edit
* Delete
* Approve
* Reject
* Activate
* Suspend
* Upgrade
* Downgrade
* Assign
* Generate
* Copy
* Export

## Missing Functionality

List everything that should exist but doesn't.

## UX Problems

Identify:

* confusing navigation
* unclear hierarchy
* excessive clicks
* missing confirmation
* poor information grouping
* unclear statuses
* ambiguous buttons
* missing feedback
* inconsistent terminology
* poor empty states
* poor loading states
* poor error states

## Technical Problems

Identify:

* duplicated logic
* duplicated components
* hardcoded values
* unsafe queries
* missing validation
* missing error handling
* poor state management
* unnecessary complexity
* poor component structure
* scalability issues

---

# 7. CURRENT NAVIGATION AUDIT

Analyze the entire sidebar/navigation system.

Document:

* Current navigation items
* Nested navigation
* Routes
* Active states
* Icons
* Labels
* Grouping
* Ordering
* Mobile behavior
* Breadcrumbs if present

Then answer:

### Is the navigation logically organized for a company operating a SaaS?

If not, propose a better information architecture.

Group features according to operational responsibility rather than simply according to how the current code happens to be organized.

---

# 8. DASHBOARD AUDIT

If a dashboard exists, audit it.

Determine whether it provides useful operational information.

Evaluate whether it should show things such as:

* Total shops
* Active shops
* Free shops
* Pro shops
* Pending payment requests
* Active subscriptions
* Expiring subscriptions
* Expired subscriptions
* Revenue
* Recent payments
* Recent registrations
* Support requests
* Platform activity
* System alerts

Do NOT automatically recommend every metric.

Determine which metrics are actually useful for a small SaaS company at Menuzo's current stage.

Separate:

### MVP requirements

from

### Future requirements

---

# 9. SHOP MANAGEMENT AUDIT

The existing Shop View is one of the completed areas.

Inspect it deeply.

Determine:

* How shops are listed
* Search
* Filtering
* Sorting
* Pagination
* Shop status
* Shop owner information
* Subscription status
* Shop URL
* Custom URL
* Created date
* Last activity
* Theme
* Menu information
* Contact information
* Payment information

Then inspect the Shop Details page.

Determine what the company admin should be able to see and manage.

Recommend a logical Shop Details structure.

For example, evaluate whether information should be separated into:

* Overview
* Business Information
* Subscription
* Payments
* URL
* Menu
* Theme
* Activity
* Support
* Account

Again, this is an evaluation task, not an instruction to blindly implement this structure.

---

# 10. SUBSCRIPTION SYSTEM AUDIT

This is one of the highest-priority areas.

Determine exactly how subscriptions currently work.

Document:

* Plans
* Plan definitions
* Pricing
* Features
* Subscription status
* Start date
* End date
* Renewal date
* Trial status if any
* Free/Pro status
* Upgrade
* Downgrade
* Expiration
* Suspension
* Cancellation
* Manual activation

Identify where subscription state is stored.

Determine whether subscription status is derived from:

* Database
* User metadata
* Shop record
* Hardcoded logic
* Frontend state

Audit whether this architecture is reliable.

---

# 11. PAYMENT MANAGEMENT AUDIT

This is a CRITICAL area.

We are intentionally using **manual payment verification** at the current stage.

Design the audit around this reality.

Determine what currently exists for:

* Payment request creation
* Payment reference
* Payment amount
* Payment method
* Payment date
* Customer
* Shop
* Subscription plan
* Payment proof
* WhatsApp communication
* Verification status
* Admin reviewer
* Approval timestamp
* Rejection reason
* Notes
* Payment history

Recommended statuses should be evaluated, such as:

* Pending
* Under Review
* Approved
* Rejected
* Cancelled

Do not add unnecessary statuses unless there is a real operational reason.

---

# 12. PAYMENT VERIFICATION WORKFLOW

Map the entire workflow.

Create a flow such as:

Customer
↓
Select Plan
↓
View Payment Instructions
↓
Make Bank Transfer
↓
Contact Menuzo / WhatsApp
↓
Payment Request
↓
Admin Payment Queue
↓
Review
↓
Approve / Reject
↓
Subscription Activation
↓
Customer Notification
↓
Pro Features Enabled
↓
Custom URL Activated if applicable

Verify every step against the actual code.

Identify where the current implementation breaks this flow.

---

# 13. PAYMENT ADMIN UI

Determine what the company admin needs on the payment screen.

Evaluate whether a payment table should include:

* Payment ID
* Shop
* Customer
* Plan
* Amount
* Submitted date
* Payment reference
* Status
* Reviewer
* Action

Evaluate whether payment details should open in a dedicated detail page or modal.

Recommend the better approach based on usability.

The admin must be able to understand a payment request quickly without searching across multiple unrelated pages.

---

# 14. APPROVAL SYSTEM

Audit the approval process.

When an admin approves a payment, determine:

1. What database record changes?
2. What subscription changes?
3. What shop status changes?
4. What Pro features become available?
5. What URL changes?
6. Is an audit record created?
7. Can another admin see who approved it?
8. Is the approval timestamp stored?
9. Can an accidental approval be reversed?
10. Is confirmation required before approval?

Identify any missing transactional safety.

---

# 15. REJECTION SYSTEM

Audit payment rejection.

Determine whether the admin can:

* Reject payment
* Provide rejection reason
* Add internal notes
* Return the request to pending
* Contact the customer
* Track rejection history

Recommend the minimum required implementation.

---

# 16. SHOP URL MANAGEMENT

Audit URL handling carefully.

There are two conceptual URL types:

### Standard URL

Automatically generated for regular customers.

### Custom URL

Available to Pro customers.

Determine:

* Where slug is stored
* How slug is generated
* How uniqueness is enforced
* How custom URLs are assigned
* How conflicts are handled
* Whether URLs can be edited
* Whether changing URLs can break existing links
* Whether redirects are needed
* Whether reserved words are protected
* Whether inactive subscriptions should retain custom URLs
* What happens when Pro expires

Provide a clear recommended policy.

---

# 17. THEME MANAGEMENT AUDIT

The current panel already contains theme customization/theme creation functionality.

Audit it deeply.

Determine:

* Theme list
* Theme creation
* Theme editing
* Theme preview
* Theme assignment
* Theme publishing
* Theme deletion
* Default themes
* Custom themes
* Theme data structure
* Theme storage
* Theme validation

Determine whether themes are:

* global templates
* shop-specific configurations
* reusable templates
* combinations of both

Identify the correct architecture for Menuzo.

---

# 18. CUSTOMER MANAGEMENT

Determine whether customer management exists.

If it exists, audit:

* customer list
* customer profile
* shop ownership
* subscription
* payment history
* contact information
* account status
* support history

If it does not exist, determine whether it is actually necessary for the MVP.

Do not create unnecessary CRM functionality.

---

# 19. CUSTOMER SUPPORT

Determine how the company will support customers.

Because the current payment process uses WhatsApp/manual communication, evaluate whether the admin panel should maintain:

* customer contact
* WhatsApp contact
* support notes
* issue status
* payment-related conversations
* internal notes
* support history

Clearly distinguish between:

### Required now

and

### Better later

Do not attempt to build a complete helpdesk unless justified.

---

# 20. ADMIN AUTHENTICATION & AUTHORIZATION

Audit security thoroughly.

Determine:

* How admin login works
* Whether company admins are separated from customers
* Role-based access
* Admin roles
* Route protection
* Database-level protection
* Supabase RLS
* Service-role usage
* Frontend-only authorization
* Sensitive actions
* Session handling
* Logout
* Password recovery

Pay special attention to whether an ordinary customer could access admin routes or invoke admin operations through direct API/database calls.

This must be treated as a high-priority issue.

---

# 21. DATABASE AUDIT

Inspect the actual database schema.

Map relationships between:

* users
* shops
* subscriptions
* plans
* payments
* payment requests
* themes
* menu data
* admins
* activity logs

Determine:

* Primary keys
* Foreign keys
* Constraints
* Unique constraints
* Nullable fields
* Status fields
* Timestamps
* Indexes
* RLS policies

Identify inconsistencies between the frontend data model and database model.

---

# 22. RLS / SECURITY AUDIT

If Supabase is used, inspect RLS policies carefully.

For each relevant table determine:

* Who can SELECT?
* Who can INSERT?
* Who can UPDATE?
* Who can DELETE?

Identify:

* overly permissive policies
* missing policies
* frontend-only restrictions
* exposed sensitive data
* unsafe admin operations
* accidental customer access
* privilege escalation possibilities

Do NOT expose secrets.

Do NOT print environment-variable values.

---

# 23. UI/UX DESIGN AUDIT

Evaluate the admin panel as a professional SaaS back-office product.

Audit:

### Visual hierarchy

### Typography

### Spacing

### Cards

### Tables

### Buttons

### Forms

### Modals

### Status badges

### Navigation

### Icons

### Color usage

### Responsive behavior

### Accessibility

### Consistency

Check for:

* inconsistent spacing
* inconsistent typography
* inconsistent button styles
* inconsistent border radius
* inconsistent colors
* unnecessary decoration
* excessive cards
* excessive empty space
* crowded tables
* unclear status indicators
* unclear primary actions

---

# 24. DESIGN SYSTEM AUDIT

Determine whether the admin panel has a consistent design system.

Document:

* Primary colors
* Secondary colors
* Background colors
* Text colors
* Border colors
* Typography
* Font sizes
* Font weights
* Radius
* Shadows
* Spacing scale
* Button variants
* Input styles
* Table styles
* Badge styles
* Modal styles

Identify duplicated styles and components.

Recommend a reusable component system.

---

# 25. RESPONSIVE DESIGN

Test/analyze:

* Desktop
* Laptop
* Tablet
* Mobile

Determine whether company admins can realistically use the system on smaller screens.

Prioritize desktop because this is an internal admin application, but do not ignore responsive usability.

---

# 26. TABLE UX AUDIT

Admin systems heavily depend on tables.

For every major table inspect:

* columns
* sorting
* filtering
* search
* pagination
* row actions
* bulk actions
* status
* empty state
* loading state
* error state
* responsive behavior

Determine whether the tables are operationally efficient.

---

# 27. FORM AUDIT

For every admin form inspect:

* required fields
* validation
* error messages
* default values
* input types
* confirmation
* loading states
* success feedback
* failure feedback
* unsaved changes

Pay particular attention to:

* payment verification
* subscription changes
* URL changes
* theme creation/editing
* shop editing

---

# 28. STATE MANAGEMENT AUDIT

Determine:

* How server state is handled
* How loading states are handled
* How errors are handled
* How mutations are handled
* How cache invalidation works
* Whether stale data can appear
* Whether unnecessary API calls happen

Identify areas that can produce inconsistent admin-panel state.

---

# 29. ERROR & EDGE CASE AUDIT

Think like an operator trying to break the system.

Evaluate cases such as:

### Payment

* Duplicate payment request
* Wrong amount
* Wrong plan
* Payment for another shop
* Rejected payment
* Already-approved payment
* Payment after expiration
* Missing payment reference

### Subscription

* Expired Pro
* Manual extension
* Early renewal
* Downgrade
* Cancellation
* Reactivation
* Duplicate activation

### URL

* Duplicate slug
* Invalid slug
* Reserved slug
* URL already taken
* URL changed after publication

### Shop

* Deleted shop
* Suspended shop
* Incomplete shop
* Missing owner
* Missing menu

### Admin

* Two admins approving simultaneously
* Admin refresh during action
* Network failure during approval
* Partial database update

Document expected behavior for each important case.

---

# 30. AUDIT LOGGING

Determine whether sensitive admin actions are logged.

Evaluate logging for:

* Payment approval
* Payment rejection
* Subscription activation
* Subscription cancellation
* URL changes
* Shop suspension
* Theme changes
* Admin changes

Recommend a minimal audit-log architecture if currently missing.

---

# 31. NOTIFICATIONS

Determine how the admin knows that something requires attention.

Evaluate:

* pending payment notifications
* subscription expiry alerts
* support requests
* system errors
* admin action confirmations

Do not over-engineer notifications.

Recommend a practical MVP approach.

---

# 32. PERFORMANCE AUDIT

Inspect for:

* unnecessary database queries
* N+1 queries
* excessive re-renders
* large data loads
* missing pagination
* unnecessary API calls
* unoptimized assets
* inefficient filtering
* expensive dashboard queries

Identify actual issues from the code where possible.

---

# 33. CODE QUALITY AUDIT

Inspect:

* component organization
* naming
* duplication
* abstraction
* TypeScript usage
* type safety
* error handling
* constants
* utility functions
* hooks
* API/service separation
* database access separation

Identify technical debt that will become painful as Menuzo grows.

---

# 34. MVP VS FUTURE

Create three categories:

## MUST BUILD BEFORE SELLING

Critical functionality required to operate Menuzo commercially.

## SHOULD BUILD SOON

Important improvements but not launch blockers.

## FUTURE

Useful when Menuzo scales.

Do not turn the MVP into an enterprise platform unnecessarily.

---

# 35. FINAL RECOMMENDED ADMIN PANEL

After auditing the current implementation, design the recommended information architecture.

Provide:

### Sidebar

List the exact recommended navigation structure.

### Pages

For every page provide:

* Purpose
* Main information
* Main actions
* Secondary actions
* Tables
* Filters
* Statuses
* Required backend operations

### Page relationships

Explain how the pages connect.

---

# 36. RECOMMENDED PAYMENT SYSTEM

Provide the final recommended payment-management architecture specifically for Menuzo's current manual-payment stage.

Include:

### Customer side

What the customer sees.

### WhatsApp flow

What information should be communicated.

### Admin side

What the admin sees.

### Payment record

What data must be stored.

### Verification

How approval/rejection works.

### Subscription activation

What happens after approval.

### Pro activation

What changes.

### URL activation

What changes.

### Audit trail

What gets logged.

### Future automation

What can later be automated.

---

# 37. PRIORITIZED IMPLEMENTATION ROADMAP

Create a practical roadmap.

## PHASE 0 — Fix Existing Architecture

Critical structural problems.

## PHASE 1 — Admin MVP

Everything required for Menuzo to start selling.

## PHASE 2 — Operational Improvements

Features that make daily administration easier.

## PHASE 3 — Scale

Automation and advanced management.

For every item provide:

* Feature
* Priority
* Why it matters
* Dependencies
* Backend changes
* Frontend changes
* Database changes
* Estimated complexity: Low / Medium / High

---

# 38. DO NOT MODIFY CODE DURING THE AUDIT

Unless explicitly instructed afterward:

**DO NOT implement changes.**

The output of this task is an audit and implementation plan.

Do not:

* redesign blindly
* delete existing pages
* rewrite components
* modify database schema
* modify routes
* modify authentication
* change business logic

without explicit approval.

---

# 39. EVIDENCE REQUIREMENT

Every major finding must reference the actual implementation.

For example:

* File
* Component
* Route
* Function
* Database table
* Query
* Policy

Do not make vague statements such as:

"Payment system needs improvement."

Instead write:

"Payment verification currently has no persistent payment-request record. The UI displays a verification action, but no corresponding database mutation was found in [file/component]. Therefore approval cannot reliably trigger subscription activation."

Use actual code evidence.

---

# 40. FINAL REPORT FORMAT

Produce the final report in the following structure:

# MENUZO COMPANY ADMIN PANEL

## COMPLETE AUDIT REPORT

### 1. Executive Summary

### 2. Current Technology Stack

### 3. Current Architecture

### 4. Current Information Architecture

### 5. Existing Pages

Create a table:

| Page | Route | Status | Backend Connected | Main Purpose | Issues |
| ---- | ----- | ------ | ----------------- | ------------ | ------ |

### 6. Existing Navigation

### 7. Page-by-Page Audit

### 8. Shop Management Audit

### 9. Theme Management Audit

### 10. Subscription Audit

### 11. Payment System Audit

### 12. Payment Verification Workflow

### 13. URL Management Audit

### 14. Customer Management Audit

### 15. Customer Support Audit

### 16. Authentication & Authorization Audit

### 17. Database Audit

### 18. RLS / Security Audit

### 19. UI/UX Audit

### 20. Design System Audit

### 21. Responsive Design Audit

### 22. Error & Edge Case Audit

### 23. Audit Logging

### 24. Performance Audit

### 25. Code Quality Audit

### 26. Current Problems

Separate into:

* Critical
* High
* Medium
* Low

### 27. Missing Features

### 28. Features That Should Be Removed or Simplified

### 29. Recommended Final Information Architecture

### 30. Recommended Payment Architecture

### 31. Recommended Subscription Architecture

### 32. Recommended URL Architecture

### 33. MVP Requirements

### 34. Post-MVP Requirements

### 35. Future Scaling Requirements

### 36. Implementation Roadmap

### 37. Database Changes Required

### 38. Frontend Changes Required

### 39. Backend Changes Required

### 40. Security Changes Required

### 41. Final Launch Checklist

---

# 41. FINAL DECISION MATRIX

End the report with this table:

| Area                 | Current State | Required Change | Priority | Launch Blocker? |
| -------------------- | ------------- | --------------- | -------- | --------------- |
| Authentication       |               |                 |          |                 |
| Admin Authorization  |               |                 |          |                 |
| Shops                |               |                 |          |                 |
| Subscriptions        |               |                 |          |                 |
| Payments             |               |                 |          |                 |
| Payment Verification |               |                 |          |                 |
| Pro Activation       |               |                 |          |                 |
| Custom URLs          |               |                 |          |                 |
| Themes               |               |                 |          |                 |
| Customers            |               |                 |          |                 |
| Support              |               |                 |          |                 |
| Audit Logs           |               |                 |          |                 |
| Dashboard            |               |                 |          |                 |
| UI/UX                |               |                 |          |                 |
| Security             |               |                 |          |                 |

---

# 42. IMPORTANT BUSINESS PRINCIPLE

Remember that Menuzo is currently a **small SaaS business**.

Do not recommend enterprise complexity simply because it is technically possible.

The system should be:

**Simple enough to operate manually.**

**Structured enough to avoid operational mistakes.**

**Secure enough to protect customers and company data.**

**Flexible enough to automate later.**

The architecture should allow Menuzo to move from:

Manual Operations

→ Semi-Automated Operations

→ Fully Automated SaaS Operations

without requiring a complete rewrite.

---

# 43. AFTER THE AUDIT

At the very end, provide:

## "WHAT I WOULD DO NEXT"

Give the **top 10 implementation actions**, in exact order.

For each action explain:

* What to change
* Why
* Dependencies
* What should NOT be changed yet

Do not start implementing anything.

The next development stage will be decided after reviewing this audit.

---

## FINAL RULE

Be brutally honest.

Do not praise the existing system simply because it looks good.

Do not criticize something without evidence.

Do not invent missing functionality.

Do not assume the current UI represents the actual backend.

**Inspect → Understand → Verify → Audit → Prioritize → Recommend.**

The goal is to turn the current Menuzo Company Admin Panel from a partially structured internal dashboard into a reliable operational control center that can safely manage Menuzo's real customers, subscriptions, payments, Pro activation, themes, and shop URLs.

### One important thing

When you run this with your coding agent, **give it access to the actual repository**, not just screenshots. The strongest audit will come from combining:

**UI → routes → components → Supabase queries → database schema → RLS → authentication → business logic.**

And because your biggest operational risk is currently **manual payment → verification → subscription → Pro activation → custom URL**, I would make the agent treat that entire chain as a **critical launch workflow**, rather than auditing payments as just another admin page.
