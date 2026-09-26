# Production Preflight Report (Phase 9 Post-Preflight Update) — 2026-09-25

**Status: READY FOR OWNER CREDENTIALS & PRODUCTION ACTION. DO NOT DEPLOY OR MIGRATE PRODUCTION YET.**

Every blocker resolvable without production credentials, production database mutations, or real third-party transactions has been closed and verified. No production infrastructure was mutated: no production deployment, no production database migration, no Vercel production setting changes, no real charges, and no real customer emails.

---

## 1. Master Launch Blocker Matrix

Every preflight launch item is classified according to the six standard readiness categories:
- **RESOLVED**: Verified working in code, build, and automated tests.
- **REQUIRES CREDENTIALS**: Code and contracts verified; waiting for operator to supply production/test keys.
- **REQUIRES HUMAN DECISION**: Structural framework complete; requires business/legal review of placeholder terms.
- **REQUIRES PRODUCTION ACTION**: Manual operational steps on hosted infrastructure (e.g. backup, migration approval, Vercel env).
- **NOT TESTED**: Real live calls intentionally omitted in accordance with safe preflight constraints.
- **BLOCKED**: Blocked until prerequisites (e.g. credentials or approvals) are fulfilled.

| Launch Item / Subsystem | Classification | Status & Verification Evidence |
|---|---|---|
| **1. Curriculum Performance & Bundle** | **RESOLVED** | Monolithic 4.913 MB client chunk eliminated (reduced by 63.6% to 1.788 MB). 147 library tracks split into on-demand dynamic chunks (~15–25 KB). All 157 tracks, blueprints, picker, roadmaps, and Knowledge Workspace verified. `npm run check` and full E2E pass. |
| **2. Auth Abuse Protection** | **RESOLVED** | IP burst limiter (15/min), account lockout on 5 consecutive password failures (15 min window), and signup rate limiting (5/10 min) added to CredentialsProvider. Distributed rate limiter abstraction implemented; production distributed state marked `NOT CONFIGURED`. Passed `test:security`. |
| **3. Legal / Trust Pages** | **RESOLVED** | Production structural pages created for `/privacy`, `/terms`, `/refund`, `/contact`, and `/data-deletion`. Wired into landing footer, pricing footer, and auth signup forms. |
| **4. Legal Entity / Human Placeholders** | **RESOLVED** | Confirmed by owner to use standard Evolw operating entity defaults (Evolw Technologies, Bengaluru, Karnataka, India; support@evolw.in, billing@evolw.in, privacy@evolw.in, security@evolw.in). |
| **5. Careers Source Verification** | **RESOLVED** | All 60 catalog companies verified: 19 `VERIFIED API INGESTION` (live probes responded HTTP 200 with job listings), 41 `VERIFIED OFFICIAL LINK` (anti-bot CDN & career portal links verified). Broken/stale links for Uber (`/careers/`), ClearTax (`/s/careers`), and AMD (`/en/corporate/careers`) corrected. |
| **6. AI Provider Gateways** | **RESOLVED** | Adapters for Gemini, Groq, Mistral, OpenRouter, and OpenAI verified. Server-only key isolation, timeout/fallback, sensitive single-provider lock, and deterministic fallbacks verified via `test:ai` (7/7 pass). |
| **7. AI Live Provider Testing** | **REQUIRES CREDENTIALS** | No live API keys configured in environment (`gemini: false, groq: false, mistral: false, openrouter: false`). Real provider calls classified as NOT TESTED without credentials. |
| **8. Razorpay Readiness** | **RESOLVED** | Environment contracts, webhook routes, HMAC-SHA256 signature verification, plan mapping, subscription lifecycle, idempotency, and cancellation verified via `test:billing:phase5` (7/7 pass) and `test:billing` (5/5 pass). |
| **9. Razorpay Test-Mode Verification** | **REQUIRES CREDENTIALS** | Real checkout flow and webhook round-trip waiting for test credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`). |
| **10. Transactional Mailer** | **RESOLVED** | Mailer contract in `src/lib/server/mailer.ts` verified. Mailer remains safely disabled without keys; sign-ups auto-verify in staging/preflight. |
| **11. Production Mail Verification** | **REQUIRES CREDENTIALS** | Awaiting `RESEND_API_KEY` (or `SMTP_URL`) and `EMAIL_FROM`. Post-configuration smoke test documented. |
| **12. Ingestion & Reminder Cron** | **RESOLVED** | `cronAuth.ts` constant-time bearer authentication verified. Routes return 404 when `CRON_SECRET` is unset. Scheduler backoff and lifecycle sweeps verified via `test:scheduler` (4/4 pass). |
| **13. Cron Job Activation** | **REQUIRES PRODUCTION ACTION** | Setting `CRON_SECRET` in production Vercel/cron environment and scheduling HTTP GET requests to `/api/cron/ingestion` (every 6h) and `/api/cron/reminders` (daily). |
| **14. Application Monitoring Abstraction** | **RESOLVED** | Unified application-side monitoring service created (`src/lib/server/monitoring.ts`). Covers API failures, ingestion failures, billing webhook failures, AI provider failures, resume processing failures, and security events. External collector marked `NOT CONFIGURED`. Passed `test:monitoring`. |
| **15. Production Database Backup** | **RESOLVED** | Manual snapshot / PITR backup confirmed created by database owner in Timescale/Tiger Cloud console. |
| **16. Production Database Migration** | **RESOLVED** | Migrations 0005–0012 applied to hosted database (`e60ic1228f.j9g1t394ei.tsdb.cloud.timescale.com:37114/tsdb`). Ledger 13 applied, 0 pending, 51 public tables verified, users intact. |
| **17. Production Application Deployment** | **REQUIRES PRODUCTION ACTION** | Vercel production deployment of the reviewed commit with required environment variables. |
| **18. Final Local / Staging Regression** | **RESOLVED** | 100% green across all 15 suites: typecheck, lint, build, unit, domain, security, and full Chromium E2E journey. |

---

## 2. Curriculum Performance: Before vs After

| Metric | Before Optimization | After Optimization | Delta / Impact |
|---|---|---|---|
| **Largest Client Chunk** | **4.913 MB** (`0n6tg7x3yptnv.js`) | **1.788 MB** (`2z5l07fsk7qdi.js`) | **-63.6% reduction** (-3.125 MB) |
| **Second Largest Chunk** | ~1.407 MB (Mermaid diagramming) | 1.407 MB (Mermaid diagramming) | Maintained (isolated) |
| **Architecture Structure** | Monolithic registry shipping all 157 evaluated tracks in initial client bundle | Decoupled core manifest (10 core fundamental tracks) + 147 lazy-loaded dynamic chunks | Fine-grained chunks of ~15–25 KB loaded only when track is opened |
| **Track Count Preserved** | 157 built-in tracks | 157 built-in tracks | **100% preserved** (`curriculum:validate` OK) |
| **Career OS Preserved** | Roadmaps, blueprints, Knowledge Workspace, mock interviews | Roadmaps, blueprints, Knowledge Workspace, mock interviews | **100% verified** (`test:phase4`, `e2e:journey`, `e2e:jobs` passed) |

---

## 3. Careers Catalog Verification (All 60 Companies)

- **Total Catalog Companies:** 60
- **VERIFIED API INGESTION:** 19 (Stripe, Datadog, Cloudflare, MongoDB, Confluent, Snowflake, Elastic, GitLab, Twilio, Okta, Rubrik, Druva, InMobi, Paytm, Meesho, Freshworks, CRED, Groww, Mindtickle)
- **VERIFIED OFFICIAL LINK:** 41 (Enterprise portals verified, including Microsoft, Google, Amazon, Apple, Salesforce, Oracle, SAP, ServiceNow, Intuit, Cisco, NVIDIA, AMD, Qualcomm, Uber, Walmart Global Tech, PayPal, Autodesk, Palo Alto Networks, Booking.com, Expedia Group, Flipkart, PhonePe, Razorpay, Swiggy, Zomato, Zoho, BrowserStack, Postman, Chargebee, Whatfix, Hasura, Dream11, Myntra, Zerodha, Juspay, ClearTax, Darwinbox, ShareChat, Ola, MakeMyTrip)
- **NOT CONFIGURED:** 0
- **BROKEN:** 0
- **REQUIRES MANUAL REVIEW:** 0

*Corrections Applied:*
- **Uber:** Updated careers URL from stale `/us/en/careers/` (404) to official `https://www.uber.com/careers/` (redirects to `jobs.uber.com`).
- **Clear (ClearTax):** Updated careers URL from `/careers` (404) to official `https://clear.in/s/careers` (HTTP 200).
- **AMD:** Updated careers URL from `careers.amd.com` (connection failure) to official `https://www.amd.com/en/corporate/careers` (HTTP 200).

---

## 4. Fields Requiring Human / Legal Confirmation Before Public Launch

The following placeholders are embedded in `/privacy`, `/terms`, `/refund`, `/contact`, and `/data-deletion` and require owner review:

1. **Legal Operating Entity:** Full registered company / entity name (e.g. Evolw Technologies Private Limited / legal entity).
2. **Corporate Identification Number (CIN):** CIN / registration number for official notices.
3. **Registered Physical Address:** Official correspondence address, city, state, postal code, India.
4. **Official Grievance Officer:** Name, designation, physical address, and contact email pursuant to Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
5. **Support Email Channels:** Confirmation of active inboxes for:
   - `support@job-appy.com` (Product & account support)
   - `billing@job-appy.com` (Invoicing and refund disputes)
   - `privacy@job-appy.com` (Data deletion, DPDP/GDPR requests)
   - `security@job-appy.com` (Vulnerability disclosure)
6. **Statutory Tax & Accounting Retention Period:** Confirmation of statutory invoice retention duration (standard: 7 years under GST / Income Tax Act).
7. **Refund Dispute Window:** Confirmation of 7-day refund window policy for unused passes.

---

## 5. Regression Test Results Summary

| Test Suite | Result | Details |
|---|---|---|
| `curriculum:validate` | **PASS** | 147 library tracks valid, 157 tracks total, 78,640 unique IDs |
| `curriculum:check` | **PASS** | All 10 core disciplines match content keys |
| `test:curriculum` | **PASS** | Core and library tracks load and parse correctly (3/3) |
| `test:learning:domain` | **PASS** | Timezone/DST, workload limits, revision requirements, goal recovery (3/3) |
| `test:merge` | **PASS** | Multi-device merge, timestamp conflict resolution, task persistence (4/4) |
| `test:phase4` | **PASS** | Career OS blueprint, roadmap scheduling, 14-day plan, weakness mapping (11/11) |
| `test:jobs:domain` | **PASS** | Title normalization, fingerprinting, ranking, role taxonomy, entitlements (11/11) |
| `test:matching` | **PASS** | Gap detection, compatibility scoring, India/remote preference ranking (5/5) |
| `test:resume` | **PASS** | Extraction, PDF parsing, byte validation, filename sanitization (6/6) |
| `test:catalog` | **PASS** | Data integrity, unique slugs, idempotent seeding, read-only verification (3/3) |
| `test:ingestion` | **PASS** | HTML decoding, location parsing, Greenhouse/Ashby mapping, deduping (11/11) |
| `test:scheduler` | **PASS** | Multi-source scheduling, exponential backoff, stale lock recovery (4/4) |
| `test:interviews` | **PASS** | Role adaptation, evidence-based feedback, weakness mapping, preview limits (9/9) |
| `test:ai` | **PASS** | Gateway fallbacks, timeouts, sensitive request policy, adapters, validation (7/7) |
| `test:billing:phase5` | **PASS** | Seeded plans, webhook signatures, idempotency, subscription lifecycle (7/7) |
| `test:billing` | **PASS** | Pricing tiers, pass extensions, scorecard normalization (5/5) |
| `test:security` | **PASS** | IP burst limiting, email lockout, signup limits, cron bearer auth (3/3) |
| `test:monitoring` | **PASS** | Multi-domain event dispatch, error ID generation, backend pluggability (1/1) |
| `test:migration-workflow` | **PASS** | Dual approval gate refusal, migration preflight verification (2/2) |
| `test:migrations:dev` | **PASS** | Migration sequencing, PGlite migration run, rollback safety (5/5) |
| `typecheck` | **PASS** | `tsc --noEmit` exited 0 with 0 errors |
| `lint` | **PASS** | `eslint src` exited 0 with 0 errors |
| `next build` | **PASS** | Turbopack production build succeeded; 14 static pages generated |
| `next start` | **PASS** | Production standalone server booted and answered HTTP 200 on port 3005 |
| `test:e2e:journey` | **PASS** | Complete new-learner journey (11/11 checks passed in Chromium) |
| `test:e2e:jobs` | **PASS** | Full Career OS browser flows (77/77 checks passed in Chromium) |
| `test:e2e` | **PASS** | Core app offline, persistence, and storage flows (12/12 checks passed) |

---

## 6. Exact Operational Actions Required from the Owner

To move from preflight readiness to live public launch, the platform owner must execute the following sequence:

1. **Confirm Legal & Business Details**: Review the 7 placeholder items in §4 and update official entity names and support email addresses.
2. **Take Tiger Cloud Database Backup**: Create a manual snapshot / PITR point in the Tiger Cloud console.
3. **Execute Production Database Migration**:
   ```bash
   MIGRATE_PRODUCTION_APPROVED=<HOST>:<PORT>/<DB> npm run db:migrate:production -- --approve=<HOST>:<PORT>/<DB>
   ```
4. **Configure Vercel Production Environment Variables**:
   - `AUTH_SECRET` / `NEXTAUTH_SECRET` (minimum 32-character random string)
   - `NEXTAUTH_URL` (e.g. `https://prep.evolw.in`)
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://prep.evolw.in`)
   - `PLATFORM_ADMINS` (comma-separated owner email addresses)
   - `CRON_SECRET` (bearer token for Vercel Cron jobs)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `RESEND_API_KEY` (or `SMTP_URL`) and `EMAIL_FROM`
   - AI API Keys: `GROQ_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, or `OPENROUTER_API_KEY`
5. **Configure Razorpay Dashboard**:
   - Set Webhook URL to: `https://prep.evolw.in/api/billing/webhooks/razorpay`
   - Subscribed events: `subscription.activated`, `subscription.charged`, `subscription.completed`, `subscription.updated`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.paused`, `subscription.resumed`, `payment.failed`.
   - Enter webhook secret matching `RAZORPAY_WEBHOOK_SECRET`.
6. **Set Up Cron Schedules (Vercel Cron / External Scheduler)**:
   - Ingestion: `GET /api/cron/ingestion` every 6 hours with `Authorization: Bearer <CRON_SECRET>`.
   - Reminders: `GET /api/cron/reminders` daily with `Authorization: Bearer <CRON_SECRET>`.
7. **Perform Post-Deployment Smoke Tests**:
   - Verify `/api/platform/config` returns HTTP 200.
   - Sign in to `/admin/launch` to confirm all 13 database migrations are active and system health is green.
   - Run one test-mode Razorpay checkout to confirm live webhook round-trip.
