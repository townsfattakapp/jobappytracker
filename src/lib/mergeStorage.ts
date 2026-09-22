import type { KnowledgeWorkspace, RoadmapDay, Storage, StudyTask } from '../types'

/**
 * Merges a local snapshot with a newer cloud copy when two devices saved
 * concurrently. Collections are unioned by id; when both sides hold the same
 * record, the one with the later `updatedAt` wins, otherwise the local copy.
 * Nothing is deleted by a merge: a record that exists on either side survives.
 */

type WithId = { id: string; updatedAt?: string }

function newer<T extends { updatedAt?: string }>(local: T, cloud: T): T {
  if (local.updatedAt && cloud.updatedAt) return Date.parse(cloud.updatedAt) > Date.parse(local.updatedAt) ? cloud : local
  return local
}

export function mergeById<T extends WithId>(local: T[] = [], cloud: T[] = [], pick: (l: T, c: T) => T = newer): T[] {
  const byId = new Map<string, T>()
  for (const c of cloud) byId.set(c.id, c)
  for (const l of local) {
    const c = byId.get(l.id)
    byId.set(l.id, c ? pick(l, c) : l)
  }
  const seen = new Set<string>()
  const ordered: T[] = []
  for (const item of [...cloud, ...local]) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    ordered.push(byId.get(item.id) as T)
  }
  return ordered
}

const TASK_RANK: Record<StudyTask['status'], number> = { Pending: 0, InProgress: 1, Skipped: 2, Completed: 3 }

function mergeTask(local: StudyTask, cloud: StudyTask): StudyTask {
  // Progress is never lost: the more advanced status wins, ties keep local.
  return TASK_RANK[cloud.status] > TASK_RANK[local.status] ? { ...local, ...cloud } : { ...cloud, ...local }
}

function mergeDay(local: RoadmapDay, cloud: RoadmapDay): RoadmapDay {
  return { ...cloud, ...local, tasks: mergeById(local.tasks || [], cloud.tasks || [], mergeTask) }
}

function workspaceKey(w: KnowledgeWorkspace): string {
  return w.questionId ? `q:${w.questionId}` : `t:${w.topicId}`
}

function mergeWorkspace(local: KnowledgeWorkspace, cloud: KnowledgeWorkspace): KnowledgeWorkspace {
  return {
    ...cloud,
    ...local,
    notes: mergeById(local.notes || [], cloud.notes || []),
    examples: mergeById(local.examples || [], cloud.examples || []),
    diagrams: mergeById(local.diagrams || [], cloud.diagrams || []),
    codeSnippets: mergeById(local.codeSnippets || [], cloud.codeSnippets || []),
    flashcards: mergeById(local.flashcards || [], cloud.flashcards || []),
    mistakes: Array.from(new Set([...(cloud.mistakes || []), ...(local.mistakes || [])])),
    quizAnswers: { ...(cloud.quizAnswers || {}), ...(local.quizAnswers || {}) },
    userAnswers: local.userAnswers || cloud.userAnswers ? [...(cloud.userAnswers || []), ...(local.userAnswers || []).filter((a) => !(cloud.userAnswers || []).some((c) => c.date === a.date && c.mode === a.mode))] : undefined,
  }
}

export function mergeWorkspaces(local: KnowledgeWorkspace[] = [], cloud: KnowledgeWorkspace[] = []): KnowledgeWorkspace[] {
  const byKey = new Map<string, KnowledgeWorkspace>()
  for (const c of cloud) byKey.set(workspaceKey(c), c)
  for (const l of local) {
    const key = workspaceKey(l)
    const c = byKey.get(key)
    byKey.set(key, c ? mergeWorkspace(l, c) : l)
  }
  return Array.from(byKey.values())
}

function laterStamp(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a) return false
  if (!b) return true
  return Date.parse(a) >= Date.parse(b)
}

export function mergeStorage(local: Storage, cloud: Storage): Storage {
  return {
    ...cloud,
    ...local,
    version: 1,
    applications: mergeById(local.applications, cloud.applications),
    prepNotes: mergeById(local.prepNotes || [], cloud.prepNotes || []),
    goals: mergeById(local.goals, cloud.goals),
    roadmap: mergeById(local.roadmap, cloud.roadmap, mergeDay),
    dsaProblems: mergeById(local.dsaProblems, cloud.dsaProblems),
    dsaAttemptSummaries: mergeById(local.dsaAttemptSummaries, cloud.dsaAttemptSummaries),
    revisionItems: mergeById(local.revisionItems, cloud.revisionItems),
    engineeringLabs: mergeById(local.engineeringLabs, cloud.engineeringLabs),
    labAttemptSummaries: mergeById(local.labAttemptSummaries, cloud.labAttemptSummaries),
    mockInterviewSummaries: mergeById(local.mockInterviewSummaries, cloud.mockInterviewSummaries),
    systemDesignExercises: mergeById(local.systemDesignExercises, cloud.systemDesignExercises),
    systemDesignAttemptSummaries: mergeById(local.systemDesignAttemptSummaries, cloud.systemDesignAttemptSummaries),
    knowledgeWorkspaces: mergeWorkspaces(local.knowledgeWorkspaces, cloud.knowledgeWorkspaces),
    gmailSync: laterStamp(local.gmailSync?.lastSyncAt, cloud.gmailSync?.lastSyncAt) ? local.gmailSync : cloud.gmailSync || local.gmailSync,
    leetCodeConfig: laterStamp(local.leetCodeConfig?.lastSync, cloud.leetCodeConfig?.lastSync) ? local.leetCodeConfig : cloud.leetCodeConfig || local.leetCodeConfig,
    preferences: { ...(cloud.preferences || {}), ...(local.preferences || {}) },
    learningHistory: undefined,
  }
}
