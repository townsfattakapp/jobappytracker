import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { adminAuditLog, users } from '../db/schema'

/** Records who changed what in the admin panel. Called inside the same request as the change. */
export async function recordAudit(input: {
  actorId: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: unknown
  after?: unknown
}): Promise<void> {
  await db.insert(adminAuditLog).values({
    id: crypto.randomUUID(),
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
  })
}

export interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  before: unknown
  after: unknown
  createdAt: string
  actor: { id: string; email: string | null; name: string | null } | null
}

export async function listAudit(opts: { page?: number; pageSize?: number; entityType?: string; entityId?: string } = {}): Promise<{ items: AuditEntry[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25))
  const where = opts.entityId
    ? eq(adminAuditLog.entityId, opts.entityId)
    : opts.entityType
      ? eq(adminAuditLog.entityType, opts.entityType)
      : undefined
  const rows = await db
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      entityType: adminAuditLog.entityType,
      entityId: adminAuditLog.entityId,
      before: adminAuditLog.before,
      after: adminAuditLog.after,
      createdAt: adminAuditLog.createdAt,
      actorId: adminAuditLog.actorId,
      actorEmail: users.email,
      actorName: users.name,
    })
    .from(adminAuditLog)
    .leftJoin(users, eq(users.id, adminAuditLog.actorId))
    .where(where)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(adminAuditLog).where(where)
  return {
    items: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      before: r.before,
      after: r.after,
      createdAt: r.createdAt.toISOString(),
      actor: r.actorId ? { id: r.actorId, email: r.actorEmail, name: r.actorName } : null,
    })),
    total: count,
    page,
    pageSize,
  }
}
