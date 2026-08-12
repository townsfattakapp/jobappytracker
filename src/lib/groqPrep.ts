import { groqChat } from './groq'
import type { JobApplication } from '../types'

export type PrepAiAction =
  | 'interview-questions'
  | 'star-stories'
  | 'company-brief'
  | 'cheatsheet'
  | 'improve-note'

export const PREP_AI_ACTIONS: Array<{
  id: PrepAiAction
  label: string
  description: string
}> = [
  {
    id: 'interview-questions',
    label: 'Interview Qs',
    description: 'Likely questions + strong answer angles',
  },
  {
    id: 'star-stories',
    label: 'STAR stories',
    description: 'Story bank for behavioral rounds',
  },
  {
    id: 'company-brief',
    label: 'Company brief',
    description: 'What to know before the interview',
  },
  {
    id: 'cheatsheet',
    label: '1-page cheatsheet',
    description: 'Compact prep sheet for the day',
  },
  {
    id: 'improve-note',
    label: 'Improve note',
    description: 'Tighten and structure what you already wrote',
  },
]

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toHtml(markdownish: string): string {
  const escaped = markdownish
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const blocks = escaped.split(/\n{2,}/)
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.every((l) => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l))) {
        const items = lines
          .map((l) => l.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''))
          .map((l) => `<li>${formatInline(l)}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      if (/^#{1,3}\s+/.test(lines[0] || '')) {
        const title = lines[0].replace(/^#{1,3}\s+/, '')
        const rest = lines.slice(1).map((l) => formatInline(l)).join('<br/>')
        return `<h3>${formatInline(title)}</h3>${rest ? `<p>${rest}</p>` : ''}`
      }
      return `<p>${lines.map((l) => formatInline(l)).join('<br/>')}</p>`
    })
    .join('')
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function contextBlock(app?: JobApplication | null, noteTitle?: string, noteHtml?: string) {
  const noteText = noteHtml ? stripHtml(noteHtml).slice(0, 6000) : ''
  return `Target role context:
- Company: ${app?.company || 'Not specified'}
- Role: ${app?.role || 'Not specified'}
- Status: ${app?.status || 'n/a'}
- Location: ${app?.location || 'n/a'}
- Notes from tracker: ${(app?.notes || '').slice(0, 1200) || 'n/a'}

Prep note title: ${noteTitle || 'Untitled'}
Existing note content:
"""
${noteText || '(empty)'}
"""`
}

function promptFor(
  action: PrepAiAction,
  app?: JobApplication | null,
  noteTitle?: string,
  noteHtml?: string,
): { system: string; user: string } {
  const ctx = contextBlock(app, noteTitle, noteHtml)
  const shared = `You are a sharp interview coach for software / product / design candidates.
Write concise, practical prep content in clean Markdown-like text.
Use short headings and bullet lists. No fluff, no emojis.`

  switch (action) {
    case 'interview-questions':
      return {
        system: `${shared}
Produce:
1) Top likely interview questions (technical + behavioral)
2) What interviewers are testing
3) Strong answer angles / talking points`,
        user: `${ctx}\n\nGenerate interview prep for this role.`,
      }
    case 'star-stories':
      return {
        system: `${shared}
Create 5 STAR story prompts tailored to the role.
For each: Situation hint, Task, Action bullets, Result metric ideas, and when to use it.`,
        user: `${ctx}\n\nBuild a STAR story bank.`,
      }
    case 'company-brief':
      return {
        system: `${shared}
Create a pre-interview company brief:
- What the company likely cares about
- Product / market angles to research
- Smart questions to ask them
- Red flags / things to clarify
Be useful even without live web search.`,
        user: `${ctx}\n\nWrite a company interview brief.`,
      }
    case 'cheatsheet':
      return {
        system: `${shared}
Create a one-page day-of-interview cheatsheet:
- 30-second intro
- 5 must-remember strengths
- 5 likely questions + punchy answer cues
- Questions to ask
- Closing line`,
        user: `${ctx}\n\nMake a one-page cheatsheet.`,
      }
    case 'improve-note':
      return {
        system: `${shared}
Rewrite and improve the existing note:
- Keep the candidate's facts
- Better structure, clearer bullets
- Add missing prep sections if useful
Do not invent fake personal achievements.`,
        user: `${ctx}\n\nImprove this prep note.`,
      }
  }
}

export async function generatePrepContent(options: {
  action: PrepAiAction
  application?: JobApplication | null
  noteTitle?: string
  noteHtml?: string
}): Promise<{ titleSuggestion: string; html: string }> {
  const { system, user } = promptFor(
    options.action,
    options.application,
    options.noteTitle,
    options.noteHtml,
  )

  const content = await groqChat({
    temperature: 0.4,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const company = options.application?.company || 'Interview'
  const role = options.application?.role || 'Role'
  const titleSuggestion = {
    'interview-questions': `${company} — Interview questions`,
    'star-stories': `${company} — STAR stories`,
    'company-brief': `${company} — Company brief`,
    cheatsheet: `${company} — Interview cheatsheet`,
    'improve-note': options.noteTitle || `${company} — Prep notes`,
  }[options.action]

  return {
    titleSuggestion: titleSuggestion.includes('Interview') || titleSuggestion.includes(company)
      ? `${titleSuggestion}${role !== 'Role' ? ` (${role})` : ''}`
      : titleSuggestion,
    html: toHtml(content),
  }
}
