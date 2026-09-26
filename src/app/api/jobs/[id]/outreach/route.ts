import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../../../lib/server/entitlements'
import { getJob } from '../../../../../lib/server/jobs'
import { createOutreach, listOutreach, parseOutreachInput } from '../../../../../lib/server/outreach'

export const dynamic = 'force-dynamic'

/** Outreach contacts the learner entered for this job (owner only). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.outreachTracker')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    return NextResponse.json({ contacts: await listOutreach(access.userId!, id) })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]/outreach')
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.outreachTracker')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const input = parseOutreachInput(await readJson(req))
    return NextResponse.json({ contact: await createOutreach(access.userId!, id, input) }, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/outreach')
  }
}
