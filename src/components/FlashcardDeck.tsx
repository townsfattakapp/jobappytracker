import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TopicFlashcard } from '../types'
import { renderMarkdown } from '../lib/markdown'

type Grade = 'again' | 'good' | 'easy'

function dateKeyFrom(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDaysKey(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return dateKeyFrom(d)
}

export function todayKeyLocal(): string {
  return addDaysKey(0)
}

/** Interval (days) a grade would give this card, used both for scheduling and for the button labels. */
export function nextInterval(card: TopicFlashcard, grade: Grade): number {
  const ease = card.easeFactor || 2.5
  const interval = card.interval || 0
  if (grade === 'again') return 1
  if (interval === 0) return grade === 'easy' ? 3 : 1
  return Math.max(1, Math.round(interval * ease * (grade === 'easy' ? 1.3 : 1)))
}

/** SM-2 style update for a flashcard after a review. */
export function reviewFlashcard(card: TopicFlashcard, grade: Grade): TopicFlashcard {
  const ease = card.easeFactor || 2.5
  const days = nextInterval(card, grade)
  return {
    ...card,
    interval: days,
    easeFactor: grade === 'again' ? Math.max(1.3, ease - 0.2) : grade === 'easy' ? Math.min(3, ease + 0.1) : ease,
    dueDate: addDaysKey(days),
  }
}

export function isDue(card: TopicFlashcard, today = todayKeyLocal()): boolean {
  return !card.dueDate || card.dueDate.slice(0, 10) <= today
}

function dueLabel(card: TopicFlashcard, today: string): { text: string; tone: string } {
  if (!card.interval) return { text: 'New', tone: 'bg-ig-blue/15 text-ig-blue' }
  const due = card.dueDate.slice(0, 10)
  if (due <= today) return { text: 'Due today', tone: 'bg-amber-500/15 text-amber-500' }
  const days = Math.round((Date.parse(due) - Date.parse(today)) / 86400000)
  return { text: `Due in ${days} day${days === 1 ? '' : 's'}`, tone: 'bg-emerald-500/15 text-emerald-500' }
}

function Md({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`prose-tiptap ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
}

function CardForm({
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial?: TopicFlashcard
  onSave: (front: string, back: string) => void
  onCancel?: () => void
  submitLabel: string
}) {
  const [front, setFront] = useState(initial?.front || '')
  const [back, setBack] = useState(initial?.back || '')
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!front.trim() || !back.trim()) return
        onSave(front.trim(), back.trim())
        if (!initial) {
          setFront('')
          setBack('')
        }
      }}
    >
      <label className="block">
        <span className="label-quiet">Question / prompt</span>
        <textarea className="input-field min-h-[80px]" value={front} onChange={(e) => setFront(e.target.value)} placeholder="What is the time complexity of binary search?" autoFocus={Boolean(initial)} />
      </label>
      <label className="block">
        <span className="label-quiet">Answer</span>
        <textarea className="input-field min-h-[80px]" value={back} onChange={(e) => setBack(e.target.value)} placeholder="O(log n): the search space halves each step. Use `backticks` for code." />
      </label>
      <div className="md:col-span-2 flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm" disabled={!front.trim() || !back.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function StudySession({
  cards,
  onReview,
  onExit,
}: {
  cards: TopicFlashcard[]
  onReview: (card: TopicFlashcard) => void
  onExit: () => void
}) {
  const [queue] = useState(() => [...cards])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<Record<Grade, number>>({ again: 0, good: 0, easy: 0 })
  const card = queue[index]
  const finished = index >= queue.length

  const grade = (g: Grade) => {
    if (!card) return
    onReview(reviewFlashcard(card, g))
    setResults((r) => ({ ...r, [g]: r[g] + 1 }))
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (finished) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed((v) => !v)
      } else if (revealed && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault()
        grade(e.key === '1' ? 'again' : e.key === '2' ? 'good' : 'easy')
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, finished, card])

  if (finished) {
    const total = queue.length
    return (
      <div className="surface rounded-2xl border border-emerald-500/40 p-6 text-center space-y-4 animate-fade">
        <span className="text-4xl block" aria-hidden="true">🎉</span>
        <h3 className="text-xl font-bold">Session complete</h3>
        <p className="text-sm text-muted-foreground">
          {total} card{total === 1 ? '' : 's'} reviewed · {results.easy} easy · {results.good} good · {results.again} again
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <button type="button" className="btn btn-primary" onClick={onExit}>
            Back to deck
          </button>
        </div>
        {results.again > 0 && <p className="text-xs text-muted-foreground">Cards you marked “again” come back tomorrow.</p>}
      </div>
    )
  }

  const pct = Math.round((index / queue.length) * 100)
  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          Card {index + 1} of {queue.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full ig-gradient-soft transition-all" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="hover:text-foreground" onClick={onExit}>
          Exit
        </button>
      </div>

      <div className="flip-card" data-revealed={revealed}>
        <button type="button" className="flip-inner" onClick={() => setRevealed((v) => !v)} aria-pressed={revealed} aria-label={revealed ? 'Showing answer. Tap to show question.' : 'Showing question. Tap to reveal answer.'}>
          <div className="flip-face flip-front">
            <span className="flip-label">Question</span>
            <Md text={card.front} className="flip-body" />
            <span className="flip-hint">Tap or press Space to reveal</span>
          </div>
          <div className="flip-face flip-back">
            <span className="flip-label">Answer</span>
            <Md text={card.back} className="flip-body" />
          </div>
        </button>
      </div>

      {revealed ? (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="btn btn-ghost flex-col !gap-0 text-destructive" onClick={() => grade('again')}>
            <span>Again</span>
            <span className="text-[11px] font-normal text-muted-foreground">1 day · key 1</span>
          </button>
          <button type="button" className="btn btn-ghost flex-col !gap-0" onClick={() => grade('good')}>
            <span>Good</span>
            <span className="text-[11px] font-normal text-muted-foreground">{nextInterval(card, 'good')} days · key 2</span>
          </button>
          <button type="button" className="btn btn-primary flex-col !gap-0" onClick={() => grade('easy')}>
            <span>Easy</span>
            <span className="text-[11px] font-normal opacity-80">{nextInterval(card, 'easy')} days · key 3</span>
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">Say the answer out loud first, then reveal and grade yourself honestly.</p>
      )}
    </div>
  )
}

export default function FlashcardDeck({
  cards,
  onChange,
  onGenerate,
  generating = false,
  generateLabel = 'Generate 8 flashcards',
}: {
  cards: TopicFlashcard[]
  onChange: (cards: TopicFlashcard[]) => void
  onGenerate?: () => void
  generating?: boolean
  generateLabel?: string
}) {
  const today = todayKeyLocal()
  const [mode, setMode] = useState<'overview' | 'study' | 'manage'>('overview')
  const [studySet, setStudySet] = useState<TopicFlashcard[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(cards.length === 0)

  const stats = useMemo(() => {
    const due = cards.filter((c) => isDue(c, today))
    const fresh = cards.filter((c) => !c.interval)
    const learned = cards.filter((c) => (c.interval || 0) >= 7)
    const nextDue = cards
      .filter((c) => !isDue(c, today))
      .map((c) => c.dueDate.slice(0, 10))
      .sort()[0]
    return { due: due.length, fresh: fresh.length, learned: learned.length, nextDue }
  }, [cards, today])

  const startStudy = (which: 'due' | 'all') => {
    const pool = which === 'due' ? cards.filter((c) => isDue(c, today)) : [...cards]
    if (!pool.length) return
    // Shuffle so the order is not always the creation order.
    const shuffled = pool
      .map((c) => ({ c, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.c)
    setStudySet(shuffled)
    setMode('study')
  }

  const updateCard = (card: TopicFlashcard) => onChange(cards.map((c) => (c.id === card.id ? card : c)))
  const addCard = (front: string, back: string) =>
    onChange([...cards, { id: uuidv4(), front, back, easeFactor: 2.5, interval: 0, dueDate: today }])
  const deleteCard = (id: string) => {
    if (!confirm('Delete this flashcard?')) return
    onChange(cards.filter((c) => c.id !== id))
  }

  if (mode === 'study') {
    return <StudySession cards={studySet} onReview={updateCard} onExit={() => setMode('overview')} />
  }

  const filtered = cards.filter((c) => !search.trim() || `${c.front} ${c.back}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Cards" value={cards.length} />
        <Stat label="Due today" value={stats.due} tone={stats.due ? 'text-amber-500' : ''} />
        <Stat label="New" value={stats.fresh} tone="text-ig-blue" />
        <Stat label="Learned" value={stats.learned} tone="text-emerald-500" hint="interval ≥ 7 days" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" disabled={!stats.due} onClick={() => startStudy('due')}>
          {stats.due ? `Study ${stats.due} due card${stats.due === 1 ? '' : 's'}` : 'Nothing due today'}
        </button>
        <button type="button" className="btn btn-ghost" disabled={!cards.length} onClick={() => startStudy('all')}>
          Practice all
        </button>
        <button type="button" className={`btn btn-ghost ${mode === 'manage' ? 'border-primary text-primary' : ''}`} disabled={!cards.length} onClick={() => setMode(mode === 'manage' ? 'overview' : 'manage')}>
          {mode === 'manage' ? 'Done' : 'Manage cards'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Hide form' : '+ Add card'}
        </button>
        {onGenerate && (
          <button type="button" className="btn btn-ghost" disabled={generating} onClick={onGenerate}>
            {generating ? 'Generating…' : `✨ ${generateLabel}`}
          </button>
        )}
        {!stats.due && stats.nextDue && <span className="text-xs text-muted-foreground">Next review on {stats.nextDue}</span>}
      </div>

      {adding && (
        <div className="surface rounded-xl border border-dashed border-border p-4">
          <CardForm onSave={(f, b) => addCard(f, b)} submitLabel="+ Add flashcard" />
          <p className="text-xs text-muted-foreground mt-2">Tip: keep one fact per card. Use backticks for code, e.g. `left += 1`.</p>
        </div>
      )}

      {cards.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4">
          No flashcards yet. Add one, or generate a starter deck for this topic.
        </p>
      )}

      {mode === 'manage' && cards.length > 0 && (
        <div className="space-y-3">
          <input className="input-field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cards…" aria-label="Search flashcards" />
          <ul className="space-y-2">
            {filtered.map((card) => {
              const due = dueLabel(card, today)
              return (
                <li key={card.id} className="surface rounded-xl border border-border p-4">
                  {editingId === card.id ? (
                    <CardForm
                      initial={card}
                      submitLabel="Save card"
                      onCancel={() => setEditingId(null)}
                      onSave={(front, back) => {
                        updateCard({ ...card, front, back })
                        setEditingId(null)
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start">
                      <Md text={card.front} className="text-sm" />
                      <Md text={card.back} className="text-sm text-muted-foreground" />
                      <div className="flex md:flex-col items-end gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${due.tone}`}>{due.text}</span>
                        <div className="flex gap-1">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(card.id)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm text-destructive" onClick={() => deleteCard(card.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
            {!filtered.length && <li className="text-sm text-muted-foreground">No cards match “{search}”.</li>}
          </ul>
        </div>
      )}

      {mode === 'overview' && cards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cards.slice(0, 12).map((card) => {
            const due = dueLabel(card, today)
            return (
              <span key={card.id} className="max-w-full inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
                <span className="truncate max-w-[16rem]">{card.front.replace(/`/g, '')}</span>
                <span className={`shrink-0 font-semibold px-1.5 py-0.5 rounded-full ${due.tone}`}>{due.text}</span>
              </span>
            )
          })}
          {cards.length > 12 && <span className="text-xs text-muted-foreground self-center">+{cards.length - 12} more in Manage</span>}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone = '', hint }: { label: string; value: number; tone?: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-[hsl(var(--card))] p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold leading-tight ${tone || 'text-foreground'}`}>{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
