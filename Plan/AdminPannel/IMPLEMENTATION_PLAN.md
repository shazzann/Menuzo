# MENUZO ADMIN PANEL — IMPLEMENTATION PLAN

**Created**: 2026-09-10  
**Source**: audit results in `adminPannel/` + plan in `Plan/AdminPannel/payment.md`  
**Status**: PHASE 0 — IN PROGRESS

---

## Dependency Graph

```
AUTH (P0) → AUTHORIZATION (P0) → ADMIN RLS (P0)
                                        ↓
                              PAYMENT DB TABLE (P1)
                                        ↓
                     ┌──────────────────┴──────────────────┐
                     ↓                                     ↓
          CUSTOMER PAYMENT SUBMISSION              ADMIN PAYMENT QUEUE
                     ↓                                     ↓
                     └──────────────────┬──────────────────┘
                                        ↓
                              PAYMENT APPROVAL/REJECTION
                                        ↓
                              SUBSCRIPTION ACTIVATION
                                        ↓
                              PRO ENTITLEMENT (remove hardcode)
                                        ↓
                              URL ENTITLEMENT
                                        ↓
                              SHOP DETAIL REBUILD
                                        ↓
                              REAL AUDIT LOGS
                                        ↓
                              REAL DASHBOARD
                                        ↓
                              NAVIGATION CLEANUP
                                        ↓
                              UI REFINEMENT + TESTS
```

---

## Full Finding Classification Table

| ID | Finding | Classification | Priority | Phase | Dependency |
|----|---------|----------------|----------|-------|------------|
| AUTH-001 | Login form is fake (setTimeout mock) | FIX | P0 | 1 | None |
| AUTH-002 | `/admin-portal` URL bypasses login | FIX | P0 | 1 | None |
| AUTH-003 | `admins` table does not exist | BUILD | P0 | 1 | None |
| AUTH-004 | Google OAuth can allow any user into admin | FIX | P0 | 1 | AUTH-003 |
| AUTH-005 | Hardcoded `plan: 'pro'` in login handler | FIX | P1 | 14 | DB, SUB activation |
| AUTH-006 | Forgot password is dead link | DEFER | P3 | 26 | None |
| AUTH-007 | Remember me checkbox non-functional | DEFER | P3 | 26 | None |
| ROLE-001 | `company-admin` view not in auth guard | FIX | P0 | 1 | AUTH-003 |
| ROLE-002 | Admin check is frontend-only (post-render) | FIX | P0 | 1 | AUTH-003 |
| ROLE-003 | No admin RLS policies | BUILD | P0 | 1 | AUTH-003 |
| ROLE-004 | No multi-role admin system | DEFER | P3 | future | None |
| ROLE-005 | No server-side enforcement for admin actions | FIX | P1 | 10 | Edge Fn |
| DASH-001 | All dashboard data is mock | FIX | P2 | 21 | real data exists |
| DASH-002 | Quick action buttons do nothing | FIX | P2 | 21 | payment, shop actions |
| DASH-003 | Missing operational metrics | BUILD | P2 | 21 | payment table |
| DASH-004 | "AI-powered analysis" is hardcoded | REMOVE | P2 | 21 | None |
| NAV-001 | Many nav items load Dashboard silently | FIX | P1 | 2 | coming-soon component |
| NAV-002 | Multiple nav sections same component | FIX | P1 | 2 | section-aware components |
| NAV-003 | Over-engineered nav for MVP stage | REMOVE | P1 | 2 | None |
| NAV-004 | No breadcrumb system | DEFER | P3 | 26 | None |
| NAV-005 | Search bar non-functional | DEFER | P3 | 26 | None |
| MGT-001 | All shop action buttons non-functional | FIX | P1 | 18 | admin RLS |
| MGT-002 | Revenue always $0 | FIX | P2 | 17 | payment table |
| MGT-003 | Rating/QR Scans hardcoded | FIX | P2 | 17 | real stats |
| MGT-004 | Export/Import/Refresh non-functional | FIX | P1 | 18 | shop fetch |
| MGT-005 | Change Plan/Message/Edit buttons do nothing | FIX | P1 | 18 | admin actions |
| MGT-006 | Hardcoded invoices in subscription tab | FIX | P2 | 17 | payment table |
| MGT-007 | Auto Renew hardcoded | FIX | P2 | 17 | subscription model |
| DB-001 | `admins` table missing | BUILD | P0 | 1 | None |
| DB-002 | No payment/subscription tables | BUILD | P1 | 4 | None |
| DB-003 | Username change blocked by trigger for admin | FIX | P2 | 15 | Edge Fn |
| DB-004 | No themes table | DEFER | P3 | 19 | evaluate need first |
| DB-005 | activity_logs only for shops/food | FIX | P2 | 20 | payment table |
| DB-006 | supabase.ts types out of sync | FIX | P0 | 1 | None |
| API-001 | Pricing in localStorage only | FIX | P2 | 22 | plans evaluation |
| API-002 | No admin-specific API protection | FIX | P0 | 1 | Edge Fn |
| API-003 | Shop fetch lacks admin RLS | FIX | P0 | 1 | admin RLS |
| API-004 | No error handling UI for failed queries | FIX | P1 | 23 | None |
| API-005 | No pagination for shop list | FIX | P2 | 18 | None |
| FORM-001 | Login form has fake auth | FIX | P0 | 1 | AUTH-003 |
| FORM-002 | Plan price input no validation | FIX | P2 | 22 | None |
| FORM-003 | No confirmation dialogs for destructive actions | FIX | P1 | 18 | None |
| FORM-004 | No unsaved changes warning | DEFER | P3 | future | None |
| UX-001 | Broken nav loads wrong page silently | FIX | P1 | 2 | None |
| UX-002 | Action buttons no feedback | FIX | P1 | 18 | actions implemented |
| UX-003 | Revenue $0 for all shops | FIX | P2 | 17 | payment table |
| UX-004 | Verification/Requests show same list | FIX | P1 | 3 | section-aware |
| UX-005 | Shop detail tabs fake data | FIX | P2 | 17 | real data |
| UX-006 | Notification bell non-functional | DEFER | P3 | future | None |
| SEC-001 | No real auth gate | FIX | P0 | 1 | AUTH-001/002 |
| SEC-002 | No server-side admin enforcement | FIX | P0 | 1 | Edge Fn |
| SEC-003 | Auth gate queries missing table | FIX | P0 | 1 | DB-001 |
| SEC-004 | Pricing in localStorage manipulable | FIX | P2 | 22 | plans table or Edge Fn |
| SEC-005 | Admin email always visible | DEFER | P3 | 26 | None |
| SEC-006 | Public RLS exposes sensitive shop columns | FIX | P2 | 1 | RLS review |
| SEC-007 | console.log in production | REMOVE | P0 | 1 | None |
| LOAD-001 | Only shop list has loading state | FIX | P1 | 23 | None |
| LOAD-002 | No error state in shop list | FIX | P1 | 23 | None |
| LOAD-003 | Browser refresh loses shop detail context | FIX | P2 | 17 | None |
| LOAD-004 | No cache invalidation for shop list | FIX | P1 | 18 | None |
| PERF-001 | Unbounded shop list query | FIX | P2 | 18 | None |
| BIZ-001 | No subscription activation mechanism | BUILD | P1 | 13 | payment table |
| BIZ-002 | No payment verification workflow | BUILD | P1 | 4–12 | None |
| BIZ-003 | Subscription not enforced from real DB | FIX | P1 | 14 | subscription model |
| BIZ-004 | Custom URL policy unclear and blocked | BUILD | P2 | 15 | subscription activated |
| BIZ-005 | Plans in frontend only | FIX | P2 | 22 | evaluate plans table |
| CQ-001 | Mock data file imported in production | REMOVE | P1 | 24 | real data exists |
| CQ-002 | Nav sections same component no context | FIX | P1 | 2 | section-aware |
| CQ-003 | supabase.ts types stale | FIX | P0 | 1 | None |
| CQ-004 | Debug console.log | REMOVE | P0 | 1 | None |
| CQ-005 | Hardcoded fake names in staff tab | REMOVE | P2 | 17 | None |
| PROD-001 | Admin panel cannot perform real operation | FIX | P0 | 1–13 | all above |

---

## Phase Execution Order

| Phase | Title | Status |
|-------|-------|--------|
| 0 | Audit → Implementation Plan | ✅ COMPLETE |
| 1 | Security & Admin Authentication | ✅ COMPLETE |
| 2 | Navigation Cleanup | ✅ COMPLETE |
| 3 | Shop Management Foundation (section-aware) | ✅ COMPLETE |
| 4 | Payment Request Database | ✅ COMPLETE |
| 5 | Payment Status Model | ✅ COMPLETE |
| 6 | Customer Payment Flow | ✅ COMPLETE |
| 7 | WhatsApp Handoff | ✅ COMPLETE |
| 8 | Admin Payment Queue | ✅ COMPLETE |
| 9 | Payment Review Screen | ✅ COMPLETE |
| 10 | Payment Approval (secure backend) | ✅ COMPLETE |
| 11 | Approval Idempotency | ✅ COMPLETE |
| 12 | Payment Rejection | ✅ COMPLETE |
| 13 | Subscription Activation | ✅ COMPLETE |
| 14 | Pro Entitlement (remove hardcode) | ✅ COMPLETE |
| 15 | Custom URL System | ✅ COMPLETE |
| 16 | Pro Expiration Policy | ✅ COMPLETE |
| 17 | Shop Detail Rebuild (real data) | ✅ COMPLETE |
| 18 | Admin Shop Actions | ✅ COMPLETE |
| 19 | Theme System (evaluate only) | ✅ COMPLETE |
| 20 | Real Audit Logging | 🔲 NEXT |
| 21 | Real Dashboard | 🔲 |
| 22 | Platform Settings | 🔲 |
| 23 | Error States everywhere | 🔲 |
| 24 | Remove Mock Data | 🔲 |
| 25 | Navigation Cleanup (final) | 🔲 |
| 26 | UI/UX Refinement | 🔲 |
| 27 | Business Workflow Tests | 🔲 |
| 28 | Security Tests | 🔲 |
| 29 | Build Validation | 🔲 |
| 30 | Documentation | 🔲 |
| 31 | Final Re-Audit | 🔲 |

---

## Current Phase: 1 — Security & Admin Authentication

### Checklist
- [ ] Fix CompanyAdminLoginPage.tsx — real Supabase auth
- [ ] Remove `/admin-portal` bypass from store/index.tsx
- [ ] Create admins table migration
- [ ] Fix isPrivateView in App.tsx
- [ ] Fix verifyAdmin() to use admins table correctly
- [ ] Add admin-level RLS policies
- [ ] Fix supabase.ts types (add role, username, updated_at to profiles)
- [ ] Remove console.log debug statement
- [ ] Test: logged-out → admin URL → redirected to login
- [ ] Test: regular customer → admin URL → access denied
- [ ] Test: admin → admin URL → admin panel
- [ ] TypeScript check passes
- [ ] Build passes
