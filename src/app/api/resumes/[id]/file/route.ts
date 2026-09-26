import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../../../lib/server/entitlements'
import { getResumeFile } from '../../../../../lib/server/resumes'

export const dynamic = 'force-dynamic'

/** Owner-only download of the original file. Never cached, never listed. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const file = await getResumeFile(access.userId!, id)
    if (!file) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    return new NextResponse(new Uint8Array(file.content), {
      headers: {
        'content-type': file.mimeType,
        'content-disposition': `attachment; filename="${file.filename.replace(/"/g, '')}"`,
        'cache-control': 'private, no-store',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/resumes/[id]/file')
  }
}
