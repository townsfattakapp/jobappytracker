/**
 * Indian hiring hubs for Job Discovery: the city filter groups the spellings
 * a listing may use (Bangalore / Bengaluru, Gurgaon / Gurugram, the NCR
 * towns) and ingestion stores the canonical spelling so counts add up.
 */
export interface CityGroup {
  id: string
  label: string
  /** Lower-case spellings that belong to this hub, as stored in jobs.locationCity after canonicalisation. */
  matches: string[]
}

export const INDIA_CITY_GROUPS: CityGroup[] = [
  { id: 'bengaluru', label: 'Bengaluru', matches: ['bengaluru'] },
  { id: 'hyderabad', label: 'Hyderabad', matches: ['hyderabad', 'secunderabad'] },
  { id: 'pune', label: 'Pune', matches: ['pune'] },
  { id: 'chennai', label: 'Chennai', matches: ['chennai'] },
  { id: 'mumbai', label: 'Mumbai', matches: ['mumbai', 'navi mumbai', 'thane'] },
  { id: 'delhi-ncr', label: 'Delhi NCR (Noida, Gurugram)', matches: ['delhi', 'noida', 'greater noida', 'gurugram', 'ghaziabad', 'faridabad'] },
  { id: 'kolkata', label: 'Kolkata', matches: ['kolkata'] },
  { id: 'ahmedabad', label: 'Ahmedabad', matches: ['ahmedabad', 'gandhinagar'] },
  { id: 'kochi', label: 'Kochi', matches: ['kochi', 'thiruvananthapuram'] },
  { id: 'jaipur', label: 'Jaipur', matches: ['jaipur'] },
  { id: 'indore', label: 'Indore', matches: ['indore', 'bhopal'] },
  { id: 'coimbatore', label: 'Coimbatore', matches: ['coimbatore'] },
  { id: 'chandigarh', label: 'Chandigarh / Mohali', matches: ['chandigarh', 'mohali'] },
]

export const INDIA_CITY_IDS = INDIA_CITY_GROUPS.map((g) => g.id)

export function cityGroup(id: string | null | undefined): CityGroup | null {
  return INDIA_CITY_GROUPS.find((g) => g.id === id) ?? null
}

/** Older or alternative spellings mapped to the canonical city name (lower case in, title case out). */
const CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  gurgaon: 'Gurugram',
  gurugram: 'Gurugram',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  cochin: 'Kochi',
  trivandrum: 'Thiruvananthapuram',
  mysore: 'Mysuru',
  'new delhi': 'Delhi',
  'delhi ncr': 'Delhi',
  ncr: 'Delhi',
  vizag: 'Visakhapatnam',
  poona: 'Pune',
}

/** Indian states and union territories: a listing that names only a state has no city. */
export const INDIA_STATES = ['karnataka', 'telangana', 'maharashtra', 'tamil nadu', 'uttar pradesh', 'haryana', 'west bengal', 'gujarat', 'kerala', 'rajasthan', 'madhya pradesh', 'andhra pradesh', 'punjab', 'odisha', 'bihar', 'goa', 'assam', 'delhi nct', 'national capital territory of delhi', 'jharkhand', 'chhattisgarh', 'uttarakhand', 'himachal pradesh']

/** Words that are not places even though they sit in the location field. */
export const NON_CITY_WORDS = ['office', 'offices', 'hq', 'headquarters', 'multiple locations', 'various', 'various locations', 'anywhere', 'flexible', 'n/a', 'tbd', 'other', 'india office', 'onsite', 'on-site', 'hybrid', 'remote']

export function canonicalCity(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!key || INDIA_STATES.includes(key) || NON_CITY_WORDS.includes(key)) return null
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  return key.replace(/\b\w/g, (ch) => ch.toUpperCase())
}
