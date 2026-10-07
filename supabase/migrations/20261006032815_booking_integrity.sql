-- Apply after the capacity-segments migration. No customer rows are deleted.
create schema if not exists booking_private;
revoke all on schema booking_private from public, anon, authenticated;

-- A single row is appropriate for a one-detailer schedule. Updating it before
-- each mutation serializes competing writers; repeatable-read writers abort
-- rather than validating an obsolete snapshot.
create table booking_private.schedule_mutex (id boolean primary key default true check (id), revision bigint not null default 0);
insert into booking_private.schedule_mutex default values;
alter table booking_private.schedule_mutex enable row level security;

alter table public.bookings add column if not exists hold_expires_at timestamptz;
alter table public.bookings add column if not exists confirmation_token uuid not null default gen_random_uuid();
alter table public.payment_events add column if not exists webhook_id text;
create unique index if not exists payment_events_webhook_id_idx on public.payment_events(webhook_id);

create function booking_private.lock_schedule() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update booking_private.schedule_mutex set revision = revision + 1 where id;
  return null;
end;
$$;

create trigger booking_schedule_lock before insert or update or delete on public.bookings
for each statement execute function booking_private.lock_schedule();
create trigger blackout_schedule_lock before insert or update or delete on public.availability_blocks
for each statement execute function booking_private.lock_schedule();

create function booking_private.is_active(payment text, source text, test boolean, status text, expires timestamptz)
returns boolean language sql stable set search_path = '' as $$
  select not coalesce(test, false) and coalesce(status, '') <> 'cancelled'
    and (payment = 'paid' or (payment in ('pending_payment', 'unpaid')
      and (source = 'admin_manual' or expires > statement_timestamp())));
$$;

-- This service-only RPC is the common read model for UI availability and checks.
-- Old records without segments remain visible until edited.
create function public.booking_capacity_intervals(dates date[])
returns table(booking_id uuid, segment_date date, start_time text, end_time text, blocked_until text, duration_minutes integer, source text)
language sql stable security definer set search_path = '' as $$
  select s.booking_id, s.segment_date, s.start_time, s.end_time, s.blocked_until, s.duration_minutes, 'booking'::text
  from public.booking_capacity_segments s join public.bookings b on b.id = s.booking_id
  where s.segment_date = any(dates) and booking_private.is_active(b.payment_status, b.booking_source, b.test_mode, b.status, b.hold_expires_at)
  union all
  select b.id, b.service_date::date, coalesce(b.start_time, '08:00'), coalesce(b.end_time, '20:00'),
    coalesce(b.blocked_until, b.end_time, '20:00'),
    coalesce(b.service_duration_minutes, (extract(epoch from (coalesce(b.blocked_until, b.end_time, '20:00')::time - coalesce(b.start_time, '08:00')::time))/60)::integer),
    'booking'::text
  from public.bookings b
  where b.service_date::date = any(dates) and not exists(select 1 from public.booking_capacity_segments s where s.booking_id = b.id)
    and booking_private.is_active(b.payment_status, b.booking_source, b.test_mode, b.status, b.hold_expires_at)
  union all
  select null::uuid, d.day, to_char(greatest(a.start_at at time zone 'America/Los_Angeles', d.day + time '08:00'), 'HH24:MI'),
    to_char(least(a.end_at at time zone 'America/Los_Angeles', d.day + time '20:00'), 'HH24:MI'),
    to_char(least(a.end_at at time zone 'America/Los_Angeles', d.day + time '20:00'), 'HH24:MI'),
    (extract(epoch from (least(a.end_at at time zone 'America/Los_Angeles', d.day + time '20:00')
      - greatest(a.start_at at time zone 'America/Los_Angeles', d.day + time '08:00')))/60)::integer, 'blackout'::text
  from public.availability_blocks a cross join unnest(dates) d(day)
  where a.start_at < ((d.day + time '20:00') at time zone 'America/Los_Angeles')
    and a.end_at > ((d.day + time '08:00') at time zone 'America/Los_Angeles');
$$;
revoke all on function public.booking_capacity_intervals(date[]) from public, anon, authenticated;
grant execute on function public.booking_capacity_intervals(date[]) to service_role;

create function booking_private.check_dates(dates date[]) returns void
language plpgsql set search_path = '' as $$
declare day date; total integer; count_bookings integer; full_day boolean; conflicts boolean;
begin
  foreach day in array dates loop
    select coalesce(sum(duration_minutes), 0), count(*) filter (where source = 'booking'),
      coalesce(bool_or(duration_minutes >= 600), false)
    into total, count_bookings, full_day from public.booking_capacity_intervals(array[day]);
    -- Blackouts constrain work hours but never conflict with other blackouts.
    if count_bookings > 0 and (total > 720 or (full_day and (select count(*) from public.booking_capacity_intervals(array[day])) > 1)) then
      raise exception using errcode = '23P01', message = 'SLOT_UNAVAILABLE';
    end if;
    with windows as (
      select row_number() over () n, * from public.booking_capacity_intervals(array[day])
    )
    select exists(select 1 from windows a join windows b on a.n < b.n
      where (a.source = 'booking' or b.source = 'booking')
        and a.start_time::time < b.blocked_until::time and b.start_time::time < a.blocked_until::time) into conflicts;
    if conflicts then raise exception using errcode = '23P01', message = 'SLOT_UNAVAILABLE'; end if;
  end loop;
end;
$$;

create function booking_private.prepare_booking() returns trigger
language plpgsql set search_path = '' as $$
declare start_minutes integer; first_minutes integer; total integer;
begin
  if tg_op = 'UPDATE' and (new.service_date, new.start_time, new.service_duration_minutes, new.package_id, new.vehicle_type, new.selected_addons,
      new.payment_status, new.test_mode, new.status, new.booking_source, new.hold_expires_at)
    is not distinct from (old.service_date, old.start_time, old.service_duration_minutes, old.package_id, old.vehicle_type, old.selected_addons,
      old.payment_status, old.test_mode, old.status, old.booking_source, old.hold_expires_at) then
    new.end_time := old.end_time; new.blocked_until := old.blocked_until;
    return new;
  end if;
  if new.service_date is null or extract(dow from new.service_date::date) = 0
    or new.start_time is null or new.start_time !~ '^(0[8-9]|1[0-9]):00$'
    or new.service_duration_minutes is null or new.service_duration_minutes <= 0 then
    raise exception using errcode = '23514', message = 'Invalid service window';
  end if;
  start_minutes := (extract(epoch from new.start_time::time) / 60)::integer;
  total := new.service_duration_minutes;
  if total > 720 and (new.package_id <> 'deepReset' or new.vehicle_type <> 'largeSuvTruck') then
    raise exception using errcode = '23514', message = 'Unsupported multi-day booking';
  end if;
  first_minutes := case when total > 720 then 1200 - start_minutes else total end;
  if start_minutes + first_minutes > 1200 or total - first_minutes > 720 then
    raise exception using errcode = '23514', message = 'Booking exceeds service hours';
  end if;
  new.end_time := to_char(time '00:00' + (start_minutes + first_minutes) * interval '1 minute', 'HH24:MI');
  new.blocked_until := new.end_time;
  new.service_time := new.start_time;
  new.buffer_minutes := 60;
  if tg_op = 'INSERT' and new.booking_source = 'web' then
    if (new.service_date::date + new.start_time::time) <= (statement_timestamp() at time zone 'America/Los_Angeles') then
      raise exception using errcode = '23514', message = 'Service time is in the past';
    end if;
    new.hold_expires_at := statement_timestamp() + interval '15 minutes';
  end if;
  return new;
end;
$$;
create trigger prepare_booking before insert or update on public.bookings
for each row execute function booking_private.prepare_booking();

create function booking_private.sync_booking_capacity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare first_minutes integer; next_day date; dates date[];
begin
  if tg_op = 'UPDATE' and (new.service_date, new.start_time, new.service_duration_minutes, new.payment_status, new.test_mode, new.status, new.booking_source, new.hold_expires_at)
    is not distinct from (old.service_date, old.start_time, old.service_duration_minutes, old.payment_status, old.test_mode, old.status, old.booking_source, old.hold_expires_at) then
    return new;
  end if;
  first_minutes := (extract(epoch from (new.end_time::time - new.start_time::time))/60)::integer;
  delete from public.booking_capacity_segments where booking_id = new.id;
  insert into public.booking_capacity_segments(booking_id, segment_date, start_time, end_time, blocked_until, duration_minutes, segment_index)
    values(new.id, new.service_date::date, new.start_time, new.end_time, new.blocked_until, first_minutes, 1);
  dates := array[new.service_date::date];
  if new.service_duration_minutes > first_minutes then
    next_day := new.service_date::date + 1;
    if extract(dow from next_day) = 0 then next_day := next_day + 1; end if;
    insert into public.booking_capacity_segments(booking_id, segment_date, start_time, end_time, blocked_until, duration_minutes, segment_index)
      select new.id, next_day, '08:00', ending, ending, new.service_duration_minutes - first_minutes, 2
      from (select to_char(time '08:00' + (new.service_duration_minutes - first_minutes) * interval '1 minute', 'HH24:MI') ending) t;
    dates := array_append(dates, next_day);
  end if;
  if booking_private.is_active(new.payment_status, new.booking_source, new.test_mode, new.status, new.hold_expires_at) then
    perform booking_private.check_dates(dates);
  end if;
  delete from public.booking_capacity_events where booking_id = new.id;
  if new.service_duration_minutes >= 600 then
    insert into public.booking_capacity_events(booking_id, event_type, package, vehicle_size, selected_addons, total_duration_minutes, day_1_date, day_2_date)
      values(new.id, case when next_day is null then 'full_day_promotion' else 'multi_day_booking' end,
        new.package_id, new.vehicle_type, new.selected_addons, new.service_duration_minutes, new.service_date::date, next_day);
  end if;
  return new;
end;
$$;
create trigger sync_booking_capacity after insert or update on public.bookings
for each row execute function booking_private.sync_booking_capacity();

create function booking_private.check_blackout() returns trigger
language plpgsql security definer set search_path = '' as $$
declare dates date[];
begin
  if new.end_at <= new.start_at or new.end_at > new.start_at + interval '366 days' then
    raise exception using errcode = '23514', message = 'Invalid blackout interval';
  end if;
  select array_agg(d::date) into dates from generate_series(
    (new.start_at at time zone 'America/Los_Angeles')::date,
    (new.end_at at time zone 'America/Los_Angeles')::date, interval '1 day') d;
  perform booking_private.check_dates(dates);
  return new;
end;
$$;
create trigger check_blackout after insert or update on public.availability_blocks
for each row execute function booking_private.check_blackout();

-- Public access is through validated Edge Functions, never direct table access.
alter table public.bookings enable row level security;
alter table public.booking_capacity_segments enable row level security;
alter table public.booking_capacity_events enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.payment_events enable row level security;
alter table public.snapshot_leads enable row level security;
revoke all on public.bookings, public.booking_capacity_segments, public.booking_capacity_events,
  public.availability_blocks, public.payment_events, public.snapshot_leads from anon, authenticated;
grant select, insert, update, delete on public.bookings, public.availability_blocks, public.payment_events, public.snapshot_leads to service_role;
revoke all on public.booking_capacity_segments, public.booking_capacity_events from service_role;
grant select on public.booking_capacity_segments, public.booking_capacity_events to service_role;
revoke all on all functions in schema booking_private from public, anon, authenticated;

create function public.create_booking_blackout(starts text, ends text, reason text) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if starts !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' or ends !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' then
    raise exception using errcode = '23514', message = 'Invalid blackout date';
  end if;
  insert into public.availability_blocks(start_at, end_at, reason, created_by, source)
    values(starts::timestamp at time zone 'America/Los_Angeles', ends::timestamp at time zone 'America/Los_Angeles', reason, 'owner', 'owner_manual');
end;
$$;
revoke all on function public.create_booking_blackout(text, text, text) from public, anon, authenticated;
grant execute on function public.create_booking_blackout(text, text, text) to service_role;
