import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { calculateBookingFinancials, isBookingPackageId, isLocationType, isVehicleTypeId, locationTypeLabels, vehicleTypeLabels, bookingPackages } from '../../../website/src/data/bookingPricing.ts';
import { getTotalDuration, checkCapacityRules, type SlotBookingPackageId, type VehicleTypeId, type AddOnId, intervalsOverlap } from '../../../website/src/config/scheduler.ts';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, successResponse, ErrorCodes } from '../_shared/errorResponse.ts';

// Note: Relative imports from website are used because these functions/types are shared
// between the Edge Function and the website. This is acceptable for this architecture.

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};

const getExpectedPasscode = () => Deno.env.get('OWNER_PASSCODE') || '';

const isAuthorized = (req: Request) => {
  const passcode = req.headers.get('x-owner-passcode') || '';
  const expected = getExpectedPasscode();
  return Boolean(expected) && passcode === expected;
};

const pickMoney = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : Number.NaN;
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 30 requests per minute per IP (higher for owner tools)
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  if (!isAuthorized(req)) {
    return errorResponse(
      'Owner passcode required.',
      401,
      ErrorCodes.UNAUTHORIZED
    );
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const payload = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (payload.action === 'create_blackout') {
      if (!payload.startAt || !payload.endAt) {
        throw new Error('startAt and endAt are required for blackout creation.');
      }
      const { error } = await supabase.from('availability_blocks').insert([
        {
          start_at: payload.startAt,
          end_at: payload.endAt,
          reason: payload.reason || '',
          created_by: 'owner',
          source: 'owner_manual',
        },
      ]);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (payload.action === 'create_manual_booking') {
      const {
        fullName,
        email,
        phone,
        address,
        notes,
        packageId,
        vehicleType,
        locationType,
        date,
        startTime,
        endTime,
        blockedUntil,
        paymentStatus,
        serviceDurationMinutes,
        bufferMinutes,
        calculatedPrice,
        calculated_price,
        base_price,
        addons_price,
        depositAmount,
        deposit_amount,
        tax_amount,
        taxAmount,
        total_today,
        totalToday,
        remaining_balance,
        remainingBalance,
        total_amount_cents,
        totalAmountCents,
        selectedAddOns,
        testMode,
      } = payload;

      if (!fullName || !email || !phone || !packageId || !vehicleType || !locationType || !date || !startTime || !endTime) {
        throw new Error('Missing required fields for manual booking.');
      }

      if (!isBookingPackageId(packageId) || !isVehicleTypeId(vehicleType) || !isLocationType(locationType)) {
        throw new Error('Invalid manual booking selection.');
      }

      // Validate add-on IDs
      const validAddOnIds: AddOnId[] = ['paintProtection', 'petHairRemoval', 'engineBay', 'headlightRestoration'];
      const finalSelectedAddOns: AddOnId[] = (selectedAddOns || [])
        .filter((id: string) => validAddOnIds.includes(id as AddOnId))
        .map((id: string) => id as AddOnId);

      // Calculate total duration using scheduler logic
      const totalDuration = getTotalDuration({
        packageId: packageId as SlotBookingPackageId,
        vehicleType: vehicleType as VehicleTypeId,
        selectedAddOns: finalSelectedAddOns,
      });

      // Fetch existing paid bookings for capacity check (excluding test mode)
      const { data: existingBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('service_date, start_time, end_time, blocked_until, package_id, vehicle_type, selected_addons')
        .eq('payment_status', 'paid')
        .eq('test_mode', false)
        .eq('service_date', date);

      if (fetchError) throw fetchError;

      // Calculate total duration for existing bookings
      const existingBookingsWithDuration = (existingBookings || []).map((booking: {
        package_id: string;
        vehicle_type: string;
        selected_addons: string[];
      }) => ({
        totalDurationMinutes: getTotalDuration({
          packageId: booking.package_id as SlotBookingPackageId,
          vehicleType: booking.vehicle_type as VehicleTypeId,
          selectedAddOns: (booking.selected_addons || []) as AddOnId[],
        }),
      }));

      // Check capacity rules
      const capacityCheck = checkCapacityRules({
        newBookingDuration: totalDuration,
        existingBookings: existingBookingsWithDuration,
      });

      if (!capacityCheck.allowed) {
        throw new Error(capacityCheck.reason || 'Booking would violate capacity rules.');
      }

      // Check for overlap with existing bookings
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const newStartMinutes = parseTime(startTime);
      const newEndMinutes = parseTime(endTime);

      for (const booking of existingBookings || []) {
        if (!booking.start_time || !booking.end_time) continue;
        const existingStart = parseTime(booking.start_time);
        const existingEnd = parseTime(booking.end_time);
        
        if (intervalsOverlap(newStartMinutes, newEndMinutes, existingStart, existingEnd)) {
          throw new Error('Booking time overlaps with existing booking.');
        }
      }

      const pricing = calculateBookingFinancials({
        packageId,
        vehicleType,
        locationType,
      });

      const subtotal = pickMoney(calculated_price ?? calculatedPrice, pricing.subtotal);
      const deposit = pickMoney(deposit_amount ?? depositAmount, pricing.depositAmount);
      const tax = pickMoney(tax_amount ?? taxAmount, pricing.taxAmount);
      const totalTodayVal = pickMoney(total_today ?? totalToday, pricing.totalToday);
      const remaining = pickMoney(remaining_balance ?? remainingBalance, pricing.remainingBalance);
      const centsRaw = total_amount_cents ?? totalAmountCents;
      const cents =
        typeof centsRaw === 'number' && Number.isFinite(centsRaw) && centsRaw >= 0
          ? Math.round(centsRaw)
          : Math.round(totalTodayVal * 100);

      const { error } = await supabase.from('bookings').insert([
        {
          full_name: fullName,
          email,
          phone,
          address: address || '',
          notes: notes || '',
          package: bookingPackages[packageId].label,
          package_id: packageId,
          vehicle_info: vehicleTypeLabels[vehicleType],
          vehicle_type: vehicleType,
          service_date: date,
          start_time: startTime,
          end_time: endTime,
          service_time: startTime,
          blocked_until: blockedUntil,
          service_duration_minutes: totalDuration,
          buffer_minutes: bufferMinutes,
          location_type: locationType,
          mobile_fee_applied: locationType === 'mobile',
          membership_intent: 'none',
          calculated_price: subtotal,
          base_price: base_price || subtotal,
          addons_price: addons_price || 0,
          total_amount: subtotal,
          deposit_amount: deposit,
          tax_amount: tax,
          total_today: totalTodayVal,
          remaining_balance: remaining,
          helcim_deposit_url: null,
          booking_source: 'admin_manual',
          payment_status: paymentStatus || 'pending_payment',
          total_amount_cents: cents,
          status: 'confirmed',
          selected_addons: finalSelectedAddOns,
          test_mode: testMode || false,
        },
      ]);

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (payload.action === 'delete_event') {
      const { id, type } = payload;
      if (!id || !type) {
        throw new Error('Event id and type required.');
      }
      if (type !== 'booking' && type !== 'blackout') {
        throw new Error('Invalid event type. Must be "booking" or "blackout".');
      }
      
      const table = type === 'booking' ? 'bookings' : 'availability_blocks';
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }


    if (payload.action === 'update_booking') {
      const { id, updates } = payload;
      if (!id) throw new Error('Booking ID required.');

      // Only allow safe, known fields to be updated
      const allowedFields = ['payment_status', 'notes', 'start_time', 'end_time', 'service_date', 'blocked_until'];
      const safeUpdates: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in updates) safeUpdates[key] = updates[key];
      }

      const { error } = await supabase.from('bookings').update(safeUpdates).eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Unsupported owner action.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Owner schedule action failed.';
    return errorResponse(
      message,
      400,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});
