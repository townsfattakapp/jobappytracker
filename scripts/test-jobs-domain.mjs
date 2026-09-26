// Unit tests for the pure Jobs domain code (normalisation, deduplication,
// validation, relevance ranking, entitlements). Bundled with esbuild the same
// way scripts/test-learning-domain.mjs does, so the real TypeScript runs.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: {
    normalize: 'src/lib/jobs/normalize.ts',
    relevance: 'src/lib/jobs/relevance.ts',
    taxonomy: 'src/lib/jobs/taxonomy.ts',
    features: 'src/lib/entitlements/features.ts',
  },
  outdir: 'scratch/jobs-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  logLevel: 'silent',
})

const normalize = await import('../scratch/jobs-tests/normalize.mjs')
const relevance = await import('../scratch/jobs-tests/relevance.mjs')
const taxonomy = await import('../scratch/jobs-tests/taxonomy.mjs')
const features = await import('../scratch/jobs-tests/features.mjs')

const baseJob = {
  companyId: 'c1',
  sourceId: null,
  title: 'Software Engineer II',
  roleCategory: 'backend',
  careerPathIds: [],
  trackIds: [],
  description: 'Build services.',
  requirementsSummary: null,
  requiredSkills: ['Java', 'Spring Boot', 'SQL'],
  preferredSkills: ['Kafka'],
  experienceMin: 2,
  experienceMax: 5,
  level: 'mid',
  employmentType: 'full_time',
  workMode: 'hybrid',
  locationCity: 'Bengaluru',
  locationCountry: 'India',
  region: 'india',
  salaryMin: 1800000,
  salaryMax: 2600000,
  salaryCurrency: 'INR',
  salaryPeriod: 'year',
  applyUrl: 'https://careers.example.com/jobs/123?utm_source=linkedin&gh_src=abc',
  sourceUrl: null,
  externalId: null,
  status: 'published',
  postedAt: '2026-09-20T00:00:00.000Z',
  expiresAt: null,
}

test('canonicalApplyUrl drops tracking parameters and keeps the rest', () => {
  assert.equal(normalize.canonicalApplyUrl('https://Careers.Example.com/jobs/123/?utm_source=x&gh_src=y&id=7#top'), 'https://careers.example.com/jobs/123?id=7')
  assert.equal(normalize.canonicalApplyUrl('careers.example.com/jobs/1'), 'https://careers.example.com/jobs/1')
  assert.throws(() => normalize.canonicalApplyUrl('javascript:alert(1)'), /valid URL|http or https/)
  assert.throws(() => normalize.canonicalApplyUrl('ftp://files.example.com/job'), /http or https/)
  assert.throws(() => normalize.canonicalApplyUrl(''), /required/)
})

test('normalizeTitle strips location, noise and punctuation', () => {
  assert.equal(normalize.normalizeTitle('SDE II - Bengaluru (Remote)'), 'sde ii')
  assert.equal(normalize.normalizeTitle('Senior Software Engineer, Payments | Hyderabad'), 'senior software engineer payments')
  assert.equal(normalize.normalizeTitle('Backend Developer (Node.js) Urgent Hiring'), 'backend developer node.js')
})

test('jobFingerprint is stable across sources and detects duplicates', () => {
  const a = normalize.jobFingerprint({ companyId: 'c1', title: 'SDE II - Bengaluru', locationCity: 'Bengaluru', applyUrl: 'https://careers.example.com/jobs/123?utm_source=a' })
  const b = normalize.jobFingerprint({ companyId: 'c1', title: 'sde ii (remote)', locationCity: 'bengaluru ', applyUrl: 'https://careers.example.com/jobs/123/' })
  const c = normalize.jobFingerprint({ companyId: 'c1', title: 'SDE II', locationCity: 'Pune', applyUrl: 'https://careers.example.com/jobs/123' })
  assert.equal(a, b)
  assert.notEqual(a, c)
  assert.match(a, /^[0-9a-f]{16}$/)
})

test('jobFreshness reflects verification age and expiry', () => {
  const now = new Date('2026-09-25T00:00:00Z')
  assert.equal(normalize.jobFreshness({ postedAt: '2026-09-20T00:00:00Z', lastVerifiedAt: null, expiresAt: null, status: 'published' }, now), 'fresh')
  assert.equal(normalize.jobFreshness({ postedAt: '2026-08-30T00:00:00Z', lastVerifiedAt: null, expiresAt: null, status: 'published' }, now), 'aging')
  assert.equal(normalize.jobFreshness({ postedAt: '2026-07-01T00:00:00Z', lastVerifiedAt: null, expiresAt: null, status: 'published' }, now), 'stale')
  assert.equal(normalize.jobFreshness({ postedAt: '2026-07-01T00:00:00Z', lastVerifiedAt: '2026-09-24T00:00:00Z', expiresAt: null, status: 'published' }, now), 'fresh')
  assert.equal(normalize.jobFreshness({ postedAt: '2026-09-20T00:00:00Z', lastVerifiedAt: null, expiresAt: '2026-09-24T00:00:00Z', status: 'published' }, now), 'expired')
})

test('parseJobInput validates and normalises admin input', () => {
  const parsed = normalize.parseJobInput({ ...baseJob, requiredSkills: 'Java, java , Spring Boot', experienceMin: '2', experienceMax: '5', salaryMin: '1800000', salaryMax: '2600000' })
  assert.deepEqual(parsed.requiredSkills, ['Java', 'Spring Boot'])
  assert.equal(parsed.applyUrl, 'https://careers.example.com/jobs/123')
  assert.equal(parsed.experienceMin, 2)
  assert.equal(parsed.salaryPeriod, 'year')
  assert.throws(() => normalize.parseJobInput({ ...baseJob, title: '' }), /Title is required/)
  assert.throws(() => normalize.parseJobInput({ ...baseJob, roleCategory: 'astronaut' }), /Role category/)
  assert.throws(() => normalize.parseJobInput({ ...baseJob, experienceMin: 5, experienceMax: 2 }), /Maximum experience/)
  assert.throws(() => normalize.parseJobInput({ ...baseJob, salaryMin: 5, salaryMax: 2 }), /Maximum salary/)
  assert.throws(() => normalize.parseJobInput({ ...baseJob, postedAt: '2026-09-20', expiresAt: '2026-09-01' }), /Expiry date/)
  assert.throws(() => normalize.parseJobInput({ ...baseJob, applyUrl: 'not a url at all' }), /Application URL/)
})

test('parseCompanyInput and parseSourceInput enforce slugs, URLs and ingestion rules', () => {
  const company = normalize.parseCompanyInput({ name: 'Acme Corp', website: 'acme.com', careersUrl: '' })
  assert.equal(company.slug, 'acme-corp')
  assert.equal(company.website, 'https://acme.com/')
  assert.equal(company.careersUrl, null)
  assert.throws(() => normalize.parseCompanyInput({ name: 'Acme', website: 'ftp://x' }), /Website/)
  const source = normalize.parseSourceInput({ name: 'Greenhouse feed', type: 'ats_api', ingestionAllowed: true, provider: 'greenhouse', config: '{"board":"acme"}', companyId: 'c1' })
  assert.equal(source.ingestionAllowed, true)
  assert.deepEqual(source.config, { board: 'acme' })
  assert.throws(() => normalize.parseSourceInput({ name: 'Feed', type: 'ats_api', ingestionAllowed: true }), /Choose a provider/)
  assert.throws(() => normalize.parseSourceInput({ name: 'Feed', type: 'ats_api', provider: 'greenhouse', companyId: 'c1' }), /config.board/)
  assert.throws(() => normalize.parseSourceInput({ name: 'Feed', type: 'ats_api', provider: 'greenhouse', config: { board: 'x' } }), /need a company/)
  assert.throws(() => normalize.parseSourceInput({ name: 'Manual', type: 'manual', ingestionAllowed: true }), /Manual sources/)
  assert.throws(() => normalize.parseSourceInput({ name: 'X', type: 'scraper' }), /Type must be one of/)
})

test('parsePreferencesInput accepts lists and rejects unknown values', () => {
  const prefs = normalize.parsePreferencesInput({ roleCategories: ['backend', 'java'], skills: 'Java, SQL', experienceYears: '3', workModes: ['remote'], regionPreference: 'india', salaryMin: '1000000' })
  assert.deepEqual(prefs.roleCategories, ['backend', 'java'])
  assert.deepEqual(prefs.skills, ['Java', 'SQL'])
  assert.equal(prefs.experienceYears, 3)
  assert.equal(prefs.salaryCurrency, 'INR')
  assert.throws(() => normalize.parsePreferencesInput({ roleCategories: ['ceo'] }), /Unknown role category/)
  assert.throws(() => normalize.parsePreferencesInput({ workModes: ['boat'] }), /Unknown workModes/)
})

test('rankJob explains every point and applies hard exclusions', () => {
  const job = { ...baseJob, id: 'j1', createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z', lastVerifiedAt: '2026-09-24T00:00:00.000Z', company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null }, source: null, normalizedTitle: 'software engineer ii', fingerprint: 'x' }
  const now = new Date('2026-09-25T00:00:00Z')
  const none = relevance.rankJob(job, null, now)
  assert.equal(none.score, 0)
  const prefs = { roleCategories: ['backend'], skills: ['java', 'sql', 'react'], experienceYears: 3, locations: ['Bengaluru'], regionPreference: 'india', workModes: ['hybrid', 'remote'], levels: [], employmentTypes: [], salaryMin: 2000000, salaryCurrency: 'INR' }
  const r = relevance.rankJob(job, prefs, now)
  assert.equal(r.excluded, false)
  assert.ok(r.score > 60, `score ${r.score}`)
  assert.equal(r.score, r.reasons.reduce((s, x) => s + x.weight, 0))
  assert.ok(r.reasons.some((x) => x.kind === 'role' && x.weight === 40))
  assert.ok(r.reasons.some((x) => x.kind === 'skill' && /2 of 3 required/.test(x.text)))
  assert.ok(r.reasons.some((x) => x.kind === 'location'))
  assert.ok(r.reasons.some((x) => x.kind === 'freshness'))
  const onsiteOnly = relevance.rankJob(job, { ...prefs, workModes: ['onsite'] }, now)
  assert.equal(onsiteOnly.excluded, true)
  const abroad = relevance.rankJob(job, { ...prefs, regionPreference: 'international', workModes: [] }, now)
  assert.equal(abroad.excluded, true, 'hybrid job in India is excluded for international-only preference')
  const remoteJob = relevance.rankJob({ ...job, workMode: 'remote' }, { ...prefs, regionPreference: 'international', workModes: [] }, now)
  assert.equal(remoteJob.excluded, false, 'remote jobs survive a region preference')
  const sibling = relevance.rankJob({ ...job, roleCategory: 'java' }, prefs, now)
  assert.ok(sibling.reasons.some((x) => x.kind === 'role' && x.weight === 15), 'java is related to backend via shared career path')
})

test('rankJobs sorts by score then recency and drops excluded jobs', () => {
  const mk = (id, over) => ({ ...baseJob, ...over, id, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', lastVerifiedAt: null, company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null }, source: null, normalizedTitle: 't', fingerprint: id })
  const prefs = { roleCategories: ['frontend'], skills: [], experienceYears: null, locations: [], regionPreference: 'any', workModes: ['remote'], levels: [], employmentTypes: [], salaryMin: null, salaryCurrency: null }
  const jobs = [mk('old-match', { roleCategory: 'frontend', workMode: 'remote', postedAt: '2026-09-01T00:00:00.000Z' }), mk('excluded', { roleCategory: 'frontend', workMode: 'onsite' }), mk('new-match', { roleCategory: 'frontend', workMode: 'remote', postedAt: '2026-09-20T00:00:00.000Z' }), mk('other', { roleCategory: 'data-analyst', workMode: 'remote', postedAt: '2026-09-22T00:00:00.000Z' })]
  const ranked = relevance.rankJobs(jobs, prefs, new Date('2026-09-25T00:00:00Z'))
  assert.deepEqual(ranked.map((r) => r.job.id), ['new-match', 'old-match', 'other'])
})

test('taxonomy references real career paths and suggests categories from titles', () => {
  assert.equal(taxonomy.suggestRoleCategory('Senior Data Engineer - Pipelines')?.id, 'data-engineer')
  assert.equal(taxonomy.suggestRoleCategory('React Native Developer')?.id, 'mobile')
  assert.equal(taxonomy.suggestRoleCategory('Chef de cuisine'), undefined)
  for (const cat of taxonomy.ROLE_CATEGORIES) assert.ok(cat.careerPathIds.length > 0, `${cat.id} has career paths`)
  assert.deepEqual(taxonomy.levelForExperience(3), ['mid', 'entry'])
})

test('entitlement defaults and overrides keep pro a superset of free', () => {
  const tiers = features.normalizeTierFeatures({ free: ['jobs.discovery', 'jobs.matching', 'bogus.key'], pro: ['jobs.resumeAnalysis'] })
  assert.deepEqual(tiers.free, ['jobs.discovery', 'jobs.matching'])
  assert.ok(tiers.pro.includes('jobs.matching') && tiers.pro.includes('jobs.resumeAnalysis'))
  assert.deepEqual(features.normalizeFeatureFlags({ jobsModule: false, other: 1 }), { jobsModule: false, adminPanel: true })
  assert.equal(features.tierFor(true), 'pro')
  assert.equal(features.tierFor(false), 'free')
})
