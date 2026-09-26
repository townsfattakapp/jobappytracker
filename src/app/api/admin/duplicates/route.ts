import { NextResponse } from 'next/server'
import { errorResponse, pageParams } from '../../../../lib/server/apiErrors'
import { listDuplicates } from '../../../../lib/server/ingestion'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json(await listDuplicates(pageParams(new URL(req.url))))
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/duplicates')
  }
}
