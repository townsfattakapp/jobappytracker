import { useCallback, useEffect, useRef, useState } from 'react'
import LockedFeature from './components/LockedFeature'
import ResumeAnalysisView from './components/jobs/ResumeAnalysisView'
import type { AppUser } from './lib/cloudSync'
import { ApiError } from './lib/adminClient'
import { fetchJobs, type LearnerJob } from './lib/jobs/client'
import type { Suggestion } from './lib/jobs/resumeAnalysis'
import { ROLE_CATEGORIES, labelOf } from './lib/jobs/taxonomy'
import { deleteResume, fetchResume, fetchResumeAnalysis, fetchResumes, runResumeAnalysis, setSuggestionState, updateResume, uploadResume, type ResumeDetailDto, type ResumeMetaDto, type StoredAnalysisDto } from './lib/resume/client'

interface ResumeWorkspaceProps {
  user: AppUser | null
  features: string[]
  onSignIn: () => void
  onUpgrade: () => void
  onToast: (message: string) => void
  onOpenJobs: () => void
  /** Opens a job workspace (the comparison links back to the opening). */
  onOpenJob?: (jobId: string) => void
  /** Opens the learning tracks view (missing skills link to curriculum). */
  onOpenTrack?: (trackId: string) => void
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

/** Learner resume area: upload PDF/text resumes, keep versions, mark the current one, inspect what was read from it, and compare any version with any opening. */
export default function ResumeWorkspace({ user, features, onSignIn, onUpgrade, onToast, onOpenJobs, onOpenJob, onOpenTrack }: ResumeWorkspaceProps) {
  const [list, setList] = useState<ResumeMetaDto[] | null>(null)
  const [selected, setSelected] = useState<ResumeDetailDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('')
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const can = (key: string) => features.includes(key)
  const hasProfileFeature = features.includes('resume.profile')
  // Compare with an opening: search Job Discovery, pick a job, run the resume-vs-job analysis with the selected version.
  const [jobQuery, setJobQuery] = useState('')
  const [jobResults, setJobResults] = useState<LearnerJob[] | null>(null)
  const [jobSearchBusy, setJobSearchBusy] = useState(false)
  const [compareJob, setCompareJob] = useState<LearnerJob | null>(null)
  const [compare, setCompare] = useState<{ analysis: StoredAnalysisDto | null; busy: boolean; error: string | null; usage: { used: number; limit: number } | null }>({ analysis: null, busy: false, error: null, usage: null })

  const searchJobs = async (q: string) => {
    setJobSearchBusy(true)
    try {
      const res = await fetchJobs({ q: q.trim() || undefined, pageSize: 8 })
      setJobResults(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not search jobs')
    } finally {
      setJobSearchBusy(false)
    }
  }
  const pickJob = async (job: LearnerJob) => {
    setCompareJob(job)
    setCompare({ analysis: null, busy: false, error: null, usage: null })
    try {
      const existing = await fetchResumeAnalysis(job.id)
      if (existing && (!selected || existing.resumeId === selected.id)) setCompare((c) => ({ ...c, analysis: existing }))
    } catch {
      // a missing previous analysis is not an error
    }
  }
  const runCompare = async () => {
    if (!compareJob || !selected) return
    setCompare((c) => ({ ...c, busy: true, error: null }))
    try {
      const res = await runResumeAnalysis(compareJob.id, { resumeId: selected.id })
      setCompare({ analysis: res.analysis, busy: false, error: null, usage: res.usage })
      onToast(`Compared ${res.resume.title} with ${compareJob.title}`)
    } catch (err) {
      setCompare((c) => ({ ...c, busy: false, error: err instanceof ApiError ? err.message : 'Analysis failed' }))
    }
  }
  const updateCompareSuggestion = async (s: Suggestion, state: 'saved' | 'dismissed' | 'completed' | null) => {
    if (!compareJob || !compare.analysis) return
    try {
      const analysis = await setSuggestionState(compareJob.id, compare.analysis.id, s.id, state)
      setCompare((c) => ({ ...c, analysis }))
    } catch (err) {
      setCompare((c) => ({ ...c, error: err instanceof Error ? err.message : 'Could not update the suggestion' }))
    }
  }

  const load = useCallback(async (selectId?: string) => {
    try {
      const items = await fetchResumes()
      setList(items)
      const id = selectId || items.find((r) => r.isCurrent)?.id || items[0]?.id
      setSelected(id ? await fetchResume(id) : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load resumes')
    }
  }, [])

  useEffect(() => {
    if (!user || !hasProfileFeature) {
      setList(null)
      setSelected(null)
      return
    }
    setError(null)
    void load()
  }, [user, hasProfileFeature, load])

  const upload = async (file: File) => {
    setBusy('upload')
    setError(null)
    try {
      const created = await uploadResume(file, { title: title.trim() || undefined, targetRoleCategory: role || undefined })
      setTitle('')
      onToast(`Uploaded ${created.title}`)
      await load(created.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setBusy(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const act = async (label: string, fn: () => Promise<unknown>, selectId?: string) => {
    setBusy(label)
    setError(null)
    try {
      await fn()
      await load(selectId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  if (!user) {
    return (
      <div className="jobs-empty">
        <div className="jobs-empty-title">Sign in to keep your resume in JobAppy</div>
        <p className="jobs-empty-text">Your resume stays private to your account and is only used when you run an analysis.</p>
        <button type="button" className="btn btn-primary btn-sm mt-4" onClick={onSignIn}>
          Sign in
        </button>
      </div>
    )
  }
  if (!can('resume.profile')) {
    return <LockedFeature title="Resume profile" description="Upload resumes, keep versions and see the extracted profile." onUpgrade={onUpgrade} signedIn />
  }

  return (
    <div className="jobs-layout">
      <div className="min-w-0 flex flex-col gap-5">
        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}
        <section className="job-section" aria-labelledby="resume-upload">
          <h3 id="resume-upload" className="job-section-title">
            Upload a resume
          </h3>
          <p className="job-section-sub">PDF or plain text, up to 2 MB. The file is stored privately in your account; nothing is sent to an outside service.</p>
          <div className="admin-grid-2 mt-3">
            <label className="admin-field">
              <span>Version name (optional)</span>
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend resume, Sept 2026" />
            </label>
            <label className="admin-field">
              <span>Target role (optional)</span>
              <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Not set</option>
                {ROLE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input ref={fileInput} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" aria-label="Resume file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fileInput.current?.click()} disabled={busy !== null}>
              {busy === 'upload' ? 'Uploading…' : 'Choose file and upload'}
            </button>
            <span className="text-xs text-muted-foreground">Uploading makes the new file your current resume.</span>
          </div>
        </section>

        {selected && (
          <section className="job-section" aria-labelledby="resume-profile">
            <h3 id="resume-profile" className="job-section-title">
              What JobAppy read from “{selected.title}” <span className="job-personal-label">From your resume</span>
            </h3>
            <p className="job-section-sub">Extracted by rules, not a model. Anything that could not be read is listed as unknown rather than guessed.</p>
            {selected.warnings.length > 0 && (
              <ul className="admin-alert admin-alert-error mt-3 text-sm">
                {selected.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            {selected.profile ? (
              <ProfileView profile={selected.profile} />
            ) : (
              <p className="text-sm mt-3">No text could be read from this file.</p>
            )}
          </section>
        )}

        {list && list.length > 0 && (
          <section className="job-section" aria-labelledby="resume-compare">
            <h3 id="resume-compare" className="job-section-title">
              Compare with an opening <span className="job-personal-label">Personal to you</span>
            </h3>
            <p className="job-section-sub">Pick any opening from Job Discovery and compare {selected ? `“${selected.title}”` : 'the selected version'} with its requirements: demonstrated skills with resume evidence, missing or weak evidence, experience and project relevance, and grounded suggestions. The resume never leaves your account.</p>
            {!can('jobs.resumeAnalysis') ? (
              <LockedFeature title="Resume vs job description" description="Compare any resume version with any opening: evidence-based skill alignment, gaps mapped to the curriculum and improvement suggestions." onUpgrade={onUpgrade} signedIn compact />
            ) : (
              <>
                <form
                  className="mt-3 flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void searchJobs(jobQuery)
                  }}
                >
                  <input className="input-field" style={{ maxWidth: 360 }} value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} placeholder="Search openings by title, company or skill" aria-label="Search openings to compare" />
                  <button type="submit" className="btn btn-ghost btn-sm" disabled={jobSearchBusy}>
                    {jobSearchBusy ? 'Searching…' : 'Search openings'}
                  </button>
                  {compareJob && (
                    <span className="text-sm">
                      Selected: <strong>{compareJob.title}</strong>
                      {compareJob.company?.name ? ` · ${compareJob.company.name}` : ''}
                    </span>
                  )}
                </form>
                {jobResults && (
                  <ul className="resume-list mt-3" aria-label="Openings found">
                    {jobResults.length === 0 && <li className="text-sm text-muted-foreground">No openings match that search.</li>}
                    {jobResults.map((j) => (
                      <li key={j.id} className={`resume-item${compareJob?.id === j.id ? ' is-selected' : ''}`}>
                        <button type="button" className="resume-item-main" onClick={() => void pickJob(j)} aria-label={`Compare with ${j.title} at ${j.company?.name ?? 'company'}`}>
                          <span className="resume-item-title">{j.title}</span>
                          <span className="resume-item-meta">
                            {j.company?.name ?? 'Company'} · {j.locationCity || j.region} · {j.workMode} · {j.requiredSkills.slice(0, 4).join(', ') || 'skills not listed'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {compareJob && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => void runCompare()} disabled={compare.busy || !selected}>
                      {compare.busy ? 'Comparing…' : compare.analysis ? `Compare again with “${selected?.title ?? 'this version'}”` : `Compare “${selected?.title ?? 'this version'}” with this opening`}
                    </button>
                    {onOpenJob && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenJob(compareJob.id)}>
                        Open the job workspace
                      </button>
                    )}
                    {compare.usage && <span className="job-source-note">Resume analyses today: {compare.usage.used} of {compare.usage.limit}.</span>}
                  </div>
                )}
                {compare.error && (
                  <p className="text-sm text-destructive mt-2" role="alert">
                    {compare.error}
                  </p>
                )}
                {compare.analysis && compareJob && (
                  <>
                    <p className="job-source-note mt-2">
                      Compared {list.find((r) => r.id === compare.analysis?.resumeId)?.title ?? 'a resume version'} with {compareJob.title} · {formatDate(compare.analysis.updatedAt)}. It describes alignment with the listing, not your chances of being shortlisted.
                    </p>
                    <ResumeAnalysisView analysis={compare.analysis} onOpenTrack={(id) => onOpenTrack?.(id)} onUpdate={(s, state) => void updateCompareSuggestion(s, state)} onAddGaps={() => onOpenJob?.(compareJob.id)} />
                  </>
                )}
              </>
            )}
          </section>
        )}
      </div>

      <aside className="jobs-side" aria-label="Resume versions">
        <div className="jobs-panel">
          <div className="jobs-panel-title">Your resumes</div>
          {list === null ? (
            <p className="jobs-panel-sub">Loading…</p>
          ) : list.length === 0 ? (
            <p className="jobs-panel-sub">No resume yet. Upload one to unlock resume-based job analysis.</p>
          ) : (
            <ul className="resume-list">
              {list.map((r) => (
                <li key={r.id} className={`resume-item${selected?.id === r.id ? ' is-selected' : ''}`}>
                  <button type="button" className="resume-item-main" onClick={() => void fetchResume(r.id).then(setSelected)} aria-label={`Open resume ${r.title}`}>
                    <span className="resume-item-title">
                      {r.title}
                      {r.isCurrent && <span className="job-chip job-chip-fresh ml-2">Current</span>}
                    </span>
                    <span className="resume-item-meta">
                      {r.filename} · {kb(r.sizeBytes)} · uploaded {formatDate(r.uploadedAt)}
                      {r.targetRoleCategory ? ` · ${labelOf(ROLE_CATEGORIES, r.targetRoleCategory)}` : ''}
                    </span>
                  </button>
                  <div className="resume-item-actions">
                    {!r.isCurrent && (
                      <button type="button" className="btn btn-link btn-sm" disabled={busy !== null} onClick={() => act('current', () => updateResume(r.id, { isCurrent: true }), r.id)}>
                        Make current
                      </button>
                    )}
                    <button type="button" className="btn btn-link btn-sm" disabled={busy !== null} onClick={() => setRenaming({ id: r.id, title: r.title })} aria-label={`Rename ${r.title}`}>
                      Rename
                    </button>
                    <a className="btn btn-link btn-sm" href={`/api/resumes/${r.id}/file`}>
                      Download
                    </a>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-destructive"
                      disabled={busy !== null}
                      aria-label={`Delete ${r.title}`}
                      onClick={() => {
                        if (window.confirm(`Delete “${r.title}”? Its extracted profile and any analyses built on it are removed too.`)) void act('delete', () => deleteResume(r.id))
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="jobs-panel">
          <div className="jobs-panel-title">Use it on a job</div>
          <p className="jobs-panel-sub">Compare any version with any opening below, or open an opening in Job Discovery and choose “Analyze resume for this job”.</p>
          <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={onOpenJobs}>
            Go to Job Discovery
          </button>
        </div>
      </aside>

      {renaming && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rename-title">
          <form
            className="admin-modal"
            onSubmit={(e) => {
              e.preventDefault()
              const next = renaming.title.trim()
              if (!next) return
              void act('rename', () => updateResume(renaming.id, { title: next }), renaming.id).then(() => setRenaming(null))
            }}
          >
            <h2 id="rename-title" className="admin-modal-title">
              Rename resume
            </h2>
            <label className="admin-field">
              <span>Title</span>
              <input className="input-field" value={renaming.title} onChange={(e) => setRenaming({ ...renaming, title: e.target.value })} autoFocus />
            </label>
            <div className="admin-form-footer">
              <button type="submit" className="btn btn-primary" disabled={busy !== null}>
                Save
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setRenaming(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function ProfileView({ profile }: { profile: ResumeDetailDto['profile'] & object }) {
  const unknown = new Set(profile.unknown)
  const Field = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <dt className="job-fact-label">{label}</dt>
      <dd className="job-fact-value">{value ?? <span className="text-muted-foreground font-normal">Unknown (not found in the file)</span>}</dd>
    </div>
  )
  return (
    <div className="mt-3 flex flex-col gap-4">
      <dl className="job-facts">
        <Field label="Name" value={profile.name} />
        <Field label="Headline" value={profile.headline} />
        <Field label="Email" value={profile.contact.email} />
        <Field label="Dated experience" value={profile.totalExperienceMonths != null ? `${(profile.totalExperienceMonths / 12).toFixed(1)} years` : null} />
      </dl>
      {profile.summary && (
        <div>
          <div className="job-fact-label">Summary</div>
          <p className="text-sm mt-1">{profile.summary}</p>
        </div>
      )}
      <div>
        <div className="job-fact-label">Skills recognised ({profile.skills.length})</div>
        {profile.skills.length ? (
          <div className="job-tag-list">
            {profile.skills.map((s) => (
              <span key={s.name} className="job-chip job-chip-accent" title={`Line ${s.evidence.lines[0]}: ${s.evidence.quote}`}>
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm mt-1">None of the lexicon skills were found.</p>
        )}
        {profile.technologies.length > 0 && <p className="job-source-note">Also listed: {profile.technologies.filter((t) => !profile.skills.some((s) => s.name.toLowerCase() === t.toLowerCase())).slice(0, 15).join(', ')}</p>}
      </div>
      <div>
        <div className="job-fact-label">Employment ({profile.employment.length})</div>
        {profile.employment.length ? (
          <ul className="resume-entries">
            {profile.employment.map((e, i) => (
              <li key={i} className="resume-entry">
                <div className="font-semibold text-sm">
                  {e.title || 'Title not read'}
                  {e.company ? ` · ${e.company}` : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.start || '?'} → {e.end || '?'}
                  {e.months != null ? ` · ${e.months} months` : ' · duration unknown'} · lines {e.evidence.lines[0]}–{e.evidence.lines[e.evidence.lines.length - 1]}
                </div>
                {e.bullets.length > 0 && (
                  <ul className="text-sm mt-1 list-disc pl-5">
                    {e.bullets.slice(0, 4).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm mt-1">{unknown.has('years of experience') ? 'No dated employment entries were found.' : 'None.'}</p>
        )}
      </div>
      <div className="admin-grid-2">
        <div>
          <div className="job-fact-label">Projects ({profile.projects.length})</div>
          {profile.projects.length ? (
            <ul className="resume-entries">
              {profile.projects.map((p, i) => (
                <li key={i} className="resume-entry">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-sm">{p.description}</div>
                  {p.technologies.length > 0 && <div className="text-xs text-muted-foreground">{p.technologies.join(', ')}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm mt-1">No projects section found.</p>
          )}
        </div>
        <div>
          <div className="job-fact-label">Education and certifications</div>
          {profile.education.length || profile.certifications.length ? (
            <ul className="text-sm mt-1 list-disc pl-5">
              {profile.education.map((e, i) => (
                <li key={`e${i}`}>{e.text}</li>
              ))}
              {profile.certifications.map((c, i) => (
                <li key={`c${i}`}>{c.text}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm mt-1">Unknown (no education or certification section found).</p>
          )}
        </div>
      </div>
    </div>
  )
}
