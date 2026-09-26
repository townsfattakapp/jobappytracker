# Launch readiness — Career OS (Phase 5 review, 2026-09-25)

Every line below is backed by something that was actually run or read on 2026-09-25 in the local development environment (Docker PostgreSQL 17 at `127.0.0.1:55432/jobappy_dev`, `next dev` on port 3000). Nothing was deployed. The hosted Tiger Cloud database was only inspected read-only. No real card was charged, no production email was sent, no cron was configured.

Status vocabulary: **READY** (verified by tests or a live check) · **BLOCKED** (cannot proceed without a decision or change) · **NOT CONFIGURED** (code path exists, production configuration missing) · **NOT TESTED** (could not be exercised here) · **REQUIRES MANUAL ACTION** (a person must do it, with the steps named).

## 1. Summary table

| Area | Status | Evidence / what is missing |
|---|---|---|
| Database schema (migrations 0005–0012) | REQUIRES MANUAL ACTION | Hosted ledger at 0004; runbook `docs/production-migration-runbook.md` written, reviewed migrations are additive (0010 interview sessions, 0011 AI usage log, 0012 catalog columns); execution needs approval. `npm run test:migrations:dev` 5/5 (fresh + upgrade, 13-row ledger). |
| Plan configuration | READY (development fixtures) | `billing_plans` seeded FREE / PRO (₹199 / ₹1 990 dev prices, not final); admin editor `/admin/plans` audited; e2e proves a plan edit changes the learner's gates live. Final prices, descriptions and Razorpay plan ids must be entered before launch (REQUIRES MANUAL ACTION). |
| Entitlement resolution | READY | Single resolver (`resolvePlanForUser`: allowlist → subscription → legacy pass → default). Unit + e2e: free 402s, paid 200s, plan edit follows, refresh persists. No plan-name checks remain in routes or UI (`tier === 'free'` removed). |
| Subscription lifecycle | READY (fixture) | Unit test covers pending → active → past_due (7-day grace) → renewal → cancel_at_period_end → expired; e2e drives checkout success/failure, cancel renewal, sweep. |
| Razorpay Subscriptions (live) | NOT TESTED | No Razorpay keys exist locally. Adapter signatures (checkout + webhook HMAC) and event normalisation are unit-tested against the documented format only. Test-mode verification steps in section 3. |
| Webhook security | READY | Signature verification, ledger-before-apply, `(provider, eventId)` unique → duplicates ignored; forged signature returns 400 in e2e; failed deliveries visible in `/admin/billing`. |
| Checkout authorisation | READY | Signed in only; default / zero-price plans refused; existing active plan refused; fixture token bound to user + subscription (cannot be reused across accounts); Razorpay verify checks ownership before applying. |
| Billing ownership | READY | Cross-account cancel returns 404 (fixed during e2e; was 400), history only lists the caller's rows. |
| Admin RBAC for billing | READY | `/admin/plans`, `/admin/subscriptions`, `/admin/billing`, `/admin/launch` → 404 for non-admins; APIs 403; denials logged (`security.forbidden`, `security.admin_page_denied`). Subscriptions view is read-only by design. |
| Usage dashboard | READY | `/api/billing/usage` meters (analyses, resume analyses, drafts, prep plans) with limit and reset; e2e sees `used 1 / limit 100` after one analysis. |
| Pricing page | READY | `/pricing` public, monthly/annual toggle, plan cards, current plan, upgrade, cancel entry point, test-mode notice; no fake claims. Copy is developer copy; review wording before launch. |
| Payments env | NOT CONFIGURED | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` absent locally; fixture provider is used and is disabled automatically when `NODE_ENV=production` (so production without keys shows plans with "Upgrade unavailable"). |
| Ingestion scheduling | NOT CONFIGURED | Code READY (locks, stale-lock recovery, retries with backoff, per-source isolation, 20 s provider timeout, health, last success, manual retry); `CRON_SECRET` unset → cron routes 404. Enabling steps in `docs/ingestion-operations.md`. |
| Email / notifications | NOT CONFIGURED | Notification foundation logs every attempt to `notification_log`; e2e confirms nothing is `sent` locally (no mailer). Production needs `RESEND_API_KEY` or `SMTP_URL` + `EMAIL_FROM`; templates reviewed for truthfulness (no urgency, no fake claims). |
| Resume file storage | READY (database) / NOT CONFIGURED (object) | Bytes stay in `resumes.content` (private, owner-scoped, cross-account 404). `ResumeStore` abstraction with `RESUME_STORE=object` stub that refuses to run unconfigured. Recommendation in section 4. |
| Structured logging | READY | JSON lines with redaction (secret/token/password/authorization/cookie/signature/content/text/draft/card); unhandled API errors get an error id returned to the user (`ref E-XXXXXXXX`); unit test checks redaction. |
| Privacy / account data deletion | READY | `DELETE /api/account/career-data` with `{confirm:"DELETE"}` removes resumes, analyses, outreach, preparations, job preferences, usage counters; Settings button; e2e verifies shared listings are untouched. Full account deletion cascades through FKs (documented in section 5). |
| Job-specific mock interviews (Phase 6) | READY (deterministic engine) | No AI provider needed; questions carry provenance; sessions owner-scoped; entitlements and limits admin-managed. Existing paid-plan rows predate the `interview.*` feature keys: tick them in `/admin/plans` before launch (REQUIRES MANUAL ACTION). AI enrichment is optional and labelled. |
| AI gateway (Phase 6.5) | NOT CONFIGURED | Gateway, policy, fallback, accounting and admin health are READY and tested with the fixture provider; no provider key exists here, so real Gemini/Groq/Mistral/OpenRouter/OpenAI calls are NOT TESTED. Every feature falls back to its deterministic engine. |
| Company source catalog | READY (19 feeds) / REQUIRES MANUAL ACTION | 60 companies seeded; 19 official feeds verified and ingested live locally (940 relevant published listings); 41 portals Not configured with careers links. Admin must seed the catalog on the deployed database and opt verified sources into the schedule. |
| Onboarding and Career Command Center (Phase 8) | READY | Twelve-step skippable onboarding creates a real goal/roadmap, saves job preferences and the resume; Command Center summarises real state with one server request; complete learner and free learner journeys pass end to end (`npm run test:e2e:journey`, 11 checks). |
| Launch dashboard | READY | `/admin/launch` computes Healthy / Degraded / Not configured / Unknown from live probes (ledger count, sources, cron secret, provider, webhook secret + 7-day failures, mailer, resume warnings, failed background ops). |
| Production build | READY | `npm run build` exit 0 (log `scratch/next-build-p5.log`). |
| Deployment | BLOCKED (by instruction) | Not deployed. `vercel-build` no longer migrates; production migrations require the double-approval workflow (`db:preflight:production` then `db:migrate:production --approve`), rehearsed on a local staging copy. Do not deploy before the runbook is approved. |

## 1b. Phase 7 staging and production-readiness checks (2026-09-25)

| Check | Status | Evidence / what is missing |
|---|---|---|
| Migration ordering, hosted schema, staging schema | READY | Journal strictly increasing (13 files); hosted ledger 5 rows (0000–0004), 30 public tables, 7 users, no Career OS tables (read-only inspection before and after the rehearsal); local staging copy reset to the hosted state and migrated 5 → 13 through the approval workflow. |
| Destructive operations, index/FK safety, backfills, locking | READY | Preflight scans pending SQL: 0 destructive statements in 0005–0012; every `ADD COLUMN … NOT NULL` has a default; FKs cascade/set-null/restrict as documented; no backfills needed (plans seed lazily, catalog seeds from admin); Drizzle applies each file in its own transaction. |
| Backup and rollback | REQUIRES MANUAL ACTION | Backup/PITR mark must be taken in the Tiger Cloud console before approval; reverse SQL documented in the runbook. Not executable from here. |
| Automatic migration on deploy | READY (fixed) | `vercel-build` is now `next build` only; `scripts/migrate-production.mjs` needs `--preflight` (read-only) then a double approval naming the exact target; refuses when the DB is ahead, hashes differ, order is wrong or a pending file is destructive. `test:migration-workflow` 2/2. |
| `next build` / `next start` | READY (with note) | Build exit 0; `next start -p 3100` served the staging copy (all smoke routes 200/404 as expected). `next.config.ts` sets `output: 'standalone'`, so `next start` prints a warning; Vercel does not use it, self-hosting must run `node .next/standalone/server.js`. |
| Full staging E2E | READY | 77/77 browser checks against the production build on the staging copy with `APP_STAGE=staging` fixtures (`scratch/e2e-staging.log`); 10/10 of the pre-fixture checks also passed on a plain production configuration before the fixture-only blocks were skipped. |
| Free/Pro entitlements and feature keys | READY | Plans are admin-managed; e2e enables the Phase 6/6.5 keys through the admin API. Production plans must be edited once after the first deploy (REQUIRES MANUAL ACTION). |
| AI configuration | NOT CONFIGURED | Gateway and admin page ready; no provider keys; real providers NOT TESTED. |
| Razorpay test mode, webhook verification, billing lifecycle | NOT CONFIGURED / READY (unit + fixture) | Signatures, idempotency and lifecycle unit-tested; fixture flow in e2e; no Razorpay keys here. |
| Private resume storage | READY (database) | Bytes in `resumes.content`, owner-scoped; object store stub documented. |
| Cron authentication | READY / NOT CONFIGURED | Constant-time bearer check unit-tested; endpoints answer 404 until `CRON_SECRET` is set; no scheduler configured. |
| Job ingestion and 60-company catalog | READY | Engine with locks/retries/timeouts; catalog seeded with 19 verified feeds ingested live (940 published listings locally). Production needs the admin to seed and schedule (REQUIRES MANUAL ACTION). |
| Email configuration | NOT CONFIGURED | No `RESEND_API_KEY` / `SMTP_URL`; notification log records `skipped`. |
| Structured logging and monitoring | READY / NOT CONFIGURED | JSON logs with redaction and error ids, security events (`security.forbidden`, `security.rate_limited`, ownership warnings); `/admin/launch` live checks. No external APM or alerting is wired (NOT CONFIGURED). |
| Privacy / deletion | READY | Learner deletion endpoint and Settings button; account deletion cascades; AI usage log keeps metadata only. |
| RBAC and IDOR | READY | Admin pages 404 / APIs 403 for non-admins; cross-account reads and writes return 404 for resumes, analyses, outreach, preparations, interviews and billing (e2e). Route scan: only `[...nextauth]`, the public webhook receiver (signature-verified) and the public LeetCode proxy have no session guard, by design. |
| Rate limits | READY (best effort) | Usage counters remain the commercial limit; in-memory sliding-window limits added on AI chat, checkout, verification resend and resume upload (`test:security` 2/2). Per instance on serverless; no global limiter. Credentials sign-in relies on Auth.js and has no extra limiter (risk noted). |
| Secrets | READY | No secret-like strings in tracked files (CI and test placeholders only); `.env*` ignored except `.env.example` and the legacy `.env.production` (Vite-era Appwrite ids, no secrets). `.env.local` in this checkout points at the hosted database and must never be used for staging runs. |
| Environment variables | REQUIRES MANUAL ACTION | Required in production: `DATABASE_URL` (or non-pooling variant), `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `PLATFORM_ADMINS`; optional: `CRON_SECRET`, `RAZORPAY_*`, mailer, AI keys, `RESUME_STORE`. `APP_STAGE` and `AI_FIXTURE` must be unset. Presence in Vercel is unknown from here. |

## 2. Test evidence (all run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev  → 5/5
npm run test:billing:phase5  → 7/7  (plan validation; entitlement resolution incl. legacy pass + allowlist + default;
                                     webhook signature / idempotency / duplicate; lifecycle incl. failed payment, renewal,
                                     cancel, expiry; checkout authorisation + fixture token forgery / cross-account reuse;
                                     Razorpay signature + event normalisation; cron auth + log redaction)
npm run test:billing         → passed (legacy one-time pass signatures)
test:jobs:domain 11/11 · test:ingestion 11/11 · test:matching 5/5 · test:scheduler 4/4 · test:resume 4/4 + 2/2 · test:phase4 11/11
test:curriculum, test:learning:domain, test:merge, test:verification → passed
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build → exit 0 (dev server stopped for the build, restarted afterwards)
npm run test:e2e:jobs → All 67 Career OS Phase 1–5 checks passed (Chromium; log scratch/e2e-jobs-p5.log)
npm run test:e2e      → All end-to-end checks passed (existing tracker regression)
```

Phase 5 browser flow (`scripts/e2e-jobs.mjs`, synthetic accounts, no localStorage pre-seeding): free learner → paywall "See plans and upgrade" → `/pricing` (toggle, cards, current plan, test-mode notice; premium API 402) → "Simulate failed payment" (recorded with reason, nothing unlocked, still free) → "Complete test payment" (signed fixture webhook processed server-side, `billing_subscriptions.status = active`, ledger rows, activation notification logged, not sent) → `/app` premium unlocked (paywall gone, analysis 200) → refresh → still unlocked → Settings → Billing usage `1 / 100` → Cancel renewal (`cancel_at_period_end`, access kept) → other learner: cancel 404, history isolated → non-admin: four admin pages 404, APIs 403 → admin edits Prep Pro features in `/admin/plans` → learner loses `jobs.matching` immediately (402) → admin restores → audit rows → admin subscriptions / billing status / launch readiness render → forged webhook 400, cron 404 → learner deletes Career OS data; listings intact. Screenshots: `scratch/career-os/pricing-free.png`, `settings-billing.png`, `admin-plans.png`, `admin-launch.png`.

## 3. Razorpay test-mode verification (REQUIRES MANUAL ACTION, not done)

1. In the Razorpay dashboard (test mode) create two plans (monthly, yearly) for Prep Pro; paste their ids into `/admin/plans` → Prep Pro → provider plan ids.
2. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (test keys) and `RAZORPAY_WEBHOOK_SECRET` in a staging environment; add the webhook `https://<staging>/api/billing/webhooks/razorpay` with the subscription events listed in `.env.example`.
3. On `/pricing` complete a test-card checkout; confirm `/api/billing/subscription` becomes `active` only after the webhook (or the verified checkout handler), then run: failed test card, cancel renewal (dashboard shows `cancel at cycle end`), and a replayed webhook (`/admin/billing` shows a duplicate, nothing changes).
4. Until step 3 has been done, the Razorpay path stays **NOT TESTED**.

## 4. Resume storage recommendation

Keep the database store for launch (files are small, owner-scoped, and deletion is transactional with the metadata). Move to private object storage (S3 or R2 with a private bucket and server-side reads, never public URLs) when either the `resumes` table exceeds a few GB or PITR restore time becomes a concern. The migration path is: configure `RESUME_OBJECT_BUCKET` / `RESUME_OBJECT_ENDPOINT` + credentials, implement `objectResumeStore.put/get/delete` (S3 SDK, keys `resumes/<userId>/<resumeId>`), set `RESUME_STORE=object`, then backfill by re-`put`ting existing rows. Nothing else changes.

## 5. Privacy and account deletion (implemented behaviour)

- Learner self-service: Settings → "Delete my Career OS data" removes resumes (bytes and profiles), resume analyses, outreach contacts, job preparations, job preferences and usage counters. Learning data, applications and the account itself stay. Logged as `account.career_data_deleted` with counts only.
- Full account deletion (support action, SQL `DELETE FROM users WHERE id = …`) cascades: roles, preferences, resumes, analyses, outreach, preparations, subscriptions; audit and notification rows keep the event but lose the user reference (`SET NULL`). Billing ledger rows (`billing_events`) are provider facts and are kept for reconciliation; they contain no personal data beyond the provider ids.
- Resume text is never sent to an external AI provider unless the learner explicitly starts an analysis that uses their own configured key (Phase 3 behaviour, unchanged).
- Logs never contain resume text, drafts, tokens or signatures (redaction test).

## 6. Blockers and manual actions before a launch

1. Approve and execute the migration runbook (section 1, first row).
2. Enter final plan prices, descriptions and Razorpay plan ids in `/admin/plans`; review `/pricing` copy.
3. Configure Razorpay keys + webhook secret and complete the section 3 test-mode verification.
4. Configure a mailer (`RESEND_API_KEY` or `SMTP_URL`, `EMAIL_FROM`) if notifications should be delivered; otherwise they stay logged as `skipped`.
5. Set `CRON_SECRET` and point a scheduler at the two cron endpoints (or keep running ingestion from the admin panel).
6. Decide on `RESUME_STORE` (database is fine for launch).
7. Review `/admin/launch` on the deployed environment; every row must read Healthy or an accepted Not configured.
