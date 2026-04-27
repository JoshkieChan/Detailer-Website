-- Add base_price and addons_price columns to bookings table
-- This separates the base package price from add-on pricing for proper deposit calculation

alter table public.bookings
  add column if not exists base_price numeric,
  add column if not exists addons_price numeric;

-- Add comments to document the columns
comment on column public.bookings.base_price is 'Base package price plus mobile fee (if applicable). Used for deposit calculation. Does not include add-ons.';
comment on column public.bookings.addons_price is 'Total price of selected add-ons. Added to base price for remaining balance calculation.';

-- Add indexes for querying
create index if not exists bookings_base_price_idx
  on public.bookings(base_price);
create index if not exists bookings_addons_price_idx
  on public.bookings(addons_price);
