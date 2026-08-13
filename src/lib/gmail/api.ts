export type GmailMessageListItem = {
  id: string
  threadId: string
}

export type GmailMessage = {
  id: string
  threadId: string
  snippet: string
  internalDate: string
  labelIds?: string[]
  payload?: {
    headers?: Array<{ name: string; value: string }>
    mimeType?: string
    body?: { data?: string; size?: number }
    parts?: GmailMessage['payload'][]
  }
}

async function gmailFetch<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    if (response.status === 401) throw new Error('Gmail token expired — connect again')
    if (response.status === 403) {
      throw new Error('Gmail access denied — enable Gmail API and grant gmail.readonly')
    }
    throw new Error(detail || `Gmail API error (${response.status})`)
  }
  return response.json() as Promise<T>
}

export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string }> {
  return gmailFetch('users/me/profile', accessToken)
}

/** Calendar day for Gmail `after:` / `before:` (local timezone). */
function gmailDayStamp(daysFromToday: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + daysFromToday)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

/**
 * Strict Gmail search anchored to the current date.
 * Window = [today - days, tomorrow) so today's mail is always included.
 */
function buildJobEmailQuery(days = 30): string {
  const after = gmailDayStamp(-Math.max(1, days))
  const before = gmailDayStamp(1) // exclusive upper bound → includes all of today

  const positive = [
    'subject:("thank you for applying"',
    'OR "thanks for applying"',
    'OR "application received"',
    'OR "we received your application"',
    'OR "your application to"',
    'OR "your application for"',
    'OR "application for the"',
    'OR "interview invitation"',
    'OR "interview with"',
    'OR "interview scheduled"',
    'OR "schedule an interview"',
    'OR "phone screen"',
    'OR "coding challenge"',
    'OR "online assessment"',
    'OR hackerrank',
    'OR coderpad',
    'OR shortlisted',
    'OR "moved forward"',
    'OR "next steps in your application"',
    'OR "job offer"',
    'OR "offer letter"',
    'OR "offer of employment"',
    'OR "not moving forward"',
    'OR "unfortunately we"',
    'OR "decided to pursue other"',
    'OR "recruiting team"',
    'OR "talent team"',
    'OR "talent acquisition"',
    'OR greenhouse',
    'OR "lever.co"',
    'OR ashby',
    'OR workday)',
    'OR from:(careers@ OR recruiting@ OR talent@ OR hiring@ OR jobs@',
    'OR greenhouse-mail OR mail.ashbyhq OR myworkdayjobs OR lever.co',
    'OR workablemail OR smartrecruiters OR icims)',
  ].join(' ')

  const negative = [
    '-category:promotions',
    '-category:social',
    '-category:forums',
    '-in:spam',
    '-in:trash',
    '-subject:(invoice OR receipt OR order OR shipped OR shipping OR delivery OR newsletter OR password OR otp OR "verification code" OR payment OR subscription OR refund OR "sign-in" OR "sign in" OR "security alert" OR package OR tracking OR bill OR statement)',
    '-from:(noreply@github.com OR notifications@github.com OR no-reply@accounts.google.com)',
    `after:${after}`,
    `before:${before}`,
  ].join(' ')

  return `(${positive}) ${negative}`
}

export type GmailListedMessage = GmailMessageListItem & {
  internalDate: string
}

export async function listJobEmailMessageIds(
  accessToken: string,
  options: { maxResults?: number; newerThanDays?: number } = {},
): Promise<{ messages: GmailListedMessage[]; resultSizeEstimate: number; windowLabel: string }> {
  const days = options.newerThanDays ?? 30
  const q = encodeURIComponent(buildJobEmailQuery(days))
  const max = options.maxResults ?? 40
  const data = await gmailFetch<{
    messages?: GmailMessageListItem[]
    resultSizeEstimate?: number
  }>(`users/me/messages?q=${q}&maxResults=${max}`, accessToken)

  const listed = data.messages || []

  // Confirm newest-first using internalDate (current/latest date first).
  const withDates = await Promise.all(
    listed.map(async (item) => {
      const meta = await gmailFetch<Pick<GmailMessage, 'id' | 'threadId' | 'internalDate'>>(
        `users/me/messages/${encodeURIComponent(item.id)}?format=metadata&metadataHeaders=Date`,
        accessToken,
      )
      return {
        id: item.id,
        threadId: item.threadId,
        internalDate: meta.internalDate || '0',
      }
    }),
  )

  withDates.sort((a, b) => Number(b.internalDate) - Number(a.internalDate))

  return {
    messages: withDates,
    resultSizeEstimate: data.resultSizeEstimate || 0,
    windowLabel: `today back ${days} days`,
  }
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string,
): Promise<GmailMessage> {
  return gmailFetch(
    `users/me/messages/${encodeURIComponent(messageId)}?format=full`,
    accessToken,
  )
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return ''
  }
}

function collectTextParts(payload: GmailMessage['payload'], out: string[]): void {
  if (!payload) return
  if (payload.mimeType?.startsWith('text/plain') && payload.body?.data) {
    out.push(decodeBase64Url(payload.body.data))
  }
  if (payload.mimeType?.startsWith('text/html') && payload.body?.data && out.length === 0) {
    const html = decodeBase64Url(payload.body.data)
    out.push(
      html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+\n/g, '\n')
        .replace(/[ \t]{2,}/g, ' '),
    )
  }
  for (const part of payload.parts || []) collectTextParts(part, out)
}

export function headerValue(message: GmailMessage, name: string): string {
  const headers = message.payload?.headers || []
  const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
  return found?.value?.trim() || ''
}

/** Rebuild a paste-friendly raw email string for the existing parser. */
export function messageToRawEmail(message: GmailMessage): string {
  const subject = headerValue(message, 'Subject')
  const from = headerValue(message, 'From')
  const date = headerValue(message, 'Date')
  const to = headerValue(message, 'To')
  const parts: string[] = []
  collectTextParts(message.payload, parts)
  const body = parts.join('\n\n').trim() || message.snippet || ''

  return [
    from ? `From: ${from}` : null,
    to ? `To: ${to}` : null,
    subject ? `Subject: ${subject}` : null,
    date ? `Date: ${date}` : null,
    '',
    body,
  ]
    .filter((line) => line !== null)
    .join('\n')
}
