alter table public.bookings
  add column if not exists package text,
  add column if not exists vehicle_type text,
  add column if not exists mobile_fee_applied boolean not null default false,
  add column if not exists membership_intent text not null default 'none',
  add column if not exists calculated_price numeric(10,2),
  add column if not exists tax_amount numeric(10,2);

update public.bookings
set
  package = coalesce(package, package_id),
  calculated_price = coalesce(calculated_price, total_amount),
  tax_amount = coalesce(tax_amount, 0),
  membership_intent = coalesce(nullif(membership_intent, ''), 'none')
where
  package is null
  or calculated_price is null
  or tax_amount is null
  or membership_intent is null
  or membership_intent = '';

alter table public.bookings
  add constraint bookings_membership_intent_check
  check (membership_intent in ('none', 'quarterly', 'monthly'));
