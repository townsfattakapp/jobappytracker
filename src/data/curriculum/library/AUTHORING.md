# Authoring a learning track

Each track is one TypeScript file in this folder that exports a `CurriculumTrack` built with `defineTrack` from `../define`. The file name is the track id without the `track-` prefix (`python.ts` → `track-python`). Add the export to `index.ts` (alphabetical, one line).

Run `node scripts/validateLibrary.mjs src/data/curriculum/library/<file>.ts` after writing (several files may be passed); it fails on any rule below. Do not edit `index.ts` yourself; the registration is done centrally.

## Shape

```ts
import { defineTrack } from '../define'

export const python = defineTrack({
  id: 'track-python',
  title: 'Python',
  description: 'One or two sentences on what the track covers and who it is for.',
  family: 'Programming Languages',      // see families below
  kind: 'language',                     // language | framework | domain | tooling | interview | projects
  icon: '🐍',
  tags: ['python', 'scripting', 'automation', 'data'],
  languages: ['Python'],
  explainMode: 'concept',               // see modes below
  code: { label: 'Python', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: [],                    // other track ids that should come first
  style: 'code',                        // default task style: code | practice | design | project | reading
  categories: [
    {
      title: 'Environment and Tooling',
      description: 'Optional one-liner.',
      topics: [
        {
          title: 'Installing Python and virtual environments',
          description: 'Why every project gets its own interpreter and dependency set, how venv and pyenv create one, and how to activate and inspect it.',
          concepts: ['Interpreters and versions', 'Creating and activating a venv', 'pyenv and multiple versions', 'Inspecting the environment'],
          quiz: [
            ['Why use a virtual environment?', 'To isolate dependencies per project so versions do not clash.'],
            ['Which command creates one with the standard library?', 'python -m venv .venv'],
          ],
          prereqs: [],                  // titles of earlier topics in this track
        },
      ],
    },
  ],
})
```

## Rules the validator enforces

- 5 to 14 categories per track, each with 3 to 9 topics; a track has 25 to 90 topics (aim for 35 to 60).
- Topic `description`: 60 to 320 characters, specific to the topic (mechanism + why it matters). Never "Learn about X".
- `concepts`: 3 to 6 items, each an individually teachable unit (a thing, technique or decision), 2 to 8 words, no duplicates within the track.
- `quiz`: 2 to 4 pairs; answers are short and factual.
- Topic titles are unique within a track. `prereqs` must name topics in the same track.
- Ids come from titles. Renaming a topic later must use `retitle: '<old title>'` to keep the id.

## Content standards

- Progress from setup and fundamentals to advanced use, then real-world projects and interview preparation where the spec asks for it.
- Follow the language's or tool's own idioms. Do not force Java-style OOP onto Go, Rust or R. Do not invent features.
- Prefer concrete concept names: "Two-pointer sliding window", "Filter context in DAX", "Borrow checker errors and fixes", not "Basics", "Advanced topics", "Miscellaneous".
- Reuse existing tracks instead of duplicating: HTTP and REST live in `track-rest-api`, SQL joins in `track-sql`, Docker in `track-docker`. Reference them in the track's `prerequisites` or mention them in a description rather than re-teaching them.
- Project categories use `style: 'project'` and list real, buildable projects as topics (description = what to build and what it must do; concepts = the steps).
- Interview categories use `style: 'reading'` or `'code'`.

## Families

`Programming Languages`, `Backend Frameworks`, `AI & Generative AI`, `Data Science`, `Data Analytics & BI`, `Data Engineering`, `Mobile Development`, `Frontend & Web`, `Cloud, DevOps & Platform`, `Cybersecurity`, `Computer Science`, `Software Engineering Interviews`.

## Explain modes and code profiles

| Track type | `explainMode` | `code` |
| --- | --- | --- |
| Programming language | `concept` | `{ label: '<Language>', id: '<highlighter id>', fixed: true }` (ids: python, c, cpp, rust, go, kotlin, swift, dart, csharp, php, ruby, scala, r, bash, java, typescript, javascript, sql) |
| Backend framework | `node` for JS/TS frameworks, otherwise `concept` | the framework's language |
| Frontend framework | `react` | `{ label: 'TypeScript with <Framework>', id: 'typescript', fixed: true }` |
| Mobile | `concept` | Dart / Kotlin / Swift / TypeScript |
| AI, ML, data science, data engineering (Python) | `data` | `{ label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true }` |
| Mathematics | `math` | `{ label: 'plain-text maths with numpy checks', id: 'python', fixed: true }` |
| Analytics tools (Excel, Power BI, Tableau, dashboards) | `tool` | `{ label: 'Excel formulas', id: 'excel', fixed: true }` or `{ label: 'DAX and Power Query M', id: 'dax', fixed: true }` or `{ label: 'Tableau calculated fields', id: 'plaintext', fixed: true }` |
| SQL-centred | `sql` | `{ label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true }` |
| Cloud, DevOps, Linux, infrastructure | `devops` | `{ label: 'shell, YAML, HCL or Dockerfile, whichever fits', id: 'bash', fixed: true }` |
| Cybersecurity | `security` | `{ label: 'the language or tool that fits (bash, python, yaml)', id: 'bash', fixed: true }` |
| Computer science theory | `cs` | `{ label: 'pseudo-code, or short C-style snippets only where they help', id: 'cpp', fixed: true }` |
| System design | `hld` | `{ label: 'pseudo-code only', id: 'plaintext', fixed: true }` |
| Object-oriented design | `lld` | omit (learner's preferred language) |

`supports`: `coding` when the learner writes code in the editor, `leetcode` only for DSA-style tracks, `design` for architecture and UML work, `labs` for hands-on infrastructure or backend labs, `project` when the track ends in buildable projects.
