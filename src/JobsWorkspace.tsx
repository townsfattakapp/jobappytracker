import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
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
  isFiltersExpanded?: boolean
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
    isFiltersExpanded: true,
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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(initial.isFiltersExpanded ?? true)

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set())
  const [isSidebarPrefsExpanded, setIsSidebarPrefsExpanded] = useState(true)
  const [isSidebarAboutExpanded, setIsSidebarAboutExpanded] = useState(true)

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
      isFiltersExpanded,
    })
  }, [filters, query, page, isCompaniesExpanded, isFiltersExpanded])

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
      isFiltersExpanded,
    })
  }

  const activeCompanyName = useMemo(() => {
    if (!filters.companyId || !companies) return null
    return companies.find((c) => c.id === filters.companyId)?.name ?? null
  }, [filters.companyId, companies])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.roleCategory) count++
    if (filters.city) count++
    if (filters.region) count++
    if (filters.workMode) count++
    if (filters.level) count++
    if (filters.employmentType) count++
    if (filters.companyId) count++
    return count
  }, [filters])

  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string; onRemove: () => void }[] = []
    if (filters.roleCategory) {
      pills.push({
        key: 'roleCategory',
        label: `Role: ${labelOf(ROLE_CATEGORIES, filters.roleCategory)}`,
        onRemove: () => setFilter('roleCategory', ''),
      })
    }
    if (filters.city) {
      pills.push({
        key: 'city',
        label: `City: ${labelOf(INDIA_CITY_GROUPS, filters.city)}`,
        onRemove: () => setFilters((f) => ({ ...f, city: undefined })),
      })
    }
    if (filters.region) {
      pills.push({
        key: 'region',
        label: `Region: ${labelOf(REGIONS, filters.region)}`,
        onRemove: () => setFilter('region', ''),
      })
    }
    if (filters.workMode) {
      pills.push({
        key: 'workMode',
        label: `Mode: ${labelOf(WORK_MODES, filters.workMode)}`,
        onRemove: () => setFilter('workMode', ''),
      })
    }
    if (filters.level) {
      pills.push({
        key: 'level',
        label: `Level: ${labelOf(JOB_LEVELS, filters.level)}`,
        onRemove: () => setFilter('level', ''),
      })
    }
    if (filters.employmentType) {
      pills.push({
        key: 'employmentType',
        label: `Type: ${labelOf(EMPLOYMENT_TYPES, filters.employmentType)}`,
        onRemove: () => setFilter('employmentType', ''),
      })
    }
    if (filters.companyId && activeCompanyName) {
      pills.push({
        key: 'companyId',
        label: `Company: ${activeCompanyName}`,
        onRemove: () => setFilter('companyId', ''),
      })
    }
    return pills
  }, [filters, activeCompanyName, setFilter])

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const toggleJobPreview = useCallback((id: string) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const totalHiringCompanies = companies?.length ?? 0
  const totalOpeningsCount = companies?.reduce((s, c) => s + c.jobCount, 0) ?? (result?.total ?? 0)
  const totalCatalogCompanies = totalHiringCompanies + others.length

  const isAllExpanded = useMemo(() => {
    return (
      isCompaniesExpanded &&
      isFiltersExpanded &&
      !collapsedSections['top'] &&
      !collapsedSections['remote'] &&
      !collapsedSections['all'] &&
      isSidebarPrefsExpanded &&
      isSidebarAboutExpanded
    )
  }, [
    isCompaniesExpanded,
    isFiltersExpanded,
    collapsedSections,
    isSidebarPrefsExpanded,
    isSidebarAboutExpanded,
  ])

  const toggleAll = useCallback(() => {
    if (isAllExpanded) {
      setIsCompaniesExpanded(false)
      setIsFiltersExpanded(false)
      setCollapsedSections({ top: true, remote: true, all: true })
      setIsSidebarPrefsExpanded(false)
      setIsSidebarAboutExpanded(false)
      setExpandedJobIds(new Set())
    } else {
      setIsCompaniesExpanded(true)
      setIsFiltersExpanded(true)
      setCollapsedSections({})
      setIsSidebarPrefsExpanded(true)
      setIsSidebarAboutExpanded(true)
    }
  }, [isAllExpanded])

  return (
    <div className="jobs-layout">
      <div className="min-w-0">
        {/* Hero Header with Discovery Stats and Global Expand/Collapse */}
        <header className="jobs-hero-header" aria-label="Job discovery overview">
          <div className="jobs-hero-title-group">
            <div className="jobs-hero-title-row">
              <h1 className="jobs-hero-title">Job Discovery</h1>
              <span className="jobs-hero-badge">
                <Sparkles size={12} />
                <span>300+ Enterprise Hubs & Portals</span>
              </span>
            </div>
            <p className="jobs-hero-subtitle">
              Explore verified openings across top IT services, global product giants, GCCs, and direct corporate career portals.
            </p>
          </div>
          <div className="jobs-hero-actions">
            <span className="jobs-pill-stat" title="Total companies cataloged">
              <Building2 size={13} className="text-primary" />
              <span>{totalCatalogCompanies > 0 ? totalCatalogCompanies : 304} Companies</span>
            </span>
            {companies && (
              <span className="jobs-pill-stat" title="Companies with live openings in JobAppy">
                <Briefcase size={13} className="text-emerald-500" />
                <span>{totalHiringCompanies} Hiring Now</span>
              </span>
            )}
            {totalOpeningsCount > 0 && (
              <span className="jobs-pill-stat" title="Total active openings">
                <Briefcase size={13} className="text-emerald-500" />
                <span>{totalOpeningsCount.toLocaleString()} Openings</span>
              </span>
            )}
            {others.length > 0 && (
              <span className="jobs-pill-stat" title="Direct enterprise career portals">
                <Globe size={13} className="text-blue-500" />
                <span>{others.length} Direct Portals</span>
              </span>
            )}
            <button
              type="button"
              className="jobs-hero-toggle-all"
              onClick={toggleAll}
              aria-label={isAllExpanded ? 'Collapse all sections' : 'Expand all sections'}
            >
              <ChevronsUpDown size={14} />
              <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>
        </header>

        {/* Company Directory Hub: hiring companies + 100+ direct enterprise portals */}
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

        {/* Search & Collapsible Filters Toolbar */}
        <div className="jobs-toolbar" role="search" aria-label="Filter jobs">
          <div className="jobs-toolbar-top-row">
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

            <button
              type="button"
              className={`jobs-filter-toggle-btn ${activeFilterCount > 0 ? 'has-active' : ''}`}
              onClick={() => setIsFiltersExpanded((v) => !v)}
              aria-expanded={isFiltersExpanded}
              title={isFiltersExpanded ? 'Collapse filter options' : 'Expand filter options'}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && <span className="jobs-filter-active-count">{activeFilterCount}</span>}
              {isFiltersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className={`jobs-toolbar-collapsible ${isFiltersExpanded ? '' : 'is-collapsed'}`}>
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
          </div>

          {/* Active filter pills row when filter options are collapsed */}
          {!isFiltersExpanded && activeFilterCount > 0 && (
            <div className="jobs-active-filters-row">
              <span className="text-xs text-muted-foreground font-semibold">Active filters:</span>
              {activeFilterPills.map((p) => (
                <span key={p.key} className="jobs-active-pill">
                  {p.label}
                  <button type="button" onClick={p.onRemove} aria-label={`Remove filter ${p.label}`}>
                    ×
                  </button>
                </span>
              ))}
              <button type="button" className="jobs-clear-btn ml-auto" onClick={clearFilters}>
                <RotateCcw size={11} />
                Reset all
              </button>
            </div>
          )}

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
              {anyFilter ? 'Try widening the role, region or work mode.' : 'JobAppy only lists openings that fit its career paths. New listings appear here as they are verified.'}
            </p>
          </div>
        ) : sections.length > 0 ? (
          <div className={`jobs-feed${loading ? ' opacity-60' : ''}`} aria-busy={loading}>
            {sections.map((section) => {
              const isSectionCollapsed = Boolean(collapsedSections[section.id])
              return (
                <section key={section.id} className="jobs-feed-section" aria-labelledby={`feed-${section.id}`}>
                  <button
                    type="button"
                    className="jobs-feed-header-btn"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={!isSectionCollapsed}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 id={`feed-${section.id}`} className="jobs-feed-title mb-0">
                          {section.title}
                        </h2>
                        <span className="jobs-stat-pill text-xs">
                          {section.jobs.length} opening{section.jobs.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="jobs-feed-sub">{section.description}</p>
                    </div>
                    <div className="text-muted-foreground p-1">
                      {isSectionCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                  </button>

                  {isSectionCollapsed ? (
                    <div className="jobs-feed-collapsed-note">
                      Section collapsed ({section.jobs.length} opening{section.jobs.length === 1 ? '' : 's'}). Click header to expand.
                    </div>
                  ) : (
                    <div className="jobs-list">
                      {section.jobs.map((job) => (
                        <JobCard
                          key={`${section.id}-${job.id}`}
                          job={job}
                          onOpen={() => onOpenJob(job.id)}
                          isExpanded={expandedJobIds.has(job.id)}
                          onToggleExpand={(e) => {
                            e.stopPropagation()
                            toggleJobPreview(job.id)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}

            <section className="jobs-feed-section" aria-labelledby="feed-all">
              <button
                type="button"
                className="jobs-feed-header-btn"
                onClick={() => toggleSection('all')}
                aria-expanded={!collapsedSections['all']}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="feed-all" className="jobs-feed-title mb-0">
                      All openings for you
                    </h2>
                    {result && (
                      <span className="jobs-stat-pill text-xs">
                        {result.items.length} opening{result.items.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <p className="jobs-feed-sub">Every relevant listing, ranked by your preferences.</p>
                </div>
                <div className="text-muted-foreground p-1">
                  {collapsedSections['all'] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </button>

              {collapsedSections['all'] ? (
                <div className="jobs-feed-collapsed-note">
                  Section collapsed ({result?.items.length ?? 0} opening{(result?.items.length ?? 0) === 1 ? '' : 's'}). Click header to expand.
                </div>
              ) : (
                <div className="jobs-list">
                  {result?.items.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onOpen={() => onOpenJob(job.id)}
                      isExpanded={expandedJobIds.has(job.id)}
                      onToggleExpand={(e) => {
                        e.stopPropagation()
                        toggleJobPreview(job.id)
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className={`jobs-list${loading ? ' opacity-60' : ''}`} aria-busy={loading}>
            {result?.items.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpen={() => onOpenJob(job.id)}
                isExpanded={expandedJobIds.has(job.id)}
                onToggleExpand={(e) => {
                  e.stopPropagation()
                  toggleJobPreview(job.id)
                }}
              />
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
        {/* Collapsible Panel: Your Job Preferences */}
        <div className="jobs-panel">
          <div
            className="jobs-panel-collapsible-head"
            onClick={() => setIsSidebarPrefsExpanded((v) => !v)}
            role="button"
            tabIndex={0}
            aria-expanded={isSidebarPrefsExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsSidebarPrefsExpanded((v) => !v)
              }
            }}
          >
            <div className="jobs-panel-title mb-0">
              <span>Your job preferences</span>
            </div>
            <div className="flex items-center gap-2">
              {user && prefsLoaded && isSidebarPrefsExpanded && (
                <button
                  type="button"
                  className="btn btn-link btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPrefsOpen((o) => !o)
                  }}
                  aria-expanded={prefsOpen}
                >
                  {prefsOpen ? 'Close' : hasPreferences(prefs) ? 'Edit' : 'Set up'}
                </button>
              )}
              <span className="text-muted-foreground">
                {isSidebarPrefsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          {isSidebarPrefsExpanded && (
            <div className="mt-3">
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

        {/* Collapsible Panel: How listings get here */}
        <div className="jobs-panel">
          <div
            className="jobs-panel-collapsible-head"
            onClick={() => setIsSidebarAboutExpanded((v) => !v)}
            role="button"
            tabIndex={0}
            aria-expanded={isSidebarAboutExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsSidebarAboutExpanded((v) => !v)
              }
            }}
          >
            <div className="jobs-panel-title mb-0">How listings get here</div>
            <span className="text-muted-foreground">
              {isSidebarAboutExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
          {isSidebarAboutExpanded && (
            <p className="jobs-panel-sub mt-2">
              Every opening shows its company, original source and the official application link. Listings that expire or stop appearing at their source are marked and then removed automatically. Over 300 verified corporate career sites and enterprise portals are curated in this directory.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

/** Horizontal strip and expandable directory hub of 300+ companies and direct career portals. */
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
  /** Catalog companies with no opening in JobAppy right now; shown as direct links to their official careers pages. */
  others: CompanyWithoutOpeningsDto[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryTab, setCategoryTab] = useState<'all' | 'hiring' | 'direct' | 'india'>('all')
  const [hiringExpanded, setHiringExpanded] = useState(true)
  const [directExpanded, setDirectExpanded] = useState(true)
  const [directLimit, setDirectLimit] = useState(36)

  const totalOpenings = companies?.reduce((s, c) => s + c.jobCount, 0) ?? 0
  const totalHiringCompanies = companies?.length ?? 0
  const totalDirectPortals = others.length
  const totalCatalog = totalHiringCompanies + totalDirectPortals

  const isIndiaCompany = (c: { headquarters?: string | null; indiaRelevance?: string | null }) => {
    return Boolean(
      c.indiaRelevance ||
      (c.headquarters && /india|bengaluru|bangalore|hyderabad|mumbai|pune|gurgaon|gurugram|chennai|noida/i.test(c.headquarters))
    )
  }

  // Filtered hiring companies based on search and tab
  const filteredHiring = useMemo(() => {
    if (!companies) return []
    if (categoryTab === 'direct') return []
    let list = companies
    if (categoryTab === 'india') {
      list = list.filter(isIndiaCompany)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.headquarters && c.headquarters.toLowerCase().includes(q))
      )
    }
    return list
  }, [companies, categoryTab, searchQuery])

  // Filtered direct portals based on search and tab
  const filteredDirect = useMemo(() => {
    if (categoryTab === 'hiring') return []
    let list = others
    if (categoryTab === 'india') {
      list = list.filter(isIndiaCompany)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.headquarters && c.headquarters.toLowerCase().includes(q))
      )
    }
    return list
  }, [others, categoryTab, searchQuery])

  const indiaCount = useMemo(() => {
    const hiringIndia = (companies ?? []).filter(isIndiaCompany).length
    const directIndia = others.filter(isIndiaCompany).length
    return hiringIndia + directIndia
  }, [companies, others])

  // Visible compact companies when collapsed
  const compactVisibleCompanies = useMemo(() => {
    if (!companies) return []
    const limit = 8
    const top = companies.slice(0, limit)
    if (activeId && !top.some((c) => c.id === activeId)) {
      const activeComp = companies.find((c) => c.id === activeId)
      if (activeComp) top.push(activeComp)
    }
    return top
  }, [companies, activeId])

  const displayedDirect = directLimit >= filteredDirect.length ? filteredDirect : filteredDirect.slice(0, directLimit)

  return (
    <section className="jobs-directory-hub" aria-label="Companies hiring and career portals">
      <div
        className="jobs-directory-hub-head"
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand()
          }
        }}
      >
        <div className="jobs-directory-hub-title-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <span className="jobs-directory-hub-title">Company Hub & Career Portals</span>
          </div>
          {companies ? (
            <div className="jobs-companies-stat-pills">
              <span className="jobs-stat-pill">
                <span className="jobs-stat-num">{totalHiringCompanies}</span> hiring
              </span>
              <span className="jobs-stat-dot" aria-hidden="true">·</span>
              <span className="jobs-stat-pill">
                <span className="jobs-stat-num">{totalOpenings.toLocaleString()}</span> live jobs
              </span>
              <span className="jobs-stat-dot" aria-hidden="true">·</span>
              <span className="jobs-stat-pill">
                <span className="jobs-stat-num">{totalDirectPortals}</span> direct portals
              </span>
              {filtered && <span className="jobs-stat-filtered-tag">filtered</span>}
            </div>
          ) : (
            <span className="jobs-stat-pill animate-pulse">Loading directory…</span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="company-toggle-btn"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Collapse company hub' : 'Expand full 300+ company hub'}
          >
            <span>{isExpanded ? 'Collapse Hub' : `Expand Hub (${totalCatalog})`}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* When COLLAPSED: quick access chip track */}
      {!isExpanded && (
        <div className="jobs-companies-track mt-3" role="listbox" aria-label="Filter by company">
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

          {compactVisibleCompanies.map((c) => {
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

          <button
            type="button"
            className="company-chip company-chip-more"
            onClick={onToggleExpand}
            title="Expand full 300+ companies directory"
          >
            <Building2 size={13} className="text-primary" />
            <span className="company-chip-name">+{totalCatalog - compactVisibleCompanies.length} more portals & companies</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* When EXPANDED: Full interactive Hub */}
      {isExpanded && (
        <div className="jobs-directory-controls">
          <div className="jobs-directory-search-row">
            <div className="jobs-directory-search-wrap">
              <Search size={15} className="jobs-directory-search-icon" aria-hidden="true" />
              <input
                className="input-field jobs-directory-search-input"
                type="search"
                placeholder="Search 300+ companies by name, industry (e.g. IT, FinTech) or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search companies and portals"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="jobs-directory-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear company search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="jobs-directory-tabs" role="tablist" aria-label="Company categories">
              <button
                type="button"
                className={`jobs-dir-tab ${categoryTab === 'all' ? 'is-active' : ''}`}
                onClick={() => setCategoryTab('all')}
                role="tab"
                aria-selected={categoryTab === 'all'}
              >
                All ({filteredHiring.length + filteredDirect.length})
              </button>
              <button
                type="button"
                className={`jobs-dir-tab ${categoryTab === 'hiring' ? 'is-active' : ''}`}
                onClick={() => setCategoryTab('hiring')}
                role="tab"
                aria-selected={categoryTab === 'hiring'}
              >
                Actively Hiring ({filteredHiring.length})
              </button>
              <button
                type="button"
                className={`jobs-dir-tab ${categoryTab === 'direct' ? 'is-active' : ''}`}
                onClick={() => setCategoryTab('direct')}
                role="tab"
                aria-selected={categoryTab === 'direct'}
              >
                Direct Enterprise Portals ({filteredDirect.length})
              </button>
              <button
                type="button"
                className={`jobs-dir-tab ${categoryTab === 'india' ? 'is-active' : ''}`}
                onClick={() => setCategoryTab('india')}
                role="tab"
                aria-selected={categoryTab === 'india'}
              >
                India Hubs ({indiaCount})
              </button>
            </div>
          </div>

          {/* Collapsible Section 1: Actively Hiring */}
          {categoryTab !== 'direct' && (
            <div className="jobs-dir-section">
              <div
                className="jobs-dir-section-header"
                onClick={() => setHiringExpanded((v) => !v)}
                role="button"
                tabIndex={0}
                aria-expanded={hiringExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setHiringExpanded((v) => !v)
                  }
                }}
              >
                <div className="jobs-dir-section-title">
                  <Briefcase size={15} className="text-emerald-500" />
                  <span>Actively Hiring on JobAppy ({filteredHiring.length})</span>
                  {activeId && <span className="jobs-active-pill text-xs">Filtered to 1 company</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">Click company to filter jobs</span>
                  {hiringExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {hiringExpanded && (
                <div className="jobs-dir-grid" role="listbox" aria-label="Hiring companies">
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

                  {filteredHiring.map((c) => {
                    const active = c.id === activeId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`company-chip ${active ? 'is-active' : ''}`}
                        role="option"
                        aria-selected={active}
                        onClick={() => onPick(active ? null : c.id)}
                        title={`${c.name} (${c.industry || 'Technology'}): ${c.jobCount.toLocaleString()} opening${c.jobCount === 1 ? '' : 's'}`}
                      >
                        <CompanyLogo company={c} size={28} />
                        <span className="company-chip-name">{c.name}</span>
                        <span className="company-chip-count">{c.jobCount.toLocaleString()}</span>
                      </button>
                    )
                  })}

                  {!isSubscribed && totalHiringCompanies > 8 && !searchQuery && (
                    <button
                      type="button"
                      className="company-chip company-chip-locked"
                      onClick={onUpgrade}
                      title="Unlock all companies hiring with Prep Pro"
                    >
                      <Lock size={13} className="text-primary" />
                      <span className="company-chip-name">+{totalHiringCompanies - 8} more companies</span>
                      <span className="company-chip-pro-pill">Pro</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsible Section 2: Direct Enterprise Portals */}
          {categoryTab !== 'hiring' && (
            <div className="jobs-dir-section">
              <div
                className="jobs-dir-section-header"
                onClick={() => setDirectExpanded((v) => !v)}
                role="button"
                tabIndex={0}
                aria-expanded={directExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDirectExpanded((v) => !v)
                  }
                }}
              >
                <div className="jobs-dir-section-title">
                  <Globe size={15} className="text-blue-500" />
                  <span>Direct Enterprise Career Portals ({filteredDirect.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">Official career sites</span>
                  {directExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {directExpanded && (
                <>
                  <p className="jobs-companies-sub mt-2 mb-2">
                    Verified official career portals for top IT leaders, product companies, consulting firms and global capability centers (GCCs). Links open directly to their hiring portals.
                  </p>
                  <div className="jobs-dir-grid" aria-label="Direct corporate career portals">
                    {displayedDirect.map((c) => (
                      <a
                        key={c.id}
                        className="company-chip is-direct-portal"
                        href={c.careersUrl || c.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${c.name} · ${c.industry || 'Technology & Services'}${c.headquarters ? ` · ${c.headquarters}` : ''}`}
                      >
                        <CompanyLogo company={c} size={28} />
                        <span className="company-chip-name">{c.name}</span>
                        {c.industry && <span className="company-chip-portal-badge">{c.industry}</span>}
                        <span className="company-chip-ext" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    ))}
                  </div>

                  {filteredDirect.length > 36 && (
                    <div className="flex justify-center mt-3">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-xs font-semibold"
                        onClick={() => setDirectLimit((lim) => (lim >= filteredDirect.length ? 36 : filteredDirect.length))}
                      >
                        {directLimit >= filteredDirect.length ? (
                          <>Show fewer portals (36)</>
                        ) : (
                          <>Show all {filteredDirect.length} portals <ChevronDown size={13} className="inline ml-1" /></>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {filteredHiring.length === 0 && filteredDirect.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No companies match &ldquo;{searchQuery}&rdquo;. Try another search term or switch category tabs.
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function JobCard({
  job,
  onOpen,
  isExpanded,
  onToggleExpand,
}: {
  job: LearnerJob
  onOpen: () => void
  isExpanded: boolean
  onToggleExpand: (e: React.MouseEvent) => void
}) {
  const fresh = freshnessLabel(job.freshness, job.lifecycle)
  const salary = salaryLabel(job)
  const eligibility = eligibilityLabel(job)
  const reasons = (job.relevance?.reasons ?? []).filter((r) => r.weight > 0).slice(0, 2)
  const skills = job.requiredSkills.slice(0, 4)

  return (
    <div
      className={`job-card ${isExpanded ? 'is-preview-expanded' : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`${job.title} at ${job.company.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
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
          <button
            type="button"
            className="job-card-expand-btn"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Collapse quick preview' : 'Expand quick preview'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{isExpanded ? 'Less' : 'Preview'}</span>
          </button>
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
          {job.requiredSkills.length > skills.length && (
            <span className="job-skill is-more">+{job.requiredSkills.length - skills.length}</span>
          )}
        </div>
      )}

      {reasons.length > 0 && (
        <ul className="job-card-reasons" aria-label="Why this is ranked for you">
          {reasons.map((r) => (
            <li key={r.text}>{r.text}</li>
          ))}
        </ul>
      )}

      {isExpanded && (
        <div className="job-card-preview-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5">
            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
              <span>Quick Role & Company Profile</span>
              {job.company.headquarters && (
                <span className="text-xs text-muted-foreground font-normal">· {job.company.headquarters}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {job.roleCategory ? `Classified under ${labelOf(ROLE_CATEGORIES, job.roleCategory)}.` : ''}{' '}
              {job.workMode === 'remote' ? 'Offers remote flexibility.' : 'Located at office/hybrid center.'}{' '}
              {eligibility ? `Eligibility: ${eligibility}.` : ''}
            </p>
          </div>

          {job.requiredSkills.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                All Required Skills ({job.requiredSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="job-skill" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.relevance?.reasons && job.relevance.reasons.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Preference Matching Insights
              </div>
              <ul className="job-card-reasons">
                {job.relevance.reasons.map((r) => (
                  <li key={r.text}>{r.text}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="job-card-preview-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
              onClick={onOpen}
            >
              <span>View Full Details & Prep</span>
              <ArrowRight size={13} />
            </button>
            {job.applyUrl && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm inline-flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Apply on {job.company.name}</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
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
