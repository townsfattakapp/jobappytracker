import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { consumeUsage, isResponse, requireFeature } from '../../../../../lib/server/entitlements'
import { getJob, getPreferences } from '../../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

/**
 * Starts a compatibility analysis for one job. The report itself is computed
 * deterministically on the client (it needs the learner's curriculum progress,
 * which lives in the synced Storage document); this endpoint is the gate:
 * it requires the jobs.matching feature and counts one use against the
 * caller's daily limit.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.matching')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const usage = await consumeUsage(access.userId!, 'jobs.analysis', access.limits.analysesPerDay)
    if (!usage.allowed) return NextResponse.json({ error: `You have used today's ${usage.limit} compatibility analyses. They reset at midnight UTC.`, code: 'limit', usage: { used: usage.used, limit: usage.limit } }, { status: 429 })
    const preferences = await getPreferences(access.userId!)
    return NextResponse.json({ job, preferences, usage: { used: usage.used, limit: usage.limit } })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/analysis')
  }
}
