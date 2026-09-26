import { NextResponse } from 'next/server'
import { errorResponse, pageParams } from '../../../../lib/server/apiErrors'
import { listUsers } from '../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    return NextResponse.json(await listUsers({ q: url.searchParams.get('q')?.trim() || undefined, role: url.searchParams.get('role') || undefined, ...pageParams(url) }))
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/users')
  }
}
