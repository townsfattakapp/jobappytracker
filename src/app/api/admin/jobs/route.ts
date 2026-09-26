import { NextResponse } from 'next/server'
import { parseJobInput } from '../../../../lib/jobs/normalize'
import type { JobListFilters } from '../../../../lib/jobs/types'
import { errorResponse, pageParams, readJson } from '../../../../lib/server/apiErrors'
import { createJob, listJobsAdmin, sweepExpiredJobs } from '../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    return NextResponse.json(
      await listJobsAdmin({
        q: url.searchParams.get('q')?.trim() || undefined,
        status: url.searchParams.get('status') || undefined,
        roleCategory: url.searchParams.get('roleCategory') || undefined,
        region: (url.searchParams.get('region') as JobListFilters['region']) || '',
        workMode: (url.searchParams.get('workMode') as JobListFilters['workMode']) || '',
        companyId: url.searchParams.get('companyId') || undefined,
        lifecycle: url.searchParams.get('lifecycle') || undefined,
        sourceId: url.searchParams.get('sourceId') || undefined,
        ...pageParams(url),
      }),
    )
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/jobs')
  }
}

export async function POST(req: Request) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const body = await readJson(req)
    // Maintenance action shares the collection endpoint: { action: 'sweep_expired' }.
    if (body && typeof body === 'object' && (body as { action?: string }).action === 'sweep_expired') {
      return NextResponse.json({ expired: await sweepExpiredJobs(actor.userId) })
    }
    const job = await createJob(parseJobInput(body), actor.userId)
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/jobs')
  }
}
