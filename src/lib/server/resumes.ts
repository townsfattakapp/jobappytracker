import { createHash } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { resumeAnalyses, resumeProfiles, resumes } from '../db/schema'
import { ValidationError } from '../jobs/normalize'
import { ROLE_CATEGORY_IDS } from '../jobs/taxonomy'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import { EXTRACTOR_VERSION, extractResumeProfile, type ResumeProfile } from '../resume/extract'

/**
 * Resume storage and access. Every function takes the owner's user id and
 * filters by it, so a caller can never reach another learner's resume.
 * File bytes live in the database; nothing is written to disk or a CDN and
 * resume content is never logged.
 */

export const MAX_RESUME_BYTES = 2 * 1024 * 1024
export const MAX_RESUMES_PER_USER = 10

export interface ResumeMeta {
  id: string
  title: string
  filename: string
  mimeType: string
  sizeBytes: number
  targetRoleCategory: string | null
  isCurrent: boolean
  uploadedAt: string
  updatedAt: string
  extracted: boolean
  warnings: string[]
}

export interface ResumeDetail extends ResumeMeta {
  profile: ResumeProfile | null
  text: string | null
  extractorVersion: string | null
}

/** Removes characters that could be used for path or header injection in a stored/displayed filename. */
export function safeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() || 'resume'
  const cleaned = base.replace(/[^\w.() -]+/g, '_').replace(/\.{2,}/g, '.').trim().slice(0, 120)
  return cleaned || 'resume'
}

export type ResumeKind = 'pdf' | 'text'

/** Validates type and size from the bytes themselves, not the declared content type. */
export function sniffResume(bytes: Uint8Array, declaredType: string, filename: string): ResumeKind {
  if (bytes.length === 0) throw new ValidationError('The file is empty', 'file')
  if (bytes.length > MAX_RESUME_BYTES) throw new ValidationError(`Resumes must be ${MAX_RESUME_BYTES / 1024 / 1024} MB or smaller`, 'file')
  const head = Buffer.from(bytes.subarray(0, 5)).toString('latin1')
  if (head.startsWith('%PDF-')) return 'pdf'
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'txt' || ext === 'md' || declaredType.startsWith('text/')) {
    const sample = Buffer.from(bytes.subarray(0, 512))
    if (sample.includes(0)) throw new ValidationError('Text resumes must be plain text', 'file')
    return 'text'
  }
  throw new ValidationError('Upload a PDF (or plain text) resume; DOCX is not supported yet', 'file')
}

async function extractText(bytes: Uint8Array, kind: ResumeKind): Promise<string> {
  if (kind === 'text') return Buffer.from(bytes).toString('utf8')
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: bytes })
  try {
    const result = await parser.getText()
    // pdf-parse appends "-- n of m --" page separators; they are not resume content.
    return result.text.replace(/\n?-- \d+ of \d+ --\n?/g, '\n').trim()
  } finally {
    await parser.destroy()
  }
}

function meta(row: typeof resumes.$inferSelect, profile?: typeof resumeProfiles.$inferSelect | null): ResumeMeta {
  return {
    id: row.id,
    title: row.title,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    targetRoleCategory: row.targetRoleCategory,
    isCurrent: row.isCurrent,
    uploadedAt: row.uploadedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    extracted: Boolean(profile),
    warnings: profile?.warnings || [],
  }
}

export async function listResumes(userId: string): Promise<ResumeMeta[]> {
  const rows = await db
    .select({ resume: resumes, profile: resumeProfiles })
    .from(resumes)
    .leftJoin(resumeProfiles, eq(resumeProfiles.resumeId, resumes.id))
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.isCurrent), desc(resumes.uploadedAt))
  return rows.map((r) => meta(r.resume, r.profile))
}

export async function getResume(userId: string, id: string): Promise<ResumeDetail | null> {
  const [row] = await db
    .select({ resume: resumes, profile: resumeProfiles })
    .from(resumes)
    .leftJoin(resumeProfiles, eq(resumeProfiles.resumeId, resumes.id))
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
  if (!row) return null
  return { ...meta(row.resume, row.profile), profile: (row.profile?.profile as ResumeProfile | undefined) ?? null, text: row.profile?.text ?? null, extractorVersion: row.profile?.extractorVersion ?? null }
}

/** The learner's current resume with its profile, or null. */
export async function currentResume(userId: string): Promise<ResumeDetail | null> {
  const [row] = await db.select({ id: resumes.id }).from(resumes).where(and(eq(resumes.userId, userId), eq(resumes.isCurrent, true)))
  return row ? getResume(userId, row.id) : null
}

/** Owner-only file bytes for download. */
export async function getResumeFile(userId: string, id: string): Promise<{ filename: string; mimeType: string; content: Buffer } | null> {
  const [row] = await db.select({ filename: resumes.filename, mimeType: resumes.mimeType, content: resumes.content }).from(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
  return row ? { filename: row.filename, mimeType: row.mimeType, content: Buffer.from(row.content) } : null
}

export async function uploadResume(userId: string, input: { bytes: Uint8Array; filename: string; declaredType: string; title?: string | null; targetRoleCategory?: string | null }): Promise<ResumeDetail> {
  const kind = sniffResume(input.bytes, input.declaredType, input.filename)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(resumes).where(eq(resumes.userId, userId))
  if (count >= MAX_RESUMES_PER_USER) throw new ValidationError(`You can keep up to ${MAX_RESUMES_PER_USER} resume versions; delete one first`, 'file')
  const filename = safeFilename(input.filename)
  const title = (input.title || '').trim().slice(0, 120) || filename.replace(/\.[^.]+$/, '')
  const targetRoleCategory = input.targetRoleCategory && ROLE_CATEGORY_IDS.includes(input.targetRoleCategory) ? input.targetRoleCategory : null
  let text = ''
  const warnings: string[] = []
  try {
    text = await extractText(input.bytes, kind)
  } catch {
    warnings.push('The file could not be read as text; it is stored, but analysis needs a text-based PDF.')
  }
  const extracted = extractResumeProfile(text)
  const now = new Date()
  const id = crypto.randomUUID()
  await db.transaction(async (tx) => {
    await tx.update(resumes).set({ isCurrent: false, updatedAt: now }).where(and(eq(resumes.userId, userId), eq(resumes.isCurrent, true)))
    await tx.insert(resumes).values({
      id,
      userId,
      title,
      filename,
      mimeType: kind === 'pdf' ? 'application/pdf' : 'text/plain',
      sizeBytes: input.bytes.length,
      sha256: createHash('sha256').update(input.bytes).digest('hex'),
      content: Buffer.from(input.bytes),
      targetRoleCategory,
      isCurrent: true,
      uploadedAt: now,
      updatedAt: now,
    })
    await tx.insert(resumeProfiles).values({ resumeId: id, text, profile: extracted.profile, extractorVersion: EXTRACTOR_VERSION, warnings: [...warnings, ...extracted.warnings], extractedAt: now })
  })
  return (await getResume(userId, id))!
}

export async function updateResume(userId: string, id: string, patch: { title?: string; targetRoleCategory?: string | null; isCurrent?: boolean }): Promise<ResumeDetail | null> {
  const existing = await db.query.resumes.findFirst({ where: and(eq(resumes.id, id), eq(resumes.userId, userId)), columns: { id: true } })
  if (!existing) return null
  const now = new Date()
  const set: Partial<typeof resumes.$inferInsert> = { updatedAt: now }
  if (patch.title !== undefined) {
    const title = patch.title.trim().slice(0, 120)
    if (!title) throw new ValidationError('Title is required', 'title')
    set.title = title
  }
  if (patch.targetRoleCategory !== undefined) {
    if (patch.targetRoleCategory && !ROLE_CATEGORY_IDS.includes(patch.targetRoleCategory)) throw new ValidationError('Unknown role category', 'targetRoleCategory')
    set.targetRoleCategory = patch.targetRoleCategory || null
  }
  await db.transaction(async (tx) => {
    if (patch.isCurrent) {
      await tx.update(resumes).set({ isCurrent: false, updatedAt: now }).where(and(eq(resumes.userId, userId), eq(resumes.isCurrent, true)))
      set.isCurrent = true
    }
    await tx.update(resumes).set(set).where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
  })
  return getResume(userId, id)
}

/** Deletes the file, its extracted profile and every analysis built on it (database cascades). */
export async function deleteResume(userId: string, id: string): Promise<boolean> {
  const rows = await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId))).returning({ id: resumes.id, wasCurrent: resumes.isCurrent })
  if (!rows.length) return false
  if (rows[0].wasCurrent) {
    const [next] = await db.select({ id: resumes.id }).from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.uploadedAt)).limit(1)
    if (next) await db.update(resumes).set({ isCurrent: true }).where(eq(resumes.id, next.id))
  }
  return true
}

// ---------------------------------------------------------------------------
// Analyses
// ---------------------------------------------------------------------------

export interface StoredAnalysis {
  id: string
  resumeId: string
  jobId: string
  report: ResumeAnalysisReport
  suggestionState: Record<string, 'saved' | 'dismissed' | 'completed'>
  createdAt: string
  updatedAt: string
}

const toAnalysis = (row: typeof resumeAnalyses.$inferSelect): StoredAnalysis => ({ id: row.id, resumeId: row.resumeId, jobId: row.jobId, report: row.report as ResumeAnalysisReport, suggestionState: row.suggestionState || {}, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() })

export async function saveAnalysis(userId: string, resumeId: string, jobId: string, report: ResumeAnalysisReport): Promise<StoredAnalysis> {
  const now = new Date()
  const [row] = await db
    .insert(resumeAnalyses)
    .values({ id: crypto.randomUUID(), userId, resumeId, jobId, report, suggestionState: {}, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: [resumeAnalyses.userId, resumeAnalyses.resumeId, resumeAnalyses.jobId], set: { report, updatedAt: now } })
    .returning()
  return toAnalysis(row)
}

export async function getAnalysisForJob(userId: string, jobId: string, resumeId?: string): Promise<StoredAnalysis | null> {
  const rows = await db
    .select()
    .from(resumeAnalyses)
    .where(and(eq(resumeAnalyses.userId, userId), eq(resumeAnalyses.jobId, jobId), resumeId ? eq(resumeAnalyses.resumeId, resumeId) : undefined))
    .orderBy(desc(resumeAnalyses.updatedAt))
    .limit(1)
  return rows.length ? toAnalysis(rows[0]) : null
}

export async function setSuggestionState(userId: string, analysisId: string, suggestionId: string, state: 'saved' | 'dismissed' | 'completed' | null): Promise<StoredAnalysis | null> {
  const row = await db.query.resumeAnalyses.findFirst({ where: and(eq(resumeAnalyses.id, analysisId), eq(resumeAnalyses.userId, userId)) })
  if (!row) return null
  const report = row.report as ResumeAnalysisReport
  if (!report.improvements.some((s) => s.id === suggestionId)) throw new ValidationError('Unknown suggestion', 'suggestionId')
  const next = { ...(row.suggestionState || {}) }
  if (state) next[suggestionId] = state
  else delete next[suggestionId]
  const [updated] = await db.update(resumeAnalyses).set({ suggestionState: next, updatedAt: new Date() }).where(eq(resumeAnalyses.id, analysisId)).returning()
  return toAnalysis(updated)
}
