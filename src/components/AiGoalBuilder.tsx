import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CurriculumTrack, ExperienceLevel, GoalOutcome, GoalTrack } from '../types'
import { selectionFromSuggestion, suggestCurriculum, type GoalSuggestion } from '../lib/aiGoalBuilder'
import { AI_SETUP_HINT, aiUnavailableReason } from '../lib/aiGatewayClient'
import { trackCategories } from '../lib/curriculum/registry'
import { useCurriculum } from '../lib/curriculum/useCurriculum'
import { addCustomTopic } from '../lib/curriculum/personal'

export interface AiGoalResult {
  name: string
  description: string
  targetRole: string
  outcome: GoalOutcome
  experienceLevel: ExperienceLevel
  hoursPerDay: number | null
  languages: string[]
  tracks: GoalTrack[]
  knownTopicIds: string[]
  customTracks?: CurriculumTrack[]
}

interface AiGoalBuilderProps {
  hoursPerDay: number
  experienceLevel: ExperienceLevel
  customTracks: CurriculumTrack[]
  onApply: (result: AiGoalResult) => void
  onClose: () => void
}

const EXAMPLE = 'I want to become an AI Engineer. I know JavaScript and React, but I am new to Python and machine learning. I can study 3 hours daily and want to be ready in six months.'

/** Natural-language goal → curriculum proposal referencing real tracks; the learner edits and approves everything. */
export default function AiGoalBuilder({ hoursPerDay, experienceLevel, customTracks, onApply, onClose }: AiGoalBuilderProps) {
  const curriculum = useCurriculum()
  const [description, setDescription] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null)
  const [enabledTracks, setEnabledTracks] = useState<Set<string>>(new Set())
  const [approvedTopics, setApprovedTopics] = useState<Set<number>>(new Set())

  const run = async () => {
    setError(null)
    const reason = await aiUnavailableReason()
    if (reason) {
      setError(reason || AI_SETUP_HINT)
      return
    }
    if (!description.trim()) {
      setError('Describe the goal first.')
      return
    }
    setBusy(true)
    try {
      const result = await suggestCurriculum({ description, answers, hoursPerDay, experienceLevel })
      setSuggestion(result)
      setEnabledTracks(new Set(result.tracks.map((t) => t.trackId)))
      setApprovedTopics(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI could not build a proposal. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const apply = () => {
    if (!suggestion) return
    const filtered: GoalSuggestion = { ...suggestion, tracks: suggestion.tracks.filter((t) => enabledTracks.has(t.trackId)) }
    const { tracks, knownTopicIds } = selectionFromSuggestion(filtered)
    let nextCustom = customTracks
    let personalAdded = false
    suggestion.proposedTopics.forEach((topic, i) => {
      if (!approvedTopics.has(i)) return
      const added = addCustomTopic(nextCustom, { title: topic.title, description: topic.description })
      nextCustom = added.tracks
      if (!tracks.some((t) => t.trackId === added.trackId)) tracks.push({ trackId: added.trackId, priority: 'Medium', order: tracks.length })
      personalAdded = true
    })
    onApply({
      name: suggestion.name,
      description: suggestion.description,
      targetRole: suggestion.targetRole,
      outcome: suggestion.outcome,
      experienceLevel: suggestion.experienceLevel,
      hoursPerDay: suggestion.hoursPerDay,
      languages: suggestion.languages,
      tracks,
      knownTopicIds,
      customTracks: personalAdded ? nextCustom : undefined,
    })
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="ai-goal-title" className="iv-report surface animate-slide-up">
        <div className="iv-report-head">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">AI goal builder</p>
            <h2 id="ai-goal-title" className="text-xl font-display font-bold">
              Describe what you want to achieve
            </h2>
          </div>
          <button type="button" className="iv-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="iv-report-body">
          <textarea className="input-field" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={EXAMPLE} aria-label="Goal description" />
          {suggestion?.questions.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">A few things the AI still needs:</p>
              {suggestion.questions.map((q) => (
                <label key={q} className="block text-sm">
                  {q}
                  <input className="input-field mt-1" value={answers[q] || ''} onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })} />
                </label>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => void run()} disabled={busy}>
              {busy ? 'Thinking…' : suggestion ? 'Update proposal' : 'Build a proposal'}
            </button>
            {!description && (
              <button type="button" className="btn btn-ghost" onClick={() => setDescription(EXAMPLE)}>
                Use the example
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {suggestion && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="font-semibold">{suggestion.name}</p>
                <p className="text-muted-foreground">{suggestion.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.targetRole} · {suggestion.experienceLevel}
                  {suggestion.hoursPerDay ? ` · ${suggestion.hoursPerDay} h/day` : ''}
                  {suggestion.estimatedWeeks ? ` · about ${suggestion.estimatedWeeks} weeks` : ''}
                  {suggestion.languages.length ? ` · ${suggestion.languages.join(', ')}` : ''}
                </p>
                {suggestion.sequenceNotes && <p className="text-xs mt-2">{suggestion.sequenceNotes}</p>}
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Suggested tracks (untick anything you do not want)</p>
                <ul className="space-y-2">
                  {suggestion.tracks.map((t, i) => {
                    const track = curriculum.trackById.get(t.trackId)
                    if (!track) return null
                    const cats = trackCategories(track)
                    return (
                      <li key={t.trackId} className="rounded-xl border border-border p-3 text-sm">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="touch-check mt-0.5"
                            checked={enabledTracks.has(t.trackId)}
                            onChange={(e) => {
                              const next = new Set(enabledTracks)
                              e.target.checked ? next.add(t.trackId) : next.delete(t.trackId)
                              setEnabledTracks(next)
                            }}
                          />
                          <span className="min-w-0">
                            <span className="font-semibold">
                              {i + 1}. {track.title}
                            </span>{' '}
                            <span className="text-xs text-muted-foreground">{t.priority} priority</span>
                            {t.reason && <span className="block text-xs text-muted-foreground">{t.reason}</span>}
                            {t.knownCategoryIds?.length ? <span className="block text-xs text-emerald-500">Skips {t.knownCategoryIds.map((id) => cats.find((c) => c.id === id)?.title).filter(Boolean).join(', ')} (you know these)</span> : null}
                            {t.categoryIds?.length ? <span className="block text-xs text-muted-foreground">Includes only: {t.categoryIds.map((id) => cats.find((c) => c.id === id)?.title).filter(Boolean).join(', ')}</span> : null}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
              {suggestion.proposedTopics.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-1">Proposed new topics (not in the catalogue; tick to add as your own topics)</p>
                  <ul className="space-y-2">
                    {suggestion.proposedTopics.map((p, i) => (
                      <li key={`${p.title}-${i}`} className="rounded-xl border border-dashed border-border p-3 text-sm">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="touch-check mt-0.5"
                            checked={approvedTopics.has(i)}
                            onChange={(e) => {
                              const next = new Set(approvedTopics)
                              e.target.checked ? next.add(i) : next.delete(i)
                              setApprovedTopics(next)
                            }}
                          />
                          <span>
                            <span className="font-semibold">{p.title}</span>
                            {p.description && <span className="block text-xs text-muted-foreground">{p.description}</span>}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestion.practiceIdeas.length > 0 && (
                <div className="text-sm">
                  <p className="font-semibold mb-1">Practice and project ideas</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                    {suggestion.practiceIdeas.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="iv-report-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!suggestion || enabledTracks.size === 0} onClick={apply}>
            Use this proposal (edit next)
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
