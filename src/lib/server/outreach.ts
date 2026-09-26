import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { jobPreparations, outreachContacts, OUTREACH_STATUSES, type OutreachStatus } from '../db/schema'
import { CONTACT_TYPES, MESSAGE_TYPES, type ContactType, type MessageType } from '../jobs/networking'
import { optionalUrl, ValidationError } from '../jobs/normalize'
import type { PrepBlueprint } from '../jobs/prepare'

/** Learner-entered outreach contacts and the per-job preparation record. All owner-scoped. */

export interface OutreachContactDto {
  id: string
  jobId: string
  name: string
  role: string | null
  contactType: ContactType
  profileUrl: string | null
  messageType: MessageType | null
  contactedAt: string | null
  status: OutreachStatus
  followUpDate: string | null
  notes: string | null
  draft: string | null
  createdAt: string
  updatedAt: string
}

const toDto = (r: typeof outreachContacts.$inferSelect): OutreachContactDto => ({
  id: r.id,
  jobId: r.jobId,
  name: r.name,
  role: r.role,
  contactType: r.contactType as ContactType,
  profileUrl: r.profileUrl,
  messageType: r.messageType as MessageType | null,
  contactedAt: r.contactedAt,
  status: r.status,
  followUpDate: r.followUpDate,
  notes: r.notes,
  draft: r.draft,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
})

export interface OutreachInput {
  name: string
  role: string | null
  contactType: ContactType
  profileUrl: string | null
  messageType: MessageType | null
  contactedAt: string | null
  status: OutreachStatus
  followUpDate: string | null
  notes: string | null
  draft: string | null
}

const str = (v: unknown, max: number) => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s ? s.slice(0, max) : null
}
const isoDay = (v: unknown, field: string): string | null => {
  const s = str(v, 10)
  if (!s) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new ValidationError(`${field} must be a date (YYYY-MM-DD)`, field)
  return s
}

export function parseOutreachInput(body: unknown, partial = false, existing?: OutreachInput): OutreachInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const base: OutreachInput = existing ?? { name: '', role: null, contactType: 'other', profileUrl: null, messageType: null, contactedAt: null, status: 'not_contacted', followUpDate: null, notes: null, draft: null }
  const out: OutreachInput = { ...base }
  if (!partial || b.name !== undefined) {
    const name = str(b.name, 120)
    if (!name) throw new ValidationError('Contact name is required', 'name')
    out.name = name
  }
  if (!partial || b.role !== undefined) out.role = str(b.role, 120)
  if (!partial || b.contactType !== undefined) {
    const t = str(b.contactType, 40)
    if (!t || !CONTACT_TYPES.some((c) => c.id === t)) throw new ValidationError('Choose a contact type', 'contactType')
    out.contactType = t as ContactType
  }
  if (!partial || b.profileUrl !== undefined) out.profileUrl = optionalUrl(b.profileUrl, 'Profile URL')
  if (!partial || b.messageType !== undefined) {
    const m = str(b.messageType, 40)
    if (m && !MESSAGE_TYPES.some((x) => x.id === m)) throw new ValidationError('Unknown message type', 'messageType')
    out.messageType = (m as MessageType) || null
  }
  if (!partial || b.contactedAt !== undefined) out.contactedAt = isoDay(b.contactedAt, 'Date contacted')
  if (!partial || b.status !== undefined) {
    const s = str(b.status, 40) || 'not_contacted'
    if (!(OUTREACH_STATUSES as readonly string[]).includes(s)) throw new ValidationError('Unknown status', 'status')
    out.status = s as OutreachStatus
  }
  if (!partial || b.followUpDate !== undefined) out.followUpDate = isoDay(b.followUpDate, 'Follow-up date')
  if (!partial || b.notes !== undefined) out.notes = str(b.notes, 4000)
  if (!partial || b.draft !== undefined) out.draft = str(b.draft, 4000)
  return out
}

export async function listOutreach(userId: string, jobId: string): Promise<OutreachContactDto[]> {
  const rows = await db.select().from(outreachContacts).where(and(eq(outreachContacts.userId, userId), eq(outreachContacts.jobId, jobId))).orderBy(desc(outreachContacts.updatedAt))
  return rows.map(toDto)
}

export async function createOutreach(userId: string, jobId: string, input: OutreachInput): Promise<OutreachContactDto> {
  const now = new Date()
  const [row] = await db.insert(outreachContacts).values({ id: crypto.randomUUID(), userId, jobId, ...input, createdAt: now, updatedAt: now }).returning()
  return toDto(row)
}

export async function updateOutreach(userId: string, jobId: string, id: string, body: unknown): Promise<OutreachContactDto | null> {
  const existing = await db.query.outreachContacts.findFirst({ where: and(eq(outreachContacts.id, id), eq(outreachContacts.userId, userId), eq(outreachContacts.jobId, jobId)) })
  if (!existing) return null
  const current: OutreachInput = { name: existing.name, role: existing.role, contactType: existing.contactType as ContactType, profileUrl: existing.profileUrl, messageType: existing.messageType as MessageType | null, contactedAt: existing.contactedAt, status: existing.status, followUpDate: existing.followUpDate, notes: existing.notes, draft: existing.draft }
  const input = parseOutreachInput(body, true, current)
  const [row] = await db.update(outreachContacts).set({ ...input, updatedAt: new Date() }).where(eq(outreachContacts.id, id)).returning()
  return toDto(row)
}

export async function deleteOutreach(userId: string, jobId: string, id: string): Promise<boolean> {
  const rows = await db.delete(outreachContacts).where(and(eq(outreachContacts.id, id), eq(outreachContacts.userId, userId), eq(outreachContacts.jobId, jobId))).returning({ id: outreachContacts.id })
  return rows.length > 0
}

// ---------------------------------------------------------------------------
// Preparation record
// ---------------------------------------------------------------------------

export interface PreparationDto {
  id: string
  jobId: string
  blueprint: PrepBlueprint
  durationDays: number | null
  planGoalId: string | null
  planAddedAt: string | null
  addedTaskCount: number
  completedItemIds: string[]
  createdAt: string
  updatedAt: string
}

const toPrep = (r: typeof jobPreparations.$inferSelect): PreparationDto => ({ id: r.id, jobId: r.jobId, blueprint: r.blueprint as PrepBlueprint, durationDays: r.durationDays, planGoalId: r.planGoalId, planAddedAt: r.planAddedAt ? r.planAddedAt.toISOString() : null, addedTaskCount: r.addedTaskCount, completedItemIds: r.completedItemIds || [], createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })

export async function getPreparation(userId: string, jobId: string): Promise<PreparationDto | null> {
  const row = await db.query.jobPreparations.findFirst({ where: and(eq(jobPreparations.userId, userId), eq(jobPreparations.jobId, jobId)) })
  return row ? toPrep(row) : null
}

export async function savePreparation(userId: string, jobId: string, patch: { blueprint?: PrepBlueprint; durationDays?: number | null; planGoalId?: string | null; planAddedAt?: Date | null; addedTaskCount?: number; completedItemIds?: string[] }): Promise<PreparationDto> {
  const now = new Date()
  const existing = await db.query.jobPreparations.findFirst({ where: and(eq(jobPreparations.userId, userId), eq(jobPreparations.jobId, jobId)) })
  if (!existing) {
    if (!patch.blueprint) throw new ValidationError('A blueprint is required before saving preparation state', 'blueprint')
    const [row] = await db.insert(jobPreparations).values({ id: crypto.randomUUID(), userId, jobId, blueprint: patch.blueprint, durationDays: patch.durationDays ?? null, planGoalId: patch.planGoalId ?? null, planAddedAt: patch.planAddedAt ?? null, addedTaskCount: patch.addedTaskCount ?? 0, completedItemIds: patch.completedItemIds ?? [], createdAt: now, updatedAt: now }).returning()
    return toPrep(row)
  }
  const set: Partial<typeof jobPreparations.$inferInsert> = { updatedAt: now }
  if (patch.blueprint) set.blueprint = patch.blueprint
  if (patch.durationDays !== undefined) set.durationDays = patch.durationDays
  if (patch.planGoalId !== undefined) set.planGoalId = patch.planGoalId
  if (patch.planAddedAt !== undefined) set.planAddedAt = patch.planAddedAt
  if (patch.addedTaskCount !== undefined) set.addedTaskCount = patch.addedTaskCount
  if (patch.completedItemIds !== undefined) set.completedItemIds = patch.completedItemIds
  const [row] = await db.update(jobPreparations).set(set).where(eq(jobPreparations.id, existing.id)).returning()
  return toPrep(row)
}
