# Environment Variables Documentation

This document lists all environment variables required for the SignalSource Car Detailing website and backend.

## Frontend (Vite/React)

Located in `website/.env.local` (not committed to git)

### Required for Production
- `VITE_SUPABASE_URL` - Supabase project URL (e.g., `https://xxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key for client-side access

### Optional
- `VITE_OWNER_PASSWORD` - Owner passcode for owner tools (deprecated, use OWNER_PASSCODE instead)

## Backend (Supabase Edge Functions)

Located in Supabase project settings under Edge Functions > Environment Variables

### Required for All Edge Functions
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (full admin access)

### Required for Owner Tools
- `OWNER_PASSCODE` - Passcode required to access owner schedule and management tools

## Edge Functions

### create-booking
- **Purpose**: Creates new booking records and generates payment links
- **Rate Limit**: 10 requests per minute per IP
- **Required**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### owner-schedule
- **Purpose**: Owner schedule management, blackout periods, manual bookings
- **Rate Limit**: 30 requests per minute per IP
- **Required**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_PASSCODE`
- **Authentication**: Requires `x-owner-passcode` header matching `OWNER_PASSCODE`

### booking-availability
- **Purpose**: Fetches available time slots for booking
- **Rate Limit**: 60 requests per minute per IP
- **Required**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Optional**: `OWNER_PASSCODE` (for owner mode access)

## Local Development

### Frontend
1. Copy `website/.env.local.example` to `website/.env.local`
2. Fill in your Supabase project URL and anon key
3. Run `npm run dev` from the `website/` directory

### Backend (Supabase Local)
1. Run `supabase start` from the project root
2. Environment variables are automatically loaded from `.env.local` in the project root
3. Edge Functions will be available at `http://localhost:54321/functions/v1/`

## Production Deployment

### Vercel (Frontend)
1. Go to Vercel Project Settings > Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy to apply changes

### Supabase (Edge Functions)
1. Go to Supabase Dashboard > Edge Functions > Environment Variables
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `OWNER_PASSCODE`
3. Functions will automatically pick up the new variables

## Security Notes

- **Never commit** `.env.local` files to version control
- **Service role key** should only be used in Edge Functions, never in frontend code
- **Owner passcode** should be a strong, unique password
- **CORS** is restricted to `https://signaldatasource.com` in production
- **Rate limiting** is implemented on all Edge Functions to prevent abuse

## Rate Limits

| Function | Requests per Minute | Purpose |
|----------|---------------------|---------|
| create-booking | 10 | Booking creation |
| owner-schedule | 30 | Owner management tools |
| booking-availability | 60 | Availability checks |

## Troubleshooting

### Frontend: Supabase client initialization fails
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- Ensure variables are prefixed with `VITE_` for Vite to recognize them

### Backend: Edge Function returns 401 Unauthorized
- Verify `OWNER_PASSCODE` is set in Supabase Edge Functions environment variables
- Check that the `x-owner-passcode` header is being sent from the frontend

### Backend: Edge Function returns 429 Too Many Requests
- Rate limit has been exceeded. Wait before retrying
- Check rate limit configuration in the function code
