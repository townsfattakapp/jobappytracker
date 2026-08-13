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

/** Strict Gmail search — phrase/ATS focused; excludes common consumer noise. */
function buildJobEmailQuery(days = 45): string {
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
    `newer_than:${days}d`,
  ].join(' ')

  return `(${positive}) ${negative}`
}

export async function listJobEmailMessageIds(
  accessToken: string,
  options: { maxResults?: number; newerThanDays?: number } = {},
): Promise<{ messages: GmailMessageListItem[]; resultSizeEstimate: number }> {
  const q = encodeURIComponent(buildJobEmailQuery(options.newerThanDays ?? 45))
  const max = options.maxResults ?? 40
  // Gmail returns messages newest-first by default.
  const data = await gmailFetch<{
    messages?: GmailMessageListItem[]
    resultSizeEstimate?: number
  }>(`users/me/messages?q=${q}&maxResults=${max}`, accessToken)

  return {
    messages: data.messages || [],
    resultSizeEstimate: data.resultSizeEstimate || 0,
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
