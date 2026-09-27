import { NextResponse } from 'next/server'
import type { JobListFilters } from '../../../../lib/jobs/types'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { hiringCompanies } from '../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

/** Companies with published openings that match the list filters (except company), most openings first, for the strip at the top of Job Discovery. */
export async function GET(req: Request) {
  try {
    const access = await resolveAccess()
    if (!access.config.flags.jobsModule) return NextResponse.json({ error: 'Job discovery is switched off right now.', code: 'disabled' }, { status: 503 })
    if (!access.can('jobs.discovery')) return NextResponse.json({ error: 'Job discovery is not available on this account.', code: 'upgrade' }, { status: 402 })
    const url = new URL(req.url)
    const limit = Math.min(300, Math.max(1, Number(url.searchParams.get('limit')) || 60))
    const advanced = access.can('jobs.advancedFilters')
    const filters: JobListFilters = {
      q: url.searchParams.get('q')?.trim() || undefined,
      roleCategory: url.searchParams.get('roleCategory') || undefined,
      region: (url.searchParams.get('region') as JobListFilters['region']) || '',
      workMode: (url.searchParams.get('workMode') as JobListFilters['workMode']) || '',
      level: advanced ? (url.searchParams.get('level') as JobListFilters['level']) || '' : '',
      employmentType: advanced ? (url.searchParams.get('employmentType') as JobListFilters['employmentType']) || '' : '',
      city: url.searchParams.get('city') || undefined,
    }
    const companies = await hiringCompanies(limit, filters)
    return NextResponse.json({ companies, total: companies.length })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/companies')
  }
}
