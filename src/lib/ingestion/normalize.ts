import { extractSkills } from '../jobs/skills'
import { normalizeTitle } from '../jobs/normalize'
import { ROLE_CATEGORIES, type EmploymentType, type JobLevel, type JobRegion, type RoleFamilyConfig, type WorkMode, effectiveRoleCategories } from '../jobs/taxonomy'
import type { RawJob } from './types'

/**
 * Deterministic normalisation of a raw provider listing. Everything here is
 * string rules (no model calls) so results are reproducible and testable.
 */

export interface NormalizedJob {
  externalId: string
  title: string
  normalizedTitle: string
  description: string
  roleCategory: string | null
  level: JobLevel
  employmentType: EmploymentType
  workMode: WorkMode
  locationCity: string | null
  locationCountry: string | null
  region: JobRegion
  remoteEligibility: 'unknown' | 'country' | 'region' | 'worldwide' | 'not_remote'
  eligibleCountries: string[]
  experienceMin: number | null
  experienceMax: number | null
  requiredSkills: string[]
  preferredSkills: string[]
  postedAt: string | null
  updatedAt: string | null
  sourceUrl: string
  applyUrl: string
  rawMetadata: Record<string, unknown>
  /** Why the job was kept or dropped. */
  relevance: { relevant: boolean; reason: string }
}

// ---------------------------------------------------------------------------
// HTML → text
// ---------------------------------------------------------------------------

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'", '#8217': '’', '#8211': '–', '#8212': '—', '#8226': '•' }

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    const key = code.toLowerCase()
    if (ENTITIES[key] !== undefined) return ENTITIES[key]
    if (key.startsWith('#x')) return String.fromCodePoint(parseInt(key.slice(2), 16))
    if (key.startsWith('#')) return String.fromCodePoint(parseInt(key.slice(1), 10))
    return m
  })
}

/** Greenhouse double-encodes HTML; decode entities until stable, then strip tags into readable paragraphs. */
export function htmlToText(html: string): string {
  let s = html
  for (let i = 0; i < 3 && /&(lt|gt|amp|quot|#\d+);/i.test(s); i += 1) s = decodeEntities(s)
  s = s.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
  s = s.replace(/<\s*br\s*\/?>/gi, '\n')
  s = s.replace(/<\s*\/\s*(p|div|li|h[1-6]|tr|section|ul|ol)\s*>/gi, '\n')
  s = s.replace(/<\s*li[^>]*>/gi, '• ')
  s = s.replace(/<[^>]+>/g, ' ')
  s = decodeEntities(s)
  s = s.replace(/[ \t\u00A0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

const INDIA_CITIES = ['bengaluru', 'bangalore', 'hyderabad', 'pune', 'chennai', 'mumbai', 'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'kolkata', 'ahmedabad', 'jaipur', 'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'chandigarh', 'indore', 'coimbatore', 'bhubaneswar', 'nagpur', 'mysuru', 'mysore', 'vadodara', 'surat', 'lucknow', 'visakhapatnam', 'mohali', 'navi mumbai', 'thane']

const COUNTRIES: { name: string; aliases: string[] }[] = [
  { name: 'India', aliases: ['india', 'in', 'ind', 'bharat'] },
  { name: 'United States', aliases: ['united states', 'usa', 'us', 'u.s.', 'u.s.a.', 'united states of america'] },
  { name: 'United Kingdom', aliases: ['united kingdom', 'uk', 'u.k.', 'great britain', 'england', 'scotland', 'wales'] },
  { name: 'Canada', aliases: ['canada'] },
  { name: 'Germany', aliases: ['germany', 'deutschland'] },
  { name: 'France', aliases: ['france'] },
  { name: 'Netherlands', aliases: ['netherlands', 'the netherlands', 'holland'] },
  { name: 'Ireland', aliases: ['ireland'] },
  { name: 'Spain', aliases: ['spain'] },
  { name: 'Italy', aliases: ['italy'] },
  { name: 'Portugal', aliases: ['portugal'] },
  { name: 'Poland', aliases: ['poland'] },
  { name: 'Sweden', aliases: ['sweden'] },
  { name: 'Denmark', aliases: ['denmark'] },
  { name: 'Norway', aliases: ['norway'] },
  { name: 'Finland', aliases: ['finland'] },
  { name: 'Switzerland', aliases: ['switzerland'] },
  { name: 'Austria', aliases: ['austria'] },
  { name: 'Belgium', aliases: ['belgium'] },
  { name: 'Czech Republic', aliases: ['czech republic', 'czechia'] },
  { name: 'Romania', aliases: ['romania'] },
  { name: 'Ukraine', aliases: ['ukraine'] },
  { name: 'Israel', aliases: ['israel'] },
  { name: 'United Arab Emirates', aliases: ['united arab emirates', 'uae', 'dubai', 'abu dhabi'] },
  { name: 'Saudi Arabia', aliases: ['saudi arabia', 'ksa', 'riyadh'] },
  { name: 'Singapore', aliases: ['singapore'] },
  { name: 'Malaysia', aliases: ['malaysia', 'kuala lumpur'] },
  { name: 'Indonesia', aliases: ['indonesia', 'jakarta'] },
  { name: 'Philippines', aliases: ['philippines', 'manila'] },
  { name: 'Vietnam', aliases: ['vietnam'] },
  { name: 'Thailand', aliases: ['thailand', 'bangkok'] },
  { name: 'Japan', aliases: ['japan', 'tokyo'] },
  { name: 'South Korea', aliases: ['south korea', 'korea', 'seoul'] },
  { name: 'China', aliases: ['china', 'shanghai', 'beijing', 'shenzhen'] },
  { name: 'Hong Kong', aliases: ['hong kong'] },
  { name: 'Taiwan', aliases: ['taiwan', 'taipei'] },
  { name: 'Australia', aliases: ['australia', 'sydney', 'melbourne'] },
  { name: 'New Zealand', aliases: ['new zealand', 'auckland'] },
  { name: 'Brazil', aliases: ['brazil', 'brasil', 'são paulo', 'sao paulo'] },
  { name: 'Mexico', aliases: ['mexico'] },
  { name: 'Argentina', aliases: ['argentina', 'buenos aires'] },
  { name: 'Colombia', aliases: ['colombia'] },
  { name: 'Chile', aliases: ['chile'] },
  { name: 'South Africa', aliases: ['south africa'] },
  { name: 'Nigeria', aliases: ['nigeria'] },
  { name: 'Kenya', aliases: ['kenya'] },
  { name: 'Egypt', aliases: ['egypt'] },
  { name: 'Pakistan', aliases: ['pakistan'] },
  { name: 'Bangladesh', aliases: ['bangladesh'] },
  { name: 'Sri Lanka', aliases: ['sri lanka'] },
  { name: 'Turkey', aliases: ['turkey', 'türkiye'] },
]

const REGION_WORDS: { name: string; aliases: string[] }[] = [
  { name: 'EMEA', aliases: ['emea', 'europe', 'european union', 'eu'] },
  { name: 'APAC', aliases: ['apac', 'asia pacific', 'asia-pacific', 'asia'] },
  { name: 'Americas', aliases: ['americas', 'north america', 'latam', 'latin america', 'south america'] },
  { name: 'Worldwide', aliases: ['worldwide', 'global', 'anywhere', 'work from anywhere'] },
]

const tokens = (s: string) => s.toLowerCase().replace(/[()[\]]/g, ' ').split(/\s*[,;/|·–—-]\s*|\s{2,}/).map((t) => t.trim()).filter(Boolean)

function matchCountry(part: string): string | null {
  const p = part.toLowerCase().trim()
  for (const c of COUNTRIES) if (c.aliases.includes(p) || p === c.name.toLowerCase()) return c.name
  // "Remote - India" / "Bangalore, India" style: any alias as a whole word.
  for (const c of COUNTRIES) for (const a of c.aliases) if (a.length > 2 && new RegExp(`(^|[^a-z])${a.replace(/\./g, '\\.')}([^a-z]|$)`).test(p)) return c.name
  return null
}

export interface ParsedLocation {
  city: string | null
  country: string | null
  region: JobRegion
  remote: boolean
  remoteScope: 'unknown' | 'country' | 'region' | 'worldwide'
  eligibleCountries: string[]
  regionName: string | null
}

export function parseLocation(primary: string | null, extras: string[] = [], countries: string[] = []): ParsedLocation {
  const all = [primary || '', ...extras].filter(Boolean)
  const text = all.join(' | ').toLowerCase()
  const remote = /\b(remote|work from home|wfh|distributed)\b/.test(text)
  let city: string | null = null
  let country: string | null = null
  let regionName: string | null = null
  let remoteScope: ParsedLocation['remoteScope'] = 'unknown'
  const eligible = new Set<string>()

  for (const c of countries) {
    const m = matchCountry(c)
    if (m) eligible.add(m)
  }
  for (const source of all) {
    for (const part of tokens(source)) {
      if (/^(remote|hybrid|on-?site|in-?office|work from home|wfh)$/.test(part)) continue
      const c = matchCountry(part)
      if (c) {
        eligible.add(c)
        if (!country) country = c
        continue
      }
      const r = REGION_WORDS.find((x) => x.aliases.includes(part))
      if (r) {
        regionName = regionName || r.name
        continue
      }
      if (!city && INDIA_CITIES.includes(part)) {
        city = part.replace(/\b\w/g, (ch) => ch.toUpperCase())
        eligible.add('India')
        if (!country) country = 'India'
        continue
      }
      if (!city && /^[a-z][a-z .'-]{1,40}$/.test(part) && !/^\d/.test(part)) city = part.replace(/\b\w/g, (ch) => ch.toUpperCase())
    }
  }
  if (!country && eligible.size === 1) country = Array.from(eligible)[0]
  if (remote) {
    if (regionName === 'Worldwide') remoteScope = 'worldwide'
    else if (regionName) remoteScope = 'region'
    else if (eligible.size > 0) remoteScope = 'country'
  }
  const region: JobRegion = country === 'India' || (eligible.size > 0 && Array.from(eligible).every((c) => c === 'India')) ? 'india' : country || regionName || eligible.size ? 'international' : remote ? 'international' : 'international'
  return { city, country, region, remote, remoteScope, eligibleCountries: Array.from(eligible), regionName }
}

// ---------------------------------------------------------------------------
// Work mode, employment type, level, experience
// ---------------------------------------------------------------------------

export function detectWorkMode(raw: RawJob, loc: ParsedLocation): WorkMode {
  if (raw.workplaceType) return raw.workplaceType
  const text = `${raw.title} | ${raw.location || ''} | ${(raw.locations || []).join(' | ')}`.toLowerCase()
  if (/\bhybrid\b/.test(text)) return 'hybrid'
  if (loc.remote || /\bremote\b/.test(text)) return 'remote'
  return 'onsite'
}

export function detectEmploymentType(value: string | null | undefined, title: string): EmploymentType {
  const v = `${value || ''} ${title}`.toLowerCase()
  if (/\bintern(ship)?\b|\btrainee\b|\bapprentice/.test(v)) return 'internship'
  if (/\bcontract(or)?\b|\bfreelance\b|\btemporary\b|\bconsultant\b/.test(v)) return 'contract'
  if (/\bpart[- ]?time\b/.test(v)) return 'part_time'
  return 'full_time'
}

export function detectLevel(title: string, experienceMin: number | null): JobLevel {
  const t = title.toLowerCase()
  if (/\bintern(ship)?\b|\btrainee\b/.test(t)) return 'intern'
  if (/\b(principal|staff|distinguished|architect|lead|head of|director|manager)\b|\biv\b|\b4\b/.test(t)) return 'lead'
  if (/\bsenior\b|\bsr\.?\b|\biii\b|\b3\b/.test(t)) return 'senior'
  if (/\b(junior|jr\.?|associate|entry|graduate|fresher|new grad|early career)\b|\bi\b|\b1\b/.test(t)) return 'entry'
  if (/\bii\b|\b2\b|\bmid\b/.test(t)) return 'mid'
  if (experienceMin != null) {
    if (experienceMin >= 8) return 'lead'
    if (experienceMin >= 5) return 'senior'
    if (experienceMin >= 2) return 'mid'
    return 'entry'
  }
  return 'mid'
}

/** "3+ years", "2-5 years", "minimum of 4 years", "at least two years". */
export function detectExperience(text: string): { min: number | null; max: number | null } {
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
  const t = text.toLowerCase().replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g, (w) => String(words[w]))
  let best: { min: number; max: number | null } | null = null
  const consider = (min: number, max: number | null) => {
    if (min > 30 || (max != null && max > 40)) return
    if (!best || min < best.min) best = { min, max }
  }
  for (const m of t.matchAll(/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\+?\s*(?:\+\s*)?(?:years|yrs)/g)) consider(Number(m[1]), Number(m[2]))
  for (const m of t.matchAll(/(?:minimum(?: of)?|at least|min\.?|over)\s*(\d{1,2})\+?\s*(?:years|yrs)/g)) consider(Number(m[1]), null)
  for (const m of t.matchAll(/(\d{1,2})\s*\+\s*(?:years|yrs)/g)) consider(Number(m[1]), null)
  for (const m of t.matchAll(/(\d{1,2})\s*(?:years|yrs)(?:\s+of)?\s+(?:experience|exp|hands-on|professional|industry)/g)) consider(Number(m[1]), null)
  return best ? { min: (best as { min: number }).min, max: (best as { max: number | null }).max } : { min: null, max: null }
}

// ---------------------------------------------------------------------------
// Role classification and relevance
// ---------------------------------------------------------------------------

const EXCLUDED_TITLE = /\b(recruiter|recruiting|talent acquisition|sales|account executive|account manager|marketing|customer success|support engineer|technical writer|legal|counsel|finance|accountant|payroll|hr\b|people ops|office manager|executive assistant|designer|product manager|program manager|project manager|solutions consultant|solution consultant|pre-?sales|business development|operations manager|content|copywriter|community)\b/i

/** Titles that are never learner targets even when they contain "engineer". */
const HARD_EXCLUDED_TITLE = /\b(customer success|customer support|support engineer|solutions? engineer|sales engineer|pre-?sales|technical account|account manager|engineering manager|manager|director|vice president|vp\b|chief|head of|evangelist|advocate)\b/i

const SKILL_HINTS: Record<string, string[]> = {
  frontend: ['React', 'Next.js', 'Angular', 'Vue', 'HTML', 'CSS'],
  'react-nextjs': ['React', 'Next.js'],
  nodejs: ['Node.js', 'Express', 'NestJS'],
  java: ['Java', 'Spring Boot'],
  mobile: ['Android', 'iOS', 'Flutter', 'React Native', 'Kotlin', 'Swift'],
  'devops-cloud': ['Kubernetes', 'Terraform', 'CI/CD', 'AWS', 'Azure', 'GCP', 'SRE', 'Docker'],
  'data-engineer': ['Spark', 'Airflow', 'dbt', 'ETL', 'Data Warehousing'],
  'data-analyst': ['Power BI', 'Tableau', 'Excel', 'Statistics'],
  'data-scientist': ['Machine Learning', 'Statistics', 'Pandas'],
  'ai-ml': ['Machine Learning', 'Deep Learning', 'LLMs', 'RAG', 'NLP', 'MLOps'],
  cybersecurity: ['Application Security', 'Network Security', 'Cryptography', 'IAM', 'Cloud Security', 'Threat Modeling'],
  backend: ['Spring Boot', 'Django', 'FastAPI', 'Go', 'Microservices', 'REST APIs'],
}

export interface Classification {
  roleCategory: string | null
  reason: string
}

/**
 * Title first (longest matching hint wins), then department, then the skill
 * profile as a tie-breaker. Titles that clearly belong to non-engineering
 * functions are rejected even when they mention a technology.
 */
export function classifyRole(title: string, department: string | null | undefined, skills: string[], config?: RoleFamilyConfig): Classification {
  const categories = effectiveRoleCategories(config)
  const t = title.toLowerCase()
  if (HARD_EXCLUDED_TITLE.test(t)) return { roleCategory: null, reason: 'title belongs to a customer-facing or management function' }
  if (EXCLUDED_TITLE.test(t) && !/\bengineer(ing)?\b|\bdeveloper\b|\bscientist\b|\banalyst\b/.test(t)) return { roleCategory: null, reason: 'title belongs to a non-engineering function' }
  let best: { id: string; len: number; hint: string } | null = null
  for (const cat of categories) for (const hint of cat.hints) {
    const h = hint.toLowerCase()
    if (h.length < 3) continue
    const re = new RegExp(`(^|[^a-z])${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`)
    if (re.test(t) && (!best || h.length > best.len)) best = { id: cat.id, len: h.length, hint }
  }
  if (best && best.id === 'software-engineer') {
    // A generic engineering title with a clear specialised skill profile belongs to that family.
    const top = topSkillFamily(skills, categories)
    if (top) return { roleCategory: top.id, reason: `generic engineering title with ${top.hits} ${top.id} skills` }
  }
  if (best) return { roleCategory: best.id, reason: `title mentions "${best.hint}"` }
  const dept = (department || '').toLowerCase()
  if (dept) {
    for (const cat of categories) for (const hint of cat.hints) {
      if (hint.length >= 4 && dept.includes(hint.toLowerCase())) return { roleCategory: cat.id, reason: `department mentions "${hint}"` }
    }
  }
  const generic = /\b(engineer|developer|programmer|sde|swe)\b/.test(t)
  if (generic) {
    const top = topSkillFamily(skills, categories)
    if (top) return { roleCategory: top.id, reason: `engineering title with ${top.hits} ${top.id} skills` }
    if (categories.some((c) => c.id === 'software-engineer')) return { roleCategory: 'software-engineer', reason: 'generic engineering title' }
  }
  return { roleCategory: null, reason: 'no supported role family matched' }
}

/** The specialised family with at least two matching skills, if any. */
function topSkillFamily(skills: string[], categories: { id: string }[]): { id: string; hits: number } | null {
  let top: { id: string; hits: number } | null = null
  for (const [id, hintSkills] of Object.entries(SKILL_HINTS)) {
    if (!categories.some((c) => c.id === id)) continue
    const hits = hintSkills.filter((s) => skills.includes(s)).length
    if (hits >= 2 && (!top || hits > top.hits)) top = { id, hits }
  }
  return top
}

// ---------------------------------------------------------------------------
// Whole job
// ---------------------------------------------------------------------------

const REQUIRED_HEADINGS = /(requirements|what you('|’)ll need|what you need|must have|minimum qualifications|basic qualifications|qualifications|you have|about you|who you are|what we('|’)re looking for)/i
const PREFERRED_HEADINGS = /(nice to have|preferred qualifications|bonus|good to have|plus|preferred)/i

/** Splits a description into required and preferred skill lists using section headings when present. */
export function splitSkills(title: string, description: string): { required: string[]; preferred: string[] } {
  const lines = description.split('\n')
  let mode: 'none' | 'required' | 'preferred' = 'none'
  const req: string[] = []
  const pref: string[] = []
  for (const line of lines) {
    const short = line.trim().length < 80
    if (short && PREFERRED_HEADINGS.test(line)) {
      mode = 'preferred'
      continue
    }
    if (short && REQUIRED_HEADINGS.test(line)) {
      mode = 'required'
      continue
    }
    if (mode === 'required') req.push(line)
    else if (mode === 'preferred') pref.push(line)
  }
  const titleSkills = extractSkills(title)
  const requiredSkills = req.length ? extractSkills(req.join('\n')) : extractSkills(description, 12)
  const preferredSkills = pref.length ? extractSkills(pref.join('\n')).filter((s) => !requiredSkills.includes(s)) : []
  const required = Array.from(new Set([...titleSkills, ...requiredSkills])).slice(0, 15)
  return { required, preferred: preferredSkills.filter((s) => !required.includes(s)).slice(0, 10) }
}

export function normalizeRawJob(raw: RawJob, config?: RoleFamilyConfig): NormalizedJob {
  const description = raw.descriptionText?.trim() || (raw.descriptionHtml ? htmlToText(raw.descriptionHtml) : '')
  const loc = parseLocation(raw.location, raw.locations || [], raw.countries || [])
  const workMode = detectWorkMode(raw, loc)
  const { required, preferred } = splitSkills(raw.title, description)
  const exp = detectExperience(description)
  const classification = classifyRole(raw.title, raw.department, [...required, ...preferred], config)
  const relevant = Boolean(classification.roleCategory) && description.length > 0
  const remoteEligibility: NormalizedJob['remoteEligibility'] = workMode === 'remote' ? loc.remoteScope : 'not_remote'
  return {
    externalId: raw.externalId,
    title: raw.title.trim(),
    normalizedTitle: normalizeTitle(raw.title),
    description,
    roleCategory: classification.roleCategory,
    level: detectLevel(raw.title, exp.min),
    employmentType: detectEmploymentType(raw.employmentType, raw.title),
    workMode,
    locationCity: loc.city,
    locationCountry: loc.country,
    region: loc.region,
    remoteEligibility,
    eligibleCountries: loc.eligibleCountries,
    experienceMin: exp.min,
    experienceMax: exp.max,
    requiredSkills: required,
    preferredSkills: preferred,
    postedAt: raw.postedAt || null,
    updatedAt: raw.updatedAt || null,
    sourceUrl: raw.sourceUrl,
    applyUrl: raw.applyUrl || raw.sourceUrl,
    rawMetadata: { ...(raw.raw || {}), department: raw.department || null, location: raw.location, locations: raw.locations || [], classification: classification.reason },
    relevance: { relevant, reason: relevant ? classification.reason : description ? classification.reason : 'empty description' },
  }
}

export const KNOWN_ROLE_CATEGORY_IDS = ROLE_CATEGORIES.map((c) => c.id)
