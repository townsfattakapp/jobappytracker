// Explicit opt-in live reads from official careers sources. All ingestion uses disposable PGlite.
// Does not load .env, import the application database, or contact JobAppy production.
import assert from 'node:assert/strict'
import { writeFileSync, mkdirSync } from 'node:fs'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

if (!process.argv.includes('--live')) throw new Error('Pass --live to allow read-only requests to official public careers sources')
await build({ entryPoints: { public: 'src/lib/ingestion/publicCareers.ts', providers: 'src/lib/ingestion/providers/index.ts', data: 'src/data/companyCatalog.ts', engine: 'src/lib/ingestion/engine.ts', schema: 'src/lib/db/schema.ts' }, outdir: 'scratch/enterprise-verification', bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, external: ['drizzle-orm', 'drizzle-orm/*', 'pg', 'next/*', 'next-auth', 'next-auth/*'], logLevel: 'silent' })
const { detectCareerSource, discoverCareerSource, publicCareersFetch } = await import('../scratch/enterprise-verification/public.mjs')
const { providerById } = await import('../scratch/enterprise-verification/providers.mjs')
const { COMPANY_CATALOG } = await import('../scratch/enterprise-verification/data.mjs')
const { ingestSource } = await import('../scratch/enterprise-verification/engine.mjs')
const schema = await import('../scratch/enterprise-verification/schema.mjs')
const client = new PGlite(), db = drizzle(client, { schema })
const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
const slugs = ['druva', 'mindtickle', 'confluent', 'adobe', 'freshworks', 'oracle', 'wipro', 'quess-corp', 'ibm', 'dell']
const rows = COMPANY_CATALOG.map((c) => ({ slug: c.slug, name: c.name, careersUrl: c.careersUrl, providerDetected: c.feed && c.feed.provider !== 'adzuna' ? c.feed.provider : detectCareerSource(c.careersUrl).provider, verification: 'NOT TESTED' }))
const checks = []
try {
  for (const slug of slugs) {
    const c = COMPANY_CATALOG.find((c) => c.slug === slug), row = rows.find((r) => r.slug === slug)
    if (!c) continue
    const record = { slug, provider: row.providerDetected, status: 'failed', fetched: 0, relevant: 0, duplicates: 0, published: 0, secondRunCreated: null, note: '' }
    try {
      let providerId, config
      if (c.feed && c.feed.provider !== 'adzuna') {
        providerId = c.feed.provider
        const [host, tenant, site] = c.feed.token.split('/')
        config = providerId === 'workday' ? { host, tenant, site, searches: [{ label: 'Public verification sample' }], maxPerSearch: 3 } : providerId === 'oraclecloud' ? { host, site: tenant, searches: [{ label: 'Public verification sample' }], maxPerSearch: 3 } : providerId === 'smartrecruiters' ? { company: c.feed.token, countries: [], maxGlobal: 3 } : providerId === 'lever' ? { site: c.feed.token } : { board: c.feed.token }
      } else {
        const discovery = await discoverCareerSource(c.careersUrl)
        row.providerDetected = discovery.provider; record.provider = discovery.provider
        if (discovery.status !== 'SUPPORTED') { record.status = discovery.status; record.note = discovery.note; row.verification = record.status; checks.push(record); console.log(JSON.stringify(record)); continue }
        providerId = discovery.adapter; config = { ...discovery.config, maxPerSearch: 3, concurrency: 1 }
      }
      const safe = publicCareersFetch(), signal = AbortSignal.timeout(45_000), incomplete = []
      const provider = providerById(providerId)
      const raw = await provider.fetchJobs({ id: slug, name: c.name, provider: providerId, baseUrl: c.careersUrl, config: { ...config, officialSource: true, concurrency: 1 } }, { fetch: (url, init) => safe(url, { ...init, signal }), log: () => {}, reportIncomplete: (message) => incomplete.push(message) })
      // Replaying the same fetched public snapshot proves SQL idempotency without repeatedly crawling the employer.
      await db.insert(schema.companies).values({ id: slug, slug, name: c.name })
      const [source] = await db.insert(schema.jobSources).values({ id: slug, slug, name: c.name, companyId: slug, type: 'ats_api', provider: providerId, ingestionAllowed: true, autoPublish: true, status: 'active', config: { ...config, officialSource: true } }).returning()
      const replay = { id: providerId, fetchJobs: async (_s, ctx) => { incomplete.forEach((message) => ctx.reportIncomplete?.(message)); return structuredClone(raw) } }
      const first = await ingestSource(db, source, { provider: replay })
      const second = await ingestSource(db, source, { provider: replay })
      assert.equal(second.created, 0, `${slug}: second run must never create duplicate jobs`)
      Object.assign(record, { status: first.status === 'success' ? 'INTEGRATED (LOCAL)' : 'PARTIAL', fetched: first.fetched, relevant: first.fetched - first.irrelevant, duplicates: first.duplicates, published: first.created, secondRunCreated: second.created, note: first.error ?? 'Official public payload ingested twice into isolated local database.' })
    } catch (error) { record.note = error.message; if (error.status === 'PROTECTED') record.status = 'PROTECTED' }
    row.verification = record.status; checks.push(record); console.log(JSON.stringify(record))
  }
  const distribution = Object.fromEntries([...new Set(rows.map((r) => r.providerDetected))].sort().map((p) => [p, rows.filter((r) => r.providerDetected === p).length]))
  const report = {
    checkedAt: new Date().toISOString(), scope: 'Official source network reads; disposable local database only. Sampled API imports are PARTIAL, not full integrations. URL-only classifications are not live verifications.',
    totalEnterpriseCompanies: COMPANY_CATALOG.length, portalOnlyCompanies: COMPANY_CATALOG.filter((c) => !c.feed).length,
    providerDistribution: distribution, successfullyIntegratedCompaniesLocal: checks.filter((r) => r.status === 'INTEGRATED (LOCAL)').length,
    unsupportedProtectedCompanies: checks.filter((r) => ['UNSUPPORTED', 'PROTECTED'].includes(r.status)).length,
    jobsFetched: checks.reduce((n, r) => n + r.fetched, 0), relevantJobs: checks.reduce((n, r) => n + r.relevant, 0), duplicatesRemoved: checks.reduce((n, r) => n + r.duplicates, 0), publishedJobsLocal: checks.reduce((n, r) => n + r.published, 0), publishedJobsProduction: 0,
    failedSources: checks.filter((r) => ['failed', 'PARTIAL', 'PROTECTED', 'REQUIRES MANUAL REVIEW'].includes(r.status)).map((r) => r.slug),
    providersAdded: ['public-careers (public Schema.org JSON-LD / JSON JobPosting data)'],
    providersReused: ['greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters', 'oraclecloud'],
    notTestedSources: rows.filter((r) => r.verification === 'NOT TESTED').map((r) => r.slug), checks, companies: rows,
  }
  mkdirSync('docs/reports', { recursive: true })
  writeFileSync('docs/reports/enterprise-public-verification.json', JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ ...report, notTestedSources: report.notTestedSources.length, checks: undefined, companies: undefined }, null, 2))
} finally { await client.close() }
