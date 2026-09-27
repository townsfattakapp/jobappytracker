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
  assert.deepEqual([blr.city, blr.country, blr.region, blr.remote, blr.remoteScope], ['Bengaluru', 'India', 'india', true, 'country'])
  const ggn = normalize.parseLocation('Gurgaon, Haryana, India')
  assert.deepEqual([ggn.city, ggn.country], ['Gurugram', 'India'], 'older spellings map to the canonical city')
  const stateOnly = normalize.parseLocation('Karnataka, India')
  assert.deepEqual([stateOnly.city, stateOnly.country, stateOnly.region], [null, 'India', 'india'], 'a state alone is not a city')
  const office = normalize.parseLocation('Office')
  assert.equal(office.city, null, 'generic words never become a city')
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
  const hosted = await gh.fetchJobs({ id: 's', name: 'GitLab', provider: 'greenhouse', baseUrl: null, config: { board: 'gitlab', hostedApply: true } }, { fetch: async () => ({ ok: true, status: 200, json: async () => sample }), log: () => {} })
  assert.equal(hosted[0].applyUrl, 'https://job-boards.greenhouse.io/gitlab/jobs/8556658002', 'hostedApply sends applicants to the Greenhouse-hosted page')
  assert.equal(hosted[0].sourceUrl, sample.jobs[0].absolute_url)
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

test('Amazon Jobs adapter pages per country, caps India separately and maps the search.json shape', async () => {
  const amazon = providers.providerById('amazon')
  const calls = []
  const job = (id, cc, title = 'Software Development Engineer') => ({ id_icims: id, title, description: '<p>Build distributed systems in Java on AWS.</p>', basic_qualifications: '<li>3+ years Java</li>', preferred_qualifications: '<li>Kubernetes</li>', normalized_location: cc === 'IND' ? 'Hyderabad, Telangana, IND' : 'Seattle, Washington, USA', city: cc === 'IND' ? 'Hyderabad' : 'Seattle', country_code: cc, posted_date: 'September 25, 2026', job_schedule_type: 'full-time', job_category: 'Software Development', job_path: `/en/jobs/${id}/sde`, url_next_step: `https://account.amazon.jobs/jobs/${id}/apply`, team: { label: 'team-aws' } })
  const fetchImpl = async (url) => {
    calls.push(url)
    const u = new URL(url)
    const cc = u.searchParams.get('country')
    const offset = Number(u.searchParams.get('offset'))
    const limit = Number(u.searchParams.get('result_limit'))
    const total = cc === 'IND' ? 150 : 120
    const jobs = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => job(`${cc}-${offset + i}`, cc))
    return { ok: true, status: 200, text: async () => JSON.stringify({ hits: total, jobs }) }
  }
  const raw = await amazon.fetchJobs({ id: 's', name: 'Amazon', provider: 'amazon', baseUrl: null, config: { countries: ['IND', 'USA'], categories: ['software-development'], perCountry: 50, indiaLimit: 150 } }, { fetch: fetchImpl, log: () => {} })
  assert.equal(raw.filter((r) => r.countries[0] === 'India').length, 150, 'India takes its own limit')
  assert.equal(raw.filter((r) => r.countries[0] === 'United States').length, 50, 'other countries stop at perCountry')
  assert.ok(calls[0].includes('country=IND') && calls[0].includes('category%5B%5D=software-development') && calls[0].includes('result_limit=100'))
  assert.equal(raw[0].externalId, 'IND-0')
  assert.equal(raw[0].sourceUrl, 'https://www.amazon.jobs/en/jobs/IND-0/sde')
  assert.equal(raw[0].applyUrl, 'https://account.amazon.jobs/jobs/IND-0/apply')
  assert.ok(raw[0].descriptionHtml.includes('Basic qualifications') && raw[0].descriptionHtml.includes('Kubernetes'))
  assert.equal(raw[0].postedAt.slice(0, 10), '2026-09-25')
  const n = normalize.normalizeRawJob(raw[0])
  assert.equal(n.region, 'india')
  assert.equal(n.roleCategory, 'software-engineer')
  await assert.rejects(() => amazon.fetchJobs({ id: 's', name: 'x', provider: 'amazon', baseUrl: null, config: { countries: ['../x'] } }, { fetch: fetchImpl, log: () => {} }), /country/)
  await assert.rejects(() => amazon.fetchJobs({ id: 's', name: 'x', provider: 'amazon', baseUrl: null, config: {} }, { fetch: async () => ({ ok: true, status: 200, text: async () => '<html>' }), log: () => {} }), /did not return JSON/)
})

test('Eightfold adapter reads both API flavours, pages by 10, fetches details and keeps only described jobs', async () => {
  const eightfold = providers.providerById('eightfold')
  const calls = []
  const pcsxFetch = async (url) => {
    calls.push(url)
    const u = new URL(url)
    if (u.pathname === '/api/pcsx/search') {
      const start = Number(u.searchParams.get('start'))
      const location = u.searchParams.get('location')
      const count = location === 'India' ? 12 : 25
      const positions = Array.from({ length: Math.max(0, Math.min(10, count - start)) }, (_, i) => ({ id: 1000 + start + i + (location === 'India' ? 0 : 500), name: 'Principal Software Engineer', locations: [location === 'India' ? 'India, Karnataka, Bangalore' : 'Redmond, Washington, United States'], standardizedLocations: [location === 'India' ? 'Bengaluru, KA, IN' : 'Redmond, WA, US'], postedTs: 1789465589, department: 'Software Engineering', workLocationOption: location === 'India' ? 'onsite' : 'hybrid', positionUrl: `/careers/job/${1000 + start + i}` }))
      return { ok: true, status: 200, text: async () => JSON.stringify({ status: 200, data: { positions, count } }) }
    }
    if (u.pathname === '/api/pcsx/position_details') {
      const id = Number(u.searchParams.get('position_id'))
      return { ok: true, status: 200, text: async () => JSON.stringify({ data: { id, name: 'Principal Software Engineer', jobDescription: id % 7 === 0 ? '' : '<p>Design services in C# and Azure for Microsoft 365.</p>', location: 'India, Karnataka, Bangalore', locations: ['India, Karnataka, Bangalore'], publicUrl: `https://apply.careers.microsoft.com/careers/job/${id}`, workLocationOption: 'onsite', displayJobId: `2000${id}`, postedTs: 1789465589 } }) }
    }
    throw new Error(`unexpected url ${url}`)
  }
  const raw = await eightfold.fetchJobs({ id: 's', name: 'Microsoft', provider: 'eightfold', baseUrl: null, config: { host: 'apply.careers.microsoft.com', domain: 'microsoft.com', api: 'pcsx', searches: [{ query: '', location: 'India' }, { query: 'software engineer', location: '' }], maxPerSearch: 20, concurrency: 3 } }, { fetch: pcsxFetch, log: () => {} })
  const searchCalls = calls.filter((c) => c.includes('/api/pcsx/search'))
  assert.equal(searchCalls.length, 2 + 2, 'India: 12 → 2 pages; worldwide: 25 capped at 20 → 2 pages')
  assert.ok(searchCalls[0].includes('domain=microsoft.com') && searchCalls[0].includes('num=10') && searchCalls[0].includes('location=India'))
  const ids = raw.map((r) => Number(r.externalId))
  assert.equal(new Set(ids).size, ids.length, 'no duplicate positions across searches')
  assert.ok(raw.every((r) => r.descriptionHtml.length > 0), 'positions without a description are dropped')
  assert.equal(raw.length, 27, '12 India + 20 capped worldwide positions, minus the 5 whose detail had no description')
  const first = raw.find((r) => r.externalId === '1000')
  assert.equal(first.sourceUrl, 'https://apply.careers.microsoft.com/careers/job/1000')
  assert.equal(first.workplaceType, 'onsite')
  assert.equal(first.raw.displayJobId, '20001000')
  assert.equal(first.postedAt, '2026-09-15T09:46:29.000Z')
  const n = normalize.normalizeRawJob(first)
  assert.equal(n.region, 'india')
  assert.equal(n.locationCountry, 'India')

  const v2Fetch = async (url) => {
    const u = new URL(url)
    if (u.pathname === '/api/apply/v2/jobs') return { ok: true, status: 200, text: async () => JSON.stringify({ count: 1, positions: [{ id: 790318478981, name: 'Senior Software Engineer, Streaming', location: 'Mumbai,India', locations: ['Mumbai,India'], work_location_option: 'remote', t_create: 1789430400, canonicalPositionUrl: 'https://explore.jobs.netflix.net/careers/job/790318478981', department: 'Engineering', job_description: '' }] }) }
    if (u.pathname === '/api/apply/v2/jobs/790318478981') return { ok: true, status: 200, text: async () => JSON.stringify({ id: 790318478981, name: 'Senior Software Engineer, Streaming', job_description: '<p>Own playback services in Java and Kotlin.</p>', location: 'Mumbai,India', locations: ['Mumbai,India'], work_location_option: 'remote', t_create: 1789430400, canonicalPositionUrl: 'https://explore.jobs.netflix.net/careers/job/790318478981' }) }
    throw new Error(`unexpected url ${url}`)
  }
  const netflix = await eightfold.fetchJobs({ id: 's', name: 'Netflix', provider: 'eightfold', baseUrl: null, config: { host: 'explore.jobs.netflix.net', domain: 'netflix.com', api: 'apply-v2', searches: [{ query: '', location: '' }] } }, { fetch: v2Fetch, log: () => {} })
  assert.equal(netflix.length, 1)
  assert.equal(netflix[0].workplaceType, 'remote')
  assert.equal(netflix[0].sourceUrl, 'https://explore.jobs.netflix.net/careers/job/790318478981')
  assert.equal(normalize.normalizeRawJob(netflix[0]).workMode, 'remote')
  await assert.rejects(() => eightfold.fetchJobs({ id: 's', name: 'x', provider: 'eightfold', baseUrl: null, config: { host: 'not a host', domain: 'x.com' } }, { fetch: v2Fetch, log: () => {} }), /invalid host/)
  await assert.rejects(() => eightfold.fetchJobs({ id: 's', name: 'x', provider: 'eightfold', baseUrl: null, config: { host: 'a.example.com', domain: 'x.com', api: 'pcsx' } }, { fetch: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ data: {} }) }), log: () => {} }), /no positions array/)
})

test('Workday adapter posts paged searches, deduplicates, fetches jobPostingInfo and maps the country', async () => {
  const workday = providers.providerById('workday')
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null })
    if (url.endsWith('/wday/cxs/adobe/external_experienced/jobs')) {
      const body = JSON.parse(init.body)
      const india = Boolean(body.appliedFacets?.locationCountry)
      const total = india ? 25 : 30
      const postings = Array.from({ length: Math.max(0, Math.min(body.limit, total - body.offset)) }, (_, i) => ({ title: 'Machine Learning Engineer', externalPath: `/job/${india ? 'Noida' : 'San-Jose'}/ML-Engineer_R${(india ? 100 : 200) + body.offset + i}`, locationsText: india ? 'Noida' : 'San Jose', postedOn: 'Posted 2 Days Ago', bulletFields: [`R${(india ? 100 : 200) + body.offset + i}`] }))
      // The text search overlaps with the facet search on one posting.
      if (!india && body.offset === 0) postings[0] = { title: 'Machine Learning Engineer', externalPath: '/job/Noida/ML-Engineer_R100', locationsText: 'Noida', bulletFields: ['R100'] }
      return { ok: true, status: 200, text: async () => JSON.stringify({ total, jobPostings: postings, facets: [] }) }
    }
    const m = url.match(/\/job\/(Noida|San-Jose)\/ML-Engineer_(R\d+)$/)
    if (m) return { ok: true, status: 200, text: async () => JSON.stringify({ jobPostingInfo: { title: 'Machine Learning Engineer', jobDescription: '<p>Train models in Python and PyTorch for Firefly.</p>', location: m[1] === 'Noida' ? 'Noida' : 'San Jose', additionalLocations: m[1] === 'Noida' ? ['Bangalore'] : [], postedOn: 'Posted 2 Days Ago', startDate: '2026-09-24', timeType: 'Full time', jobReqId: m[2], country: { descriptor: m[1] === 'Noida' ? 'India' : 'United States of America', id: 'x' }, externalUrl: `https://adobe.wd5.myworkdayjobs.com/external_experienced${new URL(url).pathname.replace('/wday/cxs/adobe/external_experienced', '')}` } }) }
    throw new Error(`unexpected url ${url}`)
  }
  const raw = await workday.fetchJobs({ id: 's', name: 'Adobe', provider: 'workday', baseUrl: null, config: { host: 'adobe.wd5.myworkdayjobs.com', tenant: 'adobe', site: 'external_experienced', searches: [{ label: 'India', appliedFacets: { locationCountry: ['c4f78be1a8f14da0ab49ce1162348a5e'] } }, { label: 'ml', searchText: 'machine learning' }], maxPerSearch: 30, concurrency: 4 } }, { fetch: fetchImpl, log: () => {} })
  const lists = calls.filter((c) => c.method === 'POST')
  assert.equal(lists.length, 2 + 2, 'India 25 → 2 pages of 20; text 30 → 2 pages')
  assert.deepEqual(lists[0].body, { appliedFacets: { locationCountry: ['c4f78be1a8f14da0ab49ce1162348a5e'] }, limit: 20, offset: 0, searchText: '' })
  assert.equal(raw.length, 25 + 30 - 1, 'the overlapping posting is taken once')
  const r100 = raw.find((r) => r.externalId === 'R100')
  assert.deepEqual(r100.countries, ['India'])
  assert.deepEqual(r100.locations, ['Bangalore'])
  assert.equal(r100.employmentType, 'Full time')
  assert.equal(r100.postedAt, '2026-09-24T00:00:00.000Z')
  assert.equal(r100.sourceUrl, 'https://adobe.wd5.myworkdayjobs.com/external_experienced/job/Noida/ML-Engineer_R100')
  const n = normalize.normalizeRawJob(r100)
  assert.equal(n.region, 'india')
  assert.equal(n.roleCategory, 'ai-ml')
  assert.ok(n.requiredSkills.includes('Python'))
  const us = normalize.normalizeRawJob(raw.find((r) => r.externalId === 'R201'))
  assert.equal(us.region, 'international')
  await assert.rejects(() => workday.fetchJobs({ id: 's', name: 'x', provider: 'workday', baseUrl: null, config: { host: 'adobe.wd5.myworkdayjobs.com', tenant: '../x', site: 'y' } }, { fetch: fetchImpl, log: () => {} }), /config.tenant/)
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

test('SmartRecruiters adapter pages India first, caps the rest, fetches job-ad sections and maps the posting shape', async () => {
  const sr = providers.providerById('smartrecruiters')
  const calls = []
  const posting = (id, country, city) => ({ id: String(id), name: `Staff Software Engineer ${id}`, refNumber: `JB${id}`, releasedDate: '2026-09-25T09:08:43.782Z', location: { city, country, remote: false, hybrid: true, fullLocation: `${city}, , ${country === 'in' ? 'India' : 'United States'}` }, department: { label: 'Engineering' }, function: { label: 'Engineering' }, typeOfEmployment: { label: 'Full-time' }, experienceLevel: { label: 'Mid-Senior' }, company: { identifier: 'ServiceNow', name: 'ServiceNow' } })
  const fetchImpl = async (url) => {
    calls.push(url)
    const u = new URL(url)
    const m = u.pathname.match(/\/postings\/(\d+)$/)
    if (m) {
      const id = m[1]
      const india = Number(id) < 500
      return { ok: true, status: 200, text: async () => JSON.stringify({ ...posting(id, india ? 'in' : 'us', india ? 'Hyderabad' : 'Santa Clara'), postingUrl: `https://jobs.smartrecruiters.com/ServiceNow/${id}-staff`, applyUrl: `https://jobs.smartrecruiters.com/ServiceNow/${id}-staff?oga=true`, jobAd: { sections: id === '7' ? {} : { companyDescription: { title: 'Company Description', text: '<p>ServiceNow.</p>' }, jobDescription: { title: 'Job Description', text: '<p>Build the platform in Java.</p>' }, qualifications: { title: 'Qualifications', text: '<ul><li>5+ years Java</li></ul>' } } } }) }
    }
    const limit = Number(u.searchParams.get('limit'))
    const offset = Number(u.searchParams.get('offset'))
    const country = u.searchParams.get('country')
    const total = country === 'in' ? 120 : 700
    const base = country === 'in' ? 1 : 501
    const content = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => posting(base + offset + i, country === 'in' ? 'in' : 'us', country === 'in' ? 'Hyderabad' : 'Santa Clara'))
    return { ok: true, status: 200, text: async () => JSON.stringify({ offset, limit, totalFound: total, content }) }
  }
  const raw = await sr.fetchJobs({ id: 's', name: 'ServiceNow', provider: 'smartrecruiters', baseUrl: null, config: { company: 'servicenow', maxGlobal: 150 } }, { fetch: fetchImpl, log: () => {} })
  const lists = calls.filter((c) => !/\/postings\/\d+$/.test(c))
  assert.equal(lists.length, 2 + 2, 'India: 120 → 2 pages; worldwide: 700 capped at 150 → 2 pages')
  assert.ok(lists[0].includes('country=in') && lists[0].includes('limit=100') && lists[0].includes('offset=0'))
  assert.equal(raw.length, 120 + 150 - 1, 'India in full, worldwide capped, minus the posting whose ad had no sections')
  const first = raw.find((r) => r.externalId === '1')
  assert.equal(first.sourceUrl, 'https://jobs.smartrecruiters.com/ServiceNow/1-staff')
  assert.equal(first.location, 'Hyderabad, India')
  assert.deepEqual(first.countries, ['India'])
  assert.equal(first.workplaceType, 'hybrid')
  assert.equal(first.employmentType, 'Full-time')
  assert.ok(first.descriptionHtml.startsWith('<h3>Job Description</h3>'), 'the role comes before the company blurb')
  assert.ok(first.descriptionHtml.endsWith('<p>ServiceNow.</p>'))
  const n = normalize.normalizeRawJob(first)
  assert.equal(n.region, 'india')
  assert.equal(n.locationCity, 'Hyderabad')
  await assert.rejects(() => sr.fetchJobs({ id: 's', name: 'x', provider: 'smartrecruiters', baseUrl: null, config: { company: 'not valid!' } }, { fetch: fetchImpl, log: () => {} }), /config.company/)
})

test('Oracle Cloud HCM adapter builds finder URLs, pages by 25, deduplicates across searches and reads details', async () => {
  const oracle = providers.providerById('oraclecloud')
  const calls = []
  const requisition = (id) => ({ Id: String(id), Title: `Software Engineer ${id}`, PostedDate: '2026-09-26', PrimaryLocation: id < 30 ? 'Bengaluru, Karnataka, India' : 'Plano, TX, United States', PrimaryLocationCountry: id < 30 ? 'IN' : 'US', WorkplaceType: null, JobFamily: 'Software Engineering', JobFunction: 'Technology', ShortDescriptionStr: 'Short', secondaryLocations: id % 2 ? [{ Name: 'Mumbai, Maharashtra, India', CountryCode: 'IN' }] : [] })
  const fetchImpl = async (url) => {
    calls.push(url)
    const u = new URL(url)
    const detail = u.pathname.match(/recruitingCEJobRequisitionDetails\/(\d+)$/)
    if (detail) {
      const id = Number(detail[1])
      return { ok: true, status: 200, text: async () => JSON.stringify({ Id: String(id), Title: `Software Engineer ${id}`, ExternalDescriptionStr: id === 3 ? '' : '<p>Own the data platform in Java and Spark.</p>', ExternalQualificationsStr: id === 3 ? null : '<ul><li>Java</li></ul>', ExternalResponsibilitiesStr: id === 3 ? '' : '<p>Lead a squad.</p>', ExternalPostedStartDate: '2026-09-26T07:14:12+00:00', JobSchedule: 'Full time', Category: 'Software Engineering', PrimaryLocation: id < 30 ? 'Bengaluru, Karnataka, India' : 'Plano, TX, United States', PrimaryLocationCountry: id < 30 ? 'IN' : 'US', WorkplaceType: id === 1 ? 'Hybrid' : null, secondaryLocations: id % 2 ? [{ Name: 'Mumbai, Maharashtra, India', CountryCode: 'IN' }] : [] }) }
    }
    const finder = u.searchParams.get('finder')
    const offset = Number(finder.match(/offset=(\d+)/)[1])
    const limit = Number(finder.match(/limit=(\d+)/)[1])
    const india = /location=India/.test(finder)
    const total = india ? 30 : 60
    const base = india ? 1 : 21 // the worldwide search overlaps ids 21-30 with the India search
    const list = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => requisition(base + offset + i))
    return { ok: true, status: 200, text: async () => JSON.stringify({ items: [{ TotalJobsCount: total, requisitionList: list }] }) }
  }
  const raw = await oracle.fetchJobs({ id: 's', name: 'JPMC', provider: 'oraclecloud', baseUrl: null, config: { host: 'jpmc.fa.oraclecloud.com', site: 'CX_1001', searches: [{ label: 'India', location: 'India' }, { label: 'software', keyword: 'software engineer' }], maxPerSearch: 50 } }, { fetch: fetchImpl, log: () => {} })
  const lists = calls.filter((c) => c.includes('recruitingCEJobRequisitions?'))
  assert.equal(lists.length, 2 + 2, 'India: 30 → 2 pages of 25; worldwide: 60 capped at 50 → 2 pages')
  assert.ok(lists[0].includes('finder=findReqs;siteNumber=CX_1001,limit=25,offset=0,sortBy=POSTING_DATES_DESC,location=India'))
  assert.ok(lists[2].includes('keyword=software%20engineer'))
  const ids = raw.map((r) => Number(r.externalId))
  assert.equal(new Set(ids).size, ids.length, 'overlapping requisitions are read once')
  assert.equal(raw.length, 70 - 1, '30 India + 50 worldwide with 10 overlapping, minus the one without a description')
  const first = raw.find((r) => r.externalId === '1')
  assert.equal(first.sourceUrl, 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/1')
  assert.equal(first.workplaceType, 'hybrid')
  assert.deepEqual(first.countries, ['India'])
  assert.deepEqual(first.locations, ['Mumbai, Maharashtra, India'])
  assert.ok(first.descriptionHtml.includes('<h3>Responsibilities</h3>') && first.descriptionHtml.includes('<h3>Qualifications</h3>'))
  assert.equal(first.postedAt, '2026-09-26T07:14:12+00:00')
  const n = normalize.normalizeRawJob(first)
  assert.equal(n.region, 'india')
  assert.equal(n.locationCity, 'Bengaluru')
  await assert.rejects(() => oracle.fetchJobs({ id: 's', name: 'x', provider: 'oraclecloud', baseUrl: null, config: { host: 'jpmc.fa.oraclecloud.com', site: 'CX 1' } }, { fetch: fetchImpl, log: () => {} }), /config.site/)
})

test('Atlassian adapter reads the listings endpoint once and keeps described roles with their locations', async () => {
  const atlassian = providers.providerById('atlassian')
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(url)
    return {
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify([
          { portalJobPost: { portalUrl: 'https://careers-apac-atlassian.icims.com/jobs/25642/x/job', updatedDate: '2026-09-25 08:18 AM' }, id: 25642, title: 'Senior Software Engineer, Jira', type: 'Full-Time', locations: ['Remote - India - Remote', 'Bengaluru, India'], category: 'Engineering', overview: '<p>Build Jira.</p>', responsibilities: '<p>Ship features.</p>', qualifications: '<p>Java, Kotlin.</p>', applyUrl: 'https://careers-apac-atlassian.icims.com/jobs/25642/x/job?mode=apply' },
          { id: 25643, title: 'No description role', locations: ['Sydney, Australia'], overview: '', responsibilities: '', qualifications: '' },
          { id: 25642, title: 'Duplicate id', locations: [], overview: '<p>x</p>' },
        ]),
    }
  }
  const raw = await atlassian.fetchJobs({ id: 's', name: 'Atlassian', provider: 'atlassian', baseUrl: null, config: {} }, { fetch: fetchImpl, log: () => {} })
  assert.equal(calls.length, 1)
  assert.equal(raw.length, 1)
  const [job] = raw
  assert.equal(job.externalId, '25642')
  assert.equal(job.location, 'Remote - India - Remote')
  assert.deepEqual(job.locations, ['Bengaluru, India'])
  assert.equal(job.workplaceType, 'remote')
  assert.equal(job.employmentType, 'Full-Time')
  assert.equal(job.sourceUrl, 'https://careers-apac-atlassian.icims.com/jobs/25642/x/job')
  assert.ok(job.descriptionHtml.includes('<h3>Qualifications</h3><p>Java, Kotlin.</p>'))
  const n = normalize.normalizeRawJob(job)
  assert.equal(n.region, 'india')
  assert.equal(n.workMode, 'remote')
  await assert.rejects(() => atlassian.fetchJobs({ id: 's', name: 'x', provider: 'atlassian', baseUrl: null, config: {} }, { fetch: async () => ({ ok: true, status: 200, text: async () => '{}' }), log: () => {} }), /not an array/)
})

test('Keka adapter reads the embed list once and maps locations, countries, type and dates', async () => {
  const keka = providers.providerById('keka')
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(url)
    return {
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify([
          { id: 142721, title: 'Backend Engineer', description: '<p>Build the payroll engine in .NET and PostgreSQL.</p>', departmentName: 'Engineering', jobLocations: [{ id: 64, name: 'Hyderabad', city: 'Hyderabad', state: 'TG', countryCode: 'IN' }, { id: 70, name: 'Bengaluru', city: 'Bengaluru', state: 'KA', countryCode: 'IN' }], jobType: 'Full Time', experience: '3', jobNumber: 'KEKA-42', publishedOn: '2026-09-20T05:30:00', skillNames: ['C#', 'SQL'] },
          { id: 142722, title: 'SDR', description: '<p>Sell.</p>', departmentName: 'Sales', jobLocations: [{ id: 37837, name: 'Manila', city: 'Manila', state: 'BUL', countryCode: 'RP' }], jobType: 'Full Time' },
          { id: 142723, title: 'No description', description: '', jobLocations: [] },
        ]),
    }
  }
  const raw = await keka.fetchJobs({ id: 's', name: 'Keka', provider: 'keka', baseUrl: null, config: { host: 'hr.keka.com', identifier: '24040a7e-a7c5-47a5-9cd5-019962c66385' } }, { fetch: fetchImpl, log: () => {} })
  assert.equal(calls.length, 1)
  assert.ok(calls[0].endsWith('/careers/api/embedjobs/default/active/24040a7e-a7c5-47a5-9cd5-019962c66385'))
  assert.equal(raw.length, 2, 'the listing without a description is dropped')
  const [job, sdr] = raw
  assert.equal(job.externalId, '142721')
  assert.equal(job.location, 'Hyderabad, TG, India')
  assert.deepEqual(job.locations, ['Bengaluru, KA, India'])
  assert.deepEqual(job.countries, ['India'])
  assert.equal(job.employmentType, 'Full Time')
  assert.equal(job.department, 'Engineering')
  assert.equal(job.sourceUrl, 'https://hr.keka.com/careers/jobdetails/142721')
  assert.ok(job.postedAt.startsWith('2026-09-'))
  assert.deepEqual(job.raw.skills, ['C#', 'SQL'])
  assert.deepEqual(sdr.countries, ['Philippines'])
  const n = normalize.normalizeRawJob(job)
  assert.equal(n.region, 'india')
  assert.equal(n.locationCity, 'Hyderabad')
  await assert.rejects(() => keka.fetchJobs({ id: 's', name: 'x', provider: 'keka', baseUrl: null, config: { host: 'hr.keka.com', identifier: 'nope' } }, { fetch: fetchImpl, log: () => {} }), /identifier/)
  await assert.rejects(() => keka.fetchJobs({ id: 's', name: 'x', provider: 'keka', baseUrl: null, config: { host: 'hr.keka.com', identifier: '24040a7e-a7c5-47a5-9cd5-019962c66385' } }, { fetch: async () => ({ ok: true, status: 200, text: async () => '{}' }), log: () => {} }), /not an array/)
})
