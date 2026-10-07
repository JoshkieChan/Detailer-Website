import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  getNextAvailableOpening,
  isDateUnavailable,
  type ScheduledInterval,
  type SlotBookingPackageId,
  type VehicleTypeId,
  type AddOnId,
} from '../../../website/src/config/scheduler.ts';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, bookingErrorResponse, BookingError, ErrorCodes } from '../_shared/errorResponse.ts';
import { parseAddOns } from '../_shared/bookingValidation.ts';
import { isBookingPackageId, isVehicleTypeId } from '../../../website/src/data/bookingPricing.ts';
import { buildIntervalsByDate } from '../_shared/bookingCapacity.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};

const getOwnerPasscodeEnv = () => Deno.env.get('OWNER_PASSCODE') || '';

const verifyOwnerPasscode = (req: Request) => {
  const passcode = req.headers.get('x-owner-passcode') || '';
  const expected = getOwnerPasscodeEnv();
  return Boolean(expected) && passcode === expected;
};

const pacificDateString = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

const toDateString = (iso: string) => pacificDateString(new Date(iso));
const toTimeString = (iso: string) => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(new Date(iso));

const blackoutDays = (start: string, end: string) => {
  const days: Array<{ date: string; start: string; end: string }> = [];
  const first = toDateString(start);
  const last = toDateString(end);
  const cursor = new Date(first + 'T12:00:00Z');
  while (cursor.toISOString().slice(0, 10) <= last && days.length <= 366) {
    const date = cursor.toISOString().slice(0, 10);
    const endTime = date === last ? toTimeString(end) : '24:00';
    if (endTime !== '00:00') days.push({ date, start: date === first ? toTimeString(start) : '00:00', end: endTime });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 60 requests per minute per IP (higher for availability checks)
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = await checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const url = new URL(req.url);
    const packageId = url.searchParams.get('packageId') || 'maintenance';
    const vehicleType = url.searchParams.get('vehicleType') || 'sedan';
    const selectedAddOnsParam = url.searchParams.get('selectedAddOns') || '';
    const ownerMode = url.searchParams.get('owner') === 'true';
    const requestedMonth = url.searchParams.get('month');
    if (requestedMonth && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(requestedMonth)) throw new BookingError('Invalid calendar month.');

    // Validate packageId
    if (!isBookingPackageId(packageId)) {
      throw new Error('Invalid package ID. Must be maintenance or deepReset.');
    }

    // Validate vehicleType
    if (!isVehicleTypeId(vehicleType)) {
      throw new Error('Invalid vehicle type. Must be sedan, smallSuv, or largeSuvTruck.');
    }

    // Validate selectedAddOns
    const rawSelectedAddOns = selectedAddOnsParam ? selectedAddOnsParam.split(',').map((s) => s.trim()) : [];
    const selectedAddOns = parseAddOns(rawSelectedAddOns);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (ownerMode) {
      if (!verifyOwnerPasscode(req)) {
        return new Response(JSON.stringify({ error: 'Owner passcode required.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      const [{ data: bookings, error: bookingsError }, { data: blocks, error: blocksError }] =
        await Promise.all([
          supabase
            .from('bookings')
            .select(
              'id, full_name, phone, email, package, package_id, vehicle_info, vehicle_type, service_date, start_time, end_time, blocked_until, location_type, notes, payment_status, booking_source, calculated_price, deposit_amount, remaining_balance, test_mode, booking_capacity_segments(segment_date, start_time, end_time, blocked_until, segment_index)'
            )
            .order('service_date', { ascending: true })
            .order('start_time', { ascending: true }),
          supabase
            .from('availability_blocks')
            .select('id, start_at, end_at, reason, source')
            .order('start_at', { ascending: true }),
        ]);

      if (bookingsError) throw bookingsError;
      if (blocksError) throw blocksError;

      const events = [
        ...(bookings || []).flatMap((booking) => {
          const segments: Array<{ segment_date: string; start_time: string; end_time: string; blocked_until: string; segment_index: number }> = booking.booking_capacity_segments?.length ? booking.booking_capacity_segments : [{
            segment_date: booking.service_date, start_time: booking.start_time, end_time: booking.end_time, blocked_until: booking.blocked_until, segment_index: 1,
          }];
          return segments.map((segment) => ({
          id: booking.id,
          eventType: 'booking',
          date: segment.segment_date,
          startTime: segment.start_time,
          endTime: segment.end_time,
          blockedUntil: segment.blocked_until || segment.end_time,
          segmentIndex: segment.segment_index,
          bookingStartTime: booking.start_time,
          title: `${booking.full_name} — ${booking.package}`,
          details: [booking.notes || 'No notes'],
          paymentStatus: booking.payment_status || null,
          customerName: booking.full_name || '',
          phone: booking.phone || '',
          email: booking.email || '',
          packageLabel: booking.package || '',
          packageId: booking.package_id || '',
          vehicleInfo: booking.vehicle_info || '',
          vehicleType: booking.vehicle_type || '',
          locationType: booking.location_type || '',
          bookingSource: booking.booking_source || 'web',
          notes: booking.notes || '',
          calculatedPrice: Number(booking.calculated_price ?? 0),
          depositAmount: Number(booking.deposit_amount ?? 0),
          remainingBalance: Number(booking.remaining_balance ?? 0),
          testMode: booking.test_mode || false,
        })); }),
        ...(blocks || []).flatMap((block) => blackoutDays(block.start_at, block.end_at).map(day => ({
          id: block.id,
          eventType: 'blackout',
          date: day.date,
          startTime: day.start,
          endTime: day.end,
          blockedUntil: day.end,
          title: `Blackout block — ${block.reason || 'Owner block'}`,
          details: [block.source || 'owner_manual'],
          paymentStatus: null,
          reason: block.reason || '',
          source: block.source || 'owner_manual',
        }))),
      ];

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const now = new Date();
    const scanDates: string[] = [];
    const scanStart = new Date(pacificDateString(now) + 'T12:00:00Z');
    for (let dayOffset = 0; dayOffset < 367; dayOffset += 1) {
      const current = new Date(scanStart);
      current.setDate(scanStart.getDate() + dayOffset);
      scanDates.push(current.toISOString().slice(0, 10));
    }

    if (requestedMonth) {
      const monthStart = new Date(requestedMonth + '-01T12:00:00Z');
      // Include the next service day for bookings spanning Saturday to Monday.
      for (let offset = 0; offset < 34; offset++) {
        const date = new Date(monthStart);
        date.setUTCDate(date.getUTCDate() + offset);
        scanDates.push(date.toISOString().slice(0, 10));
      }
    }
    const intervalsByDate: Record<string, ScheduledInterval[]> = await buildIntervalsByDate(supabase, [...new Set(scanDates)]);

    const allIntervals = Object.values(intervalsByDate).flat();
    const unavailableDates = Object.keys(intervalsByDate).filter((date) =>
      isDateUnavailable({
        date,
        packageId,
        intervals: allIntervals,
        now,
        vehicleType,
        selectedAddOns,
      })
    );

    // Explicitly check today (Pacific calendar day, consistent with isDateUnavailable)
    const todayStr = pacificDateString(now);
    if (!unavailableDates.includes(todayStr)) {
      if (isDateUnavailable({ date: todayStr, packageId, intervals: allIntervals, now, vehicleType, selectedAddOns })) {
        unavailableDates.push(todayStr);
      }
    }

    const nextAvailableOpening = getNextAvailableOpening({
      fromDate: now,
      packageId,
      intervals: allIntervals,
      vehicleType,
      selectedAddOns,
    });

    return new Response(
      JSON.stringify({
        unavailableDates,
        intervalsByDate,
        nextAvailableOpening,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    return bookingErrorResponse(error);
  }
});
