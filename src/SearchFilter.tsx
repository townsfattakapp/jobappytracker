import { type Status, STATUS_ORDER } from './types'

interface SearchFilterProps {
  query: string
  setQuery: (q: string) => void
  status: Status | ''
  setStatus: (s: Status | '') => void
  sortBy: 'date' | 'company' | 'status'
  setSortBy: (sb: 'date' | 'company' | 'status') => void
  sortDir: 'asc' | 'desc'
  setSortDir: (sd: 'asc' | 'desc') => void
  resultCount: number
  onClear: () => void
}

export default function SearchFilter({
  query,
  setQuery,
  status,
  setStatus,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  resultCount,
  onClear,
}: SearchFilterProps) {
  const hasFilters = Boolean(query || status)

  return (
    <div className="animate-rise w-full rounded-xl surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span> results
        </p>
        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="label-quiet">Search</span>
          <input
            className="input-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company, role, notes, source…"
          />
        </label>

        <label>
          <span className="label-quiet">Status</span>
          <select
            className="input-field"
            value={status}
            onChange={(e) => setStatus((e.target.value || '') as Status | '')}
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label-quiet">Sort</span>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'status')}
            >
              <option value="date">Date</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
            </select>
          </label>
          <label>
            <span className="label-quiet">Direction</span>
            <select
              className="input-field"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
