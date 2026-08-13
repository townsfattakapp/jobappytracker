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
    <div className="animate-rise w-full min-w-0">
      <div className="mb-4 w-full">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {applications.length} shown · tap a company to edit
        </p>
      </div>

      <div className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl surface">
        <div className="app-row-head">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="touch-check rounded border-input"
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

        <div className="min-w-0 flex-1">
          {paginatedApps.map((app) => {
            const overdue = isOverdue(app.followUpDate)
            return (
              <div
                key={app.id}
                className={`app-row ${selectedIds.has(app.id) ? 'bg-muted/30' : ''}`}
              >
                <div className="app-row-check">
                  <input
                    type="checkbox"
                    className="touch-check rounded border-input"
                    checked={selectedIds.has(app.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds)
                      if (e.target.checked) next.add(app.id)
                      else next.delete(app.id)
                      setSelectedIds(next)
                    }}
                    aria-label={`Select ${app.company}`}
                  />
                  <span className="app-row-check-label">Select</span>
                </div>

                <div className="app-row-company min-w-0">
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
                  {((app.contacts && app.contacts.length > 0) ||
                    (app.interviewRounds && app.interviewRounds.length > 0)) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                      {app.contacts && app.contacts.length > 0 && (
                        <span>
                          {app.contacts.length} contact{app.contacts.length === 1 ? '' : 's'}
                        </span>
                      )}
                      {app.interviewRounds && app.interviewRounds.length > 0 && (
                        <span>
                          {app.interviewRounds.length} round
                          {app.interviewRounds.length === 1 ? '' : 's'}
                        </span>
                      )}
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

                <div className="app-row-location min-w-0 text-[0.95rem]">
                  <p className="app-row-field-label">Location / pay</p>
                  <p className="truncate font-medium text-foreground">
                    {app.location || 'Location TBD'}
                  </p>
                  <p className="mt-0.5 truncate text-muted-foreground">
                    {app.salary || 'Salary not set'}
                  </p>
                </div>

                <div className="app-row-status">
                  <p className="app-row-field-label">Status</p>
                  <StatusSelect
                    value={app.status}
                    ariaLabel={`Status for ${app.company}`}
                    onChange={(status) => onStatusChange(app.id, status)}
                  />
                </div>

                <div className="app-row-dates min-w-0 text-sm text-muted-foreground text-center">
                  <p className="app-row-field-label">Dates</p>
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
                  <p className="app-row-field-label w-full">Actions</p>
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
          <div className="flex flex-col items-stretch gap-3 border-t border-border bg-[hsl(var(--card))] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-md border border-input bg-transparent px-2 py-1.5 focus:border-primary focus:outline-none"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-ghost btn-sm min-w-[5.5rem]"
              >
                Previous
              </button>
              <span className="px-1 text-sm text-foreground sm:px-2">
                {safePage}/{totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn btn-ghost btn-sm min-w-[5.5rem]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="bulk-bar animate-slide-up">
            <span className="pl-1 text-sm font-semibold sm:whitespace-nowrap sm:pl-2">
              {selectedIds.size} selected
            </span>
            <div className="hidden h-5 w-px bg-[hsl(var(--paper))]/20 sm:block" />
            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto">
              <StatusSelect
                value={'' as Status}
                ariaLabel="Bulk update status"
                onChange={(s) => {
                  if (onBulkStatusChange) onBulkStatusChange(selectedIds, s)
                  setSelectedIds(new Set())
                }}
              />
              <button
                type="button"
                className="btn btn-danger border-none bg-transparent px-3 text-red-300 hover:bg-destructive/20"
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
                type="button"
                className="btn border-none bg-transparent px-3 text-white hover:bg-white/10"
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
