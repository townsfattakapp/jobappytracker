// Captures the product screenshots used on the marketing page into public/screens.
// Needs the dev server on port 3000. Run: npm run screens
import { chromium } from 'playwright'
import fs from 'node:fs'
import dotenv from 'dotenv'
import pg from 'pg'
import { grantPass } from './lib/pass.mjs'
dotenv.config({ path: '.env.local', quiet: true })
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
fs.mkdirSync('public/screens', { recursive: true })

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, colorScheme: 'dark' })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const shot = async (name) => {
  // Let toasts fade, hide dev-only chrome, and show a friendly account name instead of the test email.
  await page.waitForTimeout(3600)
  await page.evaluate(() => {
    if (!document.getElementById('shot-css')) {
      const css = document.createElement('style')
      css.id = 'shot-css'
      css.textContent = 'nextjs-portal, [data-nextjs-toast], [data-next-badge-root], #__next-build-watcher { display: none !important; } .toast, [role="status"] { display: none !important; } .tutor-status.is-off, .tutor [class*="border-amber-500"], main [class*="bg-amber-500/10"] { display: none !important; }'
      document.head.appendChild(css)
    }
    for (const el of document.querySelectorAll('p, span, div')) {
      if (el.children.length === 0 && /^screens-\d+@example\.invalid$/.test(el.textContent.trim())) el.textContent = 'you@evolw.in'
    }
  })
  await page.screenshot({ path: `public/screens/${name}.jpg`, type: 'jpeg', quality: 82 })
  console.log('captured', name)
}
const today = new Date().toLocaleDateString('en-CA')
const waitForSession = async (page, timeoutMs = 45000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const session = await page.evaluate(() => fetch('/api/auth/session').then((r) => r.json()).catch(() => null))
    if (session && session.user && session.user.id) return session
    await page.waitForTimeout(500)
  }
  throw new Error('Signed-in session did not appear in time')
}
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString()
const app = (company, role, status, days, extra = {}) => ({
  id: `app-${company.toLowerCase().replace(/\W+/g, '-')}`,
  company,
  role,
  jobUrl: '',
  location: extra.location || 'Bengaluru · Hybrid',
  salary: null,
  appliedDate: daysAgo(days).slice(0, 10),
  source: extra.source || 'LinkedIn',
  notes: extra.notes || '',
  status,
  followUpDate: extra.followUpDate || null,
  createdAt: daysAgo(days),
  updatedAt: daysAgo(Math.max(0, days - 2)),
  pinned: Boolean(extra.pinned),
  interviewRounds: [],
  contacts: [],
})
const applications = [
  app('Meridian Pay', 'Backend Engineer II', 'Interview', 9, { pinned: true, notes: 'Round 2 on Thursday: system design, 60 min.', interviewDate: daysAgo(-2).slice(0, 10) }),
  app('Kestrel AI', 'Software Engineer, Platform', 'Assessment', 6, { location: 'Remote · India' }),
  app('Harbor Commerce', 'Full Stack Engineer', 'Applied', 3),
  app('Orbital Health', 'SDE 2', 'HR Round', 14, { location: 'Hyderabad' }),
  app('Loom Systems', 'Frontend Engineer', 'Under Review', 5, { source: 'Referral' }),
  app('Fable Studio', 'Senior Software Engineer', 'Offer', 21, { notes: 'Offer received; deciding by Friday.' }),
  app('Northwind Labs', 'Backend Engineer', 'Rejected', 30),
]
const workspaces = [
  {
    topicId: 'top-2fofb6p5i', learningStatus: 'Learning', confidence: 3, lastStudiedAt: daysAgo(0), notes: [], diagrams: [], mistakes: ['Forgetting to flush buffered output — Why: PrintWriter buffers until flush or close — Fix: call out.flush() before the program exits'], quizAnswers: {},
    examples: [
      { id: 'e1', title: 'Sum of Two Numbers', problemStatement: 'Read two integers separated by a space and print their sum.', inputOutput: '3 5\n8', explanation: '1. Create a BufferedReader on System.in.\n2. Read the line and split it with StringTokenizer.\n3. Parse both tokens to int.\n4. Add them and print with PrintWriter.\n5. Flush the writer before exiting.', implementationCode: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int a = Integer.parseInt(st.nextToken());\n        int b = Integer.parseInt(st.nextToken());\n        PrintWriter out = new PrintWriter(System.out);\n        out.println(a + b);\n        out.flush();\n    }\n}', implementationLanguage: 'java', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', commonMistakes: 'Forgetting to call flush() leaves the output buffered and invisible.' },
      { id: 'e2', title: 'Sum of N Numbers', problemStatement: 'Given N and then N space-separated integers, print their sum.', inputOutput: '4\n10 20 30 40\n100', explanation: '1. Read N from the first line.\n2. Tokenize the second line.\n3. Accumulate into a long to avoid overflow.\n4. Print the total.', implementationCode: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(br.readLine().trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long sum = 0;\n        for (int i = 0; i < n; i++) sum += Integer.parseInt(st.nextToken());\n        System.out.println(sum);\n    }\n}', implementationLanguage: 'java', timeComplexity: 'O(N)', spaceComplexity: 'O(1)' },
    ],
    codeSnippets: [],
    flashcards: [
      { id: 'c1', front: 'Why is Scanner slow for 10^6 numbers?', back: 'It parses with regular expressions per token. BufferedReader plus StringTokenizer reads whole lines and is far faster.', easeFactor: 2.5, interval: 1, dueDate: today },
      { id: 'c2', front: 'What does `br.readLine()` return at end of input?', back: 'null, so loop until readLine() returns null to read until EOF.', easeFactor: 2.5, interval: 3, dueDate: today },
      { id: 'c3', front: 'What happens if you never flush a PrintWriter?', back: 'Output may stay in the buffer and never appear; call flush() or close() before exit.', easeFactor: 2.6, interval: 7, dueDate: today },
    ],
  },
  {
    topicId: 'top-hld-case-studies-part-2-google-drive-design', learningStatus: 'Learning', confidence: 2, lastStudiedAt: daysAgo(1), examples: [], codeSnippets: [], flashcards: [], mistakes: [], quizAnswers: {},
    notes: [{ id: 'n1', title: 'AI design walkthrough: Google Drive — deep dive: Chunking and dedup', content: '<h2>Problem and scope: Google Drive</h2><p>Google Drive keeps every file a user owns available on every device, always at the latest version, with sharing and history. The promise is <strong>any file, on every device, never lost</strong>.</p><h3>Functional requirements</h3><ul><li>Upload and download files up to 10 GB from web, desktop and mobile</li><li>Sync changes across devices within seconds</li><li>Version history and restore</li><li>Share with people and links, with permissions</li></ul><h3>Non-functional</h3><ul><li>Durability 11 nines; availability 99.99% for metadata</li><li>Strong consistency for metadata, eventual for chunk replication</li></ul>', attachments: [], createdAt: daysAgo(1), updatedAt: daysAgo(1) }],
    diagrams: [
      { id: 'd1', title: 'High-level architecture', type: 'Architecture', creationMethod: 'ai', createdAt: daysAgo(1), updatedAt: daysAgo(1), mermaidCode: 'flowchart LR\n  C["Desktop / mobile / web clients"] --> LB["Load balancer"]\n  LB --> GW["API gateway"]\n  GW --> META["Metadata service"]\n  GW --> UP["Upload service"]\n  UP --> CH["Chunker + dedup"]\n  CH --> IDX["Chunk index (hash → location)"]\n  CH --> OBJ["Object storage (chunks)"]\n  META --> DB["Metadata DB (files, versions, ACLs)"]\n  META --> Q["Change queue"]\n  Q --> NOTIF["Notification service"]\n  NOTIF --> C\n  OBJ --> CDN["CDN for downloads"]' },
      { id: 'd2', title: 'Upload and sync', type: 'Sequence', creationMethod: 'ai', createdAt: daysAgo(1), updatedAt: daysAgo(1), mermaidCode: 'sequenceDiagram\n  participant Client\n  participant Upload as Upload service\n  participant Index as Chunk index\n  participant Store as Object storage\n  participant Meta as Metadata service\n  Client->>Client: split file into 4 MB chunks, hash each\n  Client->>Upload: init upload (file, chunk hashes)\n  Upload->>Index: which hashes are new?\n  Index-->>Upload: missing hashes\n  Upload-->>Client: upload only missing chunks\n  Client->>Store: PUT chunk bytes\n  Client->>Upload: finalize (manifest)\n  Upload->>Meta: write manifest + new version\n  Meta-->>Client: version id\n  Meta->>Client: notify other devices' },
    ],
  },
]
const storage = { applications, version: 1, prepNotes: [], goals: [], roadmap: [], knowledgeWorkspaces: workspaces }

await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })
await page.evaluate((s) => {
  localStorage.clear()
  localStorage.setItem('job-app-theme', 'dark')
  localStorage.setItem('jobappy-code-language', 'Java')
  localStorage.setItem('job-app-tracker-v2', JSON.stringify(s))
}, storage)
await page.reload({ waitUntil: 'networkidle' })
// A real (temporary) account, so the code runner and sync behave as they do for subscribers.
const email = `screens-${Date.now()}@example.invalid`
await page.getByLabel('Email', { exact: true }).fill(email)
await page.getByLabel('Password', { exact: true }).fill('Screens-Only-2026!')
await page.getByRole('button', { name: 'Create account', exact: true }).click()
await waitForSession(page)
// No trial: the temporary account gets a pass so screenshots show the paid product.
await grantPass(pool, email, { planId: 'year', days: 365 })
await page.reload({ waitUntil: 'networkidle' })
await waitForSession(page)

// Goal wizard → track picker → generate a real plan
await page.getByRole('button', { name: 'Today', exact: true }).first().click()
await page.getByText('Create a goal to start learning', { exact: true }).waitFor()
await page.getByRole('button', { name: 'Create your goal', exact: true }).click()
await page.getByLabel('Target role', { exact: true }).fill('Backend Engineer at a product company')
await page.getByRole('button', { name: 'Next Step', exact: true }).click()
await page.getByLabel('Duration (days)', { exact: true }).fill('90')
await page.getByLabel('Study hours per active day', { exact: true }).fill('2')
await page.getByRole('button', { name: 'Next Step', exact: true }).click()
await page.getByRole('button', { name: 'Select DSA and Competitive Programming', exact: true }).click()
await page.getByRole('button', { name: 'Select High-Level System Design (HLD)', exact: true }).click()
await page.getByRole('button', { name: 'Select Core Java, OOP and Collections', exact: true }).click()
await shot('goal')
await page.getByRole('button', { name: 'Preview plan', exact: true }).click()
await page.getByRole('button', { name: 'Generate Roadmap', exact: true }).click()
await page.waitForTimeout(800)
await page.getByRole('button', { name: 'Today', exact: true }).first().click()
await page.waitForTimeout(600)
await shot('today')

// Dashboard
await page.getByRole('button', { name: 'Dashboard', exact: true }).first().click()
await page.waitForTimeout(600)
await shot('dashboard')

// Topic workspace: Input/output (seeded examples, flashcards)
await page.getByRole('button', { name: 'Goals & Roadmap', exact: true }).first().click()
await page.getByLabel('Select date').fill(today)
await page.getByRole('button', { name: '+ Add task', exact: true }).click()
let modal = page.getByRole('dialog')
await modal.getByLabel('Learning Track', { exact: true }).selectOption('track-dsa')
await modal.getByLabel('Category', { exact: true }).selectOption('cat-wzog32ki1')
await modal.getByRole('button', { name: 'Input/output', exact: true }).click()
await modal.getByRole('button', { name: 'Choose Activities' }).click()
await modal.getByRole('button', { name: 'Review Assignment' }).click()
await modal.getByRole('button', { name: 'Add to This Day' }).click()
await page.locator('article').filter({ hasText: 'Input/output' }).first().getByRole('button', { name: /Start learning|Resume|Review/ }).first().click()
await page.getByRole('heading', { name: /Input\/output/ }).waitFor()
await page.waitForTimeout(600)
await shot('workspace')
await page.getByRole('button', { name: /^Examples/ }).click()
await page.waitForTimeout(600)
await shot('examples')
await page.getByRole('button', { name: /^Revision/ }).click()
await page.getByRole('button', { name: /Study 3 due cards/ }).click()
await page.waitForTimeout(500)
await shot('flashcards')

// Tutor with a seeded conversation
await page.evaluate(() => {
  sessionStorage.setItem('jobappy-tutor:general:Input/output', JSON.stringify([
    { role: 'user', content: 'Explain this from zero: definition first, then how it works.', display: '📖 Explain from zero' },
    { role: 'assistant', content: '## What is standard input?\n\n**Standard input (stdin)** is the stream your program reads from. On a judge it is the test file; in a terminal it is your keyboard.\n\n- Read it in **big chunks**, not character by character.\n- In Java, wrap `System.in` in a `BufferedReader`.\n\n```java\nBufferedReader br = new BufferedReader(new InputStreamReader(System.in));\nString line = br.readLine();\n```\n\nQuick recap: read whole lines, split them, parse once.' },
    { role: 'user', content: 'Quiz me with 3 questions on this topic, one at a time.', display: '🎯 Quiz me' },
    { role: 'assistant', content: '**Question 1 of 3.** You need to read one million integers. Which is faster in Java, and why: `Scanner` or `BufferedReader` with `StringTokenizer`?\n\nTake your time; answer in one or two lines and I will check it.' },
  ]))
})
await page.getByRole('button', { name: /^Concepts/ }).click()
await page.getByRole('button', { name: /Ask AI Tutor/ }).click()
await page.waitForTimeout(900)
await shot('tutor')
await page.getByRole('button', { name: 'Close tutor' }).click()

// HLD workspace with diagrams
await page.getByRole('button', { name: 'Goals & Roadmap', exact: true }).first().click()
await page.getByLabel('Select date').fill(today)
await page.getByRole('button', { name: '+ Add task', exact: true }).click()
modal = page.getByRole('dialog')
await modal.getByLabel('Learning Track', { exact: true }).selectOption('track-hld')
await modal.getByLabel('Category', { exact: true }).selectOption({ label: 'Case Studies Part 2' })
await modal.getByRole('button', { name: 'Google Drive design', exact: true }).click()
await modal.getByRole('button', { name: 'Choose Activities' }).click()
await modal.getByRole('button', { name: 'Review Assignment' }).click()
await modal.getByRole('button', { name: 'Add to This Day' }).click()
await page.locator('article').filter({ hasText: 'Google Drive design' }).first().getByRole('button', { name: /Start learning|Resume|Review/ }).first().click()
await page.getByRole('heading', { name: /Google Drive design/ }).waitFor()
await page.getByRole('button', { name: /^Diagrams/ }).click()
await page.waitForTimeout(1800)
await shot('hld')

// Mock interview setup
await page.getByRole('button', { name: 'Mock Interviews', exact: true }).first().click()
await page.getByRole('heading', { name: 'Set up your round' }).waitFor()
await page.getByRole('button', { name: /System design \(HLD\)/ }).click()
await page.getByRole('button', { name: /Meera/ }).click()
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(500)
await shot('mock')

// Code runner
await page.getByRole('button', { name: 'DSA Practice', exact: true }).first().click()
await page.getByText('Two Sum', { exact: true }).first().click()
await page.locator('.monaco-editor .view-lines').waitFor({ timeout: 60000 })
await page.evaluate(() => window.monaco.editor.getModels()[0].setValue('import java.util.*;\n\nclass Main {\n    static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int need = target - nums[i];\n            if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));\n    }\n}'))
await page.getByPlaceholder('How did you solve it? Any bottlenecks?').fill('One pass with a hash map of value → index; check the complement before inserting.')
await page.getByRole('button', { name: /^Run$/ }).click()
await page.locator('.runner-badge', { hasText: /Exit/ }).waitFor({ timeout: 90000 })
await shot('runner')

console.log('errors', errors)
await pool.query('DELETE FROM users WHERE email=$1', [email]).catch(() => {})
await pool.end()
await browser.close()
