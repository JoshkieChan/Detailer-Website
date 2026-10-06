import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, bookingErrorResponse, BookingError } from '../_shared/errorResponse.ts';
import { intervalsOverlap, timeToMinutes } from '../../../website/src/config/scheduler.ts';
const headers = { 'Access-Control-Allow-Origin': 'https://signaldatasource.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode', 'Content-Type': 'application/json' };
interface CapacityRow { booking_id: string | null; segment_date: string; start_time: string; blocked_until: string; duration_minutes: number; source: string }
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (!(await checkRateLimit(getRateLimitIdentifier(req), { windowMs: 60_000, maxRequests: 20 })).allowed) return errorResponse('Too many requests.', 429);
  const expected = Deno.env.get('OWNER_PASSCODE');
  if (!expected || req.headers.get('x-owner-passcode') !== expected) return errorResponse('Owner passcode required.', 401);
  try {
    const url = new URL(req.url);
    const start = new Date((url.searchParams.get('startDate') || '') + 'T12:00:00Z');
    const end = new Date((url.searchParams.get('endDate') || '') + 'T12:00:00Z');
    const days = (end.getTime() - start.getTime()) / 86400000;
    if (!Number.isFinite(days) || days < 0 || days > 366) throw new BookingError('Choose a valid date range of at most one year.');
    const dates = Array.from({ length: days + 1 }, (_, offset) => new Date(start.getTime() + offset * 86400000).toISOString().slice(0, 10));
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data, error } = await supabase.rpc('booking_capacity_intervals', { dates });
    if (error) throw error;
    const rows = (data || []) as CapacityRow[];
    const violations: Array<{ date: string; booking_ids: string[]; type: string; description: string }> = [];
    for (const date of dates) {
      const windows = rows.filter(row => row.segment_date === date);
      const bookings = windows.filter(row => row.source === 'booking');
      if (!bookings.length) continue;
      const ids = bookings.map(row => row.booking_id!).filter(Boolean);
      if (windows.reduce((sum, row) => sum + row.duration_minutes, 0) > 720 || (windows.length > 1 && windows.some(row => row.duration_minutes >= 600))) {
        violations.push({ date, booking_ids: ids, type: 'over_capacity', description: 'Daily capacity or full-day exclusivity exceeded.' });
      }
      for (let i = 0; i < windows.length; i++) for (let j = i + 1; j < windows.length; j++) {
        const a = windows[i]; const b = windows[j];
        if ((a.source === 'booking' || b.source === 'booking') && intervalsOverlap(timeToMinutes(a.start_time), timeToMinutes(a.blocked_until), timeToMinutes(b.start_time), timeToMinutes(b.blocked_until))) {
          violations.push({ date, booking_ids: [a.booking_id, b.booking_id].filter((id): id is string => id !== null), type: 'overlap', description: 'Booking overlaps reserved time or blackout.' });
        }
      }
    }
    return new Response(JSON.stringify({ status: violations.length ? 'error' : 'ok', violations, message: violations.length ? 'Schedule conflicts found.' : 'No capacity violations found for this range.' }), { headers });
  } catch (error) { return bookingErrorResponse(error); }
});
