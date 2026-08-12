import { useEffect, useMemo, useState, type ReactNode } from 'react'
import StatusBadge from './StatusBadge.tsx'
import {
  SAMPLE_EMAILS,
  findMatchingApplication,
  parseJobEmail,
  parsedEmailToDraft,
  type EmailParseResult,
} from './emailParser.ts'
import { type JobApplication, type NewJobApplication, type Status, STATUS_ORDER } from './types'

interface EmailImportProps {
  open: boolean
  applications: JobApplication[]
  onClose: () => void
  onCreate: (data: NewJobApplication) => void
  onUpdate: (id: string, data: Partial<NewJobApplication> & { notes?: string }) => void
}

type DraftFields = {
  company: string
  role: string
  status: Status
  jobUrl: string
  location: string
  appliedDate: string
  notes: string
}

function toDraft(parsed: EmailParseResult): DraftFields {
  return {
    company: parsed.company,
    role: parsed.role,
    status: parsed.status,
    jobUrl: parsed.jobUrl,
    location: parsed.location,
    appliedDate: parsed.appliedDate || '',
    notes: parsed.notes,
  }
}

export default function EmailImport({
  open,
  applications,
  onClose,
  onCreate,
  onUpdate,
}: EmailImportProps) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState<EmailParseResult | null>(null)
  const [draft, setDraft] = useState<DraftFields | null>(null)
  const [mode, setMode] = useState<'create' | 'update'>('create')

  useEffect(() => {
    if (!open) return
    setRaw('')
    setParsed(null)
    setDraft(null)
    setMode('create')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const match = useMemo(() => {
    if (!draft?.company) return undefined
    return findMatchingApplication(applications, draft.company, draft.role)
  }, [applications, draft])

  useEffect(() => {
    if (match) setMode('update')
    else setMode('create')
  }, [match])

  if (!open) return null

  const runParse = (text = raw) => {
    const result = parseJobEmail(text)
    setParsed(result)
    setDraft(toDraft(result))
  }

  const apply = () => {
    if (!draft || !draft.company.trim()) return
    const payload = parsedEmailToDraft({
      ...(parsed || parseJobEmail(raw)),
      company: draft.company.trim(),
      role: draft.role.trim() || 'Role TBD',
      status: draft.status,
      jobUrl: draft.jobUrl.trim(),
      location: draft.location.trim(),
      appliedDate: draft.appliedDate || null,
      notes: draft.notes.trim(),
      source: 'Email paste',
      signals: parsed?.signals || [],
      confidence: parsed?.confidence || 'medium',
    })

    if (mode === 'update' && match) {
      const mergedNotes = [match.notes, payload.notes].filter(Boolean).join('\n\n---\n\n')
      onUpdate(match.id, {
        ...payload,
        notes: mergedNotes,
        // keep existing salary/pin unless status suggests pin
        pinned:
          match.pinned ||
          payload.status === 'Interview' ||
          payload.status === 'Offer' ||
          payload.status === 'HR Round',
      })
    } else {
      onCreate(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-fade">
      <button
        type="button"
        className="absolute inset-0 bg-[hsl(var(--ink)/0.45)] backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl surface animate-slide-up">
        <div className="flex items-start justify-between gap-4 border-b border-border/80 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Email import
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
              Paste a recruiting email
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Detects applied, shortlisted, interview, assessment, offer, or rejection — then creates or
              updates a role.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setRaw(SAMPLE_EMAILS.applied)
                runParse(SAMPLE_EMAILS.applied)
              }}
            >
              Try: Applied
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setRaw(SAMPLE_EMAILS.shortlisted)
                runParse(SAMPLE_EMAILS.shortlisted)
              }}
            >
              Try: Shortlisted
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setRaw(SAMPLE_EMAILS.evolw)
                runParse(SAMPLE_EMAILS.evolw)
              }}
            >
              Try: Evolw
            </button>
          </div>

          <label className="block">
            <span className="label-quiet">
              Email text
            </span>
            <textarea
              className="input-field min-h-[180px] resize-y font-mono text-sm"
              placeholder="Paste the full email including Subject / From if you have them…"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              disabled={raw.trim().length < 20}
              onClick={() => runParse()}
            >
              Extract details
            </button>
          </div>

          {draft && parsed && (
            <div className="space-y-4 rounded-2xl border border-border bg-white/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={draft.status} />
                <span className="text-sm font-medium text-muted-foreground">
                  Confidence: {parsed.confidence}
                </span>
                {parsed.signals.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Company">
                  <input
                    className="input-field"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  />
                </Field>
                <Field label="Role">
                  <input
                    className="input-field"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  />
                </Field>
                <Field label="Status">
                  <select
                    className="input-field"
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Applied date">
                  <input
                    type="date"
                    className="input-field"
                    value={draft.appliedDate}
                    onChange={(e) => setDraft({ ...draft, appliedDate: e.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <input
                    className="input-field"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  />
                </Field>
                <Field label="Job URL">
                  <input
                    className="input-field"
                    value={draft.jobUrl}
                    onChange={(e) => setDraft({ ...draft, jobUrl: e.target.value })}
                  />
                </Field>
                <Field label="Notes" className="sm:col-span-2">
                  <textarea
                    rows={4}
                    className="input-field resize-y"
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  />
                </Field>
              </div>

              {match ? (
                <div className="rounded-xl border border-primary/20 bg-accent/60 p-3 text-sm">
                  <p className="font-semibold">Matching application found</p>
                  <p className="text-muted-foreground">
                    {match.company} — {match.role} (currently {match.status})
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn text-xs ${mode === 'update' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setMode('update')}
                    >
                      Update existing
                    </button>
                    <button
                      type="button"
                      className={`btn text-xs ${mode === 'create' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setMode('create')}
                    >
                      Create new instead
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No existing match — this will create a new application.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!draft.company.trim()}
                  onClick={apply}
                >
                  {mode === 'update' && match ? 'Update from email' : 'Add from email'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-quiet">{label}</span>
      {children}
    </label>
  )
}
