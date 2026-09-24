import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CurriculumTrack, Goal, GoalTrack } from '../types'
import CurriculumBuilder from './CurriculumBuilder'
import { careerPathById } from '../data/careerPaths'
import { getCurriculum } from '../lib/curriculum/registry'

interface GoalCurriculumEditorProps {
  goal: Goal
  customTracks: CurriculumTrack[]
  onCustomTracksChange: (tracks: CurriculumTrack[]) => void
  /** Saves the goal; `replan` asks the caller to schedule newly added topics into free days. */
  onSave: (goal: Goal, replan: boolean) => void
  onClose: () => void
  onOpenTopic?: (topicId: string) => void
}

/** "Build my curriculum" for an existing goal: the same builder as the wizard, saved back onto the goal. */
export default function GoalCurriculumEditor({ goal, customTracks, onCustomTracksChange, onSave, onClose, onOpenTopic }: GoalCurriculumEditorProps) {
  const [selection, setSelection] = useState<GoalTrack[]>(goal.tracks)
  const [known, setKnown] = useState<string[]>(goal.knownTopicIds || [])
  const [replan, setReplan] = useState(true)

  const useTemplate = (pathId: string) => {
    const path = careerPathById(pathId)
    if (!path) return
    const { trackById } = getCurriculum()
    const existing = new Set(selection.map((t) => t.trackId))
    const additions = path.tracks.filter((t) => trackById.has(t.trackId) && !existing.has(t.trackId)).map((t, i) => ({ trackId: t.trackId, priority: t.priority, order: selection.length + i }))
    setSelection([...selection, ...additions])
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[115] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="gce-title" className="iv-report surface animate-slide-up !max-w-6xl">
        <div className="iv-report-head">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Curriculum builder</p>
            <h2 id="gce-title" className="text-xl font-display font-bold">
              {goal.name || goal.targetRole}
            </h2>
          </div>
          <button type="button" className="iv-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="iv-report-body">
          <CurriculumBuilder
            selection={selection}
            onChange={setSelection}
            knownTopicIds={known}
            onKnownChange={setKnown}
            customTracks={customTracks}
            onCustomTracksChange={onCustomTracksChange}
            hoursPerDay={goal.hoursPerDay}
            restDays={goal.restDays}
            onOpenTopic={onOpenTopic}
            onUseTemplate={useTemplate}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="touch-check" checked={replan} onChange={(e) => setReplan(e.target.checked)} />
            Schedule newly added topics into free days from today (existing tasks stay where they are)
          </label>
        </div>
        <div className="iv-report-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={selection.length === 0}
            onClick={() => onSave({ ...goal, tracks: selection.map((t, i) => ({ ...t, order: t.order ?? i })), knownTopicIds: known.length ? known : undefined, updatedAt: new Date().toISOString() }, replan)}
          >
            Save curriculum
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
