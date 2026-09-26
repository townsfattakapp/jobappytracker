// Phase 4: networking guidance grounding, preparation blueprint relevance and
// curriculum mapping, 7/14/30-day plan generation on the real roadmap engine
// (existing tasks kept, no duplicates, workload and rest days respected),
// readiness arithmetic, outreach input validation and entitlement defaults.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: {
    networking: 'src/lib/jobs/networking.ts',
    prepare: 'src/lib/jobs/prepare.ts',
    prepPlan: 'src/lib/jobs/prepPlan.ts',
    curriculumMap: 'src/lib/jobs/curriculumMap.ts',
    extract: 'src/lib/resume/extract.ts',
    analysis: 'src/lib/jobs/resumeAnalysis.ts',
    registry: 'src/lib/curriculum/registry.ts',
    features: 'src/lib/entitlements/features.ts',
    outreach: 'src/lib/server/outreach.ts',
  },
  outdir: 'scratch/phase4-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', 'pg', 'next/*', 'next-auth', 'next-auth/*'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})
const net = await import('../scratch/phase4-tests/networking.mjs')
const prep = await import('../scratch/phase4-tests/prepare.mjs')
const plan = await import('../scratch/phase4-tests/prepPlan.mjs')
const { mapJobToCurriculum } = await import('../scratch/phase4-tests/curriculumMap.mjs')
const { extractResumeProfile } = await import('../scratch/phase4-tests/extract.mjs')
const { analyzeResumeForJob } = await import('../scratch/phase4-tests/analysis.mjs')
const { getCurriculum, findTopic } = await import('../scratch/phase4-tests/registry.mjs')
const features = await import('../scratch/phase4-tests/features.mjs')
const { parseOutreachInput } = await import('../scratch/phase4-tests/outreach.mjs')

const RESUME = `Asha Verma
Backend Developer
asha.verma@example.invalid

Skills
Java, Spring Boot, PostgreSQL, Docker

Experience
Software Engineer at Nimbus Labs
Jun 2023 - Present
- Built REST APIs in Spring Boot serving 40k daily requests
- Fixed a production incident by finding the root cause in the connection pool
- Owned the migration to PostgreSQL 15

Projects
Inventory Tracker - Spring Boot and PostgreSQL service with Docker deployment

Education
B.Tech Computer Science, Pune University, 2021
`

const job = (over = {}) => ({
  id: 'job-1', companyId: 'c1', sourceId: null, title: 'Backend Engineer', normalizedTitle: 'backend engineer', roleCategory: 'backend', careerPathIds: [], trackIds: [],
  description: 'Build payment services with Java, Spring Boot, Kafka and Redis. Docker is a plus.', requirementsSummary: null,
  requiredSkills: ['Java', 'Spring Boot', 'Kafka'], preferredSkills: ['Redis', 'Docker'], experienceMin: 2, experienceMax: 5, level: 'mid', employmentType: 'full_time', workMode: 'hybrid',
  locationCity: 'Pune', locationCountry: 'India', region: 'india', salaryMin: null, salaryMax: null, salaryCurrency: null, salaryPeriod: null, applyUrl: 'https://careers.example.com/jobs/1', sourceUrl: null, externalId: null, fingerprint: 'f', status: 'published',
  postedAt: '2026-09-20T00:00:00.000Z', expiresAt: null, lastVerifiedAt: null, createdBy: null, lifecycle: 'verified', firstSeenAt: null, lastSeenAt: null, remoteEligibility: 'not_remote', eligibleCountries: [], createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z',
  company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null }, source: null, ...over,
})
const NOW = new Date('2026-09-25T00:00:00Z')
const emptyProgress = { roadmap: [], knowledgeWorkspaces: [] }
const { profile } = extractResumeProfile(RESUME, NOW)
const curriculum = mapJobToCurriculum(job(), { goals: [], roadmap: [], knowledgeWorkspaces: [] })
const analysis = analyzeResumeForJob(job(), 'r1', profile, RESUME, curriculum)

test('networking guidance names categories and search queries, never people', () => {
  const cats = net.contactCategories(job())
  assert.ok(cats.length >= 6)
  assert.ok(cats.every((c) => c.why.length > 20 && c.howToFind.length > 20))
  const hm = cats.find((c) => c.type === 'hiring_manager')
  assert.match(hm.howToFind, /JobAppy does not identify people/)
  const searches = net.linkedInSearches(job(), profile)
  assert.ok(searches.some((s) => s.query === 'Acme Backend Engineer'))
  assert.ok(searches.some((s) => s.query === 'Acme technical recruiter'))
  assert.ok(searches.some((s) => s.query === 'Acme Java engineer'))
  const alumni = searches.find((s) => /alumni/.test(s.label))
  assert.ok(alumni && /Pune University/.test(alumni.query) && alumni.basis === 'your resume (education)')
  assert.ok(searches.every((s) => s.url.startsWith('https://www.linkedin.com/search/results/people/?keywords=')))
  assert.ok(!net.linkedInSearches(job(), null).some((s) => /alumni|previous employer/.test(s.label)), 'no resume, no alumni query')
})

test('drafts are grounded only in resume and job facts and never assert familiarity', () => {
  const g = net.groundingFrom(profile, analysis, null)
  assert.equal(g.learnerName, 'Asha Verma')
  assert.equal(g.currentTitle, 'Software Engineer')
  assert.equal(g.currentCompany, 'Nimbus Labs')
  assert.ok(g.matchedSkills.includes('Spring Boot') && !g.matchedSkills.includes('Kafka') && !g.matchedSkills.includes('Java'), 'only demonstrated skills the listing asks for (Java is merely listed)')
  assert.equal(g.project.name, 'Inventory Tracker')
  const drafts = net.buildDrafts(job(), g, ['connection', 'referral', 'recruiter', 'hiring_manager', 'follow_up', 'thank_you'])
  assert.equal(drafts.length, 6)
  for (const d of drafts) {
    assert.ok(d.body.includes('[Name]'), 'contact name is always a placeholder')
    assert.ok(d.body.endsWith('Asha Verma'))
    assert.ok(!/\b(we met|mutual|our conversation|as discussed|you mentioned|great to meet|my friend|colleague)\b/i.test(d.body), `no fabricated familiarity in ${d.type}`)
    assert.ok(!/Kafka|Redis/.test(d.body), `no skill the resume lacks in ${d.type}`)
    assert.ok(!/guarantee|shortlist/i.test(d.body))
    assert.ok(d.usedFacts.every((f) => ['resume', 'job', 'you'].includes(f.source)))
    assert.ok(d.characterCount < 900, `${d.type} stays concise (${d.characterCount})`)
  }
  const referral = drafts.find((d) => d.type === 'referral')
  assert.match(referral.body, /Software Engineer at Nimbus Labs/)
  assert.ok(!/\bJava\b/.test(referral.body), 'a skill that is only listed, not demonstrated, is not claimed')
  assert.match(referral.body, /Inventory Tracker/)
  assert.match(referral.body, /if not, no problem at all/)
  const hm = drafts.find((d) => d.type === 'hiring_manager')
  assert.ok(hm.placeholders.some((p) => /confirm the person is actually involved/.test(p)))
  // Without a resume: no experience claims at all.
  const bare = net.buildDraft('referral', job(), net.groundingFrom(null, null, null))
  assert.ok(!/I am a/.test(bare.body) && bare.body.includes('[Your name]'))
})

test('preparation blueprint is relevant to the role and maps to existing curriculum topics', () => {
  const bp = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const titles = (items) => items.map((i) => i.title)
  assert.ok(titles(bp.mustPrepare).includes('Kafka'), 'Kafka is required and not demonstrated')
  assert.ok(titles(bp.mustPrepare).includes('Redis (preferred)'))
  assert.ok(titles(bp.revise).includes('Java'), 'Java is only listed in the resume, so it is a revise item')
  assert.ok(!titles(bp.mustPrepare).includes('Java'), 'demonstrated skills are not must-prepare')
  for (const item of [...bp.mustPrepare, ...bp.revise, ...bp.dsa.items, ...bp.csFundamentals, ...bp.systemDesign.items]) {
    if (!item.ref) continue
    const ref = findTopic(item.ref.topicId)
    assert.ok(ref, `${item.title} maps to an existing topic`)
    assert.equal(ref.track.id, item.ref.trackId)
    assert.equal(ref.topic.title, item.ref.topicTitle)
  }
  const kafka = bp.mustPrepare.find((i) => i.title === 'Kafka')
  assert.equal(kafka.ref.trackId, 'track-kafka')
  assert.equal(bp.dsa.depth, 'standard', 'mid-level backend gets standard DSA')
  assert.ok(bp.dsa.items.every((i) => i.ref.trackId === 'track-dsa'))
  assert.equal(bp.systemDesign.depth, 'basics', 'mid-level without design wording gets basics only')
  assert.ok(bp.csFundamentals.length >= 2)
  assert.equal(bp.projects[0].title, 'Inventory Tracker')
  assert.ok(bp.projects.every((p) => p.provenance.includes('resume')), 'projects only from the resume')
  const production = bp.behavioral.find((b) => /Production issues/.test(b.title))
  assert.match(production.reason, /production incident/, 'behavioural area grounded in a resume bullet')
  assert.ok(bp.behavioral.find((b) => /Ownership/.test(b.title)).provenance.includes('resume'))
  assert.ok(bp.interviewKit.every((s) => s.items.length > 0))
  assert.ok(bp.interviewKit.some((s) => s.id === 'projects') && bp.interviewKit.some((s) => s.id === 'behavioral'))
  assert.ok(bp.interviewKit.flatMap((s) => s.items).flatMap((i) => i.questions).every((q) => ['curriculum', 'generated'].includes(q.source)))
  assert.deepEqual(new Set(bp.plannable.map((i) => i.ref.topicId)).size, bp.plannable.length, 'plannable items are unique per topic')
  assert.deepEqual(bp.missingInputs, ['compatibility analysis'])
})

test('system design and DSA depth follow level and role, never assumed for entry level', () => {
  const entry = prep.buildPrepBlueprint({ job: job({ level: 'entry' }), curriculum, compatibility: null, resume: null, profile: null, progress: emptyProgress })
  assert.equal(entry.systemDesign.depth, 'none')
  assert.equal(entry.systemDesign.items.length, 0)
  assert.equal(entry.dsa.depth, 'core')
  const entryDesign = prep.buildPrepBlueprint({ job: job({ level: 'entry', description: 'Work on distributed systems at scale.' }), curriculum, compatibility: null, resume: null, profile: null, progress: emptyProgress })
  assert.equal(entryDesign.systemDesign.depth, 'basics', 'entry level gets basics only when the listing mentions it')
  const lead = prep.buildPrepBlueprint({ job: job({ level: 'lead' }), curriculum, compatibility: null, resume: null, profile: null, progress: emptyProgress })
  assert.equal(lead.systemDesign.depth, 'senior')
  assert.equal(lead.dsa.depth, 'advanced')
})

test('data roles skip DSA and use database/statistics fundamentals', () => {
  const analystJob = job({ roleCategory: 'data-analyst', requiredSkills: ['SQL', 'Excel'], preferredSkills: ['Power BI'] })
  const map = mapJobToCurriculum(analystJob, { goals: [], roadmap: [], knowledgeWorkspaces: [] })
  const bp = prep.buildPrepBlueprint({ job: analystJob, curriculum: map, compatibility: null, resume: null, profile: null, progress: emptyProgress })
  assert.equal(bp.dsa.depth, 'none')
  assert.equal(bp.dsa.items.length, 0)
  assert.ok(bp.csFundamentals.some((i) => /track-sql|track-statistics|track-probability/.test(i.ref.trackId)))
  assert.ok(!bp.interviewKit.some((s) => s.id === 'dsa'))
})

test('progress changes item status: completed topics become revise, not must', () => {
  const bp0 = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const kafka = bp0.mustPrepare.find((i) => i.title === 'Kafka')
  const progress = { roadmap: [{ id: 'd', goalId: 'g', date: '2026-09-20', dayNumber: 1, tasks: [{ id: 't', dayId: 'd', title: 't', type: 'Concept', status: 'Completed', estDurationMinutes: 30, actualDurationMinutes: 30, priority: 'High', topicId: kafka.ref.topicId, trackId: 'track-kafka' }] }], knowledgeWorkspaces: [] }
  const bp1 = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress })
  assert.ok(!bp1.mustPrepare.some((i) => i.title === 'Kafka'))
  assert.ok(bp1.revise.some((i) => i.title === 'Kafka'))
})

function goalWith(over = {}) {
  return { id: 'g1', targetRole: 'Backend', companyType: '', startDate: '2026-09-01', durationDays: 120, hoursPerDay: 2, restDays: [0], tracks: [{ trackId: 'track-dsa', priority: 'High' }], status: 'Active', goalType: 'Fixed', createdAt: '', updatedAt: '', ...over }
}

test('7/14/30-day plans use the roadmap engine: window, rest days, workload, tags', () => {
  const bp = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const goal = goalWith()
  for (const days of [7, 14, 30]) {
    const preview = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal, roadmap: [], days, fromDate: '2026-09-28' })
    assert.equal(preview.days, days)
    assert.equal(preview.toDate, days === 7 ? '2026-10-04' : days === 14 ? '2026-10-11' : '2026-10-27')
    assert.ok(preview.tasks.length > 0, `${days}-day plan adds tasks`)
    assert.ok(preview.tasks.every((t) => t.prepJobId === 'job-1'), 'new tasks carry the job reference')
    for (const day of preview.byDay) {
      assert.ok(day.date >= '2026-09-28' && day.date <= preview.toDate, `tasks stay inside the window (${day.date})`)
      assert.ok(day.minutes <= 120, `daily minutes within hoursPerDay (${day.minutes})`)
      assert.notEqual(new Date(`${day.date}T12:00:00`).getDay(), 0, 'Sunday is a rest day')
    }
    const plannedDays = preview.roadmap.filter((d) => d.tasks.some((t) => t.prepJobId)).map((d) => d.date.slice(0, 10))
    assert.ok(plannedDays.every((d) => d <= preview.toDate))
  }
  const short = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal, roadmap: [], days: 7, fromDate: '2026-09-28' })
  const long = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal, roadmap: [], days: 30, fromDate: '2026-09-28' })
  assert.ok(long.topicsPlanned >= short.topicsPlanned, 'longer plans cover at least as many topics')
  assert.equal(short.topicsPlanned + short.topicsUnscheduled + short.topicsAlreadyPlanned, short.topicsRequested)
})

test('plans keep existing tasks, never duplicate curriculum steps, and honour completed work', () => {
  const bp = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const goal = goalWith({ hoursPerDay: 8 })
  const first = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal, roadmap: [], days: 30, fromDate: '2026-09-28' })
  assert.equal(first.topicsUnscheduled, 0, 'everything fits at 8 h/day over 30 days')
  const existingIds = new Set(first.roadmap.flatMap((d) => d.tasks.map((t) => t.id)))
  // Mark one task completed and add an unrelated manual task; then plan again on top.
  const roadmap = first.roadmap.map((d, i) => ({ ...d, tasks: d.tasks.map((t, j) => (i === 0 && j === 0 ? { ...t, status: 'Completed' } : t)).concat(i === 0 ? [{ id: 'manual-1', dayId: d.id, title: 'My own task', type: 'Other', status: 'Pending', estDurationMinutes: 30, actualDurationMinutes: 0, priority: 'Medium' }] : []) }))
  const second = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal, roadmap, days: 30, fromDate: '2026-09-28' })
  assert.equal(second.tasks.length, 0, 'nothing new when every step is already scheduled')
  assert.equal(second.topicsAlreadyPlanned, second.topicsRequested)
  const after = second.roadmap.flatMap((d) => d.tasks)
  for (const id of existingIds) assert.ok(after.some((t) => t.id === id), 'existing tasks preserved')
  assert.ok(after.some((t) => t.id === 'manual-1'), 'manual task preserved')
  assert.equal(after.find((t) => t.status === 'Completed').status, 'Completed', 'completed status preserved')
  const stepIds = after.filter((t) => t.curriculumTaskId).map((t) => t.curriculumTaskId)
  assert.equal(new Set(stepIds).size, stepIds.length, 'no duplicate curriculum steps')
  // A preview never mutates the input roadmap.
  assert.equal(roadmap.flatMap((d) => d.tasks).length, first.roadmap.flatMap((d) => d.tasks).length + 1)
})

test('prerequisite topics are scheduled before dependants inside the plan', () => {
  const bp = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const preview = plan.buildPreparationPlan({ job: job(), blueprint: bp, goal: goalWith({ hoursPerDay: 6 }), roadmap: [], days: 30, fromDate: '2026-09-28' })
  const firstIndex = new Map()
  preview.roadmap.forEach((d, di) => d.tasks.forEach((t) => { if (t.prepJobId && t.topicId && !firstIndex.has(t.topicId)) firstIndex.set(t.topicId, di) }))
  let checked = 0
  for (const topicId of firstIndex.keys()) {
    const topic = getCurriculum().byId.get(topicId)?.topic
    for (const pre of topic?.prerequisites || []) if (firstIndex.has(pre)) { assert.ok(firstIndex.get(pre) <= firstIndex.get(topicId), `${pre} before ${topicId}`); checked += 1 }
  }
  assert.ok(checked >= 0)
})

test('readiness counts facts only and phrases them as completed areas', () => {
  const bp = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
  const kafka = bp.mustPrepare.find((i) => i.title === 'Kafka')
  const r0 = prep.computeReadiness({ jobId: 'job-1', blueprint: bp, curriculum, resume: analysis, suggestionState: {}, progress: emptyProgress, completedItemIds: [], application: null, outreach: [] })
  assert.match(r0.headline, /^0 of \d+ identified preparation areas completed\.$/)
  assert.ok(!/chance|probab|%/.test(r0.headline))
  const progress = { roadmap: [{ id: 'd', goalId: 'g', date: '2026-09-29', dayNumber: 1, tasks: [{ id: 't', dayId: 'd', title: 't', type: 'Concept', status: 'Completed', estDurationMinutes: 30, actualDurationMinutes: 30, priority: 'High', topicId: kafka.ref.topicId, trackId: 'track-kafka', prepJobId: 'job-1' }] }], knowledgeWorkspaces: [] }
  const r1 = prep.computeReadiness({ jobId: 'job-1', blueprint: bp, curriculum, resume: analysis, suggestionState: { [analysis.improvements.find((s) => s.kind !== 'gap').id]: 'completed' }, progress, completedItemIds: [bp.behavioral[0].id], application: { status: 'Applied' }, outreach: [{ status: 'connection_sent' }, { status: 'not_contacted' }] })
  assert.equal(r1.preparationDone, 2, 'one via completed prep task, one via manual completion')
  const byId = Object.fromEntries(r1.areas.map((a) => [a.id, a]))
  assert.equal(byId.tasks.done, 1)
  assert.equal(byId.resume.done, 1)
  assert.equal(byId.application.detail, 'Tracked as Applied')
  assert.equal(byId.networking.done, 1)
  assert.equal(byId.skills.total, 3)
})

test('outreach input validation and entitlement defaults', () => {
  const ok = parseOutreachInput({ name: '  Priya Singh ', role: 'Recruiter', contactType: 'recruiter', profileUrl: 'linkedin.com/in/priya', messageType: 'recruiter', status: 'connection_sent', followUpDate: '2026-10-05', notes: 'met at none' })
  assert.equal(ok.name, 'Priya Singh')
  assert.equal(ok.profileUrl, 'https://linkedin.com/in/priya')
  assert.throws(() => parseOutreachInput({ name: '', contactType: 'recruiter' }), /name is required/)
  assert.throws(() => parseOutreachInput({ name: 'x', contactType: 'ceo' }), /contact type/)
  assert.throws(() => parseOutreachInput({ name: 'x', contactType: 'engineer', status: 'ghosted' }), /Unknown status/)
  assert.throws(() => parseOutreachInput({ name: 'x', contactType: 'engineer', followUpDate: 'next week' }), /Follow-up date/)
  const partial = parseOutreachInput({ status: 'connected' }, true, ok)
  assert.equal(partial.name, 'Priya Singh')
  assert.equal(partial.status, 'connected')
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('jobs.networkingBasic') && features.DEFAULT_TIER_FEATURES.free.includes('jobs.preparationBasic'))
  assert.ok(!features.DEFAULT_TIER_FEATURES.free.includes('jobs.outreachTracker') && !features.DEFAULT_TIER_FEATURES.free.includes('jobs.preparation'))
  assert.ok(features.DEFAULT_TIER_FEATURES.pro.includes('jobs.interviewKit') && features.DEFAULT_TIER_FEATURES.pro.includes('jobs.readinessAdvanced'))
  assert.equal(features.DEFAULT_TIER_LIMITS.free.preparationPlansPerDay, 0)
  assert.equal(features.DEFAULT_TIER_LIMITS.free.messageDraftsPerDay, 3)
  const norm = features.normalizeTierLimits({ pro: { messageDraftsPerDay: 5, preparationPlansPerDay: -1 } })
  assert.equal(norm.pro.messageDraftsPerDay, 5)
  assert.equal(norm.pro.preparationPlansPerDay, features.DEFAULT_TIER_LIMITS.pro.preparationPlansPerDay)
})
