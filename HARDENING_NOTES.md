# Hardening Verification and Release Notes

## Scope

The hardening pass preserves the existing routes, visual design, pricing model, hosted checkout, and owner tools. PostgreSQL now manages capacity segments and serializes scheduling writes; public clients cannot write payment status or select a payment destination.

## Verification

- 33 Vitest tests: pricing, scheduling, request validation, webhook signatures, and seven actual PostgreSQL migration/transaction tests.
- Three Playwright scenarios: add-ons/submission, conflict feedback, and unavailable controls.
- TypeScript/Vite build, ESLint with recommended rules enabled, and Deno checks for all eight Edge Functions.
- No live customer payment, transactional email, or production database mutation was used.

Google Drive rejected package extraction on the original checkout. Final dependency-install checks ran from a matching temporary local-disk copy using the committed npm lockfile. Use a normal local checkout if Google Drive also rejects your npm installation.

## Security Findings

Removed the unused client-side password curtain and deprecated secret-like frontend configuration. Public requests now reject forged status, financial, timing, add-on, and redirect fields. Confirmation email calls require a separate server secret, reload the booking from PostgreSQL, escape customer HTML, and check provider failures.

Owner actions still verify the server passcode on every request; browser session state alone grants no backend access. The shared passcode remains in sessionStorage while owner tools are in use, so XSS prevention and trusted devices still matter.

No real private credential was identified by the tracked-file credential-pattern scan. Hosted payment links are public destinations. Remove obsolete VITE password settings from deployments and rotate any real password previously exposed there if reused. No credentials were rotated.

## Remaining Boundaries

- Production rollout and hosted, multi-connection concurrency testing are pending. PGlite exercises PostgreSQL logic on one connection.
- Helcim event logging is implemented; automatic payment-to-booking reconciliation is not. Manual verification is required before marking paid. A payment arriving after an expired hold may require rescheduling or refund handling.
- Existing database data must be reviewed before migration. The historical migration chain lacks a clean baseline and contains old destructive cleanup scripts; see DEPLOYMENT.md.
- Rate limits are per instance, and callback email deduplication depends on Resend's retention window.
- Photo selection is local-only, and the public availability response scans roughly one year. The database remains authoritative for submissions outside that displayed range.
- Compatible dependency security fixes were applied. npm audit still reports three development-tool findings involving Vitest/@vitest/mocker/tinypool (one moderate and two critical package findings). Do not expose a Vitest development server to untrusted callers. Resolving these requires a separately verified major testing-tool upgrade. Production dependency audit reports no known findings.
- Historical .playwright-mcp diagnostic files remain tracked; new diagnostic output is ignored. They were not removed as part of this pass.
