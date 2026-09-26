// Scheduled ingestion: overlap prevention, retry/backoff, provider failure
// isolation, run accounting and the sweep, on a disposable PGlite database
// migrated with the real migration files.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({
  entryPoints: { scheduler: 'src/lib/ingestion/scheduler.ts', engine: 'src/lib/ingestion/engine.ts', schema: 'src/lib/db/schema.ts' },
  outdir: 'scratch/scheduler-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next-auth', 'next-auth/*', 'next/*'],
  logLevel: 'silent',
})
const scheduler = await import('../scratch/scheduler-tests/scheduler.mjs')
const schema = await import('../scratch/scheduler-tests/schema.mjs')

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.companies).values({ id: 'c1', name: 'Acme', slug: 'acme' })
  return { client, db }
}

const listing = (id, title = 'Backend Engineer') => ({ externalId: id, title, descriptionText: 'Build services with Java and Spring Boot. 3+ years experience.', location: 'Pune, India', sourceUrl: `https://jobs.example.com/${id}` })

async function addSource(db, id, jobs, over = {}) {
  const [row] = await db.insert(schema.jobSources).values({ id, name: `Source ${id}`, slug: id, type: 'ats_api', provider: 'fixture', ingestionAllowed: true, status: 'active', companyId: 'c1', autoPublish: true, config: { jobs }, ...over }).returning()
  return row
}

/** A provider that fails a configurable number of times before succeeding, or always. */
function flakyProvider(failures, message = 'fetch failed: ECONNRESET') {
  let calls = 0
  return {
    calls: () => calls,
    provider: {
      id: 'fixture',
      label: 'flaky',
      configHelp: '',
      async fetchJobs(source) {
        calls += 1
        if (calls <= failures) throw new Error(message)
        return (source.config.jobs || []).map((j) => ({ ...j, locations: [], countries: [], raw: {} }))
      },
    },
  }
}

test('a failing provider does not affect other sources or existing jobs', async () => {
  const { client, db } = await freshDb()
  try {
    await addSource(db, 'good', [listing('g1'), listing('g2', 'Data Engineer')])
    await addSource(db, 'bad', [listing('b1')], { config: { jobs: 'not-a-list' }, provider: 'fixture' })
    // First pass: both succeed (bad has zero listings).
    const first = await scheduler.runScheduledIngestion(db, { sleep: async () => {}, backoffMs: 0 })
    assert.deepEqual(first.sources.map((s) => [s.sourceId, s.status]), [['bad', 'success'], ['good', 'success']])
    assert.equal((await db.query.jobs.findMany()).length, 2)
    // Second pass with a provider that always throws for every source: failures are recorded, existing jobs untouched.
    const always = flakyProvider(99, 'Greenhouse responded 500 for board x')
    const second = await scheduler.runScheduledIngestion(db, { provider: always.provider, sleep: async () => {}, backoffMs: 0, maxAttempts: 2 })
    assert.ok(second.sources.every((s) => s.status === 'failed' && s.attempts === 2), JSON.stringify(second.sources))
    const jobs = await db.query.jobs.findMany()
    assert.equal(jobs.length, 2, 'no job was removed or changed by the failed pass')
    assert.ok(jobs.every((j) => j.status === 'published' && j.lifecycle !== 'stale'), 'failed fetches never mark jobs stale')
    const sources = await db.query.jobSources.findMany()
    assert.ok(sources.every((s) => s.lastRunStatus === 'failed' && /responded 500/.test(s.lastError) && s.lockedAt === null), 'failure reason recorded and locks released')
    assert.ok(sources.every((s) => s.lastSuccessAt instanceof Date), 'last successful sync kept from the first pass')
  } finally {
    await client.close()
  }
})

test('transient failures are retried with backoff and permanent ones are not', async () => {
  const { client, db } = await freshDb()
  try {
    await addSource(db, 's1', [listing('a')])
    const flaky = flakyProvider(2)
    const delays = []
    const report = await scheduler.runScheduledIngestion(db, { provider: flaky.provider, maxAttempts: 3, backoffMs: 100, sleep: async (ms) => delays.push(ms), sweep: false })
    assert.equal(report.sources[0].status, 'success')
    assert.equal(report.sources[0].attempts, 3)
    assert.deepEqual(delays, [100, 200], 'exponential backoff between attempts')
    const runs = await db.query.jobIngestionRuns.findMany({ orderBy: (t, { asc }) => asc(t.startedAt) })
    assert.deepEqual(runs.map((r) => [r.status, r.trigger, r.attempts]), [['failed', 'scheduled', 1], ['failed', 'scheduled', 2], ['success', 'scheduled', 3]])
    assert.ok(runs.every((r) => typeof r.durationMs === 'number'))

    const permanent = flakyProvider(99, 'Greenhouse source needs config.board (letters, digits, dashes)')
    const again = await scheduler.runScheduledIngestion(db, { provider: permanent.provider, maxAttempts: 3, backoffMs: 0, sleep: async () => {}, sweep: false })
    assert.equal(again.sources[0].status, 'failed')
    assert.equal(again.sources[0].attempts, 1, 'a configuration error is not retried')
    assert.equal(permanent.calls(), 1)
  } finally {
    await client.close()
  }
})

test('overlapping runs for the same source are skipped and stale locks recover', async () => {
  const { client, db } = await freshDb()
  try {
    await addSource(db, 'locked', [listing('l1')])
    const token = await scheduler.acquireSourceLock(db, 'locked', new Date(), 15 * 60_000)
    assert.ok(token)
    const during = await scheduler.runScheduledIngestion(db, { sleep: async () => {}, sweep: false })
    assert.equal(during.sources[0].status, 'skipped')
    assert.match(during.sources[0].reason, /holds the lock/)
    const skipped = await db.query.jobIngestionRuns.findMany()
    assert.equal(skipped.length, 1)
    assert.equal(skipped[0].status, 'skipped')
    assert.equal((await db.query.jobs.findMany()).length, 0, 'nothing was ingested while locked')
    // A second acquire fails while the lock is fresh, succeeds once it is stale.
    assert.equal(await scheduler.acquireSourceLock(db, 'locked', new Date(), 15 * 60_000), null)
    const later = new Date(Date.now() + 16 * 60_000)
    assert.ok(await scheduler.acquireSourceLock(db, 'locked', later, 15 * 60_000), 'a lock older than the timeout is treated as abandoned')
    await scheduler.releaseSourceLock(db, 'locked', token) // wrong token: must not release the new one
    const [row] = await db.select().from(schema.jobSources)
    assert.ok(row.lockedAt, 'releasing with a stale token does not clear a newer lock')
    await scheduler.releaseSourceLock(db, 'locked', row.lockToken)
    const after = await scheduler.runScheduledIngestion(db, { sleep: async () => {}, sweep: false })
    assert.equal(after.sources[0].status, 'success')
    assert.equal((await db.query.jobs.findMany()).length, 1)
  } finally {
    await client.close()
  }
})

test('the scheduled pass runs the stale/expiry sweep and honours scheduleEnabled', async () => {
  const { client, db } = await freshDb()
  try {
    await addSource(db, 'on', [listing('o1')])
    await addSource(db, 'off', [listing('x1')], { scheduleEnabled: false })
    const old = new Date(Date.now() - 30 * 86_400_000)
    await db.insert(schema.jobs).values({ id: 'old', companyId: 'c1', title: 'Old', normalizedTitle: 'old', roleCategory: 'backend', description: 'd', level: 'mid', employmentType: 'full_time', workMode: 'remote', region: 'india', applyUrl: 'https://a/old', fingerprint: 'f-old', status: 'published', lifecycle: 'verified', lastSeenAt: old })
    const report = await scheduler.runScheduledIngestion(db, { sleep: async () => {} })
    assert.deepEqual(report.sources.map((s) => s.sourceId), ['on'], 'sources with scheduling off are not run')
    assert.deepEqual(report.sweep, { stale: 0, expired: 1 })
    const oldRow = await db.query.jobs.findFirst({ where: (t, { eq }) => eq(t.id, 'old') })
    assert.equal(oldRow.status, 'expired')
    assert.ok(report.startedAt <= report.finishedAt)
  } finally {
    await client.close()
  }
})
