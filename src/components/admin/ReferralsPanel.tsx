'use client'

import { useEffect, useState } from 'react'
import { ApiError } from '../../lib/adminClient'
import { adminReferralAction, adminReferrerAction, adminRequestAction, fetchAdminReferrals, formatWhen, type AdminReferralConsole, type AdminReferrerDto, type AdminRequestDto, type CompanyCoverageRow } from '../../lib/referrals/client'
import { CLOSE_REASONS } from '../../lib/referrals/states'
import { Pill, StatCard, statusTone } from './ui'

type TabId = 'requests' | 'referrers' | 'coverage' | 'disclosures' | 'settings'

/** Timestamps are locale- and zone-dependent, so they render only after mount: the server-rendered HTML and the first client render match. */
function useWhen(): (value: string | null | undefined) => string {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? formatWhen : () => '…'
}

/** /admin/referrals: one console for requests, referrers, coverage and policy, disclosures and beta settings. Admin writes; support reads. */
export default function ReferralsPanel({ initial, companies, canEdit }: { initial: AdminReferralConsole; companies: { id: string; name: string; slug: string }[]; canEdit: boolean }) {
  const when = useWhen()
  const [data, setData] = useState<AdminReferralConsole>(initial)
  const [tab, setTab] = useState<TabId>('requests')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () => fetchAdminReferrals().then(setData)
  const run = async (fn: () => Promise<string | void>) => {
    if (!canEdit) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const msg = await fn()
      if (msg) setNotice(msg)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const m = data.metrics
  return (
    <div className="referrals-admin">
      <div className="admin-stat-grid">
        <StatCard label="Verified referrers" value={m.verifiedReferrers} hint={`${m.availableReferrers} available`} />
        <StatCard label="Companies covered" value={m.companiesCovered} hint="with an active verified referrer" />
        <StatCard label="Requests" value={m.requests} hint={`${m.awaitingMatch} awaiting match · ${m.underReview} under review`} tone={m.awaitingMatch ? 'warn' : 'default'} />
        <StatCard label="Accepted / declined" value={`${m.accepted} / ${m.declined}`} hint={m.medianResponseHours !== null ? `median response ${m.medianResponseHours} h` : 'no responses yet'} />
        <StatCard label="Referrals submitted" value={m.submitted} hint={`${m.noReferrerAvailable} closed: no referrer available`} tone="good" />
      </div>
      {error && (
        <p className="admin-alert admin-alert-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-alert" role="status">
          {notice}
        </p>
      )}
      <div className="job-tabs" role="tablist">
        {(
          [
            ['requests', `Requests (${data.requests.length})`],
            ['referrers', `Referrers (${data.referrers.length})`],
            ['coverage', 'Company coverage'],
            ['disclosures', `Identity disclosures (${data.disclosures.length})`],
            ['settings', 'Beta settings'],
          ] as [TabId, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`job-tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'requests' && <Requests requests={data.requests} referrers={data.referrers} canEdit={canEdit} busy={busy} run={run} />}
      {tab === 'referrers' && <Referrers referrers={data.referrers} companies={companies} canEdit={canEdit} busy={busy} run={run} />}
      {tab === 'coverage' && <Coverage coverage={data.coverage} canEdit={canEdit} busy={busy} run={run} />}
      {tab === 'disclosures' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Request</th>
                <th>Referrer</th>
                <th>Learner</th>
                <th>Fields</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {data.disclosures.length === 0 && (
                <tr>
                  <td colSpan={6} className="job-section-sub">
                    No identity has been disclosed.
                  </td>
                </tr>
              )}
              {data.disclosures.map((d) => (
                <tr key={d.id}>
                  <td>{when(d.at)}</td>
                  <td className="admin-code">{d.requestId.slice(0, 8)}</td>
                  <td>{d.referrerName ?? '—'}</td>
                  <td>{d.learnerEmail ?? '—'}</td>
                  <td>{d.fields.join(', ')}</td>
                  <td>{d.actorRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'settings' && <Settings settings={data.settings} canEdit={canEdit} busy={busy} run={run} />}
    </div>
  )
}

function Requests({ requests, referrers, canEdit, busy, run }: { requests: AdminRequestDto[]; referrers: AdminReferrerDto[]; canEdit: boolean; busy: boolean; run: (fn: () => Promise<string | void>) => Promise<void> }) {
  const when = useWhen()
  const [openId, setOpenId] = useState<string | null>(null)
  const [pick, setPick] = useState('')
  const [reason, setReason] = useState<string>('admin')
  const [note, setNote] = useState('')
  const open = requests.find((r) => r.id === openId) ?? null
  const candidates = open ? referrers.filter((r) => r.companyId === open.companyId && r.verificationStatus === 'VERIFIED') : []
  return (
    <div className="admin-grid-2 referrals-admin-split">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company · role</th>
              <th>Learner</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="job-section-sub">
                  No requests yet.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className={openId === r.id ? 'is-selected' : ''} onClick={() => setOpenId(r.id)} style={{ cursor: 'pointer' }}>
                <td>
                  <strong>{r.companyName}</strong>
                  <div className="job-section-sub">{r.jobTitle}</div>
                </td>
                <td>{r.learnerEmail ?? r.userId.slice(0, 8)}</td>
                <td>
                  <Pill tone={['CLOSED', 'CANCELLED', 'EXPIRED'].includes(r.status) ? 'neutral' : ['MATCHING', 'SCREENING'].includes(r.status) ? 'warn' : ['REFERRAL_SUBMITTED', 'REFERRAL_CONFIRMED'].includes(r.status) ? 'good' : 'info'}>{r.status.replace(/_/g, ' ').toLowerCase()}</Pill>
                  {r.closedReason && <div className="job-section-sub">{r.closedReason.replace(/_/g, ' ')}</div>}
                </td>
                <td>{r.attempts}</td>
                <td>{when(r.lastEventAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="admin-card referrals-admin-detail">
          <h3 className="font-semibold">
            {open.companyName} · {open.jobTitle}
          </h3>
          <p className="job-section-sub">
            {open.status} · attempts {open.attempts} · credit {open.credit.reserved ? (open.credit.outstanding ? 'reserved' : 'settled') : 'none'} · readiness {open.readinessStatus ?? '—'}
          </p>
          {open.currentAssignment && (
            <p className="text-sm">
              Current assignment: <strong>{open.currentAssignment.referrerName ?? 'unknown'}</strong> ({open.currentAssignment.status.toLowerCase()}, since {when(open.currentAssignment.assignedAt)}
              {open.currentAssignment.expiresAt ? `, due ${when(open.currentAssignment.expiresAt)}` : ''})
            </p>
          )}
          <details className="admin-details" open>
            <summary>Assignments ({open.assignments.length})</summary>
            <ul className="referral-admin-list">
              {open.assignments.map((a) => (
                <li key={a.id}>
                  {when(a.assignedAt)} · {a.referrerName ?? '—'} · {a.status.toLowerCase()} · by {a.assignedBy}
                  {a.declineReason ? ` · ${a.declineReason.replace(/_/g, ' ')}` : ''}
                </li>
              ))}
            </ul>
          </details>
          <details className="admin-details">
            <summary>Events ({open.events.length})</summary>
            <ul className="referral-admin-list">
              {open.events.map((e, i) => (
                <li key={i}>
                  {when(e.at)} · {e.fromStatus ?? '∅'} → {e.toStatus} · {e.actorRole}
                  {e.reason ? ` · ${e.reason}` : ''}
                </li>
              ))}
            </ul>
          </details>
          <details className="admin-details">
            <summary>Messages ({open.messages.length})</summary>
            <ul className="referral-admin-list">
              {open.messages.map((msg, i) => (
                <li key={i}>
                  <strong>{msg.from}:</strong> {msg.body} <span className="job-section-sub">{when(msg.at)}</span>
                </li>
              ))}
            </ul>
          </details>
          {canEdit && !['CLOSED', 'CANCELLED', 'EXPIRED'].includes(open.status) && (
            <div className="referral-admin-actions">
              {['MATCHING', 'ASSIGNED', 'REFERRER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(open.status) && (
                <div className="referral-reply">
                  <select className="input-field" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Referrer">
                    <option value="">{open.status === 'MATCHING' ? 'Assign to a verified referrer' : 'Reassign to a verified referrer'}</option>
                    {candidates.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName} · {r.availability} · {r.activeAssignments}/{r.maxActiveRequests} open
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-primary btn-sm" disabled={busy || !pick} onClick={() => run(async () => { await adminRequestAction(open.id, open.status === 'MATCHING' ? { action: 'assign', referrerId: pick } : { action: 'reassign', referrerId: pick }); setPick(''); return 'Assigned.' })}>
                    {open.status === 'MATCHING' ? 'Assign' : 'Reassign'}
                  </button>
                  {open.status === 'MATCHING' && (
                    <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await adminRequestAction(open.id, { action: 'retry_matching' }); return 'Matching retried.' })}>
                      Retry automatic matching
                    </button>
                  )}
                </div>
              )}
              {open.status === 'REFERRAL_SUBMITTED' && (
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await adminRequestAction(open.id, { action: 'confirm' }); return 'Confirmed.' })}>
                  Confirm referral
                </button>
              )}
              <div className="referral-reply">
                <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Close reason">
                  {CLOSE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { if (!window.confirm('Close this request?')) return; await adminRequestAction(open.id, { action: 'close', reason }); return 'Closed.' })}>
                  Close request
                </button>
              </div>
              <div className="referral-reply">
                <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Message both parties (as JobAppy)" aria-label="Note" />
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy || note.trim().length < 2} onClick={() => run(async () => { await adminRequestAction(open.id, { action: 'note', message: note }); setNote(''); return 'Sent.' })}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Referrers({ referrers, companies, canEdit, busy, run }: { referrers: AdminReferrerDto[]; companies: { id: string; name: string }[]; canEdit: boolean; busy: boolean; run: (fn: () => Promise<string | void>) => Promise<void> }) {
  const when = useWhen()
  const [invite, setInvite] = useState({ email: '', companyId: '', note: '' })
  const [link, setLink] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [caps, setCaps] = useState<Record<string, { a: number; m: number }>>({})
  const [credit, setCredit] = useState({ userId: '', amount: 1, reason: 'Beta credit' })
  return (
    <div>
      {canEdit && (
        <form
          className="admin-card referral-invite"
          onSubmit={(e) => {
            e.preventDefault()
            run(async () => {
              const r = (await adminReferralAction({ action: 'invite', ...invite })) as { invite?: { link: string } }
              setLink(r.invite?.link ?? null)
              setInvite({ email: '', companyId: '', note: '' })
              return 'Invitation created. If mail is not configured, hand over the link shown below.'
            })
          }}
        >
          <h3 className="font-semibold">Invite a referrer (invite-only beta)</h3>
          <div className="admin-grid-3">
            <label className="admin-field">
              <span>Corporate email</span>
              <input className="input-field" type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            </label>
            <label className="admin-field">
              <span>Company</span>
              <select className="input-field" required value={invite.companyId} onChange={(e) => setInvite({ ...invite, companyId: e.target.value })}>
                <option value="">Choose</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Note (internal)</span>
              <input className="input-field" value={invite.note} onChange={(e) => setInvite({ ...invite, note: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            Send invitation
          </button>
          {link && (
            <p className="admin-help">
              Invitation link (shown once): <code className="admin-code">{typeof window !== 'undefined' ? `${window.location.origin}${link}` : link}</code>
            </p>
          )}
        </form>
      )}
      {canEdit && (
        <form
          className="admin-card referral-invite"
          onSubmit={(e) => {
            e.preventDefault()
            run(async () => {
              await adminReferralAction({ action: 'grant_credits', ...credit })
              return 'Credits granted.'
            })
          }}
        >
          <h3 className="font-semibold">Grant referral credits to a learner</h3>
          <div className="admin-grid-3">
            <label className="admin-field">
              <span>Learner user id</span>
              <input className="input-field" required value={credit.userId} onChange={(e) => setCredit({ ...credit, userId: e.target.value })} placeholder="from Users & roles" />
            </label>
            <label className="admin-field">
              <span>Credits</span>
              <input className="input-field" type="number" min={1} max={100} value={credit.amount} onChange={(e) => setCredit({ ...credit, amount: Number(e.target.value) })} />
            </label>
            <label className="admin-field">
              <span>Reason</span>
              <input className="input-field" required value={credit.reason} onChange={(e) => setCredit({ ...credit, reason: e.target.value })} />
            </label>
          </div>
          <button type="submit" className="btn btn-ghost btn-sm" disabled={busy}>
            Grant
          </button>
        </form>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Company · roles</th>
              <th>Status</th>
              <th>Load</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrers.length === 0 && (
              <tr>
                <td colSpan={5} className="job-section-sub">
                  No referrers yet. Invite the first one above.
                </td>
              </tr>
            )}
            {referrers.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.fullName || '(onboarding not completed)'}</strong>
                  <div className="job-section-sub">
                    {r.corporateEmail ?? '—'} · account {r.userEmail ?? '—'}
                  </div>
                  <div className="job-section-sub">{r.title ?? ''}</div>
                </td>
                <td>
                  {r.companyName}
                  <div className="job-section-sub">
                    {r.roleFamilies.join(', ') || '—'} · {r.supportedLocations.join(', ') || '—'}
                  </div>
                </td>
                <td>
                  <Pill tone={r.verificationStatus === 'VERIFIED' ? 'good' : r.verificationStatus === 'PENDING' || r.verificationStatus === 'REQUIRES_REVERIFICATION' ? 'warn' : statusTone(r.verificationStatus)}>{r.verificationStatus.toLowerCase().replace(/_/g, ' ')}</Pill>
                  <div className="job-section-sub">
                    {r.availability}
                    {r.verifications.some((v) => v.method === 'corporate_email' && v.status === 'confirmed') ? ' · mailbox confirmed' : ' · mailbox not confirmed'}
                    {r.verificationExpiresAt ? ` · until ${when(r.verificationExpiresAt)}` : ''}
                  </div>
                </td>
                <td>
                  {r.activeAssignments}/{r.maxActiveRequests} open
                  <div className="job-section-sub">
                    {r.monthlyAssignments}/{r.maxMonthlyRequests} this month
                  </div>
                </td>
                <td>
                  {canEdit && (
                    <div className="referral-admin-actions">
                      {['PENDING', 'REQUIRES_REVERIFICATION', 'EXPIRED', 'REJECTED', 'SUSPENDED'].includes(r.verificationStatus) && (
                        <button type="button" className="btn btn-primary btn-sm" disabled={busy || !r.onboardingCompletedAt} title={r.onboardingCompletedAt ? '' : 'Onboarding not completed'} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: 'verify' }); return 'Verified for 12 months.' })}>
                          Verify
                        </button>
                      )}
                      {r.verificationStatus === 'VERIFIED' && (
                        <>
                          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { if (!window.confirm('Suspend this referrer? Live assignments are reassigned.')) return; await adminReferrerAction(r.id, { action: 'suspend' }); return 'Suspended.' })}>
                            Suspend
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: 'reverify' }); return 'Re-verification requested.' })}>
                            Re-verify
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: r.availability === 'available' ? 'pause' : 'resume' }); return r.availability === 'available' ? 'Paused.' : 'Available.' })}>
                            {r.availability === 'available' ? 'Pause' : 'Resume'}
                          </button>
                        </>
                      )}
                      {['PENDING', 'REQUIRES_REVERIFICATION'].includes(r.verificationStatus) && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: 'reject' }); return 'Rejected.' })}>
                          Reject
                        </button>
                      )}
                      <div className="referral-reply">
                        <input className="input-field" type="number" min={1} max={10} value={caps[r.id]?.a ?? r.maxActiveRequests} onChange={(e) => setCaps({ ...caps, [r.id]: { a: Number(e.target.value), m: caps[r.id]?.m ?? r.maxMonthlyRequests } })} aria-label="Max open" />
                        <input className="input-field" type="number" min={1} max={40} value={caps[r.id]?.m ?? r.maxMonthlyRequests} onChange={(e) => setCaps({ ...caps, [r.id]: { a: caps[r.id]?.a ?? r.maxActiveRequests, m: Number(e.target.value) } })} aria-label="Max monthly" />
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || !caps[r.id]} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: 'capacity', maxActiveRequests: caps[r.id].a, maxMonthlyRequests: caps[r.id].m }); return 'Capacity saved.' })}>
                          Capacity
                        </button>
                      </div>
                      <div className="referral-reply">
                        <input className="input-field" value={notes[r.id] ?? r.internalNotes ?? ''} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} placeholder="Internal notes" aria-label="Internal notes" />
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || notes[r.id] === undefined} onClick={() => run(async () => { await adminReferrerAction(r.id, { action: 'notes', notes: notes[r.id] }); return 'Notes saved.' })}>
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Coverage({ coverage, canEdit, busy, run }: { coverage: CompanyCoverageRow[]; canEdit: boolean; busy: boolean; run: (fn: () => Promise<string | void>) => Promise<void> }) {
  const when = useWhen()
  const [edit, setEdit] = useState<CompanyCoverageRow | null>(null)
  const [f, setF] = useState({ referralsEnabled: false, policyStatus: 'UNKNOWN', policySource: '', notes: '', alreadyAppliedRestricted: true, duplicateReferralRestricted: true, manualReviewRequired: false, constraints: '' })
  const [q, setQ] = useState('')
  const rows = coverage.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()))
  const start = (c: CompanyCoverageRow) => {
    setEdit(c)
    setF({ referralsEnabled: c.referralsEnabled, policyStatus: c.policyStatus, policySource: '', notes: '', alreadyAppliedRestricted: true, duplicateReferralRestricted: true, manualReviewRequired: c.manualReviewRequired, constraints: '' })
  }
  return (
    <div>
      <div className="admin-filters">
        <input className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter companies" aria-label="Filter companies" />
        <span className="job-section-sub">
          {coverage.filter((c) => c.networkAvailable).length} of {coverage.length} companies have genuine referral coverage.
        </span>
      </div>
      {edit && canEdit && (
        <form
          className="admin-card referral-invite"
          onSubmit={(e) => {
            e.preventDefault()
            run(async () => {
              await adminReferralAction({ action: 'policy', companyId: edit.companyId, referralsEnabled: f.referralsEnabled, policyStatus: f.policyStatus, policySource: f.policySource || undefined, notes: f.notes || undefined, alreadyAppliedRestricted: f.alreadyAppliedRestricted, duplicateReferralRestricted: f.duplicateReferralRestricted, manualReviewRequired: f.manualReviewRequired, constraints: f.constraints.split(',').map((s) => s.trim()).filter(Boolean), lastReviewedAt: new Date().toISOString() })
              setEdit(null)
              return `Policy saved for ${edit.name}.`
            })
          }}
        >
          <h3 className="font-semibold">Referral policy · {edit.name}</h3>
          <p className="admin-help">Record only what was actually read. “Verified policy” needs a source. Unknown stays unknown; whether unknown policies may proceed is a beta setting.</p>
          <div className="admin-grid-3">
            <label className="admin-field">
              <span>Policy status</span>
              <select className="input-field" value={f.policyStatus} onChange={(e) => setF({ ...f, policyStatus: e.target.value })}>
                {['UNKNOWN', 'PARTIAL_INFORMATION', 'VERIFIED_POLICY', 'REFERRALS_DISABLED'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Policy source (URL or document)</span>
              <input className="input-field" value={f.policySource} onChange={(e) => setF({ ...f, policySource: e.target.value })} />
            </label>
            <label className="admin-field">
              <span>Known constraints (comma separated)</span>
              <input className="input-field" value={f.constraints} onChange={(e) => setF({ ...f, constraints: e.target.value })} placeholder="one referral per candidate per 6 months" />
            </label>
          </div>
          <div className="admin-check-grid">
            <label className="admin-check">
              <input type="checkbox" checked={f.referralsEnabled} onChange={(e) => setF({ ...f, referralsEnabled: e.target.checked })} /> <span>Referral requests enabled for this company</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={f.alreadyAppliedRestricted} onChange={(e) => setF({ ...f, alreadyAppliedRestricted: e.target.checked })} /> <span>Candidates who already applied cannot be referred</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={f.duplicateReferralRestricted} onChange={(e) => setF({ ...f, duplicateReferralRestricted: e.target.checked })} /> <span>Duplicate referrals restricted</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={f.manualReviewRequired} onChange={(e) => setF({ ...f, manualReviewRequired: e.target.checked })} /> <span>Manual review: an admin assigns every request</span>
            </label>
          </div>
          <label className="admin-field">
            <span>Notes</span>
            <input className="input-field" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </label>
          <div className="referral-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              Save policy
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Jobs</th>
              <th>Verified referrers</th>
              <th>Capacity</th>
              <th>Policy</th>
              <th>Network</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.companyId}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.publishedJobs}</td>
                <td>
                  {c.verifiedReferrers}
                  {c.pendingReferrers ? <span className="job-section-sub"> · {c.pendingReferrers} pending</span> : null}
                </td>
                <td>{c.availableCapacity}</td>
                <td>
                  <Pill tone={c.policyStatus === 'VERIFIED_POLICY' ? 'good' : c.policyStatus === 'REFERRALS_DISABLED' ? 'bad' : c.policyStatus === 'PARTIAL_INFORMATION' ? 'info' : 'warn'}>{c.policyStatus.replace(/_/g, ' ').toLowerCase()}</Pill>
                  <div className="job-section-sub">
                    {c.referralsEnabled ? 'enabled' : 'not enabled'}
                    {c.manualReviewRequired ? ' · manual review' : ''}
                    {c.lastReviewedAt ? ` · reviewed ${when(c.lastReviewedAt)}` : ' · never reviewed'}
                  </div>
                </td>
                <td>
                  <Pill tone={c.networkAvailable ? 'good' : 'neutral'}>{c.networkAvailable ? 'available' : 'no coverage'}</Pill>
                </td>
                {canEdit && (
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => start(c)}>
                      Policy
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Settings({ settings, canEdit, busy, run }: { settings: AdminReferralConsole['settings']; canEdit: boolean; busy: boolean; run: (fn: () => Promise<string | void>) => Promise<void> }) {
  const [f, setF] = useState(settings)
  return (
    <form
      className="admin-card"
      onSubmit={(e) => {
        e.preventDefault()
        run(async () => {
          await adminReferralAction({ action: 'settings', ...f })
          return 'Settings saved.'
        })
      }}
    >
      <h3 className="font-semibold">Beta settings</h3>
      <p className="admin-help">The network starts invite-only. Public referrer applications stay off until switched on here. Referrer compensation is NOT ENABLED and has no switch: any incentive needs policy and legal review first.</p>
      <div className="admin-grid-3">
        <label className="admin-field">
          <span>Network mode</span>
          <select className="input-field" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value as typeof f.mode })} disabled={!canEdit}>
            <option value="invite_only">Invite-only beta</option>
            <option value="public">Public referrer applications</option>
            <option value="disabled">Disabled (hidden)</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Referrers tried per request</span>
          <input className="input-field" type="number" min={1} max={10} value={f.maxAttempts} onChange={(e) => setF({ ...f, maxAttempts: Number(e.target.value) })} disabled={!canEdit} />
        </label>
        <label className="admin-field">
          <span>Hours a referrer has to answer</span>
          <input className="input-field" type="number" min={1} max={336} value={f.assignmentTtlHours} onChange={(e) => setF({ ...f, assignmentTtlHours: Number(e.target.value) })} disabled={!canEdit} />
        </label>
        <label className="admin-field">
          <span>Days before an open request expires</span>
          <input className="input-field" type="number" min={1} max={180} value={f.requestTtlDays} onChange={(e) => setF({ ...f, requestTtlDays: Number(e.target.value) })} disabled={!canEdit} />
        </label>
      </div>
      <div className="admin-check-grid">
        <label className="admin-check">
          <input type="checkbox" checked={f.allowUnknownPolicy} onChange={(e) => setF({ ...f, allowUnknownPolicy: e.target.checked })} disabled={!canEdit} /> <span>Let requests proceed at companies whose policy is unknown (the referrer still decides)</span>
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={f.requireCredits} onChange={(e) => setF({ ...f, requireCredits: e.target.checked })} disabled={!canEdit} /> <span>Require a referral credit to submit a request</span>
        </label>
      </div>
      {canEdit && (
        <div className="referral-actions">
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            Save settings
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { const r = (await adminReferralAction({ action: 'sweep' })) as { sweep?: Record<string, number> }; return `Sweep done: ${JSON.stringify(r.sweep)}` })}>
            Run sweep now
          </button>
        </div>
      )}
    </form>
  )
}
