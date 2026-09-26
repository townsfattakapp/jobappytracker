import { pgTable, text, timestamp, boolean, integer, jsonb, primaryKey, customType, unique, index } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from "next-auth/adapters"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] })
])

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] })
])

export const jobApplications = pgTable("job_applications", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  jobUrl: text("jobUrl"),
  location: text("location"),
  salary: text("salary"),
  appliedDate: text("appliedDate"),
  source: text("source"),
  notes: text("notes"),
  status: text("status").notNull(),
  followUpDate: text("followUpDate"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  gmailMessageIds: jsonb("gmailMessageIds").$type<string[]>(),
  gmailThreadId: text("gmailThreadId"),
  recruiterName: text("recruiterName"),
  recruiterEmail: text("recruiterEmail"),
  interviewDate: text("interviewDate"),
})

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  applicationId: text("applicationId").notNull().references(() => jobApplications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  linkedin: text("linkedin"),
})

export const interviewRounds = pgTable("interview_rounds", {
  id: text("id").primaryKey(),
  applicationId: text("applicationId").notNull().references(() => jobApplications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: text("date"),
  notes: text("notes"),
  passed: boolean("passed"),
})

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  companyType: text("companyType"),
  startDate: text("startDate").notNull(),
  durationDays: integer("durationDays").notNull(),
  hoursPerDay: integer("hoursPerDay").notNull(),
  tracks: jsonb("tracks").$type<string[]>(),
  status: text("status").notNull(),
  goalType: text("goalType").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
})

export const roadmapDays = pgTable("roadmap_days", {
  id: text("id").primaryKey(),
  goalId: text("goalId").notNull().references(() => goals.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  dayNumber: integer("dayNumber").notNull(),
  notes: text("notes"),
})

export const studyTasks = pgTable("study_tasks", {
  id: text("id").primaryKey(),
  dayId: text("dayId").notNull().references(() => roadmapDays.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  estDurationMinutes: integer("estDurationMinutes").notNull(),
  actualDurationMinutes: integer("actualDurationMinutes"),
})

export const dsaProblems = pgTable("dsa_problems", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleSlug: text("titleSlug"),
  url: text("url"),
  difficulty: text("difficulty").notNull(),
  tags: jsonb("tags").$type<string[]>(),
  languages: jsonb("languages").$type<string[]>(),
  status: text("status").notNull(),
  leetCodeStatus: text("leetCodeStatus"),
  linkedTaskId: text("linkedTaskId"),
})

export const dsaAttempts = pgTable("dsa_attempts", {
  id: text("id").primaryKey(),
  problemId: text("problemId").notNull().references(() => dsaProblems.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  language: text("language").notNull(),
  code: text("code"),
  approach: text("approach"),
  timeSpentMinutes: integer("timeSpentMinutes").notNull(),
  timeComplexity: text("timeComplexity"),
  spaceComplexity: text("spaceComplexity"),
  hintsUsed: integer("hintsUsed").notNull(),
  outcome: text("outcome").notNull(),
  confidence: integer("confidence").notNull(),
})

export const learningTracks = pgTable("learning_tracks", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  order: integer("order").notNull(),
})

export const systemDesignExercises = pgTable("system_design_exercises", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  difficulty: text("difficulty").notNull(),
  tags: jsonb("tags").$type<string[]>(),
  status: text("status").notNull(),
})

export const systemDesignAttempts = pgTable("system_design_attempts", {
  id: text("id").primaryKey(),
  exerciseId: text("exerciseId").notNull().references(() => systemDesignExercises.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  outcome: text("outcome").notNull(),
  confidence: integer("confidence").notNull(),
  requirements: text("requirements"),
  architectureDiagram: text("architectureDiagram"),
  dataModel: text("dataModel"),
  apiDesign: text("apiDesign"),
  bottlenecks: text("bottlenecks"),
  code: text("code"),
  notes: text("notes"),
})

export const engineeringLabs = pgTable("engineering_labs", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticketId: text("ticketId").notNull(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(),
  scenario: text("scenario"),
  requirements: jsonb("requirements").$type<string[]>(),
  acceptanceCriteria: jsonb("acceptanceCriteria").$type<string[]>(),
  techStack: jsonb("techStack").$type<string[]>(),
  estDurationMinutes: integer("estDurationMinutes").notNull(),
  status: text("status").notNull(),
  linkedTaskId: text("linkedTaskId"),
})

export const labAttempts = pgTable("lab_attempts", {
  id: text("id").primaryKey(),
  labId: text("labId").notNull().references(() => engineeringLabs.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  actualDurationMinutes: integer("actualDurationMinutes").notNull(),
  outcome: text("outcome").notNull(),
  investigationNotes: text("investigationNotes"),
  rootCause: text("rootCause"),
  solutionCode: text("solutionCode"),
  testCases: text("testCases"),
  prDescription: text("prDescription"),
  mentorTranscript: jsonb("mentorTranscript"),
})

export const mockInterviews = pgTable("mock_interviews", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  strengths: jsonb("strengths").$type<string[]>(),
  improvementAreas: jsonb("improvementAreas").$type<string[]>(),
  recommendedRevisionTopics: jsonb("recommendedRevisionTopics").$type<string[]>(),
  linkedTaskId: text("linkedTaskId"),
  transcript: jsonb("transcript"),
})

export const prepNotes = pgTable("prep_notes", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  linkedEntityId: text("linkedEntityId"),
  linkedEntityType: text("linkedEntityType"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
})

export const revisionItems = pgTable("revision_items", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityId: text("entityId").notNull(),
  entityType: text("entityType").notNull(),
  dueDate: text("dueDate").notNull(),
  interval: integer("interval").notNull(),
  easeFactor: integer("easeFactor").notNull(),
  topic: text("topic"),
})

export const userIntegrations = pgTable("user_integrations", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  leetCodeUsername: text("leetCodeUsername"),
  leetCodeLastSync: text("leetCodeLastSync"),
  leetCodeTotalSolved: integer("leetCodeTotalSolved"),
  gmailConnectedEmail: text("gmailConnectedEmail"),
  gmailLastSyncAt: text("gmailLastSyncAt"),
  gmailLastHistoryId: text("gmailLastHistoryId"),
  gmailProcessedMessageIds: jsonb("gmailProcessedMessageIds").$type<string[]>(),
})

export const gmailSyncedEmails = pgTable("gmail_synced_emails", {
  messageId: text("messageId").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  threadId: text("threadId"),
  subject: text("subject"),
  from: text("from"),
  snippet: text("snippet"),
  internalDate: text("internalDate"),
  processedAt: text("processedAt").notNull(),
  applicationId: text("applicationId"),
  company: text("company"),
  role: text("role"),
  status: text("status"),
  confidence: text("confidence"),
  method: text("method"),
  skipped: boolean("skipped"),
  skipReason: text("skipReason"),
  jobUrl: text("jobUrl"),
  recruiterName: text("recruiterName"),
  recruiterEmail: text("recruiterEmail"),
  interviewDate: text("interviewDate"),
})

// Versioned document retains curriculum metadata and all existing local collections.
export const careerState = pgTable('career_state', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  payload: jsonb('payload').$type<import('../../types').Storage>().notNull(),
  revision: integer('revision').notNull().default(1),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

/** Razorpay subscriptions; one row per subscription id, the newest row per user is authoritative. */
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('planId').notNull(),
  status: text('status').notNull(),
  currentStart: timestamp('currentStart'),
  currentEnd: timestamp('currentEnd'),
  chargeAt: timestamp('chargeAt'),
  lastPaymentId: text('lastPaymentId'),
  cancelledAt: timestamp('cancelledAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const userAiKeys = pgTable('user_ai_keys', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  encryptedKey: text('encryptedKey').notNull(),
  keyHint: text('keyHint').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const curriculumTracks = pgTable('curriculum_tracks', {
  id: text('id').primaryKey(),
  ownerId: text('ownerId').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').notNull(), // draft, review, published, archived
  version: integer('version').notNull().default(1),
  title: text('title').notNull(),
  family: text('family').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  publishedAt: timestamp('publishedAt'),
  reviewNote: text('reviewNote'),
})

// ---------------------------------------------------------------------------
// Career OS (Phase 1): RBAC, audit, companies, job sources, jobs, learner job
// preferences and platform settings. See docs/career-os-architecture.md.
// ---------------------------------------------------------------------------

export const PLATFORM_ROLES = ['admin', 'content_editor', 'jobs_editor', 'support'] as const
export type PlatformRole = (typeof PLATFORM_ROLES)[number]

export const userRoles = pgTable('user_roles', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').$type<PlatformRole>().notNull(),
  grantedBy: text('grantedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.role] }),
])

export const adminAuditLog = pgTable('admin_audit_log', {
  id: text('id').primaryKey(),
  actorId: text('actorId').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entityType').notNull(),
  entityId: text('entityId'),
  before: jsonb('before'),
  after: jsonb('after'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  website: text('website'),
  careersUrl: text('careersUrl'),
  logoUrl: text('logoUrl'),
  headquarters: text('headquarters'),
  industry: text('industry'),
  size: text('size'),
  description: text('description'),
  status: text('status').notNull().default('active'), // active | hidden
  // Company source catalog (Phase 6.5): identity and hiring relevance; null for admin-created companies.
  catalogSlug: text('catalogSlug'),
  indiaRelevance: text('indiaRelevance'), // strong | moderate | international
  roleFamilies: jsonb('roleFamilies').$type<string[]>().notNull().default([]),
  provenance: text('provenance'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  index('companies_catalog_slug_idx').on(t.catalogSlug),
])

export const jobSources = pgTable('job_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(), // manual | career_page | ats_api | provider | partner
  baseUrl: text('baseUrl'),
  termsUrl: text('termsUrl'),
  ingestionAllowed: boolean('ingestionAllowed').notNull().default(false),
  notes: text('notes'),
  status: text('status').notNull().default('active'), // active | paused
  // Phase 2: provider-based ingestion.
  provider: text('provider').notNull().default('manual'), // manual | greenhouse | lever | ashby | fixture
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  companyId: text('companyId').references(() => companies.id, { onDelete: 'set null' }),
  autoPublish: boolean('autoPublish').notNull().default(false),
  lastRunAt: timestamp('lastRunAt'),
  lastRunStatus: text('lastRunStatus'), // success | failed
  lastError: text('lastError'),
  // Phase 3: scheduling and overlap protection.
  scheduleEnabled: boolean('scheduleEnabled').notNull().default(true),
  lockedAt: timestamp('lockedAt'),
  lockToken: text('lockToken'),
  lastSuccessAt: timestamp('lastSuccessAt'),
  // Catalog verification (Phase 6.5): what portal the company uses and whether the public feed answered.
  catalogPortal: text('catalogPortal'), // greenhouse | lever | ashby | careers-site
  verificationStatus: text('verificationStatus').notNull().default('unverified'), // verified | failed | unsupported | unverified
  verifiedAt: timestamp('verifiedAt'),
  verificationNote: text('verificationNote'),
  lastVerifiedJobCount: integer('lastVerifiedJobCount'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  companyId: text('companyId').notNull().references(() => companies.id, { onDelete: 'restrict' }),
  sourceId: text('sourceId').references(() => jobSources.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  normalizedTitle: text('normalizedTitle').notNull(),
  roleCategory: text('roleCategory').notNull(),
  careerPathIds: jsonb('careerPathIds').$type<string[]>().notNull().default([]),
  trackIds: jsonb('trackIds').$type<string[]>().notNull().default([]),
  description: text('description').notNull(),
  requirementsSummary: text('requirementsSummary'),
  requiredSkills: jsonb('requiredSkills').$type<string[]>().notNull().default([]),
  preferredSkills: jsonb('preferredSkills').$type<string[]>().notNull().default([]),
  experienceMin: integer('experienceMin'),
  experienceMax: integer('experienceMax'),
  level: text('level').notNull(), // intern | entry | mid | senior | lead
  employmentType: text('employmentType').notNull(), // full_time | part_time | contract | internship
  workMode: text('workMode').notNull(), // remote | hybrid | onsite
  locationCity: text('locationCity'),
  locationCountry: text('locationCountry'),
  region: text('region').notNull(), // india | international
  salaryMin: integer('salaryMin'),
  salaryMax: integer('salaryMax'),
  salaryCurrency: text('salaryCurrency'),
  salaryPeriod: text('salaryPeriod'), // year | month
  applyUrl: text('applyUrl').notNull(),
  sourceUrl: text('sourceUrl'),
  externalId: text('externalId'),
  fingerprint: text('fingerprint').notNull().unique(),
  status: text('status').notNull().default('draft'), // draft | published | expired | archived
  postedAt: timestamp('postedAt'),
  expiresAt: timestamp('expiresAt'),
  lastVerifiedAt: timestamp('lastVerifiedAt'),
  createdBy: text('createdBy').references(() => users.id, { onDelete: 'set null' }),
  // Phase 2: lifecycle, provenance and geographic eligibility.
  lifecycle: text('lifecycle').notNull().default('active'), // discovered | active | verified | stale | expired
  firstSeenAt: timestamp('firstSeenAt'),
  lastSeenAt: timestamp('lastSeenAt'),
  remoteEligibility: text('remoteEligibility').notNull().default('unknown'), // unknown | country | region | worldwide | not_remote
  eligibleCountries: jsonb('eligibleCountries').$type<string[]>().notNull().default([]),
  rawMetadata: jsonb('rawMetadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const jobIngestionRuns = pgTable('job_ingestion_runs', {
  id: text('id').primaryKey(),
  sourceId: text('sourceId').notNull().references(() => jobSources.id, { onDelete: 'cascade' }),
  triggeredBy: text('triggeredBy'),
  startedAt: timestamp('startedAt').notNull().defaultNow(),
  finishedAt: timestamp('finishedAt'),
  status: text('status').notNull().default('running'), // running | success | failed
  fetched: integer('fetched').notNull().default(0),
  created: integer('created').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  unchanged: integer('unchanged').notNull().default(0),
  irrelevant: integer('irrelevant').notNull().default(0),
  duplicates: integer('duplicates').notNull().default(0),
  expired: integer('expired').notNull().default(0),
  error: text('error'),
  log: jsonb('log').$type<string[]>().notNull().default([]),
  trigger: text('trigger').notNull().default('manual'), // manual | scheduled
  attempts: integer('attempts').notNull().default(1),
  durationMs: integer('durationMs'),
})

/** A listing that was not stored because an existing job already carries the same fingerprint. */
export const jobDuplicates = pgTable('job_duplicates', {
  id: text('id').primaryKey(),
  jobId: text('jobId').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  sourceId: text('sourceId').references(() => jobSources.id, { onDelete: 'set null' }),
  externalId: text('externalId'),
  title: text('title').notNull(),
  applyUrl: text('applyUrl').notNull(),
  fingerprint: text('fingerprint').notNull(),
  seenAt: timestamp('seenAt').notNull().defaultNow(),
})

/** Per-day usage counters for rate-limited features (key example: jobs.analysis). */
export const usageCounters = pgTable('usage_counters', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  day: text('day').notNull(), // YYYY-MM-DD (UTC)
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.key, t.day] }),
])

export const learnerJobPreferences = pgTable('learner_job_preferences', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  roleCategories: jsonb('roleCategories').$type<string[]>().notNull().default([]),
  skills: jsonb('skills').$type<string[]>().notNull().default([]),
  experienceYears: integer('experienceYears'),
  locations: jsonb('locations').$type<string[]>().notNull().default([]),
  regionPreference: text('regionPreference').notNull().default('any'), // any | india | international
  workModes: jsonb('workModes').$type<string[]>().notNull().default([]),
  levels: jsonb('levels').$type<string[]>().notNull().default([]),
  employmentTypes: jsonb('employmentTypes').$type<string[]>().notNull().default([]),
  salaryMin: integer('salaryMin'),
  salaryCurrency: text('salaryCurrency'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedBy: text('updatedBy'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Career OS (Phase 3): resume profile, extraction and resume-vs-job analyses.
// Resume bytes stay in the database (no public storage); only the owner can
// read them. Extracted structure lives separately from the file metadata.
// ---------------------------------------------------------------------------

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const resumes = pgTable('resumes', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mimeType').notNull(),
  sizeBytes: integer('sizeBytes').notNull(),
  sha256: text('sha256').notNull(),
  content: bytea('content').notNull(),
  targetRoleCategory: text('targetRoleCategory'),
  isCurrent: boolean('isCurrent').notNull().default(false),
  uploadedAt: timestamp('uploadedAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const resumeProfiles = pgTable('resume_profiles', {
  resumeId: text('resumeId').primaryKey().references(() => resumes.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  profile: jsonb('profile').notNull(),
  extractorVersion: text('extractorVersion').notNull(),
  warnings: jsonb('warnings').$type<string[]>().notNull().default([]),
  extractedAt: timestamp('extractedAt').notNull().defaultNow(),
})

export const resumeAnalyses = pgTable('resume_analyses', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resumeId: text('resumeId').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  jobId: text('jobId').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  report: jsonb('report').notNull(),
  suggestionState: jsonb('suggestionState').$type<Record<string, 'saved' | 'dismissed' | 'completed'>>().notNull().default({}),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  unique('resume_analyses_user_resume_job_unique').on(t.userId, t.resumeId, t.jobId),
])

// ---------------------------------------------------------------------------
// Career OS (Phase 4): learner-entered outreach contacts (no scraping, no
// automation) and the per-job preparation record. Both owner-scoped.
// ---------------------------------------------------------------------------

export const OUTREACH_STATUSES = ['not_contacted', 'connection_sent', 'connected', 'referral_requested', 'referral_received', 'recruiter_replied', 'no_response', 'follow_up_due', 'closed'] as const
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number]

export const outreachContacts = pgTable('outreach_contacts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('jobId').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  contactType: text('contactType').notNull(),
  profileUrl: text('profileUrl'),
  messageType: text('messageType'),
  contactedAt: text('contactedAt'),
  status: text('status').$type<OutreachStatus>().notNull().default('not_contacted'),
  followUpDate: text('followUpDate'),
  notes: text('notes'),
  draft: text('draft'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const jobPreparations = pgTable('job_preparations', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('jobId').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  blueprint: jsonb('blueprint').notNull(),
  durationDays: integer('durationDays'),
  planGoalId: text('planGoalId'),
  planAddedAt: timestamp('planAddedAt'),
  addedTaskCount: integer('addedTaskCount').notNull().default(0),
  completedItemIds: jsonb('completedItemIds').$type<string[]>().notNull().default([]),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  unique('job_preparations_user_job_unique').on(t.userId, t.jobId),
])

// ---------------------------------------------------------------------------
// Career OS (Phase 5): admin-managed plans, provider-independent subscription
// state, webhook event ledger (idempotency) and the notification log.
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_STATUSES = ['pending', 'trialing', 'active', 'past_due', 'cancel_at_period_end', 'cancelled', 'expired'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const billingPlans = pgTable('billing_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  displayName: text('displayName').notNull(),
  description: text('description'),
  monthlyPriceMinor: integer('monthlyPriceMinor').notNull().default(0),
  annualPriceMinor: integer('annualPriceMinor').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  active: boolean('active').notNull().default(true),
  isDefault: boolean('isDefault').notNull().default(false),
  highlighted: boolean('highlighted').notNull().default(false),
  displayOrder: integer('displayOrder').notNull().default(0),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  limits: jsonb('limits').$type<Record<string, number>>().notNull().default({}),
  trialDays: integer('trialDays').notNull().default(0),
  providerPlanIds: jsonb('providerPlanIds').$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const billingSubscriptions = pgTable('billing_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('planId').notNull().references(() => billingPlans.id, { onDelete: 'restrict' }),
  interval: text('interval').notNull().default('month'), // month | year
  status: text('status').$type<SubscriptionStatus>().notNull().default('pending'),
  provider: text('provider').notNull(), // razorpay | fixture | manual
  providerSubscriptionId: text('providerSubscriptionId'),
  providerCustomerId: text('providerCustomerId'),
  currentPeriodStart: timestamp('currentPeriodStart'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
  cancelledAt: timestamp('cancelledAt'),
  trialEnd: timestamp('trialEnd'),
  lastPaymentAt: timestamp('lastPaymentAt'),
  lastPaymentError: text('lastPaymentError'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  unique('billing_subscriptions_provider_sub_unique').on(t.provider, t.providerSubscriptionId),
])

export const billingEvents = pgTable('billing_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  eventId: text('eventId').notNull(),
  eventType: text('eventType').notNull(),
  subscriptionId: text('subscriptionId'),
  payload: jsonb('payload'),
  signatureValid: boolean('signatureValid').notNull().default(false),
  status: text('status').notNull().default('received'), // processed | duplicate | ignored | rejected | failed
  error: text('error'),
  receivedAt: timestamp('receivedAt').notNull().defaultNow(),
  processedAt: timestamp('processedAt'),
}, (t) => [
  unique('billing_events_provider_event_unique').on(t.provider, t.eventId),
])

export const notificationLog = pgTable('notification_log', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  kind: text('kind').notNull(),
  channel: text('channel').notNull(), // email | skipped
  subject: text('subject').notNull(),
  status: text('status').notNull(), // sent | skipped | failed
  error: text('error'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Career OS (Phase 6): job-specific mock interview sessions. The job snapshot,
// configuration, context, question plan (with provenance), every turn with its
// evidence and the final report are stored so a historical attempt stays
// readable even after the job expires or is removed (jobId becomes null).
// ---------------------------------------------------------------------------

export const INTERVIEW_SESSION_STATUSES = ['active', 'completed', 'abandoned'] as const
export type InterviewSessionStatus = (typeof INTERVIEW_SESSION_STATUSES)[number]

export const jobInterviewSessions = pgTable('job_interview_sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('jobId').references(() => jobs.id, { onDelete: 'set null' }),
  jobSnapshot: jsonb('jobSnapshot').notNull(),
  mode: text('mode').notNull().default('full'), // full | weak_areas | section | missed_concepts | preview
  parentSessionId: text('parentSessionId'),
  config: jsonb('config').notNull(),
  context: jsonb('context').notNull(),
  plan: jsonb('plan').notNull(),
  turns: jsonb('turns').notNull().default([]),
  state: jsonb('state').notNull(),
  entitlements: jsonb('entitlements').notNull(),
  status: text('status').$type<InterviewSessionStatus>().notNull().default('active'),
  report: jsonb('report'),
  planAddedAt: timestamp('planAddedAt'),
  planAddedTaskCount: integer('planAddedTaskCount').notNull().default(0),
  startedAt: timestamp('startedAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
  durationSeconds: integer('durationSeconds'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  index('job_interview_sessions_user_job_idx').on(t.userId, t.jobId),
  index('job_interview_sessions_user_status_idx').on(t.userId, t.status),
])

// ---------------------------------------------------------------------------
// Career OS (Phase 6.5): AI gateway usage accounting. Metadata only: never
// prompt or completion text. userId is set null when the account is deleted.
// ---------------------------------------------------------------------------

export const aiUsageLog = pgTable('ai_usage_log', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull(),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  feature: text('feature').notNull(),
  provider: text('provider'),
  model: text('model'),
  status: text('status').notNull(), // ok | error | skipped
  errorKind: text('errorKind'),
  errorId: text('errorId'),
  sensitivity: text('sensitivity').notNull().default('normal'),
  promptChars: integer('promptChars').notNull().default(0),
  promptTokens: integer('promptTokens'),
  completionTokens: integer('completionTokens'),
  latencyMs: integer('latencyMs').notNull().default(0),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [
  index('ai_usage_log_user_created_idx').on(t.userId, t.createdAt),
  index('ai_usage_log_provider_created_idx').on(t.provider, t.createdAt),
])
