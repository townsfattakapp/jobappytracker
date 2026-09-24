import { auth } from '../auth'

export async function isCurriculumAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.email) return false
  const admins = (process.env.CURRICULUM_ADMINS || '').split(',').map(e => e.trim().toLowerCase())
  return admins.includes(session.user.email.toLowerCase())
}
