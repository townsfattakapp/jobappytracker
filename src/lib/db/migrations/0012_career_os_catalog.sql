ALTER TABLE "companies" ADD COLUMN "catalogSlug" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "indiaRelevance" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "roleFamilies" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "provenance" text;--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "catalogPortal" text;--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "verificationStatus" text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "verifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "verificationNote" text;--> statement-breakpoint
ALTER TABLE "job_sources" ADD COLUMN "lastVerifiedJobCount" integer;--> statement-breakpoint
CREATE INDEX "companies_catalog_slug_idx" ON "companies" ("catalogSlug");
