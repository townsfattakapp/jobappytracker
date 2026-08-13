import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import DropdownMenu from './DropdownMenu.tsx'
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
        {/* Top Nav handled inside header below */}

      <div className="app-shell">
        <header className="animate-rise mb-6 w-full min-w-0 sm:mb-8 flex flex-col gap-6 sm:gap-8">
          
          {/* Top Navigation Bar */}
          <div className="flex w-full items-center justify-between">
            <div className="font-bold tracking-wide text-primary text-xl">JOBAPPY</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <AuthPanel
                user={user}
                syncing={syncing}
                onSignedIn={handleSignedIn}
                onSignOut={handleSignOut}
                onToast={showToast}
              />
              <DropdownMenu label="⚙️">
                <button type="button" className="dropdown-item" onClick={() => setGmailOpen(true)}>
                  Sync Gmail
                </button>
                <button type="button" className="dropdown-item" onClick={exportData}>
                  Export Backup
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import Backup
                </button>
                <button
                  type="button"
                  className="dropdown-item text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm('Clear all applications? This cannot be undone.')) {
                      setApplications([])
                      showToast('Pipeline cleared')
                    }
                  }}
                >
                  Clear all Data
                </button>
              </DropdownMenu>
              <button
                type="button"
                className="theme-toggle-fab"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left mt-2 sm:mt-4">
            <h1 className="font-display text-gradient text-[2rem] leading-[1.1] sm:text-5xl pb-1">
              Your job search, organized
            </h1>
            <p className="mt-3 text-[0.95rem] text-muted-foreground sm:text-lg max-w-xl">
              Track applications, follow-ups, and recruiting emails without the clutter.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:w-auto mt-2">
            <button type="button" className="btn btn-primary col-span-2 sm:col-span-1 shadow-md hover:shadow-lg h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={openCreate}>
              Add application
            </button>
            <button type="button" className="btn btn-ghost h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={() => setEmailOpen(true)}>
              Paste email
            </button>
            <button type="button" className="btn btn-ghost h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={() => setBookmarkletOpen(true)}>
              Bookmarklet
            </button>
          </div>

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
        </header>

        <section className="stats-grid animate-rise mb-6 w-full min-w-0 sm:mb-7">
          {[
            { label: 'Tracked', value: stats.total, icon: '📊' },
            { label: 'Open', value: stats.open, icon: '📬' },
            { label: 'Interviews', value: stats.interviews, icon: '🗣️' },
            { label: 'Offers', value: stats.offers, icon: '🏆' },
            { label: 'Overdue', value: stats.overdue, alert: stats.overdue > 0, icon: '⚠️' },
          ].map((item) => (
            <div key={item.label} className="stat-card rounded-xl surface flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p
                  className={`stat-value mt-1.5 ${item.alert ? 'text-destructive' : 'text-foreground'}`}
                >
                  {item.value}
                </p>
              </div>
              <div className="text-3xl opacity-80">{item.icon}</div>
            </div>
          ))}
        </section>

        <div className="mb-5 sm:mb-6 w-full flex flex-col xl:flex-row gap-4 items-start xl:items-center">
          <div className="view-toggle shrink-0" role="group" aria-label="View mode">
            {(
              [
                { mode: 'board' as ViewMode, short: 'Board', full: 'Board' },
                { mode: 'list' as ViewMode, short: 'List', full: 'List' },
                { mode: 'dashboard' as ViewMode, short: 'Stats', full: 'Dashboard' },
                { mode: 'prepKit' as ViewMode, short: 'Prep', full: 'Prep Kit' },
              ]
            ).map(({ mode, short, full }) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{full}</span>
              </button>
            ))}
          </div>

          {view !== 'prepKit' ? (
            <div className="w-full xl:w-auto xl:flex-1">
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
        </div>

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

        <footer className="mt-10 border-t border-border pt-5 text-center sm:mt-12 sm:pt-6">
          <p className="text-sm text-muted-foreground">
            Built by{' '}
            <a
              href="https://www.evolw.in"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-primary"
            >
              Evolw
            </a>
            {' — '}
            Fattakse · A Unit of Evolw
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <a
              href="https://www.evolw.in"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              www.evolw.in
            </a>
          </p>
        </footer>
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
