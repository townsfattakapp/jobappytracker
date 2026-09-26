'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'
import { careerPaths } from '../../data/careerPaths'
import { api, ApiError } from '../../lib/adminClient'
import { getCurriculum } from '../../lib/curriculum/registry'
import { parseJobInput, ValidationError } from '../../lib/jobs/normalize'
import { EMPLOYMENT_TYPES, JOB_LEVELS, REGIONS, ROLE_CATEGORIES, SALARY_CURRENCIES, SOURCE_TYPES, WORK_MODES, labelOf, roleCategoryById, suggestRoleCategory } from '../../lib/jobs/taxonomy'
import type { CompanyDto, JobDto, JobSourceDto } from '../../lib/jobs/types'

interface Props {
  companies: Pick<CompanyDto, 'id' | 'name' | 'slug'>[]
  sources: Pick<JobSourceDto, 'id' | 'name' | 'type'>[]
  /** When present the editor updates this job; otherwise it creates one. */
  job?: JobDto
}

type Draft = {
  companyId: string
  sourceId: string
  title: string
  roleCategory: string
  careerPathIds: string[]
  trackIds: string[]
  description: string
  requirementsSummary: string
  requiredSkills: string
  preferredSkills: string
  experienceMin: string
  experienceMax: string
  level: string
  employmentType: string
  workMode: string
  locationCity: string
  locationCountry: string
  region: string
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  salaryPeriod: string
  applyUrl: string
  sourceUrl: string
  externalId: string
  status: string
  postedAt: string
  expiresAt: string
  remoteEligibility: string
  eligibleCountries: string
}

const dateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')

function fromJob(job?: JobDto, firstCompany?: string): Draft {
  return {
    companyId: job?.companyId ?? firstCompany ?? '',
    sourceId: job?.sourceId ?? '',
    title: job?.title ?? '',
    roleCategory: job?.roleCategory ?? '',
    careerPathIds: job?.careerPathIds ?? [],
    trackIds: job?.trackIds ?? [],
    description: job?.description ?? '',
    requirementsSummary: job?.requirementsSummary ?? '',
    requiredSkills: (job?.requiredSkills ?? []).join(', '),
    preferredSkills: (job?.preferredSkills ?? []).join(', '),
    experienceMin: job?.experienceMin != null ? String(job.experienceMin) : '',
    experienceMax: job?.experienceMax != null ? String(job.experienceMax) : '',
    level: job?.level ?? 'entry',
    employmentType: job?.employmentType ?? 'full_time',
    workMode: job?.workMode ?? 'onsite',
    locationCity: job?.locationCity ?? '',
    locationCountry: job?.locationCountry ?? (job ? '' : 'India'),
    region: job?.region ?? 'india',
    salaryMin: job?.salaryMin != null ? String(job.salaryMin) : '',
    salaryMax: job?.salaryMax != null ? String(job.salaryMax) : '',
    salaryCurrency: job?.salaryCurrency ?? 'INR',
    salaryPeriod: job?.salaryPeriod ?? 'year',
    applyUrl: job?.applyUrl ?? '',
    sourceUrl: job?.sourceUrl ?? '',
    externalId: job?.externalId ?? '',
    status: job?.status ?? 'draft',
    postedAt: dateInput(job?.postedAt ?? null),
    expiresAt: dateInput(job?.expiresAt ?? null),
    remoteEligibility: job?.remoteEligibility ?? 'unknown',
    eligibleCountries: (job?.eligibleCountries ?? []).join(', '),
  }
}

export default function JobEditor({ companies, sources, job }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(() => fromJob(job, companies[0]?.id))
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const category = roleCategoryById(draft.roleCategory)
  const suggestedPaths = useMemo(() => careerPaths.filter((p) => category?.careerPathIds.includes(p.id)), [category])
  const otherPaths = useMemo(() => careerPaths.filter((p) => !category?.careerPathIds.includes(p.id)), [category])
  const trackOptions = useMemo(() => getCurriculum().tracks.filter((t) => t.source !== 'personal').map((t) => ({ id: t.id, title: t.title, family: t.family || 'Other' })), [])
  const [trackQuery, setTrackQuery] = useState('')
  const visibleTracks = useMemo(() => {
    const q = trackQuery.trim().toLowerCase()
    return trackOptions.filter((t) => draft.trackIds.includes(t.id) || (q && (t.title.toLowerCase().includes(q) || t.id.includes(q)))).slice(0, 30)
  }, [trackOptions, trackQuery, draft.trackIds])

  const toggle = (key: 'careerPathIds' | 'trackIds', id: string) => set(key, draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id])

  const onTitleBlur = () => {
    if (draft.roleCategory || !draft.title.trim()) return
    const guess = suggestRoleCategory(draft.title)
    if (guess) set('roleCategory', guess.id)
  }

  const payload = () => ({
    ...draft,
    sourceId: draft.sourceId || null,
    experienceMin: draft.experienceMin === '' ? null : Number(draft.experienceMin),
    experienceMax: draft.experienceMax === '' ? null : Number(draft.experienceMax),
    salaryMin: draft.salaryMin === '' ? null : Number(draft.salaryMin),
    salaryMax: draft.salaryMax === '' ? null : Number(draft.salaryMax),
    postedAt: draft.postedAt || null,
    expiresAt: draft.expiresAt || null,
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    let body
    try {
      body = parseJobInput(payload())
    } catch (err) {
      if (err instanceof ValidationError) {
        setError({ message: err.message, field: err.field ?? null })
        return
      }
      throw err
    }
    setBusy('save')
    try {
      if (job) {
        await api<JobDto>(`/api/admin/jobs/${job.id}`, { method: 'PUT', json: body })
        setNotice('Job saved')
        router.refresh()
      } else {
        const created = await api<JobDto>('/api/admin/jobs', { method: 'POST', json: body })
        router.push(`/admin/jobs/${created.id}`)
      }
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Save failed', field: err instanceof ApiError ? err.field : null })
    } finally {
      setBusy(null)
    }
  }

  const transition = async (name: 'publish' | 'unpublish' | 'expire' | 'archive' | 'verify') => {
    if (!job) return
    if (name === 'archive' && !window.confirm('Archive this job? Learners will no longer see it.')) return
    setBusy(name)
    setError(null)
    setNotice(null)
    try {
      const updated = await api<JobDto>(`/api/admin/jobs/${job.id}`, { method: 'PATCH', json: { transition: name } })
      setDraft(fromJob(updated))
      setNotice(name === 'verify' ? 'Marked as verified just now' : `Job is now ${updated.status}`)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Action failed', field: null })
    } finally {
      setBusy(null)
    }
  }

  const invalid = (field: string) => (error?.field === field ? 'true' : undefined)

  return (
    <form onSubmit={submit} className="admin-form" noValidate>
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error.message}
        </div>
      )}
      {notice && (
        <div className="admin-alert admin-alert-ok" role="status">
          {notice}
        </div>
      )}

      {job && (
        <div className="admin-card admin-actions-bar">
          <span className="text-sm text-muted-foreground">Status actions</span>
          {job.status !== 'published' && job.status !== 'archived' && (
            <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => transition('publish')}>
              Publish
            </button>
          )}
          {job.status === 'published' && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => transition('verify')}>
                Mark verified now
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => transition('unpublish')}>
                Unpublish
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => transition('expire')}>
                Mark expired
              </button>
            </>
          )}
          {job.status !== 'archived' && (
            <button type="button" className="btn btn-danger btn-sm" disabled={busy !== null} onClick={() => transition('archive')}>
              Archive
            </button>
          )}
        </div>
      )}

      <fieldset className="admin-fieldset">
        <legend>Listing</legend>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Company</span>
            <select className="input-field" value={draft.companyId} onChange={(e) => set('companyId', e.target.value)} aria-invalid={invalid('companyId')} required>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Source</span>
            <select className="input-field" value={draft.sourceId} onChange={(e) => set('sourceId', e.target.value)}>
              <option value="">Not recorded</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({labelOf(SOURCE_TYPES, s.type)})
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span>Title</span>
          <input className="input-field" value={draft.title} onChange={(e) => set('title', e.target.value)} onBlur={onTitleBlur} aria-invalid={invalid('title')} placeholder="Software Engineer II" required />
        </label>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Role category</span>
            <select className="input-field" value={draft.roleCategory} onChange={(e) => set('roleCategory', e.target.value)} aria-invalid={invalid('roleCategory')} required>
              <option value="">Choose…</option>
              {ROLE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Level</span>
            <select className="input-field" value={draft.level} onChange={(e) => set('level', e.target.value)}>
              {JOB_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span>Description (as published)</span>
          <textarea className="input-field" rows={10} value={draft.description} onChange={(e) => set('description', e.target.value)} aria-invalid={invalid('description')} required />
        </label>
        <label className="admin-field">
          <span>Requirements summary (optional, factual)</span>
          <textarea className="input-field" rows={3} value={draft.requirementsSummary} onChange={(e) => set('requirementsSummary', e.target.value)} />
        </label>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Required skills (comma separated)</span>
            <input className="input-field" value={draft.requiredSkills} onChange={(e) => set('requiredSkills', e.target.value)} aria-invalid={invalid('requiredSkills')} placeholder="Java, Spring Boot, SQL" />
          </label>
          <label className="admin-field">
            <span>Preferred skills</span>
            <input className="input-field" value={draft.preferredSkills} onChange={(e) => set('preferredSkills', e.target.value)} placeholder="Kafka, Docker" />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Experience, type and location</legend>
        <div className="admin-grid-4">
          <label className="admin-field">
            <span>Min years</span>
            <input className="input-field" inputMode="numeric" value={draft.experienceMin} onChange={(e) => set('experienceMin', e.target.value)} aria-invalid={invalid('experienceMin')} />
          </label>
          <label className="admin-field">
            <span>Max years</span>
            <input className="input-field" inputMode="numeric" value={draft.experienceMax} onChange={(e) => set('experienceMax', e.target.value)} aria-invalid={invalid('experienceMax')} />
          </label>
          <label className="admin-field">
            <span>Employment type</span>
            <select className="input-field" value={draft.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Work mode</span>
            <select className="input-field" value={draft.workMode} onChange={(e) => set('workMode', e.target.value)}>
              {WORK_MODES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="admin-grid-3">
          <label className="admin-field">
            <span>City</span>
            <input className="input-field" value={draft.locationCity} onChange={(e) => set('locationCity', e.target.value)} placeholder="Bengaluru" />
          </label>
          <label className="admin-field">
            <span>Country</span>
            <input className="input-field" value={draft.locationCountry} onChange={(e) => set('locationCountry', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Region</span>
            <select className="input-field" value={draft.region} onChange={(e) => set('region', e.target.value)}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {draft.workMode === 'remote' && (
          <div className="admin-grid-2">
            <label className="admin-field">
              <span>Remote eligibility (as stated by the listing)</span>
              <select className="input-field" value={draft.remoteEligibility} onChange={(e) => set('remoteEligibility', e.target.value)}>
                <option value="unknown">Not stated</option>
                <option value="country">Specific countries</option>
                <option value="region">A region (EU, APAC…)</option>
                <option value="worldwide">Worldwide</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Eligible countries (comma separated)</span>
              <input className="input-field" value={draft.eligibleCountries} onChange={(e) => set('eligibleCountries', e.target.value)} placeholder="India" />
            </label>
          </div>
        )}
        <div className="admin-grid-4">
          <label className="admin-field">
            <span>Salary min</span>
            <input className="input-field" inputMode="numeric" value={draft.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} aria-invalid={invalid('salaryMin')} />
          </label>
          <label className="admin-field">
            <span>Salary max</span>
            <input className="input-field" inputMode="numeric" value={draft.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} aria-invalid={invalid('salaryMax')} />
          </label>
          <label className="admin-field">
            <span>Currency</span>
            <select className="input-field" value={draft.salaryCurrency} onChange={(e) => set('salaryCurrency', e.target.value)}>
              {SALARY_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Per</span>
            <select className="input-field" value={draft.salaryPeriod} onChange={(e) => set('salaryPeriod', e.target.value)}>
              <option value="year">Year</option>
              <option value="month">Month</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Provenance</legend>
        <label className="admin-field">
          <span>Original application URL</span>
          <input className="input-field" value={draft.applyUrl} onChange={(e) => set('applyUrl', e.target.value)} aria-invalid={invalid('applyUrl')} placeholder="https://careers.example.com/jobs/123" required />
          <small>Tracking parameters are removed; the company domain and path are kept.</small>
        </label>
        <div className="admin-grid-2">
          <label className="admin-field">
            <span>Source page URL (where you found it)</span>
            <input className="input-field" value={draft.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} aria-invalid={invalid('sourceUrl')} />
          </label>
          <label className="admin-field">
            <span>External id (requisition id)</span>
            <input className="input-field" value={draft.externalId} onChange={(e) => set('externalId', e.target.value)} />
          </label>
        </div>
        <div className="admin-grid-3">
          <label className="admin-field">
            <span>Posted on</span>
            <input className="input-field" type="date" value={draft.postedAt} onChange={(e) => set('postedAt', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Expires on</span>
            <input className="input-field" type="date" value={draft.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} aria-invalid={invalid('expiresAt')} />
          </label>
          {!job && (
            <label className="admin-field">
              <span>Initial status</span>
              <select className="input-field" value={draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </select>
            </label>
          )}
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Curriculum mapping</legend>
        <p className="admin-help">Career paths let the learner see which JobAppy tracks prepare them for this role. The suggestions follow the role category; add tracks for specific tools the listing asks for.</p>
        <div className="admin-check-grid">
          {[...suggestedPaths, ...otherPaths.filter((p) => draft.careerPathIds.includes(p.id))].map((p) => (
            <label key={p.id} className="admin-check">
              <input type="checkbox" checked={draft.careerPathIds.includes(p.id)} onChange={() => toggle('careerPathIds', p.id)} />
              <span>{p.title}</span>
            </label>
          ))}
        </div>
        <details className="admin-details">
          <summary>Other career paths</summary>
          <div className="admin-check-grid">
            {otherPaths.map((p) => (
              <label key={p.id} className="admin-check">
                <input type="checkbox" checked={draft.careerPathIds.includes(p.id)} onChange={() => toggle('careerPathIds', p.id)} />
                <span>{p.title}</span>
              </label>
            ))}
          </div>
        </details>
        <label className="admin-field">
          <span>Extra tracks (search the curriculum)</span>
          <input className="input-field" value={trackQuery} onChange={(e) => setTrackQuery(e.target.value)} placeholder="kafka, docker, spring…" />
        </label>
        {visibleTracks.length > 0 && (
          <div className="admin-check-grid">
            {visibleTracks.map((t) => (
              <label key={t.id} className="admin-check">
                <input type="checkbox" checked={draft.trackIds.includes(t.id)} onChange={() => toggle('trackIds', t.id)} />
                <span>
                  {t.title} <small className="text-muted-foreground">· {t.family}</small>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="admin-form-footer">
        <button type="submit" className="btn btn-primary" disabled={busy !== null}>
          {busy === 'save' ? 'Saving…' : job ? 'Save changes' : 'Create job'}
        </button>
        {!job && <span className="text-xs text-muted-foreground">Drafts are only visible here until published.</span>}
      </div>
    </form>
  )
}
