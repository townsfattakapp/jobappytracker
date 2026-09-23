// Two-device sync check: an attempt with code, an approach and the preferred
// code language saved on device A must appear on device B after sign-in.
// Runs against the dev server on port 3000 and the DATABASE_URL in .env.local.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import dotenv from 'dotenv'
import pg from 'pg'
import { grantPass, waitForSession } from './lib/pass.mjs'
dotenv.config({ path: '.env.local', quiet: true })
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const browser = await chromium.launch()
const email = `sync-e2e-${Date.now()}@example.invalid`
const password = 'Sync-Test-Only-2026!'

const open = async (create) => {
  const page = await (await browser.newContext()).newPage()
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })
  if (!create) await page.getByRole('tab', { name: 'Sign in' }).click()
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: create ? 'Create account' : 'Sign in', exact: true }).click()
  await waitForSession(page)
  if (create) {
    // No trial: give the fresh account a pass before using the app.
    await grantPass(pool, email)
    await page.reload({ waitUntil: 'networkidle' })
    await waitForSession(page)
  }
  await page.getByRole('button', { name: 'DSA Practice', exact: true }).first().waitFor({ timeout: 20000 })
  return page
}

try {
  const a = await open(true)
  await a.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await a.getByLabel('Preferred code language').selectOption('Python')
  await a.getByRole('button', { name: 'DSA Practice', exact: true }).first().click()
  await a.getByText('Two Sum', { exact: true }).first().click()
  await a.locator('.monaco-editor .view-lines').waitFor({ timeout: 60000 })
  assert.equal(await a.getByLabel('Code language').inputValue(), 'python', 'editor follows the preference')
  await a.getByRole('button', { name: 'Start from template' }).first().click()
  await a.getByPlaceholder('How did you solve it? Any bottlenecks?').fill('Hash map complement lookup, synced from device A')
  await a.getByRole('button', { name: 'Save attempt' }).click()
  await a.getByText('synced from device A').first().waitFor()
  await a.waitForTimeout(3000)

  const row = (await pool.query('SELECT payload FROM career_state WHERE "userId"=(SELECT id FROM users WHERE email=$1)', [email])).rows[0]
  assert.ok(row, 'cloud row exists')
  assert.ok(String(row.payload.learningHistory || '').includes('Hello from Python'), 'cloud history holds the code')
  assert.equal(row.payload.preferences?.codeLanguage, 'Python', 'cloud holds the language preference')
  console.log('PASS: attempt code, approach and preference reached the cloud')

  const b = await open(false)
  await b.getByRole('button', { name: 'DSA Practice', exact: true }).first().click()
  await b.getByText('Two Sum', { exact: true }).first().click()
  await b.getByText('synced from device A').first().waitFor({ timeout: 15000 })
  assert.equal(await b.getByText('Attempt details not on this device').count(), 0)
  await b.locator('.monaco-editor .view-lines').waitFor({ timeout: 60000 })
  assert.equal(await b.getByLabel('Code language').inputValue(), 'python', 'device B picked up the preference')
  console.log('PASS: device B sees the attempt and the preferred language')
} finally {
  await pool.query('DELETE FROM users WHERE email=$1', [email]).catch(() => {})
  await pool.end()
  await browser.close()
}
console.log('Sync e2e passed.')
