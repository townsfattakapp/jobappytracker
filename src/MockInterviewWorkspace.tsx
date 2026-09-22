import { useEffect, useState } from 'react'
import { isAiAvailable } from './lib/aiGatewayClient'
import type { MockInterviewSummary } from './types'

interface MockInterviewWorkspaceProps {
  summaries: MockInterviewSummary[]
  onStartSession: (category: MockInterviewSummary['category'], difficulty: MockInterviewSummary['difficulty']) => void
}

export default function MockInterviewWorkspace({ summaries, onStartSession }: MockInterviewWorkspaceProps) {
  const [newCategory, setNewCategory] = useState<MockInterviewSummary['category']>('DSA')
  const [newDifficulty, setNewDifficulty] = useState<MockInterviewSummary['difficulty']>('Medium')
  const [aiReady, setAiReady] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    isAiAvailable().then((v) => {
      if (!cancelled) setAiReady(v)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="animate-rise flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Mock Interviews</h1>
        <p className="text-muted-foreground">Practice timed interviews with interactive feedback.</p>
        {aiReady === false && (
          <p className="text-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-foreground mt-2">
            AI is not set up, so sessions run in manual mode: you log answers and evaluate yourself. Add a Groq or OpenAI key in Settings for a live interviewer.
          </p>
        )}
      </div>

      <div className="surface rounded-xl p-6 border border-border flex flex-col sm:flex-row items-end gap-4 bg-gradient-to-br from-[hsl(var(--card))] to-primary/5">
        <div className="flex flex-col gap-2 flex-1 w-full">
          <label className="text-sm font-medium text-foreground">Category</label>
          <select 
            className="input-field w-full"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as MockInterviewSummary['category'])}
          >
            <option value="DSA">DSA</option>
            <option value="Java">Java Core</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="System Design">System Design</option>
            <option value="Behavioral">Behavioral (STAR)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full">
          <label className="text-sm font-medium text-foreground">Difficulty</label>
          <select 
            className="input-field w-full"
            value={newDifficulty}
            onChange={e => setNewDifficulty(e.target.value as MockInterviewSummary['difficulty'])}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <button 
          className="btn btn-primary h-[42px] px-8 w-full sm:w-auto"
          onClick={() => onStartSession(newCategory, newDifficulty)}
        >
          Start Session
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Past Interviews</h2>
        {summaries.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground border border-dashed border-border rounded-xl">
            No mock interviews completed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map(s => (
              <div key={s.id} className="surface rounded-xl p-5 border border-border flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-foreground">{s.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                    ${s.difficulty === 'Easy' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 
                      s.difficulty === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
                      'text-destructive border-destructive/20 bg-destructive/10'}`}>
                    {s.difficulty}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex gap-3">
                  <span>📅 {new Date(s.date).toLocaleDateString()}</span>
                  <span>⏱️ {s.durationMinutes}m</span>
                </div>
                
                {s.strengths.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-xs text-emerald-500 block mb-1">Strengths</strong>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      {s.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                )}
                
                {s.improvementAreas.length > 0 && (
                  <div className="mt-1">
                    <strong className="text-xs text-amber-500 block mb-1">To Improve</strong>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      {s.improvementAreas.map((imp, i) => <li key={i}>{imp}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
