import { api } from '../adminClient'
import type { CandidateIntent } from '../interview/conversation'
import type { DerivedConfig, InterviewConfig, InterviewMode, SectionId, TurnLatency } from '../interview/jobInterview'
import type { AccessForInterview, HistoryItem, SessionDto } from '../server/interviews'
import type { TtsProviderId, TtsVoice } from '../server/tts'
import type { KnowledgeWorkspace, RoadmapDay } from '../../types'

/** Client helpers for job-specific mock interviews (Phase 6) and the voice-first interview room. */

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

/** What the server can offer the interview room right now (device / connection check). */
export interface VoiceConfig {
  voice: boolean
  premiumVoice: boolean
  replay: boolean
  tts: {
    /** 'premium' = server voice available to this learner; 'browser' = the browser's own speech synthesis (a fallback, never claimed as premium). */
    mode: 'premium' | 'browser'
    premiumConfigured: boolean
    provider: TtsProviderId | null
    providerLabel: string | null
    voices: TtsVoice[]
    defaultVoice: string | null
    rate: number
    locale: string
    silenceThinkingSec: number
    silenceClarifySec: number
    endOfSpeechSec: number
    enabled: boolean
    testLine: string
  }
  stt: { provider: 'browser' }
  ai: { available: boolean; enabled: boolean }
  diagnostics: boolean
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

export const startInterview = (jobId: string, body: { progress: Record<string, string>; compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null; config: Partial<InterviewConfig>; mode: InterviewMode; parentSessionId?: string | null; sectionId?: SectionId | null; language?: string; resume?: boolean; voice?: boolean }) => api<{ session: SessionDto; resumed: boolean }>(`/api/jobs/${encodeURIComponent(jobId)}/interviews`, { method: 'POST', json: { action: 'start', ...body } })

export const fetchInterviewSession = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`)

export interface TurnBody {
  questionId: string
  kind: 'answer' | 'skip' | 'clarify' | 'nudge'
  text?: string
  code?: string | null
  language?: string | null
  diagram?: string | null
  input?: 'voice' | 'text'
  intent?: CandidateIntent
  level?: 1 | 2
  latency?: TurnLatency
}

export interface TurnResponse {
  session: SessionDto
  /** Development only: server processing time for the turn and the AI rephrasing inside it. */
  diagnostics?: { serverMs: number; aiMs: number }
}

export const sendInterviewTurn = (id: string, body: TurnBody) => api<TurnResponse>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'turn', ...body } })

export const wrapUpInterview = (id: string, reason: 'learner' | 'time' = 'learner') => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'wrap_up', reason } })

export const completeInterview = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'complete' } })

export const abandonInterview = (id: string) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'abandon' } })

export const recordInterviewPlan = (id: string, taskCount: number) => api<{ session: SessionDto }>(`/api/interviews/${encodeURIComponent(id)}`, { method: 'POST', json: { action: 'plan_added', taskCount } })

export const fetchAllInterviews = () => api<{ history: HistoryItem[]; total: number }>('/api/interviews')

export const fetchVoiceConfig = () => api<VoiceConfig>('/api/interviews/voice')

export const VOICE_SYNTH_URL = '/api/interviews/voice'
