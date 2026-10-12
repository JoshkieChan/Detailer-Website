// Optional local runner: npm install --no-save embedded-postgres before running.
import EmbeddedPostgres from 'embedded-postgres';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
const password = randomUUID();
const databaseDir = await mkdtemp(join(tmpdir(), 'signalsource-pg-'));
const database = new EmbeddedPostgres({
  databaseDir, user: 'postgres', password, port: 55439, persistent: true,
  postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: message => console.error(message),
});
try {
  await database.initialise();
  await database.start();
  await database.createDatabase('signalsource_test');
  process.env.TEST_DATABASE_URL = `postgres://postgres:${password}@127.0.0.1:55439/signalsource_test`;
  await import('./concurrency.mjs');
} finally {
  await database.stop();
  console.log('Temporary PostgreSQL stopped; test data retained at ' + databaseDir);
}
