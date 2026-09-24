CREATE TABLE "curriculum_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text,
	"status" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"family" text NOT NULL,
	"data" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"publishedAt" timestamp,
	"reviewNote" text
);
--> statement-breakpoint
ALTER TABLE "curriculum_tracks" ADD CONSTRAINT "curriculum_tracks_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
