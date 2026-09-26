import { useLearningDraft } from './lib/useLearningDraft'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AITutor from './components/AITutor'
import AlgoEditor from './components/compiler/AlgoEditor'
import type { DsaProblem, DsaAttempt, DsaAttemptSummary, LeetCodeConfig } from './types'
import { getDsaAttempts, HISTORY_IMPORTED_EVENT, saveDsaAttempt } from './db'
import { CODE_LANGUAGE_EVENT, getCodeLanguage, LANGUAGE_IDS, type CodeLanguage } from './lib/preferences'

/** Editor ids ('cpp') back to display names ('C++'). */
function displayLanguage(id: string) {
  const hit = (Object.entries(LANGUAGE_IDS) as [CodeLanguage, string][]).find(([, v]) => v === id)
  return hit ? hit[0] : id
}

interface ProblemDetailProps {
  problem: DsaProblem
  onBack: () => void
  backLabel?: string
  onToast?: (message: string) => void
  onSaveAttempt: (summary: DsaAttemptSummary, newProblemStatus: 'Unattempted' | 'Attempted' | 'Solved') => void
  onCreateNote: () => void
  leetCodeConfig?: LeetCodeConfig
  onUpdateProblem?: (updated: DsaProblem) => void
}

export default function ProblemDetail({
  problem,
  onBack,
  backLabel = 'Back',
  onToast,
  onSaveAttempt,
  onCreateNote,
  leetCodeConfig,
  onUpdateProblem
}: ProblemDetailProps) {
  const [attempts, setAttempts] = useState<DsaAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutor, setShowTutor] = useState(false)
  const [activeTab, setActiveTab] = useState<'problem' | 'pattern' | 'workspace' | 'history'>('workspace')

  // Code and Attempt Drafts
  const [language, setLanguage] = useLearningDraft<string>(`ProblemDetail:${problem.id}:language`, getCodeLanguage())
  const initialStarter = problem.starterCode?.[language] || problem.starterCode?.['Java'] || ''
  const [code, setCode] = useLearningDraft(`ProblemDetail:${problem.id}:code`, initialStarter)
  const [approach, setApproach] = useLearningDraft(`ProblemDetail:${problem.id}:approach`, '')
  const [timeSpent, setTimeSpent] = useLearningDraft(`ProblemDetail:${problem.id}:timeSpent`, '25')
  const [timeComplexity, setTimeComplexity] = useLearningDraft(`ProblemDetail:${problem.id}:timeComplexity`, 'O(N)')
  const [spaceComplexity, setSpaceComplexity] = useLearningDraft(`ProblemDetail:${problem.id}:spaceComplexity`, 'O(1)')
  const [hintsUsed, setHintsUsed] = useLearningDraft(`ProblemDetail:${problem.id}:hintsUsed`, '0')
  const [outcome, setOutcome] = useLearningDraft<'Solved' | 'Solved with Hints' | 'Failed'>(`ProblemDetail:${problem.id}:outcome`, 'Solved')
  const [confidence, setConfidence] = useLearningDraft<1|2|3|4|5>(`ProblemDetail:${problem.id}:confidence`, 3)
  const [mistakesNotes, setMistakesNotes] = useLearningDraft(`ProblemDetail:${problem.id}:mistakes`, '')

  // Progressive hints reveal state
  const [revealedHints, setRevealedHints] = useState<number[]>([])
  const [showSolution, setShowSolution] = useState(false)
  const [selectedSolutionLang, setSelectedSolutionLang] = useState<'Java' | 'Python' | 'TypeScript'>('Java')

  // Practice Stopwatch
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // LeetCode sync verification state
  const [isVerifyingLC, setIsVerifyingLC] = useState(false)
  const [lcVerifyMsg, setLcVerifyMsg] = useState<string | null>(null)

  // Preferred language synchronization
  useEffect(() => {
    const onChange = (e: Event) => {
      const nextLang = (e as CustomEvent<string>).detail
      setLanguage(nextLang)
      if (!code.trim() && problem.starterCode?.[nextLang]) {
        setCode(problem.starterCode[nextLang])
      }
    }
    window.addEventListener(CODE_LANGUAGE_EVENT, onChange)
    return () => window.removeEventListener(CODE_LANGUAGE_EVENT, onChange)
  }, [setLanguage, code, problem.starterCode, setCode])

  // Stopwatch effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerRunning])

  // Sync timer to timeSpent draft
  useEffect(() => {
    if (timerSeconds > 0 && timerSeconds % 60 === 0) {
      setTimeSpent(String(Math.max(1, Math.round(timerSeconds / 60))))
    }
  }, [timerSeconds, setTimeSpent])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Load past attempts
  useEffect(() => {
    let cancelled = false
    const load = () =>
      getDsaAttempts(problem.id).then((loaded) => {
        if (cancelled) return
        setAttempts(loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setLoading(false)
      })
    void load()
    window.addEventListener(HISTORY_IMPORTED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(HISTORY_IMPORTED_EVENT, load)
    }
  }, [problem.id])

  // Reveal a hint
  const handleRevealHint = (level: number) => {
    if (!revealedHints.includes(level)) {
      const updated = [...revealedHints, level]
      setRevealedHints(updated)
      setHintsUsed(String(updated.length))
    }
  }

  // Reset to starter code
  const handleResetStarter = () => {
    const starter = problem.starterCode?.[language] || problem.starterCode?.['Java'] || ''
    if (starter) {
      setCode(starter)
      onToast?.(`Reset editor to ${language} starter template.`)
    }
  }

  // Check LeetCode status for this problem
  const handleCheckLeetCode = async () => {
    const username = leetCodeConfig?.username?.trim()
    if (!username) {
      setLcVerifyMsg('Set your LeetCode username in the workspace first.')
      return
    }

    setIsVerifyingLC(true)
    setLcVerifyMsg('Querying LeetCode for this problem…')

    try {
      const res = await fetch(`/api/leetcode/${encodeURIComponent(username)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'LeetCode check failed')

      const subs: { titleSlug: string }[] = data.submissions || []
      const matched = subs.some(s => s.titleSlug === problem.titleSlug)

      if (matched) {
        setLcVerifyMsg('✓ Verified! This problem is accepted on your LeetCode profile.')
        if (onUpdateProblem) {
          onUpdateProblem({ ...problem, leetCodeStatus: 'Accepted', status: 'Solved' })
        }
        onToast?.('LeetCode verification confirmed: Accepted!')
      } else {
        setLcVerifyMsg('Not found in recent accepted submissions. (LeetCode sync checks recent 50 submissions).')
      }
    } catch (err) {
      setLcVerifyMsg(err instanceof Error ? err.message : 'Failed to query LeetCode API.')
    } finally {
      setIsVerifyingLC(false)
    }
  }

  // Submit attempt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalMinutes = timerSeconds > 0 
      ? Math.max(1, Math.round(timerSeconds / 60)) 
      : parseInt(timeSpent, 10) || 1

    const newAttempt: DsaAttempt = {
      id: uuidv4(),
      problemId: problem.id,
      date: new Date().toISOString(),
      language: language,
      code,
      approach,
      timeSpentMinutes: finalMinutes,
      timeComplexity,
      spaceComplexity,
      hintsUsed: parseInt(hintsUsed, 10) || revealedHints.length,
      outcome,
      confidence,
      mistakesOrNotes: mistakesNotes
    }

    await saveDsaAttempt(newAttempt)

    const summary: DsaAttemptSummary = {
      id: newAttempt.id,
      problemId: newAttempt.problemId,
      date: newAttempt.date,
      hintsUsed: newAttempt.hintsUsed,
      outcome: newAttempt.outcome,
      confidence: newAttempt.confidence,
      timeSpentMinutes: newAttempt.timeSpentMinutes,
      language: newAttempt.language
    }

    const newStatus = outcome.startsWith('Solved') ? 'Solved' : 'Attempted'
    setAttempts([newAttempt, ...attempts])
    setTimerRunning(false)
    
    onSaveAttempt(summary, newStatus)
    onToast?.(`Attempt saved! Confidence: ${confidence}/5. Problem marked ${newStatus}.`)
    setActiveTab('history')
  }

  const confidenceLabels = {
    1: '1/5 - Struggled / Needed solution walkthrough',
    2: '2/5 - Partial solution with heavy hints',
    3: '3/5 - Solved with moderate effort / minor hints',
    4: '4/5 - Strong solution / clean complexity',
    5: '5/5 - Flawless / Interview-Ready'
  }

  return (
    <div className={`animate-rise flex flex-col gap-6 max-w-7xl mx-auto w-full transition-[padding] duration-300 lg:pr-[var(--tutor-pad,0px)] pb-16`}>
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 surface rounded-2xl p-5 sm:p-6 border border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onBack} 
              className="btn btn-ghost px-3 py-1.5 text-xs font-semibold"
            >
              ← {backLabel}
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              {problem.pattern && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {problem.pattern}
                </span>
              )}
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                problem.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                problem.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                'text-rose-500 bg-rose-500/10 border-rose-500/20'
              }`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stopwatch widget */}
            <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-xl border border-border text-xs font-mono">
              <span className={timerRunning ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground'}>⏱</span>
              <span className="font-bold text-foreground">{formatTimer(timerSeconds)}</span>
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`ml-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  timerRunning ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                }`}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                  title="Reset timer"
                >
                  ↺
                </button>
              )}
            </div>

            {/* LeetCode link */}
            {problem.url && (
              <a 
                href={problem.url} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-ghost text-xs py-1.5 gap-1.5 flex items-center text-amber-500 hover:text-amber-400"
              >
                <span>LeetCode</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}

            {/* AI Tutor */}
            <button 
              type="button" 
              onClick={() => setShowTutor(v => !v)} 
              className={`btn text-xs py-1.5 ${showTutor ? 'bg-primary/20 text-primary border-primary/30' : 'btn-ghost'}`}
            >
              🤖 {showTutor ? 'Hide tutor' : 'AI Tutor'}
            </button>

            {/* Prep Note */}
            <button type="button" onClick={onCreateNote} className="btn btn-secondary text-xs py-1.5">
              📝 Prep note
            </button>
          </div>
        </div>

        {/* Title, Companies & LC Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <span>{problem.title}</span>
              {problem.leetCodeStatus === 'Accepted' ? (
                <span className="text-xs font-bold bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                  <span>LC Verified ✓</span>
                </span>
              ) : (
                <button
                  onClick={handleCheckLeetCode}
                  disabled={isVerifyingLC}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-amber-500 border border-dashed border-border px-2 py-0.5 rounded hover:border-amber-500/40 transition-colors"
                  title="Check if this problem was recently accepted on LeetCode"
                >
                  {isVerifyingLC ? 'Checking LC…' : 'Check LC Status'}
                </button>
              )}
            </h1>

            {/* Company Tags */}
            {problem.companies && problem.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">High frequency at:</span>
                {problem.companies.map(c => (
                  <span key={c} className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Local Status:</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              problem.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              problem.status === 'Attempted' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-muted text-muted-foreground border-border'
            }`}>
              {problem.status}
            </span>
          </div>
        </div>

        {lcVerifyMsg && (
          <div className="text-xs p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-between">
            <span>{lcVerifyMsg}</span>
            <button onClick={() => setLcVerifyMsg(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>💻 Practice Arena</span>
        </button>

        <button
          onClick={() => setActiveTab('problem')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'problem'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>📘 Description & Examples</span>
        </button>

        <button
          onClick={() => setActiveTab('pattern')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pattern'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🧠 Pattern Blueprint & Hints</span>
          {revealedHints.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
              {revealedHints.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>📝 Attempt History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
            {attempts.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. PRACTICE ARENA TAB */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
          {/* Code Editor Column */}
          <div className="surface rounded-2xl p-5 sm:p-6 border border-border flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground">Interactive Editor</span>
                <span className="text-xs text-muted-foreground">• Ctrl+Enter runs in compiler</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetStarter}
                  className="btn btn-ghost text-xs py-1 text-muted-foreground hover:text-foreground"
                  title="Reload default starter code signature for this language"
                >
                  ↺ Reset Starter Code
                </button>
              </div>
            </div>

            <div className="w-full">
              <AlgoEditor
                initialLanguage={LANGUAGE_IDS[language as CodeLanguage] ?? language}
                initialCode={code}
                height="540px"
                onCodeChange={setCode}
                onLanguageChange={(id) => setLanguage(displayLanguage(id))}
              />
            </div>
          </div>

          {/* Structured Attempt Logger Column */}
          <form onSubmit={handleSubmit} className="surface rounded-2xl p-5 sm:p-6 border border-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Log Problem Attempt</h2>
              <span className="text-xs text-muted-foreground">Self-Evaluation & Tracking</span>
            </div>

            {/* Approach Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Approach & Invariant Notes
              </label>
              <textarea 
                className="input-field min-h-[90px] text-xs leading-relaxed"
                value={approach}
                onChange={e => setApproach(e.target.value)}
                placeholder="Explain the mental model: why did you choose this pattern? What invariants held across loops?"
              />
            </div>

            {/* Common Mistakes / Gotchas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gotchas / Pitfalls Encountered
              </label>
              <input 
                type="text"
                className="input-field text-xs"
                value={mistakesNotes}
                onChange={e => setMistakesNotes(e.target.value)}
                placeholder="e.g. integer overflow, off-by-one with < vs <=, null check on head"
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time (minutes)</label>
                <input 
                  type="number" 
                  className="input-field text-xs font-mono"
                  value={timeSpent}
                  onChange={e => setTimeSpent(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hints Used</label>
                <input 
                  type="number" 
                  className="input-field text-xs font-mono"
                  value={hintsUsed}
                  onChange={e => setHintsUsed(e.target.value)}
                  min="0"
                  max="3"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Complexity</label>
                <select 
                  className="input-field text-xs font-mono" 
                  value={timeComplexity} 
                  onChange={e => setTimeComplexity(e.target.value)}
                >
                  <option value="O(1)">O(1) - Constant</option>
                  <option value="O(log N)">O(log N) - Logarithmic</option>
                  <option value="O(N)">O(N) - Linear</option>
                  <option value="O(N log N)">O(N log N) - Linearithmic</option>
                  <option value="O(N^2)">O(N^2) - Quadratic</option>
                  <option value="O(2^N)">O(2^N) - Exponential</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Space Complexity</label>
                <select 
                  className="input-field text-xs font-mono" 
                  value={spaceComplexity} 
                  onChange={e => setSpaceComplexity(e.target.value)}
                >
                  <option value="O(1)">O(1) - Auxiliary constant</option>
                  <option value="O(log N)">O(log N) - Recursion stack</option>
                  <option value="O(N)">O(N) - Linear storage</option>
                  <option value="O(N^2)">O(N^2) - Quadratic table</option>
                </select>
              </div>
            </div>

            {/* Outcome */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outcome</label>
              <select className="input-field text-xs" value={outcome} onChange={e => setOutcome(e.target.value as any)}>
                <option value="Solved">Solved Independently (Full Credit)</option>
                <option value="Solved with Hints">Solved with Hints</option>
                <option value="Failed">Struggled / Looked up Solution</option>
              </select>
            </div>

            {/* Interactive Confidence Rating */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Confidence Rating</label>
                <span className="text-xs font-bold text-primary">{confidence}/5</span>
              </div>
              <div className="flex items-center gap-2 justify-center py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star as any)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    title={`Rate ${star}/5`}
                  >
                    <span className={`text-2xl ${star <= confidence ? 'text-amber-400' : 'text-muted-foreground/30'}`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground text-center">
                {confidenceLabels[confidence]}
              </span>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 font-bold shadow-md shadow-primary/10 mt-1">
              Save Attempt & Update Progress
            </button>
          </form>
        </div>
      )}

      {/* 2. DESCRIPTION & EXAMPLES TAB */}
      {activeTab === 'problem' && (
        <div className="flex flex-col gap-6 surface rounded-2xl p-6 sm:p-8 border border-border">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-foreground">Problem Statement</h2>
            <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line bg-muted/20 p-5 rounded-xl border border-border">
              {problem.description || 'No detailed description provided.'}
            </div>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-foreground">Examples</h3>
              <div className="grid grid-cols-1 gap-4">
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="surface rounded-xl p-4 border border-border flex flex-col gap-2 bg-muted/30">
                    <span className="text-xs font-bold text-primary">Example {idx + 1}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-background/80 p-3 rounded-lg border border-border">
                        <span className="text-muted-foreground block text-[10px] uppercase font-sans font-bold mb-1">Input</span>
                        <span className="text-foreground">{ex.input}</span>
                      </div>
                      <div className="bg-background/80 p-3 rounded-lg border border-border">
                        <span className="text-muted-foreground block text-[10px] uppercase font-sans font-bold mb-1">Output</span>
                        <span className="text-foreground">{ex.output}</span>
                      </div>
                    </div>
                    {ex.explanation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Explanation:</strong> {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-foreground">Constraints</h3>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 bg-muted/20 p-4 rounded-xl border border-border font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. PATTERN BLUEPRINT & HINTS TAB */}
      {activeTab === 'pattern' && (
        <div className="flex flex-col gap-6">
          {/* Blueprint Card */}
          {problem.patternBlueprint && (
            <div className="surface rounded-2xl p-6 border border-border flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Pattern Blueprint</span>
                <span className="text-xs text-muted-foreground">• {problem.pattern}</span>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border border-border text-sm leading-relaxed">
                <strong className="block text-xs uppercase text-primary font-bold mb-1">When to Recognize this Pattern:</strong>
                {problem.patternBlueprint.whenToUse}
              </div>
              <div>
                <strong className="block text-xs uppercase text-muted-foreground font-bold mb-2">Canonical Invariant Template:</strong>
                <pre className="bg-muted p-4 rounded-xl text-xs font-mono overflow-x-auto text-foreground border border-border">
                  {problem.patternBlueprint.coreTemplate}
                </pre>
              </div>
              <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/20 text-xs text-destructive">
                <strong className="block uppercase font-bold mb-1">Common Interview Pitfalls:</strong>
                {problem.patternBlueprint.pitfalls}
              </div>
            </div>
          )}

          {/* Progressive 3-Tier Hints */}
          <div className="surface rounded-2xl p-6 border border-border flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground">Progressive Interview Hints</h3>
              <span className="text-xs text-muted-foreground">Reveal step-by-step only when stuck</span>
            </div>

            {problem.hints && problem.hints.length > 0 ? (
              <div className="flex flex-col gap-3">
                {problem.hints.map((hint, idx) => {
                  const level = idx + 1
                  const isRevealed = revealedHints.includes(level)
                  const hintObj = typeof hint === 'string' ? { level, title: `Hint ${level}`, content: hint } : hint

                  return (
                    <div key={idx} className="surface rounded-xl border border-border overflow-hidden">
                      <div className="p-4 flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                            {level}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{hintObj.title}</span>
                        </div>
                        {!isRevealed ? (
                          <button
                            type="button"
                            onClick={() => handleRevealHint(level)}
                            className="btn btn-secondary text-xs py-1"
                          >
                            Reveal Hint {level}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-500">Revealed ✓</span>
                        )}
                      </div>
                      {isRevealed && (
                        <div className="p-4 text-xs text-muted-foreground bg-muted/40 border-t border-border leading-relaxed">
                          {hintObj.content}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No hints registered for this problem.</p>
            )}
          </div>

          {/* Optimal Solution Reveal */}
          {problem.solution && (
            <div className="surface rounded-2xl p-6 border border-border flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-bold text-foreground">Optimal Solution Walkthrough</h3>
                  <span className="text-xs text-muted-foreground">Detailed mathematical approach & multi-language reference</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className={`btn text-xs py-1.5 ${showSolution ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                </button>
              </div>

              {showSolution && (
                <div className="flex flex-col gap-4 pt-3 border-t border-border animate-rise text-sm">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Intuition</span>
                    <p className="text-xs leading-relaxed">{problem.solution.intuition}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step-by-Step Approach</span>
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-line bg-muted/30 p-4 rounded-xl border border-border">
                      {problem.solution.approach}
                    </p>
                  </div>

                  {/* Complexity Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-muted/40 p-3 rounded-xl border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block mb-1">Time Complexity</span>
                      <span className="text-emerald-500 font-bold">{problem.solution.timeComplexity}</span>
                    </div>
                    <div className="bg-muted/40 p-3 rounded-xl border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block mb-1">Space Complexity</span>
                      <span className="text-emerald-500 font-bold">{problem.solution.spaceComplexity}</span>
                    </div>
                  </div>

                  {/* Code by Language */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Reference Code</span>
                      <div className="flex gap-1">
                        {(['Java', 'Python', 'TypeScript'] as const).map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setSelectedSolutionLang(lang)}
                            className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                              selectedSolutionLang === lang ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 border-border text-muted-foreground'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-xl text-xs font-mono overflow-x-auto text-foreground border border-border">
                      {problem.solution.code[selectedSolutionLang] || problem.solution.code['Java'] || '// Solution in this language coming soon'}
                    </pre>
                  </div>

                  {problem.solution.keyTakeaway && (
                    <div className="bg-muted/40 p-3 rounded-xl border border-border text-xs text-muted-foreground">
                      <strong className="text-foreground">Key Takeaway:</strong> {problem.solution.keyTakeaway}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. ATTEMPT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Attempt Timeline</h2>
            <span className="text-xs text-muted-foreground">{attempts.length} logged attempt(s) on this problem</span>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading attempt history…</div>
          ) : attempts.length === 0 ? (
            <div className="surface rounded-2xl p-10 border border-dashed border-border text-center flex flex-col items-center gap-3">
              <span className="text-3xl">⏱️</span>
              <p className="font-semibold text-foreground">No attempts logged yet on this device.</p>
              <p className="text-xs text-muted-foreground max-w-sm">Head over to the Practice Arena to test your solution and record your metrics.</p>
              <button onClick={() => setActiveTab('workspace')} className="btn btn-primary text-xs mt-2">
                Open Practice Arena
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {attempts.map(attempt => (
                <div key={attempt.id} className="surface rounded-2xl p-5 border border-border flex flex-col gap-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {new Date(attempt.date).toLocaleDateString()} at {new Date(attempt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        {attempt.language || 'Java'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        attempt.outcome === 'Solved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        attempt.outcome === 'Failed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {attempt.outcome}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCode(attempt.code)
                          setLanguage(attempt.language || 'Java')
                          setActiveTab('workspace')
                          onToast?.('Loaded attempt code into editor!')
                        }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Restore Code →
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
                    <span>⏱️ Duration: <strong>{attempt.timeSpentMinutes}m</strong></span>
                    <span>🧠 Confidence: <strong>{attempt.confidence}/5</strong></span>
                    <span>💡 Hints Used: <strong>{attempt.hintsUsed}</strong></span>
                    <span>⚙️ Complexity: <strong>{attempt.timeComplexity} / {attempt.spaceComplexity}</strong></span>
                  </div>

                  {attempt.approach && (
                    <div className="text-xs text-foreground bg-muted/20 p-3 rounded-xl border border-border">
                      <strong className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">Approach:</strong>
                      {attempt.approach}
                    </div>
                  )}

                  {attempt.mistakesOrNotes && (
                    <div className="text-xs text-amber-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                      <strong className="block text-[10px] uppercase font-bold mb-1">Gotchas / Mistakes:</strong>
                      {attempt.mistakesOrNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Tutor Drawer */}
      {showTutor && (
        <AITutor 
          contextTitle={problem.title}
          contextBody={`Pattern: ${problem.pattern || 'Unknown'}\nDifficulty: ${problem.difficulty}\nApproach:\n${approach}\nCode:\n${code}`}
          mode="dsa"
          onClose={() => setShowTutor(false)}
        />
      )}
    </div>
  )
}
