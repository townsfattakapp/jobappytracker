import { api } from '../adminClient'
import type { OutreachContactDto, OutreachInput, PreparationDto } from '../server/outreach'
import type { Draft, DraftGrounding, MessageType } from './networking'
import type { PrepBlueprint } from './prepare'
import type { JobDto, LearnerJobPreferences } from './types'
import type { StoredAnalysisDto } from '../resume/client'
import type { ResumeProfile } from '../resume/extract'

/** Client helpers for the Phase 4 routes (outreach, drafts, preparation). */

export async function fetchOutreach(jobId: string): Promise<OutreachContactDto[]> {
  return (await api<{ contacts: OutreachContactDto[] }>(`/api/jobs/${encodeURIComponent(jobId)}/outreach`)).contacts
}

export async function createOutreach(jobId: string, input: Partial<OutreachInput>): Promise<OutreachContactDto> {
  return (await api<{ contact: OutreachContactDto }>(`/api/jobs/${encodeURIComponent(jobId)}/outreach`, { method: 'POST', json: input })).contact
}

export async function updateOutreach(jobId: string, contactId: string, patch: Partial<OutreachInput>): Promise<OutreachContactDto> {
  return (await api<{ contact: OutreachContactDto }>(`/api/jobs/${encodeURIComponent(jobId)}/outreach/${encodeURIComponent(contactId)}`, { method: 'PATCH', json: patch })).contact
}

export function deleteOutreach(jobId: string, contactId: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/api/jobs/${encodeURIComponent(jobId)}/outreach/${encodeURIComponent(contactId)}`, { method: 'DELETE' })
}

export function requestDrafts(jobId: string, types: MessageType[]): Promise<{ drafts: Draft[]; grounding: DraftGrounding; usage: { used: number; limit: number }; resumeUsed: { id: string; title: string } | null }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/drafts`, { method: 'POST', json: { types } })
}

export async function fetchPreparation(jobId: string): Promise<PreparationDto | null> {
  return (await api<{ preparation: PreparationDto | null }>(`/api/jobs/${encodeURIComponent(jobId)}/preparation`)).preparation
}

export function requestPreparationInputs(jobId: string): Promise<{ job: JobDto; preferences: LearnerJobPreferences | null; analysis: StoredAnalysisDto | null; profile: ResumeProfile | null }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/preparation`, { method: 'POST', json: {} })
}

export async function savePreparation(jobId: string, patch: { blueprint?: PrepBlueprint; durationDays?: number | null; planAdded?: { goalId: string; taskCount: number }; completedItemIds?: string[] }): Promise<PreparationDto> {
  return (await api<{ preparation: PreparationDto }>(`/api/jobs/${encodeURIComponent(jobId)}/preparation`, { method: 'PUT', json: patch })).preparation
}
