import { useEffect, useState } from 'react'
import LockedFeature from '../LockedFeature'
import { ApiError } from '../../lib/adminClient'
import { CONTACT_TYPES, contactCategories, linkedInSearches, MESSAGE_TYPES, type Draft, type DraftGrounding, type MessageType } from '../../lib/jobs/networking'
import { createOutreach, deleteOutreach, fetchOutreach, requestDrafts, updateOutreach } from '../../lib/jobs/prepClient'
import type { JobDto } from '../../lib/jobs/types'
import type { ResumeProfile } from '../../lib/resume/extract'
import type { OutreachContactDto } from '../../lib/server/outreach'
import { OUTREACH_STATUSES } from '../../lib/db/schema'

interface Props {
  job: JobDto
  signedIn: boolean
  can: (feature: string) => boolean
  /** Resume profile when available on the client (only for alumni search queries). */
  profile: ResumeProfile | null
  onSignIn: () => void
  onUpgrade: () => void
  onOutreachChanged?: (contacts: OutreachContactDto[]) => void
}

const STATUS_LABEL: Record<string, string> = {
  not_contacted: 'Not contacted',
  connection_sent: 'Connection sent',
  connected: 'Connected',
  referral_requested: 'Referral requested',
  referral_received: 'Referral received',
  recruiter_replied: 'Recruiter replied',
  no_response: 'No response',
  follow_up_due: 'Follow-up due',
  closed: 'Closed',
}

const todayKey = () => new Date().toISOString().slice(0, 10)

/** Networking & Referrals: who to look for, how to search, grounded drafts and the learner's own outreach log. Nothing is sent or scraped. */
export default function NetworkingTab({ job, signedIn, can, profile, onSignIn, onUpgrade, onOutreachChanged }: Props) {
  const categories = contactCategories(job)
  const searches = linkedInSearches(job, profile)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<MessageType[]>(['connection'])
  const [drafts, setDrafts] = useState<{ drafts: Draft[]; grounding: DraftGrounding; usage: { used: number; limit: number }; resumeUsed: { title: string } | null } | null>(null)
  const [draftState, setDraftState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null })
  const [contacts, setContacts] = useState<OutreachContactDto[] | null>(null)
  const [contactError, setContactError] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; role: string; contactType: string; profileUrl: string; messageType: string; status: string; contactedAt: string; followUpDate: string; notes: string; draft: string } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const trackerAllowed = signedIn && can('jobs.outreachTracker')

  useEffect(() => {
    if (!trackerAllowed) {
      setContacts(null)
      return
    }
    let cancelled = false
    fetchOutreach(job.id)
      .then((c) => {
        if (!cancelled) {
          setContacts(c)
          onOutreachChanged?.(c)
        }
      })
      .catch((err) => {
        if (!cancelled) setContactError(err instanceof Error ? err.message : 'Could not load contacts')
      })
    return () => {
      cancelled = true
    }
  }, [job.id, trackerAllowed, onOutreachChanged])

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
    } catch {
      setCopied(null)
    }
  }

  const generate = async () => {
    setDraftState({ busy: true, error: null })
    try {
      setDrafts(await requestDrafts(job.id, selectedTypes))
      setDraftState({ busy: false, error: null })
    } catch (err) {
      setDraftState({ busy: false, error: err instanceof ApiError ? err.message : 'Could not generate drafts' })
    }
  }

  const refresh = async () => {
    const next = await fetchOutreach(job.id)
    setContacts(next)
    onOutreachChanged?.(next)
  }

  const saveContact = async () => {
    if (!form) return
    setBusy('save')
    setContactError(null)
    try {
      await createOutreach(job.id, { ...form, role: form.role || null, profileUrl: form.profileUrl || null, messageType: (form.messageType || null) as MessageType | null, contactedAt: form.contactedAt || null, followUpDate: form.followUpDate || null, notes: form.notes || null, draft: form.draft || null, contactType: form.contactType as OutreachContactDto['contactType'], status: form.status as OutreachContactDto['status'] })
      setForm(null)
      await refresh()
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Could not save the contact')
    } finally {
      setBusy(null)
    }
  }

  const patch = async (c: OutreachContactDto, p: Partial<OutreachContactDto>) => {
    setBusy(c.id)
    setContactError(null)
    try {
      await updateOutreach(job.id, c.id, p as Parameters<typeof updateOutreach>[2])
      await refresh()
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Could not update the contact')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (c: OutreachContactDto) => {
    if (!window.confirm(`Remove ${c.name} from your outreach log?`)) return
    setBusy(c.id)
    try {
      await deleteOutreach(job.id, c.id)
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const saveDraftAsContact = (d: Draft) => {
    setForm({ name: '', role: '', contactType: d.type === 'recruiter' ? 'recruiter' : d.type === 'hiring_manager' ? 'hiring_manager' : 'engineer', profileUrl: '', messageType: d.type, status: 'not_contacted', contactedAt: '', followUpDate: '', notes: '', draft: d.body })
    document.getElementById('outreach-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="job-section" aria-labelledby="net-who">
        <h3 id="net-who" className="job-section-title">
          Who should I contact?
        </h3>
        <p className="job-section-sub">Categories of people worth reaching, and why. JobAppy never identifies or contacts individuals; you find them, decide, and send.</p>
        <div className="net-cats">
          {categories.map((c) => (
            <div key={c.type} className="net-cat">
              <div className="net-cat-title">{c.title}</div>
              <p className="net-cat-why">{c.why}</p>
              <p className="net-cat-how">{c.howToFind}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="job-section" aria-labelledby="net-search">
        <h3 id="net-search" className="job-section-title">
          LinkedIn search guidance
        </h3>
        <p className="job-section-sub">Copy a query into LinkedIn people search or open the search page. Results are what LinkedIn shows you; nothing is fetched here.</p>
        <ul className="net-searches">
          {searches.map((s) => (
            <li key={s.label} className="net-search">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-muted-foreground">
                  {s.label} · <span className="font-normal">{s.basis}</span>
                </div>
                <code className="net-query">{s.query}</code>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(s.label, s.query)} aria-label={`Copy query ${s.label}`}>
                  {copied === s.label ? 'Copied' : 'Copy'}
                </button>
                <a className="btn btn-ghost btn-sm" href={s.url} target="_blank" rel="noreferrer noopener">
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="job-section" aria-labelledby="net-drafts">
        <h3 id="net-drafts" className="job-section-title">
          Outreach message drafts <span className="job-personal-label">Grounded in your resume</span>
        </h3>
        {!signedIn ? (
          <LockedFeature title="Message drafts" description="Sign in to generate drafts grounded in your own resume and this listing." onSignIn={onSignIn} signedIn={false} compact />
        ) : (
          <>
            <p className="job-section-sub">Every draft uses only facts from your resume and the listing; the contact name stays a placeholder. Review, edit and send manually.</p>
            <div className="pref-chips mt-3" role="group" aria-label="Message types">
              {MESSAGE_TYPES.map((m) => {
                const lockedType = !m.free && !can('jobs.referrals')
                const on = selectedTypes.includes(m.id)
                return (
                  <button key={m.id} type="button" className="pref-chip" aria-pressed={on} disabled={lockedType} title={lockedType ? 'Part of Prep Pro' : undefined} onClick={() => setSelectedTypes((t) => (on ? t.filter((x) => x !== m.id) : [...t, m.id]))}>
                    {m.label}
                    {lockedType ? ' · Pro' : ''}
                  </button>
                )
              })}
            </div>
            {!can('jobs.referrals') && (
              <div className="mt-3">
                <LockedFeature title="Personalised referral drafts" description="Referral, hiring-manager, follow-up and thank-you drafts grounded in your resume, plus a higher daily draft allowance." onUpgrade={onUpgrade} signedIn compact />
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary btn-sm" onClick={generate} disabled={draftState.busy || !selectedTypes.length}>
                {draftState.busy ? 'Generating…' : 'Generate drafts'}
              </button>
              {drafts && <span className="text-xs text-muted-foreground">Drafts today: {drafts.usage.used} of {drafts.usage.limit}{drafts.resumeUsed ? ` · using “${drafts.resumeUsed.title}”` : ' · no resume uploaded, so no experience is claimed'}</span>}
            </div>
            {draftState.error && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {draftState.error}
              </p>
            )}
            {drafts && (
              <div className="flex flex-col gap-3 mt-4">
                {drafts.drafts.map((d) => (
                  <div key={d.type} className="draft">
                    <div className="draft-head">
                      <strong>{MESSAGE_TYPES.find((m) => m.id === d.type)?.label}</strong>
                      <span className="text-xs text-muted-foreground">{d.characterCount} characters</span>
                    </div>
                    {d.subject && <div className="text-sm">Subject: {d.subject}</div>}
                    <pre className="draft-body">{d.body}</pre>
                    {d.refined && (
                      <details className="admin-details">
                        <summary>AI-polished wording · same facts and placeholders · {d.refined.provider}</summary>
                        <pre className="draft-refined">{d.refined.text}</pre>
                      </details>
                    )}
                    <div className="draft-facts">
                      Facts used: {d.usedFacts.map((f) => `${f.fact} (${f.source === 'resume' ? 'your resume' : f.source === 'job' ? 'job listing' : 'you'})`).join(' · ')}
                      {d.placeholders.length > 0 && <> · Fill in: {d.placeholders.join(', ')}</>}
                    </div>
                    <div className="suggestion-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(d.type, d.body)} aria-label={`Copy ${d.type} draft`}>
                        {copied === d.type ? 'Copied' : 'Copy draft'}
                      </button>
                      {trackerAllowed && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveDraftAsContact(d)}>
                          Save with a contact
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="job-section" aria-labelledby="net-tracker">
        <h3 id="net-tracker" className="job-section-title">
          Outreach log for this job
        </h3>
        {!signedIn ? (
          <LockedFeature title="Outreach tracker" description="Log the people you contacted, statuses, notes and follow-up dates for this job." onSignIn={onSignIn} signedIn={false} compact />
        ) : !can('jobs.outreachTracker') ? (
          <LockedFeature title="Outreach tracker" description="Log the people you contacted, statuses, notes and follow-up dates for this job." onUpgrade={onUpgrade} signedIn compact />
        ) : (
          <>
            <p className="job-section-sub">Only what you type is stored. Names and profile links come from you, never from JobAppy.</p>
            {contactError && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {contactError}
              </p>
            )}
            <div className="mt-3">
              {!form && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setForm({ name: '', role: '', contactType: 'recruiter', profileUrl: '', messageType: '', status: 'not_contacted', contactedAt: '', followUpDate: '', notes: '', draft: '' })}>
                  Add contact
                </button>
              )}
            </div>
            {form && (
              <form
                id="outreach-form"
                className="admin-form mt-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  void saveContact()
                }}
              >
                <div className="admin-grid-2">
                  <label className="admin-field">
                    <span>Contact name</span>
                    <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </label>
                  <label className="admin-field">
                    <span>Their role (as shown on their profile)</span>
                    <input className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                  </label>
                </div>
                <div className="admin-grid-2">
                  <label className="admin-field">
                    <span>Contact type</span>
                    <select className="input-field" value={form.contactType} onChange={(e) => setForm({ ...form, contactType: e.target.value })}>
                      {CONTACT_TYPES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Profile URL (entered by you)</span>
                    <input className="input-field" value={form.profileUrl} onChange={(e) => setForm({ ...form, profileUrl: e.target.value })} placeholder="https://www.linkedin.com/in/…" />
                  </label>
                </div>
                <div className="admin-grid-4">
                  <label className="admin-field">
                    <span>Message type</span>
                    <select className="input-field" value={form.messageType} onChange={(e) => setForm({ ...form, messageType: e.target.value })}>
                      <option value="">Not sent yet</option>
                      {MESSAGE_TYPES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Status</span>
                    <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {OUTREACH_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Date contacted</span>
                    <input className="input-field" type="date" value={form.contactedAt} onChange={(e) => setForm({ ...form, contactedAt: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>Follow-up date</span>
                    <input className="input-field" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                  </label>
                </div>
                <label className="admin-field">
                  <span>Notes</span>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </label>
                {form.draft && (
                  <label className="admin-field">
                    <span>Saved draft</span>
                    <textarea className="input-field" rows={4} value={form.draft} onChange={(e) => setForm({ ...form, draft: e.target.value })} />
                  </label>
                )}
                <div className="admin-form-footer">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={busy === 'save'}>
                    {busy === 'save' ? 'Saving…' : 'Save contact'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {contacts && contacts.length > 0 && (
              <div className="admin-table-wrap mt-4">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Contacted</th>
                      <th>Follow-up</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.role || '—'}
                            {c.profileUrl && (
                              <>
                                {' · '}
                                <a href={c.profileUrl} target="_blank" rel="noreferrer noopener" className="underline">
                                  profile
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                        <td>{CONTACT_TYPES.find((t) => t.id === c.contactType)?.label}</td>
                        <td>
                          <select className="input-field" aria-label={`Status for ${c.name}`} value={c.status} disabled={busy === c.id} onChange={(e) => void patch(c, { status: e.target.value as OutreachContactDto['status'], contactedAt: c.contactedAt || (e.target.value !== 'not_contacted' ? todayKey() : null) })}>
                            {OUTREACH_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="whitespace-nowrap">{c.contactedAt || '—'}</td>
                        <td>
                          <input className="input-field" type="date" aria-label={`Follow-up date for ${c.name}`} value={c.followUpDate || ''} disabled={busy === c.id} onChange={(e) => void patch(c, { followUpDate: e.target.value || null })} />
                        </td>
                        <td className="text-muted-foreground text-xs max-w-[200px]">
                          {c.notes || '—'}
                          {c.draft && (
                            <details>
                              <summary className="cursor-pointer">draft</summary>
                              <pre className="admin-pre">{c.draft}</pre>
                            </details>
                          )}
                        </td>
                        <td>
                          <button type="button" className="btn btn-link btn-sm text-destructive" onClick={() => void remove(c)} aria-label={`Remove ${c.name}`}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {contacts && contacts.length === 0 && !form && <p className="text-sm mt-3 text-muted-foreground">No contacts logged for this job yet.</p>}
          </>
        )}
      </section>
    </div>
  )
}
