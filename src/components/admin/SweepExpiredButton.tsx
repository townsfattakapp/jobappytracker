'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/adminClient'

/** Marks published jobs whose expiry date has passed as expired. */
export default function SweepExpiredButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const run = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const result = await api<{ expired: number }>('/api/admin/jobs', { method: 'POST', json: { action: 'sweep_expired' } })
      setMessage(result.expired ? `${result.expired} job${result.expired === 1 ? '' : 's'} marked expired` : 'Nothing to expire')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Sweep failed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className="btn btn-ghost btn-sm" onClick={run} disabled={busy}>
        {busy ? 'Checking…' : 'Expire past-due jobs'}
      </button>
      {message && (
        <span className="text-xs text-muted-foreground" role="status">
          {message}
        </span>
      )}
    </span>
  )
}
