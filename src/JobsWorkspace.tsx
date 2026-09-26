import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import LockedFeature from './components/LockedFeature'
import type { AppUser } from './lib/cloudSync'
import { ApiError } from './lib/adminClient'
import { fetchJobs, fetchPreferences, savePreferences, type JobListResponse, type LearnerJob } from './lib/jobs/client'
import { mapJobToCurriculum } from './lib/jobs/curriculumMap'
import { parsePreferencesInput, ValidationError } from './lib/jobs/normalize'
import { EMPLOYMENT_TYPES, JOB_LEVELS, REGIONS, REGION_PREFERENCES, ROLE_CATEGORIES, SALARY_CURRENCIES, WORK_MODES, labelOf } from './lib/jobs/taxonomy'
import { emptyPreferences, hasPreferences, type JobListFilters, type LearnerJobPreferences } from './lib/jobs/types'
import type { Goal, KnowledgeWorkspace, RoadmapDay } from './types'

interface JobsWorkspaceProps {
  user: AppUser | null
  /** Feature keys the caller's tier includes (from /api/platform/config). */
  features: string[]
  disabledRoleFamilies: string[]
  goals: Goal[]
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  onOpenJob: (id: string) => void
  onSignIn: () => void
  onUpgrade: () => void
  onToast: (message: string) => void
}

const PAGE_SIZE = 20

export function freshnessLabel(f: LearnerJob['freshness'], lifecycle?: LearnerJob['lifecycle']): { text: string; tone: 'fresh' | 'neutral' | 'stale' } {
  if (lifecycle === 'stale') return { text: 'Not seen at source recently', tone: 'stale' }
  switch (f) {
    case 'fresh':
      return { text: 'Verified recently', tone: 'fresh' }
    case 'aging':
      return { text: 'Verified 2–4 weeks ago', tone: 'neutral' }
    case 'stale':
      return { text: 'Not verified in 30+ days', tone: 'stale' }
    default:
      return { text: 'Expired', tone: 'stale' }
  }
}

export function locationLabel(job: Pick<LearnerJob, 'locationCity' | 'locationCountry' | 'workMode' | 'region'>): string {
  const place = [job.locationCity, job.locationCountry].filter(Boolean).join(', ')
  if (job.workMode === 'remote') return place ? `Remote · ${place}` : `Remote · ${labelOf(REGIONS, job.region)}`
  return place || labelOf(REGIONS, job.region)
}

export function eligibilityLabel(job: Pick<LearnerJob, 'workMode' | 'remoteEligibility' | 'eligibleCountries'>): string | null {
  if (job.workMode !== 'remote') return null
  switch (job.remoteEligibility) {
    case 'worldwide':
      return 'Hires worldwide'
    case 'country':
    case 'region':
      return job.eligibleCountries.length ? `Hires from ${job.eligibleCountries.slice(0, 3).join(', ')}${job.eligibleCountries.length > 3 ? '…' : ''}` : 'Hires from a specific region'
    default:
      return 'Eligible countries not stated'
  }
}

export function salaryLabel(job: Pick<LearnerJob, 'salaryMin' | 'salaryMax' | 'salaryCurrency' | 'salaryPeriod'>): string | null {
  if (job.salaryMin == null && job.salaryMax == null) return null
  const fmt = (n: number) => {
    if (job.salaryCurrency === 'INR' && n >= 100000) return `${(n / 100000).toFixed(n % 100000 ? 1 : 0)} L`
    return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
  }
  const range = job.salaryMin != null && job.salaryMax != null ? `${fmt(job.salaryMin)}–${fmt(job.salaryMax)}` : job.salaryMin != null ? `from ${fmt(job.salaryMin)}` : `up to ${fmt(job.salaryMax!)}`
  return `${job.salaryCurrency || ''} ${range} / ${job.salaryPeriod === 'month' ? 'month' : 'year'}`.trim()
}

interface FeedSection {
  id: string
  title: string
  description: string
  jobs: LearnerJob[]
}

const emptyFilters = (): JobListFilters => ({ q: '', roleCategory: '', region: '', workMode: '', level: '', employmentType: '' })

/** Learner-facing job discovery: relevant openings, filters and the preferences that rank them. */
export default function JobsWorkspace({ user, features, disabledRoleFamilies, goals, roadmap, knowledgeWorkspaces, onOpenJob, onSignIn, onUpgrade, onToast }: JobsWorkspaceProps) {
  const [filters, setFilters] = useState<JobListFilters>(emptyFilters)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<LearnerJobPreferences | null>(null)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const can = useCallback((key: string) => features.includes(key), [features])
  const advanced = can('jobs.advancedFilters')
  const personalFeed = can('jobs.personalizedFeed')
  const requestId = useRef(0)
  const roleOptions = useMemo(() => ROLE_CATEGORIES.filter((c) => !disabledRoleFamilies.includes(c.id)), [disabledRoleFamilies])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((f) => (f.q === query ? f : { ...f, q: query }))
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!user) {
      setPrefs(null)
      setPrefsLoaded(true)
      return
    }
    let cancelled = false
    setPrefsLoaded(false)
    fetchPreferences()
      .then((p) => {
        if (!cancelled) setPrefs(p)
      })
      .catch(() => {
        // Preferences are optional; the list still loads unranked.
      })
      .finally(() => {
        if (!cancelled) setPrefsLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [user?.$id, user])

  useEffect(() => {
    if (!prefsLoaded) return
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    fetchJobs({ ...filters, page, pageSize: PAGE_SIZE })
      .then((r) => {
        if (requestId.current === id) setResult(r)
      })
      .catch((err) => {
        if (requestId.current !== id) return
        setError(err instanceof ApiError && err.code === 'disabled' ? 'Job discovery is switched off right now. Check back soon.' : 'Could not load jobs. Check your connection and try again.')
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false)
      })
  }, [filters, page, prefsLoaded, reloadKey, features])

  const setFilter = useCallback((key: keyof JobListFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const anyFilter = Boolean(filters.q || filters.roleCategory || filters.region || filters.workMode || filters.level || filters.employmentType)
  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  // Feed sections only for the personalised feed, first page, no filters, enough data.
  const sections = useMemo<FeedSection[]>(() => {
    if (!result || !result.personalised || anyFilter || page !== 1) return []
    const jobs = result.items
    const out: FeedSection[] = []
    const recommended = jobs.filter((j) => (j.relevance?.score ?? 0) >= 40).slice(0, 6)
    if (recommended.length >= 2) out.push({ id: 'recommended', title: 'Recommended for you', description: 'Highest alignment with your target roles, skills and experience.', jobs: recommended })
    const learner = { goals, roadmap, knowledgeWorkspaces }
    const strong = jobs
      .map((j) => ({ j, map: mapJobToCurriculum(j, learner) }))
      .filter(({ map }) => map.tracks.length > 0 && map.tracks.filter((t) => t.gapStatus !== 'not_covered').length >= Math.ceil(map.tracks.length / 2))
      .map(({ j }) => j)
      .slice(0, 6)
    if (strong.length >= 2) out.push({ id: 'curriculum', title: 'Strong curriculum match', description: 'At least half of the tracks these roles need are already in your plan or covered.', jobs: strong })
    const recent = jobs.filter((j) => j.freshness === 'fresh' && j.lifecycle !== 'stale').slice(0, 6)
    if (recent.length >= 2) out.push({ id: 'recent', title: 'Recently verified', description: 'Seen at the source or verified by the team in the last two weeks.', jobs: recent })
    const remote = jobs.filter((j) => j.workMode === 'remote').slice(0, 6)
    if (remote.length >= 2) out.push({ id: 'remote', title: 'Remote opportunities', description: 'Check the hiring-country note on each listing; remote does not always mean anywhere.', jobs: remote })
    const india = jobs.filter((j) => j.region === 'india').slice(0, 6)
    if (india.length >= 2 && prefs?.regionPreference !== 'india') out.push({ id: 'india', title: 'India opportunities', description: 'Roles based in India or remote roles that hire from India.', jobs: india })
    const entry = jobs.filter((j) => j.level === 'entry' || j.level === 'intern').slice(0, 6)
    if (entry.length >= 2) out.push({ id: 'entry', title: 'Entry level and early career', description: 'Internships and roles asking for up to two years of experience.', jobs: entry })
    return out
  }, [result, anyFilter, page, goals, roadmap, knowledgeWorkspaces, prefs?.regionPreference])

  const onSaved = (next: LearnerJobPreferences) => {
    setPrefs(next)
    setPrefsOpen(false)
    setPage(1)
    setReloadKey((k) => k + 1)
    onToast(personalFeed ? 'Preferences saved. Jobs re-ranked for you.' : 'Preferences saved.')
  }

  const clearFilters = () => {
    setQuery('')
    setFilters(emptyFilters())
    setPage(1)
  }

  return (
    <div className="jobs-layout">
      <div className="min-w-0">
        <div className="jobs-toolbar" role="search" aria-label="Filter jobs">
          <input className="input-field" type="search" placeholder="Search title, company, skill or city" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search jobs" />
          <div className="jobs-toolbar-row">
            <select className="input-field" value={filters.roleCategory || ''} onChange={(e) => setFilter('roleCategory', e.target.value)} aria-label="Role">
              <option value="">All roles</option>
              {roleOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select className="input-field" value={filters.region || ''} onChange={(e) => setFilter('region', e.target.value)} aria-label="Region">
              <option value="">India and abroad</option>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <select className="input-field" value={filters.workMode || ''} onChange={(e) => setFilter('workMode', e.target.value)} aria-label="Work mode">
              <option value="">Any work mode</option>
              {WORK_MODES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
            {advanced ? (
              <>
                <select className="input-field" value={filters.level || ''} onChange={(e) => setFilter('level', e.target.value)} aria-label="Level">
                  <option value="">Any level</option>
                  {JOB_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <select className="input-field" value={filters.employmentType || ''} onChange={(e) => setFilter('employmentType', e.target.value)} aria-label="Employment type">
                  <option value="">Any type</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <button type="button" className="jobs-locked-filter" onClick={user ? onUpgrade : onSignIn} aria-label="Level and employment type filters are part of Prep Pro">
                <span className="locked-feature-badge">Pro</span> Level and type filters
              </button>
            )}
          </div>
          <div className="jobs-summary">
            {result && !loading && (
              <span>
                {result.total === 0 ? 'No openings' : `${result.total} opening${result.total === 1 ? '' : 's'}`}
                {result.personalised ? ' · ranked by your preferences' : ' · newest first'}
              </span>
            )}
            {result && result.hiddenByPreferences > 0 && <span>{result.hiddenByPreferences} hidden by your region, work-mode or employment-type preferences</span>}
            {anyFilter && (
              <button type="button" className="btn btn-link btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="jobs-empty" role="alert">
            <div className="jobs-empty-title">Something went wrong</div>
            <p className="jobs-empty-text">{error}</p>
            <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        ) : loading && !result ? (
          <div className="jobs-list" aria-busy="true" aria-label="Loading jobs">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="jobs-skeleton" />
            ))}
          </div>
        ) : result && result.items.length === 0 ? (
          <div className="jobs-empty">
            <div className="jobs-empty-title">{anyFilter ? 'No openings match these filters' : 'No openings published yet'}</div>
            <p className="jobs-empty-text">
              {anyFilter ? 'Try widening the role, region or work mode.' : 'JobAppy only lists openings that fit its career paths. New listings appear here as they are verified.'}
            </p>
          </div>
        ) : sections.length > 0 ? (
          <div className={`jobs-feed${loading ? ' opacity-60' : ''}`} aria-busy={loading}>
            {sections.map((section) => (
              <section key={section.id} className="jobs-feed-section" aria-labelledby={`feed-${section.id}`}>
                <h2 id={`feed-${section.id}`} className="jobs-feed-title">
                  {section.title}
                </h2>
                <p className="jobs-feed-sub">{section.description}</p>
                <div className="jobs-list">
                  {section.jobs.map((job) => (
                    <JobCard key={`${section.id}-${job.id}`} job={job} onOpen={() => onOpenJob(job.id)} />
                  ))}
                </div>
              </section>
            ))}
            <section className="jobs-feed-section" aria-labelledby="feed-all">
              <h2 id="feed-all" className="jobs-feed-title">
                All openings for you
              </h2>
              <p className="jobs-feed-sub">Every relevant listing, ranked by your preferences.</p>
              <div className="jobs-list">
                {result?.items.map((job) => (
                  <JobCard key={job.id} job={job} onOpen={() => onOpenJob(job.id)} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className={`jobs-list${loading ? ' opacity-60' : ''}`} aria-busy={loading}>
            {result?.items.map((job) => (
              <JobCard key={job.id} job={job} onOpen={() => onOpenJob(job.id)} />
            ))}
          </div>
        )}

        {result?.capped && !loading && (
          <LockedFeature
            title="Full personalised feed"
            description={`You are seeing the ${result.total} newest relevant openings on the free plan. ${result.beyondCap} more ${result.beyondCap === 1 ? 'opening is' : 'openings are'} available, ranked by your preferences with the reasons shown, on Prep Pro.`}
            onUpgrade={onUpgrade}
            onSignIn={onSignIn}
            signedIn={Boolean(user)}
            compact
          />
        )}

        {result && pages > 1 && (
          <nav className="admin-pagination" aria-label="Pagination">
            <span className="admin-pagination-info">
              Page {result.page} of {pages}
            </span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </nav>
        )}
      </div>

      <aside className="jobs-side" aria-label="Job preferences">
        <div className="jobs-panel">
          <div className="jobs-panel-title">
            <span>Your job preferences</span>
            {user && prefsLoaded && (
              <button type="button" className="btn btn-link btn-sm" onClick={() => setPrefsOpen((o) => !o)} aria-expanded={prefsOpen}>
                {prefsOpen ? 'Close' : hasPreferences(prefs) ? 'Edit' : 'Set up'}
              </button>
            )}
          </div>
          {!user ? (
            <>
              <p className="jobs-panel-sub">Sign in to save target roles, skills, locations and experience.</p>
              <button type="button" className="btn btn-primary btn-sm mt-3" onClick={onSignIn}>
                Sign in
              </button>
            </>
          ) : !prefsLoaded ? (
            <p className="jobs-panel-sub">Loading…</p>
          ) : prefsOpen ? (
            <PreferencesForm initial={prefs ?? emptyPreferences()} roleOptions={roleOptions} onSaved={onSaved} onCancel={() => setPrefsOpen(false)} />
          ) : hasPreferences(prefs) ? (
            <>
              <PreferencesSummary prefs={prefs!} />
              {!personalFeed && <p className="job-source-note">Saved. Ranking and reasons switch on with Prep Pro.</p>}
            </>
          ) : (
            <>
              <p className="jobs-panel-sub">
                {personalFeed ? 'Tell JobAppy what you are looking for and openings are ranked by fit, with the reasons shown on each card.' : 'Save what you are looking for now; Prep Pro ranks openings by fit and explains why.'}
              </p>
              <button type="button" className="btn btn-primary btn-sm mt-3" onClick={() => setPrefsOpen(true)}>
                Set preferences
              </button>
            </>
          )}
        </div>
        {!features.includes('jobs.personalizedFeed') && user && (
          <LockedFeature
            title="What Prep Pro adds here"
            description="The full ranked feed with feed sections and reasons, level and type filters, compatibility analysis, curriculum gap analysis and adding gaps to your plan."
            onUpgrade={onUpgrade}
            signedIn
            compact
          />
        )}
        <div className="jobs-panel">
          <div className="jobs-panel-title">How listings get here</div>
          <p className="jobs-panel-sub">Every opening shows its company, original source and the official application link. Listings that expire or stop appearing at their source are marked and then removed automatically.</p>
        </div>
      </aside>
    </div>
  )
}

function JobCard({ job, onOpen }: { job: LearnerJob; onOpen: () => void }) {
  const fresh = freshnessLabel(job.freshness, job.lifecycle)
  const salary = salaryLabel(job)
  const eligibility = eligibilityLabel(job)
  const reasons = (job.relevance?.reasons ?? []).filter((r) => r.weight > 0).slice(0, 2)
  const skills = job.requiredSkills.slice(0, 4)
  return (
    <button type="button" className="job-card" onClick={onOpen} aria-label={`${job.title} at ${job.company.name}`}>
      <div className="job-card-top">
        <div className="min-w-0">
          <div className="job-card-title">{job.title}</div>
          <div className="job-card-company">
            {job.company.name}
            {job.company.headquarters ? ` · ${job.company.headquarters}` : ''}
          </div>
        </div>
        <span className={`job-chip ${fresh.tone === 'fresh' ? 'job-chip-fresh' : fresh.tone === 'stale' ? 'job-chip-stale' : ''}`}>{fresh.text}</span>
      </div>
      <div className="job-card-meta">
        <span className="job-chip job-chip-accent">{labelOf(ROLE_CATEGORIES, job.roleCategory)}</span>
        <span className="job-chip">{locationLabel(job)}</span>
        <span className="job-chip">{labelOf(WORK_MODES, job.workMode)}</span>
        {eligibility && <span className="job-chip">{eligibility}</span>}
        <span className="job-chip">{labelOf(JOB_LEVELS, job.level)}</span>
        <span className="job-chip">{labelOf(EMPLOYMENT_TYPES, job.employmentType)}</span>
        {salary && <span className="job-chip">{salary}</span>}
      </div>
      {skills.length > 0 && (
        <div className="job-card-skills" aria-label="Key skills">
          {skills.map((s) => (
            <span key={s} className="job-skill">
              {s}
            </span>
          ))}
          {job.requiredSkills.length > skills.length && <span className="job-skill is-more">+{job.requiredSkills.length - skills.length}</span>}
        </div>
      )}
      {reasons.length > 0 && (
        <ul className="job-card-reasons" aria-label="Why this is ranked for you">
          {reasons.map((r) => (
            <li key={r.text}>{r.text}</li>
          ))}
        </ul>
      )}
    </button>
  )
}

function PreferencesSummary({ prefs }: { prefs: LearnerJobPreferences }) {
  const rows: { label: string; value: string }[] = []
  if (prefs.roleCategories.length) rows.push({ label: 'Roles', value: prefs.roleCategories.map((id) => labelOf(ROLE_CATEGORIES, id)).join(', ') })
  if (prefs.skills.length) rows.push({ label: 'Skills', value: prefs.skills.join(', ') })
  if (prefs.experienceYears != null) rows.push({ label: 'Experience', value: `${prefs.experienceYears} yr${prefs.experienceYears === 1 ? '' : 's'}` })
  if (prefs.regionPreference !== 'any') rows.push({ label: 'Region', value: labelOf(REGION_PREFERENCES, prefs.regionPreference) })
  if (prefs.locations.length) rows.push({ label: 'Locations', value: prefs.locations.join(', ') })
  if (prefs.workModes.length) rows.push({ label: 'Work mode', value: prefs.workModes.map((w) => labelOf(WORK_MODES, w)).join(', ') })
  if (prefs.levels.length) rows.push({ label: 'Level', value: prefs.levels.map((l) => labelOf(JOB_LEVELS, l)).join(', ') })
  if (prefs.employmentTypes.length) rows.push({ label: 'Type', value: prefs.employmentTypes.map((t) => labelOf(EMPLOYMENT_TYPES, t)).join(', ') })
  if (prefs.salaryMin != null) rows.push({ label: 'Min salary', value: `${prefs.salaryCurrency || ''} ${prefs.salaryMin.toLocaleString()} / year` })
  return (
    <dl className="mt-3 flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="job-fact-label">{r.label}</dt>
          <dd className="text-sm font-medium mt-0.5">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ChipGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; label: string }[]; value: T[]; onChange: (next: T[]) => void }) {
  return (
    <div className="pref-field" role="group" aria-label={label}>
      <span>{label}</span>
      <div className="pref-chips">
        {options.map((o) => {
          const on = value.includes(o.id)
          return (
            <button key={o.id} type="button" className="pref-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PreferencesForm({ initial, roleOptions, onSaved, onCancel }: { initial: LearnerJobPreferences; roleOptions: { id: string; label: string }[]; onSaved: (p: LearnerJobPreferences) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial)
  const [skills, setSkills] = useState(initial.skills.join(', '))
  const [locations, setLocations] = useState(initial.locations.join(', '))
  const [experience, setExperience] = useState(initial.experienceYears != null ? String(initial.experienceYears) : '')
  const [salary, setSalary] = useState(initial.salaryMin != null ? String(initial.salaryMin) : '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    let body: LearnerJobPreferences
    try {
      body = parsePreferencesInput({ ...draft, skills, locations, experienceYears: experience, salaryMin: salary, salaryCurrency: draft.salaryCurrency || 'INR' })
    } catch (err) {
      if (err instanceof ValidationError) return setError(err.message)
      throw err
    }
    setBusy(true)
    try {
      onSaved(await savePreferences(body))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preferences')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pref-form mt-3" onSubmit={submit} noValidate>
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}
      <ChipGroup label="Target roles" options={roleOptions} value={draft.roleCategories} onChange={(v) => setDraft((d) => ({ ...d, roleCategories: v }))} />
      <label className="pref-field">
        <span>Skills (comma separated)</span>
        <input className="input-field" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Java, Spring Boot, SQL" />
      </label>
      <label className="pref-field">
        <span>Years of experience</span>
        <input className="input-field" inputMode="numeric" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="0" />
      </label>
      <label className="pref-field">
        <span>Where</span>
        <select className="input-field" value={draft.regionPreference} onChange={(e) => setDraft((d) => ({ ...d, regionPreference: e.target.value as LearnerJobPreferences['regionPreference'] }))}>
          {REGION_PREFERENCES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="pref-field">
        <span>Preferred cities (comma separated)</span>
        <input className="input-field" value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Bengaluru, Pune" />
      </label>
      <ChipGroup label="Work mode" options={WORK_MODES} value={draft.workModes} onChange={(v) => setDraft((d) => ({ ...d, workModes: v }))} />
      <ChipGroup label="Level" options={JOB_LEVELS} value={draft.levels} onChange={(v) => setDraft((d) => ({ ...d, levels: v }))} />
      <ChipGroup label="Employment type" options={EMPLOYMENT_TYPES} value={draft.employmentTypes} onChange={(v) => setDraft((d) => ({ ...d, employmentTypes: v }))} />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="pref-field">
          <span>Minimum salary per year (optional)</span>
          <input className="input-field" inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="1200000" />
        </label>
        <label className="pref-field">
          <span>Currency</span>
          <select className="input-field" value={draft.salaryCurrency || 'INR'} onChange={(e) => setDraft((d) => ({ ...d, salaryCurrency: e.target.value }))}>
            {SALARY_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? 'Saving…' : 'Save preferences'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
