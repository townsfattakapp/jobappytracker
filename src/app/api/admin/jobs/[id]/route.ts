import { NextResponse } from 'next/server'
import { parseJobInput, ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { getJob, transitionJob, updateJob, type JobTransition } from '../../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

const TRANSITIONS: JobTransition[] = ['publish', 'unpublish', 'expire', 'archive', 'verify']

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: false })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/jobs/[id]')
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const job = await updateJob(id, parseJobInput(await readJson(req)), actor.userId)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/jobs/[id]')
  }
}

/** Status transitions: { transition: 'publish' | 'unpublish' | 'expire' | 'archive' | 'verify' } */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const body = (await readJson(req)) as { transition?: string }
    const transition = body?.transition as JobTransition
    if (!TRANSITIONS.includes(transition)) throw new ValidationError(`transition must be one of ${TRANSITIONS.join(', ')}`, 'transition')
    const job = await transitionJob(id, transition, actor.userId)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return errorResponse(error, 'PATCH /api/admin/jobs/[id]')
  }
}
