import { STATUS_ORDER, type Status } from '../types'
import { parseJobEmail, type EmailParseResult } from '../emailParser'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'
const STORAGE_KEY = 'job-app-groq-key'

const STATUS_LIST = STATUS_ORDER.join(', ')

export function getGroqApiKey(): string {
  const fromEnv = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  if (fromEnv) return fromEnv
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function setGroqApiKey(key: string): void {
  const trimmed = key.trim()
  if (!trimmed) localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, trimmed)
}

export function hasGroqApiKey(): boolean {
  return Boolean(getGroqApiKey())
}

type AiPayload = {
  company?: string
  role?: string
  status?: string
  jobUrl?: string
  location?: string
  appliedDate?: string | null
  notes?: string
  signals?: string[]
  confidence?: 'high' | 'medium' | 'low'
}

function normalizeStatus(value: string | undefined, fallback: Status): Status {
  if (!value) return fallback
  const exact = STATUS_ORDER.find((s) => s.toLowerCase() === value.trim().toLowerCase())
  if (exact) return exact

  const lower = value.toLowerCase()
  if (lower.includes('offer')) return 'Offer'
  if (lower.includes('reject')) return 'Rejected'
  if (lower.includes('withdraw')) return 'Withdrawn'
  if (lower.includes('hr')) return 'HR Round'
  if (lower.includes('interview') || lower.includes('shortlist')) return 'Interview'
  if (lower.includes('assessment') || lower.includes('test') || lower.includes('hackerrank'))
    return 'Assessment'
  if (lower.includes('review')) return 'Under Review'
  if (lower.includes('applied') || lower.includes('received')) return 'Applied'
  if (lower.includes('wishlist') || lower.includes('interested')) return 'Wishlist'
  return fallback
}

function extractJson(text: string): AiPayload {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced?.[1]?.trim() || text.trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Groq did not return JSON')
  return JSON.parse(raw.slice(start, end + 1)) as AiPayload
}

export async function parseJobEmailWithGroq(rawEmail: string): Promise<EmailParseResult> {
  const apiKey = getGroqApiKey()
  if (!apiKey) throw new Error('Add your free Groq API key first')

  const baseline = parseJobEmail(rawEmail)
  const clipped = rawEmail.trim().slice(0, 12000)

  const system = `You extract structured job-application data from recruiting emails.
Return ONLY valid JSON with these keys:
company (string), role (string), status (one of: ${STATUS_LIST}),
jobUrl (string or ""), location (string or ""), appliedDate (YYYY-MM-DD or null),
notes (short summary string), signals (string array of clues you used),
confidence ("high"|"medium"|"low").
Rules:
- Prefer the hiring company, not Gmail/LinkedIn/Greenhouse/Lever/Workday.
- status must be exactly one allowed value.
- If unsure, use empty string / null and lower confidence.
- notes should be 1-3 short sentences, not the full email.`

  const user = `Baseline parser guess (may be wrong):
${JSON.stringify({
    company: baseline.company,
    role: baseline.role,
    status: baseline.status,
    jobUrl: baseline.jobUrl,
    location: baseline.location,
    appliedDate: baseline.appliedDate,
  })}

Email:
"""
${clipped}
"""`

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    if (response.status === 401) throw new Error('Groq API key is invalid')
    if (response.status === 429) throw new Error('Groq rate limit hit — try again in a minute')
    throw new Error(detail || `Groq request failed (${response.status})`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from Groq')

  const parsed = extractJson(content)
  const company = (parsed.company || baseline.company || '').trim()
  const role = (parsed.role || baseline.role || 'Role TBD').trim()
  const status = normalizeStatus(parsed.status, baseline.status)
  const jobUrl = (parsed.jobUrl || baseline.jobUrl || '').trim()
  const location = (parsed.location || baseline.location || '').trim()
  const appliedDate =
    parsed.appliedDate === null || parsed.appliedDate === ''
      ? baseline.appliedDate
      : parsed.appliedDate || baseline.appliedDate
  const notes = (parsed.notes || baseline.notes || '').trim()
  const signals = [
    'groq-ai',
    ...(Array.isArray(parsed.signals) ? parsed.signals.slice(0, 6) : []),
  ]
  const confidence = parsed.confidence || (company ? 'high' : 'medium')

  return {
    company,
    role: role || 'Role TBD',
    status,
    jobUrl,
    location,
    appliedDate,
    source: 'Email paste (Groq AI)',
    notes,
    signals,
    confidence,
  }
}
