import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';

const db = new PGlite();
const migration = (name: string) => readFileSync(new URL('../../../supabase/migrations/' + name, import.meta.url), 'utf8');
beforeAll(async () => {
  // Minimal pre-existing schema: the repository predates its migration history.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create table bookings (
      id uuid primary key default gen_random_uuid(), service_date date, service_time text,
      package_id text default 'maintenance', vehicle_type text default 'sedan',
      selected_addons text[], status text default 'pending', test_mode boolean default false
    );
    create table snapshot_leads(id uuid primary key default gen_random_uuid());
  `);
  await db.exec(migration('20260417_signalsource_v2_scheduler_and_payments.sql'));
  await db.exec(migration('20260426_booking_capacity_events.sql'));
  await db.exec(migration('20261006_booking_capacity_segments.sql'));
  await db.exec(migration('20261006032815_booking_integrity.sql'));
});
beforeEach(async () => { await db.exec('delete from bookings; delete from availability_blocks;'); });
afterAll(async () => { await db.close(); });
async function book(start = '08:00', duration = 180, date = '2030-06-10', extra = '') {
  return db.query<{ id: string }>(`insert into bookings(service_date,start_time,service_duration_minutes,payment_status ${extra ? ',package_id,vehicle_type' : ''})
    values($1,$2,$3,'pending_payment' ${extra}) returning id`, [date, start, duration]);
}
test('holds reject overlapping inserts and rollback booking plus segments; adjacency succeeds', async () => {
  await book();
  await expect(book('09:00')).rejects.toMatchObject({ code: '23P01' });
  await book('11:00');
  expect((await db.query('select * from bookings')).rows).toHaveLength(2);
  expect((await db.query('select * from booking_capacity_segments')).rows).toHaveLength(2);
});
test('multi-day allocation skips Sunday and a second-day conflict rolls back both days', async () => {
  await book('08:00', 180, '2030-06-10');
  await expect(book('08:00', 840, '2030-06-08', ",'deepReset','largeSuvTruck'")).rejects.toMatchObject({ code: '23P01' });
  expect((await db.query('select * from bookings')).rows).toHaveLength(1);
  await db.exec('delete from bookings');
  await book('08:00', 840, '2030-06-08', ",'deepReset','largeSuvTruck'");
  expect((await db.query('select segment_date::text, duration_minutes from booking_capacity_segments order by segment_index')).rows).toEqual([
    { segment_date: '2030-06-08', duration_minutes: 720 }, { segment_date: '2030-06-10', duration_minutes: 120 },
  ]);
});
test('expired holds release capacity but cannot later be marked paid over another reservation', async () => {
  const first = (await book()).rows[0].id;
  await db.query("update bookings set hold_expires_at = now() - interval '1 minute' where id=$1", [first]);
  await book();
  await expect(db.query("update bookings set payment_status='paid' where id=$1", [first])).rejects.toMatchObject({ code: '23P01' });
});
test('rescheduling regenerates segments and a conflicting update leaves the original intact', async () => {
  const first = (await book()).rows[0].id;
  await book('12:00');
  await expect(db.query("update bookings set start_time='11:00' where id=$1", [first])).rejects.toMatchObject({ code: '23P01' });
  await db.query("update bookings set start_time='09:00' where id=$1", [first]);
  expect((await db.query('select start_time,end_time from booking_capacity_segments where booking_id=$1', [first])).rows).toEqual([{ start_time: '09:00', end_time: '12:00' }]);
});
test('blackouts use Pacific time, span midnight, and cannot overwrite bookings', async () => {
  await db.query("select create_booking_blackout('2030-06-09T23:00','2030-06-10T09:00','test')");
  await expect(book()).rejects.toMatchObject({ code: '23P01' });
  await book('09:00');
  await expect(db.query("select create_booking_blackout('2030-06-10T10:00','2030-06-10T11:00','test')")).rejects.toMatchObject({ code: '23P01' });
});
test('full-day threshold prevents even adjacent jobs and public roles cannot read customers or invoke scheduling RPC', async () => {
  await book('08:00', 600);
  await expect(book('18:00', 120)).rejects.toMatchObject({ code: '23P01' });
  await db.exec('set role anon');
  try {
    await expect(db.query('select * from bookings')).rejects.toMatchObject({ code: '42501' });
    await expect(db.query("select * from booking_capacity_intervals(array['2030-06-10'::date])")).rejects.toMatchObject({ code: '42501' });
  } finally { await db.exec('reset role'); }
});
test('service role can write bookings but cannot edit generated segments', async () => {
  await db.exec('set role service_role');
  try {
    await book();
    await expect(db.query('delete from booking_capacity_segments')).rejects.toMatchObject({ code: '42501' });
  } finally { await db.exec('reset role'); }
});
