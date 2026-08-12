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
    <div className="animate-rise w-full">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Pipeline</h2>
        <p className="mt-1 text-base text-muted-foreground">Drag attention across stages — update status on each card</p>
      </div>

      <div className="flex w-full gap-3 overflow-x-auto pb-3">
        {columns.map((column) => (
          <section
            key={column.status}
            className="flex min-w-[240px] flex-1 flex-col rounded-2xl surface"
          >
            <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">{column.status}</h3>
              <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold text-muted-foreground">
                {column.apps.length}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2.5 p-3">
              {column.apps.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">Empty</p>
              )}
              {column.apps.map((app) => (
                <article
                  key={app.id}
                  className="kanban-card rounded-xl border border-border bg-[hsl(var(--card))] p-3.5"
                >
                  <button
                    type="button"
                    className="mb-2 block w-full text-left"
                    onClick={() => onEdit(app)}
                  >
                    <p className="truncate text-base font-bold text-foreground">{app.company}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{app.role}</p>
                  </button>

                  <p className="mb-2 text-sm text-muted-foreground truncate">
                    {app.location || 'Location TBD'}
                    {app.followUpDate
                      ? ` · ${isOverdue(app.followUpDate) ? 'Overdue ' : ''}${formatDate(app.followUpDate)}`
                      : ''}
                  </p>
                  {((app.contacts && app.contacts.length > 0) || (app.interviewRounds && app.interviewRounds.length > 0)) && (
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground">
                      {app.contacts && app.contacts.length > 0 && <span>👤 {app.contacts.length}</span>}
                      {app.interviewRounds && app.interviewRounds.length > 0 && <span>🗓️ {app.interviewRounds.length}</span>}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusSelect
                      value={app.status}
                      ariaLabel={`Status for ${app.company}`}
                      onChange={(status) => onStatusChange(app.id, status)}
                    />
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
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
