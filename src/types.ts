export interface JobApplication {
  id: string
  company: string
  role: string
  jobUrl: string
  location: string
  salary: string | null
  appliedDate: string | null
  source: string | null
  notes: string
  status: Status
  followUpDate: string | null
  createdAt: string
  updatedAt: string
  pinned: boolean
  interviewRounds: InterviewRound[]
  contacts: Contact[]
  /** Gmail message ids linked to this application */
  gmailMessageIds?: string[]
  gmailThreadId?: string | null
  recruiterName?: string | null
  recruiterEmail?: string | null
  interviewDate?: string | null
}

export interface Contact {
  id: string
  name: string
  role: string
  email: string
  linkedin: string
}

export interface Attachment {
  id: string
  filename: string
  size: number
  type: string
}

export interface PrepNote {
  id: string
  title: string
  content: string
  attachments: Attachment[]
  updatedAt: string
  createdAt: string
}

export interface InterviewRound {
  id: string
  name: string
  date: string | null
  notes: string
  passed: boolean | null
}

export type Status =
  | 'Wishlist'
  | 'Applied'
  | 'Under Review'
  | 'Assessment'
  | 'Interview'
  | 'HR Round'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'

export const STATUS_ORDER: Status[] = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Assessment',
  'Interview',
  'HR Round',
  'Offer',
  'Rejected',
  'Withdrawn',
]

export const ACTIVE_STATUSES: Status[] = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Assessment',
  'Interview',
  'HR Round',
  'Offer',
]

export type GmailParseMethod = 'rules' | 'ai' | 'manual' | 'skipped'

export interface GmailSyncedEmail {
  messageId: string
  threadId: string
  subject: string
  from: string
  snippet: string
  internalDate: string
  processedAt: string
  applicationId: string | null
  company: string
  role: string
  status: Status | null
  confidence: 'high' | 'medium' | 'low'
  method: GmailParseMethod
  skipped: boolean
  skipReason?: string
  jobUrl?: string
  recruiterName?: string
  recruiterEmail?: string
  interviewDate?: string | null
}

export interface GmailSyncState {
  connectedEmail: string | null
  lastSyncAt: string | null
  /** Gmail history id from last successful list (informational) */
  lastHistoryId: string | null
  processedMessageIds: string[]
  syncedEmails: GmailSyncedEmail[]
}

export function emptyGmailSyncState(): GmailSyncState {
  return {
    connectedEmail: null,
    lastSyncAt: null,
    lastHistoryId: null,
    processedMessageIds: [],
    syncedEmails: [],
  }
}

export interface Storage {
  applications: JobApplication[]
  version: number
  prepNotes?: PrepNote[]
  gmailSync?: GmailSyncState
}

const STORAGE_KEY = 'job-app-tracker-v2'

export function loadStorage(): Storage {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as Storage
      if (parsed && Array.isArray(parsed.applications)) {
        return {
          applications: parsed.applications,
          version: parsed.version ?? 1,
          prepNotes: parsed.prepNotes || [],
          gmailSync: parsed.gmailSync || emptyGmailSyncState(),
        }
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return { applications: [], version: 1, gmailSync: emptyGmailSyncState() }
}

export function saveStorage(storage: Storage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export type NewJobApplication = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>

export function isOverdue(followUpDate: string | null): boolean {
  if (!followUpDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(followUpDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Prefer advancing statuses; still allow Rejected/Withdrawn updates. */
export function shouldApplyIncomingStatus(current: Status, incoming: Status): boolean {
  if (current === incoming) return false
  if (incoming === 'Rejected' || incoming === 'Withdrawn') return true
  if (current === 'Rejected' || current === 'Withdrawn') return false
  if (current === 'Offer' && incoming !== 'Offer') return false
  return STATUS_ORDER.indexOf(incoming) >= STATUS_ORDER.indexOf(current)
}
