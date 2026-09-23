'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import BrandLogo, { BrandMark } from '../BrandLogo'
import { PLAN_FEATURES, PLANS } from '../../lib/billing/plan'
import PlanCards from '../PlanCards'
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
    body: 'Pick a target role, how many hours a day you really have, and the tracks that matter for it. The curriculum picker shows what each track covers and how long it takes at your pace.',
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
    body: 'Definition, why it matters, a real-world example, a step-by-step walkthrough and code in Java, Python, C++, Go, TypeScript or JavaScript. React topics come back as TSX, SQL topics as SQL, DevOps as shell and YAML.',
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
    q: 'Why do I need my own OpenAI or Groq key?',
    a: 'Because it keeps a 90-day pass at ₹199 and puts you in control. Groq has a free tier that covers normal daily use; OpenAI usage for a heavy week is usually a few rupees. Your key is encrypted at rest and only ever sent to the provider you chose.',
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
    q: 'Which languages and tracks are covered?',
    a: 'DSA and competitive programming, Core Java, JavaScript and TypeScript, React and Next.js, Node.js and backend, SQL and PostgreSQL, high-level system design, low-level design, CS fundamentals, and DevOps with CI/CD, Docker and security. Code in Java, Python, C++, Go, TypeScript or JavaScript.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. Everything syncs to your account, so the plan you build on a laptop is on your phone in the morning, including attempts and notes.',
  },
]

export default function Landing() {
  useReveal()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState<number | null>(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp">
      <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <a href="/?home=1" className="lp-nav-brand" aria-label="Prep by EVOLW home">
            <BrandLogo size={30} />
          </a>
          <nav className="lp-nav-links" aria-label="Site">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-nav-actions">
            <a href="/app" className="lp-link">
              Sign in
            </a>
            <a href="/app" className="btn btn-primary btn-sm">
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
              <p className="lp-eyebrow">Interview prep for product-based-company roles and more</p>
              <h1>
                Stop collecting resources.
                <br />
                <span className="text-gradient">Start finishing them.</span>
              </h1>
              <p className="lp-lede">
                Prep turns ten engineering tracks into a day-by-day plan, explains every topic in the language you code in, and keeps your job hunt in the same place, with AI mock interviews that feel like the real round. Passes from ₹{PLANS[0].priceInr} for {PLANS[0].name}.
              </p>
              <div className="lp-cta-row">
                <a href="/app" className="btn btn-primary lp-cta">
                  Get started
                </a>
                <a href="#how" className="btn btn-ghost lp-cta">
                  See how it works
                </a>
              </div>
              <p className="lp-fineprint">One payment, no auto-renew · Bring your own OpenAI or Groq key · Syncs to every device</p>
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
              <strong>10</strong>
              <span>learning tracks</span>
            </div>
            <div>
              <strong>661</strong>
              <span>topics, each with a lesson and quiz</span>
            </div>
            <div>
              <strong>3,300+</strong>
              <span>planned tasks with time estimates</span>
            </div>
            <div>
              <strong>6</strong>
              <span>languages in the code runner</span>
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

        <section id="pricing" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Pricing</p>
              <h2>Pick a pass. Pay once.</h2>
              <p className="lp-section-sub">Every pass includes everything. No subscription, no auto-renewal, no card kept on file.</p>
            </div>
            <div data-reveal>
              <PlanCards href="/app" ctaLabel={(plan) => `Get ${plan.name} for ₹${plan.priceInr}`} />
            </div>
            <div className="lp-pricing" data-reveal>
              <div className="lp-price-card">
                <h3>Every pass includes</h3>
                <ul className="lp-checks">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="lp-fineprint">Paid securely through Razorpay with UPI, cards or net banking. Buying another pass while one is active adds the days to the end.</p>
              </div>
              <div className="lp-price-aside">
                <h3>Who it is for</h3>
                <p>Engineers with one to eight years of experience preparing for product-company rounds, and final-year students who want a plan instead of a playlist.</p>
                <h3>Why passes instead of a subscription</h3>
                <p>Interview prep has a finish line. Buy the stretch you need, sit the interviews, and never think about cancelling.</p>
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
            <a href="/app" className="btn btn-primary lp-cta">
              Get started
            </a>
            <p className="lp-fineprint">Passes from ₹{PLANS[0].priceInr} · One payment · No auto-renew</p>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <BrandLogo size={28} />
            <p>Interview preparation with a plan, for engineers targeting product companies.</p>
          </div>
          <nav className="lp-footer-links" aria-label="Footer">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="/app">Sign in</a>
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
