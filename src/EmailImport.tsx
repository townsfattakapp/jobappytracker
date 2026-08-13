import { useEffect, useMemo, useState, type ReactNode } from 'react'
import StatusBadge from './StatusBadge.tsx'
import {
  SAMPLE_EMAILS,
  findMatchingApplication,
  parseJobEmail,
  parsedEmailToDraft,
  type EmailParseResult,
} from './emailParser.ts'
import {
  getGroqApiKey,
  hasGroqApiKey,
  parseJobEmailWithGroq,
  setGroqApiKey,
} from './lib/groqEmail.ts'
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
  const [aiBusy, setAiBusy] = useState(false)
  const [groqKey, setGroqKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRaw('')
    setParsed(null)
    setDraft(null)
    setMode('create')
    setError(null)
    setAiBusy(false)
    const existing = getGroqApiKey()
    setGroqKey(existing)
    setShowKey(!existing)
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
    setError(null)
    const result = parseJobEmail(text)
    setParsed(result)
    setDraft(toDraft(result))
  }

  const runAiParse = async (text = raw) => {
    setError(null)
    if (!hasGroqApiKey() && !groqKey.trim()) {
      setShowKey(true)
      setError('Add your free Groq API key to use AI analysis')
      return
    }
    if (groqKey.trim()) setGroqApiKey(groqKey.trim())

    setAiBusy(true)
    try {
      const result = await parseJobEmailWithGroq(text)
      setParsed(result)
      setDraft(toDraft(result))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI analysis failed'
      setError(message)
      // Still show rule-based fallback so the user isn't stuck
      const fallback = parseJobEmail(text)
      setParsed({
        ...fallback,
        signals: [...fallback.signals, 'ai-fallback'],
        confidence: 'low',
      })
      setDraft(toDraft(fallback))
    } finally {
      setAiBusy(false)
    }
  }

  const saveKey = () => {
    setGroqApiKey(groqKey)
    setShowKey(false)
    setError(null)
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
      source: parsed?.source || 'Email paste',
      signals: parsed?.signals || [],
      confidence: parsed?.confidence || 'medium',
    })

    if (mode === 'update' && match) {
      const mergedNotes = [match.notes, payload.notes].filter(Boolean).join('\n\n---\n\n')
      onUpdate(match.id, {
        ...payload,
        notes: mergedNotes,
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center animate-fade">
      <button
        type="button"
        className="absolute inset-0 bg-[hsl(var(--ink)/0.5)] backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 flex flex-col w-full h-[95dvh] rounded-t-3xl sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl surface animate-slide-up bg-[hsl(var(--card))] overflow-hidden shadow-lg border border-border">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/80 px-5 pt-5 sm:px-6 sm:pt-6 pb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email import</p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
              Paste a recruiting email
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use quick extract or Groq AI for better company, role, and status detection.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 sm:px-6 py-5 custom-scrollbar pb-24">
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
                void runAiParse(SAMPLE_EMAILS.evolw)
              }}
            >
              Try: Evolw (AI)
            </button>
          </div>

          <label className="block">
            <span className="label-quiet">Email text</span>
            <textarea
              className="input-field min-h-[180px] resize-y font-mono text-sm"
              placeholder="Paste the full email including Subject / From if you have them…"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </label>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Groq AI</p>
                <p className="text-xs text-muted-foreground">
                  Free key from console.groq.com — stored only in this browser
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? 'Hide key' : hasGroqApiKey() || groqKey ? 'Edit key' : 'Add key'}
              </button>
            </div>
            {showKey ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className="input-field font-mono text-sm"
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  autoComplete="off"
                />
                <button type="button" className="btn btn-ghost" onClick={saveKey}>
                  Save key
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={raw.trim().length < 20 || aiBusy}
              onClick={() => runParse()}
            >
              Quick extract
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={raw.trim().length < 20 || aiBusy}
              onClick={() => void runAiParse()}
            >
              {aiBusy ? 'Analyzing…' : 'Analyze with Groq AI'}
            </button>
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          {draft && parsed && (
            <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
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
            </div>
          )}
        </div>

        {draft && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-4 border-t border-border flex shrink-0 justify-end gap-3 bg-[hsl(var(--card))]">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary min-w-[140px]"
              disabled={!draft.company.trim()}
              onClick={apply}
            >
              {mode === 'update' && match ? 'Update from email' : 'Add from email'}
            </button>
          </div>
        )}
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
