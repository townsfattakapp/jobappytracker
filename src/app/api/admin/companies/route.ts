import { NextResponse } from 'next/server'
import { parseCompanyInput } from '../../../../lib/jobs/normalize'
import { errorResponse, pageParams, readJson } from '../../../../lib/server/apiErrors'
import { createCompany, listCompanies } from '../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    return NextResponse.json(await listCompanies({ q: url.searchParams.get('q') || undefined, status: url.searchParams.get('status') || undefined, ...pageParams(url) }))
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/companies')
  }
}

export async function POST(req: Request) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const company = await createCompany(parseCompanyInput(await readJson(req)), actor.userId)
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/companies')
  }
}
