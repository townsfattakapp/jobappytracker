'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api, ApiError } from '../../lib/adminClient'
import type { IngestionRunRow, ProviderHealthRow } from '../../lib/server/ingestion'
import { EmptyState, Pill, formatDateTime } from './ui'

interface Props {
  providers: ProviderHealthRow[]
  runs: IngestionRunRow[]
  canRun: boolean
}

export default function IngestionPanel({ providers, runs, canRun }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const run = async (source: ProviderHealthRow) => {
    setBusy(source.id)
    setMessage(null)
    try {
      const result = await api<{ status: string; fetched: number; created: number; updated: number; unchanged: number; irrelevant: number; duplicates: number; error: string | null }>('/api/admin/ingestion/run', { method: 'POST', json: { sourceId: source.id } })
      setMessage({ kind: 'ok', text: `${source.name}: fetched ${result.fetched}, created ${result.created}, updated ${result.updated}, unchanged ${result.unchanged}, irrelevant ${result.irrelevant}, duplicates ${result.duplicates}` })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof ApiError ? err.message : 'Run failed' })
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const schedule = async () => {
    setBusy('schedule')
    setMessage(null)
    try {
      const report = await api<{ sources: { sourceName: string; status: string; attempts: number; durationMs: number; reason?: string }[]; sweep: { stale: number; expired: number } | null }>('/api/admin/ingestion/schedule', { method: 'POST', json: {} })
      const summary = report.sources.map((s) => `${s.sourceName}: ${s.status}${s.attempts > 1 ? ` after ${s.attempts} attempts` : ''} in ${Math.round(s.durationMs)} ms${s.reason ? ` (${s.reason})` : ''}`).join('; ')
      setMessage({ kind: report.sources.some((s) => s.status === 'failed') ? 'error' : 'ok', text: `Scheduled pass: ${summary || 'no enabled provider sources'}${report.sweep ? ` · sweep: ${report.sweep.stale} stale, ${report.sweep.expired} expired` : ''}` })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Scheduled pass failed' })
    } finally {
      setBusy(null)
    }
  }

  const sweep = async () => {
    setBusy('sweep')
    setMessage(null)
    try {
      const result = await api<{ stale: number; expired: number }>('/api/admin/ingestion/sweep', { method: 'POST', json: {} })
      setMessage({ kind: 'ok', text: `Sweep done: ${result.stale} marked stale, ${result.expired} expired` })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Sweep failed' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {message && (
        <div className={`admin-alert ${message.kind === 'ok' ? 'admin-alert-ok' : 'admin-alert-error'} mb-4`} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}
      <section className="admin-section" aria-label="Providers">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="admin-section-title mb-0">Provider health</h2>
          {canRun && (
            <div className="flex gap-2 flex-wrap">
              <button type="button" className="btn btn-primary btn-sm" onClick={schedule} disabled={busy !== null}>
                {busy === 'schedule' ? 'Running scheduled pass…' : 'Run scheduled pass now'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={sweep} disabled={busy !== null}>
                {busy === 'sweep' ? 'Sweeping…' : 'Run stale / expiry sweep'}
              </button>
            </div>
          )}
        </div>
        {providers.length === 0 ? (
          <EmptyState title="No provider sources yet" description="Add a source with a provider (Greenhouse, Lever, Ashby) under Job sources, assign its company and mark ingestion as allowed after checking the terms." />
        ) : (
          <div className="admin-health-grid">
            {providers.map((p) => (
              <div key={p.id} className={`admin-health${p.lastRunStatus === 'failed' ? ' is-failed' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="admin-health-name">{p.name}</div>
                    <div className="admin-health-meta">
                      {p.provider} · {p.companyName || 'no company'}
                    </div>
                  </div>
                  <Pill tone={p.running ? 'info' : p.status !== 'active' ? 'bad' : !p.ingestionAllowed ? 'warn' : p.lastRunStatus === 'failed' ? 'bad' : p.lastRunStatus === 'success' ? 'good' : 'neutral'}>
                    {p.running ? 'running' : p.status !== 'active' ? 'paused' : !p.ingestionAllowed ? 'not allowed' : p.lastRunStatus || 'never run'}
                  </Pill>
                </div>
                <div className="admin-health-meta">
                  Last run {formatDateTime(p.lastRunAt)} · last success {formatDateTime(p.lastSuccessAt)} · {p.liveJobs} live of {p.jobCount} jobs · {p.autoPublish ? 'auto-publish' : 'review before publish'} · {p.scheduleEnabled ? 'scheduled' : 'schedule off'}
                </div>
                {p.lastError && <div className="admin-health-error">{p.lastError}</div>}
                <div className="flex gap-2 flex-wrap">
                  {canRun && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => run(p)} disabled={busy !== null || p.status !== 'active' || !p.ingestionAllowed} aria-label={`Run ingestion for ${p.name}`}>
                      {busy === p.id ? 'Running…' : 'Run now'}
                    </button>
                  )}
                  <Link href={`/admin/jobs?sourceId=${p.id}`} className="btn btn-ghost btn-sm">
                    Review jobs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="admin-section" aria-label="Runs">
        <h2 className="admin-section-title">Recent runs</h2>
        {runs.length === 0 ? (
          <div className="admin-card text-sm text-muted-foreground">No runs yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Trigger</th>
                  <th>Attempt</th>
                  <th>Duration</th>
                  <th>Fetched</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Unchanged</th>
                  <th>Irrelevant</th>
                  <th>Duplicates</th>
                  <th>Log</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{formatDateTime(r.startedAt)}</td>
                    <td>{r.sourceName}</td>
                    <td>
                      <Pill tone={r.status === 'success' ? 'good' : r.status === 'failed' ? 'bad' : r.status === 'skipped' ? 'warn' : 'info'}>{r.status}</Pill>
                    </td>
                    <td>{r.trigger}</td>
                    <td>{r.attempts}</td>
                    <td className="whitespace-nowrap">{r.durationMs != null ? `${r.durationMs} ms` : '—'}</td>
                    <td>{r.fetched}</td>
                    <td>{r.created}</td>
                    <td>{r.updated}</td>
                    <td>{r.unchanged}</td>
                    <td>{r.irrelevant}</td>
                    <td>{r.duplicates}</td>
                    <td>
                      <details>
                        <summary className="cursor-pointer text-sm">{r.error ? 'Error + log' : 'Log'}</summary>
                        {r.error && <div className="admin-health-error mt-1">{r.error}</div>}
                        <pre className="admin-pre">{r.log.join('\n') || '(empty)'}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
