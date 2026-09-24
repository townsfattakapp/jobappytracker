import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { curriculumTracks } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tracks = await db.select().from(curriculumTracks).where(eq(curriculumTracks.ownerId, session.user.id))
    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching personal curriculum:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
