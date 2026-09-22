import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const today = new Date().toLocaleDateString("en-CA");
const goal = {
  id: "learning-e2e",
  targetRole: "Learning Test Engineer",
  companyType: "Product",
  startDate: "2026-09-22",
  durationDays: 120,
  hoursPerDay: 4,
  restDays: [],
  tracks: [{ trackId: "track-dsa", priority: "High" }],
  status: "Active",
  goalType: "Fixed",
  createdAt: today,
  updatedAt: today,
};
await page.goto("http://localhost:3000/app", { waitUntil: "networkidle" });
await page.evaluate((g) => {
  localStorage.setItem(
    "job-app-tracker-v2",
    JSON.stringify({
      applications: [],
      version: 1,
      goals: [g, { ...g, id: "second-goal", targetRole: "Second Goal" }],
      roadmap: [],
      knowledgeWorkspaces: [],
    }),
  );
}, goal);
await page.reload({ waitUntil: "networkidle" });
await page
  .getByRole("button", { name: "Continue offline (local only)" })
  .click();
await page
  .getByRole("button", { name: "Goals & Roadmap", exact: true })
  .click();
await page.getByLabel("Select date").fill("2026-09-22");
await page
  .getByText("No tasks planned for this day yet.", { exact: true })
  .waitFor();
await page.getByRole("button", { name: "+ Add task", exact: true }).click();
const modal = page.getByRole("dialog");
await modal
  .getByLabel("Learning Track", { exact: true })
  .selectOption("track-dsa");
await modal
  .getByLabel("Category", { exact: true })
  .selectOption("cat-wzog32ki1");
await modal.getByRole("button", { name: "Input/output", exact: true }).click();
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal.getByLabel("Learn Concept duration", { exact: true }).fill("30");
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByRole("button", { name: "Add to This Day" }).dblclick();
await page
  .getByRole("heading", { name: "Learn Concept: Input/output", exact: true })
  .waitFor();
assert.equal(await page.locator("article").count(), 1);
await page.reload({ waitUntil: "networkidle" });
// Guest mode is remembered, so the offline prompt only appears on a fresh profile.
const offline = page.getByRole("button", {
  name: "Continue offline (local only)",
});
if (await offline.isVisible().catch(() => false)) await offline.click();
await page
  .getByRole("button", { name: "Goals & Roadmap", exact: true })
  .click();
await page.getByLabel("Select date").fill("2026-09-22");
await page
  .getByRole("heading", { name: "Learn Concept: Input/output", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Start learning", exact: true }).click();
await page
  .getByRole("heading", { name: /Input\/output/ })
  .waitFor();
await page.getByRole("button", { name: /\+ Add (Personal )?Note/ }).click();
await page
  .locator(".tiptap")
  .fill("Read input with a buffered reader.");
await page.getByRole("button", { name: /^← Back/ }).first().click();
await page.getByRole("button", { name: "Mark as completed", exact: true }).click();
await page.getByText(/1 \/ 1 tasks done/).waitFor();
await page.locator("article summary").filter({ hasText: "More" }).first().click();
await page
  .getByRole("button", { name: "Schedule revision tomorrow", exact: true })
  .click();
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByRole("button", { name: "Add to This Day" }).click();
await page
  .getByRole("heading", { name: "Revise Topic: Input/output" })
  .waitFor();
let saved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("job-app-tracker-v2")),
);
assert.equal(saved.roadmap.flatMap((d) => d.tasks).length, 2);
assert.match(saved.knowledgeWorkspaces[0].notes[0].content, /buffered reader/);
assert.notEqual(saved.knowledgeWorkspaces[0].learningStatus, "Mastered");
await page.getByLabel("Select date").fill("2026-09-24");
await page
  .getByRole("button", { name: "Mark as rest day", exact: true })
  .click();
await page
  .getByText("Rest day. Nothing planned.", { exact: true })
  .waitFor();
await page
  .getByRole("button", { name: "Make it a study day", exact: true })
  .click();
await page
  .getByText("No tasks planned for this day yet.", { exact: true })
  .waitFor();
await page
  .getByRole("button", { name: /Generate day plan/ })
  .click();
await page.getByRole("button", { name: "Confirm plan", exact: true }).click();
assert.ok((await page.locator("article").count()) > 0);
await page.getByLabel("Goal", { exact: true }).selectOption("second-goal");
assert.equal(await page.locator("article").count(), 0);
assert.deepEqual(errors, []);
console.log(
  "PASS: empty day, topic hierarchy, duplicate prevention, immediate save/reload, correct lesson, saved note, completion, revision, explicit rest toggle, generated plan, goal isolation",
);

// A rest day can contain optional study; a topic with no subtopics stays selectable.
await page
  .getByRole("button", { name: "Mark as rest day", exact: true })
  .click();
await page
  .getByRole("button", { name: /Add an optional task/ })
  .click();
await modal
  .getByLabel("Learning Track", { exact: true })
  .selectOption("track-dsa");
await modal
  .getByLabel("Category", { exact: true })
  .selectOption("cat-wzog32ki1");
await modal.getByRole("button", { name: "Variables and Data Types", exact: true }).click();
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByRole("button", { name: "Add to This Day" }).click();
await page
  .getByRole("heading", { name: "Learn Concept: Variables and Data Types" })
  .waitFor();
await page.locator("article summary").filter({ hasText: "More" }).first().click();
await page
  .getByRole("button", { name: "Edit / reschedule", exact: true })
  .click();
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByLabel("Scheduled date", { exact: true }).fill("2026-09-25");
await modal.getByRole("button", { name: "Save Changes" }).click();
await page
  .getByRole("heading", { name: "Learn Concept: Variables and Data Types" })
  .waitFor();
await page.locator("article summary").filter({ hasText: "More" }).first().click();
if (
  !(await page
    .getByLabel("Actual study time (minutes)", { exact: true })
    .isVisible())
)
  await page.locator("article summary").filter({ hasText: "More" }).first().click();
await page
  .getByLabel("Actual study time (minutes)", { exact: true })
  .fill("75");
await page.getByRole("button", { name: "Mark as completed", exact: true }).click();
await page.getByText(/75 min logged/).first().waitFor();
// Offline edits stay local without a network request.
await context.setOffline(true);
await page.getByRole("button", { name: "+ Add task", exact: true }).click();
await modal.getByLabel("Task source").selectOption("custom");
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByLabel("Task title", { exact: true }).fill("Offline study");
await modal.getByRole("button", { name: "Add to This Day" }).click();
assert.ok(
  (
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("job-app-tracker-v2")),
    )
  ).roadmap.some((d) => d.tasks.some((t) => t.title === "Offline study")),
);
await context.setOffline(false);
await page.getByLabel("Goal", { exact: true }).selectOption("learning-e2e");
await page.getByLabel("Select date").fill("2026-09-22");
const menu = page.locator("[data-task] details").first();
if (!(await menu.getAttribute("open"))) {
  if (
    !(await page
      .getByRole("button", { name: "Delete task", exact: true })
      .isVisible())
  )
    await menu.locator("summary").click();
}
page.once("dialog", (dialog) => dialog.accept());
await page.getByRole("button", { name: "Delete task", exact: true }).click();
assert.match(
  (
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("job-app-tracker-v2")),
    )
  ).knowledgeWorkspaces[0].notes[0].content,
  /buffered reader/,
);
await page.getByRole("button", { name: "+ Add task", exact: true }).click();
await modal
  .getByLabel("Learning Track", { exact: true })
  .selectOption("track-dsa");
await modal
  .getByLabel("Category", { exact: true })
  .selectOption("cat-wzog32ki1");
await modal.getByRole("button", { name: "Input/output", exact: true }).click();
await modal.getByRole("button", { name: "Choose Activities" }).click();
await modal
  .getByRole("checkbox", { name: "Learn Concept", exact: true })
  .uncheck();
await modal
  .getByRole("checkbox", { name: "Solve DSA / LeetCode Problems", exact: true })
  .check();
await modal.getByRole("button", { name: "Review Assignment" }).click();
await modal.getByLabel(/linked activity/).selectOption("dsa-two-sum-ii");
await modal.getByRole("button", { name: "Add to This Day" }).click();
await page.getByRole("button", { name: "Start learning", exact: true }).click();
await page.getByRole("heading", { name: "Two Sum II", exact: true }).waitFor();
assert.match(
  await page.getByRole("link", { name: /LeetCode/ }).getAttribute("href"),
  /two-sum-ii-input-array-is-sorted/,
);
await page.getByRole("button", { name: /^← Back/ }).first().click();
console.log("PASS: exact DSA problem workspace and matching LeetCode URL");
await page.getByLabel('Select date').fill('2026-09-26');
await page.getByRole('button',{name:'+ Add task',exact:true}).click();
await modal.getByLabel('Learning Track',{exact:true}).selectOption('track-dsa');
await modal.getByLabel('Category',{exact:true}).selectOption('cat-wzog32ki1');
await modal.getByRole('button',{name:'Input/output',exact:true}).click();
await modal.getByRole('button',{name:'Choose Activities'}).click();
await modal.getByRole('checkbox',{name:'Draw Diagram / Flowchart',exact:true}).check();
await modal.getByRole('checkbox',{name:'Write Personal Notes',exact:true}).check();
await modal.getByRole('button',{name:'Review Assignment'}).click();
await modal.getByRole('button',{name:'Add Multiple Tasks'}).click();
assert.equal(await page.locator('[data-task]').count(),3);
await page.locator('[data-task]').filter({has:page.getByRole('heading',{name:'Write Personal Notes: Input/output',exact:true})}).getByRole('button',{name:'Open',exact:true}).click();
await page.getByRole('button',{name:/\+ Add (Personal )?Note/}).waitFor();
await page.getByRole('button',{name:/^← Back/}).first().click();
const finalState=await page.evaluate(()=>JSON.parse(localStorage.getItem('job-app-tracker-v2')));
assert.equal(finalState.roadmap.filter(d=>d.date.startsWith('2026-09-26')).flatMap(d=>d.tasks).length,3);
console.log('PASS: multiple activities become separate tasks and open the matching workspace tab');
await page.screenshot({
  path: "scratch/learning-workflow.png",
  fullPage: true,
});
assert.deepEqual(errors, []);
console.log(
  "PASS: optional rest-day study, no-subtopic topic, rescheduling, actual time beyond estimate, offline task persistence",
);
await browser.close();
