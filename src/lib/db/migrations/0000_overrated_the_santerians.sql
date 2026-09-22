CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"linkedin" text
);
--> statement-breakpoint
CREATE TABLE "dsa_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"problemId" text NOT NULL,
	"date" text NOT NULL,
	"language" text NOT NULL,
	"code" text,
	"approach" text,
	"timeSpentMinutes" integer NOT NULL,
	"timeComplexity" text,
	"spaceComplexity" text,
	"hintsUsed" integer NOT NULL,
	"outcome" text NOT NULL,
	"confidence" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dsa_problems" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"titleSlug" text,
	"url" text,
	"difficulty" text NOT NULL,
	"tags" jsonb,
	"languages" jsonb,
	"status" text NOT NULL,
	"leetCodeStatus" text,
	"linkedTaskId" text
);
--> statement-breakpoint
CREATE TABLE "engineering_labs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"ticketId" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" text NOT NULL,
	"scenario" text,
	"requirements" jsonb,
	"acceptanceCriteria" jsonb,
	"techStack" jsonb,
	"estDurationMinutes" integer NOT NULL,
	"status" text NOT NULL,
	"linkedTaskId" text
);
--> statement-breakpoint
CREATE TABLE "gmail_synced_emails" (
	"messageId" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"threadId" text,
	"subject" text,
	"from" text,
	"snippet" text,
	"internalDate" text,
	"processedAt" text NOT NULL,
	"applicationId" text,
	"company" text,
	"role" text,
	"status" text,
	"confidence" text,
	"method" text,
	"skipped" boolean,
	"skipReason" text,
	"jobUrl" text,
	"recruiterName" text,
	"recruiterEmail" text,
	"interviewDate" text
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"companyType" text,
	"startDate" text NOT NULL,
	"durationDays" integer NOT NULL,
	"hoursPerDay" integer NOT NULL,
	"tracks" jsonb,
	"status" text NOT NULL,
	"goalType" text NOT NULL,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"name" text NOT NULL,
	"date" text,
	"notes" text,
	"passed" boolean
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"jobUrl" text,
	"location" text,
	"salary" text,
	"appliedDate" text,
	"source" text,
	"notes" text,
	"status" text NOT NULL,
	"followUpDate" text,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"gmailMessageIds" jsonb,
	"gmailThreadId" text,
	"recruiterName" text,
	"recruiterEmail" text,
	"interviewDate" text
);
--> statement-breakpoint
CREATE TABLE "lab_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"labId" text NOT NULL,
	"date" text NOT NULL,
	"actualDurationMinutes" integer NOT NULL,
	"outcome" text NOT NULL,
	"investigationNotes" text,
	"rootCause" text,
	"solutionCode" text,
	"testCases" text,
	"prDescription" text,
	"mentorTranscript" jsonb
);
--> statement-breakpoint
CREATE TABLE "learning_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"durationMinutes" integer NOT NULL,
	"strengths" jsonb,
	"improvementAreas" jsonb,
	"recommendedRevisionTopics" jsonb,
	"linkedTaskId" text,
	"transcript" jsonb
);
--> statement-breakpoint
CREATE TABLE "prep_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"linkedEntityId" text,
	"linkedEntityType" text,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revision_items" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"entityId" text NOT NULL,
	"entityType" text NOT NULL,
	"dueDate" text NOT NULL,
	"interval" integer NOT NULL,
	"easeFactor" integer NOT NULL,
	"topic" text
);
--> statement-breakpoint
CREATE TABLE "roadmap_days" (
	"id" text PRIMARY KEY NOT NULL,
	"goalId" text NOT NULL,
	"date" text NOT NULL,
	"dayNumber" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"dayId" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"estDurationMinutes" integer NOT NULL,
	"actualDurationMinutes" integer
);
--> statement-breakpoint
CREATE TABLE "system_design_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"exerciseId" text NOT NULL,
	"date" text NOT NULL,
	"outcome" text NOT NULL,
	"confidence" integer NOT NULL,
	"requirements" text,
	"architectureDiagram" text,
	"dataModel" text,
	"apiDesign" text,
	"bottlenecks" text,
	"code" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "system_design_exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"difficulty" text NOT NULL,
	"tags" jsonb,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"userId" text PRIMARY KEY NOT NULL,
	"leetCodeUsername" text,
	"leetCodeLastSync" text,
	"leetCodeTotalSolved" integer,
	"gmailConnectedEmail" text,
	"gmailLastSyncAt" text,
	"gmailLastHistoryId" text,
	"gmailProcessedMessageIds" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"passwordHash" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_applicationId_job_applications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dsa_attempts" ADD CONSTRAINT "dsa_attempts_problemId_dsa_problems_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."dsa_problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dsa_problems" ADD CONSTRAINT "dsa_problems_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engineering_labs" ADD CONSTRAINT "engineering_labs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_synced_emails" ADD CONSTRAINT "gmail_synced_emails_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_applicationId_job_applications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_attempts" ADD CONSTRAINT "lab_attempts_labId_engineering_labs_id_fk" FOREIGN KEY ("labId") REFERENCES "public"."engineering_labs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_tracks" ADD CONSTRAINT "learning_tracks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prep_notes" ADD CONSTRAINT "prep_notes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revision_items" ADD CONSTRAINT "revision_items_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_days" ADD CONSTRAINT "roadmap_days_goalId_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_tasks" ADD CONSTRAINT "study_tasks_dayId_roadmap_days_id_fk" FOREIGN KEY ("dayId") REFERENCES "public"."roadmap_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_design_attempts" ADD CONSTRAINT "system_design_attempts_exerciseId_system_design_exercises_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."system_design_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_design_exercises" ADD CONSTRAINT "system_design_exercises_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;