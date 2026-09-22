import { useLearningDraft } from './lib/useLearningDraft'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AITutor from './components/AITutor.tsx'
import AlgoEditor from './components/compiler/AlgoEditor.tsx'
import type { DsaProblem, DsaAttempt, DsaAttemptSummary } from './types'
import { getDsaAttempts, saveDsaAttempt } from './db'
import { getCodeLanguage, LANGUAGE_IDS, type CodeLanguage } from './lib/preferences'

/** Editor ids ('cpp') back to the display names stored on attempts ('C++'). */
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
}

export default function ProblemDetail({ problem, onBack, backLabel = 'Back', onSaveAttempt, onCreateNote }: ProblemDetailProps) {
  const [attempts, setAttempts] = useState<DsaAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutor, setShowTutor] = useState(false)

  const [language, setLanguage] = useLearningDraft<string>(`ProblemDetail:${problem.id}:language`, getCodeLanguage())
  const [code, setCode] = useLearningDraft(`ProblemDetail:${problem.id}:code`, '')
  const [approach, setApproach] = useLearningDraft(`ProblemDetail:${problem.id}:approach`, '')
  const [timeSpent, setTimeSpent] = useLearningDraft(`ProblemDetail:${problem.id}:timeSpent`, '30')
  const [timeComplexity, setTimeComplexity] = useLearningDraft(`ProblemDetail:${problem.id}:timeComplexity`, 'O(N)')
  const [spaceComplexity, setSpaceComplexity] = useLearningDraft(`ProblemDetail:${problem.id}:spaceComplexity`, 'O(N)')
  const [hintsUsed, setHintsUsed] = useLearningDraft(`ProblemDetail:${problem.id}:hintsUsed`, '0')
  const [outcome, setOutcome] = useLearningDraft<'Solved' | 'Solved with Hints' | 'Failed'>(`ProblemDetail:${problem.id}:outcome`, 'Solved')
  const [confidence, setConfidence] = useLearningDraft<1|2|3|4|5>(`ProblemDetail:${problem.id}:confidence`, 3)

  useEffect(() => {
    getDsaAttempts(problem.id).then(loaded => {
      setAttempts(loaded.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setLoading(false)
    })
  }, [problem.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newAttempt: DsaAttempt = {
      id: uuidv4(),
      problemId: problem.id,
      date: new Date().toISOString(),
      language: language,
      code,
      approach,
      timeSpentMinutes: parseInt(timeSpent, 10) || 0,
      timeComplexity,
      spaceComplexity,
      hintsUsed: parseInt(hintsUsed, 10) || 0,
      outcome,
      confidence
    }

    await saveDsaAttempt(newAttempt)
    
    const summary: DsaAttemptSummary = {
      id: newAttempt.id,
      problemId: newAttempt.problemId,
      date: newAttempt.date,
      hintsUsed: newAttempt.hintsUsed,
      outcome: newAttempt.outcome,
      confidence: newAttempt.confidence
    }

    const newStatus = outcome.startsWith('Solved') ? 'Solved' : 'Attempted'
    
    setAttempts([newAttempt, ...attempts])
    setCode('')
    setApproach('')
    
    onSaveAttempt(summary, newStatus)
  }

  return (
    <div className={`animate-rise flex flex-col gap-6 max-w-6xl mx-auto w-full transition-[padding] duration-300 lg:pr-[var(--tutor-pad,0px)]`}>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost px-3">← {backLabel}</button>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2 min-w-0">
          <span className="truncate">{problem.title}</span>
          {problem.leetCodeStatus === 'Accepted' && (
            <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20" title="Accepted on LeetCode">LC</span>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {problem.url && (
            <a href={problem.url} target="_blank" rel="noreferrer" className="btn btn-ghost text-sm">
              Open on LeetCode ↗
            </a>
          )}
          <button type="button" onClick={() => setShowTutor((v) => !v)} className={`btn text-sm ${showTutor ? 'bg-primary/20 text-primary' : 'btn-ghost'}`}>
            🤖 {showTutor ? 'Hide tutor' : 'AI tutor'}
          </button>
          <button type="button" onClick={onCreateNote} className="btn btn-secondary text-sm">
            📝 Prep note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="surface rounded-xl p-6 flex flex-col gap-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground">Log New Attempt</h2>
            
            <div className="flex flex-col gap-1.5 col-span-full">
              <div className="flex items-baseline justify-between gap-2">
                <label className="text-sm font-medium text-foreground">Solution</label>
                <span className="text-xs text-muted-foreground">Pick the language in the editor · Ctrl+Enter runs</span>
              </div>
              <AlgoEditor
                initialLanguage={LANGUAGE_IDS[language as CodeLanguage] ?? language}
                initialCode={code}
                height="560px"
                onCodeChange={setCode}
                onLanguageChange={(id) => setLanguage(displayLanguage(id))}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Approach / Notes</label>
              <textarea 
                className="input-field min-h-[100px]"
                value={approach}
                onChange={e => setApproach(e.target.value)}
                placeholder="How did you solve it? Any bottlenecks?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Time Spent (min)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={timeSpent}
                  onChange={e => setTimeSpent(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Hints Used</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={hintsUsed}
                  onChange={e => setHintsUsed(e.target.value)}
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Time Complexity</label>
                <input 
                  className="input-field"
                  value={timeComplexity}
                  onChange={e => setTimeComplexity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Space Complexity</label>
                <input 
                  className="input-field"
                  value={spaceComplexity}
                  onChange={e => setSpaceComplexity(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Outcome</label>
                <select className="input-field" value={outcome} onChange={e => setOutcome(e.target.value as any)}>
                  <option value="Solved">Solved Independently</option>
                  <option value="Solved with Hints">Solved with Hints</option>
                  <option value="Failed">Failed / Looked up Solution</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Confidence (1-5)</label>
                <input 
                  type="range" 
                  min="1" max="5" step="1"
                  className="mt-2"
                  value={confidence}
                  onChange={e => setConfidence(parseInt(e.target.value, 10) as any)}
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Weak</span>
                  <span>{confidence}/5</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              Save attempt
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Attempt History</h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading history...</div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col gap-4">
              {problem.status !== 'Unattempted' && (
                <div className="text-sm text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                  ⚠️ <strong>Missing Local Data:</strong> Metadata indicates you have solved or attempted this problem, but the raw code was stored locally on another device.
                </div>
              )}
              <div className="text-sm text-muted-foreground p-6 border border-dashed border-border rounded-xl text-center">
                No attempts stored on this device yet. Time to solve it!
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {attempts.map(attempt => (
                <div key={attempt.id} className="surface rounded-xl p-4 border border-border flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-foreground">
                      {new Date(attempt.date).toLocaleDateString()} at {new Date(attempt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      attempt.outcome === 'Solved' ? 'bg-emerald-500/10 text-emerald-500' :
                      attempt.outcome === 'Failed' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {attempt.outcome}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3">
                    <span className="font-semibold text-primary">{attempt.language || 'Java'}</span>
                    <span>⏱️ {attempt.timeSpentMinutes}m</span>
                    <span>🧠 {attempt.confidence}/5</span>
                    <span>💡 {attempt.hintsUsed} hints</span>
                    <span>{attempt.timeComplexity} / {attempt.spaceComplexity}</span>
                  </div>
                  {attempt.approach && (
                    <div className="mt-2 text-sm text-foreground bg-muted/50 p-2 rounded-lg">
                      <strong className="block text-xs text-muted-foreground mb-1">Approach:</strong>
                      {attempt.approach}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
{showTutor && (
                  <AITutor 
            contextTitle={problem.title}
            contextBody={`Difficulty: ${problem.difficulty || 'Unknown'}\nCategory: ${(problem as any).category || 'Unknown'}\nUser Approach:\n${approach}\nUser Code:\n${code}`}
            mode="dsa"
            onClose={() => setShowTutor(false)}
          />
      )}
    </div>
  )
}
