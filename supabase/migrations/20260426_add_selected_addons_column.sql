-- Add selected_addons column to bookings table for add-on tracking
alter table public.bookings
  add column if not exists selected_addons text[];

-- Add comment to document the column
comment on column public.bookings.selected_addons is 'Array of selected add-on IDs (paintProtection, petHairRemoval, engineBay, headlightRestoration)';
