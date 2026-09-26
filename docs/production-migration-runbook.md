# Production migration runbook (Career OS 0005–0012)

Status: **review document only. Nothing in this runbook has been executed against the hosted database.** The hosted Tiger Cloud database was inspected read-only on 2026-09-25 (a `BEGIN READ ONLY … ROLLBACK` session; no writes) so the facts below are real, but every step in section 5 requires explicit approval before it is run.

## 1. Where things stand

| | Hosted (Tiger Cloud, `…tsdb.cloud.timescale.com`, database `tsdb`) | Local development (`127.0.0.1:55432/jobappy_dev`) |
|---|---|---|
| Migration ledger (`drizzle.__drizzle_migrations`) | 5 rows: `0000`–`0004` (timestamps 1789988408680 … 1790300000001) | 13 rows: `0000`–`0012` |
| Career OS tables | none | all 22 (below) |
| Rows that matter | users 7, subscriptions 2, career_state 1 | synthetic e2e data only |
| Extensions / extra views | `pg_stat_statements`, `pg_buffercache` present (Tiger Cloud defaults; untouched) | plain PostgreSQL 17 |

The hosted schema is exactly what migrations `0000`–`0004` produce, so the pending set is `0005`–`0012` in that order. The Drizzle migrator applies each file inside a transaction and inserts a ledger row on success; the journal is `src/lib/db/migrations/meta/_journal.json`.

## 2. What the pending migrations do

All eight migrations are **additive**: new tables, new nullable-or-defaulted columns, indexes, foreign keys and unique constraints. There is no `DROP`, `TRUNCATE`, `DELETE`, `RENAME` or type change in `0005`–`0012`; the migration test (`npm run test:migrations:dev`) asserts this with a regex over every Career OS migration file. (`0001_career_state.sql`, already applied on hosted, contains a constraint rename; it is not part of this run.)

| Migration | Journal ts | Creates | Alters | Indexes | FKs |
|---|---|---|---|---|---|
| `0005_career_os_phase1.sql` | 1790300000002 | `user_roles`, `admin_audit_log`, `companies`, `job_sources`, `jobs`, `learner_job_preferences`, `platform_settings` | — | 6 | 6 |
| `0006_career_os_phase2.sql` | 1790300000003 | `job_ingestion_runs`, `job_duplicates`, `usage_counters` | `job_sources` +7 columns, `jobs` +6 columns (all with defaults or nullable) | 3 | 5 |
| `0007_career_os_phase3.sql` | 1790300000004 | `resumes`, `resume_profiles`, `resume_analyses` | `job_sources` +4 (scheduling and lock columns), `job_ingestion_runs` +3 | 2 | 5 |
| `0008_career_os_phase4.sql` | 1790300000005 | `outreach_contacts`, `job_preparations` | — | 1 | 4 |
| `0009_career_os_phase5.sql` | 1790300000006 | `billing_plans`, `billing_subscriptions`, `billing_events`, `notification_log` | — | 2 | 3 |
| `0010_career_os_phase6.sql` | 1790300000007 | `job_interview_sessions` | — | 2 | 2 (`userId` cascade, `jobId` set null) |
| `0011_career_os_phase65.sql` | 1790300000008 | `ai_usage_log` | — | 2 | 1 (`userId` set null) |
| `0012_career_os_catalog.sql` | 1790300000009 | — | `companies` +4 columns, `job_sources` +5 columns (all nullable or defaulted) | 1 | 0 |

Notes for the reviewer:

- Every `ADD COLUMN … NOT NULL` carries a `DEFAULT`, so it succeeds on populated tables without a rewrite of user data (`job_sources` and `jobs` are empty on hosted anyway).
- Foreign keys reference `users(id)` with `ON DELETE CASCADE` for learner-owned rows (preferences, resumes, analyses, outreach, preparations, subscriptions, roles) and `SET NULL` for audit / notification rows, so deleting an account never fails on a dangling reference. `billing_subscriptions.planId → billing_plans.id` is `RESTRICT`: plans are deactivated, never deleted.
- Unique constraints that matter for idempotency: `billing_events (provider, eventId)`, `billing_subscriptions (provider, providerSubscriptionId)`, `usage_counters (userId, key, day)`, `job_preparations (userId, jobId)`, `jobs (sourceId, externalId)`.
- `resumes.content` is `bytea` (resume files in the database). See `docs/launch-readiness.md` for the object-storage recommendation; no migration is needed to switch later because the storage abstraction keeps the same table for metadata.
- No backfill is required. `billing_plans` is seeded lazily by the application (`ensurePlansSeeded`) with the FREE/PRO development fixtures the first time a plan is read; review the prices in `/admin/plans` before opening `/pricing` to the public. Existing paid passes in `subscriptions` keep working unchanged (they map to the highlighted plan through `legacyPaidPlan`).
- Index creation is not `CONCURRENTLY`; all indexed tables are empty at creation time so this holds no locks worth mentioning. The only pre-existing tables touched are none (0005–0009 never alter a `0000`–`0004` table).

## 3. Preconditions (must all be true before section 5)

1. A reviewer has read the five SQL files and this document and recorded approval (who, when) in the deployment ticket.
2. A fresh backup / point-in-time recovery mark exists for `tsdb` (Tiger Cloud console → service → Backups; note the timestamp). Also take a logical dump of the small tables you care about most: `pg_dump --schema-only` plus `pg_dump -t users -t subscriptions -t career_state --data-only`.
3. The application build that contains the migrations is the one that will be deployed (`git rev-parse HEAD` recorded), and the Vercel build command still runs migrations (`vercel-build` in `package.json`) **or** you have decided to run them by hand first (recommended, see step 5.2).
4. Environment variables for the new code are set in the production project: at minimum `AUTH_SECRET`, `DATABASE_URL`, `PLATFORM_ADMINS`; optional but reviewed: `CRON_SECRET`, `RAZORPAY_*`, `RESUME_STORE`, `BILLING_FIXTURE_SECRET` (leave unset in production; the fixture provider is disabled there regardless).
5. A maintenance window is not strictly needed (additive, empty tables) but the migration should not run concurrently with another deploy.

## 4. Dry run (safe, recommended)

Restore the latest backup or `pg_dump` into a scratch database and run the migrator against it with the gated runner:

```bash
DATABASE_URL=postgres://…/scratch node scripts/migrate-production.mjs   # scratch copy of the backup, never the live URL
npm run test:migrations:dev   # fresh + upgrade in-memory tests (10-row ledger expected)
```

Expected result: ledger grows from 5 to 11 rows; `\dt` lists the 21 Career OS tables; `SELECT count(*) FROM users` is unchanged.

## 5. Execution plan (requires approval; not run)

1. **Announce** the start in the deployment ticket; note the backup timestamp from 3.2.
2. **Apply migrations through the approval workflow, before deploying code** so the app never runs against a half-migrated schema. Deploys never migrate automatically any more (`vercel-build` is `next build`). The runner is `scripts/migrate-production.mjs`; it reads `POSTGRES_URL_NON_POOLING`, `DATABASE_URL_NON_POOLING` or `DATABASE_URL` and uses SSL (`DATABASE_SSL_CA` optional):
   ```bash
   # read-only: ledger vs journal, pending files, destructive scan; exit 2 when blocked
   npm run db:preflight:production
   # approval must be given twice and name the exact target (HOST:PORT/DATABASE); anything else refuses before connecting
   MIGRATE_PRODUCTION_APPROVED=HOST:PORT/DATABASE npm run db:migrate:production -- --approve=HOST:PORT/DATABASE
   ```
   The runner repeats the preflight, refuses when the database is ahead of the checkout, when ledger hashes differ, when pending files are out of order, or when a pending file contains a destructive statement (`--allow-destructive` after review). Rehearsed on 2026-09-25 against a local staging copy reset to the hosted state (ledger 5 → 13, see HANDOFF.md).
3. **Verify** in a read-only session:
   ```sql
   SELECT id, created_at FROM drizzle.__drizzle_migrations ORDER BY id;   -- 13 rows
   SELECT count(*) FROM billing_plans;                                     -- 0 until the app seeds, or 2 after first read
   SELECT count(*) FROM users;                                             -- unchanged (7 at inspection time)
   ```
4. **Deploy** the application build. On first request to `/pricing` or `/api/platform/config` the FREE/PRO fixtures are seeded; open `/admin/plans` and set real prices, descriptions and Razorpay plan ids (or leave PRO inactive until pricing is final).
5. **Smoke test**: sign in as an existing paid-pass user and confirm `/api/billing/subscription` reports `planSource: "legacy_pass"`; open `/admin/launch`.

## 6. Rollback

- The migrations create only new objects, so rollback is dropping them in reverse order and deleting the five ledger rows. A reverse script is deliberately **not** shipped as an automatic step; if needed it is:
  ```sql
  BEGIN;
  DROP TABLE IF EXISTS ai_usage_log, job_interview_sessions, notification_log, billing_events, billing_subscriptions, billing_plans,
    job_preparations, outreach_contacts, resume_analyses, resume_profiles, resumes,
    usage_counters, job_duplicates, job_ingestion_runs, learner_job_preferences, jobs,
    job_sources, companies, platform_settings, admin_audit_log, user_roles CASCADE;
  DELETE FROM drizzle.__drizzle_migrations WHERE created_at >= 1790300000002;   -- removes the six Career OS rows
  COMMIT;
  ```
  (`job_sources`/`jobs` column additions from 0006/0007 disappear with the tables.) This loses any Career OS data created after the migration, which is acceptable only immediately after a failed deploy.
- If the migrator fails part-way, Drizzle rolls back the failing file's transaction; earlier files stay applied. Fix the cause, re-run; the ledger prevents re-applying finished files.
- Application rollback: redeploy the previous build. The old code ignores the new tables entirely.

## 7. Things this runbook does not cover

- Timescale-specific features (none are used; all tables are plain PostgreSQL).
- Changing the hosted `subscriptions` (legacy passes) table: untouched by design.
- Data migration of legacy passes into `billing_subscriptions`: not needed, resolution honours both.
