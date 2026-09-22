import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { MockInterviewSummary, InterviewSessionTranscript } from './types'
import { saveInterviewSessionTranscript } from './db'
import { chatWithAI, isAiAvailable } from './lib/aiGatewayClient'

interface InterviewSessionProps {
  category: MockInterviewSummary['category']
  difficulty: MockInterviewSummary['difficulty']
  onEndSession: (summary: MockInterviewSummary) => void
  onCancel: () => void
}

type Turn = { role: 'interviewer' | 'candidate'; content: string; code?: string }

const CODE_CATEGORIES = new Set(['DSA', 'Java', 'React', 'Node.js'])

export default function InterviewSession({ category, difficulty, onEndSession, onCancel }: InterviewSessionProps) {
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [candidateInput, setCandidateInput] = useState('')
  const [candidateCode, setCandidateCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [aiMode, setAiMode] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionStartTime] = useState<number>(Date.now())
  const transcriptRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    // Guard against React StrictMode double-invoking the effect in development.
    if (started.current) return
    started.current = true
    void startInterview()
  }, [])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const startInterview = async () => {
    const available = await isAiAvailable()
    setAiMode(available)
    if (!available) {
      setTranscript([
        {
          role: 'interviewer',
          content: `Manual ${category} interview (${difficulty}). AI is not configured, so ask yourself a question, answer it below, and rate yourself when you finish. Add a Groq or OpenAI key in Settings for a live interviewer.`,
        },
      ])
      return
    }

    setLoading(true)
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are a strict but fair technical interviewer at a top tech company. The candidate is interviewing for a ${category} role. Difficulty: ${difficulty}. Start by asking ONE initial interview question. Do not provide the answer. Wait for their response.`,
        },
      ]
      const response = await chatWithAI({ messages })
      setTranscript([{ role: 'interviewer', content: response }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      setAiMode(false)
      setTranscript([{ role: 'interviewer', content: `Could not reach the AI interviewer (${message}). Continue in manual mode.` }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateInput.trim() && !candidateCode.trim()) return
    setError(null)

    const newTranscript: Turn[] = [...transcript, { role: 'candidate', content: candidateInput, code: candidateCode }]
    setTranscript(newTranscript)
    setCandidateInput('')
    setCandidateCode('')

    if (!aiMode) return

    setLoading(true)
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are a technical interviewer for a ${category} role. The candidate just responded. Evaluate their response and ask a follow-up question. Don't give them the answer directly if they are struggling, give a hint instead.`,
        },
        ...newTranscript.map((t) => ({
          role: t.role === 'interviewer' ? ('assistant' as const) : ('user' as const),
          content: t.code ? `${t.content}\n\nCode:\n${t.code}` : t.content,
        })),
      ]
      const response = await chatWithAI({ messages })
      setTranscript([...newTranscript, { role: 'interviewer', content: response }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  const finishInterview = async () => {
    if (transcript.filter((t) => t.role === 'candidate').length === 0) {
      if (!window.confirm('You have not answered anything yet. End the session anyway?')) return
    }
    setFinishing(true)
    const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
    const sessionId = uuidv4()

    const sessionData: InterviewSessionTranscript = { id: sessionId, transcript }
    await saveInterviewSessionTranscript(sessionData)

    let summary: MockInterviewSummary = {
      id: sessionId,
      date: new Date().toISOString(),
      category,
      difficulty,
      durationMinutes,
      strengths: ['Completed session'],
      improvementAreas: [],
      recommendedRevisionTopics: [],
    }

    if (aiMode && transcript.length > 2) {
      try {
        const messages = [
          {
            role: 'system' as const,
            content:
              'Analyze the following interview transcript. Return a JSON object with 3 arrays of strings: "strengths", "improvementAreas", and "recommendedRevisionTopics". Keep points very concise.',
          },
          { role: 'user' as const, content: JSON.stringify(transcript) },
        ]
        const response = await chatWithAI({ messages, json: true })
        const aiSummary = JSON.parse(response)
        summary = {
          ...summary,
          strengths: Array.isArray(aiSummary.strengths) ? aiSummary.strengths : summary.strengths,
          improvementAreas: Array.isArray(aiSummary.improvementAreas) ? aiSummary.improvementAreas : summary.improvementAreas,
          recommendedRevisionTopics: Array.isArray(aiSummary.recommendedRevisionTopics)
            ? aiSummary.recommendedRevisionTopics
            : summary.recommendedRevisionTopics,
        }
      } catch (err) {
        console.error('Failed to parse AI summary', err)
      }
    }

    setFinishing(false)
    onEndSession(summary)
  }

  const busy = loading || finishing

  return (
    <div className="animate-rise flex flex-col gap-4 max-w-5xl mx-auto w-full min-h-[70vh] sm:h-[85vh]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mock interview</h1>
          <p className="text-muted-foreground">
            {category} · {difficulty}
            {aiMode === false ? ' · manual mode' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (transcript.some((t) => t.role === 'candidate') && !window.confirm('Discard this session?')) return
              onCancel()
            }}
            className="btn btn-ghost text-muted-foreground"
            disabled={busy}
          >
            Cancel
          </button>
          <button type="button" onClick={finishInterview} className="btn btn-primary" disabled={busy}>
            {finishing ? 'Evaluating…' : 'Finish & evaluate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="surface rounded-xl border border-border flex flex-col flex-1 overflow-hidden min-h-[24rem]">
        <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-[hsl(var(--background))]">
          {transcript.map((t, i) => (
            <div key={i} className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${t.role === 'candidate' ? 'self-end' : 'self-start'}`}>
              <span className="text-xs font-semibold text-muted-foreground mb-1 px-1">{t.role === 'candidate' ? 'You' : 'Interviewer'}</span>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  t.role === 'candidate'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground border border-border rounded-tl-sm'
                }`}
              >
                {t.content}
                {t.code && <pre className="mt-3 p-3 bg-black/20 rounded-lg overflow-x-auto text-xs font-mono">{t.code}</pre>}
              </div>
            </div>
          ))}
          {loading && <div className="self-start text-xs text-muted-foreground animate-pulse p-2">Interviewer is typing…</div>}
        </div>

        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-border bg-muted/30 flex flex-col gap-3">
          <textarea
            className="input-field min-h-[60px]"
            placeholder="Type your explanation or response…"
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          {CODE_CATEGORIES.has(category) && (
            <textarea
              className="input-field font-mono text-sm min-h-[100px]"
              placeholder="Code (optional)…"
              value={candidateCode}
              onChange={(e) => setCandidateCode(e.target.value)}
              disabled={busy}
            />
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">Ctrl/⌘ + Enter to send</span>
            <button type="submit" disabled={busy || (!candidateInput.trim() && !candidateCode.trim())} className="btn btn-primary px-8 ml-auto">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
