import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, bookingErrorResponse } from '../_shared/errorResponse.ts';
const headers = { 'Access-Control-Allow-Origin': 'https://signaldatasource.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' };
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405);
  if (!(await checkRateLimit(getRateLimitIdentifier(req), { windowMs: 60_000, maxRequests: 30 })).allowed) return errorResponse('Too many requests.', 429);
  try {
    const { bookingId, token } = await req.json();
    if (typeof bookingId !== 'string' || typeof token !== 'string') return errorResponse('Booking access required.', 401);
    const { data, error } = await createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
      .from('bookings').select('package_id, package, location_type, remaining_balance, total_amount, deposit_amount, service_date, service_time, vehicle_info, address, payment_status, status, booking_capacity_segments(segment_date, start_time, end_time)')
      .eq('id', bookingId).eq('confirmation_token', token).single();
    if (error || !data) return errorResponse('Booking details unavailable.', 404);
    return new Response(JSON.stringify(data), { headers: { ...headers, 'Cache-Control': 'no-store' } });
  } catch (error) { return bookingErrorResponse(error); }
});
