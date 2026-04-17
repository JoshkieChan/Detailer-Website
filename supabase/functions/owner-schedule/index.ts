import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { calculateBookingFinancials, isBookingPackageId, isLocationType, isVehicleTypeId, locationTypeLabels, vehicleTypeLabels, bookingPackages } from '../../../website/src/data/bookingPricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};

const getExpectedPasscode = () =>
  Deno.env.get('OWNER_MODE_PASSCODE') || Deno.env.get('VITE_OWNER_PASSWORD') || '';

const isAuthorized = (req: Request) => {
  const passcode = req.headers.get('x-owner-passcode') || '';
  const expected = getExpectedPasscode();
  return Boolean(expected) && passcode === expected;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Owner passcode required.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
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
      } = payload;

      if (!isBookingPackageId(packageId) || !isVehicleTypeId(vehicleType) || !isLocationType(locationType)) {
        throw new Error('Invalid manual booking selection.');
      }

      const pricing = calculateBookingFinancials({
        packageId,
        vehicleType,
        locationType,
      });

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
          vehicle_type: vehicleTypeLabels[vehicleType],
          service_date: date,
          start_time: startTime,
          end_time: endTime,
          service_time: startTime,
          blocked_until: blockedUntil,
          service_duration_minutes: serviceDurationMinutes,
          buffer_minutes: bufferMinutes,
          location_type: locationTypeLabels[locationType],
          mobile_fee_applied: locationType === 'mobile',
          membership_intent: 'none',
          calculated_price: pricing.subtotal,
          total_amount: pricing.subtotal,
          deposit_amount: pricing.depositAmount,
          tax_amount: pricing.taxAmount,
          total_today: pricing.totalToday,
          remaining_balance: pricing.remainingBalance,
          helcim_deposit_url: pricing.helcimLink.url,
          booking_source: 'admin_manual',
          payment_status: paymentStatus || 'paid',
          total_amount_cents: Math.round(pricing.totalToday * 100),
          status: 'confirmed',
        },
      ]);

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Unsupported owner action.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Owner schedule action failed.';
    console.error('owner-schedule failed', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
