# Prep by EVOLW

A single-page job-search workspace built with Next.js 16, React 19 and PostgreSQL.

- **Job tracker**: kanban and table views, follow-up reminders, contacts and interview rounds, bookmarklet import, paste-an-email import, optional read-only Gmail sync.
- **Career plan**: goals with day-by-day roadmaps generated from a built-in curriculum (DSA, Java, JS, React, Node, SQL, HLD/LLD, CS, DevOps), a Today view, and per-topic knowledge workspaces (notes, examples, diagrams, code, quizzes, revision).
- **Engineering hub**: DSA problems with an in-browser code runner, system-design exercises with Mermaid diagrams, engineering-lab tickets with an AI mentor, and AI mock interviews.
- **Local-first**: everything works signed out and is stored in the browser. Signing in syncs a versioned snapshot to PostgreSQL with conflict detection.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate           # creates the tables
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL` the app still runs in local-only mode; sign-in and cloud sync need the database.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | server | PostgreSQL connection string (include `sslmode=require` for hosted databases). |
| `AUTH_SECRET` | server | Signs session tokens. Generate with `openssl rand -base64 32`. `NEXTAUTH_SECRET` is also accepted. |
| `GROQ_API_KEY` / `OPENAI_API_KEY` | server, optional | Shared AI keys. Only signed-in users can use them; anyone can instead add a personal key in Settings, which stays in their browser. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public, optional | Google OAuth *web* client ID with the Gmail API enabled and your origin under authorized JavaScript origins. Enables Gmail sync. |

## Curriculum content

The learning tracks live in `src/data/curriculum/`. The generated `<track>.ts` files hold the structure (ids, categories, task templates) and must keep their ids, because saved workspaces and plans reference them. Authored content sits in `src/data/curriculum/content/<track>.ts`: per category, one tuple per topic with a description, three concept titles and quiz questions, plus `add` (new topics) and `retitle` (renames that keep ids). `applyContent` in `enrich.ts` merges the two at load time.

```bash
npm run curriculum:audit   # counts and gaps per track (missing descriptions, quizzes, duplicates)
npm run curriculum:check   # every content entry matches a real category and topic
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev server, production build, production server. |
| `npm run check` | Typecheck, lint and build. Run before deploying. |
| `npm run test:e2e` | Playwright smoke test of the job tracker against a running dev server. |
| `npm run test:learning` | Playwright test of the learning workflow (goal, tasks, workspace, offline reload). |
| `npm run test:learning:domain` | Pure-logic tests for the planner. |
| `npm run test:learning:cloud` | Real sign-up, save and cross-device restore against the configured database. |
| `npm run db:migrate` | Applies Drizzle migrations from `src/lib/db/migrations`. |

## Accounts and data

- Accounts use email + password. Passwords are hashed with scrypt on the server. There is no password reset flow yet.
- Each user's data is one JSONB document in `career_state` with an optimistic revision counter. If two devices write conflicting changes, the app keeps the local copy and offers a backup download and a "use cloud copy" option.
- Code attempts, design write-ups, interview transcripts and note attachments (files up to 1 MB each, 12 MB per account) are stored in IndexedDB and included in the cloud snapshot, so a second device gets them on sign-in. Larger files stay on the device that uploaded them.
- The preferred code language syncs with the account. Theme, personal AI keys, tutor chats and unsaved drafts stay on the device.
- Settings has full backup export/import and a "clear local data" action.

## Deploying

The app is a Next.js server (auth, Postgres sync, AI gateway and code-runner routes), so it needs a Node host. It cannot run on GitHub Pages or any static host. The recommended stack is **Vercel + Neon Postgres**; any Node host works the same way.

### 1. Database (once)

1. Create a free Postgres database (for example at [neon.tech](https://neon.tech)) and copy its connection string. Keep `sslmode=require`.
2. Locally, put it in `.env.local` as `DATABASE_URL` and run:

   ```bash
   npm run db:migrate
   ```

   Re-run this whenever `src/lib/db/migrations` changes.

### 2. Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js; keep the defaults.
2. Under **Settings → Environment Variables** add, for Production (and Preview if you want it):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `GROQ_API_KEY` / `OPENAI_API_KEY` | optional shared AI keys for signed-in users |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | optional; enables Gmail sync |
   | `CODE_RUNNER_URL` | optional self-hosted Piston endpoint |

3. Deploy. Vercel runs the `vercel-build` script, which applies pending database migrations and then builds, so the schema is always in step with the code. Every push to `main` becomes a production deployment; pull requests get preview URLs. The `CI` workflow runs typecheck, lint and build on every push and pull request.
4. If you use Gmail sync, add the production origin (for example `https://your-app.vercel.app`) to the OAuth client's **Authorized JavaScript origins** in Google Cloud.

Or from the command line:

```bash
npx vercel link          # once
npx vercel env pull      # optional: writes .env.local from the project
npx vercel --prod        # deploy the current working tree to production
```

### Other Node hosts (Railway, Render, Fly, a VPS)

Set the same environment variables, then:

```bash
npm ci
npm run db:migrate
npm run build
npm start        # listens on $PORT, default 3000
```

`AUTH_TRUST_HOST` is already enabled in the auth config, so no `NEXTAUTH_URL` is required.

### Production checklist

- `npm run check` passes (typecheck, lint, build).
- `AUTH_SECRET` is set and not shared with any other app.
- `.env.local` is never committed (it is git-ignored).
- The database has been migrated.
- The old GitHub Pages site, if still enabled, should be turned off in the repository settings; it served the previous static build and is no longer updated.
