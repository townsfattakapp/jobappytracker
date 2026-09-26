ALTER TABLE "job_sources" ADD COLUMN "provider" text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "config" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "companyId" text;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "autoPublish" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lastRunAt" timestamp;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lastRunStatus" text;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lastError" text;
--> statement-breakpoint
ALTER TABLE "job_sources" ADD CONSTRAINT "job_sources_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "lifecycle" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "firstSeenAt" timestamp;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "lastSeenAt" timestamp;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "remoteEligibility" text DEFAULT 'unknown' NOT NULL;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "eligibleCountries" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "rawMetadata" jsonb;
--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_source_external_unique" ON "jobs" ("sourceId", "externalId") WHERE "sourceId" IS NOT NULL AND "externalId" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "jobs_lifecycle_idx" ON "jobs" ("lifecycle");
--> statement-breakpoint
CREATE INDEX "jobs_lastSeenAt_idx" ON "jobs" ("lastSeenAt");
--> statement-breakpoint
CREATE TABLE "job_ingestion_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceId" text NOT NULL,
	"triggeredBy" text,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"finishedAt" timestamp,
	"status" text DEFAULT 'running' NOT NULL,
	"fetched" integer DEFAULT 0 NOT NULL,
	"created" integer DEFAULT 0 NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"unchanged" integer DEFAULT 0 NOT NULL,
	"irrelevant" integer DEFAULT 0 NOT NULL,
	"duplicates" integer DEFAULT 0 NOT NULL,
	"expired" integer DEFAULT 0 NOT NULL,
	"error" text,
	"log" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_ingestion_runs" ADD CONSTRAINT "job_ingestion_runs_sourceId_job_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."job_sources"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "job_ingestion_runs_sourceId_idx" ON "job_ingestion_runs" ("sourceId");
--> statement-breakpoint
CREATE TABLE "job_duplicates" (
	"id" text PRIMARY KEY NOT NULL,
	"jobId" text NOT NULL,
	"sourceId" text,
	"externalId" text,
	"title" text NOT NULL,
	"applyUrl" text NOT NULL,
	"fingerprint" text NOT NULL,
	"seenAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_duplicates" ADD CONSTRAINT "job_duplicates_jobId_jobs_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "job_duplicates" ADD CONSTRAINT "job_duplicates_sourceId_job_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."job_sources"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"userId" text NOT NULL,
	"key" text NOT NULL,
	"day" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usage_counters_userId_key_day_pk" PRIMARY KEY("userId","key","day")
);
--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
