import { api } from '../adminClient'
import type { ApplicationStrategy } from '../jobs/strategy'
import type { JobDto, LearnerJobPreferences } from '../jobs/types'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import type { ResumeProfile } from './extract'

export interface ResumeMetaDto {
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

export interface ResumeDetailDto extends ResumeMetaDto {
  profile: ResumeProfile | null
  text: string | null
  extractorVersion: string | null
}

export interface StoredAnalysisDto {
  id: string
  resumeId: string
  jobId: string
  report: ResumeAnalysisReport
  suggestionState: Record<string, 'saved' | 'dismissed' | 'completed'>
  createdAt: string
  updatedAt: string
}

export async function fetchResumes(): Promise<ResumeMetaDto[]> {
  return (await api<{ resumes: ResumeMetaDto[] }>('/api/resumes')).resumes
}

export function fetchResume(id: string): Promise<ResumeDetailDto> {
  return api<ResumeDetailDto>(`/api/resumes/${encodeURIComponent(id)}`)
}

export async function uploadResume(file: File, opts: { title?: string; targetRoleCategory?: string } = {}): Promise<ResumeDetailDto> {
  const form = new FormData()
  form.append('file', file)
  if (opts.title) form.append('title', opts.title)
  if (opts.targetRoleCategory) form.append('targetRoleCategory', opts.targetRoleCategory)
  return api<ResumeDetailDto>('/api/resumes', { method: 'POST', body: form })
}

export function updateResume(id: string, patch: { title?: string; targetRoleCategory?: string | null; isCurrent?: boolean }): Promise<ResumeDetailDto> {
  return api<ResumeDetailDto>(`/api/resumes/${encodeURIComponent(id)}`, { method: 'PATCH', json: patch })
}

export function deleteResume(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/api/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function fetchResumeAnalysis(jobId: string): Promise<StoredAnalysisDto | null> {
  return (await api<{ analysis: StoredAnalysisDto | null }>(`/api/jobs/${encodeURIComponent(jobId)}/resume-analysis`)).analysis
}

export function runResumeAnalysis(jobId: string, input: { resumeId?: string; curriculum?: unknown }): Promise<{ analysis: StoredAnalysisDto; usage: { used: number; limit: number }; resume: { id: string; title: string } }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/resume-analysis`, { method: 'POST', json: input })
}

export async function setSuggestionState(jobId: string, analysisId: string, suggestionId: string, state: 'saved' | 'dismissed' | 'completed' | null): Promise<StoredAnalysisDto> {
  return (await api<{ analysis: StoredAnalysisDto }>(`/api/jobs/${encodeURIComponent(jobId)}/resume-analysis`, { method: 'PATCH', json: { analysisId, suggestionId, state } })).analysis
}

export function requestStrategyInputs(jobId: string): Promise<{ job: JobDto; preferences: LearnerJobPreferences | null; analysis: StoredAnalysisDto | null; narrative: { text: string; provider: string } | null }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/strategy`, { method: 'POST', json: {} })
}

export type { ApplicationStrategy }
