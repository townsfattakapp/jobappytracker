'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import BrandLogo, { BrandMark } from '../BrandLogo'
import { PLAN_FEATURES, PLANS } from '../../lib/billing/plan'
import PlanCards from '../PlanCards'
import CompanyLogo from '../jobs/CompanyLogo'
import { fetchHiringCompanies, type HiringCompanyDto } from '../../lib/jobs/client'
import {
  MARKETING_CAREER_PATHS,
  MARKETING_DOMAINS,
  MARKETING_STATS,
  MARKETING_TRACKS,
} from '../../data/marketingCurriculum'
import './landing.css'

const HeroScene = dynamic(() => import('../HeroScene'), { ssr: false, loading: () => null })

/** Adds `is-visible` to elements with data-reveal as they scroll into view. */
function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

function Shot({ src, alt, caption, priority = false }: { src: string; alt: string; caption?: string; priority?: boolean }) {
  return (
    <figure className="lp-shot">
      <div className="lp-shot-frame">
        <div className="lp-shot-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

const STEPS = [
  {
    n: '01',
    title: 'Tell it where you are going',
    body: 'Pick from 20 role blueprints or choose from 157 engineering tracks across 12 disciplines. Tell it how many hours a day you really have, and the curriculum engine maps out your exact daily schedule.',
    shot: { src: '/screens/goal.jpg', alt: 'Choosing learning tracks for a goal' },
  },
  {
    n: '02',
    title: 'Get a plan that fits your calendar',
    body: 'Prep lays out every topic across your available days, interleaves tracks so nothing goes stale, and books revision back in three, seven and fourteen days later. Rest days stay rest days.',
    shot: { src: '/screens/today.jpg', alt: 'Today view with the day’s tasks' },
  },
  {
    n: '03',
    title: 'Learn it, run it, remember it',
    body: 'Each topic opens a workspace: an explanation that starts from zero, worked examples you can run, diagrams, a quiz, your own notes and flashcards that come back when you are about to forget.',
    shot: { src: '/screens/workspace.jpg', alt: 'A topic workspace with the overview and AI lesson' },
  },
]

const FEATURES = [
  {
    eyebrow: 'Explanations',
    title: 'Every topic starts from zero, in the language you code in.',
    body: 'Definition, why it matters, a real-world example, a step-by-step walkthrough and code in Python, Java, TypeScript, Go, C++, Rust, Kotlin, Swift, Dart or SQL. React topics come back as TSX, DevOps as shell and YAML, and AI engineering with runnable Python.',
    shot: { src: '/screens/examples.jpg', alt: 'Worked examples with numbered steps and runnable code' },
  },
  {
    eyebrow: 'Practice',
    title: 'Run the code where you read it.',
    body: 'A code runner for six languages sits inside every problem. Try the worked example, break it on purpose, log the attempt with your approach and complexity, and keep the history on every device.',
    shot: { src: '/screens/runner.jpg', alt: 'The code runner with output' },
    flip: true,
  },
  {
    eyebrow: 'System design',
    title: 'System design the way interviews actually ask it.',
    body: 'Requirements, back-of-envelope estimates, an architecture diagram, data model, APIs, the key flow as a sequence diagram, a deep dive, trade-offs, and how to present it in forty-five minutes. Diagrams are editable, not pictures.',
    shot: { src: '/screens/hld.jpg', alt: 'A system design workspace with an architecture diagram' },
  },
  {
    eyebrow: 'Mock interviews',
    title: 'An interviewer who talks back, and a scorecard that tells the truth.',
    body: 'Pick a round, a level and a length. The interviewer speaks the questions, listens to your answers, pushes on gaps, reads the code you share and wraps up when the clock runs low. Then you get a hiring-committee scorecard: dimensions, verdict, model answers and what to revise.',
    shot: { src: '/screens/mock.jpg', alt: 'Setting up a mock interview round' },
    flip: true,
  },
  {
    eyebrow: 'Revision',
    title: 'Flashcards that come back at the right time.',
    body: 'Cards are made from what you actually studied and scheduled with spaced repetition. Today shows what is due; a session takes minutes with keyboard shortcuts.',
    shot: { src: '/screens/flashcards.jpg', alt: 'A flashcard study session' },
  },
  {
    eyebrow: 'Tutor',
    title: 'A tutor that has read your notes.',
    body: 'Ask anything about the topic you are on. For DSA it gives hints in five levels instead of the answer; for design it reviews your architecture. Drag it, resize it, keep it open while you work.',
    shot: { src: '/screens/tutor.jpg', alt: 'The AI tutor beside a topic' },
    flip: true,
  },
  {
    eyebrow: 'Job hunt',
    title: 'Applications, follow-ups and interviews, in the same tab.',
    body: 'Track every application on a board or a table, import recruiter emails, sync Gmail, and keep prep notes next to the company they are for. Your study plan and your pipeline finally share a calendar.',
    shot: { src: '/screens/dashboard.jpg', alt: 'The job tracker dashboard' },
  },
]

const FAQ = [
  {
    q: 'Can I try it before paying?',
    a: 'Yes. Create a free account and use Job Discovery (a sample of live openings), the resume workspace, the tracker and the general curriculum browser. A pass unlocks the learning workspaces, the code runner, AI features, the full ranked job feed and job-specific mock interviews.',
  },
  {
    q: 'Is paying safe, and do I get a receipt?',
    a: 'Payments are processed by Razorpay (UPI, cards, net banking); Prep never sees or stores your card or UPI details. Every purchase gets a receipt with the Razorpay payment id, emailed to you and always available under Settings → Billing.',
  },
  {
    q: 'What if something goes wrong with my purchase?',
    a: 'Duplicate charges and any failure to deliver access are refunded in full; the refund policy also has a cooling-off window for passes that were not used. Write to hello@evolw.in with the payment id from your receipt and a human answers, not a bot.',
  },
  {
    q: 'Where do the job openings come from?',
    a: 'Directly from each company’s own careers feed, refreshed daily, with the original application link. Nothing is copied from job boards and no opening is invented: if a company stops listing a role, it disappears here too. The counts on this page are read live from the database.',
  },
  {
    q: 'Why do I need my own OpenAI or Groq key?',
    a: 'Because it keeps a 90-day pass at ₹199 and puts you in control. Groq has a free tier that covers normal daily use; OpenAI usage for a heavy week is usually a few rupees. Your key is encrypted at rest and only ever sent to the provider you chose.',
  },
  {
    q: 'Which disciplines and tracks are covered in the curriculum?',
    a: 'Prep features 157 complete tracks across 12 disciplines: AI & Generative AI (LLMs, RAG, Agents, MLOps, Computer Vision), Backend Frameworks (Spring Boot, Node.js, FastAPI, Go, Django, gRPC), Frontend & Web (React, Next.js, TypeScript, Vue, Svelte, Web Performance), Cloud & DevOps (AWS, Azure, GCP, Docker, Kubernetes, Terraform, CI/CD), Mobile (Flutter, React Native, Kotlin, Swift), Data Engineering & Science (Spark, Kafka, Airflow, dbt, Pandas, Power BI), Cybersecurity (AppSec, Cloud Security, Threat Modeling), CS Fundamentals (OS, Networks, DBMS, Distributed Systems), and Software Engineering Interviews (DSA, HLD, LLD). You can code in Java, Python, C++, Go, TypeScript, JavaScript, Rust, Kotlin, Swift, Dart, and SQL.',
  },
  {
    q: 'Can I follow a pre-made career roadmap instead of choosing individual tracks?',
    a: 'Yes. Prep includes 20 pre-built Career Path Blueprints for roles like AI Engineer, Generative AI Engineer, Full-Stack Developer, Frontend Developer, Java Backend Developer, Python Backend Developer, DevOps Engineer, Cloud Architect, Flutter Developer, Data Scientist, Data Engineer, and SWE Interview Prep. You can use any blueprint as-is or customize it by adding, removing, or reordering topics to match your exact interview timeline.',
  },
  {
    q: 'Is there a subscription or auto-renewal?',
    a: 'No. You buy a pass for 90 days, 180 days or a year with one payment. Nothing renews by itself, and buying another pass simply adds its days to the end of the current one.',
  },
  {
    q: 'What happens when my pass ends?',
    a: 'Nothing is deleted. Your plan, notes, attempts and mock-interview reports stay in your account. The learning workspaces, AI and the code runner pause until you pick a new pass.',
  },
  {
    q: 'How do mock interviews work?',
    a: 'Pick a round such as DSA coding, system design, React or behavioural, a difficulty and a duration. An AI interviewer asks questions out loud, listens to your answers, pushes back on gaps, and gives you a scorecard with model answers and topics to revise.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. Everything syncs to your account, so the plan you build on a laptop is on your phone in the morning, including attempts and notes.',
  },
  {
    q: 'Who is behind Prep?',
    a: 'Prep is built and run by Evolw (www.evolw.in), a small product team in India. There is one support address, hello@evolw.in, and it is read by the people who build the product.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your plan, notes, resume versions and reports belong to you: export everything as a file from Settings at any time, and delete the account yourself from the Data Controls page. AI keys are encrypted at rest; resumes never leave your account.',
  },
]

/** Concrete reasons a first-time visitor can check for themselves; nothing here is a claim we cannot show. */
const TRUST = [
  { icon: '🏢', title: 'Real openings, real links', body: 'Every opening comes from the company’s own careers feed with the original application link. Listings that disappear at the source disappear here.' },
  { icon: '₹', title: 'One payment, no auto-renew', body: 'A pass is a single Razorpay payment. No card on file, nothing renews by itself, and buying another pass simply adds its days.' },
  { icon: '🧾', title: 'Receipt for every purchase', body: 'A receipt with the Razorpay payment id is emailed to you and kept under Settings → Billing, so support and refunds are straightforward.' },
  { icon: '↩', title: 'Refunds for real problems', body: 'Duplicate charges and any failure to deliver access are refunded in full, usually within 5 to 7 business days. The policy is public.' },
  { icon: '🔐', title: 'Your keys, your data', body: 'AI runs on your own key, encrypted at rest and sent only to the provider you chose. Export your data any time; delete the account yourself.' },
  { icon: '✉️', title: 'A person answers', body: 'hello@evolw.in reaches the team that builds Prep. No ticket bots, no outsourced support.' },
]

const PASS_INCLUDES = [
  '157 learning tracks and 20 career blueprints, planned around your calendar',
  'Runnable worked examples and a code runner for six languages',
  'The full ranked job feed, level and type filters, and compatibility analysis for every opening',
  'Resume versions compared against any opening, with evidence from your own resume',
  'Voice-first mock interviews for the exact job, with a scorecard and replay',
  'Spaced-repetition flashcards, the tutor, application tracker and reminders',
]

interface LiveStats {
  openings: number | null
  companies: number | null
  indiaOpenings: number | null
  learners: number | null
}

/** Live numbers from the database (never typed in), with the hiring companies' logos. */
function LiveProof() {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [companies, setCompanies] = useState<HiringCompanyDto[]>([])
  useEffect(() => {
    let cancelled = false
    fetch('/api/platform/stats', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: LiveStats | null) => {
        if (!cancelled && d) setStats(d)
      })
      .catch(() => undefined)
    fetchHiringCompanies({}, 24)
      .then((list) => {
        if (!cancelled) setCompanies(list)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])
  const showLearners = process.env.NEXT_PUBLIC_SHOW_LEARNER_COUNT === '1' && stats?.learners != null
  const fmt = (n: number | null | undefined) => (n == null ? '…' : n.toLocaleString('en-IN'))
  return (
    <section className="lp-live" aria-label="Live openings">
      <div className="lp-container">
        <div className="lp-section-head" data-reveal>
          <p className="lp-eyebrow">Live right now</p>
          <h2>Openings from the companies you are preparing for.</h2>
          <p className="lp-lede">Read from each company’s own careers feed and refreshed daily. These numbers come from the database, not from a marketing page.</p>
        </div>
        <div className="lp-live-grid" data-reveal>
          <div className="lp-live-stat">
            <strong>{fmt(stats?.openings)}</strong>
            <span>live openings with the original application link</span>
          </div>
          <div className="lp-live-stat">
            <strong>{fmt(stats?.companies)}</strong>
            <span>companies hiring: product companies, GCCs and consultancies</span>
          </div>
          <div className="lp-live-stat">
            <strong>{fmt(stats?.indiaOpenings)}</strong>
            <span>openings in India: Bengaluru, Hyderabad, Pune, Chennai, Mumbai, NCR</span>
          </div>
          {showLearners && (
            <div className="lp-live-stat">
              <strong>{fmt(stats?.learners)}</strong>
              <span>learners with an account</span>
            </div>
          )}
        </div>
        {companies.length > 0 && (
          <ul className="lp-logo-row" aria-label="Companies with live openings" data-reveal>
            {companies.map((c) => (
              <li key={c.id} title={`${c.name}: ${c.jobCount} opening${c.jobCount === 1 ? '' : 's'}`}>
                <CompanyLogo company={c} size={28} />
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="lp-fineprint" data-reveal>
          Openings are shown with their source. Prep never invents a listing, never copies job boards, and never applies on your behalf.
        </p>
      </div>
    </section>
  )
}

export default function Landing() {
  useReveal()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState<number | null>(0)
  const [curriculumTab, setCurriculumTab] = useState<'tracks' | 'paths'>('tracks')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [curriculumSearch, setCurriculumSearch] = useState<string>('')
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const domainTrackCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MARKETING_TRACKS.length }
    for (const dom of MARKETING_DOMAINS) {
      if (dom.id === 'all') continue
      if (dom.id === 'data') {
        counts[dom.id] = MARKETING_TRACKS.filter((t) =>
          ['Data Engineering', 'Data Science', 'Data Analytics & BI'].includes(t.family),
        ).length
      } else if (dom.id === 'interviews') {
        counts[dom.id] = MARKETING_TRACKS.filter((t) =>
          ['Software Engineering Interviews', 'Computer Science'].includes(t.family),
        ).length
      } else if (dom.family) {
        counts[dom.id] = MARKETING_TRACKS.filter((t) => t.family === dom.family).length
      }
    }
    return counts
  }, [])

  const filteredTracks = useMemo(() => {
    let list = MARKETING_TRACKS
    const q = curriculumSearch.trim().toLowerCase()

    if (selectedDomain !== 'all') {
      const dom = MARKETING_DOMAINS.find((d) => d.id === selectedDomain)
      if (dom) {
        if (dom.id === 'data') {
          list = list.filter((t) =>
            ['Data Engineering', 'Data Science', 'Data Analytics & BI'].includes(t.family),
          )
        } else if (dom.id === 'interviews') {
          list = list.filter((t) =>
            ['Software Engineering Interviews', 'Computer Science'].includes(t.family),
          )
        } else if (dom.family) {
          list = list.filter((t) => t.family === dom.family)
        }
      }
    } else if (!q) {
      list = list.filter((t) => t.popular)
    }

    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.family.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }

    return list
  }, [selectedDomain, curriculumSearch])

  const totalFilteredHours = useMemo(() => {
    return filteredTracks.reduce((sum, t) => sum + t.hours, 0)
  }, [filteredTracks])

  const filteredCareerPaths = useMemo(() => {
    const q = curriculumSearch.trim().toLowerCase()
    if (!q) return MARKETING_CAREER_PATHS
    return MARKETING_CAREER_PATHS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.roles.some((r) => r.toLowerCase().includes(q)),
    )
  }, [curriculumSearch])

  return (
    <div className="lp">
      <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <a href="/?home=1" className="lp-nav-brand" aria-label="Prep by EVOLW home">
            <BrandLogo size={30} />
          </a>
          <nav className="lp-nav-links" aria-label="Site">
            <a href="#curriculum">Curriculum</a>
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#trust">Trust</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-nav-actions">
            <a href="/app?mode=signin" className="lp-link">
              Sign in
            </a>
            <a href="/app?mode=signup" className="btn btn-primary btn-sm">
              Get started
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero" ref={heroRef}>
          <div className="lp-hero-glow" aria-hidden="true" />
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">157 Engineering Tracks · 12 Disciplines · AI Mock Interviews</p>
              <h1>
                Stop collecting resources.
                <br />
                <span className="text-gradient">Start finishing them.</span>
              </h1>
              <p className="lp-lede">
                A day-by-day plan across 157 engineering tracks, explanations in the language you code in, live openings from the companies you are preparing for, and a voice mock interview for the exact job. One payment from ₹{PLANS[0].priceInr} for {PLANS[0].name}; nothing renews by itself.
              </p>
              <div className="lp-cta-row">
                <a href="/app?mode=signup" className="btn btn-primary lp-cta">
                  Get started
                </a>
                <a href="#curriculum" className="btn btn-ghost lp-cta">
                  Explore curriculum
                </a>
              </div>
              <p className="lp-fineprint">One payment, no auto-renew · Razorpay checkout, receipt by email · Refund if access fails · Built by Evolw, India</p>
            </div>
            <div className="lp-hero-visual">
              <div className="lp-hero-scene">
                <HeroScene height={340} />
              </div>
              <div className="lp-hero-shot">
                <Shot src="/screens/today.jpg" alt="Prep’s Today view with the day’s plan" priority />
              </div>
            </div>
          </div>
        </section>

        <section className="lp-stats" aria-label="What is inside">
          <div className="lp-container lp-stats-grid" data-reveal>
            <div>
              <strong>{MARKETING_STATS.tracksCount}</strong>
              <span>learning tracks across {MARKETING_STATS.domainsCount} fields</span>
            </div>
            <div>
              <strong>{MARKETING_STATS.topicsCount}</strong>
              <span>topics with lessons & quizzes</span>
            </div>
            <div>
              <strong>{MARKETING_STATS.tasksCount}</strong>
              <span>tasks with runnable code</span>
            </div>
            <div>
              <strong>{MARKETING_STATS.careerPathsCount}</strong>
              <span>career path blueprints</span>
            </div>
          </div>
        </section>

        <LiveProof />

        <section id="curriculum" className="lp-section lp-curriculum-section">
          <div className="lp-curriculum-glow" aria-hidden="true" />
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Comprehensive Curriculum & Roadmaps</p>
              <h2>Every discipline. Every role. Fully mapped.</h2>
              <p className="lp-lede">
                From Generative AI, MLOps, and System Design to Flutter, Kubernetes, and Core C++ — browse 157 structured tracks and 20 end-to-end career roadmaps designed for product engineering interviews.
              </p>
            </div>

            <div className="lp-curriculum-controls" data-reveal>
              {/* Segmented Mode Switcher */}
              <div className="lp-segmented-nav" role="tablist" aria-label="Curriculum view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={curriculumTab === 'tracks'}
                  className={`lp-segmented-btn ${curriculumTab === 'tracks' ? 'is-active' : ''}`}
                  onClick={() => setCurriculumTab('tracks')}
                >
                  <span>📚</span>
                  <span>Browse All Tracks ({MARKETING_STATS.tracksCount})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={curriculumTab === 'paths'}
                  className={`lp-segmented-btn ${curriculumTab === 'paths' ? 'is-active' : ''}`}
                  onClick={() => setCurriculumTab('paths')}
                >
                  <span>🗺️</span>
                  <span>Career Path Blueprints ({MARKETING_STATS.careerPathsCount})</span>
                </button>
              </div>

              {/* Domain Filter Pills for Tracks */}
              {curriculumTab === 'tracks' && (
                <div className="lp-domain-pills" role="tablist" aria-label="Filter by discipline">
                  {MARKETING_DOMAINS.map((dom) => (
                    <button
                      key={dom.id}
                      type="button"
                      className={`lp-pill-btn ${selectedDomain === dom.id ? 'is-active' : ''}`}
                      onClick={() => setSelectedDomain(dom.id)}
                    >
                      <span>{dom.icon}</span>
                      <span>{dom.name}</span>
                      <span className="lp-pill-count">{domainTrackCounts[dom.id] || 0}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Bar */}
              <div className="lp-search-wrap">
                <span className="lp-search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  className="lp-search-input"
                  placeholder={
                    curriculumTab === 'tracks'
                      ? 'Search 157 tracks by skill, topic, or language (e.g. RAG, Kafka, Spring, React, Rust, AWS)...'
                      : 'Search 20 career roadmaps (e.g. AI Engineer, Full-Stack, Cloud, DevOps, Security)...'
                  }
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                />
                {curriculumSearch && (
                  <button
                    type="button"
                    className="lp-search-clear"
                    onClick={() => setCurriculumSearch('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            {curriculumTab === 'tracks' ? (
              <>
                <div className="lp-curriculum-meta-row" data-reveal>
                  <span>
                    {curriculumSearch
                      ? `Found ${filteredTracks.length} tracks matching "${curriculumSearch}"`
                      : selectedDomain === 'all'
                        ? `Showing ${filteredTracks.length} featured tracks of 157 total (select a discipline above to see all)`
                        : `Showing ${filteredTracks.length} tracks in ${MARKETING_DOMAINS.find((d) => d.id === selectedDomain)?.name}`}
                  </span>
                  <span>~{totalFilteredHours} study hours</span>
                </div>

                <div className="lp-curriculum-grid">
                  {filteredTracks.map((track) => (
                    <a
                      key={track.id}
                      href="/app"
                      className="lp-curriculum-card"
                      title={`Open ${track.title} in Prep`}
                    >
                      <div className="lp-card-head">
                        <div className="lp-card-icon-wrap" aria-hidden="true">
                          {track.icon}
                        </div>
                        <div className="lp-card-title-group">
                          <h3>{track.title}</h3>
                          <span className="lp-card-domain-badge">{track.family}</span>
                        </div>
                      </div>

                      <div className="lp-card-tags">
                        {track.tags.map((tag) => (
                          <span key={tag} className="lp-card-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="lp-card-footer">
                        <span>
                          {track.topics} topics · ~{track.hours}h
                        </span>
                        <span className="lp-card-cta">
                          Start track <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </a>
                  ))}

                  {filteredTracks.length === 0 && (
                    <div className="lp-curriculum-empty">
                      <p>No tracks matching "{curriculumSearch}" in this filter.</p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setCurriculumSearch('')
                          setSelectedDomain('all')
                        }}
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="lp-curriculum-meta-row" data-reveal>
                  <span>Showing {filteredCareerPaths.length} curated career blueprints</span>
                  <span>100% customizable</span>
                </div>

                <div className="lp-curriculum-grid">
                  {filteredCareerPaths.map((path) => (
                    <a
                      key={path.id}
                      href="/app"
                      className="lp-curriculum-card"
                      title={`View ${path.title} career roadmap`}
                    >
                      <div className="lp-card-head">
                        <div className="lp-card-icon-wrap" aria-hidden="true">
                          {path.icon}
                        </div>
                        <div className="lp-card-title-group">
                          <h3>{path.title}</h3>
                          <span className="lp-card-domain-badge">{path.family}</span>
                        </div>
                      </div>

                      <p className="lp-card-desc">{path.description}</p>

                      <div className="lp-card-tags">
                        {path.roles.map((role) => (
                          <span key={role} className="lp-card-tag">
                            {role}
                          </span>
                        ))}
                      </div>

                      <div className="lp-card-footer">
                        <span>{path.trackCount} tracks roadmap</span>
                        <span className="lp-card-cta">
                          Use Blueprint <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </a>
                  ))}

                  {filteredCareerPaths.length === 0 && (
                    <div className="lp-curriculum-empty">
                      <p>No career paths matching "{curriculumSearch}".</p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCurriculumSearch('')}
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Bottom Callout */}
            <div className="lp-curriculum-footer-banner" data-reveal>
              <div className="lp-curriculum-footer-text">
                <h3>Need a custom syllabus for your target company?</h3>
                <p>
                  Pick any combination of tracks or adapt a blueprint. Prep calculates your daily calendar, spaced repetition revision, and practice intervals automatically.
                </p>
              </div>
              <a href="/app?mode=signup" className="btn btn-primary lp-cta">
                Build your roadmap
              </a>
            </div>
          </div>
        </section>

        <section id="how" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">How it works</p>
              <h2>Three steps. Then you just show up every day.</h2>
            </div>
            <ol className="lp-steps">
              {STEPS.map((step) => (
                <li key={step.n} className="lp-step" data-reveal>
                  <div className="lp-step-copy">
                    <span className="lp-step-n">{step.n}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                  <Shot src={step.shot.src} alt={step.shot.alt} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="product" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Product</p>
              <h2>Built around the way you actually study.</h2>
              <p className="lp-lede">Not a video library. A workspace per topic, a plan across topics, and a tutor that knows both.</p>
            </div>
            <div className="lp-features">
              {FEATURES.map((f) => (
                <article key={f.title} className={`lp-feature ${f.flip ? 'is-flipped' : ''}`} data-reveal>
                  <div className="lp-feature-copy">
                    <p className="lp-eyebrow">{f.eyebrow}</p>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                  <Shot src={f.shot.src} alt={f.shot.alt} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-container lp-byok" data-reveal>
            <div className="lp-byok-copy">
              <p className="lp-eyebrow">Your key, your spend</p>
              <h2>AI that runs on your own account.</h2>
              <p>
                Add an OpenAI or Groq API key once in Settings. Every lesson, example, quiz, diagram and tutor reply runs on it, so there are no shared limits and no surprise bills from us. Groq’s free tier covers normal daily use.
              </p>
              <ul className="lp-checks">
                <li>Encrypted at rest with AES-256, never shown in full again</li>
                <li>Sent only to the provider you chose, only for your requests</li>
                <li>Remove it in one click; the app keeps working without AI</li>
              </ul>
            </div>
            <div className="lp-byok-card">
              <div className="lp-byok-row">
                <span>Provider</span>
                <strong>Groq · free tier</strong>
              </div>
              <div className="lp-byok-row">
                <span>Key</span>
                <strong className="font-mono">gsk_ ···· ···· 7f3a</strong>
              </div>
              <div className="lp-byok-row">
                <span>Status</span>
                <strong className="lp-ok">Verified with the provider</strong>
              </div>
              <div className="lp-byok-row">
                <span>Used for</span>
                <strong>Lessons, examples, quizzes, diagrams, tutor, email analysis</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Why you can trust it</p>
              <h2>Everything on this page can be checked.</h2>
              <p className="lp-lede">No invented numbers, no fake reviews, no countdown timers. Here is what actually protects you when you pay ₹{PLANS[0].priceInr}.</p>
            </div>
            <div className="lp-trust-grid">
              {TRUST.map((t) => (
                <article key={t.title} className="lp-trust-card" data-reveal>
                  <span className="lp-trust-icon" aria-hidden="true">
                    {t.icon}
                  </span>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </article>
              ))}
            </div>
            <div className="lp-trust-links" data-reveal>
              <a href="/refund">Refund policy</a>
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms</a>
              <a href="/data-deletion">Data controls</a>
              <a href="mailto:hello@evolw.in">hello@evolw.in</a>
            </div>
          </div>
        </section>

        <section id="pricing" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Pricing</p>
              <h2>Pick a pass. Pay once.</h2>
              <p className="lp-section-sub">Every pass includes everything. No subscription, no auto-renewal, no card kept on file.</p>
            </div>
            <div data-reveal>
              <PlanCards href="/app?mode=signup" ctaLabel={(plan) => `Get ${plan.name} for ₹${plan.priceInr}`} />
            </div>
            <div className="lp-pricing" data-reveal>
              <div className="lp-price-card">
                <h3>What ₹{PLANS[0].priceInr} for {PLANS[0].name} gets you</h3>
                <ul className="lp-checks">
                  {PASS_INCLUDES.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                  {PLAN_FEATURES.filter((f) => !PASS_INCLUDES.some((p) => p.toLowerCase().includes(f.toLowerCase().slice(0, 12)))).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="lp-fineprint">Paid through Razorpay with UPI, cards or net banking; a receipt with the payment id is emailed to you. Buying another pass while one is active adds the days to the end.</p>
              </div>
              <div className="lp-price-aside">
                <h3>Who it is for</h3>
                <p>Engineers with one to eight years of experience preparing for product-company and GCC rounds, and final-year students who want a plan instead of a playlist.</p>
                <h3>Why passes instead of a subscription</h3>
                <p>Interview prep has a finish line. Buy the stretch you need, sit the interviews, and never think about cancelling. Less than a single mock-interview session elsewhere.</p>
                <h3>If it does not work for you</h3>
                <p>Duplicate charges and access failures are refunded in full; unused passes have a cooling-off window. Details are in the refund policy, and hello@evolw.in answers.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="lp-section">
          <div className="lp-container lp-faq-wrap">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Questions</p>
              <h2>Straight answers.</h2>
            </div>
            <div className="lp-faq" data-reveal>
              {FAQ.map((item, i) => (
                <div key={item.q} className={`lp-faq-item ${open === i ? 'is-open' : ''}`}>
                  <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                    <span>{item.q}</span>
                    <span className="lp-faq-icon" aria-hidden="true">
                      +
                    </span>
                  </button>
                  <div className="lp-faq-body">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-container lp-final-inner" data-reveal>
            <BrandMark size={56} />
            <h2>Your next interview is closer than the end of your bookmarks folder.</h2>
            <p className="lp-lede">Start free with live openings and your resume. Add a pass when you are ready to prepare properly.</p>
            <a href="/app?mode=signup" className="btn btn-primary lp-cta">
              Get started
            </a>
            <p className="lp-fineprint">Passes from ₹{PLANS[0].priceInr} · One payment · No auto-renew · Receipt by email</p>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <BrandLogo size={28} />
            <p>Interview preparation with a plan, for engineers targeting product companies and global capability centres.</p>
            <p>
              Support: <a href="mailto:hello@evolw.in">hello@evolw.in</a>
            </p>
          </div>
          <nav className="lp-footer-links" aria-label="Footer">
            <a href="#curriculum">Curriculum</a>
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#trust">Trust</a>
            <a href="#faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/refund">Refund Policy</a>
            <a href="/contact">Contact</a>
            <a href="/data-deletion">Data Controls</a>
            <a href="/app?mode=signin">Sign in</a>
          </nav>
          <p className="lp-footer-credit">
            Developed by{' '}
            <a href="https://www.evolw.in" target="_blank" rel="noreferrer">
              Evolw
            </a>{' '}
            · www.evolw.in · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
