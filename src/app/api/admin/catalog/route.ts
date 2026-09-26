import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { catalogStatus, ingestCatalog, scheduleCatalog, seedCatalog, verifyCatalogFeeds } from '../../../../lib/server/catalog'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/** Catalog rows with derived status (Configured / Healthy / Degraded / Unsupported / Not configured). */
export async function GET() {
  const actor = await requireRole('admin', 'jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json(await catalogStatus())
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/catalog')
  }
}

/** Body: { action: 'seed' | 'verify' | 'ingest' | 'schedule', enabled?: boolean, slugs?: string[] }. Seeding is idempotent; verify is read-only; ingest and schedule apply only to verified, allowed sources. */
export async function POST(req: Request) {
  const actor = await requireRole('admin', 'jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as { action?: string; slugs?: unknown; enabled?: unknown }
    const slugs = Array.isArray(body?.slugs) ? body.slugs.map(String).slice(0, 100) : undefined
    switch (body?.action) {
      case 'seed':
        return NextResponse.json({ seed: await seedCatalog(actor.userId), status: await catalogStatus() })
      case 'verify':
        return NextResponse.json({ results: await verifyCatalogFeeds(actor.userId, { slugs }), status: await catalogStatus() })
      case 'ingest':
        return NextResponse.json({ results: await ingestCatalog(actor.userId, slugs), status: await catalogStatus() })
      case 'schedule':
        return NextResponse.json({ scheduled: await scheduleCatalog(actor.userId, body.enabled !== false, slugs), status: await catalogStatus() })
      default:
        throw new ValidationError('action must be seed, verify, ingest or schedule', 'action')
    }
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/catalog')
  }
}
