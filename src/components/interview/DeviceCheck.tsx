import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { VoiceConfig } from '../../lib/jobs/interviewClient'
import { checkMicrophone, sttSupported, ttsSupported } from '../../lib/interview/speech'
import { browserVoiceOptions, createSpeaker, type VoiceMode, type VoiceSettings } from '../../lib/interview/voice'

/**
 * Before the interview: microphone, speaker, speech support, network / API and
 * AI availability, each reported as Ready, Fallback available or Unavailable.
 * Voice settings live here too (interviewer voice, speaking speed, captions,
 * auto-send and the silence thresholds). Voice never blocks a text-only
 * interview.
 */
type Status = 'checking' | 'ready' | 'fallback' | 'unavailable' | 'idle'

interface Props {
  config: VoiceConfig | null
  configError: string | null
  settings: VoiceSettings
  onSettings: (s: VoiceSettings) => void
  /** Start the interview: 'voice' when the learner keeps voice on, 'text' otherwise. */
  onStart: (mode: 'voice' | 'text') => void
  startLabel: string
  busy?: boolean
  /** Interview summary rendered above the checks (duration, structure). */
  summary?: ReactNode
  /** Extra controls (configuration) rendered under the checks. */
  children?: ReactNode
}

const STATUS_LABEL: Record<Status, string> = { checking: 'Checking…', ready: 'Ready', fallback: 'Fallback available', unavailable: 'Unavailable', idle: 'Not tested' }

function StatusPill({ status }: { status: Status }) {
  return <span className={`room-check-status is-${status}`}>{STATUS_LABEL[status]}</span>
}

export default function DeviceCheck({ config, configError, settings, onSettings, onStart, startLabel, busy, summary, children }: Props) {
  const [mic, setMic] = useState<{ status: Status; detail: string; level: number }>({ status: 'idle', detail: 'Press Test microphone and say a few words.', level: 0 })
  const [speaker, setSpeaker] = useState<{ status: Status; detail: string }>({ status: 'idle', detail: 'Press Test interviewer voice to hear the interviewer.' })
  const [voiceOptions, setVoiceOptions] = useState<{ id: string; label: string }[]>([])
  const meterTimer = useRef<number | null>(null)
  const serverMode: 'premium' | 'browser' = config?.tts.mode === 'premium' ? 'premium' : 'browser'
  const canVoice = Boolean(config?.voice) && settings.enabled
  const speechOk = typeof window !== 'undefined' && (ttsSupported() || serverMode === 'premium')
  const micSupported = typeof window !== 'undefined' && sttSupported()
  const set = (patch: Partial<VoiceSettings>) => onSettings({ ...settings, ...patch })

  useEffect(() => {
    if (serverMode === 'premium') {
      setVoiceOptions((config?.tts.voices ?? []).map((v) => ({ id: v.id, label: v.label })))
      return
    }
    const load = () => setVoiceOptions(browserVoiceOptions())
    load()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener?.('voiceschanged', load)
      return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', load)
    }
  }, [serverMode, config])

  useEffect(
    () => () => {
      if (meterTimer.current) window.clearInterval(meterTimer.current)
    },
    [],
  )

  const testMicrophone = async () => {
    setMic({ status: 'checking', detail: 'Say a few words…', level: 0 })
    const check = await checkMicrophone()
    if (!check.ok) {
      setMic({ status: 'unavailable', detail: check.message, level: 0 })
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const AudioCtx = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined
      if (!AudioCtx) {
        stream.getTracks().forEach((t) => t.stop())
        setMic({ status: micSupported ? 'ready' : 'fallback', detail: micSupported ? 'Microphone available.' : 'Microphone available, but this browser cannot transcribe speech. You can type your answers.', level: 0 })
        return
      }
      const ctx = new AudioCtx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      let peak = 0
      let ticks = 0
      meterTimer.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const v of data) sum += Math.abs(v - 128)
        const level = Math.min(1, sum / data.length / 40)
        peak = Math.max(peak, level)
        ticks += 1
        setMic((m) => ({ ...m, level }))
        if (ticks >= 30) {
          if (meterTimer.current) window.clearInterval(meterTimer.current)
          meterTimer.current = null
          stream.getTracks().forEach((t) => t.stop())
          void ctx.close().catch(() => {})
          if (peak > 0.08) setMic({ status: micSupported ? 'ready' : 'fallback', detail: micSupported ? 'Heard you clearly.' : 'Heard you, but this browser cannot transcribe speech. You can type your answers.', level: 0 })
          else setMic({ status: 'fallback', detail: 'Microphone allowed, but nothing was heard. Check the selected input device, or type your answers.', level: 0 })
        }
      }, 100)
    } catch (e) {
      setMic({ status: 'unavailable', detail: e instanceof Error ? e.message : 'Microphone could not be opened.', level: 0 })
    }
  }

  const testVoice = async () => {
    setSpeaker({ status: 'checking', detail: 'Playing the test line…' })
    const s = createSpeaker({ serverMode, settings: { ...settings, enabled: true } })
    const result = await s.speak(config?.tts.testLine ?? "Hello. I'll be your interviewer today. Can you hear me clearly?")
    const label = (m: VoiceMode) => (m === 'premium' ? `Premium voice (${config?.tts.providerLabel ?? 'server'})` : m === 'browser' ? 'Browser voice' : 'No voice')
    if (result.mode === 'off') setSpeaker({ status: 'unavailable', detail: 'This browser cannot play the interviewer voice. Captions and text remain available.' })
    else if (result.mode === 'browser' && serverMode === 'premium') setSpeaker({ status: 'fallback', detail: `The premium voice was unavailable (${result.fallbackReason ?? 'provider'}); the browser voice was used instead.` })
    else if (result.mode === 'browser') setSpeaker({ status: 'fallback', detail: `${label('browser')}: this deployment has no premium voice provider, so the browser's own speech is used. Quality depends on your device.` })
    else setSpeaker({ status: 'ready', detail: `${label('premium')} played in ${result.latencyMs} ms.` })
  }

  const rows = useMemo(() => {
    const speech: { status: Status; detail: string } = !config ? { status: 'checking', detail: 'Loading…' } : !config.voice ? { status: 'fallback', detail: 'Voice interviews are not included in your plan; the interview runs in text.' } : serverMode === 'premium' ? { status: 'ready', detail: `Interviewer voice: ${config.tts.providerLabel}.` } : speechOk ? { status: 'fallback', detail: config.tts.premiumConfigured ? 'Premium voice is not included in your plan; the browser voice is used.' : 'No premium voice provider is configured; the browser voice is used and reported as a fallback.' } : { status: 'unavailable', detail: 'This browser cannot speak. Captions and text remain available.' }
    const stt: { status: Status; detail: string } = !config ? { status: 'checking', detail: 'Loading…' } : micSupported ? { status: 'ready', detail: 'Browser speech recognition (English).' } : { status: 'fallback', detail: 'Speech recognition needs Chrome or Edge. You can type every answer.' }
    const network: { status: Status; detail: string } = configError ? { status: 'unavailable', detail: configError } : config ? { status: 'ready', detail: 'Interview service reachable.' } : { status: 'checking', detail: 'Contacting the interview service…' }
    const ai: { status: Status; detail: string } = !config ? { status: 'checking', detail: 'Loading…' } : config.ai.available ? { status: 'ready', detail: 'AI can rephrase follow-ups; the deterministic interviewer stays in charge of the interview.' } : { status: 'fallback', detail: config.ai.enabled ? 'No AI provider is configured. The interview runs on the deterministic interviewer.' : 'AI is switched off. The interview runs on the deterministic interviewer.' }
    return { speech, stt, network, ai }
  }, [config, configError, serverMode, speechOk, micSupported])

  const textOnly = !config?.voice || !settings.enabled || rows.speech.status === 'unavailable'

  return (
    <div className="room-check" role="region" aria-label="Device check">
      {summary}
      <h4 className="prep-group-title">Device and connection check</h4>
      <ul className="room-check-list">
        <li>
          <div>
            <span className="room-check-name">Microphone</span>
            <span className="room-check-detail">{mic.detail}</span>
            {mic.status === 'checking' && <span className="room-meter" aria-hidden="true"><i style={{ width: `${Math.round(mic.level * 100)}%` }} /></span>}
          </div>
          <div className="room-check-actions">
            <StatusPill status={mic.status} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={testMicrophone} disabled={mic.status === 'checking'}>
              Test microphone
            </button>
          </div>
        </li>
        <li>
          <div>
            <span className="room-check-name">Audio output</span>
            <span className="room-check-detail">{speaker.detail}</span>
          </div>
          <div className="room-check-actions">
            <StatusPill status={speaker.status} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={testVoice} disabled={speaker.status === 'checking' || !config}>
              Test interviewer voice
            </button>
          </div>
        </li>
        <li>
          <div>
            <span className="room-check-name">Interviewer voice</span>
            <span className="room-check-detail">{rows.speech.detail}</span>
          </div>
          <StatusPill status={rows.speech.status} />
        </li>
        <li>
          <div>
            <span className="room-check-name">Speech recognition</span>
            <span className="room-check-detail">{rows.stt.detail}</span>
          </div>
          <StatusPill status={rows.stt.status} />
        </li>
        <li>
          <div>
            <span className="room-check-name">Network and interview service</span>
            <span className="room-check-detail">{rows.network.detail}</span>
          </div>
          <StatusPill status={rows.network.status} />
        </li>
        <li>
          <div>
            <span className="room-check-name">AI provider</span>
            <span className="room-check-detail">{rows.ai.detail}</span>
          </div>
          <StatusPill status={rows.ai.status} />
        </li>
      </ul>

      <h4 className="prep-group-title mt-4">Voice settings</h4>
      <div className="room-settings" role="group" aria-label="Voice settings">
        <label className="admin-check">
          <input type="checkbox" checked={settings.enabled && Boolean(config?.voice)} disabled={!config?.voice} onChange={(e) => set({ enabled: e.target.checked })} /> <span>Interviewer speaks out loud{config && !config.voice ? ' (not in your plan)' : ''}</span>
        </label>
        <label className="admin-field">
          <span>Interviewer voice</span>
          <select className="input-field" value={settings.voiceId ?? ''} onChange={(e) => set({ voiceId: e.target.value || null })} aria-label="Interviewer voice" disabled={!canVoice}>
            <option value="">{serverMode === 'premium' ? `Default (${config?.tts.defaultVoice ?? 'provider default'})` : 'Automatic (best English voice on this device)'}</option>
            {voiceOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Speaking speed: {settings.rate.toFixed(2)}×</span>
          <input type="range" min={0.8} max={1.2} step={0.05} value={settings.rate} onChange={(e) => set({ rate: Number(e.target.value) })} aria-label="Speaking speed" disabled={!canVoice} />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={settings.captions} onChange={(e) => set({ captions: e.target.checked })} /> <span>Captions</span>
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={settings.autoSend} onChange={(e) => set({ autoSend: e.target.checked })} disabled={!canVoice} /> <span>Send my spoken answer automatically after a {settings.endOfSpeechSec}-second pause (you can still edit or cancel)</span>
        </label>
        <details className="admin-details">
          <summary>Accessibility and pacing</summary>
          <div className="admin-grid-3 mt-2">
            <label className="admin-field">
              <span>End of answer after silence (s)</span>
              <input className="input-field" type="number" min={2} max={15} value={settings.endOfSpeechSec} onChange={(e) => set({ endOfSpeechSec: Math.min(15, Math.max(2, Number(e.target.value) || 4)) })} aria-label="End of answer pause seconds" />
            </label>
            <label className="admin-field">
              <span>&ldquo;Take your time&rdquo; after (s, 0 = never)</span>
              <input className="input-field" type="number" min={0} max={600} value={settings.silenceThinkingSec} onChange={(e) => set({ silenceThinkingSec: Math.max(0, Number(e.target.value) || 0) })} aria-label="Thinking nudge seconds" />
            </label>
            <label className="admin-field">
              <span>Offer to repeat after (s, 0 = never)</span>
              <input className="input-field" type="number" min={0} max={900} value={settings.silenceClarifySec} onChange={(e) => set({ silenceClarifySec: Math.max(0, Number(e.target.value) || 0) })} aria-label="Clarify nudge seconds" />
            </label>
          </div>
        </details>
      </div>

      {children}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => onStart(textOnly ? 'text' : 'voice')} disabled={busy || !config}>
          {busy ? 'Starting…' : startLabel}
        </button>
        {!textOnly && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onStart('text')} disabled={busy || !config}>
            Start in text only
          </button>
        )}
        <span className="text-xs text-muted-foreground">{textOnly ? 'This interview runs in text; the transcript is the conversation.' : 'The interviewer will speak; answer by microphone or type at any time.'}</span>
      </div>
    </div>
  )
}
