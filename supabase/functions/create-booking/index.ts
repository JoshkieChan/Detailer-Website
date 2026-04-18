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
      // Handle both camelCase and snake_case for robustness
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
      bufferMinutes,
      buffer_minutes,
      totalAmountCents,
      total_amount_cents,
      calculated_price,
      deposit_amount,
      tax_amount,
      total_today,
      remaining_balance,
      helcim_deposit_url,
    } = payload;

    const finalServiceDate = service_date || serviceDate;
    const finalStartTime = start_time || startTime;
    const finalEndTime = end_time || endTime;
    const finalServiceDurationMinutes = service_duration_minutes || serviceDurationMinutes;
    const finalBufferMinutes = buffer_minutes || bufferMinutes;
    const finalBlockedUntil = blocked_until || blockedUntil;
    const finalFullName = full_name || fullName;
    const finalPackageId = package_id || packageId;
    const finalVehicleType = vehicle_type || vehicleType;
    const finalLocationType = location_type || locationType;

    if (!finalFullName || !phone || !email || !finalServiceDate || !finalStartTime) {
      console.error('Missing required booking fields', {
        finalFullName: !!finalFullName,
        phone: !!phone,
        email: !!email,
        finalServiceDate: !!finalServiceDate,
        finalStartTime: !!finalStartTime,
        payloadReceived: payload,
      });
      throw new Error('Missing required booking fields (Name, Phone, Email, Date, or Time).');
    }

    if (!isBookingPackageId(finalPackageId) || !isVehicleTypeId(finalVehicleType) || !isLocationType(finalLocationType)) {
      throw new Error('Invalid booking selection.');
    }

    const pricing = calculateBookingFinancials({
      packageId: finalPackageId,
      vehicleType: finalVehicleType,
      locationType: finalLocationType,
    });

    // Use values from payload if they exist, otherwise use calculated values
    const finalDepositAmount = deposit_amount ?? pricing.depositAmount;
    const finalTotalToday = total_today ?? pricing.totalToday;
    const finalHelcimUrl = helcim_deposit_url || pricing.helcimLink.url;

    if (Math.abs(finalTotalToday - pricing.helcimLink.amount) > 0.01) {
      console.error('Helcim amount mismatch in create-booking', {
        packageId: finalPackageId,
        vehicleType: finalVehicleType,
        locationType: finalLocationType,
        calculatedTotalToday: pricing.totalToday,
        receivedTotalToday: finalTotalToday,
        configuredHelcimAmount: pricing.helcimLink.amount,
      });
      throw new Error('Deposit routing mismatch. Please contact SignalSource directly.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
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
          vehicle_type: vehicleTypeLabels[finalVehicleType],
          service_date: finalServiceDate,
          start_time: finalStartTime,
          end_time: finalEndTime,
          service_time: finalStartTime,
          blocked_until: finalBlockedUntil,
          service_duration_minutes: finalServiceDurationMinutes,
          buffer_minutes: finalBufferMinutes,
          location_type: locationTypeLabels[finalLocationType],
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

