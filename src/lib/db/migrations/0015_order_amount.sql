ALTER TABLE "subscriptions" ADD COLUMN "amountPaise" integer;--> statement-breakpoint
UPDATE "subscriptions" SET "amountPaise" = CASE "planId" WHEN 'quarter' THEN 19900 WHEN 'half' THEN 42400 WHEN 'year' THEN 79900 ELSE NULL END WHERE "amountPaise" IS NULL;
