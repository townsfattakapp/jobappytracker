import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { isResponse, requireRole } from '../../../../lib/server/rbac'
import { referralDeps } from '../../../../lib/server/referralDeps'
import { adminListInvites, adminListDisclosures, adminListReferrers, adminListRequests, companyCoverage, createInvite, getReferralSettings, grantCredits, referralMetrics, saveCompanyPolicy, saveReferralSettings, sweepReferrals, type CompanyPolicyDto, type ReferralSettings } from '../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** Everything the admin referral console needs in one read: metrics, requests, referrers, coverage, disclosures, settings. */
export async function GET(req: Request) {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    const deps = referralDeps()
    const [metrics, requests, referrers, coverage, disclosures, settings, invites] = await Promise.all([
      referralMetrics(deps),
      adminListRequests(deps, { status: url.searchParams.get('status') || undefined, companyId: url.searchParams.get('companyId') || undefined, needsAttention: url.searchParams.get('attention') === '1' }),
      adminListReferrers(deps, { status: url.searchParams.get('referrerStatus') || undefined, q: url.searchParams.get('q') || undefined }),
      companyCoverage(deps),
      adminListDisclosures(deps),
      getReferralSettings(deps.db),
      adminListInvites(deps),
    ])
    return NextResponse.json({ metrics, requests, referrers, coverage, disclosures, settings, invites })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/referrals')
  }
}

/**
 * Admin-only writes: { action: 'invite', email, companyId, note? } | { action: 'policy', companyId, ...policy }
 * | { action: 'settings', ...settings } | { action: 'grant_credits', userId, amount, reason } | { action: 'sweep' }.
 */
export async function POST(req: Request) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as { action?: string; email?: string; companyId?: string; note?: string; userId?: string; amount?: number; reason?: string } & Partial<CompanyPolicyDto> & Partial<ReferralSettings>
    const deps = referralDeps()
    switch (body.action) {
      case 'invite': {
        if (!body.email || !body.companyId) return NextResponse.json({ error: 'email and companyId are required', field: 'email' }, { status: 400 })
        const invite = await createInvite(deps, { email: body.email, companyId: body.companyId, invitedBy: actor.userId, note: body.note ?? null })
        // The token is returned once so the admin can hand it over when mail is not configured; it is stored hashed.
        return NextResponse.json({ invite: { id: invite.id, emailStatus: invite.emailStatus, expiresAt: invite.expiresAt.toISOString(), link: `/referrer/invite?token=${encodeURIComponent(invite.token)}` } })
      }
      case 'policy': {
        if (!body.companyId) return NextResponse.json({ error: 'companyId is required', field: 'companyId' }, { status: 400 })
        return NextResponse.json({ policy: await saveCompanyPolicy(deps, body.companyId, { referralsEnabled: body.referralsEnabled, policyStatus: body.policyStatus, policySource: body.policySource, lastReviewedAt: body.lastReviewedAt, alreadyAppliedRestricted: body.alreadyAppliedRestricted, duplicateReferralRestricted: body.duplicateReferralRestricted, constraints: body.constraints, notes: body.notes, manualReviewRequired: body.manualReviewRequired }, actor.userId) })
      }
      case 'settings':
        return NextResponse.json({ settings: await saveReferralSettings(deps, { mode: body.mode, maxAttempts: body.maxAttempts, assignmentTtlHours: body.assignmentTtlHours, requestTtlDays: body.requestTtlDays, allowUnknownPolicy: body.allowUnknownPolicy, requireCredits: body.requireCredits }, actor.userId) })
      case 'grant_credits': {
        if (!body.userId) return NextResponse.json({ error: 'userId is required', field: 'userId' }, { status: 400 })
        await grantCredits(deps, { userId: body.userId, amount: Number(body.amount), reason: String(body.reason || 'Granted by admin'), source: 'admin', actorId: actor.userId })
        return NextResponse.json({ ok: true })
      }
      case 'sweep':
        return NextResponse.json({ sweep: await sweepReferrals(deps) })
      default:
        return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
    }
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/referrals')
  }
}
