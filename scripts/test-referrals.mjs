// Verified referral network: state machine, readiness, credits, matching and
// fair assignment (pure), then the whole lifecycle against PGlite with the real
// migrations: invite → onboarding → personal email confirmation → admin verification
// → learner readiness → submit (credit reserved) → assignment → clarification
// → accept (credit consumed) → referral submitted; decline → reassignment;
// no referrer; job expiry; assignment timeout; verification expiry; privacy of
// every learner-facing payload; cross-account access; entitlements; messages;
// deletion. No network, no mail: the notifier is captured.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { eq } from 'drizzle-orm'

await build({
  entryPoints: {
    referrals: 'src/lib/server/referrals.ts',
    states: 'src/lib/referrals/states.ts',
    readiness: 'src/lib/referrals/readiness.ts',
    matching: 'src/lib/referrals/matching.ts',
    credits: 'src/lib/referrals/credits.ts',
    privacy: 'src/lib/referrals/privacy.ts',
    features: 'src/lib/entitlements/features.ts',
    notifications: 'src/lib/server/notifications.ts',
    schema: 'src/lib/db/schema.ts',
  },
  outdir: 'scratch/referral-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})

const svc = await import('../scratch/referral-tests/referrals.mjs')
const states = await import('../scratch/referral-tests/states.mjs')
const { evaluateReadiness } = await import('../scratch/referral-tests/readiness.mjs')
const matching = await import('../scratch/referral-tests/matching.mjs')
const credits = await import('../scratch/referral-tests/credits.mjs')
const privacy = await import('../scratch/referral-tests/privacy.mjs')
const features = await import('../scratch/referral-tests/features.mjs')
const schema = await import('../scratch/referral-tests/schema.mjs')
const { buildNotification } = await import('../scratch/referral-tests/notifications.mjs')

const NOW = new Date('2026-09-28T09:00:00.000Z')
const PROFILE = {
  name: 'Asha Verma',
  headline: 'Backend Developer',
  contact: { email: 'asha@example.invalid', phone: null, links: [] },
  summary: 'Backend developer with Java and Spring Boot.',
  skills: [{ name: 'Java', evidence: null }, { name: 'Spring Boot', evidence: null }, { name: 'Kafka', evidence: null }, { name: 'SQL', evidence: null }],
  technologies: ['PostgreSQL', 'Docker'],
  employment: [{ company: 'Nimbus Labs', title: 'Software Engineer', bullets: ['Built REST APIs in Spring Boot serving 40k daily requests', 'Kafka consumers for payment events'] }],
  projects: [{ name: 'Ledger', description: 'Double-entry ledger in Java' }],
  education: [{ degree: 'B.Tech', institution: 'IIT', year: 2022 }],
  certifications: [],
  achievements: [],
  totalExperienceMonths: 36,
  sections: [],
  unknown: [],
}
const analysisFor = (missing = []) => ({
  version: 1,
  jobId: 'job-1',
  resumeId: 'r1',
  strongMatches: [],
  missingOrWeak: [],
  skillsAlignment: ['Java', 'Spring Boot', 'Kafka', 'SQL'].map((skill) => ({ skill, requirement: 'required', status: missing.includes(skill) ? 'missing' : 'demonstrated', evidence: missing.includes(skill) ? null : { quote: `used ${skill} in production`, section: 'experience' }, trackIds: [] })),
  experienceAlignment: {},
  projectRelevance: [],
  improvements: [],
  keywords: [],
  curriculumGaps: [],
  summary: { demonstrated: 4 - missing.length, weak: 0, missing: missing.length, requiredTotal: 4 },
})

function jobRow(over = {}) {
  return { id: 'job-1', companyId: 'c1', title: 'Backend Engineer', normalizedTitle: 'backend engineer', roleCategory: 'backend', description: 'Build payment services with Java, Spring Boot, Kafka and SQL.', requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'SQL'], preferredSkills: ['Redis'], level: 'mid', employmentType: 'full_time', workMode: 'hybrid', locationCity: 'Bengaluru', locationCountry: 'India', region: 'india', applyUrl: 'https://careers.example.com/jobs/1', fingerprint: 'f1', status: 'published', createdAt: NOW, updatedAt: NOW, ...over }
}

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.users).values([
    { id: 'learner', email: 'learner@example.invalid', name: 'Asha' },
    { id: 'learner2', email: 'other@example.invalid' },
    { id: 'refA', email: 'refa@example.invalid' },
    { id: 'refB', email: 'refb@example.invalid' },
    { id: 'admin', email: 'admin@example.invalid' },
  ])
  await db.insert(schema.companies).values([{ id: 'c1', name: 'Microsoft', slug: 'microsoft', createdAt: NOW, updatedAt: NOW }, { id: 'c2', name: 'Acme', slug: 'acme', createdAt: NOW, updatedAt: NOW }])
  await db.insert(schema.jobs).values([jobRow(), jobRow({ id: 'job-2', fingerprint: 'f2', title: 'Data Engineer', roleCategory: 'data-engineer' }), jobRow({ id: 'job-acme', companyId: 'c2', fingerprint: 'f3' })])
  await db.insert(schema.resumes).values({ id: 'r1', userId: 'learner', title: 'Resume', filename: 'r.pdf', mimeType: 'application/pdf', sizeBytes: 10, sha256: 'x', content: Buffer.from('pdf'), isCurrent: true, uploadedAt: NOW, updatedAt: NOW })
  await db.insert(schema.resumeProfiles).values({ resumeId: 'r1', text: 'resume text', profile: PROFILE, extractorVersion: 'rules-2', extractedAt: NOW })
  await db.insert(schema.resumeAnalyses).values({ id: 'an1', userId: 'learner', resumeId: 'r1', jobId: 'job-1', report: analysisFor(), createdAt: NOW })
  return { client, db }
}

/** Test harness deps: fixed clock (advanceable), captured notifications and audit entries. */
function harness(db, start = NOW) {
  const state = { now: new Date(start), notifications: [], audits: [] }
  const deps = { db, now: () => new Date(state.now), notify: async (userId, email, kind, data) => { state.notifications.push({ userId, email, kind, data }) }, audit: async (e) => { state.audits.push(e) } }
  return { deps, state, advance: (ms) => { state.now = new Date(state.now.getTime() + ms) } }
}

async function enablePolicy(deps, companyId = 'c1', over = {}) {
  await svc.saveCompanyPolicy(deps, companyId, { referralsEnabled: true, policyStatus: 'VERIFIED_POLICY', policySource: 'Internal careers FAQ, read 2026-09-20', lastReviewedAt: NOW.toISOString(), ...over }, 'admin')
}

/** Invite → accept → onboarding → personal email confirmed → admin verified → available. */
async function verifiedReferrer(h, userId, over = {}) {
  const invite = await svc.createInvite(h.deps, { email: `${userId.toLowerCase()}@example.invalid`, companyId: 'c1', invitedBy: 'admin' })
  await svc.acceptInvite(h.deps, { token: invite.token, userId, email: `${userId}@example.invalid` })
  await svc.completeOnboarding(h.deps, userId, { fullName: `Referrer ${userId}`, title: 'Senior Engineer', roleFamilies: ['backend'], location: 'Bengaluru', supportedLocations: ['Bengaluru', 'India'], profileUrl: 'https://www.linkedin.com/in/example', profileUrlShareable: true, experienceBand: 'senior', policyAcknowledged: true, privacyConsent: true, ...over })
  const sent = await svc.startContactVerification(h.deps, userId)
  const token = h.state.notifications.filter((n) => n.kind === 'referrer.verify_email').pop().data.token
  assert.equal(await svc.confirmContactVerification(h.deps, token), 'verified')
  assert.equal(await svc.confirmContactVerification(h.deps, token), 'invalid', 'a used token is dead (replay protection)')
  const me = await svc.getReferrerByUser(h.deps, userId)
  const verified = await svc.adminUpdateReferrer(h.deps, me.id, { action: 'verify', note: 'Personally known colleague; current employment confirmed on a call' }, 'admin')
  assert.equal(verified.verificationStatus, 'VERIFIED')
  await svc.setAvailability(h.deps, userId, { availability: 'available', ...('maxActiveRequests' in over ? { maxActiveRequests: over.maxActiveRequests } : {}) })
  assert.match(sent.sentTo, /…@example\.invalid$/)
  return svc.getReferrerByUser(h.deps, userId)
}

const LIMITS = { monthly: 3, active: 2 }
async function submit(h, over = {}) {
  const { request, report } = await svc.runReadiness(h.deps, { userId: 'learner', jobId: 'job-1' })
  assert.equal(report.status, 'READY', report.summary)
  return svc.submitRequest(h.deps, { userId: 'learner', email: 'learner@example.invalid', requestId: request.id, introduction: 'Hi, I am Asha.', whyRole: 'I have shipped payment services on Spring Boot and Kafka for three years.', relevantExperience: 'Nimbus Labs payments team.', consent: true, limits: LIMITS, ...over })
}

async function ledger(db, userId) {
  return db.select().from(schema.referralCreditLedger).where(eq(schema.referralCreditLedger.userId, userId))
}

// ---------------------------------------------------------------------------

test('admin invitation history tracks acceptance and expiry without exposing credentials', async () => {
  const { client, db } = await freshDb()
  const h = harness(db)
  try {
    const pending = await svc.createInvite({ ...h.deps, notify: async () => 'skipped' }, { email: 'pending@microsoft.com', companyId: 'c1', invitedBy: 'admin' })
    assert.equal(pending.emailStatus, 'skipped')
    const accepted = await svc.createInvite({ ...h.deps, notify: async () => 'sent' }, { email: 'refa@example.invalid', companyId: 'c1', invitedBy: 'admin' })
    assert.equal(accepted.emailStatus, 'sent')
    const failed = await svc.createInvite({ ...h.deps, notify: async () => 'failed' }, { email: 'failed@microsoft.com', companyId: 'c1', invitedBy: 'admin' })
    assert.equal(failed.emailStatus, 'failed')
    assert.ok(failed.token, 'email failure still allows manual sharing')
    await svc.acceptInvite(h.deps, { token: accepted.token, userId: 'refA', email: 'refa@example.invalid' })
    let rows = await svc.adminListInvites(h.deps)
    assert.equal(rows.find((r) => r.id === pending.id).status, 'pending')
    assert.equal(rows.find((r) => r.id === accepted.id).status, 'accepted')
    assert.equal(rows[0].companyName, 'Microsoft')
    assert.deepEqual(Object.keys(rows[0]).sort(), ['id', 'email', 'companyName', 'createdAt', 'expiresAt', 'status'].sort())
    assert.ok(!JSON.stringify(rows).includes(pending.token))
    h.advance(14 * 24 * 36e5)
    rows = await svc.adminListInvites(h.deps)
    assert.equal(rows.find((r) => r.id === pending.id).status, 'expired')
    assert.equal(rows.find((r) => r.id === accepted.id).status, 'accepted')
  } finally {
    await client.close()
  }
})

test('personal-only onboarding requires mailbox proof and a documented employment review', async () => {
  const { client, db } = await freshDb()
  const h = harness(db)
  const profile = { fullName: 'Friend One', title: 'Engineer', roleFamilies: ['backend'], location: 'Bengaluru', supportedLocations: ['any'], policyAcknowledged: true, privacyConsent: true }
  try {
    await db.update(schema.users).set({ email: 'friend@gmail.com' }).where(eq(schema.users.id, 'refA'))
    const invite = await svc.createInvite(h.deps, { email: ' Friend@Gmail.com ', companyId: 'c1', invitedBy: 'admin' })
    // Supplying a forged email argument cannot bypass the real account identity.
    await assert.rejects(() => svc.acceptInvite(h.deps, { token: invite.token, userId: 'refB', email: 'friend@gmail.com' }), /Sign in with the email/)
    const accepts = await Promise.allSettled([1, 2].map(() => svc.acceptInvite(h.deps, { token: invite.token, userId: 'refA', email: 'friend@gmail.com' })))
    assert.equal(accepts.filter((r) => r.status === 'fulfilled').length, 1, 'one profile per single-use invitation')
    const me = await svc.completeOnboarding(h.deps, 'refA', profile)
    assert.equal(me.contactEmail, 'friend@gmail.com')
    assert.equal(me.corporateEmail, null)
    assert.equal(me.contactEmailVerifiedAt, null)
    const review = { action: 'verify', note: 'Personally known friend; confirmed current Microsoft role on a call.' }
    await assert.rejects(() => svc.adminUpdateReferrer(h.deps, me.id, review, 'admin'), /confirm their personal email/)
    await svc.setAvailability(h.deps, 'refA', { availability: 'available' })
    assert.equal((await svc.companyCoverage(h.deps)).find((r) => r.companyId === 'c1').verifiedReferrers, 0)
    await svc.startContactVerification(h.deps, 'refA')
    const mail = h.state.notifications.filter((n) => n.kind === 'referrer.verify_email').at(-1)
    assert.equal(mail.email, 'friend@gmail.com')
    assert.equal(await svc.confirmContactVerification(h.deps, mail.data.token), 'verified')
    assert.equal(await svc.confirmContactVerification(h.deps, mail.data.token), 'invalid')
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).verificationStatus, 'PENDING', 'email confirmation never approves employment')
    await assert.rejects(() => svc.adminUpdateReferrer(h.deps, me.id, { action: 'verify' }, 'admin'), /Explain how/)
    await assert.rejects(() => svc.adminUpdateReferrer(h.deps, me.id, review, 'nonexistent-admin'))
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).verificationStatus, 'PENDING', 'failed review is atomic')
    const approved = await svc.adminUpdateReferrer(h.deps, me.id, review, 'admin')
    assert.equal(approved.verificationStatus, 'VERIFIED')
    assert.ok(approved.verifications.some((v) => v.method === 'admin_review' && v.note === review.note))
    assert.ok(h.state.notifications.some((n) => n.kind === 'referrer.verified' && n.email === 'friend@gmail.com'))
    await assert.rejects(() => svc.completeOnboarding(h.deps, 'refA', { ...profile, fullName: 'Another Person' }), /already been submitted/)
    const publicProfile = privacy.toPublicProfile(approved, 'Microsoft', 3)
    privacy.assertNoPrivateFields(publicProfile)
    assert.ok(!JSON.stringify(publicProfile).includes('friend@gmail.com'))
  } finally { await client.close() }
})

test('personal email tokens handle resend, expiry, delivery failure and address binding', async () => {
  const { client, db } = await freshDb()
  const h = harness(db)
  try {
    const invite = await svc.createInvite(h.deps, { email: 'refa@example.invalid', companyId: 'c1', invitedBy: 'admin' })
    const me = await svc.acceptInvite(h.deps, { token: invite.token, userId: 'refA', email: 'refa@example.invalid' })
    const lastToken = () => h.state.notifications.filter((n) => n.kind === 'referrer.verify_email').at(-1).data.token
    await svc.startContactVerification(h.deps, 'refA')
    const old = lastToken()
    await svc.startContactVerification(h.deps, 'refA')
    const current = lastToken()
    assert.equal(await svc.confirmContactVerification(h.deps, old), 'invalid')
    h.advance(60 * 60_000)
    assert.equal(await svc.confirmContactVerification(h.deps, current), 'expired')
    const failed = await svc.startContactVerification({ ...h.deps, notify: async () => 'failed' }, 'refA')
    assert.equal(failed.emailStatus, 'failed')
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).emailVerificationPending, false)
    await assert.rejects(() => svc.startContactVerification(h.deps, 'refA'), /Three verification emails/)
    h.advance(25 * 36e5)
    await svc.startContactVerification(h.deps, 'refA')
    const bound = lastToken()
    await db.update(schema.referrerProfiles).set({ contactEmail: 'changed@example.invalid' }).where(eq(schema.referrerProfiles.id, me.id))
    assert.equal(await svc.confirmContactVerification(h.deps, bound), 'invalid')
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).contactEmailVerifiedAt, null)
    const skipped = await svc.startContactVerification({ ...h.deps, notify: async () => 'skipped' }, 'refA')
    assert.equal(skipped.emailStatus, 'skipped')
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).emailVerificationPending, false)
  } finally { await client.close() }
})

test('personal email migration preserves legacy employment approvals without inventing mailbox proof', async () => {
  const client = new PGlite()
  try {
    const db = drizzle(client)
    const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
    for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
    await db.dialect.migrate(migrations.slice(0, -1), db.session, { migrationsFolder: 'src/lib/db/migrations' })
    await client.exec(`INSERT INTO users (id, email) VALUES ('legacy', 'friend@gmail.com');
      INSERT INTO companies (id, name, slug) VALUES ('legacy-company', 'Legacy Company', 'legacy-company');
      INSERT INTO referrer_profiles (id, "userId", "publicId", "companyId", "fullName", "corporateEmail", "verificationStatus") VALUES ('legacy-ref', 'legacy', 'ref_legacy', 'legacy-company', 'Legacy Friend', 'friend@company.example', 'VERIFIED');`)
    await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
    const row = (await client.query('SELECT * FROM referrer_profiles')).rows[0]
    assert.equal(row.contactEmail, 'friend@gmail.com')
    assert.equal(row.contactEmailVerifiedAt, null)
    assert.equal(row.corporateEmail, 'friend@company.example')
    assert.equal(row.verificationStatus, 'VERIFIED')
  } finally { await client.close() }
})

test('invitation and confirmation emails explain personal email and separate employment review', () => {
  const invite = buildNotification('referrer.invite', { company: 'Microsoft', token: 'test-token', days: 14 })
  assert.match(invite.intro, /No work email is required/)
  assert.match(invite.intro, /admin separately reviews your employment/)
  assert.match(invite.outro, /does not imply employer endorsement/)
  assert.match(invite.ctaUrl, /\/referrer\/invite\?token=test-token$/)
  const verification = buildNotification('referrer.verify_email', { token: 'test-token' })
  assert.match(verification.subject, /personal email/)
  assert.match(verification.intro, /mailbox ownership only/)
  assert.match(verification.ctaUrl, /\/referrer\/verify\?token=test-token$/)
})

test('state machine: only declared transitions, learner stages hide assignment mechanics', () => {
  assert.ok(states.canTransition('READY', 'SUBMITTED'))
  assert.ok(states.canTransition('DECLINED', 'REASSIGNING'))
  assert.ok(!states.canTransition('DRAFT', 'ACCEPTED'))
  assert.ok(!states.canTransition('CLOSED', 'MATCHING'))
  assert.throws(() => states.assertTransition('REFERRAL_SUBMITTED', 'DECLINED'), /cannot move/)
  assert.equal(states.learnerStage('REASSIGNING'), 'matching', 'a decline is not shown as a decline')
  assert.equal(states.learnerStage('ASSIGNED'), 'referrer_review')
  assert.equal(states.learnerStage('CLARIFICATION_REQUESTED'), 'needs_your_reply')
  assert.ok(states.isOpen('REFERRAL_PENDING') && !states.isOpen('CLOSED'))
  assert.ok(states.CREDIT_RELEASING_REASONS.includes('no_referrer_available') && !states.CREDIT_RELEASING_REASONS.includes('completed'))
})

test('readiness is factual: missing resume, weak evidence, expired job, duplicate request', () => {
  const job = { status: 'published', expiresAt: null, requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'SQL'], preferredSkills: [], title: 'Backend' }
  const none = evaluateReadiness({ job, profile: null, analysis: null, now: NOW })
  assert.equal(none.status, 'NEEDS_IMPROVEMENT')
  assert.ok(none.checks.find((c) => c.id === 'resume').status === 'fail')
  const ready = evaluateReadiness({ job, profile: PROFILE, analysis: analysisFor(), preparationStarted: true, now: NOW })
  assert.equal(ready.status, 'READY')
  assert.deepEqual(ready.missingEvidence, [])
  const weak = evaluateReadiness({ job, profile: PROFILE, analysis: analysisFor(['Kafka', 'SQL', 'Spring Boot']), now: NOW })
  assert.equal(weak.status, 'NEEDS_IMPROVEMENT')
  assert.deepEqual(weak.missingEvidence, ['Spring Boot', 'Kafka', 'SQL'])
  assert.ok(weak.nextSteps.some((s) => /If you have used/.test(s)), 'guidance never tells the learner to invent skills')
  assert.ok(!JSON.stringify(weak).match(/probability|chance/i), 'no hiring probability anywhere')
  const expired = evaluateReadiness({ job: { ...job, expiresAt: '2026-09-01T00:00:00.000Z' }, profile: PROFILE, analysis: analysisFor(), now: NOW })
  assert.equal(expired.status, 'BLOCKED')
  const dup = evaluateReadiness({ job, profile: PROFILE, analysis: analysisFor(), duplicateRequest: true, now: NOW })
  assert.equal(dup.status, 'BLOCKED')
  const applied = evaluateReadiness({ job, profile: PROFILE, analysis: analysisFor(), alreadyApplied: true, alreadyAppliedRestricted: true, now: NOW })
  assert.equal(applied.status, 'BLOCKED')
})

test('credit ledger math: reserve, consume, release, refund and expiry never go negative', () => {
  const rows = [{ type: 'GRANT', amount: 3 }, { type: 'RESERVE', amount: 1, reservationId: 'q1' }, { type: 'RESERVE', amount: 1, reservationId: 'q2' }, { type: 'CONSUME', amount: 1, reservationId: 'q1' }, { type: 'RELEASE', amount: 1, reservationId: 'q2' }]
  const b = credits.creditBalance(rows)
  assert.deepEqual([b.available, b.held, b.consumed, b.released], [2, 0, 1, 1])
  assert.equal(credits.reservationOutstanding(rows, 'q1'), 0)
  assert.equal(credits.reservationOutstanding([{ type: 'RESERVE', amount: 1, reservationId: 'q3' }], 'q3'), 1)
  assert.equal(credits.creditBalance([{ type: 'EXPIRE', amount: 5 }]).available, 0)
  assert.equal(credits.periodKey(NOW), '2026-09')
  assert.equal(credits.endOfPeriod(NOW).toISOString(), '2026-10-01T00:00:00.000Z')
})

test('matching excludes ineligible referrers and assigns fairly by load and recency', () => {
  const job = { companyId: 'c1', roleCategory: 'backend', locationCity: 'Bengaluru', locationCountry: 'India', region: 'india', workMode: 'hybrid' }
  const base = { companyId: 'c1', verificationStatus: 'VERIFIED', verificationExpiresAt: null, availability: 'available', roleFamilies: ['backend'], supportedLocations: ['Bengaluru'], maxActiveRequests: 3, maxMonthlyRequests: 10, activeAssignments: 0, monthlyAssignments: 0, lastAssignedAt: null, responseRate: null, seenRequestIds: [], declinedUserIds: [] }
  const referrers = [
    { ...base, id: 'busy', publicId: 'p1', activeAssignments: 3 },
    { ...base, id: 'paused', publicId: 'p2', availability: 'paused' },
    { ...base, id: 'pending', publicId: 'p3', verificationStatus: 'PENDING' },
    { ...base, id: 'other-co', publicId: 'p4', companyId: 'c2' },
    { ...base, id: 'seen', publicId: 'p5', seenRequestIds: ['req'] },
    { ...base, id: 'data-only', publicId: 'p6', roleFamilies: ['data-engineer'] },
    { ...base, id: 'mumbai', publicId: 'p7', supportedLocations: ['Mumbai'] },
    { ...base, id: 'recent', publicId: 'p8', activeAssignments: 1, lastAssignedAt: new Date(NOW.getTime() - 36e5) },
    { ...base, id: 'fresh', publicId: 'p9', activeAssignments: 1, lastAssignedAt: new Date(NOW.getTime() - 5 * 24 * 36e5) },
    { ...base, id: 'accepts-all', publicId: 'p10', activeAssignments: 2, responseRate: 1 },
  ]
  const policy = { referralsEnabled: true, policyStatus: 'VERIFIED_POLICY', manualReviewRequired: false }
  const d = matching.matchReferrer({ requestId: 'req', learnerUserId: 'learner', job, referrers, policy, allowUnknownPolicy: false, now: NOW })
  assert.equal(d.chosen.id, 'fresh', 'lower load and least-recent assignment win; accepting everyone earns nothing')
  assert.deepEqual(d.eligible, ['fresh', 'accepts-all', 'recent'], 'an assignment within the last day costs more than one extra active request')
  const reasons = Object.fromEntries(d.excluded.map((x) => [x.id, x.reason]))
  assert.equal(reasons.busy, 'at active capacity')
  assert.equal(reasons.paused, 'paused')
  assert.equal(reasons.pending, 'verification pending')
  assert.equal(reasons['other-co'], 'different company')
  assert.equal(reasons.seen, 'already reviewed this request')
  assert.equal(reasons['data-only'], 'role family not covered')
  assert.equal(reasons.mumbai, 'location not supported')
  assert.equal(matching.matchReferrer({ requestId: 'r', learnerUserId: 'l', job, referrers: [], policy, allowUnknownPolicy: false, now: NOW }).blockedReason, 'no_referrer_available')
  assert.equal(matching.matchReferrer({ requestId: 'r', learnerUserId: 'l', job, referrers, policy: { ...policy, policyStatus: 'UNKNOWN' }, allowUnknownPolicy: false, now: NOW }).blockedReason, 'policy_unknown')
  assert.equal(matching.matchReferrer({ requestId: 'r', learnerUserId: 'l', job, referrers, policy: { ...policy, referralsEnabled: false }, allowUnknownPolicy: false, now: NOW }).blockedReason, 'policy_disabled')
  assert.equal(matching.matchReferrer({ requestId: 'r', learnerUserId: 'l', job, referrers, policy: { ...policy, manualReviewRequired: true }, allowUnknownPolicy: false, now: NOW }).blockedReason, 'manual_review')
  // Distribution: ten requests over three equal referrers land 4/3/3, never all on one.
  const pool = ['a', 'b', 'c'].map((id) => ({ ...base, id, publicId: id }))
  const counts = { a: 0, b: 0, c: 0 }
  for (let i = 0; i < 10; i += 1) {
    const pick = matching.matchReferrer({ requestId: `r${i}`, learnerUserId: 'l', job, referrers: pool, policy, allowUnknownPolicy: false, now: new Date(NOW.getTime() + i * 60_000) }).chosen
    counts[pick.id] += 1
    pick.activeAssignments += 1
    pick.monthlyAssignments += 1
    pick.lastAssignedAt = new Date(NOW.getTime() + i * 60_000)
    if (i % 3 === 2) for (const p of pool) p.activeAssignments = Math.max(0, p.activeAssignments - 1)
  }
  assert.ok(Math.max(...Object.values(counts)) - Math.min(...Object.values(counts)) <= 1, JSON.stringify(counts))
})

test('privacy projection: no identity, and small pools drop the experience band', () => {
  const r = { publicId: 'ref_x', roleFamilies: ['backend'], experienceBand: 'senior', department: 'Azure Networking', verificationStatus: 'VERIFIED', availability: 'available', fullName: 'Secret', corporateEmail: 's@microsoft.com' }
  const big = privacy.toPublicProfile(r, 'Microsoft', 5)
  assert.deepEqual(Object.keys(big).sort(), ['area', 'availability', 'company', 'experienceBand', 'identityProtected', 'publicId', 'verified'])
  assert.equal(big.area, 'Engineering')
  assert.equal(privacy.toPublicProfile(r, 'Microsoft', 2).experienceBand, null)
  assert.doesNotThrow(() => privacy.assertNoPrivateFields(big))
  assert.throws(() => privacy.assertNoPrivateFields({ referrer: { fullName: 'x' } }), /fullName/)
  assert.deepEqual(privacy.describePublicProfile(big).slice(0, 3), ['Verified employee', 'Company: Microsoft', 'Area: Engineering'])
})

test('entitlements: referral features and limits exist, free tier only looks and checks readiness', () => {
  for (const k of ['referral.viewAvailability', 'referral.readiness', 'referral.request', 'referral.priorityMatching', 'referral.reassignment', 'referral.history']) assert.ok(features.FEATURE_KEYS.includes(k), k)
  assert.ok(features.DEFAULT_TIER_FEATURES.free.includes('referral.readiness') && !features.DEFAULT_TIER_FEATURES.free.includes('referral.request'))
  assert.equal(features.DEFAULT_TIER_LIMITS.free.referralRequestsMonthly, 0)
  assert.ok(features.DEFAULT_TIER_LIMITS.pro.referralRequestsMonthly >= 1 && features.DEFAULT_TIER_LIMITS.pro.referralActiveRequests >= 1)
  assert.ok(features.LIMIT_KEYS.some((l) => l.key === 'referralReassignmentAttempts'))
  assert.ok(schema.PLATFORM_ROLES.includes('referrer'))
})

test('lifecycle: invite, onboarding, verification, readiness, submit, review, clarification, accept, submitted, disclosure', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    const refA = await verifiedReferrer(h, 'refA')
    assert.ok(refA.active && refA.publicId.startsWith('ref_'))
    assert.ok(h.state.notifications.some((n) => n.kind === 'referrer.invite' && n.email === 'refa@example.invalid'))
    assert.ok(h.state.notifications.some((n) => n.kind === 'referrer.verified'))
    const availability = await svc.jobReferralAvailability(h.deps, jobRow())
    assert.equal(availability.state, 'available')
    assert.equal((await svc.jobReferralAvailability(h.deps, jobRow({ companyId: 'c2' }))).available, false, 'no coverage at Acme')

    // Credits: the plan allowance is granted once per period.
    let summary = await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal(summary.available, 3)
    summary = await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal(summary.granted, 3, 'not granted twice in the same month')

    // Readiness and submission.
    const first = await svc.runReadiness(h.deps, { userId: 'learner', jobId: 'job-1' })
    assert.equal(first.report.status, 'READY')
    assert.equal(first.request.status, 'READY')
    await assert.rejects(() => svc.submitRequest(h.deps, { userId: 'learner', email: null, requestId: first.request.id, introduction: '', whyRole: 'short', relevantExperience: '', consent: true, limits: LIMITS }), /why this role/)
    await assert.rejects(() => svc.submitRequest(h.deps, { userId: 'learner', email: null, requestId: first.request.id, introduction: '', whyRole: 'I have shipped payment services for three years.', relevantExperience: '', consent: false, limits: LIMITS }), /Consent/)
    const submitted = await submit(h)
    assert.equal(submitted.status, 'ASSIGNED')
    assert.equal(submitted.stage, 'referrer_review')
    assert.equal(submitted.referrer.company, 'Microsoft')
    assert.equal(submitted.referrer.experienceBand, null, 'pool of one: the band is hidden')
    privacy.assertNoPrivateFields(submitted)
    const after = await svc.creditSummary(h.deps, 'learner', 3)
    assert.deepEqual([after.available, after.held], [2, 1], 'one credit reserved, none consumed yet')
    assert.deepEqual(submitted.timeline.map((t) => t.stage), ['submitted', 'matching', 'referrer_review'])
    assert.ok(h.state.notifications.some((n) => n.kind === 'referral.assigned' && n.userId === 'refA'))
    assert.ok(!h.state.notifications.some((n) => JSON.stringify(n.data).includes('Asha')), 'no learner name in notification payloads')

    // Referrer review.
    const list = await svc.listReferrerAssignments(h.deps, 'refA')
    assert.equal(list.counts.pending, 1)
    const a = await svc.getReferrerAssignment(h.deps, 'refA', list.assignments[0].id)
    assert.equal(a.candidate.name, 'Asha Verma')
    assert.equal(a.readiness.status, 'READY')
    assert.ok(a.evidence.length === 4 && a.evidence.every((e) => e.status === 'demonstrated'))
    assert.equal((await svc.getLearnerRequest(h.deps, 'learner', submitted.id)).status, 'REFERRER_REVIEW', 'viewing moves the request to review')
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'clarify', message: 'Which Kafka version did you run in production?' })
    let learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(learnerView.stage, 'needs_your_reply')
    assert.equal(learnerView.messages[0].from, 'referrer')
    await svc.learnerMessage(h.deps, 'learner', submitted.id, 'Kafka 3.6 with the Java client; consumer groups for payment events.')
    learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(learnerView.status, 'REFERRER_REVIEW')
    const accepted = await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'accept' })
    assert.equal(accepted.status, 'ACCEPTED')
    const consumed = await svc.creditSummary(h.deps, 'learner', 3)
    assert.deepEqual([consumed.available, consumed.held, consumed.consumed], [2, 0, 1])
    learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(learnerView.status, 'REFERRAL_PENDING')
    assert.equal(learnerView.stage, 'accepted')
    assert.equal(learnerView.disclosed, null, 'identity is never revealed automatically')
    // Disclosure is the referrer's choice and is logged.
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'disclose', fields: ['fullName', 'profileUrl'] })
    learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.deepEqual(learnerView.disclosed.fields, ['fullName', 'profileUrl'])
    assert.equal(learnerView.disclosed.values.fullName, 'Referrer refA')
    assert.ok(!('corporateEmail' in learnerView.disclosed.values))
    assert.equal((await svc.adminListDisclosures(h.deps)).length, 1)
    // Submission.
    const done = await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'submitted', reference: 'REQ-1234', note: 'Submitted via the internal referral tool' })
    assert.equal(done.status, 'SUBMITTED')
    learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(learnerView.stage, 'referral_submitted')
    assert.match(learnerView.nextAction, /not an interview/)
    assert.ok(h.state.notifications.some((n) => n.kind === 'referral.submitted' && n.userId === 'learner'))
    const kinds = h.state.notifications.map((n) => n.kind)
    for (const k of ['referral.request_received', 'referral.assigned', 'referral.clarification', 'referral.learner_replied', 'referral.accepted', 'referral.submitted']) assert.ok(kinds.includes(k), k)
    await svc.linkApplication(h.deps, 'learner', submitted.id, 'app-1')
    assert.equal((await svc.getLearnerRequest(h.deps, 'learner', submitted.id)).applicationId, 'app-1')
    const adminView = await svc.adminGetRequest(h.deps, submitted.id)
    assert.equal(adminView.assignments.length, 1)
    assert.equal(adminView.currentAssignment.referrerName, 'Referrer refA')
    const confirmed = await svc.adminRequestAction(h.deps, submitted.id, { action: 'confirm' }, 'admin')
    assert.equal(confirmed.status, 'REFERRAL_CONFIRMED')
    const metrics = await svc.referralMetrics(h.deps)
    assert.equal(metrics.verifiedReferrers, 1)
    assert.equal(metrics.submitted, 1)
    assert.ok(!JSON.stringify(metrics).match(/chance|probab/i))
    assert.ok(h.state.audits.some((e) => e.action === 'referral.identity.disclose'))
  } finally {
    await client.close()
  }
})

test('decline → reassignment to the next referrer → accept, with exactly one credit consumed', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA')
    await verifiedReferrer(h, 'refB')
    await svc.creditSummary(h.deps, 'learner', 3)
    const submitted = await submit(h)
    const firstPublicId = submitted.referrer.publicId
    const firstUser = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments.length ? 'refA' : 'refB'
    const secondUser = firstUser === 'refA' ? 'refB' : 'refA'
    const a1 = (await svc.listReferrerAssignments(h.deps, firstUser)).assignments[0]
    assert.equal((await svc.listReferrerAssignments(h.deps, secondUser)).assignments.length, 0, 'only one referrer holds the request')
    await svc.respondToAssignment(h.deps, firstUser, a1.id, { action: 'decline', reason: 'capacity', note: 'Travelling this month' })
    const view = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(view.status, 'ASSIGNED', 'reassigned immediately')
    assert.notEqual(view.referrer.publicId, firstPublicId)
    assert.equal(view.stage, 'referrer_review')
    assert.ok(!JSON.stringify(view).includes('DECLINED'), 'the learner view never says who declined')
    assert.ok(view.timeline.filter((t) => t.stage === 'matching').length >= 1)
    const a2 = (await svc.listReferrerAssignments(h.deps, secondUser)).assignments[0]
    await svc.respondToAssignment(h.deps, secondUser, a2.id, { action: 'accept' })
    const rows = await ledger(db, 'learner')
    assert.equal(rows.filter((r) => r.type === 'CONSUME').length, 1)
    assert.equal(rows.filter((r) => r.type === 'RESERVE').length, 1)
    const s = await svc.creditSummary(h.deps, 'learner', 3)
    assert.deepEqual([s.available, s.consumed], [2, 1])
    const declinedView = await svc.getReferrerAssignment(h.deps, firstUser, a1.id)
    assert.equal(declinedView.candidate, null, 'after declining, the candidate package is gone')
    const admin = await svc.adminGetRequest(h.deps, submitted.id)
    assert.equal(admin.assignments[0].declineReason, 'capacity')
    assert.equal(admin.attempts, 2)
  } finally {
    await client.close()
  }
})

test('no eligible referrer: the request closes honestly and the credit is released', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA', { roleFamilies: ['data-engineer'] })
    await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal((await svc.jobReferralAvailability(h.deps, jobRow())).available, false)
    const result = await submit(h)
    assert.equal(result.status, 'CLOSED')
    assert.equal(result.closedReason, 'no_referrer_available')
    assert.equal(result.stage, 'closed')
    assert.equal(result.referrer, null)
    const s = await svc.creditSummary(h.deps, 'learner', 3)
    assert.deepEqual([s.available, s.held, s.released], [3, 0, 1])
    assert.ok(h.state.notifications.some((n) => n.kind === 'referral.closed' && n.data.reason === 'no_referrer_available'))
    // Attempts exhausted: two referrers decline and the setting allows two attempts.
    await svc.saveReferralSettings(h.deps, { maxAttempts: 2 }, 'admin')
    await svc.adminUpdateReferrer(h.deps, (await svc.getReferrerByUser(h.deps, 'refA')).id, { action: 'roleFamilies', roleFamilies: ['backend'] }, 'admin')
    await verifiedReferrer(h, 'refB')
    const second = await submit(h)
    assert.equal(second.status, 'ASSIGNED')
    for (let round = 0; round < 3; round += 1) {
      for (const u of ['refA', 'refB']) {
        const a = (await svc.listReferrerAssignments(h.deps, u)).assignments.find((x) => x.status === 'PENDING')
        if (a) await svc.respondToAssignment(h.deps, u, a.id, { action: 'decline', reason: 'cannot_refer_role' })
      }
    }
    const closed = await svc.getLearnerRequest(h.deps, 'learner', second.id)
    assert.equal(closed.status, 'CLOSED')
    assert.equal(closed.closedReason, 'attempts_exhausted')
    const s2 = await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal(s2.available, 3, 'credit returned after every referrer declined')
  } finally {
    await client.close()
  }
})

test('company policy: unknown blocks unless allowed, disabled closes the request, verified policy needs a source', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await verifiedReferrer(h, 'refA')
    await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal((await svc.getCompanyPolicy(h.deps.db, 'c1')).policyStatus, 'UNKNOWN')
    await assert.rejects(() => svc.saveCompanyPolicy(h.deps, 'c1', { policyStatus: 'VERIFIED_POLICY' }, 'admin'), /source/)
    await svc.saveCompanyPolicy(h.deps, 'c1', { referralsEnabled: true }, 'admin')
    const unknown = await submit(h)
    assert.equal(unknown.closedReason, 'company_referrals_disabled', 'UNKNOWN stays unknown and blocks by default')
    await svc.saveReferralSettings(h.deps, { allowUnknownPolicy: true }, 'admin')
    const allowed = await submit(h)
    assert.equal(allowed.status, 'ASSIGNED')
    await svc.cancelRequest(h.deps, 'learner', allowed.id)
    await svc.saveCompanyPolicy(h.deps, 'c1', { policyStatus: 'REFERRALS_DISABLED' }, 'admin')
    assert.equal((await svc.getCompanyPolicy(h.deps.db, 'c1')).referralsEnabled, false)
    const disabled = await submit(h)
    assert.equal(disabled.closedReason, 'company_referrals_disabled')
    const coverage = await svc.companyCoverage(h.deps)
    const ms = coverage.find((c) => c.companyId === 'c1')
    assert.equal(ms.verifiedReferrers, 1)
    assert.equal(ms.networkAvailable, false)
    assert.equal(coverage.find((c) => c.companyId === 'c2').verifiedReferrers, 0)
  } finally {
    await client.close()
  }
})

test('job expiry, assignment timeout and verification expiry are handled by the sweep', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA')
    await verifiedReferrer(h, 'refB')
    await svc.creditSummary(h.deps, 'learner', 3)
    const submitted = await submit(h)
    // Timeout: the first referrer never answers; after the TTL the request moves to the other referrer.
    const holder = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments.length ? 'refA' : 'refB'
    h.advance(73 * 36e5)
    const sweep1 = await svc.sweepReferrals(h.deps)
    assert.equal(sweep1.assignmentsExpired, 1)
    const other = holder === 'refA' ? 'refB' : 'refA'
    const a2 = (await svc.listReferrerAssignments(h.deps, other)).assignments.find((a) => a.status === 'PENDING')
    assert.ok(a2, 'reassigned to the other referrer')
    assert.equal((await svc.getLearnerRequest(h.deps, 'learner', submitted.id)).status, 'ASSIGNED')
    // Job expires while under review: the request closes and the credit returns.
    await db.update(schema.jobs).set({ expiresAt: new Date(h.state.now.getTime() - 1000) }).where(eq(schema.jobs.id, 'job-1'))
    const sweep2 = await svc.sweepReferrals(h.deps)
    assert.equal(sweep2.jobExpiredClosures, 1)
    const closed = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(closed.closedReason, 'job_expired')
    assert.equal((await svc.creditSummary(h.deps, 'learner', 3)).available, 3)
    await assert.rejects(() => svc.respondToAssignment(h.deps, other, a2.id, { action: 'accept' }), /no longer/)
    // Verification expiry: the referrer stops being verified and cannot act.
    await db.update(schema.referrerProfiles).set({ verificationExpiresAt: new Date(h.state.now.getTime() - 1000) }).where(eq(schema.referrerProfiles.userId, 'refA'))
    const sweep3 = await svc.sweepReferrals(h.deps)
    assert.equal(sweep3.verificationsExpired, 1)
    assert.equal((await svc.getReferrerByUser(h.deps, 'refA')).verificationStatus, 'EXPIRED')
    assert.equal((await svc.referralMetrics(h.deps)).verifiedReferrers, 1)
  } finally {
    await client.close()
  }
})

test('suspending a referrer with an accepted request refunds the credit and re-matches', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA')
    await svc.creditSummary(h.deps, 'learner', 3)
    const submitted = await submit(h)
    const a = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments[0]
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'accept' })
    assert.equal((await svc.creditSummary(h.deps, 'learner', 3)).consumed, 1)
    const refA = await svc.getReferrerByUser(h.deps, 'refA')
    await svc.adminUpdateReferrer(h.deps, refA.id, { action: 'suspend', note: 'Left the company' }, 'admin')
    await assert.rejects(() => svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'submitted' }), /not active/)
    const view = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    assert.equal(view.status, 'CLOSED', 'nobody else is verified, so it closes')
    assert.equal(view.closedReason, 'no_referrer_available')
    const s = await svc.creditSummary(h.deps, 'learner', 3)
    assert.equal(s.available, 3, 'refunded: the accepted referrer never submitted')
    assert.ok((await ledger(db, 'learner')).some((r) => r.type === 'REFUND'))
  } finally {
    await client.close()
  }
})

test('cross-account access: learners, referrers and suspended referrers only reach their own data', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA')
    await verifiedReferrer(h, 'refB')
    await svc.creditSummary(h.deps, 'learner', 3)
    const submitted = await submit(h)
    assert.equal(await svc.getLearnerRequest(h.deps, 'learner2', submitted.id), null, 'learner B cannot read learner A')
    await assert.rejects(() => svc.cancelRequest(h.deps, 'learner2', submitted.id), /not found/)
    await assert.rejects(() => svc.learnerMessage(h.deps, 'learner2', submitted.id, 'hello there'), /not found/)
    const holder = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments.length ? 'refA' : 'refB'
    const other = holder === 'refA' ? 'refB' : 'refA'
    const a = (await svc.listReferrerAssignments(h.deps, holder)).assignments[0]
    assert.equal(await svc.getReferrerAssignment(h.deps, other, a.id), null, 'referrer B cannot read referrer A’s assignment')
    await assert.rejects(() => svc.respondToAssignment(h.deps, other, a.id, { action: 'accept' }), /not found/)
    assert.equal((await svc.listReferrerAssignments(h.deps, other)).assignments.length, 0, 'no browsing of unassigned candidates')
    await assert.rejects(() => svc.listReferrerAssignments(h.deps, 'learner'), /No referrer profile/)
    const learnerView = await svc.getLearnerRequest(h.deps, 'learner', submitted.id)
    privacy.assertNoPrivateFields(learnerView)
    privacy.assertNoPrivateFields(await svc.listLearnerRequests(h.deps, 'learner'))
    assert.ok(!JSON.stringify(learnerView).includes('@microsoft.com'))
    assert.ok(!JSON.stringify(learnerView).includes(a.id), 'assignment ids never reach the learner')
    const ref = await svc.getReferrerByUser(h.deps, holder)
    await svc.adminUpdateReferrer(h.deps, ref.id, { action: 'suspend' }, 'admin')
    await assert.rejects(() => svc.respondToAssignment(h.deps, holder, a.id, { action: 'accept' }), /not active/)
    // Tokens: invalid and expired verification links.
    assert.equal(await svc.confirmContactVerification(h.deps, 'not-a-token'), 'invalid')
    await db.update(schema.referrerProfiles).set({ contactEmailVerifiedAt: null }).where(eq(schema.referrerProfiles.userId, other))
    await svc.startContactVerification(h.deps, other)
    const token = h.state.notifications.filter((n) => n.kind === 'referrer.verify_email').pop().data.token
    h.advance(2 * 36e5)
    assert.equal(await svc.confirmContactVerification(h.deps, token), 'expired')
    // Bad invite tokens and the corporate-mailbox rule.
    await assert.rejects(() => svc.acceptInvite(h.deps, { token: 'nope', userId: 'learner2', email: 'x' }), /invalid or has expired/)
    const inv = await svc.createInvite(h.deps, { email: 'other@example.invalid', companyId: 'c1', invitedBy: 'admin' })
    await svc.acceptInvite(h.deps, { token: inv.token, userId: 'learner2', email: 'other@example.invalid' })
    await assert.rejects(() => svc.acceptInvite(h.deps, { token: inv.token, userId: 'learner2', email: 'x' }), /invalid or has expired/, 'invite tokens are single use')
    const personal = await svc.completeOnboarding(h.deps, 'learner2', { fullName: 'Nina Rao', title: 'Engineer', roleFamilies: ['backend'], location: 'Pune', supportedLocations: ['any'], policyAcknowledged: true, privacyConsent: true })
    assert.equal(personal.corporateEmail, null)
    assert.equal(personal.contactEmail, 'other@example.invalid')
  } finally {
    await client.close()
  }
})

test('limits, duplicates and messages: plan limits enforced server-side, no second open request per job, hostile input cleaned', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA', { maxActiveRequests: 5 })
    await svc.creditSummary(h.deps, 'learner', 3)
    const r0 = await svc.runReadiness(h.deps, { userId: 'learner', jobId: 'job-1' })
    await assert.rejects(() => svc.submitRequest(h.deps, { userId: 'learner', email: null, requestId: r0.request.id, introduction: '', whyRole: 'I have shipped payment services for three years.', relevantExperience: '', consent: true, limits: { monthly: 3, active: 0 } }), /open referral request/)
    await assert.rejects(() => svc.submitRequest(h.deps, { userId: 'learner', email: null, requestId: r0.request.id, introduction: '', whyRole: 'I have shipped payment services for three years.', relevantExperience: '', consent: true, limits: { monthly: 0, active: 2 } }), /per month/)
    const first = await submit(h)
    assert.equal(first.status, 'ASSIGNED')
    const dup = await svc.runReadiness(h.deps, { userId: 'learner', jobId: 'job-1' })
    assert.equal(dup.report.status, 'BLOCKED')
    assert.ok(dup.report.checks.find((c) => c.id === 'duplicate').status === 'fail')
    assert.equal(await svc.learnerRequestForJob(h.deps, 'learner', 'job-1').then((r) => r.id), first.id, 'the live request wins over the blocked draft')
    // Without credits nothing can be submitted.
    await db.insert(schema.resumeAnalyses).values({ id: 'an2', userId: 'learner', resumeId: 'r1', jobId: 'job-2', report: { ...analysisFor(), jobId: 'job-2' }, createdAt: NOW })
    const r2 = await svc.runReadiness(h.deps, { userId: 'learner', jobId: 'job-2' })
    assert.equal(r2.report.status, 'READY')
    const bare = harness(db)
    await db.delete(schema.referralCreditLedger).where(eq(schema.referralCreditLedger.userId, 'learner2'))
    await db.insert(schema.resumes).values({ id: 'r2', userId: 'learner2', title: 'R', filename: 'r.pdf', mimeType: 'application/pdf', sizeBytes: 1, sha256: 'y', content: Buffer.from('p'), isCurrent: true, uploadedAt: NOW, updatedAt: NOW })
    await db.insert(schema.resumeProfiles).values({ resumeId: 'r2', text: 't', profile: PROFILE, extractorVersion: 'rules-2', extractedAt: NOW })
    await db.insert(schema.resumeAnalyses).values({ id: 'an3', userId: 'learner2', resumeId: 'r2', jobId: 'job-1', report: { ...analysisFor(), resumeId: 'r2' }, createdAt: NOW })
    const rB = await svc.runReadiness(bare.deps, { userId: 'learner2', jobId: 'job-1' })
    await assert.rejects(() => svc.submitRequest(bare.deps, { userId: 'learner2', email: null, requestId: rB.request.id, introduction: '', whyRole: 'Because I have built exactly this kind of system before.', relevantExperience: '', consent: true, limits: LIMITS }), /No referral credit/)
    // Messages: HTML stripped, phone numbers refused, daily cap.
    const a = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments[0]
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'clarify', message: '<script>alert(1)</script>Which version?' })
    let view = await svc.getLearnerRequest(h.deps, 'learner', first.id)
    assert.equal(view.messages[0].body, 'Which version?')
    await assert.rejects(() => svc.learnerMessage(h.deps, 'learner', first.id, 'call me on 9876543210'), /phone numbers/)
    await svc.learnerMessage(h.deps, 'learner', first.id, 'Version 3.6, and happy to share more.')
    for (let i = 0; i < 19; i += 1) await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'message', message: `note ${i}` })
    await assert.rejects(() => svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'message', message: 'one too many' }), /Message limit/)
    view = await svc.getLearnerRequest(h.deps, 'learner', first.id)
    assert.ok(view.messages.every((m) => !/<|>/.test(m.body)))
  } finally {
    await client.close()
  }
})

test('deletion: learner career-data deletion cancels and removes requests; a leaving referrer is anonymised, history kept', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps)
    await verifiedReferrer(h, 'refA')
    await svc.creditSummary(h.deps, 'learner', 3)
    const submitted = await submit(h)
    const del = await svc.deleteLearnerReferralData(h.deps, 'learner')
    assert.equal(del.requests, 1)
    assert.equal(await svc.getLearnerRequest(h.deps, 'learner', submitted.id), null)
    assert.equal((await svc.creditSummary(h.deps, 'learner', 3)).available, 3, 'the reserved credit came back before the row went')
    assert.equal((await svc.listReferrerAssignments(h.deps, 'refA')).assignments.length, 0, 'assignments cascade with the request')
    // Referrer leaves after an accepted request.
    const again = await submit(h)
    const a = (await svc.listReferrerAssignments(h.deps, 'refA')).assignments[0]
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'accept' })
    await svc.respondToAssignment(h.deps, 'refA', a.id, { action: 'submitted', reference: 'X-1' })
    assert.ok(await svc.anonymizeReferrer(h.deps, 'refA', 'admin'))
    assert.equal(await svc.getReferrerByUser(h.deps, 'refA'), null)
    const admin = await svc.adminGetRequest(h.deps, again.id)
    assert.equal(admin.status, 'REFERRAL_SUBMITTED', 'the completed referral is unchanged')
    assert.equal(admin.assignments[0].referrerName, 'Former referrer')
    const rows = await db.select().from(schema.referrerProfiles)
    assert.equal(rows[0].corporateEmail, null)
    assert.equal(rows[0].userId, null)
    assert.equal((await db.select().from(schema.userRoles).where(eq(schema.userRoles.userId, 'refA'))).length, 0)
  } finally {
    await client.close()
  }
})

test('admin operations: manual assignment when the policy needs review, reassignment, close with reason, credits grant', async () => {
  const { client, db } = await freshDb()
  try {
    const h = harness(db)
    await enablePolicy(h.deps, 'c1', { manualReviewRequired: true })
    await verifiedReferrer(h, 'refA')
    await verifiedReferrer(h, 'refB')
    await svc.grantCredits(h.deps, { userId: 'learner', amount: 2, reason: 'Beta welcome credit', source: 'promotion', actorId: 'admin' })
    assert.equal((await svc.creditSummary(h.deps, 'learner', 0)).available, 2)
    await assert.rejects(() => svc.grantCredits(h.deps, { userId: 'learner', amount: 0, reason: 'x', source: 'admin', actorId: 'admin' }), /between 1 and 100/)
    const submitted = await submit(h)
    assert.equal(submitted.status, 'MATCHING', 'manual review: waits for an admin, nothing promised')
    assert.equal(submitted.stage, 'matching')
    const pending = await svc.adminListRequests(h.deps, { needsAttention: true })
    assert.equal(pending.length, 1)
    const refA = await svc.getReferrerByUser(h.deps, 'refA')
    const assigned = await svc.adminRequestAction(h.deps, submitted.id, { action: 'assign', referrerId: refA.id }, 'admin')
    assert.equal(assigned.status, 'ASSIGNED')
    assert.equal(assigned.currentAssignment.referrerName, 'Referrer refA')
    const refB = await svc.getReferrerByUser(h.deps, 'refB')
    const reassigned = await svc.adminRequestAction(h.deps, submitted.id, { action: 'reassign', referrerId: refB.id }, 'admin')
    assert.equal(reassigned.currentAssignment.referrerName, 'Referrer refB')
    assert.equal(reassigned.assignments[0].status, 'CANCELLED')
    const closed = await svc.adminRequestAction(h.deps, submitted.id, { action: 'close', reason: 'admin' }, 'admin')
    assert.equal(closed.status, 'CLOSED')
    assert.equal((await svc.creditSummary(h.deps, 'learner', 0)).available, 2, 'admin close returns the credit')
    assert.ok(h.state.audits.some((e) => e.action === 'referral.request.close'))
    assert.ok(h.state.audits.some((e) => e.action === 'referrer.verify'))
    const list = await svc.adminListReferrers(h.deps, { status: 'VERIFIED' })
    assert.equal(list.length, 2)
    assert.ok(list[0].userEmail && list[0].contactEmail, 'admins see identity; learners never do')
  } finally {
    await client.close()
  }
})
