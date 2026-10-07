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

The separate `signalsource-staging` project was created in the SignalSource organization using Supabase-generated reference `tkxbrroiovgcnsblmcpv`. Its baseline, safe migration allowlist, private photo bucket, and all nine Edge Functions are deployed. The existing `Detailer-Website` production project was not modified.

The existing Helcim integration is retained as a portfolio integration. Its webhook signature logic and event recording are implemented, but automatic payment-to-booking matching and live payment processing are not verified. This is an intentional limitation: no live or test Helcim access is required for portfolio completion, and no real payments are planned. Portfolio verification may mark a synthetic staging booking paid to exercise confirmation email; this does not verify payment processing. No matching workaround is implemented.

Hosted HTTP and database checks verified single-day creation, adjacent slots, overlap rejection, a concurrent same-slot race (one HTTP 200 and one 409), forged-price rejection, and blackout rejection. A 14-hour Saturday booking generated 720 minutes on Saturday and 120 minutes on Monday; Monday overlap was rejected and public availability included that segment.

Photo upload and retry both returned HTTP 200 and produced one private object/metadata row. A wrong booking capability returned 403, anonymous metadata access returned 401, and the public object URL was inaccessible. The bucket is private with a 5 MB size limit.

Confirmation email is deployed but delivery is not yet verified. Unauthenticated callbacks return 401. Staging still needs `RESEND_API_KEY`, `CONFIRMATION_WEBHOOK_SECRET`, `OWNER_PASSCODE`, and the paid-booking callback configured. Existing production Edge Function secrets are project-specific and cannot be read back using the available tools; the local CLI is not authenticated. Owner signed-photo retrieval also awaits its staging passcode.

The staging security advisor reported informational RLS-without-policy notices for server-only tables; public table access is intentionally denied. Synthetic verification records and one synthetic PNG remain in staging for inspection. No payments or customer emails were sent.

On October 6, GitHub Actions passed for `d7c980d`. Vercel marked its preview deployment `BLOCKED`; the project's published `project-7ih9x.vercel.app` URL returned HTTP 503 with `DEPLOYMENT_PAUSED`. This explains the hosting-state failure; the project was not resumed because production changes are out of scope.

## Operational Boundaries

- Single-owner passcode access is not individual accounts/MFA.
- Checkout holds expire after 15 minutes; late payments can require manual rescheduling/refund handling.
- Delivery ambiguity older than 23 hours needs review; callback retries/alerts must be configured.
- Storage object retention/cleanup must be configured; file signature checks are not malware scanning.
- Historical .playwright-mcp diagnostics remain tracked; new diagnostic output is ignored.
