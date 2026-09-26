import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { VoiceState } from '../../lib/interview/useInterviewVoice'
import type { VoiceMode } from '../../lib/interview/voice'

/**
 * The interview room: a focused, professional layout shared by the general
 * mock rounds and the job-specific interviews. Interviewer presence with
 * speaking / listening / thinking states, the current stage, the clock, the
 * conversation with captions, the answer controls and, when a round needs
 * it, the coding or design workspace. No scores, hints, recommendations or
 * navigation while the interview runs.
 */
export interface RoomTurn {
  id: string
  role: 'interviewer' | 'candidate'
  text: string
  /** Small label under the speaker name, e.g. "asked for clarification", "spoken". */
  note?: string
  code?: string | null
  diagram?: string | null
  /** Rendered HTML for interviewer markdown (general rounds); plain text otherwise. */
  html?: string
}

export interface RoomStage {
  label: string
  index: number
  total: number
}

export interface RoomControls {
  muted: boolean
  onToggleMute: () => void
  captions: boolean
  onToggleCaptions: () => void
  onRepeat: () => void
  onClarify?: () => void
  onLeave: () => void
  onEnd: () => void
  endLabel?: string
  disabled?: boolean
  fullscreen: boolean
  onToggleFullscreen: () => void
}

interface Props {
  title: string
  subtitle: string
  stage: RoomStage | null
  remainingMs: number
  timeUp?: boolean
  voiceState: VoiceState
  voiceMode: VoiceMode
  voiceEnabled: boolean
  /** What the interviewer is saying now (captioned, aria-live). */
  currentSay: string
  transcript: RoomTurn[]
  statusLine: string
  controls: RoomControls
  composer: ReactNode
  workspace?: ReactNode
  workspaceLabel?: string
  banner?: ReactNode
  error?: string | null
  /** Dev / admin only: measured latencies. */
  diagnostics?: ReactNode
  ariaLabel?: string
}

export function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const STATE_LABEL: Record<VoiceState, string> = { idle: 'Waiting for you', speaking: 'Speaking', listening: 'Listening', processing: 'Thinking' }
const MODE_LABEL: Record<VoiceMode, string> = { premium: 'Premium voice', browser: 'Browser voice (fallback)', off: 'Voice off' }

/** Subtle professional presence: a soft mark with restrained state cues, no cartoon robot. */
export function InterviewerPresence({ state, size = 56 }: { state: VoiceState; size?: number }) {
  return (
    <span className={`room-presence is-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 56 56" width={size} height={size} focusable="false">
        <circle cx="28" cy="28" r="27" className="room-presence-ring" />
        <circle cx="28" cy="21" r="8.5" className="room-presence-head" />
        <path d="M13 45c2.5-8 8.5-12 15-12s12.5 4 15 12" className="room-presence-body" />
      </svg>
      <span className="room-presence-bars">
        <i />
        <i />
        <i />
      </span>
    </span>
  )
}

/** Hides the app chrome and warns before accidental navigation while an interview is live. */
export function useFocusMode(active: boolean) {
  useEffect(() => {
    if (!active) return
    document.body.classList.add('iv-focus')
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      document.body.classList.remove('iv-focus')
      window.removeEventListener('beforeunload', warn)
    }
  }, [active])
}

export function useFullscreen(): [boolean, () => void] {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const sync = () => setOn(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }
  return [on, toggle]
}

export default function InterviewRoom({ title, subtitle, stage, remainingMs, timeUp, voiceState, voiceMode, voiceEnabled, currentSay, transcript, statusLine, controls, composer, workspace, workspaceLabel, banner, error, diagnostics, ariaLabel }: Props) {
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [pane, setPane] = useState<'talk' | 'work'>('talk')
  const [showTranscript, setShowTranscript] = useState(true)
  useEffect(() => {
    if (workspace) setPane('work')
    else setPane('talk')
  }, [workspace])
  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript.length, currentSay])
  const urgency = remainingMs <= 60_000 ? 'is-critical' : remainingMs <= 5 * 60_000 ? 'is-warning' : ''

  return (
    <div className={`room${workspace ? ' has-work' : ''}`} aria-label={ariaLabel ?? 'Interview room'} role="region">
      <header className="room-head">
        <div className="room-who">
          <InterviewerPresence state={voiceState} />
          <div className="min-w-0">
            <p className="room-title">{title}</p>
            <p className="room-sub">{subtitle}</p>
          </div>
          <span className={`room-state is-${voiceState}`} role="status" aria-live="polite">
            {STATE_LABEL[voiceState]}
          </span>
        </div>
        <div className="room-stage" aria-label="Interview stage">
          {stage ? (
            <>
              <span className="room-stage-label">{stage.label}</span>
              {stage.total > 0 && (
                <>
                  <span className="room-stage-count">
                    Stage {stage.index + 1} of {stage.total}
                  </span>
                  <span className="room-stage-dots" aria-hidden="true">
                    {Array.from({ length: stage.total }).map((_, i) => (
                      <i key={i} className={i < stage.index ? 'is-done' : i === stage.index ? 'is-now' : ''} />
                    ))}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="room-stage-label">Wrapping up</span>
          )}
        </div>
        <div className="room-controls">
          <span className={`iv-timer ${urgency}`} role="timer" title={timeUp ? 'Time is up; finish your current answer' : 'Time remaining'} aria-label={timeUp ? 'Time is up' : `Time remaining ${clock(remainingMs)}`}>
            {timeUp ? 'Time' : clock(remainingMs)}
          </span>
          <button type="button" className={`room-btn${controls.muted ? '' : ' is-on'}`} onClick={controls.onToggleMute} aria-pressed={!controls.muted} title={controls.muted ? 'Unmute the interviewer' : 'Mute the interviewer'} disabled={!voiceEnabled}>
            {controls.muted ? 'Unmute' : 'Mute'}
          </button>
          <button type="button" className={`room-btn${controls.captions ? ' is-on' : ''}`} onClick={controls.onToggleCaptions} aria-pressed={controls.captions} title="Captions">
            CC
          </button>
          <button type="button" className={`room-btn${controls.fullscreen ? ' is-on' : ''}`} onClick={controls.onToggleFullscreen} aria-pressed={controls.fullscreen} title={controls.fullscreen ? 'Exit full screen' : 'Full screen'}>
            {controls.fullscreen ? 'Exit' : 'Focus'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={controls.onLeave} disabled={controls.disabled}>
            Leave
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={controls.onEnd} disabled={controls.disabled}>
            {controls.endLabel ?? 'End interview'}
          </button>
        </div>
      </header>

      {banner}
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {workspace && (
        <div className="iv-tabs lg:hidden" role="tablist" aria-label="Room panes">
          <button type="button" role="tab" aria-selected={pane === 'talk'} className={pane === 'talk' ? 'is-active' : ''} onClick={() => setPane('talk')}>
            Conversation
          </button>
          <button type="button" role="tab" aria-selected={pane === 'work'} className={pane === 'work' ? 'is-active' : ''} onClick={() => setPane('work')}>
            {workspaceLabel ?? 'Workspace'}
          </button>
        </div>
      )}

      <div className="room-body">
        <section className={`room-talk${workspace && pane !== 'talk' ? ' hidden lg:flex' : ''}`} aria-label="Conversation">
          <div className={`room-caption${controls.captions ? '' : ' is-hidden'}`} aria-live="polite" aria-atomic="true" id="jiv-question-title">
            {controls.captions ? currentSay : ''}
          </div>
          {!controls.captions && (
            <p className="room-caption-off" id="jiv-caption-off">
              Captions are off. The interviewer&apos;s words are still in the transcript below.
            </p>
          )}
          <div className="room-transcript-head">
            <span>Transcript</span>
            <button type="button" className="btn btn-link btn-sm" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
              {showTranscript ? 'Hide' : 'Show'}
            </button>
          </div>
          {showTranscript && (
            <div ref={transcriptRef} className="room-transcript" aria-label="Transcript">
              {transcript.map((t) => (
                <div key={t.id} className={`iv-turn ${t.role === 'candidate' ? 'is-candidate' : 'is-interviewer'}`}>
                  <span className="iv-turn-who">
                    {t.role === 'candidate' ? 'You' : 'Interviewer'}
                    {t.note ? ` · ${t.note}` : ''}
                  </span>
                  {t.html ? (
                    <div className="iv-bubble tutor-bubble prose-tiptap" dangerouslySetInnerHTML={{ __html: t.html }} />
                  ) : (
                    <div className="iv-bubble">
                      {t.text && <p className="whitespace-pre-wrap">{t.text}</p>}
                      {t.code && (
                        <pre className="iv-code">
                          <code>{t.code}</code>
                        </pre>
                      )}
                      {t.diagram && (
                        <pre className="iv-code">
                          <code>{t.diagram}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {voiceState === 'processing' && (
                <div className="iv-turn is-interviewer">
                  <span className="iv-turn-who">Interviewer</span>
                  <div className="iv-bubble iv-typing" aria-label="Interviewer is thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="room-status" role="status" aria-live="polite">
            <span className={`room-status-dot is-${voiceState}`} aria-hidden="true" />
            <span>{statusLine}</span>
            <span className="room-status-mode" title="Which voice engine is speaking">
              {MODE_LABEL[voiceEnabled ? voiceMode : 'off']}
            </span>
            <span className="room-status-actions">
              <button type="button" className="btn btn-link btn-sm" onClick={controls.onRepeat} disabled={controls.disabled}>
                Repeat question
              </button>
              {controls.onClarify && (
                <button type="button" className="btn btn-link btn-sm" onClick={controls.onClarify} disabled={controls.disabled}>
                  Ask for clarification
                </button>
              )}
            </span>
          </div>
          {composer}
          {diagnostics}
        </section>
        {workspace && (
          <aside className={`room-work${pane !== 'work' ? ' hidden lg:flex' : ''}`} aria-label={workspaceLabel ?? 'Workspace'}>
            <div className="iv-work-head">
              <span>{workspaceLabel ?? 'Workspace'}</span>
              <span className="text-xs text-muted-foreground">Shared with the interviewer when you send your answer</span>
            </div>
            <div className="room-work-body">{workspace}</div>
          </aside>
        )}
      </div>
    </div>
  )
}
