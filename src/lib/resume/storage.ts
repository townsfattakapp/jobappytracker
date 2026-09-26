/**
 * Resume byte storage abstraction. Today the bytes live in the resumes.content
 * column (private, transactional, no public URL). The interface lets a
 * production deployment move bytes to private object storage (S3/R2 with
 * server-side signed access) without touching the resume service: metadata
 * stays in PostgreSQL, the store only handles bytes keyed by a safe id.
 *
 * Selection: RESUME_STORE=database (default) | object. The object store is a
 * documented stub until credentials exist; it refuses to run unconfigured so
 * a misconfiguration can never silently drop files.
 */

export interface ResumeStore {
  id: 'database' | 'object'
  /** Returns the storage key to persist with the metadata row. */
  put(input: { userId: string; resumeId: string; bytes: Uint8Array; mimeType: string }): Promise<string>
  get(key: string, fallback: Buffer | null): Promise<Buffer | null>
  delete(key: string): Promise<void>
}

/** Bytes in the database row: the key is the resume id; get/delete are no-ops handled by the row itself. */
export const databaseResumeStore: ResumeStore = {
  id: 'database',
  async put({ resumeId }) {
    return `db:${resumeId}`
  },
  async get(_key, fallback) {
    return fallback
  },
  async delete() {
    // Deleting the row removes the bytes.
  },
}

export function objectStoreConfigured(): boolean {
  return Boolean((process.env.RESUME_OBJECT_BUCKET || '').trim() && (process.env.RESUME_OBJECT_ENDPOINT || '').trim())
}

/**
 * Private object storage adapter (S3-compatible). Keys are
 * resumes/<userId>/<resumeId> and are never exposed; downloads always go
 * through the owner-checked /api/resumes/[id]/file route which streams the
 * bytes server-side (no presigned public URLs). Implementation is deferred
 * until a bucket exists; see docs/launch-readiness.md.
 */
export const objectResumeStore: ResumeStore = {
  id: 'object',
  async put() {
    throw new Error('Object resume storage is not configured on this deployment (RESUME_OBJECT_BUCKET / RESUME_OBJECT_ENDPOINT)')
  },
  async get() {
    throw new Error('Object resume storage is not configured on this deployment')
  },
  async delete() {
    throw new Error('Object resume storage is not configured on this deployment')
  },
}

export function resumeStore(): ResumeStore {
  const mode = (process.env.RESUME_STORE || 'database').trim().toLowerCase()
  if (mode === 'object') {
    if (!objectStoreConfigured()) throw new Error('RESUME_STORE=object but the object store is not configured')
    return objectResumeStore
  }
  return databaseResumeStore
}
