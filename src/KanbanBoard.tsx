import StatusSelect from './StatusSelect.tsx'
import { type JobApplication, type Status, STATUS_ORDER, formatDate, isOverdue } from './types'

interface KanbanBoardProps {
  applications: JobApplication[]
  onStatusChange: (id: string, status: Status) => void
  onPinToggle: (id: string) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

export default function KanbanBoard({
  applications,
  onStatusChange,
  onPinToggle,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const columns = STATUS_ORDER.map((status) => ({
    status,
    apps: applications
      .filter((a) => a.status === status)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
  }))

  return (
    <div className="animate-rise w-full min-w-0">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Pipeline</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Update status on each card — swipe sideways to see every stage
        </p>
        <p className="kanban-scroll-hint">Swipe columns →</p>
      </div>

      <div className="kanban-board" role="list">
        {columns.map((column) => (
          <section key={column.status} className="kanban-column surface" role="listitem">
            <header className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-3 sm:px-4">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {column.status}
              </h3>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-sm font-semibold text-muted-foreground">
                {column.apps.length}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:p-3">
              {column.apps.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">Empty</p>
              )}
              {column.apps.map((app) => (
                <article
                  key={app.id}
                  className="kanban-card rounded-xl border border-border bg-[hsl(var(--card))] p-3 sm:p-3.5"
                >
                  <button
                    type="button"
                    className="mb-2 block w-full min-w-0 text-left"
                    onClick={() => onEdit(app)}
                  >
                    <p className="truncate text-base font-bold text-foreground">{app.company}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{app.role}</p>
                  </button>

                  <p className="mb-2 truncate text-sm text-muted-foreground">
                    {app.location || 'Location TBD'}
                    {app.followUpDate
                      ? ` · ${isOverdue(app.followUpDate) ? 'Overdue ' : ''}${formatDate(app.followUpDate)}`
                      : ''}
                  </p>
                  {((app.contacts && app.contacts.length > 0) ||
                    (app.interviewRounds && app.interviewRounds.length > 0)) && (
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      {app.contacts && app.contacts.length > 0 && (
                        <span>{app.contacts.length} contact{app.contacts.length === 1 ? '' : 's'}</span>
                      )}
                      {app.interviewRounds && app.interviewRounds.length > 0 && (
                        <span>
                          {app.interviewRounds.length} round
                          {app.interviewRounds.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <StatusSelect
                      value={app.status}
                      ariaLabel={`Status for ${app.company}`}
                      onChange={(status) => onStatusChange(app.id, status)}
                    />
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => onPinToggle(app.id)}
                      >
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
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
