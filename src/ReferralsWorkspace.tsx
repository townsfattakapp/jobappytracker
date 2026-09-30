'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './lib/adminClient'
import { fetchJob, type LearnerJob } from './lib/jobs/client'
import { fetchReferralCenter, formatWhen, PRICING_LINE, referralAction, TRUST_LINE, type LearnerRequestDto, type ReferralCenter } from './lib/referrals/client'
import { LEARNER_STAGE_LABELS } from './lib/referrals/states'
import { RequestStatus } from './components/jobs/ReferralTab'
import type { JobApplication } from './types'
import ReferralSteps from './components/referrer/ReferralSteps'

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
    setError(null)
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
          🛡️ 100% Verified Employees & Technical Screening
        </div>
        <h2 className="jobs-panel-title">Vetted Referral Network</h2>
        <p className="jobs-panel-sub">Sign in to connect with verified employees who review your experience, conduct an end-to-end technical screening to test your role readiness, and submit high-priority internal referrals.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={onSignIn}>
            Sign in to check referral eligibility
          </button>
          <a href="/referrer" className="btn btn-ghost">
            💼 Tech employee? Referrer Portal →
          </a>
        </div>
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
      <div className="referrals-head referral-hero">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
            🛡️ End-to-End Vetted Endorsements
          </div>
          <h2 className="jobs-panel-title">Vetted Referral Network</h2>
          <p className="jobs-panel-sub">Get endorsed by verified employees at top companies. Before referring, your matched employee conducts an end-to-end qualification screening to test your skills and ensure you enter the hiring pipeline with maximum credibility.</p>
          <div className="referral-actions"><button type="button" className="btn btn-primary btn-sm" onClick={onBrowseJobs}>Find a job to request a referral</button><a className="btn btn-ghost btn-sm" href="/referrer">Join as a verified referrer</a></div>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 className="font-semibold" style={{ fontSize: '1.05rem', margin: 0 }}>
            How End-to-End Vetted Referrals Work
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(142 60% 35%)', background: 'hsl(142 60% 40% / 0.12)', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
            ✓ Verified Quality Standards
          </span>
        </div>
        <p className="jobs-panel-sub" style={{ marginBottom: '1rem' }}>
          We maintain high interview callback rates because verified employees test candidate qualifications before endorsing them internally.
        </p>
        <ReferralSteps steps={[
          { title: '1. Role & ATS Check', detail: 'Target an active job. Our readiness scan checks whether your resume covers the role’s technical prerequisites.' },
          { title: '2. Matched Employee Match', detail: 'We pair your request with an active, verified engineer or manager working at your target employer.' },
          { title: '3. Technical Qualification Test', detail: 'Your referrer reviews your work and conducts a screening Q&A to test your skills and verify you are qualified end-to-end.' },
          { title: '4. Direct Internal Endorsement', detail: 'Once qualified, the referrer submits a verified internal referral directly to their employer’s hiring portal.' },
        ]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem', padding: '1rem', borderRadius: '0.75rem', background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border) / 0.7)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--foreground))' }}>
              <span>💡</span> Why referrers test you before referring
            </div>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Real employees stake their internal professional reputation when submitting a referral. By conducting an end-to-end qualification check first, hiring managers treat your application as pre-screened and high-priority, rather than generic portal spam.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--foreground))' }}>
              <span>🛡️</span> 100% Credit & Fairness Protection
            </div>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Credits are only consumed when a verified referrer accepts and conducts your review. If no verified employee is available for your role, or a match cannot be made, 100% of your reserved credit is returned immediately.
            </p>
          </div>
        </div>
        <p className="referral-trust" style={{ marginTop: '0.85rem' }}>{TRUST_LINE}</p>
      </section>
      <div className="referral-toolbar"><h3 className="font-semibold">Your requests</h3><button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={load}>Refresh requests</button></div>
      <div className="job-tabs" role="tablist" aria-label="Referral requests">
        {(
          [
            ['active', 'Active'],
            ['needs_action', 'Needs action'],
            ['completed', 'Completed'],
            ['history', 'History'],
          ] as [Bucket, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={bucket === id} className={`job-tab ${bucket === id ? 'is-active' : ''}`} onClick={() => { setBucket(id); setOpenId(null); setReply('') }}>
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
            <button type="button" disabled={busy !== null} className="referral-card-main" onClick={() => { setOpenId(openId === r.id ? null : r.id); setReply('') }} aria-expanded={openId === r.id}>
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
