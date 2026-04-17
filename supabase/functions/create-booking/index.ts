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
      serviceDate,
      startTime,
      endTime,
      blockedUntil,
      serviceDurationMinutes,
      bufferMinutes,
      totalAmountCents,
    } = payload;

    if (!fullName || !phone || !email || !serviceDate || !startTime) {
      throw new Error('Missing required booking fields.');
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
          service_date: serviceDate,
          start_time: startTime,
          end_time: endTime,
          service_time: startTime,
          blocked_until: blockedUntil,
          service_duration_minutes: serviceDurationMinutes,
          buffer_minutes: bufferMinutes,
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
