alter table public.bookings
  add column if not exists start_time text,
  add column if not exists end_time text,
  add column if not exists blocked_until text,
  add column if not exists service_duration_minutes integer,
  add column if not exists buffer_minutes integer,
  add column if not exists booking_source text not null default 'web',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists helcim_transaction_id text,
  add column if not exists total_amount_cents integer;

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_by text,
  source text not null default 'owner_manual',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  helcim_transaction_id text,
  event_type text,
  raw_payload jsonb not null
);

create index if not exists bookings_service_date_start_time_idx
  on public.bookings (service_date, start_time);

create index if not exists bookings_payment_status_idx
  on public.bookings (payment_status);

create index if not exists availability_blocks_start_at_idx
  on public.availability_blocks (start_at);

create index if not exists payment_events_transaction_idx
  on public.payment_events (helcim_transaction_id);

alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('unpaid', 'pending_payment', 'paid', 'failed', 'cancelled'));

alter table public.bookings
  drop constraint if exists bookings_booking_source_check;

alter table public.bookings
  add constraint bookings_booking_source_check
  check (booking_source in ('web', 'admin_manual'));
