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

const NON_JOB_NOISE =
  /\b(invoice|receipt|order confirmation|your order|shipped|shipping|tracking number|newsletter|unsubscribe|password reset|otp|one[- ]time (?:code|password)|verification code|security alert|payment (?:received|failed)|subscription|delivery|package|refund|bank statement|credit card|promo code|flash sale|limited time offer|wishlist|shopping (?:cart|bag)|flight (?:booking|itinerary)|hotel reservation)\b/i

const STRONG_JOB_SIGNAL =
  /\b(thank you for applying|thanks for applying|application (?:received|submitted|to|for)|your application|interview|phone screen|coding challenge|online assessment|hackerrank|coderpad|shortlist(?:ed)?|recruiting|talent acquisition|talent team|hiring team|job offer|offer letter|offer of employment|position of|role of|candidate|not moving forward|unfortunately.{0,80}(?:application|position|role|candidacy)|moved forward with your|next steps in your application|careers@|recruiting@|hiring@|greenhouse|lever\.co|ashbyhq|myworkday|workday)\b/i

const ATS_OR_RECRUITER_FROM =
  /(careers@|recruiting@|talent@|hiring@|jobs@|greenhouse|lever\.co|ashbyhq|myworkday|workable|smartrecruiters|icims|jobvite|successfactors|recruiting\.|talent\.)/i

/** Cheap pre-check before parsing/AI — drops consumer/noise mail early. */
function isLikelyRecruitingEmail(subject: string, from: string, snippet: string): boolean {
  const hay = `${subject}\n${from}\n${snippet}`
  if (NON_JOB_NOISE.test(hay)) return false
  if (ATS_OR_RECRUITER_FROM.test(from)) return true
  if (STRONG_JOB_SIGNAL.test(hay)) return true
  return false
}

function looksJobRelated(
  parsed: EmailParseResult,
  subject: string,
  from: string,
  snippet: string,
): boolean {
  const hay = `${subject}\n${from}\n${snippet}\n${parsed.notes}`.toLowerCase()

  if (NON_JOB_NOISE.test(hay)) return false
  if (!isLikelyRecruitingEmail(subject, from, snippet) && !STRONG_JOB_SIGNAL.test(hay)) {
    return false
  }

  const weakParse =
    parsed.confidence === 'low' ||
    !parsed.company ||
    parsed.role === 'Role TBD' ||
    parsed.signals.includes('defaulted to Applied')

  // Need a real company; reject vague defaults unless signals are strong.
  if (!parsed.company) return false
  if (weakParse && !STRONG_JOB_SIGNAL.test(`${subject}\n${from}\n${snippet}`)) return false
  if (parsed.role === 'Role TBD' && parsed.signals.includes('defaulted to Applied')) {
    // Only keep if subject clearly mentions applying/interview/offer for a role/company
    if (!/application|interview|offer|assessment|shortlist|hackerrank|coding challenge/i.test(subject)) {
      return false
    }
  }

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

  // Only spend AI on emails that already look like recruiting mail.
  const subject = raw.match(/^Subject:\s*(.+)$/im)?.[1] || ''
  const from = raw.match(/^From:\s*(.+)$/im)?.[1] || ''
  if (ambiguous && hasGroqApiKey() && isLikelyRecruitingEmail(subject, from, rules.notes.slice(0, 200))) {
    try {
      const ai = await parseJobEmailWithGroq(raw)
      // AI can invent job apps from noise — keep only if still job-like.
      if (!STRONG_JOB_SIGNAL.test(`${subject}\n${from}\n${ai.notes}`) && !ATS_OR_RECRUITER_FROM.test(from)) {
        return { parsed: { ...rules, source: 'Gmail sync' }, method: 'rules' }
      }
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
    message: 'Scanning from today (newest first)…',
  })
  // Always anchored to the current date — never lastSyncAt.
  // Messages are sorted newest → oldest; already-seen IDs are skipped.
  const listed = await listJobEmailMessageIds(accessToken, {
    maxResults: 40,
    newerThanDays: 30,
  })

  onProgress({
    phase: 'listing',
    current: 0,
    total: listed.messages.length,
    message: `Found ${listed.messages.length} recent emails (${listed.windowLabel})…`,
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
      const subject = headerValue(message, 'Subject')
      const from = headerValue(message, 'From')
      const snippet = message.snippet || ''

      if (!isLikelyRecruitingEmail(subject, from, snippet)) {
        skipped += 1
        const record: GmailSyncedEmail = {
          messageId: message.id,
          threadId: message.threadId,
          subject,
          from,
          snippet,
          internalDate: message.internalDate,
          processedAt: new Date().toISOString(),
          applicationId: null,
          company: '',
          role: '',
          status: null,
          confidence: 'low',
          method: 'skipped',
          skipped: true,
          skipReason: 'Not a recruiting / job-application email',
        }
        gmailSync.syncedEmails = [record, ...gmailSync.syncedEmails].slice(0, 200)
        processed.add(message.id)
        continue
      }

      const raw = messageToRawEmail(message)
      const { parsed, method } = await analyzeEmail(raw)
      const recruiter = extractRecruiter(from)
      const interviewDate = extractInterviewDate(raw)

      if (!looksJobRelated(parsed, subject, from, snippet)) {
        skipped += 1
        const record: GmailSyncedEmail = {
          messageId: message.id,
          threadId: message.threadId,
          subject,
          from,
          snippet,
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
