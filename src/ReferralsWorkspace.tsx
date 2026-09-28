'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './lib/adminClient'
import { fetchJob, type LearnerJob } from './lib/jobs/client'
import { fetchReferralCenter, formatWhen, PRICING_LINE, referralAction, TRUST_LINE, type LearnerRequestDto, type ReferralCenter } from './lib/referrals/client'
import { LEARNER_STAGE_LABELS } from './lib/referrals/states'
import { RequestStatus } from './components/jobs/ReferralTab'
import type { JobApplication } from './types'

type Bucket = 'active' | 'needs_action' | 'completed' | 'history'

const NEEDS_ACTION = new Set(['needs_your_reply', 'ready', 'readiness'])
const COMPLETED = new Set(['referral_submitted'])
const TERMINAL = new Set(['closed', 'cancelled', 'expired'])

function bucketOf(r: LearnerRequestDto): Bucket {
  if (NEEDS_ACTION.has(r.stage)) return 'needs_action'
  if (COMPLETED.has(r.stage)) return 'completed'
  if (TERMINAL.has(r.stage)) return 'history'
  return 'active'
}

/** /referrals: the learner's referral requests, credits and history. Identity of referrers never appears here. */
export default function ReferralsWorkspace({ signedIn, applications, onSignIn, onUpgrade, onOpenJob, onBrowseJobs, onAddToTracker }: { signedIn: boolean; applications: JobApplication[]; onSignIn: () => void; onUpgrade: () => void; onOpenJob: (jobId: string) => void; onBrowseJobs: () => void; onAddToTracker: (job: LearnerJob, opts: { source: string; status: 'Applied' }) => string | null }) {
  const [data, setData] = useState<ReferralCenter | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bucket, setBucket] = useState<Bucket>('active')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!signedIn) return
    fetchReferralCenter()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError && err.code === 'sign_in' ? 'Sign in to see your referral requests.' : err instanceof Error ? err.message : 'Could not load referrals.'))
  }, [signedIn])
  useEffect(() => {
    load()
  }, [load])

  const update = (request: LearnerRequestDto) => setData((d) => (d ? { ...d, requests: d.requests.map((r) => (r.id === request.id ? request : r)) } : d))
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    try {
      await fn()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'upgrade') onUpgrade()
      else setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(null)
    }
  }

  if (!signedIn) {
    return (
      <div className="jobs-panel">
        <h2 className="jobs-panel-title">Referral Center</h2>
        <p className="jobs-panel-sub">Sign in to request referrals from verified employees and follow each request from submission to a submitted referral.</p>
        <button type="button" className="btn btn-primary mt-3" onClick={onSignIn}>
          Sign in
        </button>
        <p className="referral-trust">{TRUST_LINE}</p>
      </div>
    )
  }

  const requests = data?.requests ?? []
  const counts = { active: 0, needs_action: 0, completed: 0, history: 0 }
  for (const r of requests) counts[bucketOf(r)] += 1
  // An open card stays visible after an action moves it to another bucket, so a reply does not make it vanish mid-read.
  const visible = requests.filter((r) => bucketOf(r) === bucket || r.id === openId)
  const open = openId ? requests.find((r) => r.id === openId) ?? null : null

  return (
    <div className="referrals-workspace">
      <div className="referrals-head">
        <div>
          <h2 className="jobs-panel-title">Referral Center</h2>
          <p className="jobs-panel-sub">Verified employees review your requests. {TRUST_LINE}</p>
        </div>
        {data && (
          <div className="referral-credit-card" aria-label="Referral credits">
            <div className="referral-credit-n">{data.credits.available}</div>
            <div>
              <div className="font-semibold">credits available</div>
              <div className="job-section-sub">
                {data.credits.held > 0 ? `${data.credits.held} reserved on open requests · ` : ''}
                {data.credits.allowance > 0 ? `${data.credits.allowance} per month with your plan` : data.features.request ? 'granted by JobAppy' : 'requests need a pass'}
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="admin-alert admin-alert-error" role="alert">
          {error}
        </p>
      )}
      {data?.networkMode === 'disabled' && <p className="job-section-sub">Referral assistance is switched off right now.</p>}
      <section className="jobs-panel">
        <h3 className="font-semibold">How to request a referral</h3>
        <ol className="list-decimal pl-5 text-sm space-y-2 mt-3">
          <li>Find a job and open its Referral tab to check verified employee availability.</li>
          <li>Select your resume, check readiness, and add your introduction and relevant experience.</li>
          <li>Submit with consent. When credits are required, one is reserved while we match your request.</li>
          <li>Follow updates here and reply to questions. Acceptance uses the reserved credit; the employee then submits through their employer.</li>
          <li>Once marked submitted, add the job to your application tracker and follow the employer’s next steps.</li>
        </ol>
        <div className="referral-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={onBrowseJobs}>Find a job to request a referral</button>
          <a className="btn btn-ghost btn-sm" href="/referrer">Join as a referrer</a>
        </div>
      </section>
      <div className="job-tabs" role="tablist" aria-label="Referral requests">
        {(
          [
            ['active', 'Active'],
            ['needs_action', 'Needs action'],
            ['completed', 'Completed'],
            ['history', 'History'],
          ] as [Bucket, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={bucket === id} className={`job-tab ${bucket === id ? 'is-active' : ''}`} onClick={() => setBucket(id)}>
            {label}
            {counts[id] > 0 && <span className="job-tab-badge">{counts[id]}</span>}
          </button>
        ))}
      </div>
      {!data && !error && <p className="job-section-sub">Loading…</p>}
      {data && visible.length === 0 && (
        <div className="jobs-panel">
          <p className="jobs-panel-sub">
            {bucket === 'active' ? 'No active requests. Open a job in Job Discovery and use its Referral tab to check readiness and request a referral.' : bucket === 'needs_action' ? 'Nothing needs your action.' : bucket === 'completed' ? 'No submitted referrals yet.' : data.features.history ? 'No closed requests.' : 'Full history is part of Prep Pro.'}
          </p>
        </div>
      )}
      <ul className="referral-cards">
        {visible.map((r) => (
          <li key={r.id} className={`referral-card ${openId === r.id ? 'is-open' : ''}`}>
            <button type="button" className="referral-card-main" onClick={() => setOpenId(openId === r.id ? null : r.id)} aria-expanded={openId === r.id}>
              <div>
                <div className="font-semibold">{r.companyName}</div>
                <div className="text-sm">{r.jobTitle}</div>
              </div>
              <div className="referral-card-meta">
                <span className={`referral-stage-pill is-${r.stage}`}>{LEARNER_STAGE_LABELS[r.stage]}</span>
                <span className="job-section-sub">Updated {formatWhen(r.lastEventAt)}</span>
              </div>
              <div className="job-section-sub referral-card-next">Next: {r.nextAction}</div>
            </button>
            {open?.id === r.id && (
              <div className="referral-card-body">
                <RequestStatus
                  request={open}
                  reply={reply}
                  setReply={setReply}
                  busy={busy}
                  tracked={applications.some((a) => a.jobRef?.jobId === open.jobId)}
                  onSend={() =>
                    run('message', async () => {
                      const res = await referralAction(open.id, { action: 'message', body: reply })
                      setReply('')
                      update(res.request)
                    })
                  }
                  onCancel={() =>
                    run('cancel', async () => {
                      if (!window.confirm('Cancel this referral request? Any reserved credit is returned.')) return
                      const res = await referralAction(open.id, { action: 'cancel' })
                      update(res.request)
                      load()
                    })
                  }
                  onTrack={() =>
                    run('track', async () => {
                      if (!open.jobId) return
                      const job = await fetchJob(open.jobId)
                      const id = onAddToTracker(job, { source: 'Referral', status: 'Applied' })
                      if (id) update((await referralAction(open.id, { action: 'link_application', applicationId: id })).request)
                    })
                  }
                />
                {open.jobId && (
                  <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenJob(open.jobId!)}>
                    Open the job
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {data && data.credits.recent.length > 0 && (
        <details className="admin-details referral-ledger">
          <summary>Credit history</summary>
          <ul>
            {data.credits.recent.map((row, i) => (
              <li key={i}>
                <span>{formatWhen(row.createdAt)}</span> <span>{row.type.toLowerCase()}</span> <span>{row.amount}</span> <span className="job-section-sub">{row.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="referral-trust">{PRICING_LINE}</p>
    </div>
  )
}
