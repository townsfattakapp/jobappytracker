# Enterprise career ingestion — local implementation and verification

No deployment, production database access, or production writes were performed. Existing unrelated workspace changes were left alone.

The catalog now detects career source types, stores discovery evidence in the existing source configuration, and runs verified sources through the existing scheduler and ingestion engine. The admin catalog shows detected provider, extraction support, health, last sync, fetched/relevant/published/stale counts, duplicates, errors, and Run Sync. Refreshing the catalog preserves discovered configurations. A URL or provider match alone never means integration succeeded.

Use **Seed/Refresh catalog → Discover visible sources** (or a company's **Detect / verify**) → **Run Sync**. Discovery runs one company per request so a failed company does not stop the others. **Schedule all verified** enrolls eligible sources in the existing scheduler; no new cron is required. Unsupported sources retain their official URL.

## Providers

Added exactly one adapter: `public-careers`, for explicit public Schema.org JobPosting JSON-LD or JSON. Static pages can expose jobs directly or through bounded same-origin job links. This is not a general HTML scraper or a private-API discovery system.

Reused Greenhouse, Lever, Ashby, Workday, SmartRecruiters and Oracle Cloud adapters. Other existing configured official adapters remain available. SuccessFactors and Oracle/Taleo variants without a supported public endpoint are identified but remain unsupported unless readable public structured data is present. No authenticated SuccessFactors OData, private API, browser automation, LinkedIn or Google Jobs scraping was added.

The public-access guard identifies JobAppy, checks robots policies, restricts HTTPS destinations, pins DNS to a public IPv4 address, caps response sizes, validates redirects and stops on protection/authentication/rate-limit responses. Unavailable robots policies are treated conservatively as protected. Public accessibility is technical evidence, not a declaration of an employer's licensing terms; ambiguous sources remain available for manual review.

Discovered official imports preserve unknown mode, employment type, seniority, country and dates. Requirements/preferred qualifications are retained from explicit fields or description sections. Company/ID, canonical apply URL and fingerprint matching prevent cross-source copies; official data replaces Adzuna copies in place. Missing or capped pages cannot stale unseen jobs. Public page crawls use the existing age-based lifecycle sweep because a crawl cannot prove a complete inventory.

## Read-only public checks

Full per-company results and every NOT TESTED company are in [enterprise-public-verification.json](reports/enterprise-public-verification.json). Counts below concern this isolated verification run, not production coverage.

| Metric | Result |
|---|---:|
| Total catalog companies | 304 |
| Companies previously containing only a career portal link | 117 |
| Sources checked live | 10 |
| Successfully integrated locally, full public snapshots | 2: Druva, Mindtickle |
| Unsupported / protected | 4: Wipro, IBM / Confluent, Freshworks |
| Jobs fetched | 60 |
| Relevant jobs | 17 |
| Duplicates removed in live sample | 0 |
| Published into disposable local database | 17 |
| Published to production | 0 |
| Failed or incomplete source runs | 6: Confluent, Freshworks, Adobe, Oracle, Quess Corp, Dell |
| NOT TESTED sources | 294; individually listed in JSON report |

Adobe, Oracle, Quess Corp and Dell were intentionally capped at three jobs for read-only endpoint verification and are **PARTIAL**, not successfully integrated companies. Quess Corp also returned descriptions missing from the sampled detail payloads. Confluent's robots policy returned 401; Freshworks' policy disallowed the endpoint. Neither protection was bypassed. Wipro was recognised as SuccessFactors but exposed no supported structured jobs in the pages checked; IBM likewise remained unsupported within the bounded discovery check.

Detected/existing provider distribution: Greenhouse 80; Lever 10; Ashby 37; Workday 27; SmartRecruiters 4; Oracle Cloud 4; SuccessFactors 1; static/server-rendered candidates 135; Amazon 1; Eightfold 3; Atlassian 1; Keka 1. The 135 static candidates include untested URLs; that count does **not** imply static extraction support. Zero custom/public JSON feeds were confirmed in the live sample; that fallback is fixture-tested.

The two full public snapshots and all readable partial snapshots were each ingested twice: the second pass created **zero** jobs. The separate fixture suite also proves cross-source replacement of an aggregator copy, protected-source stopping, stale preservation, unknown fields, discovery persistence, and scheduler locking/retries/failure isolation.

## Validation

```powershell
npm run typecheck
node --test scripts/test-enterprise.mjs scripts/test-catalog.mjs scripts/test-ingestion.mjs scripts/test-scheduler.mjs
node scripts/verify-enterprise-public.mjs --live
```

Tests use disposable PGlite and do not load an environment file. The optional live command reads official sources and writes only a local JSON report and disposable database. It does not verify the other 294 sources. Full imports of the large Workday/Oracle boards, production scheduling, deployment and browser UI interaction were NOT TESTED in this change.

Source formats were checked against the [Greenhouse public Job Board API documentation](https://docs.greenhouse.io/job-board.html) and [Schema.org JobPosting](https://schema.org/JobPosting).
