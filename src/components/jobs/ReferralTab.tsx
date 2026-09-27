'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../lib/adminClient'
import type { LearnerJob } from '../../lib/jobs/client'
import { fetchJobReferral, formatWhen, PRICING_LINE, referralAction, runReferralReadiness, submitReferralRequest, TRUST_LINE, type JobReferralState, type LearnerRequestDto, type ReadinessReport } from '../../lib/referrals/client'
import { LEARNER_STAGE_LABELS, LEARNER_TIMELINE } from '../../lib/referrals/states'
import LockedFeature from '../LockedFeature'

/**
 * The Referral tab of a job: availability of the verified network for this
 * company, the factual readiness review, the request form with explicit
 * consent, and the request's own timeline and thread once submitted. Nothing
 * here names or identifies a referrer.
 */
export default function ReferralTab({ job, signedIn, tracked, preparationStarted, onSignIn, onUpgrade, onOpenTab, onOpenReferrals, onAddToTracker }: { job: LearnerJob; signedIn: boolean; tracked: boolean; preparationStarted: boolean; onSignIn: () => void; onUpgrade: () => void; onOpenTab: (tab: 'resume' | 'prepare') => void; onOpenReferrals: () => void; onAddToTracker: (job: LearnerJob, opts: { source: string; status: 'Applied' }) => string | null }) {
  const [state, setState] = useState<JobReferralState | null>(null)
  const [report, setReport] = useState<ReadinessReport | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ introduction: '', whyRole: '', relevantExperience: '', consent: false })
  const [confirming, setConfirming] = useState(false)
  const [reply, setReply] = useState('')

  const load = useCallback(() => {
    fetchJobReferral(job.id)
      .then((s) => {
        setState(s)
        if (s.request?.readiness) setReport(s.request.readiness)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load referral information.'))
  }, [job.id])
  useEffect(() => {
    load()
  }, [load])

  const run = async (fn: () => Promise<unknown>, key: string) => {
    setBusy(key)
    setError(null)
    try {
      await fn()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'upgrade') onUpgrade()
      else if (err instanceof ApiError && err.code === 'sign_in') onSignIn()
      else setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(null)
    }
  }

  const readiness = () =>
    run(async () => {
      const r = await runReferralReadiness(job.id, { alreadyApplied: tracked, preparationStarted })
      setReport(r.report)
      setState((s) => (s ? { ...s, request: r.request } : s))
    }, 'readiness')

  const submit = () =>
    run(async () => {
      if (!state?.request) return
      const r = await submitReferralRequest(job.id, { requestId: state.request.id, ...form })
      setState((s) => (s ? { ...s, request: r.request } : s))
      setConfirming(false)
      load()
    }, 'submit')

  const send = () =>
    run(async () => {
      if (!state?.request) return
      const r = await referralAction(state.request.id, { action: 'message', body: reply })
      setReply('')
      setState((s) => (s ? { ...s, request: r.request } : s))
    }, 'message')

  const cancel = () =>
    run(async () => {
      if (!state?.request || !window.confirm('Cancel this referral request? Any reserved credit is returned.')) return
      const r = await referralAction(state.request.id, { action: 'cancel' })
      setState((s) => (s ? { ...s, request: r.request } : s))
      load()
    }, 'cancel')

  const track = () =>
    run(async () => {
      if (!state?.request) return
      const id = onAddToTracker(job, { source: 'Referral', status: 'Applied' })
      if (id) {
        const r = await referralAction(state.request.id, { action: 'link_application', applicationId: id })
        setState((s) => (s ? { ...s, request: r.request } : s))
      }
    }, 'track')

  if (!signedIn) {
    return (
      <section className="job-section" aria-labelledby="job-referral">
        <h3 id="job-referral" className="job-section-title">
          Referral assistance
        </h3>
        <p className="job-section-sub">Sign in to see whether verified employees at {job.company.name} can review a referral request for this role.</p>
        <button type="button" className="btn btn-primary btn-sm mt-3" onClick={onSignIn}>
          Sign in
        </button>
        <p className="referral-trust">{TRUST_LINE}</p>
      </section>
    )
  }

  if (!state && !error) return <p className="job-section-sub">Loading referral information…</p>
  const request = state?.request ?? null
  const live = request && !['DRAFT', 'READINESS_REQUIRED', 'READY', 'CLOSED', 'CANCELLED', 'EXPIRED'].includes(request.status)
  const availability = state?.availability

  return (
    <section className="job-section referral-tab" aria-labelledby="job-referral">
      <h3 id="job-referral" className="job-section-title">
        Referral assistance
      </h3>
      {error && (
        <p className="admin-alert admin-alert-error" role="alert">
          {error}
        </p>
      )}

      {!live && (
        <div className="referral-availability" data-state={availability?.state ?? 'unknown'}>
          <strong>{availability?.state === 'available' ? 'Referral network available' : availability?.state === 'network_disabled' ? 'Referral assistance unavailable' : 'Referral assistance unavailable'}</strong>
          <p className="job-section-sub">{availability?.message ?? 'Referral availability is part of Prep Pro.'}</p>
        </div>
      )}

      {!live && state && !state.features.readiness && <LockedFeature title="Referral readiness" description="A factual review of your resume against this job before a verified referrer sees it." onUpgrade={onUpgrade} signedIn compact />}

      {!live && state?.features.readiness && (
        <div className="referral-step">
          <div className="referral-step-head">
            <span className="referral-step-n">1</span>
            <div>
              <div className="font-semibold">Referral readiness</div>
              <p className="job-section-sub">What a referrer will see, checked against your resume, this job and your preparation. It is factual: no hiring probability, and no advice to add skills you do not have.</p>
            </div>
          </div>
          {report ? (
            <div className={`referral-readiness is-${report.status.toLowerCase()}`}>
              <div className="referral-readiness-status">{report.status === 'READY' ? 'READY FOR REVIEW' : report.status === 'BLOCKED' ? 'CANNOT PROCEED' : 'NEEDS IMPROVEMENT BEFORE REVIEW'}</div>
              <p className="text-sm">{report.summary}</p>
              <ul className="referral-checks">
                {report.checks.map((c) => (
                  <li key={c.id} data-status={c.status}>
                    <span className="referral-check-mark" aria-hidden="true">
                      {c.status === 'pass' ? '✓' : c.status === 'warn' ? '!' : '✕'}
                    </span>
                    <span>
                      <strong>{c.label}.</strong> {c.detail}
                    </span>
                  </li>
                ))}
              </ul>
              {report.missingEvidence.length > 0 && (
                <p className="text-sm">
                  Missing evidence for: <strong>{report.missingEvidence.join(', ')}</strong>
                </p>
              )}
              {report.nextSteps.length > 0 && (
                <ul className="referral-next">
                  {report.nextSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
              <div className="referral-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={readiness} disabled={busy !== null}>
                  {busy === 'readiness' ? 'Checking…' : 'Run the check again'}
                </button>
                {report.checks.some((c) => c.id === 'evidence' && c.status !== 'pass') && (
                  <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenTab('resume')}>
                    Improve resume evidence
                  </button>
                )}
                {report.checks.some((c) => c.id === 'preparation' && c.status !== 'pass') && (
                  <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenTab('prepare')}>
                    Start preparing
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={readiness} disabled={busy !== null || availability?.state === 'network_disabled'}>
              {busy === 'readiness' ? 'Checking…' : 'Check referral readiness'}
            </button>
          )}
        </div>
      )}

      {!live && report?.status === 'READY' && state && (
        <div className="referral-step">
          <div className="referral-step-head">
            <span className="referral-step-n">2</span>
            <div>
              <div className="font-semibold">Request referral</div>
              <p className="job-section-sub">A matched, verified employee at {job.company.name} sees your approved resume, this introduction and the readiness summary. Nothing else about you is shared.</p>
            </div>
          </div>
          {!state.features.request ? (
            <LockedFeature title="Referral requests" description={`Submit requests to verified referrers (${state.limits.monthly || 'monthly'} per month on a pass). ${PRICING_LINE}`} onUpgrade={onUpgrade} signedIn compact />
          ) : availability?.state !== 'available' ? (
            <p className="job-section-sub">{availability?.message}</p>
          ) : (
            <form
              className="referral-form"
              onSubmit={(e) => {
                e.preventDefault()
                setConfirming(true)
              }}
            >
              <label className="admin-field">
                <span>Short introduction (optional)</span>
                <input className="input-field" value={form.introduction} maxLength={600} onChange={(e) => setForm({ ...form, introduction: e.target.value })} placeholder="One or two sentences about you" />
              </label>
              <label className="admin-field">
                <span>Why this role</span>
                <textarea className="input-field" rows={3} value={form.whyRole} maxLength={800} required onChange={(e) => setForm({ ...form, whyRole: e.target.value })} placeholder="What draws you to this role and team, in your own words" />
              </label>
              <label className="admin-field">
                <span>Relevant experience</span>
                <textarea className="input-field" rows={3} value={form.relevantExperience} maxLength={1200} onChange={(e) => setForm({ ...form, relevantExperience: e.target.value })} placeholder="The work that maps to this listing's requirements" />
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} required />
                <span>I consent to JobAppy sharing my approved resume, this introduction and my readiness summary with a matched, verified referrer at {job.company.name}. Communication stays inside JobAppy.</span>
              </label>
              <p className="referral-credits">
                {state.requireCredits ? `Credits available: ${state.credits?.available ?? 0} (one is reserved while the request is open and used only if a referrer accepts).` : 'No credit is needed during the beta.'} Open requests allowed: {state.limits.active}. Requests this month: up to {state.limits.monthly}.
              </p>
              {!confirming ? (
                <button type="submit" className="btn btn-primary" disabled={busy !== null || !form.consent || form.whyRole.trim().length < 20}>
                  Review and submit
                </button>
              ) : (
                <div className="referral-confirm" role="dialog" aria-label="Confirm referral request">
                  <p className="text-sm">
                    Submit a referral request for <strong>{job.title}</strong> at <strong>{job.company.name}</strong>? {TRUST_LINE}
                  </p>
                  <div className="referral-actions">
                    <button type="button" className="btn btn-primary" onClick={submit} disabled={busy !== null}>
                      {busy === 'submit' ? 'Submitting…' : 'Yes, submit request'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={busy !== null}>
                      Back
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {request && (live || ['CLOSED', 'CANCELLED', 'EXPIRED'].includes(request.status)) && <RequestStatus request={request} reply={reply} setReply={setReply} onSend={send} onCancel={cancel} onTrack={track} tracked={tracked} busy={busy} onOpenReferrals={onOpenReferrals} />}

      <p className="referral-trust">{TRUST_LINE}</p>
      <p className="referral-trust">{PRICING_LINE}</p>
    </section>
  )
}

export function RequestStatus({ request, reply, setReply, onSend, onCancel, onTrack, tracked, busy, onOpenReferrals }: { request: LearnerRequestDto; reply: string; setReply: (v: string) => void; onSend: () => void; onCancel: () => void; onTrack: () => void; tracked: boolean; busy: string | null; onOpenReferrals?: () => void }) {
  const reached = new Set(request.timeline.map((t) => t.stage))
  const canMessage = ['CLARIFICATION_REQUESTED', 'ASSIGNED', 'REFERRER_REVIEW', 'ACCEPTED', 'REFERRAL_PENDING'].includes(request.status)
  const canCancel = ['SUBMITTED', 'SCREENING', 'MATCHING', 'ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(request.status)
  const terminal = ['CLOSED', 'CANCELLED', 'EXPIRED'].includes(request.status)
  return (
    <div className="referral-status" data-stage={request.stage}>
      <div className="referral-status-head">
        <span className={`referral-stage-pill is-${request.stage}`}>{LEARNER_STAGE_LABELS[request.stage]}</span>
        <span className="job-section-sub">Updated {formatWhen(request.lastEventAt)}</span>
      </div>
      <p className="text-sm">{request.nextAction}</p>
      {request.closedReason && terminal && <p className="job-section-sub">{closeReasonText(request.closedReason)}</p>}
      {!terminal && (
        <ol className="referral-timeline" aria-label="Request progress">
          {LEARNER_TIMELINE.map((step) => {
            const done = reached.has(step.stage) || (step.stage === 'referrer_review' && (reached.has('needs_your_reply') || reached.has('accepted') || reached.has('referral_submitted')))
            const current = request.stage === step.stage || (step.stage === 'referrer_review' && request.stage === 'needs_your_reply')
            return (
              <li key={step.stage} data-done={done} data-current={current}>
                <span className="referral-timeline-dot" aria-hidden="true" />
                <span>{step.label}</span>
              </li>
            )
          })}
        </ol>
      )}
      {request.referrer && (
        <div className="referral-referrer" aria-label="Your referrer">
          <div className="font-semibold">Verified employee</div>
          <ul>
            <li>Company: {request.referrer.company}</li>
            <li>Area: {request.referrer.area}</li>
            {request.referrer.experienceBand && <li>Level: {request.referrer.experienceBand}</li>}
            <li>Employment verified</li>
            <li>Identity protected</li>
          </ul>
          {request.disclosed && (
            <p className="text-sm">
              The referrer chose to share: {request.disclosed.values.fullName ? <strong>{request.disclosed.values.fullName}</strong> : null}
              {request.disclosed.values.title ? ` · ${request.disclosed.values.title}` : ''}
              {request.disclosed.values.profileUrl ? (
                <>
                  {' · '}
                  <a href={request.disclosed.values.profileUrl} target="_blank" rel="noopener noreferrer">
                    profile
                  </a>
                </>
              ) : null}
            </p>
          )}
        </div>
      )}
      {request.messages.length > 0 && (
        <ul className="referral-thread" aria-label="Messages">
          {request.messages.map((m) => (
            <li key={m.id} data-from={m.from}>
              <span className="referral-thread-from">{m.from === 'you' ? 'You' : m.from === 'referrer' ? 'Referrer' : 'JobAppy'}</span>
              <p>{m.body}</p>
              <span className="job-section-sub">{formatWhen(m.at)}</span>
            </li>
          ))}
        </ul>
      )}
      {canMessage && (
        <div className="referral-reply">
          <textarea className="input-field" rows={2} value={reply} maxLength={1500} onChange={(e) => setReply(e.target.value)} placeholder={request.stage === 'needs_your_reply' ? 'Answer the referrer' : 'Message the referrer (through JobAppy)'} aria-label="Reply" />
          <button type="button" className="btn btn-primary btn-sm" onClick={onSend} disabled={busy !== null || reply.trim().length < 2}>
            {busy === 'message' ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}
      <div className="referral-actions">
        {request.stage === 'referral_submitted' && !tracked && !request.applicationId && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onTrack} disabled={busy !== null}>
            Add to Application Tracker (source: Referral)
          </button>
        )}
        {request.stage === 'referral_submitted' && (tracked || request.applicationId) && <span className="job-section-sub">Tracked with source “Referral”.</span>}
        {canCancel && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy !== null}>
            Cancel request
          </button>
        )}
        {onOpenReferrals && (
          <button type="button" className="btn btn-link btn-sm" onClick={onOpenReferrals}>
            Open Referral Center
          </button>
        )}
      </div>
    </div>
  )
}

function closeReasonText(reason: string): string {
  const map: Record<string, string> = {
    no_referrer_available: 'No verified referrer is currently available for this role. Any reserved credit was returned.',
    company_referrals_disabled: 'This company does not take referral requests through JobAppy right now. Any reserved credit was returned.',
    job_expired: 'The opening closed before a referral could be made. Any reserved credit was returned.',
    attempts_exhausted: 'Every eligible referrer reviewed this request and none could take it on. Any reserved credit was returned.',
    referrer_unavailable: 'The referrer became unavailable and nobody else could take the request. Your credit was returned.',
    system_failure: 'Something went wrong on our side; the credit was returned.',
    learner_cancelled: 'You cancelled this request.',
    request_expired: 'The request expired without a referral. Any reserved credit was returned.',
    admin: 'Closed by JobAppy support. Any reserved credit was returned.',
    completed: 'Completed.',
  }
  return map[reason] ?? reason
}
