import { NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { errorResponse, readJson } from '../../../lib/server/apiErrors'
import { rateLimited } from '../../../lib/server/rateLimit'
import { referralDeps } from '../../../lib/server/referralDeps'
import { companies } from '../../../lib/db/schema'
import { acceptInvite, applyAsReferrer, completeOnboarding, getReferralSettings, getReferrerByUser, listReferrerAssignments, setAvailability, startContactVerification, type OnboardingInput, type ReferrerApplicationInput } from '../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/**
 * The referrer's own portal data: profile (their own identity only), dashboard
 * counts and the assignments that belong to them. A signed-in user without a
 * referrer profile gets `referrer: null` and the network mode so the invite /
 * application screens can render.
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const deps = referralDeps()
    const settings = await getReferralSettings(deps.db)
    const dbCompanies = await deps.db.select({ id: companies.id, name: companies.name, slug: companies.slug }).from(companies).limit(150)
    const referrer = await getReferrerByUser(deps, session.user.id)
    if (!referrer) return NextResponse.json({ referrer: null, mode: settings.mode, companies: dbCompanies })
    const { assignments, counts } = await listReferrerAssignments(deps, session.user.id)
    return NextResponse.json({ referrer, assignments, counts, mode: settings.mode, companies: dbCompanies })
  } catch (error) {
    return errorResponse(error, 'GET /api/referrer')
  }
}

/**
 * Body { action: 'accept_invite', token } | { action: 'apply', ...ReferrerApplicationInput } | { action: 'onboarding', ...OnboardingInput }
 * | { action: 'availability', availability?, maxActiveRequests?, maxMonthlyRequests?, profileUrlShareable? }
 * | { action: 'send_verification' }.
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const limited = rateLimited(req, 'referrer.self', 30, 60 * 60_000, session.user.id)
    if (limited) return limited
    const body = (await readJson(req)) as { action?: string; token?: string; companyId?: string; companyName?: string } & Partial<OnboardingInput> & Partial<ReferrerApplicationInput> & { availability?: 'available' | 'paused'; maxActiveRequests?: number; maxMonthlyRequests?: number; profileUrlShareable?: boolean }
    const deps = referralDeps()
    switch (body.action) {
      case 'accept_invite': {
        if (!body.token) return NextResponse.json({ error: 'token is required', field: 'token' }, { status: 400 })
        return NextResponse.json({ referrer: await acceptInvite(deps, { token: body.token, userId: session.user.id, email: session.user.email ?? '' }) })
      }
      case 'apply': {
        const referrer = await applyAsReferrer(deps, {
          userId: session.user.id,
          email: session.user.email ?? '',
          companyId: body.companyId,
          companyName: body.companyName,
          fullName: String(body.fullName ?? session.user.name ?? ''),
          title: String(body.title ?? ''),
          roleFamilies: Array.isArray(body.roleFamilies) ? body.roleFamilies.map(String) : [],
          department: body.department ? String(body.department) : undefined,
          location: String(body.location ?? ''),
          supportedLocations: Array.isArray(body.supportedLocations) ? body.supportedLocations.map(String) : undefined,
          profileUrl: body.profileUrl ? String(body.profileUrl) : undefined,
          experienceBand: body.experienceBand ? String(body.experienceBand) : undefined,
          policyAcknowledged: body.policyAcknowledged === true,
          privacyConsent: body.privacyConsent === true,
        })
        return NextResponse.json({ referrer })
      }
      case 'onboarding': {
        return NextResponse.json({ referrer: await completeOnboarding(deps, session.user.id, { fullName: body.fullName ?? '', title: body.title ?? '', roleFamilies: body.roleFamilies ?? [], department: body.department, location: body.location ?? '', supportedLocations: body.supportedLocations ?? [], profileUrl: body.profileUrl, profileUrlShareable: body.profileUrlShareable, experienceBand: body.experienceBand, maxActiveRequests: body.maxActiveRequests, maxMonthlyRequests: body.maxMonthlyRequests, policyAcknowledged: body.policyAcknowledged === true, privacyConsent: body.privacyConsent === true }) })
      }
      case 'availability':
        return NextResponse.json({ referrer: await setAvailability(deps, session.user.id, { availability: body.availability, maxActiveRequests: body.maxActiveRequests, maxMonthlyRequests: body.maxMonthlyRequests, profileUrlShareable: body.profileUrlShareable }) })
      case 'send_verification': {
        const sent = await startContactVerification(deps, session.user.id)
        return NextResponse.json({ sentTo: sent.sentTo, expiresAt: sent.expiresAt.toISOString(), emailStatus: sent.emailStatus })
      }
      default:
        return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
    }
  } catch (error) {
    return errorResponse(error, 'POST /api/referrer')
  }
}
