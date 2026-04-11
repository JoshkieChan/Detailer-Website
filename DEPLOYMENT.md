# Deployment (Vercel)

This repo is deployed via **Vercel**.

## Production deploy rule

- **Any push to `main` triggers a Vercel Production deployment automatically.**

No manual deploy steps should be required.

## Required Vercel project settings

In **Vercel → Project → Settings → General**:

- **Root Directory:** `website/`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## SPA routing + static assets

This is a Vite SPA. Static files are served from `website/public/`.

- Example static file: `website/public/files/life-and-money-snapshot.pdf`
- Expected production URL: `/files/life-and-money-snapshot.pdf`

To ensure static assets bypass the SPA fallback, the project uses filesystem-first routing:

- `website/vercel.json` (effective when Root Directory is `website/`)

## Custom domain DNS

For `updates.signaldatasource.com`, configure Cloudflare:

- CNAME `updates` → `cname.vercel-dns.com` (DNS only)

Then add/verify the domain in Vercel → Project → Settings → Domains.
