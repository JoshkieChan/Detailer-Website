import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import pg from 'pg';
import { schemaSql } from './bootstrap.ts';

const connectionString = process.env.TEST_DATABASE_URL;
assert.ok(connectionString, 'Set TEST_DATABASE_URL to a fresh local signalsource_test database.');
const url = new URL(connectionString);
assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname) && url.pathname === '/signalsource_test',
  'Concurrency tests only accept the local disposable signalsource_test database.');
const clients = Array.from({ length: 3 }, () => new pg.Client({ connectionString, statement_timeout: 10000 }));
const [a, b, observer] = clients;
const insert = "insert into bookings(full_name,email,location_type,service_time,service_date,start_time,service_duration_minutes,payment_status,package_id,vehicle_type) values('Test Customer','test@example.test','garage','08:00','2030-06-10','08:00',180,'pending_payment','maintenance','sedan') returning id";
try {
  for (const client of clients) await client.connect();
  const tables = await a.query("select tablename from pg_tables where schemaname='public'");
  assert.equal(tables.rowCount, 0, 'Use an empty database; tests never reset existing databases.');
  await a.query("do $$ begin if not exists(select from pg_roles where rolname='anon') then create role anon; end if; if not exists(select from pg_roles where rolname='authenticated') then create role authenticated; end if; if not exists(select from pg_roles where rolname='service_role') then create role service_role bypassrls; end if; end $$;");
  await a.query(schemaSql());
  const pid = (await b.query('select pg_backend_pid() pid')).rows[0].pid;
  async function race(first, second) {
    await a.query('begin');
    await a.query(first);
    await b.query('begin');
    const pending = b.query(second).then(() => ({ code: 'unexpected success' }), error => error);
    let waiting = false;
    for (let i=0; i<100; i++) {
      const state = await observer.query("select wait_event_type from pg_stat_activity where pid=$1", [pid]);
      if (state.rows[0]?.wait_event_type === 'Lock') { waiting = true; break; }
      await delay(20);
    }
    await a.query('commit');
    const result = await pending;
    await b.query('rollback');
    assert.ok(waiting, 'Second connection must wait for the first transaction.');
    assert.equal(result.code, '23P01');
  }
  await race(insert, insert);
  assert.equal((await a.query('select * from bookings')).rowCount, 1);
  assert.equal((await a.query('select * from booking_capacity_segments')).rowCount, 1);
  await a.query('delete from bookings');
  await race(insert, "select create_booking_blackout('2030-06-10T09:00','2030-06-10T10:00','race')");
  assert.equal((await a.query('select * from availability_blocks')).rowCount, 0);
  const oldId = (await a.query('select id from bookings')).rows[0].id;
  await a.query("update bookings set hold_expires_at=now()-interval '1 minute' where id=$1", [oldId]);
  await race(insert, `update bookings set payment_status='paid' where id='${oldId}'`);
  assert.equal((await a.query('select payment_status from bookings where id=$1', [oldId])).rows[0].payment_status, 'pending_payment');
  console.log('PASS: overlapping inserts, booking/blackout race, and expired-hold payment race on independent PostgreSQL connections.');
} finally {
  for (const client of clients) { await client.query('rollback').catch(() => {}); await client.end().catch(() => {}); }
}
