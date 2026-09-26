CREATE TABLE "job_interview_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"jobId" text,
	"jobSnapshot" jsonb NOT NULL,
	"mode" text DEFAULT 'full' NOT NULL,
	"parentSessionId" text,
	"config" jsonb NOT NULL,
	"context" jsonb NOT NULL,
	"plan" jsonb NOT NULL,
	"turns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" jsonb NOT NULL,
	"entitlements" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"report" jsonb,
	"planAddedAt" timestamp,
	"planAddedTaskCount" integer DEFAULT 0 NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"durationSeconds" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_interview_sessions" ADD CONSTRAINT "job_interview_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_interview_sessions" ADD CONSTRAINT "job_interview_sessions_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_interview_sessions_user_job_idx" ON "job_interview_sessions" ("userId","jobId");--> statement-breakpoint
CREATE INDEX "job_interview_sessions_user_status_idx" ON "job_interview_sessions" ("userId","status");
