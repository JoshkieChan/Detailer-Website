import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import type { ScheduledInterval } from '../../../website/src/config/scheduler.ts';

interface CapacityRow {
  segment_date: string;
  start_time: string;
  end_time: string;
  blocked_until: string;
  duration_minutes: number;
  source: 'booking' | 'blackout';
}

export const buildIntervalsByDate = async (
  supabase: SupabaseClient,
  dates: string[]
): Promise<Record<string, ScheduledInterval[]>> => {
  const uniqueDates = [...new Set(dates)];
  const out: Record<string, ScheduledInterval[]> = Object.fromEntries(uniqueDates.map(date => [date, []]));
  if (!uniqueDates.length) return out;
  const { data, error } = await supabase.rpc('booking_capacity_intervals', { dates: uniqueDates });
  if (error) throw error;
  for (const row of (data || []) as CapacityRow[]) {
    out[row.segment_date].push({
      date: row.segment_date, startTime: row.start_time, endTime: row.end_time,
      blockedUntil: row.blocked_until, totalDurationMinutes: row.duration_minutes, source: row.source,
    });
  }
  return out;
};
