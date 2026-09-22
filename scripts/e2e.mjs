import { chromium } from 'playwright'
import { readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:3000/app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const errors = []

  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  // Start from a clean slate once; later reloads must keep data to prove persistence.
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Continue offline/i }).click()
  await page.getByRole('heading', { name: /Create a goal to start learning/i }).waitFor()
  console.log('✓ Empty first run loads and offline mode works')

  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
  await page.getByRole('heading', { name: /Your job search, organized/i }).waitFor()
  await page.getByRole('button', { name: 'Add your first application' }).click()
  await page.getByPlaceholder('Acme Inc.').fill('Stripe')
  await page.getByPlaceholder('Frontend Engineer').fill('Software Engineer')
  await page.getByPlaceholder('Remote · Bengaluru').fill('San Francisco, CA')
  await page.getByPlaceholder('₹15 LPA').fill('$175k–$210k')
  await page.getByPlaceholder('linkedin.com/jobs/view/…').fill('stripe.com/jobs/listing/123')
  await page.getByRole('dialog').locator('select').first().selectOption('Applied')
  await page.getByRole('dialog').getByRole('button', { name: 'Add application' }).click()
  await page.getByText(/Added Stripe/i).waitFor()
  console.log('✓ Add application works (URL normalised without scheme)')

  await page.getByRole('button', { name: 'Applications', exact: true }).click()
  await page.getByRole('heading', { name: /^Applications$/ }).waitFor()

  const stripeRow = page.locator('.app-row').filter({ hasText: 'Stripe' }).first()
  await stripeRow.getByRole('link', { name: 'Open job link' }).waitFor()
  await stripeRow.locator('select').selectOption('Offer')
  await page.getByText(/Moved to Offer/i).waitFor()
  console.log('✓ Status change works')

  await stripeRow.getByRole('button', { name: 'Edit' }).click()
  await page.getByPlaceholder('Frontend Engineer').fill('Member of Technical Staff')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.getByText('Member of Technical Staff').first().waitFor()
  console.log('✓ Edit application works')

  // Validation: empty company must be rejected without leaving the dialog.
  await page.getByRole('button', { name: '+ Add application' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Add application' }).click()
  await page.getByRole('alert').filter({ hasText: /Company and role are required/ }).waitFor()
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
  console.log('✓ Form validation blocks empty submissions')

  await stripeRow.getByRole('button', { name: /^Pin$/i }).click()
  await stripeRow.getByRole('button', { name: /^Unpin$/i }).waitFor()
  console.log('✓ Pin works')

  // Bulk select + bulk status.
  await stripeRow.getByRole('checkbox').check()
  await page.locator('.bulk-bar select').selectOption('Interview')
  await page.getByText(/Updated 1 applications/i).waitFor()
  console.log('✓ Bulk status update works')

  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export backup' }).click(),
  ])
  const exportPath = join(process.cwd(), 'e2e-backup.json')
  await download.saveAs(exportPath)
  const exported = JSON.parse(readFileSync(exportPath, 'utf8'))
  if (!exported.applications?.length) throw new Error('Export JSON missing applications')
  console.log('✓ Export produced', exported.applications.length, 'apps')

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Clear local data' }).click()
  await page.getByText(/Local data cleared/i).waitFor()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()

  page.once('dialog', (d) => d.accept())
  await page.locator('input[type="file"]').first().setInputFiles(exportPath)
  await page.getByText(/Imported 1 applications/i).waitFor()
  console.log('✓ Import restores backup')
  unlinkSync(exportPath)

  await page.waitForTimeout(400)
  const storage = await page.evaluate(() => localStorage.getItem('job-app-tracker-v2'))
  if (!storage || !JSON.parse(storage).applications?.length) {
    throw new Error('localStorage not persisted')
  }
  console.log('✓ localStorage persistence ok')

  // Reload keeps guest mode and data.
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Applications', exact: true }).click()
  await page.locator('.app-row').filter({ hasText: 'Stripe' }).first().waitFor()
  console.log('✓ Guest mode and data survive reload')

  // Mobile layout: bottom nav reaches Settings.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('navigation', { name: 'Primary' }).last().getByRole('button', { name: 'More' }).click()
  await page.getByRole('dialog', { name: 'More menu' }).getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor()
  console.log('✓ Mobile navigation reaches Settings')

  const critical = errors.filter((e) => !e.includes('Download is starting') && !/favicon/i.test(e))
  if (critical.length) {
    console.warn('Console/page errors:', critical)
    throw new Error('Page reported errors')
  }

  await browser.close()
  console.log('\nAll end-to-end checks passed.')
}

main().catch((err) => {
  console.error('\nE2E FAILED:', err)
  process.exit(1)
})
