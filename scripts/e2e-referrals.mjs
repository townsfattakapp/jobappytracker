// Browser end-to-end for the verified referral network, against a local dev
// server and the local development database only (never the hosted one):
//   A successful referral · B decline → reassignment → success · C no referrer
//   available · D job expires · E free learner entitlement · F paid learner
//   credits · G cross-account attack · H learner tries referrer/admin APIs ·
//   I referrer tries an unassigned candidate · J suspended referrer · K mobile
//   learner flow · L refresh / sign out / sign in persistence.
// Every account is created through the real UI; nothing is seeded into
// localStorage. Fixture people are clearly synthetic (@example.invalid).
//   BASE_URL=http://localhost:3001 node scripts/e2e-referrals.mjs
import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import fs from 'node:fs'
import pg from 'pg'
import { chromium } from 'playwright'
import { loadDevelopmentDatabaseEnv } from './lib/development-database.mjs'
import { grantPass, waitForSession } from './lib/pass.mjs'

loadDevelopmentDatabaseEnv()
if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL
const target = new URL(process.env.DATABASE_URL)
if (!['localhost', '127.0.0.1'].includes(target.hostname)) throw new Error(`refusing to run against ${target.hostname}`)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SHOTS = process.env.E2E_SHOTS_DIR || 'scratch/referrals-e2e'
fs.mkdirSync(SHOTS, { recursive: true })
const stamp = Date.now()
const password = 'Referral-E2E-Only-2026!'
const emails = { admin: `ref-admin-${stamp}@example.invalid`, learner: `ref-learner-${stamp}@example.invalid`, learner2: `ref-learner2-${stamp}@example.invalid`, free: `ref-free-${stamp}@example.invalid`, refA: `ref-a-${stamp}@example.invalid`, refB: `ref-b-${stamp}@example.invalid` }
const results = []
const pass = (msg) => {
  results.push(msg)
  console.log(`PASS: ${msg}`)
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true }).catch(() => undefined)
const json = (page, url, init) => page.evaluate(async ({ url, init }) => { const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } }); let body = null; try { body = await r.json() } catch {} ; return { status: r.status, body } }, { url, init })
const post = (page, url, body) => json(page, url, { method: 'POST', body: JSON.stringify(body) })

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
const RESUME_LINES = ['Asha Verma', 'Backend Developer', 'asha.verma@example.invalid', 'Summary', 'Backend developer building Java and Spring Boot services on PostgreSQL.', 'Skills', 'Java, Spring Boot, SQL, PostgreSQL, Kafka, Docker', 'Experience', 'Software Engineer at Nimbus Labs', 'Jun 2023 - Present', '- Built REST APIs in Spring Boot serving 40k daily requests', '- Wrote SQL migrations and tuned PostgreSQL queries', '- Owned Kafka consumers for payment events', 'Projects', 'Ledger Service - Java, Spring Boot, PostgreSQL, Docker', 'Education', 'B.Tech Computer Science, 2022']

async function signUp(page, email, inviteLink) {
  if (inviteLink) {
    await page.goto(`${BASE}${inviteLink}`, { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Create account', exact: true }).click()
  } else await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: /Create account/ }).click()
  await waitForSession(page)
  if (inviteLink) {
    await page.waitForURL(/\/referrer\?token=/)
    await page.getByRole('button', { name: 'Accept invitation' }).waitFor()
    return
  }
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
  const skip = page.getByRole('button', { name: 'Skip setup for now' })
  if (await skip.count()) await skip.click()
}
async function signIn(page, email) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  const opener = page.getByRole('button', { name: /Sign in/i }).first()
  if (await opener.count()) await opener.click()
  await page.getByRole('tab', { name: 'Sign in' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in to Prep' }).click()
  await waitForSession(page)
}
const userId = async (email) => (await pool.query('SELECT id FROM users WHERE email = $1', [email])).rows[0].id
async function openJob(page, companyName, title = 'Backend Engineer') {
  await page.getByRole('button', { name: 'Job Discovery', exact: true }).click()
  await page.getByRole('heading', { name: 'Job discovery' }).waitFor()
  await page.getByLabel('Search jobs').fill(companyName)
  await page.getByRole('button', { name: `${title} at ${companyName}` }).first().click()
  await page.getByRole('heading', { name: title }).waitFor()
}
async function uploadResume(page) {
  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await page.locator('input[type="file"][aria-label="Resume file"]').setInputFiles({ name: 'asha-resume.pdf', mimeType: 'application/pdf', buffer: minimalPdf(RESUME_LINES) })
  await page.getByText(/asha-resume/).first().waitFor({ timeout: 30000 })
}
/** Onboards an invited referrer through the portal UI, confirms the personal mailbox through the verify page, and lets the admin verify. */
async function onboardReferrer(page, admin, inviteLink, name, roleFamilies = ['Backend']) {
  await page.goto(`${BASE}${inviteLink}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await page.getByText('Invitation accepted').waitFor()
  await page.getByLabel('Full name').fill(name)
  await page.getByLabel('Role or title').fill('Senior Software Engineer')
  await page.getByLabel('Your location').fill('Hyderabad')
  await page.getByLabel(/Locations you can support/).fill('Hyderabad, India')
  for (const rf of roleFamilies) await page.getByLabel(rf, { exact: true }).check()
  await page.getByLabel(/I will follow my employer/).check()
  await page.getByLabel(/I consent to JobAppy storing/).check()
  await page.getByRole('button', { name: 'Save profile' }).click()
  await page.getByText('Profile saved').waitFor()
  await page.getByRole('button', { name: 'Send confirmation email' }).click()
  await page.getByText(/Email delivery is not configured/).waitFor()
  // No mailer locally: plant a known single-use token the way the mail would carry it, then open the confirmation page.
  const referrer = (await pool.query('SELECT id FROM referrer_profiles WHERE "fullName" = $1', [name])).rows[0]
  const token = randomBytes(24).toString('base64url')
  await pool.query(`UPDATE referrer_verifications SET "tokenHash" = $1, status = 'pending' WHERE "referrerId" = $2 AND status = 'failed' AND method = 'personal_email'`, [createHash('sha256').update(token).digest('hex'), referrer.id])
  await page.goto(`${BASE}/referrer/verify?token=${token}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Confirm email', exact: true }).click()
  await page.getByRole('heading', { name: 'Email confirmed' }).waitFor()
  await page.goto(`${BASE}/referrer/verify?token=${token}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Confirm email', exact: true }).click()
  await page.getByRole('heading', { name: /Already confirmed|Link not valid/ }).waitFor()
  await admin.goto(`${BASE}/admin/referrals`, { waitUntil: 'networkidle' })
  await admin.getByRole('tab', { name: /Referrers/ }).click()
  const row = admin.getByRole('row').filter({ hasText: name })
  assert.equal(await row.getByRole('button', { name: 'Verify', exact: true }).isDisabled(), true, 'approval requires a review note')
  await row.getByLabel('Employment review note').fill('e2e: personally known employee; current employment checked on a call')
  await row.getByRole('button', { name: 'Verify', exact: true }).click()
  await admin.getByText(/Employment approved for 12 months/).waitFor()
  await page.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await page.getByText('Verification: Verified').waitFor()
  await page.getByRole('button', { name: 'Set available' }).click()
  await page.getByText('Available', { exact: true }).waitFor()
  return referrer.id
}

const browser = await chromium.launch()
const pageErrors = []
try {
  // ------------------------------------------------------------------ admin: plans, companies, jobs, policy, invites
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const admin = await adminCtx.newPage()
  admin.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(admin, emails.admin)
  await pool.query('INSERT INTO user_roles ("userId", role, "grantedBy") VALUES ($1, $2, $3)', [await userId(emails.admin), 'admin', 'e2e'])
  const features = await json(admin, '/api/platform/config')
  const proFeatures = (await json(admin, '/api/admin/plans')).body?.plans?.find?.((p) => p.id === 'pro')?.features
  const allKeys = Array.from(new Set([...(proFeatures || []), 'referral.viewAvailability', 'referral.readiness', 'referral.request', 'referral.priorityMatching', 'referral.reassignment', 'referral.history', 'jobs.resumeAnalysis', 'resume.profile', 'jobs.discovery', 'jobs.matching', 'jobs.preparation']))
  assert.equal((await json(admin, '/api/admin/plans/pro', { method: 'PUT', body: JSON.stringify({ features: allKeys }) })).status, 200)
  assert.equal((await json(admin, '/api/admin/plans/free', { method: 'PUT', body: JSON.stringify({ features: ['jobs.discovery', 'tracker.basic', 'resume.profile', 'jobs.networkingBasic', 'jobs.preparationBasic', 'referral.viewAvailability', 'referral.readiness'] }) })).status, 200)
  void features
  const mk = async (name, slug) => {
    const c = await post(admin, '/api/admin/companies', { name, slug, website: `https://${slug}.example.com`, careersUrl: `https://${slug}.example.com/careers`, headquarters: 'Hyderabad, India' })
    assert.ok(c.body?.id, JSON.stringify(c.body))
    return c.body
  }
  const nimbus = await mk(`Nimbus Payments ${stamp}`, `nimbus-${stamp}`)
  const orion = await mk(`Orion Data ${stamp}`, `orion-${stamp}`)
  const mkJob = async (company, title, extra = {}) => {
    const j = await post(admin, '/api/admin/jobs', { companyId: company.id, title, roleCategory: 'backend', level: 'mid', description: 'Build and operate Java services for the payments platform with Spring Boot, PostgreSQL and Kafka. You will own APIs end to end.', requiredSkills: 'Java, Spring Boot, SQL', preferredSkills: 'Kafka, Docker', experienceMin: 2, experienceMax: 5, employmentType: 'full_time', workMode: 'hybrid', locationCity: 'Hyderabad', locationCountry: 'India', region: 'india', applyUrl: `https://${company.slug}.example.com/careers/jobs/${title.replace(/\s+/g, '-').toLowerCase()}-${stamp}`, expiresAt: '2027-01-31', ...extra })
    assert.ok(j.body?.id, JSON.stringify(j.body))
    assert.equal((await json(admin, `/api/admin/jobs/${j.body.id}`, { method: 'PATCH', body: JSON.stringify({ transition: 'publish' }) })).status, 200)
    return j.body
  }
  const jobA = await mkJob(nimbus, 'Backend Engineer')
  const jobD = await mkJob(nimbus, 'Platform Engineer')
  const jobC = await mkJob(orion, 'Backend Engineer')
  const policy = await post(admin, '/api/admin/referrals', { action: 'policy', companyId: nimbus.id, referralsEnabled: true, policyStatus: 'VERIFIED_POLICY', policySource: 'e2e: internal referral FAQ read 2026-09-28', lastReviewedAt: new Date().toISOString() })
  assert.equal(policy.status, 200, JSON.stringify(policy.body))
  const inviteA = await post(admin, '/api/admin/referrals', { action: 'invite', email: emails.refA, companyId: nimbus.id })
  const inviteB = await post(admin, '/api/admin/referrals', { action: 'invite', email: emails.refB, companyId: nimbus.id })
  assert.ok(inviteA.body?.invite?.link && inviteB.body?.invite?.link, JSON.stringify(inviteA.body))
  const coverage0 = (await json(admin, '/api/admin/referrals')).body.coverage.find((c) => c.companyId === nimbus.id)
  assert.equal(coverage0.networkAvailable, false, 'no coverage before a verified referrer exists')
  pass('admin seeds two companies and three published jobs, records a sourced policy for one company and invites two referrers (coverage still false)')

  // ------------------------------------------------------------------ referrers: accounts, invite, onboarding, verification
  const refACtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const refA = await refACtx.newPage()
  refA.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(refA, emails.refA, inviteA.body.invite.link)
  const refAId = await onboardReferrer(refA, admin, inviteA.body.invite.link, `Referrer Alpha ${stamp}`)
  const refBCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const refB = await refBCtx.newPage()
  refB.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(refB, emails.refB)
  const refBId = await onboardReferrer(refB, admin, inviteB.body.invite.link, `Referrer Beta ${stamp}`)
  const coverage1 = (await json(admin, '/api/admin/referrals')).body.coverage.find((c) => c.companyId === nimbus.id)
  assert.equal(coverage1.verifiedReferrers, 2)
  assert.equal(coverage1.networkAvailable, true)
  assert.equal((await json(refA, '/api/admin/referrals')).status, 403, 'a referrer is not an admin')
  await refA.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  assert.ok(await refA.getByText(/404|not be found|not found/i).count(), 'the admin panel is hidden from referrers')
  await shot(refA, 'referrer-dashboard')
  pass('two referrers accept invitations, complete onboarding, confirm the personal mailbox (single-use link), get admin-verified and set themselves available; coverage becomes real')

  // ------------------------------------------------------------------ learner: pass, resume, analysis, readiness, request
  const learnerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const learner = await learnerCtx.newPage()
  learner.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(learner, emails.learner)
  await grantPass(pool, emails.learner)
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await uploadResume(learner)
  await openJob(learner, nimbus.name)
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner.getByText('From your resume').first().waitFor({ timeout: 30000 })
  await learner.getByTestId('request-referral-cta').scrollIntoViewIfNeeded().catch(() => undefined)
  await learner.getByRole('tab', { name: 'Request referral' }).click()
  await learner.getByText('Referral network available').waitFor()
  await learner.getByRole('button', { name: 'Check referral readiness' }).click()
  await learner.getByText('READY FOR REVIEW').waitFor({ timeout: 20000 })
  await shot(learner, 'learner-readiness')
  const creditsBefore = (await json(learner, '/api/referrals')).body.credits
  assert.equal(creditsBefore.available, 3, 'the pass grants the monthly allowance (F)')
  await learner.getByLabel('Why this role').fill('I have shipped payment services on Spring Boot and Kafka for three years and want to work on this platform.')
  await learner.getByLabel('Relevant experience').fill('Nimbus Labs payments team: REST APIs, PostgreSQL tuning, Kafka consumers.')
  await learner.getByLabel(/I consent to JobAppy sharing/).check()
  await learner.getByRole('button', { name: 'Review and submit' }).click()
  await learner.getByText(/Submit a referral request for/).waitFor()
  await learner.getByRole('button', { name: 'Yes, submit request' }).click()
  await learner.getByText('Under referrer review').waitFor({ timeout: 20000 })
  await learner.getByText('Verified employee').waitFor()
  await learner.getByText(`Company: ${nimbus.name}`).waitFor()
  await learner.getByText('Identity protected').waitFor()
  const bodyText = await learner.locator('.referral-tab').innerText()
  assert.ok(!bodyText.includes('Referrer Alpha') && !bodyText.includes('Referrer Beta') && !bodyText.includes('nimbus-payments.example.com'), 'no referrer identity on the learner page')
  const creditsAfter = (await json(learner, '/api/referrals')).body.credits
  assert.deepEqual([creditsAfter.available, creditsAfter.held], [2, 1], 'one credit reserved, none consumed')
  const reqA = (await json(learner, '/api/referrals')).body.requests[0]
  assert.equal(reqA.stage, 'referrer_review')
  await shot(learner, 'learner-under-review')
  pass('paid learner uploads a resume, runs the comparison, passes readiness, consents and submits; one credit is reserved and the learner sees only a protected verified employee (A, F)')

  // ------------------------------------------------------------------ referrer review: clarification → reply → accept → submitted
  const holderPage = (await json(refA, '/api/referrer')).body.assignments.length ? refA : refB
  const otherPage = holderPage === refA ? refB : refA
  const holderId = holderPage === refA ? refAId : refBId
  const otherId = holderPage === refA ? refBId : refAId
  await holderPage.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await holderPage.getByRole('button', { name: /Backend Engineer/ }).first().click()
  await holderPage.getByRole('heading', { name: `Backend Engineer · ${nimbus.name}` }).waitFor()
  await holderPage.getByText('Asha Verma').waitFor()
  await holderPage.getByText(/JobAppy readiness: READY/).waitFor()
  await shot(holderPage, 'referrer-review')
  const assignment = (await json(holderPage, '/api/referrer')).body.assignments[0]
  assert.equal((await json(otherPage, `/api/referrer/assignments/${assignment.id}`)).status, 404, 'the other referrer cannot open this assignment (I)')
  assert.equal((await post(otherPage, `/api/referrer/assignments/${assignment.id}`, { action: 'accept' })).status, 404)
  assert.equal((await json(otherPage, '/api/referrer')).body.assignments.length, 0, 'no unassigned candidates are browsable (I)')
  await holderPage.getByLabel('Clarification').fill('Which Kafka version did you run in production?')
  await holderPage.getByRole('button', { name: 'Request clarification' }).click()
  await holderPage.getByText('Waiting for the candidate').first().waitFor()
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('tab', { name: /Needs action/ }).click()
  await learner.getByRole('button', { name: new RegExp(nimbus.name) }).first().click()
  await learner.getByText('Which Kafka version did you run in production?').waitFor()
  await learner.getByLabel('Reply').fill('Kafka 3.6 with the Java client, consumer groups for payment events.')
  await learner.getByRole('button', { name: 'Send' }).click()
  await learner.getByText('Kafka 3.6 with the Java client').waitFor()
  await holderPage.reload({ waitUntil: 'networkidle' })
  await holderPage.getByRole('button', { name: /Backend Engineer/ }).first().click()
  await holderPage.getByText('Kafka 3.6 with the Java client').waitFor()
  await holderPage.getByRole('button', { name: 'Accept', exact: true }).click()
  await holderPage.getByText(/Accepted\. Submit through your employer/).waitFor()
  const creditsConsumed = (await json(learner, '/api/referrals')).body.credits
  assert.deepEqual([creditsConsumed.available, creditsConsumed.held, creditsConsumed.consumed], [2, 0, 1], 'acceptance consumes the reserved credit once')
  await holderPage.getByLabel('Reference').fill(`REQ-${stamp}`)
  await holderPage.getByRole('button', { name: 'Mark referral submitted' }).click()
  await holderPage.getByText('Marked as submitted').waitFor()
  await learner.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('tab', { name: /Completed/ }).click()
  await learner.getByRole('button', { name: new RegExp(nimbus.name) }).first().click()
  await learner.getByText('Referral submitted', { exact: true }).first().waitFor()
  await learner.getByText(/not an interview/).first().waitFor()
  await learner.getByRole('button', { name: /Add to Application Tracker/ }).click()
  await learner.getByText('Tracked with source “Referral”').waitFor()
  await learner.getByRole('button', { name: 'Applications', exact: true }).click()
  await learner.getByText(nimbus.name).first().waitFor()
  // The tracker document is persisted a moment after the state change; poll for the row.
  let state = { applications: [] }
  for (let i = 0; i < 20 && !state.applications.some((a) => a.jobRef?.jobId === jobA.id); i += 1) {
    await learner.waitForTimeout(500)
    state = await learner.evaluate(() => JSON.parse(localStorage.getItem('job-app-tracker-v2') || '{"applications":[]}'))
  }
  const trackerRow = state.applications.find((a) => a.jobRef?.jobId === jobA.id)
  assert.ok(trackerRow && trackerRow.source === 'Referral' && trackerRow.status === 'Applied', JSON.stringify(trackerRow))
  assert.equal(state.applications.filter((a) => a.jobRef?.jobId === jobA.id).length, 1, 'no duplicate application')
  const linked = (await json(learner, `/api/referrals/${reqA.id}`)).body.request
  assert.equal(linked.applicationId, trackerRow.id)
  await shot(learner, 'learner-submitted')
  pass('referrer asks for clarification, the learner replies through JobAppy, the referrer accepts (credit consumed) and marks the referral submitted; the tracker gets one application with source Referral linked to the request (A)')

  // ------------------------------------------------------------------ G / H: cross-account and privilege attempts
  const learner2Ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const learner2 = await learner2Ctx.newPage()
  learner2.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(learner2, emails.learner2)
  await grantPass(pool, emails.learner2)
  await learner2.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner2)
  assert.equal((await json(learner2, `/api/referrals/${reqA.id}`)).status, 404, 'learner B cannot read learner A’s request (G)')
  assert.equal((await post(learner2, `/api/referrals/${reqA.id}`, { action: 'message', body: 'hello' })).status, 404)
  assert.equal((await post(learner2, `/api/referrals/${reqA.id}`, { action: 'cancel' })).status, 404)
  assert.equal((await json(learner, '/api/referrer')).body.referrer, null, 'a learner has no referrer profile (H)')
  assert.equal((await json(learner, `/api/referrer/assignments/${assignment.id}`)).status, 404, 'a learner cannot open an assignment (H)')
  assert.equal((await post(learner, `/api/referrer/assignments/${assignment.id}`, { action: 'accept' })).status, 404)
  assert.equal((await json(learner, '/api/admin/referrals')).status, 403, 'non-admin cannot use admin endpoints (H)')
  assert.equal((await post(learner, `/api/admin/referrals/referrers/${holderId}`, { action: 'verify' })).status, 403)
  assert.equal((await post(learner, '/api/admin/referrals', { action: 'invite', email: 'x@example.invalid', companyId: nimbus.id })).status, 403)
  const probe = await json(learner, `/api/referrals/${reqA.id}`)
  assert.ok(!JSON.stringify(probe.body).includes('nimbus-payments.example.com') && !JSON.stringify(probe.body).includes('Referrer '), 'no corporate email or name in any learner response')
  const guestCtx = await browser.newContext()
  const guest = await guestCtx.newPage()
  await guest.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  assert.equal((await json(guest, `/api/referrals/${reqA.id}`)).status, 401)
  assert.equal((await json(guest, '/api/referrer')).status, 401)
  await guestCtx.close()
  pass('cross-account, learner-as-referrer, learner-as-admin and signed-out probes are refused without leaking ids, names or corporate emails (G, H)')

  // ------------------------------------------------------------------ B: decline → reassignment → accept
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await openJob(learner, nimbus.name, 'Platform Engineer')
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner.getByText('From your resume').first().waitFor({ timeout: 30000 })
  await learner.getByRole('tab', { name: 'Request referral' }).click()
  await learner.getByRole('button', { name: 'Check referral readiness' }).click()
  await learner.getByText('READY FOR REVIEW').waitFor({ timeout: 20000 })
  await learner.getByLabel('Why this role').fill('Platform work is where I want to grow: I run the Kafka and PostgreSQL side of a payments platform today.')
  await learner.getByLabel(/I consent to JobAppy sharing/).check()
  await learner.getByRole('button', { name: 'Review and submit' }).click()
  await learner.getByRole('button', { name: 'Yes, submit request' }).click()
  await learner.getByText('Under referrer review').waitFor({ timeout: 20000 })
  const reqB = (await json(learner, '/api/referrals')).body.requests.find((r) => r.jobId === jobD.id)
  const firstHolder = (await json(refA, '/api/referrer')).body.assignments.some((a) => a.requestId === reqB.id) ? refA : refB
  const secondHolder = firstHolder === refA ? refB : refA
  const firstPublicId = reqB.referrer.publicId
  await firstHolder.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await firstHolder.getByRole('button', { name: /Platform Engineer/ }).first().click()
  await firstHolder.getByLabel('Decline reason').selectOption('capacity')
  await firstHolder.getByRole('button', { name: 'Decline', exact: true }).click()
  await firstHolder.getByText(/Declined\. The candidate is offered to another referrer/).waitFor()
  const afterDecline = (await json(learner, `/api/referrals/${reqB.id}`)).body.request
  assert.equal(afterDecline.stage, 'referrer_review', 'reassigned immediately')
  assert.notEqual(afterDecline.referrer.publicId, firstPublicId)
  assert.ok(!JSON.stringify(afterDecline).includes('DECLINED'), 'the learner is never told who declined')
  await secondHolder.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await secondHolder.getByRole('button', { name: /Platform Engineer/ }).first().click()
  await secondHolder.getByRole('button', { name: 'Accept', exact: true }).click()
  await secondHolder.getByText(/Accepted\. Submit through your employer/).waitFor()
  await secondHolder.getByRole('button', { name: 'Mark referral submitted' }).click()
  await secondHolder.getByText('Marked as submitted').waitFor()
  const ledger = (await pool.query(`SELECT type, count(*)::int n FROM referral_credit_ledger WHERE "requestId" = $1 GROUP BY type`, [reqB.id])).rows
  assert.equal(ledger.find((r) => r.type === 'CONSUME')?.n, 1, 'exactly one credit consumed across the reassignment')
  assert.equal(ledger.find((r) => r.type === 'RESERVE')?.n, 1)
  pass('referrer 1 declines with a reason, the request re-enters matching and referrer 2 accepts and submits; one reservation, one consumption (B)')

  // ------------------------------------------------------------------ C: no referrer available
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await openJob(learner, orion.name)
  await learner.getByRole('tab', { name: 'Resume' }).click()
  await learner.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner.getByText('From your resume').first().waitFor({ timeout: 30000 })
  await learner.getByRole('tab', { name: 'Request referral' }).click()
  await learner.getByText('Referral assistance unavailable').waitFor()
  await learner.getByRole('button', { name: 'Check referral readiness' }).click()
  await learner.getByText('READY FOR REVIEW').waitFor({ timeout: 20000 })
  assert.equal(await learner.getByRole('button', { name: 'Review and submit' }).count(), 0, 'no submit button without coverage')
  const draftC = (await json(learner, `/api/jobs/${jobC.id}/referral`)).body.request
  const forced = await post(learner, `/api/jobs/${jobC.id}/referral`, { action: 'submit', requestId: draftC.id, introduction: '', whyRole: 'Trying the API directly to see whether the server refuses honestly.', relevantExperience: '', consent: true })
  assert.equal(forced.status, 200)
  assert.equal(forced.body.request.status, 'CLOSED')
  assert.equal(forced.body.request.closedReason, 'company_referrals_disabled')
  const creditsC = (await json(learner, '/api/referrals')).body.credits
  assert.equal(creditsC.held, 0, 'nothing stays reserved when the request closes at screening')
  await learner.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await openJob(learner, orion.name)
  await learner.getByRole('tab', { name: 'Request referral' }).click()
  await learner.getByText(/does not take referral requests through JobAppy/).waitFor()
  pass('a company without verified referrers shows “unavailable”, hides the submit button, and a forced API submission closes honestly with the credit released (C)')

  // ------------------------------------------------------------------ D: job expires during a request
  const reqD = await post(learner, `/api/jobs/${jobD.id}/referral`, { action: 'readiness' })
  assert.equal(reqD.body.report.checks.find((c) => c.id === 'duplicate')?.status, 'pass', 'the completed request does not block a new one')
  // A fresh request on jobA for learner2, then the job expires.
  await learner2.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await waitForSession(learner2)
  await uploadResume(learner2)
  await openJob(learner2, nimbus.name)
  await learner2.getByRole('tab', { name: 'Resume' }).click()
  await learner2.getByRole('button', { name: 'Analyze resume for this job' }).click()
  await learner2.getByText('From your resume').first().waitFor({ timeout: 30000 })
  await learner2.getByRole('tab', { name: 'Request referral' }).click()
  await learner2.getByRole('button', { name: 'Check referral readiness' }).click()
  await learner2.getByText('READY FOR REVIEW').waitFor({ timeout: 20000 })
  await learner2.getByLabel('Why this role').fill('Payments infrastructure is exactly what I have been building for the last three years.')
  await learner2.getByLabel(/I consent to JobAppy sharing/).check()
  await learner2.getByRole('button', { name: 'Review and submit' }).click()
  await learner2.getByRole('button', { name: 'Yes, submit request' }).click()
  await learner2.getByText('Under referrer review').waitFor({ timeout: 20000 })
  const reqExp = (await json(learner2, '/api/referrals')).body.requests[0]
  // Timestamps are naive UTC written by the app; SQL now() follows the local database's zone, so the value is written as the app would.
  await pool.query(`UPDATE jobs SET "expiresAt" = $2 WHERE id = $1`, [jobA.id, new Date(Date.now() - 60_000).toISOString().replace('T', ' ').replace('Z', '')])
  const sweep = await post(admin, '/api/admin/referrals', { action: 'sweep' })
  assert.equal(sweep.status, 200)
  assert.ok(sweep.body.sweep.jobExpiredClosures >= 1, JSON.stringify(sweep.body))
  await learner2.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(learner2)
  await learner2.getByRole('tab', { name: /History/ }).click()
  await learner2.getByRole('button', { name: new RegExp(nimbus.name) }).first().click()
  await learner2.getByText(/The opening closed before a referral could be made/).waitFor()
  const closedD = (await json(learner2, `/api/referrals/${reqExp.id}`)).body.request
  assert.equal(closedD.closedReason, 'job_expired')
  assert.equal((await json(learner2, '/api/referrals')).body.credits.held, 0, 'credit released after job expiry')
  pass('a request whose job expires is closed by the sweep with the reason shown to the learner and the credit released; history persists (D)')

  // ------------------------------------------------------------------ J: suspended referrer
  const suspended = await post(admin, `/api/admin/referrals/referrers/${otherId}`, { action: 'suspend', note: 'e2e' })
  assert.equal(suspended.status, 200)
  await otherPage.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await otherPage.getByText('Verification: Suspended').waitFor()
  assert.equal(await otherPage.getByRole('button', { name: 'Set available' }).count(), 0)
  const anyAssignment = (await json(otherPage, '/api/referrer')).body.assignments[0]
  if (anyAssignment) {
    const r = await post(otherPage, `/api/referrer/assignments/${anyAssignment.id}`, { action: 'accept' })
    assert.equal(r.status, 400)
    assert.match(r.body.error, /not active/)
  }
  assert.equal((await json(admin, '/api/admin/referrals')).body.coverage.find((c) => c.companyId === nimbus.id).verifiedReferrers, 1)
  pass('a suspended referrer is no longer presented as verified, cannot act on requests and disappears from coverage (J)')

  // ------------------------------------------------------------------ E: free learner
  const freeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const free = await freeCtx.newPage()
  free.on('pageerror', (e) => pageErrors.push(String(e)))
  await signUp(free, emails.free)
  await openJob(free, nimbus.name, 'Platform Engineer')
  await free.getByRole('tab', { name: 'Request referral' }).click()
  await free.getByText(/Referral (network available|assistance unavailable)/).waitFor()
  await free.getByRole('button', { name: 'Check referral readiness' }).click()
  await free.getByText(/READY FOR REVIEW|NEEDS IMPROVEMENT BEFORE REVIEW/).waitFor({ timeout: 20000 })
  const freeState = (await json(free, `/api/jobs/${jobD.id}/referral`)).body
  assert.equal(freeState.features.request, false)
  assert.equal(freeState.limits.monthly, 0)
  const freeSubmit = await post(free, `/api/jobs/${jobD.id}/referral`, { action: 'submit', requestId: freeState.request.id, whyRole: 'Testing the gate from a free account, nothing more.', introduction: '', relevantExperience: '', consent: true })
  assert.equal(freeSubmit.status, 402, 'free accounts cannot submit (E)')
  assert.equal(freeSubmit.body.code, 'upgrade')
  await shot(free, 'free-learner')
  pass('a free learner can see availability and run readiness but requesting is a Prep Pro feature (E)')

  // ------------------------------------------------------------------ K: mobile learner flow
  const mobileCtx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true })
  const mobile = await mobileCtx.newPage()
  mobile.on('pageerror', (e) => pageErrors.push(String(e)))
  await signIn(mobile, emails.learner)
  await mobile.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(mobile)
  await mobile.getByRole('heading', { name: 'Referral Center' }).first().waitFor()
  await mobile.getByRole('tab', { name: /Completed/ }).click()
  await mobile.getByRole('button', { name: new RegExp(nimbus.name) }).first().click()
  await mobile.getByText('Referral submitted', { exact: true }).first().waitFor()
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(overflow <= 2, `no horizontal scroll on a 360px screen (overflow ${overflow}px)`)
  await shot(mobile, 'mobile-referral-center')
  await mobile.goto(`${BASE}/referrer`, { waitUntil: 'networkidle' })
  await mobile.getByText(/Invite-only beta/).waitFor()
  const overflow2 = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(overflow2 <= 2, `referrer portal fits a 360px screen (overflow ${overflow2}px)`)
  await mobileCtx.close()
  pass('the Referral Center, request details and the referrer portal fit a 360px screen without horizontal scroll (K)')

  // ------------------------------------------------------------------ L: refresh / sign out / sign in persistence
  await learner.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.reload({ waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('heading', { name: 'Referral Center' }).first().waitFor()
  await learner.getByRole('button', { name: 'Sign out' }).click()
  await learner.waitForTimeout(1000)
  await learner.evaluate(() => localStorage.removeItem('job-app-tracker-v2'))
  await signIn(learner, emails.learner)
  await learner.goto(`${BASE}/app?view=referrals`, { waitUntil: 'networkidle' })
  await waitForSession(learner)
  await learner.getByRole('tab', { name: /Completed/ }).click()
  await learner.getByRole('button', { name: new RegExp(nimbus.name) }).first().waitFor()
  const persisted = (await json(learner, '/api/referrals')).body
  assert.equal(persisted.requests.filter((r) => r.stage === 'referral_submitted').length, 2)
  assert.equal(persisted.credits.consumed, 2)
  await learner.getByRole('tab', { name: /History/ }).click()
  await learner.getByRole('button', { name: new RegExp(orion.name) }).first().waitFor()
  pass('requests, credits and history survive refresh, sign-out and a clean sign-in (L)')

  // ------------------------------------------------------------------ admin console renders everything
  await admin.goto(`${BASE}/admin/referrals`, { waitUntil: 'networkidle' })
  await admin.getByRole('heading', { name: 'Referral network', exact: true }).waitFor()
  await admin.getByRole('tab', { name: /Referrers/ }).click()
  await admin.getByText(`Referrer Alpha ${stamp}`).waitFor()
  await admin.getByRole('tab', { name: /Company coverage/ }).click()
  await admin.getByText(nimbus.name).first().waitFor()
  await admin.getByRole('tab', { name: /Requests/ }).click()
  await admin.getByText(emails.learner).first().waitFor()
  const audit = (await pool.query(`SELECT action, count(*)::int n FROM admin_audit_log WHERE action LIKE 'referr%' GROUP BY action ORDER BY action`)).rows
  for (const a of ['referrer.invite', 'referrer.invite.accept', 'referrer.onboarding', 'referrer.email_confirmed', 'referrer.verify', 'referrer.suspend', 'referral.policy.update']) assert.ok(audit.some((r) => r.action === a), `audit has ${a}`)
  await shot(admin, 'admin-referrals')
  const notifications = (await pool.query(`SELECT kind, count(*)::int n FROM notification_log WHERE kind LIKE 'referr%' GROUP BY kind`)).rows
  for (const k of ['referral.request_received', 'referral.assigned', 'referral.clarification', 'referral.accepted', 'referral.submitted', 'referral.closed', 'referrer.invite', 'referrer.verify_email', 'referrer.verified']) assert.ok(notifications.some((r) => r.kind === k), `notification logged: ${k}`)
  assert.equal((await pool.query(`SELECT count(*)::int n FROM notification_log WHERE kind LIKE 'referr%' AND channel <> 'skipped'`)).rows[0].n, 0, 'no mail leaves a machine without a mailer')
  pass('the admin console lists referrers, coverage and requests; every sensitive action is audited and every event is in notification_log as skipped (no mailer)')

  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`)
  console.log(`\nAll ${results.length} referral network checks passed`)
} finally {
  await browser.close()
  await pool.end()
}
