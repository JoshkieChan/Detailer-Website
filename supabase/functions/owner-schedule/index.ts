import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes, BookingError, bookingErrorResponse } from '../_shared/errorResponse.ts';
import { validateBooking, textField } from '../_shared/bookingValidation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};
const paymentStatuses = ['unpaid', 'pending_payment', 'paid', 'failed', 'cancelled'];
const ok = () => new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await checkRateLimit(getRateLimitIdentifier(req), { windowMs: 60_000, maxRequests: 30 })).allowed) return errorResponse('Too many requests.', 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  const expected = Deno.env.get('OWNER_PASSCODE');
  if (!expected || req.headers.get('x-owner-passcode') !== expected) return errorResponse('Owner passcode required.', 401, ErrorCodes.UNAUTHORIZED);
  if (req.method === 'GET') return ok();
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405, ErrorCodes.BAD_REQUEST);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Missing configuration');
    const supabase = createClient(url, key);
    const payload = await req.json().catch(() => { throw new BookingError('Invalid JSON.'); });
    if (!payload || typeof payload !== 'object') throw new BookingError('Invalid request.');
    if (payload.action === 'create_blackout') {
      // datetime-local values represent the business's Pacific wall clock, not
      // the browser's timezone. The RPC uses PostgreSQL's DST-aware conversion.
      const startAt = textField(payload.startAt, 'blackout start', 40);
      const endAt = textField(payload.endAt, 'blackout end', 40);
      const { error } = await supabase.rpc('create_booking_blackout', { starts: startAt, ends: endAt, reason: textField(payload.reason, 'reason', 1000, false) });
      if (error) throw error;
    } else if (payload.action === 'create_manual_booking') {
      const { record } = validateBooking(payload, new Date(), true);
      if (!paymentStatuses.includes(payload.paymentStatus ?? 'pending_payment') || (payload.testMode !== undefined && typeof payload.testMode !== 'boolean')) throw new BookingError('Invalid booking status.');
      // Owner price adjustments remain supported, but must be finite and nonnegative.
      const overrides: Record<string, unknown> = {};
      const fields: Record<string, string> = { calculated_price: 'calculatedPrice', base_price: 'base_price', addons_price: 'addons_price', deposit_amount: 'depositAmount', tax_amount: 'taxAmount', total_today: 'totalToday', remaining_balance: 'remainingBalance', total_amount_cents: 'totalAmountCents' };
      for (const [field, alias] of Object.entries(fields)) {
        const value = payload[field] ?? payload[alias];
        if (value !== undefined) {
          if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new BookingError('Invalid price adjustment.');
          overrides[field] = value;
        }
      }
      const { error } = await supabase.from('bookings').insert({
        ...record, ...overrides, total_amount: overrides.calculated_price ?? record.total_amount,
        booking_source: 'admin_manual', status: 'confirmed',
        payment_status: payload.paymentStatus ?? 'pending_payment', test_mode: payload.testMode ?? false,
        helcim_deposit_url: null,
      });
      if (error) throw error;
    } else if (payload.action === 'delete_event') {
      if (!['booking', 'blackout'].includes(payload.type)) throw new BookingError('Invalid event type.');
      const id = textField(payload.id, 'event ID', 36);
      const { error } = await supabase.from(payload.type === 'booking' ? 'bookings' : 'availability_blocks').delete().eq('id', id);
      if (error) throw error;
    } else if (payload.action === 'update_booking') {
      const id = textField(payload.id, 'booking ID', 36);
      if (!payload.updates || typeof payload.updates !== 'object') throw new BookingError('Updates required.');
      const updates: Record<string, unknown> = {};
      for (const field of ['payment_status', 'notes', 'start_time', 'service_date']) {
        if (field in payload.updates) updates[field] = textField(payload.updates[field], field, field === 'notes' ? 4000 : 30, field !== 'notes');
      }
      if (updates.payment_status && !paymentStatuses.includes(String(updates.payment_status))) throw new BookingError('Invalid payment status.');
      // Database triggers recompute end times and both segments, then reject
      // conflicts before committing any of these changes.
      const { error } = await supabase.from('bookings').update(updates).eq('id', id);
      if (error) throw error;
    } else {
      throw new BookingError('Unsupported owner action.');
    }
    return ok();
  } catch (error) {
    return bookingErrorResponse(error);
  }
});
