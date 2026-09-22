import { useMemo, useState } from 'react'
import type { CurriculumTrack, GoalTrack } from '../types'
import { estimateTrack } from '../lib/roadmapGenerator'

interface CurriculumPickerProps {
  tracks: CurriculumTrack[]
  selected: GoalTrack[]
  onToggleTrack: (trackId: string) => void
  onPriorityChange?: (trackId: string, priority: GoalTrack['priority']) => void
  onSelectTopic?: (topicId: string) => void
}

function hours(minutes: number): string {
  const h = minutes / 60
  return h >= 10 ? `${Math.round(h)} h` : `${Math.round(h * 2) / 2} h`
}

export default function CurriculumPicker({ tracks, selected, onToggleTrack, onPriorityChange, onSelectTopic }: CurriculumPickerProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const estimates = useMemo(() => new Map(tracks.map((t) => [t.id, estimateTrack(t)])), [tracks])
  const trackById = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks])

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
      {tracks.map((track) => {
        const selection = selected.find((s) => s.trackId === track.id)
        const isActive = Boolean(selection)
        const isExpanded = expandedTrack === track.id
        const est = estimates.get(track.id)!
        const prereqNames = track.prerequisites
          .map((id) => trackById.get(id)?.title || id)
          .filter(Boolean)

        return (
          <div
            key={track.id}
            className={`rounded-xl border bg-[hsl(var(--card))] overflow-hidden transition-colors ${
              isActive ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <button
                type="button"
                aria-label={`Select ${track.title}`}
                aria-pressed={isActive}
                onClick={() => onToggleTrack(track.id)}
                className={`mt-1 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isActive ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {isActive && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Clicking anywhere on the card toggles selection; the outline has its own button. */}
              <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={() => onToggleTrack(track.id)}>
                <h4 className="font-semibold text-foreground text-sm">{track.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{track.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">{est.topics} topics</span>
                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">≈ {hours(est.minutes)}</span>
                  {prereqNames.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded" title={prereqNames.join(', ')}>
                      After: {prereqNames.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                >
                  Outline
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isActive && onPriorityChange && (
                  <select
                    aria-label={`${track.title} priority`}
                    className="input-field !w-auto !py-1 !px-2 text-xs"
                    value={selection?.priority || 'Medium'}
                    onChange={(e) => onPriorityChange(track.id, e.target.value as GoalTrack['priority'])}
                  >
                    <option value="High">High priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="Low">Low priority</option>
                  </select>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border bg-muted/20 p-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you will cover</h5>
                <div className="space-y-4 pl-2 border-l-2 border-border/50">
                  {track.levels.map((level) => (
                    <div key={level.id} className="relative pl-4">
                      <div className="absolute -left-[3px] top-1.5 w-1 h-1 rounded-full bg-primary/50"></div>
                      <h6 className="text-sm font-medium text-foreground mb-1">{level.name}</h6>
                      <div className="space-y-3 mt-2">
                        {level.categories.map((cat) => (
                          <div key={cat.id}>
                            <p className="text-xs font-semibold text-foreground mb-1">{cat.title}</p>
                            <ul className="flex flex-wrap gap-1.5">
                              {cat.modules.flatMap((mod) => mod.topics).map((topic) => (
                                <li
                                  key={topic.id}
                                  className={`text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground ${onSelectTopic ? 'cursor-pointer hover:text-primary' : ''}`}
                                  onClick={() => onSelectTopic && onSelectTopic(topic.id)}
                                >
                                  {topic.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
