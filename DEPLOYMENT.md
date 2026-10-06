# Deployment

## Before Applying Database Changes

Use a staging project and backup first. The checked-in migration history starts after the original bookings table was created, includes repeated date-only versions, and contains historical cleanup scripts that delete bookings. Do not run a blanket `db push` or replay those scripts on production. Compare the project's applied migration history and reconcile the schema first.

The new hardening migration is additive and does not delete customer bookings. Its tests use a minimal pre-existing schema fixture; they do not validate the complete hosted schema.

Review existing active bookings for overlap, missing timing fields, and unsupported historical multi-day states before rollout. Existing rows are preserved. Legacy bookings without segments remain in the availability read model; later schedule/status edits must satisfy the new rules.

## Release Order

1. Pause booking writes during the coordinated backend rollout.
2. Apply `20261006_booking_capacity_segments.sql` if it is not already applied.
3. Apply `20261006032815_booking_integrity.sql` after checking the required existing tables and columns.
4. Configure the server secrets in [ENV_VARIABLES.md](ENV_VARIABLES.md), including the confirmation callback secret.
5. Deploy `create-booking`, `booking-availability`, `booking-status`, `owner-schedule`, `sanity-check`, `payment-webhook`, `send-confirmation-email`, and `deliver-snapshot` from the repository root so shared imports are included.
6. Configure the paid-booking database callback and verify the Helcim callback signature using test events.
7. Deploy the frontend and run staging checks before reopening booking writes.

The migration makes capacity segments database-managed. Old functions that separately insert segments are incompatible with the new permissions, so this must be a coordinated deployment.

Payment and database callbacks do not carry a customer Supabase JWT. Configure their gateway JWT verification appropriately; the functions independently verify the Helcim signature or callback secret. Public frontend functions continue accepting the project's public API credentials, and owner actions require the owner passcode.

## Vercel

- Root directory: `website/`
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

`website/vercel.json` routes static files first and falls back to the SPA. A configured Git integration may deploy main automatically; pushing code does not deploy Supabase migrations or functions.

## Staging Acceptance

Submit two concurrent requests for one slot: one should succeed and one should return 409 with no partial records. Check a blackout racing a booking, rescheduling, payment confirmation after hold expiry, second-day conflicts, and cancellation releasing capacity. Test via separate database connections; the embedded PostgreSQL suite is single-connection.

Verify anonymous callers cannot read customer tables, forged owner state cannot access endpoints, and email callbacks require the configured secret. Use test payment events and a test inbox. No real payments or customer emails are needed for local checks.

## Operational Boundaries

Checkout holds expire after 15 minutes. Verified payment notifications are logged and deduplicated, but payment reconciliation is manual. Before marking paid, the owner must verify the transaction and handle any expired-hold conflict. The database rejects a conflicting confirmation.

The original single-owner schedule uses a database mutex to serialize writes; this favors correctness over high write throughput. It is not a multi-detailer scheduling platform.
