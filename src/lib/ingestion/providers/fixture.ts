import type { JobProvider, RawJob } from '../types'

/**
 * Deterministic provider for development and tests: listings come from the
 * source's own config (`config.jobs`), so ingestion can be exercised end to
 * end without any network access. Never intended for production sources.
 */
export const fixtureProvider: JobProvider = {
  id: 'fixture',
  label: 'Fixture (development only)',
  configHelp: 'config.jobs = an array of raw listings { externalId, title, descriptionText, location, sourceUrl, ... }.',
  async fetchJobs(source, ctx) {
    const jobs = Array.isArray(source.config.jobs) ? (source.config.jobs as Partial<RawJob>[]) : []
    ctx.log(`${jobs.length} fixture listings`)
    return jobs
      .filter((j) => j && typeof j.externalId === 'string' && typeof j.title === 'string' && typeof j.sourceUrl === 'string')
      .map<RawJob>((j) => ({
        externalId: j.externalId!,
        title: j.title!,
        descriptionHtml: j.descriptionHtml ?? null,
        descriptionText: j.descriptionText ?? null,
        location: j.location ?? null,
        locations: j.locations ?? [],
        countries: j.countries ?? [],
        workplaceType: j.workplaceType ?? null,
        employmentType: j.employmentType ?? null,
        department: j.department ?? null,
        postedAt: j.postedAt ?? null,
        updatedAt: j.updatedAt ?? null,
        sourceUrl: j.sourceUrl!,
        applyUrl: j.applyUrl ?? null,
        raw: j.raw ?? {},
      }))
  },
}
