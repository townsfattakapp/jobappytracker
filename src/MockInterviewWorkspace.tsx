import { useEffect, useMemo, useState } from 'react'
import { aiUnavailableReason } from './lib/aiGatewayClient'
import type { MockInterviewSummary } from './types'
import { DURATIONS, LEVELS, PERSONAS, personaById, type Duration, type InterviewSetup, type Level } from './lib/interview/config'
import { useInterviewRounds, useRoundById } from './lib/interview/hooks'
import { sttSupported, ttsSupported } from './lib/interview/speech'
import InterviewReport, { VerdictBadge } from './components/InterviewReport'
import { deleteInterviewSessionTranscript } from './db'
import { ArrowRight, Check, Code2, Search, Mic, Clock3 } from 'lucide-react'
import type { InterviewRound } from './lib/interview/config'
import type { HistoryItem } from './lib/server/interviews'

interface MockInterviewWorkspaceProps {
  summaries: MockInterviewSummary[]
  onStartSession: (setup: InterviewSetup) => void
  onOpenSettings?: () => void
  /** Opens this report straight away (set after a session ends). */
  openReportId?: string | null
  onReportClosed?: () => void
  onDeleteInterview?: (id: string) => void
  /** Job-specific interview attempts (Phase 6), opened in the job workspace. */
  jobInterviews?: HistoryItem[]
  onOpenJob?: (jobId: string) => void
}

const SETUP_KEY = 'prep-mock-setup'

function readSetup(): Partial<InterviewSetup> {
  try {
    const raw = localStorage.getItem(SETUP_KEY)
    return raw ? (JSON.parse(raw) as Partial<InterviewSetup>) : {}
  } catch {
    return {}
  }
}

/** Tiny sparkline SVG for score history. */
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null
  const w = 120
  const h = 36
  const pad = 2
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const points = scores
    .map((s, i) => {
      const x = pad + (i / (scores.length - 1)) * (w - pad * 2)
      const y = h - pad - ((s - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
  const last = scores[scores.length - 1]
  const prev = scores[scores.length - 2]
  const trending = last > prev ? 'up' : last < prev ? 'down' : 'flat'
  const color = trending === 'up' ? 'hsl(142 70% 45%)' : trending === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="iv-sparkline" aria-label={`Score trend: ${trending}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={Number(points.split(' ').pop()?.split(',')[0])} cy={Number(points.split(' ').pop()?.split(',')[1])} r="3" fill={color} />
    </svg>
  )
}

function categoryFor(round: InterviewRound): string {
  if (round.group === 'Curriculum') return 'Learning tracks'
  if (['javascript', 'react'].includes(round.id)) return 'Frontend'
  if (['java', 'node', 'sql'].includes(round.id)) return 'Backend & databases'
  if (['cs', 'devops'].includes(round.id)) return 'CS & infrastructure'
  return round.group === 'Design' ? 'System design' : round.group
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Coding: 'Solve problems, explain your approach, and write working code.',
  'System design': 'Practise architecture, trade-offs, and object-oriented design.',
  Frontend: 'Build confidence in JavaScript, TypeScript, React, and Next.js.',
  'Backend & databases': 'Explore APIs, Java, data modelling, and SQL.',
  'CS & infrastructure': 'Prepare for fundamentals, cloud, and operational scenarios.',
  Behavioural: 'Tell clear stories about teamwork, ownership, and impact.',
  'Learning tracks': 'Practise a focused interview based on a learning track.',
}

export default function MockInterviewWorkspace({ summaries, onStartSession, onOpenSettings, openReportId, onReportClosed, onDeleteInterview, jobInterviews = [], onOpenJob }: MockInterviewWorkspaceProps) {
  const allRounds = useInterviewRounds()
  const groups = useMemo(() => Array.from(new Set(allRounds.map(categoryFor))), [allRounds])

  const saved = useMemo(readSetup, [])
  const [roundId, setRoundId] = useState(() => saved.roundId || 'dsa')
  const [level, setLevel] = useState<Level>(() => (LEVELS.some((l) => l.id === saved.level) ? (saved.level as Level) : 'Medium'))
  const [minutes, setMinutes] = useState<Duration>(() => (DURATIONS.includes(saved.minutes as Duration) ? (saved.minutes as Duration) : 30))
  const [personaId, setPersonaId] = useState(() => personaById(saved.personaId).id)
  const [voice, setVoice] = useState(() => saved.voice ?? true)
  const [aiReason, setAiReason] = useState<string | null | undefined>(undefined)
  const [reportId, setReportId] = useState<string | null>(openReportId ?? null)
  const [historyFilter, setHistoryFilter] = useState('all')
  const [section, setSection] = useState<'setup' | 'history'>('setup')
  const [category, setCategory] = useState(() => categoryFor(allRounds.find(r => r.id === saved.roundId) || allRounds[0]))
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('all')
  const families = useMemo(() => Array.from(new Set(allRounds.filter(r => r.family).map(r => r.family!))).sort(), [allRounds])
  const visibleRounds = allRounds.filter(r => (category === 'all' || categoryFor(r) === category) && (category !== 'Learning tracks' || family === 'all' || r.family === family) && `${r.label} ${r.blurb} ${r.family || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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

  const round = useRoundById(roundId)
  const persona = personaById(personaId)
  const report = reportId ? summaries.find((s) => s.id === reportId) || null : null

  const start = () => {
    const setup: InterviewSetup = { roundId: round.id, level, minutes, personaId, voice: voice && ttsSupported() }
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

  const handleDelete = async (id: string) => {
    try {
      await deleteInterviewSessionTranscript(id)
    } catch {
      // transcript may not exist, that's fine
    }
    onDeleteInterview?.(id)
    setConfirmDeleteId(null)
    if (reportId === id) closeReport()
  }

  // Stats
  const scored = summaries.filter((s) => typeof s.overallScore === 'number' && !s.incomplete)
  const average = scored.length ? Math.round(scored.reduce((sum, s) => sum + (s.overallScore || 0), 0) / scored.length) : null
  const hires = scored.filter((s) => s.verdict === 'Hire' || s.verdict === 'Strong hire').length
  const bestScore = scored.length ? Math.max(...scored.map((s) => s.overallScore || 0)) : null
  const recentScores = scored.slice(0, 10).map((s) => s.overallScore || 0).reverse()

  // Per-round stats
  const roundStats = useMemo(() => {
    const map = new Map<string, { count: number; totalScore: number; best: number }>()
    for (const s of scored) {
      const key = s.roundId || 'unknown'
      const existing = map.get(key) || { count: 0, totalScore: 0, best: 0 }
      existing.count++
      existing.totalScore += s.overallScore || 0
      existing.best = Math.max(existing.best, s.overallScore || 0)
      map.set(key, existing)
    }
    return map
  }, [scored])

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: summaries.length }
    for (const g of groups) counts[g.toLowerCase()] = 0
    for (const s of summaries) {
      const r = allRounds.find(x => x.id === s.roundId)
      const key = r ? categoryFor(r).toLowerCase() : 'other'
      if (key in counts) counts[key]++
    }
    return counts
  }, [summaries, groups, allRounds])

  const filteredSummaries = useMemo(() => {
    if (historyFilter === 'all') return summaries
    return summaries.filter((s) => {
      const r = allRounds.find(x => x.id === s.roundId)
      return r ? categoryFor(r).toLowerCase() === historyFilter : false
    })
  }, [summaries, historyFilter, allRounds])


  return (
    <div className="iv-workspace animate-rise flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="iv-hero">
        <span className="iv-eyebrow"><Mic size={14} aria-hidden="true" /> Your interview practice room</span>
        <h1 className="text-2xl font-display font-bold text-foreground">Mock interviews</h1>
        <p className="text-muted-foreground max-w-xl">Practise one round at a time. Think out loud, work through follow-ups, and leave with specific feedback for your next interview.</p>
        <div className="iv-hero-meta"><span><Clock3 size={14} />20–45 minutes</span><span><Code2 size={14} />Code, design, or conversation</span><span><Check size={14} />Personal scorecard</span></div>
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

      <nav className="iv-view-switch" aria-label="Interview workspace">
        <button type="button" aria-pressed={section === 'setup'} onClick={() => setSection('setup')}>Practise a round</button>
        <button type="button" aria-pressed={section === 'history'} onClick={() => setSection('history')}>History & feedback <span>{summaries.length}</span></button>
      </nav>

      {/* Progress Stats */}
      {section === 'history' && scored.length > 0 && (
        <section className="iv-stats-row" aria-label="Interview progress">
          <div className="iv-stat-card">
            <span className="iv-stat-value">{summaries.length}</span>
            <span className="iv-stat-label">Total sessions</span>
          </div>
          <div className="iv-stat-card">
            <span className={`iv-stat-value ${average !== null && average >= 70 ? 'is-good' : average !== null && average >= 50 ? 'is-ok' : 'is-bad'}`}>
              {average ?? '—'}
            </span>
            <span className="iv-stat-label">Average score</span>
          </div>
          <div className="iv-stat-card">
            <span className="iv-stat-value is-good">{bestScore ?? '—'}</span>
            <span className="iv-stat-label">Best score</span>
          </div>
          <div className="iv-stat-card">
            <span className="iv-stat-value">{hires}</span>
            <span className="iv-stat-label">Hire verdict{hires === 1 ? '' : 's'}</span>
          </div>
          {recentScores.length >= 2 && (
            <div className="iv-stat-card is-wide">
              <Sparkline scores={recentScores} />
              <span className="iv-stat-label">Recent trend</span>
            </div>
          )}
        </section>
      )}

      {/* Setup */}
      {section === 'setup' && <section className="iv-setup surface" aria-labelledby="iv-setup-title">
        <div className="iv-setup-main">
          <h2 id="iv-setup-title" className="text-lg font-bold">
            <span className="iv-step">1</span> Choose your focus
          </h2>

          <div className="iv-category-list" aria-label="Round categories">
            {['all', ...groups].map(group => <button type="button" key={group} aria-pressed={category === group} onClick={() => setCategory(group)}>{group === 'all' ? 'All rounds' : group}<span>{group === 'all' ? allRounds.length : allRounds.filter(r => categoryFor(r) === group).length}</span></button>)}
          </div>
          <label className="iv-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Search interview rounds" placeholder="Search a topic, language, or skill…" value={query} onChange={e => setQuery(e.target.value)} /></label>
          {category === 'Learning tracks' && <label className="iv-family-filter">Track category<select value={family} onChange={e => setFamily(e.target.value)}><option value="all">All learning tracks</option>{families.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
          <div className="iv-catalog-heading"><p>{CATEGORY_DESCRIPTIONS[category] || 'Find the right round for your next interview.'}</p><span aria-live="polite">{visibleRounds.length} rounds</span></div>
          <div className="iv-catalog">
                <div className="iv-round-grid">
                  {visibleRounds.map((r) => {
                    const stat = roundStats.get(r.id)
                    return (
                      <button key={r.id} type="button" className={`iv-round ${round.id === r.id ? 'is-active' : ''}`} onClick={() => setRoundId(r.id)} aria-pressed={round.id === r.id}>
                        <span className="iv-round-type">{r.family || categoryFor(r)}{round.id === r.id && <Check size={15} aria-label="Selected" />}</span>
                        <span className="font-semibold">{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.blurb}</span>
                        <span className="iv-round-format">{r.design ? 'Whiteboard session' : r.coding ? 'Live coding' : 'Guided conversation'}</span>
                        {stat && (
                          <span className="text-[10px] font-bold text-primary mt-1">
                            {stat.count} done · avg {Math.round(stat.totalScore / stat.count)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
            {visibleRounds.length === 0 && <div className="iv-search-empty"><p>No rounds match your search.</p><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setCategory('all') }}>Show all rounds</button></div>}
          </div>

          <h2 className="iv-section-heading"><span className="iv-step">2</span> Set the challenge</h2>
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
            <h2 className="iv-section-heading"><span className="iv-step">3</span> Pick your interviewer</h2>
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
          <p className="iv-eyebrow">Your session</p>
          <h3 className="text-lg font-bold mt-2 mb-4">{round.label}</h3>
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
          <button type="button" className="btn btn-primary w-full mt-4" onClick={start} disabled={aiReason !== null}>
            {aiReason === undefined ? 'Checking availability…' : 'Start interview'} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="text-[11px] text-muted-foreground mt-2">Find a quiet spot, talk through your thinking, and treat it like the real thing.</p>
        </aside>
      </section>}

      {/* History */}
      {section === 'history' && jobInterviews.length > 0 && (
        <section className="surface rounded-2xl border border-border p-4" aria-labelledby="job-iv-title">
          <h2 id="job-iv-title" className="font-bold">Job-specific interviews</h2>
          <p className="text-xs text-muted-foreground">Evidence-based attempts run from a job workspace. Reports and re-attempts live with the job.</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {jobInterviews.slice(0, 8).map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <strong>{h.job.title}</strong>{h.job.companyName ? ` · ${h.job.companyName}` : ''} · {new Date(h.completedAt ?? h.startedAt).toLocaleDateString()} · {h.label}
                  {h.status === 'completed' ? ` · ${h.metrics.filter((m) => m.total > 0 && m.demonstrated / m.total >= 0.6).length}/${h.metrics.length} areas demonstrated` : ` · ${h.status}`}
                </span>
                {h.jobId && onOpenJob && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenJob(h.jobId!)}>
                    Open job
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {section === 'history' && <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Your interviews</h2>
          {scored.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {scored.length} scored · average {average} · {hires} hire verdict{hires === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {/* History filters */}
        {summaries.length > 0 && (
          <div className="iv-pills" role="radiogroup" aria-label="Filter history">
            <button
              type="button"
              role="radio"
              aria-checked={historyFilter === 'all'}
              className={historyFilter === 'all' ? 'is-active' : ''}
              onClick={() => setHistoryFilter('all')}
            >
              All {filterCounts['all'] > 0 ? `(${filterCounts['all']})` : ''}
            </button>
            {groups.map((group) => {
              const key = group.toLowerCase()
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={historyFilter === key}
                  className={historyFilter === key ? 'is-active' : ''}
                  onClick={() => setHistoryFilter(key)}
                  disabled={filterCounts[key] === 0}
                >
                  {group} {filterCounts[key] > 0 ? `(${filterCounts[key]})` : ''}
                </button>
              )
            })}
          </div>
        )}

        {summaries.length === 0 ? (
          <div className="iv-empty-state">
            <div className="iv-empty-icon" aria-hidden="true">🎙️</div>
            <h3>No mock interviews yet</h3>
            <p>Choose a round type above, set your difficulty, and start your first AI-powered mock interview. You'll get a detailed scorecard with strengths, improvements, and model answers.</p>
            <button type="button" className="btn btn-primary btn-sm mt-2" onClick={() => { setSection('setup'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              Set up your first interview ↑
            </button>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-xl">
            No {historyFilter} interviews yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSummaries.map((s) => {
              const r = allRounds.find(x => x.id === s.roundId) || allRounds[0]
              const p = personaById(s.personaId)
              return (
                <div key={s.id} className="iv-history surface relative group">
                  <button type="button" className="iv-history-main text-left" onClick={() => setReportId(s.id)}>
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
                  {/* Delete button */}
                  {onDeleteInterview && (
                    confirmDeleteId === s.id ? (
                      <div className="iv-history-delete-confirm">
                        <span className="text-xs font-semibold">Delete?</span>
                        <button type="button" className="btn btn-sm" style={{ background: 'hsl(var(--destructive))', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => void handleDelete(s.id)}>
                          Yes
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setConfirmDeleteId(null)}>
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="iv-history-delete"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id) }}
                        aria-label={`Delete ${r.label} interview`}
                        title="Delete this interview"
                      >
                        ✕
                      </button>
                    )
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>}

      {report && (
        <InterviewReport
          summary={report}
          onClose={closeReport}
          onRetake={
            report.roundId
              ? () => {
                  closeReport()
                  setRoundId(report.roundId || 'dsa')
                  setSection('setup')
                  setCategory(categoryFor(allRounds.find(r => r.id === report.roundId) || allRounds[0]))
                  setQuery('')
                  setFamily('all')
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
