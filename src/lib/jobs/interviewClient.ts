import { api } from '../adminClient'
import type { DerivedConfig, InterviewConfig, InterviewMode, SectionId } from '../interview/jobInterview'
import type { AccessForInterview, HistoryItem, SessionDto } from '../server/interviews'
import type { KnowledgeWorkspace, RoadmapDay } from '../../types'

/** Client helpers for job-specific mock interviews (Phase 6). */

export interface InterviewOverview {
  access: AccessForInterview
  limits: { day: { used: number; limit: number }; month: { used: number; limit: number } }
  history: HistoryItem[]
  historyTotal: number
  active: SessionDto | null
}

export interface DeriveResponse {
  derived: DerivedConfig
  context: { missingInputs: string[]; resumeProjects: string[]; gaps: string[]; dsaDepth: string; designDepth: string; experienceYears: number | null }
  access: AccessForInterview
}

/** Topic status from the learner's roadmap and workspaces; the server never sees curriculum progress otherwise. */
export function progressSummary(roadmap: RoadmapDay[], knowledgeWorkspaces: KnowledgeWorkspace[]): Record<string, 'done' | 'started' | 'none'> {
  const out: Record<string, 'done' | 'started' | 'none'> = {}
  for (const w of knowledgeWorkspaces) {
    if (w.learningStatus === 'Mastered') out[w.topicId] = 'done'
    else if (w.learningStatus !== 'Not Started') out[w.topicId] = 'started'
  }
  const byTopic = new Map<string, { any: boolean; allDone: boolean; someDone: boolean }>()
  for (const d of roadmap)
    for (const t of d.tasks) {
      if (!t.topicId) continue
      const e = byTopic.get(t.topicId) ?? { any: false, allDone: true, someDone: false }
      e.any = true
      if (t.status === 'Completed') e.someDone = true
      if (t.status !== 'Completed' && t.status !== 'Skipped') e.allDone = false
      byTopic.set(t.topicId, e)
    }
  for (const [topicId, e] of byTopic) {
    if (e.any && e.allDone && e.someDone) out[topicId] = 'done'
    else if (e.someDone && out[topicId] !== 'done') out[topicId] = 'started'
  }
  return out
}

export const fetchInterviewOverview = (jobId: string) => api<InterviewOverview>(`/api/jobs/${encodeURIComponent(jobId)}/interviews`)

export const deriveInterview = (jobId: string, body: { progress: Record<string, string>; compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null }) => api<DeriveResponse>(`/api/jobs/${encodeURIComponent(jobId)}/interviews`, { method: 'POST', json: { action: 'derive', ...body } })

export const startInterview = (jobId: string, body: { progress: Record<string, string>; compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null; config: Partial<InterviewConfig>; mode: InterviewMode; parentSessionId?: string | null; sectionId?: SectionId | null; language?: string; resume?: boolean }) => api<{ session: SessionDto; resumed: boolean }>(`/api/jobs/${encodeURIComponent(jobId)}/interviews`, { method: 'POST', json: { action: 'start', ...body } })

export const fetchInterviewSession = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`)

export const sendInterviewTurn = (id: string, body: { questionId: string; kind: 'answer' | 'skip'; text?: string; code?: string | null; language?: string | null; diagram?: string | null }) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'turn', ...body } })

export const completeInterview = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'complete' } })

export const abandonInterview = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'abandon' } })

export const recordInterviewPlan = (id: string, taskCount: number) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'plan_added', taskCount } })

export const fetchAllInterviews = () => api<{ history: HistoryItem[]; total: number }>('/api/interviews')
