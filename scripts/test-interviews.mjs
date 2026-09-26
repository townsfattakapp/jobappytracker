// Phase 6: job-specific mock interview engine and session service.
// Role-specific composition, seniority handling, question provenance, resume
// grounding (no fabricated projects), adaptive follow-ups, termination,
// coding / system-design inclusion rules, feedback generation, weakness
// detection and curriculum mapping, duplicate task prevention, re-attempts,
// attempt history and comparison, readiness integration, entitlements, usage
// limits and owner isolation (PGlite with the real migrations).
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({
  entryPoints: {
    engine: 'src/lib/interview/jobInterview.ts',
    interviews: 'src/lib/server/interviews.ts',
    prepare: 'src/lib/jobs/prepare.ts',
    prepPlan: 'src/lib/jobs/prepPlan.ts',
    curriculumMap: 'src/lib/jobs/curriculumMap.ts',
    extract: 'src/lib/resume/extract.ts',
    analysis: 'src/lib/jobs/resumeAnalysis.ts',
    features: 'src/lib/entitlements/features.ts',
    schema: 'src/lib/db/schema.ts',
  },
  outdir: 'scratch/interview-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})
const engine = await import('../scratch/interview-tests/engine.mjs')
const svc = await import('../scratch/interview-tests/interviews.mjs')
const prep = await import('../scratch/interview-tests/prepare.mjs')
const plan = await import('../scratch/interview-tests/prepPlan.mjs')
const { mapJobToCurriculum } = await import('../scratch/interview-tests/curriculumMap.mjs')
const { extractResumeProfile } = await import('../scratch/interview-tests/extract.mjs')
const { analyzeResumeForJob } = await import('../scratch/interview-tests/analysis.mjs')
const features = await import('../scratch/interview-tests/features.mjs')
const schema = await import('../scratch/interview-tests/schema.mjs')

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
  requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'SQL'], preferredSkills: ['Redis', 'Docker'], experienceMin: 2, experienceMax: 5, level: 'mid', employmentType: 'full_time', workMode: 'hybrid',
  locationCity: 'Pune', locationCountry: 'India', region: 'india', salaryMin: null, salaryMax: null, salaryCurrency: null, salaryPeriod: null, applyUrl: 'https://careers.example.com/jobs/1', sourceUrl: null, externalId: null, fingerprint: 'f', status: 'published',
  postedAt: '2026-09-20T00:00:00.000Z', expiresAt: null, lastVerifiedAt: null, createdBy: null, lifecycle: 'verified', firstSeenAt: null, lastSeenAt: null, remoteEligibility: 'not_remote', eligibleCountries: [], createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z',
  company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null }, source: null, ...over,
})
const NOW = new Date('2026-09-25T10:00:00Z')
const emptyProgress = { roadmap: [], knowledgeWorkspaces: [] }
const { profile } = extractResumeProfile(RESUME, NOW)
const curriculum = mapJobToCurriculum(job(), { goals: [], roadmap: [], knowledgeWorkspaces: [] })
const analysis = analyzeResumeForJob(job(), 'r1', profile, RESUME, curriculum)
const blueprint = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: emptyProgress })
const FULL = { full: true, preview: true, adaptive: true, detailed: true, curriculumMapping: true, coding: true, design: true, reattempt: true, history: true, maxMinutes: 60 }
const FREE = { full: false, preview: true, adaptive: false, detailed: false, curriculumMapping: false, coding: false, design: false, reattempt: false, history: false, maxMinutes: 15 }
const ENT = { adaptive: true, detailed: true, curriculumMapping: true, preview: false }

function context(over = {}) {
  return engine.buildInterviewContext({ job: job(), blueprint, profile, analysis, compatibility: { score: 70, strongAlignment: ['Java'], missingRequirements: ['Kafka'] }, progress: {}, ...over })
}
function compose(cfgOver = {}, opts = {}) {
  const ctx = opts.context ?? context()
  const derived = engine.deriveInterviewConfig(ctx)
  return engine.composeInterview(ctx, { ...derived.config, ...cfgOver }, { mode: 'full', seed: 0, entitlements: ENT, ...opts })
}

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.users).values([{ id: 'u1', email: 'one@example.invalid' }, { id: 'u2', email: 'two@example.invalid' }])
  await db.insert(schema.companies).values({ id: 'c1', name: 'Acme', slug: 'acme', createdAt: NOW, updatedAt: NOW })
  await db.insert(schema.jobs).values({ id: 'job-1', companyId: 'c1', title: 'Backend Engineer', normalizedTitle: 'backend engineer', roleCategory: 'backend', description: job().description, requiredSkills: job().requiredSkills, preferredSkills: job().preferredSkills, level: 'mid', employmentType: 'full_time', workMode: 'hybrid', region: 'india', applyUrl: job().applyUrl, fingerprint: 'f', status: 'published', createdAt: NOW, updatedAt: NOW })
  return { client, db }
}
const createInput = (over = {}) => ({ userId: 'u1', job: job(), blueprint, profile, analysis, compatibility: null, progress: {}, config: {}, mode: 'full', access: FULL, ...over })

/** Answers every question with the given text (or a per-kind function), answering follow-ups the same way; returns the completed row. */
async function runThrough(db, row, answerFor, now = NOW) {
  let s = svc.toSessionDto(row, now)
  let guard = 0
  while (s.next.type !== 'done' && guard++ < 80) {
    const q = s.next.question
    const a = typeof answerFor === 'function' ? answerFor(q, s.next) : answerFor
    const updated = a === null ? await svc.submitTurn(db, 'u1', s.id, { questionId: q.id, kind: 'skip' }, now) : await svc.submitTurn(db, 'u1', s.id, { questionId: q.id, kind: 'answer', ...(typeof a === 'string' ? { text: a } : a) }, now)
    s = svc.toSessionDto(updated, now)
  }
  return svc.completeSession(db, 'u1', s.id, new Date(now.getTime() + 20 * 60_000))
}

test('interview composition adapts to role, seniority and the derived configuration', () => {
  const backend = compose()
  const ids = backend.sections.map((s) => s.id)
  assert.deepEqual(ids.slice(0, 1), ['intro'])
  assert.equal(ids[ids.length - 1], 'wrapup')
  assert.ok(ids.includes('resume') && ids.includes('technical') && ids.includes('behavioral') && ids.includes('coding') && ids.includes('design'), `mid backend gets resume, technical, coding, design and behavioural (${ids})`)
  assert.equal(backend.questions.find((q) => q.kind === 'coding').tool, 'code')
  assert.equal(backend.questions.find((q) => q.kind === 'design').tool, 'diagram')
  assert.ok(backend.plannedMinutes <= 60 && backend.plannedMinutes >= 25, `planned minutes within budget (${backend.plannedMinutes})`)

  const analystCtx = context({ job: job({ roleCategory: 'data-analyst', title: 'Data Analyst', requiredSkills: ['SQL', 'Excel'], preferredSkills: [], description: 'Build dashboards and SQL reports.' }), blueprint: null, analysis: null })
  const analyst = engine.deriveInterviewConfig(analystCtx)
  assert.equal(analyst.codingRelevant, false, 'no DSA round for data analysts')
  assert.equal(analyst.designRelevant, false, 'no system design for a mid analyst that does not mention it')
  const analystPlan = engine.composeInterview(analystCtx, analyst.config, { mode: 'full', seed: 0, entitlements: ENT })
  assert.ok(!analystPlan.sections.some((s) => s.id === 'coding' || s.id === 'design'))

  const entryCtx = context({ job: job({ level: 'entry', experienceMin: 0, experienceMax: 1 }), blueprint: null })
  const entry = engine.deriveInterviewConfig(entryCtx)
  assert.equal(entry.config.difficulty, 'foundational')
  assert.equal(entry.config.technicalDepth, 'overview')
  assert.equal(entry.designRelevant, false, 'entry-level backend without design words gets no design round')
  assert.equal(entry.codingRelevant, true)

  const leadCtx = context({ job: job({ level: 'lead' }), blueprint: null })
  const lead = engine.deriveInterviewConfig(leadCtx)
  assert.equal(lead.config.difficulty, 'advanced')
  assert.equal(lead.config.technicalDepth, 'deep')
  const leadPlan = engine.composeInterview(leadCtx, lead.config, { mode: 'full', seed: 0, entitlements: ENT })
  const design = leadPlan.questions.find((q) => q.kind === 'design')
  assert.ok(design.expectedConcepts.includes('consistency') || design.expectedConcepts.includes('replication'), 'senior design probes consistency/replication')
  assert.equal(leadPlan.questions.find((q) => q.kind === 'coding').maxFollowUps, 2, 'advanced difficulty allows two follow-ups')

  const frontendCtx = context({ job: job({ roleCategory: 'frontend', title: 'Frontend Engineer', requiredSkills: ['JavaScript', 'React', 'TypeScript'], preferredSkills: ['CSS'], description: 'Build React interfaces.' }), blueprint: null, analysis: null })
  const fe = engine.composeInterview(frontendCtx, engine.deriveInterviewConfig(frontendCtx).config, { mode: 'full', seed: 0, entitlements: ENT })
  const feAreas = fe.questions.filter((q) => q.kind === 'technical').map((q) => `${q.area} ${q.sourceNote}`).join(' | ')
  assert.match(feAreas, /React|JavaScript|TypeScript/, `frontend technical questions come from the listed frontend stack (${feAreas})`)
})

test('every question carries provenance; resume questions only cite real resume evidence; generated prompts are labelled practice', () => {
  const p = compose()
  for (const q of p.questions) {
    assert.ok(['curriculum', 'job', 'resume', 'generated'].includes(q.provenance), q.key)
    assert.ok(q.sourceNote.length > 0)
    if (q.provenance === 'curriculum') assert.ok(q.ref && q.ref.trackId && q.ref.topicId, 'curriculum questions point at a real topic')
    if (q.provenance === 'generated') assert.ok(q.sourceNote.includes(engine.PRACTICE_LABEL) || ['intro', 'wrapup'].includes(q.kind), `generated questions are labelled (${q.key})`)
  }
  const resumeQs = p.questions.filter((q) => q.provenance === 'resume')
  assert.ok(resumeQs.length > 0, 'resume section present when a profile exists')
  const projectNames = profile.projects.map((x) => x.name)
  const bullets = profile.employment.flatMap((e) => e.bullets)
  for (const q of resumeQs) {
    const cites = projectNames.some((n) => q.prompt.includes(n)) || bullets.some((b) => q.prompt.includes(b.slice(0, 40)))
    assert.ok(cites, `resume question cites a real project or bullet: ${q.prompt}`)
  }
  assert.ok(resumeQs.some((q) => q.prompt.includes('Inventory Tracker')))
  assert.ok(!p.questions.some((q) => /Google|Microsoft|Amazon/.test(q.prompt)), 'never presented as a named company question')
  // Without a resume nothing is invented.
  const noResume = compose({}, { context: context({ profile: null, analysis: null }) })
  assert.equal(noResume.questions.filter((q) => q.provenance === 'resume').length, 0)
  assert.ok(!noResume.sections.some((s) => s.id === 'resume'))
  // Curriculum quiz questions come with key terms from the reference answer.
  const cq = p.questions.find((q) => q.provenance === 'curriculum')
  assert.ok(cq && cq.expectedConcepts.length >= 1)
})

test('answers are analysed for evidence and the interviewer reacts with bounded follow-ups', () => {
  const p = compose()
  const tech = p.questions.find((q) => q.kind === 'technical')
  const thin = engine.analyzeAnswer(tech, { text: 'It is a common thing.' })
  assert.equal(thin.quality, 'thin')
  assert.equal(engine.decideFollowUp(tech, thin, [], true).intent, 'clarify')
  const gaveUp = engine.analyzeAnswer(tech, { text: "I don't know this one." })
  assert.equal(engine.decideFollowUp(tech, gaveUp, [], true).intent, 'simplify')
  const partialText = `${tech.expectedConcepts.slice(0, Math.ceil(tech.expectedConcepts.length / 2)).join(' and ')} are the main ideas here and I would apply them carefully in a service, checking the behaviour under load and reviewing the results with the team before shipping to production.`
  const partial = engine.analyzeAnswer(tech, { text: partialText })
  assert.ok(['partial', 'solid'].includes(partial.quality), partial.quality)
  const fu = engine.decideFollowUp(tech, partial, [], true)
  assert.ok(fu && ['probe_missing', 'tradeoff'].includes(fu.intent), `probes a missed concept or trade-off (${fu?.intent})`)
  if (fu.intent === 'probe_missing') assert.ok(partial.conceptsMissed.some((c) => fu.prompt.includes(c)), 'the probe names the missed concept')
  const strongText = `${tech.expectedConcepts.join(', ')}: in my project we used these together; the trade-off is complexity versus performance, however we measured it and for example the p99 dropped. ${'It scales because we shard the work. '.repeat(6)}`
  const strong = engine.analyzeAnswer(tech, { text: strongText })
  assert.equal(strong.quality, 'strong')
  assert.equal(strong.conceptsMissed.length, 0)
  assert.equal(engine.decideFollowUp(tech, strong, [], true).intent, 'challenge')
  assert.equal(engine.decideFollowUp(tech, strong, ['challenge'], true), null, 'one follow-up at standard difficulty')
  assert.equal(engine.decideFollowUp(tech, thin, [], false), null, 'no follow-ups without the adaptive entitlement')
  assert.equal(engine.decideFollowUp(p.questions[0], thin, [], true), null, 'intro is never probed')
  const beh = p.questions.find((q) => q.kind === 'behavioral')
  const noExample = engine.analyzeAnswer(beh, { text: 'I think ownership is important and I always try to take responsibility for my work and communicate clearly with everyone involved in the project so that we deliver.' })
  assert.equal(engine.decideFollowUp(beh, noExample, [], true).intent, 'example')
  const star = engine.analyzeAnswer(beh, { text: 'When our payment job failed last year, the situation was bad. I decided to own the fix: I investigated the logs, wrote a retry, and as a result failures dropped 90%. I learned to add alerts first.' })
  assert.equal(star.hasStructure, true)
  assert.ok(star.conceptsHit.includes('result') && star.conceptsHit.includes('your action'))
  const coding = p.questions.find((q) => q.kind === 'coding')
  const noComplexity = engine.analyzeAnswer(coding, { text: 'I use a hash map in a single pass and return the indices when the complement exists.', code: 'function twoSum(nums, target) {\n  const seen = new Map()\n  for (let i = 0; i < nums.length; i++) { if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]; seen.set(nums[i], i) }\n  return []\n}' })
  assert.equal(noComplexity.hasCode, true)
  assert.equal(engine.decideFollowUp(coding, noComplexity, [], true).intent, 'probe_missing')
  const design = p.questions.find((q) => q.kind === 'design')
  const noTradeoff = engine.analyzeAnswer(design, { text: `${design.expectedConcepts.join(', ')} are all covered in my design with a clear request flow between the components and a database behind the api layer; monitoring is added at every hop.` })
  const dfu = engine.decideFollowUp(design, noTradeoff, [], true)
  assert.ok(dfu && ['tradeoff', 'probe_missing'].includes(dfu.intent))
})

test('sessions persist, advance question by question, react with follow-ups, terminate and build a report from stored evidence only', async () => {
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput(), NOW)
    assert.equal(row.status, 'active')
    assert.equal(row.jobId, 'job-1')
    assert.equal(row.jobSnapshot.title, 'Backend Engineer')
    let s = svc.toSessionDto(row, NOW)
    assert.equal(s.next.type, 'question')
    assert.equal(s.next.question.kind, 'intro')
    // Wrong question id is refused.
    await assert.rejects(svc.submitTurn(db, 'u1', s.id, { questionId: 'q99', kind: 'answer', text: 'x' }, NOW), /not the current one/)
    // Intro answered, then a thin technical answer triggers a clarify follow-up, then the follow-up answer advances.
    const introId = s.next.question.id
    s = svc.toSessionDto(await svc.submitTurn(db, 'u1', s.id, { questionId: introId, kind: 'answer', text: 'I am a backend developer with three years in Java services and I want to work on payments.' }, NOW), NOW)
    while (s.next.type === 'question' && s.next.question.kind !== 'technical') s = svc.toSessionDto(await svc.submitTurn(db, 'u1', s.id, { questionId: s.next.question.id, kind: 'skip' }, NOW), NOW)
    const tq = s.next.question
    s = svc.toSessionDto(await svc.submitTurn(db, 'u1', s.id, { questionId: tq.id, kind: 'answer', text: 'It is a common thing.' }, NOW), NOW)
    assert.equal(s.next.type, 'follow_up')
    assert.equal(s.next.question.id, tq.id)
    assert.equal(s.next.intent, 'clarify')
    s = svc.toSessionDto(await svc.submitTurn(db, 'u1', s.id, { questionId: tq.id, kind: 'answer', text: 'I would start by checking the configuration and then look at the logs and metrics to see the behaviour under load before changing anything in the service.' }, NOW), NOW)
    assert.notEqual(s.next.type === 'question' ? s.next.question.id : null, tq.id, 'moved on after the follow-up (budget of one)')
    assert.equal(s.turns.filter((t) => t.kind === 'follow_up').length, 1)
    assert.ok(s.turns.every((t) => t.role !== 'candidate' || t.kind === 'skip' || t.evidence), 'evidence stored with every answer')
    // Finish everything with skips, then complete.
    const done = await runThrough(db, await svc.getSession(db, 'u1', s.id), (q) => (q.kind === 'behavioral' ? 'When the release failed, I decided to own it: I investigated, wrote a fix and as a result we shipped; I learned to test first.' : null))
    assert.equal(done.status, 'completed')
    assert.ok(done.report)
    assert.equal(svc.toSessionDto(done, NOW).next.type, 'done')
    assert.ok(done.report.summary.length > 0)
    assert.ok(!/hire|%|chance|probab/i.test(JSON.stringify([done.report.summary, done.report.strongAreas, done.report.needsImprovement])), 'no hiring probability language')
    assert.equal(done.report.followUpsAsked, 1)
    assert.ok(done.report.questions.length >= 3)
    const fb = done.report.questions.find((q) => q.questionId === tq.id)
    assert.equal(fb.followUps.length, 1)
    assert.ok(fb.evidence.length > 0 && fb.betterApproach.length > 0)
    assert.ok(done.report.weaknesses.length > 0, 'skipped and thin answers become weaknesses')
    assert.ok(done.report.weaknesses.some((w) => w.ref && w.ref.topicId), 'weaknesses map to curriculum topics')
    // Turns after completion are refused; completing twice is idempotent.
    await assert.rejects(svc.submitTurn(db, 'u1', s.id, { questionId: introId, kind: 'answer', text: 'late' }, NOW), /ended/)
    const again = await svc.completeSession(db, 'u1', s.id, NOW)
    assert.deepEqual(again.report, done.report, 'report is not rewritten')
  } finally {
    await client.close()
  }
})

test('coding and system design are included only when relevant, requested and entitled', async () => {
  const ctx = context()
  const derived = engine.deriveInterviewConfig(ctx)
  assert.equal(derived.config.includeCoding, true)
  const noCoding = engine.composeInterview(ctx, { ...derived.config, includeCoding: false }, { mode: 'full', seed: 0, entitlements: ENT })
  assert.ok(!noCoding.sections.some((s) => s.id === 'coding'))
  const noDesign = engine.composeInterview(ctx, { ...derived.config, includeDesign: false }, { mode: 'full', seed: 0, entitlements: ENT })
  assert.ok(!noDesign.sections.some((s) => s.id === 'design'))
  const restricted = engine.normalizeConfig({ includeCoding: true, includeDesign: true, minutes: 60 }, derived, { allowCoding: false, allowDesign: false, maxMinutes: 30 })
  assert.equal(restricted.includeCoding, false, 'plan without the coding entitlement cannot switch it on')
  assert.equal(restricted.includeDesign, false)
  assert.ok(restricted.minutes <= 30, `duration clamped to the plan maximum (${restricted.minutes})`)
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput({ access: { ...FULL, coding: false } }), NOW)
    assert.ok(!row.plan.sections.some((s) => s.id === 'coding'))
    assert.ok(row.plan.sections.some((s) => s.id === 'design'))
  } finally {
    await client.close()
  }
})

test('preview entitlement: three questions, no follow-ups, summary-only report, no weakness mapping', async () => {
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput({ access: FREE, mode: 'full' }), NOW)
    assert.equal(row.mode, 'preview', 'full mode downgraded to preview without the entitlement')
    assert.ok(row.plan.questions.length <= 3)
    assert.ok(row.plan.questions.every((q) => q.maxFollowUps === 0))
    assert.ok(!row.plan.questions.some((q) => q.kind === 'coding' || q.kind === 'design'))
    const done = await runThrough(db, row, 'Not sure about this one.')
    assert.equal(done.report.detailed, false)
    assert.deepEqual(done.report.questions, [])
    assert.deepEqual(done.report.weaknesses, [])
    assert.ok(done.report.summary.length > 0 && done.report.metrics.length > 0)
    await assert.rejects(svc.createSession(db, createInput({ access: FREE, mode: 'weak_areas' }), NOW), /Re-attempts/)
  } finally {
    await client.close()
  }
  const ent = svc.entitlementsFor(FULL, 'full')
  assert.deepEqual(ent, { adaptive: true, detailed: true, curriculumMapping: true, preview: false })
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('interview.jobPreview') && !features.DEFAULT_TIER_FEATURES.free.includes('interview.jobFull'))
  assert.ok(features.DEFAULT_TIER_FEATURES.pro.includes('interview.jobFull') && features.DEFAULT_TIER_FEATURES.pro.includes('interview.reattempt'))
  assert.ok(features.LIMIT_KEYS.some((l) => l.key === 'interviewsPerDay') && features.LIMIT_KEYS.some((l) => l.key === 'interviewMaxMinutes'))
  assert.equal(features.DEFAULT_TIER_LIMITS.free.interviewsPerDay, 1)
})

test('re-attempts rotate questions, focus on weaknesses, sections or missed concepts, and history compares attempts factually', async () => {
  const { client, db } = await freshDb()
  try {
    const first = await runThrough(db, await svc.createSession(db, createInput(), NOW), (q) => (q.kind === 'technical' ? 'Not sure.' : q.kind === 'coding' ? null : 'I would say it depends on the situation and in my project we handled it carefully, for example by measuring first; the trade-off is speed versus safety and as a result we shipped on time.'))
    assert.equal(first.report.weaknesses.length > 0, true)
    const weakRefs = first.report.weaknesses.filter((w) => w.ref).map((w) => w.ref.topicId)
    const weak = await svc.createSession(db, createInput({ mode: 'weak_areas', parentSessionId: first.id }), NOW)
    assert.equal(weak.mode, 'weak_areas')
    assert.equal(weak.parentSessionId, first.id)
    const weakTech = weak.plan.questions.filter((q) => q.kind === 'technical')
    assert.ok(weakTech.length > 0)
    if (weakRefs.length) assert.ok(weakTech.some((q) => q.ref && weakRefs.includes(q.ref.topicId)), 'weak-area technical questions target the weak topics')
    const firstKeys = new Set(first.plan.questions.map((q) => q.key))
    const repeated = weak.plan.questions.filter((q) => firstKeys.has(q.key) && !['intro', 'wrapup'].includes(q.key))
    assert.ok(repeated.length < weak.plan.questions.length - 2, `questions rotate between attempts (${repeated.length} repeated of ${weak.plan.questions.length})`)
    await svc.abandonSession(db, 'u1', weak.id, NOW)
    const section = await svc.createSession(db, createInput({ mode: 'section', sectionId: 'behavioral', parentSessionId: first.id }), NOW)
    assert.deepEqual(section.plan.sections.map((s) => s.id), ['behavioral'])
    await svc.abandonSession(db, 'u1', section.id, NOW)
    const missed = await svc.createSession(db, createInput({ mode: 'missed_concepts', parentSessionId: first.id }), NOW)
    assert.ok(missed.plan.questions.length > 0 && missed.plan.questions.every((q) => q.focusConcepts && q.focusConcepts.length === 1))
    await assert.rejects(svc.createSession(db, createInput({ mode: 'section', parentSessionId: first.id }), NOW), /section/)
    const secondDone = await runThrough(db, missed, (q) => `${q.expectedConcepts.join(', ')} matter here; for example in my project we used them, however the trade-off is cost. ${'They apply whenever the data grows. '.repeat(5)}`)
    const history = (await svc.listSessions(db, 'u1', 'job-1')).map(svc.toHistoryItem)
    assert.equal(history.length, 4)
    assert.ok(history.every((h) => h.job.title === 'Backend Engineer' && h.label))
    assert.equal(history.filter((h) => h.status === 'abandoned').length, 2)
    const cmp = engine.compareAttempts(first.report.metrics, secondDone.report.metrics)
    assert.ok(cmp.rows.length > 0 && cmp.rows.every((r) => /^\d+\/\d+$|^—$/.test(r.before) && /^\d+\/\d+$/.test(r.after)))
    const readiness = engine.interviewReadiness(history.map((h) => ({ status: h.status, completedAt: h.completedAt, mode: h.mode, report: h.status === 'completed' ? { metrics: h.metrics, weaknessCount: h.weaknessCount, questionsAnswered: h.questionsAnswered, questionsTotal: h.questionsTotal } : null })))
    assert.equal(readiness.completed, 2)
    assert.ok(readiness.latest && readiness.latest.areasTotal > 0)
    const r = prep.computeReadiness({ jobId: 'job-1', blueprint, curriculum, resume: analysis, suggestionState: null, progress: emptyProgress, completedItemIds: [], application: null, outreach: [], interviews: readiness })
    const area = r.areas.find((a) => a.id === 'interview')
    assert.ok(area && area.done === 1 && /2 job-specific interviews completed/.test(area.detail))
    assert.ok(r.areas.some((a) => a.id === 'interviewAreas') && r.areas.some((a) => a.id === 'interviewWeak'))
    assert.ok(!JSON.stringify(r).match(/probab|chance of/i))
  } finally {
    await client.close()
  }
})

test('weaknesses map to curriculum topics and the plan engine never duplicates scheduled or completed steps', async () => {
  const { client, db } = await freshDb()
  try {
    const done = await runThrough(db, await svc.createSession(db, createInput({ config: { includeCoding: false, includeDesign: false } }), NOW), (q) => (q.provenance === 'curriculum' || q.kind === 'technical' ? 'Not sure.' : 'I decided to measure first; for example in my project we did that and as a result it worked; I learned a lot.'))
    const mapped = done.report.weaknesses.filter((w) => w.ref)
    assert.ok(mapped.length > 0, 'at least one weakness maps to a curriculum topic')
    for (const w of mapped) {
      assert.ok(w.ref.trackId && w.ref.topicId && w.ref.topicTitle, 'weakness carries track → topic')
      assert.ok(w.questionIds.length > 0)
    }
    const pseudo = { plannable: mapped.map((w, i) => ({ id: `w${i}`, title: w.title, kind: 'topic', status: 'must', reason: '', provenance: ['curriculum'], ref: w.ref })) }
    const goal = { id: 'g1', targetRole: 'Backend', companyType: '', startDate: '2026-09-01', durationDays: 120, hoursPerDay: 8, restDays: [0], tracks: [], status: 'Active', goalType: 'Fixed', createdAt: '', updatedAt: '' }
    const first = plan.buildPreparationPlan({ job: { id: 'job-1' }, blueprint: pseudo, goal, roadmap: [], days: 30, fromDate: '2026-09-28' })
    assert.ok(first.tasks.length > 0, 'weakness plan schedules tasks')
    assert.ok(first.tasks.every((t) => t.prepJobId === 'job-1'))
    const second = plan.buildPreparationPlan({ job: { id: 'job-1' }, blueprint: pseudo, goal, roadmap: first.roadmap, days: 30, fromDate: '2026-09-28' })
    assert.equal(second.tasks.length, 0, 'nothing is added twice')
    assert.equal(second.topicsAlreadyPlanned, first.topicsPlanned)
    const stepIds = first.roadmap.flatMap((d) => d.tasks).filter((t) => t.curriculumTaskId).map((t) => t.curriculumTaskId)
    assert.equal(new Set(stepIds).size, stepIds.length, 'no duplicate curriculum steps')
    const recorded = await svc.recordPlanAdded(db, 'u1', done.id, first.tasks.length, NOW)
    assert.equal(recorded.planAddedTaskCount, first.tasks.length)
  } finally {
    await client.close()
  }
})

test('ownership: sessions are invisible and immutable to other learners; history survives job removal and dies with the user', async () => {
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput(), NOW)
    assert.equal(await svc.getSession(db, 'u2', row.id), null)
    assert.deepEqual(await svc.listSessions(db, 'u2', 'job-1'), [])
    await assert.rejects(svc.submitTurn(db, 'u2', row.id, { questionId: 'q1', kind: 'answer', text: 'mine now' }, NOW), /not found/)
    await assert.rejects(svc.completeSession(db, 'u2', row.id, NOW), /not found/)
    await assert.rejects(svc.recordPlanAdded(db, 'u2', row.id, 3, NOW), /not found/)
    const done = await runThrough(db, row, 'I would start with the basics and then measure; for example in my project this worked.')
    // The job expires and is later deleted: the attempt stays readable with its snapshot.
    await client.query("update jobs set status='expired' where id='job-1'")
    const stillThere = await svc.getSession(db, 'u1', done.id)
    assert.equal(stillThere.report.questionsTotal, done.report.questionsTotal)
    await client.query("delete from jobs where id='job-1'")
    const orphan = await svc.getSession(db, 'u1', done.id)
    assert.equal(orphan.jobId, null)
    assert.equal(orphan.jobSnapshot.title, 'Backend Engineer')
    assert.equal(svc.toHistoryItem(orphan).job.companyName, 'Acme')
    assert.ok(orphan.report)
    await client.query("delete from users where id='u1'")
    assert.equal((await client.query('select count(*)::int as n from job_interview_sessions')).rows[0].n, 0, 'sessions cascade with the account')
  } finally {
    await client.close()
  }
})
