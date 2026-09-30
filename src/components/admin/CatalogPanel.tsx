'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/adminClient'
import { ROLE_CATEGORIES } from '../../lib/jobs/taxonomy'
import type { CatalogRow, CatalogStatus } from '../../lib/server/catalog'
import { Pill, formatDateTime } from './ui'

type Status = { rows: CatalogRow[]; counts: Record<CatalogStatus, number>; total: number; seeded: number }

const TONE: Record<CatalogStatus, 'good' | 'warn' | 'bad' | 'neutral' | 'info'> = { Healthy: 'good', Configured: 'info', Degraded: 'bad', Unsupported: 'neutral', 'Not configured': 'warn', Protected: 'warn', 'Requires manual review': 'warn' }
const RELEVANCE: Record<string, string> = { strong: 'India: strong', moderate: 'India: moderate', international: 'International' }

export default function CatalogPanel({ initial, canEdit }: { initial: Status; canEdit: boolean }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState<CatalogStatus | 'all'>('all')
  const roleLabel = (id: string) => ROLE_CATEGORIES.find((c) => c.id === id)?.label ?? id

  const act = async (action: 'seed' | 'discover' | 'verify' | 'ingest' | 'schedule', slugs?: string[], enabled?: boolean) => {
    setBusy(action + (slugs?.[0] ?? ''))
    setMessage(null)
    try {
      const res = await api<{ scheduled?: number; seed?: { companiesCreated: number; companiesUpdated: number; sourcesCreated: number; sourcesUpdated: number }; results?: { slug: string; status: string; count?: number | null; fetched?: number; created?: number; irrelevant?: number; error?: string | null }[]; status: Status }>('/api/admin/catalog', { method: 'POST', json: { action, slugs, enabled } })
      setStatus(res.status)
      if (res.seed) setMessage(`Seeded: ${res.seed.companiesCreated} companies created, ${res.seed.companiesUpdated} refreshed; ${res.seed.sourcesCreated} sources created, ${res.seed.sourcesUpdated} refreshed.`)
      else if (action === 'schedule') setMessage(`${res.scheduled} verified source(s) ${enabled === false ? 'removed from' : 'added to'} the scheduled ingestion pass.`)
      else if (action === 'verify') setMessage(`Verified ${res.results?.filter((r) => r.status === 'verified').length ?? 0} feed(s); ${res.results?.filter((r) => r.status === 'failed').length ?? 0} failed.`)
      else if (action === 'discover') setMessage(res.results?.map((r) => `${r.slug}: ${r.status}`).join(', ') ?? 'Discovery completed')
      else setMessage(`Ingestion: ${res.results?.map((r) => `${r.slug} ${r.status} (${r.fetched} fetched, ${r.created} created, ${r.irrelevant} irrelevant${r.error ? `, ${r.error}` : ''})`).join(' · ') || 'no verified sources ran'}`)
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  const rows = status.rows.filter((r) => filter === 'all' || r.status === filter)
  const discoverAll = async () => {
    setBusy('discover-all')
    try {
      for (const row of rows.filter((r) => r.seeded)) {
        setMessage(`Discovering ${row.name}…`)
        try {
          const res = await api<{ status: Status }>('/api/admin/catalog', { method: 'POST', json: { action: 'discover', slugs: [row.slug] } })
          setStatus(res.status)
        } catch (error) { setMessage(`${row.name}: ${error instanceof Error ? error.message : 'Discovery failed'}`) }
      }
      setMessage('Discovery finished. Review each company’s extraction status before running sync.')
      router.refresh()
    } finally { setBusy(null) }
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {canEdit && (
          <>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => act('seed')} disabled={busy !== null}>
              {busy === 'seed' ? 'Seeding…' : status.seeded ? 'Refresh catalog' : 'Seed catalog'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => act('verify')} disabled={busy !== null || !status.seeded}>
              {busy === 'verify' ? 'Verifying…' : 'Verify feeds (read-only)'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={discoverAll} disabled={busy !== null || !status.seeded}>Discover visible sources</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => act('ingest')} disabled={busy !== null || !status.seeded}>
              {busy === 'ingest' ? 'Running…' : 'Run verified sources'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => act('schedule', undefined, true)} disabled={busy !== null || !status.seeded}>
              {busy === 'schedule' ? 'Saving…' : 'Schedule all verified'}
            </button>
            <button type="button" className="btn btn-link btn-sm" onClick={() => act('schedule', undefined, false)} disabled={busy !== null || !status.seeded}>
              Unschedule all
            </button>
          </>
        )}
        <div className="flex flex-wrap gap-1 ml-auto" role="group" aria-label="Filter by status">
          {(['all', 'Healthy', 'Configured', 'Degraded', 'Not configured', 'Unsupported', 'Protected', 'Requires manual review'] as const).map((f) => (
            <button key={f} type="button" className="pref-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? `All ${status.total}` : `${f} ${status.counts[f]}`}
            </button>
          ))}
        </div>
      </div>
      {message && (
        <div className="admin-alert admin-alert-ok" role="status">
          {message}
        </div>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table" aria-label="Company source catalog">
          <thead>
            <tr>
              <th>Company</th>
              <th>Health</th>
              <th>Provider / extraction</th>
              <th>Verification</th>
              <th>Last sync / errors</th>
              <th>Fetched / relevant</th>
              <th>Published / stale</th>
              <th>Role families</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.headquarters} · {r.industry} · {RELEVANCE[r.indiaRelevance]}
                  </div>
                  <a className="text-xs underline" href={r.careersUrl} target="_blank" rel="noreferrer">
                    Official careers page
                  </a>
                </td>
                <td>
                  <Pill tone={TONE[r.status]}>{r.status}</Pill>
                  {!r.seeded && <div className="text-xs text-muted-foreground">not seeded</div>}
                </td>
                <td className="text-xs">
                  {r.providerDetected}
                  <div>{r.extractionStatus}</div>
                  <div>{r.extractionSupported ? 'Extraction supported' : 'Extraction not enabled'}</div>
                  <div>{r.integrated ? 'Integrated: successful sync' : 'No successful official integration confirmed'}</div>
                  {r.notes && <div className="text-muted-foreground">{r.notes}</div>}
                </td>
                <td className="text-xs">
                  {r.verificationStatus ?? '—'}
                  {r.verificationNote && <div className="text-muted-foreground">{r.verificationNote}</div>}
                  {r.verifiedAt && <div className="text-muted-foreground">{formatDateTime(r.verifiedAt)}</div>}
                  {r.lastVerifiedJobCount != null && <div className="text-muted-foreground">{r.lastVerifiedJobCount} listing(s) at check</div>}
                </td>
                <td className="text-xs">
                  {r.lastRunStatus ?? '—'}
                  {r.lastRunAt && <div className="text-muted-foreground">{formatDateTime(r.lastRunAt)}</div>}
                  {r.lastError && <div className="text-destructive">{r.lastError.slice(0, 120)}</div>}
                  {r.feed && r.seeded && <div className="text-muted-foreground">{r.scheduleEnabled ? 'scheduled' : 'manual runs only'}</div>}
                </td>
                <td>{r.jobsFetched ?? '—'} / {r.relevantJobs ?? '—'}<div className="text-xs">Duplicates: {r.duplicatesRemoved ?? '—'}</div></td>
                <td>{r.liveJobs} / {r.staleJobs}</td>
                <td className="text-xs">{r.roleFamilies.map(roleLabel).join(', ')}</td>
                {canEdit && (
                  <td className="whitespace-nowrap">
                    {r.seeded && (
                      <>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => act('discover', [r.slug])} disabled={busy !== null} aria-label={`Discover ${r.name}`}>
                          Detect / verify
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => act('ingest', [r.slug])} disabled={busy !== null || r.verificationStatus !== 'verified' || !r.ingestionAllowed} aria-label={`Run Sync ${r.name}`}>
                          Run Sync
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
