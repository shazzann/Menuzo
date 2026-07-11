# Menuzo – Technical Audit Report

## 🔴 Critical Security Issues (Must Fix Before Production)

These issues expose the platform to unauthorized access or compromise.

| Problem                                            | Impact                                                                                                                | Solution                                                                                                                                                                                                                 | Priority    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **Company Admin Login doesn't authenticate users** | Anyone can log in using any email/password. The login page is only cosmetic.                                          | Implement real authentication using Supabase Auth. Validate credentials through Supabase and reject invalid logins.                                                                                                      | 🔥 Critical |
| **Admin panel can be accessed by URL bypass**      | Visiting `/admin/dashboard` directly skips the login page entirely. Anyone can access the master admin interface.     | Protect every admin route with authentication middleware/route guards. Verify the logged-in user has a platform admin role before rendering. Enforce authorization through Supabase RLS and server-side role validation. | 🔥 Critical |
| **Cloudinary API Secret exposed in frontend**      | Anyone can extract the API secret from the JavaScript bundle and generate signed requests to delete or modify assets. | Remove the secret from the frontend immediately. Rotate the exposed secret. Move signing to a secure backend (Supabase Edge Function/server). Only the backend should generate Cloudinary signatures.                    | 🔥 Critical |

---

# 🟠 High Priority Functional Issues

These don't directly compromise security but prevent the system from functioning as a real SaaS platform.

| Problem                                    | Impact                                                                                     | Solution                                                                                                                                                              | Priority |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Company Admin Dashboard uses mock data** | Dashboard doesn't reflect real businesses, revenue, users or reports.                      | Replace `companyAdminData.ts` with Supabase queries. Connect dashboard widgets, reports, shop management, support tickets and analytics to the database.              | High     |
| **Subscription system is hardcoded**       | Every logged-in user becomes Pro with an expired fake date. Billing cannot work correctly. | Store subscriptions in Supabase (`profiles` or dedicated subscription table). Load plan details after login. Integrate Stripe/PayHere/LemonSqueezy before production. | High     |
| **Application lacks real routing**         | URLs cannot be shared. QR menu links aren't permanent. Browser history behaves poorly.     | Replace reducer-based navigation with React Router. Create permanent URLs such as `/shop/:slug`, `/menu/:slug`, `/food/:id`, `/admin/dashboard`.                      | High     |

---

# 🟡 Architecture Improvements

These improve scalability and maintainability.

| Problem                                                        | Impact                              | Solution                                                                                 |
| -------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Company Admin and Shop Owner panels use different architecture | Harder to maintain long term        | Standardize routing, layouts, authentication and data loading across both panels.        |
| Client controls navigation state                               | Easy to bypass UI logic             | Move authentication and authorization to route-level protection.                         |
| Business logic mixed with UI                                   | Difficult to test and maintain      | Create service layers (AuthService, ShopService, SubscriptionService, AnalyticsService). |
| Cloudinary operations handled directly by client               | Security risk and poor architecture | Introduce backend APIs/Edge Functions for uploads, deletions and image management.       |

---

# 🟢 Code Quality Issues

These won't break production immediately but reduce maintainability.

| Problem                                 | Impact                                           | Solution                                                   |
| --------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Disposable scripts in project root      | Confusing repository structure                   | Move scripts into `/scripts` or delete obsolete ones.      |
| Mock data mixed with production code    | Difficult to distinguish demo from live features | Separate mock data into a development-only folder.         |
| Hardcoded values throughout application | Future maintenance becomes difficult             | Move constants to configuration files or database.         |
| Missing environment validation          | Application may start with missing configuration | Add startup validation for required environment variables. |

---

# 🔵 Testing & DevOps

These improve reliability and deployment confidence.

| Problem             | Impact                                              | Solution                                                                               |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| No automated tests  | Security regressions can reach production unnoticed | Add unit tests (Vitest), integration tests, and authentication/RLS tests.              |
| No CI/CD validation | Broken code can be merged                           | Add GitHub Actions to run linting, type checking, tests and production builds.         |
| No security testing | Authentication issues may reappear                  | Add automated security checks and dependency scanning.                                 |
| No end-to-end tests | Critical user journeys aren't verified              | Use Playwright or Cypress to test login, QR menu access, ordering and admin workflows. |

---

# 🏗 Recommended Production Architecture

## Authentication

* Supabase Authentication
* Protected Routes
* Role-Based Access Control (RBAC)
* Platform Admin Role
* Shop Owner Role
* Staff Role
* Customer (Public)

---

## Authorization

Never trust the frontend.

Every sensitive request should verify:

* User is authenticated
* User owns the requested resource
* User has correct role
* Supabase RLS policy allows access

---

## Routing

Replace state-based navigation with URL routing.

Example:

```
/
 /pricing
 /about

/login
/signup

/dashboard

/shop/:shopSlug

/shop/:shopSlug/menu

/shop/:shopSlug/menu/:category

/shop/:shopSlug/food/:foodId

/admin

/admin/dashboard

/admin/shops

/admin/users

/admin/subscriptions

/admin/support

/admin/settings
```

---

## Backend Responsibilities

Move these operations off the client:

* Cloudinary signing
* Image deletion
* Subscription verification
* Platform admin verification
* Revenue calculations
* Analytics aggregation
* Report generation

---

# 📅 Recommended Implementation Roadmap

## Phase 1 – Security (Immediate)

* Fix admin authentication.
* Protect all admin routes.
* Implement role-based authorization.
* Remove Cloudinary secret from frontend.
* Rotate exposed Cloudinary credentials.

---

## Phase 2 – Core Functionality

* Connect Company Admin dashboard to Supabase.
* Replace mock data with live queries.
* Implement real subscription management.
* Build platform analytics.

---

## Phase 3 – Navigation

* Introduce React Router.
* Create permanent URLs.
* Support browser history.
* Make QR menu links directly accessible.

---

## Phase 4 – Quality

* Add automated tests.
* Configure GitHub Actions.
* Clean repository structure.
* Remove unused scripts.
* Improve documentation.

---

# Overall Assessment

| Category             | Status                            |
| -------------------- | --------------------------------- |
| Security             | 🔴 Critical issues present        |
| Authentication       | 🔴 Not production-ready           |
| Authorization        | 🔴 Missing                        |
| Company Admin        | 🟠 Prototype (mock data)          |
| Shop Owner Panel     | 🟢 Mostly functional              |
| Database Design      | 🟢 Good foundation                |
| Routing              | 🟠 Needs modernization            |
| Code Organization    | 🟡 Acceptable with cleanup needed |
| Testing              | 🔴 Missing                        |
| Production Readiness | **≈55–60%**                       |

The most urgent blockers are the authentication bypass and exposed Cloudinary secret. Once those are resolved, the focus should shift to replacing mock data with live Supabase integration and implementing proper URL-based routing. Those changes will move Menuzo from a functional prototype toward a production-ready SaaS platform.
