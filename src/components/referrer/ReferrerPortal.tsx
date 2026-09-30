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
        inviteToken ? (
          <section className="surface referrer-card">
            <h2 className="font-semibold text-lg">Accept your invitation</h2>
            <p className="job-section-sub">This creates your referrer profile for the company selected in your JobAppy invitation. Use the personal email that received this invitation. Confirming it proves mailbox ownership; an admin separately reviews your employment. No work email is required.</p>
            <button type="button" className="btn btn-primary mt-3" disabled={busy !== null} onClick={() => run('accept', async () => { await referrerSelfAction({ action: 'accept_invite', token: inviteToken }); window.history.replaceState(null, '', '/referrer'); setNotice('Invitation accepted. Complete your profile below.'); load() })}>
              {busy === 'accept' ? 'Accepting…' : 'Accept invitation'}
            </button>
            <p className="referral-trust">{TRUST_LINE}</p>
          </section>
        ) : (
          <ReferrerApplicationForm
            companies={data.companies ?? []}
            busy={busy}
            onSubmit={(body) =>
              run('apply', async () => {
                await referrerSelfAction({ action: 'apply', ...body })
                setNotice('Application submitted! Your referrer profile is created. Next: confirm your personal email below, then start using your LinkedIn Referral Filter Kit.')
                load()
              })
            }
          />
        )
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
  const [copyStatus, setCopyStatus] = useState('')
  const assignments = (data.assignments ?? []).filter((a) => filter === 'all' || (filter === 'active' ? ['PENDING', 'CLARIFICATION', 'ACCEPTED'].includes(a.status) : a.status === filter))
  const statusLabel: Record<string, string> = { PENDING: 'Awaiting your review', CLARIFICATION: 'Waiting for the candidate', ACCEPTED: 'Accepted · submit and mark done', SUBMITTED: 'Referral submitted', DECLINED: 'Declined', EXPIRED: 'Timed out', CANCELLED: 'Cancelled' }
  const screeningUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/app?view=jobs&company=${encodeURIComponent(r.companyName)}&ref=${r.publicId}`
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

      {/* LinkedIn Inbound Filter Kit */}
      <section className="surface referrer-card" style={{ border: '1px solid hsl(var(--primary) / 0.3)', background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--card)) 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
              ⚡ LinkedIn Referral Inbound Filter Kit
            </div>
            <h3 className="font-semibold text-lg" style={{ marginTop: '0.3rem' }}>
              Turn Cold LinkedIn DMs into Pre-Vetted Referrals
            </h3>
            <p className="job-section-sub">
              Stop sifting through 50+ messy PDFs in your DMs. Put your personal vetting link in your LinkedIn bio or use our 1-click auto-reply so candidates are pre-screened with ATS & technical checks before reaching you.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <input
            className="input-field"
            style={{ flex: '1 1 320px', fontSize: '0.82rem' }}
            readOnly
            value={screeningUrl}
            aria-label="Your personal screening link"
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              navigator.clipboard.writeText(screeningUrl)
              setCopyStatus('Screening link copied!')
              setTimeout(() => setCopyStatus(''), 2500)
            }}
          >
            {copyStatus === 'Screening link copied!' ? '✓ Copied' : 'Copy Screening Link'}
          </button>
          {copyStatus && <span style={{ fontSize: '0.75rem', color: 'hsl(142 60% 35%)', fontWeight: 600 }}>{copyStatus}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginTop: '0.9rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border) / 0.6)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💼 LinkedIn Bio Line</span>
              <button
                type="button"
                className="btn btn-link btn-sm"
                style={{ padding: 0 }}
                onClick={() => {
                  navigator.clipboard.writeText(`${r.title || 'Engineer'} @ ${r.companyName} | Open to refer qualified candidates: ${screeningUrl}`)
                  setCopyStatus('Bio line copied!')
                  setTimeout(() => setCopyStatus(''), 2500)
                }}
              >
                Copy
              </button>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.35rem', lineHeight: 1.4 }}>
              "{r.title || 'Engineer'} @ {r.companyName} | Open to refer qualified candidates: [Your Link]"
            </p>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border) / 0.6)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💬 LinkedIn DM Auto-Reply</span>
              <button
                type="button"
                className="btn btn-link btn-sm"
                style={{ padding: 0 }}
                onClick={() => {
                  navigator.clipboard.writeText(`Hi! I'm happy to refer candidates who meet our team's bar. To ensure high callback rates, I only review pre-screened profiles. Please check your role readiness and submit here: ${screeningUrl} — once you pass the ATS check, I'll review and submit your internal endorsement!`)
                  setCopyStatus('DM reply copied!')
                  setTimeout(() => setCopyStatus(''), 2500)
                }}
              >
                Copy
              </button>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.35rem', lineHeight: 1.4 }}>
              "Hi! I'm happy to refer candidates who meet our team's bar. Please check your readiness and submit here: [Link]..."
            </p>
          </div>
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

function ReferrerApplicationForm({
  companies,
  busy,
  onSubmit,
}: {
  companies: { id: string; name: string; slug: string }[]
  busy: string | null
  onSubmit: (body: Record<string, unknown>) => void
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [customCompanyName, setCustomCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [roleFamilies, setRoleFamilies] = useState<string[]>(['software-engineer', 'backend'])
  const [experienceBand, setExperienceBand] = useState('mid')
  const [location, setLocation] = useState('Bengaluru, India')
  const [profileUrl, setProfileUrl] = useState('')
  const [policyAcknowledged, setPolicyAcknowledged] = useState(true)
  const [privacyConsent, setPrivacyConsent] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const compParam = sp.get('company')
      if (compParam) {
        const found = companies.find(
          (c) => c.name.toLowerCase() === compParam.toLowerCase() || c.slug === compParam.toLowerCase()
        )
        if (found) setSelectedCompanyId(found.id)
        else setCustomCompanyName(compParam)
      }
    }
  }, [companies])

  const toggleRoleFamily = (id: string) => {
    setRoleFamilies((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      companyId: selectedCompanyId || undefined,
      companyName: !selectedCompanyId && customCompanyName ? customCompanyName : undefined,
      fullName,
      title,
      roleFamilies,
      experienceBand,
      location,
      profileUrl: profileUrl.trim() || undefined,
      policyAcknowledged,
      privacyConsent,
    })
  }

  return (
    <section className="surface referrer-card">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
        🛡️ Verified Employee Application
      </div>
      <h2 className="font-semibold text-xl" style={{ marginTop: '0.25rem' }}>Join the Verified Referrer Network</h2>
      <p className="job-section-sub">
        Help ambitious candidates land roles through employee referrals, pre-screen candidates with automated ATS tests, and claim your internal company referral bonus without drowning in LinkedIn DMs.
      </p>

      {/* 3 Pillar Value Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', margin: '0.75rem 0 1.25rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border) / 0.6)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>💰 Company Bonuses</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
            Earn ₹50,000 to ₹3,00,000+ per engineering hire directly through your employer’s portal.
          </p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border) / 0.6)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>🎯 Zero Resume Spam</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
            Only candidates who pass ATS role-matching and technical readiness checks reach your review.
          </p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border) / 0.6)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>🔒 100% Privacy Protected</div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
            No corporate email needed. Sign in with personal email; your identity stays anonymous.
          </p>
        </div>
      </div>

      <form className="referrer-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.8rem' }}>
          <label className="admin-field">
            <span>Your Company</span>
            <select
              className="input-field"
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value)
                if (e.target.value) setCustomCompanyName('')
              }}
            >
              <option value="">— Select your employer or enter below —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {!selectedCompanyId && (
            <label className="admin-field">
              <span>Or type company name</span>
              <input
                className="input-field"
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                placeholder="e.g. Google, Swiggy, Microsoft"
                required={!selectedCompanyId}
              />
            </label>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
          <label className="admin-field">
            <span>Your Full Name</span>
            <input
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyanshu Sharma"
              required
            />
          </label>

          <label className="admin-field">
            <span>Current Job Title / Role</span>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer / SDE-2"
              required
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
          <label className="admin-field">
            <span>Experience Level</span>
            <select
              className="input-field"
              value={experienceBand}
              onChange={(e) => setExperienceBand(e.target.value)}
            >
              <option value="junior">Junior (0 – 2 years)</option>
              <option value="mid">Mid-level (2 – 5 years)</option>
              <option value="senior">Senior (5 – 8 years)</option>
              <option value="lead">Staff / Lead / Principal (8+ years)</option>
            </select>
          </label>

          <label className="admin-field">
            <span>Location / Base Office</span>
            <input
              className="input-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, India or Remote"
              required
            />
          </label>
        </div>

        <label className="admin-field">
          <span>LinkedIn Profile URL (for rapid employment verification)</span>
          <input
            className="input-field"
            type="url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            required
          />
          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' }}>
            Kept confidential. Our verification team reviews your public profile to confirm company affiliation without needing your corporate email.
          </span>
        </label>

        <div>
          <span className="font-semibold text-sm" style={{ display: 'block', marginBottom: '0.4rem' }}>
            Role categories you can refer
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {ROLE_FAMILY_OPTIONS.map((opt) => {
              const active = roleFamilies.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleRoleFamily(opt.id)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    border: '1px solid',
                    borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    background: active ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--card))',
                    color: active ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {active ? '✓ ' : '+ '}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.4rem' }}>
          <label className="admin-check" style={{ fontSize: '0.78rem' }}>
            <input
              type="checkbox"
              checked={policyAcknowledged}
              onChange={(e) => setPolicyAcknowledged(e.target.checked)}
              required
            />
            <span>
              I will submit qualified candidate referrals directly through my employer's official internal portal according to company referral policy.
            </span>
          </label>
          <label className="admin-check" style={{ fontSize: '0.78rem' }}>
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              required
            />
            <span>
              I understand my identity and email stay private. Candidates only see "Verified Employee @ Company" unless I choose to disclose.
            </span>
          </label>
        </div>

        <div className="referral-actions" style={{ marginTop: '0.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy !== null || (!selectedCompanyId && !customCompanyName) || !fullName.trim() || !title.trim()}
          >
            {busy === 'apply' ? 'Submitting…' : 'Submit Referrer Application'}
          </button>
        </div>
      </form>
    </section>
  )
}
