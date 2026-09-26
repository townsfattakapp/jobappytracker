import { NextResponse } from 'next/server'
import { rateLimited } from '../../../lib/server/rateLimit'
import { ValidationError } from '../../../lib/jobs/normalize'
import { errorResponse } from '../../../lib/server/apiErrors'
import { isResponse, requireFeature } from '../../../lib/server/entitlements'
import { listResumes, uploadResume } from '../../../lib/server/resumes'

export const dynamic = 'force-dynamic'

/** The signed-in learner's resumes (metadata only, never file bytes). */
export async function GET() {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    return NextResponse.json({ resumes: await listResumes(access.userId!) })
  } catch (error) {
    return errorResponse(error, 'GET /api/resumes')
  }
}

/** multipart/form-data: file (PDF or text), optional title, optional targetRoleCategory. */
export async function POST(req: Request) {
  try {
    const access = await requireFeature('resume.profile')
    if (isResponse(access)) return access
    const burst = rateLimited(req, 'resume.upload', 10, 60_000, access.userId)
    if (burst) return burst
    let form: FormData
    try {
      form = await req.formData()
    } catch {
      throw new ValidationError('Send the resume as multipart form data', 'file')
    }
    const file = form.get('file')
    if (!(file instanceof File)) throw new ValidationError('Choose a file to upload', 'file')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const resume = await uploadResume(access.userId!, {
      bytes,
      filename: file.name,
      declaredType: file.type,
      title: typeof form.get('title') === 'string' ? String(form.get('title')) : null,
      targetRoleCategory: typeof form.get('targetRoleCategory') === 'string' ? String(form.get('targetRoleCategory')) : null,
    })
    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/resumes')
  }
}
