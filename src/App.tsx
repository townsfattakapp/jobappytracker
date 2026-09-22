import LearningDayWorkspace from './LearningDayWorkspace'
import LearningTaskPicker, { type PickerContext } from './components/LearningTaskPicker'
import { dateKey, dayDate, makeDay, topics } from './lib/learningPlan'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import JobForm from './JobForm.tsx'
import KanbanBoard from './KanbanBoard.tsx'
import TableView from './TableView.tsx'
import Dashboard from './Dashboard.tsx'
import SearchFilter from './SearchFilter.tsx'
import EmailImport from './EmailImport.tsx'
import BookmarkletModal from './BookmarkletModal.tsx'
import dynamic from 'next/dynamic'
import AppFooter from './components/AppFooter'
import BrandLogo, { BrandMark } from './components/BrandLogo'

const HeroScene = dynamic(() => import('./components/HeroScene'), { ssr: false, loading: () => null })
import PrepKit from './PrepKit.tsx'
import AuthPanel from './AuthPanel.tsx'
import GmailSyncPanel from './GmailSyncPanel.tsx'
import GoalManager from './GoalManager.tsx'
import DsaWorkspace from './DsaWorkspace.tsx'
import ProblemDetail from './ProblemDetail.tsx'
import LabWorkspace from './LabWorkspace.tsx'
import LabTicketDetail from './LabTicketDetail.tsx'
import MockInterviewWorkspace from './MockInterviewWorkspace.tsx'
import InterviewSession from './InterviewSession.tsx'
import LearningTracksWorkspace from './LearningTracksWorkspace.tsx'
import SystemDesignWorkspace from './SystemDesignWorkspace.tsx'
import SystemDesignExerciseDetail from './SystemDesignExerciseDetail.tsx'
import KnowledgeWorkspaceDetail from './KnowledgeWorkspaceDetail.tsx'
import InterviewQuestionWorkspace from './InterviewQuestionWorkspace.tsx'
import SettingsWorkspace from './SettingsWorkspace.tsx'
import Sidebar, { type ViewMode } from './Sidebar.tsx'
import MobileNav from './MobileNav.tsx'
import {
  emptyGmailSyncState,
  emptyLeetCodeConfig,
  emptyStorage,
  clearStorage,
  mergeSeed,
  type GmailSyncState,
  type JobApplication,
  type NewJobApplication,
  type Goal,
  type RoadmapDay,
  type Status,
  type Storage,
  STATUS_ORDER,
  isOverdue,
  loadStorage,
  saveStorage,
  type DsaProblem,
  type DsaAttemptSummary,
  type RevisionItem,
  type MockInterviewSummary,
  type EngineeringLab,
  type LabAttemptSummary,
  type LeetCodeConfig,
  type SystemDesignExercise,
  type SystemDesignAttemptSummary,
  type KnowledgeWorkspace,
  type UserPreferences,
} from './types'
import { exportLocalHistory, importLocalHistory } from './db'
import { javaDsaSeed } from './data/javaDsaSeed'
import { engineeringLabsSeed } from './data/engineeringLabsSeed'
import { systemDesignSeed } from './data/systemDesignSeed'
import { CLOUD_MERGED_EVENT, getCurrentUser, loadCloudState, saveCloudState, signOut, type AppUser } from './lib/cloudSync'
import { CODE_LANGUAGES, CODE_LANGUAGE_EVENT, getCodeLanguage, setCodeLanguage } from './lib/preferences'
import { allCurriculums } from './data/curriculum'
import { scheduleTrackIntoRoadmap } from './lib/roadmapGenerator'

const GUEST_MODE_KEY = 'jobappy-guest-mode'
const STORAGE_OWNER_KEY = 'jobappy-storage-owner'
const pendingKey = (id: string) => `jobappy-cloud-pending:${id}`

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage unavailable
  }
}

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

const HEADER_COPY: Partial<Record<ViewMode, { title: string; subtitle: string }>> = {
  dashboard: { title: 'Your job search, organized.', subtitle: 'Track applications, follow-ups, and recruiting emails in one workspace.' },
  board: { title: 'Kanban board', subtitle: 'Drag your search forward one stage at a time.' },
  list: { title: 'Applications', subtitle: 'Search, filter, and bulk-update everything you have applied to.' },
  today: { title: 'Your action plan', subtitle: 'Stay focused on today’s priorities.' },
  roadmap: { title: 'Career plan', subtitle: 'Execute your daily tasks and hit your professional goals.' },
  prepKit: { title: 'Preparation notes', subtitle: 'Company briefs, STAR stories, and cheat sheets with AI help.' },
}

export default function App() {
  const [stored] = useState<Storage>(() => loadStorage())
  const [applications, setApplications] = useState<JobApplication[]>(() => stored.applications)
  const [prepNotes, setPrepNotes] = useState(() => stored.prepNotes || [])
  const [gmailSync, setGmailSync] = useState<GmailSyncState>(() => stored.gmailSync || emptyGmailSyncState())
  const [goals, setGoals] = useState<Goal[]>(() => stored.goals || [])
  const [picker, setPicker] = useState<PickerContext | null>(null)
  const [planGoalId, setPlanGoalId] = useState('')
  const [planDate, setPlanDate] = useState(dateKey())
  const [syncEpoch, setSyncEpoch] = useState(0)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [learningActivity, setLearningActivity] = useState('')
  const [activityTab, setActivityTab] = useState<'Concepts' | 'Examples' | 'Diagrams' | 'Practice' | 'Mistakes' | 'Revision'>('Concepts')
  const [learningReturn, setLearningReturn] = useState<ViewMode>('today')
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>(() => stored.roadmap || [])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [dsaProblems, setDsaProblems] = useState<DsaProblem[]>(() => mergeSeed(stored.dsaProblems || [], javaDsaSeed))
  const [dsaAttemptSummaries, setDsaAttemptSummaries] = useState<DsaAttemptSummary[]>(() => stored.dsaAttemptSummaries || [])
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>(() => stored.revisionItems || [])
  const [engineeringLabs, setEngineeringLabs] = useState<EngineeringLab[]>(() => mergeSeed(stored.engineeringLabs || [], engineeringLabsSeed))
  const [labAttemptSummaries, setLabAttemptSummaries] = useState<LabAttemptSummary[]>(() => stored.labAttemptSummaries || [])
  const [mockInterviewSummaries, setMockInterviewSummaries] = useState<MockInterviewSummary[]>(() => stored.mockInterviewSummaries || [])
  const [leetCodeConfig, setLeetCodeConfig] = useState<LeetCodeConfig>(() => stored.leetCodeConfig || emptyLeetCodeConfig())
  const learningTracks = allCurriculums
  const [systemDesignExercises, setSystemDesignExercises] = useState<SystemDesignExercise[]>(() =>
    mergeSeed(stored.systemDesignExercises || [], systemDesignSeed),
  )
  const [systemDesignAttemptSummaries, setSystemDesignAttemptSummaries] = useState<SystemDesignAttemptSummary[]>(() => stored.systemDesignAttemptSummaries || [])
  const [knowledgeWorkspaces, setKnowledgeWorkspaces] = useState<KnowledgeWorkspace[]>(() => stored.knowledgeWorkspaces || [])
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({ codeLanguage: getCodeLanguage(), ...(stored.preferences || {}) }))

  const [user, setUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [guestMode, setGuestMode] = useState(() => readLocal(GUEST_MODE_KEY) === '1')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [cloudHydrated, setCloudHydrated] = useState(false)
  const skipNextCloudSave = useRef(false)
  const [view, setViewState] = useState<ViewMode>('today')
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
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null)
  const [activeInterview, setActiveInterview] = useState<{ category: string; difficulty: string } | null>(null)
  const [selectedSystemDesignId, setSelectedSystemDesignId] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const storageWarned = useRef(false)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = readLocal('job-app-theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    writeLocal('job-app-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setView = useCallback((next: ViewMode) => {
    setViewState(next)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    const retry = () => setSyncEpoch((n) => n + 1)
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

  const snapshot = useMemo<Storage>(
    () => ({
      applications,
      version: 1,
      prepNotes,
      gmailSync,
      goals,
      roadmap,
      dsaProblems,
      dsaAttemptSummaries,
      revisionItems,
      engineeringLabs,
      labAttemptSummaries,
      mockInterviewSummaries,
      leetCodeConfig,
      systemDesignExercises,
      systemDesignAttemptSummaries,
      knowledgeWorkspaces,
      preferences,
    }),
    [
      applications,
      prepNotes,
      gmailSync,
      goals,
      roadmap,
      dsaProblems,
      dsaAttemptSummaries,
      revisionItems,
      engineeringLabs,
      labAttemptSummaries,
      mockInterviewSummaries,
      leetCodeConfig,
      systemDesignExercises,
      systemDesignAttemptSummaries,
      knowledgeWorkspaces,
      preferences,
    ],
  )
  const snapshotRef = useRef(snapshot)
  snapshotRef.current = snapshot

  const persistCareer = useCallback(
    (next: Storage) => {
      const result = saveStorage(next)
      if (!result.ok && !storageWarned.current) {
        storageWarned.current = true
        showToast(
          result.reason === 'quota'
            ? 'This browser’s storage is full. Export a backup and clear old data.'
            : 'Browser storage is unavailable; changes will not persist after reload.',
        )
      }
      if (user) writeLocal(pendingKey(user.$id), JSON.stringify(next))
    },
    [user, showToast],
  )

  // Local persistence, debounced so typing in notes does not serialize the whole app per keystroke.
  const unsavedRef = useRef(false)
  useEffect(() => {
    unsavedRef.current = true
    const timer = window.setTimeout(() => {
      persistCareer(snapshot)
      unsavedRef.current = false
    }, 250)
    return () => window.clearTimeout(timer)
  }, [snapshot, persistCareer])

  // Flush only when a debounced save is still pending, so a tab closing with stale state
  // never overwrites data written by another tab or by the user.
  useEffect(() => {
    const flush = () => {
      if (!unsavedRef.current) return
      saveStorage(snapshotRef.current)
      unsavedRef.current = false
    }
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
    }
  }, [])

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

  const applyCloud = useCallback((cloud: Storage) => {
    skipNextCloudSave.current = true
    setApplications(cloud.applications || [])
    setPrepNotes(cloud.prepNotes || [])
    setGmailSync(cloud.gmailSync || emptyGmailSyncState())
    setGoals(cloud.goals || [])
    setRoadmap(cloud.roadmap || [])
    setDsaProblems(mergeSeed(cloud.dsaProblems || [], javaDsaSeed))
    setDsaAttemptSummaries(cloud.dsaAttemptSummaries || [])
    setRevisionItems(cloud.revisionItems || [])
    setEngineeringLabs(mergeSeed(cloud.engineeringLabs || [], engineeringLabsSeed))
    setLabAttemptSummaries(cloud.labAttemptSummaries || [])
    setMockInterviewSummaries(cloud.mockInterviewSummaries || [])
    setLeetCodeConfig(cloud.leetCodeConfig || emptyLeetCodeConfig())
    setSystemDesignExercises(mergeSeed(cloud.systemDesignExercises || [], systemDesignSeed))
    setSystemDesignAttemptSummaries(cloud.systemDesignAttemptSummaries || [])
    setKnowledgeWorkspaces(cloud.knowledgeWorkspaces || [])
    const cloudLanguage = cloud.preferences?.codeLanguage
    if (cloudLanguage && (CODE_LANGUAGES as readonly string[]).includes(cloudLanguage)) {
      setPreferences({ ...(cloud.preferences || {}), codeLanguage: cloudLanguage })
      if (getCodeLanguage() !== cloudLanguage) setCodeLanguage(cloudLanguage as (typeof CODE_LANGUAGES)[number])
    }
  }, [])

  // A save that collided with another device was merged automatically: show the merged result.
  useEffect(() => {
    const onMerged = (e: Event) => {
      const merged = (e as CustomEvent<Storage>).detail
      if (!merged) return
      applyCloud(merged)
      showToast('Merged changes from another device')
    }
    window.addEventListener(CLOUD_MERGED_EVENT, onMerged)
    return () => window.removeEventListener(CLOUD_MERGED_EVENT, onMerged)
  }, [applyCloud, showToast])

  // Keep the synced preferences in step with the per-device setting (and vice versa on load).
  useEffect(() => {
    const onChange = (e: Event) => {
      const language = (e as CustomEvent<string>).detail
      setPreferences((p) => (p.codeLanguage === language ? p : { ...p, codeLanguage: language }))
    }
    window.addEventListener(CODE_LANGUAGE_EVENT, onChange)
    return () => window.removeEventListener(CODE_LANGUAGE_EVENT, onChange)
  }, [])
  useEffect(() => {
    const saved = stored.preferences?.codeLanguage
    if (saved && (CODE_LANGUAGES as readonly string[]).includes(saved) && getCodeLanguage() !== saved) setCodeLanguage(saved as (typeof CODE_LANGUAGES)[number])
  }, [stored.preferences?.codeLanguage])

  useEffect(() => {
    if (!authReady || !user) {
      setCloudHydrated(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setSyncing(true)
      try {
        const owner = readLocal(STORAGE_OWNER_KEY)
        const local = loadStorage()
        const localHasData = Boolean(
          local.applications.length || (local.prepNotes || []).length || local.goals.length || local.knowledgeWorkspaces.length,
        )

        if (owner && owner !== user.$id && localHasData) {
          // Data on this device belongs to another account. Keep a copy, never upload it under this user.
          writeLocal(`jobappy-previous-user-backup:${owner}`, JSON.stringify(local))
          writeLocal(pendingKey(user.$id), null)
        }

        const cloud = await loadCloudState(user.$id)
        if (cancelled) return

        if (cloud) {
          if (localHasData && (!owner || owner === user.$id)) writeLocal('jobappy-before-cloud-recovery', JSON.stringify(local))
          applyCloud(cloud as Storage)
          showToast('Loaded from cloud')
        } else if (owner && owner !== user.$id && localHasData) {
          // Another account's data lives on this device: start this account fresh.
          const fresh = { ...emptyStorage(), systemDesignExercises: systemDesignSeed, engineeringLabs: engineeringLabsSeed, dsaProblems: javaDsaSeed }
          applyCloud(fresh)
          await saveCloudState(user.$id, fresh)
        } else {
          // First sign-in: upload whatever is in memory right now (the user may have kept working while we checked).
          await saveCloudState(user.$id, snapshotRef.current)
          if (!cancelled && localHasData) showToast('Uploaded local data to cloud')
        }
        writeLocal(STORAGE_OWNER_KEY, user.$id)
        if (!cancelled) {
          setCloudHydrated(true)
          setSyncError('')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Cloud sync failed'
        if (!cancelled) {
          showToast(message)
          setSyncError(message)
        }
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authReady, user?.$id, syncEpoch])

  useEffect(() => {
    if (!user || !cloudHydrated) return
    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false
      return
    }

    writeLocal(pendingKey(user.$id), JSON.stringify(snapshot))
    const timer = window.setTimeout(() => {
      setSyncing(true)
      saveCloudState(user.$id, snapshot)
        .then(() => setSyncError(''))
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Cloud save failed'
          setSyncError(message)
        })
        .finally(() => setSyncing(false))
    }, 800)

    return () => window.clearTimeout(timer)
  }, [snapshot, user, cloudHydrated])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const handleSignedIn = (next: AppUser) => {
    setCloudHydrated(false)
    setUser(next)
    setAuthModalOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setCloudHydrated(false)
    setGuestMode(true)
    writeLocal(GUEST_MODE_KEY, '1')
    showToast('Signed out. Your data stays on this device.')
  }

  const continueOffline = () => {
    setGuestMode(true)
    writeLocal(GUEST_MODE_KEY, '1')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('import') === 'true') {
      setPrefill({
        company: params.get('company') || '',
        role: params.get('role') || '',
        jobUrl: params.get('url') || '',
        source: params.get('source') || '',
      })
      setEditing(null)
      setFormOpen(true)
      setViewState('list')
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
      interviews: applications.filter((a) => a.status === 'Interview' || a.status === 'HR Round').length,
      offers: applications.filter((a) => a.status === 'Offer').length,
      overdue: applications.filter((a) => isOverdue(a.followUpDate) && !['Rejected', 'Withdrawn'].includes(a.status)).length,
    }
  }, [applications])

  const persistSave = (data: NewJobApplication, id?: string) => {
    if (id) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...data, updatedAt: new Date().toISOString() } : app)),
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
    setPrefill(null)
  }

  const createFromEmail = (data: NewJobApplication) => {
    persistSave(data)
  }

  const updateFromEmail = (id: string, data: Partial<NewJobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...data, updatedAt: new Date().toISOString() } : app)),
    )
    const target = applications.find((a) => a.id === id)
    showToast(target ? `Updated ${target.company} from email` : 'Updated from email')
  }

  const updateStatus = (id: string, status: Status) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app)),
    )
    showToast(`Moved to ${status}`)
  }

  const togglePin = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, pinned: !app.pinned, updatedAt: new Date().toISOString() } : app)),
    )
  }

  const deleteApplication = (id: string) => {
    const target = applications.find((a) => a.id === id)
    setApplications((prev) => prev.filter((app) => app.id !== id))
    showToast(target ? `Deleted ${target.company}` : 'Deleted application')
  }

  const bulkUpdateStatus = (ids: Set<string>, status: Status) => {
    setApplications((prev) =>
      prev.map((app) => (ids.has(app.id) ? { ...app, status, updatedAt: new Date().toISOString() } : app)),
    )
    showToast(`Updated ${ids.size} applications`)
  }

  const bulkDelete = (ids: Set<string>) => {
    setApplications((prev) => prev.filter((app) => !ids.has(app.id)))
    showToast(`Deleted ${ids.size} applications`)
  }

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const exportData = () => {
    downloadJson({ ...snapshot, exportedAt: new Date().toISOString() }, `jobappy-backup-${dateKey()}.json`)
    showToast('Backup downloaded')
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result ?? '')) as Partial<Storage>
        if (!data || !Array.isArray(data.applications)) {
          throw new Error('Invalid data format')
        }
        const summary = `${data.applications.length} applications, ${(data.goals || []).length} goals, ${(data.prepNotes || []).length} notes`
        if (!window.confirm(`Replace the data on this device with the backup (${summary})?`)) return
        applyCloud({ ...emptyStorage(), ...data, version: 1 })
        skipNextCloudSave.current = false
        showToast(`Imported ${summary}`)
      } catch (err) {
        console.error(err)
        showToast('Import failed. Choose a Prep backup JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleExportLocal = async () => {
    try {
      const historyStr = await exportLocalHistory()
      downloadJson(JSON.parse(historyStr), `jobappy-local-history-${dateKey()}.json`)
      showToast('Local history downloaded')
    } catch (err) {
      console.error(err)
      showToast('Export failed')
    }
  }

  const handleImportLocal = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imported = await importLocalHistory(String(e.target?.result ?? ''))
        showToast(imported ? `Imported ${imported} local history items` : 'No history items found in that file')
      } catch (err) {
        console.error(err)
        showToast('Local history import failed')
      }
    }
    reader.readAsText(file)
  }

  const clearLocalData = () => {
    if (!window.confirm('Clear all Prep data stored in this browser? This cannot be undone.')) return
    clearStorage()
    writeLocal(STORAGE_OWNER_KEY, null)
    if (user) writeLocal(pendingKey(user.$id), null)
    applyCloud({ ...emptyStorage(), systemDesignExercises: systemDesignSeed, engineeringLabs: engineeringLabsSeed, dsaProblems: javaDsaSeed })
    skipNextCloudSave.current = true
    setView('today')
    showToast(user ? 'Local data cleared. Sign out and back in to reload from cloud.' : 'Local data cleared')
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

  const requireGoal = (context: Partial<PickerContext>) => {
    if (!goals.length) {
      showToast('Create a learning goal first, then schedule tasks.')
      setCreatingGoal(true)
      setView('roadmap')
      return
    }
    setPicker({ date: dateKey(), goalId: planGoalId, ...context })
  }

  // Writes through to storage synchronously so an edit flushed during page unload is never lost.
  const knowledgeRef = useRef(knowledgeWorkspaces)
  knowledgeRef.current = knowledgeWorkspaces
  const saveWorkspace = (ws: KnowledgeWorkspace) => {
    const prev = knowledgeRef.current
    const idx = prev.findIndex((w) => w.topicId === ws.topicId)
    const next = idx >= 0 ? prev.map((w, i) => (i === idx ? ws : w)) : [...prev, ws]
    knowledgeRef.current = next
    persistCareer({ ...snapshotRef.current, knowledgeWorkspaces: next })
    setKnowledgeWorkspaces(next)
  }

  const isTrackerView = view === 'dashboard' || view === 'board' || view === 'list'
  const header = HEADER_COPY[view]
  const selectedProblem = selectedProblemId ? dsaProblems.find((p) => p.id === selectedProblemId) : undefined
  const selectedLab = selectedLabId ? engineeringLabs.find((l) => l.id === selectedLabId) : undefined
  const selectedExercise = selectedSystemDesignId ? systemDesignExercises.find((e) => e.id === selectedSystemDesignId) : undefined
  const showAuthGate = !user && !guestMode

  return (
    <div className="app-page text-foreground bg-background min-h-screen flex selection:bg-primary/20">
      <Sidebar
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        syncing={syncing}
        syncError={syncError}
        onSignIn={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <MobileNav
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onSignIn={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 min-w-0 md:ml-64 pb-24 md:pb-0 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none"></div>
        <div className="app-shell pt-5 sm:pt-8">
          {header && (
            <header className="animate-rise mb-6 w-full min-w-0 sm:mb-8 flex flex-col gap-5">
              <div className="flex flex-col items-start text-left">
                <h1 className="font-display text-gradient text-[2rem] font-black leading-[1.1] sm:text-5xl pb-1 tracking-tight">
                  {header.title}
                </h1>
                <p className="mt-2 text-[0.98rem] text-muted-foreground sm:text-lg max-w-2xl font-medium">{header.subtitle}</p>
              </div>

              {isTrackerView && (
                <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:w-auto">
                  <button
                    type="button"
                    className="btn btn-primary col-span-2 sm:col-span-1 shadow-lg shadow-primary/20 hover:shadow-primary/30 h-12 sm:h-11 text-base sm:text-[0.95rem]"
                    onClick={openCreate}
                  >
                    + Add application
                  </button>
                  <button type="button" className="btn btn-ghost h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={() => setEmailOpen(true)}>
                    Paste email
                  </button>
                  <button type="button" className="btn btn-ghost h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={() => setGmailOpen(true)}>
                    Gmail sync
                  </button>
                  <button type="button" className="btn btn-ghost h-12 sm:h-11 text-base sm:text-[0.95rem]" onClick={() => setBookmarkletOpen(true)}>
                    Bookmarklet
                  </button>
                </div>
              )}
            </header>
          )}

          {isTrackerView && (
            <section className="stats-grid animate-rise mb-6 w-full min-w-0 sm:mb-8" aria-label="Pipeline summary">
              {[
                { label: 'Tracked', value: stats.total, icon: '📊' },
                { label: 'Open', value: stats.open, icon: '📬' },
                { label: 'Interviews', value: stats.interviews, icon: '🗣️' },
                { label: 'Offers', value: stats.offers, icon: '🏆' },
                { label: 'Overdue', value: stats.overdue, alert: stats.overdue > 0, icon: '⚠️' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="stat-card rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-soft flex items-center justify-between p-5"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">{item.label}</p>
                    <p className={`stat-value ${item.alert ? 'text-destructive' : 'text-foreground'}`}>{item.value}</p>
                  </div>
                  <div className="text-3xl opacity-80" aria-hidden="true">
                    {item.icon}
                  </div>
                </div>
              ))}
            </section>
          )}

          {(view === 'board' || view === 'list') && (
            <div className="mb-6 w-full bg-card/40 backdrop-blur-md rounded-2xl p-1 border border-border/30">
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
          )}

          {picker && (
            <LearningTaskPicker
              problems={dsaProblems}
              labs={engineeringLabs}
              exercises={systemDesignExercises}
              context={picker}
              goals={goals}
              workspaces={knowledgeWorkspaces}
              onClose={() => setPicker(null)}
              onSave={(goalId, date, tasks) => {
                const goal = goals.find((g) => g.id === goalId)
                if (!goal) throw new Error('Create a goal first')
                const target = roadmap.find((d) => d.goalId === goalId && dayDate(d.date) === date) || makeDay(goal, date)
                const ids = new Set(tasks.map((t) => t.id))
                const next = roadmap.map((d) => ({ ...d, tasks: d.tasks.filter((t) => !ids.has(t.id)) }))
                const index = next.findIndex((d) => d.goalId === goalId && dayDate(d.date) === date)
                const day = index < 0 ? target : next[index]
                const updated = { ...day, tasks: [...day.tasks, ...tasks.map((t) => ({ ...t, dayId: day.id }))] }
                if (index < 0) next.push(updated)
                else next[index] = updated
                persistCareer({ ...snapshotRef.current, goals, roadmap: next, knowledgeWorkspaces })
                setRoadmap(next)
                setPlanGoalId(goalId)
                setPlanDate(date)
                setView('roadmap')
                showToast(tasks.length > 1 ? `${tasks.length} tasks saved` : 'Task saved')
              }}
            />
          )}

          {syncError && user && (
            <div className="surface p-4 mb-4 rounded-xl border-amber-500/40" role="status">
              <p className="font-semibold text-foreground">Saved on this device. Cloud sync is paused.</p>
              <p className="text-sm text-muted-foreground mt-1">{syncError}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSyncEpoch((n) => n + 1)}>
                  Retry sync
                </button>
                {syncError.includes('Another device') && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => downloadJson(loadStorage(), `jobappy-local-recovery-${dateKey()}.json`)}
                    >
                      Download local backup
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        writeLocal('jobappy-before-cloud-recovery', JSON.stringify(loadStorage()))
                        writeLocal(pendingKey(user.$id), null)
                        setSyncEpoch((n) => n + 1)
                      }}
                    >
                      Use cloud copy (keeps a local backup)
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="w-full relative">
            {view === 'today' || view === 'roadmap' ? (
              creatingGoal || (view === 'roadmap' && !goals.length) ? (
                <GoalManager
                  goal={null}
                  learningTracks={learningTracks}
                  onCancel={goals.length ? () => setCreatingGoal(false) : undefined}
                  onSaveGoal={(goal, days) => {
                    setGoals((prev) => (prev.some((g) => g.id === goal.id) ? prev : [...prev, goal]))
                    setRoadmap((prev) => [
                      ...prev,
                      ...days.filter((d) => !prev.some((old) => old.goalId === d.goalId && dayDate(old.date) === dayDate(d.date))),
                    ])
                    setPlanGoalId(goal.id)
                    setPlanDate(dayDate(goal.startDate))
                    setCreatingGoal(false)
                    showToast('Goal created. Your roadmap is ready.')
                  }}
                />
              ) : (
                <LearningDayWorkspace
                  revisions={revisionItems}
                  onGoals={setGoals}
                  goals={goals}
                  goalId={planGoalId}
                  onGoal={setPlanGoalId}
                  roadmap={roadmap}
                  onChange={(next) => {
                    persistCareer({ ...snapshotRef.current, roadmap: next })
                    setRoadmap(next)
                  }}
                  onPick={(context) => requireGoal(context)}
                  workspaces={knowledgeWorkspaces}
                  mode={view}
                  onCreate={() => setCreatingGoal(true)}
                  onTracks={() => setView('tracks')}
                  selectedDate={planDate}
                  onDate={setPlanDate}
                  onOpenRevision={(topicId) => {
                    setLearningReturn(view)
                    setSelectedTopicId(topicId)
                    setActivityTab('Revision')
                    setLearningActivity('')
                    setView('topicWorkspace')
                  }}
                  onDeleteGoal={(goalId) => {
                    const remainingGoals = goals.filter((g) => g.id !== goalId)
                    const remainingDays = roadmap.filter((d) => d.goalId !== goalId)
                    persistCareer({ ...snapshotRef.current, goals: remainingGoals, roadmap: remainingDays })
                    setGoals(remainingGoals)
                    setRoadmap(remainingDays)
                    setPlanGoalId(remainingGoals.find((g) => g.status === 'Active')?.id || remainingGoals[0]?.id || '')
                    showToast('Goal deleted. Your notes and learning work are kept.')
                  }}
                  onStart={(task) => {
                    setLearningReturn(view)
                    setLearningActivity(task.activity || '')
                    const info = topics.find(
                      (x) =>
                        x.topic.id === task.topicId ||
                        x.topic.subtopics.some(
                          (sub) => sub.tasks.some((t) => t.id === task.curriculumTaskId) || sub.questions?.some((q) => q.id === task.curriculumTaskId),
                        ),
                    )
                    if (info) {
                      setKnowledgeWorkspaces((prev) => {
                        const ws = prev.find((w) => w.topicId === info.topic.id) || {
                          topicId: info.topic.id,
                          learningStatus: 'Not Started' as const,
                          notes: [],
                          examples: [],
                          diagrams: [],
                          codeSnippets: [],
                          mistakes: [],
                          flashcards: [],
                          linkedActivities: [],
                          customResources: [],
                        }
                        const next = [
                          ...prev.filter((w) => w.topicId !== ws.topicId),
                          {
                            ...ws,
                            lastStudiedAt: new Date().toISOString(),
                            learningStatus: ws.learningStatus === 'Not Started' ? ('Learning' as const) : ws.learningStatus,
                          },
                        ]
                        persistCareer({ ...snapshotRef.current, knowledgeWorkspaces: next })
                        return next
                      })
                    }
                    if (task.activity?.includes('LeetCode') && task.linkedActivityId) {
                      setSelectedProblemId(task.linkedActivityId)
                      setView('dsa')
                    } else if (task.activity?.includes('HLD') && task.linkedActivityId) {
                      setSelectedSystemDesignId(task.linkedActivityId)
                      setView('systemDesign')
                    } else if (task.activity?.includes('Engineering Lab') && task.linkedActivityId) {
                      setSelectedLabId(task.linkedActivityId)
                      setView('labs')
                    } else if (task.activity === 'Take Mock Interview') {
                      setActiveInterview({ category: info?.track.title || 'Technical', difficulty: 'Medium' })
                      setView('mock')
                    } else if (task.curriculumTaskId && task.curriculumTaskId.startsWith('q-')) {
                      setSelectedTopicId(task.curriculumTaskId)
                      setView('topicWorkspace')
                    } else if (info) {
                      setSelectedTopicId(info.topic.id)
                      setActivityTab(
                        task.activity?.includes('Diagram')
                          ? 'Diagrams'
                          : /Examples/.test(task.activity || '')
                            ? 'Examples'
                            : /Revise|Review Notes|Revision/.test(task.activity || '') || task.type === 'Revision'
                              ? 'Revision'
                              : /Coding|Code|Quiz|Problems|Project|Practice/.test(task.activity || '') || task.type === 'Practice' || task.type === 'Coding'
                                ? 'Practice'
                                : 'Concepts',
                      )
                      setView('topicWorkspace')
                    } else if (task.type === 'DSA') {
                      if (task.linkedActivityId) setSelectedProblemId(task.linkedActivityId)
                      setView('dsa')
                    } else if (task.type === 'SystemDesign') {
                      if (task.linkedActivityId) setSelectedSystemDesignId(task.linkedActivityId)
                      setView('systemDesign')
                    } else if (task.type === 'Engineering') setView('labs')
                    else if (task.type === 'Mock') setView('mock')
                    else {
                      setSelectedTopicId(task.topicId || `custom-${task.id}`)
                      setActivityTab('Concepts')
                      setView('topicWorkspace')
                    }
                  }}
                />
              )
            ) : view === 'prepKit' ? (
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
            ) : view === 'dsa' ? (
              selectedProblem ? (
                <ProblemDetail
                  key={selectedProblem.id}
                  problem={selectedProblem}
                  backLabel={learningReturn === 'today' || learningReturn === 'roadmap' ? 'Back to plan' : 'Back to problems'}
                  onBack={() => {
                    setSelectedProblemId(null)
                    if (learningReturn === 'today' || learningReturn === 'roadmap') setView(learningReturn)
                  }}
                  onToast={showToast}
                  onSaveAttempt={(summary, newStatus) => {
                    setDsaAttemptSummaries((prev) => [summary, ...prev])
                    setDsaProblems((prev) => prev.map((p) => (p.id === selectedProblem.id ? { ...p, status: newStatus } : p)))
                    showToast('Attempt saved')
                  }}
                  onCreateNote={() => {
                    const newNote = {
                      id: uuidv4(),
                      title: `DSA: ${selectedProblem.title}`,
                      content: `<p>Notes for <strong>${selectedProblem.title}</strong></p>`,
                      attachments: [],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                    setPrepNotes((prev) => [newNote, ...prev])
                    setView('prepKit')
                  }}
                />
              ) : (
                <DsaWorkspace
                  problems={dsaProblems}
                  attemptSummaries={dsaAttemptSummaries}
                  revisionItems={revisionItems}
                  leetCodeConfig={leetCodeConfig}
                  setLeetCodeConfig={setLeetCodeConfig}
                  setDsaProblems={setDsaProblems}
                  onSelectProblem={(id) => {
                    setLearningReturn('dsa')
                    setSelectedProblemId(id)
                  }}
                />
              )
            ) : view === 'labs' ? (
              selectedLab ? (
                <LabTicketDetail
                  key={selectedLab.id}
                  lab={selectedLab}
                  backLabel={learningReturn === 'today' || learningReturn === 'roadmap' ? 'Back to plan' : 'Back to labs'}
                  onBack={() => {
                    setSelectedLabId(null)
                    if (learningReturn === 'today' || learningReturn === 'roadmap') setView(learningReturn)
                  }}
                  onToast={showToast}
                  onSaveAttempt={(summary, newStatus) => {
                    setLabAttemptSummaries((prev) => [summary, ...prev])
                    setEngineeringLabs((prev) => prev.map((l) => (l.id === selectedLab.id ? { ...l, status: newStatus } : l)))
                  }}
                />
              ) : (
                <LabWorkspace
                  labs={engineeringLabs}
                  attemptSummaries={labAttemptSummaries}
                  onSelectLab={(id) => {
                    setLearningReturn('labs')
                    setSelectedLabId(id)
                  }}
                />
              )
            ) : view === 'mock' ? (
              activeInterview ? (
                <InterviewSession
                  category={activeInterview.category}
                  difficulty={activeInterview.difficulty}
                  onEndSession={(summary) => {
                    setMockInterviewSummaries((prev) => [summary, ...prev])
                    setActiveInterview(null)
                    showToast('Interview saved to your history')
                  }}
                  onCancel={() => setActiveInterview(null)}
                />
              ) : (
                <MockInterviewWorkspace
                  summaries={mockInterviewSummaries}
                  onStartSession={(category, difficulty) => {
                    setActiveInterview({ category, difficulty })
                  }}
                />
              )
            ) : view === 'topicWorkspace' && selectedTopicId ? (
              selectedTopicId.startsWith('q-') ? (
                <InterviewQuestionWorkspace
                  questionId={selectedTopicId}
                  workspaces={knowledgeWorkspaces}
                  onSaveWorkspace={saveWorkspace}
                  onBack={() => setView(learningReturn)}
                />
              ) : (
                <KnowledgeWorkspaceDetail
                  key={`${selectedTopicId}:${activityTab}`}
                  initialTab={activityTab}
                  initialActivity={learningActivity}
                  onSchedule={(activity) => requireGoal({ topicId: selectedTopicId, activity })}
                  topicId={selectedTopicId}
                  workspaces={knowledgeWorkspaces}
                  onSaveWorkspace={saveWorkspace}
                  onBack={() => setView(learningReturn)}
                />
              )
            ) : view === 'tracks' || view === 'topicWorkspace' ? (
              <LearningTracksWorkspace
                setView={setView}
                setSelectedTopicId={(id) => {
                  setSelectedTopicId(id)
                  setActivityTab('Concepts')
                  setLearningActivity('')
                  setLearningReturn('tracks')
                }}
                onSchedule={(context) => requireGoal(context)}
                goals={goals}
                onGoals={setGoals}
                onTrackAdded={(goalId, trackId) => {
                  const goal = goals.find((g) => g.id === goalId)
                  if (!goal) return
                  const withTrack = { ...goal, tracks: [...goal.tracks.filter((t) => t.trackId !== trackId), { trackId, priority: 'Medium' as const }] }
                  const { roadmap: next, added } = scheduleTrackIntoRoadmap(withTrack, roadmap, trackId, dateKey())
                  persistCareer({ ...snapshotRef.current, roadmap: next })
                  setRoadmap(next)
                  showToast(added ? `Track added: ${added} tasks scheduled from today` : 'Track added. No free time left in this goal to schedule it.')
                }}
              />
            ) : view === 'systemDesign' ? (
              selectedExercise ? (
                <SystemDesignExerciseDetail
                  key={selectedExercise.id}
                  exercise={selectedExercise}
                  backLabel={learningReturn === 'today' || learningReturn === 'roadmap' ? 'Back to plan' : 'Back to exercises'}
                  onBack={() => {
                    setSelectedSystemDesignId(null)
                    if (learningReturn === 'today' || learningReturn === 'roadmap') setView(learningReturn)
                  }}
                  onToast={showToast}
                  onSaveAttempt={(summary, newStatus) => {
                    setSystemDesignAttemptSummaries((prev) => [summary, ...prev])
                    setSystemDesignExercises((prev) => prev.map((e) => (e.id === selectedExercise.id ? { ...e, status: newStatus } : e)))
                  }}
                />
              ) : (
                <SystemDesignWorkspace
                  exercises={systemDesignExercises}
                  attemptSummaries={systemDesignAttemptSummaries}
                  onSelectExercise={(id) => {
                    setLearningReturn('systemDesign')
                    setSelectedSystemDesignId(id)
                  }}
                />
              )
            ) : view === 'settings' ? (
              <SettingsWorkspace
                user={user}
                syncing={syncing}
                syncError={syncError}
                theme={theme}
                setTheme={setTheme}
                onSignIn={() => setAuthModalOpen(true)}
                onSignOut={handleSignOut}
                onRetrySync={() => setSyncEpoch((n) => n + 1)}
                onExportBackup={exportData}
                onImportBackup={importData}
                onExportLocalHistory={handleExportLocal}
                onImportLocalHistory={handleImportLocal}
                onClearLocalData={clearLocalData}
                onToast={showToast}
              />
            ) : view === 'dashboard' ? (
              <Dashboard
                applications={applications}
                roadmap={roadmap}
                goals={goals}
                dsaProblems={dsaProblems}
                dsaAttemptSummaries={dsaAttemptSummaries}
                leetCodeConfig={leetCodeConfig}
                revisionItems={revisionItems}
                knowledgeWorkspaces={knowledgeWorkspaces}
                onNavigate={setView}
                onAddApplication={openCreate}
              />
            ) : view === 'board' ? (
              <KanbanBoard
                applications={sortedApplications}
                onStatusChange={updateStatus}
                onPinToggle={togglePin}
                onEdit={openEdit}
                onDelete={deleteApplication}
                onAdd={openCreate}
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
                onAdd={openCreate}
                hasAny={applications.length > 0}
              />
            )}
          </div>
          <AppFooter />
        </div>
      </main>

      {toast && (
        <div
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-[120] animate-slide-up rounded-2xl bg-foreground/95 backdrop-blur-xl px-5 py-3 font-semibold text-background shadow-2xl border border-border/10 max-w-[calc(100vw-2rem)] text-sm sm:text-base"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      <JobForm
        open={formOpen}
        initial={editing ?? null}
        prefill={prefill ?? null}
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

      <BookmarkletModal open={bookmarkletOpen} onClose={() => setBookmarkletOpen(false)} />

      {!user && (
        <AuthPanel
          user={user}
          syncing={syncing}
          onSignedIn={handleSignedIn}
          onSignOut={handleSignOut}
          onToast={showToast}
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
        />
      )}

      {!authReady && showAuthGate && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
          <div className="animate-pulse">
            <BrandMark size={56} />
          </div>
          <p className="mt-4 font-semibold text-muted-foreground animate-pulse">Loading Prep…</p>
        </div>
      )}
      {authReady && showAuthGate && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-card/95 border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
            <HeroScene height={180} className="-mx-6 sm:-mx-8 -mt-4 sm:-mt-6" />
            <div className="flex justify-center mb-3 -mt-6 relative">
              <BrandLogo size={40} />
            </div>
            <h2 className="text-3xl font-display font-bold mb-2 text-center tracking-tight">Welcome to Prep</h2>
            <p className="text-muted-foreground text-center mb-4 font-medium text-sm">
              Sign in to sync across devices, or keep everything on this device.
            </p>
            <AuthPanel
              user={user}
              syncing={syncing}
              onSignedIn={handleSignedIn}
              onSignOut={handleSignOut}
              onToast={showToast}
              inline={true}
            />
            <button
              type="button"
              onClick={continueOffline}
              className="mt-5 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue offline (local only)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
