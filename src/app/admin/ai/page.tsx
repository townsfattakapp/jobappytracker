import AiConfigForm from '../../../components/admin/AiConfigForm'
import VoiceConfigForm from '../../../components/admin/VoiceConfigForm'
import { getVoicePolicy, TTS_ADAPTERS, voiceAvailability } from '../../../lib/server/tts'
import { PageHeader, Pill, StatCard, formatDateTime } from '../../../components/admin/ui'
import { ADAPTERS } from '../../../lib/ai/adapters'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { aiProviderHealth, aiUsageSummary, getAiPolicy, recentAiFailures } from '../../../lib/server/ai'

export const dynamic = 'force-dynamic'

const TONE = { healthy: 'good', degraded: 'warn', not_configured: 'neutral', unknown: 'info' } as const
const LABEL = { healthy: 'Healthy', degraded: 'Degraded', not_configured: 'Not configured', unknown: 'Unknown' } as const

export default async function AdminAiPage() {
  const actor = await requireAdminPage('admin', 'support')
  const [policy, providers, usage, failures, voice] = await Promise.all([getAiPolicy(), aiProviderHealth(), aiUsageSummary(7), recentAiFailures(20), getVoicePolicy()])
  const configured = providers.filter((p) => p.configured)
  return (
    <>
      <PageHeader title="AI configuration" description="One server-side gateway for every AI feature: provider priority, per-feature models, timeout, retries, fallback and sensitive-data routing. Keys live in the environment (or the learner's encrypted key) and are never shown here. Deterministic engines remain the fallback for every feature." />
      <div className="admin-stat-grid mb-6">
        <StatCard label="Gateway" value={policy.enabled ? 'On' : 'Off'} tone={policy.enabled ? 'good' : 'warn'} />
        <StatCard label="Configured providers" value={configured.length} tone={configured.length ? 'good' : 'warn'} hint={configured.map((p) => p.label).join(', ') || 'none: set GROQ_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY or OPENAI_API_KEY'} />
        <StatCard label="Calls OK (24 h)" value={providers.reduce((s, p) => s + p.ok24h, 0)} />
        <StatCard label="Calls failed (24 h)" value={providers.reduce((s, p) => s + p.failed24h, 0)} tone={providers.some((p) => p.failed24h) ? 'warn' : 'default'} />
      </div>
      <h2 className="admin-section-title">Provider health</h2>
      <div className="admin-table-wrap mb-6">
        <table className="admin-table" aria-label="AI providers">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Status</th>
              <th>Default models</th>
              <th>OK / failed (24 h)</th>
              <th>Last success</th>
              <th>Last error</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.label}</td>
                <td>
                  <Pill tone={TONE[p.status]}>{LABEL[p.status]}</Pill>
                </td>
                <td className="text-xs text-muted-foreground">{p.models.join(', ')}</td>
                <td>
                  {p.ok24h} / {p.failed24h}
                </td>
                <td className="whitespace-nowrap">{formatDateTime(p.lastSuccessAt)}</td>
                <td className="text-xs">{p.lastErrorAt ? `${formatDateTime(p.lastErrorAt)} · ${p.lastErrorKind}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="admin-section-title">Usage by feature (7 days)</h2>
      <div className="admin-table-wrap mb-6">
        <table className="admin-table" aria-label="AI usage">
          <thead>
            <tr>
              <th>Feature</th>
              <th>OK</th>
              <th>Failed</th>
              <th>Skipped (policy / not configured)</th>
              <th>Prompt tokens</th>
              <th>Completion tokens</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u.feature}>
                <td>{u.feature}</td>
                <td>{u.ok}</td>
                <td>{u.failed}</td>
                <td>{u.skipped}</td>
                <td>{u.promptTokens}</td>
                <td>{u.completionTokens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {failures.length > 0 && (
        <>
          <h2 className="admin-section-title">Recent failures</h2>
          <div className="admin-table-wrap mb-6">
            <table className="admin-table" aria-label="Recent AI failures">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Feature</th>
                  <th>Provider / model</th>
                  <th>Kind</th>
                  <th>Error id</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((f) => (
                  <tr key={f.id}>
                    <td className="whitespace-nowrap">{formatDateTime(f.createdAt)}</td>
                    <td>{f.feature}</td>
                    <td className="text-xs">{f.provider ?? '—'} {f.model ? `/ ${f.model}` : ''}</td>
                    <td>{f.errorKind}</td>
                    <td className="text-xs font-mono">{f.errorId}</td>
                    <td>{f.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <h2 className="admin-section-title">Policy</h2>
      <AiConfigForm policy={policy} adapters={ADAPTERS.map((a) => ({ id: a.id, label: a.label, models: a.models, configured: a.isConfigured() }))} canEdit={actor.roles.includes('admin')} />
      <h2 className="admin-section-title mt-8">Interviewer voice (mock interviews)</h2>
      <VoiceConfigForm policy={voice} providers={TTS_ADAPTERS.map((a) => ({ id: a.id, label: a.label, configured: a.isConfigured(), voices: a.voices, defaultVoice: a.defaultVoice }))} availability={voiceAvailability(voice)} canEdit={actor.roles.includes('admin')} />
    </>
  )
}
