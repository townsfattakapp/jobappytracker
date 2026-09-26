# Phase 11 — production deployment, live job catalog and resume comparison — 2026-09-26 IST

**Deployed.** Commit `4803608` on `main` (GitHub `townsfattakapp/jobappytracker`) was built by Vercel (team Evolw, project `job-appy`, Hobby plan) and is live at https://prep.evolw.in (aliases `job-appy.vercel.app`, `job-appy-evolw.vercel.app`). The hosted Tiger Cloud database was already migrated through `0012` before this phase (preflight: ledger 13 / journal 13 / pending 0; no migration was run here). The production database now holds the seeded company catalog and the first ingestion pass; see the numbers below.

## What was done in production (all through the application's own code)

- **Admin access**: the admin role was granted to `business.vishwas24@gmail.com` in `user_roles` (`scripts/ops-seed-catalog.mjs --admin-email`). `/admin` opens for that account; the `PLATFORM_ADMINS` environment variable is *not* set (see "What the operator must still do").
- **Paid plan**: the `pro` plan's feature list gained `interview.voice`, `interview.premiumVoice`, `interview.replay` (the three keys added by Phase 10). Prices are still the development fixtures (₹199 / ₹1 990 per month / year); review `/admin/plans` before promoting `/pricing`.
- **Catalog**: 168 companies and 168 sources seeded (`company-catalog-2026-09`); 118 of the 119 feeds verified live (MongoDB's probe timed out once and stays "Degraded" until an admin presses Verify on `/admin/catalog`); the scheduled pass is enabled for the 118 verified sources.
- **First ingestion pass** (`--ingest-only --parallel=6`, 875 s against the hosted database): 117 sources succeeded, 0 failed, 1 skipped (a lock left by the timed-out first attempt, released automatically after 15 minutes). **4 424 published jobs**: international on-site 2 178, international remote 1 720, international hybrid 247, India on-site 233, India remote 38, India hybrid 8. Largest sources: OpenAI 350, Anthropic 220, Databricks 191, Cloudflare 183, Roblox 152, Stripe 145, Okta 130, Airwallex 126, Affirm 119, Binance 116.
- **Live checks after the deploy**: see the smoke table in the summary message of this session (config, job list, India / remote / search filters, pricing, `/admin` 404 for anonymous callers, cron route 404 without a secret, voice route 401 when signed out).

## Job Discovery data: what is real and what is not

Every listing comes from a company's own public job-board API (Greenhouse Job Board API, Lever Postings API, Ashby Job Board API), verified read-only on 2026-09-26 (`scratch/probe-feeds.log`), normalised by the existing engine (role classification, region, work mode, remote eligibility; non-engineering roles are dropped as irrelevant), de-duplicated and refreshed by the scheduler. Nothing is scraped and no listing is invented. **FAANG / MANG** (Meta, Apple, Amazon, Netflix, Google, Microsoft) plus LinkedIn, Goldman Sachs, JPMorgan, Visa, Mastercard, Adobe, Atlassian, Salesforce, Oracle, SAP, Uber, PayPal and the large Indian consumer brands (Flipkart, PhonePe, Razorpay, Swiggy, Zomato, Zoho, Zerodha…) publish only on their own portals: they are in the catalog with official careers links and are shown as "Unsupported" on `/admin/catalog`; their openings are **not** in the feed. Adding them would mean scraping portals against their terms, which this product deliberately does not do. India-based listings are therefore a minority (279 of 4 424) until more India-headquartered companies with public feeds are added; the feed ranking still puts India and remote-eligible roles first for learners who prefer India.

## Scheduled refresh

`vercel.json` schedules `GET /api/cron/ingestion` daily at 01:15 UTC and `GET /api/cron/reminders` at 03:30 UTC (the Hobby plan allows two daily crons). Each ingestion pass visits the least-recently-run sources inside a 240-second budget (`INGESTION_PASS_BUDGET_MS`, function `maxDuration` 300) and defers the rest to the next pass; the lifecycle sweep marks listings stale after 7 days and expires them after 21. **The cron is inert until `CRON_SECRET` is set in Vercel** (the route answers 404 without it) — the attempt to add it from this session was blocked by the tool permission system, so the operator must add it (any long random string) and redeploy. Until then, refresh manually: `/admin/ingestion` → "Run scheduled pass now", or `node scripts/ops-seed-catalog.mjs --target=<host:port/db> --ingest-only --parallel=6` with the production `DATABASE_URL` and `DATABASE_SSL_CA`.

## Resume: versions and comparison with any opening

Resume versions were already private and owner-scoped (bytes in `resumes.content`, cross-account 404). New in this phase: the Resume workspace has **"Compare with an opening"** — search Job Discovery, pick an opening, and run the resume-vs-job analysis with the *selected* version (not only the current one); the report (strong matches with quoted resume lines, missing or weak evidence mapped to curriculum, skills table, experience and project relevance, suggestions with save / dismiss / done) renders in place with a link into the job workspace. `ResumeAnalysisView` moved to `src/components/jobs/ResumeAnalysisView.tsx` and is shared with the job workspace. Browser-checked locally (`scratch/career-os/resume-compare.png`): search → pick → compare → report → open job workspace; usage counter increments; free plan sees the locked panel.

## Checks run before the push

```text
npx tsc --noEmit → exit 0 · eslint src + new scripts → exit 0
test:ingestion 11/11 · test:catalog 3/3 · test:scheduler 4/4 · test:matching 5/5 · test:jobs:domain 11/11 · test:interview:room 14/14 · test:interviews 9/9 · test:ai 7/7 · test:billing:phase5 7/7 · test:security 3/3 · test:monitoring 1/1
ops seed rehearsal on the local PGlite database: 119 feeds verified, 4 540 published jobs in 168 s
Vercel build of 4803608: Ready (1 m 51 s), aliased to prep.evolw.in
```
The Phase 10 e2e suites (room 12/12, jobs 77/77, journey 11/11) ran before the catalog, scheduler and resume-panel changes; the scheduler change is covered by `test:scheduler`, the catalog by `test:catalog` and the live seed, the resume panel by the browser check above. `npm run build` was not re-run locally after those last changes; the Vercel production build is the build evidence.

## What the operator must still do (cannot be done from this session)

1. **Vercel → Settings → Environment Variables (Production)**: add `CRON_SECRET` (random, 32+ chars) so the daily ingestion and reminder crons run; optionally `PLATFORM_ADMINS=business.vishwas24@gmail.com` (the database role already grants admin); `GROQ_API_KEY` or `GEMINI_API_KEY` (or another provider) for AI follow-up rephrasing, coach notes and the general AI mock rounds — without one, job interviews run fully on the deterministic interviewer and general rounds show "The interviewer needs AI"; `RAZORPAY_WEBHOOK_SECRET` (keys are present, the webhook secret is not) before selling passes; `RESEND_API_KEY` or `SMTP_URL` + `EMAIL_FROM` for verification and reminder emails; a voice provider key (`OPENAI_API_KEY`, `GOOGLE_TTS_API_KEY`, or `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`) if the premium interviewer voice should be real — and listen to it before enabling `interview.premiumVoice` for a plan. Redeploy after adding variables.
2. `/admin/plans`: set the real prices and Razorpay plan ids; review `/pricing` copy.
3. `/admin/catalog`: press Verify for MongoDB; review the 50 "Unsupported" portal-only companies.
4. Consider Vercel Pro if more than one ingestion pass per day or longer functions are needed; on Hobby the two crons run once a day.
5. The production `users` table still contains six synthetic accounts from an earlier billing e2e run (`billing-e2e-*@example.invalid`, `dbg-*@example.invalid`); delete them from `/admin/users` if unwanted. They were left untouched here.

## NOT TESTED in production

Signed-in flows (job workspace, resume comparison, mock interview room, admin pages) were verified locally only; in production only anonymous endpoints were exercised because no test account was created there. Payments (Razorpay live), email, AI providers and the premium voice are not configured in production and were not tested.

# Phase 10 — voice-first interview room on the existing mock interview system — 2026-09-26 IST

Nothing deployed; no production or hosted-database change; no migration (all new state lives in the existing `jsonb` columns of `job_interview_sessions` and in `platform_settings`). Docker was not available on this machine, so the local database for this phase is an embedded PGlite exposed over the PostgreSQL wire protocol (`scripts/dev-pglite-server.mjs`, `npm run db:dev:pglite`, data in `scratch/pglite-dev`); it needs `npm install --no-save @electric-sql/pglite-socket` (deliberately not added to `package.json`). Another session was working in the same tree (its edits to `AuthPanel.tsx`, `BookmarkletModal.tsx`, `MobileNav.tsx`, `style.css`, `scripts/audit-*.mjs` and a `next start` on port 3000 were left untouched); this phase ran its own dev server on port 3001 (`AI_FIXTURE=1 TTS_FIXTURE=1`). Architecture: `docs/career-os-architecture.md` section 7c.1. Left running at hand-off for manual review: the phase's dev server on http://localhost:3001 (pid in `scratch/local-dev.pid`) and the PGlite database server (pid in `scratch/pglite-dev.pid`); stop them with `taskkill /PID <pid> /T /F`. The other session's `next start` on port 3000 was not touched.

## 1. Existing architecture reused (nothing rebuilt)

The Phase 6 engine (`src/lib/interview/jobInterview.ts`: context, derived configuration, composition, provenance, evidence analysis, follow-up decisions, report), the session service and its ownership model (`src/lib/server/interviews.ts`, table `job_interview_sessions`), the routes, the entitlement resolution, the AI gateway (`interview.followup` rephrasing, `interview.feedback` coach note, sensitive routing, deterministic fallback), the code editor, the Mermaid whiteboard, the weakness → curriculum → plan loop, re-attempts and history are all the same system. The general AI rounds (`config.ts`, `InterviewSession.tsx`, `MockInterviewWorkspace.tsx`, `InterviewReport.tsx`) keep their engine and scorecard. What changed is *how the interviewer talks* and *how the room looks and sounds*.

## 2. Interview room

`src/components/interview/InterviewRoom.tsx` (shared by the job-specific and the general interview): header with a subtle interviewer presence (SVG mark, speaking / listening / thinking cues, reduced-motion safe), a role identity ("Technical Interviewer", "Engineering Interviewer", "Hiring Manager"; no invented employee of a real company, no persona names in the room), the stage ("Technical deep dive · Stage 4 of 7"), the clock, mute / captions / focus (full screen) / leave / end. Body: captioned current utterance (`#jiv-question-title`, aria-live), transcript, status line ("Interviewer speaking…", "Listening… pause for 4 seconds when you are done", "Processing response…", "Your turn") with the voice engine labelled honestly (Premium voice / Browser voice (fallback) / Voice off), "Repeat question" and "Ask for clarification", the composer (large microphone, textarea `#jiv-answer`, Send / Answer follow-up / Skip), and the coding or whiteboard workspace when the question needs it. During the interview there are no scores, hints, curriculum links, provenance chips, job navigation or hero (`JobDetail` hides them; `body.iv-focus` hides the sidebar and mobile nav; `beforeunload` warns). A refresh restores the session from the server at the same stage without re-speaking; "Repeat question" replays it.

## 3. Voice / TTS

`src/lib/server/tts.ts`: provider abstraction (`TtsAdapter`) with OpenAI speech (`OPENAI_TTS_API_KEY` or `OPENAI_API_KEY`, `gpt-4o-mini-tts` with a calm-interviewer instruction), Google Cloud TTS (`GOOGLE_TTS_API_KEY`, `en-IN-Neural2-*` Indian-English and neutral voices), ElevenLabs (`ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`) and a development-only silent-WAV fixture (`TTS_FIXTURE=1`, never in production). Admin policy (`platform_settings.voice`, `/admin/ai` → "Interviewer voice"): provider order, voice per provider, rate (default 0.95), locale (`en-IN`), silence thresholds (25 s / 60 s), end-of-speech pause (4 s), timeout, enabled; `voice_probe` synthesises the test line server-side. `GET /api/interviews/voice` = device / connection check; `POST` streams audio or returns `204`/`503` + `X-Voice-Fallback: browser` so the client falls back and never loses a turn. Rate-limited, entitlement-gated (`interview.voice`, `interview.premiumVoice`), text ≤ 1500 chars, keys never leave the server. Browser side (`src/lib/interview/voice.ts`): `createSpeaker` (server audio first, `speechSynthesis` fallback with a start watchdog, engine reported truthfully), per-device voice settings (voice, speed 0.8–1.2×, captions, auto-send, thresholds) in `localStorage`. **No production voice provider is configured in this environment**, so real provider audio was never produced or heard here (see NOT TESTED).

## 4. STT

`src/lib/interview/speech.ts`: Web Speech recognition with pause tolerance (restarts when the browser stops after silence, `no-speech`/`aborted` are not errors, transient network errors retried), a microphone probe separate from recognition (permission / device / policy messages), silence callbacks, end-of-answer detection (`answerLooksFinished`: only after speech, only after the configured pause) and `silenceNudgeLevel`. `useInterviewVoice.ts`: dictation fills the answer box live (editable; typing takes over and stops dictation), the answer is sent automatically after the pause with a visible 3-second "Sending in…" cancel window (or manually when auto-send is off), permission denial / unsupported browser / recognition failure surface as a dismissible message and text always works.

## 5. Voice provider actually tested

The fixture provider only (`TTS_FIXTURE=1`): synthesised server-side (`voice_probe`, device-check test line, every interviewer utterance during the e2e; `audio/wav`, `X-Voice-Provider: fixture`), streamed to the browser and handed to the audio element. OpenAI / Google / ElevenLabs adapters are implemented and unit-tested through scripted adapters (voice selection, rate clamping, 429, timeout, validation) but were **not** exercised against the real services and their output was **not** listened to. The UI never claims premium quality: without a configured provider the device check says the browser voice is a fallback.

## 6–7. Conversation, silence and clarification behaviour

`src/lib/interview/conversation.ts` (pure): realistic opening from the real configuration (first name only when it looks like a name; length; round list; "feel free to ask for clarification"; the intro question), neutral rotating acknowledgements ("Okay.", "I see.", "Alright.", "Understood."…) and section transitions ("Alright, let's switch to something else. Now some technical depth." / "We have about 12 minutes left, so let's move into the design discussion."), `isNeutral` guard (no praise, verdicts or teaching mid-interview), candidate intent classification (repeat / clarify / assumption / thinking / parameter questions such as "What consistency do you need?"), bounded clarification replies (design requirements revealed progressively: scale, latency, consistency, availability…; coding constraints; behavioural / resume clarifications), session memory ("Earlier you mentioned you worked with Java, Spring Boot and PostgreSQL." — only what the learner said, each fact used once, technical and behavioural questions only), silence nudges recorded as turns ("Take your time." → offer to repeat; bounded per question; thresholds configurable, 0 disables), follow-ups with a neutral lead ("Okay. Let's dig into that a little more. You mentioned Redis. What specifically makes Redis suitable here, compared with the alternative you did not choose?"). Every interviewer line is a stored turn, so the transcript and replay are complete.

## 8–10. Coding, design, behavioural

Coding: transition explains the format ("I'll describe a problem; ask anything you need to before you start, and walk me through your approach before you write code."), problem statements are spoken ("Here is the problem. …") and no longer list the expected concepts; complexity / edge-case / memory probes follow when code is shared. Design: short brief, requirements revealed on request, probes for missing components, trade-offs and 10× load. Behavioural: vague answers get "Can you give one concrete example…", "What did you personally do…", "What was the outcome…"; STAR is evaluated internally and never shown mid-interview.

## 11–13. Memory, timing, closing

Memory as above. Timing: `manageTime` drops later optional questions when the plan no longer fits, keeps one question per section and the wrap-up, tolerates a modest overrun before cutting an area, announces shortening, never cuts an answer; with a minute left it asks no more follow-ups and heads to the wrap-up; the client shows "Time is up. Finish your current answer" and, only if the learner is idle for 90 s, wraps up. Ending: "That covers everything I wanted to discuss. Before we wrap up, do you have any questions you would like to ask me?" → up to two candidate questions answered generally (no company facts; assessment declined until the end) → "Thanks for your time. We'll end the mock interview here. Your feedback is ready to review." → only then `complete` builds the report. "End interview" goes through the same wrap-up; `complete` on an unfinished session appends the farewell first.

## 14. Feedback and replay

`InterviewReportView`: overall summary, technical strengths / weaknesses, area table with previous-attempt comparison, communication, problem-solving, coding, system design, behavioural, resume / project discussion, missed concepts, strong and weak answers, question-level cards (question → your answer → what the interviewer was evaluating → what was demonstrated → what was missing → stronger reasoning approach → curriculum), replay timeline (`InterviewTimeline`: section offsets from stored turn timestamps, transcript per section incl. clarifications and spoken markers, per-section feedback; no audio is stored), weakness mapping + plan preview, practice again. No hiring probability or score.

## 15. AI fallback

The gateway is still only used to rephrase a follow-up (one call per turn) and write the coach note after completion. Any failure (policy off, 429, timeout, malformed) keeps the deterministic wording; the e2e switches the AI gateway off mid-interview through the admin API and the interview continues with deterministic follow-ups, then switches it back on and the next follow-up is AI-rephrased with the deterministic text kept alongside.

## 16. Measured turn latency (dev diagnostics, fixture voice and mocked recognition)

Per learner turn in the browser e2e: server processing 1–8 ms, AI rephrase (fixture) 0–3 ms, synthesis request → audio start 35–60 ms (fixture WAV), recognition finalisation ≈150 ms (mock), learner finished → interviewer audio starts ≈15 ms for typed answers and ≈480 ms for spoken answers (the 400 ms is the mock player). These prove the measurement path, not real-provider latency. Diagnostics are shown only in development (`.room-diag`) and returned by the turn route only outside production.

## 17. Browser E2E

`npm run test:e2e:interview` (`scripts/e2e-interview-room.mjs`, Chromium, fake microphone device, mock SpeechRecognition delivering the transcripts the test "speaks", Audio stub reporting playback of the real server audio; no localStorage seeding) → **All 12 interview room checks passed**: admin plan entitlements + voice probe + company/job → device check (test voice synthesised and played, microphone level meter, speech / service / AI rows) → start in voice → spoken opening (server-synthesised, played, then listening) → introduction dictated and auto-sent after the pause (stored as spoken) → refresh restores the stage without replaying, Repeat question spoken → resume discussion by voice → interviewer refers back to the introduction → AI off → weak "Because it is fast." → neutral deterministic probe → clarification (pending follow-up kept) → stronger answer → AI on → coding (verbal statement, editor) → design (requirements on request) → behavioural follow-up (AI-rephrased, deterministic text kept) → wrap-up → "How did I do?" declined → next steps answered generally → farewell → feedback (all sections, question evaluation, replay timeline with transcript and per-section feedback) → re-attempt with the voice provider failing (503) → browser fallback, leave → history shows Voice, refresh, report with replay persists → browser without speech APIs and denied microphone → text-only room → another (free) learner: 404 on session / turn / wrap-up, voice yes, premium voice 204 + fallback header, replay no, preview only; signed-out 401 → general mock round in the same room (role identity, AI interviewer, typed answer, repeat, end → feedback). Log: `scratch/e2e-interview-room.log`; screenshots `scratch/career-os/room-*.png`.

`npm run test:e2e:jobs` (updated for the room; runs in text mode so it stays deterministic without audio): **All 77 Career OS checks passed** (`scratch/e2e-jobs-room.log`; the interview block now also asserts the opening, the neutral follow-up lead, a mid-interview repeat request handled as a clarification, the two-step wrap-up with a general answer to a candidate question, the farewell, the stored turn kinds, replay timeline and evaluation cards). `npm run test:e2e:journey`: **All 11 learner journey checks passed** (`scratch/e2e-journey-room.log`; the free learner's preview runs through the device check and the room in text).

## 18. Accessibility / fallback

Text always available (composer, "Start in text only", room without a microphone button when recognition is unsupported); captions toggle with the words still in the transcript; aria-live caption and status; keyboard-operable controls with focus rings; reduced motion respected; silence thresholds and end-of-answer pause adjustable (0 disables nudges); a failed microphone or voice never blocks the interview; refresh recovery for both interview types.

## 19. Checks

```text
npx tsc --noEmit → exit 0 · npm run lint (eslint src) → exit 0 · eslint on the new scripts → exit 0
npm run test:interview:room → 14/14 (scripts/test-interview-room.mjs: opening; neutral interviewer; adaptive follow-ups incl. a scripted provider 429 → deterministic wording kept and hire-wording rejected by the validator; clarification / repeat / assumption / thinking with progressive design requirements and the three-per-question bound; silence nudges plus the pure end-of-answer and nudge helpers; session memory; time management incl. the pure helper; learner- and time-initiated wrap-up, feedback only after the farewell, complete appends a missing farewell; coding / design / behavioural transitions and follow-ups; resume grounding and provenance of every voiced question; refresh recovery, ownership and latency sanitising; entitlements; candidate-intent classifier; TTS abstraction: provider resolution, honest browser fallback, voice selection, 429, timeout, validation, fixture never in production)
npm run test:interviews → 9/9 (the Phase 6 suite, unchanged, against the upgraded engine)
npm run test:ai → 7/7 · test:billing:phase5 → 7/7 · test:security → 3/3 · test:monitoring → 1/1
npm run test:e2e:interview (BASE_URL=http://localhost:3001, AI_FIXTURE=1 TTS_FIXTURE=1) → All 12 interview room checks passed (scratch/e2e-interview-room.log)
npm run test:e2e:jobs → All 77 Career OS checks passed (scratch/e2e-jobs-room.log)
npm run test:e2e:journey → All 11 learner journey checks passed (scratch/e2e-journey-room.log)
next build (webpack, in an isolated worktree copy of the working tree with a node_modules junction; Turbopack refuses the junction) → exit 0, Compiled successfully, type check passed (scratch/next-build-p10-webpack.log)
```
The jobs and journey suites last ran before two final edits (hiding the job side column / footer while the room is live, and moving `VOICE_TEST_LINE` out of the route file for the build); the room suite was re-run after them.

## 20. NOT TESTED

- Real voice providers (OpenAI, Google, ElevenLabs): no keys here; adapters tested only with scripted responses; **no human has listened to any premium voice from this build**; the browser voice quality was not reviewed either (headless run).
- Real Web Speech recognition (Chrome's cloud recogniser): the e2e uses a mock recogniser; pause tolerance and restarts are unit-tested on the pure helpers and by code review only.
- Real AI providers: the fixture adapter stood in for Gemini/Groq/etc.; the 429 path was exercised through the gateway with a scripted provider and through the admin "gateway off" switch, not a real 429.
- Mobile layout of the room and the general InterviewReport scorecard against real AI output.
- `npm run build` was run in an isolated worktree copy (see 19) because another session serves `next start` from this tree's `.next`.

## 21. Remaining risks

- The general mock round still ends with the legacy AI scorecard (overall score and a "Hire / No hire" verdict); the job-specific debrief has neither. Aligning the general scorecard with the evidence-based style is a follow-up.
- Follow-up wording combines a neutral lead with the AI rephrasing; if a provider starts its rephrase with its own acknowledgement the two stack ("Okay. Let's explore that. Thanks, that helps. …") as the fixture shows.
- Time management estimates from planned minutes per question; 30-minute plans with coding and design are already over budget on paper, so shortening kicks in early by design.
- `manageTime` tolerates a 35 % overrun to keep one question per area; the room wraps up idle learners 90 s after time is up, so long interviews can run a few minutes over.
- Browser `speechSynthesis` quality varies by device and is reported as a fallback; premium quality depends on the operator configuring a provider and listening to it before enabling `interview.premiumVoice` for a plan.
- The other session's uncommitted edits in the same tree were left alone; a shared commit will need coordination.

# Phase 9 — controlled production launch: PREFLIGHT ONLY, STOPPED — 2026-09-25 IST

No production mutation was performed (no deploy, no migration, no Vercel or DNS change, no charge, no email, no cron). `docs/production-preflight.md` holds the checklist, the documented launch sequence and the beta monitoring plan. **Critical blockers**: no backup / migration approval yet, production environment variables and secrets unverifiable from here, Razorpay / mailer / cron / AI keys not configured, no privacy or terms pages, final pricing not entered, no external monitoring. The hosted database is untouched (read-only check: ledger 5, users 7, no Career OS tables).

# Phase 8 — product polish, onboarding and Career Command Center — 2026-09-25 IST

## What was built

- **Onboarding** (`src/components/onboarding/OnboardingFlow.tsx`): welcome → career target → experience → skills → resume → location → India/international → remote preference → learning availability → curriculum recommendation → job preferences → Career Command Center; optional steps skip; "Skip setup for now" on the welcome step. The career target maps to a career path whose tracks become a real `Goal` (90 days, learner's hours/day, weekends optional) with a roadmap from the existing `generateRoadmap`; the resume uses the existing upload API; job preferences use `PUT /api/jobs/preferences`. State lives in `preferences.onboarding` inside the synced Storage document (survives refresh, sign-out and new devices; new accounts see the flow once; the Command Center offers "Finish setting up" after a skip).
- **Career Command Center** (`src/CommandCenter.tsx`, view `home`, one server request `GET /api/dashboard` → `src/lib/server/dashboard.ts`): career goal (tasks completed / total, progress bar), curriculum progress (topics mastered), today's learning, revision due, recommended jobs (ranked by preferences, with reasons), recently verified jobs, applications (active / total / offers), interviews (stages + upcoming rounds), follow-ups due (tracker + outreach), job preparation (tasks on calendar, items prepared), weak areas (latest job interview), mock interview progress, networking (contacts / contacted), upcoming tasks, profile and plan (resume, preferences, plan, "See plans" for free accounts). Every card links to the real feature; skeleton while loading; empty states with the next action; reduced-motion respected; no invented numbers.
- **Navigation**: "Command Center" is the first item under Career Plan and the mobile Home group; signed-in learners land there once per session; guests keep the Today view. `home` is a free view (no paywall). The previous "Choose your plan" landing for free accounts is gone: free learners start on the Command Center and meet the paywall only on paid views (roadmap, matching…), which now links to `/pricing`.
- **UI/UX audit (targeted)**: consistent card language across Command Center, onboarding, interview and admin surfaces; visible focus rings on the new controls; loading skeletons and empty states; keyboard-operable buttons/labels (`aria-pressed`, groups, regions used by the suites); mobile navigation covers Home. Not done: a full visual audit of every legacy view (DSA, labs, system design, Settings) which another session is actively redesigning; remaining duplicate entry points (Dashboard vs Applications vs Kanban under Job Tracker) are left as they are.
- **Performance findings**: the dashboard is one request (no waterfall); Command Center and onboarding are lazy-loaded. Measured on the production build: total client chunks 15.9 MB, the largest chunk 5.0 MB is the built-in curriculum content (`src/data/curriculum`) shipped to the browser through the registry; second largest 1.4 MB includes Mermaid. Recommended fix (not done, cross-cutting): serve curriculum tracks from the API / split the library per track and load on demand. No correctness was traded for size.
- **Regression scripts adapted** to the tabbed Settings redesign from the other session (`scripts/e2e.mjs`: "Your Data & Vault" tab, renamed export/clear buttons) and to the new landing (`scripts/e2e-jobs.mjs`: `dismissOnboarding`, Command Center plan card to `/pricing`).

## Test evidence (2026-09-25 after the last code change)

```text
npm run test:e2e:journey → All 11 learner journey checks passed (scratch/e2e-journey.log): admin seeds a job → new learner sign-up → full onboarding (goal + roadmap, preferences, resume) → Command Center → roadmap paywall → pricing → test upgrade → complete a concept → discover the ranked job → match, resume/JD analysis, gaps, strategy, drafts → Prepare + 14-day plan (64 tasks) → Knowledge Workspace → job mock interview → feedback, weakness mapping, plan preview → tracker → refresh → sign out / sign in restores goal, tasks, application, onboarding state, Pro plan and interview history; FREE learner: onboarding with skips, free Command Center, locked match/resume, summary-only preview interview, tracker, pricing
npm run test:e2e:jobs    → All 77 Career OS checks passed (scratch/e2e-jobs-p8.log)
npm run test:e2e         → All end-to-end checks passed (scratch/e2e-tracker-p8.log)
npx tsc --noEmit → 0 · npx eslint src scripts/... → 0 · npm run build → 0 (scratch/next-build-p8.log)
```

## Flaky / failing notes

- Two browser runs failed transiently while the other session's in-progress edits to `SettingsWorkspace.tsx` did not parse (the app returned 500); reruns passed. Its redesign also renamed and moved the backup controls; the tracker regression was adapted rather than reverted.

# Phase 7 — staging and production readiness — 2026-09-25 IST

NO production deployment. The hosted Tiger Cloud database was inspected read-only before and after the rehearsal (ledger 5 rows, 7 users, 30 public tables, no Career OS tables) and never written to.

## What was done

- **Automatic migrations on deploy removed**: `vercel-build` is `next build`. `scripts/migrate-production.mjs` now has `--preflight` (read-only: ledger vs journal, pending files, destructive-statement scan, unknown/out-of-order/hash checks; exit 2 when blocked) and requires a double approval (`MIGRATE_PRODUCTION_APPROVED=HOST:PORT/DB` **and** `--approve=HOST:PORT/DB` naming the exact target; exit 3 otherwise, no connection opened). Shared logic in `scripts/lib/migration-preflight.mjs`; `npm run db:preflight:production` / `db:migrate:production`. Loopback staging copies may use `?sslmode=disable`; hosted targets keep TLS.
- **Staging copy** (`jobappy_staging` on the local PostgreSQL): reset to the hosted state (0000–0004), then preflight → refusal without approval → approved migration (5 → 13) → preflight "up to date". `docs/staging-runbook.md` documents the procedure for a hosted staging environment.
- **Production build and server**: `next build` exit 0; `next start -p 3100` against the staging copy with `DATABASE_URL` set explicitly (the checkout's `.env.local` points at the hosted database and would otherwise be loaded by a production start). Smoke routes: `/`, `/app`, `/pricing`, `/api/platform/config`, `/api/billing/plans`, `/api/jobs` → 200; `/admin` → 404; `/api/cron/*` → 404. `next start` warns about `output: 'standalone'` (self-hosting uses `node .next/standalone/server.js`; Vercel is unaffected).
- **Staging switch** `APP_STAGE=staging` (`src/lib/server/stage.ts`): re-enables the ingestion, billing and AI fixtures on a production build for the full suite; `/admin/launch` shows the stage as Degraded while set; never set on production.
- **Rate limiting** (`src/lib/server/rateLimit.ts`, best effort per instance): AI chat 30/min per learner, checkout 10/min, verification resend 5/10 min per IP, resume upload 10/min per learner; 429 with `retry-after`, logged as `security.rate_limited`.
- **Security review**: secrets scan of tracked files clean; `.env*` ignored; parameterised routes all guarded except the Auth.js handler, the signature-verified webhook receiver and the public LeetCode proxy; cross-account 404s covered by e2e. Findings and remaining risks are in `docs/launch-readiness.md` §1b.

## Test evidence (2026-09-25)

```text
npm run test:migration-workflow → 2/2 (approval gate refusals without connecting; preflight on hosted-like DB: 8 pending, none destructive; up to date after migrate; unknown ledger row blocks)
npm run test:security           → 2/2 (rate-limit window, retry-after, per-user/per-IP keys; cron bearer auth)
test:catalog 3/3 · test:ai 7/7 · test:billing:phase5 7/7 · test:ingestion 11/11 · test:migrations:dev 5/5 (13-row ledger)
npx tsc --noEmit → 0 · npx eslint src scripts/... → 0 · npm run build → 0 (scratch/next-build-p7.log)
Migration rehearsal on staging: preflight exit 0 (8 pending) · unapproved run exit 3 · approved run applied 8 · preflight "up to date"
Staging E2E (production build, APP_STAGE=staging, AI_FIXTURE=1): All 77 Career OS checks passed (scratch/e2e-staging.log)
Staging E2E on plain production configuration (no fixtures): first 10 checks passed, then the fixture-dependent admin ingestion step could not run (expected; fixture providers are disabled in production)
Hosted database read-only check after the rehearsal: ledger 5, users 7, Career OS tables 0
```

## Blockers before production (from docs/launch-readiness.md)

Backup and approval of the migration run; production environment variables; Razorpay, mailer, cron and AI keys are not configured; admin must edit plans, seed the catalog and schedule sources after the first deploy; no external monitoring/alerting.

# Company source catalog — 2026-09-25 IST

Builds on Phase 6.5 below. Local development database only (migration `0012`); nothing deployed.

## What was built

- **Catalog data** `src/data/companyCatalog.ts`: 60 curated product/technology companies relevant to Indian software, data, AI and cloud careers, each with canonical name and slug, official website and careers URL, headquarters and India presence, industry, India relevance (strong / moderate / international), supported role families (taxonomy ids) and provenance `company-catalog-2026-09`. A `feed` is present only where a public, documented job-board API (Greenhouse, Lever, Ashby) answered a read-only probe on 2026-09-25 **and** the postings were checked to belong to that company: 19 companies (Stripe, Datadog, Cloudflare, MongoDB, Confluent, Snowflake, Elastic, GitLab, Twilio, Okta, Rubrik, Druva, InMobi, Paytm, Meesho, Freshworks, CRED, Groww, Mindtickle). The public Greenhouse board named "clear" belongs to CLEAR (US) and was deliberately not linked to ClearTax. The other 41 (Microsoft, Google, Amazon, Adobe, Atlassian, Salesforce, Oracle, SAP, ServiceNow, Intuit, Cisco, NVIDIA, AMD, Qualcomm, Uber, Walmart Global Tech, PayPal, Autodesk, Palo Alto Networks, Booking.com, Expedia, Flipkart, PhonePe, Razorpay, Swiggy, Zomato, Zoho, BrowserStack, Postman, Chargebee, Whatfix, Hasura, Dream11, Myntra, Zerodha, Juspay, Clear, Darwinbox, ShareChat, Ola, MakeMyTrip) are stored as **Not configured** / Unsupported with the official careers link only. Nothing is scraped; no anti-bot bypass; no LinkedIn or Google Jobs; no third-party copies; no fabricated openings.
- **Schema** (`0012_career_os_catalog.sql`, additive): `companies.catalogSlug / indiaRelevance / roleFamilies / provenance`, `job_sources.catalogPortal / verificationStatus / verifiedAt / verificationNote / lastVerifiedJobCount`.
- **Service** `src/lib/server/catalog.ts`: idempotent `seedCatalog` (upserts companies and `catalog-<slug>` sources; keeps admin decisions such as paused / not allowed; audited), read-only `verifyCatalogFeeds` (one GET per feed against the official API; records 200 / 404 / timeout; never ingests), `ingestCatalog` (existing scheduler-safe engine; only verified, allowed sources), `scheduleCatalog` (explicit opt-in to the scheduled pass; seeding never schedules by itself), `catalogStatus` with derived statuses Configured / Healthy / Degraded / Unsupported / Not configured.
- **Admin** `/admin/catalog` (+ `/api/admin/catalog`): counts, filter by status, official careers link per company, feed and verification details, last run, live jobs, role families, Seed / Verify (read-only) / Run verified / Schedule all / Unschedule; per-company Verify and Run. Learner Job Discovery is unchanged: only normalised, relevant, published listings appear; role-family relevance is applied by the ingestion engine.

## Live evidence (local database, 2026-09-25)

```text
npm run test:catalog → 3/3 (data integrity incl. 50–60 size, official links, valid role families, feeds only with verification evidence, "clear" exclusion; idempotent seeding, Not configured for portals, admin decisions kept, schedule opt-in round trip; read-only verification with 200/404/timeout and Healthy/Degraded/Configured derivation)
scratch/run-catalog-ingest.mjs (real network, local DB): verify 19/19 feeds answered; ingest 19/19 sources success
  stripe 692 fetched / 546 irrelevant · datadog 449 / 398 · cloudflare 391 / 210 · mongodb 401 / 281 · confluent 20 / 9 · snowflake 351 / 256 · elastic 385 / 204 · gitlab 201 / 125 · twilio 136 / 103 · okta 330 / 202 · rubrik 141 / 119 · druva 35 / 24 · inmobi 70 / 56 · paytm 174 / 165 · meesho 54 / 47 · freshworks 0 / 0 (feed empty) · cred 12 / 12 · groww 7 / 7 · mindtickle 18 / 11
  status counts: Healthy 19 · Unsupported 41 · live published jobs across catalog companies: 940 (non-engineering postings such as HR, sales, finance and support were dropped as irrelevant)
```

Browser e2e: admin seeds the catalog from `/admin/catalog`, sees 60 companies with 19 verified feeds and 41 unsupported portals, manual portals are never ingestion-allowed, seeding never schedules sources, a live read-only verification and a live ingestion of the Groww board succeed with every fetched posting dropped as irrelevant (no engineering roles listed at the time), scheduling round-trips per source, and learners get 403.

## Notes

- Verified feeds are not added to the scheduled pass automatically; an admin clicks "Schedule all verified" (the first scheduled pass then fetches ~3,500 postings across 19 boards, a few minutes).
- Careers URLs are catalog-provided official pages; they were not machine-verified (many careers sites block automated requests), so a broken link is a data fix, not an ingestion issue.

# Career OS Phase 6.5 (AI provider gateway) — 2026-09-25 IST

Builds on Phases 1–6 below. Nothing deployed; hosted database untouched; no production AI keys exist in this environment, so real providers are **NOT TESTED** (fixture provider only). All work on the local Docker database (migrations through `0011`).

## What was built

- **One server-side gateway** (`src/lib/ai/`): `types.ts` (features, request/result, error kinds), `adapters.ts` (Gemini `generateContent` with system instruction / model roles / JSON mime type; OpenAI-compatible adapters for Groq, Mistral, OpenRouter and OpenAI; a deterministic, feature-aware fixture enabled only by `AI_FIXTURE=1` outside production), `policy.ts` (admin document: enabled, provider order, per-feature enabled/providers/models, timeout, retries, daily calls per learner, sensitive-provider allow-list), `gateway.ts` (candidate resolution → timeout per attempt → retry with backoff or retry-after on rate limit / server / timeout / network / malformed → provider fallback → JSON extraction + validation with one "reply with JSON" nudge → usage accounting → error ids), `validators.ts` (AI output must not contradict the deterministic facts: no hiring claims, placeholders kept, no invented numbers or relationships, insights must name a known skill or project).
- **Server binding** `src/lib/server/ai.ts`: policy in `platform_settings.ai`, usage log `ai_usage_log` (migration `0011`; metadata only, never prompt or completion text; `userId` set null on account deletion), provider health from the last 24 h, usage by feature, recent failures, `runAi` (learner's own encrypted key first when policy allows).
- **Data handling**: features flagged sensitive (interview follow-up/feedback, resume insights, strategy narrative, draft refinement) are sent to exactly one provider (learner's own key, else the first allow-listed configured provider) and never fall back across providers; structured facts are sent, never the resume text; sending them as "normal" is rejected by policy.
- **Integrations with deterministic fallback**: `/api/ai/chat` (tutor, lessons, general mock rounds) now routes through the gateway; job-interview follow-ups keep their deterministic intent and wording (`deterministicText`) and may be rephrased (`aiRefined`); completed interview reports may carry an `aiSummary` coach note; resume analyses store `aiInsights`; the strategy route returns a `narrative`; the first two outreach drafts get a `refined` variant. Every AI note is labelled with its provider in the UI and the deterministic output is always present.
- **Admin**: `/admin/ai` (provider health, usage by feature, recent failures with error ids, policy editor, "Send test prompt" probe that targets exactly one provider; audited as `ai.probe` / `settings.ai`), `/api/admin/ai`, AI row on `/admin/launch`. Learner keys now accept Groq, OpenAI, Gemini, Mistral and OpenRouter.

## Test evidence (run 2026-09-25 after the last code change)

```text
npm run test:ai             → 7/7 (server failure → retry → fallback with attempts and accounting; timeout abort → fallback; rate limit honours retry-after; auth skips retry; all-fail → error id; malformed JSON nudge + validation + cross-provider fallback; sensitive = single provider, allow-list, own key, policy rejection; gateway/feature off, daily cap, not configured, own key first, per-feature provider and model overrides, policy normalisation; Gemini and OpenAI-compatible request shapes and error classification without network; validators)
npm run test:migrations:dev → 5/5 (0000–0011; ai_usage_log FK set-null, no content columns)
test:interviews 9/9 · test:billing:phase5 7/7 · test:jobs:domain 11/11 · test:ingestion 11/11 · test:matching 5/5 · test:scheduler 4/4 · test:resume 4/4 + 2/2 · test:phase4 11/11
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build → exit 0 (scratch/next-build-p65.log)
npm run test:e2e:jobs (dev server with AI_FIXTURE=1) → All 76 Career OS Phase 1–6.5 checks passed (scratch/e2e-jobs-p65.log)
```

Browser evidence: admin `/admin/ai` lists Gemini/Groq/Mistral/OpenRouter/OpenAI as Not configured and the fixture as configured, the payload contains no keys, the fixture probe succeeds and a probe of an unconfigured provider fails with an error id, policy edits are audited, learners get 403 on the admin API; learner chat answers through the gateway with a usage row; interview follow-ups are rephrased by the fixture while the deterministic wording is stored; the report carries a labelled coach note; resume analysis stores labelled insights referencing only known skills; the strategy shows labelled guidance; drafts show an AI-polished variant with the same facts and placeholders.

## NOT TESTED

- Real Gemini, Groq, Mistral, OpenRouter or OpenAI calls (no credentials here). Adapters are exercised only with scripted responses.

# Career OS Phase 6 (job-specific mock interview intelligence) — 2026-09-25 IST

Builds on Phases 1–5 below. Nothing deployed; hosted Tiger Cloud database untouched; no production billing, cron or email configured; all work on the local Docker database `127.0.0.1:55432/jobappy_dev` (migrations through `0010`). Unrelated working-tree edits from another session were left untouched. Architecture: `docs/career-os-architecture.md` (section 7c added, phase 6 listed). Runbook and readiness report updated for migration `0010`.

## Existing mock system reused (no second system)

The existing AI mock rounds (`src/lib/interview/config.ts`, `InterviewSession.tsx`, `InterviewReport.tsx`, `MockInterviewWorkspace.tsx`) are unchanged and still serve general practice. Phase 6 adds a job-specific mode that reuses: the round vocabulary (coding/design/behavioural briefs and dimensions), the code editor (`AlgoEditor`) and Mermaid editor, the `iv-*` interview CSS (header, timer, tabs), the curriculum registry and quiz bank, the resume profile and analysis, the preparation blueprint, `TopicPointer` resolution, the Knowledge Workspace deep link, and the roadmap plan engine (`buildPreparationPlan` → `fillRoadmap`). The general Mock Interview workspace lists job-specific attempts and links back to the job.

## What was built

- **Engine** `src/lib/interview/jobInterview.ts` (pure, no AI): interview context (job snapshot, resume projects/bullets, skill evidence, compatibility summary, blueprint depths and items, curriculum progress, gaps) → derived configuration (difficulty/depth from level; coding only when DSA depth ≠ none; design only at the level's depth) → composition (intro → resume → fundamentals → technical → coding → design → behavioural → wrap-up by focus weights inside the time budget; preview = 3 questions; section / weak-areas / missed-concepts modes; seeded rotation with `excludeKeys` across attempts). Question provenance: `curriculum` (quiz questions; key terms of the reference answer are the expected concepts), `job`, `resume` (only names/lines present in the stored profile), `generated` ("Recommended practice based on this role"). Answer analysis (concepts hit/missed, example, trade-off, STAR structure, complexity, edge cases, dry run, code/diagram, gave up) and rule-based follow-ups (clarify, simplify, example, probe missed concept, trade-off, challenge) bounded per question (0 preview / 1 standard / 2 advanced). Report: strong areas, needs improvement, missed concepts, communication, coding, system design, behavioural, question-level feedback (question → answer → evidence → strength → weakness → better approach → related curriculum), weaknesses merged by topic, per-area `demonstrated/total` metrics; `compareAttempts`, `interviewReadiness`. No score, verdict or hiring probability anywhere.
- **Sessions** `src/lib/server/interviews.ts` + table `job_interview_sessions` (`0010_career_os_phase6.sql`, journal ts 1790300000007): config, context snapshot, plan, turns with evidence, cursor state, entitlements at start, report, plan-added marker; `jobId` `SET NULL` on job deletion with the job snapshot kept; cascade with the user; every read/write scoped by `userId`. Routes: `GET/POST /api/jobs/[id]/interviews` (history, `derive`, `start` with daily and monthly limits; free plan downgraded to preview), `GET/POST /api/interviews/[id]` (session, `turn`, `complete`, `abandon`, `plan_added`; 404 for non-owners, logged `security.interview_ownership`), `GET /api/interviews`.
- **UI**: job workspace tab **Mock interview** and Overview CTA "Mock Interview for This Job" (`src/components/jobs/InterviewTab.tsx`: derived configuration with rationale and structure, editable duration/focus/difficulty/depth/coding/design/behavioural, limits, history table with factual columns, re-attempt banner; `InterviewSessionView.tsx`: section, question, provenance chip, progress, time left, text / code editor / diagram answer, skip, end, leave; resumes after refresh from the server; no feedback during the interview; `InterviewReportView.tsx`: evidence-based report, comparison with the previous attempt, weaknesses mapped to curriculum with Open, "Add weaknesses to learning plan" preview → confirm on the existing roadmap, Practice again: full / weak areas / missed concepts / one section). Readiness (`computeReadiness`) gained factual interview areas: mock interview completed, technical areas demonstrated, weak areas remaining (re-attempt recommended).
- **Entitlements** (centralised, admin-editable in `/admin/plans`): features `interview.jobPreview` (free), `interview.jobFull`, `interview.adaptive`, `interview.coding`, `interview.systemDesign`, `interview.feedbackDetailed`, `interview.curriculumMapping`, `interview.reattempt`, `interview.history`; limits `interviewsPerDay`, `interviewsPerMonth`, `interviewMaxMinutes` (free 1 / 3 / 15, pro 10 / 120 / 60). Stored paid-plan rows predate the new keys: missing limits now fall back to pro defaults for non-default plans; features must be ticked by an admin (the e2e does this through the admin API).

## Test evidence (run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev → 5/5 (0000–0010 fresh and upgrade; job_interview_sessions FKs: user cascade, job set-null; no destructive statements)
npm run test:interviews     → 9/9 (role/seniority composition incl. analyst, entry, lead, frontend; provenance + resume grounding + no fabrication; evidence analysis and bounded follow-ups; session persistence, follow-up loop, termination, report immutability; coding/design inclusion and entitlement clamps; preview entitlement; re-attempts (rotation, weak areas, section, missed concepts), history, comparison, readiness; weakness → curriculum mapping and duplicate-free planning; ownership, job removal, user cascade)
test:billing:phase5 7/7 · test:billing · test:jobs:domain 11/11 · test:ingestion 11/11 · test:matching 5/5 (expectation updated for the new default limit keys) · test:scheduler 4/4 · test:resume 4/4 + 2/2 · test:phase4 11/11 · test:curriculum · test:learning:domain · test:merge · test:verification → all passed
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build → exit 0 (log scratch/next-build-p6.log; dev server stopped for the build and restarted, pid in scratch/local-dev.pid)
npm run test:e2e:jobs → All 75 Career OS Phase 1–6 checks passed (log scratch/e2e-jobs-p6.log)
npm run test:e2e → All end-to-end checks passed on the second run; the first run right after the server restart timed out during Next's cold compile (see Flaky)
```

Required browser flow (Chromium, synthetic accounts, no localStorage pre-seeding): paid learner → Backend Engineer II → "Mock Interview for This Job" → derived configuration (standard difficulty, coding at standard depth, design at basics depth, project questions only from the resume: Inventory Tracker; structure list) → duration 30 → start → answers through the UI section by section (intro, resume, fundamentals, technical with a deliberately thin answer → follow-up asserted → coding explanation → design explanation → behavioural STAR → wrap-up) → report (communication, coding, system design, behavioural, question-level feedback with evidence and better approach; DB: evidence stored per turn, provenance ⊂ {curriculum, job, resume, generated}, no hiring language) → weaknesses mapped to track → topic → "Preview weakness plan" → the weakness topics were already scheduled by the Phase 4 plan, so the preview reported them as already on the calendar and the confirm button stayed disabled (duplicate prevention; the add path with a growing roadmap is covered by `test:interviews`) → Open topic → exact Knowledge Workspace → back → history row → refresh → history and report persist → readiness shows interview facts → "Weak areas only" re-attempt (rotated questions, parent linked) → answer → refresh mid-interview resumes at question 2 → Leave (abandoned, both attempts kept). Also: another learner gets 404 on the session and on posting a turn and sees no history; admin expires the job → learner still reads the session and history; free learner (buyer before upgrade) sees "Start preview interview", the API downgrades a full request to a 3-question preview with no follow-ups or coding, the report is summary-only, and re-attempts / limits are refused. Screenshots: `scratch/career-os/learner-interview-setup.png`, `learner-interview-report.png`.

## Flaky / failing tests

- `npm run test:e2e` (tracker regression) timed out once immediately after the dev-server restart while Next compiled routes on first request; the rerun passed. No code change involved.
- The e2e "Add weaknesses to learning plan" step has two branches; this run took the "already scheduled" branch (see above).

## NOT TESTED

- AI-assisted interviewer for job sessions (not built; the engine is deterministic by design).
- Executing learner code inside the interview evaluation (the editor's own runner is available to the learner, but the report judges correctness from the described dry run and says so).
- Voice input in the job-specific session.

# Career OS Phase 5 (plans, subscriptions, billing, production readiness) — 2026-09-25 IST

Builds on Phases 1–4 below. Nothing deployed; hosted Tiger Cloud database untouched (read-only inspection only); no production cron, no real charges, no production email. All work on the local Docker database `127.0.0.1:55432/jobappy_dev` (migrations through `0009`). Unrelated working-tree edits from another session (DSA, labs, system design, GoalManager, MobileNav, Sidebar, seeds) were left untouched. Readiness report: `docs/launch-readiness.md`. Migration runbook: `docs/production-migration-runbook.md`. Ingestion operations: `docs/ingestion-operations.md`. Architecture: `docs/career-os-architecture.md` (section 9 rewritten, phase 5 added).

## What was built

- **Admin-managed plans** (`billing_plans`, `src/lib/server/plans.ts`, `/admin/plans`, `GET/POST /api/admin/plans`, `PUT /api/admin/plans/[id]`): name, display name, description, monthly/annual price (minor units), currency, active, default, highlighted, order, feature entitlements (checkboxes over `FEATURES`), every `LIMIT_KEYS` limit, trial days, Razorpay plan ids. Seeded FREE / PRO development fixtures (not final pricing). Plans are deactivated, never deleted. Edits audited (`plan.create`, `plan.update`).
- **Single entitlement resolution** (`resolvePlanForUser` in `src/lib/server/subscriptions.ts`): allowlist → verified subscription → legacy one-time pass → default plan. `platformConfigFor`, `resolveAccess`, `/api/platform/config` and the legacy `getEntitlement` all read it; the admin settings route no longer accepts `limits` / `entitlements`; the last UI plan-name check (`tier === 'free'`) became a feature check.
- **Billing provider abstraction** (`src/lib/billing/providers/`): `razorpay` (Razorpay Subscriptions: create subscription, cancel at cycle end, HMAC checkout + webhook verification, event normalisation) and `fixture` (deterministic, HMAC-signed, disabled in production). Activation happens only through a signature-verified webhook (or the verified Razorpay checkout handler owned by the caller).
- **Subscription lifecycle** (`billing_subscriptions`, statuses pending / trialing / active / past_due / cancel_at_period_end / cancelled / expired; `grantsAccess` with 7-day past-due grace; `expireLapsed` sweep) and **webhook ledger** (`billing_events`, unique provider + event id, recorded before applying, failures kept with error).
- **Learner surfaces**: `/pricing` (`src/app/pricing`, `src/components/billing/PricingView.tsx`), Settings → Billing (`BillingPanel`: plan, cycle, status, renewal date, usage meters from `GET /api/billing/usage`, cancel renewal, "Delete my Career OS data"), paywall links to `/pricing` (legacy pass cards kept in a collapsed section). APIs: `GET /api/billing/plans`, `POST /api/billing/checkout`, `POST /api/billing/checkout/verify`, `GET/POST /api/billing/subscription`, `POST /api/billing/webhooks/[provider]`, `POST /api/billing/fixture/complete` (dev only).
- **Admin**: `/admin/subscriptions` (read-only, filter by status), `/admin/billing` (provider, 7-day webhook counts, failed events), `/admin/launch` (live Healthy / Degraded / Not configured / Unknown checks in `src/lib/server/health.ts`).
- **Production readiness**: `cronAuthorized` (constant-time bearer check, 404 when unset) on `/api/cron/ingestion` and new `/api/cron/reminders`; provider fetch timeout `INGESTION_FETCH_TIMEOUT_MS`; structured JSON logging with redaction and error ids (`src/lib/server/log.ts`) wired into unhandled API errors (`ref E-…` returned), RBAC denials, admin page denials, scheduler failures, webhook rejections; notification foundation (`src/lib/server/notifications.ts`, `notification_log`, existing mailer, sends only when configured); `deleteLearnerCareerData` + `DELETE /api/account/career-data`; `ResumeStore` abstraction (`src/lib/resume/storage.ts`, database default, object stub that refuses unconfigured).
- **Schema** (`0009_career_os_phase5.sql`, journal ts 1790300000006): `billing_plans`, `billing_subscriptions`, `billing_events`, `notification_log`.
- `.env.example` documents `BILLING_FIXTURE_SECRET`, `RESUME_STORE`, `INGESTION_FETCH_TIMEOUT_MS`, the subscription webhook and reminders cron.

## Test evidence (run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev → 5/5 (0000–0009 fresh and upgrade; Phase 5 tables, uniques, FKs; no destructive statements in 0005–0009)
npm run test:billing:phase5 → 7/7 (plan validation; entitlement resolution; webhook signature/idempotency/duplicates; lifecycle incl. failed payment, renewal, cancel, expiry; checkout auth + token forgery/cross-account; Razorpay signatures + normalisation; cron auth + log redaction)
test:billing (legacy), test:jobs:domain 11/11, test:ingestion 11/11, test:matching 5/5, test:scheduler 4/4, test:resume 4/4 + 2/2, test:phase4 11/11, test:curriculum, test:learning:domain, test:merge, test:verification → all passed
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build → exit 0 (log scratch/next-build-p5.log; dev server stopped for the build and restarted, pid in scratch/local-dev.pid)
npm run test:e2e:jobs → All 67 Career OS Phase 1–5 checks passed (log scratch/e2e-jobs-p5.log)
npm run test:e2e → All end-to-end checks passed (existing tracker regression)
```

Required browser flow (Chromium, synthetic accounts): free learner → paywall → `/pricing` (toggle, cards, current plan, test-mode notice) → failed test payment (recorded, nothing unlocked) → successful test checkout (server-verified fixture webhook → `active`) → premium unlocked in `/app` → refresh persists → Settings → Billing usage `1 / 100` → cancel renewal (`cancel_at_period_end`, access kept) → another learner 404 on the record and isolated history → non-admin 404/403 on billing admin → admin edits Prep Pro entitlements in `/admin/plans` and the learner's gates follow live (then restored, audited) → admin subscriptions / billing status / launch readiness render → forged webhook 400, cron 404 → learner deletes their Career OS data. Screenshots: `scratch/career-os/pricing-free.png`, `settings-billing.png`, `admin-plans.png`, `admin-launch.png`.

## Bugs found and fixed while testing

- Cross-account cancel renewal answered 400 (validation) instead of 404; the route now checks ownership first and logs `security.billing_ownership`.
- Existing e2e limit steps posted `limits` to `/api/admin/settings`; they now `PUT /api/admin/plans/<id>`.

## NOT TESTED / NOT CONFIGURED

- Razorpay Subscriptions against a real (test-mode) account: no keys locally; adapter unit-tested only. Steps in `docs/launch-readiness.md` §3.
- Object resume storage (stub), production cron, production email delivery, production migrations (runbook only).

# Career OS Phase 4 (networking & referrals, prepare for this job) — 2026-09-25 IST

Builds on Phases 1–3 below. Nothing deployed; hosted database untouched; no production cron configured; all work on the local Docker database `127.0.0.1:55432/jobappy_dev`. Unrelated working-tree edits from another session were left untouched. Architecture: `docs/career-os-architecture.md` (section 7b added).

## What was built

- **Networking & Referrals tab** (`src/components/jobs/NetworkingTab.tsx`, `src/lib/jobs/networking.ts`): contact *categories* with why/how (recruiter, engineer in domain, senior engineer, engineering manager, hiring manager only when identifiable, alumni/mutual connections, peers); copyable LinkedIn people-search queries with an "Open" link (company + role / recruiter / manager + domain / required skill / learner institution and previous employer from the resume); message drafts (connection, recruiter free; referral, hiring-manager, follow-up, thank-you paid) generated server-side (`POST /api/jobs/[id]/drafts`) from a `DraftGrounding` built only from the resume profile and stored resume analysis, contact name always `[Name]`, every fact used listed with its source. No scraping, no sending, no automation.
- **Outreach log** (`outreach_contacts`, `/api/jobs/[id]/outreach*`, feature `jobs.outreachTracker`): learner-entered name, role, type, profile URL, message type, date contacted, nine statuses, follow-up date, notes and saved draft, attached to the job; owner-scoped.
- **Prepare for This Job** (`src/components/jobs/PrepareTab.tsx`, `src/lib/jobs/prepare.ts`): CTA on the Overview tab; deterministic blueprint with Must prepare / Revise / Already strong, DSA depth (none/core/standard/advanced by role and level), framework & language items, CS fundamentals by role family, system design depth (never assumed for entry level unless the listing mentions it), projects only from the resume, behavioural areas grounded in resume bullets; every curriculum item is a `TopicPointer` (track → topic → first concept) resolved through the registry and "Open" launches the existing Knowledge Workspace; job-specific interview kit labelled "Recommended practice based on this role" (curriculum quiz questions or generated prompts); readiness view with factual counts ("N of M identified preparation areas completed"). Stored in `job_preparations` (blueprint, duration, plan metadata, manually completed items).
- **7 / 14 / 30-day plans** (`src/lib/jobs/prepPlan.ts`): reuse `fillRoadmap` with a temporary topic selection on the active goal, so hours per day, rest days, prerequisites, existing/completed tasks and revision scheduling are respected and no curriculum step is duplicated; preview first, then explicit "Add preparation plan"; new tasks carry `prepJobId` (`StudyTask` gained the optional field).
- **Entitlements**: free `jobs.networkingBasic` (categories, searches, connection/recruiter drafts, `messageDraftsPerDay` 3) and `jobs.preparationBasic` (curriculum-only overview, basic readiness); paid `jobs.referrals`, `jobs.outreachTracker`, `jobs.preparation`, `jobs.interviewKit`, `jobs.readinessAdvanced`, limits `messageDraftsPerDay` (60) and `preparationPlansPerDay` (20). Admin settings form now renders every limit generically.
- **Job workspace tabs**: Overview → Match → Curriculum gaps → Resume → Application strategy → Networking & Referrals → Prepare → Tracker.
- **Schema** (`0008_career_os_phase4.sql`, journal ts 1790300000005): `outreach_contacts`, `job_preparations` (unique per user/job, cascade with job and user).

## Security / ownership verification (e2e)

Another paid account sees an empty outreach list for the job, gets 404 when patching the learner's contact and `null` for the learner's preparation; a free account gets 402 on the outreach tracker, referral drafts and preparation, 200 on a connection draft with the free allowance; draft limits set by the admin return 429; every draft the paid learner generated cited only resume/job facts (checked for absence of Kafka, "mutual", "we met", guarantees).

## Test evidence (run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev → 5/5 (0000–0008 fresh and upgrade; Phase 4 tables, cascade, unique)
npm run test:phase4         → 11/11 (contact categories + searches never name people; draft grounding and no fabrication; blueprint relevance + existing-topic mapping; DSA/design depth by level and role; data roles skip DSA; progress turns must into revise; 7/14/30 plans inside the window with rest days and workload; existing tasks kept, no duplicate steps, preview never mutates; prerequisite order; readiness arithmetic; outreach validation + entitlement defaults)
test:jobs:domain 11/11 · test:ingestion 11/11 · test:matching 5/5 · test:scheduler 4/4 · test:resume 4/4 + 2/2
test:curriculum, test:learning:domain, test:merge, test:billing, test:verification → all passed
npm run test:e2e:jobs       → All 56 Career OS Phase 1–4 checks passed (twice: before and after the dev-server restart)
npm run test:e2e            → All end-to-end checks passed (existing tracker regression, after the restart)
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build (next build)  → exit 0 in 11 s with the dev server stopped (log: scratch/next-build-p4.log); dev server restarted (pid in scratch/local-dev.pid)
```

Required browser flow (`scripts/e2e-jobs.mjs`, paid learner, synthetic data, no localStorage pre-seeding): login → find job → open → Match → resume analysis → application strategy → Networking & Referrals (categories, copyable queries incl. alumni from the resume) → generate referral draft (truthful, placeholder name) → save contact with draft, follow-up date, status → status change persists → Prepare for This Job (blueprint, DSA standard, design basics, resume project, interview kit) → 14-day preview reports "did not fit at 2 h/day" on a full calendar → learner raises study hours through the roadmap UI → 14-day preview → Add preparation plan → tasks added to the existing calendar with `prepJobId`, no duplicate steps, goal tracks untouched → open a preparation item → exact Knowledge Workspace (breadcrumb shows the topic) → back → complete the first scheduled task from Goals & Roadmap → refresh → readiness "Preparation tasks completed 1 / N", last plan recorded, contact + follow-up + status still there → add job to tracker (Phase 3 step). Screenshots: `scratch/career-os/learner-networking.png`, `learner-prepare.png`, `learner-readiness.png`.

## Flaky / failing tests

- None failing. Development iterations fixed test expectations (referral wording "opening at", the free account's plain-text resume, Kafka becoming a revise item once its track was in the goal, a full calendar at 2 h/day) and one real bug the e2e caught: the partial outreach update spread the stored row (id, timestamps) back into the write and failed; fixed in `src/lib/server/outreach.ts`.

## NOT TESTED

- Real LinkedIn search results (only the URL/query construction); sending messages (never automated by design).
- 30-day plan in the browser (7/14/30 are unit-tested on the engine; the browser flow uses 14).
- `next start` serving the production build; production cron.
- Behaviour with many outreach contacts (no pagination on the log).

## Remaining risks

- Contact categories and draft wording are templated; tone is professional but not adapted per company culture.
- Blueprint topic resolution uses curriculum search by phrase; unusual skill names fall back to a track's first topic.
- Plans depend on the active goal's hours; a full calendar yields an honest "did not fit" preview rather than a plan.
- Readiness "networking status" counts saved contacts only; it cannot know about outreach done outside JobAppy.

## Files (Phase 4)

Changed: `src/lib/db/schema.ts`, `src/lib/db/migrations/meta/_journal.json`, `scripts/test-development-migrations.mjs`, `scripts/test-matching.mjs`, `scripts/e2e-jobs.mjs`, `package.json`, `src/types.ts` (`StudyTask.prepJobId`), `src/App.tsx`, `src/JobDetail.tsx`, `src/careerOs.css`, `src/lib/entitlements/features.ts`, `src/components/admin/SettingsForm.tsx`, `docs/career-os-architecture.md`.
New: `src/lib/db/migrations/0008_career_os_phase4.sql`, `src/lib/jobs/{networking,prepare,prepPlan,prepClient}.ts`, `src/lib/server/outreach.ts`, `src/components/jobs/{NetworkingTab,PrepareTab}.tsx`, `src/app/api/jobs/[id]/outreach/route.ts`, `src/app/api/jobs/[id]/outreach/[contactId]/route.ts`, `src/app/api/jobs/[id]/drafts/route.ts`, `src/app/api/jobs/[id]/preparation/route.ts`, `scripts/test-phase4.mjs`.

# Career OS Phase 3 (scheduled refresh, resume intelligence, application strategy) — 2026-09-25 IST

Builds on the Phase 1 and 2 sections below. Nothing deployed; hosted database untouched; all work on the local Docker database `127.0.0.1:55432/jobappy_dev`. Unrelated working-tree edits from another session (DSA, labs, system-design files, seeds, `scripts/e2e-system-design.mjs`) were left untouched. Architecture: `docs/career-os-architecture.md` (sections 4 and 7 updated).

## What was built

- **Scheduled ingestion** (`src/lib/ingestion/scheduler.ts`): runs every enabled, allowed provider source; per-source database lock (`job_sources.lockedAt/lockToken`, 15-minute stale timeout) prevents overlapping runs (skipped runs are recorded); transient errors (timeouts, 429/5xx, network) retried with exponential backoff, configuration errors not retried; per-run `trigger`, `attempts`, `durationMs`, counts and failure reason; `lastSuccessAt` per source; failure of one source never touches others or existing jobs; finishes with the stale/expiry sweep. Entry points: `POST /api/admin/ingestion/schedule` (jobs_editor+, audited) with a "Run scheduled pass now" button and new health/run columns on `/admin/ingestion`; `GET /api/cron/ingestion` is deploy-ready but inert until `CRON_SECRET` is set (documented in `.env.example`; no cron configured).
- **Resume profile** (`src/ResumeWorkspace.tsx`, `/api/resumes*`, `src/lib/server/resumes.ts`): PDF or plain-text upload (DOCX rejected; no existing DOCX infrastructure), validated by bytes and size (≤ 2 MB), sanitised filenames, bytes stored in the `resumes.content` bytea column (private, owner-only download with `no-store`), versions with one current resume, rename, delete (cascades profile + analyses, promotes the newest remaining version), optional target role. Extraction (`src/lib/resume/extract.ts`, `pdf-parse` 2.4.5 in-process) produces a structured profile where every entry cites resume lines and unreadable fields are listed as unknown.
- **Resume vs job analysis** (`src/lib/jobs/resumeAnalysis.ts`, `POST /api/jobs/[id]/resume-analysis`): runs on the server (resume never leaves it), stored in `resume_analyses`; strong matches (with line quotes), missing/weak evidence, skills alignment table, experience alignment from dated employment, project relevance, keywords present vs absent, curriculum gaps (Phase 2 map passed from the client), and suggestions that can be saved / dismissed / completed (`PATCH`). Missing skills produce "X is mentioned in this job description but is not demonstrated in your current resume" plus the curriculum track; suggestions never propose adding skills the resume lacks; the file is never rewritten.
- **Application strategy** (`src/lib/jobs/strategy.ts`, gate `POST /api/jobs/[id]/strategy`): nine sections with a provenance tag per line (From job description / From your resume / From your curriculum / JobAppy recommendation) and an explicit no-guarantee note.
- **Job workspace**: `src/JobDetail.tsx` now has tabs Overview → Match → Curriculum gaps → Resume → Application strategy → Tracker; "Add to Application Tracker" stores `jobRef` (job id, company id, resume analysis id) on the existing `JobApplication` (`src/types.ts`), no second tracker.
- **Entitlements**: `resume.profile` added to the free defaults; `jobs.resumeAnalysis` and `jobs.applicationStrategy` gate the paid features; new limit `resumeAnalysesPerDay` (free 0, pro 50) editable in Platform settings and enforced through `consumeUsage`.
- **Schema** (`0007_career_os_phase3.sql`, journal ts 1790300000004): scheduler columns on `job_sources` and `job_ingestion_runs`, tables `resumes`, `resume_profiles`, `resume_analyses`.

## Security / privacy verification

- Every resume route filters by the owner's user id: the e2e signs up a second learner and gets 404 on GET/PATCH/DELETE `/api/resumes/{id}` and on `/api/resumes/{id}/file`, and `null` from `/api/jobs/{id}/resume-analysis`.
- Admin has no resume routes; admin actions on ingestion and settings are audited (`ingestion.schedule`, `ingestion.run`, `settings.limits`).
- Upload validation is byte-based (`test-resume-server.mjs`); HTML disguised as PDF is rejected (e2e).
- No resume content is logged (routes log only the context string on unexpected errors); no external provider receives resume data (extraction and analysis are local and deterministic).

## Test evidence (run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev → 5/5 (fresh DB 0000–0007; upgrade path; resume tables, bytea, cascade, lock columns)
npm run test:scheduler      → 4/4 (failure isolation, retry/backoff + no retry on config errors, lock overlap + stale-lock recovery, sweep + scheduleEnabled) on PGlite
npm run test:resume         → 4/4 extraction/analysis/curriculum-gap/strategy + 2/2 upload validation and filename safety
npm run test:ingestion 11/11 · test:matching 5/5 · test:jobs:domain 11/11
test:curriculum, test:learning:domain, test:merge, test:billing, test:verification → all passed
npm run test:e2e:jobs       → All 45 Career OS Phase 1 + 2 + 3 checks passed (twice: before and after the dev-server restart for the build)
npm run test:e2e            → All end-to-end checks passed (existing tracker regression, after the restart)
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
npm run build (next build)  → exit 0 in 17 s with the dev server stopped (log: scratch/next-build.log); dev server restarted afterwards (pid in scratch/local-dev.pid)
```

New browser flow in `scripts/e2e-jobs.mjs` (paid learner): Resume view → upload synthetic PDF (generated in the test) → profile shows name, employment → rename → second version becomes current → second learner gets 404 everywhere, free account can upload but gets 402 on analysis/strategy, invalid file rejected → job workspace Resume tab → "Analyze resume for this job" → Java/Spring Boot/SQL/Docker demonstrated with line quotes, Kafka missing with curriculum pointer and "Do not add Kafka to your resume unless you have used it", usage 1 of 50 → dismiss + mark done → reload → state persisted → admin sets pro limit to 1 → 429 → restore → Curriculum gaps tab → Application strategy tab with provenance labels and no-guarantee note → Tracker tab → add → `jobRef` with analysis id in localStorage and in the cloud `career_state` after refresh → delete resume removes analyses and promotes the other version → admin "Run scheduled pass now" shows per-source status/attempts/duration, `lastSuccessAt` set, lock released; `/api/cron/ingestion` returns 404 without a secret. Screenshots: `scratch/career-os/learner-resume-analysis.png`, `learner-strategy.png`.

## Flaky / failing tests

- No failing suite. The e2e ran twice green in this phase; the three failures during development were test expectations (sections moved under tabs; a job whose Kafka is preferred, not required; an in-place `.sort()` in a determinism test), all fixed rather than skipped.

## NOT TESTED

- DOCX (rejected by design), scanned/image PDFs (stored, flagged "could not be read"), very large real-world PDFs.
- Real cron invocation (`CRON_SECRET` path) and provider retries against live network failures (retries are covered with an injected flaky provider on PGlite).
- Production build served with `next start` (only `next build` was run).
- Concurrency of two admins clicking "Run scheduled pass" at the same instant across processes (lock logic is unit-tested with sequential acquires).

## Remaining risks

- Extraction is rule-based: unusual resume layouts (two-column PDFs, tables) can split employment entries or miss the name; unknowns are shown rather than guessed.
- Resume bytes in PostgreSQL keep things private and simple, but the 10-versions × 2 MB cap per user is the only size control.
- Strategy and analysis text is templated; wording quality depends on the lexicon (`src/lib/jobs/skills.ts`).
- `pdf-parse` is a new dependency (`serverExternalPackages`); confirm it is allowed by the deployment's build (`allow-scripts` warnings appeared for esbuild only).

## Files (Phase 3)

Changed: `package.json` (+`pdf-parse`, test scripts), `next.config.ts`, `.env.example`, `src/lib/db/schema.ts`, `src/lib/db/migrations/meta/_journal.json`, `scripts/test-development-migrations.mjs`, `scripts/test-matching.mjs`, `scripts/e2e-jobs.mjs`, `src/App.tsx`, `src/Sidebar.tsx`, `src/MobileNav.tsx`, `src/types.ts` (`jobRef`), `src/JobDetail.tsx` (tabbed workspace), `src/careerOs.css`, `src/lib/entitlements/features.ts`, `src/lib/server/ingestion.ts`, `src/components/admin/IngestionPanel.tsx`, `docs/career-os-architecture.md`.
New: `src/lib/db/migrations/0007_career_os_phase3.sql`, `src/lib/ingestion/scheduler.ts`, `src/lib/resume/{extract,client}.ts`, `src/lib/jobs/{resumeAnalysis,strategy}.ts`, `src/lib/server/resumes.ts`, `src/ResumeWorkspace.tsx`, `src/app/api/resumes/route.ts`, `src/app/api/resumes/[id]/route.ts`, `src/app/api/resumes/[id]/file/route.ts`, `src/app/api/jobs/[id]/resume-analysis/route.ts`, `src/app/api/jobs/[id]/strategy/route.ts`, `src/app/api/admin/ingestion/schedule/route.ts`, `src/app/api/cron/ingestion/route.ts`, `scripts/test-scheduler.mjs`, `scripts/test-resume.mjs`, `scripts/test-resume-server.mjs`.

# Career OS Phase 2 (ingestion, entitlements, freshness, matching) — 2026-09-25 IST

Builds on the Phase 1 section below. Nothing deployed; hosted database untouched; all work on the local Docker database `127.0.0.1:55432/jobappy_dev`. Architecture: `docs/career-os-architecture.md` (sections 4, 6, 9 updated).

## What was built

- **Entitlements (free vs paid)**: `src/lib/server/entitlements.ts` is the single server gate (`resolveAccess`, `requireFeature`, `consumeUsage`); `src/lib/entitlements/features.ts` gained `jobs.personalizedFeed` and per-tier limits (`jobFeed`, `analysesPerDay`, stored in `platform_settings.limits`). Free: browse newest-first list capped at 12 (configurable), role/region/work-mode filters, job details, official apply link, tracker. Pro: personalised feed with sections and reasons, level/type filters, compatibility analysis (daily limit, counted in `usage_counters`), gap analysis, add gaps to plan. The `/app` paywall now lets accounts without a pass continue on the free plan for `FREE_VIEWS` (jobs, tracker, settings) and shows a "Free plan" banner; locked capabilities use `src/components/LockedFeature.tsx`.
- **Ingestion**: provider contract + adapters in `src/lib/ingestion/providers/` (Greenhouse, Lever, Ashby; `fixture` for development/tests), deterministic normalisation `src/lib/ingestion/normalize.ts` (HTML→text, location/country/region, remote eligibility separate from work mode, work mode, employment type, level, experience years, skills via lexicon `src/lib/jobs/skills.ts`, role-family classification with hard exclusions for non-engineering and management titles), engine `src/lib/ingestion/engine.ts` (db-injected; upsert by source+externalId, cross-source duplicates recorded in `job_duplicates`, listings missing from a source marked stale, runs recorded in `job_ingestion_runs`), lifecycle sweep (`sweepLifecycle`: expiry date → expired; unseen 21 days → expired; unseen 7 days → stale).
- **Schema** (migration `0006_career_os_phase2.sql`, journal ts 1790300000003): `job_sources` + provider/config/companyId/autoPublish/lastRun*, `jobs` + lifecycle/firstSeenAt/lastSeenAt/remoteEligibility/eligibleCountries/rawMetadata + unique `(sourceId, externalId)`, new `job_ingestion_runs`, `job_duplicates`, `usage_counters`.
- **Matching**: `src/lib/jobs/compatibility.ts` (six weighted checks totalling 100, every point explained, labelled "profile / job alignment"); `curriculumMap.ts` now classifies tracks covered / learning / not covered (70% topics done = covered), uses the skill lexicon's track mapping, caps at 8 tracks; "Add gaps to learning plan" (`addGapsToPlan` in `App.tsx`) adds only confirmed, missing tracks to the active goal at Medium priority and schedules them with `scheduleTrackIntoRoadmap`.
- **Feed UX**: sections (Recommended, Strong curriculum match, Recently verified, Remote, India, Entry level) only when personalised, unfiltered and each has ≥2 jobs; cards show key skills, level, freshness (stale = "Not seen at source recently"), remote hiring-country note and the top reasons.
- **Admin**: `/admin/ingestion` (lifecycle counts, provider health with Run now, sweep, run table with logs), `/admin/duplicates`, provider/config/company/auto-publish on sources with Run now, lifecycle filter and column on jobs, remote eligibility fields on the job editor, limits and role families (enable/disable, extra keywords) on Platform settings, ingestion and lifecycle summary on Overview. All mutations audited (`ingestion.run`, `ingestion.sweep`, `settings.limits`, `settings.roleFamilies`, …).

## Providers actually implemented

Greenhouse Job Board API, Lever Postings API, Ashby Job Board API (all public, documented, read-only JSON; no scraping, no anti-bot bypass) and a `fixture` provider for tests. Unit tests exercise all three adapters on recorded payload shapes. Live check (network, in-memory PostgreSQL, nothing written to the app database), `scratch/live-greenhouse-check.mjs` against GitLab's public board:

```text
run1: fetched 201, created 76, irrelevant 125 (non-engineering, customer-facing and management titles), duplicates 0, ~1.1 s
run2: created 0, updated 0, unchanged 76 (idempotent)
by role family: backend 31, devops-cloud 16, cybersecurity 9, software-engineer 7, ai-ml 4, full-stack 3, frontend 3, data-analyst 3
by region: international 63, india 13 · by work mode: remote 65, onsite 11 · 72/76 with skills, 6/76 with stated experience years
```

Lever was verified only with fixtures (no public Lever board slug was confirmed during the session; `api.lever.co/v0/postings/lever` returned an empty list).

## Test evidence (all run 2026-09-25 after the last code change)

```text
npm run test:migrations:dev → 5/5 (fresh DB gets 0000–0006; upgrade from 0003; Phase 2 tables, lifecycle columns, unique source/external index)
npm run test:ingestion      → 11/11 (html→text, location/eligibility, experience/level/type/mode, skills lexicon, classification incl. disabled families and admin hints, adapters, engine idempotency + updates + stale marking on PGlite, cross-source duplicate, refused sources record failures, sweep)
npm run test:matching       → 5/5 (gap statuses from real curriculum progress, deterministic compatibility report with 100-point breakdown, missing inputs/experience gap/location conflicts, India/international + remote eligibility ranking, entitlement defaults and limit normalisation)
npm run test:jobs:domain    → 11/11
test:curriculum, test:learning:domain, test:merge, test:billing, test:verification → all passed
npm run test:e2e:jobs       → All 35 Career OS Phase 1 + 2 checks passed (solo and under concurrent load; see the flakiness section)
npm run test:e2e            → All end-to-end checks passed (existing tracker regression)
npx tsc --noEmit → exit 0 · npx eslint src scripts/e2e-jobs.mjs scripts/test-*.mjs → exit 0
```

New browser flows in `scripts/e2e-jobs.mjs`: provider source created through the UI with JSON config; "Run now" → `fetched 2, created 1, irrelevant 1`; second run `unchanged 1` and lifecycle `verified`; mirror source → `duplicates 1` and the Duplicates page; Ingestion page health + sweep; not-allowed source → 422 recorded; role family switched off hides its jobs from learners (API and UI); free learner (no pass) continues past the paywall, sees the capped list (limit set to 1 → 1 job + "2 more openings" locked card), locked level/type filters, 402 `upgrade` from the analysis API, can open details, apply link and add to tracker, gets 404 on `/admin`; paid learner runs the analysis (score, "2 of 3 required skills demonstrated", "Analyses today: 1 of 100", `usage_counters` row = 1), gap dialog refuses without a goal, then with an imported goal adds exactly the confirmed tracks (`track-java` included, `track-dsa` kept, no duplicates) and schedules tasks; settings/ingestion actions audited. Screenshots: `scratch/career-os/*.png` (admin-ingestion, learner-free-feed, learner-compatibility, learner-gap-analysis added).

## Flaky / failing tests (investigated, not hidden)

- `test:e2e:jobs` failed once while the unit suites and the live Greenhouse check ran in parallel, after four solo passes. Reproduced deliberately under the same concurrent load (`scratch/e2e-run-concurrent.log`): `strict mode violation: getByText('Acme careers page …') resolved to 2 elements` — the "Added Acme careers page …" status notice and the table row. Root cause: a substring locator in the test that, when the page was fast, resolved on the notice alone (passing without checking the row) and, when `router.refresh()` was slow, saw both. Fixed by exact-text locators for the three source names. After the fix: one run under the same concurrent load and one solo run both passed 35/35 (`scratch/e2e-run-concurrent2.log`, `scratch/e2e-run-solo2.log`). The Phase 1 "flaky" failure was almost certainly the same locator.
- Two other real defects the e2e caught during this phase were fixed rather than skipped: locator collisions once feed sections repeat cards, and a React hydration mismatch in the admin panel (server `14:32` vs browser `02:32 pm`) from locale-dependent date formatting in `src/components/admin/ui.tsx`, now locale-independent.
- No suite is currently failing.

## NOT TESTED

- `next build` (dev server shares `.next`).
- Lever against a live board; Greenhouse/Ashby live runs through the admin UI (the live check ran the same engine on an in-memory database).
- Scheduled ingestion (no cron yet; runs are admin-triggered).
- Razorpay purchase → tier upgrade in the browser (tier derives from the existing entitlement; unit-tested only).
- Large boards (>500 published jobs) in the personalised feed.

## Remaining risks

- Classification is rule-based; titles outside the hint lists fall to `software-engineer` only when they contain engineer/developer; unusual titles are dropped as irrelevant (visible in run counters).
- Experience years are rarely stated in ATS descriptions (6/81 on GitLab); level then comes from the title.
- Remote eligibility for Greenhouse is inferred from office/location names; when nothing is stated it stays `unknown` and the UI says so.
- Working tree also contains unrelated in-progress edits from another session (DSA/labs/system-design files, `scripts/e2e-system-design.mjs`); they typecheck but were not reviewed here.

## Files (Phase 2)

Changed: `src/lib/db/schema.ts`, `src/lib/db/migrations/meta/_journal.json`, `scripts/test-development-migrations.mjs`, `scripts/test-jobs-domain.mjs`, `scripts/e2e-jobs.mjs`, `package.json`, `src/App.tsx`, `src/components/Paywall.tsx`, `src/JobsWorkspace.tsx`, `src/JobDetail.tsx`, `src/careerOs.css`, `src/lib/entitlements/features.ts`, `src/lib/jobs/{types,normalize,relevance,client,curriculumMap,taxonomy}.ts`, `src/lib/server/{settings,jobs}.ts`, `src/app/api/jobs/route.ts`, `src/app/api/admin/{settings,jobs}/route.ts`, `src/app/admin/{page,jobs/page,sources/page,settings/page}.tsx`, `src/components/admin/{AdminShell,JobEditor,SourcesPanel,SettingsForm,ui}.tsx`, `docs/career-os-architecture.md`.
New: `src/lib/db/migrations/0006_career_os_phase2.sql`, `src/lib/ingestion/**` (types, normalize, engine, providers/{greenhouse,lever,ashby,fixture,index}), `src/lib/jobs/{skills,compatibility}.ts`, `src/lib/server/{entitlements,ingestion}.ts`, `src/app/api/jobs/[id]/analysis/route.ts`, `src/app/api/admin/ingestion/{run,runs,sweep}/route.ts`, `src/app/api/admin/duplicates/route.ts`, `src/app/admin/{ingestion,duplicates}/page.tsx`, `src/components/admin/IngestionPanel.tsx`, `src/components/LockedFeature.tsx`, `scripts/test-ingestion.mjs`, `scripts/test-matching.mjs`.

# Career OS Phase 1 (admin control center + job discovery) — 2026-09-25 IST

Supersedes nothing below; the local Docker database section remains the environment reference. Architecture and later phases: `docs/career-os-architecture.md`.

## What was built (all verified locally, nothing deployed, hosted database untouched)

- **RBAC**: `user_roles` table (admin, content_editor, jobs_editor, support) plus env bootstrap `PLATFORM_ADMINS` (admin) and existing `CURRICULUM_ADMINS` (content_editor). `src/lib/server/rbac.ts`, page gate `src/lib/server/adminPage.ts` (non-admins get 404), API gate `requireRole` (401/403 JSON).
- **Admin panel** `/admin`: Overview (live metrics), Jobs (list with search/filters/pagination, create/edit form, publish/unpublish/expire/archive/verify, expire past-due sweep), Companies, Job sources, Users & roles, Platform settings (feature flags + tier entitlements), Audit log (before/after JSON). Every mutation writes `admin_audit_log`.
- **Data model** (migration `0005_career_os_phase1.sql`, journal ts 1790300000002): `user_roles`, `admin_audit_log`, `companies`, `job_sources`, `jobs` (normalised title, unique fingerprint, canonical apply URL, provenance, status, posted/expires/lastVerified), `learner_job_preferences`, `platform_settings`.
- **Learner Job Discovery** view in the `/app` shell (`src/JobsWorkspace.tsx`, `src/JobDetail.tsx`): published, unexpired jobs only; search + role/region/work-mode filters (level/type filters gated by `jobs.advancedFilters`); preferences form; preference-based ranking with plain-language reasons; job detail with company, source, original apply link, posted/verified dates, skills, description, curriculum mapping with progress from the learner's roadmap/workspaces, and **Add to Application Tracker** which creates a normal `JobApplication` (Wishlist) keyed by the canonical apply URL. Personalised sections carry a "Personal" label; the relevance panel states it is not a hiring prediction.
- **Entitlement layer**: `src/lib/entitlements/features.ts` (feature keys, free/pro defaults) + `platform_settings.entitlements` override editable in admin; `GET /api/platform/config` returns flags, tier and features. `jobsModule` flag hides the nav entry and makes `/api/jobs` answer 503.

## Actual test results (all run 2026-09-25 against the local Docker database `127.0.0.1:55432/jobappy_dev` and `npm run dev` on port 3000)

```text
npm run db:migrate -- --confirm-development=127.0.0.1:55432/jobappy_dev
Starting confirmed development migration: 127.0.0.1:55432/jobappy_dev
Development migration complete.            (ledger now 6 rows; 33 public tables)

npm run test:migrations:dev   → tests 5 / pass 5 / fail 0 (PGlite: fresh DB gets 0000–0005; 0003→0004+0005 upgrade; jobs FK restrict; fingerprint unique index)
npm run test:jobs:domain      → tests 11 / pass 11 / fail 0 (canonical URL, title normalisation, fingerprint dedupe, freshness, input parsers, ranking + exclusions, taxonomy, entitlements)
npm run test:e2e:jobs         → All 21 Career OS Phase 1 checks passed. (Playwright; screenshots in scratch/career-os/)
npm run test:e2e              → All end-to-end checks passed. (existing tracker regression; first attempt timed out while the dev server cold-compiled, rerun passed)
npm run test:curriculum / test:learning:domain / test:merge / test:billing / test:verification → all passed
npx tsc --noEmit              → exit 0 (after deleting a stale `.next/types` left by an old `next build`, which declared LayoutRoutes = "/")
npx eslint src scripts/e2e-jobs.mjs scripts/test-jobs-domain.mjs → exit 0
```

`test:e2e:jobs` flow, in order: learner without a role gets 404 on `/admin` and 403 on `/api/admin/jobs` → role inserted into `user_roles` → overview renders → company created through the UI (website normalised) → source created → job created through the form (role category suggested from the title, tracking parameter stripped, title normalised, draft) → Publish sets `postedAt`/`lastVerifiedAt` → duplicate POST rejected 400 → draft + international on-site jobs created via API → admin list filters → audit log filter by entity → anonymous `/api/jobs` returns only the two published jobs → learner signs up, opens Job Discovery, sees both jobs unranked → saves preferences (Backend, Java/SQL, 3 yrs, India only) → list re-ranked, international on-site job hidden, reason text shown → job detail: apply link `href` equals canonical URL with `target=_blank`, source name, "You listed 2 of 3 required skills", disclaimer, curriculum section with "Covers Java" → Add to Application Tracker → Applications list shows the row with the original link → detail shows "Already in your tracker" → learner `/admin/jobs` is 404 → admin flips `jobsModule` off (learner `/api/jobs` 503) and on → admin cannot drop own admin role (400) → mobile bottom nav "Jobs" reaches Job Discovery → no page errors. The script deletes every row it created.

One e2e run failed mid-way once (right after the first screenshot was added) and passed on the two runs after; the cause was not captured. Treat the suite as green but watch for dev-server compile timeouts on a cold start.

## NOT TESTED

- `next build` (not run: the dev server shares `.next`; run it in CI or after stopping dev).
- Google sign-in, email confirmation paths with the new views (no mailer locally).
- Admin panel on a real phone (only the 390px Playwright viewport for the learner side).
- Behaviour with hundreds of jobs (ranking loads up to 500 published jobs in memory per request).
- Free-tier learners: the existing `/app` paywall blocks every signed-in account without a pass before Job Discovery renders, so the free/pro split is only exercised through `/api/platform/config`.

## Remaining work / Phase 2 recommendation

1. Decide whether free accounts pass the paywall with pro features gated inside; wire `jobs.matching` etc. to real gates.
2. `skills` and `job_categories` tables with admin CRUD (currently code taxonomy in `src/lib/jobs/taxonomy.ts` and free-text skills).
3. ATS-feed ingestion for sources with `ingestionAllowed`, `job_ingestion_runs`, scheduled expiry sweep (the manual sweep exists at `POST /api/admin/jobs {action:'sweep_expired'}`).
4. Compatibility analysis (deterministic core + AI extraction) and "Add gaps to learning plan" via `fillRoadmap`/`scheduleTrackIntoRoadmap`.
5. Fix `scripts/lib/pass.mjs` `signUpWithPass` for the redesigned auth form (labels are now "Email address"; tabs "Sign in"/"Create account"); `e2e-jobs.mjs` carries its own helper.

## Files

Changed: `.env.example`, `package.json`, `scripts/test-development-migrations.mjs`, `src/App.tsx`, `src/MobileNav.tsx`, `src/Sidebar.tsx`, `src/app/layout.tsx`, `src/lib/db/schema.ts`, `src/lib/db/migrations/meta/_journal.json`.
New: `docs/career-os-architecture.md`, `scripts/e2e-jobs.mjs`, `scripts/test-jobs-domain.mjs`, `src/careerOs.css`, `src/JobsWorkspace.tsx`, `src/JobDetail.tsx`, `src/lib/adminClient.ts`, `src/lib/db/migrations/0005_career_os_phase1.sql`, `src/lib/entitlements/features.ts`, `src/lib/jobs/{taxonomy,types,normalize,relevance,client,curriculumMap}.ts`, `src/lib/server/{rbac,adminPage,audit,settings,jobs,apiErrors}.ts`, `src/app/admin/**` (layout + 9 pages), `src/components/admin/*` (8 files), `src/app/api/admin/**` (11 routes), `src/app/api/jobs/**` (3 routes), `src/app/api/platform/config/route.ts`.

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
