import { useEffect, useMemo, useState } from 'react'
import { aiUnavailableReason } from './lib/aiGatewayClient'
import type { MockInterviewSummary } from './types'
import { DURATIONS, LEVELS, PERSONAS, ROUNDS, personaById, roundById, type Duration, type InterviewSetup, type Level, type RoundGroup } from './lib/interview/config'
import { sttSupported, ttsSupported } from './lib/interview/speech'
import InterviewReport, { VerdictBadge } from './components/InterviewReport'

interface MockInterviewWorkspaceProps {
  summaries: MockInterviewSummary[]
  onStartSession: (setup: InterviewSetup) => void
  onOpenSettings?: () => void
  /** Opens this report straight away (set after a session ends). */
  openReportId?: string | null
  onReportClosed?: () => void
}

const SETUP_KEY = 'prep-mock-setup'
const GROUPS: RoundGroup[] = ['Coding', 'Design', 'Technical', 'Behavioural']

function readSetup(): Partial<InterviewSetup> {
  try {
    const raw = localStorage.getItem(SETUP_KEY)
    return raw ? (JSON.parse(raw) as Partial<InterviewSetup>) : {}
  } catch {
    return {}
  }
}

export default function MockInterviewWorkspace({ summaries, onStartSession, onOpenSettings, openReportId, onReportClosed }: MockInterviewWorkspaceProps) {
  const saved = useMemo(readSetup, [])
  const [roundId, setRoundId] = useState(() => roundById(saved.roundId).id)
  const [level, setLevel] = useState<Level>(() => (LEVELS.some((l) => l.id === saved.level) ? (saved.level as Level) : 'Medium'))
  const [minutes, setMinutes] = useState<Duration>(() => (DURATIONS.includes(saved.minutes as Duration) ? (saved.minutes as Duration) : 30))
  const [personaId, setPersonaId] = useState(() => personaById(saved.personaId).id)
  const [voice, setVoice] = useState(() => saved.voice ?? true)
  const [aiReason, setAiReason] = useState<string | null | undefined>(undefined)
  const [reportId, setReportId] = useState<string | null>(openReportId ?? null)

  useEffect(() => {
    if (openReportId) setReportId(openReportId)
  }, [openReportId])

  useEffect(() => {
    let cancelled = false
    aiUnavailableReason().then((reason) => {
      if (!cancelled) setAiReason(reason)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const round = roundById(roundId)
  const persona = personaById(personaId)
  const report = reportId ? summaries.find((s) => s.id === reportId) || null : null

  const start = () => {
    const setup: InterviewSetup = { roundId, level, minutes, personaId, voice: voice && ttsSupported() }
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(setup))
    } catch {
      // ignore
    }
    onStartSession(setup)
  }

  const closeReport = () => {
    setReportId(null)
    onReportClosed?.()
  }

  const scored = summaries.filter((s) => typeof s.overallScore === 'number' && !s.incomplete)
  const average = scored.length ? Math.round(scored.reduce((sum, s) => sum + (s.overallScore || 0), 0) / scored.length) : null
  const hires = scored.filter((s) => s.verdict === 'Hire' || s.verdict === 'Strong hire').length

  return (
    <div className="animate-rise flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-bold text-foreground">Mock interviews</h1>
        <p className="text-muted-foreground">A live AI interviewer, a real clock, your editor, and a hiring-committee scorecard at the end.</p>
        {aiReason && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
            <span>{aiReason}</span>
            {onOpenSettings && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenSettings}>
                Open Settings
              </button>
            )}
          </div>
        )}
      </div>

      <section className="iv-setup surface" aria-labelledby="iv-setup-title">
        <div className="iv-setup-main">
          <h2 id="iv-setup-title" className="text-lg font-bold">
            Set up your round
          </h2>

          <div className="mt-4 space-y-4">
            {GROUPS.map((group) => (
              <div key={group}>
                <p className="label-quiet">{group}</p>
                <div className="iv-round-grid">
                  {ROUNDS.filter((r) => r.group === group).map((r) => (
                    <button key={r.id} type="button" className={`iv-round ${roundId === r.id ? 'is-active' : ''}`} onClick={() => setRoundId(r.id)} aria-pressed={roundId === r.id}>
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="label-quiet">Level</p>
              <div className="iv-pills" role="radiogroup" aria-label="Level">
                {LEVELS.map((l) => (
                  <button key={l.id} type="button" role="radio" aria-checked={level === l.id} className={level === l.id ? 'is-active' : ''} onClick={() => setLevel(l.id)} title={l.hint}>
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{LEVELS.find((l) => l.id === level)?.hint}</p>
            </div>
            <div>
              <p className="label-quiet">Length</p>
              <div className="iv-pills" role="radiogroup" aria-label="Length">
                {DURATIONS.map((d) => (
                  <button key={d} type="button" role="radio" aria-checked={minutes === d} className={minutes === d ? 'is-active' : ''} onClick={() => setMinutes(d)}>
                    {d} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">The clock is real. The interviewer wraps up when time runs low.</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="label-quiet">Interviewer</p>
            <div className="iv-persona-grid">
              {PERSONAS.map((p) => (
                <button key={p.id} type="button" className={`iv-persona ${personaId === p.id ? 'is-active' : ''}`} onClick={() => setPersonaId(p.id)} aria-pressed={personaId === p.id}>
                  <span className="iv-avatar is-small" aria-hidden="true">
                    {p.name[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{p.name}</span>
                    <span className="block text-xs text-muted-foreground truncate">{p.title}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{p.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="iv-setup-side">
          <div className="iv-avatar is-large" aria-hidden="true">
            {persona.name[0]}
          </div>
          <p className="mt-3 font-bold">{persona.name}</p>
          <p className="text-xs text-muted-foreground">{persona.title}</p>
          <dl className="iv-setup-facts">
            <div>
              <dt>Round</dt>
              <dd>{round.label}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{level}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{minutes} minutes</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>{round.design ? 'Whiteboard' : round.coding ? 'Code editor' : 'Conversation'}</dd>
            </div>
          </dl>
          <label className="iv-toggle">
            <input type="checkbox" checked={voice && ttsSupported()} disabled={!ttsSupported()} onChange={(e) => setVoice(e.target.checked)} />
            <span>Interviewer speaks out loud{ttsSupported() ? '' : ' (not supported here)'}</span>
          </label>
          <p className="text-xs text-muted-foreground">{sttSupported() ? 'You can dictate answers with the microphone button.' : 'Dictation needs Chrome or Edge; typing always works.'}</p>
          <button type="button" className="btn btn-primary w-full mt-4" onClick={start} disabled={Boolean(aiReason)}>
            Start interview
          </button>
          <p className="text-[11px] text-muted-foreground mt-2">Find a quiet spot, talk through your thinking, and treat it like the real thing.</p>
        </aside>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Your interviews</h2>
          {scored.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {scored.length} scored · average {average} · {hires} hire verdict{hires === 1 ? '' : 's'}
            </p>
          )}
        </div>
        {summaries.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground border border-dashed border-border rounded-xl">No mock interviews yet. Your scorecards will appear here.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((s) => {
              const r = roundById(s.roundId)
              const p = personaById(s.personaId)
              return (
                <button key={s.id} type="button" className="iv-history surface text-left" onClick={() => setReportId(s.id)}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.roundId ? r.label : s.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()} · {s.durationMinutes} min · {s.difficulty}
                        {s.personaId ? ` · ${p.name}` : ''}
                      </p>
                    </div>
                    {typeof s.overallScore === 'number' && !s.incomplete ? (
                      <span className={`iv-score is-${s.overallScore >= 70 ? 'good' : s.overallScore >= 50 ? 'ok' : 'bad'}`}>{s.overallScore}</span>
                    ) : s.incomplete ? (
                      <span className="iv-verdict is-muted">No scorecard</span>
                    ) : null}
                  </div>
                  <div className="mt-2">
                    <VerdictBadge verdict={s.verdict} />
                  </div>
                  {s.summary && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{s.summary}</p>}
                  {!s.summary && s.strengths.length > 0 && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{s.strengths.join(' · ')}</p>}
                  <span className="mt-3 text-xs font-semibold text-primary">Open scorecard →</span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {report && (
        <InterviewReport
          summary={report}
          onClose={closeReport}
          onRetake={
            report.roundId
              ? () => {
                  closeReport()
                  setRoundId(roundById(report.roundId).id)
                  if (LEVELS.some((l) => l.id === report.difficulty)) setLevel(report.difficulty as Level)
                  if (report.personaId) setPersonaId(personaById(report.personaId).id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
