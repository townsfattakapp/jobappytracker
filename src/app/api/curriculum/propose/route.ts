import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { curriculumTracks } from '../../../../lib/db/schema'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { id, title, family, data } = body
    
    if (!id || !title || !family || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Upsert the track with status 'review'
    const [track] = await db.insert(curriculumTracks).values({
      id,
      ownerId: session.user.id,
      status: 'review',
      title,
      family,
      data,
      version: 1,
    }).onConflictDoUpdate({
      target: curriculumTracks.id,
      set: {
        status: 'review',
        title,
        family,
        data,
        updatedAt: new Date(),
        version: body.version ? body.version + 1 : 2
      }
    }).returning()
    
    return NextResponse.json(track)
  } catch (error) {
    console.error('Error proposing curriculum track:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
