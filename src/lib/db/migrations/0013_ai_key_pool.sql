ALTER TABLE "user_ai_keys" DROP CONSTRAINT "user_ai_keys_pkey";--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "user_ai_keys" SET "id" = md5("userId" || ':' || "provider" || ':' || "keyHint" || ':' || "createdAt"::text) WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD CONSTRAINT "user_ai_keys_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "cooldownUntil" timestamp;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "lastUsedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_ai_keys" ADD COLUMN "lastError" text;--> statement-breakpoint
CREATE INDEX "user_ai_keys_user_idx" ON "user_ai_keys" ("userId");
