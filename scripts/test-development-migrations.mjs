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
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 13);
    await migrateInMemory(db);
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 13);
    const fk = await client.query("select confdeltype from pg_constraint where conname='curriculum_tracks_ownerId_users_id_fk'");
    assert.equal(fk.rows[0].confdeltype, 'n');
    // Career OS Phase 1 tables (0005).
    const careerOs = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('user_roles','admin_audit_log','companies','job_sources','jobs','learner_job_preferences','platform_settings') order by table_name");
    assert.deepEqual(careerOs.rows.map(row => row.table_name), ['admin_audit_log', 'companies', 'job_sources', 'jobs', 'learner_job_preferences', 'platform_settings', 'user_roles']);
    const jobsFk = await client.query("select confdeltype from pg_constraint where conname='jobs_companyId_companies_id_fk'");
    assert.equal(jobsFk.rows[0].confdeltype, 'r');
    const fingerprint = await client.query("select indexname from pg_indexes where tablename='jobs' and indexname='jobs_fingerprint_unique'");
    assert.equal(fingerprint.rows.length, 1);
    // Career OS Phase 2 (0006): ingestion runs, duplicates, usage counters, lifecycle columns, per-source external id uniqueness.
    const phase2 = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('job_ingestion_runs','job_duplicates','usage_counters') order by table_name");
    assert.deepEqual(phase2.rows.map(row => row.table_name), ['job_duplicates', 'job_ingestion_runs', 'usage_counters']);
    const lifecycle = await client.query("select column_name from information_schema.columns where table_name='jobs' and column_name in ('lifecycle','lastSeenAt','remoteEligibility','eligibleCountries') order by column_name");
    assert.equal(lifecycle.rows.length, 4);
    const externalIdx = await client.query("select indexdef from pg_indexes where tablename='jobs' and indexname='jobs_source_external_unique'");
    assert.match(externalIdx.rows[0].indexdef, /UNIQUE/);
    // Career OS Phase 3 (0007): resumes, profiles, analyses, scheduler columns.
    const phase3 = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('resumes','resume_profiles','resume_analyses') order by table_name");
    assert.deepEqual(phase3.rows.map(row => row.table_name), ['resume_analyses', 'resume_profiles', 'resumes']);
    const resumeFk = await client.query("select confdeltype from pg_constraint where conname='resume_analyses_resumeId_resumes_id_fk'");
    assert.equal(resumeFk.rows[0].confdeltype, 'c', 'deleting a resume removes its analyses');
    const contentType = await client.query("select data_type from information_schema.columns where table_name='resumes' and column_name='content'");
    assert.equal(contentType.rows[0].data_type, 'bytea');
    const lockCols = await client.query("select column_name from information_schema.columns where table_name='job_sources' and column_name in ('lockedAt','lockToken','lastSuccessAt','scheduleEnabled')");
    assert.equal(lockCols.rows.length, 4);
    // Career OS Phase 4 (0008): outreach contacts and job preparations, owner-scoped and cascading with the job.
    const phase4 = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('outreach_contacts','job_preparations') order by table_name");
    assert.deepEqual(phase4.rows.map(row => row.table_name), ['job_preparations', 'outreach_contacts']);
    const outreachFk = await client.query("select confdeltype from pg_constraint where conname='outreach_contacts_jobId_jobs_id_fk'");
    assert.equal(outreachFk.rows[0].confdeltype, 'c');
    const prepUnique = await client.query("select indexdef from pg_indexes where tablename='job_preparations' and indexname='job_preparations_user_job_unique'");
    assert.match(prepUnique.rows[0].indexdef, /UNIQUE/);
    // Career OS Phase 5 (0009): plans, subscriptions, webhook ledger, notification log.
    const phase5 = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('billing_plans','billing_subscriptions','billing_events','notification_log') order by table_name");
    assert.deepEqual(phase5.rows.map(row => row.table_name), ['billing_events', 'billing_plans', 'billing_subscriptions', 'notification_log']);
    const eventUnique = await client.query("select indexdef from pg_indexes where tablename='billing_events' and indexname='billing_events_provider_event_unique'");
    assert.match(eventUnique.rows[0].indexdef, /UNIQUE/, 'webhook events are unique per provider event id');
    // Company source catalog (0012): additive columns with defaults on populated tables.
    assert.deepEqual((await client.query("select column_name from information_schema.columns where table_name='companies' and column_name in ('catalogSlug','indiaRelevance','roleFamilies','provenance') order by column_name")).rows.map((r) => r.column_name), ['catalogSlug', 'indiaRelevance', 'provenance', 'roleFamilies']);
    assert.equal((await client.query("select column_default from information_schema.columns where table_name='job_sources' and column_name='verificationStatus'")).rows[0].column_default, "'unverified'::text");
    // Career OS Phase 6.5 (0011): AI usage log keeps rows after account deletion (userId set null), never content.
    assert.equal((await client.query("select count(*)::int as n from information_schema.tables where table_schema='public' and table_name='ai_usage_log'")).rows[0].n, 1);
    assert.equal((await client.query("select confdeltype from pg_constraint where conname='ai_usage_log_userId_users_id_fk'")).rows[0].confdeltype, 'n');
    assert.equal((await client.query("select count(*)::int as n from information_schema.columns where table_name='ai_usage_log' and column_name in ('prompt','completion','content')")).rows[0].n, 0);
    // Career OS Phase 6 (0010): interview sessions survive job removal (jobId set null) and cascade with the user.
    const phase6 = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name='job_interview_sessions'");
    assert.equal(phase6.rows.length, 1);
    assert.equal((await client.query("select confdeltype from pg_constraint where conname='job_interview_sessions_jobId_jobs_id_fk'")).rows[0].confdeltype, 'n');
    assert.equal((await client.query("select confdeltype from pg_constraint where conname='job_interview_sessions_userId_users_id_fk'")).rows[0].confdeltype, 'c');
    const planFk = await client.query("select confdeltype from pg_constraint where conname='billing_subscriptions_planId_billing_plans_id_fk'");
    assert.equal(planFk.rows[0].confdeltype, 'r', 'plans with subscriptions cannot be deleted');
    // Career OS migrations (0005+) only add tables, columns and indexes: production safety. (0001 predates Career OS and is already applied on the hosted database.)
    const { readFileSync, readdirSync } = await import('node:fs');
    for (const file of readdirSync('src/lib/db/migrations').filter((f) => f.endsWith('.sql') && Number(f.slice(0, 4)) >= 5)) {
      const sql = readFileSync(`src/lib/db/migrations/${file}`, 'utf8');
      assert.ok(!/\b(DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM|RENAME)\b/i.test(sql), `${file} has no destructive statement`);
    }
  } finally { await client.close(); }
});

test('in-memory database at migration 0003 applies corrected 0004 through 0009', async () => {
  const client = new PGlite();
  try {
    const db = drizzle(client);
    await migrateInMemory(db, 4);
    await client.query("insert into users (id,email) values ('existing-dev-user','dev@example.invalid')");
    await migrateInMemory(db);
    assert.equal((await client.query('select count(*)::int as count from users')).rows[0].count, 1);
    assert.equal((await client.query('select count(*)::int as count from curriculum_tracks')).rows[0].count, 0);
    assert.equal((await client.query('select count(*)::int as count from drizzle.__drizzle_migrations')).rows[0].count, 13);
  } finally { await client.close(); }
});
