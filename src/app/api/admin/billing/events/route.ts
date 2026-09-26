import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { activeProvider } from '../../../../../lib/billing/providers'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'
import { webhookHealth } from '../../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const health = await webhookHealth(db)
    return NextResponse.json({ ...health, provider: activeProvider()?.id ?? null })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/billing/events')
  }
}
