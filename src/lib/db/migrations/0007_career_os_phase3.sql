ALTER TABLE "job_sources" ADD COLUMN "scheduleEnabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lockedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lockToken" text;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lastSuccessAt" timestamp;
--> statement-breakpoint
ALTER TABLE "job_ingestion_runs" ADD COLUMN "trigger" text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_ingestion_runs" ADD COLUMN "attempts" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_ingestion_runs" ADD COLUMN "durationMs" integer;
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"filename" text NOT NULL,
	"mimeType" text NOT NULL,
	"sizeBytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"content" bytea NOT NULL,
	"targetRoleCategory" text,
	"isCurrent" boolean DEFAULT false NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "resumes_userId_idx" ON "resumes" ("userId");
--> statement-breakpoint
CREATE TABLE "resume_profiles" (
	"resumeId" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"profile" jsonb NOT NULL,
	"extractorVersion" text NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"extractedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_profiles" ADD CONSTRAINT "resume_profiles_resumeId_resumes_id_fk" FOREIGN KEY ("resumeId") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "resume_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"resumeId" text NOT NULL,
	"jobId" text NOT NULL,
	"report" jsonb NOT NULL,
	"suggestionState" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resume_analyses_user_resume_job_unique" UNIQUE("userId","resumeId","jobId")
);
--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_resumeId_resumes_id_fk" FOREIGN KEY ("resumeId") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "resume_analyses_userId_idx" ON "resume_analyses" ("userId");
