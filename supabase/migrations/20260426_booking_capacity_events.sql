-- Create booking_capacity_events table for logging capacity-related events
-- This table tracks full-day promotions and multi-day bookings for observability

create table if not exists public.booking_capacity_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  event_type text not null check (event_type in ('full_day_promotion', 'multi_day_booking')),
  package text not null,
  vehicle_size text not null,
  selected_addons text[],
  total_duration_minutes integer not null,
  day_1_date date,
  day_2_date date,
  created_at timestamptz not null default now()
);

-- Add index for querying by date range
create index if not exists booking_capacity_events_day_1_date_idx
  on public.booking_capacity_events(day_1_date);

create index if not exists booking_capacity_events_day_2_date_idx
  on public.booking_capacity_events(day_2_date);

-- Add index for querying by event type
create index if not exists booking_capacity_events_event_type_idx
  on public.booking_capacity_events(event_type);

-- Add index for querying by booking_id
create index if not exists booking_capacity_events_booking_id_idx
  on public.booking_capacity_events(booking_id);

-- Add comment to document the table
comment on table public.booking_capacity_events is 'Logs capacity-related booking events: full-day promotions and multi-day bookings for observability and reporting';
comment on column public.booking_capacity_events.event_type is 'Type of capacity event: full_day_promotion (booking >= 10h) or multi_day_booking (Deep Reset + Large SUV/Truck > 12h)';
comment on column public.booking_capacity_events.day_1_date is 'First day of work for the booking';
comment on column public.booking_capacity_events.day_2_date is 'Second day of work (only for multi-day bookings)';
