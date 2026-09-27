import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import LockedFeature from './components/LockedFeature'
import type { AppUser } from './lib/cloudSync'
import { ApiError } from './lib/adminClient'
import CompanyLogo from './components/jobs/CompanyLogo'
import {
  fetchCompanyStrip,
  fetchJobs,
  fetchPreferences,
  savePreferences,
  type HiringCompanyDto,
  type CompanyWithoutOpeningsDto,
  type JobListResponse,
  type LearnerJob,
} from './lib/jobs/client'
import { parsePreferencesInput, ValidationError } from './lib/jobs/normalize'
import {
  EMPLOYMENT_TYPES,
  JOB_LEVELS,
  REGIONS,
  REGION_PREFERENCES,
  ROLE_CATEGORIES,
  SALARY_CURRENCIES,
  WORK_MODES,
  labelOf,
} from './lib/jobs/taxonomy'
import { INDIA_CITY_GROUPS } from './lib/jobs/cities'
import { emptyPreferences, hasPreferences, type JobListFilters, type LearnerJobPreferences } from './lib/jobs/types'
import type { Goal, KnowledgeWorkspace, RoadmapDay } from './types'

interface JobsWorkspaceProps {
  user: AppUser | null
  isSubscribed?: boolean
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
const JOBS_STORAGE_KEY = 'prep_jobs_workspace_state_v1'

interface JobsPersistedState {
  filters: JobListFilters
  query: string
  page: number
  isCompaniesExpanded: boolean
}

let inMemoryJobsState: JobsPersistedState | null = null

function loadPersistedJobsState(): JobsPersistedState {
  if (inMemoryJobsState) return inMemoryJobsState
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(JOBS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as JobsPersistedState
        if (parsed && typeof parsed === 'object') {
          inMemoryJobsState = parsed
          return parsed
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return {
    filters: emptyFilters(),
    query: '',
    page: 1,
    isCompaniesExpanded: false,
  }
}

function savePersistedJobsState(state: JobsPersistedState) {
  inMemoryJobsState = state
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }
}

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

const emptyFilters = (): JobListFilters => ({ q: '', roleCategory: '', region: '', workMode: '', level: '', employmentType: '', companyId: '', city: undefined })

/** Learner-facing job discovery: relevant openings, filters and the preferences that rank them. */
export default function JobsWorkspace({
  user,
  isSubscribed,
  features,
  disabledRoleFamilies,
  goals: _goals,
  roadmap: _roadmap,
  knowledgeWorkspaces: _knowledgeWorkspaces,
  onOpenJob,
  onSignIn,
  onUpgrade,
  onToast,
}: JobsWorkspaceProps) {
  const initial = useMemo(() => loadPersistedJobsState(), [])
  const [filters, setFilters] = useState<JobListFilters>(initial.filters)
  const [query, setQuery] = useState(initial.query)
  const [page, setPage] = useState(initial.page)
  const [isCompaniesExpanded, setIsCompaniesExpanded] = useState(initial.isCompaniesExpanded)

  const [result, setResult] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<LearnerJobPreferences | null>(null)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [companies, setCompanies] = useState<HiringCompanyDto[] | null>(null)
  const [others, setOthers] = useState<CompanyWithoutOpeningsDto[]>([])

  const can = useCallback((key: string) => features.includes(key), [features])
  const advanced = can('jobs.advancedFilters')
  const personalFeed = can('jobs.personalizedFeed')
  const userSubscribed = Boolean(isSubscribed || personalFeed || advanced)

  const requestId = useRef(0)
  const roleOptions = useMemo(() => ROLE_CATEGORIES.filter((c) => !disabledRoleFamilies.includes(c.id)), [disabledRoleFamilies])

  // Save state whenever filters, query, page, or expanded state changes
  useEffect(() => {
    savePersistedJobsState({
      filters,
      query,
      page,
      isCompaniesExpanded,
    })
  }, [filters, query, page, isCompaniesExpanded])

  // Debounced search query
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

  // Companies hiring for the strip at the top: counts follow every filter except the company chip itself.
  const stripKey = JSON.stringify({ q: filters.q, roleCategory: filters.roleCategory, region: filters.region, workMode: filters.workMode, level: filters.level, employmentType: filters.employmentType, city: filters.city })
  useEffect(() => {
    let cancelled = false
    const stripFilters = JSON.parse(stripKey) as JobListFilters
    const unfiltered = !(stripFilters.q || stripFilters.roleCategory || stripFilters.region || stripFilters.workMode || stripFilters.level || stripFilters.employmentType || stripFilters.city)
    fetchCompanyStrip(stripFilters, 300, unfiltered)
      .then((res) => {
        if (cancelled) return
        setCompanies(res.companies)
        if (unfiltered) setOthers(res.others)
      })
      .catch(() => {
        if (!cancelled) setCompanies([])
      })
    return () => {
      cancelled = true
    }
  }, [stripKey, reloadKey])

  const setFilter = useCallback((key: keyof JobListFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const anyFilter = Boolean(filters.q || filters.roleCategory || filters.region || filters.workMode || filters.level || filters.employmentType || filters.companyId || filters.city)
  const filtersActive = Boolean(filters.q || filters.roleCategory || filters.region || filters.workMode || filters.level || filters.employmentType || filters.city)
  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  // Feed sections only for the personalised feed, first page, no filters, enough data.
  const sections = useMemo<FeedSection[]>(() => {
    if (!result || !result.personalised || anyFilter || page !== 1) return []
    const jobs = result.items
    const out: FeedSection[] = []
    const recommended = jobs.filter((j) => (j.relevance?.score ?? 0) >= 40).slice(0, 6)
    if (recommended.length >= 2) {
      out.push({
        id: 'top',
        title: 'Top matches for you',
        description: 'Openings that closely align with your target roles, skills and experience.',
        jobs: recommended,
      })
    }
    const remote = jobs.filter((j) => j.workMode === 'remote' && !recommended.some((r) => r.id === j.id)).slice(0, 4)
    if (remote.length >= 2) {
      out.push({
        id: 'remote',
        title: 'Remote opportunities',
        description: 'Distributed roles with competitive compensation and verified eligibility.',
        jobs: remote,
      })
    }
    return out
  }, [result, anyFilter, page])

  const onSaved = (next: LearnerJobPreferences) => {
    setPrefs(next)
    setPrefsOpen(false)
    setPage(1)
    setReloadKey((k) => k + 1)
    onToast(personalFeed ? 'Preferences saved. Jobs re-ranked for you.' : 'Preferences saved.')
  }

  const clearFilters = () => {
    setQuery('')
    const cleared = emptyFilters()
    setFilters(cleared)
    setPage(1)
    savePersistedJobsState({
      filters: cleared,
      query: '',
      page: 1,
      isCompaniesExpanded,
    })
  }

  const activeCompanyName = useMemo(() => {
    if (!filters.companyId || !companies) return null
    return companies.find((c) => c.id === filters.companyId)?.name ?? null
  }, [filters.companyId, companies])

  return (
    <div className="jobs-layout">
      <div className="min-w-0">
        <CompanyStrip
          companies={companies}
          activeId={filters.companyId ?? null}
          filtered={filtersActive}
          others={others}
          isSubscribed={userSubscribed}
          isExpanded={isCompaniesExpanded}
          onToggleExpand={() => setIsCompaniesExpanded((v) => !v)}
          onPick={(id) => setFilter('companyId', id ?? '')}
          onUpgrade={onUpgrade}
        />

        <div className="jobs-toolbar" role="search" aria-label="Filter jobs">
          <div className="jobs-search-wrap">
            <Search size={16} className="jobs-search-icon" aria-hidden="true" />
            <input
              className="input-field jobs-search-input"
              type="search"
              placeholder="Search by job title, company, skill or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search jobs"
            />
            {query && (
              <button
                type="button"
                className="jobs-search-clear"
                onClick={() => {
                  setQuery('')
                  setFilters((f) => ({ ...f, q: '' }))
                  setPage(1)
                }}
                aria-label="Clear search input"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="jobs-toolbar-row">
            <select
              className={`input-field ${filters.roleCategory ? 'is-active-filter' : ''}`}
              value={filters.roleCategory || ''}
              onChange={(e) => setFilter('roleCategory', e.target.value)}
              aria-label="Role"
            >
              <option value="">All roles</option>
              {roleOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className={`input-field ${filters.city ? 'is-active-filter' : ''}`}
              value={filters.city || ''}
              onChange={(e) => {
                const city = e.target.value
                setFilters((f) => ({ ...f, city: city || undefined, region: city ? 'india' : f.region }))
                setPage(1)
              }}
              aria-label="City in India"
            >
              <option value="">Any city in India</option>
              {INDIA_CITY_GROUPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className={`input-field ${filters.region ? 'is-active-filter' : ''}`}
              value={filters.region || ''}
              onChange={(e) => setFilter('region', e.target.value)}
              aria-label="Region"
            >
              <option value="">India and abroad</option>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <select
              className={`input-field ${filters.workMode ? 'is-active-filter' : ''}`}
              value={filters.workMode || ''}
              onChange={(e) => setFilter('workMode', e.target.value)}
              aria-label="Work mode"
            >
              <option value="">Any work mode</option>
              {WORK_MODES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
            {advanced ? (
              <>
                <select
                  className={`input-field ${filters.level ? 'is-active-filter' : ''}`}
                  value={filters.level || ''}
                  onChange={(e) => setFilter('level', e.target.value)}
                  aria-label="Level"
                >
                  <option value="">Any level</option>
                  {JOB_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <select
                  className={`input-field ${filters.employmentType ? 'is-active-filter' : ''}`}
                  value={filters.employmentType || ''}
                  onChange={(e) => setFilter('employmentType', e.target.value)}
                  aria-label="Employment type"
                >
                  <option value="">Any type</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <button
                type="button"
                className="jobs-locked-filter"
                onClick={user ? onUpgrade : onSignIn}
                aria-label="Level and employment type filters are part of Prep Pro"
              >
                <span className="locked-feature-badge">Pro</span> Level and type filters
              </button>
            )}
          </div>

          <div className="jobs-summary">
            <div className="jobs-summary-left">
              {result && !loading && (
                <span className="inline-flex items-center gap-2">
                  <span className="jobs-status-dot" aria-hidden="true" />
                  <span>
                    {result.total === 0 ? 'No openings' : `${result.total.toLocaleString()} opening${result.total === 1 ? '' : 's'}`}
                    {result.personalised ? ' · ranked by your preferences' : ' · newest first'}
                  </span>
                </span>
              )}
              {activeCompanyName && (
                <span className="jobs-active-pill">
                  Company: {activeCompanyName}
                  <button type="button" onClick={() => setFilter('companyId', '')} aria-label="Remove company filter">
                    ×
                  </button>
                </span>
              )}
              {result && result.hiddenByPreferences > 0 && (
                <span className="text-xs text-muted-foreground">({result.hiddenByPreferences} hidden by your preferences)</span>
              )}
            </div>
            {anyFilter && (
              <button type="button" className="jobs-clear-btn" onClick={clearFilters}>
                <RotateCcw size={12} />
                Reset filters
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
              {anyFilter ? 'Try widening the role, region or work mode.' : 'Prep only lists openings that fit its career paths. New listings appear here as they are verified.'}
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
                {personalFeed ? 'Tell Prep what you are looking for and openings are ranked by fit, with the reasons shown on each card.' : 'Save what you are looking for now; Prep Pro ranks openings by fit and explains why.'}
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

/** Horizontal strip of companies with live openings; picking one filters the list to that company. */
function CompanyStrip({
  companies,
  activeId,
  filtered,
  isSubscribed,
  isExpanded,
  onToggleExpand,
  onPick,
  onUpgrade,
  others,
}: {
  companies: HiringCompanyDto[] | null
  activeId: string | null
  filtered: boolean
  isSubscribed: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onPick: (id: string | null) => void
  onUpgrade: () => void
  /** Catalog companies with no opening in Prep at all; shown (unfiltered view only) as links to their careers pages. */
  others: CompanyWithoutOpeningsDto[]
}) {
  const totalOpenings = companies?.reduce((s, c) => s + c.jobCount, 0) ?? 0
  const totalCompanies = companies?.length ?? 0
  const noFeed = others.filter((c) => c.reason === 'no_feed')
  const noMatch = others.filter((c) => c.reason === 'no_matching_openings')

  // Filter companies visible based on subscription and expand state
  const visibleCompanies = useMemo(() => {
    if (!companies) return []
    if (isSubscribed && isExpanded) return companies
    const limit = 8
    const top = companies.slice(0, limit)
    // Make sure currently selected company chip is always visible even if beyond the top list
    if (activeId && !top.some((c) => c.id === activeId)) {
      const activeComp = companies.find((c) => c.id === activeId)
      if (activeComp) top.push(activeComp)
    }
    return top
  }, [companies, isSubscribed, isExpanded, activeId])

  return (
    <section className="jobs-companies" aria-label="Companies hiring">
      <div className="jobs-companies-head">
        <div className="jobs-companies-title-row">
          <span className="jobs-companies-title">Companies hiring</span>
          {companies ? (
            <div className="jobs-companies-stat-pills">
              <span className="jobs-stat-pill">
                <span className="jobs-stat-num">{totalCompanies}</span> companies
              </span>
              <span className="jobs-stat-dot" aria-hidden="true">·</span>
              <span className="jobs-stat-pill">
                <span className="jobs-stat-num">{totalOpenings.toLocaleString()}</span> openings
              </span>
              {filtered && <span className="jobs-stat-filtered-tag">filtered</span>}
            </div>
          ) : (
            <span className="jobs-stat-pill animate-pulse">Loading counts…</span>
          )}
        </div>

        <div className="jobs-companies-actions">
          {companies && companies.length > 8 && (
            isSubscribed ? (
              <button
                type="button"
                className="company-toggle-btn"
                onClick={onToggleExpand}
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? 'Collapse' : `Show all (${totalCompanies})`}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <button
                type="button"
                className="company-toggle-btn company-toggle-locked"
                onClick={onUpgrade}
                title="Unlock all hiring companies with Prep Pro"
              >
                <Lock size={12} className="text-primary" />
                <span>Show all ({totalCompanies})</span>
                <span className="company-badge-pro">Pro</span>
              </button>
            )
          )}
        </div>
      </div>

      {companies && companies.length === 0 && (
        <p className="jobs-companies-sub">No company has an opening for these filters. Widen a filter to see more.</p>
      )}

      <div
        className={`jobs-companies-track ${isExpanded && isSubscribed ? 'is-expanded' : ''}`}
        role="listbox"
        aria-label="Filter by company"
      >
        <button
          type="button"
          className={`company-chip ${!activeId ? 'is-active' : ''}`}
          role="option"
          aria-selected={!activeId}
          onClick={() => onPick(null)}
        >
          <span className="company-logo company-logo-fallback" style={{ width: 28, height: 28, fontSize: 11 }} aria-hidden="true">
            All
          </span>
          <span className="company-chip-name">All companies</span>
        </button>

        {visibleCompanies.map((c) => {
          const active = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              className={`company-chip ${active ? 'is-active' : ''}`}
              role="option"
              aria-selected={active}
              onClick={() => onPick(active ? null : c.id)}
              title={`${c.name}: ${c.jobCount.toLocaleString()} opening${c.jobCount === 1 ? '' : 's'}`}
            >
              <CompanyLogo company={c} size={28} />
              <span className="company-chip-name">{c.name}</span>
              <span className="company-chip-count">{c.jobCount.toLocaleString()}</span>
            </button>
          )
        })}

        {!isSubscribed && totalCompanies > 8 && (
          <button
            type="button"
            className="company-chip company-chip-locked"
            onClick={onUpgrade}
            title="Unlock all companies hiring with Prep Pro"
          >
            <Lock size={13} className="text-primary" />
            <span className="company-chip-name">+{totalCompanies - 8} more companies</span>
            <span className="company-chip-pro-pill">Pro</span>
          </button>
        )}
      </div>

      {!filtered && others.length > 0 && (
        <div className="jobs-companies-others">
          <span className="jobs-companies-sub">
            Also in the catalog, no opening in Prep right now: {noFeed.length > 0 && `${noFeed.length} ${noFeed.length === 1 ? 'company publishes' : 'companies publish'} only on a careers portal we cannot read`}
            {noFeed.length > 0 && noMatch.length > 0 && '; '}
            {noMatch.length > 0 && `${noMatch.length} ${noMatch.length === 1 ? 'has' : 'have'} a working feed with no relevant opening today`}. The links open their careers pages.
          </span>
          <div className="jobs-companies-track" aria-label="Companies without openings in Prep">
            {others.map((c) => (
              <a key={c.id} className="company-chip is-muted" href={c.careersUrl || c.website || '#'} target="_blank" rel="noopener noreferrer" title={c.reason === 'no_feed' ? `${c.name}: openings are listed only on its careers site` : `${c.name}: feed connected, no relevant opening right now`}>
                <CompanyLogo company={c} size={28} />
                <span className="company-chip-name">{c.name}</span>
                <span className="company-chip-ext" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
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
        <div className="job-card-head min-w-0">
          <CompanyLogo company={job.company} size={42} />
          <div className="min-w-0">
            <div className="job-card-title">{job.title}</div>
            <div className="job-card-company">
              <span className="font-semibold text-foreground/90">{job.company.name}</span>
              {job.company.headquarters ? ` · ${job.company.headquarters}` : ''}
            </div>
          </div>
        </div>
        <div className="job-card-top-right">
          <span className={`job-chip ${fresh.tone === 'fresh' ? 'job-chip-fresh' : fresh.tone === 'stale' ? 'job-chip-stale' : ''}`}>
            {fresh.tone === 'fresh' && <CheckCircle2 size={12} className="inline mr-0.5" />}
            {fresh.text}
          </span>
          <span className="job-card-arrow" aria-hidden="true">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
      <div className="job-card-meta">
        <span className="job-chip job-chip-accent">{labelOf(ROLE_CATEGORIES, job.roleCategory)}</span>
        <span className="job-chip">
          <MapPin size={11} className="inline mr-0.5 opacity-70" />
          {locationLabel(job)}
        </span>
        <span className="job-chip">{labelOf(WORK_MODES, job.workMode)}</span>
        {eligibility && <span className="job-chip">{eligibility}</span>}
        <span className="job-chip">{labelOf(JOB_LEVELS, job.level)}</span>
        <span className="job-chip">{labelOf(EMPLOYMENT_TYPES, job.employmentType)}</span>
        {salary && <span className="job-chip job-chip-salary">{salary}</span>}
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
