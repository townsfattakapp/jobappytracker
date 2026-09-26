// Complete learner journey (Phase 8) with a brand-new synthetic learner and no
// localStorage pre-seeding: sign up → onboarding → career target → curriculum
// → goal + learning plan → complete a concept → discover a relevant job →
// (locked) → pricing → test upgrade → match → resume → resume/JD analysis →
// curriculum gaps → application strategy → networking drafts → Prepare for
// This Job → 14-day plan → calendar → Knowledge Workspace → Mock Interview
// for This Job → feedback → weakness mapping → add weaknesses → tracker →
// refresh / sign out / sign in → persistence. Then an independent FREE
// learner journey. Runs against the dev server (AI_FIXTURE=1) and the
// confirmed local development database only.
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
const SHOTS = process.env.E2E_SHOTS_DIR || 'scratch/journey'
const stamp = Date.now()
const password = 'Journey-E2E-Only-2026!'
const adminEmail = `journey-admin-${stamp}@example.invalid`
const learnerEmail = `journey-learner-${stamp}@example.invalid`
const freeEmail = `journey-free-${stamp}@example.invalid`
const companyName = `Nimbus Payments ${stamp}`
const companySlug = `nimbus-payments-${stamp}`
const results = []
const pass = (msg) => {
  results.push(msg)
  console.log(`PASS: ${msg}`)
}
const field = (scope, label) => scope.locator(`xpath=//label[span[normalize-space(.)=${JSON.stringify(label)}]]//*[self::input or self::select or self::textarea]`)
const ALL_FEATURES = ['jobs.discovery', 'jobs.personalizedFeed', 'jobs.advancedFilters', 'jobs.matching', 'jobs.curriculumGaps', 'resume.profile', 'jobs.resumeAnalysis', 'jobs.applicationStrategy', 'jobs.networkingBasic', 'jobs.referrals', 'jobs.outreachTracker', 'jobs.preparationBasic', 'jobs.preparation', 'jobs.interviewKit', 'jobs.readinessAdvanced', 'tracker.basic', 'mock.integrations', 'interview.jobPreview', 'interview.jobFull', 'interview.adaptive', 'interview.coding', 'interview.systemDesign', 'interview.feedbackDetailed', 'interview.curriculumMapping', 'interview.reattempt', 'interview.history', 'ai.highLimits']

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
const RESUME_LINES = ['Ravi Menon', 'Backend Developer', 'ravi.menon@example.invalid | +91 98765 11111', 'Summary', 'Backend developer building Java services on PostgreSQL.', 'Skills', 'Java, Spring Boot, PostgreSQL, Docker, Git', 'Experience', 'Software Engineer at Orbit Systems', 'Jan 2023 - Present', '- Built REST APIs in Spring Boot serving 25k daily requests', '- Fixed a production incident by finding the root cause in the connection pool', '- Owned the migration to PostgreSQL 15', 'Projects', 'Ledger Service - Spring Boot and PostgreSQL service with Docker deployment', 'Education', 'B.Tech Computer Science, Anna University, 2022']

async function signUp(page, email) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(page)
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
}
async function signIn(page, email) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  // After a sign-out the app stays usable as a guest; the sidebar button opens the auth panel.
  const opener = page.getByRole('button', { name: /Sign in/i }).first()
  if (await opener.count()) await opener.click()
  await page.getByRole('tab', { name: 'Sign in' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in to Prep' }).click()
  await waitForSession(page)
}
const localState = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}'))
async function openJob(page) {
  await page.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await page.getByRole('heading', { name: 'Job discovery' }).waitFor()
  await page.getByLabel('Search jobs').fill(companyName)
  await page.getByRole('button', { name: `Backend Engineer at ${companyName}` }).first().click()
  await page.getByRole('heading', { name: 'Backend Engineer' }).waitFor()
}
function interviewAnswer(section, isFollowUp, thinUsedRef) {
  if (isFollowUp) return 'Going deeper: I would start with the configuration and the data model, then check indexes and connection pooling, measure with metrics and for example compare p99 latency before and after; the trade-off is complexity against throughput.'
  if (/Introduction/.test(section)) return 'I am a backend developer with three years in Java and Spring Boot services on PostgreSQL, and I want to work on payments infrastructure.'
  if (/Resume/.test(section)) return 'Ledger Service is a Spring Boot and PostgreSQL service deployed with Docker. I chose Spring Boot for its ecosystem; the alternative was Node, but the trade-off was team familiarity. The hardest problem was a root cause in the connection pool; the fix was pool sizing and as a result latency dropped. I would redesign the batch jobs.'
  if (/Technical deep dive|Role fundamentals/.test(section) && !thinUsedRef.used) {
    thinUsedRef.used = true
    return 'It is a common thing.'
  }
  if (/Technical|fundamentals/.test(section)) return 'I would define it first, then explain how it works internally, where I used it in production, and the trade-off: it adds complexity but improves reliability, however it can fail under load, so I would add monitoring and failure handling.'
  if (/Coding/.test(section)) return 'Approach: use a hash map in a single pass, storing each value and checking the complement. Time complexity O(n) and space complexity O(n). Edge cases: empty input, duplicates, negative numbers and very large inputs. Dry run: for input [2,7,11,15] with target 9 it returns [0,1].'
  if (/System design/.test(section)) return 'Requirements first: create and read orders. The API exposes REST endpoints; the data model has orders and items; components are the API service, a cache and the database; request flow goes client to API to database with validation and logging at each hop; error handling returns typed errors and retries. The trade-off of caching is staleness.'
  if (/Behavioural/.test(section)) return 'When our release failed last year, the situation was a broken payment job. I decided to own it: I investigated the logs, wrote a retry with backoff and paired with QA. As a result failures dropped 90% and we shipped on time. I learned to add alerts first.'
  return 'What does success look like in the first ninety days, and how is the team measuring reliability today?'
}
async function runInterview(page) {
  const thin = { used: false }
  let sawFollowUp = false
  for (let step = 0; step < 40; step++) {
    if (await page.getByRole('heading', { name: 'Interview report' }).count()) break
    const titleEl = page.locator('#jiv-question-title')
    if (!(await titleEl.count())) {
      await page.waitForTimeout(400)
      continue
    }
    const before = (await titleEl.textContent()).trim()
    const section = (await page.getByText(/Section \d+ of \d+:/).textContent()).replace(/^.*: /, '')
    const isFollowUp = (await page.getByText('Follow-up', { exact: true }).count()) > 0
    if (isFollowUp) sawFollowUp = true
    await page.locator('#jiv-answer').fill(interviewAnswer(section, isFollowUp, thin))
    await page.getByRole('button', { name: isFollowUp ? 'Answer follow-up' : 'Submit answer' }).click()
    await page.waitForFunction((prev) => {
      const el = document.querySelector('#jiv-question-title')
      return !el || el.textContent.trim() !== prev || Array.from(document.querySelectorAll('h3')).some((h) => h.textContent.trim().startsWith('Interview report'))
    }, before, { timeout: 20000 })
  }
  await page.getByRole('heading', { name: 'Interview report' }).waitFor({ timeout: 20000 })
  return sawFollowUp
}

const browser = await chromium.launch()
let jobId = null
try {
  // ------------------------------------------------------------------ admin seeds one relevant job
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const admin = await adminCtx.newPage()
  const pageErrors = []
  admin.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(admin, adminEmail)
  await admin.getByRole('button', { name: 'Skip setup for now' }).click()
  const adminUser = (await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])).rows[0]
  await pool.query('INSERT INTO user_roles ("userId", role, "grantedBy") VALUES ($1, $2, $3)', [adminUser.id, 'admin', 'e2e'])
  assert.equal(await admin.evaluate((f) => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: f }) }).then((r) => r.status), ALL_FEATURES), 200)
  assert.equal(await admin.evaluate(() => fetch('/api/admin/plans/free', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: ['jobs.discovery', 'tracker.basic', 'resume.profile', 'jobs.networkingBasic', 'jobs.preparationBasic', 'interview.jobPreview'] }) }).then((r) => r.status)), 200)
  const company = await admin.evaluate((body) => fetch('/api/admin/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()), { name: companyName, slug: companySlug, website: 'https://nimbus-payments.example.com', careersUrl: 'https://nimbus-payments.example.com/careers', headquarters: 'Hyderabad, India' })
  assert.ok(company.id, `company created (${JSON.stringify(company).slice(0, 120)})`)
  const job = await admin.evaluate((body) => fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()), { companyId: company.id, title: 'Backend Engineer', roleCategory: 'backend', level: 'mid', description: 'Build and operate Java services for the payments platform with Spring Boot, PostgreSQL and Kafka. You will own APIs end to end.', requiredSkills: 'Java, Spring Boot, SQL', preferredSkills: 'Kafka, Docker', experienceMin: 2, experienceMax: 5, employmentType: 'full_time', workMode: 'hybrid', locationCity: 'Hyderabad', locationCountry: 'India', region: 'india', applyUrl: `https://nimbus-payments.example.com/careers/jobs/${stamp}`, expiresAt: '2027-01-31' })
  assert.ok(job.id, `job created (${JSON.stringify(job).slice(0, 160)})`)
  jobId = job.id
  const published = await admin.evaluate((id) => fetch('/api/admin/jobs/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transition: 'publish' }) }).then((r) => r.status), jobId)
  assert.equal(published, 200)
  pass('admin seeds one relevant, published job through the admin API and enables the plan features')

  // ------------------------------------------------------------------ new learner: sign up and onboarding
  const learnerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const learner = await learnerCtx.newPage()
  learner.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(learner, learnerEmail)
  await learner.getByText(/Step 1 of 12 · Welcome/).waitFor({ timeout: 20000 })
  await learner.getByRole('button', { name: 'Start setup' }).click()
  await learner.getByRole('group', { name: 'Career target' }).getByRole('button', { name: 'Backend', exact: true }).click()
  await learner.getByText(/Recommended path:/).waitFor()
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByLabel('Years of experience').fill('3')
  await learner.getByRole('group', { name: 'Experience level' }).getByRole('button', { name: 'Intermediate' }).click()
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByLabel('Skills', { exact: true }).fill('Java, Spring Boot, SQL')
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.locator('input[type="file"][aria-label="Resume file"]').setInputFiles({ name: 'ravi-resume.pdf', mimeType: 'application/pdf', buffer: minimalPdf(RESUME_LINES) })
  await learner.getByText('Uploaded: ravi-resume').waitFor()
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByLabel('City', { exact: true }).fill('Hyderabad')
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByRole('group', { name: 'Region preference' }).getByRole('button', { name: 'India only', exact: true }).click()
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByRole('button', { name: 'Skip' }).click()
  await learner.getByRole('group', { name: 'Hours per day' }).getByRole('button', { name: '2 h/day' }).click()
  await learner.getByRole('button', { name: 'Continue' }).click()
  await learner.getByRole('heading', { name: 'Your recommended curriculum' }).waitFor()
  const trackCount = await learner.locator('.onb-tracks li').count()
  assert.ok(trackCount >= 3, `career path recommends tracks (${trackCount})`)
  await learner.getByRole('button', { name: 'Create my learning plan' }).click()
  await learner.getByText(/Learning plan created: \d+ tracks scheduled/).waitFor()
  await learner.getByRole('button', { name: 'Save job preferences' }).click()
  await learner.getByRole('button', { name: 'Go to my Career Command Center' }).click()
  await learner.getByRole('heading', { name: 'Career goal' }).waitFor()
  await learner.getByText('Backend plan').waitFor()
  await learner.waitForTimeout(1200)
  const state0 = await localState(learner)
  assert.equal(state0.goals.length, 1)
  assert.equal(state0.goals[0].careerPathId, 'path-java-backend')
  assert.equal(state0.goals[0].hoursPerDay, 2)
  const tasks0 = state0.roadmap.flatMap((d) => d.tasks)
  assert.ok(tasks0.length > 0, `roadmap scheduled ${tasks0.length} tasks`)
  const prefsRow = (await pool.query('SELECT "roleCategories", skills, "experienceYears", "regionPreference", locations FROM learner_job_preferences p JOIN users u ON u.id = p."userId" WHERE u.email = $1', [learnerEmail])).rows[0]
  assert.deepEqual(prefsRow.roleCategories, ['backend'])
  assert.deepEqual(prefsRow.skills, ['Java', 'Spring Boot', 'SQL'])
  assert.equal(prefsRow.experienceYears, 3)
  assert.equal(prefsRow.regionPreference, 'india')
  assert.deepEqual(prefsRow.locations, ['Hyderabad'])
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM resumes r JOIN users u ON u.id = r."userId" WHERE u.email = $1', [learnerEmail])).rows[0].n, 1)
  assert.equal(state0.preferences.onboarding.completedAt !== null, true)
  await learner.screenshot({ path: `${SHOTS}/command-center.png`, fullPage: true })
  pass('onboarding: career target → experience → skills → resume → location → India preference → availability → curriculum recommendation creates the goal and roadmap → job preferences saved → Career Command Center')

  // ------------------------------------------------------------------ the learning roadmap is a paid view: paywall → pricing → test upgrade
  assert.equal(await learner.evaluate((id) => fetch('/api/jobs/' + id + '/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status), jobId), 402, 'premium analysis locked on the free plan')
  await learner.getByRole('button', { name: 'Goals & Roadmap', exact: true }).click()
  await learner.getByRole('heading', { name: 'Choose your plan' }).waitFor({ timeout: 20000 })
  await learner.getByRole('link', { name: 'See plans and upgrade' }).click()
  await learner.waitForURL(/\/pricing$/)
  await learner.getByRole('region', { name: 'Free', exact: true }).getByText('Current plan', { exact: true }).waitFor()
  const proCard = learner.getByRole('region', { name: 'Prep Pro', exact: true })
  await proCard.getByRole('button', { name: 'Upgrade to Prep Pro' }).click()
  await learner.getByRole('dialog', { name: /Test checkout/ }).getByRole('button', { name: 'Complete test payment' }).click()
  await learner.getByText('Prep Pro is active on your account.').waitFor({ timeout: 20000 })
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('heading', { name: 'Career goal' }).waitFor()
  await learner.getByText('Prep Pro', { exact: true }).first().waitFor()
  pass('the learning roadmap is a paid view: the paywall leads to pricing and a verified test upgrade unlocks it')

  // ------------------------------------------------------------------ complete a concept
  await learner.getByRole('button', { name: 'Goals & Roadmap', exact: true }).click()
  const firstTask = state0.roadmap.flatMap((d) => d.tasks.map((t) => ({ ...t, date: d.date.slice(0, 10) }))).sort((a, b) => a.date.localeCompare(b.date))[0]
  await learner.getByLabel('Select date').fill(firstTask.date)
  const taskRow = learner.locator('li[data-task]').filter({ hasText: firstTask.title }).first()
  await taskRow.waitFor()
  await taskRow.getByRole('button', { name: 'Mark as completed' }).click()
  await learner.waitForTimeout(800)
  assert.equal((await localState(learner)).roadmap.flatMap((d) => d.tasks).find((t) => t.id === firstTask.id).status, 'Completed')
  await learner.getByRole('button', { name: 'Command Center', exact: true }).click()
  await learner.getByText(/1 of \d+ tasks completed/).waitFor()
  pass('learner completes the first scheduled concept from the roadmap and the Command Center reflects it')

  // ------------------------------------------------------------------ discover the relevant job (ranked by onboarding preferences)
  await openJob(learner)
  await learner.getByText('Matches your target role: Backend').first().waitFor()
  pass('the seeded job is discovered and ranked by the preferences captured during onboarding')

  // ------------------------------------------------------------------ match, resume/JD, gaps, strategy, networking
  await openJob(learner)
  await learner.getByRole('tab', { name: 'Match' }).click()
  await learner.getByRole('button', { name: 'Analyse my fit' }).click()
  await learner.getByText(/Analyses today: 1 of/).waitFor()
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner.getByText('From your resume').first().waitFor()
  await learner.getByText(/AI reasoning · from the evidence below/).waitFor()
  await learner.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await learner.getByRole('button', { name: 'Add gaps to learning plan' }).click()
  const addTracks = learner.getByRole('button', { name: /^Add \d+ tracks?$/ })
  if (await addTracks.count()) {
    await addTracks.click()
    await learner.getByText(/Added \d+ tracks? to your goal/).first().waitFor()
  } else await learner.getByRole('button', { name: 'Close' }).click()
  await learner.getByRole('tab', { name: 'Application strategy' }).click()
  await learner.getByRole('button', { name: 'Build my application strategy' }).click()
  await learner.getByText('Suggested application sequence').waitFor()
  await learner.getByRole('tab', { name: 'Networking & Referrals' }).click()
  await learner.getByRole('button', { name: 'Generate drafts' }).click()
  await learner.getByText(/Facts used:/).first().waitFor()
  await learner.getByText('[Name]').first().waitFor()
  pass('match, resume/JD analysis with labelled AI reasoning, curriculum gaps, application strategy and truthful networking drafts all run on the upgraded account')

  // ------------------------------------------------------------------ prepare, plan, workspace
  await learner.getByRole('tab', { name: 'Prepare' }).click()
  await learner.getByRole('button', { name: 'Prepare for This Job' }).click()
  await learner.getByText('Preparation blueprint').waitFor()
  await learner.getByRole('button', { name: 'Goals & Roadmap', exact: true }).click()
  await learner.getByText('Goal schedule and priorities').click()
  await learner.getByLabel('Study hours per day').fill('8')
  await learner.waitForTimeout(600)
  await openJob(learner)
  await learner.getByRole('tab', { name: 'Prepare' }).click()
  await learner.getByRole('group', { name: 'Plan duration' }).getByRole('button', { name: '14-day focused plan' }).click()
  await learner.getByRole('button', { name: 'Preview 14-day plan' }).click()
  const preview = learner.getByRole('region', { name: 'Plan preview' })
  await preview.waitFor()
  const previewTasks = Number(/(\d+) new tasks?/.exec(await preview.textContent())[1])
  const before = (await localState(learner)).roadmap.flatMap((d) => d.tasks).length
  if (previewTasks > 0) {
    await preview.getByRole('button', { name: 'Add preparation plan' }).click()
    await learner.getByText(/Added \d+ preparation tasks? to your calendar/).waitFor()
    await learner.waitForTimeout(800)
    assert.equal((await localState(learner)).roadmap.flatMap((d) => d.tasks).length, before + previewTasks)
  }
  const refItem = learner.locator('.prep-item').filter({ has: learner.locator('.prep-item-ref') }).first()
  const refText = (await refItem.locator('.prep-item-ref').textContent()).trim()
  const topicTitle = refText.replace(/^.*→\s*/, '').trim()
  await learner.getByRole('button', { name: `Open ${topicTitle}` }).first().click()
  await learner.getByText(new RegExp('> ' + topicTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).waitFor()
  await learner.getByRole('button', { name: '← Back' }).click()
  await learner.getByRole('heading', { name: 'Backend Engineer' }).waitFor()
  pass(`Prepare for This Job builds the blueprint, the 14-day plan adds ${previewTasks} tasks to the existing calendar, and a blueprint item opens the exact Knowledge Workspace`)

  // ------------------------------------------------------------------ mock interview, feedback, weaknesses, plan
  await learner.getByRole('button', { name: 'Mock Interview for This Job' }).click()
  await learner.getByRole('region', { name: 'Derived configuration' }).getByText(/Standard difficulty from the mid-level listing/).waitFor()
  await learner.getByLabel('Interview duration').selectOption('30')
  await learner.getByRole('button', { name: 'Start interview', exact: true }).click()
  await learner.getByText(/Section 1 of \d+: Introduction/).waitFor()
  const sawFollowUp = await runInterview(learner)
  assert.ok(sawFollowUp, 'the interviewer reacted with a follow-up')
  await learner.getByRole('heading', { name: 'Question-level feedback' }).waitFor()
  await learner.getByRole('heading', { name: 'Weaknesses mapped to your curriculum' }).waitFor()
  const weakItem = learner.locator('section[aria-labelledby="jiv-weak"] .prep-item').filter({ has: learner.locator('.prep-item-ref') }).first()
  await weakItem.waitFor()
  await learner.getByRole('button', { name: 'Preview weakness plan' }).click()
  const weakPreview = learner.getByRole('region', { name: 'Weakness plan preview' })
  await weakPreview.waitFor()
  const weakTasks = Number(/(\d+) new tasks?/.exec(await weakPreview.textContent())[1])
  const beforeWeak = (await localState(learner)).roadmap.flatMap((d) => d.tasks).length
  if (weakTasks > 0) {
    await weakPreview.getByRole('button', { name: 'Add weaknesses to learning plan' }).click()
    await learner.getByText(new RegExp(`Added ${weakTasks} preparation tasks? to your calendar`)).waitFor()
    await learner.waitForTimeout(800)
    assert.equal((await localState(learner)).roadmap.flatMap((d) => d.tasks).length, beforeWeak + weakTasks)
  } else assert.match(await weakPreview.textContent(), /already on your calendar or completed/)
  const sessionRow = (await pool.query('SELECT s.status, s.report FROM job_interview_sessions s JOIN users u ON u.id = s."userId" WHERE u.email = $1', [learnerEmail])).rows[0]
  assert.equal(sessionRow.status, 'completed')
  assert.ok(sessionRow.report.weaknesses.length > 0)
  pass(`job mock interview completes with evidence-based feedback, weaknesses mapped to curriculum topics, and the weakness plan ${weakTasks > 0 ? `adds ${weakTasks} tasks` : 'reports the topics are already scheduled'}`)

  // ------------------------------------------------------------------ tracker, refresh, sign out / sign in
  await learner.getByRole('button', { name: 'Back to interviews' }).click()
  await learner.getByRole('tab', { name: 'Tracker' }).click()
  await learner.getByRole('button', { name: 'Add to Application Tracker' }).first().click()
  await learner.getByText(/Tracked as/).waitFor()
  await learner.getByRole('button', { name: 'Command Center', exact: true }).click()
  await learner.getByRole('heading', { name: 'Applications' }).waitFor()
  await learner.getByText(/Backend Engineer · Nimbus Payments/).first().waitFor()
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('heading', { name: 'Career goal' }).waitFor()
  await learner.waitForTimeout(800)
  const afterRefresh = await localState(learner)
  assert.equal(afterRefresh.goals.length, 1)
  assert.equal(afterRefresh.applications.length, 1)
  await learner.getByRole('button', { name: 'Sign out' }).click()
  await learner.waitForTimeout(1000)
  await learner.evaluate(() => localStorage.removeItem('job-app-tracker-v2'))
  await signIn(learner, learnerEmail)
  await learner.getByText('Loaded from cloud').waitFor({ timeout: 20000 })
  await learner.getByRole('heading', { name: 'Career goal' }).waitFor()
  await learner.waitForTimeout(1200)
  const restored = await localState(learner)
  assert.equal(restored.goals.length, 1, 'goal restored from the cloud after a clean sign-in')
  assert.equal(restored.goals[0].id, state0.goals[0].id)
  assert.equal(restored.applications.length, 1)
  assert.ok(restored.roadmap.flatMap((d) => d.tasks).some((t) => t.status === 'Completed'))
  assert.equal(restored.preferences.onboarding.completedAt !== null, true, 'onboarding stays completed after sign-in')
  const billing = await learner.evaluate(() => fetch('/api/billing/subscription').then((r) => r.json()))
  assert.equal(billing.plan.id, 'pro')
  await openJob(learner)
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.getByRole('table', { name: 'Interview attempts' }).getByText('Full interview').waitFor()
  await learner.screenshot({ path: `${SHOTS}/journey-end.png`, fullPage: true })
  pass('tracker entry, learning plan, completed task, onboarding state, Pro plan and interview history all persist across refresh and a clean sign out / sign in')
  await learnerCtx.close()

  // ------------------------------------------------------------------ FREE learner journey
  const freeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const free = await freeCtx.newPage()
  free.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(free, freeEmail)
  await free.getByRole('button', { name: 'Start setup' }).click()
  await free.getByRole('group', { name: 'Career target' }).getByRole('button', { name: 'Backend', exact: true }).click()
  await free.getByRole('button', { name: 'Continue' }).click()
  await free.getByLabel('Years of experience').fill('1')
  await free.getByRole('button', { name: 'Continue' }).click()
  await free.getByRole('button', { name: 'Skip' }).click()
  await free.getByRole('button', { name: 'Skip' }).click()
  await free.getByRole('button', { name: 'Skip' }).click()
  await free.getByRole('group', { name: 'Region preference' }).getByRole('button', { name: 'India only', exact: true }).click()
  await free.getByRole('button', { name: 'Continue' }).click()
  await free.getByRole('button', { name: 'Skip' }).click()
  await free.getByRole('button', { name: 'Continue' }).click()
  await free.getByRole('button', { name: 'Create my learning plan' }).click()
  await free.getByRole('button', { name: 'Save job preferences' }).click()
  await free.getByRole('button', { name: 'Go to my Career Command Center' }).click()
  await free.getByRole('heading', { name: 'Career goal' }).waitFor()
  await free.getByText('Free plan.').waitFor()
  await free.getByRole('link', { name: 'See plans' }).waitFor()
  await openJob(free)
  await free.getByRole('tab', { name: 'Match' }).click()
  await free.getByRole('region', { name: /Compatibility analysis \(Prep Pro\)/ }).waitFor()
  assert.equal(await free.evaluate((id) => fetch('/api/jobs/' + id + '/resume-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status), jobId), 402)
  await free.getByRole('tab', { name: 'Mock interview' }).click()
  await free.getByRole('button', { name: 'Start preview interview' }).click()
  await free.getByText(/Preview interview/).waitFor()
  for (let i = 0; i < 4; i++) {
    if (await free.getByRole('heading', { name: 'Interview report' }).count()) break
    const el = free.locator('#jiv-question-title')
    if (!(await el.count())) {
      await free.waitForTimeout(400)
      continue
    }
    const before = (await el.textContent()).trim()
    await free.locator('#jiv-answer').fill('I would start by understanding the requirement, then design the solution carefully and measure the result.')
    await free.getByRole('button', { name: 'Submit answer' }).click()
    await free.waitForFunction((prev) => { const q = document.querySelector('#jiv-question-title'); return !q || q.textContent.trim() !== prev || Array.from(document.querySelectorAll('h3')).some((h) => h.textContent.trim().startsWith('Interview report')) }, before, { timeout: 20000 })
  }
  await free.getByRole('heading', { name: 'Interview report' }).waitFor({ timeout: 20000 })
  assert.equal(await free.getByRole('heading', { name: 'Question-level feedback' }).count(), 0, 'preview report is summary only')
  await free.getByText('Detailed feedback', { exact: true }).waitFor()
  await free.getByRole('button', { name: 'Back to interviews' }).click()
  await free.getByRole('tab', { name: 'Tracker' }).click()
  await free.getByRole('button', { name: 'Add to Application Tracker' }).first().click()
  await free.getByText(/Tracked as/).waitFor()
  await free.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
  await free.getByRole('region', { name: 'Free', exact: true }).getByText('Current plan', { exact: true }).waitFor()
  const freeState = (await pool.query('SELECT count(*)::int AS n FROM job_interview_sessions s JOIN users u ON u.id = s."userId" WHERE u.email = $1 AND s.mode = $2', [freeEmail, 'preview'])).rows[0].n
  assert.equal(freeState, 1)
  await free.screenshot({ path: `${SHOTS}/free-pricing.png`, fullPage: true })
  pass('FREE learner: onboarding with skips creates a plan, Command Center shows the free plan, match and resume analysis stay locked, the preview interview gives summary-only feedback, the tracker works, and pricing shows the current plan')
  await freeCtx.close()

  const critical = pageErrors.filter((e) => !/favicon/i.test(e))
  assert.deepEqual(critical, [], `no page errors: ${critical.join('\n')}`)
  pass('no browser page errors during the journeys')
  console.log(`\nAll ${results.length} learner journey checks passed.`)
} finally {
  await browser.close()
  await pool.query('DELETE FROM jobs WHERE "companyId" IN (SELECT id FROM companies WHERE slug = $1)', [companySlug])
  await pool.query('DELETE FROM companies WHERE slug = $1', [companySlug])
  await pool.query('DELETE FROM admin_audit_log WHERE "actorId" IN (SELECT id FROM users WHERE email = ANY($1))', [[adminEmail, learnerEmail, freeEmail]])
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [[adminEmail, learnerEmail, freeEmail]])
  await pool.end()
}
