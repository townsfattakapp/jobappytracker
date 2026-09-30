'use client'

import type { LearnerJob } from '../../lib/jobs/client'
import type { ResumeMetaDto } from '../../lib/resume/client'

interface JobPrepWarRoomPreviewProps {
  job: LearnerJob
  signedIn: boolean
  onUpgrade?: () => void
  onSignIn?: () => void
  onOpenResumes?: () => void
  resumes?: ResumeMetaDto[] | null
}

export default function JobPrepWarRoomPreview({
  job,
  signedIn,
  onUpgrade,
  onSignIn,
}: JobPrepWarRoomPreviewProps) {
  const reqSkills = job.requiredSkills.length > 0 ? job.requiredSkills.slice(0, 4) : ['Core Fundamentals', 'Clean Code', 'Problem Solving']
  const prefSkills = job.preferredSkills.length > 0 ? job.preferredSkills.slice(0, 3) : ['System Architecture', 'Performance Tuning']

  return (
    <div className="mt-4 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-5 sm:p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              🎯 Job Preparation War Room
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              Prepare for {job.title} at {job.company.name}
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Turn this job opening into a personalized 7-day tactical interview plan. Scan your resume for fatal ATS red flags, practice company-specific predicted questions, and polish answers with instant AI feedback.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs text-muted-foreground">Pass starts at</span>
            <span className="text-2xl font-extrabold text-foreground">₹299 <span className="text-xs font-normal text-muted-foreground">/ 90 days</span></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {signedIn ? (
            <button
              type="button"
              className="btn btn-primary font-bold px-6 py-2.5 shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all text-sm"
              onClick={onUpgrade}
            >
              Unlock Complete War Room · ₹299
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary font-bold px-6 py-2.5 shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all text-sm"
              onClick={onSignIn}
            >
              Sign In to Unlock War Room
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            ⚡ One-time payment via Razorpay · Instant AI access included · No API key needed
          </span>
        </div>
      </div>

      {/* Grid: ATS Diagnostic & Resume Surgery */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Card 1: ATS Diagnostic Preview */}
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h4 className="font-semibold text-foreground text-sm">ATS Vulnerability Scan</h4>
              <p className="text-xs text-muted-foreground">How applicant tracking systems filter for this role</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                High Rejection Risk
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
              <span className="text-rose-500 font-bold shrink-0">⚠️</span>
              <div>
                <strong className="text-foreground">Missing Core Evidence:</strong>
                <p className="text-muted-foreground mt-0.5">
                  The listing requires verified skill in <span className="text-foreground font-semibold">{reqSkills.join(', ')}</span>. Resumes without quantified project bullets for these get filtered out before human review.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <span className="text-amber-500 font-bold shrink-0">⚠️</span>
              <div>
                <strong className="text-foreground">Low Keyword Density:</strong>
                <p className="text-muted-foreground mt-0.5">
                  Important secondary requirements (<span className="text-foreground font-semibold">{prefSkills.join(', ')}</span>) must appear in project descriptions, not just a standalone &ldquo;Skills&rdquo; list.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-primary font-bold shrink-0">💡</span>
              <div>
                <strong className="text-foreground">Prep Pro Solution:</strong>
                <p className="text-muted-foreground mt-0.5">
                  Runs line-by-line ATS verification against your actual resume and cites exact missing evidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Resume Surgery Preview */}
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
          <div className="border-b border-border/40 pb-3">
            <h4 className="font-semibold text-foreground text-sm">Resume Bullet Surgery</h4>
            <p className="text-xs text-muted-foreground">Transform weak academic lines into senior STAR bullets</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">❌ Before (Generic / College style)</span>
              <p className="text-muted-foreground mt-1 font-mono text-[11px] leading-relaxed">
                &ldquo;Built backend REST APIs in Java and Spring Boot for user registration and product catalogs with MySQL database.&rdquo;
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">✓ After (STAR Production Bullet)</span>
              <p className="text-foreground mt-1 font-mono text-[11px] leading-relaxed">
                &ldquo;Architected 10+ secure microservices in Java 21 & Spring Boot; optimized PostgreSQL indexing and added Redis caching, decreasing p95 API response times by 38% under 2,500 req/sec peak load.&rdquo;
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Prep Pro provides 1-click tailored rewrites grounded in your real past projects.
            </p>
          </div>
        </div>
      </div>

      {/* Predicted Interview Questions */}
      <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
          <div>
            <h4 className="font-semibold text-foreground text-sm">Predicted Company Interview Rounds</h4>
            <p className="text-xs text-muted-foreground">Tailored for {job.company.name} · {job.title}</p>
          </div>
          <span className="text-xs text-primary font-bold">10+ Questions in Full Pack</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
            <span className="text-[11px] font-bold text-primary">Round 1: Technical & DSA</span>
            <p className="text-xs text-muted-foreground">
              Top algorithm patterns tested by {job.company.name} (Array windows, Hash collisions, Graph traversal).
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
            <span className="text-[11px] font-bold text-primary">Round 2: Systems & Design</span>
            <p className="text-xs text-muted-foreground">
              Real-world scaling prompts: cache invalidation, API rate limiting, and failure handling.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
            <span className="text-[11px] font-bold text-primary">Round 3: Resume Defense</span>
            <p className="text-xs text-muted-foreground">
              Interviewer grills you directly on the architectural decisions and trade-offs in your resume.
            </p>
          </div>
        </div>
      </div>

      {/* Offer Box */}
      <div className="p-5 rounded-2xl border-2 border-primary/40 bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-lg text-foreground">
            Get the Complete Interview Preparation Pack for ₹299
          </h4>
          <p className="text-xs text-muted-foreground max-w-xl">
            Includes full ATS Resume analysis, 15+ company predicted interview questions, voice mock interviews with retry coaching, and a 7-day tactical prep calendar. Valid for 90 days.
          </p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            className="btn btn-primary font-bold px-6 py-2.5 shadow-md"
            onClick={signedIn ? onUpgrade : onSignIn}
          >
            {signedIn ? 'Unlock Access · ₹299' : 'Sign In to Unlock'}
          </button>
        </div>
      </div>
    </div>
  )
}
