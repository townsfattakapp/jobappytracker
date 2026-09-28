import { and, asc, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import * as schema from '../db/schema'
import type { PlansDb } from './plans'
import { ValidationError } from '../jobs/normalize'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import type { ResumeProfile } from '../resume/extract'
import { evaluateReadiness, type ReadinessReport } from '../referrals/readiness'
import { matchReferrer, type MatchReferrer } from '../referrals/matching'
import { creditBalance, endOfPeriod, periodKey, reservationOutstanding, type CreditBalance, type LedgerRow } from '../referrals/credits'
import { toPublicProfile, type ReferrerPublicProfile } from '../referrals/privacy'
import { assertTransition, CREDIT_RELEASING_REASONS, DECLINE_REASONS, isOpen, isTerminal, LEARNER_CANCELLABLE, learnerStage, OPEN_STATUSES, type CloseReason, type DeclineReason, type LearnerStage, type RequestStatus } from '../referrals/states'

/**
 * Verified referral network service. Every function takes the database so the
 * whole lifecycle runs against PGlite in tests; side effects (mail, audit)
 * come in through `deps` with safe defaults. Learner-facing readers return
 * projections that contain no referrer identity; referrer-facing readers only
 * return assignments that belong to that referrer; everything that changes a
 * request goes through `transition`, which validates the state machine and
 * records an event.
 */

export type ReferralsDb = PlansDb

export type ReferralNotificationKind =
  | 'referral.request_received'
  | 'referral.needs_action'
  | 'referral.assigned'
  | 'referral.clarification'
  | 'referral.learner_replied'
  | 'referral.accepted'
  | 'referral.declined'
  | 'referral.submitted'
  | 'referral.closed'
  | 'referrer.invite'
  | 'referrer.verify_email'
  | 'referrer.verified'
  | 'referrer.status'

export interface ReferralDeps {
  db: ReferralsDb
  now?: () => Date
  /** Mail + notification_log; defaults to a no-op so tests and scripts never send. */
  notify?: (userId: string | null, email: string | null, kind: ReferralNotificationKind, data: Record<string, string | number | null | undefined>) => Promise<unknown>
  audit?: (input: { actorId: string | null; action: string; entityType: string; entityId?: string | null; before?: unknown; after?: unknown }) => Promise<void>
}

type Deps = Required<Pick<ReferralDeps, 'db' | 'now' | 'notify' | 'audit'>>
function withDefaults(deps: ReferralDeps): Deps {
  return { db: deps.db, now: deps.now ?? (() => new Date()), notify: deps.notify ?? (async () => undefined), audit: deps.audit ?? (async () => undefined) }
}

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')
const newToken = () => randomBytes(32).toString('base64url')
const newPublicId = () => `ref_${randomBytes(6).toString('base64url')}`
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
const monthStart = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

// ---------------------------------------------------------------------------
// Settings and company policy
// ---------------------------------------------------------------------------

export interface ReferralSettings {
  /** invite_only: only admin-invited referrers can join; public: the application form is open; disabled: the network is hidden. */
  mode: 'invite_only' | 'public' | 'disabled'
  /** How many referrers a request may be offered to before it closes. */
  maxAttempts: number
  /** Hours a referrer has to answer before the request moves on. */
  assignmentTtlHours: number
  /** Days an open request may live without a referral before it expires. */
  requestTtlDays: number
  /** Whether requests may proceed at companies whose policy status is UNKNOWN. */
  allowUnknownPolicy: boolean
  /** Credits are required to submit; off in early beta if credits are not yet granted. */
  requireCredits: boolean
}

export const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = { mode: 'invite_only', maxAttempts: 3, assignmentTtlHours: 72, requestTtlDays: 30, allowUnknownPolicy: false, requireCredits: true }
export const REFERRAL_SETTINGS_KEY = 'referral'

export function normalizeReferralSettings(value: unknown): ReferralSettings {
  const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const int = (x: unknown, fallback: number, min: number, max: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, Math.floor(x))) : fallback)
  return {
    mode: v.mode === 'public' || v.mode === 'disabled' ? v.mode : 'invite_only',
    maxAttempts: int(v.maxAttempts, DEFAULT_REFERRAL_SETTINGS.maxAttempts, 1, 10),
    assignmentTtlHours: int(v.assignmentTtlHours, DEFAULT_REFERRAL_SETTINGS.assignmentTtlHours, 1, 24 * 14),
    requestTtlDays: int(v.requestTtlDays, DEFAULT_REFERRAL_SETTINGS.requestTtlDays, 1, 180),
    allowUnknownPolicy: v.allowUnknownPolicy === true,
    requireCredits: v.requireCredits !== false,
  }
}

export async function getReferralSettings(db: ReferralsDb): Promise<ReferralSettings> {
  const row = await db.select().from(schema.platformSettings).where(eq(schema.platformSettings.key, REFERRAL_SETTINGS_KEY)).limit(1)
  return normalizeReferralSettings(row[0]?.value)
}

export async function saveReferralSettings(deps: ReferralDeps, patch: Partial<ReferralSettings>, actorId: string | null): Promise<ReferralSettings> {
  const d = withDefaults(deps)
  const before = await getReferralSettings(d.db)
  const next = normalizeReferralSettings({ ...before, ...patch })
  await d.db.insert(schema.platformSettings).values({ key: REFERRAL_SETTINGS_KEY, value: next, updatedBy: actorId, updatedAt: d.now() }).onConflictDoUpdate({ target: schema.platformSettings.key, set: { value: next, updatedBy: actorId, updatedAt: d.now() } })
  await d.audit({ actorId, action: 'referral.settings.update', entityType: 'referral_settings', entityId: REFERRAL_SETTINGS_KEY, before, after: next })
  return next
}

export type CompanyPolicyRow = typeof schema.companyReferralPolicies.$inferSelect
export interface CompanyPolicyDto {
  companyId: string
  referralsEnabled: boolean
  policyStatus: schema.ReferralPolicyStatus
  policySource: string | null
  lastReviewedAt: string | null
  alreadyAppliedRestricted: boolean
  duplicateReferralRestricted: boolean
  constraints: string[]
  notes: string | null
  manualReviewRequired: boolean
  updatedAt: string | null
}

export function toPolicyDto(row: CompanyPolicyRow | null, companyId: string): CompanyPolicyDto {
  if (!row) return { companyId, referralsEnabled: false, policyStatus: 'UNKNOWN', policySource: null, lastReviewedAt: null, alreadyAppliedRestricted: true, duplicateReferralRestricted: true, constraints: [], notes: null, manualReviewRequired: false, updatedAt: null }
  return { companyId: row.companyId, referralsEnabled: row.referralsEnabled, policyStatus: row.policyStatus, policySource: row.policySource, lastReviewedAt: iso(row.lastReviewedAt), alreadyAppliedRestricted: row.alreadyAppliedRestricted, duplicateReferralRestricted: row.duplicateReferralRestricted, constraints: row.constraints ?? [], notes: row.notes, manualReviewRequired: row.manualReviewRequired, updatedAt: iso(row.updatedAt) }
}

export async function getCompanyPolicy(db: ReferralsDb, companyId: string): Promise<CompanyPolicyDto> {
  const rows = await db.select().from(schema.companyReferralPolicies).where(eq(schema.companyReferralPolicies.companyId, companyId)).limit(1)
  return toPolicyDto(rows[0] ?? null, companyId)
}

export async function saveCompanyPolicy(deps: ReferralDeps, companyId: string, input: Partial<Omit<CompanyPolicyDto, 'companyId' | 'updatedAt'>>, actorId: string | null): Promise<CompanyPolicyDto> {
  const d = withDefaults(deps)
  const before = await getCompanyPolicy(d.db, companyId)
  const status = input.policyStatus ?? before.policyStatus
  if (!(schema.REFERRAL_POLICY_STATUSES as readonly string[]).includes(status)) throw new ValidationError('Unknown policy status', 'policyStatus')
  if (status === 'VERIFIED_POLICY' && !(input.policySource ?? before.policySource)) throw new ValidationError('A verified policy needs a source (where the policy was read)', 'policySource')
  const next = {
    companyId,
    referralsEnabled: status === 'REFERRALS_DISABLED' ? false : (input.referralsEnabled ?? before.referralsEnabled),
    policyStatus: status,
    policySource: input.policySource === undefined ? before.policySource : input.policySource,
    lastReviewedAt: input.lastReviewedAt === undefined ? (before.lastReviewedAt ? new Date(before.lastReviewedAt) : null) : input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
    alreadyAppliedRestricted: input.alreadyAppliedRestricted ?? before.alreadyAppliedRestricted,
    duplicateReferralRestricted: input.duplicateReferralRestricted ?? before.duplicateReferralRestricted,
    constraints: (input.constraints ?? before.constraints).map((c) => String(c).trim()).filter(Boolean).slice(0, 20),
    notes: input.notes === undefined ? before.notes : input.notes,
    manualReviewRequired: input.manualReviewRequired ?? before.manualReviewRequired,
    updatedBy: actorId,
    updatedAt: d.now(),
  }
  await d.db.insert(schema.companyReferralPolicies).values(next).onConflictDoUpdate({ target: schema.companyReferralPolicies.companyId, set: next })
  const after = await getCompanyPolicy(d.db, companyId)
  await d.audit({ actorId, action: 'referral.policy.update', entityType: 'company_referral_policy', entityId: companyId, before, after })
  return after
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

export interface CreditSummary extends CreditBalance {
  allowance: number
  periodKey: string
  /** Rows the learner can see: type, amount, reason, date. */
  recent: { type: string; amount: number; reason: string; source: string | null; createdAt: string }[]
}

async function ledgerRows(db: ReferralsDb, userId: string) {
  return db.select().from(schema.referralCreditLedger).where(eq(schema.referralCreditLedger.userId, userId)).orderBy(asc(schema.referralCreditLedger.createdAt))
}

/** Grants this month's plan allowance once, expires the previous months' unspent allowances, and returns the balance. */
export async function creditSummary(deps: ReferralDeps, userId: string, allowance: number): Promise<CreditSummary> {
  const d = withDefaults(deps)
  const now = d.now()
  const key = periodKey(now)
  let rows = await ledgerRows(d.db, userId)
  if (allowance > 0 && !rows.some((r) => r.type === 'GRANT' && r.source === 'subscription' && r.periodKey === key)) {
    await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId, type: 'GRANT', amount: allowance, reason: `Plan allowance for ${key}`, source: 'subscription', periodKey: key, expiresAt: endOfPeriod(now), createdAt: now })
    rows = await ledgerRows(d.db, userId)
  }
  // Expire grants past their date, once each, for whatever part of them is still unspent.
  for (const g of rows.filter((r) => r.type === 'GRANT' && r.expiresAt && r.expiresAt <= now)) {
    if (rows.some((r) => r.type === 'EXPIRE' && r.reservationId === g.id)) continue
    const balance = creditBalance(rows as LedgerRow[])
    const amount = Math.min(balance.available, g.amount)
    await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId, type: 'EXPIRE', amount, reason: `Unused allowance from ${g.periodKey ?? 'grant'} expired`, source: 'system', reservationId: g.id, createdAt: now })
    rows = await ledgerRows(d.db, userId)
  }
  const balance = creditBalance(rows as LedgerRow[])
  return { ...balance, allowance, periodKey: key, recent: rows.slice(-12).reverse().map((r) => ({ type: r.type, amount: r.amount, reason: r.reason, source: r.source, createdAt: r.createdAt.toISOString() })) }
}

export async function grantCredits(deps: ReferralDeps, input: { userId: string; amount: number; reason: string; source: 'promotion' | 'admin' | 'purchase'; actorId: string | null; expiresAt?: Date | null; requestId?: string | null }): Promise<void> {
  const d = withDefaults(deps)
  if (!Number.isInteger(input.amount) || input.amount < 1 || input.amount > 100) throw new ValidationError('Amount must be a whole number between 1 and 100', 'amount')
  await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId: input.userId, type: input.source === 'purchase' ? 'GRANT' : 'GRANT', amount: input.amount, reason: input.reason.slice(0, 200), source: input.source, requestId: input.requestId ?? null, expiresAt: input.expiresAt ?? null, actorUserId: input.actorId, createdAt: d.now() })
  await d.audit({ actorId: input.actorId, action: 'referral.credits.grant', entityType: 'referral_credit', entityId: input.userId, after: { amount: input.amount, reason: input.reason, source: input.source } })
}

async function reserveCredit(d: Deps, userId: string, requestId: string): Promise<void> {
  const rows = await ledgerRows(d.db, userId)
  if (reservationOutstanding(rows as LedgerRow[], requestId) > 0) return
  const balance = creditBalance(rows as LedgerRow[])
  if (balance.available < 1) throw new ValidationError('No referral credit available. Credits come with your plan each month or from JobAppy support.', 'credits')
  await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId, type: 'RESERVE', amount: 1, reason: 'Reserved for a referral request', source: 'system', requestId, reservationId: requestId, createdAt: d.now() })
}

async function settleReservation(d: Deps, userId: string, requestId: string, outcome: 'CONSUME' | 'RELEASE', reason: string): Promise<boolean> {
  const rows = await ledgerRows(d.db, userId)
  const outstanding = reservationOutstanding(rows as LedgerRow[], requestId)
  if (outstanding <= 0) return false
  await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId, type: outcome, amount: outstanding, reason, source: 'system', requestId, reservationId: requestId, createdAt: d.now() })
  return true
}

// ---------------------------------------------------------------------------
// Requests: state changes
// ---------------------------------------------------------------------------

type RequestRow = typeof schema.referralRequests.$inferSelect
type AssignmentRow = typeof schema.referralAssignments.$inferSelect
type ReferrerRow = typeof schema.referrerProfiles.$inferSelect

async function loadRequest(db: ReferralsDb, id: string): Promise<RequestRow | null> {
  const rows = await db.select().from(schema.referralRequests).where(eq(schema.referralRequests.id, id)).limit(1)
  return rows[0] ?? null
}

async function transition(d: Deps, request: RequestRow, to: RequestStatus, actor: { role: 'learner' | 'referrer' | 'admin' | 'system'; userId: string | null }, opts: { reason?: string | null; meta?: Record<string, unknown>; patch?: Partial<RequestRow> } = {}): Promise<RequestRow> {
  const from = request.status as RequestStatus
  assertTransition(from, to)
  const now = d.now()
  const patch: Partial<RequestRow> = { ...opts.patch, status: to, lastEventAt: now, updatedAt: now }
  if (isTerminal(to)) {
    patch.closedAt = now
    if (opts.reason) patch.closedReason = opts.reason
  }
  await d.db.update(schema.referralRequests).set(patch).where(eq(schema.referralRequests.id, request.id))
  await d.db.insert(schema.referralStatusEvents).values({ id: randomUUID(), requestId: request.id, fromStatus: from, toStatus: to, actorRole: actor.role, actorUserId: actor.userId, reason: opts.reason ?? null, meta: opts.meta ?? null, createdAt: now })
  return { ...request, ...patch }
}

async function closeRequest(d: Deps, request: RequestRow, reason: CloseReason, actor: { role: 'learner' | 'referrer' | 'admin' | 'system'; userId: string | null }, target: 'CLOSED' | 'CANCELLED' | 'EXPIRED' = 'CLOSED'): Promise<RequestRow> {
  // Any live assignment ends with the request.
  await d.db.update(schema.referralAssignments).set({ status: 'CANCELLED', respondedAt: d.now() }).where(and(eq(schema.referralAssignments.requestId, request.id), inArray(schema.referralAssignments.status, ['PENDING', 'CLARIFICATION', 'ACCEPTED'])))
  const next = await transition(d, request, target, actor, { reason, patch: { currentAssignmentId: null } })
  if (CREDIT_RELEASING_REASONS.includes(reason)) await settleReservation(d, request.userId, request.id, 'RELEASE', `Credit returned: ${reason.replace(/_/g, ' ')}`)
  const learner = await d.db.select({ email: schema.users.email }).from(schema.users).where(eq(schema.users.id, request.userId)).limit(1)
  await d.notify(request.userId, learner[0]?.email ?? null, 'referral.closed', { company: request.companyName, role: request.jobTitle, reason })
  return next
}

// ---------------------------------------------------------------------------
// Learner: availability, readiness, submit
// ---------------------------------------------------------------------------

export interface JobReferralAvailability {
  /** What the job page shows before a request exists. */
  state: 'unavailable' | 'available' | 'network_disabled'
  message: string
  /** True only when at least one verified, available referrer with capacity exists for this company and the policy allows the workflow. */
  available: boolean
}

async function referrerPool(db: ReferralsDb, companyId: string, now: Date): Promise<MatchReferrer[]> {
  const referrers = await db.select().from(schema.referrerProfiles).where(and(eq(schema.referrerProfiles.companyId, companyId), isNull(schema.referrerProfiles.deletedAt)))
  if (!referrers.length) return []
  const ids = referrers.map((r) => r.id)
  const assignments = await db.select().from(schema.referralAssignments).where(inArray(schema.referralAssignments.referrerId, ids))
  const start = monthStart(now)
  return referrers.map<MatchReferrer>((r) => {
    const mine = assignments.filter((a) => a.referrerId === r.id)
    const active = mine.filter((a) => ['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(a.status)).length
    const monthly = mine.filter((a) => a.assignedAt >= start).length
    const answered = mine.filter((a) => ['ACCEPTED', 'DECLINED', 'SUBMITTED'].includes(a.status)).length
    const timedOut = mine.filter((a) => a.status === 'EXPIRED').length
    const last = mine.reduce<Date | null>((m, a) => (!m || a.assignedAt > m ? a.assignedAt : m), null)
    return {
      id: r.id,
      publicId: r.publicId,
      companyId: r.companyId,
      verificationStatus: r.verificationStatus,
      verificationExpiresAt: r.verificationExpiresAt,
      availability: r.availability,
      roleFamilies: r.roleFamilies ?? [],
      supportedLocations: r.supportedLocations ?? [],
      maxActiveRequests: r.maxActiveRequests,
      maxMonthlyRequests: r.maxMonthlyRequests,
      activeAssignments: active,
      monthlyAssignments: monthly,
      lastAssignedAt: last,
      responseRate: answered + timedOut ? answered / (answered + timedOut) : null,
      seenRequestIds: mine.filter((a) => ['DECLINED', 'EXPIRED', 'CANCELLED'].includes(a.status)).map((a) => a.requestId),
      declinedUserIds: [],
    }
  })
}

/** Referrers who declined a given learner before (loaded separately so the pool query stays cheap). */
async function declinedUserIdsFor(db: ReferralsDb, referrerIds: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>()
  if (!referrerIds.length) return out
  const rows = await db
    .select({ referrerId: schema.referralAssignments.referrerId, userId: schema.referralRequests.userId })
    .from(schema.referralAssignments)
    .innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralAssignments.requestId))
    .where(and(inArray(schema.referralAssignments.referrerId, referrerIds), eq(schema.referralAssignments.status, 'DECLINED')))
  for (const r of rows) if (r.referrerId) out.set(r.referrerId, [...(out.get(r.referrerId) ?? []), r.userId])
  return out
}

export async function jobReferralAvailability(deps: ReferralDeps, job: { companyId: string; roleCategory: string; locationCity: string | null; locationCountry: string | null; region: string; workMode: string }): Promise<JobReferralAvailability> {
  const d = withDefaults(deps)
  const settings = await getReferralSettings(d.db)
  if (settings.mode === 'disabled') return { state: 'network_disabled', message: 'Referral assistance is not available right now.', available: false }
  const policy = await getCompanyPolicy(d.db, job.companyId)
  const now = d.now()
  const pool = await referrerPool(d.db, job.companyId, now)
  const decision = matchReferrer({ requestId: '__probe__', learnerUserId: '__probe__', job, referrers: pool, policy, allowUnknownPolicy: settings.allowUnknownPolicy, now })
  if (decision.chosen) return { state: 'available', message: 'Verified referrers at this company can review a request for this role.', available: true }
  return { state: 'unavailable', message: 'Referral assistance is unavailable for this company right now: no verified referrer with capacity, or the company policy does not allow it yet.', available: false }
}

export interface ReadinessContext {
  userId: string
  jobId: string
  resumeId?: string | null
  /** Set by the client from the tracker document; also checked against the synced career state. */
  alreadyApplied?: boolean
  preparationStarted?: boolean
}

async function currentResumeId(db: ReferralsDb, userId: string, resumeId?: string | null): Promise<string | null> {
  if (resumeId) {
    const rows = await db.select({ id: schema.resumes.id }).from(schema.resumes).where(and(eq(schema.resumes.id, resumeId), eq(schema.resumes.userId, userId))).limit(1)
    return rows[0]?.id ?? null
  }
  const rows = await db.select({ id: schema.resumes.id }).from(schema.resumes).where(eq(schema.resumes.userId, userId)).orderBy(desc(schema.resumes.isCurrent), desc(schema.resumes.updatedAt)).limit(1)
  return rows[0]?.id ?? null
}

async function trackerShowsApplication(db: ReferralsDb, userId: string, jobId: string, applyUrl: string | null): Promise<boolean> {
  const rows = await db.select({ payload: schema.careerState.payload }).from(schema.careerState).where(eq(schema.careerState.userId, userId)).limit(1)
  const apps = (rows[0]?.payload as { applications?: { jobUrl?: string; status?: string; jobRef?: { jobId?: string } | null }[] } | undefined)?.applications ?? []
  return apps.some((a) => (a.jobRef?.jobId === jobId || (applyUrl && a.jobUrl === applyUrl)) && a.status && a.status !== 'Wishlist')
}

/** Runs the readiness review and stores it on the learner's draft request for the job (creating the draft when needed). */
export async function runReadiness(deps: ReferralDeps, ctx: ReadinessContext): Promise<{ request: LearnerRequestDto; report: ReadinessReport }> {
  const d = withDefaults(deps)
  const now = d.now()
  const jobRows = await d.db.select().from(schema.jobs).where(eq(schema.jobs.id, ctx.jobId)).limit(1)
  const job = jobRows[0] ?? null
  if (!job) throw new ValidationError('Job not found', 'jobId')
  const company = (await d.db.select({ name: schema.companies.name }).from(schema.companies).where(eq(schema.companies.id, job.companyId)).limit(1))[0]
  const resumeId = await currentResumeId(d.db, ctx.userId, ctx.resumeId)
  const profileRow = resumeId ? (await d.db.select({ profile: schema.resumeProfiles.profile }).from(schema.resumeProfiles).where(eq(schema.resumeProfiles.resumeId, resumeId)).limit(1))[0] : null
  const analysisRow = resumeId ? (await d.db.select({ report: schema.resumeAnalyses.report }).from(schema.resumeAnalyses).where(and(eq(schema.resumeAnalyses.userId, ctx.userId), eq(schema.resumeAnalyses.jobId, ctx.jobId), eq(schema.resumeAnalyses.resumeId, resumeId))).orderBy(desc(schema.resumeAnalyses.createdAt)).limit(1))[0] : null
  const analysis = (analysisRow?.report as ResumeAnalysisReport | undefined) ?? null
  const preparation = (await d.db.select({ id: schema.jobPreparations.id }).from(schema.jobPreparations).where(and(eq(schema.jobPreparations.userId, ctx.userId), eq(schema.jobPreparations.jobId, ctx.jobId))).limit(1))[0]
  const existing = await d.db.select().from(schema.referralRequests).where(and(eq(schema.referralRequests.userId, ctx.userId), eq(schema.referralRequests.jobId, ctx.jobId)))
  const openOther = existing.find((r) => isOpen(r.status as RequestStatus))
  const draft = existing.find((r) => ['DRAFT', 'READINESS_REQUIRED', 'READY'].includes(r.status))
  const policy = await getCompanyPolicy(d.db, job.companyId)
  const alreadyApplied = Boolean(ctx.alreadyApplied) || (await trackerShowsApplication(d.db, ctx.userId, ctx.jobId, job.applyUrl))
  const report = evaluateReadiness({
    job: { status: job.status as 'draft' | 'published' | 'expired' | 'archived', expiresAt: iso(job.expiresAt), requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills, title: job.title },
    profile: (profileRow?.profile as ResumeProfile | undefined) ?? null,
    analysis,
    curriculumGaps: (analysis?.curriculumGaps ?? []).map((g) => (typeof g === 'string' ? g : ((g as { trackTitle?: string; title?: string }).trackTitle ?? (g as { title?: string }).title ?? ''))).filter(Boolean),
    preparationStarted: Boolean(preparation) || Boolean(ctx.preparationStarted),
    duplicateRequest: Boolean(openOther),
    alreadyApplied,
    alreadyAppliedRestricted: policy.alreadyAppliedRestricted,
    now,
  })
  const status: RequestStatus = report.status === 'READY' ? 'READY' : 'READINESS_REQUIRED'
  let request: RequestRow
  if (draft) {
    request = await transition(d, draft, status, { role: 'learner', userId: ctx.userId }, { reason: report.status, patch: { readiness: report as unknown as Record<string, unknown>, readinessStatus: report.status, resumeId } })
  } else {
    const row: typeof schema.referralRequests.$inferInsert = { id: randomUUID(), userId: ctx.userId, jobId: job.id, companyId: job.companyId, jobTitle: job.title, companyName: company?.name ?? 'Company', resumeId, status: 'DRAFT', readiness: report as unknown as Record<string, unknown>, readinessStatus: report.status, createdAt: now, updatedAt: now, lastEventAt: now }
    await d.db.insert(schema.referralRequests).values(row)
    const created = (await loadRequest(d.db, row.id))!
    request = await transition(d, created, status, { role: 'learner', userId: ctx.userId }, { reason: report.status })
  }
  return { request: await learnerRequestDto(d, request), report }
}

export interface SubmitInput {
  userId: string
  email: string | null
  requestId: string
  introduction: string
  whyRole: string
  relevantExperience: string
  consent: boolean
  limits: { monthly: number; active: number }
  requireCredits?: boolean
}

const clean = (s: unknown, max: number) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max)

export async function submitRequest(deps: ReferralDeps, input: SubmitInput): Promise<LearnerRequestDto> {
  const d = withDefaults(deps)
  const now = d.now()
  const request = await loadRequest(d.db, input.requestId)
  if (!request || request.userId !== input.userId) throw new ValidationError('Request not found', 'requestId')
  if (request.status !== 'READY') throw new ValidationError(request.status === 'READINESS_REQUIRED' ? 'Run the readiness check and clear the blocking items first.' : 'This request cannot be submitted from its current state.', 'status')
  if (!input.consent) throw new ValidationError('Consent to share your approved resume and introduction with a matched referrer is required.', 'consent')
  const introduction = clean(input.introduction, 600)
  const whyRole = clean(input.whyRole, 800)
  const relevantExperience = clean(input.relevantExperience, 1200)
  if (whyRole.length < 20) throw new ValidationError('Tell the referrer in a sentence or two why this role.', 'whyRole')
  const checkedAt = new Date(String((request.readiness as { checkedAt?: string } | null)?.checkedAt ?? 0))
  if (request.readinessStatus !== 'READY' || now.getTime() - checkedAt.getTime() > 24 * 36e5) throw new ValidationError('The readiness check is older than a day; run it again before submitting.', 'readiness')
  const settings = await getReferralSettings(d.db)
  if (settings.mode === 'disabled') throw new ValidationError('Referral assistance is switched off right now.', 'status')
  const mine = await d.db.select().from(schema.referralRequests).where(eq(schema.referralRequests.userId, input.userId))
  const open = mine.filter((r) => isOpen(r.status as RequestStatus)).length
  if (open >= input.limits.active) throw new ValidationError(`Your plan allows ${input.limits.active} open referral request${input.limits.active === 1 ? '' : 's'} at a time.`, 'limit')
  const thisMonth = mine.filter((r) => r.submittedAt && r.submittedAt >= monthStart(now)).length
  if (thisMonth >= input.limits.monthly) throw new ValidationError(`Your plan allows ${input.limits.monthly} referral request${input.limits.monthly === 1 ? '' : 's'} per month.`, 'limit')
  if (mine.some((r) => r.id !== request.id && r.jobId === request.jobId && isOpen(r.status as RequestStatus))) throw new ValidationError('You already have an open request for this job.', 'duplicate')
  if (input.requireCredits ?? settings.requireCredits) await reserveCredit(d, input.userId, request.id)
  let current = await transition(d, request, 'SUBMITTED', { role: 'learner', userId: input.userId }, { patch: { introduction, whyRole, relevantExperience, consentAt: now, submittedAt: now, creditReservationId: request.id } })
  await d.notify(input.userId, input.email, 'referral.request_received', { company: request.companyName, role: request.jobTitle })
  current = await transition(d, current, 'SCREENING', { role: 'system', userId: null })
  // Screening: the job must still be live and the company must take requests.
  const job = request.jobId ? (await d.db.select().from(schema.jobs).where(eq(schema.jobs.id, request.jobId)).limit(1))[0] : null
  if (!job || job.status !== 'published' || (job.expiresAt && job.expiresAt <= now)) return learnerRequestDto(d, await closeRequest(d, current, 'job_expired', { role: 'system', userId: null }))
  const policy = await getCompanyPolicy(d.db, request.companyId)
  if (!policy.referralsEnabled || policy.policyStatus === 'REFERRALS_DISABLED' || (policy.policyStatus === 'UNKNOWN' && !settings.allowUnknownPolicy)) return learnerRequestDto(d, await closeRequest(d, current, 'company_referrals_disabled', { role: 'system', userId: null }))
  current = await transition(d, current, 'MATCHING', { role: 'system', userId: null })
  current = await runMatching(d, current, settings, { role: 'system', userId: null })
  return learnerRequestDto(d, current)
}

/** Picks the next eligible referrer fairly and assigns, or closes honestly when nobody can take the request. */
async function runMatching(d: Deps, request: RequestRow, settings: ReferralSettings, actor: { role: 'system' | 'admin'; userId: string | null }, forcedReferrerId?: string): Promise<RequestRow> {
  const now = d.now()
  if (request.status !== 'MATCHING') throw new Error(`matching needs MATCHING, got ${request.status}`)
  if (request.attempts >= settings.maxAttempts && !forcedReferrerId) return closeRequest(d, request, 'attempts_exhausted', actor)
  const job = request.jobId ? (await d.db.select().from(schema.jobs).where(eq(schema.jobs.id, request.jobId)).limit(1))[0] : null
  if (!job) return closeRequest(d, request, 'job_expired', actor)
  const policy = await getCompanyPolicy(d.db, request.companyId)
  const pool = await referrerPool(d.db, request.companyId, now)
  const declined = await declinedUserIdsFor(d.db, pool.map((p) => p.id))
  for (const p of pool) p.declinedUserIds = declined.get(p.id) ?? []
  let chosen: MatchReferrer | null
  if (forcedReferrerId) {
    chosen = pool.find((p) => p.id === forcedReferrerId && p.verificationStatus === 'VERIFIED') ?? null
    if (!chosen) throw new ValidationError('That referrer is not verified at this company', 'referrerId')
  } else {
    const decision = matchReferrer({ requestId: request.id, learnerUserId: request.userId, job: { companyId: job.companyId, roleCategory: job.roleCategory, locationCity: job.locationCity, locationCountry: job.locationCountry, region: job.region, workMode: job.workMode }, referrers: pool, policy, allowUnknownPolicy: settings.allowUnknownPolicy, now })
    if (!decision.chosen) {
      const reason: CloseReason = decision.blockedReason === 'policy_disabled' || decision.blockedReason === 'policy_unknown' ? 'company_referrals_disabled' : 'no_referrer_available'
      if (decision.blockedReason === 'manual_review') {
        // Stays in MATCHING for an admin to assign by hand; nothing is promised to the learner beyond "matching".
        await d.db.insert(schema.referralStatusEvents).values({ id: randomUUID(), requestId: request.id, fromStatus: 'MATCHING', toStatus: 'MATCHING', actorRole: 'system', actorUserId: null, reason: 'manual_review_required', createdAt: now })
        return request
      }
      return closeRequest(d, request, reason, actor)
    }
    chosen = decision.chosen
  }
  const assignment: typeof schema.referralAssignments.$inferInsert = { id: randomUUID(), requestId: request.id, referrerId: chosen.id, referrerPublicId: chosen.publicId, status: 'PENDING', assignedBy: actor.role === 'admin' ? 'admin' : 'system', assignedAt: now, expiresAt: new Date(now.getTime() + settings.assignmentTtlHours * 36e5), createdAt: now }
  await d.db.insert(schema.referralAssignments).values(assignment)
  const next = await transition(d, request, 'ASSIGNED', actor, { patch: { currentAssignmentId: assignment.id, attempts: request.attempts + 1 }, meta: { assignmentId: assignment.id } })
  const referrer = (await d.db.select({ userId: schema.referrerProfiles.userId, email: schema.referrerProfiles.contactEmail }).from(schema.referrerProfiles).leftJoin(schema.users, eq(schema.users.id, schema.referrerProfiles.userId)).where(eq(schema.referrerProfiles.id, chosen.id)).limit(1))[0]
  if (referrer?.userId) await d.notify(referrer.userId, referrer.email ?? null, 'referral.assigned', { company: request.companyName, role: request.jobTitle, hours: settings.assignmentTtlHours })
  return next
}

export async function cancelRequest(deps: ReferralDeps, userId: string, requestId: string): Promise<LearnerRequestDto> {
  const d = withDefaults(deps)
  const request = await loadRequest(d.db, requestId)
  if (!request || request.userId !== userId) throw new ValidationError('Request not found', 'requestId')
  if (!LEARNER_CANCELLABLE.includes(request.status as RequestStatus)) throw new ValidationError('This request can no longer be cancelled.', 'status')
  return learnerRequestDto(d, await closeRequest(d, request, 'learner_cancelled', { role: 'learner', userId }, 'CANCELLED'))
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

const MESSAGE_MAX = 1500
function cleanMessage(body: unknown): string {
  const text = String(body ?? '')
    .replace(/<(script|style|iframe|object)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '')
    .split('')
    .filter((ch) => {
      const c = ch.charCodeAt(0)
      return c >= 32 || c === 9 || c === 10 || c === 13
    })
    .join('')
    .trim()
  if (text.length < 2) throw new ValidationError('Write a message first.', 'body')
  if (text.length > MESSAGE_MAX) throw new ValidationError(`Messages are limited to ${MESSAGE_MAX} characters.`, 'body')
  if (/https?:\/\/\S+@|\b\d{10,}\b/.test(text)) throw new ValidationError('Please keep phone numbers and credentials out of messages; everything runs through JobAppy.', 'body')
  return text
}

async function addMessage(d: Deps, request: RequestRow, sender: { role: 'learner' | 'referrer' | 'admin' | 'system'; userId: string | null }, body: string): Promise<void> {
  const recent = await d.db.select({ n: sql<number>`count(*)::int` }).from(schema.referralMessages).where(and(eq(schema.referralMessages.requestId, request.id), gte(schema.referralMessages.createdAt, new Date(d.now().getTime() - 24 * 36e5)), sender.userId ? eq(schema.referralMessages.senderUserId, sender.userId) : sql`true`))
  if ((recent[0]?.n ?? 0) >= 20) throw new ValidationError('Message limit reached for today on this request.', 'body')
  await d.db.insert(schema.referralMessages).values({ id: randomUUID(), requestId: request.id, assignmentId: request.currentAssignmentId, senderRole: sender.role, senderUserId: sender.userId, body, createdAt: d.now() })
  await d.db.update(schema.referralRequests).set({ lastEventAt: d.now(), updatedAt: d.now() }).where(eq(schema.referralRequests.id, request.id))
}

export async function learnerMessage(deps: ReferralDeps, userId: string, requestId: string, body: unknown): Promise<LearnerRequestDto> {
  const d = withDefaults(deps)
  const request = await loadRequest(d.db, requestId)
  if (!request || request.userId !== userId) throw new ValidationError('Request not found', 'requestId')
  if (!['CLARIFICATION_REQUESTED', 'ASSIGNED', 'REFERRER_REVIEW', 'ACCEPTED', 'REFERRAL_PENDING'].includes(request.status)) throw new ValidationError('Messages are open while a referrer is reviewing or has accepted your request.', 'status')
  await addMessage(d, request, { role: 'learner', userId }, cleanMessage(body))
  let current = request
  if (request.status === 'CLARIFICATION_REQUESTED') {
    current = await transition(d, request, 'REFERRER_REVIEW', { role: 'learner', userId }, { reason: 'learner_replied' })
    await d.db.update(schema.referralAssignments).set({ status: 'PENDING' }).where(and(eq(schema.referralAssignments.id, request.currentAssignmentId ?? ''), eq(schema.referralAssignments.status, 'CLARIFICATION')))
    const referrer = await assignedReferrerContact(d.db, request.currentAssignmentId)
    if (referrer) await d.notify(referrer.userId, referrer.email, 'referral.learner_replied', { company: request.companyName, role: request.jobTitle })
  }
  return learnerRequestDto(d, current)
}

async function assignedReferrerContact(db: ReferralsDb, assignmentId: string | null): Promise<{ userId: string; email: string | null } | null> {
  if (!assignmentId) return null
  const rows = await db
    .select({ userId: schema.referrerProfiles.userId, email: schema.referrerProfiles.contactEmail })
    .from(schema.referralAssignments)
    .innerJoin(schema.referrerProfiles, eq(schema.referrerProfiles.id, schema.referralAssignments.referrerId))
    .leftJoin(schema.users, eq(schema.users.id, schema.referrerProfiles.userId))
    .where(eq(schema.referralAssignments.id, assignmentId))
    .limit(1)
  return rows[0]?.userId ? { userId: rows[0].userId, email: rows[0].email ?? null } : null
}

// ---------------------------------------------------------------------------
// Learner projections (no referrer identity, no assignment mechanics)
// ---------------------------------------------------------------------------

export interface LearnerRequestDto {
  id: string
  jobId: string | null
  jobTitle: string
  companyId: string
  companyName: string
  status: RequestStatus
  stage: LearnerStage
  readiness: ReadinessReport | null
  introduction: string | null
  whyRole: string | null
  relevantExperience: string | null
  consentAt: string | null
  submittedAt: string | null
  referralSubmittedAt: string | null
  closedReason: string | null
  applicationId: string | null
  referrer: ReferrerPublicProfile | null
  /** Identity fields the referrer chose to share, if any (never automatic). */
  disclosed: { fields: string[]; values: Record<string, string>; at: string } | null
  messages: { id: string; from: 'you' | 'referrer' | 'jobappy'; body: string; at: string }[]
  timeline: { stage: LearnerStage; at: string }[]
  nextAction: string
  lastEventAt: string
  createdAt: string
}

const LEARNER_VISIBLE_EVENT_STAGES: LearnerStage[] = ['submitted', 'matching', 'referrer_review', 'needs_your_reply', 'accepted', 'referral_submitted', 'closed', 'cancelled', 'expired']

function nextActionFor(status: RequestStatus, readiness: ReadinessReport | null): string {
  switch (learnerStage(status)) {
    case 'draft':
    case 'readiness':
      return readiness?.status === 'READY' ? 'Submit your request.' : 'Complete the readiness items, then run the check again.'
    case 'ready':
      return 'Review the introduction and submit.'
    case 'submitted':
      return 'JobAppy is screening the request.'
    case 'matching':
      return 'Matching you with a verified employee. Nothing to do yet.'
    case 'referrer_review':
      return 'A verified referrer is reviewing your request.'
    case 'needs_your_reply':
      return 'The referrer asked a question; reply in the thread.'
    case 'accepted':
      return 'Accepted. The referrer submits through their employer process; you will be told when it is done.'
    case 'referral_submitted':
      return 'Referral submitted by a verified referrer. Keep preparing: a referral is not an interview.'
    default:
      return 'No further action.'
  }
}

async function learnerRequestDto(d: Deps, request: RequestRow): Promise<LearnerRequestDto> {
  const events = await d.db.select().from(schema.referralStatusEvents).where(eq(schema.referralStatusEvents.requestId, request.id)).orderBy(asc(schema.referralStatusEvents.createdAt))
  const messages = await d.db.select().from(schema.referralMessages).where(eq(schema.referralMessages.requestId, request.id)).orderBy(asc(schema.referralMessages.createdAt))
  let referrer: ReferrerPublicProfile | null = null
  let disclosed: LearnerRequestDto['disclosed'] = null
  if (request.currentAssignmentId && ['ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED', 'ACCEPTED', 'REFERRAL_PENDING', 'REFERRAL_SUBMITTED', 'REFERRAL_CONFIRMED'].includes(request.status)) {
    const rows = await d.db
      .select({ r: schema.referrerProfiles, company: schema.companies.name })
      .from(schema.referralAssignments)
      .innerJoin(schema.referrerProfiles, eq(schema.referrerProfiles.id, schema.referralAssignments.referrerId))
      .innerJoin(schema.companies, eq(schema.companies.id, schema.referrerProfiles.companyId))
      .where(eq(schema.referralAssignments.id, request.currentAssignmentId))
      .limit(1)
    const row = rows[0]
    if (row) {
      const pool = await d.db.select({ n: sql<number>`count(*)::int` }).from(schema.referrerProfiles).where(and(eq(schema.referrerProfiles.companyId, row.r.companyId), eq(schema.referrerProfiles.verificationStatus, 'VERIFIED'), isNull(schema.referrerProfiles.deletedAt)))
      referrer = toPublicProfile(row.r, row.company, pool[0]?.n ?? 0)
      const discl = await d.db.select().from(schema.referralIdentityDisclosures).where(and(eq(schema.referralIdentityDisclosures.requestId, request.id), eq(schema.referralIdentityDisclosures.assignmentId, request.currentAssignmentId))).orderBy(desc(schema.referralIdentityDisclosures.createdAt)).limit(1)
      if (discl[0]) {
        const values: Record<string, string> = {}
        for (const f of discl[0].fields) {
          if (f === 'fullName') values.fullName = row.r.fullName
          if (f === 'profileUrl' && row.r.profileUrl) values.profileUrl = row.r.profileUrl
          if (f === 'title' && row.r.title) values.title = row.r.title
        }
        disclosed = { fields: discl[0].fields, values, at: discl[0].createdAt.toISOString() }
      }
    }
  }
  const timeline: { stage: LearnerStage; at: string }[] = []
  for (const e of events) {
    const stage = learnerStage(e.toStatus as RequestStatus)
    if (!LEARNER_VISIBLE_EVENT_STAGES.includes(stage)) continue
    if (timeline.length && timeline[timeline.length - 1].stage === stage) continue
    timeline.push({ stage, at: e.createdAt.toISOString() })
  }
  return {
    id: request.id,
    jobId: request.jobId,
    jobTitle: request.jobTitle,
    companyId: request.companyId,
    companyName: request.companyName,
    status: request.status as RequestStatus,
    stage: learnerStage(request.status as RequestStatus),
    readiness: (request.readiness as unknown as ReadinessReport | null) ?? null,
    introduction: request.introduction,
    whyRole: request.whyRole,
    relevantExperience: request.relevantExperience,
    consentAt: iso(request.consentAt),
    submittedAt: iso(request.submittedAt),
    referralSubmittedAt: iso(request.referralSubmittedAt),
    closedReason: request.closedReason,
    applicationId: request.applicationId,
    referrer,
    disclosed,
    messages: messages.map((m) => ({ id: m.id, from: m.senderRole === 'learner' ? 'you' : m.senderRole === 'referrer' ? 'referrer' : 'jobappy', body: m.body, at: m.createdAt.toISOString() })),
    timeline,
    nextAction: nextActionFor(request.status as RequestStatus, (request.readiness as unknown as ReadinessReport | null) ?? null),
    lastEventAt: request.lastEventAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
  }
}

export async function getLearnerRequest(deps: ReferralDeps, userId: string, requestId: string): Promise<LearnerRequestDto | null> {
  const d = withDefaults(deps)
  const request = await loadRequest(d.db, requestId)
  if (!request || request.userId !== userId) return null
  return learnerRequestDto(d, request)
}

export async function listLearnerRequests(deps: ReferralDeps, userId: string): Promise<LearnerRequestDto[]> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referralRequests).where(eq(schema.referralRequests.userId, userId)).orderBy(desc(schema.referralRequests.lastEventAt))
  const out: LearnerRequestDto[] = []
  for (const r of rows) out.push(await learnerRequestDto(d, r))
  return out
}

export async function learnerRequestForJob(deps: ReferralDeps, userId: string, jobId: string): Promise<LearnerRequestDto | null> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referralRequests).where(and(eq(schema.referralRequests.userId, userId), eq(schema.referralRequests.jobId, jobId))).orderBy(desc(schema.referralRequests.createdAt))
  const live = rows.find((r) => !isTerminal(r.status as RequestStatus)) ?? rows[0]
  return live ? learnerRequestDto(d, live) : null
}

export async function linkApplication(deps: ReferralDeps, userId: string, requestId: string, applicationId: string): Promise<void> {
  const d = withDefaults(deps)
  const request = await loadRequest(d.db, requestId)
  if (!request || request.userId !== userId) throw new ValidationError('Request not found', 'requestId')
  await d.db.update(schema.referralRequests).set({ applicationId: applicationId.slice(0, 80), updatedAt: d.now() }).where(eq(schema.referralRequests.id, requestId))
}

// ---------------------------------------------------------------------------
// Referrers: invites, onboarding, verification, availability
// ---------------------------------------------------------------------------

export interface ReferrerSelfDto {
  id: string
  publicId: string
  companyId: string
  companyName: string
  fullName: string
  corporateEmail: string | null
  contactEmail: string | null
  contactEmailVerifiedAt: string | null
  title: string | null
  roleFamilies: string[]
  department: string | null
  location: string | null
  supportedLocations: string[]
  profileUrl: string | null
  profileUrlShareable: boolean
  experienceBand: string | null
  availability: 'available' | 'paused'
  maxActiveRequests: number
  maxMonthlyRequests: number
  verificationStatus: schema.ReferrerVerificationStatus
  verifiedAt: string | null
  verificationExpiresAt: string | null
  emailVerificationPending: boolean
  policyAcknowledgedAt: string | null
  privacyConsentAt: string | null
  onboardingCompletedAt: string | null
  /** True once the referrer may receive assignments. */
  active: boolean
}

function referrerActive(r: ReferrerRow, now: Date): boolean {
  return r.verificationStatus === 'VERIFIED' && (!r.verificationExpiresAt || r.verificationExpiresAt > now) && !r.deletedAt && Boolean(r.onboardingCompletedAt)
}

async function referrerSelfDto(d: Deps, r: ReferrerRow): Promise<ReferrerSelfDto> {
  const company = (await d.db.select({ name: schema.companies.name }).from(schema.companies).where(eq(schema.companies.id, r.companyId)).limit(1))[0]
  const pending = await d.db.select({ id: schema.referrerVerifications.id }).from(schema.referrerVerifications).where(and(eq(schema.referrerVerifications.referrerId, r.id), eq(schema.referrerVerifications.method, 'personal_email'), eq(schema.referrerVerifications.status, 'pending'), gte(schema.referrerVerifications.tokenExpiresAt, d.now()))).limit(1)
  return {
    id: r.id,
    publicId: r.publicId,
    companyId: r.companyId,
    companyName: company?.name ?? 'Company',
    fullName: r.fullName,
    corporateEmail: r.corporateEmail,
    contactEmail: r.contactEmail,
    contactEmailVerifiedAt: iso(r.contactEmailVerifiedAt),
    title: r.title,
    roleFamilies: r.roleFamilies ?? [],
    department: r.department,
    location: r.location,
    supportedLocations: r.supportedLocations ?? [],
    profileUrl: r.profileUrl,
    profileUrlShareable: r.profileUrlShareable,
    experienceBand: r.experienceBand,
    availability: r.availability === 'available' ? 'available' : 'paused',
    maxActiveRequests: r.maxActiveRequests,
    maxMonthlyRequests: r.maxMonthlyRequests,
    verificationStatus: r.verificationStatus,
    verifiedAt: iso(r.verifiedAt),
    verificationExpiresAt: iso(r.verificationExpiresAt),
    emailVerificationPending: pending.length > 0,
    policyAcknowledgedAt: iso(r.policyAcknowledgedAt),
    privacyConsentAt: iso(r.privacyConsentAt),
    onboardingCompletedAt: iso(r.onboardingCompletedAt),
    active: referrerActive(r, d.now()),
  }
}

export async function getReferrerByUser(deps: ReferralDeps, userId: string): Promise<ReferrerSelfDto | null> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.userId, userId)).limit(1)
  return rows[0] ? referrerSelfDto(d, rows[0]) : null
}

async function loadReferrerRow(db: ReferralsDb, userId: string): Promise<ReferrerRow> {
  const rows = await db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.userId, userId)).limit(1)
  if (!rows[0] || rows[0].deletedAt) throw new ValidationError('No referrer profile for this account', 'referrer')
  return rows[0]
}

export interface AdminInviteDto {
  id: string
  email: string
  companyName: string
  createdAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired'
}

/** Admin-only projection: never return token hashes or reusable invitation links. */
export async function adminListInvites(deps: ReferralDeps): Promise<AdminInviteDto[]> {
  const d = withDefaults(deps)
  const rows = await d.db.select({ invite: schema.referrerInvites, companyName: schema.companies.name })
    .from(schema.referrerInvites).innerJoin(schema.companies, eq(schema.companies.id, schema.referrerInvites.companyId))
    .orderBy(desc(schema.referrerInvites.createdAt)).limit(200)
  return rows.map(({ invite, companyName }) => ({ id: invite.id, email: invite.email, companyName,
    createdAt: invite.createdAt.toISOString(), expiresAt: invite.expiresAt.toISOString(),
    status: invite.acceptedAt ? 'accepted' : invite.expiresAt <= d.now() ? 'expired' : 'pending' }))
}

export async function createInvite(deps: ReferralDeps, input: { email: string; companyId: string; invitedBy: string; note?: string | null }): Promise<{ id: string; token: string; expiresAt: Date; emailStatus: 'sent' | 'skipped' | 'failed' | 'unknown' }> {
  const d = withDefaults(deps)
  if (typeof input.email !== 'string' || input.email.length > 254) throw new ValidationError('Enter a valid email', 'email')
  const email = input.email.trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ValidationError('Enter a valid email', 'email')
  const company = (await d.db.select({ id: schema.companies.id, name: schema.companies.name }).from(schema.companies).where(eq(schema.companies.id, input.companyId)).limit(1))[0]
  if (!company) throw new ValidationError('Unknown company', 'companyId')
  const token = newToken()
  const expiresAt = new Date(d.now().getTime() + 14 * 24 * 36e5)
  const id = randomUUID()
  await d.db.insert(schema.referrerInvites).values({ id, email, companyId: input.companyId, tokenHash: sha256(token), invitedBy: input.invitedBy, note: input.note?.slice(0, 300) ?? null, expiresAt, createdAt: d.now() })
  await d.audit({ actorId: input.invitedBy, action: 'referrer.invite', entityType: 'referrer_invite', entityId: id, after: { email, companyId: input.companyId } })
  const delivery = await d.notify(null, email, 'referrer.invite', { company: company.name, token, days: 14 })
  const emailStatus = delivery === 'sent' || delivery === 'skipped' || delivery === 'failed' ? delivery : 'unknown'
  return { id, token, expiresAt, emailStatus }
}

/** A signed-in user accepts an invite: the referrer profile shell is created and the role granted. */
export async function acceptInvite(deps: ReferralDeps, input: { token: string; userId: string; email: string }): Promise<ReferrerSelfDto> {
  const d = withDefaults(deps)
  const now = d.now()
  if (typeof input.token !== 'string' || input.token.length > 200) throw new ValidationError('Invalid invitation token', 'token')
  const accepted = await d.db.transaction(async (tx) => {
    // Serialize all invitation accepts for this account, including different links.
    const account = (await tx.select().from(schema.users).where(eq(schema.users.id, input.userId)).for('update'))[0]
    if (!account) throw new ValidationError('Sign in to accept your invitation', 'userId')
    const invite = (await tx.select().from(schema.referrerInvites).where(eq(schema.referrerInvites.tokenHash, sha256(input.token.trim()))).for('update'))[0]
    if (!invite || invite.acceptedAt || invite.expiresAt <= now) throw new ValidationError('This invitation link is invalid or has expired.', 'token')
    if (account.email?.trim().toLowerCase() !== invite.email) throw new ValidationError('Sign in with the email address that received this invitation. Ask the admin for a new invitation if you want to use a different address.', 'email')
    if ((await tx.select({ id: schema.referrerProfiles.id }).from(schema.referrerProfiles).where(eq(schema.referrerProfiles.userId, input.userId)))[0]) throw new ValidationError('This account already has a referrer profile.', 'referrer')
    const id = randomUUID()
    await tx.insert(schema.referrerProfiles).values({ id, userId: input.userId, publicId: newPublicId(), companyId: invite.companyId, fullName: '', contactEmail: invite.email, verificationStatus: 'PENDING', invitedBy: invite.invitedBy, createdAt: now, updatedAt: now })
    await tx.update(schema.referrerInvites).set({ acceptedAt: now, acceptedByUserId: input.userId }).where(eq(schema.referrerInvites.id, invite.id))
    await tx.insert(schema.userRoles).values({ userId: input.userId, role: 'referrer', grantedBy: invite.invitedBy ?? 'invite' }).onConflictDoNothing()
    return { id, inviteId: invite.id }
  })
  await d.audit({ actorId: input.userId, action: 'referrer.invite.accept', entityType: 'referrer', entityId: accepted.id, after: { inviteId: accepted.inviteId } })
  return referrerSelfDto(d, (await d.db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.id, accepted.id)))[0])
}

export interface OnboardingInput {
  fullName: string
  title: string
  roleFamilies: string[]
  department?: string
  location: string
  supportedLocations: string[]
  profileUrl?: string
  profileUrlShareable?: boolean
  experienceBand?: string
  maxActiveRequests?: number
  maxMonthlyRequests?: number
  policyAcknowledged: boolean
  privacyConsent: boolean
}

export async function completeOnboarding(deps: ReferralDeps, userId: string, input: OnboardingInput): Promise<ReferrerSelfDto> {
  const d = withDefaults(deps)
  const now = d.now()
  const r = await loadReferrerRow(d.db, userId)
  const fullName = clean(input.fullName, 120)
  if (fullName.length < 2) throw new ValidationError('Enter your name', 'fullName')
  const title = clean(input.title, 120)
  if (!title) throw new ValidationError('Enter your role or title', 'title')
  const roleFamilies = Array.from(new Set((input.roleFamilies ?? []).map((f) => String(f).trim().toLowerCase()).filter((f) => /^[a-z-]{2,40}$/.test(f)))).slice(0, 10)
  if (!roleFamilies.length) throw new ValidationError('Pick at least one role family you can refer', 'roleFamilies')
  const location = clean(input.location, 120)
  const supportedLocations = Array.from(new Set((input.supportedLocations ?? []).map((l) => clean(l, 60)).filter(Boolean))).slice(0, 12)
  if (!supportedLocations.length) throw new ValidationError('Pick at least one location you can support (or "any")', 'supportedLocations')
  if (!input.policyAcknowledged) throw new ValidationError('Acknowledge that you will follow your employer’s referral policy', 'policyAcknowledged')
  if (!input.privacyConsent) throw new ValidationError('Consent to the privacy terms to continue', 'privacyConsent')
  const profileUrl = input.profileUrl ? clean(input.profileUrl, 200) : null
  if (profileUrl && !/^https:\/\/[^\s]+$/.test(profileUrl)) throw new ValidationError('The profile link must start with https://', 'profileUrl')
  const band = ['junior', 'mid', 'senior', 'lead'].includes(String(input.experienceBand)) ? String(input.experienceBand) : null
  const capActive = Math.min(10, Math.max(1, Math.floor(Number(input.maxActiveRequests) || r.maxActiveRequests)))
  const capMonthly = Math.min(40, Math.max(1, Math.floor(Number(input.maxMonthlyRequests) || r.maxMonthlyRequests)))
  if (r.onboardingCompletedAt) throw new ValidationError('Your profile has already been submitted. Contact support to change employment details.', 'onboarding')
  const saved = await d.db
    .update(schema.referrerProfiles)
    .set({ fullName, title, roleFamilies, department: input.department ? clean(input.department, 80) : null, location, supportedLocations, profileUrl, profileUrlShareable: Boolean(input.profileUrlShareable) && Boolean(profileUrl), experienceBand: band, maxActiveRequests: capActive, maxMonthlyRequests: capMonthly, policyAcknowledgedAt: r.policyAcknowledgedAt ?? now, privacyConsentAt: r.privacyConsentAt ?? now, onboardingCompletedAt: r.onboardingCompletedAt ?? now, updatedAt: now })
    .where(and(eq(schema.referrerProfiles.id, r.id), isNull(schema.referrerProfiles.onboardingCompletedAt), isNull(schema.referrerProfiles.deletedAt))).returning()
  if (!saved.length) throw new ValidationError('Your profile has already been submitted. Contact support to change employment details.', 'onboarding')
  await d.audit({ actorId: userId, action: 'referrer.onboarding', entityType: 'referrer', entityId: r.id, after: { roleFamilies, supportedLocations } })
  return referrerSelfDto(d, saved[0])
}

export async function setAvailability(deps: ReferralDeps, userId: string, input: { availability?: 'available' | 'paused'; maxActiveRequests?: number; maxMonthlyRequests?: number; profileUrlShareable?: boolean }): Promise<ReferrerSelfDto> {
  const d = withDefaults(deps)
  const r = await loadReferrerRow(d.db, userId)
  const patch: Partial<ReferrerRow> = { updatedAt: d.now() }
  if (input.availability) patch.availability = input.availability === 'available' ? 'available' : 'paused'
  if (input.maxActiveRequests !== undefined) patch.maxActiveRequests = Math.min(10, Math.max(1, Math.floor(Number(input.maxActiveRequests) || 1)))
  if (input.maxMonthlyRequests !== undefined) patch.maxMonthlyRequests = Math.min(40, Math.max(1, Math.floor(Number(input.maxMonthlyRequests) || 1)))
  if (input.profileUrlShareable !== undefined) patch.profileUrlShareable = Boolean(input.profileUrlShareable) && Boolean(r.profileUrl)
  await d.db.update(schema.referrerProfiles).set(patch).where(eq(schema.referrerProfiles.id, r.id))
  return referrerSelfDto(d, (await d.db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.id, r.id)).limit(1))[0])
}

/** Confirm contact-mailbox ownership separately from admin-reviewed employment. */
export async function startContactVerification(deps: ReferralDeps, userId: string): Promise<{ sentTo: string; expiresAt: Date; emailStatus: 'sent' | 'skipped' | 'failed' | 'unknown' }> {
  const d = withDefaults(deps)
  const now = d.now()
  const token = newToken()
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000)
  const target = await d.db.transaction(async (tx) => {
    const r = (await tx.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.userId, userId)).for('update'))[0]
    if (!r || r.deletedAt || !r.contactEmail) throw new ValidationError('No contact email is available. Contact support.', 'email')
    if (r.contactEmailVerifiedAt) throw new ValidationError('Your personal email is already confirmed.', 'email')
    const recent = await tx.select().from(schema.referrerVerifications).where(and(eq(schema.referrerVerifications.referrerId, r.id), eq(schema.referrerVerifications.method, 'personal_email'), gte(schema.referrerVerifications.createdAt, new Date(now.getTime() - 24 * 36e5))))
    if (recent.length >= 3) throw new ValidationError('Three verification emails were requested in the last day; check your inbox or contact support.', 'rate')
    await tx.update(schema.referrerVerifications).set({ status: 'expired', tokenHash: null }).where(and(eq(schema.referrerVerifications.referrerId, r.id), eq(schema.referrerVerifications.method, 'personal_email'), eq(schema.referrerVerifications.status, 'pending')))
    const id = randomUUID()
    await tx.insert(schema.referrerVerifications).values({ id, referrerId: r.id, method: 'personal_email', evidenceRef: r.contactEmail, status: 'pending', tokenHash: sha256(token), tokenExpiresAt: expiresAt, createdAt: now })
    return { email: r.contactEmail, id }
  })
  const delivery = await d.notify(userId, target.email, 'referrer.verify_email', { token })
  const emailStatus = delivery === 'sent' || delivery === 'skipped' || delivery === 'failed' ? delivery : 'unknown'
  // Failed delivery must not leave an apparently usable verification attempt.
  if (emailStatus === 'failed' || emailStatus === 'skipped') await d.db.update(schema.referrerVerifications).set({ status: 'failed', tokenHash: null }).where(and(eq(schema.referrerVerifications.id, target.id), eq(schema.referrerVerifications.status, 'pending')))
  const [local, domain] = target.email.split('@')
  return { sentTo: `${local.slice(0, 2)}…@${domain}`, expiresAt, emailStatus }
}

export type ContactVerifyResult = 'verified' | 'invalid' | 'expired' | 'already'

/** Token possession confirms only its bound mailbox. Never promotes employment status. */
export async function confirmContactVerification(deps: ReferralDeps, token: string): Promise<ContactVerifyResult> {
  const d = withDefaults(deps)
  const now = d.now()
  if (typeof token !== 'string' || token.length > 200) return 'invalid'
  const result = await d.db.transaction(async (tx) => {
    const candidate = (await tx.select({ referrerId: schema.referrerVerifications.referrerId }).from(schema.referrerVerifications).where(eq(schema.referrerVerifications.tokenHash, sha256(token.trim()))))[0]
    if (!candidate) return { result: 'invalid' as const }
    // Same lock order as resend: profile first, then verification attempt.
    const r = (await tx.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.id, candidate.referrerId)).for('update'))[0]
    const v = (await tx.select().from(schema.referrerVerifications).where(eq(schema.referrerVerifications.tokenHash, sha256(token.trim()))).for('update'))[0]
    if (!v || !['personal_email', 'corporate_email'].includes(v.method) || v.status !== 'pending') return { result: 'invalid' as const }
    if (!v.tokenExpiresAt || v.tokenExpiresAt <= now) {
      await tx.update(schema.referrerVerifications).set({ status: 'expired', tokenHash: null }).where(eq(schema.referrerVerifications.id, v.id))
      return { result: 'expired' as const }
    }
    if (!r || r.deletedAt || (v.method === 'personal_email' && (!r.contactEmail || v.evidenceRef !== r.contactEmail))) return { result: 'invalid' as const }
    await tx.update(schema.referrerVerifications).set({ status: 'confirmed', confirmedAt: now, tokenHash: null }).where(eq(schema.referrerVerifications.id, v.id))
    if (v.method === 'personal_email') await tx.update(schema.referrerProfiles).set({ contactEmailVerifiedAt: now, updatedAt: now }).where(eq(schema.referrerProfiles.id, r.id))
    // Preserve old corporate links without treating them as personal-email confirmation.
    return { result: 'verified' as const, userId: r.userId, referrerId: r.id }
  })
  if (result.result === 'verified') await d.audit({ actorId: result.userId, action: 'referrer.email_confirmed', entityType: 'referrer', entityId: result.referrerId })
  return result.result
}

// ---------------------------------------------------------------------------
// Referrer: assignments and review
// ---------------------------------------------------------------------------

export interface ReferrerAssignmentDto {
  id: string
  requestId: string
  status: string
  assignedAt: string
  expiresAt: string | null
  respondedAt: string | null
  submittedAt: string | null
  submissionReference: string | null
  job: { id: string | null; title: string; company: string; location: string | null; applyUrl: string | null; roleCategory: string | null; expired: boolean }
  candidate: {
    /** Name as it appears on the resume; the learner consented to share it with the assigned referrer. */
    name: string | null
    headline: string | null
    summary: string | null
    skills: string[]
    employment: { company: string | null; title: string | null; period: string | null; bullets: string[] }[]
    projects: { name: string | null; description: string | null }[]
    education: string[]
    introduction: string | null
    whyRole: string | null
    relevantExperience: string | null
    resumeId: string | null
  } | null
  readiness: { status: string; summary: string; missingEvidence: string[]; weakEvidence: string[]; curriculumGaps: string[] } | null
  evidence: { skill: string; status: string; quote: string | null }[]
  messages: { id: string; from: 'you' | 'candidate' | 'jobappy'; body: string; at: string }[]
  learnerAlreadyApplied: boolean
  disclosedFields: string[]
}

async function loadAssignmentFor(db: ReferralsDb, referrerId: string, assignmentId: string): Promise<{ assignment: AssignmentRow; request: RequestRow } | null> {
  const rows = await db
    .select({ assignment: schema.referralAssignments, request: schema.referralRequests })
    .from(schema.referralAssignments)
    .innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralAssignments.requestId))
    .where(and(eq(schema.referralAssignments.id, assignmentId), eq(schema.referralAssignments.referrerId, referrerId)))
    .limit(1)
  return rows[0] ?? null
}

async function assignmentDto(d: Deps, _referrerId: string, assignment: AssignmentRow, request: RequestRow, includeCandidate: boolean): Promise<ReferrerAssignmentDto> {
  const job = request.jobId ? (await d.db.select().from(schema.jobs).where(eq(schema.jobs.id, request.jobId)).limit(1))[0] : null
  const now = d.now()
  let candidate: ReferrerAssignmentDto['candidate'] = null
  let evidence: ReferrerAssignmentDto['evidence'] = []
  let readiness: ReferrerAssignmentDto['readiness'] = null
  if (includeCandidate) {
    const profileRow = request.resumeId ? (await d.db.select({ profile: schema.resumeProfiles.profile }).from(schema.resumeProfiles).where(eq(schema.resumeProfiles.resumeId, request.resumeId)).limit(1))[0] : null
    const profile = (profileRow?.profile as ResumeProfile | undefined) ?? null
    candidate = {
      name: profile?.name ?? null,
      headline: profile?.headline ?? null,
      summary: profile?.summary ?? null,
      skills: profile ? Array.from(new Set([...profile.skills.map((s) => s.name), ...profile.technologies])).slice(0, 40) : [],
      employment: (profile?.employment ?? []).slice(0, 8).map((e) => ({ company: (e as { company?: string | null }).company ?? null, title: (e as { title?: string | null }).title ?? null, period: (e as { period?: string | null; dates?: string | null }).period ?? (e as { dates?: string | null }).dates ?? null, bullets: ((e as { bullets?: string[] }).bullets ?? []).slice(0, 5) })),
      projects: (profile?.projects ?? []).slice(0, 6).map((p) => ({ name: (p as { name?: string | null }).name ?? null, description: (p as { description?: string | null }).description ?? null })),
      education: (profile?.education ?? []).slice(0, 4).map((e) => [(e as { degree?: string }).degree, (e as { institution?: string }).institution, (e as { year?: string | number }).year].filter(Boolean).join(', ')),
      introduction: request.introduction,
      whyRole: request.whyRole,
      relevantExperience: request.relevantExperience,
      resumeId: request.resumeId,
    }
    const analysisRow = request.resumeId && request.jobId ? (await d.db.select({ report: schema.resumeAnalyses.report }).from(schema.resumeAnalyses).where(and(eq(schema.resumeAnalyses.userId, request.userId), eq(schema.resumeAnalyses.jobId, request.jobId), eq(schema.resumeAnalyses.resumeId, request.resumeId))).orderBy(desc(schema.resumeAnalyses.createdAt)).limit(1))[0] : null
    const report = (analysisRow?.report as ResumeAnalysisReport | undefined) ?? null
    evidence = (report?.skillsAlignment ?? []).filter((r) => r.requirement === 'required').slice(0, 20).map((r) => ({ skill: r.skill, status: r.status, quote: r.evidence?.quote ?? null }))
    const rd = request.readiness as unknown as ReadinessReport | null
    readiness = rd ? { status: rd.status, summary: rd.summary, missingEvidence: rd.missingEvidence, weakEvidence: rd.weakEvidence, curriculumGaps: rd.curriculumGaps } : null
  }
  const messages = await d.db.select().from(schema.referralMessages).where(eq(schema.referralMessages.requestId, request.id)).orderBy(asc(schema.referralMessages.createdAt))
  const disclosures = await d.db.select({ fields: schema.referralIdentityDisclosures.fields }).from(schema.referralIdentityDisclosures).where(eq(schema.referralIdentityDisclosures.assignmentId, assignment.id))
  const applied = request.jobId ? await trackerShowsApplication(d.db, request.userId, request.jobId, job?.applyUrl ?? null) : false
  return {
    id: assignment.id,
    requestId: request.id,
    status: assignment.status,
    assignedAt: assignment.assignedAt.toISOString(),
    expiresAt: iso(assignment.expiresAt),
    respondedAt: iso(assignment.respondedAt),
    submittedAt: iso(assignment.submittedAt),
    submissionReference: assignment.submissionReference,
    job: { id: job?.id ?? request.jobId, title: request.jobTitle, company: request.companyName, location: job ? [job.locationCity, job.locationCountry].filter(Boolean).join(', ') || (job.workMode === 'remote' ? 'Remote' : null) : null, applyUrl: job?.applyUrl ?? null, roleCategory: job?.roleCategory ?? null, expired: !job || job.status !== 'published' || Boolean(job.expiresAt && job.expiresAt <= now) },
    candidate,
    readiness,
    evidence,
    messages: messages.map((m) => ({ id: m.id, from: m.senderRole === 'referrer' ? 'you' : m.senderRole === 'learner' ? 'candidate' : 'jobappy', body: m.body, at: m.createdAt.toISOString() })),
    learnerAlreadyApplied: applied,
    disclosedFields: Array.from(new Set(disclosures.flatMap((x) => x.fields))),
  }
}

export async function listReferrerAssignments(deps: ReferralDeps, userId: string): Promise<{ referrer: ReferrerSelfDto; assignments: ReferrerAssignmentDto[]; counts: { pending: number; accepted: number; awaiting: number; completed: number; activeLoad: number; monthlyLoad: number } }> {
  const d = withDefaults(deps)
  const r = await loadReferrerRow(d.db, userId)
  const rows = await d.db
    .select({ assignment: schema.referralAssignments, request: schema.referralRequests })
    .from(schema.referralAssignments)
    .innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralAssignments.requestId))
    .where(eq(schema.referralAssignments.referrerId, r.id))
    .orderBy(desc(schema.referralAssignments.assignedAt))
  const assignments: ReferrerAssignmentDto[] = []
  for (const row of rows) assignments.push(await assignmentDto(d, r.id, row.assignment, row.request, false))
  const start = monthStart(d.now())
  const counts = {
    pending: assignments.filter((a) => a.status === 'PENDING').length,
    accepted: assignments.filter((a) => a.status === 'ACCEPTED').length,
    awaiting: assignments.filter((a) => a.status === 'CLARIFICATION').length,
    completed: assignments.filter((a) => a.status === 'SUBMITTED').length,
    activeLoad: assignments.filter((a) => ['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(a.status)).length,
    monthlyLoad: rows.filter((x) => x.assignment.assignedAt >= start).length,
  }
  return { referrer: await referrerSelfDto(d, r), assignments, counts }
}

export async function getReferrerAssignment(deps: ReferralDeps, userId: string, assignmentId: string): Promise<ReferrerAssignmentDto | null> {
  const d = withDefaults(deps)
  const r = await loadReferrerRow(d.db, userId)
  const found = await loadAssignmentFor(d.db, r.id, assignmentId)
  if (!found) return null
  if (!found.assignment.viewedAt && found.assignment.status === 'PENDING') {
    await d.db.update(schema.referralAssignments).set({ viewedAt: d.now() }).where(eq(schema.referralAssignments.id, assignmentId))
    if (found.request.status === 'ASSIGNED') await transition(d, found.request, 'REFERRER_REVIEW', { role: 'referrer', userId })
  }
  // Candidate details are shown only while the assignment is live or completed by this referrer; never after a decline or expiry.
  const includeCandidate = ['PENDING', 'CLARIFICATION', 'ACCEPTED', 'SUBMITTED'].includes(found.assignment.status) && referrerActive(r, d.now())
  return assignmentDto(d, r.id, found.assignment, found.request, includeCandidate)
}

export type ReferrerAction = { action: 'accept' } | { action: 'decline'; reason: DeclineReason; note?: string } | { action: 'clarify'; message: string } | { action: 'message'; message: string } | { action: 'submitted'; reference?: string; note?: string } | { action: 'disclose'; fields: ('fullName' | 'profileUrl' | 'title')[] }

export async function respondToAssignment(deps: ReferralDeps, userId: string, assignmentId: string, action: ReferrerAction): Promise<ReferrerAssignmentDto> {
  const d = withDefaults(deps)
  const now = d.now()
  const r = await loadReferrerRow(d.db, userId)
  if (!referrerActive(r, now)) throw new ValidationError('Your referrer verification is not active, so you cannot act on requests right now.', 'verification')
  const found = await loadAssignmentFor(d.db, r.id, assignmentId)
  if (!found) throw new ValidationError('Assignment not found', 'assignmentId')
  const { assignment } = found
  let request = found.request
  const learner = (await d.db.select({ email: schema.users.email }).from(schema.users).where(eq(schema.users.id, request.userId)).limit(1))[0]
  const live = ['PENDING', 'CLARIFICATION'].includes(assignment.status)
  switch (action.action) {
    case 'accept': {
      if (!live) throw new ValidationError('This request is no longer awaiting your decision.', 'status')
      const job = request.jobId ? (await d.db.select({ status: schema.jobs.status, expiresAt: schema.jobs.expiresAt }).from(schema.jobs).where(eq(schema.jobs.id, request.jobId)).limit(1))[0] : null
      if (!job || job.status !== 'published' || (job.expiresAt && job.expiresAt <= now)) throw new ValidationError('The opening has closed; the request will be closed.', 'job')
      await d.db.update(schema.referralAssignments).set({ status: 'ACCEPTED', respondedAt: now }).where(eq(schema.referralAssignments.id, assignment.id))
      request = await transition(d, request, 'ACCEPTED', { role: 'referrer', userId })
      await settleReservation(d, request.userId, request.id, 'CONSUME', 'Request accepted by a verified referrer')
      request = await transition(d, request, 'REFERRAL_PENDING', { role: 'system', userId: null })
      await d.notify(request.userId, learner?.email ?? null, 'referral.accepted', { company: request.companyName, role: request.jobTitle })
      break
    }
    case 'decline': {
      if (!live) throw new ValidationError('This request is no longer awaiting your decision.', 'status')
      if (!(DECLINE_REASONS as readonly string[]).includes(action.reason)) throw new ValidationError('Pick a decline reason', 'reason')
      await d.db.update(schema.referralAssignments).set({ status: 'DECLINED', respondedAt: now, declineReason: action.reason, declineNote: action.note ? clean(action.note, 300) : null }).where(eq(schema.referralAssignments.id, assignment.id))
      request = await transition(d, request, 'DECLINED', { role: 'referrer', userId }, { reason: action.reason, patch: { currentAssignmentId: null } })
      await reassignAfterDecline(d, request, { role: 'system', userId: null })
      break
    }
    case 'clarify': {
      if (!live) throw new ValidationError('This request is no longer awaiting your decision.', 'status')
      const body = cleanMessage(action.message)
      await addMessage(d, request, { role: 'referrer', userId }, body)
      if (request.status !== 'CLARIFICATION_REQUESTED') request = await transition(d, request, 'CLARIFICATION_REQUESTED', { role: 'referrer', userId })
      await d.db.update(schema.referralAssignments).set({ status: 'CLARIFICATION' }).where(eq(schema.referralAssignments.id, assignment.id))
      await d.notify(request.userId, learner?.email ?? null, 'referral.clarification', { company: request.companyName, role: request.jobTitle })
      break
    }
    case 'message': {
      if (!['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(assignment.status)) throw new ValidationError('Messages are open while the request is with you.', 'status')
      await addMessage(d, request, { role: 'referrer', userId }, cleanMessage(action.message))
      await d.notify(request.userId, learner?.email ?? null, 'referral.needs_action', { company: request.companyName, role: request.jobTitle })
      break
    }
    case 'submitted': {
      if (assignment.status !== 'ACCEPTED' || request.status !== 'REFERRAL_PENDING') throw new ValidationError('Accept the request before marking the referral as submitted.', 'status')
      const reference = action.reference ? clean(action.reference, 80) : null
      const note = action.note ? clean(action.note, 300) : null
      await d.db.update(schema.referralAssignments).set({ status: 'SUBMITTED', submittedAt: now, submissionReference: reference, submissionNote: note }).where(eq(schema.referralAssignments.id, assignment.id))
      request = await transition(d, request, 'REFERRAL_SUBMITTED', { role: 'referrer', userId }, { patch: { referralSubmittedAt: now }, meta: { reference: Boolean(reference) } })
      await d.notify(request.userId, learner?.email ?? null, 'referral.submitted', { company: request.companyName, role: request.jobTitle })
      break
    }
    case 'disclose': {
      if (!['ACCEPTED', 'SUBMITTED'].includes(assignment.status)) throw new ValidationError('Identity can be shared only after you accept a request.', 'status')
      const fields = Array.from(new Set((action.fields ?? []).filter((f) => ['fullName', 'profileUrl', 'title'].includes(f))))
      if (!fields.length) throw new ValidationError('Choose what to share', 'fields')
      if (fields.includes('profileUrl') && !(r.profileUrl && r.profileUrlShareable)) throw new ValidationError('Add a profile link and allow sharing it in your settings first', 'fields')
      await d.db.insert(schema.referralIdentityDisclosures).values({ id: randomUUID(), requestId: request.id, assignmentId: assignment.id, referrerId: r.id, disclosedToUserId: request.userId, fields, reason: 'Referrer chose to share after accepting the request', referrerConsentAt: now, actorRole: 'referrer', actorUserId: userId, createdAt: now })
      await d.audit({ actorId: userId, action: 'referral.identity.disclose', entityType: 'referral_request', entityId: request.id, after: { fields, assignmentId: assignment.id } })
      await d.notify(request.userId, learner?.email ?? null, 'referral.needs_action', { company: request.companyName, role: request.jobTitle })
      break
    }
  }
  const fresh = await loadAssignmentFor(d.db, r.id, assignmentId)
  return assignmentDto(d, r.id, fresh!.assignment, fresh!.request, ['PENDING', 'CLARIFICATION', 'ACCEPTED', 'SUBMITTED'].includes(fresh!.assignment.status))
}

/** After a decline or expiry: try the next referrer if the plan allows and attempts remain; otherwise close honestly and release the credit. */
async function reassignAfterDecline(d: Deps, request: RequestRow, actor: { role: 'system' | 'admin'; userId: string | null }): Promise<RequestRow> {
  const settings = await getReferralSettings(d.db)
  const learner = (await d.db.select({ email: schema.users.email }).from(schema.users).where(eq(schema.users.id, request.userId)).limit(1))[0]
  const allowance = await reassignmentAllowance(d.db, request.userId)
  const reassignmentsSoFar = Math.max(0, request.attempts - 1)
  if (allowance !== null && reassignmentsSoFar >= allowance) return closeRequest(d, request, 'attempts_exhausted', actor)
  if (request.attempts >= settings.maxAttempts) return closeRequest(d, request, 'attempts_exhausted', actor)
  let current = await transition(d, request, 'REASSIGNING', actor)
  await d.notify(request.userId, learner?.email ?? null, 'referral.declined', { company: request.companyName, role: request.jobTitle })
  current = await transition(d, current, 'MATCHING', actor)
  return runMatching(d, current, settings, actor)
}

/** Reassignment attempts the learner's plan allows, recorded on the request at submission time; null means "not recorded" (falls back to the network setting). */
async function reassignmentAllowance(db: ReferralsDb, userId: string): Promise<number | null> {
  const rows = await db.select({ meta: schema.referralStatusEvents.meta }).from(schema.referralStatusEvents).innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralStatusEvents.requestId)).where(and(eq(schema.referralRequests.userId, userId), eq(schema.referralStatusEvents.toStatus, 'SUBMITTED'))).orderBy(desc(schema.referralStatusEvents.createdAt)).limit(1)
  const v = (rows[0]?.meta as { reassignmentAttempts?: number } | null)?.reassignmentAttempts
  return typeof v === 'number' ? v : null
}

/** Records the plan's reassignment allowance on the SUBMITTED event so later reassignment respects the plan the learner had when submitting. */
export async function recordReassignmentAllowance(deps: ReferralDeps, requestId: string, attempts: number): Promise<void> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referralStatusEvents).where(and(eq(schema.referralStatusEvents.requestId, requestId), eq(schema.referralStatusEvents.toStatus, 'SUBMITTED'))).orderBy(desc(schema.referralStatusEvents.createdAt)).limit(1)
  if (rows[0]) await d.db.update(schema.referralStatusEvents).set({ meta: { ...(rows[0].meta ?? {}), reassignmentAttempts: Math.max(0, Math.floor(attempts)) } }).where(eq(schema.referralStatusEvents.id, rows[0].id))
}

// ---------------------------------------------------------------------------
// Sweeps: assignment timeouts, request expiry, job expiry, verification expiry
// ---------------------------------------------------------------------------

export interface SweepReport {
  assignmentsExpired: number
  requestsExpired: number
  jobExpiredClosures: number
  verificationsExpired: number
}

export async function sweepReferrals(deps: ReferralDeps): Promise<SweepReport> {
  const d = withDefaults(deps)
  const now = d.now()
  const settings = await getReferralSettings(d.db)
  const report: SweepReport = { assignmentsExpired: 0, requestsExpired: 0, jobExpiredClosures: 0, verificationsExpired: 0 }

  // Referrers whose verification lapsed stop being presented as verified; their live assignments move on.
  const lapsed = await d.db.select().from(schema.referrerProfiles).where(and(eq(schema.referrerProfiles.verificationStatus, 'VERIFIED'), sql`${schema.referrerProfiles.verificationExpiresAt} is not null and ${schema.referrerProfiles.verificationExpiresAt} <= ${now}`))
  for (const r of lapsed) {
    await d.db.update(schema.referrerProfiles).set({ verificationStatus: 'EXPIRED', updatedAt: now }).where(eq(schema.referrerProfiles.id, r.id))
    await invalidateReferrerAssignments(d, r.id, 'verification expired')
    report.verificationsExpired += 1
  }

  // Assignments the referrer did not answer in time.
  const overdue = await d.db.select({ assignment: schema.referralAssignments, request: schema.referralRequests }).from(schema.referralAssignments).innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralAssignments.requestId)).where(and(inArray(schema.referralAssignments.status, ['PENDING', 'CLARIFICATION']), sql`${schema.referralAssignments.expiresAt} is not null and ${schema.referralAssignments.expiresAt} <= ${now}`))
  for (const { assignment, request } of overdue) {
    await d.db.update(schema.referralAssignments).set({ status: 'EXPIRED', respondedAt: now }).where(eq(schema.referralAssignments.id, assignment.id))
    if (!['ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(request.status)) continue
    const declined = await transition(d, request, 'DECLINED', { role: 'system', userId: null }, { reason: 'timeout', patch: { currentAssignmentId: null } })
    await reassignAfterDecline(d, declined, { role: 'system', userId: null })
    report.assignmentsExpired += 1
  }

  // Open requests whose job closed, or which have lived too long.
  const open = await d.db.select({ request: schema.referralRequests, jobStatus: schema.jobs.status, jobExpiresAt: schema.jobs.expiresAt }).from(schema.referralRequests).leftJoin(schema.jobs, eq(schema.jobs.id, schema.referralRequests.jobId)).where(inArray(schema.referralRequests.status, OPEN_STATUSES))
  for (const { request, jobStatus, jobExpiresAt } of open) {
    if (['REFERRAL_SUBMITTED', 'REFERRAL_CONFIRMED'].includes(request.status)) continue
    const jobGone = !jobStatus || jobStatus !== 'published' || Boolean(jobExpiresAt && jobExpiresAt <= now)
    if (jobGone) {
      await closeRequest(d, request, 'job_expired', { role: 'system', userId: null })
      report.jobExpiredClosures += 1
      continue
    }
    if (request.submittedAt && now.getTime() - request.submittedAt.getTime() > settings.requestTtlDays * 24 * 36e5 && !['ACCEPTED', 'REFERRAL_PENDING'].includes(request.status)) {
      await closeRequest(d, request, 'request_expired', { role: 'system', userId: null }, 'EXPIRED')
      report.requestsExpired += 1
    }
  }
  return report
}

async function invalidateReferrerAssignments(d: Deps, referrerId: string, why: string): Promise<number> {
  const rows = await d.db.select({ assignment: schema.referralAssignments, request: schema.referralRequests }).from(schema.referralAssignments).innerJoin(schema.referralRequests, eq(schema.referralRequests.id, schema.referralAssignments.requestId)).where(and(eq(schema.referralAssignments.referrerId, referrerId), inArray(schema.referralAssignments.status, ['PENDING', 'CLARIFICATION', 'ACCEPTED'])))
  let n = 0
  for (const { assignment, request } of rows) {
    await d.db.update(schema.referralAssignments).set({ status: 'CANCELLED', respondedAt: d.now(), declineNote: why }).where(eq(schema.referralAssignments.id, assignment.id))
    if (['ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(request.status)) {
      const declined = await transition(d, request, 'DECLINED', { role: 'system', userId: null }, { reason: `referrer_unavailable: ${why}`, patch: { currentAssignmentId: null } })
      await reassignAfterDecline(d, declined, { role: 'system', userId: null })
    } else if (['ACCEPTED', 'REFERRAL_PENDING'].includes(request.status)) {
      // Accepted but not submitted: the credit was consumed on acceptance, so it is refunded and the request re-enters matching.
      await d.db.insert(schema.referralCreditLedger).values({ id: randomUUID(), userId: request.userId, type: 'REFUND', amount: 1, reason: `Referrer became unavailable before submitting (${why})`, source: 'system', requestId: request.id, createdAt: d.now() })
      const declined = await transition(d, request, 'DECLINED', { role: 'system', userId: null }, { reason: `referrer_unavailable: ${why}`, patch: { currentAssignmentId: null } })
      await reassignAfterDecline(d, declined, { role: 'system', userId: null })
    }
    n += 1
  }
  return n
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminReferrerDto extends ReferrerSelfDto {
  userEmail: string | null
  internalNotes: string | null
  invitedBy: string | null
  activeAssignments: number
  monthlyAssignments: number
  verifications: { id: string; method: string; status: string; confirmedAt: string | null; note: string | null; createdAt: string }[]
  createdAt: string
}

export async function adminListReferrers(deps: ReferralDeps, filters: { status?: string; companyId?: string; q?: string } = {}): Promise<AdminReferrerDto[]> {
  const d = withDefaults(deps)
  const rows = await d.db.select({ r: schema.referrerProfiles, email: schema.users.email }).from(schema.referrerProfiles).leftJoin(schema.users, eq(schema.users.id, schema.referrerProfiles.userId)).orderBy(desc(schema.referrerProfiles.createdAt))
  const out: AdminReferrerDto[] = []
  for (const { r, email } of rows) {
    if (filters.status && r.verificationStatus !== filters.status) continue
    if (filters.companyId && r.companyId !== filters.companyId) continue
    if (filters.q && !`${r.fullName} ${r.contactEmail ?? ''} ${r.corporateEmail ?? ''} ${email ?? ''}`.toLowerCase().includes(filters.q.toLowerCase())) continue
    out.push(await adminReferrerDto(d, r, email ?? null))
  }
  return out
}

async function adminReferrerDto(d: Deps, r: ReferrerRow, email: string | null): Promise<AdminReferrerDto> {
  const self = await referrerSelfDto(d, r)
  const assignments = await d.db.select({ status: schema.referralAssignments.status, assignedAt: schema.referralAssignments.assignedAt }).from(schema.referralAssignments).where(eq(schema.referralAssignments.referrerId, r.id))
  const verifications = await d.db.select().from(schema.referrerVerifications).where(eq(schema.referrerVerifications.referrerId, r.id)).orderBy(desc(schema.referrerVerifications.createdAt))
  return {
    ...self,
    userEmail: email,
    internalNotes: r.internalNotes,
    invitedBy: r.invitedBy,
    activeAssignments: assignments.filter((a) => ['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(a.status)).length,
    monthlyAssignments: assignments.filter((a) => a.assignedAt >= monthStart(d.now())).length,
    verifications: verifications.map((v) => ({ id: v.id, method: v.method, status: v.status, confirmedAt: iso(v.confirmedAt), note: v.note, createdAt: v.createdAt.toISOString() })),
    createdAt: r.createdAt.toISOString(),
  }
}

export type AdminReferrerAction =
  | { action: 'verify'; note?: string; validMonths?: number }
  | { action: 'reject'; note?: string }
  | { action: 'suspend'; note?: string }
  | { action: 'reverify'; note?: string }
  | { action: 'pause' }
  | { action: 'resume' }
  | { action: 'capacity'; maxActiveRequests?: number; maxMonthlyRequests?: number }
  | { action: 'notes'; notes: string }
  | { action: 'roleFamilies'; roleFamilies: string[] }

export async function adminUpdateReferrer(deps: ReferralDeps, referrerId: string, action: AdminReferrerAction, actorId: string): Promise<AdminReferrerDto> {
  const d = withDefaults(deps)
  const now = d.now()
  if (action.action === 'verify') {
    const note = typeof action.note === 'string' ? clean(action.note, 300) : ''
    if (note.length < 15) throw new ValidationError('Explain how you confirmed current employment (at least 15 characters).', 'note')
    const approved = await d.db.transaction(async (tx) => {
      const r = (await tx.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.id, referrerId)).for('update'))[0]
      if (!r || r.deletedAt || !r.userId) throw new ValidationError('This referrer account is no longer active.', 'referrer')
      if (!r.onboardingCompletedAt) throw new ValidationError('The referrer has not completed onboarding yet', 'onboarding')
      if (!r.contactEmail || !r.contactEmailVerifiedAt) throw new ValidationError('The referrer must confirm their personal email before employment approval.', 'email')
      const months = Math.min(24, Math.max(1, Math.floor(Number(action.validMonths) || 12)))
      const verificationExpiresAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + months, now.getUTCDate()))
      await tx.update(schema.referrerVerifications).set({ status: 'confirmed', confirmedAt: now, reviewerId: actorId, note }).where(and(eq(schema.referrerVerifications.referrerId, r.id), eq(schema.referrerVerifications.method, 'admin_review'), eq(schema.referrerVerifications.status, 'pending')))
      await tx.insert(schema.referrerVerifications).values({ id: randomUUID(), referrerId: r.id, method: 'admin_review', status: 'confirmed', confirmedAt: now, reviewerId: actorId, note, createdAt: now })
      const fresh = (await tx.update(schema.referrerProfiles).set({ verificationStatus: 'VERIFIED', verifiedAt: now, verificationExpiresAt, updatedAt: now }).where(eq(schema.referrerProfiles.id, r.id)).returning())[0]
      return { before: r.verificationStatus, fresh }
    })
    await d.audit({ actorId, action: 'referrer.verify', entityType: 'referrer', entityId: referrerId, before: { verificationStatus: approved.before }, after: { verificationStatus: 'VERIFIED', note, verificationExpiresAt: iso(approved.fresh.verificationExpiresAt) } })
    await d.notify(approved.fresh.userId, approved.fresh.contactEmail, 'referrer.verified', { status: 'VERIFIED' })
    const account = (await d.db.select({ email: schema.users.email }).from(schema.users).where(eq(schema.users.id, approved.fresh.userId!)))[0]
    return adminReferrerDto(d, approved.fresh, account?.email ?? null)
  }
  const rows = await d.db.select({ r: schema.referrerProfiles, email: schema.users.email }).from(schema.referrerProfiles).leftJoin(schema.users, eq(schema.users.id, schema.referrerProfiles.userId)).where(eq(schema.referrerProfiles.id, referrerId)).limit(1)
  if (!rows[0]) throw new ValidationError('Referrer not found', 'referrerId')
  const { r, email } = rows[0]
  const before = { verificationStatus: r.verificationStatus, availability: r.availability, maxActiveRequests: r.maxActiveRequests, maxMonthlyRequests: r.maxMonthlyRequests }
  const patch: Partial<ReferrerRow> = { updatedAt: now }
  let notifyKind: ReferralNotificationKind | null = null
  switch (action.action) {
    case 'reject':
      patch.verificationStatus = 'REJECTED'
      await d.db.insert(schema.referrerVerifications).values({ id: randomUUID(), referrerId: r.id, method: 'admin_review', status: 'rejected', reviewerId: actorId, note: action.note?.slice(0, 300) ?? null, createdAt: now })
      notifyKind = 'referrer.status'
      break
    case 'suspend':
      patch.verificationStatus = 'SUSPENDED'
      patch.availability = 'paused'
      notifyKind = 'referrer.status'
      break
    case 'reverify':
      patch.verificationStatus = 'REQUIRES_REVERIFICATION'
      notifyKind = 'referrer.status'
      break
    case 'pause':
      patch.availability = 'paused'
      break
    case 'resume':
      patch.availability = 'available'
      break
    case 'capacity':
      if (action.maxActiveRequests !== undefined) patch.maxActiveRequests = Math.min(10, Math.max(1, Math.floor(Number(action.maxActiveRequests) || 1)))
      if (action.maxMonthlyRequests !== undefined) patch.maxMonthlyRequests = Math.min(40, Math.max(1, Math.floor(Number(action.maxMonthlyRequests) || 1)))
      break
    case 'notes':
      patch.internalNotes = String(action.notes ?? '').slice(0, 2000)
      break
    case 'roleFamilies':
      patch.roleFamilies = Array.from(new Set((action.roleFamilies ?? []).map((f) => String(f).trim().toLowerCase()).filter((f) => /^[a-z-]{2,40}$/.test(f)))).slice(0, 10)
      break
  }
  await d.db.update(schema.referrerProfiles).set(patch).where(eq(schema.referrerProfiles.id, r.id))
  if (['reject', 'suspend', 'reverify'].includes(action.action)) await invalidateReferrerAssignments(d, r.id, action.action === 'suspend' ? 'referrer suspended' : action.action === 'reject' ? 'verification rejected' : 'reverification required')
  await d.audit({ actorId, action: `referrer.${action.action}`, entityType: 'referrer', entityId: r.id, before, after: { ...before, ...patch, updatedAt: undefined } })
  if (notifyKind && r.userId) await d.notify(r.userId, r.contactEmail ?? email ?? null, notifyKind, { status: patch.verificationStatus ?? r.verificationStatus })
  const fresh = (await d.db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.id, r.id)).limit(1))[0]
  return adminReferrerDto(d, fresh, email ?? null)
}

export interface AdminRequestDto {
  id: string
  userId: string
  learnerEmail: string | null
  jobId: string | null
  jobTitle: string
  companyId: string
  companyName: string
  status: RequestStatus
  readinessStatus: string | null
  attempts: number
  closedReason: string | null
  submittedAt: string | null
  referralSubmittedAt: string | null
  lastEventAt: string
  createdAt: string
  currentAssignment: { id: string; referrerId: string | null; referrerName: string | null; status: string; assignedAt: string; expiresAt: string | null } | null
  assignments: { id: string; referrerId: string | null; referrerName: string | null; status: string; assignedBy: string; assignedAt: string; respondedAt: string | null; declineReason: string | null; submittedAt: string | null }[]
  events: { fromStatus: string | null; toStatus: string; actorRole: string; reason: string | null; at: string }[]
  messages: { from: string; body: string; at: string }[]
  disclosures: { fields: string[]; reason: string; actorRole: string; at: string }[]
  credit: { reserved: boolean; outstanding: number }
}

async function adminRequestDto(d: Deps, request: RequestRow): Promise<AdminRequestDto> {
  const learner = (await d.db.select({ email: schema.users.email }).from(schema.users).where(eq(schema.users.id, request.userId)).limit(1))[0]
  const assignments = await d.db.select({ a: schema.referralAssignments, name: schema.referrerProfiles.fullName }).from(schema.referralAssignments).leftJoin(schema.referrerProfiles, eq(schema.referrerProfiles.id, schema.referralAssignments.referrerId)).where(eq(schema.referralAssignments.requestId, request.id)).orderBy(asc(schema.referralAssignments.assignedAt))
  const events = await d.db.select().from(schema.referralStatusEvents).where(eq(schema.referralStatusEvents.requestId, request.id)).orderBy(asc(schema.referralStatusEvents.createdAt))
  const messages = await d.db.select().from(schema.referralMessages).where(eq(schema.referralMessages.requestId, request.id)).orderBy(asc(schema.referralMessages.createdAt))
  const disclosures = await d.db.select().from(schema.referralIdentityDisclosures).where(eq(schema.referralIdentityDisclosures.requestId, request.id)).orderBy(asc(schema.referralIdentityDisclosures.createdAt))
  const ledger = await ledgerRows(d.db, request.userId)
  const current = assignments.find((x) => x.a.id === request.currentAssignmentId)
  return {
    id: request.id,
    userId: request.userId,
    learnerEmail: learner?.email ?? null,
    jobId: request.jobId,
    jobTitle: request.jobTitle,
    companyId: request.companyId,
    companyName: request.companyName,
    status: request.status as RequestStatus,
    readinessStatus: request.readinessStatus,
    attempts: request.attempts,
    closedReason: request.closedReason,
    submittedAt: iso(request.submittedAt),
    referralSubmittedAt: iso(request.referralSubmittedAt),
    lastEventAt: request.lastEventAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
    currentAssignment: current ? { id: current.a.id, referrerId: current.a.referrerId, referrerName: current.name ?? null, status: current.a.status, assignedAt: current.a.assignedAt.toISOString(), expiresAt: iso(current.a.expiresAt) } : null,
    assignments: assignments.map(({ a, name }) => ({ id: a.id, referrerId: a.referrerId, referrerName: name ?? null, status: a.status, assignedBy: a.assignedBy, assignedAt: a.assignedAt.toISOString(), respondedAt: iso(a.respondedAt), declineReason: a.declineReason, submittedAt: iso(a.submittedAt) })),
    events: events.map((e) => ({ fromStatus: e.fromStatus, toStatus: e.toStatus, actorRole: e.actorRole, reason: e.reason, at: e.createdAt.toISOString() })),
    messages: messages.map((m) => ({ from: m.senderRole, body: m.body, at: m.createdAt.toISOString() })),
    disclosures: disclosures.map((x) => ({ fields: x.fields, reason: x.reason, actorRole: x.actorRole, at: x.createdAt.toISOString() })),
    credit: { reserved: Boolean(request.creditReservationId), outstanding: reservationOutstanding(ledger as LedgerRow[], request.id) },
  }
}

export async function adminListRequests(deps: ReferralDeps, filters: { status?: string; companyId?: string; needsAttention?: boolean } = {}): Promise<AdminRequestDto[]> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referralRequests).orderBy(desc(schema.referralRequests.lastEventAt)).limit(300)
  const out: AdminRequestDto[] = []
  for (const r of rows) {
    if (filters.status && r.status !== filters.status) continue
    if (filters.companyId && r.companyId !== filters.companyId) continue
    if (filters.needsAttention && !['MATCHING', 'SCREENING'].includes(r.status)) continue
    out.push(await adminRequestDto(d, r))
  }
  return out
}

export async function adminGetRequest(deps: ReferralDeps, requestId: string): Promise<AdminRequestDto | null> {
  const d = withDefaults(deps)
  const r = await loadRequest(d.db, requestId)
  return r ? adminRequestDto(d, r) : null
}

export type AdminRequestAction = { action: 'assign'; referrerId: string } | { action: 'reassign'; referrerId?: string } | { action: 'close'; reason: CloseReason } | { action: 'note'; message: string } | { action: 'retry_matching' } | { action: 'confirm' }

export async function adminRequestAction(deps: ReferralDeps, requestId: string, action: AdminRequestAction, actorId: string): Promise<AdminRequestDto> {
  const d = withDefaults(deps)
  let request = await loadRequest(d.db, requestId)
  if (!request) throw new ValidationError('Request not found', 'requestId')
  const settings = await getReferralSettings(d.db)
  const actor = { role: 'admin' as const, userId: actorId }
  switch (action.action) {
    case 'assign': {
      if (request.status !== 'MATCHING') throw new ValidationError('Only requests in MATCHING can be assigned by hand', 'status')
      request = await runMatching(d, request, settings, actor, action.referrerId)
      break
    }
    case 'retry_matching': {
      if (request.status !== 'MATCHING') throw new ValidationError('The request is not waiting for a match', 'status')
      request = await runMatching(d, request, settings, actor)
      break
    }
    case 'reassign': {
      if (!['ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(request.status)) throw new ValidationError('Only a request under review can be reassigned', 'status')
      if (request.currentAssignmentId) await d.db.update(schema.referralAssignments).set({ status: 'CANCELLED', respondedAt: d.now(), declineNote: 'reassigned by admin' }).where(eq(schema.referralAssignments.id, request.currentAssignmentId))
      request = await transition(d, request, 'REASSIGNING', actor, { patch: { currentAssignmentId: null } })
      request = await transition(d, request, 'MATCHING', actor)
      request = await runMatching(d, request, settings, actor, action.referrerId)
      break
    }
    case 'close': {
      if (isTerminal(request.status as RequestStatus)) throw new ValidationError('The request is already closed', 'status')
      request = await closeRequest(d, request, action.reason, actor)
      break
    }
    case 'note': {
      await addMessage(d, request, { role: 'admin', userId: actorId }, cleanMessage(action.message))
      break
    }
    case 'confirm': {
      if (request.status !== 'REFERRAL_SUBMITTED') throw new ValidationError('Only a submitted referral can be confirmed', 'status')
      request = await transition(d, request, 'REFERRAL_CONFIRMED', actor)
      break
    }
  }
  await d.audit({ actorId, action: `referral.request.${action.action}`, entityType: 'referral_request', entityId: requestId, after: { status: request.status, ...action } })
  return adminRequestDto(d, (await loadRequest(d.db, requestId))!)
}

export interface CompanyCoverageRow {
  companyId: string
  name: string
  slug: string
  publishedJobs: number
  verifiedReferrers: number
  pendingReferrers: number
  availableCapacity: number
  policyStatus: schema.ReferralPolicyStatus
  referralsEnabled: boolean
  lastReviewedAt: string | null
  manualReviewRequired: boolean
  /** True only with genuine verified coverage and a policy that allows the workflow. */
  networkAvailable: boolean
}

export async function companyCoverage(deps: ReferralDeps): Promise<CompanyCoverageRow[]> {
  const d = withDefaults(deps)
  const now = d.now()
  const settings = await getReferralSettings(d.db)
  const companies = await d.db.select({ id: schema.companies.id, name: schema.companies.name, slug: schema.companies.slug }).from(schema.companies).where(eq(schema.companies.status, 'active')).orderBy(asc(schema.companies.name))
  const jobCounts = await d.db.select({ companyId: schema.jobs.companyId, n: sql<number>`count(*)::int` }).from(schema.jobs).where(eq(schema.jobs.status, 'published')).groupBy(schema.jobs.companyId)
  const policies = await d.db.select().from(schema.companyReferralPolicies)
  const referrers = await d.db.select().from(schema.referrerProfiles).where(isNull(schema.referrerProfiles.deletedAt))
  const assignments = await d.db.select({ referrerId: schema.referralAssignments.referrerId, status: schema.referralAssignments.status }).from(schema.referralAssignments).where(inArray(schema.referralAssignments.status, ['PENDING', 'CLARIFICATION', 'ACCEPTED']))
  const jobMap = new Map(jobCounts.map((j) => [j.companyId, j.n]))
  const out: CompanyCoverageRow[] = []
  for (const c of companies) {
    const policy = toPolicyDto(policies.find((p) => p.companyId === c.id) ?? null, c.id)
    const mine = referrers.filter((r) => r.companyId === c.id)
    const verified = mine.filter((r) => referrerActive(r, now))
    const capacity = verified.filter((r) => r.availability === 'available').reduce((s, r) => s + Math.max(0, r.maxActiveRequests - assignments.filter((a) => a.referrerId === r.id).length), 0)
    const policyOk = policy.referralsEnabled && policy.policyStatus !== 'REFERRALS_DISABLED' && (policy.policyStatus !== 'UNKNOWN' || settings.allowUnknownPolicy) && !policy.manualReviewRequired
    out.push({ companyId: c.id, name: c.name, slug: c.slug, publishedJobs: jobMap.get(c.id) ?? 0, verifiedReferrers: verified.length, pendingReferrers: mine.filter((r) => r.verificationStatus === 'PENDING').length, availableCapacity: capacity, policyStatus: policy.policyStatus, referralsEnabled: policy.referralsEnabled, lastReviewedAt: policy.lastReviewedAt, manualReviewRequired: policy.manualReviewRequired, networkAvailable: policyOk && capacity > 0 })
  }
  return out
}

export interface ReferralMetrics {
  verifiedReferrers: number
  companiesCovered: number
  availableReferrers: number
  requests: number
  awaitingMatch: number
  underReview: number
  accepted: number
  declined: number
  submitted: number
  noReferrerAvailable: number
  medianResponseHours: number | null
}

export async function referralMetrics(deps: ReferralDeps): Promise<ReferralMetrics> {
  const d = withDefaults(deps)
  const now = d.now()
  const referrers = await d.db.select().from(schema.referrerProfiles).where(isNull(schema.referrerProfiles.deletedAt))
  const active = referrers.filter((r) => referrerActive(r, now))
  const requests = await d.db.select({ status: schema.referralRequests.status, closedReason: schema.referralRequests.closedReason }).from(schema.referralRequests)
  const assignments = await d.db.select({ status: schema.referralAssignments.status, assignedAt: schema.referralAssignments.assignedAt, respondedAt: schema.referralAssignments.respondedAt }).from(schema.referralAssignments)
  const responseHours = assignments.filter((a) => a.respondedAt && ['ACCEPTED', 'DECLINED', 'SUBMITTED'].includes(a.status)).map((a) => (a.respondedAt!.getTime() - a.assignedAt.getTime()) / 36e5).sort((x, y) => x - y)
  const median = responseHours.length ? responseHours[Math.floor(responseHours.length / 2)] : null
  return {
    verifiedReferrers: active.length,
    companiesCovered: new Set(active.map((r) => r.companyId)).size,
    availableReferrers: active.filter((r) => r.availability === 'available').length,
    requests: requests.filter((r) => !['DRAFT', 'READINESS_REQUIRED', 'READY'].includes(r.status)).length,
    awaitingMatch: requests.filter((r) => ['SCREENING', 'MATCHING', 'REASSIGNING'].includes(r.status)).length,
    underReview: requests.filter((r) => ['ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(r.status)).length,
    accepted: assignments.filter((a) => ['ACCEPTED', 'SUBMITTED'].includes(a.status)).length,
    declined: assignments.filter((a) => a.status === 'DECLINED').length,
    submitted: requests.filter((r) => ['REFERRAL_SUBMITTED', 'REFERRAL_CONFIRMED'].includes(r.status) || (r.status === 'CLOSED' && r.closedReason === 'completed')).length,
    noReferrerAvailable: requests.filter((r) => r.closedReason === 'no_referrer_available').length,
    medianResponseHours: median === null ? null : Math.round(median * 10) / 10,
  }
}

export async function adminListDisclosures(deps: ReferralDeps): Promise<{ id: string; requestId: string; referrerName: string | null; learnerEmail: string | null; fields: string[]; reason: string; actorRole: string; at: string }[]> {
  const d = withDefaults(deps)
  const rows = await d.db.select({ x: schema.referralIdentityDisclosures, name: schema.referrerProfiles.fullName, email: schema.users.email }).from(schema.referralIdentityDisclosures).leftJoin(schema.referrerProfiles, eq(schema.referrerProfiles.id, schema.referralIdentityDisclosures.referrerId)).leftJoin(schema.users, eq(schema.users.id, schema.referralIdentityDisclosures.disclosedToUserId)).orderBy(desc(schema.referralIdentityDisclosures.createdAt)).limit(200)
  return rows.map(({ x, name, email }) => ({ id: x.id, requestId: x.requestId, referrerName: name ?? null, learnerEmail: email ?? null, fields: x.fields, reason: x.reason, actorRole: x.actorRole, at: x.createdAt.toISOString() }))
}

// ---------------------------------------------------------------------------
// Deletion and retention
// ---------------------------------------------------------------------------

/** Career-data deletion: open requests are cancelled (credits released), the learner's request rows go, the ledger stays (money-like). */
export async function deleteLearnerReferralData(deps: ReferralDeps, userId: string): Promise<{ requests: number }> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referralRequests).where(eq(schema.referralRequests.userId, userId))
  for (const r of rows) {
    if (!isTerminal(r.status as RequestStatus) && LEARNER_CANCELLABLE.includes(r.status as RequestStatus)) await closeRequest(d, r, 'learner_cancelled', { role: 'learner', userId }, 'CANCELLED')
    else if (!isTerminal(r.status as RequestStatus)) await closeRequest(d, r, 'learner_cancelled', { role: 'learner', userId }, 'CANCELLED').catch(() => undefined)
  }
  await d.db.delete(schema.referralRequests).where(eq(schema.referralRequests.userId, userId))
  return { requests: rows.length }
}

/** Referrer leaves: identity is scrubbed, the row and its history stay, live assignments move on. */
export async function anonymizeReferrer(deps: ReferralDeps, userId: string, actorId: string | null): Promise<boolean> {
  const d = withDefaults(deps)
  const rows = await d.db.select().from(schema.referrerProfiles).where(eq(schema.referrerProfiles.userId, userId)).limit(1)
  const r = rows[0]
  if (!r) return false
  await invalidateReferrerAssignments(d, r.id, 'referrer left')
  await d.db.update(schema.referrerProfiles).set({ userId: null, fullName: 'Former referrer', contactEmail: null, contactEmailVerifiedAt: null, corporateEmail: null, corporateEmailDomain: null, profileUrl: null, profileUrlShareable: false, title: null, location: null, internalNotes: null, availability: 'paused', verificationStatus: 'SUSPENDED', deletedAt: d.now(), updatedAt: d.now() }).where(eq(schema.referrerProfiles.id, r.id))
  await d.db.update(schema.referrerVerifications).set({ tokenHash: null, evidenceRef: null }).where(eq(schema.referrerVerifications.referrerId, r.id))
  await d.db.delete(schema.userRoles).where(and(eq(schema.userRoles.userId, userId), eq(schema.userRoles.role, 'referrer')))
  await d.audit({ actorId, action: 'referrer.anonymized', entityType: 'referrer', entityId: r.id })
  return true
}
