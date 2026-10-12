# Architecture

## Booking and Capacity

`website/src/data/bookingPricing.ts` and `website/src/config/scheduler.ts` supply pricing and scheduling rules to both the frontend and Edge Functions. The create endpoint recomputes prices, deposit, tax, total duration, and payment destination; supplied values that disagree are rejected.

PostgreSQL serializes scheduling writes using a mutex row. Booking changes and their capacity segments commit together. Overlaps, blackouts, daily capacity overflow, and incompatible full-day reservations fail atomically. Adjacent non-overlapping reservations are allowed.

A workday runs from 08:00 to 20:00 in Pacific time. Base durations include the service buffer. Add-on durations count toward capacity. Jobs of at least ten hours reserve the full day. Deep Reset with a Large SUV/Truck exceeding twelve hours splits across two service days, skipping Sunday.

Capacity segments are the scheduling source of truth. The booking row remains the customer-facing record. Legacy rows without segments remain readable until a schedule or status update regenerates their segments. Web checkout holds expire after fifteen minutes; paid bookings and owner reservations block capacity, while test bookings do not.

## Access Boundaries

- Public availability contains timing information, not customer details.
- Owner endpoints independently verify `OWNER_PASSCODE`; hiding the frontend route is not authorization.
- Customer tables have RLS enabled and are inaccessible to anonymous clients.
- Booking status requires a per-booking confirmation token.
- Photos upload to a private bucket using the booking capability during the checkout hold. Uploads are limited to five JPEG, PNG, or WebP files, each at most 5 MB, with signature checks.
- Owner photo URLs are signed and expire after five minutes.
- Rate limiting uses atomic database quotas shared across Edge Function instances. Quota-store failure denies the request.

The shared owner passcode is a limited access model. It does not provide individual audit identities or MFA. CORS is a browser boundary, not authorization. Proxy IP headers used for quotas must be overwritten by trusted ingress.

## Payment and Email

Helcim checkout destinations are public URLs selected from validated pricing configuration. The payment webhook verifies its signature and deduplicates event IDs. Event recording does not establish automatic payment-to-booking reconciliation.

The confirmation callback authenticates `x-webhook-secret`, reads the booking from the database, and checks paid, non-test, non-cancelled state. Customer text is HTML escaped. A private ledger claims delivery with a two-minute lease, freezes the payload for retries, and records successful provider acceptance. Retries reuse a booking-specific Resend idempotency key. Ambiguity after 23 hours requires operator review.

Provider acceptance is distinct from inbox delivery. Inspect both the ledger and provider logs before manually retrying. There is no automatic retry worker.

## Verification Boundaries

PGlite tests apply the clean baseline and the explicit safe migration list in `website/tests/database/bootstrap.ts`. Native PostgreSQL tests use independent connections to exercise competing booking writes, booking-versus-blackout writes, and late payment confirmation.

Playwright tests use synthetic data and intercepted external requests. Hosted staging checks complement those tests, but neither establishes production traffic, payment volume, uptime, or delivery to customer inboxes.
