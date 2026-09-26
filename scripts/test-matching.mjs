// Compatibility engine, curriculum gap detection, entitlement defaults and
// India/international ranking rules. Pure TypeScript bundled with esbuild;
// the curriculum registry is the real one, so gap detection runs against
// actual track ids and topics.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: {
    compatibility: 'src/lib/jobs/compatibility.ts',
    curriculumMap: 'src/lib/jobs/curriculumMap.ts',
    relevance: 'src/lib/jobs/relevance.ts',
    features: 'src/lib/entitlements/features.ts',
    registry: 'src/lib/curriculum/registry.ts',
  },
  outdir: 'scratch/matching-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react'],
  logLevel: 'silent',
})

const { computeCompatibility } = await import('../scratch/matching-tests/compatibility.mjs')
const { mapJobToCurriculum } = await import('../scratch/matching-tests/curriculumMap.mjs')
const { rankJob, rankJobs } = await import('../scratch/matching-tests/relevance.mjs')
const features = await import('../scratch/matching-tests/features.mjs')
const { getCurriculum, topicIdsOf } = await import('../scratch/matching-tests/registry.mjs')

const job = (over = {}) => ({
  id: 'j1',
  companyId: 'c1',
  sourceId: null,
  title: 'Backend Engineer',
  normalizedTitle: 'backend engineer',
  roleCategory: 'backend',
  careerPathIds: [],
  trackIds: [],
  description: 'd',
  requirementsSummary: null,
  requiredSkills: ['Java', 'Spring Boot', 'SQL'],
  preferredSkills: ['Kafka'],
  experienceMin: 2,
  experienceMax: 5,
  level: 'mid',
  employmentType: 'full_time',
  workMode: 'remote',
  locationCity: 'Bengaluru',
  locationCountry: 'India',
  region: 'india',
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  salaryPeriod: null,
  applyUrl: 'https://a/1',
  sourceUrl: null,
  externalId: null,
  fingerprint: 'f',
  status: 'published',
  postedAt: '2026-09-24T00:00:00.000Z',
  expiresAt: null,
  lastVerifiedAt: '2026-09-24T00:00:00.000Z',
  createdBy: null,
  lifecycle: 'verified',
  firstSeenAt: null,
  lastSeenAt: null,
  remoteEligibility: 'country',
  eligibleCountries: ['India'],
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
  company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null },
  source: null,
  ...over,
})

const prefs = (over = {}) => ({ roleCategories: ['backend'], skills: ['Java', 'SQL'], experienceYears: 3, locations: [], regionPreference: 'india', workModes: [], levels: [], employmentTypes: [], salaryMin: null, salaryCurrency: null, ...over })

const emptyLearner = { goals: [], roadmap: [], knowledgeWorkspaces: [] }

function learnerWithProgress(trackId, share, inGoal = true) {
  const track = getCurriculum().trackById.get(trackId)
  assert.ok(track, `${trackId} exists in the curriculum`)
  const topicIds = topicIdsOf(track)
  const done = topicIds.slice(0, Math.ceil(topicIds.length * share))
  return {
    goals: inGoal ? [{ id: 'g1', targetRole: 'Backend', companyType: '', startDate: '2026-09-01', durationDays: 90, hoursPerDay: 2, restDays: [], tracks: [{ trackId, priority: 'High' }], status: 'Active', goalType: 'Fixed', createdAt: '', updatedAt: '' }] : [],
    roadmap: [{ id: 'd1', goalId: 'g1', date: '2026-09-02', dayNumber: 1, tasks: done.map((topicId, i) => ({ id: `t${i}`, dayId: 'd1', title: 't', type: 'Concept', status: 'Completed', estDurationMinutes: 30, actualDurationMinutes: 30, priority: 'High', topicId, trackId })) }],
    knowledgeWorkspaces: [],
  }
}

test('gap detection classifies tracks as covered, learning or not covered from real progress', () => {
  const none = mapJobToCurriculum(job(), emptyLearner)
  assert.ok(none.tracks.length > 0)
  assert.ok(none.tracks.every((t) => t.gapStatus === 'not_covered'))
  assert.deepEqual(none.gapTrackIds, none.tracks.map((t) => t.track.id))
  assert.ok(none.tracks.some((t) => t.track.id === 'track-java' && t.skills.includes('Java')), 'Java track covers the Java skill')

  const learning = mapJobToCurriculum(job(), learnerWithProgress('track-java', 0.2))
  const javaLearning = learning.tracks.find((t) => t.track.id === 'track-java')
  assert.equal(javaLearning.gapStatus, 'learning')
  assert.equal(javaLearning.inGoal, true)
  assert.ok(!learning.gapTrackIds.includes('track-java'), 'tracks already in the goal are not gaps')

  const covered = mapJobToCurriculum(job(), learnerWithProgress('track-java', 0.8, false))
  const javaCovered = covered.tracks.find((t) => t.track.id === 'track-java')
  assert.equal(javaCovered.gapStatus, 'covered')
  assert.ok(javaCovered.progress >= 70)
  assert.ok(!covered.gapTrackIds.includes('track-java'), 'covered tracks are not gaps')
})

test('compatibility report is deterministic, transparent and explains every component', () => {
  const map = mapJobToCurriculum(job(), learnerWithProgress('track-java', 0.8, false))
  const report = computeCompatibility(job(), prefs(), map)
  assert.equal(report.score, report.breakdown.reduce((s, c) => s + c.points, 0), 'score equals the sum of the breakdown')
  assert.deepEqual(report.breakdown.map((c) => c.key), ['role', 'requiredSkills', 'preferredSkills', 'experience', 'curriculum', 'location'])
  assert.equal(report.breakdown.reduce((s, c) => s + c.max, 0), 100)
  assert.equal(report.breakdown[0].points, 20, 'target role matched')
  assert.match(report.breakdown[1].detail, /2 of 3 required skills/)
  assert.deepEqual(report.missingRequirements, ['Spring Boot'])
  assert.ok(report.skillsToStrengthen.some((s) => /Spring Boot \(learn with/.test(s)))
  assert.match(report.experienceAlignment, /3 yrs is inside the 2–5 yr range/)
  assert.ok(report.curriculumAlignment.covered.includes('Core Java, OOP and Collections'))
  assert.match(report.locationCompatibility, /In India, as you prefer/)
  assert.ok(report.strongAlignment.length >= 3)
  assert.deepEqual(report.missingInputs, [])
  const again = computeCompatibility(job(), prefs(), map)
  assert.deepEqual(again, report, 'same inputs give the same report')
})

test('compatibility handles missing inputs, experience gaps and location conflicts honestly', () => {
  const bare = computeCompatibility(job(), null, null)
  assert.ok(bare.missingInputs.includes('target roles') && bare.missingInputs.includes('skills') && bare.missingInputs.includes('years of experience'))
  assert.ok(bare.score < 60)

  const junior = computeCompatibility(job(), prefs({ experienceYears: 0 }), null)
  assert.match(junior.experienceAlignment, /asks for 2\+ yrs; you have 0/)
  assert.ok(junior.missingRequirements.includes('2+ years of experience'))
  assert.equal(junior.breakdown.find((c) => c.key === 'experience').points, 5, '2 years short earns 30% of the experience points')

  const abroad = computeCompatibility(job({ workMode: 'onsite', region: 'international', locationCountry: 'Germany', locationCity: 'Berlin', remoteEligibility: 'not_remote', eligibleCountries: [] }), prefs({ regionPreference: 'india' }), null)
  assert.match(abroad.locationCompatibility, /Outside your preferred region and not remote/)
  assert.equal(abroad.breakdown.find((c) => c.key === 'location').points, 0)

  const unknownRemote = computeCompatibility(job({ region: 'international', locationCountry: 'United States', locationCity: null, remoteEligibility: 'unknown', eligibleCountries: [] }), prefs({ regionPreference: 'india' }), null)
  assert.match(unknownRemote.locationCompatibility, /does not say which countries/)
})

test('ranking respects India/international preference and remote eligibility', () => {
  const now = new Date('2026-09-25T00:00:00Z')
  const indiaOnly = prefs({ regionPreference: 'india' })
  assert.equal(rankJob(job(), indiaOnly, now).excluded, false, 'remote job that hires from India passes India-only')
  const usRemote = job({ id: 'us', region: 'international', locationCountry: 'United States', remoteEligibility: 'country', eligibleCountries: ['United States'] })
  assert.equal(rankJob(usRemote, indiaOnly, now).excluded, true, 'remote job limited to the US is excluded for India-only')
  const worldwide = job({ id: 'ww', region: 'international', locationCountry: null, remoteEligibility: 'worldwide', eligibleCountries: [] })
  assert.equal(rankJob(worldwide, indiaOnly, now).excluded, false, 'worldwide remote passes')
  const unknown = job({ id: 'unk', region: 'international', locationCountry: 'Germany', remoteEligibility: 'unknown', eligibleCountries: [] })
  const unk = rankJob(unknown, indiaOnly, now)
  assert.equal(unk.excluded, false)
  assert.ok(unk.reasons.some((r) => /does not say which countries/.test(r.text)), 'unknown eligibility is flagged, not assumed')
  const onsiteAbroad = job({ id: 'de', workMode: 'onsite', region: 'international', locationCity: 'Berlin', locationCountry: 'Germany', remoteEligibility: 'not_remote', eligibleCountries: [] })
  assert.equal(rankJob(onsiteAbroad, indiaOnly, now).excluded, true)

  const intlOnly = prefs({ regionPreference: 'international' })
  assert.equal(rankJob(job(), intlOnly, now).excluded, true, 'remote job limited to India is excluded for international-only')
  assert.equal(rankJob(onsiteAbroad, intlOnly, now).excluded, false)

  const anywhere = prefs({ regionPreference: 'any', locations: ['Bengaluru'] })
  const ranked = rankJobs([onsiteAbroad, job(), usRemote], anywhere, now)
  assert.equal(ranked.length, 3, 'no region exclusions when anywhere is chosen')
  assert.equal(ranked[0].job.id, 'j1', 'the job in a preferred city ranks first when everything else ties')
})

test('entitlement defaults keep free usable and limits normalise safely', () => {
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('jobs.discovery'))
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('tracker.basic'))
  assert.ok(!features.DEFAULT_TIER_FEATURES.free.includes('jobs.matching'))
  assert.ok(features.DEFAULT_TIER_FEATURES.pro.includes('jobs.personalizedFeed'))
  const limits = features.normalizeTierLimits({ free: { jobFeed: 5, analysesPerDay: -3 }, pro: { jobFeed: 'x' } })
  assert.deepEqual(limits.free, { ...features.DEFAULT_TIER_LIMITS.free, jobFeed: 5, analysesPerDay: 0 })
  assert.deepEqual(limits.pro, features.DEFAULT_TIER_LIMITS.pro)
  assert.equal(features.hasFeature(features.DEFAULT_TIER_FEATURES.free, 'jobs.curriculumGaps'), false)
  assert.equal(features.hasFeature(features.DEFAULT_TIER_FEATURES.pro, 'jobs.curriculumGaps'), true)
})
