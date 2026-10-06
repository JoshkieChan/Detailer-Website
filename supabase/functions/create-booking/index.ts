import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  calculateBookingFinancials,
  isBookingPackageId,
  isLocationType,
  isVehicleTypeId,
  vehicleTypeLabels,
  bookingPackages
} from '../../../website/src/data/bookingPricing.ts';
import {
  buildBookingWindow,
  buildCapacitySegments,
  DAILY_MAX_MINUTES,
  FULL_DAY_THRESHOLD_MINUTES,
  getTotalDuration,
  validateCapacitySegments,
  type VehicleTypeId as SchedulerVehicleTypeId,
  type SlotBookingPackageId,
  type AddOnId,
} from '../../../website/src/config/scheduler.ts';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes } from '../_shared/errorResponse.ts';
import { buildIntervalsByDate } from '../_shared/bookingCapacity.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const assertMoneyMatches = (label: string, provided: unknown, expected: number) => {
  if (provided === undefined || provided === null || provided === '') return;
  const value = typeof provided === 'number' ? provided : Number.parseFloat(String(provided));
  if (!Number.isFinite(value) || Math.abs(value - expected) > 0.01) {
    throw new Error(`${label} mismatch. Please refresh and try again.`);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 10 requests per minute per IP
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), {
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

    const {
      fullName,
      full_name,
      phone,
      email,
      address,
      notes,
      packageId,
      package_id,
      vehicleType,
      vehicle_type,
      locationType,
      location_type,
      membershipIntent,
      membership_intent,
      serviceDate,
      service_date,
      startTime,
      start_time,
      serviceDurationMinutes,
      service_duration_minutes,
      bufferMinutes: payloadBufferMinutes,
      totalAmountCents,
      total_amount_cents,
      calculated_price,
      base_price,
      addons_price,
      deposit_amount,
      tax_amount,
      total_today,
      remaining_balance,
      helcim_deposit_url,
      selectedAddOns,
      selected_addons,
    } = payload;

    const finalServiceDate = (service_date || serviceDate)?.toString().trim();
    const finalStartTime = (start_time || startTime)?.toString().trim();
    const payloadServiceDurationMinutes = Number(service_duration_minutes || serviceDurationMinutes);
    const finalFullName = (full_name || fullName)?.toString().trim();
    const finalPackageId = (package_id || packageId)?.toString().trim();
    const finalVehicleType = (vehicle_type || vehicleType)?.toString().trim();
    const finalLocationType = (location_type || locationType)?.toString().trim();
    const rawSelectedAddOns = (selected_addons || selectedAddOns || []) as AddOnId[];

    // Validate add-on IDs
    const validAddOnIds: AddOnId[] = ['paintProtection', 'petHairRemoval', 'engineBay', 'headlightRestoration'];
    const finalSelectedAddOns: AddOnId[] = rawSelectedAddOns.filter((id: string) => validAddOnIds.includes(id as AddOnId)) as AddOnId[];

    if (!finalFullName || !phone || !email || !finalServiceDate || !finalStartTime) {
      return errorResponse(
        'Missing required booking fields',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!isBookingPackageId(finalPackageId) || !isVehicleTypeId(finalVehicleType) || !isLocationType(finalLocationType)) {
      throw new Error(`Invalid selection: ${finalPackageId}, ${finalVehicleType}, ${finalLocationType}`);
    }

    const pricing = calculateBookingFinancials({
      packageId: finalPackageId,
      vehicleType: finalVehicleType,
      locationType: finalLocationType,
      selectedAddOns: finalSelectedAddOns,
    });

    // Calculate total duration (base + add-ons) using new model
    const calculatedTotalDuration = getTotalDuration({
      packageId: finalPackageId as SlotBookingPackageId,
      vehicleType: finalVehicleType as SchedulerVehicleTypeId,
      selectedAddOns: finalSelectedAddOns,
    });

    const bookingWindow = buildBookingWindow({
      date: finalServiceDate,
      packageId: finalPackageId as SlotBookingPackageId,
      startTime: finalStartTime,
      vehicleType: finalVehicleType as SchedulerVehicleTypeId,
      selectedAddOns: finalSelectedAddOns,
    });
    const capacitySegments = buildCapacitySegments({
      date: finalServiceDate,
      packageId: finalPackageId as SlotBookingPackageId,
      vehicleType: finalVehicleType as SchedulerVehicleTypeId,
      selectedAddOns: finalSelectedAddOns,
      startTime: finalStartTime,
    });

    if (capacitySegments.length === 0) {
      throw new Error('Selected booking window cannot fit within service hours.');
    }

    if (payloadServiceDurationMinutes && payloadServiceDurationMinutes !== calculatedTotalDuration) {
      throw new Error('Booking duration mismatch. Please refresh availability and try again.');
    }

    const intervalsByDate = await buildIntervalsByDate(
      supabase,
      capacitySegments.map((segment) => segment.date)
    );
    const capacityCheck = validateCapacitySegments({ segments: capacitySegments, intervalsByDate });
    if (!capacityCheck.allowed) {
      throw new Error(capacityCheck.reason || 'Selected booking time is no longer available.');
    }

    const finalServiceDurationMinutes = calculatedTotalDuration;
    const finalBufferMinutes = payloadBufferMinutes || 60;

    assertMoneyMatches('Base price', base_price, pricing.basePrice);
    assertMoneyMatches('Add-ons price', addons_price, pricing.addOnsPrice);
    assertMoneyMatches('Calculated price', calculated_price, pricing.subtotal);
    assertMoneyMatches('Deposit amount', deposit_amount, pricing.depositAmount);
    assertMoneyMatches('Tax amount', tax_amount, pricing.taxAmount);
    assertMoneyMatches('Total today', total_today, pricing.totalToday);
    assertMoneyMatches('Remaining balance', remaining_balance, pricing.remainingBalance);

    const finalDepositAmount = pricing.depositAmount;
    const finalTotalToday = pricing.totalToday;
    const finalHelcimUrl = helcim_deposit_url || pricing.helcimLink.url;

    if (Math.abs(finalTotalToday - pricing.helcimLink.amount) > 0.01) {
      throw new Error('Deposit amount mismatch. Please try refreshing the page.');
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          full_name: finalFullName,
          email,
          phone,
          address: address || '',
          notes: notes || '',
          package: bookingPackages[finalPackageId].label,
          package_id: finalPackageId,
          vehicle_info: vehicleTypeLabels[finalVehicleType],
          vehicle_type: finalVehicleType,
          location_type: finalLocationType,
          service_date: finalServiceDate,
          start_time: finalStartTime,
          end_time: bookingWindow.endTime,
          service_time: finalStartTime,
          blocked_until: bookingWindow.blockedUntil,
          service_duration_minutes: finalServiceDurationMinutes,
          buffer_minutes: finalBufferMinutes,
          selected_addons: finalSelectedAddOns,
          mobile_fee_applied: finalLocationType === 'mobile',
          membership_intent:
            membership_intent === 'quarterly' ||
            membership_intent === 'monthly' ||
            membershipIntent === 'quarterly' ||
            membershipIntent === 'monthly'
              ? (membership_intent || membershipIntent)
              : 'none',
          calculated_price: pricing.subtotal,
          base_price: pricing.basePrice,
          addons_price: pricing.addOnsPrice,
          total_amount: pricing.subtotal,
          deposit_amount: finalDepositAmount,
          tax_amount: pricing.taxAmount,
          total_today: finalTotalToday,
          remaining_balance: pricing.remainingBalance,
          helcim_deposit_url: finalHelcimUrl,
          booking_source: payload.booking_source || 'web',
          payment_status: payload.payment_status || 'pending_payment',
          total_amount_cents:
            Math.round(finalTotalToday * 100),
          status: 'pending',
        },
      ])
      .select('id, helcim_deposit_url')
      .single();

    if (insertError) {
      throw new Error(`Database Error: ${insertError.message}`);
    }

    const { error: segmentsError } = await supabase.from('booking_capacity_segments').insert(
      capacitySegments.map((segment) => ({
        booking_id: insertResult.id,
        segment_date: segment.date,
        start_time: segment.startTime,
        end_time: segment.endTime,
        blocked_until: segment.blockedUntil,
        duration_minutes: segment.durationMinutes,
        segment_index: segment.segmentIndex,
      }))
    );

    if (segmentsError) {
      throw new Error(`Capacity Segment Error: ${segmentsError.message}`);
    }

    // Log full-day promotion event
    if (calculatedTotalDuration >= FULL_DAY_THRESHOLD_MINUTES && calculatedTotalDuration <= DAILY_MAX_MINUTES) {
      await supabase.from('booking_capacity_events').insert({
        booking_id: insertResult.id,
        event_type: 'full_day_promotion',
        package: finalPackageId,
        vehicle_size: finalVehicleType,
        selected_addons: finalSelectedAddOns,
        total_duration_minutes: calculatedTotalDuration,
        day_1_date: finalServiceDate,
        day_2_date: capacitySegments[1]?.date || null,
      });
    }

    // Log multi-day booking event (Deep Reset + Large SUV/Truck > 12h)
    if (
      finalPackageId === 'deepReset' &&
      finalVehicleType === 'largeSuvTruck' &&
      calculatedTotalDuration > DAILY_MAX_MINUTES
    ) {
      await supabase.from('booking_capacity_events').insert({
        booking_id: insertResult.id,
        event_type: 'multi_day_booking',
        package: finalPackageId,
        vehicle_size: finalVehicleType,
        selected_addons: finalSelectedAddOns,
        total_duration_minutes: calculatedTotalDuration,
        day_1_date: capacitySegments[0].date,
        day_2_date: capacitySegments[1]?.date || null,
      });
    }

    return new Response(
      JSON.stringify({
        bookingId: insertResult.id,
        helcimDepositUrl: insertResult.helcim_deposit_url,
        totalToday: finalTotalToday,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown booking error.';
    return errorResponse(
      message,
      400,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});

