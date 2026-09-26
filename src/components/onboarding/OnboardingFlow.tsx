import { useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { careerPaths } from '../../data/careerPaths'
import { api, ApiError } from '../../lib/adminClient'
import { findTrack } from '../../lib/curriculum/registry'
import { dateKey } from '../../lib/learningPlan'
import { REGION_PREFERENCES, ROLE_CATEGORIES, WORK_MODES, type RegionPreference, type WorkMode } from '../../lib/jobs/taxonomy'
import { uploadResume } from '../../lib/resume/client'
import { generateRoadmap } from '../../lib/roadmapGenerator'
import type { ExperienceLevel, Goal, OnboardingState, RoadmapDay } from '../../types'

interface Props {
  userName: string | null
  hasGoal: boolean
  canUploadResume: boolean
  onCreateGoal: (goal: Goal, roadmap: RoadmapDay[]) => void
  onComplete: (state: OnboardingState) => void
  onToast: (message: string) => void
}

type StepId = 'welcome' | 'career' | 'experience' | 'skills' | 'resume' | 'location' | 'region' | 'remote' | 'availability' | 'curriculum' | 'jobprefs' | 'done'
const STEPS: { id: StepId; title: string; optional: boolean }[] = [
  { id: 'welcome', title: 'Welcome', optional: false },
  { id: 'career', title: 'Career target', optional: false },
  { id: 'experience', title: 'Experience', optional: false },
  { id: 'skills', title: 'Skills', optional: true },
  { id: 'resume', title: 'Resume', optional: true },
  { id: 'location', title: 'Location', optional: true },
  { id: 'region', title: 'India or international', optional: false },
  { id: 'remote', title: 'Remote preference', optional: true },
  { id: 'availability', title: 'Learning availability', optional: false },
  { id: 'curriculum', title: 'Curriculum recommendation', optional: false },
  { id: 'jobprefs', title: 'Job preferences', optional: false },
  { id: 'done', title: 'Career dashboard', optional: false },
]

const levelFor = (years: number): ExperienceLevel => (years < 1 ? 'Beginner' : years < 4 ? 'Intermediate' : 'Advanced')

/**
 * First-time onboarding: short, skippable where optional, and every answer
 * lands in an existing feature (learning goal + roadmap, job preferences,
 * resume). Nothing here invents data; the learner can change all of it later.
 */
export default function OnboardingFlow({ userName, hasGoal, canUploadResume, onCreateGoal, onComplete, onToast }: Props) {
  const [index, setIndex] = useState(0)
  const [roleCategory, setRoleCategory] = useState<string>('')
  const [years, setYears] = useState<number>(0)
  const [level, setLevel] = useState<ExperienceLevel>('Beginner')
  const [skillsText, setSkillsText] = useState('')
  const [resumeTitle, setResumeTitle] = useState<string | null>(null)
  const [city, setCity] = useState('')
  const [region, setRegion] = useState<RegionPreference>('india')
  const [workModes, setWorkModes] = useState<WorkMode[]>(['remote', 'hybrid', 'onsite'])
  const [hours, setHours] = useState(2)
  const [weekendsOff, setWeekendsOff] = useState(true)
  const [goalCreated, setGoalCreated] = useState(hasGoal)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [skipped, setSkipped] = useState<string[]>([])

  const step = STEPS[index]
  const category = ROLE_CATEGORIES.find((c) => c.id === roleCategory) ?? null
  const path = useMemo(() => (category ? careerPaths.find((p) => category.careerPathIds.includes(p.id)) ?? null : null), [category])
  const pathTracks = useMemo(() => (path ? path.tracks.map((t) => ({ ...t, track: findTrack(t.trackId) })).filter((t) => t.track) : []), [path])
  const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 40)

  const finish = (extraSkipped: string[] = []) => onComplete({ completedAt: new Date().toISOString(), skippedSteps: Array.from(new Set([...skipped, ...extraSkipped])), careerPathId: path?.id ?? null, roleCategory: roleCategory || null, experienceLevel: roleCategory ? level : null, hoursPerDay: hours })
  const next = () => setIndex((i) => Math.min(STEPS.length - 1, i + 1))
  const back = () => setIndex((i) => Math.max(0, i - 1))
  const skip = () => {
    setSkipped((s) => [...s, step.id])
    next()
  }

  const createGoal = () => {
    if (!path || !category || goalCreated) {
      next()
      return
    }
    const today = dateKey()
    const now = new Date().toISOString()
    const goal: Goal = { id: uuidv4(), name: `${category.label} plan`, targetRole: category.label, companyType: '', startDate: today, durationDays: 90, hoursPerDay: hours, restDays: weekendsOff ? [0, 6] : [], tracks: pathTracks.map((t, order) => ({ trackId: t.trackId, priority: t.priority, order })), status: 'Active', goalType: 'Ongoing', createdAt: now, updatedAt: now, outcome: 'career', careerPathId: path.id, experienceLevel: level }
    const roadmap = generateRoadmap(goal)
    onCreateGoal(goal, roadmap)
    setGoalCreated(true)
    onToast(`Learning plan created: ${pathTracks.length} tracks scheduled at ${hours} h/day`)
    next()
  }

  const savePrefs = async () => {
    setBusy('prefs')
    setError(null)
    try {
      await api('/api/jobs/preferences', { method: 'PUT', json: { roleCategories: roleCategory ? [roleCategory] : [], skills, experienceYears: years, locations: city ? [city] : [], regionPreference: region, workModes, levels: [], employmentTypes: [], salaryMin: null, salaryCurrency: null } })
      setPrefsSaved(true)
      next()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save job preferences')
    } finally {
      setBusy(null)
    }
  }

  const onResumeFile = async (file: File | undefined) => {
    if (!file) return
    setBusy('resume')
    setError(null)
    try {
      const uploaded = await uploadResume(file, { targetRoleCategory: roleCategory || undefined })
      setResumeTitle(uploaded.title)
      onToast(`Uploaded ${uploaded.title}`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not upload the resume')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="onb" role="region" aria-labelledby="onb-title">
      <div className="onb-progress" aria-hidden="true">
        <div className="onb-progress-bar" style={{ width: `${Math.round(((index + 1) / STEPS.length) * 100)}%` }} />
      </div>
      <p className="onb-step">
        Step {index + 1} of {STEPS.length} · {step.title}
        {step.optional ? ' (optional)' : ''}
      </p>
      {error && (
        <p className="admin-alert admin-alert-error" role="alert">
          {error}
        </p>
      )}

      {step.id === 'welcome' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}. Let&apos;s set up your Career OS.
          </h1>
          <p className="onb-text">Ten quick questions build your learning plan, tune job discovery and prepare the interview tools. Every answer can be changed later. It takes about three minutes; optional steps can be skipped.</p>
          <div className="onb-actions">
            <button type="button" className="btn btn-primary" onClick={next}>
              Start setup
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => finish(['all'])}>
              Skip setup for now
            </button>
          </div>
        </section>
      )}

      {step.id === 'career' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            What role are you working towards?
          </h1>
          <div className="onb-grid" role="group" aria-label="Career target">
            {ROLE_CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={`onb-choice${roleCategory === c.id ? ' is-on' : ''}`} aria-pressed={roleCategory === c.id} onClick={() => setRoleCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          {path && <p className="onb-text">Recommended path: <strong>{path.title}</strong>. {path.description}</p>}
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={next} disabled={!roleCategory}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'experience' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            How much professional experience do you have?
          </h1>
          <label className="admin-field">
            <span>Years of experience</span>
            <input className="input-field" inputMode="numeric" value={years} onChange={(e) => { const y = Math.max(0, Math.min(40, Number(e.target.value) || 0)); setYears(y); setLevel(levelFor(y)) }} aria-label="Years of experience" />
          </label>
          <div className="pref-chips mt-3" role="group" aria-label="Experience level">
            {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((l) => (
              <button key={l} type="button" className="pref-chip" aria-pressed={level === l} onClick={() => setLevel(l)}>
                {l}
              </button>
            ))}
          </div>
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'skills' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Which skills do you already have?
          </h1>
          <p className="onb-text">Comma separated, for example: Java, Spring Boot, SQL. Only list what you can talk about in an interview.</p>
          <input className="input-field" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Java, SQL, React" aria-label="Skills" />
          {skills.length > 0 && (
            <ul className="jiv-chips mt-2">
              {skills.map((s) => (
                <li key={s} className="job-chip">
                  {s}
                </li>
              ))}
            </ul>
          )}
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={skip}>
              Skip
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'resume' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Add your resume (PDF or text)
          </h1>
          <p className="onb-text">It stays private on the server and powers resume-vs-job analysis, referral drafts and interview questions about your real projects. You can add or replace it later in the Resume workspace.</p>
          {canUploadResume ? (
            <>
              <input type="file" accept=".pdf,.txt,application/pdf,text/plain" aria-label="Resume file" className="input-field" onChange={(e) => void onResumeFile(e.target.files?.[0])} disabled={busy !== null} />
              {resumeTitle && <p className="text-sm mt-2">Uploaded: {resumeTitle}</p>}
            </>
          ) : (
            <p className="text-sm">Resume upload is not included in your current plan.</p>
          )}
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={skip}>
              Skip
            </button>
            <button type="button" className="btn btn-primary" onClick={next} disabled={busy !== null}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'location' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Where are you based?
          </h1>
          <input className="input-field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, e.g. Bengaluru" aria-label="City" />
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={skip}>
              Skip
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'region' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Which openings should we show?
          </h1>
          <div className="pref-chips" role="group" aria-label="Region preference">
            {REGION_PREFERENCES.map((r) => (
              <button key={r.id} type="button" className="pref-chip" aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'remote' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Remote, hybrid or on-site?
          </h1>
          <div className="pref-chips" role="group" aria-label="Work modes">
            {WORK_MODES.map((w) => (
              <button key={w.id} type="button" className="pref-chip" aria-pressed={workModes.includes(w.id)} onClick={() => setWorkModes((m) => (m.includes(w.id) ? m.filter((x) => x !== w.id) : [...m, w.id]))}>
                {w.label}
              </button>
            ))}
          </div>
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={skip}>
              Skip
            </button>
            <button type="button" className="btn btn-primary" onClick={next} disabled={workModes.length === 0}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'availability' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            How much time can you study each day?
          </h1>
          <div className="pref-chips" role="group" aria-label="Hours per day">
            {[1, 2, 3, 4, 6].map((h) => (
              <button key={h} type="button" className="pref-chip" aria-pressed={hours === h} onClick={() => setHours(h)}>
                {h} h/day
              </button>
            ))}
          </div>
          <label className="admin-check mt-3">
            <input type="checkbox" checked={weekendsOff} onChange={(e) => setWeekendsOff(e.target.checked)} /> <span>Keep weekends free</span>
          </label>
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step.id === 'curriculum' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Your recommended curriculum
          </h1>
          {!path ? (
            <p className="onb-text">Pick a career target first to get a recommendation.</p>
          ) : (
            <>
              <p className="onb-text">
                <strong>{path.title}</strong> · {pathTracks.length} tracks scheduled at {hours} h/day{weekendsOff ? ', weekends free' : ''}. You can add, remove and reorder tracks any time in Goals &amp; Roadmap.
              </p>
              <ol className="onb-tracks">
                {pathTracks.map((t) => (
                  <li key={t.trackId}>
                    <strong>{t.track!.title}</strong> <span className="text-xs text-muted-foreground">· {t.priority} priority</span>
                    {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            {goalCreated ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                {hasGoal ? 'Keep my existing learning plan' : 'Continue'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={createGoal} disabled={!path}>
                Create my learning plan
              </button>
            )}
          </div>
        </section>
      )}

      {step.id === 'jobprefs' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            Job discovery preferences
          </h1>
          <dl className="job-facts">
            <div>
              <dt className="job-fact-label">Target role</dt>
              <dd className="job-fact-value">{category?.label ?? 'Not set'}</dd>
            </div>
            <div>
              <dt className="job-fact-label">Experience</dt>
              <dd className="job-fact-value">{years} years · {level}</dd>
            </div>
            <div>
              <dt className="job-fact-label">Skills</dt>
              <dd className="job-fact-value">{skills.join(', ') || 'Not set'}</dd>
            </div>
            <div>
              <dt className="job-fact-label">Where</dt>
              <dd className="job-fact-value">{REGION_PREFERENCES.find((r) => r.id === region)?.label}{city ? ` · ${city}` : ''}</dd>
            </div>
            <div>
              <dt className="job-fact-label">Work modes</dt>
              <dd className="job-fact-value">{workModes.map((w) => WORK_MODES.find((x) => x.id === w)?.label).join(', ')}</dd>
            </div>
          </dl>
          <div className="onb-actions">
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={savePrefs} disabled={busy !== null}>
              {busy === 'prefs' ? 'Saving…' : prefsSaved ? 'Saved' : 'Save job preferences'}
            </button>
          </div>
        </section>
      )}

      {step.id === 'done' && (
        <section className="onb-card">
          <h1 id="onb-title" className="onb-title">
            You&apos;re set up
          </h1>
          <ul className="onb-tracks">
            <li>{goalCreated ? 'Learning plan on your roadmap' : 'No learning plan yet (create one in Goals & Roadmap)'}</li>
            <li>{prefsSaved ? 'Job discovery tuned to your preferences' : 'Job preferences not saved'}</li>
            <li>{resumeTitle ? `Resume ${resumeTitle} ready for analysis` : 'Resume: add it later in the Resume workspace'}</li>
          </ul>
          <div className="onb-actions">
            <button type="button" className="btn btn-primary" onClick={() => finish()}>
              Go to my Career Command Center
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
