-- New, EMPTY application databases only. Existing production schemas must not
-- be replaced with this file. Preserves the observed bookings column contract.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  address text,
  vehicle_info text,
  package_id text not null,
  service_date date not null,
  service_time text not null,
  location_type text not null,
  status text default 'pending',
  deposit_status text default 'unpaid',
  stripe_session_id text,
  total_amount numeric,
  deposit_amount numeric,
  customer_id uuid,
  google_calendar_event_id text
);
alter table public.bookings enable row level security;
-- The unused customer_id legacy column has no FK here: the current application
-- does not manage the separate legacy customers table.
