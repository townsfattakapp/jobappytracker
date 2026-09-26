/**
 * Provider contract for job ingestion. A provider turns one configured
 * source into raw listings; the engine normalises, classifies, de-duplicates
 * and stores them. Providers never write to the database.
 */

export interface RawJob {
  /** Stable id inside the provider (requisition / posting id). */
  externalId: string
  title: string
  /** HTML or plain text as the source published it. */
  descriptionHtml?: string | null
  descriptionText?: string | null
  /** Location as the source wrote it, e.g. "Remote, Bangalore" or "Berlin, Germany". */
  location: string | null
  /** Extra location strings (offices, secondary locations). */
  locations?: string[]
  /** Country names when the source states them separately. */
  countries?: string[]
  /** Source-declared workplace type, if any. */
  workplaceType?: 'remote' | 'hybrid' | 'onsite' | null
  employmentType?: string | null
  department?: string | null
  postedAt?: string | null
  updatedAt?: string | null
  /** Canonical page of the listing on the source. */
  sourceUrl: string
  /** Where a candidate applies (falls back to sourceUrl). */
  applyUrl?: string | null
  /** Small subset of the payload kept for debugging (never the whole HTML). */
  raw?: Record<string, unknown>
}

export interface ProviderSource {
  id: string
  name: string
  provider: string
  baseUrl: string | null
  config: Record<string, unknown>
}

export interface FetchContext {
  fetch: typeof fetch
  /** Log lines end up in the ingestion run record. */
  log: (line: string) => void
}

export interface JobProvider {
  id: string
  label: string
  /** Short admin-facing description of what config the provider needs. */
  configHelp: string
  /** Returns raw listings, or throws with a clear message for the run log. */
  fetchJobs(source: ProviderSource, ctx: FetchContext): Promise<RawJob[]>
}
