ALTER TABLE "referrer_profiles" ADD COLUMN "contactEmail" text;
--> statement-breakpoint
ALTER TABLE "referrer_profiles" ADD COLUMN "contactEmailVerifiedAt" timestamp;
--> statement-breakpoint
-- Keep historical employment evidence and approvals intact. Account email is
-- already the destination used for legacy referral notifications. Do not infer
-- personal mailbox verification from corporate evidence or development auth.
UPDATE "referrer_profiles" AS r SET "contactEmail" = lower(trim(u.email))
FROM "users" AS u WHERE r."userId" = u.id AND r."deletedAt" IS NULL;
