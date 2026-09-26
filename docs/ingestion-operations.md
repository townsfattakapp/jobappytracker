# Ingestion operations

How scheduled job ingestion behaves in production and what an operator does when it does not. No cron is configured in this repository; enabling one is a manual, reviewed action (see `docs/launch-readiness.md`).

## Components

- **Runner**: `src/lib/ingestion/scheduler.ts` (`runScheduledIngestion`). Picks every `job_sources` row that is `active`, `ingestionAllowed`, `scheduleEnabled`, not locked, and due (`lastRunAt` older than the source interval or never run). Each source is processed in isolation: one failure never stops the others.
- **Locking**: `lockedAt` + `lockToken` per source. A lock older than the lock timeout (`lockTimeoutMs`, default 15 minutes) is treated as abandoned and reclaimed by the next pass; a pass that finds a live lock records a `skipped` run with the reason.
- **Retries**: up to 3 attempts per source per pass with backoff; only transient failures (network, 5xx, timeout) are retried. Provider 4xx (removed board, wrong slug) fail immediately and are reported.
- **Timeout**: every provider fetch is bounded by `INGESTION_FETCH_TIMEOUT_MS` (default 20 000 ms) through `AbortSignal.timeout`.
- **Health**: `job_sources.lastRunAt / lastRunStatus / lastError / lastSuccessAt`; every attempt is a row in `job_ingestion_runs` (`trigger`, `attempts`, `durationMs`, counts, log). Unexpected exceptions are logged as `ingestion.unexpected_failure` with an error id (structured log line, stdout).
- **Sweep**: after ingestion the lifecycle sweep marks jobs not seen at source as `stale` then `expired` (`src/lib/jobs/lifecycle.ts`).

## Entry points

| Entry point | Auth | Purpose |
|---|---|---|
| `GET /api/cron/ingestion` | `Authorization: Bearer $CRON_SECRET` (constant-time compare; 404 when the secret is unset or wrong; failed attempts logged as `cron.auth_failed`) | The scheduled pass: all due sources + sweep |
| `GET /api/cron/reminders` | same | Daily follow-up reminders (tracker + outreach); logs to `notification_log`; sends only when a mailer is configured |
| `/admin/ingestion` → "Run scheduled pass" | admin / jobs_editor role | Same code path as the cron, audited as `ingestion.schedule` |
| `/admin/ingestion` → "Run now" per source | admin / jobs_editor | Single source, bypasses the due check, audited as `ingestion.run` |
| `/admin/ingestion` → "Sweep lifecycle" | admin / jobs_editor | Sweep only |

## Enabling the schedule in production (manual, not done)

1. Set `CRON_SECRET` (32+ random bytes) in the production environment. Until then both cron routes answer 404.
2. Create a platform cron (Vercel Cron, GitHub Actions schedule, or any HTTP scheduler) that calls `GET https://<domain>/api/cron/ingestion` every 6 hours and `GET https://<domain>/api/cron/reminders` once a day at 03:00 UTC, with the bearer header. Vercel Cron cannot send custom headers on Hobby plans; use `?token=` **only** if you first extend `cronAuthorized` to accept it (not implemented on purpose).
3. Watch the first two passes on `/admin/ingestion` and `/admin/launch`.

## Reading health

- `/admin/launch` → "Job ingestion": Healthy when every enabled source succeeded within 48 h; Degraded when any last run failed or a source has no success in 48 h; Not configured when no source is enabled.
- `/admin/ingestion`: per-source last run, status, error, success time, lock state; run history with logs.
- Structured logs: search for `"event":"ingestion.unexpected_failure"` or `"event":"cron.auth_failed"`.

## Runbook for common failures

| Symptom | Likely cause | Action |
|---|---|---|
| Source shows `failed` with HTTP 404/410 | Board slug changed or company left the ATS | Fix `config` in `/admin/sources` or deactivate the source |
| `failed` with `timeout` | Provider slow | Raise `INGESTION_FETCH_TIMEOUT_MS`; retry from the panel |
| Source stuck `running` for > 15 min | Process died mid-run | Nothing; the next pass reclaims the stale lock. To force it now, "Run now" from the panel |
| Cron endpoint returns 404 in production | `CRON_SECRET` unset or the scheduler sends the wrong header | Check env; look for `cron.auth_failed` lines |
| Many jobs flipped to `stale` | Provider feed empty for one pass | Sweep only expires after the configured stale window; check the provider, then rerun |
| Duplicate listings | Cross-source duplicates | `/admin/duplicates` (review + merge/ignore) |
