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

export interface Storage {
  applications: JobApplication[]
  version: number
  prepNotes?: PrepNote[]
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
        }
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return { applications: [], version: 1 }
}

export function saveStorage(storage: Storage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export type NewJobApplication = Omit<
  JobApplication,
  'id' | 'createdAt' | 'updatedAt'
>

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
