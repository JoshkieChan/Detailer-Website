-- Add test_mode column to bookings table for shadow test bookings
-- This allows owners to create test bookings that don't affect real availability

alter table public.bookings
  add column if not exists test_mode boolean default false;

-- Add comment to document the column
comment on column public.bookings.test_mode is 'When true, this is a test booking that should not affect availability calculations. Used by owners to test booking logic without blocking real customers.';

-- Add index for filtering test_mode
create index if not exists bookings_test_mode_idx
  on public.bookings(test_mode);
