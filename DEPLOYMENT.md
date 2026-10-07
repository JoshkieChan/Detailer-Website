# Deployment

## Current Staging

- Project: `signalsource-staging`, organization: SignalSource.
- Supabase-generated reference: `tkxbrroiovgcnsblmcpv`.
- Dashboard: https://supabase.com/dashboard/project/tkxbrroiovgcnsblmcpv
- Baseline/hardening migrations, private photo bucket, and all nine Edge Functions are deployed.
- Hosted booking, capacity/overlap, blackout, concurrent-create, and photo-upload checks passed. See HARDENING_NOTES.md for the evidence and remaining email/owner-secret setup.
- Production `Detailer-Website` remains unchanged.

## Before Applying Database Changes

Use a staging project and backup first. The checked-in migration history starts after the original bookings table was created, includes repeated date-only versions, and contains historical cleanup scripts that delete bookings. Do not run a blanket `db push` or replay those scripts on production. Compare the project's applied migration history and reconcile the schema first.

The new hardening migrations are additive and do not delete customer bookings. Tests apply the clean baseline and safe migration allowlist in `website/tests/database/bootstrap.ts`, rather than a hand-written partial fixture. Storage provisioning is separate because plain PostgreSQL does not include Supabase Storage.

Read-only inspection on October 6 found the connected Detailer-Website project missing the April 26 price/add-on/test-mode columns. Apply the four additive April 26 migrations listed in the allowlist before the October migrations. Do not assume the repository migration history matches the hosted database.

For an EMPTY local or staging database only, start with `supabase/bootstrap/base.sql`, then apply the ordered migration filenames in `website/tests/database/bootstrap.ts`. Existing customer databases must retain their existing base schema and foreign keys. The baseline intentionally does not recreate the unused legacy customers integration.

Review existing active bookings for overlap, missing timing fields, and unsupported historical multi-day states before rollout. Existing rows are preserved. Legacy bookings without segments remain in the availability read model; later schedule/status edits must satisfy the new rules.

## Release Order

1. Pause booking writes during the coordinated backend rollout.
2. Apply `20261006_booking_capacity_segments.sql` if it is not already applied.
3. Apply `20261006032815_booking_integrity.sql` after checking the required existing tables and columns.
   Then apply `20261006134023_operational_completion.sql` and `supabase/bootstrap/storage.sql` to provision quotas, the email ledger, private photo metadata, and the private bucket.
4. Configure the server secrets in [ENV_VARIABLES.md](ENV_VARIABLES.md), including the confirmation callback secret.
5. Deploy `create-booking`, `booking-availability`, `booking-status`, `booking-photos`, `owner-schedule`, `sanity-check`, `payment-webhook`, `send-confirmation-email`, and `deliver-snapshot` from the repository root so shared imports are included.
6. Configure the paid-booking database callback. For portfolio staging, verify confirmation email using a synthetic booking marked paid without making a payment. Helcim live/test access is not a portfolio prerequisite; automatic payment matching remains intentionally unverified.
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

Submit two concurrent HTTP requests for one slot: one should succeed and one should return 409 with no partial records. Check a blackout racing a booking, rescheduling, payment confirmation after hold expiry, second-day conflicts, and cancellation releasing capacity. Local independent-connection PostgreSQL race tests pass; hosted HTTP/integration checks are still required.

Verify anonymous callers cannot read customer tables, forged owner state cannot access endpoints, and email callbacks require the configured secret. Use a synthetic staging booking and a controlled test inbox or the email provider's test recipient. Do not follow the hosted checkout link or make a payment.

## Operational Boundaries

Checkout holds expire after 15 minutes. Verified payment notifications are logged and deduplicated, but payment reconciliation is manual. Before marking paid, the owner must verify the transaction and handle any expired-hold conflict. The database rejects a conflicting confirmation.

The portfolio does not accept real payments. Retaining the existing Helcim integration does not imply verified automatic payment matching. Synthetic staging status changes verify the booking/email flow only.

The original single-owner schedule uses a database mutex to serialize writes; this favors correctness over high write throughput. It is not a multi-detailer scheduling platform.

Rate quotas depend on trusted ingress IP headers being overwritten by the gateway. Confirm this before rollout. All functions now require the quota RPC; deploy the operational migration first or requests fail closed.

Photos are limited to five JPEG/PNG/WebP files of 5 MB each, checked by MIME type and file signature. Uploads require the booking token and an unexpired checkout hold. Owner links are private and short-lived. This is not malware scanning or image transcoding. Database deletion does not delete Storage objects; remove abandoned/deleted-booking objects under the bucket retention policy using the Storage API, not SQL deletion from storage.objects.

Email callbacks persist the original payload and reuse the same Resend idempotency key during retries. Success remains recorded after provider key expiry. Leases last two minutes; ambiguous attempts older than 23 hours return 503 for operator review. Inspect `booking_private.email_deliveries` and provider delivery logs before any manual resend. There is no background retry worker; configure callback retries/alerts. [Resend retains idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys).
