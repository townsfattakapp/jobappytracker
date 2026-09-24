# Local curriculum API investigation — 2026-09-24

## Current local Docker verification — 2026-09-25 IST

Supersedes the historical blocked status below for local development only.

- Docker Engine 29.7.2 and Compose v5.5.1 are available inside WSL Ubuntu-24.04. No Windows Docker executable was found.
- Added `compose.dev.yaml`: healthy PostgreSQL 17 container `jobappy-dev-postgres-1`, database `jobappy_dev`, loopback port `55432`, mounted persistent volume `jobappy-dev_postgres_data`.
- Generated matching development-only credentials in ignored `.env.docker.local` and `.env.development.local`. Credentials were not printed or tracked. Existing hosted configuration was unchanged; no hosted database connection was made in this task.
- Before migration, a real SQL connection confirmed the exact guarded target `127.0.0.1:55432/jobappy_dev`, database `jobappy_dev`, development role, schema `public`, and zero public tables.

```text
npm.cmd run db:migrate -- --confirm-development=127.0.0.1:55432/jobappy_dev
Starting confirmed development migration: 127.0.0.1:55432/jobappy_dev
Development migration complete. No curriculum data was seeded.
```

Exit 0. Subsequent SQL checks found five migration ledger entries (last timestamp `1790300000001`) and zero published curriculum rows.

Restarted Next.js with the explicitly confirmed local database environment. App is running on port 3000; launcher PID is in `scratch/local-dev.pid`, with logs in `scratch/local-dev.stdout.log` and `scratch/local-dev.stderr.log`. Actual request after readiness:

```text
curl.exe -i --max-time 45 http://localhost:3000/api/curriculum
HTTP/1.1 200 OK
content-type: application/json
Date: Thu, 24 Sep 2026 18:35:43 GMT

[]
```

The initial request during startup failed to connect; the repeated request above passed after readiness. The local missing-table error is resolved. The result is an empty JSON array, not evidence of published content. No data was seeded.

Checks executed again in this task:

```text
node --test scripts/test-development-migrations.mjs
tests 5 / pass 5 / fail 0

npm.cmd run test:curriculum
PASS: Should load curriculums
PASS: Core tracks should be present
PASS: Library tracks should be parsed correctly
All tests passed.

npm.cmd run typecheck
> tsc --noEmit
```

All exited 0; typecheck had no diagnostics. Browser journeys and retrieval of nonempty published curriculum: NOT TESTED. No deployment.

Files changed in this Docker task: `compose.dev.yaml`, the two ignored environment files, `docs/development-database.md`, and this evidence record. No application code or migration SQL changed in this task. Restart instructions are in `docs/development-database.md`.

## Historical status before isolated local setup: BLOCKED, NOT FIXED

Current task only: fix local GET /api/curriculum. Earlier completion, migration-applied, HTTP 200, UI, and production-readiness claims in this file are superseded by the evidence below.

## Verified root cause

The running Next.js server queries a missing PostgreSQL relation. Its own server log, `.next/dev/logs/next-development.log`, captured:

```text
01:04:18.773 Server ERROR
Error fetching public curriculum: Error: Failed query: select "id", "ownerId", "status", "version", "title", "family", "data", "createdAt", "updatedAt", "publishedAt", "reviewNote" from "curriculum_tracks" where "curriculum_tracks"."status" = $1
params: published
Curriculum database error: {"message":"relation \"curriculum_tracks\" does not exist","code":"42P01"}
```

Temporary read-only diagnostics executed through the running route also logged:

```json
{"host":"e60ic1228f.j9g1t394ei.tsdb.cloud.timescale.com","port":"37114","rows":[{"database":"tsdb","schema":"public","search_path":"\"$user\", public","curriculum_table":null}]}
```

This matches the target in `.env.local`. `src/lib/db/index.ts` constructs a node-postgres Pool using DATABASE_URL. `src/lib/db/schema.ts` declares the unqualified curriculum_tracks table. The active database does not have that table; this is not a JSON response-format issue.

Read-only inspection with node-postgres, loading development environment files via `nextEnv.loadEnvConfig(process.cwd(), true)`, used `BEGIN READ ONLY` and `ROLLBACK`. Actual query results:

```sql
select current_database() as database, current_schema() as schema,
       current_setting('search_path') as search_path,
       inet_server_addr() as server_address, inet_server_port() as server_port;
-- [{"database":"tsdb","schema":"public","search_path":"\"$user\", public","server_address":"100.98.196.187","server_port":5432}]

select table_schema,table_name from information_schema.tables where table_name = 'curriculum_tracks';
-- []
select to_regclass('curriculum_tracks') as resolved_table;
-- [{"resolved_table":null}]
select column_name,data_type from information_schema.columns where table_name = 'curriculum_tracks' order by ordinal_position;
-- []
select schemaname,tablename from pg_catalog.pg_tables where tablename in ('curriculum_tracks','__drizzle_migrations','subscriptions','user_ai_keys','verification_tokens');
-- [{"schemaname":"drizzle","tablename":"__drizzle_migrations"},{"schemaname":"public","tablename":"subscriptions"},{"schemaname":"public","tablename":"user_ai_keys"},{"schemaname":"public","tablename":"verification_tokens"}]
select id,created_at from drizzle.__drizzle_migrations order by created_at;
-- [{"id":1,"created_at":"1789988408680"},{"id":2,"created_at":"1790080000000"},{"id":3,"created_at":"1790200000000"},{"id":4,"created_at":"1790300000000"}]
```

Migration 0004 is absent from that ledger. Its journal timestamp is 1790146725709, older than the latest applied timestamp 1790300000000. The installed Drizzle migrator applies only migrations newer than the latest ledger timestamp, so it would skip 0004. Additionally, 0004 contains unconditional creation of subscriptions, user_ai_keys, and verification_tokens, which already exist, plus an unrelated users column addition. Blindly rerunning it or only changing its timestamp is unsafe. No migration was run or modified.

## Blocker

The user does not know whether this is the development database and states that production uses Tiger Cloud. The configured hosted database may be production. Its identity as an intended development database is NOT VERIFIED. No schema or data writes were made. A confirmed separate development database is needed before applying a targeted schema correction. Do not use a successful empty-array fallback to conceal the missing table.

## Files changed in this task

- src/app/api/curriculum/route.ts: added development-only logging of the underlying database error message and code. Response behavior is unchanged. Temporary target/schema diagnostic query was removed after capturing evidence.
- HANDOFF.md: replaced unsupported completion claims with verified findings and this blocker.

No database configuration, migration, schema definition, UI, or career-path code was changed. No deployment.

## Commands executed and observed outputs

```text
curl.exe -i --max-time 45 http://localhost:3000/api/curriculum
HTTP/1.1 500 Internal Server Error
content-type: application/json
{"error":"Internal server error"}
```

The initial reproduction and repeated requests returned the same status and body. Final request: 2026-09-24 18:23:55 GMT. curl exited 0 (transport completed, not endpoint success). Response shape is an object with an error string, not a curriculum array. Published data availability: NOT VERIFIED.

```text
Get-Content .next/dev/logs/next-development.log -Tail 4
```

Output included the server-side error and runtime database diagnostic quoted above. This is the Next.js development server's persisted log; direct access to the existing VS Code terminal scrollback was not available.

```text
npm.cmd run test:curriculum
> node scripts/test-curriculum-engine.mjs
Running curriculum engine unit tests...
✅ PASS: Should load curriculums
✅ PASS: Core tracks should be present
✅ PASS: Library tracks should be parsed correctly
All tests passed.
```

Exit 0. These assertions test the static curriculum library, not database availability.

```text
npm.cmd run typecheck
> tsc --noEmit
```

Exit 0, no diagnostics. Repeated after removing temporary database-target diagnostics.

```text
npm.cmd exec -- eslint src/app/api/curriculum/route.ts
```

Exit 0, no output.

The initial inline database-inspection command failed before connecting because @next/env is CommonJS and its named import was unavailable. Retrying with its default import succeeded; all database queries above were read-only. No echo statements were used as evidence.

## Not tested in this task

- Post-fix HTTP success: NOT TESTED; no database fix applied, endpoint still fails.
- Published curriculum retrieval: NOT TESTED successfully; table is absent.
- Browser learning journey: NOT TESTED (outside scope).
- Production build/deployment: NOT TESTED / NOT PERFORMED.
