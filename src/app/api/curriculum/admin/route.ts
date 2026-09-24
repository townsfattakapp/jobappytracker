import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { curriculumTracks } from '../../../../lib/db/schema'
import { isCurriculumAdmin } from '../../../../lib/server/curriculum'
import { eq, not } from 'drizzle-orm'

export async function GET(req: Request) {
  if (!(await isCurriculumAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    
    let query = db.select().from(curriculumTracks)
    if (status) {
      query = query.where(eq(curriculumTracks.status, status)) as any
    } else {
      // by default, don't show archived
      query = query.where(not(eq(curriculumTracks.status, 'archived'))) as any
    }
    
    const tracks = await query
    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Admin GET curriculum error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!(await isCurriculumAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await req.json()
    const { id, title, family, data, status, reviewNote } = body
    
    if (!id || !title || !family || !data || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const [track] = await db.insert(curriculumTracks).values({
      id,
      title,
      family,
      data,
      status,
      reviewNote,
      version: 1,
      publishedAt: status === 'published' ? new Date() : null
    }).onConflictDoUpdate({
      target: curriculumTracks.id,
      set: {
        title,
        family,
        data,
        status,
        reviewNote,
        updatedAt: new Date(),
        publishedAt: status === 'published' ? new Date() : null,
        version: body.version ? body.version + 1 : 2
      }
    }).returning()
    
    return NextResponse.json(track)
  } catch (error) {
    console.error('Admin PUT curriculum error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!(await isCurriculumAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await req.json()
    const { id, status, reviewNote } = body
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const [track] = await db.update(curriculumTracks)
      .set({ 
        status, 
        reviewNote, 
        updatedAt: new Date(),
        ...(status === 'published' ? { publishedAt: new Date() } : {})
      })
      .where(eq(curriculumTracks.id, id))
      .returning()
      
    if (!track) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(track)
  } catch (error) {
    console.error('Admin PATCH curriculum error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!(await isCurriculumAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    await db.delete(curriculumTracks).where(eq(curriculumTracks.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE curriculum error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
