import { v4 as uuidv4 } from 'uuid'
import { findMatchingApplication, parseJobEmail, type EmailParseResult } from '../../emailParser'
import { parseJobEmailWithGroq } from '../groqEmail'
import { hasGroqApiKey } from '../groq'
import {
  shouldApplyIncomingStatus,
  type GmailSyncedEmail,
  type GmailSyncState,
  type JobApplication,
  type Status,
} from '../../types'
import {
  getGmailMessage,
  getGmailProfile,
  headerValue,
  listJobEmailMessageIds,
  messageToRawEmail,
  type GmailMessage,
} from './api'
import { getCachedGmailAccessToken, requestGmailAccessToken } from './oauth'

export type GmailSyncProgress = {
  phase: 'auth' | 'listing' | 'processing' | 'done' | 'error'
  current: number
  total: number
  message: string
}

export type GmailSyncResult = {
  applications: JobApplication[]
  gmailSync: GmailSyncState
  created: number
  updated: number
  skipped: number
  processed: number
}

function extractRecruiter(fromHeader: string): { name: string; email: string } {
  const email = fromHeader.match(/[\w.+-]+@[\w.-]+/)?.[0] || ''
  const name = (fromHeader.match(/^([^<]+)</)?.[1] || fromHeader.replace(email, '')).trim()
  return { name: name.replace(/["']/g, '').trim(), email }
}

function extractInterviewDate(text: string): string | null {
  const patterns = [
    /(?:interview|call|meeting)\s+(?:on|for)\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /(?:scheduled|schedule)\s+(?:for|on)\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /\b(\d{4}-\d{2}-\d{2})\b/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match?.[1]) continue
    const d = new Date(match[1])
    if (!Number.isNaN(d.getTime())) return d.toISOString().split('T')[0]
  }
  return null
}

function looksJobRelated(parsed: EmailParseResult, subject: string, from: string): boolean {
  const hay = `${subject} ${from} ${parsed.notes}`.toLowerCase()
  const keywords =
    /job|career|recruit|talent|hiring|interview|application|offer|assessment|shortlist|candidate|role|position|hackerrank|coderpad|lever|greenhouse|ashby|workday/
  if (!keywords.test(hay) && !parsed.company) return false
  if (parsed.confidence === 'low' && !parsed.company && parsed.role === 'Role TBD') return false
  return true
}

async function analyzeEmail(raw: string): Promise<{
  parsed: EmailParseResult
  method: 'rules' | 'ai'
}> {
  const rules = parseJobEmail(raw)
  const ambiguous =
    rules.confidence === 'low' ||
    !rules.company ||
    rules.role === 'Role TBD' ||
    rules.signals.includes('defaulted to Applied')

  if (ambiguous && hasGroqApiKey()) {
    try {
      const ai = await parseJobEmailWithGroq(raw)
      return { parsed: { ...ai, source: 'Gmail sync (AI)' }, method: 'ai' }
    } catch {
      return { parsed: { ...rules, source: 'Gmail sync' }, method: 'rules' }
    }
  }

  return { parsed: { ...rules, source: 'Gmail sync' }, method: 'rules' }
}

function findByGmailIds(
  apps: JobApplication[],
  messageId: string,
  threadId: string,
): JobApplication | undefined {
  return apps.find(
    (app) =>
      app.gmailMessageIds?.includes(messageId) ||
      (threadId && app.gmailThreadId === threadId),
  )
}

function mergeApplication(
  existing: JobApplication,
  parsed: EmailParseResult,
  message: GmailMessage,
  recruiter: { name: string; email: string },
  interviewDate: string | null,
): JobApplication {
  const ids = new Set([...(existing.gmailMessageIds || []), message.id])
  const nextStatus = shouldApplyIncomingStatus(existing.status, parsed.status)
    ? parsed.status
    : existing.status

  const contacts = [...(existing.contacts || [])]
  if (recruiter.email && !contacts.some((c) => c.email.toLowerCase() === recruiter.email.toLowerCase())) {
    contacts.push({
      id: uuidv4(),
      name: recruiter.name || 'Recruiter',
      role: 'Recruiter',
      email: recruiter.email,
      linkedin: '',
    })
  }

  let interviewRounds = existing.interviewRounds || []
  if (interviewDate) {
    const hasDate = interviewRounds.some((r) => r.date === interviewDate)
    if (!hasDate) {
      interviewRounds = [
        {
          id: uuidv4(),
          name: nextStatus === 'HR Round' ? 'HR Round' : 'Interview',
          date: interviewDate,
          notes: 'Detected from Gmail',
          passed: null,
        },
        ...interviewRounds,
      ]
    }
  }

  const noteBlock = [
    existing.notes,
    `--- Gmail ${new Date().toISOString().slice(0, 10)} ---`,
    parsed.notes,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    ...existing,
    company: existing.company || parsed.company,
    role:
      existing.role && existing.role !== 'Role TBD'
        ? existing.role
        : parsed.role || existing.role,
    status: nextStatus,
    jobUrl: existing.jobUrl || parsed.jobUrl,
    location: existing.location || parsed.location,
    appliedDate: existing.appliedDate || parsed.appliedDate,
    source: existing.source || 'Gmail sync',
    notes: noteBlock.slice(0, 12000),
    followUpDate: existing.followUpDate || interviewDate,
    interviewDate: existing.interviewDate || interviewDate,
    recruiterName: existing.recruiterName || recruiter.name || null,
    recruiterEmail: existing.recruiterEmail || recruiter.email || null,
    gmailMessageIds: [...ids],
    gmailThreadId: existing.gmailThreadId || message.threadId,
    contacts,
    interviewRounds,
    pinned:
      existing.pinned ||
      nextStatus === 'Interview' ||
      nextStatus === 'Offer' ||
      nextStatus === 'HR Round',
    updatedAt: new Date().toISOString(),
  }
}

function createApplication(
  parsed: EmailParseResult,
  message: GmailMessage,
  recruiter: { name: string; email: string },
  interviewDate: string | null,
): JobApplication {
  const now = new Date().toISOString()
  const contacts =
    recruiter.email || recruiter.name
      ? [
          {
            id: uuidv4(),
            name: recruiter.name || 'Recruiter',
            role: 'Recruiter',
            email: recruiter.email,
            linkedin: '',
          },
        ]
      : []

  const interviewRounds = interviewDate
    ? [
        {
          id: uuidv4(),
          name: parsed.status === 'HR Round' ? 'HR Round' : 'Interview',
          date: interviewDate,
          notes: 'Detected from Gmail',
          passed: null,
        },
      ]
    : []

  return {
    id: uuidv4(),
    company: parsed.company || 'Unknown company',
    role: parsed.role || 'Role TBD',
    jobUrl: parsed.jobUrl || '',
    location: parsed.location || '',
    salary: null,
    appliedDate: parsed.appliedDate,
    source: 'Gmail sync',
    notes: parsed.notes,
    status: parsed.status,
    followUpDate: interviewDate,
    createdAt: now,
    updatedAt: now,
    pinned:
      parsed.status === 'Interview' ||
      parsed.status === 'Offer' ||
      parsed.status === 'HR Round',
    interviewRounds,
    contacts,
    gmailMessageIds: [message.id],
    gmailThreadId: message.threadId,
    recruiterName: recruiter.name || null,
    recruiterEmail: recruiter.email || null,
    interviewDate,
  }
}

export async function runGmailSync(options: {
  applications: JobApplication[]
  gmailSync: GmailSyncState
  onProgress?: (progress: GmailSyncProgress) => void
}): Promise<GmailSyncResult> {
  const onProgress = options.onProgress || (() => undefined)
  let applications = [...options.applications]
  const gmailSync: GmailSyncState = {
    ...options.gmailSync,
    processedMessageIds: [...(options.gmailSync.processedMessageIds || [])],
    syncedEmails: [...(options.gmailSync.syncedEmails || [])],
  }

  onProgress({ phase: 'auth', current: 0, total: 0, message: 'Connecting to Gmail…' })
  const accessToken =
    getCachedGmailAccessToken() || (await requestGmailAccessToken())

  const profile = await getGmailProfile(accessToken)
  gmailSync.connectedEmail = profile.emailAddress

  onProgress({
    phase: 'listing',
    current: 0,
    total: 0,
    message: 'Scanning latest job emails…',
  })
  // Always start from newest mail in the recent window — never from lastSyncAt.
  // Already-seen messages are skipped via processedMessageIds (duplicate prevention).
  const listed = await listJobEmailMessageIds(accessToken, {
    maxResults: 40,
    newerThanDays: 45,
  })

  const processed = new Set(gmailSync.processedMessageIds)
  const pending = listed.messages.filter((m) => !processed.has(m.id))

  let created = 0
  let updated = 0
  let skipped = 0

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i]
    onProgress({
      phase: 'processing',
      current: i + 1,
      total: pending.length,
      message: `Analyzing email ${i + 1} of ${pending.length}…`,
    })

    try {
      const message = await getGmailMessage(accessToken, item.id)
      const raw = messageToRawEmail(message)
      const subject = headerValue(message, 'Subject')
      const from = headerValue(message, 'From')
      const { parsed, method } = await analyzeEmail(raw)
      const recruiter = extractRecruiter(from)
      const interviewDate = extractInterviewDate(raw)

      if (!looksJobRelated(parsed, subject, from)) {
        skipped += 1
        const record: GmailSyncedEmail = {
          messageId: message.id,
          threadId: message.threadId,
          subject,
          from,
          snippet: message.snippet || '',
          internalDate: message.internalDate,
          processedAt: new Date().toISOString(),
          applicationId: null,
          company: parsed.company,
          role: parsed.role,
          status: null,
          confidence: parsed.confidence,
          method: 'skipped',
          skipped: true,
          skipReason: 'Not classified as a job application email',
        }
        gmailSync.syncedEmails = [record, ...gmailSync.syncedEmails].slice(0, 200)
        processed.add(message.id)
        continue
      }

      const byId = findByGmailIds(applications, message.id, message.threadId)
      const byCompany = findMatchingApplication(applications, parsed.company, parsed.role)
      const existing = byId || byCompany

      let applicationId: string | null = null
      if (existing) {
        const merged = mergeApplication(existing, parsed, message, recruiter, interviewDate)
        applications = applications.map((app) => (app.id === existing.id ? merged : app))
        applicationId = existing.id
        updated += 1
      } else if (parsed.company) {
        const createdApp = createApplication(parsed, message, recruiter, interviewDate)
        applications = [createdApp, ...applications]
        applicationId = createdApp.id
        created += 1
      } else {
        skipped += 1
        const record: GmailSyncedEmail = {
          messageId: message.id,
          threadId: message.threadId,
          subject,
          from,
          snippet: message.snippet || '',
          internalDate: message.internalDate,
          processedAt: new Date().toISOString(),
          applicationId: null,
          company: '',
          role: parsed.role,
          status: parsed.status,
          confidence: parsed.confidence,
          method,
          skipped: true,
          skipReason: 'Could not detect company',
        }
        gmailSync.syncedEmails = [record, ...gmailSync.syncedEmails].slice(0, 200)
        processed.add(message.id)
        continue
      }

      const record: GmailSyncedEmail = {
        messageId: message.id,
        threadId: message.threadId,
        subject,
        from,
        snippet: message.snippet || '',
        internalDate: message.internalDate,
        processedAt: new Date().toISOString(),
        applicationId,
        company: parsed.company,
        role: parsed.role,
        status: parsed.status,
        confidence: parsed.confidence,
        method,
        skipped: false,
        jobUrl: parsed.jobUrl,
        recruiterName: recruiter.name,
        recruiterEmail: recruiter.email,
        interviewDate,
      }
      gmailSync.syncedEmails = [record, ...gmailSync.syncedEmails].slice(0, 200)
      processed.add(message.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process email'
      skipped += 1
      const failRecord: GmailSyncedEmail = {
        messageId: item.id,
        threadId: item.threadId,
        subject: '(failed)',
        from: '',
        snippet: message,
        internalDate: String(Date.now()),
        processedAt: new Date().toISOString(),
        applicationId: null,
        company: '',
        role: '',
        status: null,
        confidence: 'low',
        method: 'skipped',
        skipped: true,
        skipReason: message,
      }
      gmailSync.syncedEmails = [failRecord, ...gmailSync.syncedEmails].slice(0, 200)
      processed.add(item.id)
    }
  }

  gmailSync.processedMessageIds = [...processed].slice(-800)
  gmailSync.lastSyncAt = new Date().toISOString()

  onProgress({
    phase: 'done',
    current: pending.length,
    total: pending.length,
    message: `Sync complete — ${created} created, ${updated} updated, ${skipped} skipped`,
  })

  return {
    applications,
    gmailSync,
    created,
    updated,
    skipped,
    processed: pending.length,
  }
}

export function applyManualEmailCorrection(options: {
  applications: JobApplication[]
  gmailSync: GmailSyncState
  messageId: string
  patch: {
    company: string
    role: string
    status: Status
    jobUrl?: string
  }
}): { applications: JobApplication[]; gmailSync: GmailSyncState } {
  const record = options.gmailSync.syncedEmails.find((e) => e.messageId === options.messageId)
  if (!record) return { applications: options.applications, gmailSync: options.gmailSync }

  let applications = [...options.applications]
  const existing =
    (record.applicationId && applications.find((a) => a.id === record.applicationId)) ||
    findMatchingApplication(applications, options.patch.company, options.patch.role)

  if (existing) {
    applications = applications.map((app) =>
      app.id === existing.id
        ? {
            ...app,
            company: options.patch.company.trim() || app.company,
            role: options.patch.role.trim() || app.role,
            status: options.patch.status,
            jobUrl: options.patch.jobUrl?.trim() || app.jobUrl,
            gmailMessageIds: [...new Set([...(app.gmailMessageIds || []), record.messageId])],
            gmailThreadId: app.gmailThreadId || record.threadId,
            updatedAt: new Date().toISOString(),
          }
        : app,
    )
  } else {
    const now = new Date().toISOString()
    const created: JobApplication = {
      id: uuidv4(),
      company: options.patch.company.trim() || 'Unknown company',
      role: options.patch.role.trim() || 'Role TBD',
      jobUrl: options.patch.jobUrl?.trim() || '',
      location: '',
      salary: null,
      appliedDate: now.slice(0, 10),
      source: 'Gmail sync (manual)',
      notes: `Manually corrected from Gmail: ${record.subject}`,
      status: options.patch.status,
      followUpDate: null,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      interviewRounds: [],
      contacts: [],
      gmailMessageIds: [record.messageId],
      gmailThreadId: record.threadId,
      recruiterName: record.recruiterName || null,
      recruiterEmail: record.recruiterEmail || null,
      interviewDate: record.interviewDate || null,
    }
    applications = [created, ...applications]
    record.applicationId = created.id
  }

  const syncedEmails = options.gmailSync.syncedEmails.map((e) =>
    e.messageId === options.messageId
      ? {
          ...e,
          company: options.patch.company.trim(),
          role: options.patch.role.trim(),
          status: options.patch.status,
          jobUrl: options.patch.jobUrl,
          method: 'manual' as const,
          skipped: false,
          skipReason: undefined,
          applicationId:
            e.applicationId ||
            applications.find(
              (a) =>
                a.gmailMessageIds?.includes(e.messageId) || a.company === options.patch.company,
            )?.id ||
            null,
        }
      : e,
  )

  return {
    applications,
    gmailSync: { ...options.gmailSync, syncedEmails },
  }
}
