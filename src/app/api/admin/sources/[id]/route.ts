import { NextResponse } from 'next/server'
import { parseSourceInput } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { deleteSource, updateSource } from '../../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const source = await updateSource(id, parseSourceInput(await readJson(req)), actor.userId)
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    return NextResponse.json(source)
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/sources/[id]')
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const result = await deleteSource(id, actor.userId)
    if (result === 'missing') return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'DELETE /api/admin/sources/[id]')
  }
}
