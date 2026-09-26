import { NextResponse } from 'next/server'
import { parseSourceInput } from '../../../../lib/jobs/normalize'
import { errorResponse, pageParams, readJson } from '../../../../lib/server/apiErrors'
import { createSource, listSources } from '../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    return NextResponse.json(await listSources({ q: url.searchParams.get('q') || undefined, ...pageParams(url) }))
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/sources')
  }
}

export async function POST(req: Request) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const source = await createSource(parseSourceInput(await readJson(req)), actor.userId)
    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/sources')
  }
}
