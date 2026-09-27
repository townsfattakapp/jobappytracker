CREATE TABLE "referrer_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"publicId" text NOT NULL,
	"companyId" text NOT NULL,
	"fullName" text NOT NULL,
	"corporateEmail" text,
	"corporateEmailDomain" text,
	"title" text,
	"roleFamilies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"department" text,
	"location" text,
	"supportedLocations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"profileUrl" text,
	"profileUrlShareable" boolean DEFAULT false NOT NULL,
	"experienceBand" text,
	"availability" text DEFAULT 'paused' NOT NULL,
	"maxActiveRequests" integer DEFAULT 3 NOT NULL,
	"maxMonthlyRequests" integer DEFAULT 10 NOT NULL,
	"verificationStatus" text DEFAULT 'PENDING' NOT NULL,
	"verifiedAt" timestamp,
	"verificationExpiresAt" timestamp,
	"policyAcknowledgedAt" timestamp,
	"privacyConsentAt" timestamp,
	"onboardingCompletedAt" timestamp,
	"internalNotes" text,
	"invitedBy" text,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrer_profiles_publicId_unique" UNIQUE("publicId"),
	CONSTRAINT "referrer_profiles_user_uniq" UNIQUE("userId"),
	CONSTRAINT "referrer_profiles_corporate_email_uniq" UNIQUE("corporateEmail")
);
--> statement-breakpoint
CREATE TABLE "referrer_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"companyId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"invitedBy" text,
	"note" text,
	"expiresAt" timestamp NOT NULL,
	"acceptedAt" timestamp,
	"acceptedByUserId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrer_invites_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "referrer_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"referrerId" text NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"tokenHash" text,
	"tokenExpiresAt" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"confirmedAt" timestamp,
	"reviewerId" text,
	"note" text,
	"evidenceRef" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_referral_policies" (
	"companyId" text PRIMARY KEY NOT NULL,
	"referralsEnabled" boolean DEFAULT false NOT NULL,
	"policyStatus" text DEFAULT 'UNKNOWN' NOT NULL,
	"policySource" text,
	"lastReviewedAt" timestamp,
	"alreadyAppliedRestricted" boolean DEFAULT true NOT NULL,
	"duplicateReferralRestricted" boolean DEFAULT true NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"manualReviewRequired" boolean DEFAULT false NOT NULL,
	"updatedBy" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"jobId" text,
	"companyId" text NOT NULL,
	"jobTitle" text NOT NULL,
	"companyName" text NOT NULL,
	"resumeId" text,
	"introduction" text,
	"whyRole" text,
	"relevantExperience" text,
	"consentAt" timestamp,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"readiness" jsonb,
	"readinessStatus" text,
	"creditReservationId" text,
	"currentAssignmentId" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"closedReason" text,
	"closedAt" timestamp,
	"submittedAt" timestamp,
	"referralSubmittedAt" timestamp,
	"applicationId" text,
	"lastEventAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"referrerId" text,
	"referrerPublicId" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"assignedBy" text DEFAULT 'system' NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"viewedAt" timestamp,
	"respondedAt" timestamp,
	"declineReason" text,
	"declineNote" text,
	"submittedAt" timestamp,
	"submissionReference" text,
	"submissionNote" text,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"assignmentId" text,
	"senderRole" text NOT NULL,
	"senderUserId" text,
	"body" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_status_events" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"fromStatus" text,
	"toStatus" text NOT NULL,
	"actorRole" text NOT NULL,
	"actorUserId" text,
	"reason" text,
	"meta" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_credit_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"source" text,
	"requestId" text,
	"reservationId" text,
	"periodKey" text,
	"expiresAt" timestamp,
	"actorUserId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_identity_disclosures" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"assignmentId" text,
	"referrerId" text,
	"disclosedToUserId" text,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reason" text NOT NULL,
	"referrerConsentAt" timestamp,
	"actorRole" text NOT NULL,
	"actorUserId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "referrer_profiles" ADD CONSTRAINT "referrer_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_profiles" ADD CONSTRAINT "referrer_profiles_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_invites" ADD CONSTRAINT "referrer_invites_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_invites" ADD CONSTRAINT "referrer_invites_invitedBy_users_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_invites" ADD CONSTRAINT "referrer_invites_acceptedByUserId_users_id_fk" FOREIGN KEY ("acceptedByUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_verifications" ADD CONSTRAINT "referrer_verifications_referrerId_referrer_profiles_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."referrer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrer_verifications" ADD CONSTRAINT "referrer_verifications_reviewerId_users_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_referral_policies" ADD CONSTRAINT "company_referral_policies_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_referral_policies" ADD CONSTRAINT "company_referral_policies_updatedBy_users_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_requests" ADD CONSTRAINT "referral_requests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_requests" ADD CONSTRAINT "referral_requests_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_requests" ADD CONSTRAINT "referral_requests_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_requests" ADD CONSTRAINT "referral_requests_resumeId_resumes_id_fk" FOREIGN KEY ("resumeId") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_assignments" ADD CONSTRAINT "referral_assignments_requestId_referral_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."referral_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_assignments" ADD CONSTRAINT "referral_assignments_referrerId_referrer_profiles_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."referrer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_messages" ADD CONSTRAINT "referral_messages_requestId_referral_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."referral_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_messages" ADD CONSTRAINT "referral_messages_assignmentId_referral_assignments_id_fk" FOREIGN KEY ("assignmentId") REFERENCES "public"."referral_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_messages" ADD CONSTRAINT "referral_messages_senderUserId_users_id_fk" FOREIGN KEY ("senderUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_status_events" ADD CONSTRAINT "referral_status_events_requestId_referral_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."referral_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_status_events" ADD CONSTRAINT "referral_status_events_actorUserId_users_id_fk" FOREIGN KEY ("actorUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_credit_ledger" ADD CONSTRAINT "referral_credit_ledger_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_credit_ledger" ADD CONSTRAINT "referral_credit_ledger_requestId_referral_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."referral_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_credit_ledger" ADD CONSTRAINT "referral_credit_ledger_actorUserId_users_id_fk" FOREIGN KEY ("actorUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_identity_disclosures" ADD CONSTRAINT "referral_identity_disclosures_requestId_referral_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."referral_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_identity_disclosures" ADD CONSTRAINT "referral_identity_disclosures_assignmentId_referral_assignments_id_fk" FOREIGN KEY ("assignmentId") REFERENCES "public"."referral_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_identity_disclosures" ADD CONSTRAINT "referral_identity_disclosures_referrerId_referrer_profiles_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."referrer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_identity_disclosures" ADD CONSTRAINT "referral_identity_disclosures_disclosedToUserId_users_id_fk" FOREIGN KEY ("disclosedToUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_identity_disclosures" ADD CONSTRAINT "referral_identity_disclosures_actorUserId_users_id_fk" FOREIGN KEY ("actorUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referrer_profiles_company_idx" ON "referrer_profiles" ("companyId","verificationStatus","availability");--> statement-breakpoint
CREATE INDEX "referrer_invites_email_idx" ON "referrer_invites" ("email");--> statement-breakpoint
CREATE INDEX "referrer_verifications_referrer_idx" ON "referrer_verifications" ("referrerId","status");--> statement-breakpoint
CREATE INDEX "referral_requests_user_idx" ON "referral_requests" ("userId","status");--> statement-breakpoint
CREATE INDEX "referral_requests_company_idx" ON "referral_requests" ("companyId","status");--> statement-breakpoint
CREATE INDEX "referral_requests_job_idx" ON "referral_requests" ("jobId");--> statement-breakpoint
CREATE INDEX "referral_assignments_request_idx" ON "referral_assignments" ("requestId");--> statement-breakpoint
CREATE INDEX "referral_assignments_referrer_idx" ON "referral_assignments" ("referrerId","status");--> statement-breakpoint
CREATE INDEX "referral_messages_request_idx" ON "referral_messages" ("requestId","createdAt");--> statement-breakpoint
CREATE INDEX "referral_status_events_request_idx" ON "referral_status_events" ("requestId","createdAt");--> statement-breakpoint
CREATE INDEX "referral_credit_ledger_user_idx" ON "referral_credit_ledger" ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "referral_credit_ledger_reservation_idx" ON "referral_credit_ledger" ("reservationId");--> statement-breakpoint
CREATE INDEX "referral_identity_disclosures_request_idx" ON "referral_identity_disclosures" ("requestId");
