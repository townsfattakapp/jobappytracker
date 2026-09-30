// All database writes are confined to disposable PGlite. No environment file is loaded.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({ entryPoints: { public: 'src/lib/ingestion/publicCareers.ts', engine: 'src/lib/ingestion/engine.ts', normalize: 'src/lib/ingestion/normalize.ts', schema: 'src/lib/db/schema.ts', catalog: 'src/lib/server/catalog.ts' }, outdir: 'scratch/enterprise-tests', bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, external: ['drizzle-orm', 'drizzle-orm/*', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'], plugins: [{ name: 'isolated-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => a.importer.includes('server') ? { path: a.path, namespace: 'isolated' } : undefined); b.onLoad({ filter: /.*/, namespace: 'isolated' }, () => ({ contents: 'export const db = globalThis.__enterpriseDb' })) } }], logLevel: 'silent' })
const api = await import('../scratch/enterprise-tests/public.mjs')
const { ingestSource } = await import('../scratch/enterprise-tests/engine.mjs')
const { normalizeRawJob } = await import('../scratch/enterprise-tests/normalize.mjs')
const schema = await import('../scratch/enterprise-tests/schema.mjs')
const job = (over = {}) => ({ '@type': 'JobPosting', identifier: { value: 'REQ-42' }, title: 'Backend Engineer', description: '<h3>Requirements</h3><p>Java and SQL.</p><h3>Preferred qualifications</h3><p>Kafka.</p>', url: 'https://careers.example.com/jobs/42', ...over })
const html = (jobs) => `<script type="application/ld+json">${JSON.stringify(jobs)}</script>`
const mock = (pages, calls = []) => async (value) => {
  const url = String(value); calls.push(url)
  if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /')
  const valueAt = pages[url]
  if (valueAt instanceof Response) return valueAt.clone()
  return new Response(valueAt ?? '', { status: valueAt === undefined ? 404 : 200 })
}

test('URL detection covers each ATS without inventing tenant identities', () => {
  for (const [url, provider, adapter] of [
    ['https://job-boards.greenhouse.io/acme', 'greenhouse', 'greenhouse'],
    ['https://boards.greenhouse.io/embed/job_board?for=acme', 'greenhouse', 'greenhouse'],
    ['https://jobs.lever.co/acme', 'lever', 'lever'],
    ['https://jobs.ashbyhq.com/acme', 'ashby', 'ashby'],
    ['https://careers.smartrecruiters.com/Acme', 'smartrecruiters', 'smartrecruiters'],
    ['https://acme.wd5.myworkdayjobs.com/en-US/External', 'workday', 'workday'],
    ['https://acme.successfactors.com/careers', 'successfactors', null],
    ['https://enterprise.example.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs', 'oraclecloud', 'oraclecloud'],
    ['https://careers.example.com/', 'static/server-rendered', null],
  ]) {
    const actual = api.detectCareerSource(url)
    assert.equal(actual.provider, provider); assert.equal(actual.adapter, adapter)
    assert.notEqual(actual.status, 'SUPPORTED', 'a URL is never integration evidence')
  }
})

test('discovery follows explicit ATS links, rejects ambiguous identities and retains unsupported URLs', async () => {
  const url = 'https://careers.example.com/'
  const one = await api.discoverCareerSource(url, mock({ [url]: '<a href="https://jobs.lever.co/acme">Jobs</a>' }))
  assert.equal(one.adapter, 'lever'); assert.deepEqual(one.config, { site: 'acme' })
  const ambiguous = await api.discoverCareerSource(url, mock({ [url]: '<a href="https://jobs.lever.co/acme">Jobs</a><a href="https://jobs.lever.co/other">Other</a>' }))
  assert.equal(ambiguous.status, 'REQUIRES MANUAL REVIEW')
  assert.equal((await api.discoverCareerSource(url, mock({ [url]: '<p>Careers</p>' }))).status, 'UNSUPPORTED')
  assert.equal((await api.discoverCareerSource(url, mock({ [url]: JSON.stringify({ '@graph': [job()] }) }))).provider, 'custom/public careers API')
})

test('robots rules, challenge pages, redirects and non-public URLs stop access', async () => {
  assert.equal(api.robotsAllowed('User-agent: *\nDisallow: /jobs\nAllow: /jobs/public', '/jobs/private'), false)
  assert.equal(api.robotsAllowed('User-agent: *\nDisallow: /jobs\nAllow: /jobs/public', '/jobs/public/1'), true)
  assert.equal(api.robotsAllowed('User-agent: JobAppy\nDisallow: /\nUser-agent: *\nAllow: /', '/jobs'), false)
  const calls = []
  const fetcher = api.publicCareersFetch(async (url) => { calls.push(String(url)); return new Response('User-agent: *\nDisallow: /') })
  await assert.rejects(fetcher('https://careers.example.com/jobs'), /robots/)
  assert.equal(calls.length, 1, 'disallowed page was never fetched')
  await assert.rejects(api.publicCareersFetch(mock({}))('https://127.0.0.1/jobs'), /public HTTPS/)
  await assert.rejects(api.publicCareersFetch(mock({}))('https://www.linkedin.com/jobs'), /public HTTPS/)
  const url = 'https://careers.example.com/'
  const protectedResult = await api.discoverCareerSource(url, mock({ [url]: new Response('Blocked', { status: 403 }) }))
  assert.equal(protectedResult.status, 'PROTECTED')
  const challenge = api.publicCareersFetch(mock({ [url]: 'Verify you are human' }))
  await assert.rejects(challenge(url), /challenge/)
  await assert.rejects(challenge(url), /challenge/, 'a protected source remains stopped')
  const redirect = api.publicCareersFetch(mock({ [url]: new Response(null, { status: 302, headers: { location: 'http://localhost/private' } }) }))
  await assert.rejects(redirect(url), /public HTTPS/)
})

test('structured extraction and normalization preserve unknowns, requirements and technical relevance', () => {
  const [raw] = api.structuredJobs(html({ '@graph': [job({ qualifications: 'Java required', employmentType: 'PART_TIME', jobLocation: { address: { addressLocality: 'Bengaluru', addressCountry: 'India' } } })] }), 'https://careers.example.com/')
  const n = normalizeRawJob(raw)
  assert.equal(n.externalId, 'REQ-42'); assert.equal(n.locationCountry, 'India'); assert.equal(n.employmentType, 'part_time')
  assert.equal(n.level, 'unknown'); assert.equal(n.workMode, 'unknown'); assert.equal(n.postedAt, null)
  assert.equal(n.rawMetadata.requirements, 'Java required')
  assert.equal(n.rawMetadata.preferredQualifications, 'Kafka.')
  for (const title of ['Civil Engineer', 'Mechanical Engineer', 'Sales Associate', 'Hardware Engineer']) assert.equal(normalizeRawJob({ ...raw, title }).relevance.relevant, false, title)
  assert.equal(normalizeRawJob({ ...raw, title: 'QA Automation Engineer' }).relevance.relevant, true)
  assert.equal(api.structuredJobs(html(job({ url: 'https://thirdparty.example.com/job/42' })), 'https://careers.example.com/').length, 0)
})

async function database() {
  const client = new PGlite(), db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.companies).values({ id: 'acme', slug: 'acme', name: 'Acme' })
  return { client, db }
}
async function source(db, id, provider, config = {}) {
  return (await db.insert(schema.jobSources).values({ id, slug: id, name: id, companyId: 'acme', type: 'career_page', provider, ingestionAllowed: true, autoPublish: true, status: 'active', baseUrl: 'https://careers.example.com/', config }).returning())[0]
}

test('public careers ingestion is idempotent; official data replaces aggregator data in place', async () => {
  const { client, db } = await database()
  try {
    const aggregator = await source(db, 'third-party', 'adzuna')
    const raw = { externalId: 'REQ-42', title: 'Backend Engineer', descriptionText: 'Old description', location: null, sourceUrl: 'https://aggregator.example.com/42' }
    await ingestSource(db, aggregator, { provider: { id: 'test', fetchJobs: async () => [raw] } })
    const id = (await db.select().from(schema.jobs))[0].id
    const official = await source(db, 'official', 'public-careers', { officialSource: true, url: 'https://careers.example.com/' })
    const fetchImpl = mock({ 'https://careers.example.com/': html([job(), job({ identifier: { value: 'OTHER' }, title: 'Sales Associate', url: 'https://careers.example.com/jobs/99' })]) })
    const first = await ingestSource(db, official, { fetchImpl })
    assert.equal(first.status, 'success'); assert.equal(first.duplicates, 1); assert.equal(first.updated, 1); assert.equal(first.irrelevant, 1)
    const second = await ingestSource(db, official, { fetchImpl })
    assert.equal(second.status, 'success'); assert.equal(second.created, 0); assert.equal(second.unchanged, 1)
    const rows = await db.select().from(schema.jobs)
    assert.equal(rows.length, 1); assert.equal(rows[0].id, id); assert.equal(rows[0].sourceId, official.id)
    assert.equal(rows[0].workMode, 'unknown'); assert.equal(rows[0].level, 'unknown')
    assert.equal(rows[0].postedAt, null)
    assert.equal(rows[0].applyUrl, job().url)
    const protectedRun = await ingestSource(db, official, { fetchImpl: mock({ 'https://careers.example.com/': new Response('Forbidden', { status: 403 }) }) })
    assert.equal(protectedRun.status, 'failed')
    assert.equal((await client.query('select "verificationStatus" from job_sources where id=$1', [official.id])).rows[0].verificationStatus, 'protected')
    assert.notEqual((await db.select().from(schema.jobs))[0].lifecycle, 'stale')
  } finally { await client.close() }
})

test('discovery persists dynamic configuration across catalog refresh and exposes sync counters', async () => {
  const { client, db } = await database()
  try {
    globalThis.__enterpriseDb = db
    const catalog = await import('../scratch/enterprise-tests/catalog.mjs')
    await catalog.seedCatalog(null)
    const status = await catalog.catalogStatus(), company = status.rows.find((r) => r.slug === 'wipro')
    const fetchImpl = mock({ [company.careersUrl]: html(job({ url: new URL('/jobs/42', company.careersUrl).href })) })
    const [found] = await catalog.discoverCatalog(null, ['wipro'], fetchImpl)
    assert.equal(found.status, 'SUPPORTED')
    await catalog.seedCatalog(null)
    const row = (await catalog.catalogStatus()).rows.find((r) => r.slug === 'wipro')
    assert.equal(row.extractionSupported, true); assert.equal(row.integrated, false)
    assert.equal(row.jobsFetched, null, 'verification is not ingestion')
    const saved = (await client.query('select provider, config from job_sources where id=$1', [row.sourceId])).rows[0]
    assert.equal(saved.provider, 'public-careers'); assert.ok(saved.config.discovery)
    assert.equal(await catalog.scheduleCatalog(null, true, ['wipro']), 1)
  } finally { await client.close() }
})

test('fresh schema imports retain unknown dates and public page omissions do not falsely stale jobs', async () => {
  const { client, db } = await database()
  try {
    const official = await source(db, 'schema-feed', 'public-careers', { officialSource: true })
    const url = 'https://careers.example.com/'
    const first = await ingestSource(db, official, { fetchImpl: mock({ [url]: html(job()) }) })
    assert.equal(first.status, 'success'); assert.equal(first.created, 1)
    const raw = (await db.select().from(schema.jobs))[0]
    assert.equal(raw.postedAt, null); assert.equal(raw.employmentType, 'unknown'); assert.equal(raw.locationCountry, null)
    const other = job({ identifier: 'REQ-43', url: 'https://careers.example.com/jobs/43' })
    await ingestSource(db, official, { fetchImpl: mock({ [url]: html(other) }) })
    assert.ok((await db.select().from(schema.jobs)).every((r) => r.lifecycle !== 'stale'))
    const expired = await ingestSource(db, official, { fetchImpl: mock({ [url]: html(job({ validThrough: '2020-01-01' })) }) })
    assert.equal(expired.expired, 1, 'explicit expiry is honoured even for a non-exhaustive public crawl')
  } finally { await client.close() }
})
