// Ingestion, normalisation and lifecycle tests. Pure functions run from the
// esbuild bundle; the engine runs against a disposable in-memory PostgreSQL
// (PGlite) migrated with the real migration files, so idempotency, duplicate
// prevention and the stale/expired sweep are exercised on real SQL.
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({
  entryPoints: {
    normalize: 'src/lib/ingestion/normalize.ts',
    engine: 'src/lib/ingestion/engine.ts',
    providers: 'src/lib/ingestion/providers/index.ts',
    skills: 'src/lib/jobs/skills.ts',
    schema: 'src/lib/db/schema.ts',
  },
  outdir: 'scratch/ingestion-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next-auth', 'next-auth/*', 'next/*'],
  logLevel: 'silent',
})

const normalize = await import('../scratch/ingestion-tests/normalize.mjs')
const engine = await import('../scratch/ingestion-tests/engine.mjs')
const providers = await import('../scratch/ingestion-tests/providers.mjs')
const skills = await import('../scratch/ingestion-tests/skills.mjs')
const schema = await import('../scratch/ingestion-tests/schema.mjs')

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  return { client, db }
}

async function seedSource(db, overrides = {}) {
  const companyId = 'c-acme'
  await db.insert(schema.companies).values({ id: companyId, name: 'Acme', slug: 'acme' })
  const [source] = await db
    .insert(schema.jobSources)
    .values({ id: 's-fixture', name: 'Acme fixture', slug: 'acme-fixture', type: 'ats_api', provider: 'fixture', ingestionAllowed: true, status: 'active', companyId, autoPublish: true, config: { jobs: [] }, ...overrides })
    .returning()
  return source
}

const listing = (over) => ({
  externalId: 'j1',
  title: 'Senior Backend Engineer (Java)',
  descriptionHtml: '&lt;p&gt;Build services.&lt;/p&gt;&lt;h3&gt;Requirements&lt;/h3&gt;&lt;ul&gt;&lt;li&gt;5+ years with Java and Spring Boot&lt;/li&gt;&lt;li&gt;PostgreSQL&lt;/li&gt;&lt;/ul&gt;&lt;h3&gt;Nice to have&lt;/h3&gt;&lt;ul&gt;&lt;li&gt;Kafka&lt;/li&gt;&lt;/ul&gt;',
  location: 'Remote, Bangalore',
  locations: ['India'],
  department: 'Engineering',
  postedAt: '2026-09-20T00:00:00Z',
  sourceUrl: 'https://job-boards.example.com/acme/jobs/1',
  ...over,
})

test('htmlToText decodes double-encoded Greenhouse content and keeps list structure', () => {
  const text = normalize.htmlToText('&lt;div&gt;&lt;p&gt;Hello &amp;amp; welcome&lt;/p&gt;&lt;ul&gt;&lt;li&gt;One&lt;/li&gt;&lt;li&gt;Two&lt;/li&gt;&lt;/ul&gt;&lt;/div&gt;')
  assert.equal(text, 'Hello & welcome\n• One\n• Two')
})

test('parseLocation separates city, country, region and remote scope', () => {
  const blr = normalize.parseLocation('Remote, Bangalore', ['India'])
  assert.deepEqual([blr.city, blr.country, blr.region, blr.remote, blr.remoteScope], ['Bangalore', 'India', 'india', true, 'country'])
  const berlin = normalize.parseLocation('Berlin, Germany')
  assert.deepEqual([berlin.city, berlin.country, berlin.region, berlin.remote], ['Berlin', 'Germany', 'international', false])
  const eu = normalize.parseLocation('Remote - European Union', [], ['Spain', 'Italy'])
  assert.deepEqual([eu.region, eu.remoteScope, eu.regionName, eu.eligibleCountries.sort()], ['international', 'region', 'EMEA', ['Italy', 'Spain']])
  const anywhere = normalize.parseLocation('Remote (Worldwide)')
  assert.equal(anywhere.remoteScope, 'worldwide')
  const usRemote = normalize.parseLocation('Remote - US')
  assert.deepEqual([usRemote.country, usRemote.remoteScope], ['United States', 'country'])
  const hyd = normalize.parseLocation('Hyderabad')
  assert.deepEqual([hyd.city, hyd.country, hyd.region], ['Hyderabad', 'India', 'india'])
})

test('experience, level, employment type and work mode are detected deterministically', () => {
  assert.deepEqual(normalize.detectExperience('We need 3-5 years of experience.'), { min: 3, max: 5 })
  assert.deepEqual(normalize.detectExperience('Minimum of four years in backend work'), { min: 4, max: null })
  assert.deepEqual(normalize.detectExperience('5+ yrs Java'), { min: 5, max: null })
  assert.deepEqual(normalize.detectExperience('No numbers here'), { min: null, max: null })
  assert.equal(normalize.detectLevel('Senior Software Engineer', null), 'senior')
  assert.equal(normalize.detectLevel('Software Engineer II', null), 'mid')
  assert.equal(normalize.detectLevel('Staff Engineer', null), 'lead')
  assert.equal(normalize.detectLevel('Software Engineering Intern', null), 'intern')
  assert.equal(normalize.detectLevel('Backend Developer', 6), 'senior')
  assert.equal(normalize.detectLevel('Backend Developer', null), 'mid')
  assert.equal(normalize.detectEmploymentType('Intern', 'Data Analyst'), 'internship')
  assert.equal(normalize.detectEmploymentType(null, 'Contract React Developer'), 'contract')
  assert.equal(normalize.detectEmploymentType('FullTime', 'Engineer'), 'full_time')
  const hybrid = normalize.detectWorkMode({ title: 'Engineer', location: 'Pune (Hybrid)', workplaceType: null }, normalize.parseLocation('Pune (Hybrid)'))
  assert.equal(hybrid, 'hybrid')
  const declared = normalize.detectWorkMode({ title: 'Engineer', location: 'Pune', workplaceType: 'remote' }, normalize.parseLocation('Pune'))
  assert.equal(declared, 'remote')
})

test('skill extraction uses the lexicon with aliases and word boundaries', () => {
  const found = skills.extractSkills('Experience with Java, Spring Boot, node.js and c++. Familiar with k8s, PostgreSQL and REST APIs. Javanese not required.')
  assert.deepEqual(found, ['Java', 'Spring Boot', 'Node.js', 'C++', 'Kubernetes', 'SQL', 'REST APIs'])
  assert.equal(skills.canonicalSkill('reactjs'), 'React')
  assert.equal(skills.sameSkill('node', 'Node.js'), true)
  assert.equal(skills.sameSkill('Java', 'JavaScript'), false)
})

test('classifyRole keeps curriculum-relevant roles and rejects other functions', () => {
  assert.equal(normalize.classifyRole('Senior Backend Engineer', null, []).roleCategory, 'backend')
  assert.equal(normalize.classifyRole('Data Scientist, Growth', null, []).roleCategory, 'data-scientist')
  assert.equal(normalize.classifyRole('Software Engineer', 'Platform', ['Kubernetes', 'Terraform', 'AWS']).roleCategory, 'devops-cloud')
  assert.equal(normalize.classifyRole('Software Engineer', null, []).roleCategory, 'software-engineer')
  assert.equal(normalize.classifyRole('Account Executive, Java Customers', null, ['Java']).roleCategory, null)
  assert.equal(normalize.classifyRole('Technical Recruiter', 'Engineering', []).roleCategory, null)
  assert.equal(normalize.classifyRole('Head of Marketing', null, []).roleCategory, null)
  const disabled = normalize.classifyRole('Data Analyst', null, [], { disabled: ['data-analyst'], extraHints: {} })
  assert.equal(disabled.roleCategory, null, 'disabled role families are irrelevant')
  const extra = normalize.classifyRole('Quant Developer', null, [], { disabled: [], extraHints: { backend: ['quant developer'] } })
  assert.equal(extra.roleCategory, 'backend', 'admin hints extend classification')
})

test('normalizeRawJob produces a complete, relevant job with split required/preferred skills', () => {
  const n = normalize.normalizeRawJob(listing({}))
  assert.equal(n.relevance.relevant, true)
  assert.equal(n.roleCategory, 'backend')
  assert.equal(n.level, 'senior')
  assert.equal(n.workMode, 'remote')
  assert.equal(n.region, 'india')
  assert.equal(n.remoteEligibility, 'country')
  assert.deepEqual(n.eligibleCountries, ['India'])
  assert.deepEqual(n.requiredSkills, ['Java', 'Spring Boot', 'SQL'])
  assert.deepEqual(n.preferredSkills, ['Kafka'])
  assert.deepEqual([n.experienceMin, n.experienceMax], [5, null])
  assert.equal(n.applyUrl, 'https://job-boards.example.com/acme/jobs/1')
  const irrelevant = normalize.normalizeRawJob(listing({ title: 'Payroll Specialist', descriptionText: 'Run payroll.' }))
  assert.equal(irrelevant.relevance.relevant, false)
})

test('Greenhouse and Ashby adapters map real payload shapes without network', async () => {
  const gh = providers.providerById('greenhouse')
  const sample = { jobs: [{ id: 8556658002, title: 'AI Engineer', content: '&lt;p&gt;Build LLM features with Python.&lt;/p&gt;', absolute_url: 'https://job-boards.greenhouse.io/gitlab/jobs/8556658002', updated_at: '2026-09-14T16:01:39-04:00', first_published: '2026-05-22T09:16:29-04:00', location: { name: 'Remote, Bangalore' }, offices: [{ name: 'India' }], departments: [{ name: 'Enterprise Applications' }] }] }
  const calls = []
  const raw = await gh.fetchJobs({ id: 's', name: 'GitLab', provider: 'greenhouse', baseUrl: null, config: { board: 'gitlab' } }, { fetch: async (url) => (calls.push(url), { ok: true, status: 200, json: async () => sample }), log: () => {} })
  assert.equal(calls[0], 'https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true')
  assert.equal(raw[0].externalId, '8556658002')
  assert.deepEqual(raw[0].locations, ['India'])
  const n = normalize.normalizeRawJob(raw[0])
  assert.equal(n.roleCategory, 'ai-ml')
  assert.equal(n.region, 'india')
  await assert.rejects(() => gh.fetchJobs({ id: 's', name: 'x', provider: 'greenhouse', baseUrl: null, config: { board: '../evil' } }, { fetch: async () => ({ ok: true, json: async () => ({}) }), log: () => {} }), /config.board/)

  const ashby = providers.providerById('ashby')
  const ashbySample = { jobs: [{ id: '7458d4e9', title: 'Engineering Manager - EU', location: 'Remote - European Union', isRemote: true, isListed: true, employmentType: 'FullTime', publishedAt: '2024-03-04T14:29:08.532+00:00', jobUrl: 'https://jobs.ashbyhq.com/ashby/7458d4e9', applyUrl: 'https://jobs.ashbyhq.com/ashby/7458d4e9/application', descriptionPlain: 'Lead engineers.', secondaryLocations: [{ location: 'Spain', address: { postalAddress: { addressCountry: 'Spain' } } }] }, { id: 'hidden', title: 'Hidden', isListed: false, jobUrl: 'https://x/y' }] }
  const rawAshby = await ashby.fetchJobs({ id: 's', name: 'Ashby', provider: 'ashby', baseUrl: null, config: { board: 'ashby' } }, { fetch: async () => ({ ok: true, status: 200, json: async () => ashbySample }), log: () => {} })
  assert.equal(rawAshby.length, 1, 'unlisted jobs are dropped')
  assert.deepEqual(rawAshby[0].countries, ['Spain'])
  assert.equal(rawAshby[0].workplaceType, 'remote')
  assert.equal(rawAshby[0].applyUrl, 'https://jobs.ashbyhq.com/ashby/7458d4e9/application')

  const lever = providers.providerById('lever')
  const leverSample = [{ id: 'abc', text: 'Frontend Engineer', categories: { location: 'Bengaluru', team: 'Web', commitment: 'Full-time' }, workplaceType: 'hybrid', country: 'IN', createdAt: 1758000000000, hostedUrl: 'https://jobs.lever.co/acme/abc', applyUrl: 'https://jobs.lever.co/acme/abc/apply', descriptionPlain: 'Build UI with React and TypeScript.', lists: [{ text: 'Requirements', content: '<li>3+ years React</li>' }] }]
  const rawLever = await lever.fetchJobs({ id: 's', name: 'Acme', provider: 'lever', baseUrl: null, config: { site: 'acme' } }, { fetch: async () => ({ ok: true, status: 200, json: async () => leverSample }), log: () => {} })
  const nl = normalize.normalizeRawJob(rawLever[0])
  assert.equal(nl.workMode, 'hybrid')
  assert.equal(nl.region, 'india')
  assert.equal(nl.roleCategory, 'frontend')
  assert.ok(nl.requiredSkills.includes('React'))
})

test('ingestion is idempotent, updates changed listings, records irrelevant ones and marks vanished listings stale', async () => {
  const { client, db } = await freshDb()
  try {
    const now = new Date('2026-09-25T10:00:00Z')
    const jobsA = [listing({}), listing({ externalId: 'j2', title: 'Payroll Specialist', descriptionText: 'Run payroll.' }), listing({ externalId: 'j3', title: 'Frontend Engineer', descriptionText: 'React and TypeScript, 2-4 years experience.', location: 'Berlin, Germany' })]
    const source = await seedSource(db, { config: { jobs: jobsA } })
    const first = await engine.ingestSource(db, source, { now, triggeredBy: 'test' })
    assert.equal(first.status, 'success', first.error)
    assert.deepEqual([first.fetched, first.created, first.updated, first.unchanged, first.irrelevant, first.duplicates], [3, 2, 0, 0, 1, 0])
    const stored = await db.query.jobs.findMany()
    assert.equal(stored.length, 2)
    const j1 = stored.find((j) => j.externalId === 'j1')
    assert.equal(j1.status, 'published')
    assert.equal(j1.lifecycle, 'discovered')
    assert.equal(j1.region, 'india')
    assert.equal(j1.firstSeenAt.toISOString(), now.toISOString())

    // Second run with identical data: nothing created, everything unchanged, lifecycle verified.
    const second = await engine.ingestSource(db, source, { now: new Date('2026-09-26T10:00:00Z') })
    assert.deepEqual([second.created, second.updated, second.unchanged], [0, 0, 2])
    const afterSecond = await db.query.jobs.findMany()
    assert.equal(afterSecond.length, 2)
    assert.ok(afterSecond.every((j) => j.lifecycle === 'verified'))
    assert.equal(afterSecond.find((j) => j.externalId === 'j1').lastSeenAt.toISOString(), '2026-09-26T10:00:00.000Z')

    // Third run: j1 changed (new description), j3 vanished.
    const [src3] = await db.update(schema.jobSources).set({ config: { jobs: [listing({ descriptionText: 'Build services with Java, Spring Boot and Kafka. 6+ years experience.' })] } }).where(schema.jobSources.id ? undefined : undefined).returning()
    const third = await engine.ingestSource(db, src3, { now: new Date('2026-09-27T10:00:00Z') })
    assert.deepEqual([third.created, third.updated, third.unchanged], [0, 1, 0])
    const j1c = await db.query.jobs.findFirst({ where: (t, { eq }) => eq(t.externalId, 'j1') })
    assert.equal(j1c.experienceMin, 6)
    assert.ok(j1c.requiredSkills.includes('Kafka'))
    const j3 = await db.query.jobs.findFirst({ where: (t, { eq }) => eq(t.externalId, 'j3') })
    assert.equal(j3.lifecycle, 'stale')
    assert.equal(j3.status, 'published', 'stale jobs stay visible until the sweep expires them')

    const runs = await db.query.jobIngestionRuns.findMany()
    assert.equal(runs.length, 3)
    assert.ok(runs.every((r) => r.status === 'success' && r.finishedAt))
    const [srcRow] = await db.select().from(schema.jobSources)
    assert.equal(srcRow.lastRunStatus, 'success')
  } finally {
    await client.close()
  }
})

test('the same opening from a second source is recorded as a duplicate, not inserted', async () => {
  const { client, db } = await freshDb()
  try {
    const source = await seedSource(db, { config: { jobs: [listing({})] } })
    await engine.ingestSource(db, source)
    const [second] = await db
      .insert(schema.jobSources)
      .values({ id: 's-two', name: 'Acme mirror', slug: 'acme-mirror', type: 'provider', provider: 'fixture', ingestionAllowed: true, status: 'active', companyId: 'c-acme', autoPublish: true, config: { jobs: [listing({ externalId: 'mirror-1', sourceUrl: 'https://mirror.example.com/x', applyUrl: 'https://job-boards.example.com/acme/jobs/1?utm_source=mirror' })] } })
      .returning()
    const result = await engine.ingestSource(db, second)
    assert.deepEqual([result.created, result.duplicates], [0, 1])
    assert.equal((await db.query.jobs.findMany()).length, 1)
    const dups = await db.query.jobDuplicates.findMany()
    assert.equal(dups.length, 1)
    assert.equal(dups[0].sourceId, 's-two')
  } finally {
    await client.close()
  }
})

test('engine refuses sources that are paused, not allowed, or without a company, and records the failure', async () => {
  const { client, db } = await freshDb()
  try {
    const source = await seedSource(db, { ingestionAllowed: false })
    const result = await engine.ingestSource(db, source)
    assert.equal(result.status, 'failed')
    assert.match(result.error, /not marked as allowed/)
    const [run] = await db.query.jobIngestionRuns.findMany()
    assert.equal(run.status, 'failed')
    const [row] = await db.select().from(schema.jobSources)
    assert.equal(row.lastRunStatus, 'failed')
    assert.match(row.lastError, /not marked as allowed/)
  } finally {
    await client.close()
  }
})

test('lifecycle sweep expires past-due and unseen jobs and flags stale ones', async () => {
  const { client, db } = await freshDb()
  try {
    await db.insert(schema.companies).values({ id: 'c1', name: 'Acme', slug: 'acme' })
    const base = { companyId: 'c1', normalizedTitle: 't', roleCategory: 'backend', description: 'd', level: 'mid', employmentType: 'full_time', workMode: 'remote', region: 'india', status: 'published', lifecycle: 'verified' }
    const now = new Date('2026-09-25T00:00:00Z')
    const daysAgo = (n) => new Date(now.getTime() - n * 86_400_000)
    await db.insert(schema.jobs).values([
      { ...base, id: 'fresh', title: 'Fresh', applyUrl: 'https://a/1', fingerprint: 'f1', lastSeenAt: daysAgo(1) },
      { ...base, id: 'stale', title: 'Stale', applyUrl: 'https://a/2', fingerprint: 'f2', lastSeenAt: daysAgo(10) },
      { ...base, id: 'old', title: 'Old', applyUrl: 'https://a/3', fingerprint: 'f3', lastSeenAt: daysAgo(30) },
      { ...base, id: 'dated', title: 'Dated', applyUrl: 'https://a/4', fingerprint: 'f4', lastSeenAt: daysAgo(1), expiresAt: daysAgo(1) },
      { ...base, id: 'manual', title: 'Manual', applyUrl: 'https://a/5', fingerprint: 'f5', lastSeenAt: null, lastVerifiedAt: daysAgo(2) },
    ])
    const result = await engine.sweepLifecycle(db, { now })
    assert.deepEqual(result, { stale: 1, expired: 2 })
    const rows = Object.fromEntries((await db.query.jobs.findMany()).map((j) => [j.id, [j.status, j.lifecycle]]))
    assert.deepEqual(rows.fresh, ['published', 'verified'])
    assert.deepEqual(rows.stale, ['published', 'stale'])
    assert.deepEqual(rows.old, ['expired', 'expired'])
    assert.deepEqual(rows.dated, ['expired', 'expired'])
    assert.deepEqual(rows.manual, ['published', 'verified'])
    // Running again changes nothing.
    assert.deepEqual(await engine.sweepLifecycle(db, { now }), { stale: 0, expired: 0 })
  } finally {
    await client.close()
  }
})
