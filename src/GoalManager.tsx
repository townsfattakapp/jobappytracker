import { addDays, dateKey, dayDate } from './lib/learningPlan'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { CurriculumTrack, ExperienceLevel, Goal, GoalOutcome, GoalTrack, RoadmapDay } from './types'
import { estimateDays, generateRoadmap, summarizeRoadmap } from './lib/roadmapGenerator'
import { careerPathById, careerPaths } from './data/careerPaths'
import { trackCategories } from './lib/curriculum/registry'
import { useCurriculum } from './lib/curriculum/useCurriculum'
import CurriculumBuilder from './components/CurriculumBuilder'
import AiGoalBuilder from './components/AiGoalBuilder'

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

const STEPS = [
  { label: 'Choose your goal', help: 'What you want to achieve' },
  { label: 'Pick a starting point', help: 'A suggested path or your own' },
  { label: 'Make it yours', help: 'Topics and study routine' },
  { label: 'Review & start', help: 'Check your plan and save' },
]
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
 * builder, schedule, level, languages) → review and save. Choose how to
 * continue (generate a roadmap, add tasks by hand, or open the first topic).
 */
export default function GoalManager({ goal, customTracks, onCustomTracksChange, onSaveGoal, onCancel, onOpenTopic, initialPathId }: GoalManagerProps) {
  const curriculum = useCurriculum()
  const initialPath = initialPathId ? careerPathById(initialPathId) : undefined
  const [step, setStep] = useState(goal || initialPath ? 3 : 1)
  const [outcome, setOutcome] = useState<GoalOutcome>(goal?.outcome || 'career')
  const [templateId, setTemplateId] = useState<string>(goal?.careerPathId || initialPath?.id || '')
  const [aiOpen, setAiOpen] = useState(false)
  const [choiceQuery, setChoiceQuery] = useState('')
  const [startMode, setStartMode] = useState<GoalCreateNext>('roadmap')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [step])

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
  const [topicsOpen, setTopicsOpen] = useState(false)
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

  const validationMessage = !selectedTracks.length || !effort.topics ? 'Choose at least one topic you want to learn.'
    : !studyDays.length ? 'Choose at least one study day.'
    : !startDate || !Number.isFinite(Date.parse(startDate)) ? 'Choose a valid start date.'
    : deadlineMode === 'date' && (!targetDate || targetDate < startDate) ? 'Choose a target date on or after your start date.'
    : ''
  const canContinue = () => step < 3 || !validationMessage

  const create = (next: GoalCreateNext) => {
    if (validationMessage || generating) return
    const newGoal = created || prepareGoal()
    if (!created) setCreated(newGoal)
    onSaveGoal(newGoal, next === 'roadmap' ? previewRoadmap || generateRoadmap(newGoal, curriculum.tracks) : [], next)
  }

  const stepTitle = ['What would you like to learn?', 'Where would you like to start?', 'Make this plan work for you', 'Your plan, ready to start'][step - 1]
  const matchesChoice = (title: string, description: string) => `${title} ${description}`.toLowerCase().includes(choiceQuery.trim().toLowerCase())
  const visibleTemplates = templatesForOutcome.filter(path => matchesChoice(path.title, path.description))
  const visibleTracks = tracksForOutcome.filter(track => matchesChoice(track.title, track.description))

  return (
    <div className="surface rounded-2xl p-5 sm:p-8 animate-rise w-full max-w-screen-2xl mx-auto">
      <nav aria-label="Goal setup" className="mb-7">
        <div className="flex flex-wrap justify-between gap-2 mb-3 text-sm">
          <span className="font-semibold text-primary">Step {step} of {STEPS.length}</span>
          <span className="text-muted-foreground">Your plan is saved when you finish</span>
        </div>
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-2" aria-label="Goal setup steps">
          {STEPS.map(({ label, help }, index) => {
            const number = index + 1
            return (
              <li key={label}>
                <button type="button" disabled={number > step} onClick={() => setStep(number)} aria-current={step === number ? 'step' : undefined}
                  className={`w-full h-full flex items-start gap-2 rounded-xl p-3 text-left border transition-colors ${step === number ? 'border-primary bg-primary/5' : number < step ? 'border-border hover:bg-muted' : 'border-transparent bg-muted/40 text-muted-foreground'}`}>
                  <span aria-hidden="true" className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${step === number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{number < step ? '✓' : number}</span>
                  <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="hidden sm:block text-xs text-muted-foreground mt-1">{help}</span><span className="sr-only">{number < step ? 'Completed, go back to edit' : step === number ? 'Current step' : 'Upcoming step'}</span></span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-display font-semibold mb-2 scroll-mt-6 focus:outline-none">{stepTitle}</h2>

      {step === 1 && (
        <div className="animate-fade">
          <p className="text-muted-foreground mb-5">Choose the option closest to your goal. You can adjust the topics and pace before saving.</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Goal outcome">
            {OUTCOMES.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={outcome === o.id}
                onClick={() => {
                  setOutcome(o.id)
                  setChoiceQuery('')
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
            <span>Prefer to describe it in your own words? Get a suggested plan, then review it before saving.</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAiOpen(true)}>
              Describe my goal to the AI
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade">
          {(templatesForOutcome.length > 0 || tracksForOutcome.length > 0) && (
            <label className="block mb-4 max-w-lg">
              <span className="label-quiet">Find a path or skill</span>
              <input type="search" className="input-field" placeholder="Search by role, language, or technology" value={choiceQuery} onChange={event => setChoiceQuery(event.target.value)} />
            </label>
          )}
          {choiceQuery && !visibleTemplates.length && !visibleTracks.length && <p role="status" className="text-sm text-muted-foreground mb-4">No matches. Try a broader search, or continue to choose your own topics.</p>}
          {templatesForOutcome.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-5">Choose a suggested path, or start from scratch. You can change its topics in the next step.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTemplates.map((p) => {
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
                  <h4 className="font-semibold text-foreground mt-2">Start from scratch</h4>
                  <p className="text-xs text-muted-foreground mt-1">Start with nothing selected and build the curriculum yourself.</p>
                </button>
              </div>
            </>
          ) : tracksForOutcome.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-5">Pick one or more to start with. You can add anything else in the next step.</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {visibleTracks.map((t) => {
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
            <p className="text-muted-foreground mb-5">You are building your own plan. Continue to choose the skills and topics you want to learn.</p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade space-y-5">
          <p className="text-muted-foreground">Give your plan a name, check the topics, and choose a routine you can keep.</p>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-primary/5 border border-primary/20 p-4" aria-label="Your plan at a glance">
            <div><strong className="block text-lg">{selectedTracks.length}</strong><span className="text-xs text-muted-foreground">learning tracks</span></div>
            <div><strong className="block text-lg">{effort.topics}</strong><span className="text-xs text-muted-foreground">topics to learn</span></div>
            <div><strong className="block text-lg">{Math.round(hoursPerDay * studyDays.length * 10) / 10} h</strong><span className="text-xs text-muted-foreground">per week</span></div>
          </div>
          <section className="p-4 sm:p-6 rounded-2xl border border-border bg-[hsl(var(--card))]">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">1. Name your plan</h3>
              <p className="text-sm text-muted-foreground">Choose a name you will recognize in your daily plan.</p>
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
            <details className="sm:col-span-2 rounded-xl border border-border p-4">
              <summary className="cursor-pointer text-sm font-medium">More preferences <span className="font-normal text-muted-foreground">(optional)</span></summary>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
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
            <div className="sm:col-span-2">
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
              <p className="text-xs text-muted-foreground mt-1">Choose any languages you prefer. A course may still use its own required language.</p>
            </div>
              </div>
            </details>
          </div>
        </section>

          <section className="p-4 sm:p-6 rounded-2xl border border-border bg-[hsl(var(--card))]">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">2. Choose what to learn</h3>
              <p className="text-sm text-muted-foreground">A track is a group of related topics. Keep the suggested selection, or open the editor to change it.</p>
            </div>
            {selectedTracks.length > 0 && <ul aria-label="Selected learning tracks" className="flex flex-wrap gap-2 mb-4">
              {selectedTracks.map(track => <li key={track.trackId} className="rounded-lg bg-muted px-3 py-2 text-sm">{curriculum.trackById.get(track.trackId)?.title ?? track.trackId}</li>)}
            </ul>}
            <details className="rounded-xl border border-border p-3" open={topicsOpen || selectedTracks.length === 0} onToggle={event => setTopicsOpen(event.currentTarget.open)}>
              <summary className="cursor-pointer text-sm font-medium">Edit learning topics · {selectedTracks.length} tracks selected</summary>
              <div className="mt-4">
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
              </div>
            </details>
          </section>

          <section className="p-4 sm:p-6 rounded-2xl border border-border bg-[hsl(var(--card))]">
            <div className="border-b border-border/50 pb-3 mb-5">
              <h3 className="font-semibold text-lg">3. Set your study routine</h3>
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
                  ['auto', 'Estimate my finish date', `About ${Number.isFinite(effort.days) ? effort.days : '—'} days of learning, plus revision. Preview up to one year and check what fits before saving.`],
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
          <p className="text-muted-foreground mb-5">Check your topics and routine, then create your plan. You can edit it later.</p>
          <div className="p-5 rounded-xl border border-border bg-muted/30 mb-5 space-y-3">
            <Row label="Goal" value={name.trim() || (targetRole.trim() ? `${targetRole.trim()} plan` : 'My learning goal')} />
            <Row label="Starting level" value={experienceLevel} />
            {targetRole.trim() && <Row label="Target role" value={targetRole.trim()} />}
            <Row label="Pace" value={`${hoursPerDay} h on ${studyDays.map((d) => WEEKDAYS[d]).join(', ')} · ${deadlineMode === 'ongoing' ? 'ongoing' : `${durationDays} days from ${startDate}`}`} />
            <Row label="Learning time" value={`${effort.topics} topics · about ${fmtHours(effort.minutes)} before revision${knownTopicIds.length ? ` · ${knownTopicIds.length} topics marked as known` : ''}`} />
            {summary && (
              <Row
                label="Coverage"
                value={
                  generating
                    ? 'Calculating…'
                    : summary.topicsCovered >= summary.topicsTotal
                      ? `All ${summary.topicsTotal} topics fit; learning finishes on day ${summary.lastLearningDay}${summary.emptyStudyDays ? `, leaving ${summary.emptyStudyDays} free study days` : ''}.`
                      : `${summary.topicsCovered} of ${summary.topicsTotal} topics fit in this ${durationDays}-day schedule. ${durationDays >= 365 ? 'Split this into smaller goals, add study time, or continue the remaining topics in a later plan.' : 'Extend the date, add study time, or choose fewer topics.'}`
                }
                tone={summary.topicsCovered >= summary.topicsTotal ? 'ok' : 'warn'}
              />
            )}
            {languages.length > 0 && <Row label="Languages" value={languages.join(', ')} />}
          </div>

          <button type="button" className="btn btn-ghost btn-sm mb-4" onClick={() => setStep(3)}>Edit topics or schedule</button>
          <h3 className="font-semibold mb-2">What you will learn, in order</h3>
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

      {step === 4 && (
        <fieldset className="mt-6 border-t border-border pt-5">
          <legend className="font-semibold pt-4">How would you like to begin?</legend>
          <p className="text-sm text-muted-foreground mb-4">We recommend a daily schedule so you know exactly what to study next.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              ['roadmap', 'Plan my study days', 'Recommended', 'Create a daily schedule with learning tasks and revision.'],
              ['manual', 'Schedule tasks myself', '', 'Save your goal with an empty calendar. Add tasks when you are ready.'],
              ['start', 'Open my first lesson', '', 'Save your goal and start the first topic. Make a schedule later.'],
            ] as const).map(([id, title, badge, body]) => (
              <label key={id} className={`p-4 rounded-xl border cursor-pointer ${startMode === id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                <span className="flex gap-2 items-center"><input type="radio" name="goal-start-mode" value={id} checked={startMode === id} onChange={() => setStartMode(id)} className="accent-primary" /><span className="font-semibold text-sm">{title}</span></span>
                {badge && <span className="inline-block mt-2 text-xs font-semibold text-primary">{badge}</span>}
                <span className="block text-xs text-muted-foreground mt-2">{body}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-10 bg-[hsl(var(--card))] border-t border-border mt-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost">Back</button>
          ) : onCancel ? (
            <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
          ) : <span className="text-xs text-muted-foreground">You can edit your plan later</span>}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {step >= 3 && validationMessage && <p role="status" id="goal-validation" className="text-xs text-destructive max-w-xs">{validationMessage}</p>}
          <button type="button" className="btn btn-primary" aria-describedby={step >= 3 && validationMessage ? 'goal-validation' : undefined} disabled={!canContinue() || (step === 4 && generating)} onClick={() => step === 4 ? create(startMode) : setStep(step + 1)}>
            {step === 4 ? generating ? 'Preparing preview...' : goal ? 'Save changes' : 'Create my learning plan' : ['Choose a starting point', 'Customize my plan', 'Review my plan'][step - 1]}
          </button>
        </div>
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
