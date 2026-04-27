import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  getNextAvailableOpening,
  isDateUnavailable,
  type ScheduledInterval,
  type SlotBookingPackageId,
  type VehicleTypeId,
  type AddOnId,
  getTotalDuration,
} from '../../../website/src/config/scheduler.ts';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, successResponse, ErrorCodes } from '../_shared/errorResponse.ts';

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

const toDateString = (iso: string) => iso.slice(0, 10);
const toTimeString = (iso: string) => iso.slice(11, 16);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 60 requests per minute per IP (higher for availability checks)
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
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
    const packageId = url.searchParams.get('packageId') || '';
    const vehicleType = url.searchParams.get('vehicleType') || 'sedan';
    const selectedAddOnsParam = url.searchParams.get('selectedAddOns') || '';
    const ownerMode = url.searchParams.get('owner') === 'true';

    // Validate packageId
    const validPackageIds: SlotBookingPackageId[] = ['maintenance', 'deepReset'];
    if (!validPackageIds.includes(packageId as SlotBookingPackageId)) {
      throw new Error('Invalid package ID. Must be maintenance or deepReset.');
    }

    // Validate vehicleType
    const validVehicleTypes: VehicleTypeId[] = ['sedan', 'smallSuv', 'largeSuvTruck'];
    if (!validVehicleTypes.includes(vehicleType as VehicleTypeId)) {
      throw new Error('Invalid vehicle type. Must be sedan, smallSuv, or largeSuvTruck.');
    }

    // Validate selectedAddOns
    const validAddOnIds: AddOnId[] = ['paintProtection', 'petHairRemoval', 'engineBay', 'headlightRestoration'];
    const rawSelectedAddOns = selectedAddOnsParam ? selectedAddOnsParam.split(',').map((s) => s.trim()) : [];
    const selectedAddOns: AddOnId[] = rawSelectedAddOns.filter((id: string) => validAddOnIds.includes(id as AddOnId)) as AddOnId[];

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
              'id, full_name, phone, email, package, package_id, vehicle_info, vehicle_type, service_date, start_time, end_time, blocked_until, location_type, notes, payment_status, booking_source, calculated_price, deposit_amount, remaining_balance, test_mode'
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
        ...(bookings || []).map((booking) => ({
          id: booking.id,
          eventType: 'booking',
          date: booking.service_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          blockedUntil: booking.blocked_until || booking.end_time,
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
        })),
        ...(blocks || []).map((block) => ({
          id: block.id,
          eventType: 'blackout',
          date: toDateString(block.start_at),
          startTime: toTimeString(block.start_at),
          endTime: toTimeString(block.end_at),
          blockedUntil: toTimeString(block.end_at),
          title: `Blackout block — ${block.reason || 'Owner block'}`,
          details: [block.source || 'owner_manual'],
          paymentStatus: null,
          reason: block.reason || '',
          source: block.source || 'owner_manual',
        })),
      ];

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const [{ data: paidBookings, error: bookingsError }, { data: blocks, error: blocksError }] =
      await Promise.all([
        supabase
          .from('bookings')
          .select('service_date, start_time, end_time, blocked_until, payment_status, created_at, package_id, vehicle_type, selected_addons, test_mode')
          .eq('payment_status', 'paid')
          .eq('test_mode', false)
          .order('service_date', { ascending: true })
          .order('start_time', { ascending: true }),
        supabase
          .from('availability_blocks')
          .select('start_at, end_at')
          .order('start_at', { ascending: true }),
      ]);

    if (bookingsError) throw bookingsError;
    if (blocksError) throw blocksError;

    const intervalsByDate: Record<string, ScheduledInterval[]> = {};

    for (const booking of paidBookings || []) {
      if (!booking.service_date || !booking.start_time || !booking.end_time) continue;
      const selectedAddOns: AddOnId[] = booking.selected_addons || [];
      const totalDuration = getTotalDuration({
        packageId: booking.package_id as SlotBookingPackageId,
        vehicleType: booking.vehicle_type as VehicleTypeId,
        selectedAddOns,
      });

      intervalsByDate[booking.service_date] = intervalsByDate[booking.service_date] || [];
      intervalsByDate[booking.service_date].push({
        date: booking.service_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        blockedUntil: booking.blocked_until || booking.end_time,
        source: 'booking',
        paymentStatus: 'paid',
        packageId: booking.package_id as SlotBookingPackageId,
        vehicleType: booking.vehicle_type as VehicleTypeId,
        selectedAddOns,
        totalDurationMinutes: totalDuration,
      });
    }

    for (const block of blocks || []) {
      if (!block.start_at || !block.end_at) continue;
      const date = toDateString(block.start_at);
      intervalsByDate[date] = intervalsByDate[date] || [];
      intervalsByDate[date].push({
        date,
        startTime: toTimeString(block.start_at),
        endTime: toTimeString(block.end_at),
        blockedUntil: toTimeString(block.end_at),
        source: 'blackout',
      });
    }

    const now = new Date();

    const allIntervals = Object.values(intervalsByDate).flat();
    const unavailableDates = Object.keys(intervalsByDate).filter((date) =>
      isDateUnavailable({
        date,
        packageId,
        intervals: intervalsByDate[date],
        now,
        vehicleType,
        selectedAddOns,
      })
    );

    // Explicitly check today (Pacific calendar day, consistent with isDateUnavailable)
    const todayStr = pacificDateString(now);
    if (!unavailableDates.includes(todayStr)) {
      if (isDateUnavailable({ date: todayStr, packageId, intervals: intervalsByDate[todayStr] || [], now, vehicleType, selectedAddOns })) {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load availability.';
    console.error('booking-availability failed', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
