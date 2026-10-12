create table if not exists public.booking_capacity_segments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  segment_date date not null,
  start_time text not null,
  end_time text not null,
  blocked_until text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  segment_index integer not null check (segment_index > 0),
  created_at timestamptz not null default now()
);

create unique index if not exists booking_capacity_segments_booking_segment_idx
  on public.booking_capacity_segments(booking_id, segment_index);

create index if not exists booking_capacity_segments_date_time_idx
  on public.booking_capacity_segments(segment_date, start_time);

comment on table public.booking_capacity_segments is 'Actual reserved capacity windows for bookings, including split multi-day work.';
comment on column public.booking_capacity_segments.segment_date is 'Calendar date reserved by this booking segment.';
comment on column public.booking_capacity_segments.segment_index is '1-based order of segments for a booking.';
