'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../lib/adminClient'
import { assignmentAction, fetchAssignment, fetchReferrerPortal, formatWhen, referrerSelfAction, ROLE_FAMILY_OPTIONS, TRUST_LINE, type ReferrerAssignmentDto, type ReferrerPortalData, type ReferrerSelfDto } from '../../lib/referrals/client'
import { DECLINE_REASON_LABELS, DECLINE_REASONS } from '../../lib/referrals/states'
import BrandLogo from '../BrandLogo'
import ReferralSteps from './ReferralSteps'

/**
 * /referrer: a verified employee's own portal. Onboarding, personal-email
 * verification, availability and capacity, and the requests assigned to this
 * referrer only. There is no candidate browsing; the only candidates visible
 * are the ones explicitly assigned.
 */
export default function ReferrerPortal({ email, inviteToken }: { email: string; inviteToken?: string | null }) {
  const [data, setData] = useState<ReferrerPortalData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<ReferrerAssignmentDto | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    fetchReferrerPortal()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the portal.'))
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    setNotice(null)
    try {
      await fn()
      return true
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong.')
      return false
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    let active = true
    setAssignment(null)
    if (!openId) {
      setAssignment(null)
      return
    }
    fetchAssignment(openId)
      .then((r) => { if (active) setAssignment(r.assignment) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not open the request.') })
    return () => { active = false }
  }, [openId])

  if (!data && !error) return <p className="job-section-sub">Loading…</p>

  return (
    <div className="referrer-portal">
      <header className="referrer-head">
        <a href="/?home=1" aria-label="Prep home">
          <BrandLogo size={30} />
        </a>
        <div>
          <h1 className="font-display text-xl font-bold">Referrer portal</h1>
          <p className="job-section-sub">Signed in as {email}. You decide on every request; JobAppy never submits a referral on your behalf.</p>
        </div>
      </header>
      <button type="button" className="btn btn-ghost btn-sm referral-refresh" disabled={busy !== null} onClick={load}>Refresh status</button>
      <section className="surface referrer-card referral-hero">
        <h2 className="font-semibold">Your next step</h2>
        <p className="job-section-sub">{!data?.referrer
          ? 'Accept your personal invitation below. If you have not received one, request an invitation from our team.'
          : !data.referrer.onboardingCompletedAt
            ? 'Complete your profile, supported roles and locations, and request limits below.'
            : ['SUSPENDED', 'REJECTED'].includes(data.referrer.verificationStatus)
              ? 'Your profile cannot receive requests. Contact hello@evolw.in to discuss your verification status.'
            : data.referrer.verificationStatus !== 'VERIFIED'
              ? (data.referrer.contactEmailVerifiedAt ? 'Your personal email is confirmed. Our team must review and approve your employment before you receive requests.' : 'Confirm your personal email below, then wait for our team to review your employment. No work email is needed.')
              : data.referrer.availability === 'paused'
                ? 'You are verified but paused. Set yourself available below when you are ready to receive requests.'
                : 'Review assigned requests below. Ask questions, decline, or accept. After accepting, submit through your employer and mark the referral submitted here.'}</p>
        <details key={data?.referrer?.active ? 'ready' : 'setup'} open={data?.referrer?.active ? undefined : true} className="referral-progress"><summary>{data?.referrer?.active ? 'Setup complete · View onboarding steps' : 'Your onboarding progress'}</summary><ReferralSteps current={!data?.referrer ? 0 : !data.referrer.onboardingCompletedAt ? 1 : !data.referrer.contactEmailVerifiedAt ? 2 : !data.referrer.active ? 3 : 4} steps={[
          { title: 'Accept invitation', detail: 'Use your invited personal email.' },
          { title: 'Your profile', detail: 'Choose roles, locations and capacity.' },
          { title: 'Confirm email', detail: 'No work mailbox needed.' },
          { title: 'Employment review', detail: 'Our team checks your employment.' },
          { title: 'Review requests', detail: 'Go available when you are ready.' },
        ]} /></details>
      </section>
      {error && (
        <p className="admin-alert admin-alert-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="pass-pricing-status" role="status">
          {notice}
        </p>
      )}

      {data && !data.referrer && (
        <section className="surface referrer-card">
          {inviteToken ? (
            <>
              <h2 className="font-semibold text-lg">Accept your invitation</h2>
              <p className="job-section-sub">This creates your referrer profile for the company selected in your JobAppy invitation. Use the personal email that received this invitation. Confirming it proves mailbox ownership; an admin separately reviews your employment. No work email is required.</p>
              <button type="button" className="btn btn-primary mt-3" disabled={busy !== null} onClick={() => run('accept', async () => { await referrerSelfAction({ action: 'accept_invite', token: inviteToken }); window.history.replaceState(null, '', '/referrer'); setNotice('Invitation accepted. Complete your profile below.'); load() })}>
                {busy === 'accept' ? 'Accepting…' : 'Accept invitation'}
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-lg">Invite-only beta</h2>
              <p className="job-section-sub">{data.mode === 'public' ? 'Referrer applications will open here soon.' : 'The verified referrer network is invite-only for now. If you received an invitation email, open its link; otherwise write to hello@evolw.in.'}</p>
              <a className="btn btn-primary btn-sm" href="mailto:hello@evolw.in?subject=Join%20the%20JobAppy%20referrer%20network&body=Hi%20JobAppy%2C%0A%0AI%20would%20like%20to%20join%20as%20a%20referrer.%0ACompany%3A%20%0ARole%3A%20%0APersonal%20email%3A%20">Request an invitation</a>
            </>
          )}
          <p className="referral-trust">{TRUST_LINE}</p>
        </section>
      )}

      {data?.referrer && !data.referrer.onboardingCompletedAt && <Onboarding referrer={data.referrer} busy={busy} onSave={(body) => run('onboarding', async () => { await referrerSelfAction({ action: 'onboarding', ...body }); setNotice('Profile saved. Next: confirm your personal email, then wait for admin employment review.'); load() })} />}

      {data?.referrer && data.referrer.onboardingCompletedAt && (
        <>
          <Verification referrer={data.referrer} busy={busy} onSend={() => run('verify', async () => { const r = await referrerSelfAction({ action: 'send_verification' }); if (r.emailStatus !== 'sent') throw new Error(r.emailStatus === 'skipped' ? 'Email delivery is not configured. Contact hello@evolw.in; your email has not been confirmed.' : 'The confirmation email could not be sent. Try again later or contact hello@evolw.in.'); setNotice(`Confirmation email sent to ${r.sentTo}. Open it from that mailbox within an hour.`); load() })} />
          <Dashboard data={data} busy={busy} onAvailability={(body) => run('availability', async () => { await referrerSelfAction({ action: 'availability', ...body }); load() })} openId={openId} setOpenId={setOpenId} />
          {openId && !assignment && !error && <p role="status" className="referral-empty">Loading candidate review…</p>}
          {assignment && assignment.id === openId && (
            <AssignmentReview
              key={assignment.id}
              assignment={assignment}
              referrer={data.referrer}
              busy={busy}
              onAction={(body) =>
                run('assignment', async () => {
                  const r = await assignmentAction(assignment.id, body)
                  setAssignment(r.assignment)
                  load()
                  if (body.action === 'accept') setNotice('Accepted. Submit through your employer’s process, then mark it submitted here.')
                  if (body.action === 'decline') setNotice('Declined. The candidate is offered to another referrer when one is available; declining never counts against you.')
                  if (body.action === 'submitted') setNotice('Marked as submitted. Thank you.')
                })
              }
              onClose={() => setOpenId(null)}
            />
          )}
        </>
      )}
      <p className="referral-trust">{TRUST_LINE}</p>
    </div>
  )
}

function Onboarding({ referrer, busy, onSave }: { referrer: ReferrerSelfDto; busy: string | null; onSave: (body: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ fullName: referrer.fullName, title: referrer.title ?? '', roleFamilies: referrer.roleFamilies, department: referrer.department ?? '', location: referrer.location ?? '', supportedLocations: referrer.supportedLocations.join(', '), profileUrl: referrer.profileUrl ?? '', profileUrlShareable: referrer.profileUrlShareable, experienceBand: referrer.experienceBand ?? '', maxActiveRequests: referrer.maxActiveRequests, maxMonthlyRequests: referrer.maxMonthlyRequests, policyAcknowledged: false, privacyConsent: false })
  const toggleFamily = (id: string) => setF({ ...f, roleFamilies: f.roleFamilies.includes(id) ? f.roleFamilies.filter((x) => x !== id) : [...f.roleFamilies, id] })
  return (
    <form
      className="surface referrer-card"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...f, supportedLocations: f.supportedLocations.split(',').map((s) => s.trim()).filter(Boolean) })
      }}
    >
      <h2 className="font-semibold text-lg">Your referrer profile · {referrer.companyName}</h2>
      <p className="job-section-sub">Candidates only ever see “Verified employee · {referrer.companyName} · area”. Your name, email and links stay private unless you choose to share them on an accepted request.</p>
      <div className="admin-grid-2">
        <label className="admin-field">
          <span>Full name</span>
          <input className="input-field" required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Personal email for invitations and updates</span>
          <input className="input-field" type="email" readOnly value={referrer.contactEmail ?? ''} />
          <span className="job-section-sub">No work email required. Contact support if this address is incorrect.</span>
        </label>
        <label className="admin-field">
          <span>Role or title</span>
          <input className="input-field" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Department (optional)</span>
          <input className="input-field" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Your location</span>
          <input className="input-field" required value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Bengaluru" />
        </label>
        <label className="admin-field">
          <span>Locations you can support (comma separated, or “any”)</span>
          <input className="input-field" required value={f.supportedLocations} onChange={(e) => setF({ ...f, supportedLocations: e.target.value })} placeholder="Bengaluru, Hyderabad, remote" />
        </label>
        <label className="admin-field">
          <span>Experience level</span>
          <select className="input-field" value={f.experienceBand} onChange={(e) => setF({ ...f, experienceBand: e.target.value })}>
            <option value="">Prefer not to say</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead or manager</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Profile link (optional, https)</span>
          <input className="input-field" value={f.profileUrl} onChange={(e) => setF({ ...f, profileUrl: e.target.value })} placeholder="https://www.linkedin.com/in/…" />
        </label>
      </div>
      <fieldset className="admin-fieldset">
        <legend>Roles you can reasonably refer</legend>
        <div className="admin-check-grid">
          {ROLE_FAMILY_OPTIONS.map((o) => (
            <label key={o.id} className="admin-check">
              <input type="checkbox" checked={f.roleFamilies.includes(o.id)} onChange={() => toggleFamily(o.id)} /> <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="admin-grid-2">
        <label className="admin-field">
          <span>Maximum requests open at once</span>
          <input className="input-field" type="number" min={1} max={10} value={f.maxActiveRequests} onChange={(e) => setF({ ...f, maxActiveRequests: Number(e.target.value) })} />
        </label>
        <label className="admin-field">
          <span>Maximum requests per month</span>
          <input className="input-field" type="number" min={1} max={40} value={f.maxMonthlyRequests} onChange={(e) => setF({ ...f, maxMonthlyRequests: Number(e.target.value) })} />
        </label>
      </div>
      <label className="admin-check">
        <input type="checkbox" checked={f.profileUrlShareable} onChange={(e) => setF({ ...f, profileUrlShareable: e.target.checked })} /> <span>Allow me to share my profile link with a candidate after I accept their request (never automatic).</span>
      </label>
      <label className="admin-check">
        <input type="checkbox" required checked={f.policyAcknowledged} onChange={(e) => setF({ ...f, policyAcknowledged: e.target.checked })} /> <span>I will follow my employer’s referral policy. I decide on every request and submit referrals only through my employer’s official process.</span>
      </label>
      <label className="admin-check">
        <input type="checkbox" required checked={f.privacyConsent} onChange={(e) => setF({ ...f, privacyConsent: e.target.checked })} /> <span>I consent to JobAppy storing this profile and my personal email for account confirmation and referral updates. Employment is reviewed separately by an admin. Candidates see only my company, area and verified status.</span>
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy !== null}>
        {busy === 'onboarding' ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}

function Verification({ referrer, busy, onSend }: { referrer: ReferrerSelfDto; busy: string | null; onSend: () => void }) {
  const label: Record<string, string> = { PENDING: 'Pending verification', VERIFIED: 'Verified', REJECTED: 'Not verified', SUSPENDED: 'Suspended', EXPIRED: 'Verification expired', REQUIRES_REVERIFICATION: 'Re-verification required' }
  return (
    <section className="surface referrer-card" aria-label="Verification">
      <p className="job-section-sub">Personal email: {referrer.contactEmailVerifiedAt ? 'Confirmed' : 'Not confirmed'} · {referrer.contactEmail}</p>
      {!referrer.contactEmailVerifiedAt && <p className="referral-mail-help">Look for an email from hello@evolw.in in your inbox, Promotions or Spam. Use the latest confirmation link, then refresh this page. Links expire after one hour.</p>}
      <div className="referrer-verify-row">
        <div>
          <h2 className="font-semibold text-lg">Verification: {label[referrer.verificationStatus] ?? referrer.verificationStatus}</h2>
          <p className="job-section-sub">
            {referrer.verificationStatus === 'VERIFIED'
              ? `Verified${referrer.verificationExpiresAt ? ` until ${formatWhen(referrer.verificationExpiresAt)}` : ''}. Employment reviewed by JobAppy. This does not imply employer endorsement or eligibility to refer every role; you still decide case by case.`
              : referrer.verificationStatus === 'SUSPENDED' || referrer.verificationStatus === 'REJECTED'
                ? 'You cannot review requests. Contact hello@evolw.in if you think this is wrong.'
                : 'Confirm your personal email, then an admin reviews your employment. No corporate mailbox is required. Email confirmation alone does not verify employment.'}
          </p>
        </div>
        {!referrer.contactEmailVerifiedAt && !['SUSPENDED', 'REJECTED'].includes(referrer.verificationStatus) && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onSend} disabled={busy !== null}>
            {busy === 'verify' ? 'Sending…' : referrer.emailVerificationPending ? 'Resend confirmation email' : 'Send confirmation email'}
          </button>
        )}
      </div>
    </section>
  )
}

function Dashboard({ data, busy, onAvailability, openId, setOpenId }: { data: ReferrerPortalData; busy: string | null; onAvailability: (body: Record<string, unknown>) => void; openId: string | null; setOpenId: (id: string | null) => void }) {
  const r = data.referrer!
  const counts = data.counts!
  const [caps, setCaps] = useState({ maxActiveRequests: r.maxActiveRequests, maxMonthlyRequests: r.maxMonthlyRequests })
  const [filter, setFilter] = useState('active')
  const assignments = (data.assignments ?? []).filter((a) => filter === 'all' || (filter === 'active' ? ['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(a.status) : a.status === filter))
  const statusLabel: Record<string, string> = { PENDING: 'Awaiting your review', CLARIFICATION: 'Waiting for the candidate', ACCEPTED: 'Accepted · submit and mark done', SUBMITTED: 'Referral submitted', DECLINED: 'Declined', EXPIRED: 'Timed out', CANCELLED: 'Cancelled' }
  return (
    <>
      <section className="referrer-stats" aria-label="Dashboard">
        <div className="admin-card">
          <div className="job-section-sub">Pending reviews</div>
          <div className="referrer-stat">{counts.pending}</div>
        </div>
        <div className="admin-card">
          <div className="job-section-sub">Awaiting candidate</div>
          <div className="referrer-stat">{counts.awaiting}</div>
        </div>
        <div className="admin-card">
          <div className="job-section-sub">Accepted, to submit</div>
          <div className="referrer-stat">{counts.accepted}</div>
        </div>
        <div className="admin-card">
          <div className="job-section-sub">Completed</div>
          <div className="referrer-stat">{counts.completed}</div>
        </div>
        <div className="admin-card">
          <div className="job-section-sub">Capacity</div>
          <div className="referrer-stat">
            {counts.activeLoad}/{r.maxActiveRequests} <span className="job-section-sub">open</span>
          </div>
          <div className="job-section-sub">
            {counts.monthlyLoad}/{r.maxMonthlyRequests} this month
          </div>
        </div>
        <div className="admin-card">
          <div className="job-section-sub">Availability</div>
          <div className="referrer-stat">{r.availability === 'available' ? 'Available' : 'Paused'}</div>
          {r.active ? (
            <button type="button" className="btn btn-ghost btn-sm mt-2" disabled={busy !== null} onClick={() => onAvailability({ availability: r.availability === 'available' ? 'paused' : 'available' })}>
              {r.availability === 'available' ? 'Pause' : 'Set available'}
            </button>
          ) : (
            <span className="job-section-sub">Available after verification</span>
          )}
        </div>
      </section>
      <details className="admin-details">
        <summary>Capacity settings</summary>
        <form
          className="referrer-caps"
          onSubmit={(e) => {
            e.preventDefault()
            onAvailability(caps)
          }}
        >
          <label className="admin-field">
            <span>Open at once</span>
            <input className="input-field" type="number" min={1} max={10} value={caps.maxActiveRequests} onChange={(e) => setCaps({ ...caps, maxActiveRequests: Number(e.target.value) })} />
          </label>
          <label className="admin-field">
            <span>Per month</span>
            <input className="input-field" type="number" min={1} max={40} value={caps.maxMonthlyRequests} onChange={(e) => setCaps({ ...caps, maxMonthlyRequests: Number(e.target.value) })} />
          </label>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy !== null}>
            Save
          </button>
        </form>
      </details>
      <section aria-label="Assigned requests">
        <h2 className="font-semibold text-lg mt-4">Requests assigned to you</h2>
        <div className="referral-toolbar" role="group" aria-label="Filter assignments">
          {[['active', 'Active'], ['PENDING', 'Needs your review'], ['ACCEPTED', 'Ready to submit'], ['all', 'All requests']].map(([value, label]) => <button key={value} type="button" className="btn btn-ghost btn-sm" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        {data.assignments!.length === 0 && <p className="job-section-sub">Nothing assigned yet. Requests arrive when a prepared candidate asks for a referral at {r.companyName} in a role family and location you support.</p>}
        <ul className="referral-cards">
          {assignments.length === 0 && data.assignments!.length > 0 && <li className="referral-empty">No requests in this view. Choose All requests to see your history.</li>}
          {assignments.map((a) => (
            <li key={a.id} className={`referral-card ${openId === a.id ? 'is-open' : ''}`}>
              <button type="button" disabled={busy !== null} className="referral-card-main" onClick={() => setOpenId(openId === a.id ? null : a.id)} aria-expanded={openId === a.id}>
                <div>
                  <div className="font-semibold">{a.job.title}</div>
                  <div className="text-sm">{a.job.location ?? ''}</div>
                </div>
                <div className="referral-card-meta">
                  <span className={`referral-stage-pill is-${a.status.toLowerCase()}`}>{statusLabel[a.status] ?? a.status}</span>
                  <span className="job-section-sub">
                    Assigned {formatWhen(a.assignedAt)}
                    {a.expiresAt && a.status === 'PENDING' ? ` · answer by ${formatWhen(a.expiresAt)}` : ''}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function AssignmentReview({ assignment: a, referrer, busy, onAction, onClose }: { assignment: ReferrerAssignmentDto; referrer: ReferrerSelfDto; busy: string | null; onAction: (body: Record<string, unknown>) => Promise<boolean>; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [declineReason, setDeclineReason] = useState<string>('')
  const [declineNote, setDeclineNote] = useState('')
  const [reference, setReference] = useState('')
  const [submitNote, setSubmitNote] = useState('')
  const [share, setShare] = useState<string[]>([])
  const live = ['PENDING', 'CLARIFICATION'].includes(a.status)
  const c = a.candidate
  return (
    <section className="surface referrer-card referrer-review" aria-label="Candidate review">
      <div className="referrer-verify-row">
        <h2 className="font-semibold text-lg">
          {a.job.title} · {a.job.company}
        </h2>
        <button type="button" className="btn btn-link btn-sm" disabled={busy !== null} onClick={onClose}>
          Close
        </button>
      </div>
      <p className="job-section-sub">
        {a.job.location ?? ''}
        {a.job.applyUrl ? (
          <>
            {' · '}
            <a href={a.job.applyUrl} target="_blank" rel="noopener noreferrer">
              official listing
            </a>
          </>
        ) : null}
        {a.job.expired ? ' · the opening has closed' : ''}
        {a.learnerAlreadyApplied ? ' · the candidate’s tracker shows an application for this job' : ''}
      </p>
      {!c && <p className="job-section-sub">The candidate package is available only while a request is with you.</p>}
      {c && (
        <div className="referrer-candidate">
          <div className="admin-grid-2">
            <div>
              <h3 className="font-semibold">Candidate</h3>
              <p>
                <strong>{c.name ?? 'Name on resume'}</strong>
                {c.headline ? ` · ${c.headline}` : ''}
              </p>
              {c.summary && <p className="text-sm">{c.summary}</p>}
              <p className="text-sm">
                <strong>Skills:</strong> {c.skills.join(', ') || 'none listed'}
              </p>
              {c.employment.map((e, i) => (
                <div key={i} className="text-sm">
                  <strong>{e.title ?? 'Role'}</strong>
                  {e.company ? ` at ${e.company}` : ''}
                  {e.period ? ` (${e.period})` : ''}
                  {e.bullets.length > 0 && (
                    <ul className="list-disc ml-5">
                      {e.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {c.projects.length > 0 && (
                <p className="text-sm">
                  <strong>Projects:</strong> {c.projects.map((p) => [p.name, p.description].filter(Boolean).join(': ')).join(' · ')}
                </p>
              )}
              {c.education.length > 0 && (
                <p className="text-sm">
                  <strong>Education:</strong> {c.education.join(' · ')}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Introduction</h3>
              {c.introduction && <p className="text-sm">{c.introduction}</p>}
              <p className="text-sm">
                <strong>Why this role:</strong> {c.whyRole}
              </p>
              {c.relevantExperience && (
                <p className="text-sm">
                  <strong>Relevant experience:</strong> {c.relevantExperience}
                </p>
              )}
              {a.readiness && (
                <div className={`referral-readiness is-${a.readiness.status.toLowerCase()}`}>
                  <div className="referral-readiness-status">JobAppy readiness: {a.readiness.status.replace('_', ' ')}</div>
                  <p className="text-sm">{a.readiness.summary}</p>
                  {a.readiness.missingEvidence.length > 0 && <p className="text-sm">Important gaps: {a.readiness.missingEvidence.join(', ')}</p>}
                  {a.readiness.curriculumGaps.length > 0 && <p className="text-sm">Curriculum not started: {a.readiness.curriculumGaps.join(', ')}</p>}
                </div>
              )}
              {a.evidence.length > 0 && (
                <ul className="referral-checks">
                  {a.evidence.map((e) => (
                    <li key={e.skill} data-status={e.status === 'demonstrated' ? 'pass' : e.status === 'weak' ? 'warn' : 'fail'}>
                      <span className="referral-check-mark" aria-hidden="true">
                        {e.status === 'demonstrated' ? '✓' : e.status === 'weak' ? '!' : '✕'}
                      </span>
                      <span>
                        <strong>{e.skill}</strong>
                        {e.quote ? `: “${e.quote}”` : ` (${e.status})`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {a.messages.length > 0 && (
        <ul className="referral-thread" aria-label="Messages">
          {a.messages.map((m) => (
            <li key={m.id} data-from={m.from === 'you' ? 'you' : m.from === 'candidate' ? 'referrer' : 'jobappy'}>
              <span className="referral-thread-from">{m.from === 'you' ? 'You' : m.from === 'candidate' ? 'Candidate' : 'JobAppy'}</span>
              <p>{m.body}</p>
              <span className="job-section-sub">{formatWhen(m.at)}</span>
            </li>
          ))}
        </ul>
      )}
      {live && (
        <div className="referrer-decision">
          <div className="referral-actions">
            <button type="button" className="btn btn-primary" disabled={busy !== null || a.job.expired || !referrer.active} onClick={() => onAction({ action: 'accept' })}>
              Accept
            </button>
          </div>
          <div className="referral-reply">
            <textarea className="input-field" rows={2} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask the candidate for clarification (through JobAppy)" aria-label="Clarification" />
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || message.trim().length < 2} onClick={async () => { if (await onAction({ action: 'clarify', message })) setMessage('') }}>
              Request clarification
            </button>
          </div>
          <div className="referrer-decline">
            <select className="input-field" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} aria-label="Decline reason">
              <option value="">Decline: choose a reason</option>
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {DECLINE_REASON_LABELS[r]}
                </option>
              ))}
            </select>
            <input className="input-field" value={declineNote} maxLength={300} onChange={(e) => setDeclineNote(e.target.value)} placeholder="Optional note (kept internal)" aria-label="Decline note" />
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || !declineReason} onClick={() => onAction({ action: 'decline', reason: declineReason, note: declineNote })}>
              Decline
            </button>
          </div>
          <p className="job-section-sub">Declining never counts against you. The candidate is told only that matching continues.</p>
        </div>
      )}
      {a.status === 'ACCEPTED' && (
        <div className="referrer-decision">
          <p className="text-sm">Submit the referral through your employer’s official process, then mark it here. No screenshots or confidential details are needed.</p>
          <div className="referrer-submit">
            <input className="input-field" value={reference} maxLength={80} onChange={(e) => setReference(e.target.value)} placeholder="Optional requisition or reference id" aria-label="Reference" />
            <input className="input-field" value={submitNote} maxLength={300} onChange={(e) => setSubmitNote(e.target.value)} placeholder="Optional note" aria-label="Note" />
            <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => onAction({ action: 'submitted', reference, note: submitNote })}>
              Mark referral submitted
            </button>
          </div>
          <div className="referral-reply">
            <textarea className="input-field" rows={2} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message the candidate (through JobAppy)" aria-label="Message" />
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || message.trim().length < 2} onClick={async () => { if (await onAction({ action: 'message', message })) setMessage('') }}>
              Send
            </button>
          </div>
        </div>
      )}
      {['ACCEPTED', 'SUBMITTED'].includes(a.status) && (
        <details className="admin-details">
          <summary>Share your identity with this candidate (optional)</summary>
          <p className="job-section-sub">Nothing is revealed unless you choose it here. Every disclosure is logged. Already shared: {a.disclosedFields.length ? a.disclosedFields.join(', ') : 'nothing'}.</p>
          <div className="admin-check-grid">
            {(['fullName', 'title', 'profileUrl'] as const).map((f) => (
              <label key={f} className="admin-check">
                <input type="checkbox" checked={share.includes(f)} disabled={f === 'profileUrl' && !referrer.profileUrlShareable} onChange={(e) => setShare(e.target.checked ? [...share, f] : share.filter((x) => x !== f))} /> <span>{f === 'fullName' ? 'My name' : f === 'title' ? 'My title' : 'My profile link'}</span>
              </label>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || !share.length} onClick={() => onAction({ action: 'disclose', fields: share })}>
            Share selected
          </button>
        </details>
      )}
    </section>
  )
}
