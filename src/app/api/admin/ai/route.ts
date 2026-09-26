import { NextResponse } from 'next/server'
import { ADAPTERS, fixtureScript } from '../../../../lib/ai/adapters'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { aiProviderHealth, aiUsageSummary, gatewayDeps, getAiPolicy, recentAiFailures, saveAiPolicy } from '../../../../lib/server/ai'
import { runGateway } from '../../../../lib/ai/gateway'
import { recordAudit } from '../../../../lib/server/audit'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** AI policy, provider health (configured / 24 h outcomes) and usage by feature. Keys are never returned. */
export async function GET() {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const [policy, providers, usage, failures] = await Promise.all([getAiPolicy(), aiProviderHealth(), aiUsageSummary(7), recentAiFailures(20)])
    return NextResponse.json({ policy, providers, usage, failures, adapters: ADAPTERS.map((a) => ({ id: a.id, label: a.label, models: a.models })) })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/ai')
  }
}

/** Body: the full policy document (normalised and audited), or { action: 'probe', provider } to send one harmless test prompt. */
export async function PUT(req: Request) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as Record<string, unknown>
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    if (body.action === 'probe') {
      const provider = String(body.provider ?? '')
      const adapter = ADAPTERS.find((a) => a.id === provider)
      if (!adapter) throw new ValidationError('Unknown provider', 'provider')
      if (adapter.id === 'fixture') fixtureScript.steps.length = 0
      // A probe targets exactly this provider: no learner key, no fallback to the rest of the order.
      const deps = await gatewayDeps()
      const probePolicy = { ...deps.policy, enabled: true, features: { ...deps.policy.features, chat: { enabled: true, providers: [adapter.id], models: deps.policy.features.chat?.models ?? {} } } }
      const outcome = await runGateway({ feature: 'chat', messages: [{ role: 'system', content: 'You are a health check. Reply with the single word OK.' }, { role: 'user', content: 'Health check.' }], sensitivity: 'normal', userId: actor.userId, userKey: null, maxTokens: 16 }, { ...deps, policy: probePolicy })
      await recordAudit({ actorId: actor.userId, action: 'ai.probe', entityType: 'ai_provider', entityId: adapter.id, after: outcome.ok ? { ok: true, model: outcome.result.model, latencyMs: outcome.result.latencyMs } : { ok: false, kind: outcome.error.kind, errorId: outcome.error.errorId } })
      return NextResponse.json(outcome.ok ? { ok: true, provider: outcome.result.provider, model: outcome.result.model, latencyMs: outcome.result.latencyMs, content: outcome.result.content.slice(0, 80) } : { ok: false, kind: outcome.error.kind, errorId: outcome.error.errorId, message: outcome.error.message })
    }
    const before = await getAiPolicy()
    const policy = await saveAiPolicy(body.policy ?? body, actor.userId)
    await recordAudit({ actorId: actor.userId, action: 'settings.ai', entityType: 'platform_settings', entityId: 'ai', before, after: policy })
    return NextResponse.json({ policy })
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/ai')
  }
}
