import { chromium } from "playwright";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import pg from "pg";
import { grantPass, waitForSession } from "./lib/pass.mjs";
dotenv.config({ path: ".env.local", quiet: true });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const browser = await chromium.launch();
const email = `learning-e2e-${Date.now()}@example.invalid`;
const password = "Learning-Test-Only-2026!";
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000/app");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await waitForSession(page);
  // No trial: give the fresh account a pass before using the app.
  await grantPass(pool, email);
  await page.reload({ waitUntil: "networkidle" });
  await waitForSession(page);
  await page
    .getByText("Create a goal to start learning", { exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Create your goal", exact: true })
    .click();
  await page
    .getByLabel("Target role", { exact: true })
    .fill("Cloud Learning Engineer");
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByLabel("Duration (days)", { exact: true }).fill("14");
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page
    .getByRole("button", { name: "Select DSA and Competitive Programming", exact: true })
    .click();
  await page.getByRole("button", { name: "Preview plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Generate Roadmap", exact: true })
    .click();
  await page.getByRole("button", { name: "+ Add task", exact: true }).click();
  const modal = page.getByRole("dialog");
  await modal
    .getByLabel("Learning Track", { exact: true })
    .selectOption("track-dsa");
  await modal
    .getByLabel("Category", { exact: true })
    .selectOption("cat-wzog32ki1");
  await modal
    .getByRole("button", { name: "Input/output", exact: true })
    .click();
  await modal.getByRole("button", { name: "Choose Activities" }).click();
  await modal.getByRole("button", { name: "Review Assignment" }).click();
  await modal.getByRole("button", { name: "Add to This Day" }).click();
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Learn Concept: Input/output", exact: true }) })
    .first()
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await page.getByRole("button", { name: /\+ Add (Personal )?Note/ }).click();
  await page.locator(".tiptap").fill("Cloud note survives a new device.");
  await page.reload();
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.getByText('Cloud note survives a new device.',{exact:true}).waitFor();
  console.log('PASS: immediate authenticated refresh retains task and note');

  await page.screenshot({ path: "scratch/learning-goal-form.png" });
  await page.waitForTimeout(1200);
  const user = (
    await pool.query("SELECT id FROM users WHERE email=$1", [email])
  ).rows[0];
  assert.ok(user);
  const row = (
    await pool.query('SELECT revision FROM career_state WHERE "userId"=$1', [
      user.id,
    ])
  ).rows[0];
  assert.ok(row);
  console.log("PASS: authenticated cloud snapshot created", row);
  const context2 = await browser.newContext();
  const p2 = await context2.newPage();
  await p2.goto("http://localhost:3000/app");
  await p2.getByRole("tab", { name: "Sign in", exact: true }).click();
  await p2.getByLabel("Email", { exact: true }).fill(email);
  await p2.getByLabel("Password", { exact: true }).fill(password);
  await p2.getByRole("button", { name: "Sign in", exact: true }).click();
  await p2.getByText("Loaded from cloud", { exact: true }).waitFor();
  await p2.getByRole("button", { name: "Resume", exact: true }).click();
  await p2.getByRole("heading", { name: /Input\/output/ }).waitFor();
  await p2
    .getByText("Cloud note survives a new device.", { exact: true })
    .waitFor({ timeout: 45000 });
  const data = await p2.evaluate(() =>
    JSON.parse(localStorage.getItem("job-app-tracker-v2")),
  );
  assert.equal(data.goals[0].targetRole, "Cloud Learning Engineer");
  assert.ok(data.roadmap.every((d) => d.goalId === data.goals[0].id));
  console.log(
    "PASS: new goal with stable IDs, task and saved note load on a second device",
  );
  await p2.locator(".tiptap").fill("Newer device note");
  await p2.waitForTimeout(1500);
  // The first device is now behind the cloud revision. Its next save collides,
  // gets merged automatically (latest edit of the same note wins) and succeeds.
  await page.locator(".tiptap").fill("Latest edit from the stale device");
  await page.getByText("Merged changes from another device").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  let snapshot = (
    await pool.query('SELECT payload, revision FROM career_state WHERE "userId"=$1', [
      user.id,
    ])
  ).rows[0];
  assert.match(
    snapshot.payload.knowledgeWorkspaces[0].notes[0].content,
    /Latest edit from the stale device/,
  );
  assert.equal(await page.getByText(/Another device has newer changes/).count(), 0);
  console.log("PASS: stale-device save merged automatically without a conflict error");
  snapshot = snapshot.payload;
  await context2.setOffline(true);
  await p2.locator(".tiptap").fill("Offline note replayed after reconnect");
  await p2.waitForTimeout(900);
  await context2.setOffline(false);
  await p2.waitForTimeout(1500);
  snapshot = (
    await pool.query('SELECT payload FROM career_state WHERE "userId"=$1', [
      user.id,
    ])
  ).rows[0].payload;
  assert.match(
    snapshot.knowledgeWorkspaces[0].notes[0].content,
    /Offline note replayed/,
  );
  console.log(
    "PASS: offline outbox retries on reconnect and merges cleanly",
  );
} finally {
  await browser.close();
  await pool.query("DELETE FROM users WHERE email=$1", [email]);
  await pool.end();
}
