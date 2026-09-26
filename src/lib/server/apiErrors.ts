import { NextResponse } from 'next/server'
import { ValidationError } from '../jobs/normalize'
import { monitoring } from './monitoring'

/** Maps thrown errors to JSON responses; validation problems are 400, everything else 500 without leaking details. */
export function errorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof ValidationError) return NextResponse.json({ error: error.message, field: error.field ?? null }, { status: 400 })
  const errorId = monitoring.notifyApiFailure(context, error)
  return NextResponse.json({ error: `Something went wrong. Try again (ref ${errorId}).`, errorId }, { status: 500 })
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    throw new ValidationError('Request body must be valid JSON')
  }
}

export function pageParams(url: URL, defaultSize = 25): { page: number; pageSize: number } {
  const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || defaultSize) || defaultSize))
  return { page, pageSize }
}
