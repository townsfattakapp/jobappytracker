import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../../../../lib/server/entitlements'
import { deleteOutreach, updateOutreach } from '../../../../../../lib/server/outreach'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; contactId: string }> }) {
  try {
    const access = await requireFeature('jobs.outreachTracker')
    if (isResponse(access)) return access
    const { id, contactId } = await ctx.params
    const contact = await updateOutreach(access.userId!, id, contactId, await readJson(req))
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    return NextResponse.json({ contact })
  } catch (error) {
    return errorResponse(error, 'PATCH /api/jobs/[id]/outreach/[contactId]')
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; contactId: string }> }) {
  try {
    const access = await requireFeature('jobs.outreachTracker')
    if (isResponse(access)) return access
    const { id, contactId } = await ctx.params
    const ok = await deleteOutreach(access.userId!, id, contactId)
    if (!ok) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'DELETE /api/jobs/[id]/outreach/[contactId]')
  }
}
