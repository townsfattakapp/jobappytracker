import type { ResumeProfile } from '../resume/extract'
import type { ResumeAnalysisReport } from './resumeAnalysis'
import type { JobDto } from './types'

/**
 * Networking and referral guidance. Everything here is guidance the learner
 * acts on manually: contact *categories* (never named people), copyable
 * LinkedIn search queries, and message drafts assembled only from facts the
 * learner's own resume and the listing contain. Nothing is scraped or sent.
 */

export type ContactType = 'recruiter' | 'engineer' | 'senior_engineer' | 'engineering_manager' | 'hiring_manager' | 'alumni' | 'peer' | 'other'

export const CONTACT_TYPES: { id: ContactType; label: string }[] = [
  { id: 'recruiter', label: 'Recruiter / talent acquisition' },
  { id: 'engineer', label: 'Engineer in the team or domain' },
  { id: 'senior_engineer', label: 'Senior engineer' },
  { id: 'engineering_manager', label: 'Engineering manager' },
  { id: 'hiring_manager', label: 'Hiring manager' },
  { id: 'alumni', label: 'Alumni / mutual connection' },
  { id: 'peer', label: 'Someone in a similar role' },
  { id: 'other', label: 'Other' },
]

export interface ContactCategory {
  type: ContactType
  title: string
  why: string
  /** What to look for; never a claim about a specific person. */
  howToFind: string
}

const DOMAIN_WORDS: Record<string, string> = {
  backend: 'backend',
  frontend: 'frontend',
  'full-stack': 'full stack',
  java: 'Java',
  nodejs: 'Node.js',
  'react-nextjs': 'React',
  mobile: 'mobile',
  'devops-cloud': 'platform / DevOps',
  'data-analyst': 'analytics',
  'data-scientist': 'data science',
  'data-engineer': 'data engineering',
  'ai-ml': 'machine learning',
  cybersecurity: 'security',
  'software-engineer': 'software engineering',
}

export function contactCategories(job: JobDto): ContactCategory[] {
  const company = job.company.name
  const domain = DOMAIN_WORDS[job.roleCategory] || 'engineering'
  const senior = job.level === 'senior' || job.level === 'lead'
  const out: ContactCategory[] = [
    { type: 'recruiter', title: 'Recruiter or talent acquisition partner', why: `Recruiters own the pipeline for openings like this one; they can confirm the role is still open, explain the process and flag your application internally.`, howToFind: `Search ${company} people with "recruiter", "talent acquisition" or "technical recruiter" in their title. Many list the teams they hire for.` },
    { type: 'engineer', title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} engineer at ${company}`, why: `Engineers in the same domain know what the team actually works on and how interviews run, and many companies pay referral bonuses, so a polite, specific request is normal.`, howToFind: `Search ${company} with "${domain} engineer"${job.requiredSkills[0] ? ` or "${job.requiredSkills[0]}"` : ''}; look for people whose profile mentions the same stack as the listing.` },
    { type: 'senior_engineer', title: 'Senior or staff engineer', why: 'Senior engineers often sit on interview loops and can tell you which skills matter most for this level.', howToFind: `Search ${company} with "senior", "staff" or "principal" plus "${domain}".` },
    { type: 'engineering_manager', title: 'Engineering manager', why: senior ? 'For a senior role the hiring manager is usually an engineering manager or director; a short, concrete note about relevant work can be worth more than a generic application.' : 'Managers know which teams are hiring at your level and can point you to the right recruiter.', howToFind: `Search ${company} with "engineering manager" plus "${domain}".` },
  ]
  out.push({ type: 'hiring_manager', title: 'Hiring manager (only when the listing or a recruiter names them)', why: 'Reaching the actual hiring manager is useful only when you know who they are; guessing wastes their time and yours.', howToFind: 'Check whether the listing, the careers page or a recruiter reply names the manager. JobAppy does not identify people; do not assume a title means they own this opening.' })
  out.push({ type: 'alumni', title: 'Alumni and mutual connections', why: 'A shared school, previous employer or mutual connection gives a genuine reason to reach out and a higher reply rate.', howToFind: `On LinkedIn, open ${company} → People and filter by your school or past companies. Only mention a connection that actually exists.` })
  out.push({ type: 'peer', title: 'People in a similar role elsewhere', why: 'Peers who moved into this kind of role recently can describe the interview and what they prepared.', howToFind: `Search "${job.title}" without the company filter and look for recent starters.` })
  return out
}

export interface SearchQuery {
  label: string
  query: string
  url: string
  /** Facts the query relies on, so the UI can say where it came from. */
  basis: string
}

const peopleUrl = (q: string) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`

export function linkedInSearches(job: JobDto, profile: ResumeProfile | null): SearchQuery[] {
  const company = job.company.name
  const domain = DOMAIN_WORDS[job.roleCategory] || 'engineering'
  const out: SearchQuery[] = [
    { label: 'Company + role', query: `${company} ${job.title}`, url: peopleUrl(`${company} ${job.title}`), basis: 'job listing' },
    { label: 'Company + recruiter', query: `${company} technical recruiter`, url: peopleUrl(`${company} technical recruiter`), basis: 'job listing' },
    { label: 'Company + engineering manager + domain', query: `${company} engineering manager ${domain}`, url: peopleUrl(`${company} engineering manager ${domain}`), basis: 'job listing' },
  ]
  for (const skill of job.requiredSkills.slice(0, 2)) out.push({ label: `Company + ${skill}`, query: `${company} ${skill} engineer`, url: peopleUrl(`${company} ${skill} engineer`), basis: 'job listing (required skill)' })
  const school = profile?.education.find((e) => /university|college|institute|iit|nit|school/i.test(e.text))?.text
  if (school) {
    const short = school.replace(/^(b\.?tech|b\.?e\.?|m\.?tech|bachelor[^,]*|master[^,]*|b\.?sc|m\.?sc|mca|bca)[^,]*,?\s*/i, '').replace(/,?\s*(19|20)\d{2}.*$/, '').trim()
    if (short) out.push({ label: 'Company + your institution (alumni)', query: `${company} ${short}`, url: peopleUrl(`${company} ${short}`), basis: 'your resume (education)' })
  }
  const previous = profile?.employment.map((e) => e.company).filter((c): c is string => Boolean(c)).slice(0, 1)[0]
  if (previous) out.push({ label: 'Company + your previous employer', query: `${company} ${previous}`, url: peopleUrl(`${company} ${previous}`), basis: 'your resume (employment)' })
  return out
}

export type MessageType = 'connection' | 'referral' | 'recruiter' | 'hiring_manager' | 'follow_up' | 'thank_you'

export const MESSAGE_TYPES: { id: MessageType; label: string; free: boolean }[] = [
  { id: 'connection', label: 'Connection request', free: true },
  { id: 'recruiter', label: 'Recruiter outreach', free: true },
  { id: 'referral', label: 'Referral request', free: false },
  { id: 'hiring_manager', label: 'Hiring-manager introduction', free: false },
  { id: 'follow_up', label: 'Follow-up', free: false },
  { id: 'thank_you', label: 'Thank-you message', free: false },
]

/** Facts a draft may use; anything not listed here cannot appear in a draft. */
export interface DraftGrounding {
  learnerName: string | null
  currentTitle: string | null
  currentCompany: string | null
  yearsOfExperience: number | null
  /** Skills demonstrated in the resume that the listing asks for. */
  matchedSkills: string[]
  /** One resume project relevant to the listing. */
  project: { name: string; skills: string[] } | null
  /** Headline or summary line from the resume. */
  headline: string | null
}

export function groundingFrom(profile: ResumeProfile | null, analysis: ResumeAnalysisReport | null, fallbackName: string | null): DraftGrounding {
  const current = profile?.employment.find((e) => e.end === 'present') || profile?.employment[0] || null
  return {
    learnerName: profile?.name || fallbackName || null,
    currentTitle: current?.title ?? null,
    currentCompany: current?.company ?? null,
    yearsOfExperience: profile?.totalExperienceMonths != null ? Math.round(profile.totalExperienceMonths / 12) : null,
    matchedSkills: analysis ? analysis.strongMatches.map((m) => m.skill).slice(0, 3) : [],
    project: analysis?.projectRelevance[0] ? { name: analysis.projectRelevance[0].name, skills: analysis.projectRelevance[0].matchedSkills } : null,
    headline: profile?.headline || null,
  }
}

export interface Draft {
  type: MessageType
  subject: string | null
  body: string
  /** Every fact used, with its source, shown next to the draft. */
  usedFacts: { fact: string; source: 'resume' | 'job' | 'you' }[]
  /** What the learner must fill in before sending. */
  placeholders: string[]
  characterCount: number
  /** Optional AI-polished wording that kept every fact and placeholder (Phase 6.5). */
  refined?: { text: string; provider: string } | null
}

function experienceLine(g: DraftGrounding): { text: string; facts: Draft['usedFacts'] } {
  const facts: Draft['usedFacts'] = []
  const parts: string[] = []
  if (g.currentTitle) {
    parts.push(`I am a ${g.currentTitle}${g.currentCompany ? ` at ${g.currentCompany}` : ''}`)
    facts.push({ fact: `${g.currentTitle}${g.currentCompany ? ` at ${g.currentCompany}` : ''}`, source: 'resume' })
  } else if (g.headline) {
    parts.push(`I am a ${g.headline}`)
    facts.push({ fact: g.headline, source: 'resume' })
  }
  if (g.yearsOfExperience != null && g.yearsOfExperience >= 1) {
    parts.push(`with about ${g.yearsOfExperience} year${g.yearsOfExperience === 1 ? '' : 's'} of experience`)
    facts.push({ fact: `${g.yearsOfExperience} years of dated experience`, source: 'resume' })
  }
  if (g.matchedSkills.length) {
    parts.push(`working with ${g.matchedSkills.join(', ')}`)
    facts.push({ fact: `${g.matchedSkills.join(', ')} (demonstrated in your resume and named in the listing)`, source: 'resume' })
  }
  return { text: parts.length ? `${parts.join(' ')}.` : '', facts }
}

/**
 * Builds one draft from grounded facts only. The contact's name is always a
 * placeholder; no shared connection, familiarity or achievement is ever
 * asserted unless it is in the grounding.
 */
export function buildDraft(type: MessageType, job: JobDto, g: DraftGrounding): Draft {
  const facts: Draft['usedFacts'] = [{ fact: `${job.title} at ${job.company.name}`, source: 'job' }]
  const placeholders = ['[Name]']
  const signoff = g.learnerName ? `\n\n${g.learnerName}` : '\n\n[Your name]'
  if (g.learnerName) facts.push({ fact: g.learnerName, source: 'resume' })
  else placeholders.push('[Your name]')
  const exp = experienceLine(g)
  facts.push(...exp.facts)
  const project = g.project ? ` I recently built ${g.project.name}${g.project.skills.length ? ` (${g.project.skills.join(', ')})` : ''}.` : ''
  if (g.project) facts.push({ fact: `project “${g.project.name}”`, source: 'resume' })
  let subject: string | null = null
  let body = ''
  switch (type) {
    case 'connection':
      body = `Hi [Name], I am applying for the ${job.title} role at ${job.company.name} and would value connecting with someone on the team. ${exp.text} Happy to keep it brief; thank you for considering.`
      break
    case 'recruiter':
      subject = `${job.title} application`
      body = `Hi [Name],\n\nI have applied for the ${job.title} opening at ${job.company.name} and wanted to introduce myself. ${exp.text}${project}\n\nIf it is useful, I would be glad to share anything else that helps you assess the fit. Thank you for your time.`
      break
    case 'referral':
      subject = `Referral request: ${job.title}`
      body = `Hi [Name],\n\nI am interested in the ${job.title} opening at ${job.company.name} and I am reaching out because you work there. ${exp.text}${project}\n\nIf, after a look at my profile, you feel comfortable referring me, I would be grateful; if not, no problem at all and thank you for reading. I can send my resume and the job link whenever convenient.`
      break
    case 'hiring_manager':
      subject = `${job.title}: brief introduction`
      body = `Hi [Name],\n\nI understand you may be involved with the ${job.title} opening at ${job.company.name}; apologies if I have that wrong. ${exp.text}${project}\n\nI have applied through the official page and wanted to introduce myself in a few lines. If it is not the right moment, please ignore this note.`
      placeholders.push('[confirm the person is actually involved before sending]')
      break
    case 'follow_up':
      subject = `Following up: ${job.title}`
      body = `Hi [Name],\n\nA short follow-up on my earlier message about the ${job.title} opening at ${job.company.name}. I remain interested and would be glad to share more if helpful. If the timing is not right, no need to reply; thank you either way.`
      placeholders.push('[send only after 7–10 days without a reply]')
      break
    case 'thank_you':
      subject = `Thank you`
      body = `Hi [Name],\n\nThank you for your time and for the help with the ${job.title} role at ${job.company.name}. I appreciate it, and I will keep you posted on how it goes.`
      break
  }
  body = `${body}${signoff}`
  return { type, subject, body, usedFacts: facts, placeholders, characterCount: body.length }
}

export function buildDrafts(job: JobDto, g: DraftGrounding, types: MessageType[]): Draft[] {
  return types.map((t) => buildDraft(t, job, g))
}
