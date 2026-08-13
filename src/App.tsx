import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import JobForm from './JobForm.tsx'
import KanbanBoard from './KanbanBoard.tsx'
import TableView from './TableView.tsx'
import Dashboard from './Dashboard.tsx'
import SearchFilter from './SearchFilter.tsx'
import EmailImport from './EmailImport.tsx'
import BookmarkletModal from './BookmarkletModal.tsx'
import PrepKit from './PrepKit.tsx'
import AuthPanel from './AuthPanel.tsx'
import GmailSyncPanel from './GmailSyncPanel.tsx'
import {
  emptyGmailSyncState,
  type GmailSyncState,
  type JobApplication,
  type NewJobApplication,
  type Status,
  STATUS_ORDER,
  isOverdue,
  loadStorage,
  saveStorage,
} from './types'
import {
  getCurrentUser,
  loadCloudState,
  saveCloudState,
  signOut,
  type AppUser,
} from './lib/cloudSync'

type ViewMode = 'board' | 'list' | 'dashboard' | 'prepKit'

function sortApplications(
  apps: JobApplication[],
  sortBy: 'date' | 'company' | 'status',
  sortDir: 'asc' | 'desc',
) {
  const sorted = [...apps].sort((a, b) => {
    if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned)

    let comparison = 0
    switch (sortBy) {
      case 'date': {
        const aDate = a.appliedDate ? new Date(a.appliedDate).getTime() : 0
        const bDate = b.appliedDate ? new Date(b.appliedDate).getTime() : 0
        comparison = aDate - bDate
        break
      }
      case 'company':
        comparison = a.company.localeCompare(b.company)
        break
      case 'status':
        comparison =
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.company.localeCompare(b.company)
        break
    }
    return sortDir === 'asc' ? comparison : -comparison
  })
  return sorted
}

export default function App() {
  const stored = loadStorage()
  const [applications, setApplications] = useState<JobApplication[]>(() => stored.applications)
  const [prepNotes, setPrepNotes] = useState(() => stored.prepNotes || [])
  const [gmailSync, setGmailSync] = useState<GmailSyncState>(
    () => stored.gmailSync || emptyGmailSyncState(),
  )
  const [user, setUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cloudHydrated, setCloudHydrated] = useState(false)
  const skipNextCloudSave = useRef(false)
  const [view, setView] = useState<ViewMode>('board')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | ''>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<JobApplication | null>(null)
  const [prefill, setPrefill] = useState<Partial<NewJobApplication> | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)
  const [gmailOpen, setGmailOpen] = useState(false)
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | null>(null)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('job-app-theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('job-app-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  useEffect(() => {
    saveStorage({ applications, version: 1, prepNotes, gmailSync })
  }, [applications, prepNotes, gmailSync])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const current = await getCurrentUser()
      if (cancelled) return
      setUser(current)
      setAuthReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!authReady || !user) {
      setCloudHydrated(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setSyncing(true)
      try {
        const cloud = await loadCloudState(user.$id)
        if (cancelled) return

        if (cloud) {
          skipNextCloudSave.current = true
          setApplications(cloud.applications)
          setPrepNotes(cloud.prepNotes)
          setGmailSync(cloud.gmailSync || emptyGmailSyncState())
          showToast('Loaded from Appwrite')
        } else if (applications.length > 0 || prepNotes.length > 0) {
          await saveCloudState(user.$id, { applications, prepNotes, gmailSync, version: 1 })
          if (!cancelled) showToast('Uploaded local data to Appwrite')
        } else {
          await saveCloudState(user.$id, {
            applications: [],
            prepNotes: [],
            gmailSync: emptyGmailSyncState(),
            version: 1,
          })
        }
        if (!cancelled) setCloudHydrated(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Cloud sync failed'
        if (!cancelled) showToast(message)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // Only hydrate when the signed-in user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.$id])

  useEffect(() => {
    if (!user || !cloudHydrated) return
    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false
      return
    }

    const timer = window.setTimeout(() => {
      setSyncing(true)
      saveCloudState(user.$id, { applications, prepNotes, gmailSync, version: 1 })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Cloud save failed'
          showToast(message)
        })
        .finally(() => setSyncing(false))
    }, 600)

    return () => window.clearTimeout(timer)
  }, [applications, prepNotes, gmailSync, user, cloudHydrated])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const handleSignedIn = (next: AppUser) => {
    setCloudHydrated(false)
    setUser(next)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setCloudHydrated(false)
    showToast('Signed out — data stays on this device')
  }

  // Check for URL parameters from Bookmarklet import
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('import') === 'true') {
      const pCompany = params.get('company')
      const pRole = params.get('role')
      const pUrl = params.get('url')
      const pSource = params.get('source')

      setPrefill({
        company: pCompany || '',
        role: pRole || '',
        jobUrl: pUrl || '',
        source: pSource || '',
      })
      setEditing(null)
      setFormOpen(true)
      
      // Clean up URL without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return applications.filter((app) => {
      const matchesSearch =
        !q ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.notes.toLowerCase().includes(q) ||
        (app.source ?? '').toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q)
      const matchesStatus = filterStatus ? app.status === filterStatus : true
      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, filterStatus])

  const sortedApplications = useMemo(
    () => sortApplications(filteredApplications, sortBy, sortDir),
    [filteredApplications, sortBy, sortDir],
  )

  const stats = useMemo(() => {
    const open = applications.filter((a) => !['Rejected', 'Withdrawn'].includes(a.status))
    return {
      total: applications.length,
      open: open.length,
      interviews: applications.filter((a) => a.status === 'Interview' || a.status === 'HR Round')
        .length,
      offers: applications.filter((a) => a.status === 'Offer').length,
      overdue: applications.filter((a) => isOverdue(a.followUpDate)).length,
    }
  }, [applications])

  const persistSave = (data: NewJobApplication, id?: string) => {
    if (id) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : app,
        ),
      )
      showToast('Application updated')
    } else {
      const newApp: JobApplication = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviewRounds: data.interviewRounds || [],
        contacts: data.contacts || [],
      }
      setApplications((prev) => [newApp, ...prev])
      showToast(`Added ${data.company}`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const createFromEmail = (data: NewJobApplication) => {
    persistSave(data)
  }

  const updateFromEmail = (id: string, data: Partial<NewJobApplication>) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : app,
      ),
    )
    const target = applications.find((a) => a.id === id)
    showToast(target ? `Updated ${target.company} from email` : 'Updated from email')
  }

  const updateStatus = (id: string, status: Status) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app,
      ),
    )
    showToast(`Moved to ${status}`)
  }

  const togglePin = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, pinned: !app.pinned, updatedAt: new Date().toISOString() }
          : app,
      ),
    )
  }

  const deleteApplication = (id: string) => {
    const target = applications.find((a) => a.id === id)
    setApplications((prev) => prev.filter((app) => app.id !== id))
    showToast(target ? `Deleted ${target.company}` : 'Deleted application')
  }

  const bulkUpdateStatus = (ids: Set<string>, status: Status) => {
    setApplications((prev) =>
      prev.map((app) =>
        ids.has(app.id) ? { ...app, status, updatedAt: new Date().toISOString() } : app,
      ),
    )
    showToast(`Updated ${ids.size} applications`)
  }

  const bulkDelete = (ids: Set<string>) => {
    setApplications((prev) => prev.filter((app) => !ids.has(app.id)))
    showToast(`Deleted ${ids.size} applications`)
  }

  const exportData = () => {
    const data = JSON.stringify({ applications, version: 1, prepNotes, gmailSync }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobappy-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result ?? '')) as {
          applications?: JobApplication[]
          prepNotes?: typeof prepNotes
          gmailSync?: GmailSyncState
        }
        if (!data.applications || !Array.isArray(data.applications)) {
          throw new Error('Invalid data format')
        }
        setApplications(data.applications)
        if (Array.isArray(data.prepNotes)) setPrepNotes(data.prepNotes)
        if (data.gmailSync) setGmailSync(data.gmailSync)
        showToast(`Imported ${data.applications.length} applications`)
      } catch (err) {
        console.error(err)
        showToast('Import failed — check the JSON file')
      }
    }
    reader.readAsText(file)
  }

  const openCreate = () => {
    setEditing(null)
    setPrefill(null)
    setFormOpen(true)
  }

  const openEdit = (app: JobApplication) => {
    setEditing(app)
    setPrefill(null)
    setFormOpen(true)
  }

  return (
    <div className="app-page text-foreground">
      <div className="app-shell">
        <header className="animate-rise mb-8 w-full">
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:max-w-xl sm:text-left lg:max-w-2xl">
              <p className="mb-1 text-sm font-bold tracking-wide text-primary">JOBAPPY</p>
              <h1 className="font-display text-3xl text-foreground sm:text-4xl">
                Your job search, organized
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Track applications, follow-ups, and recruiting emails without the clutter.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                Add application
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEmailOpen(true)}>
                Paste email
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setGmailOpen(true)}>
                Sync Gmail
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setBookmarkletOpen(true)}>
                Get Bookmarklet
              </button>
              <button
                type="button"
                className="btn btn-ghost px-3"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2 sm:justify-start">
            <AuthPanel
              user={user}
              syncing={syncing}
              onSignedIn={handleSignedIn}
              onSignOut={handleSignOut}
              onToast={showToast}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportData}>
              Export
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (confirm('Clear all applications? This cannot be undone.')) {
                  setApplications([])
                  showToast('Pipeline cleared')
                }
              }}
            >
              Clear all
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  importData(file)
                  e.target.value = ''
                }
              }}
            />
          </div>
        </header>

        <section className="stats-grid animate-rise mb-7 w-full">
          {[
            { label: 'Tracked', value: stats.total },
            { label: 'Open', value: stats.open },
            { label: 'Interviews', value: stats.interviews },
            { label: 'Offers', value: stats.offers },
            { label: 'Overdue', value: stats.overdue, alert: stats.overdue > 0 },
          ].map((item) => (
            <div key={item.label} className="stat-card rounded-xl surface">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p
                className={`stat-value mt-1.5 ${item.alert ? 'text-destructive' : 'text-foreground'}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <div className="toolbar-row mb-6">
          <div className="view-toggle mx-auto sm:mx-0" role="group" aria-label="View mode">
            {(['board', 'list', 'dashboard', 'prepKit'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
              >
                {mode === 'prepKit' ? 'Prep Kit' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view !== 'prepKit' ? (
          <div className="mb-7 w-full">
            <SearchFilter
              query={searchQuery}
              setQuery={setSearchQuery}
              status={filterStatus}
              setStatus={setFilterStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDir={sortDir}
              setSortDir={setSortDir}
              resultCount={sortedApplications.length}
              onClear={() => {
                setSearchQuery('')
                setFilterStatus('')
              }}
            />
          </div>
        ) : null}

        <div className="w-full">
          {view === 'prepKit' ? (
            <PrepKit
              prepNotes={prepNotes}
              applications={applications}
              onToast={showToast}
              onSaveNote={(note) => {
                setPrepNotes((prev) => {
                  const exists = prev.some((n) => n.id === note.id)
                  return exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev]
                })
              }}
              onDeleteNote={(id) => {
                setPrepNotes((prev) => prev.filter((n) => n.id !== id))
              }}
            />
          ) : view === 'dashboard' ? (
            <Dashboard applications={applications} />
          ) : view === 'board' ? (
            <KanbanBoard
              applications={sortedApplications}
              onStatusChange={updateStatus}
              onPinToggle={togglePin}
              onEdit={openEdit}
              onDelete={deleteApplication}
            />
          ) : (
            <TableView
              applications={sortedApplications}
              onStatusChange={updateStatus}
              onPinToggle={togglePin}
              onEdit={openEdit}
              onDelete={deleteApplication}
              onBulkStatusChange={bulkUpdateStatus}
              onBulkDelete={bulkDelete}
            />
          )}
        </div>
      </div>

      <JobForm
        open={formOpen}
        initial={editing}
        prefill={prefill}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
          setPrefill(null)
        }}
        onSave={persistSave}
      />

      <EmailImport
        open={emailOpen}
        applications={applications}
        onClose={() => setEmailOpen(false)}
        onCreate={createFromEmail}
        onUpdate={updateFromEmail}
      />

      <GmailSyncPanel
        open={gmailOpen}
        applications={applications}
        gmailSync={gmailSync}
        onClose={() => setGmailOpen(false)}
        onToast={showToast}
        onApplySync={({ applications: nextApps, gmailSync: nextGmail }) => {
          setApplications(nextApps)
          setGmailSync(nextGmail)
        }}
      />

      <BookmarkletModal
        open={bookmarkletOpen}
        onClose={() => setBookmarkletOpen(false)}
      />

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 animate-slide-up rounded-xl border border-border bg-[hsl(var(--card))] px-4 py-3 text-sm font-medium text-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
