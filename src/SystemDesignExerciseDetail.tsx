import { useState, useEffect, useMemo, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type {
  SystemDesignExercise,
  SystemDesignAttemptSummary,
  SystemDesignAttemptDetail,
  SystemDesignAiReview
} from './types'
import {
  getSystemDesignAttemptDetails,
  HISTORY_IMPORTED_EVENT,
  saveSystemDesignAttemptDetail,
  deleteSystemDesignAttemptDetail
} from './db'
import { useLearningDraft } from './lib/useLearningDraft'
import MermaidEditor from './components/MermaidEditor'
import AITutor from './components/AITutor'
import SystemDesignLearningGuide from './components/SystemDesignLearningGuide'
import { systemDesignGuides } from './data/systemDesignGuides'
import {
  getExerciseScaffold,
  systemDesignReferenceBlueprints,
  evaluateSystemDesign
} from './data/systemDesignBlueprints'

interface SystemDesignExerciseDetailProps {
  exercise: SystemDesignExercise
  onBack: () => void
  backLabel?: string
  onToast?: (message: string) => void
  onSaveAttempt: (summary: SystemDesignAttemptSummary, newStatus: 'Unattempted' | 'Attempted' | 'Solved') => void
}

type StudioTab = 'canvas' | 'brief' | 'blueprint' | 'review' | 'history'

export default function SystemDesignExerciseDetail({
  exercise,
  onBack,
  backLabel = 'Back to exercises',
  onToast,
  onSaveAttempt
}: SystemDesignExerciseDetailProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('canvas')
  const [attempts, setAttempts] = useState<SystemDesignAttemptDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutor, setShowTutor] = useState(false)
  const [tutorContext, setTutorContext] = useState<string>('')

  // Draft state (persisted across reloads)
  const [requirements, setRequirements] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:requirements`,
    ''
  )
  const [architectureDiagram, setArchitectureDiagram] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:architectureDiagram`,
    exercise.type === 'HLD'
      ? 'graph TD;\n  Client-->LB[Load Balancer];\n  LB-->APIGW[API Gateway];\n  APIGW-->ServiceA[Core Service];\n  ServiceA-->DB[(Database)];'
      : 'classDiagram\n  Client --> Controller\n  Controller --> Service\n  Service --> Repository'
  )
  const [dataModel, setDataModel] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:dataModel`,
    ''
  )
  const [apiDesign, setApiDesign] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:apiDesign`,
    ''
  )
  const [bottlenecks, setBottlenecks] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:bottlenecks`,
    ''
  )
  const [code, setCode] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:code`,
    ''
  )
  const [notes, setNotes] = useLearningDraft(
    `SystemDesignExerciseDetail:${exercise.id}:notes`,
    ''
  )
  const [outcome, setOutcome] = useLearningDraft<'Solved' | 'Failed' | 'Needs Review'>(
    `SystemDesignExerciseDetail:${exercise.id}:outcome`,
    'Needs Review'
  )
  const [confidence, setConfidence] = useLearningDraft<1 | 2 | 3 | 4 | 5>(
    `SystemDesignExerciseDetail:${exercise.id}:confidence`,
    3
  )

  // AI Review State
  const [aiReview, setAiReview] = useState<SystemDesignAiReview | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Mock Interview Stopwatch (45 mins target)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Interview phase based on elapsed minutes
  const currentInterviewPhase = useMemo(() => {
    const mins = timerSeconds / 60
    if (mins < 5) return { stage: 'Phase 1', name: 'Scope & Capacity Math', target: '5m' }
    if (mins < 20) return { stage: 'Phase 2', name: 'High-Level Architecture', target: '15m' }
    if (mins < 35) return { stage: 'Phase 3', name: 'Data Model & APIs', target: '15m' }
    return { stage: 'Phase 4', name: 'Scale, Bottlenecks & Review', target: '10m' }
  }, [timerSeconds])

  // Load past attempts
  useEffect(() => {
    let cancelled = false
    const load = () =>
      getSystemDesignAttemptDetails(exercise.id).then(loaded => {
        if (cancelled) return
        setAttempts(loaded)
        setLoading(false)
        // If the latest attempt had an AI review, hydrate it
        const latestReview = loaded.find(a => a.aiReview)?.aiReview
        if (latestReview) setAiReview(latestReview)
      })
    void load()
    window.addEventListener(HISTORY_IMPORTED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(HISTORY_IMPORTED_EVENT, load)
    }
  }, [exercise.id])

  const guide = systemDesignGuides[exercise.id]
  const referenceBlueprint = systemDesignReferenceBlueprints[exercise.id]

  // Check if current draft has any written content
  const hasContent = Boolean(
    requirements.trim() ||
      dataModel.trim() ||
      apiDesign.trim() ||
      bottlenecks.trim() ||
      code.trim()
  )

  // 1-Click Load Interview Starter Scaffold
  const handleLoadScaffold = () => {
    if (
      hasContent &&
      !window.confirm(
        'Loading the interview scaffold will replace your current draft in the editor. Proceed?'
      )
    ) {
      return
    }

    const scaffold = getExerciseScaffold(exercise.id, exercise.title, exercise.type)
    setRequirements(scaffold.requirements)
    setArchitectureDiagram(scaffold.architectureDiagram)
    setDataModel(scaffold.dataModel)
    setApiDesign(scaffold.apiDesign)
    setBottlenecks(scaffold.bottlenecks)
    if (scaffold.code) setCode(scaffold.code)

    onToast?.('✨ Loaded interview scaffold & architecture template')
    setActiveTab('canvas')
  }

  // Reset Canvas to blank or reload scaffold
  const handleResetCanvas = (mode: 'blank' | 'scaffold' = 'blank') => {
    if (mode === 'blank') {
      if (
        hasContent &&
        !window.confirm('Clear all fields in your design canvas and start fresh from a blank canvas?')
      ) {
        return
      }
      setRequirements('')
      setArchitectureDiagram(
        exercise.type === 'HLD'
          ? 'graph TD;\n  Client-->LB[Load Balancer];\n  LB-->APIGW[API Gateway];\n  APIGW-->ServiceA[Core Service];\n  ServiceA-->DB[(Database)];'
          : 'classDiagram\n  Client --> Controller\n  Controller --> Service\n  Service --> Repository'
      )
      setDataModel('')
      setApiDesign('')
      setBottlenecks('')
      setCode('')
      setNotes('')
      setAiReview(null)
      onToast?.('Cleared canvas back to blank')
    } else {
      handleLoadScaffold()
    }
  }

  // Delete an attempt from history
  const handleDeleteAttempt = async (attemptId: string) => {
    if (!window.confirm('Delete this attempt from your local history?')) return
    await deleteSystemDesignAttemptDetail(exercise.id, attemptId)
    setAttempts(prev => prev.filter(a => a.id !== attemptId))
    onToast?.('Attempt deleted from history')
  }

  // 1-Click Append Mermaid Component Snippet
  const appendMermaidComponent = (snippet: string) => {
    setArchitectureDiagram(prev => {
      const trimmed = prev.trim()
      if (trimmed.includes(snippet.trim())) return prev
      return `${trimmed}\n  ${snippet}`
    })
    onToast?.('Added component to diagram')
  }

  // Run AI Design Review
  const handleRunAiReview = async () => {
    setActiveTab('review')

    if (!hasContent) {
      onToast?.('Please write your design or load the scaffold first.')
      return
    }

    setIsEvaluating(true)
    try {
      const review = await evaluateSystemDesign({
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        exerciseType: exercise.type,
        requirements,
        architectureDiagram,
        dataModel,
        apiDesign,
        bottlenecks,
        code
      })

      setAiReview(review)
      if (review.overallScore >= 80) {
        setOutcome('Solved')
      } else {
        setOutcome('Needs Review')
      }
      onToast?.(`AI Review Complete: Score ${review.overallScore}/100 (${review.levelRating})`)
    } catch {
      onToast?.('Review generation encountered an issue; showing rubric check.')
    } finally {
      setIsEvaluating(false)
    }
  }

  // Save attempt locally and report summary
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newDetail: SystemDesignAttemptDetail = {
      id: uuidv4(),
      exerciseId: exercise.id,
      date: new Date().toISOString(),
      requirements,
      architectureDiagram,
      dataModel,
      apiDesign,
      bottlenecks,
      code,
      notes,
      timeSpentMinutes: Math.max(1, Math.round(timerSeconds / 60)),
      aiReview: aiReview ?? undefined
    }

    await saveSystemDesignAttemptDetail(newDetail)

    const summary: SystemDesignAttemptSummary = {
      id: newDetail.id,
      exerciseId: newDetail.exerciseId,
      date: newDetail.date ?? new Date().toISOString(),
      outcome,
      confidence,
      timeSpentMinutes: newDetail.timeSpentMinutes,
      aiScore: aiReview?.overallScore
    }

    const newStatus = outcome === 'Solved' ? 'Solved' : 'Attempted'
    onSaveAttempt(summary, newStatus)

    setAttempts(prev => [newDetail, ...prev])
    onToast?.('Design attempt saved to local history!')
  }

  // Restore past attempt into active draft
  const handleRestoreAttempt = (att: SystemDesignAttemptDetail) => {
    if (
      hasContent &&
      !window.confirm('Restore this attempt? Your current draft will be overwritten.')
    ) {
      return
    }
    if (att.requirements) setRequirements(att.requirements)
    if (att.architectureDiagram) setArchitectureDiagram(att.architectureDiagram)
    if (att.dataModel) setDataModel(att.dataModel)
    if (att.apiDesign) setApiDesign(att.apiDesign)
    if (att.bottlenecks) setBottlenecks(att.bottlenecks)
    if (att.code) setCode(att.code)
    if (att.notes) setNotes(att.notes)
    if (att.aiReview) setAiReview(att.aiReview)
    setActiveTab('canvas')
    onToast?.('Restored design from history into workspace')
  }

  // Open AI Tutor with specific context
  const handleAskTutor = (topicContext?: string) => {
    const fullContext = `${exercise.type} System Design: ${exercise.title}\nBrief: ${guide?.brief ?? exercise.title}\n${topicContext ? `Review Focus: ${topicContext}\n` : ''}\nLearner Requirements:\n${requirements}\nMermaid:\n${architectureDiagram}\nData Model:\n${dataModel}\nAPIs:\n${apiDesign}\nBottlenecks:\n${bottlenecks}`
    setTutorContext(fullContext)
    setShowTutor(true)
  }

  return (
    <div className="animate-rise flex flex-col gap-6 max-w-6xl mx-auto w-full transition-[padding] duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 surface p-5 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              ← {backLabel}
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {exercise.title}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${
                exercise.type === 'HLD'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
              }`}
            >
              {exercise.type}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded border border-border text-muted-foreground">
              {exercise.difficulty}
            </span>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadScaffold}
              className="btn btn-ghost text-xs sm:text-sm text-primary hover:bg-primary/10 border border-primary/20 flex items-center gap-1.5"
              title="Pre-populate structured headings, capacity math, and diagrams"
            >
              <span>✨</span> Load Interview Scaffold
            </button>
            <button
              type="button"
              onClick={() => handleResetCanvas('blank')}
              className="btn btn-ghost text-xs sm:text-sm text-muted-foreground hover:text-foreground border border-border flex items-center gap-1.5"
              title="Reset all design fields back to a blank canvas"
            >
              <span>🔄</span> Reset Canvas
            </button>
            {referenceBlueprint && (
              <button
                type="button"
                onClick={() => setActiveTab('blueprint')}
                className="btn btn-ghost text-xs sm:text-sm border border-border text-foreground flex items-center gap-1.5"
              >
                <span>🌟</span> FAANG Blueprint
              </button>
            )}
            <button
              type="button"
              onClick={handleRunAiReview}
              className="btn btn-primary text-xs sm:text-sm flex items-center gap-1.5 font-medium shadow-sm"
            >
              <span>🤖</span> {isEvaluating ? 'Reviewing...' : 'Run AI Review'}
            </button>
          </div>
        </div>

        {/* Practice Interview Stopwatch Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground bg-surface px-2.5 py-1 rounded-md border border-border">
              <span>⏱️</span>
              <span>{formatTimer(timerSeconds)}</span>
              <span className="text-xs text-muted-foreground">/ 45:00</span>
            </div>
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className={`btn text-xs px-2.5 py-1 ${
                timerRunning
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {timerRunning ? '⏸ Pause' : '▶ Start Timer'}
            </button>
            {timerSeconds > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false)
                  setTimerSeconds(0)
                }}
                className="btn btn-ghost text-xs px-2 py-1 text-muted-foreground"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Interview Benchmark:</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              {currentInterviewPhase.stage}: {currentInterviewPhase.name} (~{currentInterviewPhase.target})
            </span>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border/60 pt-2 -mb-2">
          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'canvas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>🏗️</span> Design Canvas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'brief'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>📋</span> Problem Brief & Guide
          </button>
          {referenceBlueprint && (
            <button
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'blueprint'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🌟</span> FAANG Blueprint
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'review'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>🤖</span> AI Review & Scorecard
            {aiReview && (
              <span className="ml-1 px-1.5 py-0.2 text-xs rounded-full bg-primary/20 text-primary font-bold">
                {aiReview.overallScore}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>📜</span> Attempts ({attempts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: DESIGN CANVAS (The Interactive Step-by-Step Workspace) */}
      {activeTab === 'canvas' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Step 1: Scope & Assumptions */}
          <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 1 of 5</span>
                <h2 className="text-lg font-semibold text-foreground">
                  Requirements, Scope & Capacity Estimations
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequirements(prev =>
                    prev
                      ? `${prev}\n\n### Additional Calculations:\n- Peak QPS: 3x average\n- Storage: 200 bytes per record`
                      : `### 1. Functional Requirements\n- Core action 1\n- Core action 2\n\n### 2. Non-Functional Requirements\n- Availability: 99.99%\n- Latency: < 20ms p99\n\n### 3. Scale Estimations\n- Write QPS:\n- Read QPS:\n- Storage (1 yr / 5 yr):`
                  )
                }}
                className="btn btn-ghost text-xs text-muted-foreground hover:text-foreground"
              >
                + Insert Math Scaffold
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Define functional user workflows, non-functional SLAs (availability, latency, durability),
              and concrete back-of-the-envelope calculations (QPS, storage, bandwidth).
            </p>
            <textarea
              id="design-requirements"
              className="input-field min-h-[140px] font-mono text-sm leading-relaxed"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="### 1. Functional Requirements&#10;- Shorten long URL to unique 7-char code&#10;- 302 Redirect to destination URL&#10;&#10;### 2. Non-Functional Requirements&#10;- 99.99% availability on redirect path&#10;- < 15ms p99 redirect latency&#10;&#10;### 3. Scale Calculations&#10;- 100M new URLs/month = ~40 writes/sec (Peak: 120 writes/sec)&#10;- 100:1 read ratio = 4,000 reads/sec (Peak: 12,000 reads/sec)"
              required
            />
          </section>

          {/* Step 2: System Architecture Diagram */}
          <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 2 of 5</span>
                <h2 className="text-lg font-semibold text-foreground">
                  {exercise.type === 'HLD'
                    ? 'High-Level Architecture & Request Flow'
                    : 'Class Diagram & Object Relationships'}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => appendMermaidComponent('APIGW-->LB[Load Balancer];')}
                  className="px-2 py-0.5 text-xs rounded bg-muted/60 hover:bg-muted text-foreground border border-border"
                >
                  + Load Balancer
                </button>
                <button
                  type="button"
                  onClick={() => appendMermaidComponent('Service-->Redis[(Redis Cache)];')}
                  className="px-2 py-0.5 text-xs rounded bg-muted/60 hover:bg-muted text-foreground border border-border"
                >
                  + Redis Cache
                </button>
                <button
                  type="button"
                  onClick={() => appendMermaidComponent('Service-->DB[(Primary PostgreSQL DB)];')}
                  className="px-2 py-0.5 text-xs rounded bg-muted/60 hover:bg-muted text-foreground border border-border"
                >
                  + Primary DB
                </button>
                <button
                  type="button"
                  onClick={() => appendMermaidComponent('Service-->Kafka[Kafka Queue];')}
                  className="px-2 py-0.5 text-xs rounded bg-muted/60 hover:bg-muted text-foreground border border-border"
                >
                  + Kafka Queue
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Write your Mermaid diagram code below. The visual architecture renders live automatically.
            </p>
            <MermaidEditor value={architectureDiagram} onChange={setArchitectureDiagram} />
          </section>

          {/* Step 3: Data Model & Schema */}
          <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
            <div className="border-b border-border/50 pb-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 3 of 5</span>
              <h2 className="text-lg font-semibold text-foreground">
                {exercise.type === 'HLD' ? 'Data Model & DB Strategy' : 'Classes, Invariants & Responsibilities'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {exercise.type === 'HLD'
                ? 'Specify database choice (SQL vs NoSQL), table definitions, primary keys, foreign keys, and indexes for your primary query access patterns.'
                : 'Define each class, member fields, public methods, and state invariants that must always hold.'}
            </p>
            <textarea
              id="design-data-model"
              className="input-field min-h-[120px] font-mono text-sm leading-relaxed"
              value={dataModel}
              onChange={e => setDataModel(e.target.value)}
              placeholder={
                exercise.type === 'HLD'
                  ? 'TABLE urls (&#10;  id BIGINT PRIMARY KEY,&#10;  short_key VARCHAR(10) UNIQUE NOT NULL,&#10;  original_url TEXT NOT NULL,&#10;  created_at TIMESTAMPTZ DEFAULT NOW(),&#10;  expires_at TIMESTAMPTZ NULL&#10;);&#10;CREATE UNIQUE INDEX idx_urls_short_key ON urls(short_key);'
                  : 'class ParkingLot {\n  - id: UUID\n  - spots: Map<SpotType, List<ParkingSpot>>\n  + parkVehicle(Vehicle v): Ticket\n  + releaseSpot(Ticket t): Receipt\n}'
              }
            />
          </section>

          {/* Step 4: API Design & Interface Contracts */}
          <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
            <div className="border-b border-border/50 pb-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 4 of 5</span>
              <h2 className="text-lg font-semibold text-foreground">
                {exercise.type === 'HLD' ? 'API Design & Contracts' : 'Interface Contracts & Public Methods'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {exercise.type === 'HLD'
                ? 'Document HTTP verbs, endpoint paths, request payloads, response schemas, status codes (200, 201, 302, 400, 404, 429), and idempotency.'
                : 'Document method signatures, inputs, outputs, preconditions, and exception handling.'}
            </p>
            <textarea
              id="design-api"
              className="input-field min-h-[120px] font-mono text-sm leading-relaxed"
              value={apiDesign}
              onChange={e => setApiDesign(e.target.value)}
              placeholder={
                exercise.type === 'HLD'
                  ? 'POST /api/v1/urls&#10;Request: { "originalUrl": "https://example.com", "customAlias": "deal" }&#10;Response 201 Created: { "shortUrl": "https://sho.rt/deal", "expiresAt": "2026-10-25T00:00:00Z" }&#10;&#10;GET /{shortKey}&#10;Response 302 Found (Header: Location: https://example.com)&#10;Error: 404 Not Found'
                  : 'interface IParkingStrategy {\n  ParkingSpot findSpot(VehicleType type, List<ParkingSpot> availableSpots);\n}'
              }
            />
          </section>

          {/* Step 5: Bottlenecks, Scaling & Trade-offs */}
          <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
            <div className="border-b border-border/50 pb-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 5 of 5</span>
              <h2 className="text-lg font-semibold text-foreground">
                {exercise.type === 'HLD'
                  ? 'Scale, Bottlenecks & Architectural Trade-offs'
                  : 'Design Patterns & Concurrency Test Cases'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {exercise.type === 'HLD'
                ? 'Identify Single Points of Failure (SPOF), caching strategy (eviction, invalidation), database sharding/partitioning, rate limiting, and core trade-offs.'
                : 'Explain pattern choices (Strategy, Factory, State), thread-safety under concurrency, and failure test cases.'}
            </p>
            <textarea
              id="design-tradeoffs"
              className="input-field min-h-[120px] font-mono text-sm leading-relaxed"
              value={bottlenecks}
              onChange={e => setBottlenecks(e.target.value)}
              placeholder={
                exercise.type === 'HLD'
                  ? '1. 301 vs 302: 302 selected so our server can log every click for analytics.&#10;2. Cache Eviction: Redis LRU cache storing top 20% URLs (serves 80% read traffic).&#10;3. Hash Collisions: Use Key Generation Service (KGS) with pre-generated Base62 keys to prevent DB collision checks.&#10;4. Sharding: Shard database horizontally by Hash(short_key) % N shards.'
                  : 'Concurrency: Protect ticket allocation with ReentrantLock or AtomicInteger to prevent double booking of the last spot.'
              }
            />
          </section>

          {/* Optional LLD Implementation Code */}
          {exercise.type === 'LLD' && (
            <section className="surface rounded-2xl p-6 border border-border flex flex-col gap-3">
              <div className="border-b border-border/50 pb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">LLD Code</span>
                <h2 className="text-lg font-semibold text-foreground">Implementation Classes & Pseudocode</h2>
              </div>
              <textarea
                id="design-code"
                className="input-field font-mono text-sm min-h-[200px]"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="// Write your clean class implementations here..."
              />
            </section>
          )}

          {/* Final Submission Card */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground">Complete & Log Design Attempt</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="design-outcome" className="text-sm font-medium text-foreground">
                  Outcome
                </label>
                <select
                  id="design-outcome"
                  className="input-field"
                  value={outcome}
                  onChange={e => setOutcome(e.target.value as typeof outcome)}
                >
                  <option value="Solved">Solved (Complete & Confident)</option>
                  <option value="Needs Review">Needs Review (In Progress)</option>
                  <option value="Failed">Struggled (Incomplete)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="design-confidence" className="text-sm font-medium text-foreground">
                  Confidence Rating (1-5)
                </label>
                <select
                  id="design-confidence"
                  className="input-field"
                  value={confidence.toString()}
                  onChange={e => setConfidence(parseInt(e.target.value, 10) as typeof confidence)}
                >
                  <option value="1">1 - Just starting</option>
                  <option value="2">2 - Struggled</option>
                  <option value="3">3 - Okay (Moderate)</option>
                  <option value="4">4 - Good (Strong L5)</option>
                  <option value="5">5 - Mastered (Staff L6)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="design-notes" className="text-sm font-medium text-foreground">
                Learner Reflection / Interview Notes
              </label>
              <textarea
                id="design-notes"
                className="input-field min-h-[70px] text-sm"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What did you learn? Which questions would you ask the interviewer in a real session?"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
              <button
                type="button"
                onClick={handleRunAiReview}
                className="btn btn-ghost border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-2"
              >
                <span>🤖</span> Run AI Rubric Review
              </button>

              <button type="submit" className="btn btn-primary px-6 py-2.5 font-semibold text-sm">
                💾 Save Attempt to History
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PROBLEM BRIEF & INTERVIEW GUIDE */}
      {activeTab === 'brief' && (
        <div className="flex flex-col gap-6">
          <SystemDesignLearningGuide key={exercise.id} exercise={exercise} />

          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground">Ready to start designing?</h3>
            <p className="text-sm text-muted-foreground">
              You can populate the design canvas with an interview scaffold tailored for this exercise, or
              review the FAANG reference blueprint.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLoadScaffold}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <span>✨</span> Load Interview Scaffold into Canvas
              </button>
              {referenceBlueprint && (
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className="btn btn-ghost border border-border text-sm flex items-center gap-2"
                >
                  <span>🌟</span> View FAANG Reference Blueprint
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAANG REFERENCE BLUEPRINT */}
      {activeTab === 'blueprint' && referenceBlueprint && (
        <div className="flex flex-col gap-6">
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Gold Standard Solution
                </span>
                <h2 className="text-xl font-bold text-foreground">{referenceBlueprint.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Copy this reference architecture into your canvas? Existing canvas content will be replaced.'
                    )
                  ) {
                    setArchitectureDiagram(referenceBlueprint.architectureDiagram)
                    setDataModel(referenceBlueprint.dataModel)
                    setApiDesign(referenceBlueprint.apiDesign)
                    setBottlenecks(referenceBlueprint.bottlenecksAndTradeoffs)
                    setActiveTab('canvas')
                    onToast?.('Copied reference architecture to canvas')
                  }
                }}
                className="btn btn-ghost border border-primary/20 text-primary text-xs hover:bg-primary/10"
              >
                📥 Copy Blueprint to Canvas
              </button>
            </div>

            {/* Scale Assumptions */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Capacity & Scale Targets</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {referenceBlueprint.scaleAssumptions.map(scale => (
                  <li key={scale}>{scale}</li>
                ))}
              </ul>
            </div>

            {/* Architecture Diagram */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Reference Architecture Diagram</h3>
              <div className="bg-muted/30 p-3 rounded-xl border border-border overflow-auto">
                <MermaidEditor value={referenceBlueprint.architectureDiagram} readOnly />
              </div>
            </div>

            {/* Data Model */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Database Schema & Indexes</h3>
              <pre className="p-4 rounded-xl bg-muted/40 font-mono text-xs text-foreground overflow-auto border border-border whitespace-pre-wrap">
                {referenceBlueprint.dataModel}
              </pre>
            </div>

            {/* API Design */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">API Contracts</h3>
              <pre className="p-4 rounded-xl bg-muted/40 font-mono text-xs text-foreground overflow-auto border border-border whitespace-pre-wrap">
                {referenceBlueprint.apiDesign}
              </pre>
            </div>

            {/* Trade-offs */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Architectural Trade-offs</h3>
              <div className="p-4 rounded-xl bg-muted/40 text-sm text-muted-foreground border border-border whitespace-pre-wrap">
                {referenceBlueprint.bottlenecksAndTradeoffs}
              </div>
            </div>

            {/* Deep Dive Notes */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Senior/Staff Interview Talking Points</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                {referenceBlueprint.deepDiveNotes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI DESIGN REVIEW & RUBRIC */}
      {activeTab === 'review' && (
        <div className="flex flex-col gap-6">
          {/* Header Action Card */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>🤖</span> AI Architectural Reviewer
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evaluates your current design draft against Google/Meta Senior (L5) System Design Rubrics.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAiReview}
                disabled={isEvaluating}
                className="btn btn-primary text-sm flex items-center gap-2 px-5 py-2"
              >
                <span>🚀</span> {isEvaluating ? 'Evaluating Design...' : 'Run New AI Review'}
              </button>
            </div>

            {!hasContent && !aiReview && (
              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <span>⚠️</span> Canvas is Currently Blank
                </div>
                <p className="text-xs text-muted-foreground">
                  The AI reviewer requires content to evaluate your architecture, data model, and trade-offs.
                  Load the starter scaffold or begin typing in the Design Canvas to get a comprehensive review.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleLoadScaffold}
                    className="btn btn-primary text-xs"
                  >
                    ✨ Load Interview Scaffold First
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Scorecard & Rubric Results */}
          {aiReview && (
            <div className="flex flex-col gap-6">
              {/* Overall Score Banner */}
              <div className="surface p-6 rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-bold border ${
                      aiReview.overallScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : aiReview.overallScore >= 65
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <span className="text-2xl leading-none">{aiReview.overallScore}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">/ 100</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{aiReview.levelRating}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          aiReview.verdict === 'Pass'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {aiReview.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                      {aiReview.executiveSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskTutor(aiReview.executiveSummary)}
                  className="btn btn-ghost text-xs border border-primary/20 text-primary hover:bg-primary/10 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>💬</span> Discuss with AI Tutor
                </button>
              </div>

              {/* 5-Category Rubric Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiReview.categories.map(cat => (
                  <div
                    key={cat.id}
                    className="surface p-4 rounded-xl border border-border flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{cat.name}</span>
                      <span
                        className={
                          cat.score >= 16
                            ? 'text-emerald-400'
                            : cat.score >= 12
                            ? 'text-indigo-400'
                            : 'text-amber-400'
                        }
                      >
                        {cat.score} / {cat.maxScore} pts
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.score >= 16
                            ? 'bg-emerald-500'
                            : cat.score >= 12
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Critical Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span>✅</span> Architectural Strengths
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
                    {aiReview.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                    <span>⚠️</span> Areas for Improvement / Missing Gaps
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
                    {aiReview.criticalGaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <span>💡</span> Recommended Next Revisions (To Reach Staff Level)
                </h3>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
                  {aiReview.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ATTEMPT HISTORY */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-foreground">Attempt History</h2>
            <span className="text-xs text-muted-foreground">{attempts.length} attempts logged</span>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground p-4">Loading attempts...</div>
          ) : attempts.length === 0 ? (
            <div className="surface p-8 rounded-2xl border border-border text-center flex flex-col items-center gap-2">
              <div className="text-4xl opacity-50">🏗️</div>
              <p className="text-sm text-foreground font-semibold">No attempts logged yet</p>
              <p className="text-xs text-muted-foreground">
                Your designs and AI review history are securely stored in your local browser profile.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('canvas')}
                className="btn btn-primary text-xs mt-2"
              >
                Go to Design Canvas
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {attempts.map((att, idx) => (
                <div
                  key={att.id}
                  className="surface p-5 rounded-2xl border border-border flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Attempt #{attempts.length - idx}
                      </span>
                      {att.date && (
                        <span className="text-xs text-muted-foreground">
                          · {new Date(att.date).toLocaleDateString()} at {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {att.timeSpentMinutes && (
                        <span className="text-xs text-muted-foreground">
                          · {att.timeSpentMinutes} mins
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {att.aiReview && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                          AI: {att.aiReview.overallScore}/100
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRestoreAttempt(att)}
                        className="btn btn-ghost text-xs text-primary hover:bg-primary/10 border border-primary/20 flex items-center gap-1"
                      >
                        Restore Design →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttempt(att.id)}
                        className="btn btn-ghost text-xs text-destructive hover:bg-destructive/10 border border-destructive/20 flex items-center gap-1 px-2"
                        title="Delete attempt from history"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {att.requirements && (
                    <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg">
                      <span className="font-semibold block mb-1">Requirements:</span>
                      <p className="line-clamp-2 text-muted-foreground whitespace-pre-wrap">
                        {att.requirements}
                      </p>
                    </div>
                  )}

                  {att.architectureDiagram && (
                    <div className="text-xs bg-muted/40 p-2.5 rounded-lg max-h-[160px] overflow-auto">
                      <MermaidEditor value={att.architectureDiagram} readOnly />
                    </div>
                  )}

                  {att.notes && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Notes:</span> {att.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating AI Tutor Panel */}
      {showTutor && (
        <AITutor
          contextTitle={exercise.title}
          contextBody={
            tutorContext ||
            `${exercise.type} practice brief: ${guide?.brief ?? exercise.title}\nRequirements:\n${requirements}\nDiagram:\n${architectureDiagram}\nData Model:\n${dataModel}\nAPIs:\n${apiDesign}\nBottlenecks:\n${bottlenecks}`
          }
          mode="system-design"
          onClose={() => setShowTutor(false)}
        />
      )}
    </div>
  )
}
