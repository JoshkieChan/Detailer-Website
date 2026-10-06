import {
  getTotalDuration,
  timeToMinutes,
  type AddOnId,
  type ScheduledInterval,
  type SlotBookingPackageId,
  type VehicleTypeId,
} from '../../../website/src/config/scheduler.ts';

const toDateString = (iso: string) => iso.slice(0, 10);
const toTimeString = (iso: string) => iso.slice(11, 16);

export const buildIntervalsByDate = async (
  supabase: any,
  dates: string[]
): Promise<Record<string, ScheduledInterval[]>> => {
  const uniqueDates = [...new Set(dates)].filter(Boolean);
  const intervalsByDate: Record<string, ScheduledInterval[]> = {};

  for (const date of uniqueDates) {
    intervalsByDate[date] = [];
  }

  if (uniqueDates.length === 0) return intervalsByDate;

  const [{ data: segments, error: segmentsError }, { data: bookings, error: bookingsError }, { data: blocks, error: blocksError }] =
    await Promise.all([
      supabase
        .from('booking_capacity_segments')
        .select('booking_id, segment_date, start_time, end_time, blocked_until, duration_minutes, bookings!inner(payment_status, test_mode)')
        .eq('bookings.payment_status', 'paid')
        .eq('bookings.test_mode', false)
        .in('segment_date', uniqueDates),
      supabase
        .from('bookings')
        .select('id, service_date, start_time, end_time, blocked_until, package_id, vehicle_type, selected_addons, test_mode')
        .eq('payment_status', 'paid')
        .eq('test_mode', false)
        .in('service_date', uniqueDates),
      supabase
        .from('availability_blocks')
        .select('start_at, end_at')
        .order('start_at', { ascending: true }),
    ]);

  if (segmentsError) throw segmentsError;
  if (bookingsError) throw bookingsError;
  if (blocksError) throw blocksError;

  const bookingIdsWithSegments = new Set<string>();

  for (const segment of segments || []) {
    if (!segment.segment_date || !segment.start_time || !segment.blocked_until) continue;
    bookingIdsWithSegments.add(segment.booking_id);
    intervalsByDate[segment.segment_date] = intervalsByDate[segment.segment_date] || [];
    intervalsByDate[segment.segment_date].push({
      date: segment.segment_date,
      startTime: segment.start_time,
      endTime: segment.end_time,
      blockedUntil: segment.blocked_until,
      source: 'booking',
      paymentStatus: 'paid',
      totalDurationMinutes: segment.duration_minutes,
    });
  }

  for (const booking of bookings || []) {
    if (bookingIdsWithSegments.has(booking.id)) continue;
    if (!booking.service_date || !booking.start_time || !booking.end_time) continue;

    const selectedAddOns = (booking.selected_addons || []) as AddOnId[];
    const totalDuration = getTotalDuration({
      packageId: booking.package_id as SlotBookingPackageId,
      vehicleType: booking.vehicle_type as VehicleTypeId,
      selectedAddOns,
    });

    intervalsByDate[booking.service_date] = intervalsByDate[booking.service_date] || [];
    intervalsByDate[booking.service_date].push({
      date: booking.service_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      blockedUntil: booking.blocked_until || booking.end_time,
      source: 'booking',
      paymentStatus: 'paid',
      packageId: booking.package_id as SlotBookingPackageId,
      vehicleType: booking.vehicle_type as VehicleTypeId,
      selectedAddOns,
      totalDurationMinutes: totalDuration,
    });
  }

  for (const block of blocks || []) {
    if (!block.start_at || !block.end_at) continue;
    const date = toDateString(block.start_at);
    if (!uniqueDates.includes(date)) continue;
    const startTime = toTimeString(block.start_at);
    const blockedUntil = toTimeString(block.end_at);
    intervalsByDate[date] = intervalsByDate[date] || [];
    intervalsByDate[date].push({
      date,
      startTime,
      endTime: blockedUntil,
      blockedUntil,
      source: 'blackout',
      totalDurationMinutes: Math.max(0, timeToMinutes(blockedUntil) - timeToMinutes(startTime)),
    });
  }

  return intervalsByDate;
};
