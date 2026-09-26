'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/adminClient'
import type { TtsProviderId, TtsVoice, VoiceAvailability, VoicePolicy } from '../../lib/server/tts'

interface Props {
  policy: VoicePolicy
  providers: { id: TtsProviderId; label: string; configured: boolean; voices: TtsVoice[]; defaultVoice: string }[]
  availability: VoiceAvailability
  canEdit: boolean
}

/**
 * Interviewer voice: provider order, voice per provider, pace and the silence
 * thresholds learners start from. No secrets: keys come from the environment
 * (OPENAI_API_KEY / OPENAI_TTS_API_KEY, GOOGLE_TTS_API_KEY, ELEVENLABS_API_KEY
 * + ELEVENLABS_VOICE_ID). Without a configured provider the room uses the
 * browser voice and says so.
 */
export default function VoiceConfigForm({ policy, providers, availability, canEdit }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<VoicePolicy>(policy)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const move = (id: TtsProviderId, dir: -1 | 1) => {
    const order = [...draft.providerOrder]
    const i = order.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= order.length) return
    ;[order[i], order[j]] = [order[j], order[i]]
    setDraft({ ...draft, providerOrder: order })
  }
  const save = async () => {
    setBusy('save')
    setMessage(null)
    try {
      const res = await api<{ voice: { policy: VoicePolicy } }>('/api/admin/ai', { method: 'PUT', json: { action: 'voice', policy: draft } })
      setDraft(res.voice.policy)
      setMessage({ kind: 'ok', text: 'Voice policy saved' })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setBusy(null)
    }
  }
  const probe = async () => {
    setBusy('probe')
    setMessage(null)
    try {
      const res = await api<{ ok: boolean; provider?: string; voice?: string; bytes?: number; latencyMs?: number; kind?: string; message?: string }>('/api/admin/ai', { method: 'PUT', json: { action: 'voice_probe' } })
      setMessage(res.ok ? { kind: 'ok', text: `Synthesised the test line with ${res.provider} / ${res.voice}: ${res.bytes} bytes in ${res.latencyMs} ms. Listen to it from the learner device check to judge quality; this probe only proves the provider answers.` } : { kind: 'error', text: `Voice probe failed: ${res.kind} · ${res.message}` })
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Probe failed' })
    } finally {
      setBusy(null)
    }
  }
  return (
    <div className="admin-form">
      {message && (
        <div className={`admin-alert ${message.kind === 'ok' ? 'admin-alert-ok' : 'admin-alert-error'}`} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}
      <fieldset className="admin-fieldset" disabled={!canEdit}>
        <legend>Interviewer voice</legend>
        <p className="admin-help">
          Current mode: <strong>{availability.mode === 'premium' ? `Premium (${availability.providerLabel})` : 'Browser voice fallback (no provider configured)'}</strong>. Learners on plans without the premium-voice entitlement always get the browser voice.
        </p>
        <label className="admin-check">
          <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} /> <span>Use a server voice provider when one is configured</span>
        </label>
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Voice providers">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider</th>
                <th>Configured</th>
                <th>Voice</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {draft.providerOrder.map((id, i) => {
                const p = providers.find((x) => x.id === id)
                return (
                  <tr key={id}>
                    <td>{i + 1}</td>
                    <td className="font-semibold">{p?.label ?? id}</td>
                    <td>{p?.configured ? 'yes' : 'no'}</td>
                    <td>
                      <select className="input-field" value={draft.voices[id] ?? ''} onChange={(e) => setDraft({ ...draft, voices: { ...draft.voices, [id]: e.target.value || undefined } })} aria-label={`${p?.label ?? id} voice`}>
                        <option value="">Default ({p?.defaultVoice || 'provider default'})</option>
                        {(p?.voices ?? []).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label} · {v.locale}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(id, -1)} aria-label={`Move ${p?.label ?? id} up`}>
                        ↑
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(id, 1)} aria-label={`Move ${p?.label ?? id} down`}>
                        ↓
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-grid-3 mt-2">
          <label className="admin-field">
            <span>Speaking rate (0.7–1.3; calm is slightly under 1)</span>
            <input className="input-field" inputMode="decimal" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: Number(e.target.value) || 0.95 })} aria-label="Voice speaking rate" />
          </label>
          <label className="admin-field">
            <span>Locale (e.g. en-IN, en-GB)</span>
            <input className="input-field" value={draft.locale} onChange={(e) => setDraft({ ...draft, locale: e.target.value })} aria-label="Voice locale" />
          </label>
          <label className="admin-field">
            <span>Provider timeout (ms)</span>
            <input className="input-field" inputMode="numeric" value={draft.timeoutMs} onChange={(e) => setDraft({ ...draft, timeoutMs: Number(e.target.value) || 15000 })} aria-label="Voice timeout" />
          </label>
          <label className="admin-field">
            <span>&ldquo;Take your time&rdquo; after silence (s)</span>
            <input className="input-field" inputMode="numeric" value={draft.silenceThinkingSec} onChange={(e) => setDraft({ ...draft, silenceThinkingSec: Number(e.target.value) || 0 })} aria-label="Silence thinking seconds" />
          </label>
          <label className="admin-field">
            <span>Offer to repeat after silence (s)</span>
            <input className="input-field" inputMode="numeric" value={draft.silenceClarifySec} onChange={(e) => setDraft({ ...draft, silenceClarifySec: Number(e.target.value) || 0 })} aria-label="Silence clarify seconds" />
          </label>
          <label className="admin-field">
            <span>End of answer after silence (s)</span>
            <input className="input-field" inputMode="decimal" value={draft.endOfSpeechSec} onChange={(e) => setDraft({ ...draft, endOfSpeechSec: Number(e.target.value) || 4 })} aria-label="End of speech seconds" />
          </label>
        </div>
      </fieldset>
      {canEdit && (
        <div className="admin-form-footer">
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? 'Saving…' : 'Save voice policy'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={probe} disabled={busy !== null}>
            {busy === 'probe' ? 'Synthesising…' : 'Probe voice provider'}
          </button>
        </div>
      )}
    </div>
  )
}
