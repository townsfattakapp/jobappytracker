import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { analyzeResumeForJob } from '../../../../../lib/jobs/resumeAnalysis'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { consumeUsage, isResponse, requireFeature, resolveAccess } from '../../../../../lib/server/entitlements'
import { getJob } from '../../../../../lib/server/jobs'
import { currentResume, getAnalysisForJob, getResume, saveAnalysis, setSuggestionState } from '../../../../../lib/server/resumes'
import { resumeInsights } from '../../../../../lib/server/aiEnrich'

export const dynamic = 'force-dynamic'

/** Existing analysis for this job (owner only); null when none. Reading needs only a signed-in account so saved work stays visible. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    return NextResponse.json({ analysis: await getAnalysisForJob(access.userId, id) })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]/resume-analysis')
  }
}

/**
 * Runs the resume-vs-job analysis on the server (the resume never leaves it)
 * and stores the report. Body: { resumeId?, curriculum? } where curriculum
 * is the client-computed gap map (tracks with gapStatus and skills), because
 * curriculum progress lives in the learner's synced Storage document.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.resumeAnalysis')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const body = (await readJson(req)) as { resumeId?: string; curriculum?: unknown }
    const resume = body?.resumeId ? await getResume(access.userId!, body.resumeId) : await currentResume(access.userId!)
    if (!resume) throw new ValidationError('Upload a resume first', 'resumeId')
    if (!resume.profile || !resume.text) throw new ValidationError('This resume has no readable text to analyse', 'resumeId')
    const usage = await consumeUsage(access.userId!, 'resume.analysis', access.limits.resumeAnalysesPerDay)
    if (!usage.allowed) return NextResponse.json({ error: `You have used today's ${usage.limit} resume analyses. They reset at midnight UTC.`, code: 'limit', usage }, { status: 429 })
    const curriculum = parseCurriculum(body?.curriculum)
    const report = analyzeResumeForJob(job, resume.id, resume.profile, resume.text, curriculum)
    // The learner explicitly started this analysis; structured facts (never the resume text) may go to one AI provider.
    report.aiInsights = await resumeInsights(access.userId!, report, job)
    const stored = await saveAnalysis(access.userId!, resume.id, job.id, report)
    return NextResponse.json({ analysis: stored, usage: { used: usage.used, limit: usage.limit }, resume: { id: resume.id, title: resume.title } })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/resume-analysis')
  }
}

/** Body: { analysisId, suggestionId, state: 'saved' | 'dismissed' | 'completed' | null } */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    await ctx.params
    const body = (await readJson(req)) as { analysisId?: string; suggestionId?: string; state?: string | null }
    if (!body?.analysisId || !body?.suggestionId) throw new ValidationError('analysisId and suggestionId are required')
    const state = body.state === 'saved' || body.state === 'dismissed' || body.state === 'completed' ? body.state : null
    const analysis = await setSuggestionState(access.userId, body.analysisId, body.suggestionId, state)
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    return NextResponse.json({ analysis })
  } catch (error) {
    return errorResponse(error, 'PATCH /api/jobs/[id]/resume-analysis')
  }
}

type CurriculumInput = Parameters<typeof analyzeResumeForJob>[4]

/** Accepts only the fields the analysis reads; anything else is dropped. */
function parseCurriculum(value: unknown): CurriculumInput {
  if (!value || typeof value !== 'object') return null
  const tracks = (value as { tracks?: unknown }).tracks
  if (!Array.isArray(tracks)) return null
  const clean = tracks
    .filter((t): t is { track: { id: string; title: string }; gapStatus: string; skills: unknown } => Boolean(t && typeof t === 'object' && (t as { track?: { id?: unknown } }).track && typeof (t as { track: { id?: unknown } }).track.id === 'string'))
    .slice(0, 20)
    .map((t) => ({
      track: { id: String(t.track.id), title: String(t.track.title || t.track.id) },
      gapStatus: (['covered', 'learning', 'not_covered'].includes(t.gapStatus) ? t.gapStatus : 'not_covered') as 'covered' | 'learning' | 'not_covered',
      skills: Array.isArray(t.skills) ? t.skills.map(String).slice(0, 10) : [],
    }))
  return { tracks: clean } as unknown as CurriculumInput
}
