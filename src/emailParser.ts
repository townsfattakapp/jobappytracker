import { type NewJobApplication, type Status } from './types'

export interface EmailParseResult {
  company: string
  role: string
  status: Status
  jobUrl: string
  location: string
  appliedDate: string | null
  source: string
  notes: string
  signals: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface StatusRule {
  status: Status
  label: string
  patterns: RegExp[]
}

const STATUS_RULES: StatusRule[] = [
  {
    status: 'Offer',
    label: 'offer',
    patterns: [
      /\boffer of employment\b/i,
      /\bpleased to offer\b/i,
      /\bjob offer\b/i,
      /\bextend(?:ing)? (?:you )?an offer\b/i,
      /\bcompensation package\b/i,
    ],
  },
  {
    status: 'Rejected',
    label: 'rejection',
    patterns: [
      /\bunfortunately\b.*\b(?:not|unable|won't|will not)\b/i,
      /\bwe (?:have )?decided to move forward with other candidates\b/i,
      /\bnot (?:be )?moving forward\b/i,
      /\bapplication was not selected\b/i,
      /\bwe regret to inform\b/i,
      /\bwill not be advancing\b/i,
      /\brejection\b/i,
    ],
  },
  {
    status: 'Withdrawn',
    label: 'withdrawn',
    patterns: [/\bapplication (?:has been )?withdrawn\b/i, /\byou withdrew your application\b/i],
  },
  {
    status: 'HR Round',
    label: 'HR / hiring manager',
    patterns: [
      /\bhiring manager\b/i,
      /\bhr (?:screen|round|call|interview)\b/i,
      /\bpeople partner\b/i,
      /\brecruiter screen\b/i,
    ],
  },
  {
    status: 'Interview',
    label: 'interview / shortlist',
    patterns: [
      /\bshortlisted\b/i,
      /\bshort-listed\b/i,
      /\byou(?:'ve| have) been selected\b/i,
      /\bselected for (?:an )?interview\b/i,
      /\binvite(?:d)? (?:you )?to interview\b/i,
      /\binterview invitation\b/i,
      /\bschedule (?:your|an) interview\b/i,
      /\bnext (?:step|round).{0,40}interview\b/i,
      /\btechnical interview\b/i,
      /\bonsite interview\b/i,
      /\bphone screen\b/i,
      /\bvideo interview\b/i,
    ],
  },
  {
    status: 'Under Review',
    label: 'under review',
    patterns: [
      /\bapplication .{0,40}under review\b/i,
      /\bcurrently under review\b/i,
      /\bunder review by (?:our )?hiring team\b/i,
      /\bbeing reviewed\b/i,
      /\bin review\b/i,
      /\breviewing your application\b/i,
      /\bour (?:hiring|recruiting) team (?:is|will be) review/i,
      /\bwe appreciate the time you took to apply\b/i,
      /\bwe(?:'ll| will) get back to you as soon as we have an update\b/i,
    ],
  },
  {
    status: 'Assessment',
    label: 'assessment',
    patterns: [
      /\btake[- ]home\b/i,
      /\bcoding (?:challenge|assessment|test)\b/i,
      /\bonline assessment\b/i,
      /\bhackerank\b/i,
      /\bcoderpad\b/i,
      /\bcomplete (?:the|this) assessment\b/i,
      /\bskills assessment\b/i,
    ],
  },
  {
    status: 'Applied',
    label: 'application received',
    patterns: [
      /\bthank you for (?:your )?applying\b/i,
      /\bthanks for applying\b/i,
      /\bwe received your application\b/i,
      /\bapplication (?:has been )?received\b/i,
      /\bapplication submitted\b/i,
      /\bsuccessfully applied\b/i,
      /\bconfirmation of your application\b/i,
    ],
  },
]

const NOISE_COMPANIES = new Set(
  [
    'gmail',
    'google',
    'yahoo',
    'outlook',
    'hotmail',
    'linkedin',
    'indeed',
    'glassdoor',
    'greenhouse',
    'lever',
    'ashby',
    'workday',
    'noreply',
    'no-reply',
    'mailer',
    'notifications',
    'careers',
    'jobs',
    'team',
    'hiring',
    'recruiting',
  ].map((s) => s.toLowerCase()),
)

function cleanCompany(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/["'<>]/g, '')
    .replace(/\b(?:inc|llc|ltd|corp|co|gmbh)\.?$/i, '')
    .replace(/\b(?:careers|jobs|talent|recruiting|recruitment|hiring|team|noreply)\b/gi, '')
    .replace(/\s+[-|].*$/, '')
    .trim()
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      if (part.length <= 3 && part === part.toUpperCase()) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

function domainToCompany(domain: string): string {
  const root = domain.split('.').slice(0, -1).join('.') || domain
  const base = root.split('.').pop() || root
  if (NOISE_COMPANIES.has(base.toLowerCase())) return ''
  return titleCase(base.replace(/[-_]/g, ' '))
}

function extractHeader(raw: string, name: string): string {
  const re = new RegExp(`^${name}:\\s*(.+)$`, 'im')
  const match = raw.match(re)
  return match?.[1]?.trim() ?? ''
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>"']+/gi) || []
  return matches
    .map((u) => u.replace(/[),.;]+$/, ''))
    .filter((u) => !/unsubscribe|mailto:|schemas\.microsoft|aka\.ms\/|support\./i.test(u))
}

function extractRole(text: string, subject: string): string {
  const patterns = [
    /(?:for the|for our|for a|as a|as an)\s+([A-Z][^.\n,]{2,80}?)\s+(?:position|role|opportunity)/i,
    /(?:position|role|job title)\s*[:\-–]\s*([^\n,]{2,80})/i,
    /application(?: for)?(?: the)?\s+([A-Z][^.\n,]{2,80}?)\s+(?:position|role)/i,
    /interested in the\s+([A-Z][^.\n,]{2,80}?)\s+role/i,
    /(?:re:|subject:)?\s*(?:your application(?: for)?|interview for)\s+([^\n|–-]{2,80})/i,
  ]

  for (const pattern of patterns) {
    const match = `${subject}\n${text}`.match(pattern)
    if (match?.[1]) {
      const role = cleanCompany(match[1])
        .replace(/\bat\b.*$/i, '')
        .trim()
      if (role.length >= 3 && role.length <= 80) return role
    }
  }

  const subjectRole = subject.match(
    /(?:application|interview|offer|assessment).{0,12}(?:for|[-:–])\s*(.+)$/i,
  )
  if (subjectRole?.[1]) {
    const role = cleanCompany(subjectRole[1].replace(/\bat\b.+$/i, ''))
    if (role.length >= 3) return role
  }

  return ''
}

function extractCompany(text: string, subject: string, from: string): string {
  const fromName = from.match(/^([^<]+)</)?.[1]?.trim() || ''
  const fromEmail = from.match(/[\w.+-]+@([\w.-]+)/)?.[1] || ''

  const patterns = [
    /thank you for applying to\s+([A-Z][\w .&'-]{1,60})/i,
    /(?:application|interview|offer).{0,40}\bat\s+([A-Z][\w .&'-]{1,60})/i,
    /(?:from|with)\s+([A-Z][\w .&'-]{1,40})\s+(?:recruiting|talent|careers|hiring)/i,
    /^([\w .&'-]{2,40})\s+careers\b/im,
    /welcome to the\s+([A-Z][\w .&'-]{1,40})\s+hiring/i,
    /(?:best regards|regards|sincerely|thanks)[,\s]+(?:the\s+)?([A-Z][\w .&'-]{1,40})\s+team\b/i,
    /\bthe\s+([A-Z][\w .&'-]{1,40})\s+team\s*$/im,
  ]

  for (const pattern of patterns) {
    const match = `${subject}\n${text}`.match(pattern)
    if (match?.[1]) {
      const company = cleanCompany(match[1])
      if (company && !NOISE_COMPANIES.has(company.toLowerCase())) return titleCase(company)
    }
  }

  if (fromName) {
    const cleaned = cleanCompany(fromName)
    if (
      cleaned &&
      cleaned.length > 1 &&
      !NOISE_COMPANIES.has(cleaned.toLowerCase()) &&
      !/recruit|career|talent|hiring|job/i.test(cleaned)
    ) {
      return titleCase(cleaned)
    }
  }

  if (fromEmail) {
    const fromDomain = domainToCompany(fromEmail)
    if (fromDomain) return fromDomain
  }

  const subjectAt = subject.match(/\bat\s+([A-Z][\w .&'-]{1,40})$/i)
  if (subjectAt?.[1]) {
    const company = cleanCompany(subjectAt[1])
    if (company) return titleCase(company)
  }

  return ''
}

function extractLocation(text: string): string {
  const match = text.match(
    /(?:location|based in|office(?: in)?|role (?:is )?in)\s*[:\-–]?\s*([A-Za-z0-9 ,./-]{2,60})/i,
  )
  if (!match?.[1]) return ''
  return match[1].split(/\n|·|\|/)[0].trim().replace(/\.$/, '')
}

function extractAppliedDate(raw: string): string | null {
  const dateHeader = extractHeader(raw, 'Date')
  if (dateHeader) {
    const parsed = new Date(dateHeader)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0]
  }
  return new Date().toISOString().split('T')[0]
}

function detectStatus(text: string): { status: Status; signals: string[] } {
  const signals: string[] = []
  for (const rule of STATUS_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        signals.push(rule.label)
        return { status: rule.status, signals }
      }
    }
  }
  return { status: 'Applied', signals: ['defaulted to Applied'] }
}

export function parseJobEmail(raw: string): EmailParseResult {
  const text = raw.replace(/\r\n/g, '\n').trim()
  const subject = extractHeader(text, 'Subject') || ''
  const from = extractHeader(text, 'From') || ''
  const hasHeaders = /^(from|subject|date|to):\s+/im.test(text.split('\n').slice(0, 8).join('\n'))

  // Only split on the first blank line when real email headers are present.
  // Otherwise a pasted message body would lose the first paragraph (often the role line).
  let body = text
  if (hasHeaders) {
    const bodyStart = text.search(/\n\n/)
    if (bodyStart >= 0) body = text.slice(bodyStart).trim()
  }

  const haystack = `${subject}\n${from}\n${body}`

  const { status, signals } = detectStatus(haystack)
  const company = extractCompany(body, subject, from)
  const role = extractRole(body, subject)
  const urls = extractUrls(haystack)
  const jobUrl = urls.find((u) => /job|career|lever|greenhouse|ashby|workday|boards/i.test(u)) || urls[0] || ''
  const location = extractLocation(body)
  const appliedDate = extractAppliedDate(text)

  const filled = [company, role, status !== 'Applied' || !signals.includes('defaulted to Applied')].filter(Boolean)
    .length
  const confidence: EmailParseResult['confidence'] =
    filled >= 3 && company && role ? 'high' : company || role ? 'medium' : 'low'

  const snippet = body.replace(/\s+/g, ' ').slice(0, 280)
  const notes = [
    subject ? `Email subject: ${subject}` : null,
    from ? `From: ${from}` : null,
    signals.length ? `Detected: ${signals.join(', ')}` : null,
    snippet ? `Snippet: ${snippet}${body.length > 280 ? '…' : ''}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    company,
    role: role || 'Role TBD',
    status,
    jobUrl,
    location,
    appliedDate: status === 'Wishlist' ? null : appliedDate,
    source: 'Email paste',
    notes,
    signals,
    confidence,
  }
}

export function parsedEmailToDraft(parsed: EmailParseResult): NewJobApplication {
  return {
    company: parsed.company,
    role: parsed.role,
    jobUrl: parsed.jobUrl,
    location: parsed.location,
    salary: null,
    appliedDate: parsed.appliedDate,
    source: parsed.source,
    notes: parsed.notes,
    status: parsed.status,
    followUpDate: null,
    pinned: parsed.status === 'Interview' || parsed.status === 'Offer' || parsed.status === 'HR Round',
    interviewRounds: [],
    contacts: [],
  }
}

export function findMatchingApplication<T extends { id: string; company: string; role: string }>(
  apps: T[],
  company: string,
  role: string,
): T | undefined {
  const c = company.trim().toLowerCase()
  const r = role.trim().toLowerCase()
  if (!c) return undefined

  const sameCompany = apps.filter((a) => a.company.trim().toLowerCase() === c)
  if (sameCompany.length === 0) {
    return apps.find((a) => a.company.trim().toLowerCase().includes(c) || c.includes(a.company.trim().toLowerCase()))
  }
  if (r && r !== 'role tbd') {
    const roleMatch = sameCompany.find(
      (a) => a.role.trim().toLowerCase() === r || a.role.toLowerCase().includes(r) || r.includes(a.role.toLowerCase()),
    )
    if (roleMatch) return roleMatch
  }
  return sameCompany[0]
}

export const SAMPLE_EMAILS = {
  applied: `From: Notion Careers <careers@notion.so>
Subject: Thanks for applying to Notion
Date: Tue, 12 Aug 2025 10:22:00 -0700

Hi Vishwa,

Thank you for applying to Notion for the Full Stack Engineer position.
We received your application and our recruiting team will review it shortly.

Track your application: https://notion.so/careers/applications/123

Best,
Notion Recruiting`,

  shortlisted: `From: Stripe Recruiting <recruiting@stripe.com>
Subject: Interview invitation — Frontend Engineer at Stripe
Date: Wed, 13 Aug 2025 09:15:00 -0700

Hi Vishwa,

You've been shortlisted for the Frontend Engineer role at Stripe.
We'd like to invite you to interview with our team next week.

Please schedule here: https://stripe.com/jobs/listing/frontend-engineer

Thanks,
Stripe Recruiting`,

  rejected: `From: Shopify Talent <talent@shopify.com>
Subject: Update on your application
Date: Mon, 4 Aug 2025 14:01:00 -0400

Hi Vishwa,

Thank you for your interest in the React Engineer role at Shopify.
Unfortunately, we have decided to move forward with other candidates at this time.

We appreciate the time you spent with us.

Shopify Talent`,

  evolw: `From: hello@evolw.in
Subject: Application update
Date: Thu, 13 Aug 2026 00:20:00 +0530

Hi VISHWAS,
We wanted to let you know that your application for the Software Engineering Interns position is currently under review by our hiring team.

We appreciate the time you took to apply, and we will get back to you as soon as we have an update.


Best regards,

The Evolw Team`,
}
