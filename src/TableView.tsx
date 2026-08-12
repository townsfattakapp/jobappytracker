import { useState } from 'react'
import StatusSelect from './StatusSelect.tsx'
import { type JobApplication, type Status, formatDate, isOverdue } from './types'

interface TableViewProps {
  applications: JobApplication[]
  onStatusChange: (id: string, status: Status) => void
  onPinToggle: (id: string) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
  onBulkStatusChange?: (ids: Set<string>, status: Status) => void
  onBulkDelete?: (ids: Set<string>) => void
}

export default function TableView({
  applications,
  onStatusChange,
  onPinToggle,
  onEdit,
  onDelete,
  onBulkStatusChange,
  onBulkDelete,
}: TableViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const totalPages = Math.ceil(applications.length / pageSize)
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const paginatedApps = applications.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className="animate-rise w-full">
      <div className="mb-4 w-full">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Applications</h2>
        <p className="mt-1 text-base text-muted-foreground">
          {applications.length} shown · click a company to edit
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-2xl surface flex flex-col relative">
        <div className="app-row-head">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input"
              checked={applications.length > 0 && selectedIds.size === applications.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(new Set(applications.map((a) => a.id)))
                } else {
                  setSelectedIds(new Set())
                }
              }}
              aria-label="Select all"
            />
          </div>
          <span>Company / role</span>
          <span>Location / pay</span>
          <span className="text-center">Status</span>
          <span className="text-center">Dates</span>
          <span className="text-center">Actions</span>
        </div>

        {applications.length === 0 && (
          <p className="px-5 py-16 text-center text-base text-muted-foreground">
            No applications match your filters.
          </p>
        )}

        <div className="flex-1">
          {paginatedApps.map((app) => {
          const overdue = isOverdue(app.followUpDate)
          return (
            <div key={app.id} className={`app-row ${selectedIds.has(app.id) ? 'bg-muted/30' : ''}`}>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input"
                  checked={selectedIds.has(app.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedIds)
                    if (e.target.checked) newSet.add(app.id)
                    else newSet.delete(app.id)
                    setSelectedIds(newSet)
                  }}
                  aria-label={`Select ${app.company}`}
                />
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  className="block max-w-full truncate text-left text-[1.05rem] font-bold text-foreground hover:text-primary"
                  onClick={() => onEdit(app)}
                >
                  {app.company}
                  {app.pinned ? (
                    <span className="ml-2 text-sm font-semibold text-primary">· pinned</span>
                  ) : null}
                </button>
                <p className="mt-0.5 truncate text-[0.95rem] text-muted-foreground">{app.role}</p>
                {((app.contacts && app.contacts.length > 0) || (app.interviewRounds && app.interviewRounds.length > 0)) && (
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-muted-foreground">
                    {app.contacts && app.contacts.length > 0 && <span>👤 {app.contacts.length}</span>}
                    {app.interviewRounds && app.interviewRounds.length > 0 && <span>🗓️ {app.interviewRounds.length}</span>}
                  </div>
                )}
                {app.jobUrl ? (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    Open job link
                  </a>
                ) : null}
              </div>

              <div className="min-w-0 text-[0.95rem]">
                <p className="truncate font-medium text-foreground">
                  {app.location || 'Location TBD'}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground">
                  {app.salary || 'Salary not set'}
                </p>
              </div>

              <div className="app-row-status">
                <StatusSelect
                  value={app.status}
                  ariaLabel={`Status for ${app.company}`}
                  onChange={(status) => onStatusChange(app.id, status)}
                />
              </div>

              <div className="min-w-0 text-sm text-muted-foreground text-center">
                <p>
                  Applied{' '}
                  <span className="font-semibold text-foreground">{formatDate(app.appliedDate)}</span>
                </p>
                <p className={`mt-0.5 ${overdue ? 'font-semibold text-destructive' : ''}`}>
                  Follow-up {formatDate(app.followUpDate)}
                  {overdue ? ' · overdue' : ''}
                </p>
              </div>

              <div className="app-row-actions">
                <button type="button" className="btn-link" onClick={() => onEdit(app)}>
                  Edit
                </button>
                <button type="button" className="btn-link" onClick={() => onPinToggle(app.id)}>
                  {app.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  className="btn-link btn-link-danger"
                  onClick={() => {
                    if (confirm(`Delete ${app.company} — ${app.role}?`)) onDelete(app.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
        </div>
        
        {applications.length > 0 && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-0 px-6 py-4 border-t border-border bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="rounded-md border border-input bg-transparent px-2 py-1 focus:border-primary focus:outline-none"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-ghost btn-sm"
            >
              Previous
            </button>
            <span className="text-sm text-foreground px-2">
              Page {safePage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn btn-ghost btn-sm"
            >
              Next
            </button>
          </div>
        </div>
        )}

        {selectedIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] animate-slide-up flex items-center gap-3 bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-4 py-3 rounded-full shadow-xl">
            <span className="font-semibold whitespace-nowrap pl-2">
              {selectedIds.size} selected
            </span>
            <div className="w-px h-5 bg-[hsl(var(--paper))]/20 mx-1" />
            <div className="flex items-center gap-2">
              <StatusSelect
                value={'' as Status}
                ariaLabel="Bulk update status"
                onChange={(s) => {
                  if (onBulkStatusChange) onBulkStatusChange(selectedIds, s)
                  setSelectedIds(new Set())
                }}
              />
              <button
                className="btn btn-danger bg-transparent hover:bg-destructive/20 text-red-300 border-none px-3"
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.size} applications?`) && onBulkDelete) {
                    onBulkDelete(selectedIds)
                    setSelectedIds(new Set())
                  }
                }}
              >
                Delete
              </button>
              <button
                className="btn bg-transparent hover:bg-white/10 text-white border-none px-3"
                onClick={() => setSelectedIds(new Set())}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
