import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

const parseTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const intervalsOverlap = (start1: number, end1: number, start2: number, end2: number) => {
  return start1 < end2 && start2 < end1;
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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate query parameters are required.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch all non-test paid bookings in the date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, service_date, start_time, end_time, package_id, vehicle_type, selected_addons')
      .gte('service_date', startDate)
      .lte('service_date', endDate)
      .eq('test_mode', false)
      .eq('payment_status', 'paid')
      .order('service_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (bookingsError) throw bookingsError;

    // Import scheduler functions for duration calculation
    const { getTotalDuration } = await import('../../../website/src/config/scheduler.ts');

    const violations: Array<{
      date: string;
      booking_ids: string[];
      type: 'over_capacity' | 'overlap';
      description: string;
    }> = [];

    // Group bookings by date
    const bookingsByDate: Record<string, any[]> = {};
    for (const booking of bookings || []) {
      if (!booking.service_date) continue;
      bookingsByDate[booking.service_date] = bookingsByDate[booking.service_date] || [];
      bookingsByDate[booking.service_date].push(booking);
    }

    // Check each day for violations
    for (const [date, dayBookings] of Object.entries(bookingsByDate)) {
      // Calculate total duration for the day
      let totalDurationMinutes = 0;
      const intervals: Array<{ start: number; end: number; bookingId: string }> = [];

      for (const booking of dayBookings) {
        if (!booking.start_time || !booking.end_time) continue;

        const selectedAddOns = booking.selected_addons || [];
        const duration = getTotalDuration({
          packageId: booking.package_id,
          vehicleType: booking.vehicle_type,
          selectedAddOns,
        });

        totalDurationMinutes += duration;

        const startMinutes = parseTime(booking.start_time);
        const endMinutes = parseTime(booking.end_time);
        intervals.push({ start: startMinutes, end: endMinutes, bookingId: booking.id });
      }

      // Check 12-hour capacity limit
      if (totalDurationMinutes > 720) {
        violations.push({
          date,
          booking_ids: dayBookings.map((b) => b.id),
          type: 'over_capacity',
          description: `Total duration (${Math.round(totalDurationMinutes / 60 * 10) / 10}h) exceeds 12-hour limit`,
        });
      }

      // Check for overlapping intervals
      for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          if (intervalsOverlap(intervals[i].start, intervals[i].end, intervals[j].start, intervals[j].end)) {
            violations.push({
              date,
              booking_ids: [intervals[i].bookingId, intervals[j].bookingId],
              type: 'overlap',
              description: `Bookings overlap: ${intervals[i].bookingId} and ${intervals[j].bookingId}`,
            });
          }
        }
      }
    }

    if (violations.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'No capacity violations found for this range.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        violations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sanity check failed.';
    console.error('sanity-check failed', message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
