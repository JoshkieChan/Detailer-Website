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
      phone,
      email,
      address,
      notes,
      packageId,
      vehicleType,
      locationType,
      membershipIntent,
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
    } = payload;

    const finalServiceDate = service_date || serviceDate;
    const finalStartTime = start_time || startTime;
    const finalEndTime = end_time || endTime;
    const finalServiceDurationMinutes = service_duration_minutes || serviceDurationMinutes;
    const finalBufferMinutes = buffer_minutes || bufferMinutes;
    const finalBlockedUntil = blocked_until || blockedUntil;

    if (!fullName || !phone || !email || !finalServiceDate || !finalStartTime) {
      console.error('Missing required booking fields', {
        fullName: !!fullName,
        phone: !!phone,
        email: !!email,
        finalServiceDate: !!finalServiceDate,
        finalStartTime: !!finalStartTime,
        payloadReceived: payload,
      });
      throw new Error('Missing required booking fields (Name, Phone, Email, Date, or Time).');
    }

    if (!isBookingPackageId(packageId) || !isVehicleTypeId(vehicleType) || !isLocationType(locationType)) {
      throw new Error('Invalid booking selection.');
    }

    const pricing = calculateBookingFinancials({
      packageId,
      vehicleType,
      locationType,
    });

    if (Math.abs(pricing.totalToday - pricing.helcimLink.amount) > 0.01) {
      console.error('Helcim amount mismatch in create-booking', {
        packageId,
        vehicleType,
        locationType,
        calculatedTotalToday: pricing.totalToday,
        configuredHelcimAmount: pricing.helcimLink.amount,
      });
      throw new Error('Deposit routing mismatch. Please contact SignalSource directly.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          full_name: fullName,
          email,
          phone,
          address: address || '',
          notes: notes || '',
          package: bookingPackages[packageId].label,
          package_id: packageId,
          vehicle_info: vehicleTypeLabels[vehicleType],
          vehicle_type: vehicleTypeLabels[vehicleType],
          service_date: finalServiceDate,
          start_time: finalStartTime,
          end_time: finalEndTime,
          service_time: finalStartTime,
          blocked_until: finalBlockedUntil,
          service_duration_minutes: finalServiceDurationMinutes,
          buffer_minutes: finalBufferMinutes,
          location_type: locationTypeLabels[locationType],
          mobile_fee_applied: locationType === 'mobile',
          membership_intent:
            membershipIntent === 'quarterly' || membershipIntent === 'monthly'
              ? membershipIntent
              : 'none',
          calculated_price: pricing.subtotal,
          total_amount: pricing.subtotal,
          deposit_amount: pricing.depositAmount,
          tax_amount: pricing.taxAmount,
          total_today: pricing.totalToday,
          remaining_balance: pricing.remainingBalance,
          helcim_deposit_url: pricing.helcimLink.url,
          booking_source: 'web',
          payment_status: 'pending_payment',
          total_amount_cents: totalAmountCents || Math.round(pricing.totalToday * 100),
          status: 'pending',
        },
      ])
      .select('id, helcim_deposit_url')
      .single();


    if (error) {
      console.error('create-booking insert failed', error);
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        bookingId: data.id,
        helcimDepositUrl: data.helcim_deposit_url,
        totalToday: pricing.totalToday,
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
