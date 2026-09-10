# 19 — Edge Case Audit

---

## Payment Edge Cases (All currently unhandled — no payment system exists)

| Edge Case | Expected Behavior | Current State |
|-----------|-------------------|---------------|
| Duplicate payment request | Show existing pending request, prevent duplicate | ❌ No payment table |
| Wrong payment amount | Admin rejects with reason | ❌ No rejection system |
| Payment for expired subscription | Admin notes and activates from correct start date | ❌ Missing |
| Already-approved payment re-submitted | Prevent duplicate | ❌ Missing |
| Payment during active subscription | Admin decides: extend or reject | ❌ Missing |
| Admin approves payment → subscription table update fails halfway | Transaction rollback needed | ❌ Missing |

---

## Shop Edge Cases

| Edge Case | Expected Behavior | Current State |
|-----------|-------------------|---------------|
| Shop with no menu items | Show empty state in shop detail | ⚠️ Partial — menuItems count shows 0 |
| Shop with no owner profile | Gracefully handle missing profile join | ⚠️ `owner` falls back to email split or 'Shop Owner' |
| Duplicate shop usernames | Database constraint prevents | ✅ UNIQUE constraint exists |
| Shop username change by admin | Admin can override | ❌ BLOCKED by trigger |
| Two admins approving same request simultaneously | Last-write-wins or lock needed | ❌ No concurrency protection |

---

## Admin Edge Cases

| Edge Case | Expected Behavior | Current State |
|-----------|-------------------|---------------|
| Admin refreshes browser on shop detail | Should maintain context | ❌ selectedManagedShop lost |
| Admin network failure during action | Show retry option | ❌ No retry logic anywhere |
| Session expires mid-session | Redirect to login | ⚠️ Supabase handles token refresh, but no UI for expired session |
| Admin with expired token tries to submit | Supabase returns 401 | ❌ No 401 handling in admin components |
| Empty shop list (no shops registered yet) | Show empty state | ✅ Grid renders empty |
| Very long shop name | Truncation with ellipsis | ✅ Most names have truncate classes |
