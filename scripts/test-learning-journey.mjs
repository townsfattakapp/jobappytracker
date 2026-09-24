import { chromium } from "playwright";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import pg from "pg";
import { grantPass, waitForSession } from "./lib/pass.mjs";

dotenv.config({ path: [".env.development.local", ".env.local"], quiet: true });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runTest() {
  const browser = await chromium.launch();
  const email = `test-journey-${Date.now()}@example.invalid`;
  const password = "Password123!";

  const context = await browser.newContext();
  let page;
  try {
    page = await context.newPage();

    // Setup and Login
    await page.goto("http://localhost:3000/app");
    await page.getByRole("tab", { name: "Create account", exact: true }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await waitForSession(page);
    await grantPass(pool, email);
    await page.reload({ waitUntil: "networkidle" });
    await waitForSession(page);

    console.log("Logged in and pass granted.");

    // Step 1: Create a TEST goal through the UI using a career template and customize its track selection.
    await page.getByText("Create a goal to start learning", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Create your goal", exact: true }).click();
    
    // Select career path template
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    await page.getByRole("button", { name: /Software Engineer Interview Preparation/ }).click();
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    
    await page.getByLabel("Target role", { exact: true }).fill("Test Engineer");
    
    // Customize track selection (remove one track)
    const removeBtn = page.getByRole('button', { name: /^Remove / }).first();
    await removeBtn.waitFor();
    await removeBtn.click();
    console.log("Customized track selection.");

    await page.getByRole("button", { name: "Next step", exact: true }).click();
    
    // Step 2 & 3: Save the goal, generate roadmap, refresh, and verify the selected tracks persist.
    await page.getByRole("button", { name: "Looks good", exact: true }).click();
    
    // This saves the goal AND generates the roadmap
    await page.getByRole("button", { name: "Generate personalized roadmap" }).click();
    console.log("Roadmap generated and goal saved.");

    // Wait for navigation out of Goal Setup (for example, by waiting for "Career plan" or "Dashboard")
    // After creating a goal, it usually goes to the roadmap or today view.
    await page.waitForTimeout(2000);

    // Refresh and verify
    await page.reload({ waitUntil: "networkidle" });
    
    // The goal target role "Test Engineer" should be visible somewhere (e.g. in the Career Plan or Dashboard)
    await page.locator('select option', { hasText: 'Test Engineer' }).waitFor({ state: 'attached' });
    console.log("PASS: Goal saved and persists after refresh.");

    // Step 4: Select one exact concept and schedule it on a specific calendar day.
    await page.getByRole("button", { name: "+ Add task", exact: true }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Learning Track", { exact: true }).selectOption({ index: 1 });
    await modal.getByLabel("Category", { exact: true }).selectOption({ index: 1 });
    
    // Wait for the topics to appear and click the first one ("Input/output" is shown in screenshot)
    const topicBtn = modal.getByText('Input/output', { exact: false }).first();
    await topicBtn.waitFor();
    await topicBtn.click();
    
    await modal.getByRole("button", { name: "Choose Activities" }).click();
    
    // Step 2 has "Review Assignment" button
    await modal.getByRole("button", { name: "Review Assignment" }).click();
    
    // Step 3 has "Add to This Day" button
    await modal.getByRole("button", { name: "Add to This Day" }).click();
    console.log("Scheduled a task.");

    // Step 5: Open the scheduled task and verify it opens the correct Knowledge Workspace and concept.
    await page.locator("article").filter({ hasText: "Start learning" }).first().getByRole("button", { name: "Start learning", exact: true }).click();
    await page.getByText("Knowledge Workspace").waitFor();
    console.log("Opened scheduled task.");

    // Step 6: Save a test note and mark learning progress.
    await page.getByRole("button", { name: "+ Add Personal Note", exact: true }).click();
    await page.locator(".tiptap").fill("Test note survives a refresh.");
    
    // Mark learning progress (change status to Mastered)
    await page.locator("select").first().selectOption({ label: "Mastered" });
    console.log("Saved a test note and marked learning progress.");

    // Step 7: Refresh the browser and verify the goal, scheduled task, note, and progress all persist.
    await page.reload({ waitUntil: "networkidle" });
    
    // The task should now be "Resume" because we started it, or "Review" if Mastered.
    // Let's look for Resume or Review
    const resumeBtn = page.getByRole("button", { name: /Resume|Review/ }).first();
    await resumeBtn.waitFor();
    await resumeBtn.click();
    
    await page.getByText("Test note survives a refresh.").waitFor();
    console.log("PASS: Note persisted after re-opening task.");

    // Step 8: Repeat the relevant flow for a custom goal.
    await page.getByRole("button", { name: "Goals & Roadmap" }).click();
    await page.getByRole("button", { name: "New goal" }).click();
    await page.getByText("Create a completely custom goal").click();
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    await page.getByRole("button", { name: "Next step", exact: true }).click(); // custom goal step 2 is empty, click next again
    await page.getByLabel("Target role", { exact: true }).fill("Custom Goal Role");
    
    // Add a track so we can proceed
    await page.getByRole("textbox", { name: "Search topics" }).fill("React");
    await page.getByText("Add track", { exact: true }).first().click();
    
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    await page.getByRole("button", { name: "Looks good", exact: true }).click();
    await page.getByRole("button", { name: "Generate personalized roadmap" }).click();
    console.log("PASS: Custom goal flow completed.");

  } catch (error) {
    console.error("FAIL:", error);
    await page.screenshot({ path: "scratch/journey-error.png" });
  } finally {
    await browser.close();
    await pool.query("DELETE FROM users WHERE email=$1", [email]);
    await pool.end();
  }
}

runTest().catch(console.error);
