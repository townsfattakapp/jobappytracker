import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../../../lib/server/entitlements'
import { getJob, getPreferences } from '../../../../../lib/server/jobs'
import { getAnalysisForJob } from '../../../../../lib/server/resumes'
import { strategyNarrative } from '../../../../../lib/server/aiEnrich'

export const dynamic = 'force-dynamic'

/**
 * Gate for the application strategy: requires jobs.applicationStrategy and
 * returns the server-held inputs (job, preferences, stored resume analysis).
 * The strategy itself is assembled on the client with the curriculum map.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.applicationStrategy')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const [preferences, analysis] = await Promise.all([getPreferences(access.userId!), getAnalysisForJob(access.userId!, id)])
    const narrative = await strategyNarrative(access.userId!, job, analysis?.report ?? null)
    return NextResponse.json({ job, preferences, analysis, narrative })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/strategy')
  }
}
