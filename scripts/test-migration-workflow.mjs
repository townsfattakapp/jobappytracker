// Production migration workflow: the approval gate refuses without a matching
// double approval and never connects; the read-only preflight reports pending
// files, destructive statements, out-of-order and unknown ledger rows.
import assert from 'node:assert/strict'
import test from 'node:test'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { approvalGate, migrationTarget } from './migrate-production.mjs'
import { loadJournal, preflight, formatPreflight, DESTRUCTIVE } from './lib/migration-preflight.mjs'

const ENV = { DATABASE_URL: 'postgresql://app:PRIVATE_TEST_PASSWORD@db.example.invalid:5432/tsdb?sslmode=require' }

test('approval gate: refuses without both approvals, with a mismatched target, and never opens a connection', () => {
  assert.equal(migrationTarget(ENV), 'db.example.invalid:5432/tsdb')
  assert.equal(approvalGate(ENV, []).ok, false)
  assert.equal(approvalGate(ENV, ['--approve=db.example.invalid:5432/tsdb']).ok, false, 'command-line approval alone is not enough')
  assert.equal(approvalGate({ ...ENV, MIGRATE_PRODUCTION_APPROVED: 'db.example.invalid:5432/tsdb' }, []).ok, false, 'environment approval alone is not enough')
  assert.equal(approvalGate({ ...ENV, MIGRATE_PRODUCTION_APPROVED: 'db.example.invalid:5432/tsdb' }, ['--approve=other.example.invalid:5432/tsdb']).ok, false, 'target must match')
  assert.equal(approvalGate({ ...ENV, MIGRATE_PRODUCTION_APPROVED: 'db.example.invalid:5432/tsdb' }, ['--approve=db.example.invalid:5432/tsdb']).ok, true)
  const result = spawnSync(process.execPath, ['scripts/migrate-production.mjs'], { encoding: 'utf8', env: { ...process.env, ...ENV, MIGRATE_PRODUCTION_APPROVED: '' } })
  assert.equal(result.status, 3)
  assert.match(result.stderr, /Refusing: production migrations need --approve/)
  assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE_TEST_PASSWORD|ENOTFOUND|Applying/)
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  assert.equal(pkg.scripts['vercel-build'], 'next build', 'deploys never migrate automatically')
})

test('preflight: reports pending additive migrations on a hosted-like database, then up to date after migrating', async () => {
  const client = new PGlite()
  const db = drizzle(client)
  const all = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of all) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  const query = async (sql, params) => (await client.query(sql, params)).rows
  const empty = await preflight(query)
  assert.equal(empty.appliedCount, 0)
  assert.equal(empty.pending.length, empty.journalCount)
  // Hosted state: 0000–0004 applied.
  await db.dialect.migrate(all.slice(0, 5), db.session, { migrationsFolder: 'src/lib/db/migrations' })
  const hosted = await preflight(query)
  assert.equal(hosted.appliedCount, 5)
  assert.equal(hosted.pending.length, hosted.journalCount - 5)
  assert.deepEqual(hosted.pending.map((p) => p.tag).slice(0, 2), ['0005_career_os_phase1', '0006_career_os_phase2'])
  assert.equal(hosted.destructive.length, 0, 'Career OS migrations are additive')
  assert.equal(hosted.ok, true)
  assert.match(formatPreflight(hosted, 'test'), /pending: 8/)
  await db.dialect.migrate(all, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  const done = await preflight(query)
  assert.equal(done.pending.length, 0)
  assert.equal(done.ok, true)
  assert.match(formatPreflight(done, 'test'), /up to date/)
  // A ledger row this checkout does not know about blocks the run.
  await client.query("insert into drizzle.__drizzle_migrations (hash, created_at) values ('deadbeef', 9999999999999)")
  const ahead = await preflight(query)
  assert.equal(ahead.ok, false)
  assert.match(ahead.problems[0], /unknown to this checkout/)
  await client.close()
  // The scan recognises destructive statements and the checked-in journal is ordered.
  assert.ok(DESTRUCTIVE.test('ALTER TABLE x DROP COLUMN y'))
  assert.ok(!DESTRUCTIVE.test('ALTER TABLE x ADD COLUMN y text'))
  const journal = loadJournal()
  assert.ok(journal.every((e, i) => i === 0 || journal[i - 1].when < e.when))
  assert.equal(journal.filter((e) => e.idx >= 5 && e.destructive.length).length, 0)
})
