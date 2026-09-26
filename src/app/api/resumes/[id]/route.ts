import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../../lib/server/entitlements'
import { deleteResume, getResume, updateResume } from '../../../../lib/server/resumes'

export const dynamic = 'force-dynamic'

/** One resume with its extracted profile. 404 for anything the caller does not own. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const resume = await getResume(access.userId!, id)
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    return NextResponse.json(resume)
  } catch (error) {
    return errorResponse(error, 'GET /api/resumes/[id]')
  }
}

/** Body: { title?, targetRoleCategory?, isCurrent? } */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const body = (await readJson(req)) as { title?: string; targetRoleCategory?: string | null; isCurrent?: boolean }
    const resume = await updateResume(access.userId!, id, { title: typeof body?.title === 'string' ? body.title : undefined, targetRoleCategory: body?.targetRoleCategory === undefined ? undefined : body.targetRoleCategory, isCurrent: body?.isCurrent === true })
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    return NextResponse.json(resume)
  } catch (error) {
    return errorResponse(error, 'PATCH /api/resumes/[id]')
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const ok = await deleteResume(access.userId!, id)
    if (!ok) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'DELETE /api/resumes/[id]')
  }
}
