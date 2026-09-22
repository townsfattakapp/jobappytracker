import { useLearningDraft } from './lib/useLearningDraft'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { SystemDesignExercise, SystemDesignAttemptSummary, SystemDesignAttemptDetail } from './types'
import { getSystemDesignAttemptDetails, saveSystemDesignAttemptDetail } from './db'
import MermaidEditor from './components/MermaidEditor.tsx'
import AITutor from './components/AITutor.tsx'

interface SystemDesignExerciseDetailProps {
  exercise: SystemDesignExercise
  onBack: () => void
  backLabel?: string
  onToast?: (message: string) => void
  onSaveAttempt: (summary: SystemDesignAttemptSummary, newStatus: 'Unattempted' | 'Attempted' | 'Solved') => void
}

export default function SystemDesignExerciseDetail({ exercise, onBack, backLabel = 'Back', onToast, onSaveAttempt }: SystemDesignExerciseDetailProps) {
  const [attempts, setAttempts] = useState<SystemDesignAttemptDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutor, setShowTutor] = useState(false)

  const [requirements, setRequirements] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:requirements`, '')
  const [architectureDiagram, setArchitectureDiagram] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:architectureDiagram`, 'graph TD;\n  Client-->API_Gateway;\n  API_Gateway-->ServiceA;\n  API_Gateway-->ServiceB;')
  const [dataModel, setDataModel] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:dataModel`, '')
  const [apiDesign, setApiDesign] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:apiDesign`, '')
  const [bottlenecks, setBottlenecks] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:bottlenecks`, '')
  const [code, setCode] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:code`, '')
  const [notes, setNotes] = useLearningDraft(`SystemDesignExerciseDetail:${exercise.id}:notes`, '')
  
  const [outcome, setOutcome] = useLearningDraft<'Solved' | 'Failed' | 'Needs Review'>(`SystemDesignExerciseDetail:${exercise.id}:outcome`, 'Solved')
  const [confidence, setConfidence] = useLearningDraft<1|2|3|4|5>(`SystemDesignExerciseDetail:${exercise.id}:confidence`, 3)

  useEffect(() => {
    getSystemDesignAttemptDetails(exercise.id).then(loaded => {
      setAttempts(loaded)
      setLoading(false)
    })
  }, [exercise.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newDetail: SystemDesignAttemptDetail = {
      id: uuidv4(),
      exerciseId: exercise.id,
      requirements,
      architectureDiagram,
      dataModel,
      apiDesign,
      bottlenecks,
      code,
      notes
    }

    await saveSystemDesignAttemptDetail(newDetail)
    
    const summary: SystemDesignAttemptSummary = {
      id: newDetail.id,
      exerciseId: newDetail.exerciseId,
      date: new Date().toISOString(),
      outcome,
      confidence
    }

    const newStatus = outcome === 'Solved' ? 'Solved' : 'Attempted'
    onSaveAttempt(summary, newStatus)
    
    setAttempts([...attempts, newDetail])
    setRequirements('')
    setDataModel('')
    setApiDesign('')
    setBottlenecks('')
    setCode('')
    setNotes('')
    onToast?.('Design attempt saved')
  }

  return (
    <div className={`animate-rise flex flex-col gap-6 max-w-5xl mx-auto w-full transition-[padding] duration-300 lg:pr-[var(--tutor-pad,0px)]`}>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost px-3">← {backLabel}</button>
        <h1 className="text-2xl font-display font-bold text-foreground">{exercise.title}</h1>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border tracking-wider ${exercise.type === 'HLD' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-teal-500/10 text-teal-500 border-teal-500/20'}`}>
          {exercise.type}
        </span>
        <button type="button" onClick={() => setShowTutor((v) => !v)} className={`btn text-sm sm:ml-auto ${showTutor ? 'bg-primary/20 text-primary' : 'btn-ghost'}`}>
          🤖 {showTutor ? 'Hide reviewer' : 'AI design review'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="surface rounded-xl p-6 flex flex-col gap-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground">Log New Design Attempt</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Requirements & Assumptions</label>
              <textarea 
                className="input-field min-h-[100px]"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="What are the functional and non-functional requirements? What is the scale?"
                required
              />
            </div>

            {exercise.type === 'HLD' && (
              <>
                <MermaidEditor 
                  value={architectureDiagram} 
                  onChange={setArchitectureDiagram} 
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Data Model & DB Schema</label>
                  <textarea 
                    className="input-field font-mono text-sm min-h-[100px]"
                    value={dataModel}
                    onChange={e => setDataModel(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">API Design</label>
                  <textarea 
                    className="input-field font-mono text-sm min-h-[100px]"
                    value={apiDesign}
                    onChange={e => setApiDesign(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Bottlenecks & Trade-offs</label>
                  <textarea 
                    className="input-field min-h-[80px]"
                    value={bottlenecks}
                    onChange={e => setBottlenecks(e.target.value)}
                  />
                </div>
              </>
            )}

            {exercise.type === 'LLD' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Implementation Code / Interfaces</label>
                  <textarea 
                    className="input-field font-mono text-sm min-h-[300px]"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="class ParkingManager { ... }"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Additional Notes</label>
              <textarea 
                className="input-field min-h-[80px]"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Outcome</label>
                <select className="input-field" value={outcome} onChange={e => setOutcome(e.target.value as any)}>
                  <option value="Solved">Solved</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Confidence (1-5)</label>
                <select className="input-field" value={confidence.toString()} onChange={e => setConfidence(parseInt(e.target.value, 10) as any)}>
                  <option value="1">1 - Clueless</option>
                  <option value="2">2 - Struggled</option>
                  <option value="3">3 - Okay</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Mastered</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-2 h-11">
              Save Attempt
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground px-1">Attempt History (Local)</h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading attempts...</div>
          ) : attempts.length === 0 ? (
            <div className="surface p-6 rounded-xl border border-border text-center">
              <div className="text-4xl mb-2 opacity-50">🏗️</div>
              <p className="text-muted-foreground text-sm">No attempts logged yet.<br/>Your designs will be securely stored locally.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {attempts.map(att => (
                <div key={att.id} className="surface p-4 rounded-xl border border-border flex flex-col gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Attempt ID: {att.id.slice(0,8)}
                    </span>
                  </div>
                  
                  {att.requirements && (
                    <div className="text-sm text-foreground bg-muted/50 p-2 rounded">
                      <span className="font-semibold block mb-1">Requirements:</span>
                      {att.requirements}
                    </div>
                  )}

                  {exercise.type === 'HLD' && att.architectureDiagram && (
                    <div className="text-xs bg-muted/50 p-2 rounded max-h-[250px] overflow-auto">
                      <MermaidEditor value={att.architectureDiagram} readOnly />
                    </div>
                  )}

                  {exercise.type === 'LLD' && att.code && (
                    <div className="text-xs font-mono bg-muted/50 p-2 rounded max-h-[150px] overflow-auto whitespace-pre-wrap">
                      {att.code}
                    </div>
                  )}
                  
                  {att.notes && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground block mb-0.5">Notes:</span>
                      {att.notes}
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
            contextTitle={exercise.title}
            contextBody={`Mermaid Code:\n${architectureDiagram}`}
            mode="system-design"
            onClose={() => setShowTutor(false)}
          />
      )}
    </div>
  )
}
