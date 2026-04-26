import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { calculateBookingFinancials, isBookingPackageId, isLocationType, isVehicleTypeId, locationTypeLabels, vehicleTypeLabels, bookingPackages } from '../../../website/src/data/bookingPricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};

const getExpectedPasscode = () =>
  Deno.env.get('OWNER_PASSCODE') ||
  Deno.env.get('OWNER_MODE_PASSCODE') ||
  Deno.env.get('VITE_OWNER_PASSWORD') ||
  '';

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
        calculated_price,
        calculatedPrice,
        deposit_amount,
        depositAmount,
        tax_amount,
        taxAmount,
        total_today,
        totalToday,
        remaining_balance,
        remainingBalance,
        total_amount_cents,
        totalAmountCents,
      } = payload;

      if (!isBookingPackageId(packageId) || !isVehicleTypeId(vehicleType) || !isLocationType(locationType)) {
        throw new Error('Invalid manual booking selection.');
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
          service_duration_minutes: serviceDurationMinutes,
          buffer_minutes: bufferMinutes,
          location_type: locationTypeLabels[locationType],
          mobile_fee_applied: locationType === 'mobile',
          membership_intent: 'none',
          calculated_price: subtotal,
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
      
      const table = type === 'booking' ? 'bookings' : 'availability_blocks';
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (payload.action === 'delete_all_bookings') {
      // Delete all bookings (useful for clearing out test data)
      const { error } = await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Owner schedule action failed.';
    console.error('owner-schedule failed', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
