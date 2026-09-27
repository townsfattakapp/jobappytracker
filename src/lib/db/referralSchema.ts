import { pgTable, text, timestamp, boolean, integer, jsonb, unique, index } from 'drizzle-orm/pg-core'
import { companies, jobs, resumes, users } from './schema'

// ---------------------------------------------------------------------------
// Verified referral network (Phase 13). Private identity, verification,
// learner-facing representation, matching, messages and credits are separate
// tables so that learner-facing queries never touch identity or evidence.
// Historical records survive account deletion: user references are set null
// and the referrer row is anonymised, never deleted.
// ---------------------------------------------------------------------------

export const REFERRER_VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'EXPIRED', 'REQUIRES_REVERIFICATION'] as const
export type ReferrerVerificationStatus = (typeof REFERRER_VERIFICATION_STATUSES)[number]

export const REFERRAL_POLICY_STATUSES = ['VERIFIED_POLICY', 'PARTIAL_INFORMATION', 'UNKNOWN', 'REFERRALS_DISABLED'] as const
export type ReferralPolicyStatus = (typeof REFERRAL_POLICY_STATUSES)[number]

/** Private identity and verification state of one referrer. Never returned to learners. */
export const referrerProfiles = pgTable('referrer_profiles', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  /** Opaque learner-facing id; never derived from the user id. */
  publicId: text('publicId').notNull().unique(),
  companyId: text('companyId').notNull().references(() => companies.id, { onDelete: 'restrict' }),
  fullName: text('fullName').notNull(),
  corporateEmail: text('corporateEmail'),
  corporateEmailDomain: text('corporateEmailDomain'),
  title: text('title'),
  roleFamilies: jsonb('roleFamilies').$type<string[]>().notNull().default([]),
  department: text('department'),
  location: text('location'),
  supportedLocations: jsonb('supportedLocations').$type<string[]>().notNull().default([]),
  profileUrl: text('profileUrl'),
  /** The referrer chose to let the profile link be shared after an accepted request. */
  profileUrlShareable: boolean('profileUrlShareable').notNull().default(false),
  experienceBand: text('experienceBand'), // junior | mid | senior | lead | null
  availability: text('availability').notNull().default('paused'), // available | paused
  maxActiveRequests: integer('maxActiveRequests').notNull().default(3),
  maxMonthlyRequests: integer('maxMonthlyRequests').notNull().default(10),
  verificationStatus: text('verificationStatus').$type<ReferrerVerificationStatus>().notNull().default('PENDING'),
  verifiedAt: timestamp('verifiedAt'),
  verificationExpiresAt: timestamp('verificationExpiresAt'),
  policyAcknowledgedAt: timestamp('policyAcknowledgedAt'),
  privacyConsentAt: timestamp('privacyConsentAt'),
  onboardingCompletedAt: timestamp('onboardingCompletedAt'),
  internalNotes: text('internalNotes'),
  invitedBy: text('invitedBy'),
  deletedAt: timestamp('deletedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  unique('referrer_profiles_user_uniq').on(t.userId),
  unique('referrer_profiles_corporate_email_uniq').on(t.corporateEmail),
  index('referrer_profiles_company_idx').on(t.companyId, t.verificationStatus, t.availability),
])

/** Invite-only beta: an admin invites a corporate address for one company. */
export const referrerInvites = pgTable('referrer_invites', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  companyId: text('companyId').notNull().references(() => companies.id, { onDelete: 'restrict' }),
  tokenHash: text('tokenHash').notNull().unique(),
  invitedBy: text('invitedBy').references(() => users.id, { onDelete: 'set null' }),
  note: text('note'),
  expiresAt: timestamp('expiresAt').notNull(),
  acceptedAt: timestamp('acceptedAt'),
  acceptedByUserId: text('acceptedByUserId').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [index('referrer_invites_email_idx').on(t.email)])

/** One row per verification attempt; the token is stored hashed and the row keeps no evidence beyond a reference. */
export const referrerVerifications = pgTable('referrer_verifications', {
  id: text('id').primaryKey(),
  referrerId: text('referrerId').notNull().references(() => referrerProfiles.id, { onDelete: 'cascade' }),
  method: text('method').notNull(), // corporate_email | admin_review | evidence
  status: text('status').notNull().default('pending'), // pending | confirmed | failed | expired | rejected
  tokenHash: text('tokenHash'),
  tokenExpiresAt: timestamp('tokenExpiresAt'),
  attempts: integer('attempts').notNull().default(0),
  confirmedAt: timestamp('confirmedAt'),
  reviewerId: text('reviewerId').references(() => users.id, { onDelete: 'set null' }),
  note: text('note'),
  evidenceRef: text('evidenceRef'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [index('referrer_verifications_referrer_idx').on(t.referrerId, t.status)])

/** What is known about a company's employee-referral policy. Unknown stays unknown until an admin records a source. */
export const companyReferralPolicies = pgTable('company_referral_policies', {
  companyId: text('companyId').primaryKey().references(() => companies.id, { onDelete: 'cascade' }),
  referralsEnabled: boolean('referralsEnabled').notNull().default(false),
  policyStatus: text('policyStatus').$type<ReferralPolicyStatus>().notNull().default('UNKNOWN'),
  policySource: text('policySource'),
  lastReviewedAt: timestamp('lastReviewedAt'),
  alreadyAppliedRestricted: boolean('alreadyAppliedRestricted').notNull().default(true),
  duplicateReferralRestricted: boolean('duplicateReferralRestricted').notNull().default(true),
  constraints: jsonb('constraints').$type<string[]>().notNull().default([]),
  notes: text('notes'),
  manualReviewRequired: boolean('manualReviewRequired').notNull().default(false),
  updatedBy: text('updatedBy').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const referralRequests = pgTable('referral_requests', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('jobId').references(() => jobs.id, { onDelete: 'set null' }),
  companyId: text('companyId').notNull().references(() => companies.id, { onDelete: 'restrict' }),
  jobTitle: text('jobTitle').notNull(),
  companyName: text('companyName').notNull(),
  resumeId: text('resumeId').references(() => resumes.id, { onDelete: 'set null' }),
  introduction: text('introduction'),
  whyRole: text('whyRole'),
  relevantExperience: text('relevantExperience'),
  consentAt: timestamp('consentAt'),
  status: text('status').notNull().default('DRAFT'),
  readiness: jsonb('readiness').$type<Record<string, unknown> | null>(),
  readinessStatus: text('readinessStatus'), // READY | NEEDS_IMPROVEMENT | BLOCKED
  creditReservationId: text('creditReservationId'),
  currentAssignmentId: text('currentAssignmentId'),
  attempts: integer('attempts').notNull().default(0),
  closedReason: text('closedReason'),
  closedAt: timestamp('closedAt'),
  submittedAt: timestamp('submittedAt'),
  referralSubmittedAt: timestamp('referralSubmittedAt'),
  /** Tracker application id (client document) once the referral is linked to an application. */
  applicationId: text('applicationId'),
  lastEventAt: timestamp('lastEventAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  index('referral_requests_user_idx').on(t.userId, t.status),
  index('referral_requests_company_idx').on(t.companyId, t.status),
  index('referral_requests_job_idx').on(t.jobId),
])

export const referralAssignments = pgTable('referral_assignments', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull().references(() => referralRequests.id, { onDelete: 'cascade' }),
  referrerId: text('referrerId').references(() => referrerProfiles.id, { onDelete: 'set null' }),
  referrerPublicId: text('referrerPublicId').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING | CLARIFICATION | ACCEPTED | DECLINED | SUBMITTED | CANCELLED | EXPIRED
  assignedBy: text('assignedBy').notNull().default('system'), // system | admin
  assignedAt: timestamp('assignedAt').notNull().defaultNow(),
  viewedAt: timestamp('viewedAt'),
  respondedAt: timestamp('respondedAt'),
  declineReason: text('declineReason'),
  declineNote: text('declineNote'),
  submittedAt: timestamp('submittedAt'),
  submissionReference: text('submissionReference'),
  submissionNote: text('submissionNote'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [
  index('referral_assignments_request_idx').on(t.requestId),
  index('referral_assignments_referrer_idx').on(t.referrerId, t.status),
])

export const referralMessages = pgTable('referral_messages', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull().references(() => referralRequests.id, { onDelete: 'cascade' }),
  assignmentId: text('assignmentId').references(() => referralAssignments.id, { onDelete: 'set null' }),
  senderRole: text('senderRole').notNull(), // learner | referrer | admin | system
  senderUserId: text('senderUserId').references(() => users.id, { onDelete: 'set null' }),
  body: text('body').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [index('referral_messages_request_idx').on(t.requestId, t.createdAt)])

export const referralStatusEvents = pgTable('referral_status_events', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull().references(() => referralRequests.id, { onDelete: 'cascade' }),
  fromStatus: text('fromStatus'),
  toStatus: text('toStatus').notNull(),
  actorRole: text('actorRole').notNull(), // learner | referrer | admin | system
  actorUserId: text('actorUserId').references(() => users.id, { onDelete: 'set null' }),
  reason: text('reason'),
  meta: jsonb('meta').$type<Record<string, unknown>>(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [index('referral_status_events_request_idx').on(t.requestId, t.createdAt)])

/** Append-only credit ledger; the balance is always derived, never stored. */
export const referralCreditLedger = pgTable('referral_credit_ledger', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // GRANT | RESERVE | CONSUME | RELEASE | REFUND | EXPIRE
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  source: text('source'), // subscription | promotion | admin | purchase | system
  requestId: text('requestId').references(() => referralRequests.id, { onDelete: 'set null' }),
  reservationId: text('reservationId'),
  /** Subscription allowances are granted once per period ("2026-09"). */
  periodKey: text('periodKey'),
  expiresAt: timestamp('expiresAt'),
  actorUserId: text('actorUserId').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [
  index('referral_credit_ledger_user_idx').on(t.userId, t.createdAt),
  index('referral_credit_ledger_reservation_idx').on(t.reservationId),
])

/** Every time any identity field of a referrer reaches a learner, one row lands here. */
export const referralIdentityDisclosures = pgTable('referral_identity_disclosures', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull().references(() => referralRequests.id, { onDelete: 'cascade' }),
  assignmentId: text('assignmentId').references(() => referralAssignments.id, { onDelete: 'set null' }),
  referrerId: text('referrerId').references(() => referrerProfiles.id, { onDelete: 'set null' }),
  disclosedToUserId: text('disclosedToUserId').references(() => users.id, { onDelete: 'set null' }),
  fields: jsonb('fields').$type<string[]>().notNull().default([]),
  reason: text('reason').notNull(),
  referrerConsentAt: timestamp('referrerConsentAt'),
  actorRole: text('actorRole').notNull(), // referrer | admin
  actorUserId: text('actorUserId').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (t) => [index('referral_identity_disclosures_request_idx').on(t.requestId)])
