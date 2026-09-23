import { pgTable, text, timestamp, boolean, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core';
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

/** The learner's own AI provider key, encrypted at rest; only the last characters are kept in clear for display. */
export const userAiKeys = pgTable('user_ai_keys', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  encryptedKey: text('encryptedKey').notNull(),
  keyHint: text('keyHint').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
