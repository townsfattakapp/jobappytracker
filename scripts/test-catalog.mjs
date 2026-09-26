// Company source catalog: data integrity (size, unique slugs, official URLs,
// valid role families, feeds only where verification evidence exists),
// idempotent seeding on PGlite, read-only verification with a mocked fetch
// (ok / 404 / timeout), status derivation, and admin-decision preservation.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({
  entryPoints: { catalog: 'src/lib/server/catalog.ts', data: 'src/data/companyCatalog.ts', taxonomy: 'src/lib/jobs/taxonomy.ts', schema: 'src/lib/db/schema.ts' },
  outdir: 'scratch/catalog-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'swap-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export let db = globalThis.__catalogDb' })) } }],
  logLevel: 'silent',
})
const { COMPANY_CATALOG, CATALOG_SOURCE_SLUG } = await import('../scratch/catalog-tests/data.mjs')
const { ROLE_CATEGORY_IDS } = await import('../scratch/catalog-tests/taxonomy.mjs')
const schema = await import('../scratch/catalog-tests/schema.mjs')

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.users).values([{ id: 'admin', email: 'admin@example.invalid' }])
  globalThis.__catalogDb = db
  const catalog = await import(`../scratch/catalog-tests/catalog.mjs?db=${Date.now()}`)
  return { client, db, catalog }
}

test('catalog data: 50–60 companies, unique official identities, valid role families, feeds only with verification evidence', () => {
  assert.ok(COMPANY_CATALOG.length >= 50 && COMPANY_CATALOG.length <= 60, `size ${COMPANY_CATALOG.length}`)
  const slugs = new Set(COMPANY_CATALOG.map((c) => c.slug))
  assert.equal(slugs.size, COMPANY_CATALOG.length, 'unique slugs')
  for (const c of COMPANY_CATALOG) {
    assert.match(c.slug, /^[a-z0-9-]+$/)
    assert.match(c.careersUrl, /^https:\/\//, `${c.slug} careers url`)
    assert.match(c.website, /^https:\/\//)
    assert.ok(!/linkedin\.com|google\.com\/search|indeed|naukri|glassdoor/i.test(c.careersUrl), `${c.slug} links the official page, not an aggregator`)
    assert.ok(['strong', 'moderate', 'international'].includes(c.indiaRelevance))
    assert.ok(c.roleFamilies.length > 0 && c.roleFamilies.every((f) => ROLE_CATEGORY_IDS.includes(f)), `${c.slug} role families valid`)
    if (c.feed) {
      assert.ok(['greenhouse', 'lever', 'ashby'].includes(c.feed.provider), 'only public, documented job-board APIs')
      assert.match(c.feed.token, /^[a-z0-9-]+$/i)
      assert.match(c.feed.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, `${c.slug} carries a verification date`)
      assert.ok(Number.isInteger(c.feed.jobsAtVerification) && c.feed.jobsAtVerification >= 0)
      assert.equal(c.portal, c.feed.provider)
    } else assert.equal(c.portal, 'careers-site', `${c.slug} without a feed is a careers portal, never marked integrated`)
  }
  const verified = COMPANY_CATALOG.filter((c) => c.feed)
  assert.ok(verified.length >= 15 && verified.length < COMPANY_CATALOG.length, `verified feeds ${verified.length}`)
  assert.ok(COMPANY_CATALOG.filter((c) => c.indiaRelevance === 'strong').length >= 30, 'India-relevant majority')
  assert.equal(COMPANY_CATALOG.find((c) => c.slug === 'clear').feed, null, 'the misleading "clear" Greenhouse board is not linked to ClearTax')
})

test('seeding is idempotent, marks unsupported portals Not configured with the careers link, and preserves admin decisions', async () => {
  const { client, db, catalog } = await freshDb()
  try {
    const first = await catalog.seedCatalog('admin')
    assert.equal(first.companiesCreated, COMPANY_CATALOG.length)
    assert.equal(first.sourcesCreated, COMPANY_CATALOG.length)
    const second = await catalog.seedCatalog('admin')
    assert.equal(second.companiesCreated, 0)
    assert.equal(second.sourcesCreated, 0)
    assert.equal(second.companiesUpdated, COMPANY_CATALOG.length)
    assert.equal((await client.query('select count(*)::int as n from companies')).rows[0].n, COMPANY_CATALOG.length, 'no duplicates')
    const status = await catalog.catalogStatus()
    assert.equal(status.total, COMPANY_CATALOG.length)
    assert.equal(status.seeded, COMPANY_CATALOG.length)
    const unsupported = status.rows.filter((r) => !r.feed)
    assert.ok(unsupported.every((r) => r.status === 'Unsupported' && r.ingestionAllowed === false && r.verificationStatus === 'unsupported' && r.careersUrl.startsWith('https://')))
    const ms = (await client.query("select provider, notes, \"ingestionAllowed\" from job_sources where slug = $1", [CATALOG_SOURCE_SLUG('microsoft')])).rows[0]
    assert.equal(ms.provider, 'manual')
    assert.match(ms.notes, /Not configured/)
    assert.equal(ms.ingestionAllowed, false)
    const configured = status.rows.filter((r) => r.feed)
    assert.ok(configured.every((r) => r.status === 'Configured' && r.ingestionAllowed && r.verificationStatus === 'verified'))
    const gl = (await client.query("select provider, config, \"autoPublish\", \"scheduleEnabled\" from job_sources where slug = $1", [CATALOG_SOURCE_SLUG('gitlab')])).rows[0]
    assert.equal(gl.provider, 'greenhouse')
    assert.deepEqual(gl.config, { board: 'gitlab' })
    assert.equal(gl.scheduleEnabled, false, 'verified sources are not scheduled until an admin opts in')
    assert.equal(gl.autoPublish, true)
    assert.equal(await catalog.scheduleCatalog('admin', true), COMPANY_CATALOG.filter((c) => c.feed).length)
    assert.equal((await client.query('select count(*)::int as n from job_sources where slug like $1 and "scheduleEnabled" = true', ['catalog-%'])).rows[0].n, COMPANY_CATALOG.filter((c) => c.feed).length)
    assert.equal(await catalog.scheduleCatalog('admin', false), COMPANY_CATALOG.filter((c) => c.feed).length)
    assert.equal((await client.query("select config from job_sources where slug = $1", [CATALOG_SOURCE_SLUG('cred')])).rows[0].config.site, 'cred')
    // Admin pauses a source and disallows ingestion; re-seeding keeps that.
    await client.query("update job_sources set status='paused', \"ingestionAllowed\"=false where slug=$1", [CATALOG_SOURCE_SLUG('gitlab')])
    await catalog.seedCatalog('admin')
    const kept = (await client.query("select status, \"ingestionAllowed\" from job_sources where slug=$1", [CATALOG_SOURCE_SLUG('gitlab')])).rows[0]
    assert.equal(kept.status, 'paused')
    assert.equal(kept.ingestionAllowed, false)
    assert.equal((await catalog.catalogStatus()).rows.find((r) => r.slug === 'gitlab').status, 'Not configured')
    const audit = (await client.query("select count(*)::int as n from admin_audit_log where action='catalog.seed'")).rows[0].n
    assert.equal(audit, 3)
  } finally {
    await client.close()
  }
})

test('verification is read-only, records 200 / 404 / timeout outcomes, and drives Healthy / Degraded / Configured statuses', async () => {
  const { client, catalog } = await freshDb()
  try {
    await catalog.seedCatalog('admin')
    const calls = []
    const fetchImpl = async (url) => {
      calls.push(url)
      if (url.includes('/boards/gitlab/')) return new Response(JSON.stringify({ jobs: [{ id: 1 }, { id: 2 }] }), { status: 200 })
      if (url.includes('/postings/cred')) return new Response(JSON.stringify([{ id: 'a' }]), { status: 200 })
      if (url.includes('/boards/druva/')) return new Response('not found', { status: 404 })
      if (url.includes('/job-board/confluent')) throw Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' })
      return new Response(JSON.stringify({ jobs: [] }), { status: 200 })
    }
    const results = await catalog.verifyCatalogFeeds('admin', { fetchImpl, slugs: ['gitlab', 'cred', 'druva', 'confluent'] })
    assert.equal(calls.length, 4, 'one read-only probe per feed')
    assert.ok(calls.every((u) => /greenhouse\.io|lever\.co|ashbyhq\.com/.test(u)), 'only official APIs are called')
    const by = Object.fromEntries(results.map((r) => [r.slug, r]))
    assert.equal(by.gitlab.status, 'verified')
    assert.equal(by.gitlab.count, 2)
    assert.equal(by.cred.status, 'verified')
    assert.equal(by.druva.status, 'failed')
    assert.equal(by.druva.httpStatus, 404)
    assert.equal(by.confluent.status, 'failed')
    assert.match(by.confluent.note, /timeout/i)
    assert.equal((await client.query('select count(*)::int as n from jobs')).rows[0].n, 0, 'verification never ingests')
    const status = await catalog.catalogStatus()
    const row = (slug) => status.rows.find((r) => r.slug === slug)
    assert.equal(row('druva').status, 'Degraded')
    assert.equal(row('confluent').status, 'Degraded')
    assert.equal(row('gitlab').status, 'Configured')
    assert.equal(row('gitlab').lastVerifiedJobCount, 2)
    // Run history drives Healthy / Degraded.
    await client.query("update job_sources set \"lastRunStatus\"='success', \"lastRunAt\"=now(), \"lastSuccessAt\"=now() where slug=$1", [CATALOG_SOURCE_SLUG('gitlab')])
    await client.query("update job_sources set \"lastRunStatus\"='failed', \"lastRunAt\"=now(), \"lastError\"='boom' where slug=$1", [CATALOG_SOURCE_SLUG('cred')])
    const after = await catalog.catalogStatus()
    assert.equal(after.rows.find((r) => r.slug === 'gitlab').status, 'Healthy')
    assert.equal(after.rows.find((r) => r.slug === 'cred').status, 'Degraded')
    assert.equal(after.counts.Unsupported, COMPANY_CATALOG.filter((c) => !c.feed).length)
    assert.equal((await client.query("select count(*)::int as n from admin_audit_log where action='catalog.verify'")).rows[0].n, 1)
  } finally {
    await client.close()
  }
})
