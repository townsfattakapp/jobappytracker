import { extractSkills } from '../jobs/skills'

/**
 * Deterministic resume extraction. Turns extracted text into a structured
 * profile where every entry points back to the resume lines it came from
 * (evidence). Nothing is inferred beyond what the text says: unknown fields
 * stay null and a warning explains why.
 */

export const EXTRACTOR_VERSION = 'rules-1'

export interface Evidence {
  /** 1-based line numbers in the extracted text. */
  lines: number[]
  /** The exact text quoted from the resume. */
  quote: string
}

export interface EmploymentEntry {
  title: string | null
  company: string | null
  start: string | null
  end: string | null
  /** Approximate months of tenure when both dates are readable. */
  months: number | null
  bullets: string[]
  evidence: Evidence
}

export interface ProjectEntry {
  name: string
  description: string
  technologies: string[]
  evidence: Evidence
}

export interface EducationEntry {
  text: string
  year: string | null
  evidence: Evidence
}

export interface ResumeProfile {
  name: string | null
  headline: string | null
  contact: { email: string | null; phone: string | null; links: string[] }
  summary: string | null
  skills: { name: string; evidence: Evidence }[]
  technologies: string[]
  employment: EmploymentEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  certifications: { text: string; evidence: Evidence }[]
  achievements: { text: string; evidence: Evidence }[]
  /** Total months across employment entries with readable dates; null when none. */
  totalExperienceMonths: number | null
  sections: { name: SectionKind; startLine: number; endLine: number }[]
  unknown: string[]
}

export type SectionKind = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'achievements' | 'other'

const SECTION_HEADINGS: { kind: SectionKind; re: RegExp }[] = [
  { kind: 'summary', re: /^(professional\s+)?(summary|profile|objective|about me)\b/i },
  { kind: 'skills', re: /^(technical\s+|core\s+|key\s+)?(skills|technologies|tech stack|competencies|tools)\b/i },
  { kind: 'experience', re: /^(work\s+|professional\s+|employment\s+)?(experience|history|employment)\b/i },
  { kind: 'projects', re: /^(personal\s+|academic\s+|key\s+|selected\s+)?projects?\b/i },
  { kind: 'education', re: /^(education|academics|qualifications)\b/i },
  { kind: 'certifications', re: /^(certifications?|certificates|licenses?|courses)\b/i },
  { kind: 'achievements', re: /^(achievements?|awards?|honou?rs|accomplishments|publications)\b/i },
]

const MONTHS = '(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*'
const DATE = `(?:${MONTHS}\\.?\\s+)?(\\d{4})`
const DATE_RANGE = new RegExp(`${DATE}\\s*(?:-|–|—|to)\\s*(present|current|now|till date|${DATE})`, 'i')
const BULLET = /^\s*[-•▪◦*·]\s*/
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE = /(\+?\d[\d\s().-]{8,}\d)/
const LINK = /(https?:\/\/[^\s)]+|(?:www\.|github\.com\/|linkedin\.com\/in\/)[^\s)]+)/gi

function monthIndex(name: string | undefined): number | null {
  if (!name) return null
  const i = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(name.slice(0, 3).toLowerCase())
  return i < 0 ? null : i
}

function parseRange(text: string, now: Date): { start: string | null; end: string | null; months: number | null } {
  const m = DATE_RANGE.exec(text)
  if (!m) return { start: null, end: null, months: null }
  const startMonth = monthIndex(m[1])
  const startYear = Number(m[2])
  const endWord = m[3].toLowerCase()
  const ongoing = /present|current|now|till date/.test(endWord)
  const endMonth = ongoing ? now.getMonth() : monthIndex(m[4])
  const endYear = ongoing ? now.getFullYear() : Number(m[5])
  const start = `${startYear}${startMonth != null ? `-${String(startMonth + 1).padStart(2, '0')}` : ''}`
  const end = ongoing ? 'present' : `${endYear}${endMonth != null ? `-${String(endMonth + 1).padStart(2, '0')}` : ''}`
  const months = Number.isFinite(startYear) && Number.isFinite(endYear) ? Math.max(0, (endYear - startYear) * 12 + ((endMonth ?? 6) - (startMonth ?? 6))) : null
  return { start, end, months }
}

/** Splits resume text into trimmed lines, keeping 1-based line numbers. */
export function toLines(text: string): { n: number; text: string }[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((t, i) => ({ n: i + 1, text: t.replace(/\s+/g, ' ').trim() }))
}

function isHeading(line: string): SectionKind | null {
  const t = line.replace(/[:\-–—_]+$/, '').trim()
  if (!t || t.length > 40) return null
  for (const h of SECTION_HEADINGS) if (h.re.test(t)) return h.kind
  return null
}

export function extractResumeProfile(text: string, now: Date = new Date()): { profile: ResumeProfile; warnings: string[] } {
  const warnings: string[] = []
  const lines = toLines(text)
  const nonEmpty = lines.filter((l) => l.text)
  if (nonEmpty.length < 3) warnings.push('Very little text could be read from this file; if it is a scanned image, extraction will not work.')

  // Sections.
  const sections: ResumeProfile['sections'] = []
  let current: { name: SectionKind; startLine: number } = { name: 'other', startLine: 1 }
  for (const l of lines) {
    const kind = isHeading(l.text)
    if (kind) {
      sections.push({ ...current, endLine: l.n - 1 })
      current = { name: kind, startLine: l.n + 1 }
    }
  }
  sections.push({ ...current, endLine: lines.length })
  const linesIn = (kind: SectionKind) => sections.filter((s) => s.name === kind).flatMap((s) => lines.filter((l) => l.n >= s.startLine && l.n <= s.endLine && l.text))
  const evidenceOf = (ls: { n: number; text: string }[]): Evidence => ({ lines: ls.map((l) => l.n), quote: ls.map((l) => l.text).join(' ').slice(0, 300) })

  // Header: name and headline from the top lines before any section.
  const header = lines.filter((l) => l.text && l.n < (sections[1]?.startLine ?? lines.length + 1) - 1).slice(0, 6)
  const contactRe = /@|https?:|www\.|\+?\d[\d\s().-]{8,}/
  const nameLine = header.find((l) => !contactRe.test(l.text) && l.text.length <= 50 && /^[A-Za-z][A-Za-z .'-]+$/.test(l.text) && l.text.split(' ').length <= 5)
  const headlineLine = header.find((l) => l !== nameLine && !contactRe.test(l.text) && l.text.length <= 80 && !isHeading(l.text))
  const name = nameLine?.text ?? null
  const headline = headlineLine?.text ?? null
  const unknown: string[] = []
  if (!name) unknown.push('name')
  if (!headline) unknown.push('headline')

  const allText = nonEmpty.map((l) => l.text).join('\n')
  const email = EMAIL.exec(allText)?.[0] ?? null
  const phone = PHONE.exec(allText)?.[1]?.trim() ?? null
  const links = Array.from(new Set((allText.match(LINK) || []).map((l) => l.replace(/[.,;]$/, ''))))

  const summaryLines = linesIn('summary')
  const summary = summaryLines.length ? summaryLines.map((l) => l.text).join(' ').slice(0, 800) : null
  if (!summary) unknown.push('summary')

  // Skills: the skills section first, then everything the lexicon recognises anywhere.
  const skills = new Map<string, Evidence>()
  const skillLines = linesIn('skills')
  for (const l of skillLines) for (const s of extractSkills(l.text)) if (!skills.has(s)) skills.set(s, { lines: [l.n], quote: l.text.slice(0, 200) })
  for (const l of nonEmpty) for (const s of extractSkills(l.text)) if (!skills.has(s)) skills.set(s, { lines: [l.n], quote: l.text.slice(0, 200) })
  if (!skillLines.length) warnings.push('No skills section was found; skills were read from the whole text.')
  // Raw technology tokens from the skills section (comma separated words) that the lexicon does not know.
  const technologies = Array.from(
    new Set(
      skillLines
        .flatMap((l) => l.text.replace(/^[^:]{0,30}:/, '').split(/[,;|•·]/))
        .map((t) => t.trim())
        .filter((t) => t && t.length <= 30 && !/^\d+$/.test(t)),
    ),
  )

  // Employment: entries start at a line with a date range inside the experience section.
  const employment: EmploymentEntry[] = []
  const expLines = linesIn('experience')
  let entry: { head: { n: number; text: string }[]; bullets: { n: number; text: string }[]; hasDate: boolean } | null = null
  const flush = () => {
    if (!entry) return
    const headText = entry.head.map((h) => h.text).join(' | ')
    const range = parseRange(headText, now)
    const withoutDate = headText.replace(DATE_RANGE, '').replace(/\|\s*\|/g, '|').replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim()
    const parts = withoutDate.split(/\s+(?:at|@|-|–|—|\|)\s+/).map((p) => p.trim()).filter(Boolean)
    employment.push({
      title: parts[0] || null,
      company: parts[1] || null,
      start: range.start,
      end: range.end,
      months: range.months,
      bullets: entry.bullets.map((b) => b.text.replace(BULLET, '')),
      evidence: evidenceOf([...entry.head, ...entry.bullets].slice(0, 12)),
    })
    entry = null
  }
  for (const l of expLines) {
    const dated = DATE_RANGE.test(l.text)
    const bullet = BULLET.test(l.text)
    if (!entry) {
      if (bullet) continue // stray bullet before any role
      entry = { head: [l], bullets: [], hasDate: dated }
    } else if (bullet) entry.bullets.push(l)
    else if (entry.bullets.length || (entry.hasDate && dated) || entry.head.length >= 3) {
      flush()
      entry = { head: [l], bullets: [], hasDate: dated }
    } else {
      entry.head.push(l)
      entry.hasDate = entry.hasDate || dated
    }
  }
  flush()
  if (expLines.length && !employment.length) warnings.push('An experience section was found but no dated entries could be read from it.')
  const dated = employment.filter((e) => e.months != null)
  const totalExperienceMonths = dated.length ? dated.reduce((s, e) => s + (e.months || 0), 0) : null
  if (totalExperienceMonths == null) unknown.push('years of experience')

  // Projects: "Name — description" or "Name: description" lines, bullets belong to the previous project.
  const projects: ProjectEntry[] = []
  for (const l of linesIn('projects')) {
    const isBullet = BULLET.test(l.text)
    if (!isBullet) {
      const m = /^(.{2,60}?)\s*(?:[-–—:|]|\(|$)\s*(.*)$/.exec(l.text)
      const nameText = (m?.[1] || l.text).trim()
      projects.push({ name: nameText, description: (m?.[2] || '').trim(), technologies: extractSkills(l.text), evidence: { lines: [l.n], quote: l.text.slice(0, 300) } })
    } else if (projects.length) {
      const p = projects[projects.length - 1]
      p.description = `${p.description} ${l.text.replace(BULLET, '')}`.trim()
      p.technologies = Array.from(new Set([...p.technologies, ...extractSkills(l.text)]))
      p.evidence = { lines: [...p.evidence.lines, l.n], quote: `${p.evidence.quote} ${l.text}`.slice(0, 300) }
    }
  }

  const education: EducationEntry[] = linesIn('education')
    .filter((l) => !BULLET.test(l.text) || /\b(b\.?tech|b\.?e\b|m\.?tech|bachelor|master|b\.?sc|m\.?sc|mca|bca|phd|diploma|university|college|institute)\b/i.test(l.text))
    .map((l) => ({ text: l.text, year: /(?:19|20)\d{2}/.exec(l.text)?.[0] ?? null, evidence: { lines: [l.n], quote: l.text.slice(0, 200) } }))
  const certifications = linesIn('certifications').map((l) => ({ text: l.text.replace(BULLET, ''), evidence: { lines: [l.n], quote: l.text.slice(0, 200) } }))
  const achievements = linesIn('achievements').map((l) => ({ text: l.text.replace(BULLET, ''), evidence: { lines: [l.n], quote: l.text.slice(0, 200) } }))
  if (!education.length) unknown.push('education')
  if (!certifications.length) unknown.push('certifications')

  return {
    profile: {
      name,
      headline,
      contact: { email, phone, links },
      summary,
      skills: Array.from(skills.entries()).map(([n, evidence]) => ({ name: n, evidence })),
      technologies,
      employment,
      projects,
      education,
      certifications,
      achievements,
      totalExperienceMonths,
      sections: sections.filter((s) => s.endLine >= s.startLine),
      unknown,
    },
    warnings,
  }
}
