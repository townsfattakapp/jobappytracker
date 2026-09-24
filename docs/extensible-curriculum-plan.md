# Extensible curriculum: audit, migration and implementation plan

_Last updated 2026-09-23._

## Phase 1 audit: what exists

| Concern | Where | Finding |
| --- | --- | --- |
| Goal schema | `Goal` in `src/types.ts` | `targetRole`, `companyType`, `startDate`, `durationDays` (default 90), `hoursPerDay`, `restDays` (default Sunday), `tracks: {trackId, priority}[]`, `goalType`. No name, level, languages, topic selection, exclusions or target date. |
| Learning-track schema | `CurriculumTrack` → levels → categories → modules → topics → subtopics (concepts) → tasks | Structure is good; every track is a static TypeScript file with random ids (`top-2fofb6p5i`) plus an authored overlay (`content/<track>.ts`) matched by title. |
| Seeds | `src/data/curriculum/*.ts` (10 tracks), `learningTracksSeed.ts` (legacy, unused) | `allCurriculums` is imported directly by nine modules. |
| User progress | `KnowledgeWorkspace` keyed by topic **or concept id**, `StudyTask` carries `trackId/categoryId/topicId/subtopicId/curriculumTaskId`, attempts in IndexedDB | Already independent of the goal, so concepts are shareable across goals. |
| Persistence | `career_state` JSONB (one document per user, optimistic revision, client-side merge) + localStorage; legacy relational tables (`goals`, `roadmap_days`, `learning_tracks`) unused | No curriculum lives in the database. |
| AI | `/api/ai/chat` gateway with per-account keys; `explainPrompts.ts` switches on **track ids** (`track-hld`, `track-java`…) | Hard-coded per-track behaviour. |
| Custom goals / curriculum editing | None | Goal wizard only picks whole tracks; no custom topics. |
| Roadmap | `roadmapGenerator.ts` | Interleaves whole tracks; forces a duration; marks rest days from `restDays`; no topic selection; `scheduleTrackIntoRoadmap` handles one added track. |
| Task picker | `LearningTaskPicker.tsx` | Filters activities by regex on track **titles** (`/DSA|Competitive/`, `/design/`). |
| Day proposals | `learningPlan.ts` | Maps revision types to `track-dsa` / `track-hld`; module-level `topics` array built once from the static list. |

Assumptions that pin the app to ten tracks: direct `allCurriculums` imports, the module-level `topics` array, id switches in `explainPrompts.ts`, title regexes in the picker, `checkCurriculumContent.mjs` listing ten track keys, and the goal wizard's whole-track-only selection.

## Migration plan (no destructive changes)

1. **Types are extended, never changed.** `Goal` gains optional fields (`name`, `description`, `outcome`, `careerPathId`, `experienceLevel`, `languages`, `targetDate`, `knownTopicIds`, `milestones`); `GoalTrack` gains optional `topicIds`, `excludedTopicIds`, `order`. `CurriculumTrack` gains optional metadata (`family`, `kind`, `tags`, `languages`, `explainMode`, `code`, `supports`, `source`, `status`, `version`). `Storage` gains `customTracks`.
2. **Existing ids are preserved.** The ten built-in tracks keep their generated ids; new tracks use deterministic slug ids (`top-python-functions-decorators`) from `defineTrack`, so re-seeding is idempotent and personal notes keep resolving.
3. **Registry instead of imports.** `src/lib/curriculum/registry.ts` composes built-in + shared (published) + personal tracks and exposes lookups, search and a React hook. Every consumer switches to it.
4. **Track metadata instead of id switches.** `explainMode`, `code` and `supports` drive AI prompts and activity applicability.
5. **Database:** one additive table, `curriculum_tracks` (shared drafts/review/published/archived, versioned JSON), migration `0004`. Legacy relational tables are untouched. Personal tracks stay in the learner's `career_state` document and sync like everything else.
6. **Storage migration** in `loadStorage`: `customTracks` defaults to `[]`; old goals keep working because every new field is optional and `restDays` still drives rest days.
7. **Tests:** existing e2e suites are a regression net; new engine tests cover selection, exclusions, prerequisites, no forced rest days and non-destructive re-planning; new acceptance e2e covers goals across families and an existing-user regression.

## Entities (Phase 2)

- **Career path** (`src/data/careerPaths.ts`): a template listing suggested tracks in order. Never stored on the goal beyond `careerPathId`.
- **Learning track / category / topic / concept / activity**: the existing hierarchy (`CurriculumTrack` → `CurriculumCategory` → `CurriculumTopic` → `CurriculumSubtopic` → `CurriculumTaskDef`).
- **User goal**: `Goal` with per-track topic selection and exclusions, custom topics living in the learner's personal track (`track-personal`), schedule and progress through `RoadmapDay`/`StudyTask`.
