import { useMemo, useState } from 'react'
import StatusBadge from './StatusBadge.tsx'
import {
  applyManualEmailCorrection,
  clearGmailAccessToken,
  isGmailConfigured,
  requestGmailAccessToken,
  runGmailSync,
  type GmailSyncProgress,
} from './lib/gmail'
import {
  emptyGmailSyncState,
  formatDate,
  type GmailSyncedEmail,
  type GmailSyncState,
  type JobApplication,
  type Status,
  STATUS_ORDER,
} from './types'

interface GmailSyncPanelProps {
  open: boolean
  applications: JobApplication[]
  gmailSync: GmailSyncState
  onClose: () => void
  onApplySync: (next: {
    applications: JobApplication[]
    gmailSync: GmailSyncState
  }) => void
  onToast: (message: string) => void
}

export default function GmailSyncPanel({
  open,
  applications,
  gmailSync,
  onClose,
  onApplySync,
  onToast,
}: GmailSyncPanelProps) {
  const [progress, setProgress] = useState<GmailSyncProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<GmailSyncedEmail | null>(null)
  const [editCompany, setEditCompany] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editStatus, setEditStatus] = useState<Status>('Applied')
  const [editUrl, setEditUrl] = useState('')

  const history = useMemo(
    () => [...(gmailSync.syncedEmails || [])].slice(0, 40),
    [gmailSync.syncedEmails],
  )

  if (!open) return null

  const configured = isGmailConfigured()

  const connect = async () => {
    setError(null)
    setBusy(true)
    try {
      await requestGmailAccessToken({ forceConsent: true })
      onToast('Gmail connected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Gmail')
    } finally {
      setBusy(false)
    }
  }

  const sync = async () => {
    setError(null)
    setBusy(true)
    setProgress({ phase: 'auth', current: 0, total: 0, message: 'Starting…' })
    try {
      const result = await runGmailSync({
        applications,
        gmailSync: gmailSync || emptyGmailSyncState(),
        onProgress: setProgress,
      })
      onApplySync({
        applications: result.applications,
        gmailSync: result.gmailSync,
      })
      onToast(progressMessage(result.created, result.updated, result.skipped))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gmail sync failed'
      setError(message)
      setProgress({ phase: 'error', current: 0, total: 0, message })
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    clearGmailAccessToken()
    onApplySync({
      applications,
      gmailSync: {
        ...(gmailSync || emptyGmailSyncState()),
        connectedEmail: null,
      },
    })
    onToast('Gmail disconnected on this device')
  }

  const openEdit = (email: GmailSyncedEmail) => {
    setEditing(email)
    setEditCompany(email.company || '')
    setEditRole(email.role || '')
    setEditStatus(email.status || 'Applied')
    setEditUrl(email.jobUrl || '')
  }

  const saveEdit = () => {
    if (!editing) return
    const next = applyManualEmailCorrection({
      applications,
      gmailSync,
      messageId: editing.messageId,
      patch: {
        company: editCompany,
        role: editRole,
        status: editStatus,
        jobUrl: editUrl,
      },
    })
    onApplySync(next)
    setEditing(null)
    onToast('Email mapping updated')
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center animate-fade">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-[hsl(var(--card))] shadow-lg animate-slide-up">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Gmail auto sync</p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
              Sync recruiting emails
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan new job emails, update statuses, and keep a sync history in Appwrite.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          {!configured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">Google OAuth client ID required</p>
              <p className="mt-1">
                Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in{' '}
                <code className="font-mono">.env</code> / GitHub Secrets, enable the Gmail API, and
                add authorized JavaScript origins for <code className="font-mono">localhost</code>{' '}
                and your GitHub Pages domain.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {gmailSync.connectedEmail
                    ? `Connected: ${gmailSync.connectedEmail}`
                    : 'Gmail not connected'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Last sync:{' '}
                  {gmailSync.lastSyncAt
                    ? new Date(gmailSync.lastSyncAt).toLocaleString()
                    : 'Never'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scans newest job emails first (last 45 days). Already-synced messages are
                  skipped; duplicates are matched by message/thread ID and company + role.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={busy || !configured}
                  onClick={() => void connect()}
                >
                  Connect Gmail
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy || !configured}
                  onClick={() => void sync()}
                >
                  {busy ? 'Syncing…' : 'Sync Gmail'}
                </button>
                {gmailSync.connectedEmail ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy}
                    onClick={disconnect}
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>
            </div>

            {busy && progress ? (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{progress.message}</span>
                  {progress.total > 0 ? (
                    <span>
                      {progress.current}/{progress.total}
                    </span>
                  ) : null}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width:
                        progress.total > 0
                          ? `${Math.max(8, Math.round((progress.current / progress.total) * 100))}%`
                          : progress.phase === 'done'
                            ? '100%'
                            : '35%',
                    }}
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-3 text-sm font-medium text-destructive">{error}</p> : null}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Detected email history
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No synced emails yet. Connect Gmail and run a sync.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((email) => (
                  <div
                    key={email.messageId}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {email.subject || '(no subject)'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {email.from} · {formatDate(email.internalDate ? new Date(Number(email.internalDate)).toISOString() : null)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {email.status ? <StatusBadge status={email.status} /> : null}
                        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                          {email.method}
                        </span>
                        {email.skipped ? (
                          <span className="text-xs font-medium text-destructive">skipped</span>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {email.company || '—'} · {email.role || '—'}
                      {email.skipReason ? ` · ${email.skipReason}` : ''}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(email)}
                      >
                        Correct mapping
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close editor"
            onClick={() => setEditing(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-[hsl(var(--card))] p-5 shadow-lg">
            <h3 className="font-display text-xl font-semibold">Correct email mapping</h3>
            <p className="mt-1 text-sm text-muted-foreground">{editing.subject}</p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="label-quiet">Company</span>
                <input
                  className="input-field"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label-quiet">Role</span>
                <input
                  className="input-field"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label-quiet">Status</span>
                <select
                  className="input-field"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Status)}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-quiet">Job URL</span>
                <input
                  className="input-field"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={saveEdit}>
                Save correction
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function progressMessage(created: number, updated: number, skipped: number): string {
  return `Gmail sync done · ${created} new · ${updated} updated · ${skipped} skipped`
}
