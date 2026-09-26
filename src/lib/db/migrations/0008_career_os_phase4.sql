CREATE TABLE "outreach_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"jobId" text NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"contactType" text NOT NULL,
	"profileUrl" text,
	"messageType" text,
	"contactedAt" text,
	"status" text DEFAULT 'not_contacted' NOT NULL,
	"followUpDate" text,
	"notes" text,
	"draft" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outreach_contacts" ADD CONSTRAINT "outreach_contacts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "outreach_contacts" ADD CONSTRAINT "outreach_contacts_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "outreach_contacts_user_job_idx" ON "outreach_contacts" ("userId", "jobId");
--> statement-breakpoint
CREATE TABLE "job_preparations" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"jobId" text NOT NULL,
	"blueprint" jsonb NOT NULL,
	"durationDays" integer,
	"planGoalId" text,
	"planAddedAt" timestamp,
	"addedTaskCount" integer DEFAULT 0 NOT NULL,
	"completedItemIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_preparations_user_job_unique" UNIQUE("userId","jobId")
);
--> statement-breakpoint
ALTER TABLE "job_preparations" ADD CONSTRAINT "job_preparations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "job_preparations" ADD CONSTRAINT "job_preparations_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
