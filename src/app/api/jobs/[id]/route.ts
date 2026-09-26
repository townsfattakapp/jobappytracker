import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { jobFreshness } from '../../../../lib/jobs/normalize'
import { rankJob } from '../../../../lib/jobs/relevance'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { getJob, getPreferences } from '../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

/** One published job with freshness and, for signed-in learners with preferences, the relevance breakdown. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const session = await auth()
    const prefs = session?.user?.id ? await getPreferences(session.user.id) : null
    const now = new Date()
    return NextResponse.json({ ...job, freshness: jobFreshness(job, now), relevance: prefs ? rankJob(job, prefs, now) : null })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]')
  }
}
