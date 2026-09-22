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

export async function exportLocalHistory(): Promise<string> {
  const allEntries = await entries()
  const history = allEntries.filter(([k]) => 
    (k as string).startsWith('dsa-attempts-') || 
    (k as string).startsWith('lab-attempt-') || 
    (k as string).startsWith('interview-session-') ||
    (k as string).startsWith('system-design-')
  )
  return JSON.stringify(history)
}

export async function importLocalHistory(jsonString: string): Promise<number> {
  try {
    const history = JSON.parse(jsonString) as [IDBValidKey, any][]
    if (!Array.isArray(history)) throw new Error('Invalid format')
    let imported = 0
    for (const [key, value] of history) {
      if (typeof key === 'string' && (
        key.startsWith('dsa-attempts-') ||
        key.startsWith('lab-attempt-') ||
        key.startsWith('interview-session-') ||
        key.startsWith('system-design-')
      )) {
        // Retrieve existing, but don't overwrite if not necessary or handle merging.
        // For simplicity, we just set it since arrays are tied to keys. In a real app we might merge.
        const existing = await get(key)
        if (Array.isArray(existing) && Array.isArray(value)) {
          // Merge arrays by ID
          const existingMap = new Map(existing.map((item: any) => [item.id, item]))
          for (const item of value) {
            existingMap.set(item.id, item) // Overwrites with imported if duplicate ID
          }
          await set(key, Array.from(existingMap.values()))
          imported++
        } else {
          // just set it
          await set(key, value)
          imported++
        }
      }
    }
    return imported
  } catch (e) {
    console.error('Failed to import local history', e)
    return 0
  }
}
