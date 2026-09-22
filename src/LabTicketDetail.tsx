import { useLearningDraft } from './lib/useLearningDraft'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { EngineeringLab, LabAttemptSummary, LabAttemptDetail } from './types'
import { saveLabAttemptDetail } from './db'
import { AI_SETUP_HINT, chatWithAI, isAiAvailable } from './lib/aiGatewayClient'
import WebSandbox from './components/compiler/WebSandbox.tsx'
import InteractiveTerminal from './components/compiler/InteractiveTerminal.tsx'

interface LabTicketDetailProps {
  lab: EngineeringLab
  onBack: () => void
  backLabel?: string
  onToast?: (message: string) => void
  onSaveAttempt: (summary: LabAttemptSummary, newLabStatus: EngineeringLab['status']) => void
}

export default function LabTicketDetail({ lab, onBack, backLabel = 'Back', onToast, onSaveAttempt }: LabTicketDetailProps) {
  const [investigationNotes, setInvestigationNotes] = useLearningDraft(`LabTicketDetail:${lab.id}:investigationNotes`, '')
  const [rootCause, setRootCause] = useLearningDraft(`LabTicketDetail:${lab.id}:rootCause`, '')
  const [solutionCode, setSolutionCode] = useLearningDraft(`LabTicketDetail:${lab.id}:solutionCode`, '')
  const [testCases, _setTestCases] = useLearningDraft(`LabTicketDetail:${lab.id}:testCases`, '')
  const [prDescription, setPrDescription] = useLearningDraft(`LabTicketDetail:${lab.id}:prDescription`, '')
  const [timeSpent, setTimeSpent] = useLearningDraft(`LabTicketDetail:${lab.id}:timeSpent`, lab.estDurationMinutes.toString())
  
  const [mentorTranscript, setMentorTranscript] = useLearningDraft<{role: 'user'|'mentor', content: string}[]>(`LabTicketDetail:${lab.id}:mentorTranscript`, [])
  const [mentorInput, setMentorInput] = useState('')
  const [mentorLoading, setMentorLoading] = useState(false)
  const [mentorError, setMentorError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const askMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentorInput.trim() || mentorLoading) return
    setMentorError(null)
    if (!(await isAiAvailable())) {
      setMentorError(AI_SETUP_HINT)
      return
    }

    const newTranscript: {role: 'user'|'mentor', content: string}[] = [
      ...mentorTranscript,
      { role: 'user', content: mentorInput }
    ]
    setMentorTranscript(newTranscript)
    setMentorInput('')
    setMentorLoading(true)

    try {
      const messages = [
        { role: 'system' as const, content: `You are a Senior Engineer acting as a mentor for a junior engineer working on a ticket: ${lab.ticketId} - ${lab.title}. Scenario: ${lab.scenario}. Do NOT give away the exact solution immediately. Ask guiding questions, validate their investigation, and give progressive hints.` },
        ...newTranscript.map(t => ({ role: t.role === 'mentor' ? 'assistant' as const : 'user' as const, content: t.content }))
      ]
      
      const response = await chatWithAI({ messages })
      setMentorTranscript([...newTranscript, { role: 'mentor', content: response }])
    } catch (err) {
      setMentorError(err instanceof Error ? err.message : 'Mentor request failed')
      // revert so the question can be retried
      setMentorTranscript(mentorTranscript)
      setMentorInput(newTranscript[newTranscript.length-1].content)
    } finally {
      setMentorLoading(false)
    }
  }

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [mentorTranscript])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const detailId = uuidv4()
    
    const detail: LabAttemptDetail = {
      id: detailId,
      labId: lab.id,
      investigationNotes,
      rootCause,
      solutionCode,
      testCases,
      prDescription,
      mentorTranscript
    }

    await saveLabAttemptDetail(detail)

    const summary: LabAttemptSummary = {
      id: detailId,
      labId: lab.id,
      date: new Date().toISOString(),
      actualDurationMinutes: parseInt(timeSpent, 10) || 0,
      outcome: 'Passed'
    }

    onSaveAttempt(summary, 'Done')
    setSaved(true)
    onToast?.('Lab submitted and marked done')
  }

  return (
    <div className="animate-rise flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost px-3">← {backLabel}</button>
        <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{lab.ticketId}</span>
        <h1 className="text-2xl font-display font-bold text-foreground">{lab.title}</h1>
      </div>
      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm flex flex-wrap items-center justify-between gap-3" role="status">
          <span className="font-medium text-foreground">Submitted. This lab is marked Done and your write-up is saved on this device.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>{backLabel}</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        <div className="flex flex-col gap-6">
          <div className="surface rounded-xl p-6 border border-border flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Scenario</h3>
              <p className="text-sm text-muted-foreground">{lab.scenario}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                  {lab.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Acceptance Criteria</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                  {lab.acceptanceCriteria.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="surface rounded-xl p-6 flex flex-col gap-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground">Lab Workspace</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Investigation Notes</label>
              <textarea 
                className="input-field min-h-[100px]"
                value={investigationNotes}
                onChange={e => setInvestigationNotes(e.target.value)}
                placeholder="What logs did you check? What did you find?"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Root Cause Analysis</label>
              <textarea 
                className="input-field min-h-[80px]"
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                placeholder="Why did this issue occur?"
              />
            </div>

            <div className="flex flex-col gap-2 col-span-full mt-4 border-t border-border pt-4">
              <label className="text-sm font-medium text-foreground text-center bg-muted/30 py-1 rounded">Interactive Lab Environment</label>
              {(lab.title.toLowerCase().includes('react') || lab.title.toLowerCase().includes('next') || lab.title.toLowerCase().includes('frontend')) ? (
                <WebSandbox 
                  template={lab.title.toLowerCase().includes('react') ? 'react-ts' : 'node'}
                  files={{
                    "App.tsx": solutionCode || "// Write your solution here"
                  }}
                />
              ) : (lab.title.toLowerCase().includes('docker') || lab.title.toLowerCase().includes('ci/cd') || lab.title.toLowerCase().includes('pipeline')) ? (
                <InteractiveTerminal 
                  scenarioName={lab.title}
                  steps={[
                    { command: 'docker build -t my-app .', output: 'Sending build context to Docker daemon 2.048kB\nStep 1/5 : FROM node:18-alpine\n ---> 1a2b3c4d5e6f\nSuccessfully built 7g8h9i0j1k2l\nSuccessfully tagged my-app:latest', delay: 1000 },
                    { command: 'docker run -d -p 8080:8080 my-app', output: 'd3b07384d113edec49eaa6238ad5ff00', delay: 500 }
                  ]}
                />
              ) : (
                <textarea 
                  className="input-field font-mono text-sm min-h-[300px]"
                  value={solutionCode}
                  onChange={e => setSolutionCode(e.target.value)}
                  placeholder="Paste the relevant changes here... (Or use AlgoEditor for standard code)"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">PR Description</label>
              <textarea 
                className="input-field min-h-[100px]"
                value={prDescription}
                onChange={e => setPrDescription(e.target.value)}
                placeholder="Write a clear PR description detailing your changes."
              />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col gap-1.5 w-32">
                <label className="text-sm font-medium text-foreground">Time (min)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={timeSpent}
                  onChange={e => setTimeSpent(e.target.value)}
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-primary ml-auto self-end h-[42px] px-8">
                Submit PR (Finish Lab)
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4 h-[520px] xl:h-[800px]">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Interactive Mentor <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">AI</span>
          </h2>
          <div className="surface rounded-xl border border-border flex flex-col flex-1 overflow-hidden">
            <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {mentorTranscript.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center mt-10">
                  Ask the senior engineer for a hint, architecture review, or help debugging.
                </div>
              ) : (
                mentorTranscript.map((t, i) => (
                  <div key={i} className={`flex flex-col max-w-[90%] ${t.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <span className="text-xs text-muted-foreground mb-1 px-1">{t.role === 'user' ? 'You' : 'Mentor'}</span>
                    <div className={`p-3 rounded-xl text-sm ${t.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                      {t.content}
                    </div>
                  </div>
                ))
              )}
              {mentorLoading && (
                <div className="self-start text-xs text-muted-foreground animate-pulse p-2">Mentor is typing...</div>
              )}
              {mentorError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2" role="alert">{mentorError}</div>
              )}
            </div>
            <form onSubmit={askMentor} className="p-3 border-t border-border flex gap-2">
              <input 
                className="input-field flex-1" 
                placeholder="Ask for a hint..." 
                value={mentorInput}
                onChange={e => setMentorInput(e.target.value)}
                disabled={mentorLoading}
              />
              <button type="submit" disabled={mentorLoading} className="btn btn-secondary shrink-0">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
