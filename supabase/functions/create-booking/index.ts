import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes, bookingErrorResponse, BookingError } from '../_shared/errorResponse.ts';
import { validateBooking } from '../_shared/bookingValidation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405, ErrorCodes.BAD_REQUEST);
  if (!checkRateLimit(getRateLimitIdentifier(req), { windowMs: 60_000, maxRequests: 10 }).allowed) {
    return errorResponse('Too many requests. Please try again later.', 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  }
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Configuration missing');
    const payload = await req.json().catch(() => { throw new BookingError('Invalid JSON body.'); });
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new BookingError('Invalid booking body.');
    const { record, pricing } = validateBooking(payload);
    // The database serializes schedule mutations, checks current availability, and
    // creates all capacity segments in this same transaction. A failure inserts nothing.
    const { data, error } = await createClient(url, key).from('bookings')
      .insert(record).select('id, helcim_deposit_url, confirmation_token').single();
    if (error) throw error;
    return new Response(JSON.stringify({ bookingId: data.id, confirmationToken: data.confirmation_token, helcimDepositUrl: data.helcim_deposit_url, totalToday: pricing.totalToday }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return bookingErrorResponse(error);
  }
});
