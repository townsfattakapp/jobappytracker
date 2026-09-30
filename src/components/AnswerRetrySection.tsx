'use client'

import { useState } from 'react'
import { chatWithAI, AiRequestError } from '../lib/aiGatewayClient'

interface AnswerRetrySectionProps {
  question: string
  modelAnswer: string
  initialExpanded?: boolean
}

interface ScoreResult {
  score: number
  verdict: string
  highlights: string[]
  nextTip: string
}

export default function AnswerRetrySection({ question, modelAnswer, initialExpanded = false }: AnswerRetrySectionProps) {
  const [open, setOpen] = useState(initialExpanded)
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)

  const handleScore = async () => {
    if (!answer.trim() || busy) return
    setBusy(true)
    setError(null)

    const systemPrompt = `You are a senior tech interviewer evaluating a candidate's revised retry answer.
Compare the candidate's answer to the model answer.
Always respond in strictly valid JSON with this exact schema:
{
  "score": <number between 1 and 10>,
  "verdict": "<short 1-sentence verdict, e.g. 'Strong improvement! Clear structure and good trade-offs.'>",
  "highlights": ["<specific good point 1>", "<specific good point 2>"],
  "nextTip": "<one actionable tip to achieve a 10/10 answer>"
}`

    const userPrompt = `Question:
${question}

Reference Model Answer:
${modelAnswer}

Candidate's Revised Retry Answer:
${answer}`

    try {
      const raw = await chatWithAI({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        json: true,
      })

      // Clean JSON if wrapped in markdown code blocks
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned) as ScoreResult
      setResult({
        score: typeof parsed.score === 'number' ? Math.min(10, Math.max(1, parsed.score)) : 7.5,
        verdict: parsed.verdict || 'Good revision attempt!',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : ['Addressed key parts of the question.'],
        nextTip: parsed.nextTip || 'Keep practicing STAR-formatted answers with metrics.',
      })
    } catch (err) {
      if (err instanceof AiRequestError && err.code === 'no_key') {
        setError('AI scoring requires an active pass or AI key configured in Settings.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Could not evaluate answer. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      {!open ? (
        <button
          type="button"
          className="btn btn-outline btn-sm text-xs font-semibold flex items-center gap-1.5 text-primary hover:bg-primary/10"
          onClick={() => setOpen(true)}
        >
          <span>⚡ Practice & Retry This Question</span>
        </button>
      ) : (
        <div className="bg-card/60 border border-primary/25 rounded-xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span>⚡ Active Retry Coaching</span>
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => {
                setOpen(false)
                setResult(null)
              }}
            >
              Hide
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Re-answer in your own words using the model answer above as inspiration. Focus on technical specifics, trade-offs, and metrics.
          </p>

          <textarea
            className="w-full min-h-[90px] p-2.5 text-sm rounded-lg bg-background border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-y"
            placeholder="Type or speak your revised answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={busy}
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary btn-sm text-xs"
              onClick={() => void handleScore()}
              disabled={busy || !answer.trim()}
            >
              {busy ? 'Evaluating with AI…' : 'Score My Retry Answer'}
            </button>
            <span className="text-[11px] text-muted-foreground">
              Instant feedback against senior interviewer standards
            </span>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2 animate-fade">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">{result.verdict}</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  result.score >= 8 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                  result.score >= 6 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  Score: {result.score}/10
                </span>
              </div>

              {result.highlights.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">What improved:</p>
                  <ul className="text-xs list-disc list-inside space-y-0.5 text-muted-foreground">
                    {result.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.nextTip && (
                <div className="text-xs pt-1 border-t border-border/40">
                  <span className="font-semibold text-primary">Pro Tip for 10/10: </span>
                  <span className="text-muted-foreground">{result.nextTip}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
