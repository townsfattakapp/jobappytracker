CREATE TABLE "user_roles" (
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"grantedBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_userId_role_pk" PRIMARY KEY("userId","role")
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actorId" text,
	"action" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text,
	"before" jsonb,
	"after" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website" text,
	"careersUrl" text,
	"logoUrl" text,
	"headquarters" text,
	"industry" text,
	"size" text,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "job_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"baseUrl" text,
	"termsUrl" text,
	"ingestionAllowed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"status" text DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text NOT NULL,
	"sourceId" text,
	"title" text NOT NULL,
	"normalizedTitle" text NOT NULL,
	"roleCategory" text NOT NULL,
	"careerPathIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trackIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text NOT NULL,
	"requirementsSummary" text,
	"requiredSkills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferredSkills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"experienceMin" integer,
	"experienceMax" integer,
	"level" text NOT NULL,
	"employmentType" text NOT NULL,
	"workMode" text NOT NULL,
	"locationCity" text,
	"locationCountry" text,
	"region" text NOT NULL,
	"salaryMin" integer,
	"salaryMax" integer,
	"salaryCurrency" text,
	"salaryPeriod" text,
	"applyUrl" text NOT NULL,
	"sourceUrl" text,
	"externalId" text,
	"fingerprint" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"postedAt" timestamp,
	"expiresAt" timestamp,
	"lastVerifiedAt" timestamp,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_fingerprint_unique" UNIQUE("fingerprint")
);
--> statement-breakpoint
CREATE TABLE "learner_job_preferences" (
	"userId" text PRIMARY KEY NOT NULL,
	"roleCategories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"experienceYears" integer,
	"locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regionPreference" text DEFAULT 'any' NOT NULL,
	"workModes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"employmentTypes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"salaryMin" integer,
	"salaryCurrency" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updatedBy" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actorId_users_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_sourceId_job_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."job_sources"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "learner_job_preferences" ADD CONSTRAINT "learner_job_preferences_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" ("status");
--> statement-breakpoint
CREATE INDEX "jobs_companyId_idx" ON "jobs" ("companyId");
--> statement-breakpoint
CREATE INDEX "jobs_roleCategory_idx" ON "jobs" ("roleCategory");
--> statement-breakpoint
CREATE INDEX "jobs_region_idx" ON "jobs" ("region");
--> statement-breakpoint
CREATE INDEX "jobs_postedAt_idx" ON "jobs" ("postedAt");
--> statement-breakpoint
CREATE INDEX "admin_audit_log_createdAt_idx" ON "admin_audit_log" ("createdAt");
