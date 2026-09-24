import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { curriculumTracks } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const tracks = await db.select().from(curriculumTracks).where(eq(curriculumTracks.status, 'published'))
    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching public curriculum:', error)
    if (process.env.NODE_ENV === 'development' && error instanceof Error && error.cause instanceof Error) {
      console.error('Curriculum database error:', JSON.stringify({
        message: error.cause.message,
        code: 'code' in error.cause ? error.cause.code : undefined,
      }))
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
