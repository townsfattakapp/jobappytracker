import { and, desc, eq } from 'drizzle-orm'
import * as schema from '../db/schema'
import { analyzeAnswer, buildInterviewContext, buildReport, composeInterview, decideFollowUp, deriveInterviewConfig, normalizeConfig, SECTION_TITLES, type AnswerEvidence, type DerivedConfig, type FollowUpIntent, type InterviewConfig, type InterviewContext, type InterviewMode, type InterviewPlan, type InterviewQuestion, type InterviewReport, type JobSnapshot, type SectionId, type SessionEntitlements, type SessionState, type TurnRecord } from '../interview/jobInterview'
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
  /** What the learner should see next. */
  next: NextStep
}

export type NextStep = { type: 'question'; question: InterviewQuestion; sectionTitle: string; index: number; total: number } | { type: 'follow_up'; question: InterviewQuestion; prompt: string; intent: FollowUpIntent; index: number; total: number } | { type: 'done' }

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
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

function nextStep(row: Pick<Row, 'plan' | 'state' | 'turns' | 'status'>): NextStep {
  const plan = row.plan as InterviewPlan
  const state = row.state as SessionState
  const turns = row.turns as TurnRecord[]
  if (row.status !== 'active' || state.index >= plan.questions.length) return { type: 'done' }
  const question = plan.questions[state.index]
  const last = turns[turns.length - 1]
  if (last && last.questionId === question.id && last.kind === 'follow_up') return { type: 'follow_up', question, prompt: last.text, intent: last.intent ?? 'clarify', index: state.index, total: plan.questions.length }
  return { type: 'question', question, sectionTitle: SECTION_TITLES[question.sectionId], index: state.index, total: plan.questions.length }
}

export function toSessionDto(row: Row, now = new Date()): SessionDto {
  return {
    id: row.id,
    jobId: row.jobId,
    job: row.jobSnapshot as JobSnapshot,
    mode: row.mode as InterviewMode,
    parentSessionId: row.parentSessionId,
    config: row.config as InterviewConfig,
    plan: row.plan as InterviewPlan,
    turns: row.turns as TurnRecord[],
    state: row.state as SessionState,
    entitlements: row.entitlements as SessionEntitlements,
    status: row.status,
    report: (row.report as InterviewReport | null) ?? null,
    planAddedAt: iso(row.planAddedAt),
    planAddedTaskCount: row.planAddedTaskCount,
    startedAt: row.startedAt.toISOString(),
    completedAt: iso(row.completedAt),
    durationSeconds: row.durationSeconds,
    elapsedMs: Math.max(0, now.getTime() - row.startedAt.getTime()),
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

/** Starts a session. Re-attempt modes need a completed parent owned by the same learner. */
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
  const state: SessionState = { index: 0, followUps: {}, intents: {} }
  const [row] = await db
    .insert(schema.jobInterviewSessions)
    .values({ id: crypto.randomUUID(), userId: input.userId, jobId: input.job.id, jobSnapshot: context.job, mode, parentSessionId: parent?.id ?? null, config, context, plan, turns: [], state, entitlements, status: 'active', startedAt: now, createdAt: now, updatedAt: now })
    .returning()
  logEvent('info', 'interview.started', { userId: input.userId, sessionId: row.id, jobId: input.job.id, mode, questions: plan.questions.length, minutes: config.minutes })
  return row
}

export interface TurnInput {
  questionId: string
  kind: 'answer' | 'skip'
  text?: string
  code?: string | null
  language?: string | null
  diagram?: string | null
}

/** Records an answer (or skip), lets the interviewer react, and advances the cursor. */
export async function submitTurn(db: InterviewsDb, userId: string, sessionId: string, input: TurnInput, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status !== 'active') throw new ValidationError('This interview has ended', 'sessionId')
  const plan = row.plan as InterviewPlan
  const state = { ...(row.state as SessionState), followUps: { ...(row.state as SessionState).followUps }, intents: { ...(row.state as SessionState).intents } }
  const turns = [...(row.turns as TurnRecord[])]
  const question = plan.questions[state.index]
  if (!question || question.id !== input.questionId) throw new ValidationError('That question is not the current one', 'questionId')
  const last = turns[turns.length - 1]
  const answeringFollowUp = Boolean(last && last.questionId === question.id && last.kind === 'follow_up')
  const text = (input.text ?? '').toString().slice(0, 8000)
  const code = input.code ? String(input.code).slice(0, 20000) : null
  const diagram = input.diagram ? String(input.diagram).slice(0, 8000) : null
  if (input.kind === 'skip') {
    if (!question.skippable) throw new ValidationError('This question cannot be skipped', 'kind')
    turns.push({ id: crypto.randomUUID(), questionId: question.id, role: 'candidate', kind: 'skip', text: '', at: now.toISOString() })
    state.index += 1
  } else {
    if (!text.trim() && !code && !diagram) throw new ValidationError('Write an answer, share code or a diagram, or skip the question', 'text')
    const evidence: AnswerEvidence = analyzeAnswer(question, { text, code, diagram })
    turns.push({ id: crypto.randomUUID(), questionId: question.id, role: 'candidate', kind: answeringFollowUp ? 'follow_up_answer' : 'answer', text, code, language: input.language ?? question.language ?? null, diagram, evidence, at: now.toISOString() })
    const asked = state.intents[question.id] ?? []
    const merged = turns.filter((t) => t.questionId === question.id && t.evidence).map((t) => t.evidence!)
    const combined = merged.length > 1 ? { ...evidence, conceptsHit: Array.from(new Set(merged.flatMap((e) => e.conceptsHit))), conceptsMissed: evidence.conceptsMissed.filter((c) => !merged.some((e) => e.conceptsHit.includes(c))), hasExample: merged.some((e) => e.hasExample), hasTradeoff: merged.some((e) => e.hasTradeoff), hasComplexity: merged.some((e) => e.hasComplexity), hasEdgeCases: merged.some((e) => e.hasEdgeCases), hasStructure: merged.some((e) => e.hasStructure) } : evidence
    const followUp = decideFollowUp(question, combined, asked, (row.entitlements as SessionEntitlements).adaptive)
    if (followUp) {
      turns.push({ id: crypto.randomUUID(), questionId: question.id, role: 'interviewer', kind: 'follow_up', text: followUp.prompt, intent: followUp.intent, at: now.toISOString() })
      state.followUps[question.id] = (state.followUps[question.id] ?? 0) + 1
      state.intents[question.id] = [...asked, followUp.intent]
    } else state.index += 1
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

export async function completeSession(db: InterviewsDb, userId: string, sessionId: string, now = new Date()): Promise<Row> {
  const row = await getSession(db, userId, sessionId)
  if (!row) throw new ValidationError('Interview not found', 'sessionId')
  if (row.status === 'completed') return row
  if (row.status !== 'active') throw new ValidationError('This interview was abandoned', 'sessionId')
  const plan = row.plan as InterviewPlan
  const config = row.config as InterviewConfig
  const durationSeconds = Math.max(1, Math.round((now.getTime() - row.startedAt.getTime()) / 1000))
  const report = buildReport(plan, row.turns as TurnRecord[], row.entitlements as SessionEntitlements, { plannedMinutes: config.minutes, actualMinutes: Math.max(1, Math.round(durationSeconds / 60)) })
  const [updated] = await db.update(schema.jobInterviewSessions).set({ status: 'completed', report, completedAt: now, durationSeconds, updatedAt: now }).where(and(eq(schema.jobInterviewSessions.id, row.id), eq(schema.jobInterviewSessions.userId, userId))).returning()
  logEvent('info', 'interview.completed', { userId, sessionId, answered: report.questionsAnswered, total: report.questionsTotal, weaknesses: report.weaknesses.length })
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
