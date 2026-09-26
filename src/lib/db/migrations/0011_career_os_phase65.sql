CREATE TABLE "ai_usage_log" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"userId" text,
	"feature" text NOT NULL,
	"provider" text,
	"model" text,
	"status" text NOT NULL,
	"errorKind" text,
	"errorId" text,
	"sensitivity" text DEFAULT 'normal' NOT NULL,
	"promptChars" integer DEFAULT 0 NOT NULL,
	"promptTokens" integer,
	"completionTokens" integer,
	"latencyMs" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_log_user_created_idx" ON "ai_usage_log" ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_usage_log_provider_created_idx" ON "ai_usage_log" ("provider","createdAt");
