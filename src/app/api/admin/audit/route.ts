import { NextResponse } from 'next/server'
import { errorResponse, pageParams } from '../../../../lib/server/apiErrors'
import { listAudit } from '../../../../lib/server/audit'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    return NextResponse.json(await listAudit({ entityType: url.searchParams.get('entityType') || undefined, entityId: url.searchParams.get('entityId') || undefined, ...pageParams(url) }))
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/audit')
  }
}
