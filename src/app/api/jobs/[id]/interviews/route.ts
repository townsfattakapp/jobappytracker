import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { users } from '../../../../../lib/db/schema'
import { buildInterviewContext, SECTION_TITLES, type InterviewMode, type SectionId } from '../../../../../lib/interview/jobInterview'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { consumeUsage, featureLockedResponse, resolveAccess, usageToday } from '../../../../../lib/server/entitlements'
import { activeSession, createSession, deriveFor, interviewAccess, listSessions, toHistoryItem, toSessionDto } from '../../../../../lib/server/interviews'
import { getJob } from '../../../../../lib/server/jobs'
import { getPreparation } from '../../../../../lib/server/outreach'
import { currentResume, getAnalysisForJob } from '../../../../../lib/server/resumes'

export const dynamic = 'force-dynamic'

const monthStart = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

/** History and any active session for this job (owner only; expired jobs keep their history). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const ia = interviewAccess(access)
    if (!ia.full && !ia.preview) return featureLockedResponse('interview.jobFull', access)
    const { id } = await ctx.params
    const now = new Date()
    const rows = await listSessions(db, access.userId, id)
    const history = rows.filter((r) => r.status !== 'active').map(toHistoryItem)
    const active = await activeSession(db, access.userId, id)
    const [usedToday, usedMonth] = await Promise.all([usageToday(access.userId, 'interview.sessions', now), usageToday(access.userId, 'interview.sessions.month', monthStart(now))])
    return NextResponse.json({
      access: ia,
      limits: { day: { used: usedToday, limit: access.limits.interviewsPerDay ?? 0 }, month: { used: usedMonth, limit: access.limits.interviewsPerMonth ?? 0 } },
      history: ia.history ? history : history.slice(0, 1),
      historyTotal: history.length,
      active: active ? toSessionDto(active, now) : null,
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]/interviews')
  }
}

/**
 * Body: { action: 'derive' | 'start', progress?: Record<topicId, status>, compatibility?, config?, mode?, parentSessionId?, sectionId?, language? }.
 * 'derive' returns the job-derived configuration and section plan; 'start' creates a session (counts one interview against the daily and monthly limits).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const ia = interviewAccess(access)
    if (!ia.full && !ia.preview) return featureLockedResponse('interview.jobFull', access)
    const { id } = await ctx.params
    const body = (await readJson(req)) as Record<string, unknown>
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    const action = body.action === 'start' ? 'start' : 'derive'
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const progress: Record<string, 'done' | 'started' | 'none'> = {}
    if (body.progress && typeof body.progress === 'object') for (const [k, v] of Object.entries(body.progress as Record<string, unknown>).slice(0, 2000)) if (v === 'done' || v === 'started' || v === 'none') progress[k] = v
    const compat = body.compatibility && typeof body.compatibility === 'object' ? (body.compatibility as Record<string, unknown>) : null
    const compatibility = compat && typeof compat.score === 'number' ? { score: Math.max(0, Math.min(100, Math.round(compat.score))), strongAlignment: Array.isArray(compat.strongAlignment) ? compat.strongAlignment.map(String).slice(0, 20) : [], missingRequirements: Array.isArray(compat.missingRequirements) ? compat.missingRequirements.map(String).slice(0, 20) : [] } : null
    const [preparation, analysis, resume] = await Promise.all([getPreparation(access.userId, id), getAnalysisForJob(access.userId, id), currentResume(access.userId)])
    const inputs = { job, blueprint: preparation?.blueprint ?? null, profile: resume?.profile ?? null, analysis: analysis?.report ?? null, compatibility, progress }
    if (action === 'derive') {
      const context = buildInterviewContext(inputs)
      return NextResponse.json({ derived: deriveFor(context, ia), context: { missingInputs: context.missingInputs, resumeProjects: context.resume?.projects.map((p) => p.name) ?? [], gaps: context.gaps.slice(0, 12), dsaDepth: context.blueprint.dsaDepth, designDepth: context.blueprint.designDepth, experienceYears: context.experienceYears }, access: ia })
    }
    const existing = await activeSession(db, access.userId, id)
    if (existing && body.resume !== false) return NextResponse.json({ session: toSessionDto(existing), resumed: true })
    const now = new Date()
    const monthUsed = await usageToday(access.userId, 'interview.sessions.month', monthStart(now))
    const monthLimit = access.limits.interviewsPerMonth ?? 0
    if (monthUsed >= monthLimit) return NextResponse.json({ error: `You have used this month's ${monthLimit} job mock interviews.`, code: 'limit', usage: { used: monthUsed, limit: monthLimit } }, { status: 429 })
    const day = await consumeUsage(access.userId, 'interview.sessions', access.limits.interviewsPerDay ?? 0, now)
    if (!day.allowed) return NextResponse.json({ error: `You have used today's ${day.limit} job mock interviews. They reset at midnight UTC.`, code: 'limit', usage: { used: day.used, limit: day.limit } }, { status: 429 })
    await consumeUsage(access.userId, 'interview.sessions.month', Math.max(monthLimit, monthUsed + 1), monthStart(now))
    const modes: InterviewMode[] = ['full', 'weak_areas', 'section', 'missed_concepts', 'preview']
    const mode = modes.includes(body.mode as InterviewMode) ? (body.mode as InterviewMode) : 'full'
    const sectionId = typeof body.sectionId === 'string' && body.sectionId in SECTION_TITLES ? (body.sectionId as SectionId) : null
    const account = await db.query.users.findFirst({ where: eq(users.id, access.userId), columns: { name: true } })
    const row = await createSession(db, { userId: access.userId, ...inputs, config: body.config, mode, parentSessionId: typeof body.parentSessionId === 'string' ? body.parentSessionId : null, sectionId, language: typeof body.language === 'string' ? body.language.slice(0, 20) : undefined, access: ia, candidateName: account?.name ?? null, voice: body.voice === true }, now)
    return NextResponse.json({ session: toSessionDto(row, now), resumed: false }, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/interviews')
  }
}
