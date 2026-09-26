import { NextResponse } from 'next/server'
import { parseCompanyInput } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { deleteCompany, updateCompany } from '../../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const company = await updateCompany(id, parseCompanyInput(await readJson(req)), actor.userId)
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    return NextResponse.json(company)
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/companies/[id]')
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const result = await deleteCompany(id, actor.userId)
    if (result === 'missing') return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    if (result === 'in_use') return NextResponse.json({ error: 'This company still has jobs. Archive or reassign them first.' }, { status: 409 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'DELETE /api/admin/companies/[id]')
  }
}
