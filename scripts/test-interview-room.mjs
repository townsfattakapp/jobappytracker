// Voice-first interview room: the conversational layer of the job-specific
// interviewer (opening, neutral behaviour, adaptive follow-ups, clarification
// and repeat requests, silence nudges, session memory, time management,
// coding / design transitions, behavioural follow-ups, natural ending and
// feedback timing, resume grounding and provenance, refresh recovery,
// ownership, entitlements), the server TTS abstraction (provider resolution,
// fallback reporting, failures, fixture) and the pure speech helpers
// (end-of-answer detection, silence nudges, candidate intent). PGlite with the
// real migrations; no network; AI failures are exercised through the gateway
// with a scripted provider.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

process.env.TTS_FIXTURE = '1'
await build({
  entryPoints: {
    engine: 'src/lib/interview/jobInterview.ts',
    conversation: 'src/lib/interview/conversation.ts',
    speech: 'src/lib/interview/speech.ts',
    interviews: 'src/lib/server/interviews.ts',
    tts: 'src/lib/server/tts.ts',
    gateway: 'src/lib/ai/gateway.ts',
    policy: 'src/lib/ai/policy.ts',
    validators: 'src/lib/ai/validators.ts',
    aiTypes: 'src/lib/ai/types.ts',
    prepare: 'src/lib/jobs/prepare.ts',
    curriculumMap: 'src/lib/jobs/curriculumMap.ts',
    extract: 'src/lib/resume/extract.ts',
    analysis: 'src/lib/jobs/resumeAnalysis.ts',
    features: 'src/lib/entitlements/features.ts',
    schema: 'src/lib/db/schema.ts',
  },
  outdir: 'scratch/interview-room-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})
const engine = await import('../scratch/interview-room-tests/engine.mjs')
const conv = await import('../scratch/interview-room-tests/conversation.mjs')
const speech = await import('../scratch/interview-room-tests/speech.mjs')
const svc = await import('../scratch/interview-room-tests/interviews.mjs')
const tts = await import('../scratch/interview-room-tests/tts.mjs')
const { runGateway } = await import('../scratch/interview-room-tests/gateway.mjs')
const { DEFAULT_AI_POLICY, normalizeAiPolicy } = await import('../scratch/interview-room-tests/policy.mjs')
const { validateFollowUp } = await import('../scratch/interview-room-tests/validators.mjs')
const { AiError } = await import('../scratch/interview-room-tests/aiTypes.mjs')
const prep = await import('../scratch/interview-room-tests/prepare.mjs')
const { mapJobToCurriculum } = await import('../scratch/interview-room-tests/curriculumMap.mjs')
const { extractResumeProfile } = await import('../scratch/interview-room-tests/extract.mjs')
const { analyzeResumeForJob } = await import('../scratch/interview-room-tests/analysis.mjs')
const features = await import('../scratch/interview-room-tests/features.mjs')
const schema = await import('../scratch/interview-room-tests/schema.mjs')

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
const NOW = new Date('2026-09-26T10:00:00Z')
const at = (minutes) => new Date(NOW.getTime() + minutes * 60_000)
const { profile } = extractResumeProfile(RESUME, NOW)
const curriculum = mapJobToCurriculum(job(), { goals: [], roadmap: [], knowledgeWorkspaces: [] })
const analysis = analyzeResumeForJob(job(), 'r1', profile, RESUME, curriculum)
const blueprint = prep.buildPrepBlueprint({ job: job(), curriculum, compatibility: null, resume: analysis, profile, progress: { roadmap: [], knowledgeWorkspaces: [] } })
const FULL = { full: true, preview: true, adaptive: true, detailed: true, curriculumMapping: true, coding: true, design: true, reattempt: true, history: true, voice: true, premiumVoice: true, replay: true, maxMinutes: 60 }
const createInput = (over = {}) => ({ userId: 'u1', job: job(), blueprint, profile, analysis, compatibility: null, progress: {}, config: {}, mode: 'full', access: FULL, candidateName: 'Vishwas Kumar', voice: true, ...over })

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.users).values([{ id: 'u1', email: 'one@example.invalid', name: 'Vishwas Kumar' }, { id: 'u2', email: 'two@example.invalid' }])
  await db.insert(schema.companies).values({ id: 'c1', name: 'Acme', slug: 'acme', createdAt: NOW, updatedAt: NOW })
  await db.insert(schema.jobs).values({ id: 'job-1', companyId: 'c1', title: 'Backend Engineer', normalizedTitle: 'backend engineer', roleCategory: 'backend', description: job().description, requiredSkills: job().requiredSkills, preferredSkills: job().preferredSkills, level: 'mid', employmentType: 'full_time', workMode: 'hybrid', region: 'india', applyUrl: job().applyUrl, fingerprint: 'f', status: 'published', createdAt: NOW, updatedAt: NOW })
  return { client, db }
}

const dto = (row, now = NOW) => svc.toSessionDto(row, now)
const answer = (db, s, text, now = NOW, extra = {}) => svc.submitTurn(db, 'u1', s.id, { questionId: s.next.question.id, kind: 'answer', text, ...extra }, now)
const interviewerTurns = (row) => row.turns.filter((t) => t.role === 'interviewer')
const STRONG = (q) => `${q.expectedConcepts.join(', ')} matter here; for example in my project at Nimbus Labs we used them together, however the trade-off is complexity versus performance, so we measured p99 and as a result it improved. ${'It holds up under load because we shard the work and monitor it. '.repeat(4)}`

/** Skips ahead until the current question satisfies `pred` (or the interview ends). */
async function skipUntil(db, row, pred, now = NOW) {
  let s = dto(row, now)
  let guard = 0
  while (s.next.type !== 'done' && !pred(s.next.question) && guard++ < 40) s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: s.next.question.id, kind: 'skip' }, now), now)
  return s
}

test('opening: generated from the real configuration, greets by first name, states length and structure, invites clarification, never represents the company', async () => {
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput(), NOW)
    const opening = row.turns[0]
    assert.equal(opening.role, 'interviewer')
    assert.equal(opening.kind, 'opening')
    assert.match(opening.text, /^Hi Vishwas, thanks for joining\./)
    assert.match(opening.text, /taking you through the technical interview today for the Backend Engineer role you're preparing for/)
    assert.match(opening.text, new RegExp(`around ${row.config.minutes} minutes`))
    assert.match(opening.text, /start with your background, then move into .*coding problem.*design discussion.*leave a few minutes at the end for your questions/)
    assert.match(opening.text, /ask for clarification at any point/)
    assert.ok(opening.text.endsWith(engine.INTRO_PROMPT), 'the opening ends with the introduction question')
    assert.ok(!/Acme|on behalf of|I work at|our company/.test(opening.text), 'the interviewer does not claim to represent the company')
    const s = dto(row)
    assert.equal(s.say, opening.text, 'the utterance to speak is the opening')
    assert.equal(s.phase, 'interview')
    assert.equal(s.interviewer.title, 'Technical Interviewer')
    assert.equal(s.state.voice, true)
    // No name and a section-only plan still open naturally.
    const noName = await svc.createSession(db, createInput({ candidateName: null, mode: 'section', sectionId: 'behavioral', parentSessionId: null }), NOW).catch((e) => e)
    assert.ok(noName instanceof Error, 'a section re-attempt needs a completed parent')
    const nameless = await svc.createSession(db, createInput({ userId: 'u2', candidateName: null }), NOW)
    assert.match(nameless.turns[0].text, /^Hi, thanks for joining\./)
    assert.ok(!/undefined|null/.test(nameless.turns[0].text))
  } finally {
    await client.close()
  }
})

test('neutral interviewer: no praise, verdicts or teaching during the interview; acknowledgements and transitions vary', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    let i = 0
    let guard = 0
    while (s.next.type !== 'done' && guard++ < 60) {
      const q = s.next.question
      const text = q.kind === 'wrapup' ? (i % 2 ? 'No, nothing from my side.' : 'What does the team measure in the first ninety days?') : i % 3 === 0 ? 'It is a common thing.' : i % 3 === 1 ? STRONG(q) : 'We used it and it worked fine for us in the last release.'
      s = dto(await answer(db, s, text))
      i += 1
    }
    // Reactions (acknowledgements, follow-ups, transitions, clarifications, closing) must stay neutral; planned questions may legitimately ask "what goes wrong".
    const said = interviewerTurns(s).filter((t) => t.kind !== 'question' && t.kind !== 'opening').map((t) => `${t.lead ?? ''} ${t.text}`)
    for (const line of said) assert.ok(conv.isNeutral(line), `interviewer stays neutral: ${line}`)
    assert.ok(!said.some((l) => /\b(hire|score|you missed|study|you should)\b/i.test(l)), 'no verdicts, scores or study advice mid-interview')
    const acks = s.turns.filter((t) => t.kind === 'transition' || t.kind === 'follow_up').map((t) => (t.kind === 'follow_up' ? t.lead : t.text))
    for (let k = 1; k < acks.length; k++) assert.notEqual(acks[k], acks[k - 1], `consecutive interviewer reactions differ (${acks[k]})`)
    assert.ok(new Set(acks.map((a) => a.split('.')[0])).size >= 3, 'several distinct acknowledgements were used')
    assert.equal(s.phase, 'ended')
    assert.match(s.turns[s.turns.length - 1].text, /Thanks for your time\. We'll end the mock interview here\./)
  } finally {
    await client.close()
  }
})

test('adaptive follow-ups react to the answer: a weak "because it is fast" gets a probe, not a score; the acknowledgement is spoken before the follow-up', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    s = dto(await answer(db, s, 'I mainly worked on the backend with Java and Spring Boot for three years, and I want to move into payments.'))
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'technical')
    const tech = s.next.question
    const named = tech.expectedConcepts[0]
    s = dto(await answer(db, s, `Because ${named} is fast.`))
    assert.equal(s.next.type, 'follow_up')
    const fu = s.turns[s.turns.length - 1]
    assert.equal(fu.kind, 'follow_up')
    assert.equal(fu.intent, 'clarify')
    assert.match(fu.text, new RegExp(`You mentioned ${named.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\. What specifically makes`, 'i'))
    assert.ok(fu.lead && /^(Okay|I see|Alright|Understood|Thanks|Right)/.test(fu.lead), `a neutral lead precedes the follow-up (${fu.lead})`)
    assert.equal(s.say, `${fu.lead} ${fu.text}`)
    assert.ok(conv.isNeutral(s.say))
    // A stronger follow-up answer moves on with a transition, not a verdict.
    s = dto(await answer(db, s, STRONG(tech)))
    const last = s.turns.filter((t) => t.role === 'interviewer').slice(-2)
    assert.ok(last.some((t) => t.kind === 'transition') && last.some((t) => t.kind === 'question'), 'transition then the next question')
    assert.ok(conv.isNeutral(last.map((t) => t.text).join(' ')))
    // Deterministic follow-up wording survives when the AI rephrase is unavailable, and an AI rephrase keeps the deterministic text alongside.
    const before = s.turns.find((t) => t.kind === 'follow_up')
    assert.equal(before.aiRefined, undefined)
    const scripted = { id: 'fixture', label: 'fixture', models: ['m'], keyFromEnv: () => 'k', isConfigured: () => true, async call(input) { throw new AiError('rate_limit', 'fixture 429', 429, 10) } }
    const out = await runGateway({ feature: 'interview.followup', messages: [{ role: 'system', content: 'interviewer' }, { role: 'user', content: 'x' }], sensitivity: 'sensitive', userId: 'u1', userKey: null }, { adapters: [scripted], policy: normalizeAiPolicy({ ...DEFAULT_AI_POLICY, providerOrder: ['fixture'], maxRetries: 1, timeoutMs: 50 }), record: async () => {}, sleep: async () => {} })
    assert.equal(out.ok, false)
    assert.equal(out.error.kind, 'rate_limit', 'a 429 from the provider is reported, and the caller keeps the deterministic wording')
    assert.equal(validateFollowUp('Sure, but what are your hiring chances here?'), null, 'AI wording that talks about hiring is rejected')
    assert.equal(validateFollowUp('Do you think you would be hired for this?'), null)
  } finally {
    await client.close()
  }
})

test('clarification, repeat, assumption and thinking requests are answered without counting as answers; design requirements are revealed progressively', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    const intro = s.next.question
    s = dto(await answer(db, s, 'Could you repeat that?'))
    assert.equal(s.next.type, 'question')
    assert.equal(s.next.question.id, intro.id, 'a repeat request does not advance')
    let req = s.turns[s.turns.length - 2]
    let reply = s.turns[s.turns.length - 1]
    assert.equal(req.kind, 'clarification_request')
    assert.equal(req.candidateIntent, 'repeat')
    assert.equal(req.evidence, undefined, 'no evidence is scored for a meta request')
    assert.equal(reply.kind, 'clarification')
    assert.match(reply.text, /^(Of course|Sure|Certainly)\. /)
    assert.ok(reply.text.includes(intro.prompt), 'the question is repeated verbatim')
    assert.equal(s.say, reply.text)
    // Explicit repeat button.
    s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: intro.id, kind: 'clarify', intent: 'repeat', text: 'Could you repeat the question?' }, NOW))
    assert.equal(s.turns.filter((t) => t.kind === 'clarification_request').length, 2)
    s = dto(await answer(db, s, 'Give me a moment to think.'))
    assert.equal(s.turns[s.turns.length - 1].kind, 'clarification')
    assert.match(s.turns[s.turns.length - 1].text, /take your time|take a moment/i)
    s = dto(await answer(db, s, 'Can I make an assumption about the team size?'))
    assert.match(s.turns[s.turns.length - 1].text, /assumption/i)
    assert.equal(s.next.question.id, intro.id)
    s = dto(await answer(db, s, 'I am a backend developer with three years of experience in Java services.'))
    // Coding clarification.
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'coding')
    s = dto(await answer(db, s, 'Can the input be empty or contain duplicates?'))
    assert.match(s.turns[s.turns.length - 1].text, /empty.*duplicates/i)
    assert.equal(s.next.question.kind, 'coding')
    // Design: requirements come out only when asked.
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'design')
    const design = s.next.question
    assert.ok(!/tens of thousands|p99|strong consistency/i.test(design.prompt), 'the design prompt does not dump requirements')
    s = dto(await answer(db, s, 'What scale should I design for? How many users?'))
    reply = s.turns[s.turns.length - 1]
    assert.equal(reply.kind, 'clarification')
    assert.match(reply.text, /tens of thousands of daily active users/)
    s = dto(await answer(db, s, 'What consistency do you need?'))
    assert.match(s.turns[s.turns.length - 1].text, /Strong consistency/)
    assert.equal(s.next.question.id, design.id)
    // Bounded: after three clarifications the interviewer asks to continue.
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'behavioral')
    for (const t of ['What do you mean by this?', 'Can you clarify the question?', 'Do you mean at work?']) s = dto(await answer(db, s, t))
    s = dto(await answer(db, s, 'Can you clarify what you are asking?'))
    assert.match(s.turns[s.turns.length - 1].text, /Let's go with what you have/)
    // Everything ends and the report counts clarifications without scoring them.
    while (s.next.type !== 'done') s = dto(await answer(db, s, s.next.question.kind === 'wrapup' ? 'No questions, thanks.' : STRONG(s.next.question)))
    const done = await svc.completeSession(db, 'u1', s.id, at(20))
    assert.ok(done.report.clarificationsAsked >= 7, `clarifications counted (${done.report.clarificationsAsked})`)
    const introFb = done.report.questions.find((q) => q.questionId === intro.id)
    assert.equal(introFb.clarifications, 4)
    assert.ok(!introFb.answer.includes('repeat'), 'meta requests are not the recorded answer')
  } finally {
    await client.close()
  }
})

test('silence: nudges are gentle, bounded per question, recorded for replay and never treated as answers', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    const q = s.next.question
    s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: q.id, kind: 'nudge', level: 1 }, NOW))
    assert.equal(s.turns[s.turns.length - 1].kind, 'nudge')
    assert.match(s.turns[s.turns.length - 1].text, /take your time/i)
    s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: q.id, kind: 'nudge', level: 1 }, NOW))
    assert.equal(s.turns.filter((t) => t.kind === 'nudge').length, 1, 'the same nudge is not repeated')
    s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: q.id, kind: 'nudge', level: 2 }, NOW))
    assert.match(s.turns[s.turns.length - 1].text, /repeat or clarify/)
    assert.equal(s.next.question.id, q.id)
    assert.equal(s.turns.filter((t) => t.role === 'candidate').length, 0)
    assert.equal(speech.silenceNudgeLevel(10_000, false, { thinkingMs: 25_000, clarifyMs: 60_000 }), 0)
    assert.equal(speech.silenceNudgeLevel(26_000, false, { thinkingMs: 25_000, clarifyMs: 60_000 }), 1)
    assert.equal(speech.silenceNudgeLevel(61_000, false, { thinkingMs: 25_000, clarifyMs: 60_000 }), 2)
    assert.equal(speech.silenceNudgeLevel(61_000, true, { thinkingMs: 25_000, clarifyMs: 60_000 }), 0, 'no nudge once the learner has started speaking')
    assert.equal(speech.silenceNudgeLevel(120_000, false, { thinkingMs: 0, clarifyMs: 0 }), 0, 'thresholds of zero disable nudges (accessibility)')
    assert.equal(speech.answerLooksFinished(3000, true, 4000), false, 'a brief pause never ends the answer')
    assert.equal(speech.answerLooksFinished(4500, true, 4000), true)
    assert.equal(speech.answerLooksFinished(60_000, false, 4000), false, 'silence before any speech is thinking, not an answer')
    assert.equal(speech.answerLooksFinished(60_000, true, 0), false)
  } finally {
    await client.close()
  }
})

test('session memory: the interviewer refers back to what the learner said and never invents facts', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput({ config: { includeCoding: false, includeDesign: false, minutes: 30 } }), NOW))
    s = dto(await answer(db, s, 'I am a backend developer with three years of experience. I mainly worked on the backend with Java and Spring Boot services on PostgreSQL.'))
    const memory = s.state.memory
    assert.ok(memory.some((f) => /mainly worked on the backend/.test(f.text)), `ownership fact remembered (${memory.map((f) => f.text)})`)
    assert.ok(memory.some((f) => f.terms.includes('java') || f.terms.includes('spring boot')))
    let referenced = null
    let guard = 0
    while (s.next.type !== 'done' && guard++ < 40) {
      const qt = [...s.turns].reverse().find((t) => t.kind === 'question')
      if (qt && /^(Earlier you mentioned|You said earlier|Coming back to something you said)/.test(qt.text)) {
        referenced = qt
        break
      }
      s = dto(await answer(db, s, s.next.question.kind === 'wrapup' ? 'No.' : STRONG(s.next.question)))
    }
    assert.ok(referenced, 'a later question refers back to the introduction')
    assert.match(referenced.text, /(mainly worked on the backend|Java|Spring Boot|backend developer)/i)
    const q = s.plan.questions.find((x) => x.id === referenced.questionId)
    assert.ok(referenced.text.endsWith(q.prompt), 'the grounded question itself is unchanged')
    assert.equal(s.state.usedFacts.length, 1)
    // Facts come only from the learner's words.
    assert.deepEqual(conv.extractFacts('', 'q1'), [])
    const facts = conv.extractFacts('I mainly worked on the frontend with React.', 'q1')
    assert.ok(facts.every((f) => /frontend|react/i.test(f.text)))
    assert.ok(!facts.some((f) => /kafka|payments/i.test(f.text)), 'nothing the learner did not say')
  } finally {
    await client.close()
  }
})

test('time management: running long shortens later sections but never cuts an answer; running out moves to a natural wrap-up', async () => {
  const { client, db } = await freshDb()
  try {
    const row = await svc.createSession(db, createInput({ config: { minutes: 45 } }), NOW)
    const total = row.plan.questions.length
    let s = dto(row)
    // The learner spends 14 of 45 minutes on the introduction.
    s = dto(await answer(db, s, 'I am a backend developer. '.repeat(20), at(14)), at(14))
    assert.equal(s.turns.filter((t) => t.kind === 'answer').length, 1, 'the long answer was recorded, not cut')
    assert.ok(s.dropped.length > 0, `later questions were dropped to fit (${s.dropped.length} of ${total})`)
    const transition = [...s.turns].reverse().find((t) => t.kind === 'transition')
    assert.match(transition.text, /(minutes? left|short on time)/)
    for (const sec of s.plan.sections) if (sec.id !== 'intro') assert.ok(sec.questionIds.some((id) => !s.dropped.includes(id)), `at least one question per section survives (${sec.id})`)
    assert.ok(s.plan.questions.find((q) => q.kind === 'wrapup') && !s.dropped.includes(s.plan.questions.find((q) => q.kind === 'wrapup').id), 'the wrap-up is never dropped')
    assert.equal(s.next.total, total - s.dropped.length)
    // Out of time entirely: the next transition goes straight to the wrap-up.
    s = dto(await answer(db, s, STRONG(s.next.question), at(44.5)), at(44.5))
    assert.equal(s.next.question.kind, 'wrapup')
    assert.equal(s.phase, 'closing')
    assert.match([...s.turns].reverse().find((t) => t.kind === 'transition').text, /We're at time, so let's wrap up here\./)
    // Pure helper on a small plan: drops from the end, keeps the first question of every section and the wrap-up, and only cuts deeper when even that cannot fit.
    const mini = { version: 'x', label: 'x', seed: 0, plannedMinutes: 15, sections: [{ id: 'intro', title: 'Introduction', minutes: 2, questionIds: ['q1'] }, { id: 'technical', title: 'Technical', minutes: 8, questionIds: ['q2', 'q3'] }, { id: 'behavioral', title: 'Behavioural', minutes: 8, questionIds: ['q4', 'q5'] }, { id: 'wrapup', title: 'Wrap-up', minutes: 1, questionIds: ['q6'] }], questions: [{ id: 'q1', kind: 'intro', minutes: 2 }, { id: 'q2', kind: 'technical', minutes: 4 }, { id: 'q3', kind: 'technical', minutes: 4 }, { id: 'q4', kind: 'behavioral', minutes: 4 }, { id: 'q5', kind: 'behavioral', minutes: 4 }, { id: 'q6', kind: 'wrapup', minutes: 1 }] }
    assert.deepEqual(conv.manageTime(mini, { index: 1, dropped: [] }, 0, 30), { drop: [], shortened: false, wrapUp: false }, 'nothing dropped when everything fits')
    const tight = conv.manageTime(mini, { index: 1, dropped: [] }, 8 * 60_000, 20)
    assert.deepEqual(tight.drop.sort(), ['q3', 'q5'].sort(), '12 minutes left for 16 minutes of questions: the second question of each section goes, the first stays')
    assert.equal(tight.shortened, true)
    const tighter = conv.manageTime(mini, { index: 1, dropped: [] }, 14 * 60_000, 20)
    assert.ok(!tighter.drop.includes('q2') && !tighter.drop.includes('q6'), 'the current question and the wrap-up are never dropped')
    const timeUp = conv.manageTime(mini, { index: 1, dropped: [] }, 19.5 * 60_000, 20)
    assert.equal(timeUp.wrapUp, true)
    assert.deepEqual(timeUp.drop.sort(), ['q2', 'q3', 'q4', 'q5'])
  } finally {
    await client.close()
  }
})

test('learner-initiated end and idle time-out wrap up naturally; feedback is only available after the farewell', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    s = dto(await answer(db, s, 'I am a backend developer with three years of experience.'))
    assert.equal(s.report, null)
    s = dto(await svc.wrapUpSession(db, 'u1', s.id, 'learner', at(5)), at(5))
    assert.equal(s.phase, 'closing')
    assert.equal(s.next.question.kind, 'wrapup')
    assert.match(s.say, /Understood\. Let's wrap up here\. Before we wrap up, do you have any questions/)
    assert.ok(s.dropped.length > 0, 'skipped questions are recorded as dropped, not answered')
    assert.equal(s.report, null, 'no feedback while the interview is closing')
    s = dto(await answer(db, s, 'What are the next steps in the process?', at(6)), at(6))
    const closing = s.turns[s.turns.length - 1]
    assert.equal(closing.kind, 'closing_answer')
    assert.match(closing.text, /can't speak for Acme's process specifically/)
    assert.ok(!/we usually|our team|at Acme we/.test(closing.text), 'no fabricated company policy')
    assert.equal(s.phase, 'closing')
    s = dto(await answer(db, s, 'No, that is all.', at(7)), at(7))
    assert.equal(s.phase, 'ended')
    assert.equal(s.next.type, 'done')
    assert.match(s.turns[s.turns.length - 1].text, /Thanks for your time\. We'll end the mock interview here\./)
    assert.equal(s.report, null, 'the report is built by complete, after the farewell')
    const done = await svc.completeSession(db, 'u1', s.id, at(7.5))
    assert.equal(done.status, 'completed')
    assert.ok(done.report.timeline.length >= 1)
    assert.equal(done.report.timeline[0].offsetMs, 0)
    assert.ok(done.report.timeline.every((e, i, arr) => i === 0 || arr[i - 1].offsetMs <= e.offsetMs), 'timeline is ordered')
    assert.ok(done.report.timeline.some((e) => e.sectionId === 'wrapup'))
    // A second, idle learner runs out of time: wrap-up by time, then the farewell; completing an already ended session does not add a second farewell.
    const other = dto(await svc.createSession(db, createInput({ userId: 'u2', candidateName: null }), NOW))
    let o = dto(await svc.wrapUpSession(db, 'u2', other.id, 'time', at(31)), at(31))
    assert.match(o.say, /We're at time, so let's wrap up here\./)
    o = dto(await svc.wrapUpSession(db, 'u2', other.id, 'time', at(33)), at(33))
    assert.equal(o.phase, 'ended')
    assert.match(o.turns[o.turns.length - 1].text, /We're at time, so we'll stop here\. Thanks for your time/)
    const finished = await svc.completeSession(db, 'u2', other.id, at(34))
    assert.equal(finished.turns.filter((t) => t.kind === 'farewell').length, 1)
    // Older clients that call complete mid-interview still end with a farewell.
    const third = await svc.createSession(db, createInput({ userId: 'u2', candidateName: null }), at(40))
    const forced = await svc.completeSession(db, 'u2', third.id, at(41))
    assert.equal(forced.turns[forced.turns.length - 1].kind, 'farewell')
    assert.equal(forced.state.phase, 'ended')
  } finally {
    await client.close()
  }
})

test('coding and design rounds: verbal problem statement, approach before code, transitions into the workspace; behavioural answers get STAR follow-ups without STAR scoring mid-interview', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    s = dto(await answer(db, s, 'I am a backend developer.'))
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'coding')
    const tr = [...s.turns].reverse().find((t) => t.kind === 'transition')
    assert.match(tr.text, /coding/i)
    assert.match(tr.text, /approach before you (write code|start)|talk me through your approach before coding|walk me through your approach/i)
    const coding = s.next.question
    assert.equal(coding.tool, 'code')
    assert.match(coding.prompt, /^Here is the problem\./)
    assert.match(coding.prompt, /walk me through your approach|talk me through/i)
    assert.ok(!/O\(n\)|hash map|two pointers|sliding window/i.test(coding.prompt), 'the statement does not reveal the solution')
    s = dto(await answer(db, s, 'I would loop over the array and check every pair.', NOW, { code: 'function twoSum(a, t) { for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) return [i, j]; return [] }', language: 'javascript' }))
    assert.equal(s.next.type, 'follow_up')
    assert.match(s.next.prompt, /time and space complexity|complexity/i)
    s = dto(await answer(db, s, 'Time complexity is O(n squared) and space is O(1); edge cases are empty input and duplicates.'))
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'design')
    const dtr = [...s.turns].reverse().find((t) => t.kind === 'transition')
    assert.match(dtr.text, /design/i)
    assert.match(dtr.text, /requirements/i)
    assert.equal(s.next.question.tool, 'diagram')
    s = dto(await answer(db, s, 'I would put an API in front of a database and add a cache.', NOW, { diagram: 'flowchart LR\n  Client --> API[API service]\n  API --> Cache[(Cache)]\n  API --> DB[(Orders DB)]' }))
    assert.equal(s.next.type, 'follow_up')
    assert.ok(['probe_missing', 'tradeoff'].includes(s.next.intent), `design follow-up probes (${s.next.intent})`)
    assert.match(s.next.prompt, /where does .* fit|trade-off/i)
    s = dto(await answer(db, s, 'The trade-off of the cache is staleness; requirements first, then failure handling with retries.'))
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'behavioral')
    const btr = [...s.turns].reverse().find((t) => t.kind === 'transition')
    assert.match(btr.text, /how you work|situations/i)
    s = dto(await answer(db, s, 'I think ownership matters and I always try to take responsibility for my work and keep everyone informed about progress in the project.'))
    assert.equal(s.next.type, 'follow_up')
    assert.equal(s.next.intent, 'example')
    assert.ok(!/STAR|situation, task, action/i.test(s.say), 'no STAR framework is shown to the learner mid-interview')
    s = dto(await answer(db, s, 'For example, when our release failed last year I decided to own the fix: I investigated the logs and wrote a retry, and as a result failures dropped 90%.'))
    const beh = s.turns.filter((t) => t.kind === 'follow_up').slice(-1)[0]
    assert.ok(beh.intent === 'example' || beh.intent === 'probe_missing')
  } finally {
    await client.close()
  }
})

test('resume grounding, provenance and the spoken question turns: every voiced question is the plan question (plus a remembered fact), never an invented project', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    let guard = 0
    while (s.next.type !== 'done' && guard++ < 60) s = dto(await answer(db, s, s.next.question.kind === 'wrapup' ? 'No.' : STRONG(s.next.question)))
    for (const q of s.plan.questions) assert.ok(['curriculum', 'job', 'resume', 'generated'].includes(q.provenance))
    const voiced = s.turns.filter((t) => t.kind === 'question')
    for (const t of voiced) {
      const q = s.plan.questions.find((x) => x.id === t.questionId)
      assert.ok(t.text.endsWith(q.prompt), `voiced question ends with the plan question: ${t.text}`)
      if (q.provenance === 'resume') assert.ok(/Inventory Tracker|Nimbus Labs|Built REST APIs|Fixed a production incident|Owned the migration/.test(q.prompt), `resume question cites real evidence: ${q.prompt}`)
    }
    assert.ok(!s.turns.some((t) => /Google|Microsoft|Amazon|Flipkart/.test(t.text)), 'no named-company claims in anything the interviewer said')
  } finally {
    await client.close()
  }
})

test('refresh recovery and ownership: the DTO restores phase, pending follow-up and the utterance to replay; other learners get nothing', async () => {
  const { client, db } = await freshDb()
  try {
    let s = dto(await svc.createSession(db, createInput(), NOW))
    s = dto(await answer(db, s, 'I am a backend developer.'))
    s = await skipUntil(db, await svc.getSession(db, 'u1', s.id), (q) => q.kind === 'technical')
    s = dto(await answer(db, s, 'It is a common thing.'))
    const restored = dto(await svc.getSession(db, 'u1', s.id), at(3))
    assert.equal(restored.next.type, 'follow_up')
    assert.equal(restored.say, s.say)
    assert.equal(restored.phase, 'interview')
    assert.ok(restored.elapsedMs >= 3 * 60_000)
    // A clarification after the follow-up keeps the follow-up pending and replays the clarification.
    s = dto(await svc.submitTurn(db, 'u1', s.id, { questionId: s.next.question.id, kind: 'clarify', intent: 'repeat', text: 'Sorry, could you repeat that?' }, at(4)), at(4))
    assert.equal(s.next.type, 'follow_up')
    assert.match(s.say, /^(Of course|Sure|Certainly)\./)
    assert.equal(await svc.getSession(db, 'u2', s.id), null)
    await assert.rejects(svc.submitTurn(db, 'u2', s.id, { questionId: s.next.question.id, kind: 'clarify', intent: 'repeat' }, NOW), /not found/)
    await assert.rejects(svc.submitTurn(db, 'u2', s.id, { questionId: s.next.question.id, kind: 'nudge', level: 1 }, NOW), /not found/)
    await assert.rejects(svc.wrapUpSession(db, 'u2', s.id, 'learner', NOW), /not found/)
    await assert.rejects(svc.completeSession(db, 'u2', s.id, NOW), /not found/)
    // Latency diagnostics travel with the learner's turn and are sanitised.
    s = dto(await answer(db, s, STRONG(s.next.question), at(5), { input: 'voice', latency: { sttMs: 420, ttsMs: 610, turnMs: 1900, serverMs: -5, aiMs: 'x' } }), at(5))
    const spoken = [...s.turns].reverse().find((t) => t.role === 'candidate')
    assert.equal(spoken.input, 'voice')
    assert.deepEqual(spoken.latency, { sttMs: 420, ttsMs: 610, turnMs: 1900 })
    let guard = 0
    while (s.next.type !== 'done' && guard++ < 60) s = dto(await answer(db, s, s.next.question.kind === 'wrapup' ? 'No.' : STRONG(s.next.question), at(6)), at(6))
    const done = await svc.completeSession(db, 'u1', s.id, at(7))
    assert.equal(done.report.voiceUsed, true)
    assert.equal(svc.toHistoryItem(done).voiceUsed, true)
  } finally {
    await client.close()
  }
})

test('entitlements: voice, premium voice and replay are centralised feature keys with free / pro defaults', () => {
  assert.ok(features.FEATURES.some((f) => f.key === 'interview.voice') && features.FEATURES.some((f) => f.key === 'interview.premiumVoice') && features.FEATURES.some((f) => f.key === 'interview.replay'))
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('interview.voice'), 'free plan may run voice interviews with the browser voice')
  assert.ok(!features.DEFAULT_TIER_FEATURES.free.includes('interview.premiumVoice') && !features.DEFAULT_TIER_FEATURES.free.includes('interview.replay'))
  assert.ok(features.DEFAULT_TIER_FEATURES.pro.includes('interview.premiumVoice') && features.DEFAULT_TIER_FEATURES.pro.includes('interview.replay'))
  const access = (list) => ({ userId: 'u', email: null, tier: 't', features: list, limits: { interviewMaxMinutes: 45 }, config: {}, can: (k) => list.includes(k) })
  const free = svc.interviewAccess(access(features.DEFAULT_TIER_FEATURES.free))
  assert.deepEqual([free.voice, free.premiumVoice, free.replay, free.full], [true, false, false, false])
  const pro = svc.interviewAccess(access(features.DEFAULT_TIER_FEATURES.pro))
  assert.deepEqual([pro.voice, pro.premiumVoice, pro.replay, pro.maxMinutes], [true, true, true, 45])
})

test('candidate intent classifier: meta requests are recognised; real answers that mention examples or assumptions are not', () => {
  const c = conv.classifyCandidateMessage
  assert.equal(c('Could you repeat that?'), 'repeat')
  assert.equal(c('Sorry, I did not catch the question.'), 'repeat')
  assert.equal(c('What do you mean by scale?'), 'clarify')
  assert.equal(c('Can you clarify what you mean by consistency here?'), 'clarify')
  assert.equal(c('Can I make an assumption about the traffic?'), 'assumption')
  assert.equal(c('Let me think for a moment.'), 'thinking')
  assert.equal(c('Hmm'), 'thinking')
  assert.equal(c(''), 'answer')
  assert.equal(c('I would use Redis because it is fast.'), 'answer')
  assert.equal(c('For example, when I built the service I repeated the load test until the p99 was stable, and I assumed traffic would double.'), 'answer')
  assert.equal(c('Assuming that reads dominate, I would add a cache in front of the database and keep writes going straight to Postgres, because consistency matters more for writes.'), 'answer')
})

test('interviewer voice (TTS): provider resolution, honest fallback reporting, voice selection, failures and the fixture', async () => {
  const policy = tts.normalizeVoicePolicy({ providerOrder: ['google', 'openai', 'bogus'], voices: { google: 'en-IN-Neural2-A', openai: 'nope' }, rate: 2, locale: 'en-IN', silenceThinkingSec: -3, endOfSpeechSec: 1, timeoutMs: 10 })
  assert.deepEqual(policy.providerOrder, ['google', 'openai'])
  assert.equal(policy.rate, 1.3, 'rate is clamped')
  assert.equal(policy.silenceThinkingSec, 0)
  assert.equal(policy.endOfSpeechSec, 1.5)
  assert.equal(policy.timeoutMs, 2000)
  const none = tts.voiceAvailability(policy, [])
  assert.equal(none.mode, 'browser', 'without a configured provider the browser voice is the honest answer')
  assert.equal(none.provider, null)
  assert.equal(await tts.synthesizeSpeech(policy, { text: 'Hello' }, { adapters: [] }), null)
  const calls = []
  const scripted = (id, behaviour) => ({ id, label: id, keyFromEnv: () => 'key', isConfigured: () => true, voices: [{ id: `${id}-a`, label: 'A', locale: 'en-IN' }, { id: `${id}-b`, label: 'B', locale: 'en-GB' }], defaultVoice: `${id}-a`, async synthesize(input) { calls.push(input); return behaviour(input) } })
  const google = scripted('google', () => ({ audio: new Uint8Array([1, 2, 3]).buffer, mime: 'audio/mpeg' }))
  const avail = tts.voiceAvailability({ ...policy, voices: { google: 'google-b' } }, [google])
  assert.equal(avail.mode, 'premium')
  assert.equal(avail.provider, 'google')
  assert.equal(avail.defaultVoice, 'google-b', 'the admin-chosen voice is the default when it exists')
  const out = await tts.synthesizeSpeech({ ...policy, voices: { google: 'google-b' } }, { text: '  Hello.   Can you hear me?  ', voice: 'google-a', rate: 0.9 }, { adapters: [google] })
  assert.equal(out.provider, 'google')
  assert.equal(out.voice, 'google-a', 'the learner may pick any voice the provider offers')
  assert.equal(out.audio.byteLength, 3)
  assert.equal(calls[0].text, 'Hello. Can you hear me?', 'whitespace is normalised before synthesis')
  assert.equal(calls[0].rate, 0.9)
  const bad = await tts.synthesizeSpeech(policy, { text: 'Hello', voice: 'not-a-voice' }, { adapters: [google] })
  assert.equal(bad.voice, 'google-a', 'unknown voices fall back to the default')
  const disabled = tts.voiceAvailability({ ...policy, enabled: false }, [google])
  assert.equal(disabled.mode, 'browser')
  await assert.rejects(tts.synthesizeSpeech(policy, { text: '' }, { adapters: [google] }), (e) => e instanceof tts.TtsError && e.kind === 'validation')
  await assert.rejects(tts.synthesizeSpeech(policy, { text: 'x'.repeat(tts.MAX_TTS_CHARS + 1) }, { adapters: [google] }), (e) => e.kind === 'validation')
  const limited = scripted('openai', () => { throw new tts.TtsError('rate_limit', 'openai 429', 429) })
  await assert.rejects(tts.synthesizeSpeech({ ...policy, providerOrder: ['openai'] }, { text: 'Hello' }, { adapters: [limited] }), (e) => e.kind === 'rate_limit', 'a provider 429 is reported so the client falls back to the browser voice')
  const hanging = scripted('openai', (input) => new Promise((_, reject) => input.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))))
  await assert.rejects(tts.synthesizeSpeech({ ...policy, providerOrder: ['openai'], timeoutMs: 2000 }, { text: 'Hello' }, { adapters: [hanging] }), (e) => e.kind === 'timeout')
  // Fixture: enabled only outside production by TTS_FIXTURE=1, returns a playable WAV whose length tracks the text.
  assert.equal(tts.fixtureTts.isConfigured(), true)
  const fx = await tts.synthesizeSpeech(tts.normalizeVoicePolicy({ providerOrder: ['fixture'] }), { text: "Hello. I'll be your interviewer today. Can you hear me clearly?" }, { adapters: [tts.fixtureTts] })
  assert.equal(fx.provider, 'fixture')
  assert.equal(fx.mime, 'audio/wav')
  assert.equal(new TextDecoder().decode(new Uint8Array(fx.audio.slice(0, 4))), 'RIFF')
  const longer = await tts.synthesizeSpeech(tts.normalizeVoicePolicy({ providerOrder: ['fixture'] }), { text: 'x'.repeat(600) }, { adapters: [tts.fixtureTts] })
  assert.ok(longer.audio.byteLength > fx.audio.byteLength)
  await assert.rejects(tts.synthesizeSpeech(tts.normalizeVoicePolicy({ providerOrder: ['fixture'] }), { text: 'Hello [tts:rate_limit]' }, { adapters: [tts.fixtureTts] }), (e) => e.kind === 'rate_limit')
  const wasProd = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  assert.equal(tts.fixtureTts.isConfigured(), false, 'the fixture voice is never available in production')
  process.env.NODE_ENV = wasProd
})
