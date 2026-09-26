import { NextResponse } from 'next/server'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../../../lib/db'
import { billingSubscriptions, users } from '../../../../lib/db/schema'
import { errorResponse, pageParams } from '../../../../lib/server/apiErrors'
import { isResponse, requireRole } from '../../../../lib/server/rbac'
import { toDto } from '../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/** Read-only subscription list for support and admins (no payment mutation controls by design). */
export async function GET(req: Request) {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || ''
    const { page, pageSize } = pageParams(url)
    const where = status ? eq(billingSubscriptions.status, status as typeof billingSubscriptions.$inferSelect.status) : undefined
    const rows = await db
      .select({ sub: billingSubscriptions, email: users.email })
      .from(billingSubscriptions)
      .innerJoin(users, eq(users.id, billingSubscriptions.userId))
      .where(where)
      .orderBy(desc(billingSubscriptions.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(billingSubscriptions).where(where)
    const byStatus = await db.select({ status: billingSubscriptions.status, count: sql<number>`count(*)::int` }).from(billingSubscriptions).groupBy(billingSubscriptions.status)
    return NextResponse.json({ items: rows.map((r) => ({ ...toDto(r.sub), email: r.email })), total: count, page, pageSize, byStatus: Object.fromEntries(byStatus.map((b) => [b.status, b.count])) })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/subscriptions')
  }
}
