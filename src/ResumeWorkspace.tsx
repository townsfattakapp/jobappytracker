import { useCallback, useEffect, useRef, useState } from 'react'
import LockedFeature from './components/LockedFeature'
import type { AppUser } from './lib/cloudSync'
import { ApiError } from './lib/adminClient'
import { ROLE_CATEGORIES, labelOf } from './lib/jobs/taxonomy'
import { deleteResume, fetchResume, fetchResumes, updateResume, uploadResume, type ResumeDetailDto, type ResumeMetaDto } from './lib/resume/client'

interface ResumeWorkspaceProps {
  user: AppUser | null
  features: string[]
  onSignIn: () => void
  onUpgrade: () => void
  onToast: (message: string) => void
  onOpenJobs: () => void
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

/** Learner resume area: upload PDF/text resumes, keep versions, mark the current one, and inspect what was read from it. */
export default function ResumeWorkspace({ user, features, onSignIn, onUpgrade, onToast, onOpenJobs }: ResumeWorkspaceProps) {
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
          <p className="jobs-panel-sub">Open any opening in Job Discovery and choose “Analyze resume for this job” to compare your current resume with its requirements.</p>
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
