# Environment Configuration

## Frontend

Create `website/.env.local` from `website/.env.example`.

| Variable | Purpose |
| --- | --- |
| VITE_SUPABASE_URL | Public Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Public anonymous API key, never the service-role key |

Every Vite-prefixed value is public. There is no site-password gate. Remove obsolete `VITE_SITE_PASSWORD` or `VITE_OWNER_PASSWORD` deployment settings; rotate any real password previously placed there if reused elsewhere.

## Supabase Edge Function Secrets

| Variable | Used By |
| --- | --- |
| SUPABASE_URL | Supabase-provided project URL |
| SUPABASE_SERVICE_ROLE_KEY | Server-only database access |
| OWNER_PASSCODE | Owner schedule, owner availability, sanity check |
| HELCIM_VERIFIER_TOKEN | Payment webhook HMAC verification |
| RESEND_API_KEY | Confirmation and Snapshot emails |
| CONFIRMATION_WEBHOOK_SECRET | Database callback authentication via x-webhook-secret |
| CONFIRMATION_FROM_EMAIL | Verified Resend sender; defaults to Resend's development sender |
| SNAPSHOT_FROM_EMAIL | Snapshot email sender |
| SNAPSHOT_PDF_URL | Snapshot download URL |

Configure a Supabase database webhook for paid booking changes to call `send-confirmation-email` with `x-webhook-secret`. It looks up the record by ID, verifies paid/non-test status, and uses a durable delivery ledger plus a Resend idempotency key. Ambiguous attempts older than 23 hours require review. Staging checks can use a synthetic booking marked paid; no Helcim payment access is required.

Hosted Helcim deposit URLs in the pricing configuration are public checkout destinations, not API secrets. The create endpoint selects them from the validated package and vehicle.

The production CORS origin is `https://signaldatasource.com`. For local backend development, configure a local origin in the function CORS headers; CORS is not authorization. Browser tests mock the API and require no secrets.

Do not commit environment files or log credentials. The database-backed rate limiter shares quotas across instances and depends on trusted proxy IP headers.
