# SignalSource

A full-stack booking and operations application built around a car-detailing business in Oak Harbor, Washington. Customers configure a service and request an appointment; owner tools manage the schedule, payment status, and blackout periods.

## Key Features

- Responsive service, pricing, gallery, FAQ, and booking pages with light/dark themes.
- Vehicle/package/location pricing, optional add-ons, and hosted Helcim deposit checkout.
- Pacific-time availability, service buffers, daily capacity, and owner-created bookings.
- Two-day allocation for Deep Reset + Large SUV/Truck jobs exceeding 12 hours, skipping Sunday.
- Owner schedule and blackout management, signed payment-event logging, and paid-booking confirmation emails.
- SEO metadata, Vercel Analytics, and Speed Insights.

## Architecture

React/TypeScript on Vercel calls Supabase Edge Functions (Deno). Functions validate inputs and financial values before writing to PostgreSQL. PostgreSQL triggers serialize schedule changes, allocate capacity segments, and reject conflicts in the same transaction. Helcim hosts payment checkout; Resend delivers emails.

Public availability uses the same database read model as conflict enforcement. Owner endpoints independently verify a server-held passcode. Customer tables are inaccessible to anonymous clients; booking status requires a per-booking confirmation token.

## Tech Stack

React 19, TypeScript, Vite, React Router, Supabase/PostgreSQL, Deno Edge Functions, Helcim, Resend, Vercel, ESLint, Vitest, Playwright, and PGlite for isolated PostgreSQL tests.

## Engineering Highlights

- Server-derived prices, deposit, tax, duration, buffer, and payment destination; forged financial and status fields are rejected.
- Atomic booking/segment writes and rescheduling, with rollback on overlap, blackout, full-day, or daily-capacity violations.
- A database mutex serializes the low-volume, single-detailer schedule. Expired web checkout holds release capacity; later payment confirmation must pass availability checks again.
- HMAC verification and event-ID deduplication for Helcim notifications.
- Authenticated confirmation-email callbacks read booking details from the database and escape HTML.
- Structured booking conflicts return HTTP 409 and refresh frontend availability.

## Local Development

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
cd website
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your development Supabase project. These are public configuration values. Never put service-role keys, owner passcodes, or webhook secrets in a `VITE_*` variable. See [environment configuration](ENV_VARIABLES.md).

The backend setup and safe migration allowlist are described in [deployment notes](DEPLOYMENT.md). A clean-install baseline is provided in `supabase/bootstrap/base.sql`; never apply it over customer data or blindly replay historical cleanup scripts. Unit and database tests run without a Supabase account.

## Testing

```sh
cd website
npm test
npm run test:db
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
```

Vitest covers pricing, scheduling, validation, webhook signatures, and actual SQL migration behavior using an isolated PGlite database. Database tests cover rollback, segment regeneration, expiring holds, second-day conflicts, blackouts, and role permissions. Playwright uses a fixed clock and mocked API/payment responses; it does not charge cards or send emails.

Independent-connection races are tested with `npm run test:concurrency` against an empty local PostgreSQL database named `signalsource_test` using `TEST_DATABASE_URL` (Node 24). CI supplies PostgreSQL 17. A local native PostgreSQL 18 run passed overlapping inserts, booking/blackout races, and expired-hold payment races. Hosted integration verification remains a release check.

## Deployment

Vercel serves `website/dist` with SPA routing. Supabase hosts the database and Edge Functions. Database migrations and function deployments are separate from frontend deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for required ordering and configuration. This repository does not establish whether a public deployment is currently active.

## Project Status

This is a portfolio/full-stack application with a real business workflow and explicit operational boundaries:

- Web checkout holds last 15 minutes. Paid bookings and non-cancelled owner reservations block capacity; test bookings do not.
- The payment webhook records verified events. Automatic transaction-to-booking reconciliation is **not implemented**. The owner verifies payment in Helcim and updates booking status. A paid customer whose hold expired may need manual rescheduling or refund handling if the slot was taken.
- Multi-day support is exactly two service days for the eligible package/vehicle combination, not a general multi-resource scheduling engine.
- Owner access uses a shared server-verified passcode stored in the browser session, not individual accounts/MFA.
- Rate limiting uses atomic database-backed quotas shared across Edge Function instances and fails closed when the quota store is unavailable.
- Booking photos upload to a private bucket with per-booking capabilities; owner-only signed links expire after five minutes.
- Confirmation-email delivery uses a durable ledger, short delivery leases, and provider idempotency. Ambiguous attempts older than 23 hours require manual review.

## Author

Joshua Caburian · [GitHub](https://github.com/JoshkieChan)
