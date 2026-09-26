const LearningDayWorkspace = dynamic(() => import('./LearningDayWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Learning Day Workspace...</div> })
import LearningTaskPicker, { type PickerContext } from './components/LearningTaskPicker'
import { dateKey, dayDate, makeDay, allTopics } from './lib/learningPlan'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
const JobForm = dynamic(() => import('./JobForm'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Job Form...</div> })
const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Kanban Board...</div> })
const TableView = dynamic(() => import('./TableView'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Table View...</div> })
const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Dashboard...</div> })
const SearchFilter = dynamic(() => import('./SearchFilter'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Search Filter...</div> })
const EmailImport = dynamic(() => import('./EmailImport'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Email Import...</div> })
import BookmarkletModal from './BookmarkletModal.tsx'
import dynamic from 'next/dynamic'
import AppFooter from './components/AppFooter'
import BrandLogo, { BrandMark } from './components/BrandLogo'
import PrepKit from './PrepKit.tsx'
import AuthPanel from './AuthPanel.tsx'
const GmailSyncPanel = dynamic(() => import('./GmailSyncPanel'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Gmail Sync Panel...</div> })
const GoalManager = dynamic(() => import('./GoalManager'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Goal Manager...</div> })
const DsaWorkspace = dynamic(() => import('./DsaWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Dsa Workspace...</div> })
const ProblemDetail = dynamic(() => import('./ProblemDetail'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Problem Detail...</div> })
const LabWorkspace = dynamic(() => import('./LabWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Lab Workspace...</div> })
const LabTicketDetail = dynamic(() => import('./LabTicketDetail'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Lab Ticket Detail...</div> })
const MockInterviewWorkspace = dynamic(() => import('./MockInterviewWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Mock Interview Workspace...</div> })
const InterviewSession = dynamic(() => import('./InterviewSession'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Interview Session...</div> })
const readActiveMock = () => (typeof window === 'undefined' ? null : import('./InterviewSession').then((m) => m.readActiveMock()))
import { roundForTrack, type InterviewSetup } from './lib/interview/config'
const LearningTracksWorkspace = dynamic(() => import('./LearningTracksWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Learning Tracks Workspace...</div> })
const SystemDesignWorkspace = dynamic(() => import('./SystemDesignWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading System Design Workspace...</div> })
const SystemDesignExerciseDetail = dynamic(() => import('./SystemDesignExerciseDetail'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading System Design Exercise Detail...</div> })
const KnowledgeWorkspaceDetail = dynamic(() => import('./KnowledgeWorkspaceDetail'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Knowledge Workspace Detail...</div> })
const InterviewQuestionWorkspace = dynamic(() => import('./InterviewQuestionWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Interview Question Workspace...</div> })
const SettingsWorkspace = dynamic(() => import('./SettingsWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Settings Workspace...</div> })
const JobsWorkspace = dynamic(() => import('./JobsWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading Jobs...</div> })
const JobDetail = dynamic(() => import('./JobDetail'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading job...</div> })
const CommandCenter = dynamic(() => import('./CommandCenter'), { ssr: false, loading: () => <div className="cc-grid" aria-busy="true">{Array.from({ length: 6 }, (_, i) => <div key={i} className="cc-card cc-skeleton" />)}</div> })
const OnboardingFlow = dynamic(() => import('./components/onboarding/OnboardingFlow'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading setup...</div> })
const ResumeWorkspace = dynamic(() => import('./ResumeWorkspace'), { ssr: false, loading: () => <div className="p-8 flex justify-center text-muted-foreground animate-pulse">Loading resume...</div> })
import { fetchAllInterviews } from './lib/jobs/interviewClient'
import type { HistoryItem } from './lib/server/interviews'
import { fetchPlatformConfig, type LearnerJob, type PlatformConfigResponse } from './lib/jobs/client'
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
  type CurriculumTrack,
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
import Paywall from './components/Paywall'
import GoalCurriculumEditor from './components/GoalCurriculumEditor'
import { BILLING_CHANGED_EVENT, fetchBillingState, type BillingState } from './lib/billing/client'
import { BILLING_REQUIRED_EVENT } from './lib/aiGatewayClient'
import { CODE_LANGUAGES, CODE_LANGUAGE_EVENT, getCodeLanguage, setCodeLanguage } from './lib/preferences'
import { setPersonalTracks } from './lib/curriculum/registry'
import { fillRoadmap, scheduleTrackIntoRoadmap } from './lib/roadmapGenerator'
import { initGlobalHorizontalScroll } from './lib/useHorizontalScroll'
import { GlobalAmbientArt } from './components/AmbientBackgroundArt'

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

/** Views a signed-in account without a pass may use (job discovery and the application tracker). */
const FREE_VIEWS: ViewMode[] = ['home', 'jobs', 'jobDetail', 'resume', 'dashboard', 'board', 'list', 'settings']

const HEADER_COPY: Partial<Record<ViewMode, { title: string; subtitle: string }>> = {
  dashboard: { title: 'Your job search, organized.', subtitle: 'Track applications, follow-ups, and recruiting emails in one workspace.' },
  board: { title: 'Kanban board', subtitle: 'Drag your search forward one stage at a time.' },
  list: { title: 'Applications', subtitle: 'Search, filter, and bulk-update everything you have applied to.' },
  home: { title: 'Career Command Center', subtitle: 'Your goal, learning, jobs, applications, interviews and preparation in one place.' },
  today: { title: 'Your action plan', subtitle: 'Stay focused on today’s priorities.' },
  roadmap: { title: 'Career plan', subtitle: 'Execute your daily tasks and hit your professional goals.' },
  prepKit: { title: 'Preparation notes', subtitle: 'Company briefs, STAR stories, and cheat sheets with AI help.' },
  jobs: { title: 'Job discovery', subtitle: 'Openings that fit JobAppy career paths, ranked by your preferences, with the original application link.' },
  resume: { title: 'Your resume', subtitle: 'Keep resume versions privately in JobAppy and compare the current one with any opening.' },
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
  const [creatingFromPath, setCreatingFromPath] = useState<string | undefined>(undefined)
  const [editingCurriculumGoalId, setEditingCurriculumGoalId] = useState<string | null>(null)
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
  const [systemDesignExercises, setSystemDesignExercises] = useState<SystemDesignExercise[]>(() =>
    mergeSeed(stored.systemDesignExercises || [], systemDesignSeed),
  )
  const [systemDesignAttemptSummaries, setSystemDesignAttemptSummaries] = useState<SystemDesignAttemptSummary[]>(() => stored.systemDesignAttemptSummaries || [])
  const [knowledgeWorkspaces, setKnowledgeWorkspaces] = useState<KnowledgeWorkspace[]>(() => stored.knowledgeWorkspaces || [])
  const [customTracks, setCustomTracks] = useState<CurriculumTrack[]>(() => stored.customTracks || [])
  useEffect(() => {
    setPersonalTracks(customTracks)
  }, [customTracks])
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({ codeLanguage: getCodeLanguage(), ...(stored.preferences || {}) }))

  const [user, setUser] = useState<AppUser | null>(null)
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [guestMode, setGuestMode] = useState(() => readLocal(GUEST_MODE_KEY) === '1')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [syncError, setSyncError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [cloudHydrated, setCloudHydrated] = useState(false)
  const skipNextCloudSave = useRef(false)
  const [view, setViewState] = useState<ViewMode>('today')
  const homeLanded = useRef(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
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
  const [activeInterview, setActiveInterview] = useState<InterviewSetup | null>(null)
  /** A general mock interview restored after a refresh (transcript in the local store). */
  const [resumeInterview, setResumeInterview] = useState<{ id: string; startedAt: string } | null>(null)
  const [openReportId, setOpenReportId] = useState<string | null>(null)
  const [selectedSystemDesignId, setSelectedSystemDesignId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobInterviews, setJobInterviews] = useState<HistoryItem[]>([])
  useEffect(() => {
    if (view !== 'mock' || !user) return
    let cancelled = false
    fetchAllInterviews()
      .then((r) => {
        if (!cancelled) setJobInterviews(r.history)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [view, user])
  const [paywallForced, setPaywallForced] = useState(false)
  const [platformConfig, setPlatformConfig] = useState<PlatformConfigResponse | null>(null)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const modeParam = params.get('mode')
      if (modeParam === 'signup' || modeParam === 'signin') {
        setAuthMode(modeParam)
      }
    }
  }, [])

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

  useEffect(() => {
    const cleanup = initGlobalHorizontalScroll()
    return cleanup
  }, [])

  useEffect(() => {
    import('./lib/curriculum/shared').then(m => m.loadSharedTracks())
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
      customTracks,
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
      customTracks,
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
    setCustomTracks(cloud.customTracks || [])
    const cloudLanguage = cloud.preferences?.codeLanguage
    if (cloudLanguage && (CODE_LANGUAGES as readonly string[]).includes(cloudLanguage)) {
      setPreferences({ ...(cloud.preferences || {}), codeLanguage: cloudLanguage })
      if (getCodeLanguage() !== cloudLanguage) setCodeLanguage(cloudLanguage as (typeof CODE_LANGUAGES)[number])
    }
  }, [])

  // Returning visitors skip the marketing page next time (see src/proxy.ts).
  useEffect(() => {
    try {
      document.cookie = 'prep-returning=1; path=/; max-age=31536000; SameSite=Lax'
    } catch {
      // cookies blocked
    }
  }, [])

  // Pass state for the signed-in account; refreshed after checkout or a 402 from the API.
  useEffect(() => {
    if (!authReady) return
    if (!user) {
      setBilling(null)
      return
    }
    let cancelled = false
    const load = () => {
      fetchBillingState().then((state) => {
        if (!cancelled && state) setBilling(state)
      })
    }
    load()
    window.addEventListener(BILLING_CHANGED_EVENT, load)
    window.addEventListener(BILLING_REQUIRED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(BILLING_CHANGED_EVENT, load)
      window.removeEventListener(BILLING_REQUIRED_EVENT, load)
    }
  }, [authReady, user?.$id, user])

  // Feature flags, tier features and whether this account may open the admin panel.
  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    const load = () =>
      fetchPlatformConfig()
        .then((config) => {
          if (!cancelled) setPlatformConfig(config)
        })
        .catch(() => {
          // Defaults apply when the config endpoint is unreachable.
        })
    load()
    window.addEventListener(BILLING_CHANGED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(BILLING_CHANGED_EVENT, load)
    }
  }, [authReady, user?.$id])

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

  useEffect(() => {
    if (!user || homeLanded.current) return
    homeLanded.current = true
    setViewState('home')
    // A mock interview in progress survives a refresh: restore the room instead of landing on Home.
    void readActiveMock()?.then((saved) => {
      if (!saved) return
      setResumeInterview({ id: saved.id, startedAt: saved.startedAt })
      setActiveInterview(saved.setup)
      setViewState('mock')
    })
  }, [user])

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
    const modeParam = params.get('mode')
    if (modeParam === 'signup' || modeParam === 'signin') {
      setAuthMode(modeParam)
    }
    const verified = params.get('verified')
    const authError = params.get('error')
    if (verified || authError) {
      if (verified === '1') showToast('Email confirmed. Sign in to get started.')
      else if (verified === 'expired') showToast('That confirmation link has expired. Sign in to request a new one.')
      else if (verified) showToast('That confirmation link is not valid any more.')
      else if (authError === 'OAuthAccountNotLinked') showToast('This email already has a password account. Sign in with your password first.')
      else if (authError) showToast('Google sign-in did not complete. Try again.')
      const email = params.get('email')
      if (email) {
        try {
          localStorage.setItem('jobappy-last-email', email.toLowerCase())
        } catch {
          // ignore
        }
      }
      setAuthModalOpen(true)
      params.delete('verified')
      params.delete('error')
      params.delete('email')
      const rest = params.toString()
      window.history.replaceState({}, document.title, window.location.pathname + (rest ? `?${rest}` : ''))
    }
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

  /** Reuses the existing tracker: one application per canonical apply URL, starting in Wishlist. */
  const addJobToTracker = (job: LearnerJob, resumeAnalysisId?: string | null) => {
    const existing = applications.find((a) => a.jobUrl === job.applyUrl || a.jobRef?.jobId === job.id)
    if (existing) {
      showToast(`${job.company.name} is already in your tracker (${existing.status})`)
      return
    }
    const location = [job.locationCity, job.locationCountry].filter(Boolean).join(', ') || (job.workMode === 'remote' ? 'Remote' : '')
    const salary = job.salaryMin != null || job.salaryMax != null ? [job.salaryCurrency, [job.salaryMin, job.salaryMax].filter((n) => n != null).join('–'), job.salaryPeriod ? `/ ${job.salaryPeriod}` : ''].filter(Boolean).join(' ') : ''
    const newApp: JobApplication = {
      id: uuidv4(),
      company: job.company.name,
      role: job.title,
      jobUrl: job.applyUrl,
      location,
      salary: salary || null,
      appliedDate: null,
      source: job.source ? job.source.name : 'JobAppy job discovery',
      notes: `Added from JobAppy job discovery.\nOriginal listing: ${job.sourceUrl || job.applyUrl}`,
      status: 'Wishlist',
      followUpDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      interviewRounds: [],
      contacts: [],
      jobRef: { jobId: job.id, companyId: job.companyId, resumeAnalysisId: resumeAnalysisId ?? null },
    }
    setApplications((prev) => [newApp, ...prev])
    showToast(`Added ${job.company.name} to your tracker`)
  }

  /**
   * Adds curriculum tracks a job needs to the active goal and schedules them
   * into free time from today. Reuses the goal/roadmap systems: existing
   * tracks, tasks and topic selections are never touched.
   */
  const addGapsToPlan = async (trackIds: string[]): Promise<{ ok: boolean; message: string }> => {
    const goal = goals.find((g) => g.status === 'Active') || goals[0]
    if (!goal) return { ok: false, message: 'Create a learning goal first, then add gaps from a job.' }
    const missing = trackIds.filter((id) => !goal.tracks.some((t) => t.trackId === id))
    if (!missing.length) return { ok: true, message: 'Every track is already in your goal.' }
    const nextGoal: Goal = { ...goal, tracks: [...goal.tracks, ...missing.map((trackId) => ({ trackId, priority: 'Medium' as const }))], updatedAt: new Date().toISOString() }
    let nextRoadmap = roadmap
    let added = 0
    for (const trackId of missing) {
      const result = scheduleTrackIntoRoadmap(nextGoal, nextRoadmap, trackId, dateKey())
      nextRoadmap = result.roadmap
      added += result.added
    }
    const nextGoals = goals.map((g) => (g.id === goal.id ? nextGoal : g))
    persistCareer({ ...snapshotRef.current, goals: nextGoals, roadmap: nextRoadmap })
    setGoals(nextGoals)
    setRoadmap(nextRoadmap)
    const message = `Added ${missing.length} track${missing.length === 1 ? '' : 's'} to your goal${added ? ` and scheduled ${added} tasks into free days` : ''}.`
    showToast(message)
    return { ok: true, message }
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
  const isSettingUpGoal = (view === 'today' || view === 'roadmap') && (creatingGoal || (view === 'roadmap' && !goals.length))
  const header = isSettingUpGoal
    ? { title: 'Build your learning plan', subtitle: 'Choose what to learn and set a pace that works for you.' }
    : HEADER_COPY[view]
  const selectedProblem = selectedProblemId ? dsaProblems.find((p) => p.id === selectedProblemId) : undefined
  const selectedLab = selectedLabId ? engineeringLabs.find((l) => l.id === selectedLabId) : undefined
  const selectedExercise = selectedSystemDesignId ? systemDesignExercises.find((e) => e.id === selectedSystemDesignId) : undefined
  const showAuthGate = !user && !guestMode
  const hiddenViews: ViewMode[] = platformConfig && !platformConfig.flags.jobsModule ? ['jobs', 'jobDetail'] : []
  /** Paid access follows the resolved plan (subscription, pass or allowlist); the legacy entitlement is the fallback while config loads. */
  const onFreePlan = platformConfig ? platformConfig.plan.isDefault : Boolean(billing?.entitlement && !billing.entitlement.access)

  return (
    <div className="app-page text-foreground bg-background min-h-screen flex selection:bg-primary/20 relative">
      <GlobalAmbientArt />
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
        hiddenViews={hiddenViews}
        adminHref={platformConfig?.canOpenAdmin ? '/admin' : null}
      />

      <MobileNav
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onSignIn={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        hiddenViews={hiddenViews}
      />

      <main className="flex-1 min-w-0 md:ml-[280px] pb-24 md:pb-0 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none"></div>
        <div className="app-shell pt-5 sm:pt-8">
          {user && billing?.entitlement?.access && !billing.entitlement.complimentary && billing.entitlement.daysLeft <= 7 && (
            <div className="trial-banner">
              <span>
                <strong>{billing.entitlement.daysLeft === 1 ? 'Your pass ends tomorrow.' : `Your pass ends in ${billing.entitlement.daysLeft} days.`}</strong> Extend it now and the new days are added to the end.
              </span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setView('settings')}>
                Extend pass
              </button>
            </div>
          )}
          {user && billing?.entitlement && onFreePlan && FREE_VIEWS.includes(view) && (
            <div className="trial-banner" role="status">
              <span>
                <strong>Free plan.</strong> Job discovery and the application tracker are included. Learning tracks, AI and personalised job matching are part of Prep Pro.
              </span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPaywallForced(true)}>
                See plans
              </button>
            </div>
          )}
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

          {editingCurriculumGoalId && goals.some((g) => g.id === editingCurriculumGoalId) && (
            <GoalCurriculumEditor
              goal={goals.find((g) => g.id === editingCurriculumGoalId)!}
              customTracks={customTracks}
              onCustomTracksChange={setCustomTracks}
              onClose={() => setEditingCurriculumGoalId(null)}
              onOpenTopic={(topicId) => {
                setEditingCurriculumGoalId(null)
                setLearningReturn('roadmap')
                setSelectedTopicId(topicId)
                setActivityTab('Concepts')
                setLearningActivity('')
                setView('topicWorkspace')
              }}
              onSave={(goal, replan) => {
                const nextGoals = goals.map((g) => (g.id === goal.id ? goal : g))
                let nextRoadmap = roadmap
                let added = 0
                if (replan) {
                  const result = fillRoadmap(goal, roadmap, dateKey())
                  nextRoadmap = result.roadmap
                  added = result.added
                }
                persistCareer({ ...snapshotRef.current, goals: nextGoals, roadmap: nextRoadmap })
                setGoals(nextGoals)
                setRoadmap(nextRoadmap)
                setEditingCurriculumGoalId(null)
                showToast(replan ? (added ? `Curriculum saved. ${added} tasks scheduled into free days.` : 'Curriculum saved. Nothing new to schedule.') : 'Curriculum saved')
              }}
            />
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
                  initialPathId={creatingFromPath}
                  customTracks={customTracks}
                  onCustomTracksChange={setCustomTracks}
                  onCancel={goals.length ? () => {
                    setCreatingGoal(false)
                    setCreatingFromPath(undefined)
                  } : undefined}
                  onOpenTopic={(topicId) => {
                    setLearningReturn('roadmap')
                    setSelectedTopicId(topicId)
                    setActivityTab('Concepts')
                    setLearningActivity('')
                    setView('topicWorkspace')
                  }}
                  onSaveGoal={(goal, days, next) => {
                    setGoals((prev) => (prev.some((g) => g.id === goal.id) ? prev.map((g) => (g.id === goal.id ? goal : g)) : [...prev, goal]))
                    if (days.length) {
                      setRoadmap((prev) => [
                        ...prev,
                        ...days.filter((d) => !prev.some((old) => old.goalId === d.goalId && dayDate(old.date) === dayDate(d.date))),
                      ])
                    }
                    setPlanGoalId(goal.id)
                    setPlanDate(dayDate(goal.startDate))
                    setCreatingGoal(false)
                    setCreatingFromPath(undefined)
                    if (next === 'start') {
                      const first = goal.tracks
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((t) => {
                          const include = t.topicIds ? new Set(t.topicIds) : null
                          const exclude = new Set([...(t.excludedTopicIds || []), ...(goal.knownTopicIds || [])])
                          return allTopics().find((x) => x.track.id === t.trackId && (!include || include.has(x.topic.id)) && !exclude.has(x.topic.id))
                        })
                        .find(Boolean)
                      if (first) {
                        setLearningReturn('roadmap')
                        setSelectedTopicId(first.topic.id)
                        setActivityTab('Concepts')
                        setLearningActivity('')
                        setView('topicWorkspace')
                        showToast('Goal created. Starting with your first topic.')
                        return
                      }
                    }
                    showToast(next === 'roadmap' ? 'Goal created. Your roadmap is ready.' : 'Goal created. Add tasks from any day or topic.')
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
                  onEditCurriculum={(goalId) => setEditingCurriculumGoalId(goalId)}
                  onReplan={(goalId) => {
                    const goal = goals.find((g) => g.id === goalId)
                    if (!goal) return
                    const { roadmap: next, added } = fillRoadmap(goal, roadmap, dateKey())
                    persistCareer({ ...snapshotRef.current, roadmap: next })
                    setRoadmap(next)
                    showToast(added ? `${added} tasks scheduled into free days` : 'Nothing left to plan: every topic is already scheduled or the goal has no free time')
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
                    const info = allTopics().find(
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
                      setActiveInterview({ roundId: roundForTrack(info?.track.title), level: 'Medium', minutes: 30, personaId: 'standard', voice: true, candidateName: user?.name || undefined })
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
            ) : view === 'home' ? (
              user && !guestMode && (onboardingOpen || (!preferences.onboarding?.completedAt && !onboardingDismissed)) ? (
                <OnboardingFlow
                  userName={user.name || null}
                  hasGoal={goals.length > 0}
                  canUploadResume={(platformConfig?.features ?? []).includes('resume.profile')}
                  onCreateGoal={(goal, nextRoadmap) => {
                    setGoals((prev) => [...prev, goal])
                    setRoadmap((prev) => [...prev, ...nextRoadmap])
                  }}
                  onComplete={(state) => {
                    setPreferences((p) => ({ ...p, onboarding: state }))
                    setOnboardingOpen(false)
                    setOnboardingDismissed(true)
                  }}
                  onToast={showToast}
                />
              ) : (
                <CommandCenter
                  user={user}
                  goals={goals}
                  roadmap={roadmap}
                  knowledgeWorkspaces={knowledgeWorkspaces}
                  applications={applications}
                  revisionItems={revisionItems}
                  mockInterviewSummaries={mockInterviewSummaries}
                  onboarding={preferences.onboarding ?? null}
                  plan={platformConfig ? platformConfig.plan : null}
                  features={platformConfig?.features ?? []}
                  onNavigate={setView}
                  onOpenJob={(id) => {
                    setSelectedJobId(id)
                    setView('jobDetail')
                  }}
                  onStartOnboarding={() => setOnboardingOpen(true)}
                  onSignIn={() => setAuthModalOpen(true)}
                />
              )
            ) : view === 'jobs' ? (
              <JobsWorkspace
                user={user}
                features={platformConfig?.features ?? []}
                disabledRoleFamilies={platformConfig?.disabledRoleFamilies ?? []}
                goals={goals}
                roadmap={roadmap}
                knowledgeWorkspaces={knowledgeWorkspaces}
                onOpenJob={(id) => {
                  setSelectedJobId(id)
                  setView('jobDetail')
                }}
                onSignIn={() => setAuthModalOpen(true)}
                onUpgrade={() => setPaywallForced(true)}
                onToast={showToast}
              />
            ) : view === 'jobDetail' && selectedJobId ? (
              <JobDetail
                key={selectedJobId}
                jobId={selectedJobId}
                user={user}
                features={platformConfig?.features ?? []}
                goals={goals}
                roadmap={roadmap}
                knowledgeWorkspaces={knowledgeWorkspaces}
                applications={applications}
                onBack={() => setView('jobs')}
                onOpenTrack={() => setView('tracks')}
                onOpenTopic={(topicId) => {
                  setLearningReturn('jobDetail')
                  setSelectedTopicId(topicId)
                  setActivityTab('Concepts')
                  setLearningActivity('')
                  setView('topicWorkspace')
                }}
                onAddPlan={async (nextRoadmap) => {
                  persistCareer({ ...snapshotRef.current, roadmap: nextRoadmap })
                  setRoadmap(nextRoadmap)
                  const added = nextRoadmap.flatMap((d) => d.tasks).length - roadmap.flatMap((d) => d.tasks).length
                  showToast(`Added ${added} preparation task${added === 1 ? '' : 's'} to your calendar`)
                }}
                onOpenResumes={() => setView('resume')}
                onOpenTracker={() => setView('list')}
                onAddToTracker={addJobToTracker}
                onAddGaps={addGapsToPlan}
                onSignIn={() => setAuthModalOpen(true)}
                onUpgrade={() => setPaywallForced(true)}
              />
            ) : view === 'resume' ? (
              <ResumeWorkspace
                user={user}
                features={platformConfig?.features ?? []}
                onSignIn={() => setAuthModalOpen(true)}
                onUpgrade={() => setPaywallForced(true)}
                onToast={showToast}
                onOpenJobs={() => setView('jobs')}
                onOpenJob={(id) => {
                  setSelectedJobId(id)
                  setView('jobDetail')
                }}
                onOpenTrack={() => setView('tracks')}
              />
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
                  leetCodeConfig={leetCodeConfig}
                  onUpdateProblem={(updated) => {
                    setDsaProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                  }}
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
                  setup={activeInterview}
                  resume={resumeInterview}
                  onEndSession={(summary) => {
                    setMockInterviewSummaries((prev) => [summary, ...prev])
                    setActiveInterview(null)
                    setResumeInterview(null)
                    setOpenReportId(summary.id)
                    showToast(summary.incomplete ? 'Interview saved without feedback' : 'Feedback ready')
                  }}
                  onCancel={() => {
                    setActiveInterview(null)
                    setResumeInterview(null)
                  }}
                  onOpenSettings={() => setView('settings')}
                />
              ) : (
                <MockInterviewWorkspace
                  summaries={mockInterviewSummaries}
                  jobInterviews={jobInterviews}
                  onOpenJob={(id) => {
                    setSelectedJobId(id)
                    setView('jobDetail')
                  }}
                  onStartSession={(setup) => {
                    setResumeInterview(null)
                    setActiveInterview({ ...setup, candidateName: user?.name || undefined })
                  }}
                  onOpenSettings={() => setView('settings')}
                  openReportId={openReportId}
                  onReportClosed={() => setOpenReportId(null)}
                  onDeleteInterview={(id) => setMockInterviewSummaries((prev) => prev.filter((s) => s.id !== id))}
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
                onUsePath={(path) => {
                  setCreatingFromPath(path.id)
                  setCreatingGoal(true)
                  setView('roadmap')
                }}
                onEditCurriculum={(goalId) => setEditingCurriculumGoalId(goalId)}
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
                billing={billing}
                onBillingChange={(entitlement) => setBilling((b) => (b ? { ...b, entitlement } : b))}
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
          initialMode={authMode}
          onModeChange={setAuthMode}
          onSignedIn={handleSignedIn}
          onSignOut={handleSignOut}
          onToast={showToast}
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
        />
      )}

      {user && billing?.entitlement && onFreePlan && (paywallForced || !FREE_VIEWS.includes(view)) && (
        <Paywall
          billing={billing}
          email={user.email}
          onPurchased={(entitlement) => {
            setBilling((b) => (b ? { ...b, entitlement } : b))
            setPaywallForced(false)
            showToast('Welcome to Prep Pro')
          }}
          onSignOut={handleSignOut}
          onContinueFree={() => {
            setPaywallForced(false)
            if (!FREE_VIEWS.includes(view)) setView('jobs')
          }}
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
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Subtle atmospheric ambient glow */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
          </div>

          <div className="relative w-full max-w-4xl bg-card border border-border/70 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-emerald-500 z-10" />

            {/* Left Column: Brand, Value Props & Social Proof (Hidden on smaller screens) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-b from-muted/40 via-muted/20 to-background border-r border-border/50 relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-8">
                  <BrandLogo size={36} />
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Career Suite
                  </span>
                </div>

                <h2 className="text-2xl font-display font-extrabold tracking-tight text-foreground mb-3 leading-tight">
                  Master High-Stakes Tech Interviews.
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-8">
                  The complete engineering preparation workspace with zero-to-one architecture, voice AI mocks, and local-first privacy.
                </p>

                {/* Key Pillars */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">157 Interactive Tracks</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">System design, algorithms, concurrency, and real-world microservice labs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Voice AI Mock Rounds</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Live voice evaluation simulating Staff & Principal panel interviews.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Encrypted Cloud or Local</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Sync across all devices or run 100% offline with zero telemetry.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote pill */}
              <div className="mt-8 pt-5 border-t border-border/40">
                <p className="text-xs italic text-muted-foreground leading-snug">
                  "Prep gave me the structured rigor I needed for Staff rounds at tier-1 tech companies."
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">S</div>
                  <span className="text-[11px] font-medium text-foreground">Senior Staff Architect</span>
                  <span className="text-[11px] text-muted-foreground">• San Francisco</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-card">
              {/* Mobile Brand Header */}
              <div className="lg:hidden flex items-center justify-between mb-5">
                <BrandLogo size={30} />
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Career Suite
                </span>
              </div>

              <div className="mb-5">
                <h3 className="text-2xl font-display font-bold tracking-tight text-foreground">
                  {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {authMode === 'signup'
                    ? 'Start tracking 157 curricula, taking voice mock rounds, and syncing progress.'
                    : 'Sign in to access your interview workspace, syllabus tracks, and notes.'}
                </p>
              </div>

              <AuthPanel
                user={user}
                syncing={syncing}
                initialMode={authMode}
                onModeChange={setAuthMode}
                onSignedIn={handleSignedIn}
                onSignOut={handleSignOut}
                onToast={showToast}
                inline={true}
              />

              <div className="mt-5 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={continueOffline}
                  className="font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-muted/50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m0 0l2.829-2.829m-2.829 2.829L3 21m2.828-12.536a5 5 0 017.072 0m0 0l2.829 2.829M3 3l18 18" />
                  </svg>
                  <span>Continue offline (local only)</span>
                </button>

                <a
                  href="/"
                  className="font-medium text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  Back to homepage
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
