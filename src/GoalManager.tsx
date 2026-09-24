import { addDays, dateKey, dayDate } from './lib/learningPlan'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { CurriculumTrack, ExperienceLevel, Goal, GoalOutcome, GoalTrack, RoadmapDay } from './types'
import { estimateDays, generateRoadmap, summarizeRoadmap } from './lib/roadmapGenerator'
import { careerPathById, careerPaths } from './data/careerPaths'
import { useCurriculum, trackCategories } from './lib/curriculum/registry'
import CurriculumBuilder from './components/CurriculumBuilder'
import AiGoalBuilder from './components/AiGoalBuilder'
import { CODE_LANGUAGES } from './lib/preferences'

export type GoalCreateNext = 'roadmap' | 'manual' | 'start'

interface GoalManagerProps {
  goal: Goal | null
  customTracks: CurriculumTrack[]
  onCustomTracksChange: (tracks: CurriculumTrack[]) => void
  /** `roadmap` is empty when the learner chose to add tasks manually or start learning right away. */
  onSaveGoal: (goal: Goal, roadmap: RoadmapDay[], next: GoalCreateNext) => void
  onCancel?: () => void
  onOpenTopic?: (topicId: string) => void
  /** Pre-selects a career path and jumps to personalisation. */
  initialPathId?: string
}

const STEPS = ['Outcome', 'Template', 'Personalize', 'Review', 'Create']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ROLE_SUGGESTIONS = ['AI Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer', 'Backend Engineer', 'Frontend Engineer', 'Full-Stack Engineer', 'Mobile Developer', 'Cloud Engineer', 'DevOps Engineer', 'Security Engineer', 'SDE-2']
const COMPANY_SUGGESTIONS = ['Product-Based', 'FAANG / Big Tech', 'Funded Startup', 'Service-Based', 'Remote-first', 'Not sure yet']

const OUTCOMES: { id: GoalOutcome; title: string; body: string; icon: string }[] = [
  { id: 'career', title: 'Choose a career path', body: 'Prepare for a role such as AI Engineer, Data Analyst or Java Backend Developer with a suggested set of tracks.', icon: '🧭' },
  { id: 'language', title: 'Learn a programming language', body: 'Python, Rust, Go, Kotlin, C++ and more, from setup to real projects.', icon: '💬' },
  { id: 'framework', title: 'Learn a framework or technology', body: 'Spring Boot, FastAPI, Flutter, Kubernetes, Power BI, Spark, RAG…', icon: '🧩' },
  { id: 'interview', title: 'Prepare for an interview', body: 'DSA, system design, CS fundamentals and mock interviews for a specific loop.', icon: '🎯' },
  { id: 'project', title: 'Build a project', body: 'Pick project tracks and the skills the build needs, then ship it.', icon: '🛠️' },
  { id: 'custom', title: 'Create a completely custom goal', body: 'Start empty. Combine any tracks, categories, topics and your own topics.', icon: '✏️' },
]

const LANGUAGE_OPTIONS = ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust', 'Kotlin', 'Swift', 'Dart', 'C#', 'SQL', 'R']

function fmtHours(minutes: number): string {
  return `${Math.round(minutes / 60)} h`
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(dayDate(b)) - Date.parse(dayDate(a))) / 86400000) + 1
}

/**
 * Guided goal creation: outcome → template → personalisation (curriculum
 * builder, schedule, level, languages) → review → create, then choose how to
 * continue (generate a roadmap, add tasks by hand, or open the first topic).
 */
export default function GoalManager({ goal, customTracks, onCustomTracksChange, onSaveGoal, onCancel, onOpenTopic, initialPathId }: GoalManagerProps) {
  const curriculum = useCurriculum()
  const initialPath = initialPathId ? careerPathById(initialPathId) : undefined
  const [step, setStep] = useState(goal || initialPath ? 3 : 1)
  const [outcome, setOutcome] = useState<GoalOutcome>(goal?.outcome || 'career')
  const [templateId, setTemplateId] = useState<string>(goal?.careerPathId || initialPath?.id || '')
  const [aiOpen, setAiOpen] = useState(false)

  const [draftGoalId] = useState(() => goal?.id || uuidv4())
  const [name, setName] = useState(goal?.name || (initialPath ? `${initialPath.title} plan` : ''))
  const [description, setDescription] = useState(goal?.description || '')
  const [targetRole, setTargetRole] = useState(goal?.targetRole || initialPath?.roles?.[0] || '')
  const [companyType, setCompanyType] = useState(goal?.companyType || 'Product-Based')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(goal?.experienceLevel || 'Intermediate')
  const [languages, setLanguages] = useState<string[]>(goal?.languages || initialPath?.languages || [])
  const [selectedTracks, setSelectedTracks] = useState<GoalTrack[]>(
    goal?.tracks || (initialPath ? initialPath.tracks.filter((t) => curriculum.trackById.has(t.trackId)).map((t, i) => ({ trackId: t.trackId, priority: t.priority, order: i })) : []),
  )
  const [knownTopicIds, setKnownTopicIds] = useState<string[]>(goal?.knownTopicIds || [])
  const [startDate, setStartDate] = useState(goal?.startDate || dateKey())
  const [hoursPerDay, setHoursPerDay] = useState(goal?.hoursPerDay || 2)
  const [studyDays, setStudyDays] = useState<number[]>(goal ? [0, 1, 2, 3, 4, 5, 6].filter((d) => !goal.restDays.includes(d)) : [0, 1, 2, 3, 4, 5, 6])
  const [deadlineMode, setDeadlineMode] = useState<'auto' | 'date' | 'ongoing'>(goal ? (goal.goalType === 'Ongoing' ? 'ongoing' : goal.targetDate ? 'date' : 'auto') : 'auto')
  const [targetDate, setTargetDate] = useState(goal?.targetDate || addDays(dateKey(), 89))
  const [previewRoadmap, setPreviewRoadmap] = useState<RoadmapDay[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [created, setCreated] = useState<Goal | null>(null)

  const restDays = useMemo(() => [0, 1, 2, 3, 4, 5, 6].filter((d) => !studyDays.includes(d)), [studyDays])

  const effort = useMemo(
    () => estimateDays({ hoursPerDay, restDays, knownTopicIds, tracks: selectedTracks }, curriculum.tracks),
    [selectedTracks, knownTopicIds, hoursPerDay, restDays, curriculum],
  )

  /** Planning horizon: what the learner chose, or what the workload needs. */
  const durationDays = useMemo(() => {
    if (deadlineMode === 'ongoing') return 365
    if (deadlineMode === 'date') return Math.max(7, daysBetween(startDate, targetDate))
    const needed = Number.isFinite(effort.days) ? effort.days : 90
    return Math.min(365, Math.max(14, Math.ceil((needed * 1.15) / 7) * 7))
  }, [deadlineMode, startDate, targetDate, effort.days])

  const applyTemplate = (pathId: string) => {
    const path = careerPathById(pathId)
    if (!path) return
    setTemplateId(pathId)
    setSelectedTracks(path.tracks.filter((t) => curriculum.trackById.has(t.trackId)).map((t, i) => ({ trackId: t.trackId, priority: t.priority, order: i })))
    if (!targetRole) setTargetRole(path.roles?.[0] || path.title)
    if (!name) setName(`${path.title} plan`)
    if (path.languages && !languages.length) setLanguages(path.languages)
  }

  const templatesForOutcome = useMemo(() => {
    if (outcome === 'career' || outcome === 'project') return careerPaths
    if (outcome === 'interview') return careerPaths.filter((p) => p.family === 'Software Engineering Interviews' || p.family === 'Computer Science')
    return []
  }, [outcome, careerPaths])

  const tracksForOutcome = useMemo(() => {
    if (outcome === 'language') return curriculum.tracks.filter((t) => t.kind === 'language')
    if (outcome === 'framework') return curriculum.tracks.filter((t) => t.kind === 'framework' || t.kind === 'tooling')
    return []
  }, [outcome, curriculum])

  const toggleQuickTrack = (trackId: string) => {
    setSelectedTracks((prev) => {
      const exists = prev.find((t) => t.trackId === trackId)
      if (exists) return prev.filter((t) => t.trackId !== trackId)
      const track = curriculum.trackById.get(trackId)
      if (!name && track) setName(`Learn ${track.title}`)
      return [...prev, { trackId, priority: 'High', order: prev.length }]
    })
  }

  const prepareGoal = (): Goal => ({
    id: draftGoalId,
    name: name.trim() || (targetRole.trim() ? `${targetRole.trim()} plan` : 'My learning goal'),
    description: description.trim() || undefined,
    outcome,
    careerPathId: templateId || undefined,
    experienceLevel,
    languages: languages.length ? languages : undefined,
    targetRole: targetRole.trim() || name.trim() || 'Learner',
    companyType: companyType.trim() || 'Product-Based',
    startDate,
    durationDays,
    hoursPerDay,
    restDays,
    tracks: selectedTracks.map((t, i) => ({ ...t, order: t.order ?? i })),
    knownTopicIds: knownTopicIds.length ? knownTopicIds : undefined,
    targetDate: deadlineMode === 'date' ? targetDate : null,
    status: 'Active',
    goalType: deadlineMode === 'ongoing' ? 'Ongoing' : 'Fixed',
    createdAt: goal?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  useEffect(() => {
    if (step !== 4) return
    setGenerating(true)
    const handle = window.setTimeout(() => {
      setPreviewRoadmap(generateRoadmap(prepareGoal(), curriculum.tracks))
      setGenerating(false)
    }, 30)
    return () => window.clearTimeout(handle)
  }, [step])

  const summary = previewRoadmap ? summarizeRoadmap(prepareGoal(), previewRoadmap, curriculum.tracks) : null

  const includedTopics = useMemo(() => {
    const out: { track: CurriculumTrack; included: number; total: number; excluded: string[] }[] = []
    for (const entry of [...selectedTracks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
      const track = curriculum.trackById.get(entry.trackId)
      if (!track) continue
      const all = trackCategories(track).flatMap((c) => c.modules.flatMap((m) => m.topics))
      const include = entry.topicIds ? new Set(entry.topicIds) : null
      const exclude = new Set([...(entry.excludedTopicIds || []), ...knownTopicIds])
      const excluded = all.filter((t) => (include && !include.has(t.id)) || exclude.has(t.id)).map((t) => t.title)
      out.push({ track, included: all.length - excluded.length, total: all.length, excluded })
    }
    return out
  }, [selectedTracks, knownTopicIds, curriculum])

  const prerequisiteNotes = useMemo(() => {
    const ids = new Set(selectedTracks.map((t) => t.trackId))
    const notes: string[] = []
    for (const entry of selectedTracks) {
      const track = curriculum.trackById.get(entry.trackId)
      for (const pre of track?.prerequisites || []) if (!ids.has(pre)) notes.push(`${track!.title} assumes ${curriculum.trackById.get(pre)?.title || pre}.`)
    }
    return notes
  }, [selectedTracks, curriculum])

  const canContinue = () => {
    if (step === 1) return true
    if (step === 2) return true
    if (step === 3) return selectedTracks.length > 0 && studyDays.length > 0 && hoursPerDay > 0
    return true
  }

  const create = (next: GoalCreateNext) => {
    const newGoal = created || prepareGoal()
    if (!created) setCreated(newGoal)
    onSaveGoal(newGoal, next === 'roadmap' ? previewRoadmap || generateRoadmap(newGoal, curriculum.tracks) : [], next)
  }

  const stepTitle = ['What do you want to achieve?', 'Choose a starting template', 'Personalize the goal', 'Review the learning plan', 'Create goal'][step - 1]

  return (
    <div className="surface rounded-2xl p-5 sm:p-8 animate-rise w-full max-w-screen-2xl mx-auto">
      <ol className="flex items-center gap-2 mb-6 text-sm font-medium overflow-x-auto" aria-label="Goal setup steps">
        {STEPS.map((label, i) => {
          const s = i + 1
          return (
            <li key={label} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`} aria-current={step === s ? 'step' : undefined}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs ${step === s ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{label}</span>
              {s < STEPS.length && <div className="w-4 sm:w-8 h-px bg-border" />}
            </li>
          )
        })}
      </ol>
      <h2 className="text-2xl font-display font-semibold mb-1">{stepTitle}</h2>

      {step === 1 && (
        <div className="animate-fade">
          <p className="text-muted-foreground mb-5">Pick the kind of goal. Everything after this is editable.</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Goal outcome">
            {OUTCOMES.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={outcome === o.id}
                onClick={() => {
                  setOutcome(o.id)
                  if (o.id === 'custom') setTemplateId('')
                }}
                className={`p-4 rounded-xl border text-left transition-colors ${outcome === o.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {o.icon}
                </span>
                <h4 className="font-semibold text-foreground mt-2">{o.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{o.body}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>Prefer to describe it in your own words? The AI builds a proposal from the real catalogue and you edit it before saving.</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAiOpen(true)}>
              Describe my goal to the AI
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade">
          {templatesForOutcome.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-5">Templates are suggestions, not requirements. You will add, remove and trim tracks in the next step.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templatesForOutcome.map((p) => {
                  const validTracks = p.tracks.filter((t) => curriculum.trackById.has(t.trackId))
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={templateId === p.id}
                      onClick={() => applyTemplate(p.id)}
                      className={`p-4 rounded-xl border text-left transition-colors ${templateId === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {p.icon}
                      </span>
                      <h4 className="font-semibold text-foreground mt-2">{p.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{p.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {validTracks.length} of {p.tracks.length} suggested tracks available
                      </p>
                    </button>
                  )
                })}
                <button
                  type="button"
                  aria-pressed={!templateId}
                  onClick={() => {
                    setTemplateId('')
                    setSelectedTracks([])
                  }}
                  className={`p-4 rounded-xl border text-left transition-colors ${!templateId ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    ✏️
                  </span>
                  <h4 className="font-semibold text-foreground mt-2">Custom goal</h4>
                  <p className="text-xs text-muted-foreground mt-1">Start with nothing selected and build the curriculum yourself.</p>
                </button>
              </div>
            </>
          ) : tracksForOutcome.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-5">Pick one or more to start with. You can add anything else in the next step.</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {tracksForOutcome.map((t) => {
                  const on = selectedTracks.some((s) => s.trackId === t.id)
                  return (
                    <button key={t.id} type="button" aria-pressed={on} onClick={() => toggleQuickTrack(t.id)} className={`p-3 rounded-xl border text-left transition-colors ${on ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}>
                      <p className="font-semibold text-sm">
                        <span aria-hidden="true">{t.icon || '📘'}</span> {t.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mb-5">No template for a custom goal. Continue to build your curriculum from every skill in the library.</p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade space-y-8">
          <section className="p-6 rounded-2xl border bg-[hsl(var(--card))] shadow-sm">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">1. Basic Details</h3>
              <p className="text-sm text-muted-foreground">What are you aiming for?</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="label-quiet mb-1.5 font-medium">Goal name</span>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Become an AI Engineer by December" aria-label="Goal name" />
            </label>
            <label className="block">
              <span className="label-quiet mb-1.5 font-medium">Target role or outcome</span>
              <input className="input-field" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Data Analyst" list="goal-role-suggestions" aria-label="Target role" />
              <datalist id="goal-role-suggestions">
                {ROLE_SUGGESTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </label>
            <label className="block sm:col-span-2">
              <span className="label-quiet mb-1.5 font-medium">Description (optional)</span>
              <textarea className="input-field min-h-[100px]" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this goal, what done looks like." aria-label="Goal description" />
            </label>
            <label className="block">
              <span className="label-quiet mb-1.5 font-medium">Target company type</span>
              <input className="input-field" value={companyType} onChange={(e) => setCompanyType(e.target.value)} list="goal-company-suggestions" aria-label="Target company type" />
              <datalist id="goal-company-suggestions">
                {COMPANY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <div>
              <span className="label-quiet block mb-1.5 font-medium">Current experience level</span>
              <div className="iv-pills mt-1" role="radiogroup" aria-label="Experience level">
                {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={experienceLevel === l} className={experienceLevel === l ? 'is-active' : ''} onClick={() => setExperienceLevel(l)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="label-quiet block">Preferred programming languages</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGE_OPTIONS.map((l) => {
                  const on = languages.includes(l)
                  return (
                    <button key={l} type="button" aria-pressed={on} className={`cb-chip ${on ? 'is-on' : ''}`} onClick={() => setLanguages(on ? languages.filter((x) => x !== l) : [...languages, l])}>
                      {l}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Examples and practice use these where a track does not dictate its own language. Your global preference is {CODE_LANGUAGES[0]}-style editable in Settings.</p>
            </div>
          </div>
        </section>

          <section className="p-6 rounded-2xl border bg-[hsl(var(--card))] shadow-sm">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">2. Curriculum</h3>
              <p className="text-sm text-muted-foreground">Add tracks, open one to include or exclude topics, and mark what you already know.</p>
            </div>
            <CurriculumBuilder
              selection={selectedTracks}
              onChange={setSelectedTracks}
              knownTopicIds={knownTopicIds}
              onKnownChange={setKnownTopicIds}
              customTracks={customTracks}
              onCustomTracksChange={onCustomTracksChange}
              hoursPerDay={hoursPerDay}
              restDays={restDays}
              onOpenTopic={onOpenTopic}
              onAskAi={() => setAiOpen(true)}
              onUseTemplate={applyTemplate}
            />
          </section>

          <section className="p-6 rounded-2xl border bg-[hsl(var(--card))] shadow-sm">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">3. Schedule</h3>
              <p className="text-sm text-muted-foreground">Set your study routine and timeline.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="label-quiet">Start date</span>
                <input required type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Start date" />
              </label>
              <label className="block">
                <span className="label-quiet">Study hours per active day</span>
                <input required type="number" min="0.5" max="16" step="0.5" className="input-field" value={hoursPerDay} onChange={(e) => setHoursPerDay(Math.min(16, Math.max(0.5, Number(e.target.value) || 0.5)))} aria-label="Study hours per active day" />
                <span className="text-xs text-muted-foreground">≈ {Math.round(hoursPerDay * studyDays.length * 10) / 10} h per week</span>
              </label>
              <div>
                <span className="label-quiet block">Study days</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {WEEKDAYS.map((d, idx) => {
                    const on = studyDays.includes(idx)
                    return (
                      <button key={d} type="button" aria-pressed={on} onClick={() => setStudyDays(on ? studyDays.filter((x) => x !== idx) : [...studyDays, idx].sort())} className={`w-11 h-11 rounded-full border text-sm font-medium transition-colors ${on ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-[hsl(var(--card))] text-muted-foreground hover:bg-muted'}`}>
                        {d}
                      </button>
                    )
                  })}
                </div>
                {studyDays.length === 0 && <p className="text-xs text-destructive mt-1">Pick at least one study day.</p>}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Deadline">
              {(
                [
                  ['auto', 'Fit to the workload', `About ${Number.isFinite(effort.days) ? effort.days : '—'} days at this pace; the plan ends when the curriculum does.`],
                  ['date', 'Target date', 'Pick the date you need to be ready by. Topics that do not fit are shown before you save.'],
                  ['ongoing', 'Ongoing goal', 'No deadline. The roadmap rolls forward and you regenerate as you go.'],
                ] as const
              ).map(([id, title, body]) => (
                <button key={id} type="button" role="radio" aria-checked={deadlineMode === id} onClick={() => setDeadlineMode(id)} className={`p-3 rounded-xl border text-left transition-colors ${deadlineMode === id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}>
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{body}</p>
                </button>
              ))}
            </div>
            {deadlineMode === 'date' && (
              <label className="block mt-3 max-w-xs">
                <span className="label-quiet">Ready by</span>
                <input type="date" className="input-field" value={targetDate} min={startDate} onChange={(e) => setTargetDate(e.target.value)} aria-label="Target date" />
                <span className="text-xs text-muted-foreground">{durationDays} days · needs about {Number.isFinite(effort.days) ? effort.days : '—'}</span>
              </label>
            )}
          </section>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade">
          <p className="text-muted-foreground mb-5">Check the plan. Go back to change anything; nothing is saved yet.</p>
          <div className="p-5 rounded-xl border border-border bg-muted/30 mb-5 space-y-3">
            <Row label="Goal" value={`${name.trim() || 'Untitled'} · ${targetRole.trim() || '—'} · ${experienceLevel}`} />
            <Row label="Pace" value={`${hoursPerDay} h on ${studyDays.map((d) => WEEKDAYS[d]).join(', ')} · ${deadlineMode === 'ongoing' ? 'ongoing' : `${durationDays} days from ${startDate}`}`} />
            <Row label="Workload" value={`${effort.topics} topics · ≈ ${fmtHours(effort.minutes)} · about ${Number.isFinite(effort.days) ? effort.days : '—'} days at this pace${knownTopicIds.length ? ` · ${knownTopicIds.length} topics skipped as known` : ''}`} tone={deadlineMode !== 'date' || effort.days <= durationDays ? 'ok' : 'warn'} />
            {summary && (
              <Row
                label="Coverage"
                value={
                  generating
                    ? 'Calculating…'
                    : summary.topicsCovered >= summary.topicsTotal
                      ? `All ${summary.topicsTotal} topics fit; learning finishes on day ${summary.lastLearningDay}${summary.emptyStudyDays ? `, leaving ${summary.emptyStudyDays} free study days` : ''}.`
                      : `${summary.topicsCovered} of ${summary.topicsTotal} topics fit in ${durationDays} days. Extend the date, add hours, or trim topics.`
                }
                tone={summary.topicsCovered >= summary.topicsTotal ? 'ok' : 'warn'}
              />
            )}
            {languages.length > 0 && <Row label="Languages" value={languages.join(', ')} />}
          </div>

          <h3 className="font-semibold mb-2">Tracks and topics, in study order</h3>
          <ul className="space-y-2 mb-5">
            {includedTopics.map(({ track, included, total, excluded }, i) => (
              <li key={track.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">
                    {i + 1}. {track.title}
                  </span>
                  <span className="text-muted-foreground">
                    {included} of {total} topics · {selectedTracks.find((t) => t.trackId === track.id)?.priority} priority
                  </span>
                </div>
                {excluded.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Excluded or known: {excluded.length}</summary>
                    <p className="text-xs text-muted-foreground mt-1">{excluded.join(' · ')}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
          {prerequisiteNotes.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm mb-5">
              <p className="font-semibold mb-1">Prerequisites to be aware of</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {prerequisiteNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          {deadlineMode === 'date' && (
            <p className="text-sm text-muted-foreground mb-3">
              Milestone: ready by <strong>{targetDate}</strong>. Suggested checkpoints: day {Math.round(durationDays / 3)} (first third of the tracks), day {Math.round((2 * durationDays) / 3)} (practice-heavy stretch), day {durationDays} (revision and mocks).
            </p>
          )}
          <h3 className="font-semibold mb-2">First three study days (preview)</h3>
          <div className="space-y-2">
            {(previewRoadmap || [])
              .filter((d) => !d.isRestDay && d.tasks.length)
              .slice(0, 3)
              .map((day) => (
                <div key={day.id} className="p-3 rounded-xl border border-border bg-[hsl(var(--card))] text-sm">
                  <div className="flex justify-between mb-1">
                    <strong>Day {day.dayNumber}</strong>
                    <span className="text-xs text-muted-foreground">{day.tasks.reduce((n, t) => n + t.estDurationMinutes, 0)} min</span>
                  </div>
                  <ul className="space-y-1">
                    {day.tasks.map((t) => (
                      <li key={t.id} className="flex justify-between gap-3">
                        <span className="truncate">{t.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{t.estDurationMinutes}m</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            {generating && <p className="text-sm text-muted-foreground animate-pulse">Building the preview…</p>}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade">
          <p className="text-muted-foreground mb-5">Save the goal, then decide how to start. You can always generate or regenerate the roadmap later.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" className="p-4 rounded-xl border border-primary bg-primary/5 text-left hover:bg-primary/10" onClick={() => create('roadmap')}>
              <h4 className="font-semibold">Generate personalized roadmap</h4>
              <p className="text-xs text-muted-foreground mt-1">Lay every included topic across your study days with spaced revision.</p>
            </button>
            <button type="button" className="p-4 rounded-xl border border-border text-left hover:bg-muted" onClick={() => create('manual')}>
              <h4 className="font-semibold">Add tasks manually</h4>
              <p className="text-xs text-muted-foreground mt-1">Keep the calendar empty and schedule topics yourself from the task picker.</p>
            </button>
            <button type="button" className="p-4 rounded-xl border border-border text-left hover:bg-muted" onClick={() => create('start')}>
              <h4 className="font-semibold">Start learning now</h4>
              <p className="text-xs text-muted-foreground mt-1">Open the first topic of your first track right away; plan later.</p>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border mt-6">
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost px-6">
            Back
          </button>
        ) : onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-ghost px-6">
            Cancel
          </button>
        ) : (
          <div />
        )}
        {step < 5 && (
          <button type="button" className="btn btn-primary px-8" disabled={!canContinue()} onClick={() => setStep(step + 1)}>
            {step === 4 ? 'Looks good' : 'Next step'}
          </button>
        )}
      </div>

      {aiOpen && (
        <AiGoalBuilder
          hoursPerDay={hoursPerDay}
          experienceLevel={experienceLevel}
          onClose={() => setAiOpen(false)}
          onApply={(result) => {
            if (result.name && !name) setName(result.name)
            if (result.description && !description) setDescription(result.description)
            if (result.targetRole) setTargetRole(result.targetRole)
            if (result.outcome) setOutcome(result.outcome)
            if (result.experienceLevel) setExperienceLevel(result.experienceLevel)
            if (result.hoursPerDay) setHoursPerDay(result.hoursPerDay)
            if (result.languages.length) setLanguages(result.languages)
            setSelectedTracks(result.tracks)
            setKnownTopicIds((prev) => Array.from(new Set([...prev, ...result.knownTopicIds])))
            if (result.customTracks) onCustomTracksChange(result.customTracks)
            setTemplateId('')
            setAiOpen(false)
            setStep(3)
          }}
          customTracks={customTracks}
        />
      )}
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border last:border-0 pb-3 last:pb-0 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium sm:text-right ${tone === 'warn' ? 'text-amber-500' : tone === 'ok' ? 'text-emerald-500' : ''}`}>{value}</span>
    </div>
  )
}
