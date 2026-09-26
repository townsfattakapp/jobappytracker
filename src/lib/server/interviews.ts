import { and, desc, eq } from 'drizzle-orm'
import * as schema from '../db/schema'
import { analyzeAnswer, buildInterviewContext, buildReport, CANDIDATE_ANSWER_KINDS, composeInterview, decideFollowUp, deriveInterviewConfig, normalizeConfig, SECTION_TITLES, type AnswerEvidence, type DerivedConfig, type FollowUpIntent, type InterviewConfig, type InterviewContext, type InterviewMode, type InterviewPlan, type InterviewQuestion, type InterviewReport, type JobSnapshot, type SectionId, type SessionEntitlements, type SessionPhase, type SessionState, type TurnKind, type TurnLatency, type TurnRecord } from '../interview/jobInterview'
import { acknowledge, answerCandidateQuestion, buildOpening, buildTimeline, classifyCandidateMessage, clarificationReply, extractFacts, FAREWELL, followUpLead, interviewerTitle, manageTime, personalize, relevantFact, remember, rotatePhrase, transition, type CandidateIntent, type MemoryFact } from '../interview/conversation'
import { ValidationError } from '../jobs/normalize'
import type { PrepBlueprint } from '../jobs/prepare'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import type { JobDto } from '../jobs/types'
import type { ResumeProfile } from '../resume/extract'
import type { Access } from './entitlements'
import { logEvent } from './log'
import type { PlansDb } from './plans'

/**
 * Job-specific mock interview sessions: persistence, ownership and the turn
 * loop. Every read and write is scoped by userId; the engine itself lives in
 * src/lib/interview/jobInterview.ts and is pure. Evidence is computed and
 * stored when an answer arrives, and the report is built from stored turns
 * only, so nothing is rewritten after the session.
 *
 * The conversational layer (src/lib/interview/conversation.ts) makes the
 * interviewer talk like a person: an opening generated from the real
 * configuration, neutral acknowledgements, time-aware section transitions,
 * clarification and repeat handling that never counts as an answer, session
 * memory, a wrap-up with candidate questions and a farewell. The report only
 * becomes available once the farewell has been spoken.
 */
export type InterviewsDb = PlansDb
type Row = typeof schema.jobInterviewSessions.$inferSelect

export interface SessionDto {
  id: string
  jobId: string | null
  job: JobSnapshot
  mode: InterviewMode
  parentSessionId: string | null
  config: InterviewConfig
  plan: InterviewPlan
  turns: TurnRecord[]
  state: SessionState
  entitlements: SessionEntitlements
  status: schema.InterviewSessionStatus
  report: InterviewReport | null
  planAddedAt: string | null
  planAddedTaskCount: number
  startedAt: string
  completedAt: string | null
  durationSeconds: number | null
  /** Milliseconds elapsed so far (server clock), for resuming after a refresh. */
  elapsedMs: number
  /** interview → closing (candidate questions) → ended (farewell spoken; feedback available). */
  phase: SessionPhase
  interviewer: { title: string }
  /** Everything the interviewer has said since the learner's last turn: what to speak and caption now. */
  say: string
  /** Question ids dropped to keep the interview inside its time budget. */
  dropped: string[]
  /** What the learner should see next. */
  next: NextStep
}

export type NextStep =
  | { type: 'question'; question: InterviewQuestion; sectionTitle: string; index: number; total: number; sectionIndex: number; sectionsTotal: number }
  | { type: 'follow_up'; question: InterviewQuestion; prompt: string; intent: FollowUpIntent; index: number; total: number; sectionIndex: number; sectionsTotal: number }
  | { type: 'done' }

export interface HistoryItem {
  id: string
  jobId: string | null
  job: JobSnapshot
  mode: InterviewMode
  parentSessionId: string | null
  status: schema.InterviewSessionStatus
  label: string
  minutes: number
  startedAt: string
  completedAt: string | null
  durationSeconds: number | null
  sectionsCompleted: string[]
  sectionsTotal: number
  questionsAnswered: number
  questionsTotal: number
  metrics: InterviewReport['metrics']
  weaknessCount: number
  strongAreas: string[]
  needsImprovement: string[]
  planAddedTaskCount: number
  voiceUsed: boolean
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

/** Older rows (before the conversational layer) have a minimal state; fill the defaults without rewriting them. */
export function normalizeState(raw: SessionState): Required<Omit<SessionState, 'voice'>> & { voice: boolean } {
  return {
    index: raw.index,
    followUps: { ...raw.followUps },
    intents: { ...raw.intents },
    phase: raw.phase ?? 'interview',
    memory: [...(raw.memory ?? [])],
    usedFacts: [...(raw.usedFacts ?? [])],
    dropped: [...(raw.dropped ?? [])],
    lastAck: raw.lastAck ?? null,
    lastTransition: raw.lastTransition ?? null,
    clarifications: { ...(raw.clarifications ?? {}) },
    nudges: { ...(raw.nudges ?? {}) },
    candidateQuestions: raw.candidateQuestions ?? 0,
    voice: raw.voice ?? false,
  }
}

function pendingFollowUp(turns: TurnRecord[], questionId: string): TurnRecord | null {
  let pending: TurnRecord | null = null
  for (const t of turns) {
    if (t.questionId !== questionId) continue
    if (t.kind === 'follow_up') pending = t
    else if (t.kind === 'follow_up_answer' || t.kind === 'skip') pending = null
  }
  return pending
}

function nextStep(row: Pick<Row, 'plan' | 'state' | 'turns' | 'status'>): NextStep {
  const plan = row.plan as InterviewPlan
  const state = normalizeState(row.state as SessionState)
  const turns = row.turns as TurnRecord[]
  if (row.status !== 'active' || state.phase === 'ended' || state.index >= plan.questions.length) return { type: 'done' }
  const question = plan.questions[state.index]
  const dropped = new Set(state.dropped)
  const total = plan.questions.filter((q) => !dropped.has(q.id)).length
  const index = plan.questions.slice(0, state.index).filter((q) => !dropped.has(q.id)).length
  const sectionIndex = Math.max(0, plan.sections.findIndex((s) => s.id === question.sectionId))
  const base = { question, index, total, sectionIndex, sectionsTotal: plan.sections.length }
  const pending = pendingFollowUp(turns, question.id)
  if (pending) return { type: 'follow_up', ...base, prompt: pending.text, intent: pending.intent ?? 'clarify' }
  return { type: 'question', ...base, sectionTitle: SECTION_TITLES[question.sectionId] }
}

/** Everything the interviewer said after the learner's last turn, in speaking order. */
export function currentUtterance(turns: TurnRecord[]): string {
  const out: string[] = []
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i]
    if (t.role === 'candidate') break
    out.unshift(t.lead ? `${t.lead} ${t.text}` : t.text)
  }
  return out.join(' ').replace(/\s+/g, ' ').trim()
}

export function toSessionDto(row: Row, now = new Date()): SessionDto {
  const state = normalizeState(row.state as SessionState)
  const plan = row.plan as InterviewPlan
  const context = row.context as InterviewContext
  return {
    id: row.id,
    jobId: row.jobId,
    job: row.jobSnapshot as JobSnapshot,
    mode: row.mode as InterviewMode,
    parentSessionId: row.parentSessionId,
    config: row.config as InterviewConfig,
    plan,
    turns: row.turns as TurnRecord[],
    state,
    entitlements: row.entitlements as SessionEntitlements,
    status: row.status,
    report: (row.report as InterviewReport | null) ?? null,
    planAddedAt: iso(row.planAddedAt),
    planAddedTaskCount: row.planAddedTaskCount,
    startedAt: row.startedAt.toISOString(),
    completedAt: iso(row.completedAt),
    durationSeconds: row.durationSeconds,
    elapsedMs: Math.max(0, now.getTime() - row.startedAt.getTime()),
    phase: row.status !== 'active' ? 'ended' : state.phase,
    interviewer: { title: interviewerTitle(context, plan) },
    say: currentUtterance(row.turns as TurnRecord[]),
    dropped: state.dropped,
    next: nextStep(row),
  }
}

export function toHistoryItem(row: Row): HistoryItem {
  const plan = row.plan as InterviewPlan
  const report = (row.report as InterviewReport | null) ?? null
  const config = row.config as InterviewConfig
  return {
    id: row.id,
    jobId: row.jobId,
    job: row.jobSnapshot as JobSnapshot,
    mode: row.mode as InterviewMode,
    parentSessionId: row.parentSessionId,
    status: row.status,
    label: plan.label,
    minutes: config.minutes,
    startedAt: row.startedAt.toISOString(),
    completedAt: iso(row.completedAt),
    durationSeconds: row.durationSeconds,
    sectionsCompleted: report?.sectionsCompleted ?? [],
    sectionsTotal: plan.sections.length,
    questionsAnswered: report?.questionsAnswered ?? (row.turns as TurnRecord[]).filter((t) => t.kind === 'answer').length,
    questionsTotal: plan.questions.length,
    metrics: report?.metrics ?? [],
    weaknessCount: report?.weaknesses.length ?? 0,
    strongAreas: report?.strongAreas ?? [],
    needsImprovement: report?.needsImprovement ?? [],
    planAddedTaskCount: row.planAddedTaskCount,
    voiceUsed: report?.voiceUsed ?? (row.turns as TurnRecord[]).some((t) => t.input === 'voice'),
  }
}

export interface AccessForInterview {
  full: boolean
  preview: boolean
  adaptive: boolean
  detailed: boolean
  curriculumMapping: boolean
  coding: boolean
  design: boolean
  reattempt: boolean
  history: boolean
  /** Voice interview: the interviewer speaks and the learner may answer by microphone. */
  voice: boolean
  /** Server-side (premium) interviewer voice instead of the browser's speech synthesis. */
  premiumVoice: boolean
  /** Replay timeline and transcript after the interview. */
  replay: boolean
  maxMinutes: number
}

/** Maps the centralised entitlement resolution onto what an interview session may do. */
export function interviewAccess(access: Access): AccessForInterview {
  return {
    full: access.can('interview.jobFull'),
    preview: access.can('interview.jobPreview'),
    adaptive: access.can('interview.adaptive'),
    detailed: access.can('interview.feedbackDetailed'),
    curriculumMapping: access.can('interview.curriculumMapping'),
    coding: access.can('interview.coding'),
    design: access.can('interview.systemDesign'),
    reattempt: access.can('interview.reattempt'),
    history: access.can('interview.history'),
    voice: access.can('interview.voice'),
    premiumVoice: access.can('interview.premiumVoice'),
    replay: access.can('interview.replay'),
    maxMinutes: Math.max(15, Number(access.limits.interviewMaxMinutes) || 15),
  }
}
export function entitlementsFor(access: AccessForInterview, mode: InterviewMode): SessionEntitlements {
  const preview = mode === 'preview' || !access.full
  return { adaptive: access.adaptive && !preview, detailed: access.detailed && !preview, curriculumMapping: access.curriculumMapping && !preview, preview }
}

export interface CreateInput {
  userId: string
  job: JobDto
  blueprint: PrepBlueprint | null
  profile: ResumeProfile | null
  analysis: ResumeAnalysisReport | null
  compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null
  progress: Record<string, 'done' | 'started' | 'none'>
  config: unknown
  mode: InterviewMode
  parentSessionId?: string | null
  sectionId?: SectionId | null
  language?: string
  access: AccessForInterview
  /** The learner's display name, used only in the spoken greeting. */
  candidateName?: string | null
  /** Whether the learner chose a voice interview at start. */
  voice?: boolean
}

export function deriveFor(context: InterviewContext, access: AccessForInterview): DerivedConfig {
  return deriveInterviewConfig(context, { allowCoding: access.coding, allowDesign: access.design, maxMinutes: access.maxMinutes })
}

export async function activeSession(db: InterviewsDb, userId: string, jobId: string): Promise<Row | null> {
  const row = await db.query.jobInterviewSessions.findFirst({ where: and(eq(schema.jobInterviewSessions.userId, userId), eq(schema.jobInterviewSessions.jobId, jobId), eq(schema.jobInterviewSessions.status, 'active')), orderBy: desc(schema.jobInterviewSessions.startedAt) })
  return row ?? null
}

export async function listSessions(db: InterviewsDb, userId: string, jobId?: string): Promise<Row[]> {
  return db.query.jobInterviewSessions.findMany({ where: jobId ? and(eq(schema.jobInterviewSessions.userId, userId), eq(schema.jobInterviewSessions.jobId, jobId)) : eq(schema.jobInterviewSessions.userId, userId), orderBy: desc(schema.jobInterviewSessions.startedAt), limit: 50 })
}

export async function getSession(db: InterviewsDb, userId: string, id: string): Promise<Row | null> {
  const row = await db.query.jobInterviewSessions.findFirst({ where: and(eq(schema.jobInterviewSessions.id, id), eq(schema.jobInterviewSessions.userId, userId)) })
  return row ?? null
}

const turn = (t: Omit<TurnRecord, 'id' | 'at'>, now: Date): TurnRecord => ({ id: crypto.randomUUID(), at: now.toISOString(), ...t })

/** Starts a session. Re-attempt modes need a completed parent owned by the same learner. The interviewer's opening is stored as the first turn. */
export async function createSession(db: InterviewsDb, input: CreateInput, now = new Date()): Promise<Row> {
  if ((input.mode === 'weak_areas' || input.mode === 'section' || input.mode === 'missed_concepts') && !input.access.reattempt) throw new ValidationError('Re-attempts are not included in your plan', 'mode')
  const mode: InterviewMode = input.access.full ? input.mode : 'preview'
  const context = buildInterviewContext({ job: input.job, blueprint: input.blueprint, profile: input.profile, analysis: input.analysis, compatibility: input.compatibility, progress: input.progress })
  const derived = deriveFor(context, input.access)
  const config = normalizeConfig(input.config, derived, { allowCoding: input.access.coding, allowDesign: input.access.design, maxMinutes: input.access.maxMinutes })
  const previous = await listSessions(db, input.userId, input.job.id)
  const excludeKeys = previous.flatMap((p) => (p.plan as InterviewPlan).questions.map((q) => q.key))
  let parent: Row | null = null
  if (mode === 'weak_areas' || mode === 'section' || mode === 'missed_concepts') {
    if (!input.access.reattempt) throw new ValidationError('Re-attempts are not included in your plan', 'mode')
    parent = input.parentSessionId ? await getSession(db, input.userId, input.parentSessionId) : previous.find((p) => p.status === 'completed' && p.report) ?? null
    if (!parent || parent.status !== 'completed' || !parent.report) throw new ValidationError('A completed interview is needed before a re-attempt', 'parentSessionId')
    if (mode === 'section' && (!input.sectionId || !(input.sectionId in SECTION_TITLES))) throw new ValidationError('Choose a section to practise', 'sectionId')
  }
  const parentReport = (parent?.report as InterviewReport | null) ?? null
  const entitlements = entitlementsFor(input.access, mode)
  const plan = composeInterview(context, config, {
    mode,
    seed: previous.length,
    excludeKeys,
    entitlements,
    language: input.language,
    sectionId: input.sectionId ?? undefined,
    focusAreas: parentReport?.weaknesses.map((w) => w.area),
    focusRefs: parentReport?.weaknesses.map((w) => w.ref).filter((r): r is NonNullable<typeof r> => Boolean(r)),
    focusConcepts: parentReport ? Array.from(new Set(parentReport.weaknesses.flatMap((w) => w.concepts).concat(parentReport.missedConcepts.map((m) => m.concept)))) : undefined,
  })
  if (!plan.questions.length) throw new ValidationError('Nothing to practise for this configuration')
  const first = plan.questions[0]
  const opening = buildOpening(context, config, plan, input.candidateName)
  const lead = first.kind === 'intro' ? '' : transition(null, first.sectionId, { seed: previous.length, remainingMinutes: config.minutes, totalMinutes: config.minutes })
  const turns: TurnRecord[] = [turn({ questionId: first.id, role: 'interviewer', kind: 'opening', text: [...opening, lead, first.prompt].filter(Boolean).join(' ') }, now)]
  const state: SessionState = { index: 0, followUps: {}, intents: {}, phase: first.kind === 'wrapup' ? 'closing' : 'interview', memory: [], usedFacts: [], dropped: [], lastAck: null, lastTransition: null, clarifications: {}, nudges: {}, candidateQuestions: 0, voice: Boolean(input.voice && input.access.voice) }
  const [row] = await db
    .insert(schema.jobInterviewSessions)
    .values({ id: crypto.randomUUID(), userId: input.userId, jobId: input.job.id, jobSnapshot: context.job, mode, parentSessionId: parent?.id ?? null, config, context, plan, turns, state, entitlements, status: 'active', startedAt: now, createdAt: now, updatedAt: now })
    .returning()
  logEvent('info', 'interview.started', { userId: input.userId, sessionId: row.id, jobId: input.job.id, mode, questions: plan.questions.length, minutes: config.minutes, voice: state.voice })
  return row
}

export interface TurnInput {
  questionId: string
  /** answer: a real answer (meta requests such as "could you repeat that?" are detected and handled as clarifications); skip; clarify: an explicit repeat / clarify request; nudge: the client's silence timer fired. */
  kind: 'answer' | 'skip' | 'clarify' | 'nudge'
  text?: string
  code?: string | null
  language?: string | null
  diagram?: string | null
  input?: 'voice' | 'text'
  intent?: CandidateIntent
  /** Silence nudge level: 1 = "Take your time.", 2 = offer to repeat or clarify. */
  level?: 1 | 2
  latency?: TurnLatency
}

const cleanLatency = (l: TurnLatency | undefined): TurnLatency | undefined => {
  if (!l || typeof l !== 'object') return undefined
  const out: TurnLatency = {}
  for (const k of ['sttMs', 'ttsMs', 'turnMs', 'serverMs', 'aiMs'] as const) {
    const v = Number(l[k])
    if (Number.isFinite(v) && v >= 0 && v < 600_000) out[k] = Math.round(v)
  }
  return Object.keys(out).length ? out : undefined
}

/** Records a learner turn, lets the interviewer react (clarify, nudge, follow up, transition, close) and advances the cursor. */
export async function submitTurn(db: InterviewsDb, userId: string, sessionId: string, input: TurnInput, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status !== 'active') throw new ValidationError('This interview has ended', 'sessionId')
  const plan = row.plan as InterviewPlan
  const config = row.config as InterviewConfig
  const job = row.jobSnapshot as JobSnapshot
  const state = normalizeState(row.state as SessionState)
  if (state.phase === 'ended') throw new ValidationError('This interview has ended', 'sessionId')
  const turns = [...(row.turns as TurnRecord[])]
  const question = plan.questions[state.index]
  if (!question || question.id !== input.questionId) throw new ValidationError('That question is not the current one', 'questionId')
  const elapsedMs = Math.max(0, now.getTime() - row.startedAt.getTime())
  const seed = turns.length
  const text = (input.text ?? '').toString().slice(0, 8000)
  const code = input.code ? String(input.code).slice(0, 20000) : null
  const diagram = input.diagram ? String(input.diagram).slice(0, 8000) : null
  const source: 'voice' | 'text' = input.input === 'voice' ? 'voice' : 'text'
  const latency = cleanLatency(input.latency)
  if (source === 'voice') state.voice = true
  const push = (t: Omit<TurnRecord, 'id' | 'at'>) => turns.push(turn(t, now))
  const interviewer = (kind: TurnKind, text: string, questionId = question.id, extra: Partial<TurnRecord> = {}) => push({ questionId, role: 'interviewer', kind, text, ...extra })

  const finish = (prefix?: string) => {
    interviewer('farewell', `${prefix ? `${prefix} ` : ''}${FAREWELL}`)
    state.phase = 'ended'
    state.index = plan.questions.length
  }

  const moveOn = (ack: string) => {
    const fromSection = question.sectionId
    const dropped = new Set(state.dropped)
    state.index += 1
    while (state.index < plan.questions.length && dropped.has(plan.questions[state.index].id)) state.index += 1
    const decision = manageTime(plan, { index: state.index, dropped: state.dropped }, elapsedMs, config.minutes)
    if (decision.drop.length) {
      state.dropped = [...state.dropped, ...decision.drop]
      const all = new Set(state.dropped)
      while (state.index < plan.questions.length && all.has(plan.questions[state.index].id)) state.index += 1
    }
    const next = plan.questions[state.index]
    if (!next) {
      finish(ack)
      return
    }
    const remainingMinutes = Math.max(0, Math.round((config.minutes * 60_000 - elapsedMs) / 60_000))
    let say = ack
    if (decision.wrapUp && next.kind === 'wrapup') say = `${ack} We're at time, so let's wrap up here.`
    else if (next.sectionId !== fromSection) {
      const tr = transition(fromSection, next.sectionId, { seed, remainingMinutes, totalMinutes: config.minutes, shortened: decision.shortened, last: state.lastTransition })
      say = `${ack} ${tr}`.trim()
      state.lastTransition = tr
    } else if (decision.shortened) say = `${ack} We're a little short on time, so I'll keep this next part brief.`
    interviewer('transition', say, next.id)
    let prompt = next.prompt
    // Resume questions already quote the resume; technical and behavioural questions may refer back to what the learner said.
    const fact = next.kind === 'technical' || next.kind === 'behavioral' ? relevantFact(state.memory as MemoryFact[], next, state.usedFacts) : null
    if (fact) {
      prompt = personalize(prompt, fact, seed)
      state.usedFacts = [...state.usedFacts, fact.text]
    }
    interviewer('question', prompt, next.id)
    if (next.kind === 'wrapup') state.phase = 'closing'
  }

  const save = async () => {
    const [updated] = await db.update(schema.jobInterviewSessions).set({ turns, state, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
    return updated
  }

  if (input.kind === 'nudge') {
    const level = input.level === 2 ? 2 : 1
    const done = state.nudges[question.id] ?? 0
    if (done < level) {
      interviewer('nudge', level === 1 ? rotatePhrase(['Take your time.', 'No rush. Take your time.'], seed) : 'Would you like me to repeat or clarify the question? Just say so, or carry on whenever you are ready.')
      state.nudges[question.id] = level
    }
    return save()
  }

  const hasWork = Boolean(code || diagram)
  let intent: CandidateIntent = 'answer'
  if (input.kind === 'clarify') intent = input.intent && input.intent !== 'answer' ? input.intent : classifyCandidateMessage(text) === 'answer' ? 'clarify' : classifyCandidateMessage(text)
  else if (input.kind === 'answer' && !hasWork) intent = classifyCandidateMessage(text)

  if (input.kind === 'clarify' || intent !== 'answer') {
    const count = state.clarifications[question.id] ?? 0
    const asked = text.trim() || (intent === 'repeat' ? 'Could you repeat the question?' : intent === 'assumption' ? 'Can I make an assumption here?' : intent === 'thinking' ? 'Give me a moment to think.' : 'Could you clarify the question?')
    push({ questionId: question.id, role: 'candidate', kind: 'clarification_request', text: asked, candidateIntent: intent as Exclude<CandidateIntent, 'answer'>, input: source, latency })
    const reply = count >= 3 && intent !== 'thinking' && intent !== 'repeat' ? "Let's go with what you have. Make your assumptions explicit and carry on." : clarificationReply(question, intent as Exclude<CandidateIntent, 'answer'>, asked, seed)
    interviewer('clarification', reply, question.id, { candidateIntent: intent as Exclude<CandidateIntent, 'answer'> })
    state.clarifications[question.id] = count + 1
    return save()
  }

  if (input.kind === 'skip') {
    if (!question.skippable) throw new ValidationError('This question cannot be skipped', 'kind')
    push({ questionId: question.id, role: 'candidate', kind: 'skip', text: '', input: source, latency })
    if (question.kind === 'wrapup' || state.phase === 'closing') finish(rotatePhrase(['Alright.', 'Okay.'], seed))
    else moveOn(rotatePhrase(["Okay, we'll leave that one.", "Alright, let's set that aside.", 'Okay, no problem.'], seed, state.lastAck))
    return save()
  }

  if (!text.trim() && !code && !diagram) throw new ValidationError('Write an answer, share code or a diagram, or skip the question', 'text')

  if (question.kind === 'wrapup' || state.phase === 'closing') {
    push({ questionId: question.id, role: 'candidate', kind: 'candidate_question', text, input: source, latency })
    const { answer, askedNothing } = answerCandidateQuestion(text, job.title, job.companyName)
    const asked = state.candidateQuestions + (askedNothing ? 0 : 1)
    state.candidateQuestions = asked
    if (askedNothing || asked >= 2) {
      if (answer) interviewer('closing_answer', answer)
      finish(askedNothing ? rotatePhrase(['Alright.', 'Okay.'], seed) : undefined)
    } else interviewer('closing_answer', `${answer} ${rotatePhrase(['Anything else you would like to ask?', 'Is there anything else on your mind?'], seed)}`)
    return save()
  }

  const evidence: AnswerEvidence = analyzeAnswer(question, { text, code, diagram })
  const answeringFollowUp = Boolean(pendingFollowUp(turns, question.id))
  push({ questionId: question.id, role: 'candidate', kind: answeringFollowUp ? 'follow_up_answer' : 'answer', text, code, language: input.language ?? question.language ?? null, diagram, evidence, input: source, latency })
  state.memory = remember(state.memory as MemoryFact[], extractFacts(text, question.id))
  const askedIntents = state.intents[question.id] ?? []
  const merged = turns.filter((t) => t.questionId === question.id && CANDIDATE_ANSWER_KINDS.includes(t.kind) && t.evidence).map((t) => t.evidence!)
  const combined = merged.length > 1 ? { ...evidence, conceptsHit: Array.from(new Set(merged.flatMap((e) => e.conceptsHit))), conceptsMissed: evidence.conceptsMissed.filter((c) => !merged.some((e) => e.conceptsHit.includes(c))), hasExample: merged.some((e) => e.hasExample), hasTradeoff: merged.some((e) => e.hasTradeoff), hasComplexity: merged.some((e) => e.hasComplexity), hasEdgeCases: merged.some((e) => e.hasEdgeCases), hasStructure: merged.some((e) => e.hasStructure) } : evidence
  // With a minute or less on the clock the interviewer moves to the wrap-up instead of probing further.
  const outOfTime = config.minutes * 60_000 - elapsedMs <= 60_000
  const followUp = outOfTime ? null : decideFollowUp(question, combined, askedIntents, (row.entitlements as SessionEntitlements).adaptive, seed)
  const ack = acknowledge(seed, evidence.quality, state.lastAck)
  state.lastAck = ack
  if (followUp) {
    const lead = /follow up/.test(ack) ? ack : `${ack} ${followUpLead(seed, state.lastTransition)}`.trim()
    interviewer('follow_up', followUp.prompt, question.id, { intent: followUp.intent, lead })
    state.followUps[question.id] = (state.followUps[question.id] ?? 0) + 1
    state.intents[question.id] = [...askedIntents, followUp.intent]
  } else moveOn(ack)
  return save()
}

/**
 * Moves to the wrap-up early: the learner chose to end, or the clock ran out
 * while they were idle. Never cuts an answer: it is called between turns.
 */
export async function wrapUpSession(db: InterviewsDb, userId: string, sessionId: string, reason: 'learner' | 'time', now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status !== 'active') return row
  const plan = row.plan as InterviewPlan
  const state = normalizeState(row.state as SessionState)
  if (state.phase === 'ended') return row
  const turns = [...(row.turns as TurnRecord[])]
  const question = plan.questions[state.index]
  const wrap = plan.questions.find((q, i) => q.kind === 'wrapup' && i >= state.index)
  if (state.phase === 'closing' || !wrap || question?.kind === 'wrapup') {
    turns.push(turn({ questionId: question?.id ?? plan.questions[plan.questions.length - 1].id, role: 'interviewer', kind: 'farewell', text: `${reason === 'time' ? "We're at time, so we'll stop here." : 'Understood.'} ${FAREWELL}` }, now))
    state.phase = 'ended'
    state.index = plan.questions.length
  } else {
    const wrapIndex = plan.questions.indexOf(wrap)
    state.dropped = Array.from(new Set([...state.dropped, ...plan.questions.slice(state.index, wrapIndex).map((q) => q.id)]))
    state.index = wrapIndex
    turns.push(turn({ questionId: wrap.id, role: 'interviewer', kind: 'transition', text: reason === 'time' ? "We're at time, so let's wrap up here." : "Understood. Let's wrap up here." }, now))
    turns.push(turn({ questionId: wrap.id, role: 'interviewer', kind: 'question', text: wrap.prompt }, now))
    state.phase = 'closing'
  }
  const [updated] = await db.update(schema.jobInterviewSessions).set({ turns, state, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  return updated
}

/** Replaces the wording of the pending follow-up with an AI rephrasing; the deterministic prompt stays stored. */
export async function rephraseFollowUp(db: InterviewsDb, userId: string, sessionId: string, text: string, now = new Date()): Promise<Row | null> {
  const row = await getSession(db, userId, sessionId)
  if (!row || row.status !== 'active') return null
  const turns = [...(row.turns as TurnRecord[])]
  const last = turns[turns.length - 1]
  if (!last || last.kind !== 'follow_up' || last.aiRefined) return row
  turns[turns.length - 1] = { ...last, deterministicText: last.text, text, aiRefined: true }
  const [updated] = await db.update(schema.jobInterviewSessions).set({ turns, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  return updated
}

/** Stores an AI coaching note on a completed report without touching the evidence-based content. */
export async function attachAiSummary(db: InterviewsDb, userId: string, sessionId: string, note: { text: string; provider: string; requestId: string }, now = new Date()): Promise<Row | null> {
  const row = await getSession(db, userId, sessionId)
  if (!row || row.status !== 'completed' || !row.report) return null
  const report = { ...(row.report as InterviewReport), aiSummary: note }
  const [updated] = await db.update(schema.jobInterviewSessions).set({ report, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  return updated
}

/**
 * Completes the session and builds the report from stored turns. If the
 * farewell has not been spoken yet (older clients, or the learner finishing
 * from the closing screen), it is appended first so every transcript ends the
 * same way; the report is computed after that.
 */
export async function completeSession(db: InterviewsDb, userId: string, sessionId: string, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status === 'completed') return row
  if (row.status !== 'active') throw new ValidationError('This interview was abandoned', 'sessionId')
  const plan = row.plan as InterviewPlan
  const config = row.config as InterviewConfig
  const state = normalizeState(row.state as SessionState)
  const turns = [...(row.turns as TurnRecord[])]
  if (state.phase !== 'ended') {
    const q = plan.questions[Math.min(state.index, plan.questions.length - 1)]
    turns.push(turn({ questionId: q.id, role: 'interviewer', kind: 'farewell', text: FAREWELL }, now))
    state.phase = 'ended'
    state.index = plan.questions.length
  }
  const durationSeconds = Math.max(1, Math.round((now.getTime() - row.startedAt.getTime()) / 1000))
  const report: InterviewReport = { ...buildReport(plan, turns, row.entitlements as SessionEntitlements, { plannedMinutes: config.minutes, actualMinutes: Math.max(1, Math.round(durationSeconds / 60)) }), timeline: buildTimeline(plan, turns, row.startedAt.toISOString()) }
  const [updated] = await db.update(schema.jobInterviewSessions).set({ status: 'completed', report, turns, state, completedAt: now, durationSeconds, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  logEvent('info', 'interview.completed', { userId, sessionId, answered: report.questionsAnswered, total: report.questionsTotal, weaknesses: report.weaknesses.length, voice: report.voiceUsed })
  return updated
}

export async function abandonSession(db: InterviewsDb, userId: string, sessionId: string, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status !== 'active') return row
  const [updated] = await db.update(schema.jobInterviewSessions).set({ status: 'abandoned', completedAt: now, durationSeconds: Math.round((now.getTime() - row.startedAt.getTime()) / 1000), updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  return updated
}

/** Records that weaknesses from this report were added to the learning plan. */
export async function recordPlanAdded(db: InterviewsDb, userId: string, sessionId: string, taskCount: number, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  const [updated] = await db.update(schema.jobInterviewSessions).set({ planAddedAt: now, planAddedTaskCount: Math.max(0, Math.floor(taskCount)), updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  return updated
}
