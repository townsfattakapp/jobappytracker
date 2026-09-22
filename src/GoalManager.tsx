import { dateKey, dayDate } from './lib/learningPlan'
import { useMemo, useState, type FormEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Goal, RoadmapDay, GoalTrack, CurriculumTrack } from './types'
import { estimateTrack, generateRoadmap, summarizeRoadmap } from './lib/roadmapGenerator'
import CurriculumPicker from './components/CurriculumPicker'

interface GoalManagerProps {
  goal: Goal | null
  learningTracks: CurriculumTrack[]
  onSaveGoal: (goal: Goal, generatedRoadmap: RoadmapDay[]) => void
  /** Present when the user already has a goal and can back out of creating another. */
  onCancel?: () => void
}

const STEPS = ['Objective', 'Schedule', 'Curriculum', 'Review']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ROLE_SUGGESTIONS = ['Full-Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'SDE-1', 'SDE-2', 'Data Engineer', 'DevOps Engineer']
const COMPANY_SUGGESTIONS = ['Product-Based', 'FAANG / Big Tech', 'Funded Startup', 'Service-Based', 'Remote-first']

function fmtHours(minutes: number): string {
  return `${Math.round(minutes / 60)} h`
}

export default function GoalManager({ goal, learningTracks, onSaveGoal, onCancel }: GoalManagerProps) {
  const [step, setStep] = useState(1)

  const [targetRole, setTargetRole] = useState(goal?.targetRole || 'Full-Stack Engineer')
  const [companyType, setCompanyType] = useState(goal?.companyType || 'Product-Based')
  const [goalType, setGoalType] = useState<'Fixed' | 'Ongoing'>(goal?.goalType || 'Fixed')

  const [draftGoalId] = useState(() => goal?.id || uuidv4())
  const [startDate, setStartDate] = useState(goal?.startDate || dateKey())
  const [durationDays, setDurationDays] = useState(goal?.durationDays || 90)
  const [hoursPerDay, setHoursPerDay] = useState(goal?.hoursPerDay || 2)
  const [restDays, setRestDays] = useState<number[]>(goal?.restDays || [0])
  const [selectedTracks, setSelectedTracks] = useState<GoalTrack[]>(goal?.tracks || [])
  const [previewRoadmap, setPreviewRoadmap] = useState<RoadmapDay[]>([])
  const [generating, setGenerating] = useState(false)

  const toggleTrack = (trackId: string) => {
    setSelectedTracks((prev) => {
      const exists = prev.find((t) => t.trackId === trackId)
      if (exists) return prev.filter((t) => t.trackId !== trackId)
      return [...prev, { trackId, priority: 'Medium' }]
    })
  }

  const setPriority = (trackId: string, priority: GoalTrack['priority']) => {
    setSelectedTracks((prev) => prev.map((t) => (t.trackId === trackId ? { ...t, priority } : t)))
  }

  const toggleRestDay = (dayIndex: number) => {
    setRestDays((prev) => (prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]))
  }

  const effectiveDuration = goalType === 'Ongoing' ? 365 : durationDays

  const prepareGoal = (): Goal => ({
    id: draftGoalId,
    targetRole: targetRole.trim() || 'Software Engineer',
    companyType: companyType.trim() || 'Product-Based',
    startDate,
    durationDays: effectiveDuration,
    hoursPerDay,
    restDays,
    tracks: selectedTracks,
    status: 'Active',
    goalType,
    createdAt: goal?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Effort maths shown on the curriculum step so the user can size the plan before generating it.
  const effort = useMemo(() => {
    const chosen = selectedTracks
      .map((t) => learningTracks.find((x) => x.id === t.trackId))
      .filter((t): t is CurriculumTrack => Boolean(t))
      .map(estimateTrack)
    const minutes = chosen.reduce((n, t) => n + t.minutes, 0)
    const topics = chosen.reduce((n, t) => n + t.topics, 0)
    const studyDaysPerWeek = 7 - restDays.length
    const studyDays = Math.round((effectiveDuration * studyDaysPerWeek) / 7)
    const learnMinutesAvailable = studyDays * hoursPerDay * 60 * 0.8
    const daysNeeded = studyDaysPerWeek > 0 && hoursPerDay > 0 ? Math.ceil(minutes / (hoursPerDay * 60 * 0.8) / (studyDaysPerWeek / 7)) : Infinity
    return { minutes, topics, studyDays, learnMinutesAvailable, daysNeeded, fits: minutes <= learnMinutesAvailable }
  }, [selectedTracks, learningTracks, restDays, effectiveDuration, hoursPerDay])

  const summary = previewRoadmap.length ? summarizeRoadmap(prepareGoal(), previewRoadmap, learningTracks) : null

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault()
    if (step === 3) {
      setGenerating(true)
      // Let the button show its busy state before the (synchronous) generation runs.
      window.setTimeout(() => {
        setPreviewRoadmap(generateRoadmap(prepareGoal(), learningTracks))
        setGenerating(false)
        setStep(4)
      }, 30)
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const newGoal = prepareGoal()
    onSaveGoal(newGoal, previewRoadmap.length > 0 ? previewRoadmap : generateRoadmap(newGoal, learningTracks))
  }

  const trackTitle = (id: string) => learningTracks.find((t) => t.id === id)?.title || id

  return (
    <form onSubmit={step === 4 ? handleSubmit : handleNextStep} className="surface rounded-2xl p-5 sm:p-8 animate-rise max-w-3xl mx-auto">
      <ol className="flex items-center gap-2 mb-8 text-sm font-medium" aria-label="Goal setup steps">
        {STEPS.map((label, i) => {
          const s = i + 1
          return (
            <li key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
                aria-current={step === s ? 'step' : undefined}
              >
                {step > s ? '✓' : s}
              </div>
              <span className={`hidden sm:inline text-xs ${step === s ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{label}</span>
              {s < 4 && <div className="w-4 sm:w-8 h-px bg-border"></div>}
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <div className="animate-fade">
          <h2 className="text-2xl font-display font-semibold mb-2">Define your objective</h2>
          <p className="text-muted-foreground mb-6">What are you preparing for? This only labels your plan; you can edit it later.</p>

          <div className="grid grid-cols-1 gap-5 mb-6">
            <label className="block">
              <span className="label-quiet">Target role</span>
              <input
                required
                className="input-field"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                list="goal-role-suggestions"
                autoFocus
              />
              <datalist id="goal-role-suggestions">
                {ROLE_SUGGESTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="label-quiet">Target company type</span>
              <input
                required
                className="input-field"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                placeholder="e.g. FAANG, remote startup, enterprise"
                list="goal-company-suggestions"
              />
              <datalist id="goal-company-suggestions">
                {COMPANY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2" role="radiogroup" aria-label="Goal type">
              <button
                type="button"
                role="radio"
                aria-checked={goalType === 'Fixed'}
                onClick={() => setGoalType('Fixed')}
                className={`p-4 rounded-xl border text-left transition-colors ${goalType === 'Fixed' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}
              >
                <h4 className="font-semibold text-foreground">Fixed deadline</h4>
                <p className="text-xs text-muted-foreground mt-1">Interviews in a set window, e.g. the next 90 days.</p>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={goalType === 'Ongoing'}
                onClick={() => setGoalType('Ongoing')}
                className={`p-4 rounded-xl border text-left transition-colors ${goalType === 'Ongoing' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-[hsl(var(--card))] hover:bg-muted'}`}
              >
                <h4 className="font-semibold text-foreground">Ongoing growth</h4>
                <p className="text-xs text-muted-foreground mt-1">A rolling 12-month plan with no fixed deadline.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade">
          <h2 className="text-2xl font-display font-semibold mb-2">Set your schedule</h2>
          <p className="text-muted-foreground mb-6">Be realistic. A plan you can keep beats one you abandon in week two.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <label className="block">
              <span className="label-quiet">Start date</span>
              <input required type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>

            {goalType === 'Fixed' && (
              <label className="block">
                <span className="label-quiet">Duration (days)</span>
                <input
                  required
                  type="number"
                  min="7"
                  max="365"
                  aria-label="Duration (days)"
                  className="input-field"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.min(365, Math.max(7, Number(e.target.value) || 7)))}
                />
                <span className="text-xs text-muted-foreground">Ends {dayDate(new Date(new Date(`${startDate}T12:00:00`).getTime() + (durationDays - 1) * 86400000).toISOString())}</span>
              </label>
            )}

            <label className="block">
              <span className="label-quiet">Study hours per active day</span>
              <input
                required
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                aria-label="Study hours per active day"
                className="input-field"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Math.min(16, Math.max(0.5, Number(e.target.value) || 0.5)))}
              />
              <span className="text-xs text-muted-foreground">About 20% of each day is reserved for spaced revision.</span>
            </label>
          </div>

          <div className="mb-6">
            <span className="label-quiet block mb-3">Rest days (nothing is scheduled)</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day, idx) => (
                <button
                  type="button"
                  key={day}
                  aria-pressed={restDays.includes(idx)}
                  onClick={() => toggleRestDay(idx)}
                  className={`w-12 h-12 rounded-full border text-sm font-medium transition-colors flex items-center justify-center ${
                    restDays.includes(idx) ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-[hsl(var(--card))] text-foreground hover:bg-muted'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {restDays.length >= 6 && <p className="text-xs text-destructive mt-2">Leave at least two study days per week.</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade">
          <h2 className="text-2xl font-display font-semibold mb-2">Build your curriculum</h2>
          <p className="text-muted-foreground mb-4">
            Pick the tracks to include. Tap a card to select it; set priorities to decide which track gets more time. You can change this later from Learning Tracks.
          </p>

          <CurriculumPicker tracks={learningTracks} selected={selectedTracks} onToggleTrack={toggleTrack} onPriorityChange={setPriority} />

          <div className={`mt-4 rounded-xl border p-4 text-sm ${selectedTracks.length === 0 ? 'border-border bg-muted/30' : effort.fits ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`} aria-live="polite">
            {selectedTracks.length === 0 ? (
              <p className="text-muted-foreground">Select at least one track to continue.</p>
            ) : (
              <>
                <p className="font-semibold text-foreground">
                  {selectedTracks.length} track{selectedTracks.length > 1 ? 's' : ''} · {effort.topics} topics · ≈ {fmtHours(effort.minutes)} of learning
                </p>
                <p className="text-muted-foreground mt-1">
                  {effort.fits
                    ? `At ${hoursPerDay} h/day this fits in about ${Math.min(effort.daysNeeded, effectiveDuration)} days; the remaining days stay free for revision and mock interviews.`
                    : `At ${hoursPerDay} h/day this needs about ${effort.daysNeeded} days, but your goal is ${effectiveDuration} days. Extend the duration, add hours, or drop a track; otherwise later topics will not be scheduled.`}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade">
          <h2 className="text-2xl font-display font-semibold mb-2">Review &amp; generate</h2>
          <p className="text-muted-foreground mb-6">Here is what your plan looks like. Generate it, then adjust any day from the roadmap.</p>

          <div className="p-5 rounded-xl border border-border bg-muted/30 mb-6 space-y-3">
            <Row label="Objective" value={`${targetRole} · ${companyType}`} />
            <Row label="Pace" value={`${goalType === 'Fixed' ? `${durationDays} days` : 'Ongoing (365 days)'} · ${hoursPerDay} h/day · rest ${restDays.length ? restDays.map((d) => WEEKDAYS[d]).join(', ') : 'none'}`} />
            <Row label="Tracks" value={selectedTracks.map((t) => `${trackTitle(t.trackId)} (${t.priority})`).join(', ')} />
            {summary && (
              <>
                <Row label="Scheduled" value={`${summary.tasks} tasks · ${fmtHours(summary.learnMinutes)} learning + ${fmtHours(summary.reviseMinutes)} revision over ${summary.studyDays} study days`} />
                <Row
                  label="Coverage"
                  value={
                    summary.topicsCovered >= summary.topicsTotal
                      ? `All ${summary.topicsTotal} topics; learning finishes on day ${summary.lastLearningDay}${summary.emptyStudyDays ? `, then ${summary.emptyStudyDays} free days for revision and mocks` : ''}`
                      : `${summary.topicsCovered} of ${summary.topicsTotal} topics fit. Go back to extend the duration or reduce tracks if you want everything covered.`
                  }
                  tone={summary.topicsCovered >= summary.topicsTotal ? 'ok' : 'warn'}
                />
              </>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-3">First three study days</h3>
          <div className="space-y-3 mb-2">
            {previewRoadmap
              .filter((d) => !d.isRestDay)
              .slice(0, 3)
              .map((day) => (
                <div key={day.id} className="p-4 rounded-xl border border-border bg-[hsl(var(--card))]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Day {day.dayNumber}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(`${dayDate(day.date)}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                      {day.tasks.reduce((n, t) => n + t.estDurationMinutes, 0)} min
                    </span>
                  </div>
                  {day.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {day.tasks.map((t) => (
                        <li key={t.id} className="text-sm flex justify-between items-center gap-3">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${t.activity === 'Revise Topic' ? 'bg-amber-500' : 'bg-primary'}`}></span>
                            <span className="truncate">{t.title}</span>
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">{t.estDurationMinutes}m</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Purple = learning task from the curriculum, amber = spaced revision (3, 7 and 14 days after finishing a topic).</p>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border mt-4">
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost px-6">
            Back
          </button>
        ) : onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-ghost px-6">
            Cancel
          </button>
        ) : (
          <div></div>
        )}

        <button
          type="submit"
          className="btn btn-primary px-8"
          disabled={(step === 3 && selectedTracks.length === 0) || (step === 2 && restDays.length >= 6) || generating}
        >
          {generating ? 'Building plan…' : step === 4 ? 'Generate Roadmap' : step === 3 ? 'Preview plan' : 'Next Step'}
        </button>
      </div>
    </form>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border last:border-0 pb-3 last:pb-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium sm:text-right ${tone === 'warn' ? 'text-amber-500' : tone === 'ok' ? 'text-emerald-500' : ''}`}>{value}</span>
    </div>
  )
}
