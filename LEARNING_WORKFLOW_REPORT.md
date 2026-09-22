# Learning workflow implementation and verification

Implemented in the existing working tree. Existing unrelated edits were retained; no goal reset, task-table truncation, or note/attempt deletion was used.

## Root causes found

- Goal creation called `prepareGoal()` separately for preview and save, generating different UUIDs. Preview days could belong to a goal ID that was never saved.
- Old calendar/Today lookups matched only day number, ignoring goal ownership. Generated day IDs such as `day-1` also collided across goals.
- Today clamped the current date to the goal duration, showing Day 1 before a future goal and the last goal day after its end. The calendar title was always 90 days.
- New goals silently selected Sunday as rest. Empty/rest days were represented inconsistently and had no per-date override.
- Generated tasks lacked topic/workspace links, and the manual task dialog accepted only a typed title and broad type.
- Cloud load always returned null and cloud save did nothing. The active database contained zero goals, tasks, and prep notes at inspection; planning state was local. Knowledge-workspace changes were also absent from cloud-effect dependencies.
- Examples, Practice, and Revision workspace tabs were placeholders. Two Pointers was absent from the curriculum.

The exact quoted "Take a break" text was not present in the supplied working tree at inspection; an earlier partial change had already replaced it. The underlying ownership, generation, routing, and persistence issues above remained. The user's private browser profile was not inspected; verification used isolated browser contexts.

## Working workflows

- Create a goal with stable IDs, optional rest weekdays, any supported duration, selected tracks or manual planning; retain existing goals when creating another.
- Browse every existing track/category/topic; schedule from track/category/topic/Today/calendar. Search and filter curriculum, bookmark topics, and find recently studied/in-progress topics.
- Select an exact topic and optional subtopic, multiple activities and individual durations, goal, date, priority, title, description, and completion criteria. Custom activities remain possible when content is missing.
- Persist tasks before confirming success; prevent repeated clicks from creating duplicates; update selected day and workload immediately.
- Use Today/Week/Month/Full Roadmap views with dates and explicit Empty, Rest, Planned, Partial, Completed, and Overdue states. Change individual rest days and study optionally on them.
- Start the matching lesson/notes/examples/diagram/code/quiz/revision tab. Choose exact linked DSA problems, HLD/LLD exercises and labs; start mock interviews. Two Sum II has its own problem entry and matching LeetCode URL.
- Save personal notes, examples, diagrams, code and quiz answers; retain unfinished problem/design/lab drafts during navigation. Task completion does not mark a topic mastered.
- Edit/reschedule/delete tasks without deleting topic work; carry overdue tasks forward; log time beyond estimates; schedule revision on another date.
- Preview a day plan, edit/remove/replace suggestions, add manual tasks, and confirm within the remaining time budget. Consider selected tracks, priority, available progress/prerequisite metadata and due revisions; preserve existing tasks.
- Save signed-in state and detailed attempt history to PostgreSQL, retry offline work on reconnect, and restore it on another device. Conflicting stale-device writes preserve local work and offer backup/cloud-copy recovery.
- Recover unambiguous old orphan goal IDs without deleting tasks, notes or attempts. Ambiguous orphan days remain preserved and can be attached explicitly to a goal.

## Database changes

Added only `career_state`: authenticated user ID primary/foreign key, JSONB payload, revision counter, updated timestamp. Added matching Drizzle schema, migration and snapshot metadata. Existing relational tables were not modified or cleared. This document representation retains the UI's existing collections and new curriculum fields without a destructive relational conversion.

Applied the additive migration to the configured database with `node scripts/migrate-career-state.mjs`. Deployments can run `npm run db:migrate:career`; the migration is also in the Drizzle journal. Writes use optimistic revision checks and accept an identical replay if a refresh interrupted the original response.

## Files changed for this task

- Integration/models: `src/App.tsx`, `src/types.ts`, `src/GoalManager.tsx`.
- Planning: `src/LearningDayWorkspace.tsx`, `src/LearningTracksWorkspace.tsx`, `src/components/LearningTaskPicker.tsx`, `src/components/CurriculumPicker.tsx`, `src/lib/learningPlan.ts`, `src/lib/roadmapGenerator.ts`.
- Workspaces/drafts: `src/KnowledgeWorkspaceDetail.tsx`, `src/ProblemDetail.tsx`, `src/SystemDesignExerciseDetail.tsx`, `src/LabTicketDetail.tsx`, `src/lib/useLearningDraft.ts`, `src/components/RichTextEditor.tsx`.
- Curriculum: `src/data/curriculum/dsa.ts`, `src/data/javaDsaSeed.ts`.
- Persistence: `src/lib/cloudSync.ts`, `src/app/actions/cloud.ts`, `src/lib/db/schema.ts`, `src/lib/db/migrations/0001_career_state.sql`, `src/lib/db/migrations/meta/0001_snapshot.json`, migration journal, `scripts/migrate-career-state.mjs`.
- Validation: `eslint.config.mjs`, `package.json`, `package-lock.json`, `scripts/test-learning-domain.mjs`, `scripts/e2e-learning.mjs`, `scripts/e2e-learning-cloud.mjs`.
- Removed an unused import in `src/lib/aiGatewayClient.ts` to pass the repository's strict TypeScript check.

## Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed. Added ESLint correctness checks; TypeScript handles undefined symbols and unused declarations.
- `npm run build`: passed (Next.js 16.3.5).
- `npm run test:learning:domain`: passed. Timezone/DST dates, explicit rest overrides, goal/day isolation, workload limits, non-destructive planning, overdue/completed states, no tracks, variable duration, legacy data retention, prerequisites, due revisions.
- `npm run test:learning`: passed. The requested Day 1 → DSA → Arrays → Two Pointers → 30-minute Learn Concept → save → reload → lesson → note → return → complete → revision sequence; repeated clicks; rest/empty days; generated plan; multiple goals; optional rest-day study; no-subtopic selection; rescheduling; actual time above estimate; offline save; deletion retaining notes; exact Two Sum II workspace and URL; multiple activities, quiz answers and diagram persistence.
- `npm run test:learning:cloud`: passed. Real sign-up and PostgreSQL save, goal ownership, immediate authenticated refresh, task/note recovery on a second browser, stale-device conflict protection, and offline note replay after reconnection. Test accounts and their snapshots were removed afterward.

## Remaining limits

- Most non-DSA tracks in the repository still contain only a Getting Started outline. Missing authored content is labeled honestly; personal learning activities can still be scheduled and saved. This change does not invent a full course for every track.
- Automatic planning uses available prerequisite metadata. The original curriculum has sparse prerequisites and some free-text prerequisites; those are displayed for the learner to check.
- Offline editing works in an already loaded app, and saves survive subsequent reloads when the app can load. A cold launch with no network is not provided by a service worker.
- Binary file attachments remain in the existing device-local IndexedDB store. Structured notes, diagrams, examples, code, quiz answers and saved attempt history sync; binary attachment transfer and unfinished draft transfer between devices are not implemented.
- Simultaneous conflicting edits are detected, not silently merged. Users can export their local copy and select the cloud copy. No deployment or commit was performed.
