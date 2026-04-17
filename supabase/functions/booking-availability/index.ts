import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  getNextAvailableOpening,
  isDateUnavailable,
  type ScheduledInterval,
  type SlotBookingPackageId,
} from '../../../website/src/config/scheduler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
};

const verifyOwnerPasscode = (req: Request) => {
  const passcode = req.headers.get('x-owner-passcode') || '';
  const expected = Deno.env.get('OWNER_MODE_PASSCODE') || Deno.env.get('VITE_OWNER_PASSWORD') || '';
  return Boolean(expected) && passcode === expected;
};

const toDateString = (iso: string) => iso.slice(0, 10);
const toTimeString = (iso: string) => iso.slice(11, 16);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const url = new URL(req.url);
    const packageId = (url.searchParams.get('packageId') || 'maintenance') as SlotBookingPackageId;
    const ownerMode = url.searchParams.get('owner') === 'true';

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
              'id, full_name, package, vehicle_info, service_date, start_time, end_time, blocked_until, location_type, notes, payment_status'
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
          details: [
            booking.vehicle_info || 'Vehicle size not set',
            booking.location_type || 'Location not set',
            booking.notes || 'No notes',
          ],
          paymentStatus: booking.payment_status || null,
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
          .select('service_date, start_time, end_time, blocked_until')
          .eq('payment_status', 'paid')
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
      intervalsByDate[booking.service_date] = intervalsByDate[booking.service_date] || [];
      intervalsByDate[booking.service_date].push({
        date: booking.service_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        blockedUntil: booking.blocked_until || booking.end_time,
        source: 'booking',
        paymentStatus: 'paid',
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

    const allIntervals = Object.values(intervalsByDate).flat();
    const unavailableDates = Object.keys(intervalsByDate).filter((date) =>
      isDateUnavailable({
        date,
        packageId,
        intervals: intervalsByDate[date],
      })
    );

    const nextAvailableOpening = getNextAvailableOpening({
      fromDate: new Date(),
      packageId,
      intervals: allIntervals,
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
