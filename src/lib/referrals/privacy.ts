/**
 * The learner-facing projection of a referrer. Everything identifying stays
 * out; when a company's verified pool is small, even broad attributes are
 * dropped so that "the senior engineer in Hyderabad" cannot single someone out.
 */

export interface ReferrerPrivateLike {
  publicId: string
  roleFamilies: string[]
  experienceBand: string | null
  department: string | null
  verificationStatus: string
  availability: string
}

export interface ReferrerPublicProfile {
  publicId: string
  company: string
  /** Broad area such as "Engineering" or "Data"; never a team name. */
  area: string
  experienceBand: string | null
  verified: boolean
  availability: 'available' | 'paused'
  identityProtected: true
}

const AREA_LABELS: Record<string, string> = {
  'software-engineer': 'Engineering',
  backend: 'Engineering',
  frontend: 'Engineering',
  'full-stack': 'Engineering',
  java: 'Engineering',
  nodejs: 'Engineering',
  'react-nextjs': 'Engineering',
  mobile: 'Engineering',
  'devops-cloud': 'Engineering',
  'data-engineer': 'Data',
  'data-scientist': 'Data',
  'ai-ml': 'Data',
  'data-analyst': 'Data',
  cybersecurity: 'Security',
  any: 'Engineering',
}

export function broadArea(roleFamilies: string[]): string {
  const areas = Array.from(new Set(roleFamilies.map((f) => AREA_LABELS[f] ?? 'Engineering')))
  return areas.length === 1 ? areas[0] : areas.length ? areas.slice(0, 2).join(' and ') : 'Engineering'
}

/** Minimum verified referrers at a company before experience band is shown; below it only the area is exposed. */
export const MIN_POOL_FOR_DETAIL = 3

export function toPublicProfile(r: ReferrerPrivateLike, company: string, poolSize: number): ReferrerPublicProfile {
  return {
    publicId: r.publicId,
    company,
    area: broadArea(r.roleFamilies),
    experienceBand: poolSize >= MIN_POOL_FOR_DETAIL ? r.experienceBand : null,
    verified: r.verificationStatus === 'VERIFIED',
    availability: r.availability === 'available' ? 'available' : 'paused',
    identityProtected: true,
  }
}

/** Keys that must never appear in any learner-facing payload; used by tests and the API projection guard. */
export const PRIVATE_REFERRER_FIELDS = ['fullName', 'contactEmail', 'contactEmailVerifiedAt', 'corporateEmail', 'corporateEmailDomain', 'userId', 'profileUrl', 'internalNotes', 'title', 'location', 'invitedBy', 'tokenHash', 'evidenceRef', 'email', 'phone'] as const

export function assertNoPrivateFields(payload: unknown, path = '$'): void {
  if (!payload || typeof payload !== 'object') return
  if (Array.isArray(payload)) {
    payload.forEach((v, i) => assertNoPrivateFields(v, `${path}[${i}]`))
    return
  }
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    if ((PRIVATE_REFERRER_FIELDS as readonly string[]).includes(k)) throw new Error(`private referrer field "${k}" at ${path}`)
    assertNoPrivateFields(v, `${path}.${k}`)
  }
}

/** What a learner is told about the person reviewing their request, mirroring the product copy. */
export function describePublicProfile(p: ReferrerPublicProfile): string[] {
  return ['Verified employee', `Company: ${p.company}`, `Area: ${p.area}`, ...(p.experienceBand ? [`Level: ${p.experienceBand}`] : []), 'Employment verified', 'Identity protected']
}
