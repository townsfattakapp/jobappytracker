import { useMemo, useState } from 'react'
import type { CurriculumTrack, GoalTrack } from '../types'
import { searchCurriculum, trackCategories, tracksByFamily } from '../lib/curriculum/registry'
import { useCurriculum } from '../lib/curriculum/useCurriculum'
import { estimateDays, estimateTrack } from '../lib/roadmapGenerator'
import { addCustomTopic, PERSONAL_TRACK_ID } from '../lib/curriculum/personal'
import { countTrack } from '../data/curriculum/define'
import { careerPaths } from '../data/careerPaths'

export interface CurriculumBuilderProps {
  selection: GoalTrack[]
  onChange: (next: GoalTrack[]) => void
  knownTopicIds: string[]
  onKnownChange: (ids: string[]) => void
  customTracks: CurriculumTrack[]
  onCustomTracksChange: (tracks: CurriculumTrack[]) => void
  hoursPerDay: number
  restDays: number[]
  /** Optional: open a topic's workspace from the builder. */
  onOpenTopic?: (topicId: string) => void
  /** Optional: ask the AI to suggest a plan (shown as a button when provided). */
  onAskAi?: () => void
  /** Optional: apply a career-path template. */
  onUseTemplate?: (pathId: string) => void
}

function hours(minutes: number): string {
  const h = minutes / 60
  return h >= 10 ? `${Math.round(h)} h` : `${Math.round(h * 2) / 2} h`
}

function includedTopicIds(track: CurriculumTrack, entry: GoalTrack, known: Set<string>): Set<string> {
  const include = entry.topicIds ? new Set(entry.topicIds) : null
  const exclude = new Set(entry.excludedTopicIds || [])
  const out = new Set<string>()
  for (const cat of trackCategories(track))
    for (const mod of cat.modules)
      for (const topic of mod.topics) {
        if (include && !include.has(topic.id)) continue
        if (exclude.has(topic.id) || known.has(topic.id)) continue
        out.add(topic.id)
      }
  return out
}

/**
 * The curriculum builder: browse every skill, add or remove tracks, pick or
 * exclude topics inside each track, mark topics you already know, add your
 * own topics, and see the workload. Used by the goal wizard and by an
 * existing goal's "Edit curriculum".
 */
export default function CurriculumBuilder({ selection, onChange, knownTopicIds, onKnownChange, customTracks, onCustomTracksChange, hoursPerDay, restDays, onOpenTopic, onAskAi, onUseTemplate }: CurriculumBuilderProps) {
  const curriculum = useCurriculum()
  const [query, setQuery] = useState('')
  const [familyFilter, setFamilyFilter] = useState('')
  const [openFamily, setOpenFamily] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customConcepts, setCustomConcepts] = useState('')
  const [customTrackId, setCustomTrackId] = useState(PERSONAL_TRACK_ID)
  const [customOpen, setCustomOpen] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const known = useMemo(() => new Set(knownTopicIds), [knownTopicIds])
  const families = useMemo(() => tracksByFamily(curriculum.tracks), [curriculum])
  const hits = useMemo(() => (query.trim() ? searchCurriculum(query, { limit: 30, family: familyFilter || undefined }) : []), [query, familyFilter, curriculum])
  const trackHits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return curriculum.tracks.filter((t) => t.title.toLowerCase().includes(q) || (t.tags || []).some((tag) => tag.includes(q))).slice(0, 8)
  }, [query, curriculum])

  const ordered = useMemo(() => [...selection].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [selection])
  const isSelected = (id: string) => selection.some((s) => s.trackId === id)

  const setOrdered = (next: GoalTrack[]) => onChange(next.map((t, i) => ({ ...t, order: i })))

  const addTrack = (trackId: string) => {
    if (isSelected(trackId)) return
    setOrdered([...ordered, { trackId, priority: 'Medium' }])
    setExpanded(trackId)
  }
  const removeTrack = (trackId: string) => setOrdered(ordered.filter((t) => t.trackId !== trackId))
  const move = (trackId: string, dir: -1 | 1) => {
    const i = ordered.findIndex((t) => t.trackId === trackId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= ordered.length) return
    const next = [...ordered]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrdered(next)
  }
  const update = (trackId: string, patch: Partial<GoalTrack>) => setOrdered(ordered.map((t) => (t.trackId === trackId ? { ...t, ...patch } : t)))

  const toggleTopic = (track: CurriculumTrack, entry: GoalTrack, topicId: string, include: boolean) => {
    const all = trackCategories(track).flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id)))
    const current = includedTopicIds(track, entry, new Set())
    if (include) current.add(topicId)
    else current.delete(topicId)
    const excluded = all.filter((id) => !current.has(id))
    update(track.id, { topicIds: undefined, excludedTopicIds: excluded.length ? excluded : undefined })
  }
  const toggleCategory = (track: CurriculumTrack, entry: GoalTrack, categoryId: string, include: boolean) => {
    const all = trackCategories(track).flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id)))
    const catIds = trackCategories(track)
      .filter((c) => c.id === categoryId)
      .flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id)))
    const current = includedTopicIds(track, entry, new Set())
    for (const id of catIds) include ? current.add(id) : current.delete(id)
    const excluded = all.filter((id) => !current.has(id))
    update(track.id, { topicIds: undefined, excludedTopicIds: excluded.length ? excluded : undefined })
  }
  const toggleKnown = (topicId: string) => onKnownChange(known.has(topicId) ? knownTopicIds.filter((id) => id !== topicId) : [...knownTopicIds, topicId])

  const summary = useMemo(() => {
    const goalLike = { hoursPerDay, restDays, knownTopicIds, tracks: selection }
    const est = estimateDays(goalLike, curriculum.tracks)
    const knownCount = knownTopicIds.length
    return { ...est, knownCount }
  }, [selection, knownTopicIds, hoursPerDay, restDays, curriculum])

  const warnings = useMemo(() => {
    const out: string[] = []
    const selectedIds = new Set(selection.map((s) => s.trackId))
    for (const entry of ordered) {
      const track = curriculum.trackById.get(entry.trackId)
      if (!track) {
        out.push(`Track ${entry.trackId} is no longer available.`)
        continue
      }
      for (const pre of track.prerequisites || []) {
        if (selectedIds.has(pre)) continue
        const preTrack = curriculum.trackById.get(pre)
        if (preTrack) out.push(`${track.title} builds on ${preTrack.title}, which is not in this goal. Add it or mark it as known.`)
      }
      const included = includedTopicIds(track, entry, known)
      for (const ref of curriculum.topics.filter((t) => t.track.id === track.id && included.has(t.topic.id)))
        for (const pre of ref.topic.prerequisites || []) {
          if (included.has(pre) || known.has(pre)) continue
          const preRef = curriculum.byId.get(pre)
          if (preRef) out.push(`"${ref.topic.title}" expects "${preRef.topic.title}" first, which you excluded.`)
        }
    }
    return Array.from(new Set(out)).slice(0, 8)
  }, [ordered, selection, curriculum, known])

  const submitCustom = () => {
    const title = customTitle.trim()
    if (!title) return
    const { tracks, topicId, trackId } = addCustomTopic(customTracks, {
      title,
      description: customDescription,
      concepts: customConcepts.split(',').map((c) => c.trim()).filter(Boolean),
      trackId: customTrackId,
    })
    onCustomTracksChange(tracks)
    const entry = ordered.find((t) => t.trackId === trackId)
    if (!entry) setOrdered([...ordered, { trackId, priority: 'Medium' }])
    else if (entry.excludedTopicIds?.includes(topicId)) update(trackId, { excludedTopicIds: entry.excludedTopicIds.filter((id) => id !== topicId) })
    setCustomTitle('')
    setCustomDescription('')
    setCustomConcepts('')
    setCustomOpen(false)
    setExpanded(trackId)
  }

  const personalTracks = customTracks.length ? customTracks : []

  return (
    <div className="cb">
      <div className="cb-browse">
        <div className="cb-toolbar">
          <input
            className="input-field"
            placeholder="Search skills and topics, e.g. Python decorators, Spring Boot security, RAG evaluation"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search topics"
          />
          <select className="input-field !w-auto" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)} aria-label="Career field">
            <option value="">All fields</option>
            {families.map((f) => (
              <option key={f.family} value={f.family}>
                {f.family}
              </option>
            ))}
          </select>
        </div>
        <div className="cb-actions">
          {onUseTemplate && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTemplates((v) => !v)}>
              {showTemplates ? 'Hide career paths' : 'Use a career path'}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustomOpen((v) => !v)}>
            Add custom topic
          </button>
          {onAskAi && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onAskAi}>
              Ask AI to suggest
            </button>
          )}
        </div>

        {showTemplates && onUseTemplate && (
          <div className="cb-templates">
            {careerPaths.map((p) => (
              <button key={p.id} type="button" className="cb-template" onClick={() => onUseTemplate(p.id)}>
                <span aria-hidden="true">{p.icon}</span>
                <span>
                  <strong>{p.title}</strong>
                  <small>{p.tracks.length} tracks · {p.family}</small>
                </span>
              </button>
            ))}
          </div>
        )}

        {customOpen && (
          <div className="cb-custom">
            <p className="label-quiet">Your own topic</p>
            <input className="input-field" placeholder="Topic title, e.g. gRPC streaming in Go" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} aria-label="Custom topic title" />
            <textarea className="input-field" rows={2} placeholder="What it is and why you want it (optional)" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} aria-label="Custom topic description" />
            <input className="input-field" placeholder="Concepts, comma separated (optional)" value={customConcepts} onChange={(e) => setCustomConcepts(e.target.value)} aria-label="Custom topic concepts" />
            {personalTracks.length > 1 && (
              <select className="input-field" value={customTrackId} onChange={(e) => setCustomTrackId(e.target.value)} aria-label="Personal track">
                {[{ id: PERSONAL_TRACK_ID, title: 'My topics' }, ...personalTracks.filter((t) => t.id !== PERSONAL_TRACK_ID)].map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustomOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={submitCustom} disabled={!customTitle.trim()}>
                Add to my curriculum
              </button>
            </div>
          </div>
        )}

        {query.trim() ? (
          <div className="cb-results">
            {trackHits.length > 0 && (
              <div className="cb-result-group">
                <p className="label-quiet">Tracks</p>
                {trackHits.map((t) => (
                  <div key={t.id} className="cb-row">
                    <span>
                      <span aria-hidden="true">{t.icon || '📘'}</span> <strong>{t.title}</strong> <small>{t.family}</small>
                    </span>
                    <button type="button" className={`btn btn-sm ${isSelected(t.id) ? 'btn-ghost' : 'btn-primary'}`} aria-label={`${isSelected(t.id) ? 'Remove' : 'Add'} ${t.title}`} onClick={() => (isSelected(t.id) ? removeTrack(t.id) : addTrack(t.id))}>
                      {isSelected(t.id) ? 'Remove' : 'Add track'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="cb-result-group">
              <p className="label-quiet">Topics and concepts</p>
              {hits.length === 0 && <p className="text-sm text-muted-foreground">No topics match. Add it as a custom topic.</p>}
              {hits.map((h) => {
                const entry = selection.find((s) => s.trackId === h.ref.track.id)
                const track = h.ref.track
                const included = entry ? includedTopicIds(track, entry, known).has(h.ref.topic.id) : false
                return (
                  <div key={`${h.ref.topic.id}-${h.concept?.id || ''}`} className="cb-row">
                    <span className="min-w-0">
                      <strong className="block truncate">{h.concept ? `${h.concept.title} · ${h.ref.topic.title}` : h.ref.topic.title}</strong>
                      <small>
                        {track.title} › {h.ref.category.title}
                      </small>
                    </span>
                    <span className="flex gap-1 shrink-0">
                      {onOpenTopic && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTopic(h.concept?.id || h.ref.topic.id)}>
                          Open
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn btn-sm ${included ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={() => {
                          if (!entry) {
                            const all = trackCategories(track).flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id)))
                            setOrdered([...ordered, { trackId: track.id, priority: 'Medium', excludedTopicIds: all.filter((id) => id !== h.ref.topic.id) }])
                            setExpanded(track.id)
                          } else toggleTopic(track, entry, h.ref.topic.id, !included)
                        }}
                      >
                        {included ? 'Remove topic' : entry ? 'Include topic' : 'Add just this topic'}
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="cb-families">
            {families
              .filter((f) => !familyFilter || f.family === familyFilter)
              .map((f) => {
                const open = openFamily === f.family || Boolean(familyFilter)
                return (
                  <div key={f.family} className="cb-family">
                    <button type="button" className="cb-family-head" aria-label={`${f.family} tracks`} onClick={() => setOpenFamily(open && !familyFilter ? null : f.family)} aria-expanded={open}>
                      <span>{f.family}</span>
                      <small>
                        {f.tracks.length} track{f.tracks.length === 1 ? '' : 's'} · {f.tracks.filter((t) => isSelected(t.id)).length} selected
                      </small>
                    </button>
                    {open && (
                      <div className="cb-tracks">
                        {f.tracks.map((t) => {
                          const c = countTrack(t)
                          return (
                            <div key={t.id} className={`cb-track ${isSelected(t.id) ? 'is-selected' : ''}`}>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">
                                  <span aria-hidden="true">{t.icon || '📘'}</span> {t.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {c.topics} topics · {c.concepts} concepts · ≈ {hours(c.minutes)}
                                  {t.source === 'personal' ? ' · yours' : ''}
                                </p>
                              </div>
                              <button type="button" className={`btn btn-sm ${isSelected(t.id) ? 'btn-ghost' : 'btn-primary'}`} aria-label={`${isSelected(t.id) ? 'Remove' : 'Add'} ${t.title}`} onClick={() => (isSelected(t.id) ? removeTrack(t.id) : addTrack(t.id))}>
                                {isSelected(t.id) ? 'Remove' : 'Add'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <div className="cb-selected custom-scrollbar pr-1">
        <div className="cb-summary">
          <p className="font-bold">
            {ordered.length} track{ordered.length === 1 ? '' : 's'} · {summary.topics} topics · ≈ {hours(summary.minutes)}
          </p>
          <p className="text-xs text-muted-foreground">
            {ordered.length === 0
              ? 'No learning tracks added to this goal yet.'
              : `About ${Number.isFinite(summary.days) ? summary.days : '∞'} days at ${hoursPerDay} h on ${7 - restDays.length} days a week${summary.knownCount ? ` · ${summary.knownCount} topics marked as known` : ''}.`}
          </p>
        </div>
        {warnings.length > 0 && (
          <ul className="cb-warnings" aria-label="Prerequisite warnings">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        {ordered.length === 0 && (
          <div className="cb-empty">
            <p>Pick tracks on the left, use a career path, or ask the AI for a plan.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {onUseTemplate && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowTemplates(true)}>
                  Use career path template
                </button>
              )}
              {onAskAi && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={onAskAi}>
                  Ask AI to suggest a plan
                </button>
              )}
            </div>
          </div>
        )}
        {ordered.map((entry, index) => {
          const track = curriculum.trackById.get(entry.trackId)
          if (!track) return null
          const included = includedTopicIds(track, entry, known)
          const est = estimateTrack(track, entry, { knownTopicIds })
          const isOpen = expanded === track.id
          const cats = trackCategories(track)
          return (
            <div key={track.id} className={`cb-sel ${isOpen ? 'is-open' : ''}`}>
              <div className="cb-sel-head">
                <button type="button" className="cb-sel-title" onClick={() => setExpanded(isOpen ? null : track.id)} aria-expanded={isOpen}>
                  <span aria-hidden="true">{track.icon || '📘'}</span>
                  <span className="min-w-0">
                    <strong className="block truncate">{track.title}</strong>
                    <small>
                      {est.topics} of {countTrack(track).topics} topics · ≈ {hours(est.minutes)}
                    </small>
                  </span>
                </button>
                <div className="cb-sel-controls">
                  <select className="input-field !w-auto !py-1 !px-2 text-xs" value={entry.priority} onChange={(e) => update(track.id, { priority: e.target.value as GoalTrack['priority'] })} aria-label={`${track.title} priority`}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button type="button" className="iv-icon-btn" onClick={() => move(track.id, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                    ↑
                  </button>
                  <button type="button" className="iv-icon-btn" onClick={() => move(track.id, 1)} disabled={index === ordered.length - 1} aria-label="Move down" title="Move down">
                    ↓
                  </button>
                  <button type="button" className="iv-icon-btn" onClick={() => removeTrack(track.id)} aria-label={`Remove ${track.title}`} title="Remove">
                    ✕
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="cb-sel-body">
                  {cats.map((cat) => {
                    const topics = cat.modules.flatMap((m) => m.topics)
                    const on = topics.filter((t) => included.has(t.id)).length
                    const catOpen = openCategory === cat.id
                    return (
                      <div key={cat.id} className="cb-cat">
                        <div className="cb-cat-head">
                          <label className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              className="touch-check"
                              checked={on === topics.length && topics.length > 0}
                              ref={(el) => {
                                if (el) el.indeterminate = on > 0 && on < topics.length
                              }}
                              onChange={(e) => toggleCategory(track, entry, cat.id, e.target.checked)}
                              aria-label={`Include ${cat.title}`}
                            />
                            <span className="truncate font-medium">{cat.title}</span>
                            <small className="text-muted-foreground shrink-0">
                              {on}/{topics.length}
                            </small>
                          </label>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpenCategory(catOpen ? null : cat.id)} aria-expanded={catOpen}>
                            {catOpen ? 'Hide topics' : 'Topics'}
                          </button>
                        </div>
                        {catOpen && (
                          <ul className="cb-topics">
                            {topics.map((topic) => {
                              const inc = included.has(topic.id)
                              const isKnown = known.has(topic.id)
                              return (
                                <li key={topic.id} className={isKnown ? 'is-known' : ''}>
                                  <label className="flex items-center gap-2 min-w-0 flex-1">
                                    <input type="checkbox" className="touch-check touch-check-topic" checked={inc} disabled={isKnown} onChange={(e) => toggleTopic(track, entry, topic.id, e.target.checked)} aria-label={`Include ${topic.title}`} />
                                    <span className="truncate">{topic.title}</span>
                                  </label>
                                  <span className="flex gap-1 shrink-0">
                                    <button type="button" className={`cb-chip ${isKnown ? 'is-on' : ''}`} onClick={() => toggleKnown(topic.id)} title="Mark as already known: the roadmap skips it">
                                      {isKnown ? 'Known' : 'I know this'}
                                    </button>
                                    {onOpenTopic && (
                                      <button type="button" className="cb-chip" onClick={() => onOpenTopic(topic.id)}>
                                        Open
                                      </button>
                                    )}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
