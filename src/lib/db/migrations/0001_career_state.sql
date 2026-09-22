CREATE TABLE IF NOT EXISTS "career_state" (
  "userId" text PRIMARY KEY CONSTRAINT "career_state_userId_users_id_fk" REFERENCES "users"("id") ON DELETE CASCADE,
  "payload" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1,
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'career_state'::regclass AND conname = 'career_state_userId_fkey') THEN
    ALTER TABLE career_state RENAME CONSTRAINT "career_state_userId_fkey" TO "career_state_userId_users_id_fk";
  END IF;
END $$;
