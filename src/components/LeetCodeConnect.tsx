import { useState } from 'react'
import type { LeetCodeConfig, DsaProblem } from '../types'

interface LeetCodeConnectProps {
  config: LeetCodeConfig
  setConfig: (c: LeetCodeConfig) => void
  problems: DsaProblem[]
  setProblems: (p: DsaProblem[]) => void
}

type RecentSubmission = { title: string; titleSlug: string; lang?: string }

export default function LeetCodeConnect({ config, setConfig, problems, setProblems }: LeetCodeConnectProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(!config.username)
  const [tempUsername, setTempUsername] = useState(config.username)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const handleSync = async () => {
    const username = config.username.trim()
    if (!username) {
      setIsEditing(true)
      setError('Add your LeetCode username first.')
      return
    }

    setLoading(true)
    setError(null)
    setSyncStatus('Fetching your LeetCode profile…')

    try {
      const res = await fetch(`/api/leetcode/${encodeURIComponent(username)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'LeetCode sync failed')

      const submissions: RecentSubmission[] = data.submissions || []
      const updatedProblems = [...problems]
      let newlyMatched = 0

      for (const sub of submissions) {
        const slug = sub.titleSlug
        if (!slug) continue
        const existingIdx = updatedProblems.findIndex((p) => p.titleSlug === slug)
        if (existingIdx >= 0) {
          if (updatedProblems[existingIdx].leetCodeStatus !== 'Accepted') {
            updatedProblems[existingIdx] = { ...updatedProblems[existingIdx], leetCodeStatus: 'Accepted' }
            newlyMatched++
          }
        } else {
          updatedProblems.push({
            id: `dsa-${slug}`,
            title: sub.title,
            titleSlug: slug,
            url: `https://leetcode.com/problems/${slug}/`,
            difficulty: 'Medium', // the recent-submissions feed does not include difficulty
            tags: [],
            languages: [sub.lang || 'Unknown'],
            status: 'Unattempted',
            leetCodeStatus: 'Accepted',
          })
          newlyMatched++
        }
      }

      setProblems(updatedProblems)
      setConfig({
        ...config,
        username,
        lastSync: new Date().toISOString(),
        totalSolved: typeof data.totalSolved === 'number' ? data.totalSolved : config.totalSolved,
      })

      setSyncStatus(`Sync complete. ${newlyMatched} recent accepted submissions matched or added.`)
      setTimeout(() => setSyncStatus(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while syncing.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUsername = () => {
    const next = tempUsername.trim()
    setIsEditing(false)
    setError(null)
    if (next === config.username) return
    setConfig({ ...config, username: next, lastSync: null, totalSolved: 0 })
  }

  return (
    <div className="surface rounded-xl p-5 border border-border flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            LC
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">LeetCode connect</h2>
            <p className="text-xs text-muted-foreground">Pull your recent accepted submissions.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              type="button"
              className="btn btn-ghost text-xs py-1"
              onClick={() => {
                setTempUsername(config.username)
                setIsEditing(true)
              }}
            >
              {config.username ? 'Edit user' : 'Set username'}
            </button>
          )}
          <button type="button" className="btn btn-primary text-xs py-1" onClick={handleSync} disabled={loading || isEditing}>
            {loading ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20" role="alert">
          {error}
        </div>
      )}

      {syncStatus && !error && (
        <div className="text-xs text-emerald-500 bg-emerald-500/10 p-2 rounded border border-emerald-500/20" role="status">
          {syncStatus}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Username</span>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                className="input-field py-1 text-sm h-8 w-44"
                value={tempUsername}
                placeholder="leetcode username"
                onChange={(e) => setTempUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveUsername()
                  }
                }}
                autoFocus
              />
              <button type="button" className="btn btn-secondary h-8 px-3 text-xs" onClick={handleSaveUsername}>
                Save
              </button>
            </div>
          ) : (
            <span className="font-mono font-medium text-foreground">{config.username || 'Not set'}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:items-center">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total solved</span>
          <span className="font-semibold text-foreground text-lg leading-none">{config.totalSolved}</span>
        </div>

        <div className="flex flex-col gap-1 sm:items-end">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last sync</span>
          <span className="text-sm text-foreground">{config.lastSync ? new Date(config.lastSync).toLocaleString() : 'Never'}</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-tight">
        Reads your public LeetCode profile (last ~20 accepted submissions). No code is imported and nothing is written to LeetCode.
        LeetCode status is kept separate from attempts you log here.
      </p>
    </div>
  )
}
