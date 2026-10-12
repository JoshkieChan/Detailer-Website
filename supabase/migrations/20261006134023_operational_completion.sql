create table booking_private.rate_limits (
  key text primary key,
  requests integer not null,
  resets_at timestamptz not null
);
alter table booking_private.rate_limits enable row level security;
create function public.consume_rate_limit(bucket text, window_ms integer, maximum integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_bucket booking_private.rate_limits; current_time_value timestamptz := clock_timestamp();
begin
  if window_ms < 1000 or window_ms > 3600000 or maximum < 1 or length(bucket) <> 64 then
    raise exception 'Invalid quota';
  end if;
  delete from booking_private.rate_limits where resets_at < current_time_value - interval '1 day';
  insert into booking_private.rate_limits as limits(key, requests, resets_at)
    values(bucket, 1, current_time_value + window_ms * interval '1 millisecond')
  on conflict(key) do update set
    requests = case when limits.resets_at <= current_time_value then 1 else least(limits.requests + 1, maximum + 1) end,
    resets_at = case when limits.resets_at <= current_time_value then excluded.resets_at else limits.resets_at end
  returning * into current_bucket;
  return jsonb_build_object('allowed', current_bucket.requests <= maximum,
    'remaining', greatest(0, maximum-current_bucket.requests),
    'resetTime', extract(epoch from current_bucket.resets_at) * 1000);
end;
$$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create table public.booking_photos (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  slot integer not null check(slot between 0 and 4),
  path text not null unique,
  content_type text not null check(content_type in ('image/jpeg','image/png','image/webp')),
  created_at timestamptz not null default now(),
  primary key(booking_id,slot)
);
alter table public.booking_photos enable row level security;
revoke all on public.booking_photos from anon, authenticated;
grant select, insert, update, delete on public.booking_photos to service_role;

create table booking_private.email_deliveries (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  payload jsonb not null,
  first_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  sent_at timestamptz
);
alter table booking_private.email_deliveries enable row level security;

create function public.claim_confirmation_email(email_booking uuid, email_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare delivery booking_private.email_deliveries;
begin
  insert into booking_private.email_deliveries(booking_id,payload)
    values(email_booking,email_payload) on conflict do nothing;
  select * into delivery from booking_private.email_deliveries where booking_id=email_booking for update;
  if delivery.sent_at is not null then return jsonb_build_object('action','sent'); end if;
  -- Resend retains keys for 24h. Stop earlier if a past delivery is ambiguous.
  if delivery.first_attempt_at < now() - interval '23 hours' then return jsonb_build_object('action','review'); end if;
  if delivery.lease_until > now() then return jsonb_build_object('action','busy'); end if;
  update booking_private.email_deliveries set lease_until=now()+interval '2 minutes' where booking_id=email_booking;
  return jsonb_build_object('action','send','payload',delivery.payload);
end;
$$;
create function public.complete_confirmation_email(email_booking uuid)
returns void language sql security definer set search_path = '' as $$
  update booking_private.email_deliveries set sent_at=now() where booking_id=email_booking;
$$;
revoke all on function public.claim_confirmation_email(uuid,jsonb), public.complete_confirmation_email(uuid) from public,anon,authenticated;
grant execute on function public.claim_confirmation_email(uuid,jsonb), public.complete_confirmation_email(uuid) to service_role;
