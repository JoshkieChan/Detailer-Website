# Hardening Verification and Release Notes

## Verified Locally

- Clean baseline plus an explicit safe migration allowlist.
- Pricing, scheduling, request validation, webhook signatures, SQL rollback, role permissions, distributed quotas, and durable email-delivery claims.
- Separate native PostgreSQL connections: conflicting inserts, booking versus blackout, and expired-hold payment confirmation all reject conflicts atomically.
- Browser coverage for add-ons/submission, conflict feedback, disabled controls, photo validation, and upload retry without duplicate booking creation.
- TypeScript/Vite build, recommended ESLint rules, and Deno checks for nine Edge Functions.
- Vitest upgraded to 5; the locked development and production dependencies report zero npm audit findings.
- No live payments, customer emails, or production database mutations.

Google Drive rejected package extraction. Verification uses a matching temporary local-disk copy and the committed npm lockfile. Prefer a local-disk checkout if Google Drive rejects installation.

## Changes

Capacity segments are database-managed. Public booking validation recomputes prices and times; forged payment/status fields are rejected. Owner authorization remains server-side. Customer data is not anonymously readable.

Rate limits now use atomic database quotas. Confirmation emails use a private durable ledger, leased claims, frozen retry payloads, provider idempotency, and an explicit manual-review state after the safe retry window.

Photos upload to private Storage using a booking capability during checkout. The owner receives short-lived signed links. Retrying uploads does not create another booking. Calendar navigation fetches the displayed month, including the following service days needed for multi-day allocation, and disables selection while availability is loading.

## External Release Requirements

The only connected active detailing project is not identified as staging. Its schema is behind the repository; production was inspected read-only and left unchanged. Follow DEPLOYMENT.md rather than running a blanket db push.

Helcim events are verified and recorded, but static hosted payment links do not establish a verified per-booking transaction reference. Automatic reconciliation remains blocked on a confirmed checkout correlation contract and Helcim test credentials. Never match payments by customer name, email, or amount alone. Manual verification remains required before marking paid.

A separate staging project, coordinated migration/function rollout, private bucket provisioning, and hosted HTTP/payment/email/storage acceptance tests remain necessary. Local mocked browser tests do not prove these deployed integrations.

## Operational Boundaries

- Single-owner passcode access is not individual accounts/MFA.
- Checkout holds expire after 15 minutes; late payments can require manual rescheduling/refund handling.
- Delivery ambiguity older than 23 hours needs review; callback retries/alerts must be configured.
- Storage object retention/cleanup must be configured; file signature checks are not malware scanning.
- Historical .playwright-mcp diagnostics remain tracked; new diagnostic output is ignored.
