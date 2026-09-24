# Isolated development database setup

## Current local Docker setup (verified 2026-09-25 IST)

Docker Engine 29.7.2 and Compose v5.5.1 are running inside WSL Ubuntu-24.04. There is no Windows Docker executable. `compose.dev.yaml` now runs PostgreSQL 17 in `jobappy-dev-postgres-1`, bound only to `127.0.0.1:55432`, with database `jobappy_dev` and persistent volume `jobappy-dev_postgres_data`. Port 55432 was free in both Windows and WSL before setup. No existing project Docker configuration was found.

Generated development-only credentials are in ignored `.env.docker.local`; the matching `DATABASE_URL` is in ignored `.env.development.local`. Neither file is tracked. The hosted configuration in `.env.local` was left unchanged; no connection to that hosted database was made during setup.

Before migration, a real connection verified database `jobappy_dev`, role `jobappy_dev_user`, schema `public`, and zero public tables. The target confirmation matched `127.0.0.1:55432/jobappy_dev`. Actual migration command and output:

```text
npm.cmd run db:migrate -- --confirm-development=127.0.0.1:55432/jobappy_dev
Starting confirmed development migration: 127.0.0.1:55432/jobappy_dev
Development migration complete. No curriculum data was seeded.
```

Exit 0. A subsequent query verified five migration ledger entries (0000 through corrected 0004) and zero published curriculum rows. The local Next.js app was restarted with the confirmed local connection explicitly inherited by its process, on port 3000. Actual HTTP verification at 2026-09-24 18:35:43 GMT:

```text
curl.exe -i --max-time 45 http://localhost:3000/api/curriculum
HTTP/1.1 200 OK
content-type: application/json

[]
```

The initial request immediately after process launch failed to connect before Next.js was ready; the request above succeeded after readiness. This verifies the empty database query, not published content availability. No data was seeded. Typecheck, all five migration safety/in-memory migration tests, and all three static curriculum assertions passed again during Docker setup.

Start the existing database from PowerShell:

```powershell
wsl.exe -d Ubuntu-24.04 -- docker compose -f /mnt/d/job-appy/compose.dev.yaml up -d --wait
```

The app is currently running at http://127.0.0.1:3000. Its background launcher PID is recorded in `scratch/local-dev.pid`, and output is in `scratch/local-dev.stdout.log` and `scratch/local-dev.stderr.log`. To restart it, stop that verified JobAppy process and its child process, then run `npm.cmd run dev` in this repository with no inherited DATABASE_URL override. Do not start a second server on port 3000 while this one is running.

Stop the database while preserving its volume:

```powershell
wsl.exe -d Ubuntu-24.04 -- docker compose -f /mnt/d/job-appy/compose.dev.yaml stop
```

Do not delete the volume or rotate the generated password file independently of the existing database. Compose's resolved configuration can contain secrets; do not print `docker compose config` or unfiltered container environment inspection into logs.

## Manual setup reference for a different isolated database

1. Create an empty PostgreSQL database on a separate development server/service (a local PostgreSQL instance is also suitable). Name it `jobappy_dev`. Use a dedicated development role that owns this database and can create its tables and the `drizzle` schema. Do not reuse production credentials or the currently configured hosted server. Do not copy production data.
2. In the repository root, create the ignored file `.env.development.local`. Set the existing variable `DATABASE_URL` to the new development connection URL. Obtain the URL privately from your database setup; do not paste it into chat, documentation, terminal output, or Git. For hosted development databases, retain the provider's required TLS settings (`sslmode=require` or a verification mode supported by your provider). For local PostgreSQL without TLS, omit `sslmode`. The migration runner no longer forces TLS with certificate verification disabled.

   ```dotenv
   DATABASE_URL=<the separate development PostgreSQL connection URL>
   ```

3. In the PowerShell terminal you will use for both migration and `npm.cmd run dev`, clear any inherited database override so it cannot silently win over this file:

   ```powershell
   Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
   ```

   Both the development migration runner and `next dev` prefer existing shell variables, then `.env.development.local`, `.env.local`, `.env.development`, and `.env`. Leave the current hosted URL in `.env.local` untouched. The new file overrides only the development database connection. Do not use `NODE_ENV=production`; the runner rejects it, and setting `NODE_ENV=development` alone never authorizes migrations.
4. Confirm the new service is development-only and identify its non-secret **host, port, database name**. Tell the agent those values and that `.env.development.local` is configured. Do not send the URL, username, or password. Before execution, the agent can verify the target matches the confirmation and inspect the new database read-only.
5. Only after those steps, use the exact target confirmation. Example for a local database on the default port:

   ```powershell
   npm.cmd run db:migrate -- --confirm-development=127.0.0.1:5432/jobappy_dev
   ```

   Replace the target with the actual host, port (5432 if omitted in the URL), and database name. `localhost` and `127.0.0.1` must match how the URL is written; this is an exact target confirmation. A changed target needs a new matching argument. This document's command has **not** been run against a persistent database.
6. Stop and restart the local Next.js server in the same configured terminal using `npm.cmd run dev`. Then verify the actual endpoint:

   ```powershell
   curl.exe -i --max-time 45 http://localhost:3000/api/curriculum
   ```

   A fresh migrated database contains no curriculum rows. Expected response before separate data publication is HTTP 200 with `[]`; this proves only that the query executes, **not** that published curriculum is available. No seed or publication is included in this task.

## Migration correction and history

- `0000` through `0003` are unchanged.
- `0004_curriculum_tracks.sql` now only creates `curriculum_tracks` and its nullable owner foreign key (`ON DELETE SET NULL`), matching the current Drizzle schema.
- Removed duplicate creations of `subscriptions`, `user_ai_keys`, and `verification_tokens`, their duplicate foreign keys, and the duplicate `users.createdAt` addition. Migrations `0002` and `0003` already own these changes. The old `0004` would conflict on a fresh database after those earlier migrations.
- The old `0004` journal timestamp, `1790146725709`, was earlier than `0002` (`1790200000000`) and `0003` (`1790300000000`). Drizzle uses timestamps, not just filename order, to determine pending migrations. The previous investigation found the hosted ledger already at `1790300000000`, so it would skip the old `0004`.
- The corrected `0004` timestamp is `1790300000001`, immediately after `0003`. The previous investigation found no applied `0004` entry in the hosted ledger. No hosted ledger was changed. This correction is prepared for a fresh isolated development database; do not reuse it to rewrite history in another environment where the old `0004` may have been applied.
- Metadata snapshots exist for `0000`, `0001`, and `0004`; there are no `0002`/`0003` snapshots. The SQL and journal drive execution. No snapshot or migration history was regenerated in this task.

## Safety boundary

`scripts/migrate.mjs` validates the target **before constructing a database pool**. It requires a PostgreSQL URL with an explicit host/user/database and exactly one matching `--confirm-development=HOST:PORT/DATABASE` argument. It rejects production mode, unknown arguments (including the previously misleading `--dry-run`), query parameters other than `sslmode`, and the protected currently configured hosted server, even with confirmation.

`scripts/migrate-career-state.mjs` uses the same gate. No new application database variable was introduced; the connection remains `DATABASE_URL`. Confirmation is an explicit command argument rather than a persistent opt-in flag that could accidentally authorize a different target.

The gate cannot prove that an arbitrary new server is development; the operator must establish that fact. Dedicated development credentials and a separate service provide isolation. Direct `drizzle-kit push/migrate`, manual SQL, and other database-writing scripts are not protected by this gate; do not use them for setup. `drizzle.config.ts` still loads `.env.local`, so invoking it directly may target the hosted database.

The existing `vercel-build` command calls `scripts/migrate.mjs` without confirmation and will now fail closed. Do not add a development confirmation to production settings. A production migration workflow requires a separate task; no deployment was attempted here.

## Earlier preparation verification (before Docker setup)

```text
node --test scripts/test-development-migrations.mjs
tests 5
pass 5
fail 0
```

Checks cover missing/mismatched confirmation, protected-host rejection, production-mode rejection, unsafe URL parameters, CLI refusal before connecting without leaking a test password, ordered timestamps, all five migrations on a fresh in-memory database, no-op rerun, expected curriculum columns and foreign key, and migration from `0003` while preserving an existing test user.

The PGlite tests execute the real migration SQL and Drizzle ledger logic in disposable in-memory PostgreSQL. PGlite's prepared-query protocol cannot accept `0001`'s combined CREATE/DO statement, so the test adapter splits that boundary in memory without changing the SQL file or its hash. The first test run failed at this adapter limitation; after adding the split, all five tests passed. This is **not** a live node-postgres connection test.

```text
npm.cmd run typecheck
> tsc --noEmit
```

Exit 0, no diagnostics.

The actual runner was also invoked with the current configuration; it refused before opening a connection:

```text
node scripts/migrate.mjs
Migration failed: Refusing migrations against the protected hosted tsdb server.
```

Exit 1, as intended. No hosted migration was executed.

The earlier preparation did not test a persistent database or HTTP endpoint. Those checks are now recorded in the current Docker setup section above. Retrieval of nonempty published curriculum: **NOT TESTED** (no published rows exist). Browser journeys: **NOT TESTED**. Deployment: **NOT PERFORMED**.
