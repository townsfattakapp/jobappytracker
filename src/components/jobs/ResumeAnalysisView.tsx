import { useState } from 'react'
import type { Provenance, Suggestion } from '../../lib/jobs/resumeAnalysis'
import type { StoredAnalysisDto } from '../../lib/resume/client'

const PROV_LABEL: Record<Provenance, string> = { job: 'From job description', resume: 'From your resume', curriculum: 'From your curriculum', recommendation: 'JobAppy recommendation' }

/** Provenance chip: where a statement comes from (job listing, resume, curriculum, recommendation). */
export function Prov({ p }: { p: Provenance }) {
  return <span className={`prov prov-${p}`}>{PROV_LABEL[p]}</span>
}

/** Evidence-based resume-versus-job report: strong matches, missing evidence, skills table, experience and project relevance, grounded suggestions. Shared by the job workspace and the Resume workspace. */
export default function ResumeAnalysisView({ analysis, onOpenTrack, onUpdate, onAddGaps }: { analysis: StoredAnalysisDto; onOpenTrack: (id: string) => void; onUpdate: (s: Suggestion, state: 'saved' | 'dismissed' | 'completed' | null) => void; onAddGaps: (trackIds: string[]) => void }) {
  const r = analysis.report
  const state = analysis.suggestionState
  const [showDismissed, setShowDismissed] = useState(false)
  const visible = r.improvements.filter((s) => showDismissed || state[s.id] !== 'dismissed')
  const gapTrackIds = Array.from(new Set(r.improvements.filter((s) => s.kind === 'gap').flatMap((s) => s.trackIds)))
  return (
    <div className="mt-4 flex flex-col gap-5">
      <div className="jobs-summary">
        <span>
          {r.summary.demonstrated} demonstrated · {r.summary.weak} weak · {r.summary.missing} missing of {r.skillsAlignment.length} skills the listing names
        </span>
      </div>
      {r.aiInsights && r.aiInsights.items.length > 0 && (
        <div className="ai-note" role="note">
          <span className="ai-note-label">AI reasoning · from the evidence below · {r.aiInsights.provider}</span>
          <ul>
            {r.aiInsights.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="evidence-grid">
        <div>
          <div className="evidence-col-title">Strong matches · requirements your resume demonstrates</div>
          {r.strongMatches.length ? (
            <div className="evidence-list">
              {r.strongMatches.map((m) => (
                <div key={m.skill} className="evidence-row">
                  <Prov p="resume" />
                  <strong>{m.skill}</strong>
                  <span className="evidence-quote">Line {m.evidence.lines[0]}: “{m.evidence.quote}”</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">None of the listed skills is shown in use in the resume.</p>
          )}
        </div>
        <div>
          <div className="evidence-col-title">Missing or weak evidence</div>
          {r.missingOrWeak.length ? (
            <div className="evidence-list">
              {r.missingOrWeak.map((m) => (
                <div key={m.skill} className={`evidence-row${m.status === 'missing' ? ' is-missing' : ''}`}>
                  <Prov p="job" />
                  <strong>{m.skill}</strong> · {m.requirement} · {m.status === 'missing' ? 'not found in your resume' : 'listed but not shown in use'}
                  {m.trackIds.length > 0 && (
                    <span className="evidence-quote">
                      <Prov p="curriculum" />
                      JobAppy covers it:{' '}
                      {m.trackIds.map((id) => (
                        <button key={id} type="button" className="btn btn-link btn-sm" onClick={() => onOpenTrack(id)}>
                          {r.curriculumGaps.find((g) => g.trackId === id)?.title || id}
                        </button>
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">Every skill the listing names has evidence in your resume.</p>
          )}
        </div>
      </div>

      <div>
        <div className="evidence-col-title">Skills alignment</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Listing</th>
                <th>Resume</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {r.skillsAlignment.map((row) => (
                <tr key={row.skill}>
                  <td className="font-semibold">{row.skill}</td>
                  <td>{row.requirement}</td>
                  <td>{row.status}</td>
                  <td className="text-muted-foreground">{row.evidence ? `Line ${row.evidence.lines[0]}: ${row.evidence.quote.slice(0, 90)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="evidence-grid">
        <div>
          <div className="evidence-col-title">Experience alignment</div>
          <div className="evidence-row">
            <Prov p="job" />
            {r.experienceAlignment.jobMin == null && r.experienceAlignment.jobMax == null ? 'No years stated' : `${r.experienceAlignment.jobMin ?? 0}${r.experienceAlignment.jobMax != null ? `–${r.experienceAlignment.jobMax}` : '+'} years`}
            <br />
            <Prov p="resume" />
            {r.experienceAlignment.resumeYears != null ? `${r.experienceAlignment.resumeYears} years of dated employment` : 'No dated employment found'}
            <span className="evidence-quote">{r.experienceAlignment.verdict}</span>
          </div>
        </div>
        <div>
          <div className="evidence-col-title">Project relevance</div>
          {r.projectRelevance.length ? (
            <div className="evidence-list">
              {r.projectRelevance.map((p) => (
                <div key={p.name} className="evidence-row">
                  <Prov p="resume" />
                  <strong>{p.name}</strong> · uses {p.matchedSkills.join(', ')}
                  <span className="evidence-quote">Line {p.evidence.lines[0]}: “{p.evidence.quote.slice(0, 120)}”</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">No project in the resume uses the skills this job names.</p>
          )}
        </div>
      </div>

      <div>
        <div className="evidence-col-title">Keywords and concepts from the description</div>
        <div className="job-tag-list">
          {r.keywords.map((k) => (
            <span key={k.term} className={`job-chip${k.inResume ? ' job-chip-fresh' : ''}`} title={k.evidence ? `Line ${k.evidence.lines[0]}: ${k.evidence.quote}` : 'Not found in your resume'}>
              {k.term} {k.inResume ? '✓' : '·'}
            </span>
          ))}
        </div>
        <p className="job-source-note">✓ = present in your resume. Only use terms you can back up.</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="evidence-col-title mb-0">Job-specific recommendations · {visible.length}</div>
          <div className="flex gap-2 items-center">
            {gapTrackIds.length > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onAddGaps(gapTrackIds)}>
                Add missing skills to learning plan
              </button>
            )}
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <input type="checkbox" checked={showDismissed} onChange={(e) => setShowDismissed(e.target.checked)} /> show dismissed
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          {visible.map((s) => {
            const st = state[s.id]
            return (
              <div key={s.id} className={`suggestion${st ? ` is-${st}` : ''}`}>
                <div className="suggestion-title">
                  {s.provenance.map((p) => (
                    <Prov key={p} p={p} />
                  ))}
                  {s.title}
                  {st && <span className="job-chip">{st}</span>}
                </div>
                <div className="suggestion-why">{s.why}</div>
                <div className="suggestion-action">{s.action}</div>
                {s.evidence && <span className="evidence-quote">Line {s.evidence.lines[0]}: “{s.evidence.quote}”</span>}
                <div className="suggestion-actions">
                  {s.trackIds.map((id) => (
                    <button key={id} type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTrack(id)}>
                      Open {r.curriculumGaps.find((g) => g.trackId === id)?.title || 'track'}
                    </button>
                  ))}
                  {st !== 'completed' && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onUpdate(s, 'completed')} aria-label={`Mark done: ${s.title}`}>
                      Mark done
                    </button>
                  )}
                  {st !== 'saved' && st !== 'completed' && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onUpdate(s, 'saved')} aria-label={`Save: ${s.title}`}>
                      Save
                    </button>
                  )}
                  {st !== 'dismissed' ? (
                    <button type="button" className="btn btn-link btn-sm" onClick={() => onUpdate(s, 'dismissed')} aria-label={`Dismiss: ${s.title}`}>
                      Dismiss
                    </button>
                  ) : (
                    <button type="button" className="btn btn-link btn-sm" onClick={() => onUpdate(s, null)} aria-label={`Restore: ${s.title}`}>
                      Restore
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="job-source-note">Suggestions only rephrase or reorder what your resume already says. Your uploaded file is never changed.</p>
      </div>
    </div>
  )
}
