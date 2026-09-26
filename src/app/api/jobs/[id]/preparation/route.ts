import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import type { PrepBlueprint } from '../../../../../lib/jobs/prepare'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { consumeUsage, isResponse, requireFeature, resolveAccess } from '../../../../../lib/server/entitlements'
import { getJob, getPreferences } from '../../../../../lib/server/jobs'
import { getPreparation, savePreparation } from '../../../../../lib/server/outreach'
import { currentResume, getAnalysisForJob } from '../../../../../lib/server/resumes'

export const dynamic = 'force-dynamic'

/** Stored preparation record for this job (owner only). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    return NextResponse.json({ preparation: await getPreparation(access.userId, id) })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]/preparation')
  }
}

/**
 * Gate + inputs for "Prepare for this job": requires jobs.preparation and
 * returns the server-held inputs (job, preferences, stored resume analysis,
 * resume profile). The blueprint is computed on the client with the
 * curriculum registry and progress, then stored through PUT.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.preparation')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const [preferences, analysis, resume] = await Promise.all([getPreferences(access.userId!), getAnalysisForJob(access.userId!, id), currentResume(access.userId!)])
    return NextResponse.json({ job, preferences, analysis, profile: resume?.profile ?? null })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/preparation')
  }
}

/**
 * Saves preparation state. Body: { blueprint?, durationDays?, planAdded?: { goalId, taskCount }, completedItemIds? }.
 * A planAdded write counts one use against preparationPlansPerDay.
 */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.preparation')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const body = (await readJson(req)) as { blueprint?: PrepBlueprint; durationDays?: number | null; planAdded?: { goalId?: string; taskCount?: number }; completedItemIds?: unknown }
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    const patch: Parameters<typeof savePreparation>[2] = {}
    if (body.blueprint) {
      if (typeof body.blueprint !== 'object' || body.blueprint.jobId !== id || !Array.isArray(body.blueprint.mustPrepare)) throw new ValidationError('Invalid blueprint', 'blueprint')
      patch.blueprint = body.blueprint
    }
    if (body.durationDays !== undefined) {
      if (body.durationDays !== null && ![7, 14, 30].includes(Number(body.durationDays))) throw new ValidationError('Duration must be 7, 14 or 30 days', 'durationDays')
      patch.durationDays = body.durationDays === null ? null : Number(body.durationDays)
    }
    if (body.planAdded) {
      const usage = await consumeUsage(access.userId!, 'jobs.prepPlans', access.limits.preparationPlansPerDay)
      if (!usage.allowed) return NextResponse.json({ error: `You have used today's ${usage.limit} preparation plans. They reset at midnight UTC.`, code: 'limit', usage }, { status: 429 })
      patch.planGoalId = typeof body.planAdded.goalId === 'string' ? body.planAdded.goalId : null
      patch.planAddedAt = new Date()
      patch.addedTaskCount = Math.max(0, Number(body.planAdded.taskCount) || 0)
    }
    if (body.completedItemIds !== undefined) {
      if (!Array.isArray(body.completedItemIds)) throw new ValidationError('completedItemIds must be a list', 'completedItemIds')
      patch.completedItemIds = Array.from(new Set(body.completedItemIds.map(String))).slice(0, 200)
    }
    return NextResponse.json({ preparation: await savePreparation(access.userId!, id, patch) })
  } catch (error) {
    return errorResponse(error, 'PUT /api/jobs/[id]/preparation')
  }
}
