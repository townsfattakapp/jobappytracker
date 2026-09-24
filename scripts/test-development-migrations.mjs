import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { confirmDevelopmentDatabase } from './lib/development-database.mjs';

const env = { DATABASE_URL: 'postgresql://dev:dummy@localhost:5432/jobappy_dev' };
const confirmation = ['--confirm-development=localhost:5432/jobappy_dev'];
const config = { migrationsFolder: 'src/lib/db/migrations' };

async function migrateInMemory(db, limit) {
  const migrations = readMigrationFiles(config).slice(0, limit);
  // node-postgres accepts 0001's multi-statement query; PGlite's prepared
  // protocol does not. Split only that boundary in the test adapter, retaining
  // the actual SQL, hashes, timestamps, and Drizzle migration/ledger logic.
  for (const migration of migrations) {
    migration.sql = migration.sql.flatMap(statement => statement.split(/(?=DO \$\$ BEGIN)/));
  }
  await db.dialect.migrate(migrations, db.session, config);
}

test('confirmation binds to the development target and rejects unsafe inputs', () => {
  assert.equal(confirmDevelopmentDatabase(env, confirmation), 'localhost:5432/jobappy_dev');
  assert.throws(() => confirmDevelopmentDatabase(env, []), /confirmation required/);
  assert.throws(() => confirmDevelopmentDatabase({ ...env, NODE_ENV: 'development' }, []), /confirmation required/);
  assert.throws(() => confirmDevelopmentDatabase(env, ['--dry-run']), /confirmation required/);
  assert.throws(() => confirmDevelopmentDatabase(env, ['--confirm-development=localhost:5432/other']), /confirmation required/);
  assert.throws(() => confirmDevelopmentDatabase({ ...env, NODE_ENV: 'production' }, confirmation), /NODE_ENV=production/);
  assert.throws(() => confirmDevelopmentDatabase({}, confirmation), /required/);
  assert.throws(() => confirmDevelopmentDatabase({ DATABASE_URL: 'not-a-url' }, confirmation), /PostgreSQL URL/);
  assert.throws(() => confirmDevelopmentDatabase({ DATABASE_URL: `${env.DATABASE_URL}?host=other` }, confirmation), /Only sslmode/);
  assert.throws(() => confirmDevelopmentDatabase({ DATABASE_URL: 'postgresql://dev:dummy@e60ic1228f.j9g1t394ei.tsdb.cloud.timescale.com:37114/tsdb' }, ['--confirm-development=e60ic1228f.j9g1t394ei.tsdb.cloud.timescale.com:37114/tsdb']), /protected hosted/);
  assert.equal(confirmDevelopmentDatabase({ DATABASE_URL: `${env.DATABASE_URL}?sslmode=require` }, confirmation), 'localhost:5432/jobappy_dev');
});

test('migration CLI refuses before connecting and does not expose credentials', () => {
  const result = spawnSync(process.execPath, ['scripts/migrate.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development', DATABASE_URL: 'postgresql://dev:PRIVATE_TEST_PASSWORD@127.0.0.1:1/jobappy_dev' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /confirmation required/);
  assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE_TEST_PASSWORD|ECONNREFUSED|Starting confirmed/);
});

test('migration timestamps are strictly increasing', () => {
  const migrations = readMigrationFiles(config);
  for (let i = 1; i < migrations.length; i++) assert.ok(migrations[i].folderMillis > migrations[i - 1].folderMillis);
});

test('fresh in-memory PostgreSQL migrates fully and a second run is a no-op', async () => {
  const client = new PGlite();
  try {
    const db = drizzle(client);
    await migrateInMemory(db);
    const columns = await client.query("select column_name from information_schema.columns where table_schema='public' and table_name='curriculum_tracks' order by ordinal_position");
    assert.deepEqual(columns.rows.map(row => row.column_name), ['id', 'ownerId', 'status', 'version', 'title', 'family', 'data', 'createdAt', 'updatedAt', 'publishedAt', 'reviewNote']);
    assert.deepEqual((await client.query("select * from curriculum_tracks where status='published'")).rows, []);
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 5);
    await migrateInMemory(db);
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 5);
    const fk = await client.query("select confdeltype from pg_constraint where conname='curriculum_tracks_ownerId_users_id_fk'");
    assert.equal(fk.rows[0].confdeltype, 'n');
  } finally { await client.close(); }
});

test('in-memory database at migration 0003 applies only corrected 0004', async () => {
  const client = new PGlite();
  try {
    const db = drizzle(client);
    await migrateInMemory(db, 4);
    await client.query("insert into users (id,email) values ('existing-dev-user','dev@example.invalid')");
    await migrateInMemory(db);
    assert.equal((await client.query('select count(*)::int as count from users')).rows[0].count, 1);
    assert.equal((await client.query('select count(*)::int as count from curriculum_tracks')).rows[0].count, 0);
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 5);
  } finally { await client.close(); }
});
