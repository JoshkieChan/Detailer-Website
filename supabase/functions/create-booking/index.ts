import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  bookingPackages,
  calculateBookingFinancials,
  isBookingPackageId,
  isLocationType,
  isVehicleTypeId,
  locationTypeLabels,
  vehicleTypeLabels,
} from '../../../website/src/data/bookingPricing.ts';
import {
  getServiceDuration,
  getTotalDuration,
  type VehicleTypeId as SchedulerVehicleTypeId,
  type SlotBookingPackageId,
  type AddOnId,
} from '../../../website/src/config/scheduler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    console.log('--- create-booking payload received ---', {
      timestamp: new Date().toISOString(),
      payloadKeys: Object.keys(payload),
      serviceDate: payload.service_date || payload.serviceDate,
      startTime: payload.start_time || payload.startTime,
    });

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
      endTime,
      end_time,
      blockedUntil,
      blocked_until,
      serviceDurationMinutes,
      service_duration_minutes,
      bufferMinutes: payloadBufferMinutes,
      totalAmountCents,
      total_amount_cents,
      calculated_price,
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
    const finalEndTime = (end_time || endTime)?.toString().trim();
    const payloadServiceDurationMinutes = Number(service_duration_minutes || serviceDurationMinutes);
    const finalBlockedUntil = (blocked_until || blockedUntil)?.toString().trim();
    const finalFullName = (full_name || fullName)?.toString().trim();
    const finalPackageId = (package_id || packageId)?.toString().trim();
    const finalVehicleType = (vehicle_type || vehicleType)?.toString().trim();
    const finalLocationType = (location_type || locationType)?.toString().trim();
    const rawSelectedAddOns = (selected_addons || selectedAddOns || []) as AddOnId[];

    // Validate add-on IDs
    const validAddOnIds: AddOnId[] = ['paintProtection', 'petHairRemoval', 'engineBay', 'headlightRestoration'];
    const finalSelectedAddOns: AddOnId[] = rawSelectedAddOns.filter((id: string) => validAddOnIds.includes(id as AddOnId)) as AddOnId[];

    if (!finalFullName || !phone || !email || !finalServiceDate || !finalStartTime) {
      console.error('CRITICAL: Missing required booking fields', {
        finalFullName: !!finalFullName,
        phone: !!phone,
        email: !!email,
        finalServiceDate: !!finalServiceDate,
        finalStartTime: !!finalStartTime,
        rawPayload: payload,
      });
      throw new Error(`Missing required timing fields. Received Date: [${finalServiceDate}], Time: [${finalStartTime}]`);
    }

    if (!isBookingPackageId(finalPackageId) || !isVehicleTypeId(finalVehicleType) || !isLocationType(finalLocationType)) {
      throw new Error(`Invalid selection: ${finalPackageId}, ${finalVehicleType}, ${finalLocationType}`);
    }

    const pricing = calculateBookingFinancials({
      packageId: finalPackageId,
      vehicleType: finalVehicleType,
      locationType: finalLocationType,
    });

    // Calculate total duration (base + add-ons) using new model
    const calculatedTotalDuration = getTotalDuration({
      packageId: finalPackageId as SlotBookingPackageId,
      vehicleType: finalVehicleType as SchedulerVehicleTypeId,
      selectedAddOns: finalSelectedAddOns,
    });

    // Use calculated duration if not provided in payload
    const finalServiceDurationMinutes = payloadServiceDurationMinutes || calculatedTotalDuration;
    const finalBufferMinutes = payloadBufferMinutes || 60;

    // Use values from payload if they exist, otherwise use calculated values
    const finalDepositAmount = deposit_amount ?? pricing.depositAmount;
    const finalTotalToday = total_today ?? pricing.totalToday;
    const finalHelcimUrl = helcim_deposit_url || pricing.helcimLink.url;

    if (Math.abs(finalTotalToday - pricing.helcimLink.amount) > 0.01) {
      console.error('Helcim amount mismatch', {
        packageId: finalPackageId,
        calculated: pricing.totalToday,
        received: finalTotalToday,
      });
      throw new Error('Deposit amount mismatch. Please try refreshing the page.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    console.log('Attempting database insert', { service_date: finalServiceDate, start_time: finalStartTime });

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
          end_time: finalEndTime,
          service_time: finalStartTime,
          blocked_until: finalBlockedUntil,
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
          calculated_price: calculated_price ?? pricing.subtotal,
          total_amount: calculated_price ?? pricing.subtotal,
          deposit_amount: finalDepositAmount,
          tax_amount: tax_amount ?? pricing.taxAmount,
          total_today: finalTotalToday,
          remaining_balance: remaining_balance ?? pricing.remainingBalance,
          helcim_deposit_url: finalHelcimUrl,
          booking_source: payload.booking_source || 'web',
          payment_status: payload.payment_status || 'pending_payment',
          total_amount_cents:
            total_amount_cents || totalAmountCents || Math.round(finalTotalToday * 100),
          status: 'pending',
        },
      ])
      .select('id, helcim_deposit_url')
      .single();

    if (insertError) {
      console.error('create-booking insert failed', {
        error: insertError,
        insertedRow: {
          full_name: finalFullName,
          service_date: finalServiceDate,
          start_time: finalStartTime,
          package_id: finalPackageId,
        },
      });
      throw new Error(`Database Error: ${insertError.message}`);
    }

    // Log capacity events for observability
    const FULL_DAY_THRESHOLD_MINUTES = 600; // 10 hours
    const DAILY_MAX_MINUTES = 720; // 12 hours

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
        day_2_date: null,
      });
      console.log('Logged full-day promotion event', { booking_id: insertResult.id, total_duration_minutes: calculatedTotalDuration });
    }

    // Log multi-day booking event (Deep Reset + Large SUV/Truck > 12h)
    if (
      finalPackageId === 'deepReset' &&
      finalVehicleType === 'largeSuvTruck' &&
      calculatedTotalDuration > DAILY_MAX_MINUTES
    ) {
      // For now, log as single-day since multi-day split logic is not yet implemented in create-booking
      // This will be updated when multi-day allocation is added
      await supabase.from('booking_capacity_events').insert({
        booking_id: insertResult.id,
        event_type: 'multi_day_booking',
        package: finalPackageId,
        vehicle_size: finalVehicleType,
        selected_addons: finalSelectedAddOns,
        total_duration_minutes: calculatedTotalDuration,
        day_1_date: finalServiceDate,
        day_2_date: null, // Will be populated when multi-day split is implemented
      });
      console.log('Logged multi-day booking event', { booking_id: insertResult.id, total_duration_minutes: calculatedTotalDuration });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown booking error.';
    console.error('CRITICAL create-booking error:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

