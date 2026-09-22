import { set, get, del, entries } from 'idb-keyval'
import type { DsaAttempt, LabAttemptDetail, InterviewSessionTranscript, SystemDesignAttemptDetail } from './types'

export async function saveAttachmentFile(id: string, file: File): Promise<void> {
  await set(`attachment-${id}`, file)
}

export async function getAttachmentFile(id: string): Promise<File | undefined> {
  return await get(`attachment-${id}`)
}

export async function deleteAttachmentFile(id: string): Promise<void> {
  await del(`attachment-${id}`)
}

export async function saveDsaAttempt(attempt: DsaAttempt): Promise<void> {
  const attempts = await getDsaAttempts(attempt.problemId)
  const existingIndex = attempts.findIndex(a => a.id === attempt.id)
  if (existingIndex >= 0) {
    attempts[existingIndex] = attempt
  } else {
    attempts.push(attempt)
  }
  await set(`dsa-attempts-${attempt.problemId}`, attempts)
}

export async function getDsaAttempts(problemId: string): Promise<DsaAttempt[]> {
  const attempts = await get(`dsa-attempts-${problemId}`)
  return attempts || []
}

export async function deleteDsaAttempts(problemId: string): Promise<void> {
  await del(`dsa-attempts-${problemId}`)
}

export async function saveLabAttemptDetail(detail: LabAttemptDetail): Promise<void> {
  await set(`lab-attempt-${detail.id}`, detail)
}

export async function getLabAttemptDetail(id: string): Promise<LabAttemptDetail | undefined> {
  return await get(`lab-attempt-${id}`)
}

export async function deleteLabAttemptDetail(id: string): Promise<void> {
  await del(`lab-attempt-${id}`)
}

export async function saveInterviewSessionTranscript(transcript: InterviewSessionTranscript): Promise<void> {
  await set(`interview-session-${transcript.id}`, transcript)
}

export async function getInterviewSessionTranscript(id: string): Promise<InterviewSessionTranscript | undefined> {
  return await get(`interview-session-${id}`)
}

export async function deleteInterviewSessionTranscript(id: string): Promise<void> {
  await del(`interview-session-${id}`)
}

export async function saveSystemDesignAttemptDetail(detail: SystemDesignAttemptDetail): Promise<void> {
  const attempts = await getSystemDesignAttemptDetails(detail.exerciseId)
  const existingIndex = attempts.findIndex(a => a.id === detail.id)
  if (existingIndex >= 0) {
    attempts[existingIndex] = detail
  } else {
    attempts.push(detail)
  }
  await set(`system-design-${detail.exerciseId}`, attempts)
}

export async function getSystemDesignAttemptDetails(exerciseId: string): Promise<SystemDesignAttemptDetail[]> {
  const attempts = await get(`system-design-${exerciseId}`)
  return attempts || []
}

/** Fired on window after cloud history lands in IndexedDB, so open pages can reload their attempt lists. */
export const HISTORY_IMPORTED_EVENT = 'jobappy:history-imported'

const HISTORY_PREFIXES = ['dsa-attempts-', 'lab-attempt-', 'interview-session-', 'system-design-']
/** Attachments above this size, or beyond the total budget, stay on the device that uploaded them. */
const ATTACHMENT_MAX_BYTES = 1_000_000
const ATTACHMENT_BUDGET_BYTES = 12_000_000
const attachmentCache = new Map<string, string>()

type PackedFile = { __file: true; name: string; type: string; lastModified: number; data: string }

async function packFile(id: string, file: File): Promise<PackedFile> {
  let data = attachmentCache.get(id)
  if (!data) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    data = btoa(binary)
    attachmentCache.set(id, data)
  }
  return { __file: true, name: file.name, type: file.type, lastModified: file.lastModified, data }
}

function unpackFile(packed: PackedFile): File {
  const binary = atob(packed.data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], packed.name, { type: packed.type, lastModified: packed.lastModified })
}

/** Everything in IndexedDB that belongs in the cloud snapshot: attempt details, transcripts and small attachments. */
export async function exportLocalHistory(): Promise<string> {
  const allEntries = await entries()
  const history: [IDBValidKey, unknown][] = []
  let budget = ATTACHMENT_BUDGET_BYTES
  for (const [key, value] of allEntries) {
    const k = String(key)
    if (HISTORY_PREFIXES.some((p) => k.startsWith(p))) history.push([key, value])
    else if (k.startsWith('attachment-') && value instanceof File && value.size <= ATTACHMENT_MAX_BYTES && value.size <= budget) {
      budget -= value.size
      history.push([key, await packFile(k, value)])
    }
  }
  return JSON.stringify(history)
}

export async function importLocalHistory(jsonString: string): Promise<number> {
  try {
    const history = JSON.parse(jsonString) as [IDBValidKey, unknown][]
    if (!Array.isArray(history)) throw new Error('Invalid format')
    let imported = 0
    for (const [key, value] of history) {
      if (typeof key !== 'string') continue
      if (key.startsWith('attachment-')) {
        const packed = value as PackedFile | null
        if (!packed || !packed.__file) continue
        if (!(await get(key))) {
          await set(key, unpackFile(packed))
          attachmentCache.set(key, packed.data)
          imported++
        }
        continue
      }
      if (!HISTORY_PREFIXES.some((p) => key.startsWith(p))) continue
      const existing = await get(key)
      if (Array.isArray(existing) && Array.isArray(value)) {
        // Merge arrays by id; imported items win on conflict.
        const merged = new Map((existing as { id: string }[]).map((item) => [item.id, item]))
        for (const item of value as { id: string }[]) merged.set(item.id, item)
        await set(key, Array.from(merged.values()))
      } else {
        await set(key, value)
      }
      imported++
    }
    if (imported && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(HISTORY_IMPORTED_EVENT, { detail: imported }))
    return imported
  } catch (e) {
    console.error('Failed to import local history', e)
    return 0
  }
}
