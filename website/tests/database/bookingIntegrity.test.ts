import { PGlite } from '@electric-sql/pglite';
import { schemaSql } from './bootstrap';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';

const db = new PGlite();
beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
  `);
  await db.exec(schemaSql());
});
beforeEach(async () => { await db.exec('delete from bookings; delete from availability_blocks;'); });
afterAll(async () => { await db.close(); });
test('quotas are shared, bounded, and unavailable to public roles', async () => {
  const key = 'a'.repeat(64);
  for (let i=0; i<3; i++) {
    const result = await db.query<{ quota: { allowed: boolean } }>('select consume_rate_limit($1,60000,2) quota', [key]);
    expect(result.rows[0].quota.allowed).toBe(i < 2);
  }
  await db.exec('set role anon');
  try { await expect(db.query('select consume_rate_limit($1,60000,2)', [key])).rejects.toMatchObject({ code: '42501' }); }
  finally { await db.exec('reset role'); }
});

test('email claims serialize, preserve retry payload, and stop ambiguous late retries', async () => {
  const id = (await book()).rows[0].id;
  const claim = async (payload: string) => (await db.query<{ result: { action: string; payload?: unknown } }>(
    'select claim_confirmation_email($1,$2::jsonb) result', [id, payload])).rows[0].result;
  expect(await claim('{"subject":"first"}')).toEqual({ action: 'send', payload: { subject: 'first' } });
  expect((await claim('{}')).action).toBe('busy');
  await db.query("update booking_private.email_deliveries set lease_until=now()-interval '1 minute' where booking_id=$1", [id]);
  expect(await claim('{"subject":"changed"}')).toEqual({ action: 'send', payload: { subject: 'first' } });
  await db.query("update booking_private.email_deliveries set first_attempt_at=now()-interval '24 hours' where booking_id=$1", [id]);
  expect((await claim('{}')).action).toBe('review');
  await db.query('select complete_confirmation_email($1)', [id]);
  expect((await claim('{}')).action).toBe('sent');
});
async function book(start = '08:00', duration = 180, date = '2030-06-10', extra = '') {
  return db.query<{ id: string }>(`insert into bookings(full_name,email,location_type,service_time,service_date,start_time,service_duration_minutes,payment_status,package_id,vehicle_type)
    values('Test Customer','test@example.test','garage',$2,$1,$2,$3,'pending_payment' ${extra || ",'maintenance','sedan'"}) returning id`, [date, start, duration]);
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

test('photo metadata supports service-role retries but is never publicly readable', async () => {
  const id = (await book()).rows[0].id;
  await db.exec('set role service_role');
  try {
    for (let i=0; i<2; i++) await db.query("insert into booking_photos(booking_id,slot,path,content_type) values($1,0,$2,'image/png') on conflict(booking_id,slot) do update set content_type=excluded.content_type", [id, id+'/0']);
  } finally { await db.exec('reset role'); }
  expect((await db.query('select * from booking_photos')).rows).toHaveLength(1);
  await db.exec('set role anon');
  try { await expect(db.query('select * from booking_photos')).rejects.toMatchObject({ code: '42501' }); }
  finally { await db.exec('reset role'); }
});
