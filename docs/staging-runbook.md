# Staging rehearsal runbook

How the production build, the migration approval workflow and the full browser suite are exercised against a **staging copy** before anything touches production. Everything below was run on 2026-09-25 on the local machine; the same steps apply to a hosted staging environment (Vercel preview + a staging database).

## 1. Staging database

- Create an empty database (locally: `node scratch/create-staging-db.mjs` creates `jobappy_staging` on the local PostgreSQL). On a hosted provider, create a separate database or a fork/branch of production.
- Bring it to the **hosted state** (migrations `0000`–`0004`, which is exactly what production has today): `node scratch/prepare-staging-schema.mjs` (drops and recreates `public`, applies the first five files). For a hosted staging copy, restore the latest production backup instead; never point staging at the production connection string.

## 2. Migration approval workflow (rehearsed)

```bash
# 1. read-only preflight: ledger vs journal, pending files, destructive scan (exit 2 = blocked)
DATABASE_URL="<staging url>" npm run db:preflight:production
# 2. an unapproved run refuses before opening a connection (exit 3)
DATABASE_URL="<staging url>" npm run db:migrate:production -- --approve=HOST:PORT/DB
# 3. approved run: the approval is given twice and must name the exact target
DATABASE_URL="<staging url>" MIGRATE_PRODUCTION_APPROVED=HOST:PORT/DB npm run db:migrate:production -- --approve=HOST:PORT/DB
# 4. preflight again: "database is up to date"
```

Result on the local staging copy: preflight listed 8 pending additive files (0005–0012), the unapproved run refused (exit 3), the approved run applied 8 files (ledger 5 → 13), the second preflight reported up to date. `vercel-build` no longer migrates; deploying code cannot change the schema.

A loopback staging copy without TLS needs `?sslmode=disable` on the URL; hosted targets always use TLS (`DATABASE_SSL_CA` for private CAs).

## 3. Production build and server

```bash
npm run build            # exit 0 required
PORT=3100 DATABASE_URL="<staging url>" NEXTAUTH_URL=http://localhost:3100 AUTH_URL=http://localhost:3100 AUTH_TRUST_HOST=true APP_STAGE=staging AI_FIXTURE=1 npm run start -- -p 3100
```

- `DATABASE_URL` **must** be set in the process environment: `.env.local` in this checkout points at the hosted database and `next start` would otherwise load it. Process variables win over `.env*` files.
- `APP_STAGE=staging` re-enables the development fixtures (ingestion fixture provider, billing fixture provider, AI fixture) on a production build so the full suite can run; `/admin/launch` shows the stage as Degraded while it is set. Never set it on production.
- `next.config.ts` has `output: 'standalone'`; `next start` prints a warning and still serves. Vercel does not use `next start`; for self-hosting run `node .next/standalone/server.js`.
- Smoke: `/`, `/app`, `/pricing`, `/api/platform/config`, `/api/billing/plans`, `/api/jobs` → 200; `/admin` → 404 for anonymous; `/api/cron/*` → 404 without `CRON_SECRET`.

## 4. Browser suite against staging

```bash
BASE_URL=http://localhost:3100 E2E_DATABASE_URL="<staging url>" E2E_SHOTS_DIR=scratch/staging node scripts/e2e-jobs.mjs
# without staging fixtures (real production configuration): E2E_SKIP=billing,ai skips the fixture-only blocks
```

The suite refuses non-local database hosts; for a hosted staging database run it from a machine that can reach it and extend the allow-list deliberately.

## 5. After the rehearsal

- Confirm production is untouched: read-only inspection (`scratch/hosted-readonly-check.mjs`: ledger rows, users, Career OS tables absent).
- Record results in `HANDOFF.md` and `docs/launch-readiness.md`.
