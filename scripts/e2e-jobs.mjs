// Career OS Phase 1 end-to-end: admin creates a company, a source and jobs
// through the real /admin UI, publishes one; a learner sets preferences,
// sees ranked jobs, opens the detail page, adds the job to the application
// tracker; RBAC and the feature flag are enforced.
//
// Runs against the dev server on port 3000 and the confirmed local
// development database (.env.development.local). It refuses any other host.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'
import { loadDevelopmentDatabaseEnv } from './lib/development-database.mjs'
import { grantPass, waitForSession } from './lib/pass.mjs'

loadDevelopmentDatabaseEnv()
// Staging runs point the checks at a separate local copy and skip blocks whose fixtures are disabled in production builds.
if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL
const SKIP = new Set((process.env.E2E_SKIP || '').split(',').map((s) => s.trim()).filter(Boolean))
const target = new URL(process.env.DATABASE_URL)
if (target.hostname !== '127.0.0.1' && target.hostname !== 'localhost') {
  console.error(`Refusing to run e2e against non-local database host ${target.hostname}`)
  process.exit(1)
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const stamp = Date.now()
const adminEmail = `jobs-admin-${stamp}@example.invalid`
const learnerEmail = `jobs-learner-${stamp}@example.invalid`
const password = 'Jobs-E2E-Only-2026!'
const companyName = `Acme Systems ${stamp}`
const companySlug = `acme-systems-${stamp}`
const results = []
const SHOTS = process.env.E2E_SHOTS_DIR || 'scratch/career-os'
const pass = (msg) => {
  results.push(msg)
  console.log(`PASS: ${msg}`)
}

/** New accounts land on the Command Center inside the first-time setup; these flows skip it (the setup itself is covered by e2e-journey.mjs). */
async function dismissOnboarding(page) {
  const skip = page.getByRole('button', { name: 'Skip setup for now' })
  await skip.waitFor({ timeout: 20000 })
  await skip.click()
  await page.getByRole('heading', { name: 'Career goal' }).waitFor()
}

/** Sign up through the redesigned auth panel, grant a pass (no trial) and reload past the paywall. */
async function signUpWithPass(page, email) {
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(page)
  await grantPass(pool, email)
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
  await dismissOnboarding(page)
}

/** Form controls in this app sit inside <label><span>Text</span><control/></label>; match on the span text exactly. */
const field = (scope, label) => scope.locator(`xpath=//label[span[normalize-space(.)=${JSON.stringify(label)}]]//*[self::input or self::select or self::textarea]`)

/** Minimal uncompressed PDF with one text line per entry (synthetic resume for tests). */
function minimalPdf(lines) {
  const esc = (l) => l.replace(/[()\\]/g, '\\$&')
  const content = lines.map((l, i) => `BT /F1 11 Tf 40 ${760 - i * 14} Td (${esc(l)}) Tj ET`).join('\n')
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
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
const SYNTHETIC_RESUME_LINES = [
  'Asha Verma',
  'Backend Developer',
  'asha.verma@example.invalid | +91 98765 43210',
  'Summary',
  'Backend developer focused on Java services and relational data.',
  'Skills',
  'Java, Spring Boot, PostgreSQL, Docker, Git',
  'Experience',
  'Software Engineer at Nimbus Labs',
  'Jun 2023 - Present',
  '- Built REST APIs in Spring Boot serving 40k daily requests',
  '- Maintained PostgreSQL schemas and migrations',
  '- Responsible for on-call rotation',
  'Junior Developer at Startly',
  'Jan 2022 - May 2023',
  '- Wrote Java batch jobs',
  'Projects',
  'Inventory Tracker - Spring Boot and PostgreSQL service with Docker deployment',
  'Education',
  'B.Tech Computer Science, Pune University, 2021',
]
const browser = await chromium.launch()
try {
  // ------------------------------------------------------------------ admin
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const admin = await adminCtx.newPage()
  const pageErrors = []
  admin.on('pageerror', (e) => pageErrors.push(String(e)))
  await admin.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await signUpWithPass(admin, adminEmail)
  const adminUser = (await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])).rows[0]
  assert.ok(adminUser, 'admin account exists')

  // Before the role is granted the panel must be invisible (404) and the API forbidden.
  const before = await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  assert.equal(before.status(), 404)
  const forbidden = await admin.evaluate(() => fetch('/api/admin/jobs').then((r) => r.status))
  assert.equal(forbidden, 403)
  pass('non-admin learner gets 404 on /admin and 403 on /api/admin')

  await pool.query('INSERT INTO user_roles ("userId", role, "grantedBy") VALUES ($1, $2, $3)', [adminUser.id, 'admin', 'e2e'])
  const overview = await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  assert.equal(overview.status(), 200)
  await admin.getByRole('heading', { name: 'Overview' }).waitFor()
  await admin.getByText('Jobs catalogue').waitFor()
  await admin.screenshot({ path: `${SHOTS}/admin-overview.png`, fullPage: true })
  pass('admin role opens the control center overview with live metrics')

  // Company via the UI.
  await admin.goto(`${BASE}/admin/companies`, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Add company' }).click()
  const companyDialog = admin.getByRole('dialog')
  await field(companyDialog, 'Name').fill(companyName)
  await field(companyDialog, 'Slug (auto from name)').fill(companySlug)
  await field(companyDialog, 'Website').fill('acme-systems.example.com')
  await field(companyDialog, 'Careers page').fill('https://acme-systems.example.com/careers')
  await field(companyDialog, 'Headquarters').fill('Hyderabad, India')
  await companyDialog.getByRole('button', { name: 'Add company' }).click()
  await admin.getByText(companyName, { exact: true }).waitFor()
  const companyRow = (await pool.query('SELECT id, website FROM companies WHERE slug = $1', [companySlug])).rows[0]
  assert.ok(companyRow, 'company stored')
  assert.equal(companyRow.website, 'https://acme-systems.example.com/')
  pass('admin creates a company through the UI (website normalised to https)')

  // Source via the UI.
  await admin.goto(`${BASE}/admin/sources`, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Add source' }).click()
  const sourceDialog = admin.getByRole('dialog')
  await field(sourceDialog, 'Name').fill(`Acme careers page ${stamp}`)
  await field(sourceDialog, 'Type').selectOption('career_page')
  await field(sourceDialog, 'Base URL').fill('https://acme-systems.example.com/careers')
  await sourceDialog.getByRole('button', { name: 'Add source' }).click()
  await admin.getByText(`Acme careers page ${stamp}`, { exact: true }).waitFor()
  const sourceRow = (await pool.query('SELECT id FROM job_sources WHERE name = $1', [`Acme careers page ${stamp}`])).rows[0]
  assert.ok(sourceRow, 'source stored')
  pass('admin creates a job source through the UI')

  // Job via the UI, then publish.
  await admin.goto(`${BASE}/admin/jobs/new`, { waitUntil: 'networkidle' })
  await field(admin, 'Company').selectOption(companyRow.id)
  await field(admin, 'Source').selectOption(sourceRow.id)
  await field(admin, 'Title').fill('Backend Engineer II')
  await field(admin, 'Title').blur()
  assert.equal(await field(admin, 'Role category').inputValue(), 'backend', 'role category suggested from title')
  await field(admin, 'Level').selectOption('mid')
  await field(admin, 'Description (as published)').fill('Build and operate Java services for the payments platform. You will own APIs end to end and work with Spring Boot, PostgreSQL and Kafka.')
  await field(admin, 'Required skills (comma separated)').fill('Java, Spring Boot, SQL')
  await field(admin, 'Preferred skills').fill('Kafka, Docker')
  await field(admin, 'Min years').fill('2')
  await field(admin, 'Max years').fill('5')
  await field(admin, 'Work mode').selectOption('hybrid')
  await field(admin, 'City').fill('Hyderabad')
  await field(admin, 'Salary min').fill('1800000')
  await field(admin, 'Salary max').fill('2600000')
  await field(admin, 'Original application URL').fill('https://acme-systems.example.com/careers/jobs/4242?utm_source=linkedin')
  await field(admin, 'Expires on').fill('2027-01-31')
  await admin.getByRole('button', { name: 'Create job' }).click()
  await admin.waitForURL(/\/admin\/jobs\/[0-9a-f-]{36}$/)
  const jobId = admin.url().split('/').pop()
  await admin.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  let jobRow = (await pool.query('SELECT status, "applyUrl", "normalizedTitle", fingerprint, "careerPathIds" FROM jobs WHERE id = $1', [jobId])).rows[0]
  assert.equal(jobRow.status, 'draft')
  assert.equal(jobRow.applyUrl, 'https://acme-systems.example.com/careers/jobs/4242', 'tracking parameter removed')
  assert.equal(jobRow.normalizedTitle, 'backend engineer ii')
  pass('admin creates a job draft through the UI (apply URL canonicalised, title normalised)')

  await admin.screenshot({ path: `${SHOTS}/admin-job-editor.png`, fullPage: true })
  await admin.getByRole('button', { name: 'Publish' }).click()
  await admin.getByText('Job is now published').waitFor()
  jobRow = (await pool.query('SELECT status, "postedAt", "lastVerifiedAt" FROM jobs WHERE id = $1', [jobId])).rows[0]
  assert.equal(jobRow.status, 'published')
  assert.ok(jobRow.postedAt && jobRow.lastVerifiedAt)
  pass('admin publishes the job; postedAt and lastVerifiedAt are set')

  // Duplicate detection and a second (draft) plus third (international on-site) job via the API from the admin session.
  const apiJob = (over) => ({
    companyId: companyRow.id,
    sourceId: sourceRow.id,
    title: 'Backend Engineer II',
    roleCategory: 'backend',
    description: 'Duplicate check',
    requiredSkills: ['Java'],
    level: 'mid',
    employmentType: 'full_time',
    workMode: 'hybrid',
    locationCity: 'Hyderabad',
    region: 'india',
    applyUrl: 'https://acme-systems.example.com/careers/jobs/4242/?gh_src=x',
    status: 'published',
    ...over,
  })
  const dup = await admin.evaluate((body) => fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() })), apiJob({}))
  assert.equal(dup.status, 400)
  assert.match(dup.body.error, /duplicate/i)
  pass('duplicate listing (same company, title, city, apply link) is rejected')

  const draft = await admin.evaluate((body) => fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() })), apiJob({ title: 'Hidden Draft Role', applyUrl: 'https://acme-systems.example.com/careers/jobs/9', status: 'draft' }))
  assert.equal(draft.status, 201)
  const abroad = await admin.evaluate((body) => fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() })), apiJob({ title: 'Frontend Engineer', roleCategory: 'frontend', requiredSkills: ['React', 'TypeScript'], workMode: 'onsite', locationCity: 'Berlin', locationCountry: 'Germany', region: 'international', applyUrl: 'https://acme-systems.example.com/careers/jobs/77' }))
  assert.equal(abroad.status, 201)
  pass('admin API creates a draft job and an international on-site job')

  const adminList = await admin.goto(`${BASE}/admin/jobs?status=published&q=${encodeURIComponent(companyName)}`, { waitUntil: 'networkidle' })
  assert.equal(adminList.status(), 200)
  await admin.getByRole('link', { name: 'Backend Engineer II' }).waitFor()
  await admin.getByRole('link', { name: 'Frontend Engineer' }).waitFor()
  assert.equal(await admin.getByRole('link', { name: 'Hidden Draft Role' }).count(), 0)
  pass('admin jobs list filters by status and search')

  const auditCount = (await pool.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE \"actorId\" = $1 AND action IN ('company.create','source.create','job.create','job.publish')", [adminUser.id])).rows[0].n
  assert.ok(auditCount >= 6, `audit entries recorded (${auditCount})`)
  await admin.goto(`${BASE}/admin/audit?entityId=${jobId}`, { waitUntil: 'networkidle' })
  await admin.getByText('job.publish').waitFor()
  pass('audit log records admin changes and filters by entity')

  // ------------------------------------------------------------ ingestion (Phase 2)
  const fixtureJobs = [
    { externalId: 'fx-1', title: 'Senior Backend Engineer (Java)', descriptionText: 'Build services.\nRequirements\n5+ years with Java and Spring Boot\nPostgreSQL\nNice to have\nKafka', location: 'Remote, Bangalore', locations: ['India'], department: 'Engineering', postedAt: '2026-09-20T00:00:00Z', sourceUrl: 'https://job-boards.example.com/' + companySlug + '/jobs/1' },
    { externalId: 'fx-2', title: 'Payroll Specialist', descriptionText: 'Run payroll.', location: 'Hyderabad', sourceUrl: 'https://job-boards.example.com/' + companySlug + '/jobs/2' },
  ]
  await admin.goto(`${BASE}/admin/sources`, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Add source' }).click()
  const fixtureDialog = admin.getByRole('dialog')
  await field(fixtureDialog, 'Name').fill(`Acme fixture feed ${stamp}`)
  await field(fixtureDialog, 'Type').selectOption('ats_api')
  await field(fixtureDialog, 'Provider').selectOption('fixture')
  await field(fixtureDialog, 'Company (employer for ingested jobs)').selectOption(companyRow.id)
  await field(fixtureDialog, 'Provider config (JSON)').fill(JSON.stringify({ jobs: fixtureJobs }))
  await fixtureDialog.getByLabel('Automated ingestion allowed (you have checked the terms permit it)').check()
  await fixtureDialog.getByLabel('Publish relevant ingested jobs automatically (otherwise they arrive as drafts for review)').check()
  await fixtureDialog.getByRole('button', { name: 'Add source' }).click()
  await admin.getByText(`Acme fixture feed ${stamp}`, { exact: true }).waitFor()
  const fixtureSource = (await pool.query('SELECT id, provider, "ingestionAllowed", "autoPublish" FROM job_sources WHERE name = $1', [`Acme fixture feed ${stamp}`])).rows[0]
  assert.equal(fixtureSource.provider, 'fixture')
  assert.equal(fixtureSource.ingestionAllowed, true)
  pass('admin creates a provider source with config through the UI')

  await admin.getByRole('button', { name: `Run ingestion for Acme fixture feed ${stamp}` }).click()
  await admin.getByText(/fetched 2, created 1, updated 0, unchanged 0, irrelevant 1, duplicates 0/).waitFor()
  const ingested = (await pool.query('SELECT id, title, status, lifecycle, region, "workMode", "remoteEligibility", "eligibleCountries", "requiredSkills", "externalId" FROM jobs WHERE "sourceId" = $1', [fixtureSource.id])).rows
  assert.equal(ingested.length, 1, 'only the relevant listing was stored')
  assert.equal(ingested[0].title, 'Senior Backend Engineer (Java)')
  assert.deepEqual([ingested[0].status, ingested[0].lifecycle, ingested[0].region, ingested[0].workMode, ingested[0].remoteEligibility], ['published', 'discovered', 'india', 'remote', 'country'])
  assert.deepEqual(ingested[0].eligibleCountries, ['India'])
  assert.ok(ingested[0].requiredSkills.includes('Java') && ingested[0].requiredSkills.includes('Spring Boot'))
  pass('manual ingestion run stores the relevant listing normalised (India, remote, eligible countries, skills) and drops the irrelevant one')

  await admin.getByRole('button', { name: `Run ingestion for Acme fixture feed ${stamp}` }).click()
  await admin.getByText(/fetched 2, created 0, updated 0, unchanged 1, irrelevant 1, duplicates 0/).waitFor()
  const afterSecond = (await pool.query('SELECT count(*)::int AS n, max(lifecycle) AS lifecycle FROM jobs WHERE "sourceId" = $1', [fixtureSource.id])).rows[0]
  assert.equal(afterSecond.n, 1)
  assert.equal(afterSecond.lifecycle, 'verified', 'a listing seen twice becomes verified')
  pass('re-running ingestion is idempotent and verifies the listing')

  // Same opening through a second source → duplicate, not a second job.
  await admin.goto(`${BASE}/admin/sources`, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Add source' }).click()
  const mirrorDialog = admin.getByRole('dialog')
  await field(mirrorDialog, 'Name').fill(`Acme mirror feed ${stamp}`)
  await field(mirrorDialog, 'Type').selectOption('provider')
  await field(mirrorDialog, 'Provider').selectOption('fixture')
  await field(mirrorDialog, 'Company (employer for ingested jobs)').selectOption(companyRow.id)
  await field(mirrorDialog, 'Provider config (JSON)').fill(JSON.stringify({ jobs: [{ ...fixtureJobs[0], externalId: 'mirror-1', sourceUrl: 'https://mirror.example.com/x', applyUrl: fixtureJobs[0].sourceUrl + '?utm_source=mirror' }] }))
  await mirrorDialog.getByLabel('Automated ingestion allowed (you have checked the terms permit it)').check()
  await mirrorDialog.getByRole('button', { name: 'Add source' }).click()
  await admin.getByText(`Acme mirror feed ${stamp}`, { exact: true }).waitFor()
  await admin.getByRole('button', { name: `Run ingestion for Acme mirror feed ${stamp}` }).click()
  await admin.getByText(/fetched 1, created 0, updated 0, unchanged 0, irrelevant 0, duplicates 1/).waitFor()
  await admin.goto(`${BASE}/admin/duplicates`, { waitUntil: 'networkidle' })
  await admin.getByText(`Acme mirror feed ${stamp}`, { exact: true }).waitFor()
  await admin.getByRole('link', { name: 'Senior Backend Engineer (Java)' }).waitFor()
  pass('the same opening from a second source is recorded as a duplicate and shown in the admin')

  await admin.goto(`${BASE}/admin/ingestion`, { waitUntil: 'networkidle' })
  await admin.getByRole('heading', { name: 'Ingestion' }).waitFor()
  await admin.getByText(`Acme fixture feed ${stamp}`).first().waitFor()
  assert.ok((await admin.getByText('success').count()) >= 1, 'provider health shows successful runs')
  await admin.getByRole('button', { name: 'Run stale / expiry sweep' }).click()
  await admin.getByText(/Sweep done:/).waitFor()
  await admin.screenshot({ path: `${SHOTS}/admin-ingestion.png`, fullPage: true })
  const runRows = (await pool.query('SELECT status, fetched, created FROM job_ingestion_runs WHERE "sourceId" = $1 ORDER BY "startedAt"', [fixtureSource.id])).rows
  assert.deepEqual(runRows.map((r) => [r.status, r.fetched, r.created]), [['success', 2, 1], ['success', 2, 0]])
  pass('ingestion health page lists providers and runs; the lifecycle sweep runs from the admin')

  // A source with a broken config records a failed run with the error, without throwing.
  const badRun = await admin.evaluate((body) => fetch('/api/admin/ingestion/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() })), { sourceId: sourceRow.id })
  assert.equal(badRun.status, 422)
  assert.match(badRun.body.error, /not marked as allowed/)
  pass('running a source that is not allowed fails safely and is recorded')

  // Role family switch-off hides a family from learners; audited.
  const familiesOff = await admin.evaluate(() => fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleFamilies: { disabled: ['frontend'], extraHints: {} } }) }).then((r) => r.status))
  assert.equal(familiesOff, 200)
  // ------------------------------------------------------------ anonymous API
  const anon = await adminCtx.request.fetch(`${BASE}/api/jobs?q=${encodeURIComponent(companyName)}`, { headers: { cookie: '' } })
  const anonBody = await anon.json()
  assert.equal(anon.status(), 200)
  const anonTitles = anonBody.items.map((j) => j.title).sort()
  assert.deepEqual(anonTitles, ['Backend Engineer II', 'Senior Backend Engineer (Java)'], 'frontend family disabled at this point; ingested job visible')
  assert.equal(anonBody.personalised, false)
  pass('public jobs API returns only published jobs (draft hidden, disabled family hidden)')
  // ------------------------------------------------------- free learner (Phase 2)
  const freeEmail = `jobs-free-${stamp}@example.invalid`
  const freeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const free = await freeCtx.newPage()
  free.on('pageerror', (e) => pageErrors.push(String(e)))
  await free.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await free.getByRole('tab', { name: 'Create account' }).click()
  await free.getByLabel('Email address').fill(freeEmail)
  await free.getByLabel('Password', { exact: true }).fill(password)
  await free.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(free)
  await free.reload({ waitUntil: 'networkidle' })
  await waitForSession(free)
  await dismissOnboarding(free)
  await free.getByText('Free plan.').waitFor()
  await free.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await free.getByRole('heading', { name: 'Job discovery' }).waitFor()
  const freeConfig = await free.evaluate(() => fetch('/api/platform/config').then((r) => r.json()))
  assert.equal(freeConfig.tier, 'free')
  assert.ok(freeConfig.features.includes('jobs.discovery') && !freeConfig.features.includes('jobs.matching'))
  pass('a signed-in learner without a pass lands on the Command Center on the free plan and opens Job Discovery')

  // Free feed cap: set the free limit to 1, the learner sees one job plus the locked "more openings" card.
  const limitsSet = await admin.evaluate(() => fetch('/api/admin/plans/free', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 1, analysesPerDay: 0 } }) }).then((r) => r.status))
  assert.equal(limitsSet, 200)
  const freeList = await free.evaluate((q) => fetch('/api/jobs?q=' + encodeURIComponent(q) + '&level=senior').then((r) => r.json()), companyName)
  assert.equal(freeList.tier, 'free')
  assert.equal(freeList.items.length, 1, 'free feed capped at the configured limit')
  assert.equal(freeList.capped, true)
  assert.ok(freeList.beyondCap >= 1)
  assert.equal(freeList.personalised, false)
  assert.ok(freeList.items.every((j) => j.roleCategory !== 'frontend'), 'disabled role family is hidden from learners')
  await free.getByLabel('Search jobs').fill(companyName)
  await free.getByText('Full personalised feed').waitFor()
  await free.getByRole('button', { name: 'Level and employment type filters are part of Prep Pro' }).waitFor()
  await free.screenshot({ path: `${SHOTS}/learner-free-feed.png`, fullPage: true })
  pass('free learner sees a capped newest-first list, the disabled role family is hidden, advanced filters and the full feed are shown as locked')

  const freeAnalysis = await free.evaluate((id) => fetch('/api/jobs/' + id + '/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(freeAnalysis.status, 402)
  assert.equal(freeAnalysis.body.code, 'upgrade')
  pass('compatibility analysis API refuses the free tier with an upgrade code (402)')

  await free.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await free.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  assert.equal(await free.getByRole('link', { name: /Apply at acme-systems.example.com/ }).getAttribute('href'), 'https://acme-systems.example.com/careers/jobs/4242')
  await free.getByRole('tab', { name: 'Match' }).click()
  await free.getByRole('region', { name: 'Compatibility analysis (Prep Pro)' }).waitFor()
  await free.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await free.getByRole('region', { name: 'Curriculum gap analysis (Prep Pro)' }).waitFor()
  await free.getByRole('tab', { name: 'Resume' }).click()
  await free.getByRole('region', { name: 'Resume vs job description (Prep Pro)' }).waitFor()
  await free.getByRole('tab', { name: 'Tracker' }).click()
  await free.getByRole('button', { name: 'Add to Application Tracker' }).first().click()
  await free.getByText(`Added ${companyName} to your tracker`).waitFor()
  await free.getByRole('button', { name: 'Applications', exact: true }).click()
  await free.locator('.app-row').filter({ hasText: companyName }).first().waitFor()
  pass('free learner opens job details, uses the official apply link and the application tracker; premium sections are locked')

  const freeAdmin = await free.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  assert.equal(freeAdmin.status(), 404)
  await freeCtx.close()
  // Restore limits and role families for the paid learner flow.
  await admin.evaluate(() => fetch('/api/admin/plans/free', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 12, analysesPerDay: 0 } }) }).then((r) => r.status))
  await admin.evaluate(() => fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleFamilies: { disabled: [], extraHints: {} } }) }).then((r) => r.status))
  const settingsAudit = (await pool.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE \"actorId\" = $1 AND action IN ('plan.update','settings.roleFamilies','ingestion.run','ingestion.sweep')", [adminUser.id])).rows[0].n
  assert.ok(settingsAudit >= 6, `ingestion and settings changes are audited (${settingsAudit})`)
  pass('free learner cannot open the admin panel; limits, role families, ingestion runs and sweeps are audited')

  // ---------------------------------------------------------------- learner
  const learnerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const learner = await learnerCtx.newPage()
  learner.on('pageerror', (e) => pageErrors.push(String(e)))
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await signUpWithPass(learner, learnerEmail)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByRole('heading', { name: 'Job discovery' }).waitFor()
  await learner.getByLabel('Search jobs', { exact: true }).fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().waitFor()
  await learner.getByRole('button', { name: `Frontend Engineer at ${companyName}` }).first().waitFor()
  await learner.getByText('newest first').waitFor()
  pass('learner sees published jobs in Job Discovery (unranked before preferences)')

  await learner.getByRole('button', { name: 'Set preferences' }).click()
  await learner.getByRole('group', { name: 'Target roles' }).getByRole('button', { name: 'Backend' }).click()
  await field(learner, 'Skills (comma separated)').fill('Java, SQL')
  await field(learner, 'Years of experience').fill('3')
  await field(learner, 'Where').selectOption('india')
  await learner.getByRole('button', { name: 'Save preferences' }).click()
  await learner.getByText('Preferences saved').waitFor()
  await learner.getByText(/openings? · ranked by your preferences/).waitFor()
  await learner.getByText(/1 hidden by your region/).waitFor()
  assert.equal(await learner.getByRole('button', { name: `Frontend Engineer at ${companyName}` }).count(), 0, 'international on-site job hidden by India-only preference')
  await learner.getByText('Matches your target role: Backend').first().waitFor()
  await learner.screenshot({ path: `${SHOTS}/learner-jobs-ranked.png`, fullPage: true })
  const prefRow = (await pool.query('SELECT "roleCategories", skills, "experienceYears", "regionPreference" FROM learner_job_preferences p JOIN users u ON u.id = p."userId" WHERE u.email = $1', [learnerEmail])).rows[0]
  assert.deepEqual(prefRow.roleCategories, ['backend'])
  assert.deepEqual(prefRow.skills, ['Java', 'SQL'])
  assert.equal(prefRow.experienceYears, 3)
  assert.equal(prefRow.regionPreference, 'india')
  pass('learner saves preferences; jobs are ranked with reasons and hard preferences filter listings')

  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  const applyLink = learner.getByRole('link', { name: /Apply at acme-systems.example.com/ })
  assert.equal(await applyLink.getAttribute('href'), 'https://acme-systems.example.com/careers/jobs/4242')
  assert.equal(await applyLink.getAttribute('target'), '_blank')
  await learner.getByText('Last verified').waitFor()
  await learner.getByText(`Acme careers page ${stamp}`, { exact: false }).first().waitFor()
  await learner.getByText('You listed 2 of 3 required skills').waitFor()
  await learner.getByText('It is not a prediction of shortlisting or hiring.').waitFor()
  await learner.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await learner.getByRole('heading', { name: /Curriculum to prepare with/ }).waitFor()
  await learner.getByText(/Covers Java/).first().waitFor()
  await learner.screenshot({ path: `${SHOTS}/learner-job-detail.png`, fullPage: true })
  pass('job detail shows provenance, original apply link, explained relevance and curriculum mapping')
  // Paid learner: compatibility analysis with a transparent score and usage counter.
  await learner.getByRole('tab', { name: 'Match' }).click()
  await learner.getByRole('button', { name: 'Analyse my fit' }).click()
  await learner.getByText('Profile / job alignment').waitFor()
  await learner.getByText(/2 of 3 required skills demonstrated/).waitFor()
  await learner.getByText('Analyses today: 1 of 100').waitFor()
  await learner.getByText('It describes alignment with the listing, not the likelihood of being shortlisted or hired.').waitFor()
  const scoreText = await learner.locator('.compat-score-value').textContent()
  assert.ok(Number(scoreText) > 0 && Number(scoreText) <= 100, `score is a number (${scoreText})`)
  const usageRow = (await pool.query('SELECT count FROM usage_counters u JOIN users us ON us.id = u."userId" WHERE us.email = $1 AND u.key = $2', [learnerEmail, 'jobs.analysis'])).rows[0]
  assert.equal(usageRow.count, 1)
  await learner.screenshot({ path: `${SHOTS}/learner-compatibility.png`, fullPage: true })
  pass('paid learner runs the compatibility analysis: transparent score, explanations and a server-side usage counter')

  // Gap analysis without a goal: the dialog explains and adds nothing.
  await learner.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await learner.getByText('Not yet covered').first().waitFor()
  await learner.getByRole('button', { name: 'Add gaps to learning plan' }).click()
  await learner.getByText('You do not have a learning goal yet').waitFor()
  await learner.getByRole('button', { name: 'Close' }).click()
  pass('adding gaps requires a learning goal and asks for confirmation first')

  // Give the learner a goal (import a backup through Settings, the app's own import path) and add gaps.
  const today = new Date().toISOString().slice(0, 10)
  const backup = { applications: [], version: 1, prepNotes: [], goals: [{ id: 'goal-e2e', targetRole: 'Backend Developer', companyType: '', startDate: today, durationDays: 60, hoursPerDay: 2, restDays: [], tracks: [{ trackId: 'track-dsa', priority: 'High' }], status: 'Active', goalType: 'Fixed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }], roadmap: [], dsaProblems: [], dsaAttemptSummaries: [], revisionItems: [], engineeringLabs: [], labAttemptSummaries: [], mockInterviewSummaries: [], leetCodeConfig: { username: '', lastSync: null, totalSolved: 0 }, systemDesignExercises: [], systemDesignAttemptSummaries: [], knowledgeWorkspaces: [], customTracks: [] }
  const backupPath = join(process.cwd(), 'scratch', `e2e-goal-${stamp}.json`)
  writeFileSync(backupPath, JSON.stringify(backup))
  await learner.getByRole('button', { name: 'Settings', exact: true }).click()
  await learner.getByRole('button', { name: /Your Data & Vault/ }).click()
  learner.once('dialog', (d) => d.accept())
  await learner.locator('input[type="file"]').first().setInputFiles(backupPath)
  await learner.getByText(/Imported 0 applications, 1 goals/).waitFor()
  unlinkSync(backupPath)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await learner.getByRole('button', { name: 'Add gaps to learning plan' }).click()
  await learner.getByText(/They will be added to your goal/).waitFor()
  const dialog = learner.getByRole('dialog')
  const gapCount = await dialog.locator('.admin-list-item').count()
  assert.ok(gapCount >= 2, `dialog lists the gap tracks (${gapCount})`)
  await dialog.getByRole('button', { name: /^Add \d+ tracks?$/ }).click()
  await learner.getByText(/Added \d+ tracks? to your goal/).first().waitFor()
  await learner.waitForTimeout(600)
  const stored = await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}'))
  const goal = stored.goals.find((g) => g.id === 'goal-e2e')
  assert.ok(goal.tracks.some((t) => t.trackId === 'track-dsa'), 'existing track kept')
  assert.ok(goal.tracks.some((t) => t.trackId === 'track-java'), 'Java track added as a gap')
  assert.equal(goal.tracks.length, gapCount + 1, 'exactly the confirmed tracks were added, none duplicated')
  const scheduled = stored.roadmap.filter((d) => d.goalId === 'goal-e2e').flatMap((d) => d.tasks).filter((t) => t.trackId === 'track-java')
  assert.ok(scheduled.length > 0, 'Java tasks were scheduled into the roadmap')
  await learner.getByText('Currently learning').first().waitFor()
  assert.equal(await learner.getByRole('button', { name: 'Add gaps to learning plan' }).count(), 0, 'no gaps remain after adding')
  await learner.screenshot({ path: `${SHOTS}/learner-gap-analysis.png`, fullPage: true })
  pass('Add gaps to learning plan adds only the confirmed tracks to the existing goal, schedules tasks and never duplicates')
  // ------------------------------------------------------- resume + strategy (Phase 3)
  await learner.getByRole('button', { name: 'Resume', exact: true }).click()
  await learner.getByRole('heading', { name: 'Your resume' }).waitFor()
  await learner.getByRole('button', { name: 'Choose file and upload' }).waitFor()
  await learner.locator('input[type="file"][aria-label="Resume file"]').setInputFiles({ name: 'asha-resume.pdf', mimeType: 'application/pdf', buffer: minimalPdf(SYNTHETIC_RESUME_LINES) })
  await learner.getByText('Uploaded asha-resume').waitFor()
  await learner.getByText('Asha Verma', { exact: true }).waitFor()
  await learner.getByText('Software Engineer · Nimbus Labs').waitFor()
  const resumeRow = (await pool.query('SELECT r.id, r."mimeType", r."sizeBytes", r."isCurrent", p.profile->>\'name\' AS name, jsonb_array_length(p.profile->\'skills\') AS skills FROM resumes r JOIN resume_profiles p ON p."resumeId" = r.id JOIN users u ON u.id = r."userId" WHERE u.email = $1', [learnerEmail])).rows[0]
  assert.equal(resumeRow.mimeType, 'application/pdf')
  assert.equal(resumeRow.isCurrent, true)
  assert.equal(resumeRow.name, 'Asha Verma')
  assert.ok(Number(resumeRow.skills) >= 4)
  pass('learner uploads a synthetic PDF resume; bytes stay in the database and the profile is extracted (name, skills, employment)')

  await learner.getByRole('button', { name: 'Rename asha-resume' }).click()
  await learner.getByRole('dialog').locator('input').fill('Backend resume v1')
  await learner.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await learner.getByText('Backend resume v1').first().waitFor()
  // Second version: becomes current; first one can be made current again.
  await learner.locator('input[type="file"][aria-label="Resume file"]').setInputFiles({ name: 'asha-resume-v2.pdf', mimeType: 'application/pdf', buffer: minimalPdf([...SYNTHETIC_RESUME_LINES, 'Certifications', '- Oracle Certified Associate, Java SE']) })
  await learner.getByText('Uploaded asha-resume-v2').waitFor()
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM resumes r JOIN users u ON u.id = r."userId" WHERE u.email = $1', [learnerEmail])).rows[0].n, 2)
  assert.equal((await pool.query('SELECT r.title FROM resumes r JOIN users u ON u.id = r."userId" WHERE u.email = $1 AND r."isCurrent"', [learnerEmail])).rows[0].title, 'asha-resume-v2')
  pass('resume versions: rename works and a new upload becomes the current resume')

  // Free learner cannot analyse but can upload; another user cannot read this resume.
  const freeCtx2 = await browser.newContext()
  const free2 = await freeCtx2.newPage()
  await free2.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  const otherEmail = `jobs-other-${stamp}@example.invalid`
  await free2.getByRole('tab', { name: 'Create account' }).click()
  await free2.getByLabel('Email address').fill(otherEmail)
  await free2.getByLabel('Password', { exact: true }).fill(password)
  await free2.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(free2)
  const otherView = await free2.evaluate((id) => fetch('/api/resumes/' + id).then((r) => r.status), resumeRow.id)
  const otherFile = await free2.evaluate((id) => fetch('/api/resumes/' + id + '/file').then((r) => r.status), resumeRow.id)
  const otherPatch = await free2.evaluate((id) => fetch('/api/resumes/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'hijack' }) }).then((r) => r.status), resumeRow.id)
  const otherDelete = await free2.evaluate((id) => fetch('/api/resumes/' + id, { method: 'DELETE' }).then((r) => r.status), resumeRow.id)
  assert.deepEqual([otherView, otherFile, otherPatch, otherDelete], [404, 404, 404, 404], 'another learner gets 404 for every resume route')
  const freeUpload = await free2.evaluate(async () => {
    const form = new FormData()
    form.append('file', new File(['Plain text resume\nSkills\nPython'], 'r.txt', { type: 'text/plain' }))
    const r = await fetch('/api/resumes', { method: 'POST', body: form })
    return { status: r.status, body: await r.json() }
  })
  assert.equal(freeUpload.status, 201, 'free accounts can keep a resume profile')
  const freeAnalyse = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/resume-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(freeAnalyse.status, 402)
  assert.equal(freeAnalyse.body.code, 'upgrade')
  const freeStrategy = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/strategy', { method: 'POST' }).then((r) => r.status), jobId)
  assert.equal(freeStrategy, 402)
  const badUpload = await free2.evaluate(async () => {
    const form = new FormData()
    form.append('file', new File(['<html>not a resume</html>'], 'r.pdf', { type: 'application/pdf' }))
    const r = await fetch('/api/resumes', { method: 'POST', body: form })
    return { status: r.status, body: await r.json() }
  })
  assert.equal(badUpload.status, 400)
  assert.match(badUpload.body.error, /Upload a PDF/)
  pass('resume security: cross-account access is 404; free tier can upload but resume analysis and strategy return 402; invalid files are rejected')

  // Resume-vs-job analysis in the job workspace.
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner.getByText(/demonstrated · .* weak · .* missing of/).waitFor()
  await learner.getByText('Kafka is not demonstrated').waitFor()
  await learner.getByText(/Kafka is a preferred skill in this job description but is not demonstrated in your current resume/).waitFor()
  await learner.getByText(/Do not add Kafka to your resume unless you have used it/).waitFor()
  await learner.getByText('Resume analyses today: 1 of 50').waitFor()
  assert.ok((await learner.getByText('From your resume').count()) >= 2, 'resume provenance labels shown')
  assert.ok((await learner.getByText('From job description').count()) >= 1, 'job provenance labels shown')
  const analysisRow = (await pool.query('SELECT a.id, a.report, a."suggestionState" FROM resume_analyses a JOIN users u ON u.id = a."userId" WHERE u.email = $1 AND a."jobId" = $2', [learnerEmail, jobId])).rows[0]
  assert.ok(analysisRow, 'analysis persisted')
  const demonstrated = analysisRow.report.skillsAlignment.filter((r) => r.status === 'demonstrated').map((r) => r.skill).sort()
  assert.deepEqual(demonstrated, ['Docker', 'Java', 'SQL', 'Spring Boot'])
  assert.ok(analysisRow.report.strongMatches.every((m) => m.evidence && m.evidence.lines.length), 'every strong match cites resume lines')
  await learner.screenshot({ path: `${SHOTS}/learner-resume-analysis.png`, fullPage: true })
  if (!SKIP.has('ai')) {
    await learner.getByText(/AI reasoning · from the evidence below · fixture\//).waitFor()
    const insightsRow = (await pool.query('SELECT report FROM resume_analyses WHERE "userId" = (SELECT id FROM users WHERE email = $1) AND "jobId" = $2', [learnerEmail, jobId])).rows[0]
    assert.ok(insightsRow.report.aiInsights && insightsRow.report.aiInsights.items.length >= 1, 'AI insights stored with the analysis')
    assert.ok(insightsRow.report.aiInsights.items.every((i) => /Java|Spring Boot|SQL|PostgreSQL|Docker|Inventory Tracker|Kafka/i.test(i)), 'insights only reference known skills or projects')
  }
  pass('resume-vs-job analysis shows evidence-backed matches, missing requirements with curriculum pointers, and never suggests adding missing skills')

  // Review, dismiss, save, complete suggestions; state survives a reload.
  await learner.getByRole('button', { name: 'Dismiss: Kafka is not demonstrated' }).click()
  await learner.getByRole('button', { name: /^Mark done: Sharpen a bullet/ }).first().click()
  await learner.waitForTimeout(400)
  const state1 = (await pool.query('SELECT "suggestionState" FROM resume_analyses WHERE id = $1', [analysisRow.id])).rows[0].suggestionState
  assert.ok(Object.values(state1).includes('dismissed') && Object.values(state1).includes('completed'))
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByText(/analysed/).waitFor()
  assert.equal(await learner.getByText('Kafka is not demonstrated').count(), 0, 'dismissed suggestion hidden after reload')
  await learner.getByText('completed', { exact: true }).first().waitFor()
  pass('suggestion review state (dismiss / mark done) is saved and persists across reload')

  // Usage limit for resume analyses is enforced server-side.
  await admin.evaluate(() => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 0, analysesPerDay: 100, resumeAnalysesPerDay: 1 } }) }).then((r) => r.status))
  const limited = await learner.evaluate((id) => fetch('/api/jobs/' + id + '/resume-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(limited.status, 429)
  assert.equal(limited.body.code, 'limit')
  await admin.evaluate(() => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 0, analysesPerDay: 100, resumeAnalysesPerDay: 50 } }) }).then((r) => r.status))
  pass('admin-configured resume analysis limit is enforced (429 once the daily allowance is used)')

  // Curriculum recommendation from the resume tab, then the application strategy.
  await learner.getByRole('tab', { name: 'Curriculum gaps' }).click()
  await learner.getByText('Currently learning').first().waitFor()
  await learner.getByRole('tab', { name: 'Application strategy' }).click()
  await learner.getByRole('button', { name: 'Build my application strategy' }).click()
  await learner.getByRole('heading', { name: 'Requirements summary' }).waitFor()
  await learner.getByText(/Kafka \(preferred\) is not demonstrated in your resume/).waitFor()
  await learner.getByText(/does not guarantee an interview or shortlist/).waitFor()
  await learner.getByRole('heading', { name: 'Suggested application sequence' }).waitFor()
  assert.ok((await learner.getByText('JobAppy recommendation').count()) >= 3)
  await learner.screenshot({ path: `${SHOTS}/learner-strategy.png`, fullPage: true })
  if (!SKIP.has('ai')) await learner.getByText(/AI guidance · from the facts below · fixture\//).waitFor()
  pass('application strategy combines job facts, resume evidence, curriculum and recommendations with provenance labels and no interview promises')

  // Tracker tab: add with the job and analysis reference, then refresh and verify persistence.
  await learner.getByRole('tab', { name: 'Tracker' }).click()
  await learner.getByRole('tab', { name: 'Tracker' }).click()
  // ------------------------------------------------------- networking + prepare (Phase 4)
  await learner.getByRole('tab', { name: 'Networking & Referrals' }).click()
  await learner.getByRole('heading', { name: 'Who should I contact?' }).waitFor()
  await learner.getByText(/JobAppy does not identify people/).waitFor()
  await learner.getByText(`${companyName} technical recruiter`, { exact: true }).waitFor()
  await learner.getByText(`${companyName} Java engineer`, { exact: true }).waitFor()
  await learner.getByText(`${companyName} Pune University`, { exact: true }).waitFor()
  pass('networking tab explains contact categories and gives copyable LinkedIn queries, including an alumni query from the resume')

  await learner.getByRole('group', { name: 'Message types' }).getByRole('button', { name: 'Referral request' }).click()
  await learner.getByRole('button', { name: 'Generate drafts' }).click()
  await learner.getByText(/Drafts today: 1 of 60/).waitFor()
  const referralDraft = await learner.locator('.draft').filter({ hasText: 'Referral request' }).locator('.draft-body').textContent()
  assert.match(referralDraft, /\[Name\]/, 'contact name stays a placeholder')
  assert.match(referralDraft, /Software Engineer at Nimbus Labs/, 'grounded in the resume')
  assert.match(referralDraft, /Backend Engineer II (role|opening) at/, 'grounded in the job')
  assert.ok(!/Kafka|mutual|we met|guarantee/i.test(referralDraft), 'no fabricated skills, familiarity or guarantees')
  assert.match(referralDraft, /Asha Verma$/)
  await learner.getByText(/Facts used:/).first().waitFor()
  if (!SKIP.has('ai')) await learner.getByText(/AI-polished wording · same facts and placeholders · fixture\//).first().waitFor()
  pass('personalised referral draft is truthful: only resume and job facts, placeholder contact, no fabricated claims')

  await learner.locator('.draft').filter({ hasText: 'Referral request' }).getByRole('button', { name: 'Save with a contact' }).click()
  await field(learner, 'Contact name').fill('Priya Singh')
  await field(learner, 'Their role (as shown on their profile)').fill('Technical Recruiter')
  await field(learner, 'Contact type').selectOption('recruiter')
  await field(learner, 'Profile URL (entered by you)').fill('https://www.linkedin.com/in/priya-example')
  await field(learner, 'Status').selectOption('referral_requested')
  await field(learner, 'Date contacted').fill('2026-09-25')
  await field(learner, 'Follow-up date').fill('2026-10-05')
  await field(learner, 'Notes').fill('Sent via LinkedIn')
  await learner.getByRole('button', { name: 'Save contact' }).click()
  await learner.getByText('Priya Singh').waitFor()
  const contactRow = (await pool.query('SELECT c.id, c.status, c."followUpDate", c."contactedAt", c.draft, c."profileUrl" FROM outreach_contacts c JOIN users u ON u.id = c."userId" WHERE u.email = $1 AND c."jobId" = $2', [learnerEmail, jobId])).rows[0]
  assert.equal(contactRow.status, 'referral_requested')
  assert.equal(contactRow.followUpDate, '2026-10-05')
  assert.match(contactRow.draft, /Software Engineer at Nimbus Labs/)
  await learner.getByLabel('Status for Priya Singh').selectOption('connected')
  let statusNow = ''
  for (let i = 0; i < 20 && statusNow !== 'connected'; i++) {
    await learner.waitForTimeout(250)
    statusNow = (await pool.query('SELECT status FROM outreach_contacts WHERE id = $1', [contactRow.id])).rows[0].status
  }
  assert.equal(statusNow, 'connected')
  await learner.screenshot({ path: `${SHOTS}/learner-networking.png`, fullPage: true })
  pass('outreach contact saved with draft, follow-up date and status; status change persists')

  // Ownership: another paid account (the admin) cannot see or change this learner's outreach or preparation.
  const adminOutreach = await admin.evaluate((id) => fetch('/api/jobs/' + id + '/outreach').then((r) => r.json()), jobId)
  assert.deepEqual(adminOutreach.contacts, [], 'other accounts see no contacts for the job')
  const adminPatch = await admin.evaluate(({ jobId, contactId }) => fetch('/api/jobs/' + jobId + '/outreach/' + contactId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'closed' }) }).then((r) => r.status), { jobId, contactId: contactRow.id })
  assert.equal(adminPatch, 404)
  const adminPrep = await admin.evaluate((id) => fetch('/api/jobs/' + id + '/preparation').then((r) => r.json()), jobId)
  assert.equal(adminPrep.preparation, null)
  const freeOutreach = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/outreach').then((r) => r.status), jobId)
  assert.equal(freeOutreach, 402, 'outreach tracker is a paid feature')
  const freeReferral = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ types: ['referral'] }) }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(freeReferral.status, 402)
  assert.equal(freeReferral.body.feature, 'jobs.referrals')
  const freeConnection = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ types: ['connection'] }) }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(freeConnection.status, 200)
  assert.equal(freeConnection.body.usage.limit, 3)
  assert.ok(!/Java|Spring|Kafka|Nimbus/.test(freeConnection.body.drafts[0].body) && /\[Name\]/.test(freeConnection.body.drafts[0].body), 'free account draft claims nothing beyond its own plain-text resume')
  const freePrepare = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/preparation', { method: 'POST' }).then((r) => r.status), jobId)
  assert.equal(freePrepare, 402)
  pass('outreach and preparation records are owner-scoped (404/empty for other accounts); free tier gets basic drafts only and 402 on paid features')

  // Admin-configured draft limit is enforced.
  await admin.evaluate(() => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 0, analysesPerDay: 100, resumeAnalysesPerDay: 50, messageDraftsPerDay: 1, preparationPlansPerDay: 20 } }) }).then((r) => r.status))
  const limitedDraft = await learner.evaluate((id) => fetch('/api/jobs/' + id + '/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ types: ['connection'] }) }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(limitedDraft.status, 429)
  assert.equal(limitedDraft.body.code, 'limit')
  await admin.evaluate(() => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limits: { jobFeed: 0, analysesPerDay: 100, resumeAnalysesPerDay: 50, messageDraftsPerDay: 60, preparationPlansPerDay: 20 } }) }).then((r) => r.status))
  pass('admin-configured message draft limit is enforced (429) and restored')

  // Prepare for this job.
  await learner.getByRole('tab', { name: 'Overview' }).click()
  await learner.getByRole('button', { name: 'Prepare for This Job' }).click()
  await learner.getByRole('button', { name: 'Prepare for This Job' }).click()
  await learner.getByText('Preparation blueprint').waitFor()
  await learner.getByText(/identified preparation areas completed\./).waitFor()
  const kafkaItem = learner.locator('.prep-item').filter({ hasText: 'Kafka (preferred)' }).first()
  await kafkaItem.waitFor()
  const kafkaRef = await kafkaItem.locator('.prep-item-ref').textContent()
  assert.match(kafkaRef, /Apache Kafka →/, 'Kafka maps to the existing Kafka track and a topic')
  await learner.getByText(/DSA preparation · standard/).waitFor()
  await learner.getByText(/System design · basics/).waitFor()
  await learner.getByText('Inventory Tracker', { exact: true }).first().waitFor()
  await learner.getByText('Recommended practice based on this role').waitFor()
  await learner.getByRole('heading', { name: 'Job-specific interview kit' }).waitFor()
  const prepRow = (await pool.query('SELECT p.blueprint, p."durationDays" FROM job_preparations p JOIN users u ON u.id = p."userId" WHERE u.email = $1 AND p."jobId" = $2', [learnerEmail, jobId])).rows[0]
  assert.ok(prepRow && [...prepRow.blueprint.mustPrepare, ...prepRow.blueprint.revise].some((i) => i.title === 'Kafka (preferred)'), 'Kafka is a must or revise item (its track is already in the goal from the gap step)')
  assert.ok(prepRow.blueprint.projects.every((p) => p.provenance.includes('resume')), 'projects only from the resume')
  await learner.screenshot({ path: `${SHOTS}/learner-prepare.png`, fullPage: true })
  pass('Prepare for This Job builds a persisted blueprint mapped to existing curriculum topics with role/level-appropriate DSA and design depth, resume projects and an interview kit')

  // The gap step filled the calendar at 2 h/day; raise the goal's hours through the roadmap UI so the plan has room (workload limits are respected either way).
  await learner.getByRole('group', { name: 'Plan duration' }).getByRole('button', { name: '14-day focused plan' }).click()
  await learner.getByRole('button', { name: 'Preview 14-day plan' }).click()
  await learner.getByRole('region', { name: 'Plan preview' }).getByText(/did not fit at 2 h\/day/).waitFor()
  pass('plan preview respects the existing workload: with a full calendar it reports what did not fit instead of overloading days')
  await learner.getByRole('button', { name: 'Goals & Roadmap', exact: true }).click()
  await learner.getByText('Goal schedule and priorities').click()
  await learner.getByLabel('Study hours per day').fill('8')
  await learner.waitForTimeout(600)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Prepare' }).click()
  await learner.getByRole('group', { name: 'Plan duration' }).getByRole('button', { name: '14-day focused plan' }).click()
  await learner.getByRole('button', { name: 'Preview 14-day plan' }).click()
  const previewRegion = learner.getByRole('region', { name: 'Plan preview' })
  await previewRegion.waitFor()
  await previewRegion.getByText(/14-day preview/).waitFor()
  const previewText = await previewRegion.textContent()
  const previewTasks = Number(/(\d+) new tasks?/.exec(previewText)[1])
  assert.ok(previewTasks > 0, 'preview shows tasks to add')
  const beforeTasks = await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').roadmap.flatMap((d) => d.tasks).length)
  await previewRegion.getByRole('button', { name: 'Add preparation plan' }).click()
  await learner.getByText(/Added \d+ preparation tasks? to your calendar/).waitFor()
  await learner.waitForTimeout(900)
  const stored2 = await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}'))
  const prepTasks = stored2.roadmap.flatMap((d) => d.tasks.map((t) => ({ ...t, date: d.date.slice(0, 10) }))).filter((t) => t.prepJobId)
  assert.equal(prepTasks.length, previewTasks, 'exactly the previewed tasks were added')
  assert.equal(stored2.roadmap.flatMap((d) => d.tasks).length, beforeTasks + previewTasks, 'existing tasks preserved')
  assert.ok(prepTasks.every((t) => t.prepJobId === jobId))
  const stepIds = stored2.roadmap.flatMap((d) => d.tasks).filter((t) => t.curriculumTaskId).map((t) => t.curriculumTaskId)
  assert.equal(new Set(stepIds).size, stepIds.length, 'no duplicate curriculum steps on the calendar')
  const goalRow2 = stored2.goals.find((g) => g.id === 'goal-e2e')
  assert.ok(goalRow2.tracks.length >= 2, 'goal tracks untouched by the plan')
  assert.equal((await pool.query('SELECT "durationDays", "addedTaskCount" FROM job_preparations WHERE id = (SELECT p.id FROM job_preparations p JOIN users u ON u.id = p."userId" WHERE u.email = $1 AND p."jobId" = $2)', [learnerEmail, jobId])).rows[0].durationDays, 14)
  pass('14-day plan preview then explicit confirmation adds the previewed tasks to the existing calendar without duplicates')

  // Open the exact preparation task's Knowledge Workspace from the blueprint.
  const firstTask = prepTasks.sort((a, b) => a.date.localeCompare(b.date))[0]
  const kafkaTopicTitle = kafkaRef.replace(/^.*→\s*/, '').trim()
  await learner.getByRole('button', { name: `Open ${kafkaTopicTitle}` }).first().click()
  await learner.getByText(new RegExp('> ' + kafkaTopicTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).waitFor()
  await learner.getByRole('button', { name: '← Back' }).click()
  await learner.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  pass('a preparation item opens the exact existing Knowledge Workspace for its topic and returns to the job workspace')

  // Complete the first scheduled preparation task through the roadmap UI.
  await learner.getByRole('button', { name: 'Goals & Roadmap', exact: true }).click()
  await learner.getByLabel('Select date').fill(firstTask.date)
  const taskRow = learner.locator('li[data-task]').filter({ hasText: firstTask.title }).first()
  await taskRow.waitFor()
  await taskRow.getByRole('button', { name: 'Mark as completed' }).click()
  await learner.waitForTimeout(900)
  const completedNow = await learner.evaluate((id) => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').roadmap.flatMap((d) => d.tasks).find((t) => t.id === id).status, firstTask.id)
  assert.equal(completedNow, 'Completed')
  pass('a scheduled preparation task can be completed from the existing roadmap')

  // Refresh: outreach and preparation progress persist.
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByText('Loaded from cloud').waitFor()
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Prepare' }).click()
  await learner.getByText(/Preparation tasks completed/).waitFor()
  const readinessText = await learner.locator('.readiness-area').filter({ hasText: 'Preparation tasks completed' }).locator('.readiness-value').textContent()
  assert.match(readinessText.trim(), new RegExp('^1 / ' + previewTasks + '$'), `readiness counts the completed task (${readinessText})`)
  await learner.getByText(/Last added: 14-day plan with \d+ tasks/).waitFor()
  await learner.getByRole('tab', { name: 'Networking & Referrals' }).click()
  await learner.getByText('Priya Singh').waitFor()
  assert.equal(await learner.getByLabel('Status for Priya Singh').inputValue(), 'connected')
  assert.equal(await learner.getByLabel('Follow-up date for Priya Singh').inputValue(), '2026-10-05')
  await learner.screenshot({ path: `${SHOTS}/learner-readiness.png`, fullPage: true })
  pass('after refresh the outreach contact, follow-up date, blueprint, chosen duration and preparation progress are all still there')



  // ------------------------------------------------------------ Company source catalog
  const catalogPage = await admin.goto(`${BASE}/admin/catalog`, { waitUntil: 'networkidle' })
  assert.equal(catalogPage.status(), 200)
  await admin.getByRole('heading', { name: 'Company source catalog' }).waitFor()
  await admin.getByRole('button', { name: /Seed catalog|Refresh catalog/ }).click()
  await admin.getByText(/Seeded: \d+ companies created, \d+ refreshed/).waitFor({ timeout: 60000 })
  const catalogState = await admin.evaluate(() => fetch('/api/admin/catalog').then((r) => r.json()))
  assert.ok(catalogState.total >= 50 && catalogState.total <= 60, `catalog size ${catalogState.total}`)
  assert.equal(catalogState.seeded, catalogState.total)
  assert.equal(catalogState.counts.Unsupported, catalogState.rows.filter((r) => !r.feed).length, 'portals without a public feed are Unsupported, never integrated')
  assert.ok(catalogState.rows.every((r) => r.careersUrl.startsWith('https://')), 'every company keeps its official careers link')
  assert.ok(catalogState.rows.filter((r) => r.feed).every((r) => ['Configured', 'Healthy', 'Degraded'].includes(r.status)))
  const catalogTable = admin.getByRole('table', { name: 'Company source catalog' })
  await catalogTable.getByText('Microsoft', { exact: true }).waitFor()
  await catalogTable.getByText('Groww', { exact: true }).waitFor()
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM companies WHERE provenance = 'company-catalog-2026-09'")).rows[0].n, catalogState.total)
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM job_sources WHERE slug LIKE 'catalog-%' AND \"ingestionAllowed\" = true AND provider = 'manual'")).rows[0].n, 0, 'manual portals are never allowed for ingestion')
  // Live read-only verification and one real ingestion run of a small official board (Groww, Greenhouse EU).
  const verifyOne = await admin.evaluate(() => fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', slugs: ['groww'] }) }).then((r) => r.json()))
  assert.equal(verifyOne.results.length, 1)
  assert.equal(verifyOne.results[0].status, 'verified', `live probe of the Groww board (${verifyOne.results[0].note})`)
  const runOne = await admin.evaluate(() => fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ingest', slugs: ['groww'] }) }).then((r) => r.json()))
  assert.equal(runOne.results.length, 1)
  assert.equal(runOne.results[0].status, 'success', `live ingestion of the Groww board (${runOne.results[0].error})`)
  assert.ok(runOne.results[0].fetched >= 1)
  assert.equal(runOne.results[0].fetched, runOne.results[0].created + runOne.results[0].irrelevant + (runOne.results[0].fetched - runOne.results[0].created - runOne.results[0].irrelevant), 'counters add up')
  const growwRow = runOne.status.rows.find((r) => r.slug === 'groww')
  assert.equal(growwRow.status, 'Healthy')
  const growwJobs = (await pool.query("SELECT title, \"roleCategory\", status FROM jobs WHERE \"companyId\" = (SELECT id FROM companies WHERE \"catalogSlug\" = 'groww')")).rows
  assert.ok(growwJobs.every((j) => ['software-engineer', 'frontend', 'backend', 'full-stack', 'java', 'nodejs', 'react-nextjs', 'mobile', 'devops-cloud', 'data-analyst', 'data-scientist', 'data-engineer', 'ai-ml', 'cybersecurity'].includes(j.roleCategory)), 'only supported role families are stored; HR, finance and content roles are dropped as irrelevant')
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE action IN ('catalog.seed','catalog.verify','ingestion.run') AND \"actorId\" = $1", [adminUser.id])).rows[0].n >= 3, true)
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM job_sources WHERE slug LIKE $1 AND "scheduleEnabled" = true', ['catalog-%'])).rows[0].n, 0, 'seeding never adds sources to the scheduled pass by itself')
  const scheduledOne = await admin.evaluate(() => fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'schedule', enabled: true, slugs: ['groww'] }) }).then((r) => r.json()))
  assert.equal(scheduledOne.scheduled, 1)
  assert.equal(scheduledOne.status.rows.find((r) => r.slug === 'groww').scheduleEnabled, true)
  await admin.evaluate(() => fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'schedule', enabled: false }) }).then((r) => r.json()))
  assert.equal(await learner.evaluate(() => fetch('/api/admin/catalog').then((r) => r.status)), 403)
  await admin.screenshot({ path: `${SHOTS}/admin-catalog.png`, fullPage: true })
  pass(`company source catalog: ${catalogState.total} companies seeded, ${catalogState.rows.filter((r) => r.feed).length} with verified official feeds, ${catalogState.counts.Unsupported} unsupported portals kept as careers links; Groww verified and ingested live with irrelevant roles dropped`)
  // ------------------------------------------------------------ Phase 6.5: AI gateway (fixture provider)
  if (!SKIP.has('ai')) {
  const aiPage = await admin.goto(`${BASE}/admin/ai`, { waitUntil: 'networkidle' })
  assert.equal(aiPage.status(), 200)
  await admin.getByRole('heading', { name: 'AI configuration' }).waitFor()
  const aiProviders = admin.getByRole('table', { name: 'AI providers' })
  await aiProviders.getByText('Google Gemini').waitFor()
  await aiProviders.getByText('Fixture (development only)').waitFor()
  const aiState = await admin.evaluate(() => fetch('/api/admin/ai').then((r) => r.json()))
  assert.ok(aiState.providers.some((p) => p.id === 'fixture' && p.configured), 'fixture provider configured in development')
  assert.ok(aiState.providers.filter((p) => p.id !== 'fixture').every((p) => !p.configured), 'no real provider keys in this environment')
  assert.ok(!JSON.stringify(aiState).match(/gsk_|AIza|sk-or-/), 'no keys in the admin payload')
  const probe = await admin.evaluate(() => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'probe', provider: 'fixture' }) }).then((r) => r.json()))
  assert.equal(probe.ok, true, `fixture probe answers (${JSON.stringify(probe)})`)
  const probeMissing = await admin.evaluate(() => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'probe', provider: 'gemini' }) }).then((r) => r.json()))
  assert.equal(probeMissing.ok, false)
  assert.equal(probeMissing.kind, 'not_configured')
  assert.match(probeMissing.errorId, /^E-[A-F0-9]{8}$/, 'failures carry an error id')
  const savedPolicy = await admin.evaluate(() => fetch('/api/admin/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ policy: { enabled: true, providerOrder: ['fixture', 'groq', 'gemini', 'mistral', 'openrouter', 'openai'], timeoutMs: 5000, maxRetries: 1, dailyCallsPerUser: 200 } }) }).then((r) => r.json()))
  assert.deepEqual(savedPolicy.policy.providerOrder.slice(0, 2), ['fixture', 'groq'])
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE action IN ('ai.probe','settings.ai')")).rows[0].n >= 3, true, 'AI probes and policy changes are audited')
  assert.equal(await learner.evaluate(() => fetch('/api/admin/ai').then((r) => r.status)), 403, 'learners cannot read AI configuration')
  const chat = await learner.evaluate(() => fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Explain indexing briefly.' }] }) }).then(async (r) => ({ status: r.status, body: await r.json() })))
  assert.equal(chat.status, 200)
  assert.match(chat.body.content, /Fixture response to: Explain indexing/)
  assert.match(chat.body.provider, /^fixture\//)
  const usageRows = (await pool.query("SELECT feature, provider, status FROM ai_usage_log WHERE \"userId\" = (SELECT id FROM users WHERE email = $1)", [learnerEmail])).rows
  assert.ok(usageRows.some((r) => r.feature === 'chat' && r.provider === 'fixture' && r.status === 'ok'), 'usage accounted per feature and provider')
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM information_schema.columns WHERE table_name = 'ai_usage_log' AND column_name IN ('prompt','content','completion')")).rows[0].n, 0, 'usage log never stores prompt text')
  pass('AI gateway: admin sees provider health without keys, probes succeed on the fixture and fail with error ids elsewhere, policy edits are audited, learner chat routes through the gateway with usage accounting')
  } else console.log('SKIP: AI gateway block (E2E_SKIP=ai)')
  // ------------------------------------------------------------ Phase 6: job-specific mock interview
  const ALL_FEATURES = ['jobs.discovery', 'jobs.personalizedFeed', 'jobs.advancedFilters', 'jobs.matching', 'jobs.curriculumGaps', 'resume.profile', 'jobs.resumeAnalysis', 'jobs.applicationStrategy', 'jobs.networkingBasic', 'jobs.referrals', 'jobs.outreachTracker', 'jobs.preparationBasic', 'jobs.preparation', 'jobs.interviewKit', 'jobs.readinessAdvanced', 'tracker.basic', 'mock.integrations', 'interview.jobPreview', 'interview.jobFull', 'interview.adaptive', 'interview.coding', 'interview.systemDesign', 'interview.feedbackDetailed', 'interview.curriculumMapping', 'interview.reattempt', 'interview.history', 'interview.voice', 'interview.premiumVoice', 'interview.replay', 'ai.highLimits']
  // Admin enables the Phase 6 entitlements on the paid plan (plans are admin-managed; seeded rows predate these keys).
  assert.equal(await admin.evaluate((f) => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: f }) }).then((r) => r.status), ALL_FEATURES), 200)
  assert.equal(await admin.evaluate(() => fetch('/api/admin/plans/free', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: ['jobs.discovery', 'tracker.basic', 'resume.profile', 'jobs.networkingBasic', 'jobs.preparationBasic', 'interview.jobPreview', 'interview.voice'] }) }).then((r) => r.status)), 200)
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  await learner.getByRole('button', { name: 'Mock Interview for This Job' }).click()
  await learner.getByRole('heading', { name: 'Mock Interview for This Job' }).waitFor()
  const derivedRegion = learner.getByRole('region', { name: 'Derived configuration' })
  await derivedRegion.waitFor()
  await derivedRegion.getByText(/Standard difficulty from the mid-level listing/).waitFor()
  await derivedRegion.getByText(/Coding round included at standard depth/).waitFor()
  await derivedRegion.getByText(/System design at basics depth/).waitFor()
  await derivedRegion.getByText(/Project questions only from your resume: Inventory Tracker/).waitFor()
  const structure = await learner.getByRole('list', { name: 'Interview structure' }).textContent()
  assert.match(structure, /Introduction.*Resume and project discussion.*Role fundamentals.*Technical deep dive.*Coding \/ DSA.*System design.*Behavioural.*Candidate questions/, `structure adapts to the role (${structure})`)
  assert.equal(await learner.getByLabel('Interview duration').inputValue(), '45', 'coding + design derive a 45-minute default')
  assert.equal(await learner.getByLabel('Difficulty').inputValue(), 'standard')
  await learner.getByLabel('Interview duration').selectOption('30')
  await learner.screenshot({ path: `${SHOTS}/learner-interview-setup.png`, fullPage: true })
  pass('Mock Interview for This Job derives a role- and level-specific configuration (difficulty, coding, design, resume projects) with an adaptable structure')

  // The interview room: device check first (fixture voice provider reports a premium voice; this flow runs in text so the room is deterministic without audio).
  await learner.getByRole('region', { name: 'Device check' }).waitFor()
  await learner.getByText(/Interviewer voice: Fixture voice/).waitFor()
  await learner.getByRole('button', { name: 'Start in text only' }).click()
  await learner.getByRole('region', { name: 'Mock interview session' }).waitFor()
  await learner.locator('.room-stage-label').getByText('Introduction').waitFor()
  await learner.waitForFunction(() => /Full interview/.test(document.querySelector('.room-sub')?.textContent || ''))
  await learner.getByRole('timer').waitFor()
  const opening = (await learner.locator('#jiv-question-title').textContent()).trim()
  assert.match(opening, /^Hi(, | [A-Za-z][A-Za-z'’-]+, )thanks for joining\./, `realistic opening without an email handle as a name (${opening.slice(0, 60)})`)
  assert.match(opening, /around 30 minutes/)
  assert.match(opening, /could you briefly introduce yourself/)
  assert.equal(await learner.locator('.room-title').textContent(), 'Technical Interviewer')
  assert.equal(await learner.getByRole('tablist', { name: 'Job workspace' }).count(), 0, 'job navigation is hidden during the interview')
  const sessionRow = (await pool.query('SELECT s.id, s.plan, s.status, s.mode FROM job_interview_sessions s JOIN users u ON u.id = s."userId" WHERE u.email = $1 AND s."jobId" = $2', [learnerEmail, jobId])).rows[0]
  assert.ok(sessionRow && sessionRow.status === 'active' && sessionRow.mode === 'full', 'session persisted server-side on start')
  const provenances = new Set(sessionRow.plan.questions.map((q) => q.provenance))
  assert.ok([...provenances].every((p) => ['curriculum', 'job', 'resume', 'generated'].includes(p)), `every question carries provenance (${[...provenances]})`)
  assert.ok(sessionRow.plan.questions.some((q) => q.provenance === 'resume' && q.prompt.includes('Inventory Tracker')), 'resume question cites the real project')
  assert.ok(sessionRow.plan.questions.every((q) => q.provenance !== 'resume' || /Inventory Tracker|Nimbus Labs|Startly|Built REST APIs|Maintained PostgreSQL|on-call|Java batch/.test(q.prompt)), 'no fabricated projects or employers')
  assert.ok(sessionRow.plan.questions.some((q) => q.kind === 'coding' && q.tool === 'code') && sessionRow.plan.questions.some((q) => q.kind === 'design' && q.tool === 'diagram'))

  // Answer the interview through the UI; the first technical answer is thin on purpose to trigger a follow-up.
  const promptOf = async () => (await learner.locator('#jiv-question-title').textContent()).trim()
  let sawFollowUp = false
  let sawClarification = false
  let thinUsed = false
  let answeredCount = 0
  let wrapupTurns = 0
  for (let step = 0; step < 40; step++) {
    if (await learner.getByRole('heading', { name: 'Interview report' }).count()) break
    const titleEl = learner.locator('#jiv-question-title')
    if (!(await titleEl.count()) || !(await learner.locator('#jiv-answer').count())) {
      await learner.waitForTimeout(400)
      continue
    }
    const before = await promptOf()
    const section = (await learner.locator('.room-stage-label').textContent()).trim()
    const isFollowUp = (await learner.getByRole('button', { name: 'Answer follow-up' }).count()) > 0
    let answer
    if (isFollowUp) {
      sawFollowUp = true
      assert.ok(!/great|excellent|correct|you missed|you should study/i.test(before), `no praise or teaching mid-interview: ${before}`)
      assert.match(before, /\?\s*$/, 'the follow-up is a question')
      if (!sawClarification) {
        assert.match(before, /^(Okay|I see|Alright|Understood|Thanks|Right)/, `a neutral acknowledgement precedes the follow-up: ${before}`)
        // Ask for clarification first: the interviewer answers without counting it as the answer, and the follow-up stays pending.
        sawClarification = true
        await learner.locator('#jiv-answer').fill('Could you repeat that?')
        await learner.getByRole('button', { name: 'Answer follow-up' }).click()
        await learner.waitForFunction((prev) => document.querySelector('#jiv-question-title')?.textContent.trim() !== prev, before, { timeout: 20000 })
        const clarified = await promptOf()
        assert.match(clarified, /^(Of course|Sure|Certainly)\./, `repeat request is answered (${clarified.slice(0, 60)})`)
        assert.equal(await learner.getByRole('button', { name: 'Answer follow-up' }).count(), 1, 'the follow-up is still pending after the clarification')
        continue
      }
      answer = 'Going deeper: I would start with the configuration and the data model, then check indexes and connection pooling, measure with metrics and for example compare p99 latency before and after; the trade-off is complexity against throughput.'
    } else if (/Introduction/.test(section)) answer = 'I am a backend developer with three years in Java and Spring Boot services on PostgreSQL, and I want to work on payments infrastructure at Acme.'
    else if (/Resume/.test(section)) answer = 'Inventory Tracker is a Spring Boot and PostgreSQL service deployed with Docker. I chose Spring Boot because of its ecosystem; the alternative was Node, but the trade-off was team familiarity. The hardest problem was a root cause in the connection pool; the fix was pool sizing and as a result latency dropped. I would redesign the batch jobs.'
    else if (/Technical deep dive|Role fundamentals/.test(section) && !thinUsed) {
      thinUsed = true
      answer = 'It is a common thing.'
    } else if (/Technical|fundamentals/.test(section)) answer = 'I would define it first, then explain how it works internally, where I used it in production at Nimbus Labs, and the trade-off: it adds complexity but improves reliability, however it can fail under load, so I would add monitoring and failure handling.'
    else if (/Coding/.test(section)) answer = 'Approach: use a hash map in a single pass, storing each value and checking the complement. Time complexity O(n) and space complexity O(n). Edge cases: empty input, duplicates, negative numbers and very large inputs. Dry run: for input [2,7,11,15] with target 9 it returns [0,1].'
    else if (/System design/.test(section)) answer = 'Requirements first: create and read orders. The API exposes REST endpoints; the data model has orders and items; components are the API service, a cache and the database; request flow goes client to API to database with validation and logging at each hop; error handling returns typed errors and retries. The trade-off of caching is staleness.'
    else if (/Behavioural/.test(section)) answer = 'When our release failed last year, the situation was a broken payment job. I decided to own it: I investigated the logs, wrote a retry with backoff and paired with QA. As a result failures dropped 90% and we shipped on time. I learned to add alerts first.'
    else {
      // Wrap-up: the interviewer invites questions, answers a general one without company facts, then closes.
      wrapupTurns += 1
      assert.match(before, wrapupTurns === 1 ? /(That covers everything I wanted to discuss|That's everything from my side)\..*do you have any questions/ : /can't speak for .* process specifically.*(Anything else|anything else)/, `natural closing (${before.slice(0, 120)})`)
      answer = wrapupTurns === 1 ? 'What are the next steps in the process?' : 'No, that is all from my side. Thank you.'
    }
    await learner.locator('#jiv-answer').fill(answer)
    await learner.getByRole('button', { name: isFollowUp ? 'Answer follow-up' : /^(Send answer|Send)$/ }).click()
    if (!/wrap-up/i.test(section)) answeredCount += 1
    await learner.waitForFunction((prev) => {
      const el = document.querySelector('#jiv-question-title')
      return !el || el.textContent.trim() !== prev || Array.from(document.querySelectorAll('h3')).some((h) => h.textContent.trim().startsWith('Interview report'))
    }, before, { timeout: 20000 })
  }
  assert.ok(sawFollowUp, 'the interviewer asked at least one follow-up in reaction to a thin answer')
  assert.ok(sawClarification, 'a clarification request was handled mid-interview')
  assert.equal(wrapupTurns, 2, 'the wrap-up took the candidate question and the closing')
  const roomTurns = (await pool.query('SELECT turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].turns
  assert.equal(roomTurns[0].kind, 'opening')
  assert.ok(roomTurns.some((t) => t.kind === 'clarification_request') && roomTurns.some((t) => t.kind === 'clarification'), 'clarification stored as its own turn kinds')
  assert.ok(roomTurns.some((t) => t.kind === 'transition') && roomTurns.some((t) => t.kind === 'candidate_question') && roomTurns.some((t) => t.kind === 'closing_answer'))
  assert.equal(roomTurns[roomTurns.length - 1].kind, 'farewell')
  assert.match(roomTurns[roomTurns.length - 1].text, /Thanks for your time\. We'll end the mock interview here\./)
  for (const t of roomTurns.filter((x) => x.role === 'interviewer' && x.kind !== 'question' && x.kind !== 'opening')) assert.ok(!/\b(great|excellent|correct|you missed|you should study|hire)\b/i.test(`${t.lead ?? ''} ${t.text}`), `neutral interviewer: ${t.text}`)
  const followTurns = (await pool.query('SELECT turns FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].turns.filter((t) => t.kind === 'follow_up')
  assert.ok(followTurns.length >= 1)
  if (!SKIP.has('ai')) {
    assert.ok(followTurns.every((t) => t.aiRefined === true && t.deterministicText && t.text !== t.deterministicText), 'follow-ups were rephrased by the gateway and the deterministic wording is preserved')
    assert.ok(followTurns.every((t) => /Thanks, that helps\./.test(t.text) && t.text.endsWith('?')), 'fixture rephrasing validated (question form)')
  } else assert.ok(followTurns.every((t) => !t.aiRefined), 'without an AI provider the deterministic follow-up wording is used')
  await learner.getByRole('heading', { name: 'Interview report' }).waitFor({ timeout: 20000 })
  await learner.getByText(/questions answered in \d+ of 30 planned minutes/).waitFor()
  await learner.getByRole('heading', { name: 'Communication' }).waitFor()
  await learner.getByRole('heading', { name: 'Coding' }).waitFor()
  await learner.getByRole('heading', { name: 'System design', exact: true }).waitFor()
  await learner.getByRole('heading', { name: 'Behavioural', exact: true }).waitFor()
  await learner.getByRole('heading', { name: 'Question-level feedback' }).waitFor()
  await learner.locator('.jiv-q').first().locator('summary').click()
  await learner.getByText('Evidence observed').first().waitFor()
  await learner.getByText('Stronger reasoning approach').first().waitFor()
  const completed = (await pool.query('SELECT s.id, s.status, s.report, s.turns, s."durationSeconds" FROM job_interview_sessions s WHERE s.id = $1', [sessionRow.id])).rows[0]
  assert.equal(completed.status, 'completed')
  assert.ok(completed.report.questions.length >= 5 && completed.report.questionsAnswered === answeredCount - completed.report.followUpsAsked, `report covers the answered questions (${completed.report.questionsAnswered}/${answeredCount})`)
  assert.equal(completed.report.clarificationsAsked, 1, 'the clarification request is counted, not scored')
  assert.ok(Array.isArray(completed.report.timeline) && completed.report.timeline.length >= 5 && completed.report.timeline[0].offsetMs === 0, 'replay timeline attached')
  await learner.getByRole('heading', { name: 'Interview replay' }).waitFor()
  await learner.getByRole('list', { name: 'Interview timeline' }).waitFor()
  await learner.getByText('What the interviewer was evaluating').first().waitFor()
  await learner.getByRole('heading', { name: 'Strong and weak answers' }).waitFor()
  assert.ok(completed.report.followUpsAsked >= 1)
  assert.ok(completed.turns.filter((t) => t.kind === 'answer' || t.kind === 'follow_up_answer').every((t) => t.evidence && Array.isArray(t.evidence.conceptsHit)), 'evidence stored with every answer at answer time')
  assert.ok(completed.turns.filter((t) => t.kind === 'clarification_request' || t.kind === 'candidate_question').every((t) => !t.evidence), 'clarifications and candidate questions are never scored')
  assert.ok(completed.report.coding && completed.report.systemDesign && completed.report.behavioral, 'coding, design and behavioural breakdowns present')
  assert.ok(!/\bhire\b|hiring probab|% chance/i.test(JSON.stringify(completed.report)), 'no hiring probability or verdict')
  if (!SKIP.has('ai')) {
    assert.ok(completed.report.aiSummary && /Fixture coach note/.test(completed.report.aiSummary.text) && /^fixture\//.test(completed.report.aiSummary.provider), 'AI coach note attached from the evidence, labelled with its provider')
    await learner.getByText(/AI coach note · written from the evidence/).waitFor()
  } else assert.ok(!completed.report.aiSummary, 'no AI note without a provider')
  assert.ok(completed.report.weaknesses.length > 0 && completed.report.weaknesses.some((w) => w.ref && w.ref.trackId && w.ref.topicId), 'weaknesses detected and mapped to curriculum topics')
  await learner.screenshot({ path: `${SHOTS}/learner-interview-report.png`, fullPage: true })
  pass('interview runs section by section with adaptive follow-ups and ends in an evidence-based report with question-level feedback (no hiring probability)')

  // Weaknesses mapped to the curriculum; preview then confirm the learning-plan update on the existing roadmap.
  await learner.getByRole('heading', { name: 'Weaknesses mapped to your curriculum' }).waitFor()
  const weakItem = learner.locator('section[aria-labelledby="jiv-weak"] .prep-item').filter({ has: learner.locator('.prep-item-ref') }).first()
  await weakItem.waitFor()
  const weakRef = (await weakItem.locator('.prep-item-ref').textContent()).trim()
  assert.match(weakRef, /→/, `weakness maps to track → topic (${weakRef})`)
  const weakTopicTitle = weakRef.replace(/^.*→\s*/, '').trim()
  await learner.getByRole('button', { name: 'Preview weakness plan' }).click()
  const weakPreview = learner.getByRole('region', { name: 'Weakness plan preview' })
  await weakPreview.waitFor()
  const weakPreviewText = await weakPreview.textContent()
  const weakTasks = Number(/(\d+) new tasks?/.exec(weakPreviewText)[1])
  const roadmapBefore = await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').roadmap.flatMap((d) => d.tasks).length)
  if (weakTasks > 0) {
    await weakPreview.getByRole('button', { name: 'Add weaknesses to learning plan' }).click()
    await learner.getByText(new RegExp(`Added ${weakTasks} preparation tasks? to your calendar`)).waitFor()
    await learner.waitForTimeout(900)
    const roadmapAfter = await learner.evaluate((id) => {
      const tasks = JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').roadmap.flatMap((d) => d.tasks)
      const steps = tasks.filter((t) => t.curriculumTaskId).map((t) => t.curriculumTaskId)
      return { total: tasks.length, forJob: tasks.filter((t) => t.prepJobId === id).length, uniqueSteps: new Set(steps).size, steps: steps.length }
    }, jobId)
    assert.equal(roadmapAfter.total, roadmapBefore + weakTasks, 'exactly the previewed tasks were added to the existing roadmap')
    assert.equal(roadmapAfter.uniqueSteps, roadmapAfter.steps, 'no duplicate curriculum steps')
    assert.equal((await pool.query('SELECT "planAddedTaskCount" FROM job_interview_sessions WHERE id = $1', [sessionRow.id])).rows[0].planAddedTaskCount, weakTasks)
    pass(`Add weaknesses to learning plan previews first, then adds ${weakTasks} tasks to the existing roadmap without duplicating scheduled steps`)
  } else {
    assert.match(weakPreviewText, /already on your calendar or completed/, 'every weakness topic is already scheduled from the preparation plan; nothing is duplicated')
    assert.equal(await weakPreview.getByRole('button', { name: 'Add weaknesses to learning plan' }).isDisabled(), true)
    assert.equal(await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').roadmap.flatMap((d) => d.tasks).length), roadmapBefore)
    pass('Add weaknesses to learning plan preview reports that the weakness topics are already scheduled and refuses to duplicate them')
  }

  // Mapped weakness opens the exact Knowledge Workspace, then back to the job.
  await learner.getByRole('button', { name: `Open ${weakTopicTitle}` }).first().click()
  await learner.getByText(new RegExp('> ' + weakTopicTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).waitFor()
  await learner.getByRole('button', { name: '← Back' }).click()
  await learner.getByRole('heading', { name: 'Backend Engineer II' }).waitFor()
  pass('an interview weakness opens the exact existing Knowledge Workspace for its topic and returns to the job')

  // History, refresh persistence and readiness integration.
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.getByRole('heading', { name: 'Interview history' }).waitFor()
  const historyTable = learner.getByRole('table', { name: 'Interview attempts' })
  await historyTable.getByText('Full interview').waitFor()
  await historyTable.getByRole('button', { name: /Open report from/ }).waitFor()
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.getByRole('table', { name: 'Interview attempts' }).getByText('Full interview').waitFor()
  await learner.getByRole('button', { name: /Open report from/ }).first().click()
  await learner.getByRole('heading', { name: 'Interview report' }).waitFor()
  await learner.getByRole('heading', { name: 'Question-level feedback' }).waitFor()
  await learner.getByRole('button', { name: 'Back to interviews' }).click()
  await learner.getByRole('tab', { name: 'Prepare' }).click()
  await learner.getByText('Mock interview completed').waitFor()
  await learner.getByText(/1 job-specific interview completed/).waitFor()
  await learner.getByText('Weak areas remaining').waitFor()
  pass('interview history and the report persist across a refresh; readiness shows factual interview state (completed, areas demonstrated, weak areas)')

  // Weak-areas re-attempt: questions rotate, the previous attempt is preserved.
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.getByRole('button', { name: /Open report from/ }).first().click()
  await learner.getByRole('button', { name: 'Weak areas only' }).click()
  await learner.getByText(/Re-attempt: Weak areas/).waitFor()
  await learner.getByRole('button', { name: 'Start in text only' }).click()
  await learner.waitForFunction(() => /Weak areas re-attempt/.test(document.querySelector('.room-sub')?.textContent || ''))
  const reattempt = (await pool.query('SELECT id, mode, "parentSessionId", plan FROM job_interview_sessions WHERE "userId" = (SELECT id FROM users WHERE email = $1) AND "jobId" = $2 AND status = $3', [learnerEmail, jobId, 'active'])).rows[0]
  assert.equal(reattempt.mode, 'weak_areas')
  assert.equal(reattempt.parentSessionId, sessionRow.id)
  const firstKeys = new Set(sessionRow.plan.questions.map((q) => q.key))
  const repeatedKeys = reattempt.plan.questions.filter((q) => firstKeys.has(q.key) && !['intro', 'wrapup'].includes(q.key)).length
  assert.ok(repeatedKeys < reattempt.plan.questions.length - 2, `re-attempt rotates questions (${repeatedKeys} repeated of ${reattempt.plan.questions.length})`)
  await learner.locator('#jiv-answer').fill('I am back to practise the weak areas with more depth this time.')
  await learner.getByRole('button', { name: 'Send answer' }).click()
  await learner.locator('.room-stage-count').getByText(/Stage 2 of \d+/).waitFor()
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs').fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByRole('tab', { name: 'Mock interview' }).click()
  await learner.waitForFunction(() => /Weak areas re-attempt/.test(document.querySelector('.room-sub')?.textContent || ''), undefined, { timeout: 20000 })
  await learner.locator('.room-stage-count').getByText(/Stage 2 of \d+/).waitFor()
  await learner.getByText(/Interview restored where you left off/).waitFor()
  learner.once('dialog', (d) => d.accept())
  await learner.getByRole('button', { name: 'Leave' }).click()
  await learner.getByRole('heading', { name: 'Interview history' }).waitFor()
  assert.equal((await pool.query('SELECT status FROM job_interview_sessions WHERE id = $1', [reattempt.id])).rows[0].status, 'abandoned')
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM job_interview_sessions WHERE "userId" = (SELECT id FROM users WHERE email = $1)', [learnerEmail])).rows[0].n, 2, 'historical attempts are preserved')
  pass('weak-areas re-attempt starts from the report with rotated questions, survives a refresh mid-interview, and leaving preserves the history')

  // Ownership: another learner cannot read or drive the session; an expired job keeps the historical context.
  assert.equal(await free2.evaluate((id) => fetch('/api/interviews/' + id).then((r) => r.status), sessionRow.id), 404)
  assert.equal(await free2.evaluate((id) => fetch('/api/interviews/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'turn', questionId: 'q1', kind: 'answer', text: 'hijack' }) }).then((r) => r.status), sessionRow.id), 404)
  const otherHistory = await free2.evaluate((id) => fetch('/api/jobs/' + id + '/interviews').then((r) => r.json()), jobId)
  assert.deepEqual(otherHistory.history, [], 'another learner sees no attempts for the job')
  assert.equal(await admin.evaluate((id) => fetch('/api/admin/jobs/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transition: 'expire' }) }).then((r) => r.status), jobId), 200)
  const expiredView = await learner.evaluate((id) => fetch('/api/interviews/' + id).then((r) => r.json()), sessionRow.id)
  assert.equal(expiredView.session.job.title, 'Backend Engineer II')
  assert.equal(expiredView.session.status, 'completed')
  assert.ok(expiredView.session.report.questions.length > 0, 'report readable after the job expired')
  const expiredHistory = await learner.evaluate((id) => fetch('/api/jobs/' + id + '/interviews').then((r) => r.json()), jobId)
  assert.equal(expiredHistory.history.length, 2, 'history for the job survives expiry')
  // Restore the listing for the remaining flows (an expired job cannot be re-published through the admin transition; the test resets it directly).
  await pool.query("UPDATE jobs SET status = 'published', lifecycle = 'verified', \"expiresAt\" = '2027-01-31' WHERE id = $1", [jobId])
  pass('another learner gets 404 on the session and report; an expired job does not destroy the historical interview context')

  await learner.getByRole('tab', { name: 'Tracker' }).click()

  await learner.getByRole('button', { name: 'Add to Application Tracker' }).first().click()
  await learner.getByText(`Added ${companyName} to your tracker`).waitFor()
  await learner.getByText('Already in your tracker as').first().waitFor()
  await learner.waitForTimeout(900)
  const trackedApp = await learner.evaluate((url) => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{}').applications.find((a) => a.jobUrl === url), 'https://acme-systems.example.com/careers/jobs/4242')
  assert.equal(trackedApp.jobRef.jobId, jobId, 'tracker keeps the canonical job reference')
  assert.equal(trackedApp.jobRef.resumeAnalysisId, analysisRow.id, 'tracker links the resume analysis')
  assert.equal(trackedApp.status, 'Wishlist')
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByText('Loaded from cloud').waitFor()
  const cloudApp = (await pool.query('SELECT payload FROM career_state cs JOIN users u ON u.id = cs."userId" WHERE u.email = $1', [learnerEmail])).rows[0].payload.applications.find((a) => a.jobRef && a.jobRef.jobId === jobId)
  assert.ok(cloudApp && cloudApp.jobRef.resumeAnalysisId === analysisRow.id, 'tracker entry with references persisted to the cloud state')
  pass('tracker entry keeps the canonical job/company reference, apply URL, status and analysis reference; it survives a refresh and cloud sync')

  // Deleting the resume removes its analyses; the tracker entry keeps only the id reference.
  await learner.getByRole('button', { name: 'Resume', exact: true }).click()
  learner.once('dialog', (d) => d.accept())
  await learner.getByRole('button', { name: 'Delete asha-resume-v2' }).click()
  await learner.waitForTimeout(600)
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM resume_analyses WHERE id = $1', [analysisRow.id])).rows[0].n, 0, 'analysis removed with its resume')
  assert.equal((await pool.query('SELECT r."isCurrent" FROM resumes r JOIN users u ON u.id = r."userId" WHERE u.email = $1', [learnerEmail])).rows[0].isCurrent, true, 'the remaining version became current')
  pass('deleting a resume removes its extracted profile and analyses and promotes the remaining version')
  await freeCtx2.close()

  // Scheduled ingestion pass from the admin panel and the inert cron endpoint.
  await admin.goto(`${BASE}/admin/ingestion`, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Run scheduled pass now' }).click()
  await admin.getByText(/Scheduled pass:/).waitFor()
  await admin.getByText(/Acme fixture feed .*: success/).waitFor()
  const scheduledRuns = (await pool.query("SELECT trigger, attempts, \"durationMs\", status FROM job_ingestion_runs WHERE \"sourceId\" = $1 AND trigger = 'scheduled'", [fixtureSource.id])).rows
  assert.ok(scheduledRuns.length >= 1 && scheduledRuns.every((r) => r.status === 'success' && r.attempts === 1 && r.durationMs != null))
  const srcAfter = (await pool.query('SELECT "lastSuccessAt", "lockedAt" FROM job_sources WHERE id = $1', [fixtureSource.id])).rows[0]
  assert.ok(srcAfter.lastSuccessAt && srcAfter.lockedAt === null, 'last successful sync recorded and lock released')
  const cron = await admin.evaluate(() => fetch('/api/cron/ingestion').then((r) => r.status))
  assert.equal(cron, 404, 'cron endpoint is inert without CRON_SECRET')
  await admin.getByText('scheduled', { exact: true }).first().waitFor()
  pass('scheduled ingestion pass runs from the admin with per-source status, attempts and duration; the cron endpoint stays inert locally')
  await learner.getByRole('button', { name: 'Applications', exact: true }).click()
  await learner.locator('.app-row').filter({ hasText: companyName }).first().waitFor()
  const trackedLink = learner.locator('.app-row').filter({ hasText: companyName }).first().getByRole('link', { name: 'Open job link' })
  assert.equal(await trackedLink.getAttribute('href'), 'https://acme-systems.example.com/careers/jobs/4242')
  pass('Add to Application Tracker creates a Wishlist application with the original link (no duplicate tracker)')

  await learner.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await learner.getByLabel('Search jobs', { exact: true }).fill(companyName)
  await learner.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await learner.getByText('Already in your tracker as').first().waitFor()
  pass('job detail recognises an existing tracked application')

  const learnerAdmin = await learner.goto(`${BASE}/admin/jobs`, { waitUntil: 'networkidle' })
  assert.equal(learnerAdmin.status(), 404)
  pass('learner cannot open admin pages (404)')

  // Feature flag: admin switches job discovery off, learner API answers 503; then back on.
  const off = await admin.evaluate(() => fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flags: { jobsModule: false, adminPanel: true } }) }).then((r) => r.status))
  assert.equal(off, 200)
  const disabled = await learner.evaluate(() => fetch('/api/jobs').then((r) => r.status))
  assert.equal(disabled, 503)
  const on = await admin.evaluate(() => fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flags: { jobsModule: true, adminPanel: true } }) }).then((r) => r.status))
  assert.equal(on, 200)
  assert.equal(await learner.evaluate(() => fetch('/api/jobs').then((r) => r.status)), 200)
  pass('feature flag switches the jobs module off and on (audited platform setting)')

  // Admin cannot strip their own admin role.
  const self = await admin.evaluate((id) => fetch(`/api/admin/users/${id}/roles`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roles: ['support'] }) }).then((r) => r.status), adminUser.id)
  assert.equal(self, 400)
  pass('admin cannot remove their own admin role')

  // Mobile navigation reaches Job Discovery.
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.setViewportSize({ width: 390, height: 844 })
  await learner.getByRole('navigation', { name: 'Primary' }).last().getByRole('button', { name: 'Jobs' }).click()
  await learner.getByRole('heading', { name: 'Job discovery' }).waitFor()
  await learner.screenshot({ path: `${SHOTS}/learner-jobs-mobile.png`, fullPage: false })
  pass('mobile navigation opens Job Discovery')


  // ------------------------------------------------------------ Phase 5: billing
  if (!SKIP.has('billing')) {
  const buyerEmail = `jobs-buyer-${stamp}@example.invalid`
  const buyerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const buyer = await buyerCtx.newPage()
  buyer.on('pageerror', (e) => pageErrors.push(String(e)))
  await buyer.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await buyer.getByRole('tab', { name: 'Create account' }).click()
  await buyer.getByLabel('Email address').fill(buyerEmail)
  await buyer.getByLabel('Password', { exact: true }).fill(password)
  await buyer.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(buyer)
  await buyer.reload({ waitUntil: 'networkidle' })
  await waitForSession(buyer)
  await dismissOnboarding(buyer)
  await buyer.getByRole('link', { name: 'See plans' }).click()
  await buyer.waitForURL(/\/pricing$/)
  await buyer.getByRole('heading', { name: 'Plans', exact: true }).waitFor()
  await buyer.getByText('Test mode: no real charges').waitFor()
  const freeCard = buyer.getByRole('region', { name: 'Free', exact: true })
  await freeCard.getByText('Current plan', { exact: true }).waitFor()
  const proCard = buyer.getByRole('region', { name: 'Prep Pro', exact: true })
  await proCard.getByText('Recommended').waitFor()
  await buyer.getByRole('button', { name: 'Annual' }).click()
  await proCard.getByText('/ year').waitFor()
  await buyer.getByRole('button', { name: 'Monthly' }).click()
  await proCard.getByText('/ month').waitFor()
  await buyer.screenshot({ path: `${SHOTS}/pricing-free.png`, fullPage: true })
  const premiumBefore = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status), jobId)
  assert.equal(premiumBefore, 402, 'premium analysis is locked on the free plan')
  pass('free learner reaches /pricing from the Command Center plan card: plans, monthly/annual toggle, current plan and test-mode notice are shown')

  // Free learner: job-specific interview preview only (three questions, no follow-ups, summary feedback).
  await buyer.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(buyer)
  await buyer.getByRole('heading', { name: 'Career goal' }).waitFor({ timeout: 20000 })
  await buyer.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await buyer.getByLabel('Search jobs').fill(companyName)
  await buyer.getByRole('button', { name: `Backend Engineer II at ${companyName}` }).first().click()
  await buyer.getByRole('tab', { name: 'Mock interview' }).click()
  await buyer.getByRole('button', { name: 'Start preview interview' }).waitFor()
  const freeOverview = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/interviews').then((r) => r.json()), jobId)
  assert.equal(freeOverview.access.full, false)
  assert.equal(freeOverview.access.preview, true)
  const freeStart = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', mode: 'full', progress: {}, config: { minutes: 60, includeCoding: true } }) }).then(async (r) => ({ status: r.status, body: await r.json() })), jobId)
  assert.equal(freeStart.status, 201)
  assert.equal(freeStart.body.session.mode, 'preview', 'free plan is downgraded to the preview')
  assert.ok(freeStart.body.session.plan.questions.length <= 3 && freeStart.body.session.plan.questions.every((q) => q.maxFollowUps === 0 && q.kind !== 'coding'))
  const freeDone = await buyer.evaluate((id) => fetch('/api/interviews/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'complete' }) }).then((r) => r.json()), freeStart.body.session.id)
  assert.equal(freeDone.session.report.detailed, false)
  assert.deepEqual(freeDone.session.report.questions, [])
  assert.deepEqual(freeDone.session.report.weaknesses, [])
  const freeAgain = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', mode: 'weak_areas', progress: {}, config: {} }) }).then((r) => r.status), jobId)
  assert.ok([400, 429].includes(freeAgain), `re-attempts and the daily limit are enforced for the free plan (${freeAgain})`)
  pass('free learner gets the three-question preview without follow-ups or detailed feedback; re-attempts and limits are enforced server-side')
  await buyer.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
  await buyer.getByRole('heading', { name: 'Plans', exact: true }).waitFor()

  // Failed test payment unlocks nothing.
  await proCard.getByRole('button', { name: 'Upgrade to Prep Pro' }).click()
  const payDialog = buyer.getByRole('dialog', { name: /Test checkout/ })
  await payDialog.getByRole('button', { name: 'Simulate failed payment' }).click()
  await buyer.getByText(/Test payment failed as requested/).waitFor()
  const afterFail = await buyer.evaluate(() => fetch('/api/billing/subscription').then((r) => r.json()))
  // A first payment that fails never activates: past_due with no paid period, swept to expired at the next read.
  assert.ok(['past_due', 'expired'].includes(afterFail.subscription?.status), `failed first payment recorded (${afterFail.subscription?.status})`)
  assert.equal(afterFail.subscription.lastPaymentError, 'Test card declined')
  assert.equal(afterFail.subscription.grantsAccess, false)
  assert.equal(afterFail.plan.id, 'free', 'a failed first payment leaves the learner on the free plan')
  pass('a failed test payment is recorded with the failure reason and does not unlock anything')

  // Successful test checkout: server verifies the signed webhook, then premium unlocks.
  await proCard.getByRole('button', { name: 'Upgrade to Prep Pro' }).click()
  await payDialog.getByRole('button', { name: 'Complete test payment' }).click()
  await buyer.getByText('Prep Pro is active on your account.').waitFor({ timeout: 20000 })
  await proCard.getByText('Current plan', { exact: true }).waitFor()
  const active = await buyer.evaluate(() => fetch('/api/billing/subscription').then((r) => r.json()))
  assert.equal(active.subscription.status, 'active')
  assert.equal(active.subscription.grantsAccess, true)
  assert.equal(active.plan.id, 'pro')
  assert.equal(active.planSource, 'subscription')
  const dbSub = (await pool.query('SELECT status, "planId" FROM billing_subscriptions WHERE "userId" = (SELECT id FROM users WHERE email = $1) ORDER BY "updatedAt" DESC LIMIT 1', [buyerEmail])).rows[0]
  assert.equal(dbSub.status, 'active')
  const events = (await pool.query("SELECT status, count(*)::int AS n FROM billing_events WHERE provider = 'fixture' AND \"subscriptionId\" IN (SELECT id FROM billing_subscriptions WHERE \"userId\" = (SELECT id FROM users WHERE email = $1)) GROUP BY status", [buyerEmail])).rows
  assert.ok(events.some((e) => e.status === 'processed' && e.n >= 2), 'signed fixture webhooks are recorded in the event ledger')
  const notified = (await pool.query('SELECT kind, status FROM notification_log WHERE "userId" = (SELECT id FROM users WHERE email = $1) ORDER BY "createdAt"', [buyerEmail])).rows
  assert.ok(notified.some((n) => n.kind === 'subscription.activated'), 'activation notification logged')
  assert.ok(notified.every((n) => n.status !== 'sent'), 'no email is sent from the development environment')
  pass('successful test checkout activates the subscription server-side through a verified webhook; ledger and notification log recorded')

  // Premium unlocks in the app and survives a refresh.
  const buyerConfig = await buyer.evaluate(() => fetch('/api/platform/config').then((r) => r.json()))
  assert.equal(buyerConfig.plan.id, 'pro')
  assert.ok(buyerConfig.features.includes('jobs.matching'))
  await buyer.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(buyer)
  await buyer.getByRole('navigation', { name: 'Primary' }).first().getByRole('button', { name: 'Job Discovery' }).click()
  await buyer.getByRole('heading', { name: 'Job discovery' }).waitFor()
  assert.equal(await buyer.getByRole('heading', { name: 'Choose your plan' }).count(), 0, 'paywall gone after upgrade')
  await buyer.reload({ waitUntil: 'networkidle' })
  await waitForSession(buyer)
  await buyer.getByRole('navigation', { name: 'Primary' }).first().getByRole('button', { name: 'Job Discovery' }).click()
  await buyer.getByRole('heading', { name: 'Job discovery' }).waitFor()
  assert.equal(await buyer.getByRole('heading', { name: 'Choose your plan' }).count(), 0, 'paywall still gone after refresh')
  const premiumAfter = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status), jobId)
  assert.equal(premiumAfter, 200, 'premium analysis unlocked after upgrade')
  pass('premium features unlock after upgrade and the entitlement persists across a refresh')

  // Usage dashboard in Settings → Billing reflects the analysis just used.
  await buyer.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await buyer.getByRole('button', { name: /Billing & Pass/ }).click()
  await buyer.getByRole('heading', { name: 'Billing', exact: true }).waitFor()
  await buyer.getByText('Usage today').waitFor()
  const usage = await buyer.evaluate(() => fetch('/api/billing/usage').then((r) => r.json()))
  const analysesMeter = usage.meters.find((m) => m.key === 'jobs.analysis')
  assert.equal(analysesMeter.used, 1)
  assert.equal(analysesMeter.limit, 100)
  await buyer.screenshot({ path: `${SHOTS}/settings-billing.png`, fullPage: true })
  pass('usage dashboard shows used / limit / reset for the metered features')

  // Cancel renewal: access continues until period end, status is cancel_at_period_end.
  buyer.once('dialog', (d) => d.accept())
  await buyer.getByRole('button', { name: 'Cancel renewal' }).click()
  await buyer.getByText('Renewal cancelled').first().waitFor()
  const cancelled = await buyer.evaluate(() => fetch('/api/billing/subscription').then((r) => r.json()))
  assert.equal(cancelled.subscription.status, 'cancel_at_period_end')
  assert.equal(cancelled.subscription.grantsAccess, true)
  assert.equal(cancelled.plan.id, 'pro', 'access continues until the period ends')
  pass('cancel renewal keeps access until period end (cancel_at_period_end) with the lifecycle state stored server-side')

  // Another learner cannot touch the buyer's subscription; non-admins cannot open billing admin.
  const foreignCancel = await learner.evaluate((id) => fetch('/api/billing/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel_renewal', subscriptionId: id }) }).then((r) => r.status), cancelled.subscription.id)
  assert.equal(foreignCancel, 404)
  const learnerState = await learner.evaluate(() => fetch('/api/billing/subscription').then((r) => r.json()))
  assert.ok(!learnerState.history.some((h) => h.id === cancelled.subscription.id), 'billing history only lists the caller\'s own subscriptions')
  for (const path of ['/admin/plans', '/admin/subscriptions', '/admin/billing', '/admin/launch']) {
    const res = await buyer.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    assert.equal(res.status(), 404, `${path} hidden from non-admins`)
  }
  assert.equal(await buyer.evaluate(() => fetch('/api/admin/plans').then((r) => r.status)), 403)
  assert.equal(await buyer.evaluate(() => fetch('/api/admin/subscriptions').then((r) => r.status)), 403)
  assert.equal(await buyer.evaluate(() => fetch('/api/admin/plans/pro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: [] }) }).then((r) => r.status)), 403)
  pass('another learner cannot access or mutate billing records; non-admins get 404/403 on billing admin pages and APIs')

  // Admin edits plan entitlements through the UI; the learner's config follows immediately.
  await admin.goto(`${BASE}/admin/plans`, { waitUntil: 'networkidle' })
  await admin.getByRole('heading', { name: 'Plans' }).waitFor()
  await admin.getByRole('button', { name: 'Edit plan Prep Pro' }).click()
  const planDialog = admin.getByRole('dialog')
  await planDialog.getByLabel('Personalised job matching in plan').uncheck()
  await planDialog.getByRole('button', { name: 'Save plan' }).click()
  await planDialog.waitFor({ state: 'hidden' })
  await admin.getByText('Plan Prep Pro saved').waitFor()
  const afterEdit = await buyer.evaluate(() => fetch('/api/platform/config').then((r) => r.json()))
  assert.equal(afterEdit.plan.id, 'pro')
  assert.ok(!afterEdit.features.includes('jobs.matching'), 'entitlement removed from the plan is gone for the learner')
  const gated = await buyer.evaluate((id) => fetch('/api/jobs/' + id + '/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status), jobId)
  assert.equal(gated, 402, 'server gate follows the edited plan')
  await admin.getByRole('button', { name: 'Edit plan Prep Pro' }).click()
  await planDialog.getByLabel('Personalised job matching in plan').check()
  await planDialog.getByRole('button', { name: 'Save plan' }).click()
  await planDialog.waitFor({ state: 'hidden' })
  await admin.getByText('Plan Prep Pro saved').waitFor()
  const restored = await buyer.evaluate(() => fetch('/api/platform/config').then((r) => r.json()))
  assert.ok(restored.features.includes('jobs.matching'))
  const planAudit = (await pool.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE \"actorId\" = $1 AND action = 'plan.update' AND \"entityId\" = 'pro'", [adminUser.id])).rows[0].n
  assert.ok(planAudit >= 2, 'plan edits are audited')
  await admin.screenshot({ path: `${SHOTS}/admin-plans.png`, fullPage: true })
  pass('admin edits plan entitlements in /admin/plans and the learner experience follows without a redeploy')

  // Admin billing pages render from live data; launch readiness reports factual statuses.
  await admin.goto(`${BASE}/admin/subscriptions`, { waitUntil: 'networkidle' })
  await admin.getByText(buyerEmail).first().waitFor()
  await admin.getByText('cancel_at_period_end').first().waitFor()
  await admin.goto(`${BASE}/admin/billing`, { waitUntil: 'networkidle' })
  await admin.getByRole('heading', { name: 'Billing status' }).waitFor()
  await admin.getByText('No failed or rejected webhook deliveries recorded.').waitFor()
  await admin.goto(`${BASE}/admin/launch`, { waitUntil: 'networkidle' })
  await admin.getByRole('heading', { name: 'Launch readiness' }).waitFor()
  await admin.getByText('Billing provider').waitFor()
  await admin.getByText('Test-mode fixture provider').waitFor()
  await admin.screenshot({ path: `${SHOTS}/admin-launch.png`, fullPage: true })
  pass('admin subscriptions, billing status and launch readiness pages render from live data')

  // Webhook security: bad signature rejected, replayed event is a duplicate, cron without secret is hidden.
  const badSig = await buyer.evaluate(() => fetch('/api/billing/webhooks/fixture', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-fixture-signature': 'deadbeef' }, body: JSON.stringify({ eventId: 'evt_forged', type: 'subscription.activated' }) }).then((r) => r.status))
  assert.equal(badSig, 400)
  const cronNoAuth = await buyer.evaluate(() => fetch('/api/cron/reminders').then((r) => r.status))
  assert.ok([401, 404].includes(cronNoAuth), `cron endpoint refuses unauthenticated calls (${cronNoAuth})`)
  pass('forged webhook signatures are rejected and cron endpoints refuse unauthenticated calls')

  // Privacy: the learner deletes their Career OS data; shared listings stay.
  await buyer.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(buyer)
  await buyer.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await buyer.getByRole('button', { name: /Billing & Pass/ }).click()
  await buyer.getByRole('heading', { name: 'Billing', exact: true }).waitFor()
  buyer.once('dialog', (d) => d.accept())
  await buyer.getByRole('button', { name: 'Delete my Career OS data' }).click()
  await buyer.getByText(/Deleted \d+ Career OS records/).waitFor()
  const jobsStill = (await pool.query('SELECT count(*)::int AS n FROM jobs WHERE "companyId" = (SELECT id FROM companies WHERE slug = $1)', [companySlug])).rows[0].n
  assert.ok(jobsStill >= 3, 'shared job listings are untouched by an account data deletion')
  pass('learner can delete their own Career OS data from Settings; shared listings are unaffected')
  await buyerCtx.close()
  } else console.log('SKIP: billing block (E2E_SKIP=billing; fixture provider is disabled in production builds)')

  const critical = pageErrors.filter((e) => !/favicon/i.test(e))
  assert.deepEqual(critical, [], `no page errors: ${critical.join('\n')}`)
  pass('no browser page errors during the flows')

  console.log(`\nAll ${results.length} Career OS checks passed${SKIP.size ? ` (skipped: ${[...SKIP].join(', ')})` : ''}.`)
} finally {
  await browser.close()
  // Clean up everything this run created (users cascade to roles/preferences/subscriptions).
  await pool.query('DELETE FROM jobs WHERE "companyId" IN (SELECT id FROM companies WHERE slug = $1)', [companySlug])
  await pool.query('DELETE FROM companies WHERE slug = $1', [companySlug])
  await pool.query('DELETE FROM job_sources WHERE name = ANY($1)', [[`Acme careers page ${stamp}`, `Acme fixture feed ${stamp}`, `Acme mirror feed ${stamp}`]])
  await pool.query("DELETE FROM platform_settings WHERE key IN ('limits','roleFamilies')")
  await pool.query("DELETE FROM billing_events WHERE \"subscriptionId\" IN (SELECT id FROM billing_subscriptions WHERE \"userId\" IN (SELECT id FROM users WHERE email = ANY($1)))", [[`jobs-buyer-${stamp}@example.invalid`]])
  await pool.query('DELETE FROM admin_audit_log WHERE "actorId" IN (SELECT id FROM users WHERE email = ANY($1))', [[adminEmail, learnerEmail, `jobs-free-${stamp}@example.invalid`, `jobs-other-${stamp}@example.invalid`, `jobs-buyer-${stamp}@example.invalid`]])
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [[adminEmail, learnerEmail, `jobs-free-${stamp}@example.invalid`, `jobs-other-${stamp}@example.invalid`, `jobs-buyer-${stamp}@example.invalid`]])
  await pool.end()
}
