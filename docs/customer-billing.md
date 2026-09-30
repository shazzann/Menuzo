# Customer Pro payments

Open `/subscription`, or use **Choose Pro / Manage** on the shop dashboard,
**Choose Pro / Manage Subscription** in analytics, or **Subscription & Payments** in settings.
The landing page Pro button preserves the upgrade choice through login and shop onboarding.

The customer flow supports monthly/yearly selection, bank instructions, transfer
details, a WhatsApp receipt draft, and a persisted verification request. Requests
remain pending until a trusted review process updates them. Customers can view
their history and rejection reasons and submit a corrected request after rejection.

## Database setup

The production-only bank details and LKR 1,500 monthly / LKR 15,000 yearly prices
provided by the owner are configured in production. The private deployment SQL is kept locally in `supabase/production/configure_billing.sql` and excluded from Git.
Run it only against the production project after the billing schema migration.
It is deliberately outside the automatic migrations so local databases keep
their placeholders. The landing page reads published prices from the same
`billing_periods` table as checkout.

For a fresh local Supabase project, run `supabase start` from the project root.
The migration sequence creates the base tables before the profile trigger and
other alterations; no separate manual table creation is needed. Use the local
project URL and publishable/anon key shown by `supabase status` in a local Vite
environment file if you want the frontend to use this local database.

Apply `supabase/migrations/20260929000001_customer_billing.sql` to the existing
Supabase project using its migration workflow or SQL editor before using payments.
The migration requires the existing `profiles`, `shops`, and Supabase auth tables.
The customer billing migration has been applied to production project `jzlfjrwhfcjcqeyculbd`. Older production payment requests and review functions remain intact; new customer requests use `billing_payment_requests`.

The seeded monthly/yearly prices are `NULL`; bank details and WhatsApp are empty,
and bank checkout is disabled. These are intentional placeholders. Customers may
preview payment instructions but cannot submit a payment against placeholder data.
Missing/unreachable tables show a retry message and cannot activate Pro.

Supply the following through a trusted database operator when ready:

| Table | Values to configure |
| --- | --- |
| `billing_periods` | Rows `monthly` and `yearly`: actual total `amount` and three-letter `currency` (e.g. LKR or USD). Amount is the full period total, not a monthly equivalent. |
| `bank_transfer_settings` | The singleton row (`id = true`): `bank_name`, `account_name`, `account_number`, `branch`, and `whatsapp_number`. |
| `bank_transfer_settings` | Set `enabled = true` only after the account details and both prices are confirmed. |

WhatsApp uses the international number with country code, 8–15 digits, without
`+`, spaces, or punctuation. The seeded USD currency is a placeholder and should
be set alongside the actual prices. No real account number or price is invented.

## Customer data and access

- `submit_payment_request` authenticates the caller, verifies shop ownership,
  validates the configured bank details, and obtains price/duration/currency
  from `billing_periods`. It rejects a changed checkout quote and future transfer
  dates in the app's Asia/Colombo timezone.
- Requests contain payer name, transfer reference/date, optional preferred URL,
  optional note, and a snapshot of the selected plan. The initial status is
  always `pending`. Only one pending request per shop is allowed.
- Customers can read their requests and assigned URL. They cannot directly
  insert, update, approve, or delete these records, or change their profile's
  role, plan, status, or subscription expiry.
- WhatsApp opens a draft in a new tab. Customers attach and send the receipt
  themselves, then confirm and submit in Menuzo. Opening WhatsApp alone does
  not submit a request or prove payment. Receipts are not uploaded publicly.
- Subscription eligibility comes from `profiles`. Paid access requires an
  active Pro/Enterprise plan and an expiry in the future. Login no longer
  grants a hardcoded Pro plan. Status refreshes on window focus and every
  30 seconds while visible.

## Future review integration (not implemented)

Company admin screens, payment review controls, approval/rejection endpoints,
and subscription activation are outside this change. A future trusted server
workflow must review the receipt before changing any entitlement.

That workflow should perform the following in a transaction:

1. Mark the chosen request approved or rejected and set `reviewed_at` (and a
   customer-readable `rejection_reason` on rejection).
2. For approval, activate/extend the owner's `profiles.subscription_plan`,
   `subscription_status`, and `subscription_expires_at` using the purchased
   duration. An approved request by itself never activates a subscription.
3. If a preferred URL was requested and is available, assign it in
   `shop_custom_urls`. A requested slug is a preference, not a reservation.

The new request table uses trusted service operations for review/assignment. Existing production administrator permissions and legacy review functions remain intact.
Never expose its key in the browser. Rejection of a renewal must not revoke a
previously paid, still-active subscription. No existing account is upgraded or
charged by this customer implementation.

## Custom URLs

Permanent `shops.username` menu links and existing QR codes stay valid. Paid
aliases live separately in `shop_custom_urls`; customers can request one during
checkout and see/copy it once assigned and their subscription is active.

`resolve_menu_shop` resolves permanent links and paid aliases for menu visits and
social link previews. It checks active, unexpired entitlement on the server for
aliases. Expired aliases cannot fall back to a similarly named shop. Reserved
application paths and collisions with permanent usernames are rejected. An
expired subscription leaves the standard menu URL available.

## Validation

- `npm run test:billing`: subscription eligibility, checkout validation,
  WhatsApp encoding, service request integrity, stale-session handling, and
  customer page smoke tests.
- `npm run build`: TypeScript and Vite production compilation.
- `tests/customer-billing-db.sql`: isolated PostgreSQL/Supabase-role fixture
  exercises the migration and database permissions. Use an empty disposable
  local test database, never a production project.
- `tests/local-schema-smoke.sql`: run against the local Supabase database after
  `supabase start` to check the complete migrated schema, signup trigger, shop
  creation, opening hours, visit counters, and billing placeholders. Fixtures
  are inside a transaction and are rolled back.

No test sends WhatsApp messages, uses real customer transfers, or connects to
the configured remote Supabase project.
