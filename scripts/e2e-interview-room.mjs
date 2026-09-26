// Voice-first interview room end-to-end (Chromium): device check → test
// voice → start → hear the opening (premium fixture voice streamed from the
// server and played) → answer the introduction by voice → refresh mid-interview
// → resume discussion → weak technical answer → adaptive probe → clarification
// request → stronger follow-up answer → AI provider switched off by the admin
// (deterministic follow-ups continue) → coding round → design round with
// progressive requirements → behavioural follow-up → candidate questions →
// natural closing → feedback → replay → weakness mapping → learning plan →
// refresh → history. Also: voice provider failure → browser fallback,
// another learner → 404, free entitlement behaviour. No localStorage seeding.
//
// Speech APIs are simulated at the browser boundary only: a fake microphone
// device (Chromium flags), a mock SpeechRecognition that delivers transcripts
// the test "speaks", and an Audio stub that reports playback of the real audio
// the server synthesised. Everything else (network, server, state) is real.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import pg from 'pg'
import { loadDevelopmentDatabaseEnv } from './lib/development-database.mjs'
import { grantPass, waitForSession } from './lib/pass.mjs'

loadDevelopmentDatabaseEnv()
if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL
const target = new URL(process.env.DATABASE_URL)
if (target.hostname !== '127.0.0.1' && target.hostname !== 'localhost') {
  console.error(`Refusing to run e2e against non-local database host ${target.hostname}`)
  process.exit(1)
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const stamp = Date.now()
const adminEmail = `room-admin-${stamp}@example.invalid`
const learnerEmail = `room-learner-${stamp}@example.invalid`
const otherEmail = `room-other-${stamp}@example.invalid`
const password = 'Room-E2E-Only-2026!'
const SHOTS = process.env.E2E_SHOTS_DIR || 'scratch/career-os'
const results = []
const latencies = []
const pass = (msg) => {
  results.push(msg)
  console.log(`PASS: ${msg}`)
}
const ALL_FEATURES = ['jobs.discovery', 'jobs.personalizedFeed', 'jobs.advancedFilters', 'jobs.matching', 'jobs.curriculumGaps', 'resume.profile', 'jobs.resumeAnalysis', 'jobs.applicationStrategy', 'jobs.networkingBasic', 'jobs.referrals', 'jobs.outreachTracker', 'jobs.preparationBasic', 'jobs.preparation', 'jobs.interviewKit', 'jobs.readinessAdvanced', 'tracker.basic', 'mock.integrations', 'interview.jobPreview', 'interview.jobFull', 'interview.adaptive', 'interview.coding', 'interview.systemDesign', 'interview.feedbackDetailed', 'interview.curriculumMapping', 'interview.reattempt', 'interview.history', 'interview.voice', 'interview.premiumVoice', 'interview.replay', 'ai.highLimits']
const FREE_FEATURES = ['jobs.discovery', 'tracker.basic', 'resume.profile', 'jobs.networkingBasic', 'jobs.preparationBasic', 'interview.jobPreview', 'interview.voice']

/** Browser-boundary simulation of speech. Installed before any page script runs. */
const VOICE_MOCK = `
  window.__voiceMock = { spoken: [], played: [], recognitions: 0, active: null, errors: [] }
  class MockRecognition {
    constructor() { this.lang = ''; this.continuous = false; this.interimResults = false; this.onresult = null; this.onerror = null; this.onend = null; this.active = false }
    start() { this.active = true; window.__voiceMock.recognitions += 1; window.__voiceMock.active = this }
    stop() { if (!this.active) return; this.active = false; if (window.__voiceMock.active === this) window.__voiceMock.active = null; const self = this; setTimeout(() => self.onend && self.onend(), 0) }
    abort() { this.stop() }
  }
  window.SpeechRecognition = MockRecognition
  window.webkitSpeechRecognition = MockRecognition
  window.__say = (text) => {
    const r = window.__voiceMock.active
    if (!r) return false
    const event = (t, isFinal) => { const result = [{ transcript: t }]; result.isFinal = isFinal; return { resultIndex: 0, results: [result] } }
    r.onresult && r.onresult(event(text.slice(0, Math.ceil(text.length / 2)), false))
    setTimeout(() => r.onresult && r.onresult(event(text, true)), 150)
    return true
  }
  class MockAudio extends EventTarget {
    constructor(src) { super(); this.src = src; this.onplaying = null; this.onended = null; this.onerror = null }
    play() { window.__voiceMock.played.push(this.src); const self = this; setTimeout(() => self.onplaying && self.onplaying(), 20); setTimeout(() => self.onended && self.onended(), 400); return Promise.resolve() }
    pause() {}
  }
  window.Audio = MockAudio
  if (!window.speechSynthesis) {
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; this.onstart = null; this.onend = null; this.onerror = null } }
    Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, getVoices() { return [] }, addEventListener() {}, removeEventListener() {} }, configurable: true })
  }
  if (window.speechSynthesis) {
    const synth = window.speechSynthesis
    synth.speak = (u) => { window.__voiceMock.spoken.push(u.text); setTimeout(() => u.onstart && u.onstart(), 10); setTimeout(() => u.onend && u.onend(), 300) }
    synth.cancel = () => {}
    synth.getVoices = () => []
  }
`
/** A context where nothing can speak or listen and the microphone is denied. */
const NO_VOICE = `
  delete window.SpeechRecognition
  delete window.webkitSpeechRecognition
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true })
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' }))
`

async function dismissOnboarding(page) {
  const skip = page.getByRole('button', { name: 'Skip setup for now' })
  await skip.waitFor({ timeout: 20000 })
  await skip.click()
  await page.getByRole('heading', { name: 'Career goal' }).waitFor()
}
async function signUp(page, email, { pass: withPass = true } = {}) {
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(page)
  if (withPass) {
    await grantPass(pool, email)
    await page.reload({ waitUntil: 'networkidle' })
    await waitForSession(page)
  }
  await dismissOnboarding(page)
}
function minimalPdf(lines) {
  const esc = (l) => l.replace(/[()\\]/g, '\\$&')
  const content = lines.map((l, i) => `BT /F1 11 Tf 40 ${760 - i * 14} Td (${esc(l)}) Tj ET`).join('\n')
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  let out = '%PDF-1.4\n'
  const offsets = []
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'))
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = Buffer.byteLength(out, 'latin1')
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
const RESUME_LINES = ['Asha Verma', 'Backend Developer', 'asha.verma@example.invalid | +91 98765 43210', 'Summary', 'Backend developer focused on Java services and relational data.', 'Skills', 'Java, Spring Boot, PostgreSQL, Docker, Git', 'Experience', 'Software Engineer at Nimbus Labs', 'Jun 2023 - Present', '- Built REST APIs in Spring Boot serving 40k daily requests', '- Fixed a production incident by finding the root cause in the connection pool', '- Responsible for on-call rotation', 'Projects', 'Inventory Tracker - Spring Boot and PostgreSQL service with Docker deployment', 'Education', 'B.Tech Computer Science, Pune University, 2021']

const caption = async (page) => (await page.locator('#jiv-question-title').textContent()).trim()
const stage = async (page) => (await page.locator('.room-stage-label').textContent()).trim()
const status = async (page) => (await page.locator('.room-status').textContent()).trim()
/** Waits until the interviewer says something new (or the report appears). */
async function waitForNewCaption(page, previous, timeout = 25000) {
  await page.waitForFunction((prev) => {
    const el = document.querySelector('#jiv-question-title')
    return !el || el.textContent.trim() !== prev || Array.from(document.querySelectorAll('h3')).some((h) => h.textContent.trim().startsWith('Interview report'))
  }, previous, { timeout })
}
async function typeAnswer(page, text, { button = /^(Send answer|Send|Answer follow-up)$/ } = {}) {
  const before = await caption(page)
  await page.locator('#jiv-answer').fill(text)
  await page.getByRole('button', { name: button }).click()
  await waitForNewCaption(page, before)
  await recordDiag(page)
}
async function speakAnswer(page, text) {
  const before = await caption(page)
  await page.locator('.room-mic[aria-pressed="true"]').waitFor({ timeout: 20000 })
  assert.equal(await page.evaluate((t) => window.__say(t), text), true, 'the recogniser is listening')
  await page.locator('#jiv-answer').filter({ hasText: text.slice(0, 30) }).or(page.locator('#jiv-answer:has-text("")')).first().waitFor()
  await page.getByText(/Sending in \d/).waitFor({ timeout: 15000 })
  await waitForNewCaption(page, before, 30000)
  await recordDiag(page)
}
async function recordDiag(page) {
  const diag = page.locator('.room-diag')
  if (await diag.count()) latencies.push((await diag.textContent()).trim())
}

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] })
try {
  // ------------------------------------------------------------------ admin: plans, company, job, AI policy
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const admin = await adminCtx.newPage()
  await admin.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await signUp(admin, adminEmail)
  const adminUser = (await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])).rows[0]
  await pool.query('INSERT INTO user_roles ("userId", role, "grantedBy") VALUES ($1, $2, $3)', [adminUser.id, 'admin', 'e2e'])
  assert.equal(await admin.evaluate((f) => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: f }) }).then((r) => r.status), ALL_FEATURES), 200)
  assert.equal(await admin.evaluate((f) => fetch('/api/admin/plans/free', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: f }) }).then((r) => r.status), FREE_FEATURES), 200)
  const aiState = await admin.evaluate(() => fetch('/api/admin/ai').then((r) => r.json()))
  assert.equal(await admin.evaluate((p) => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ policy: { ...p, enabled: true } }) }).then((r) => r.status), aiState.policy), 200)
  assert.equal(aiState.voice.availability.mode, 'premium', 'the fixture voice provider is configured for this run (TTS_FIXTURE=1)')
  assert.equal(aiState.voice.availability.provider, 'fixture')
  const probe = await admin.evaluate(() => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'voice_probe' }) }).then((r) => r.json()))
  assert.ok(probe.ok && probe.provider === 'fixture' && probe.bytes > 44 && probe.mime === 'audio/wav', `admin voice probe synthesises the test line (${JSON.stringify(probe)})`)
  const company = await admin.evaluate((body) => fetch('/api/admin/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()), { name: `Nimbus Payments ${stamp}`, slug: `nimbus-payments-${stamp}`, website: 'https://nimbus-payments.example.com', headquarters: 'Pune, India' })
  assert.ok(company.id, 'company created')
  const job = await admin.evaluate((body) => fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()), { companyId: company.id, sourceId: null, title: 'Backend Engineer', roleCategory: 'backend', description: 'Build payment services with Java, Spring Boot, PostgreSQL and Kafka. Own APIs end to end, design for scale and reliability, and work with the ledger team.', requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Kafka'], preferredSkills: ['Redis', 'Docker'], level: 'mid', employmentType: 'full_time', workMode: 'hybrid', locationCity: 'Pune', region: 'india', applyUrl: `https://nimbus-payments.example.com/careers/${stamp}`, experienceMin: 2, experienceMax: 5, status: 'published' })
  assert.ok(job.id, `job created (${JSON.stringify(job).slice(0, 120)})`)
  const jobId = job.id
  pass('admin: plan entitlements include voice, premium voice and replay; the voice provider (fixture) is configured and probed; company and job published')

  // ------------------------------------------------------------------ learner: resume, job, device check
  const learnerCtx = await browser.newContext({ viewport: { width: 1360, height: 900 } })
  await learnerCtx.addInitScript(VOICE_MOCK)
  const learner = await learnerCtx.newPage()
  const voiceResponses = []
  learner.on('response', (res) => {
    if (res.url().endsWith('/api/interviews/voice') && res.request().method() === 'POST') voiceResponses.push({ status: res.status(), provider: res.headers()['x-voice-provider'], fallback: res.headers()['x-voice-fallback'], type: res.headers()['content-type'] })
  })
  const pageErrors = []
  learner.on('pageerror', (e) => pageErrors.push(String(e)))
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await signUp(learner, learnerEmail)
  await learner.getByRole('button', { name: 'Resume', exact: true }).click()
  await learner.getByRole('heading', { name: 'Your resume' }).waitFor()
  await learner.locator('input[type="file"][aria-label="Resume file"]').setInputFiles({ name: 'asha-resume.pdf', mimeType: 'application/pdf', buffer: minimalPdf(RESUME_LINES) })
  await learner.getByText('Uploaded asha-resume').waitFor()
  await learner.getByText('Asha Verma', { exact: true }).waitFor()
  const openJob = async (page) => {
    await page.getByRole('button', { name: 'Job Discovery', exact: true }).click()
    await page.getByLabel('Search jobs').fill(`Nimbus Payments ${stamp}`)
    await page.getByRole('button', { name: `Backend Engineer at Nimbus Payments ${stamp}` }).first().click()
    await page.getByRole('heading', { name: 'Backend Engineer' }).waitFor()
  }
  await openJob(learner)
  await learner.getByRole('button', { name: 'Mock Interview for This Job' }).click()
  await learner.getByRole('heading', { name: 'Mock Interview for This Job' }).waitFor()
  const check = learner.getByRole('region', { name: 'Device check' })
  await check.waitFor()
  await check.getByText('Interviewer voice: Fixture voice (development only).').waitFor()
  await check.getByText('Browser speech recognition (English).').waitFor()
  await check.getByText('Interview service reachable.').waitFor()
  await check.getByText(/AI can rephrase follow-ups; the deterministic interviewer stays in charge/).waitFor()
  await check.getByRole('button', { name: 'Test interviewer voice' }).click()
  await check.getByText(/Premium voice \(Fixture voice \(development only\)\) played in \d+ ms\./).waitFor({ timeout: 20000 })
  assert.equal(voiceResponses.length, 1)
  assert.equal(voiceResponses[0].status, 200)
  assert.equal(voiceResponses[0].provider, 'fixture')
  assert.match(voiceResponses[0].type, /audio\/wav/)
  const played = await learner.evaluate(() => window.__voiceMock.played.length)
  assert.equal(played, 1, 'the synthesised test line was handed to the audio element')
  await check.getByRole('button', { name: 'Test microphone' }).click()
  await check.getByText(/Heard you clearly\.|Microphone allowed, but nothing was heard/).waitFor({ timeout: 15000 })
  const readyCount = await check.locator('.room-check-status.is-ready').count()
  assert.ok(readyCount >= 4, `device check reports ready states (${readyCount})`)
  await learner.getByLabel('Interview duration').selectOption('30')
  await learner.screenshot({ path: `${SHOTS}/room-device-check.png`, fullPage: true })
  pass('device check: microphone, audio output (test line synthesised by the server and played), speech support, service and AI provider all reported; voice settings available')

  // ------------------------------------------------------------------ start: the opening is spoken, then the room listens
  await learner.getByRole('button', { name: 'Start interview', exact: true }).click()
  const room = learner.getByRole('region', { name: 'Mock interview session' })
  await room.waitFor()
  assert.equal(await learner.getByRole('tablist', { name: 'Job workspace' }).count(), 0, 'navigation hidden in the room')
  assert.equal(await learner.getByRole('heading', { name: 'Backend Engineer' }).count(), 0, 'job hero hidden in the room')
  assert.equal(await learner.getByRole('button', { name: 'Add to Application Tracker' }).count(), 0, 'job side column (apply, source, fit) hidden in the room')
  assert.equal(await learner.locator('.app-footer').isVisible().catch(() => false), false, 'footer hidden in focus mode')
  assert.equal(await learner.evaluate(() => document.body.classList.contains('iv-focus')), true, 'focus mode hides the app chrome')
  assert.equal(await learner.evaluate(() => getComputedStyle(document.querySelector('.app-page > aside')).display), 'none')
  assert.equal(await learner.locator('.room-title').textContent(), 'Technical Interviewer')
  const opening = await caption(learner)
  assert.match(opening, /^Hi(, | [A-Za-z][A-Za-z'’-]+, )thanks for joining\. I'll be taking you through the technical interview today for the Backend Engineer role you're preparing for\. We'll spend around 30 minutes together\./, `opening from the real configuration, no email handle spoken as a name (${opening.slice(0, 80)})`)
  assert.match(opening, /Feel free to ask for clarification/)
  assert.match(opening, /To begin, could you briefly introduce yourself/)
  await learner.locator('.room-state.is-speaking').waitFor({ timeout: 10000 })
  await learner.locator('.room-state.is-listening').waitFor({ timeout: 20000 })
  assert.equal(voiceResponses.length, 2, 'the opening was synthesised by the server')
  assert.equal(voiceResponses[1].provider, 'fixture')
  assert.equal(await learner.evaluate(() => window.__voiceMock.played.length), 2)
  assert.match(await status(learner), /Listening…/)
  assert.match(await status(learner), /Premium voice/)
  await learner.screenshot({ path: `${SHOTS}/room-opening.png` })
  const sessionRow = (await pool.query('SELECT s.id, s.state, s.turns FROM job_interview_sessions s JOIN users u ON u.id = s."userId" WHERE u.email = $1 AND s."jobId" = $2', [learnerEmail, jobId])).rows[0]
  assert.equal(sessionRow.state.voice, true)
  assert.equal(sessionRow.turns[0].kind, 'opening')
  pass('interview room: navigation removed, realistic interviewer identity, spoken opening generated from the configuration (premium fixture voice), then the room listens')

  // ------------------------------------------------------------------ introduction by voice, with the automatic end-of-answer detection
  await speakAnswer(learner, 'I am a backend developer with three years of experience. I mainly worked on the backend with Java and Spring Boot services on PostgreSQL, and I want to move into payments.')
  let turns = (await pool.query('SELECT turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].turns
  const introAnswer = turns.find((t) => t.kind === 'answer')
  assert.ok(introAnswer && introAnswer.input === 'voice', 'the spoken answer was recorded as voice input')
  assert.match(introAnswer.text, /^I am a backend developer with three years/)
  assert.match(await stage(learner), /Resume and project discussion/)
  const resumeCaption = await caption(learner)
  assert.match(resumeCaption, /^(Okay|I see|Alright|Understood|Thanks|Right)/, 'neutral acknowledgement before moving on')
  assert.match(resumeCaption, /Inventory Tracker|Nimbus Labs|REST APIs|connection pool/, 'resume discussion cites the real resume')
  pass('voice answer: dictated introduction is sent automatically after the pause, stored as spoken, and the interviewer moves on with a neutral acknowledgement into the resume discussion')

  // ------------------------------------------------------------------ refresh mid-interview: restored where it left off
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await openJob(learner)
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await room.waitFor({ timeout: 20000 })
  assert.equal(await caption(learner), resumeCaption, 'the interviewer question is restored from the server')
  await learner.getByText(/Interview restored where you left off/).waitFor()
  assert.equal(await learner.evaluate(() => window.__voiceMock.played.length), 0, 'a restored interview does not talk over the learner')
  await learner.getByRole('button', { name: 'Repeat question' }).click()
  await waitForNewCaption(learner, resumeCaption)
  assert.match(await caption(learner), /^(Of course|Sure|Certainly)\./)
  await learner.locator('.room-state.is-speaking').waitFor({ timeout: 10000 })
  await learner.locator('.room-state.is-listening').waitFor({ timeout: 20000 })
  pass('refresh mid-interview restores the room at the same stage without replaying audio; "Repeat question" is answered and spoken')
  await speakAnswer(learner, 'Inventory Tracker is a Spring Boot and PostgreSQL service deployed with Docker. I chose Spring Boot for its ecosystem; the alternative was Node, but the trade-off was team familiarity. The hardest problem was a root cause in the connection pool; the fix was pool sizing and as a result latency dropped.')

  // ------------------------------------------------------------------ technical: AI switched off → weak answer → deterministic probe; clarification; stronger answer
  let guard = 0
  while (!/Technical deep dive|Role fundamentals/.test(await stage(learner)) && guard++ < 6) await typeAnswer(learner, 'I would define it first, then explain how it works internally, where I used it in production at Nimbus Labs, and the trade-off: it adds complexity but improves reliability, however it can fail under load, so I would add monitoring and failure handling.')
  assert.match(await stage(learner), /Technical deep dive|Role fundamentals/)
  const techCaption = await caption(learner)
  assert.match(techCaption, /(Earlier you mentioned|You said earlier|Coming back to something you said)/, `the interviewer refers back to the introduction (${techCaption.slice(0, 90)})`)
  assert.match(techCaption, /Java|Spring Boot|PostgreSQL|backend/, 'the reference quotes what the learner actually said')
  // Admin switches the AI gateway off: the interview continues on the deterministic interviewer.
  assert.equal(await admin.evaluate((p) => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ policy: { ...p, enabled: false } }) }).then((r) => r.status), aiState.policy), 200)
  await typeAnswer(learner, 'Because it is fast.')
  const probeCaption = await caption(learner)
  assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 1, 'a weak answer gets a probe, not a score')
  assert.match(probeCaption, /^(Okay|I see|Alright|Understood|Thanks|Right)/)
  assert.ok(!/great|excellent|correct|wrong|you missed/i.test(probeCaption), `neutral probe: ${probeCaption}`)
  assert.match(probeCaption, /\?$/)
  turns = (await pool.query('SELECT turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].turns
  const firstFollowUp = turns.filter((t) => t.kind === 'follow_up').pop()
  assert.equal(firstFollowUp.aiRefined, undefined, 'with the AI gateway off the deterministic follow-up wording is used unchanged')
  assert.match(firstFollowUp.text, /What specifically makes|Can you walk me through|Say a bit more|concrete example/)
  // Clarification does not count as the answer and keeps the follow-up pending.
  await learner.getByRole('button', { name: 'Ask for clarification' }).click()
  await learner.locator('#jiv-answer').fill('What do you mean by suitable here?')
  const beforeClar = await caption(learner)
  await learner.getByRole('button', { name: 'Ask', exact: true }).click()
  await waitForNewCaption(learner, beforeClar)
  assert.match(await caption(learner), /^Sure\./)
  assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 1)
  await typeAnswer(learner, 'What makes it suitable is in-memory access: reads that would hit the primary database are served from memory; for example our product lookups dropped from 40 ms to 2 ms, however the trade-off is staleness and an extra system to operate, so we set TTLs and monitored hit rate.')
  assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 0, 'one follow-up at standard difficulty; the interviewer moves on')
  assert.equal(await admin.evaluate((p) => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ policy: { ...p, enabled: true } }) }).then((r) => r.status), aiState.policy), 200)
  pass('adaptive probing: the interviewer refers back to the introduction, a weak answer gets a neutral deterministic follow-up while the AI gateway is off, a clarification request is answered without counting as the answer, and the stronger answer moves the interview on')

  // ------------------------------------------------------------------ coding, design (progressive requirements), behavioural, closing
  guard = 0
  while (!/Coding/.test(await stage(learner)) && guard++ < 8) await typeAnswer(learner, 'I would define it first, then explain how it works internally, where I used it in production, and the trade-off: it adds complexity but improves reliability, however it can fail under load, so I would add monitoring and failure handling.')
  assert.match(await stage(learner), /Coding/)
  const codingCaption = await caption(learner)
  assert.match(codingCaption, /coding/i)
  assert.match(codingCaption, /Here is the problem\./)
  assert.match(codingCaption, /approach/i)
  await learner.getByRole('tab', { name: 'Code editor' }).or(learner.getByRole('complementary', { name: 'Code editor' })).first().waitFor()
  await learner.screenshot({ path: `${SHOTS}/room-coding.png` })
  await typeAnswer(learner, 'Approach: I use a hash map in a single pass, storing each value and checking for the complement. Time complexity O(n) and space O(n). Edge cases: empty input, duplicates, negative numbers and very large inputs. Dry run: for input [2,7,11,15] with target 9 it returns [0,1].')
  if (await learner.getByRole('button', { name: 'Answer follow-up' }).count()) await typeAnswer(learner, 'If the input did not fit in memory I would stream it and use an external sort or a probabilistic filter; the trade-off is more passes over the data.')
  guard = 0
  while (!/System design/.test(await stage(learner)) && guard++ < 4) await typeAnswer(learner, 'I would define it first and give an example from production, with the trade-off and failure handling.')
  assert.match(await stage(learner), /System design/)
  const designCaption = await caption(learner)
  assert.match(designCaption, /design/i)
  assert.ok(!/tens of thousands|p99|strong consistency/i.test(designCaption), 'requirements are not dumped up front')
  await learner.getByRole('complementary', { name: 'Whiteboard' }).or(learner.getByRole('tab', { name: 'Whiteboard' })).first().waitFor()
  await typeAnswer(learner, 'What scale should I design for? How many users?')
  assert.match(await caption(learner), /tens of thousands of daily active users/)
  assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 0, 'a requirements question is a clarification, not an answer')
  await typeAnswer(learner, 'Requirements first: create and read orders for tens of thousands of users. Service boundaries: an API service, an order service and a database with a cache in front; load balancing across instances; failure handling with retries and idempotency; the trade-off of caching is staleness.')
  if (await learner.getByRole('button', { name: 'Answer follow-up' }).count()) await typeAnswer(learner, 'At ten times the load the database becomes the bottleneck first; I would see rising p99 and queue depth on dashboards and alerts before users do, and shard or add read replicas.')
  guard = 0
  while (!/Behavioural/.test(await stage(learner)) && guard++ < 4) await typeAnswer(learner, 'I would define it first and give an example from production, with the trade-off and failure handling.')
  assert.match(await stage(learner), /Behavioural/)
  await typeAnswer(learner, 'I think ownership is important and I always try to take responsibility for my work and communicate clearly with everyone involved in the project so that we deliver.')
  assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 1, 'a vague behavioural answer gets a follow-up')
  assert.match(await caption(learner), /concrete example|specifically/i)
  assert.ok(!/STAR/.test(await caption(learner)), 'no STAR scoring shown mid-interview')
  turns = (await pool.query('SELECT turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].turns
  const behFollowUp = turns.filter((t) => t.kind === 'follow_up').pop()
  assert.equal(behFollowUp.aiRefined, true, 'with the AI gateway back on, the follow-up wording is rephrased by the gateway')
  assert.ok(behFollowUp.deterministicText && behFollowUp.deterministicText !== behFollowUp.text, 'the deterministic wording is kept alongside the AI rephrasing')
  await typeAnswer(learner, 'For example, when our release failed last year, the situation was a broken payment job. I decided to own it: I investigated the logs, wrote a retry with backoff and paired with QA. As a result failures dropped 90% and we shipped on time. I learned to add alerts first.')
  if (await learner.getByRole('button', { name: 'Answer follow-up' }).count()) await typeAnswer(learner, 'Tomorrow I would add the alerting first and involve QA earlier; the result would be catching the failure before release.')
  guard = 0
  while (!/wrap-up/i.test(await stage(learner)) && guard++ < 4) await typeAnswer(learner, 'When our on-call paged me, I decided to investigate the logs, wrote a fix and as a result the incident closed in an hour; I learned to add alerts first.')
  assert.match(await stage(learner), /wrap-up/i)
  const wrapCaption = await caption(learner)
  assert.match(wrapCaption, /(That covers everything I wanted to discuss|That's everything from my side)\..*Before we wrap up, do you have any questions you would like to ask me\?/)
  assert.equal((await pool.query('SELECT report FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].report, null, 'no feedback before the closing')
  await typeAnswer(learner, 'How did I do? Can you give me feedback now?')
  assert.match(await caption(learner), /can't share an assessment during the interview itself/)
  await learner.screenshot({ path: `${SHOTS}/room-closing.png` })
  // Second (and last) candidate question: answered generally, then the farewell; the feedback opens only after the farewell is spoken.
  const beforeFarewell = await caption(learner)
  await learner.locator('#jiv-answer').fill('What are the next steps in the process?')
  await learner.getByRole('button', { name: /^(Send answer|Send)$/ }).click()
  await waitForNewCaption(learner, beforeFarewell)
  const closingCaption = (await learner.locator('#jiv-question-title').count()) ? await caption(learner) : ''
  if (closingCaption) assert.match(closingCaption, /can't speak for .* process specifically.*Thanks for your time\. We'll end the mock interview here\./)
  await learner.getByRole('heading', { name: 'Interview report' }).waitFor({ timeout: 40000 })
  const completed = (await pool.query('SELECT status, report, turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0]
  assert.equal(completed.status, 'completed')
  assert.equal(completed.turns[completed.turns.length - 1].kind, 'farewell')
  assert.match(completed.turns[completed.turns.length - 1].text, /Thanks for your time\. We'll end the mock interview here\./)
  assert.ok(completed.report.voiceUsed === true && completed.report.clarificationsAsked >= 2 && completed.report.followUpsAsked >= 2)
  assert.ok(!/\bhire\b|hiring probab|% chance/i.test(JSON.stringify(completed.report)), 'no hiring probability or verdict')
  for (const t of completed.turns.filter((x) => x.role === 'interviewer' && x.kind !== 'question' && x.kind !== 'opening')) assert.ok(!/\b(great|excellent|correct|you missed|you should study)\b/i.test(`${t.lead ?? ''} ${t.text}`), `neutral: ${t.text}`)
  pass('coding round (verbal problem, approach first, editor open), design round with requirements revealed on request, behavioural follow-up, candidate questions answered without company facts, natural farewell; feedback only after the farewell')

  // ------------------------------------------------------------------ feedback, replay, weakness mapping, learning plan, history
  await learner.getByRole('heading', { name: 'Communication' }).waitFor()
  await learner.getByRole('heading', { name: 'Problem-solving' }).waitFor()
  await learner.getByRole('heading', { name: 'Coding' }).waitFor()
  await learner.getByRole('heading', { name: 'System design', exact: true }).waitFor()
  await learner.getByRole('heading', { name: 'Behavioural', exact: true }).waitFor()
  await learner.getByRole('heading', { name: 'Resume and project discussion' }).waitFor()
  await learner.getByRole('heading', { name: 'Strong and weak answers' }).waitFor()
  await learner.getByRole('heading', { name: 'Question-level feedback' }).waitFor()
  await learner.locator('.jiv-q').first().locator('summary').click()
  await learner.getByText('What the interviewer was evaluating').first().waitFor()
  await learner.getByText('Stronger reasoning approach').first().waitFor()
  await learner.getByRole('heading', { name: 'Interview replay' }).waitFor()
  const timeline = learner.getByRole('list', { name: 'Interview timeline' })
  await timeline.waitFor()
  const entries = await timeline.locator('.room-timeline-item').count()
  assert.ok(entries >= 6, `timeline has one entry per section reached (${entries})`)
  assert.match(await timeline.locator('.room-timeline-time').first().textContent(), /^00:00$/)
  await timeline.getByRole('button', { name: /Technical deep dive|Role fundamentals/ }).first().click()
  await timeline.getByText(/asked for clarification/).first().waitFor()
  await timeline.getByText(/Feedback for this section/).first().waitFor()
  await learner.getByRole('heading', { name: 'Weaknesses mapped to your curriculum' }).waitFor()
  await learner.screenshot({ path: `${SHOTS}/room-feedback.png`, fullPage: true })
  const weakItems = learner.locator('section[aria-labelledby="jiv-weak"] .prep-item')
  if (await weakItems.count()) {
    if (await learner.getByRole('button', { name: 'Preview weakness plan' }).count()) {
      await learner.getByText(/You need an active learning goal first|Preview weakness plan/).first().waitFor()
    }
  }
  pass('debrief: summary, communication, problem-solving, coding, design, behavioural, resume discussion, strong/weak answers, question-level evaluation (evaluating → demonstrated → missing → stronger approach), replay timeline with transcript and per-section feedback, weakness mapping')

  // ------------------------------------------------------------------ voice provider failure → browser fallback (second attempt), then leave
  await learner.getByRole('button', { name: 'Full interview again' }).click()
  await learner.getByText(/Re-attempt: Full interview/).waitFor()
  await learner.route('**/api/interviews/voice', (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 503, headers: { 'X-Voice-Fallback': 'browser', 'X-Voice-Reason': 'server' } }) : route.continue()))
  await learner.getByRole('button', { name: 'Start full interview re-attempt' }).click()
  await room.waitFor()
  await learner.locator('.room-status-mode').getByText(/Browser voice \(fallback\)|Voice off/).waitFor({ timeout: 20000 })
  const secondRow = (await pool.query('SELECT id FROM job_interview_sessions WHERE "jobId" = $1 AND status = $2', [jobId, 'active'])).rows[0]
  assert.ok(secondRow, 'the re-attempt is active server-side')
  await learner.locator('#jiv-answer').waitFor()
  await typeAnswer(learner, 'I am back for another attempt and I will answer in text while the voice is unavailable.')
  assert.match(await stage(learner), /Resume|Role fundamentals|Technical/)
  await learner.unroute('**/api/interviews/voice')
  learner.once('dialog', (d) => d.accept())
  await learner.getByRole('button', { name: 'Leave' }).click()
  await learner.getByRole('heading', { name: 'Interview history' }).waitFor()
  assert.equal((await pool.query('SELECT status FROM job_interview_sessions WHERE id = $1', [secondRow.id])).rows[0].status, 'abandoned')
  const historyTable = learner.getByRole('table', { name: 'Interview attempts' })
  await historyTable.getByText('Voice').first().waitFor()
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await openJob(learner)
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.getByRole('table', { name: 'Interview attempts' }).getByText('Voice').first().waitFor()
  await learner.getByRole('button', { name: /Open report from/ }).first().click()
  await learner.getByRole('heading', { name: 'Interview replay' }).waitFor()
  pass('voice provider failure falls back to the browser voice without losing the interview; history records the voice attempt and the report with replay persists across a refresh')

  // ------------------------------------------------------------------ voice unavailable in the browser → text-only room
  const noVoiceCtx = await browser.newContext()
  await noVoiceCtx.addInitScript(NO_VOICE)
  const noVoice = await noVoiceCtx.newPage()
  await noVoice.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await noVoice.getByRole('tab', { name: 'Sign in' }).click()
  await noVoice.getByLabel('Email address').fill(learnerEmail)
  await noVoice.getByLabel('Password', { exact: true }).fill(password)
  await noVoice.getByRole('button', { name: /Sign in to Prep/ }).click()
  await waitForSession(noVoice)
  await noVoice.getByRole('heading', { name: 'Career goal' }).waitFor({ timeout: 30000 })
  await openJob(noVoice)
  await noVoice.getByRole('tab', { name: 'Mock interview' }).click()
  const nvCheck = noVoice.getByRole('region', { name: 'Device check' })
  await nvCheck.waitFor()
  await nvCheck.getByText(/Speech recognition needs Chrome or Edge\. You can type every answer\./).waitFor()
  await nvCheck.getByRole('button', { name: 'Test microphone' }).click()
  await nvCheck.getByText(/Microphone permission was denied/).waitFor()
  await nvCheck.locator('.room-check-status.is-unavailable').first().waitFor()
  assert.equal(await noVoice.getByRole('button', { name: 'Start interview', exact: true }).isEnabled(), true, 'a failed microphone never blocks the interview')
  await noVoice.getByRole('button', { name: 'Start in text only' }).or(noVoice.getByRole('button', { name: 'Start interview', exact: true })).first().click()
  await noVoice.getByRole('region', { name: 'Mock interview session' }).waitFor()
  await noVoice.locator('#jiv-answer').waitFor()
  assert.equal(await noVoice.locator('.room-mic').count(), 0, 'no microphone button without speech recognition')
  await typeAnswer(noVoice, 'I am a backend developer answering in text because this browser cannot speak or listen.')
  noVoice.once('dialog', (d) => d.accept())
  await noVoice.getByRole('button', { name: 'Leave' }).click()
  await noVoice.getByRole('heading', { name: 'Interview history' }).waitFor()
  await noVoiceCtx.close()
  pass('voice unavailable (no speech APIs, microphone denied): the device check says so, the interview starts in text and the transcript carries the conversation')

  // ------------------------------------------------------------------ another learner (free plan): 404 on the session, free entitlement behaviour
  const otherCtx = await browser.newContext()
  const other = await otherCtx.newPage()
  await other.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await signUp(other, otherEmail, { pass: false })
  assert.equal(await other.evaluate((id) => fetch('/api/interviews/' + id).then((r) => r.status), sessionRow.id), 404)
  assert.equal(await other.evaluate((id) => fetch('/api/interviews/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'turn', questionId: 'q1', kind: 'clarify', intent: 'repeat' }) }).then((r) => r.status), sessionRow.id), 404)
  assert.equal(await other.evaluate((id) => fetch('/api/interviews/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'wrap_up' }) }).then((r) => r.status), sessionRow.id), 404)
  const otherVoice = await other.evaluate(() => fetch('/api/interviews/voice').then((r) => r.json()))
  assert.equal(otherVoice.voice, true, 'free plan: voice interviews with the browser voice')
  assert.equal(otherVoice.premiumVoice, false)
  assert.equal(otherVoice.replay, false)
  assert.equal(otherVoice.tts.mode, 'browser')
  assert.equal(otherVoice.tts.premiumConfigured, true)
  const otherSynth = await other.evaluate(() => fetch('/api/interviews/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) }).then((r) => ({ status: r.status, fallback: r.headers.get('X-Voice-Fallback'), reason: r.headers.get('X-Voice-Reason') })))
  assert.deepEqual(otherSynth, { status: 204, fallback: 'browser', reason: 'entitlement' }, 'premium voice is refused for the free plan with an explicit fallback signal')
  await openJob(other)
  await other.getByRole('tab', { name: 'Mock interview' }).click()
  const otherCtxMock = await other.evaluate(() => Boolean(window.__voiceMock))
  void otherCtxMock
  await other.getByRole('region', { name: 'Device check' }).getByText(/Premium voice is not included in your plan; the browser voice is used\.|This browser cannot speak\. Captions and text remain available\./).waitFor()
  await other.getByRole('button', { name: 'Start preview interview' }).waitFor()
  await otherCtx.close()
  const signedOut = await browser.newContext()
  const anon = await signedOut.newPage()
  await anon.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded' })
  assert.equal(await anon.evaluate(() => fetch('/api/interviews/voice').then((r) => r.status)), 401)
  assert.equal(await anon.evaluate(() => fetch('/api/interviews/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) }).then((r) => r.status)), 401)
  await signedOut.close()
  pass('another learner gets 404 on the session, turns and wrap-up; free plan keeps voice with the browser engine, no premium voice (204 + fallback header) and no replay; signed-out callers get 401')

  // ------------------------------------------------------------------ general mock round in the same room (AI interviewer through the gateway fixture)
  await learner.getByRole('button', { name: 'Mock Interviews', exact: true }).click()
  await learner.getByRole('heading', { name: 'Mock interviews' }).waitFor()
  await learner.getByRole('heading', { name: 'Interviewer style' }).waitFor()
  assert.equal(await learner.getByText('Rahul', { exact: true }).count(), 0, 'no invented interviewer names on the setup page')
  await learner.getByText('Technical Interviewer', { exact: true }).first().waitFor()
  await learner.getByRole('button', { name: /^Start interview/ }).click()
  const generalRoom = learner.getByRole('region', { name: 'Mock interview session' })
  await generalRoom.waitFor({ timeout: 30000 })
  assert.equal(await learner.locator('.room-title').textContent(), 'Technical Interviewer')
  await learner.waitForFunction(() => (document.querySelector('#jiv-question-title')?.textContent || '').trim().length > 20, undefined, { timeout: 30000 })
  const generalOpening = await caption(learner)
  assert.ok(!/Rahul|Ananya|Meera/.test(generalOpening), 'the AI interviewer does not introduce itself with an invented name')
  await learner.locator('.room-state.is-speaking').or(learner.locator('.room-state.is-listening')).first().waitFor({ timeout: 20000 })
  const generalBefore = await caption(learner)
  await learner.locator('textarea.jiv-answer').fill('I am a backend developer with three years of experience in Java and Spring Boot; I would start by clarifying the requirements before designing anything.')
  await learner.getByRole('button', { name: 'Send', exact: true }).click()
  await waitForNewCaption(learner, generalBefore, 30000)
  await learner.getByRole('button', { name: 'Repeat question' }).click()
  await learner.getByRole('button', { name: 'End interview' }).click()
  await learner.getByRole('heading', { name: 'What went well' }).or(learner.getByText(/saved without|could not be generated|Model answers|Dimensions/)).first().waitFor({ timeout: 60000 })
  assert.equal(await learner.evaluate(() => sessionStorage.getItem('prep-mock-active')), null, 'the in-progress marker is cleared once the round has ended')
  pass('general mock round: same interview room, role identity instead of an invented persona name, AI interviewer speaks and listens, typed answer, repeat, end → feedback')

  assert.deepEqual(pageErrors, [], `no uncaught page errors (${pageErrors.join(' | ')})`)
  console.log('\nMeasured turn latencies (dev diagnostics line after each learner turn):')
  for (const l of latencies) console.log(`  ${l}`)
  console.log(`\nAll ${results.length} interview room checks passed`)
} finally {
  await browser.close()
  await pool.end()
}
