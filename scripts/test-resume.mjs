// Resume extraction, resume-vs-job evidence matching, no-fabrication
// invariants, application strategy and upload validation. Pure TypeScript
// bundled with esbuild; synthetic resumes only.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: { extract: 'src/lib/resume/extract.ts', analysis: 'src/lib/jobs/resumeAnalysis.ts', strategy: 'src/lib/jobs/strategy.ts', curriculumMap: 'src/lib/jobs/curriculumMap.ts', compatibility: 'src/lib/jobs/compatibility.ts' },
  outdir: 'scratch/resume-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react'],
  logLevel: 'silent',
})
const { extractResumeProfile } = await import('../scratch/resume-tests/extract.mjs')
const { analyzeResumeForJob } = await import('../scratch/resume-tests/analysis.mjs')
const { buildApplicationStrategy } = await import('../scratch/resume-tests/strategy.mjs')
const { mapJobToCurriculum } = await import('../scratch/resume-tests/curriculumMap.mjs')
const { computeCompatibility } = await import('../scratch/resume-tests/compatibility.mjs')

export const SYNTHETIC_RESUME = `Asha Verma
Backend Developer
asha.verma@example.invalid | +91 98765 43210 | github.com/asha-example

Summary
Backend developer with a focus on Java services and relational data.

Skills
Java, Spring Boot, PostgreSQL, Docker, Git

Experience
Software Engineer at Nimbus Labs
Jun 2023 - Present
- Built REST APIs in Spring Boot serving 40k daily requests
- Maintained PostgreSQL schemas and migrations
- Responsible for on-call rotation

Junior Developer at Startly
Jan 2022 - May 2023
- Wrote Java batch jobs

Projects
Inventory Tracker - Spring Boot and PostgreSQL service with Docker deployment
- Reduced report generation time by 60%

Education
B.Tech Computer Science, Pune University, 2021

Certifications
- Oracle Certified Associate, Java SE
`

const job = (over = {}) => ({
  id: 'job-1',
  companyId: 'c1',
  sourceId: null,
  title: 'Backend Engineer',
  normalizedTitle: 'backend engineer',
  roleCategory: 'backend',
  careerPathIds: [],
  trackIds: [],
  description: 'We build payment services. You will work with Java, Spring Boot, Kafka and Redis. Experience with Docker and CI/CD is a plus.',
  requirementsSummary: null,
  requiredSkills: ['Java', 'Spring Boot', 'Kafka'],
  preferredSkills: ['Redis', 'Docker'],
  experienceMin: 2,
  experienceMax: 5,
  level: 'mid',
  employmentType: 'full_time',
  workMode: 'hybrid',
  locationCity: 'Pune',
  locationCountry: 'India',
  region: 'india',
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  salaryPeriod: null,
  applyUrl: 'https://careers.example.com/jobs/1',
  sourceUrl: null,
  externalId: null,
  fingerprint: 'f',
  status: 'published',
  postedAt: '2026-09-20T00:00:00.000Z',
  expiresAt: null,
  lastVerifiedAt: '2026-09-24T00:00:00.000Z',
  createdBy: null,
  lifecycle: 'verified',
  firstSeenAt: null,
  lastSeenAt: null,
  remoteEligibility: 'not_remote',
  eligibleCountries: [],
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z',
  company: { id: 'c1', name: 'Acme', slug: 'acme', website: null, careersUrl: null, logoUrl: null, headquarters: null },
  source: null,
  ...over,
})

const NOW = new Date('2026-09-25T00:00:00Z')

test('extraction reads sections, skills, employment, projects, education and marks unknowns', () => {
  const { profile, warnings } = extractResumeProfile(SYNTHETIC_RESUME, NOW)
  assert.equal(profile.name, 'Asha Verma')
  assert.equal(profile.headline, 'Backend Developer')
  assert.equal(profile.contact.email, 'asha.verma@example.invalid')
  assert.ok(profile.contact.links.some((l) => /github\.com\/asha-example/.test(l)))
  assert.match(profile.summary, /Backend developer with a focus/)
  assert.deepEqual(profile.skills.map((s) => s.name).slice(0, 5), ['Java', 'Spring Boot', 'SQL', 'Docker', 'Git'])
  assert.ok(profile.skills.every((s) => s.evidence.lines.length > 0 && s.evidence.quote.length > 0), 'every skill cites resume lines')
  assert.equal(profile.employment.length, 2)
  assert.equal(profile.employment[0].title, 'Software Engineer')
  assert.equal(profile.employment[0].company, 'Nimbus Labs')
  assert.equal(profile.employment[0].end, 'present')
  assert.equal(profile.employment[0].bullets.length, 3)
  assert.equal(profile.employment[1].months, 16)
  assert.ok(profile.totalExperienceMonths >= 16 + 39, `total months ${profile.totalExperienceMonths}`)
  assert.equal(profile.projects.length, 1)
  assert.equal(profile.projects[0].name, 'Inventory Tracker')
  assert.ok(profile.projects[0].technologies.includes('Docker'))
  assert.equal(profile.education[0].year, '2021')
  assert.equal(profile.certifications.length, 1)
  assert.deepEqual(profile.unknown, [], 'the synthetic resume has every field')
  assert.deepEqual(warnings, [])

  const sparse = extractResumeProfile('Just a name\nSomething\nJava developer with SQL', NOW)
  assert.ok(sparse.profile.unknown.includes('years of experience') && sparse.profile.unknown.includes('education'))
  assert.equal(sparse.profile.totalExperienceMonths, null, 'no dated employment means unknown, not zero')
  assert.ok(sparse.warnings.some((w) => /No skills section/.test(w)))
})

test('resume-vs-job analysis grounds every match in evidence and never fabricates', () => {
  const { profile } = extractResumeProfile(SYNTHETIC_RESUME, NOW)
  const report = analyzeResumeForJob(job(), 'r1', profile, SYNTHETIC_RESUME, null)
  const byStatus = Object.fromEntries(report.skillsAlignment.map((r) => [r.skill, r.status]))
  assert.deepEqual(byStatus, { Java: 'demonstrated', 'Spring Boot': 'demonstrated', Kafka: 'missing', Redis: 'missing', Docker: 'demonstrated' })
  for (const m of report.strongMatches) {
    assert.ok(m.evidence.lines.length > 0)
    const cited = SYNTHETIC_RESUME.split('\n')[m.evidence.lines[0] - 1]
    assert.ok(cited && cited.length > 0, `${m.skill} cites a real line`)
  }
  assert.deepEqual(report.missingOrWeak.map((m) => m.skill), ['Kafka', 'Redis'])
  assert.deepEqual(report.summary, { demonstrated: 3, weak: 0, missing: 2, requiredTotal: 3 })
  // No suggestion ever tells the learner to add a missing skill to the resume.
  const gapSuggestions = report.improvements.filter((s) => s.kind === 'gap')
  assert.equal(gapSuggestions.length, 2)
  for (const s of gapSuggestions) {
    assert.match(s.why, /is not demonstrated in your current resume/)
    assert.match(s.action, /Do not add .* unless you have used it/)
    assert.ok(s.evidence === null)
  }
  const redis = gapSuggestions.find((s) => /Redis/.test(s.title))
  assert.match(redis.why, /Redis is a preferred skill in this job description but is not demonstrated/)
  // Bullet quality suggestions cite the bullet they talk about.
  const bullet = report.improvements.find((s) => s.kind === 'bullet' && /on-call/.test(s.why))
  assert.ok(bullet, 'a weak bullet without an action verb is flagged')
  assert.match(bullet.action, /Start with the action you took/)
  // Project relevance uses only technologies the project actually lists.
  assert.equal(report.projectRelevance[0].name, 'Inventory Tracker')
  assert.deepEqual([...report.projectRelevance[0].matchedSkills].sort(), ['Docker', 'Spring Boot'])
  // Keywords: only genuinely present ones count as in the resume.
  const kafka = report.keywords.find((k) => k.term === 'Kafka')
  assert.equal(kafka.inResume, false)
  assert.ok(report.keywords.some((k) => k.term === 'Docker' && k.inResume))
  // Experience alignment from dated employment.
  assert.match(report.experienceAlignment.verdict, /sit inside the 2–5 year range/)
  assert.ok(report.experienceAlignment.resumeYears >= 4)
  // Deterministic.
  assert.deepEqual(analyzeResumeForJob(job(), 'r1', profile, SYNTHETIC_RESUME, null), report)
})

test('curriculum gaps flow into the analysis and gap suggestions point at tracks', () => {
  const { profile } = extractResumeProfile(SYNTHETIC_RESUME, NOW)
  const map = mapJobToCurriculum(job(), { goals: [], roadmap: [], knowledgeWorkspaces: [] })
  const report = analyzeResumeForJob(job(), 'r1', profile, SYNTHETIC_RESUME, map)
  assert.ok(report.curriculumGaps.length > 0)
  const kafka = report.improvements.find((s) => s.kind === 'gap' && /Kafka/.test(s.title))
  assert.ok(kafka.trackIds.includes('track-kafka'), 'Kafka gap links to the Kafka track')
  assert.match(kafka.action, /add that track to your learning plan/)
  assert.deepEqual(kafka.provenance, ['job', 'resume', 'curriculum'])
})

test('application strategy separates job facts, resume evidence, curriculum and recommendations and never promises an interview', () => {
  const { profile } = extractResumeProfile(SYNTHETIC_RESUME, NOW)
  const map = mapJobToCurriculum(job(), { goals: [], roadmap: [], knowledgeWorkspaces: [] })
  const prefs = { roleCategories: ['backend'], skills: ['Java', 'SQL'], experienceYears: 4, locations: ['Pune'], regionPreference: 'india', workModes: [], levels: [], employmentTypes: [], salaryMin: null, salaryCurrency: null }
  const resume = analyzeResumeForJob(job(), 'r1', profile, SYNTHETIC_RESUME, map)
  const compat = computeCompatibility(job(), prefs, map)
  const s = buildApplicationStrategy({ job: job(), prefs, compatibility: compat, resume, curriculum: map })
  assert.deepEqual(s.missingInputs, [])
  assert.ok(s.requirementsSummary.every((i) => i.provenance === 'job'))
  assert.ok(s.strongestExperience.some((i) => i.provenance === 'resume' && /Spring Boot/.test(i.text)))
  assert.ok(s.importantGaps.some((i) => /Kafka \(required\) is not demonstrated/.test(i.text) && i.trackId === 'track-kafka'))
  assert.ok(s.importantGaps.some((i) => /Redis \(preferred\) is not demonstrated/.test(i.text)))
  assert.ok(s.curriculumChecklist.every((i) => i.provenance === 'curriculum'))
  assert.ok(s.projectsToEmphasise[0].text.startsWith('Inventory Tracker'))
  assert.ok(s.applicationSequence.some((i) => /careers.example.com/.test(i.text) && i.provenance === 'job'))
  assert.ok(s.interviewPriorities.some((i) => /Kafka/.test(i.text)))
  const all = [...s.requirementsSummary, ...s.strongestExperience, ...s.importantGaps, ...s.resumeChecklist, ...s.curriculumChecklist, ...s.projectsToEmphasise, ...s.applicationSequence, ...s.interviewPriorities, ...s.followUp]
  assert.ok(all.every((i) => ['job', 'resume', 'curriculum', 'recommendation'].includes(i.provenance)))
  assert.ok(!all.some((i) => /guarantee(s|d)? (an )?(interview|shortlist)/i.test(i.text) && !/does not guarantee/.test(i.text)))
  assert.ok(s.followUp.some((i) => /does not guarantee an interview or shortlist/.test(i.text)))

  const bare = buildApplicationStrategy({ job: job(), prefs: null, compatibility: null, resume: null, curriculum: null })
  assert.deepEqual(bare.missingInputs, ['resume analysis', 'compatibility analysis', 'job preferences'])
  assert.ok(bare.strongestExperience[0].provenance === 'recommendation')
})
