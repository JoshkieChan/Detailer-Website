alter table public.bookings
  add column if not exists notes text,
  add column if not exists total_today numeric(10,2),
  add column if not exists remaining_balance numeric(10,2),
  add column if not exists helcim_deposit_url text;

update public.bookings
set
  notes = coalesce(notes, ''),
  total_today = coalesce(total_today, round((coalesce(deposit_amount, 0) + coalesce(tax_amount, 0))::numeric, 2)),
  remaining_balance = coalesce(remaining_balance, round((greatest(coalesce(total_amount, 0) - coalesce(deposit_amount, 0), 0))::numeric, 2))
where
  notes is null
  or total_today is null
  or remaining_balance is null;
