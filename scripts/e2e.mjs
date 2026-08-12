import { chromium } from 'playwright'
import { readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []

  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.addInitScript(() => {
    localStorage.removeItem('job-app-tracker-v2')
    localStorage.removeItem('job-app-tracker-v1')
  })

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /Your job search, organized/i }).waitFor()
  console.log('✓ Empty production start loads')

  await page.getByRole('banner').getByRole('button', { name: 'Add application' }).click()
  await page.getByPlaceholder('Acme Inc.').fill('Stripe')
  await page.getByPlaceholder('Frontend Engineer').fill('Software Engineer')
  await page.getByPlaceholder('Remote · NYC').fill('San Francisco, CA')
  await page.getByPlaceholder('$140k–$170k').fill('$175k–$210k')
  await page.locator('form select').first().selectOption('Applied')
  await page.getByRole('button', { name: 'Add application' }).last().click()
  await page.getByText(/Added Stripe/i).waitFor()
  console.log('✓ Add application works')

  await page.getByRole('button', { name: /^list$/i }).click()
  await page.getByRole('heading', { name: /Applications/i }).waitFor()

  const stripeRow = page.locator('.app-row').filter({ hasText: 'Stripe' }).first()
  await stripeRow.locator('select').selectOption('Offer')
  await page.getByText(/Moved to Offer/i).waitFor()
  console.log('✓ Status change works')

  await stripeRow.getByRole('button', { name: 'Edit' }).click()
  await page.getByPlaceholder('Frontend Engineer').fill('Member of Technical Staff')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.getByText('Member of Technical Staff').first().waitFor()
  console.log('✓ Edit application works')

  await stripeRow.getByRole('button', { name: /^Pin$/i }).click()
  await stripeRow.getByRole('button', { name: /^Unpin$/i }).waitFor()
  console.log('✓ Pin works')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ])
  const exportPath = join(process.cwd(), 'e2e-backup.json')
  await download.saveAs(exportPath)
  const exported = JSON.parse(readFileSync(exportPath, 'utf8'))
  if (!exported.applications?.length) throw new Error('Export JSON missing applications')
  console.log('✓ Export produced', exported.applications.length, 'apps')

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Clear all' }).click()
  await page.getByText(/Pipeline cleared/i).waitFor()

  await page.setInputFiles('input[type="file"]', exportPath)
  await page.getByText(/Imported \d+ applications/i).waitFor()
  console.log('✓ Import restores backup')
  unlinkSync(exportPath)

  const storage = await page.evaluate(() => localStorage.getItem('job-app-tracker-v2'))
  if (!storage || !JSON.parse(storage).applications?.length) {
    throw new Error('localStorage not persisted')
  }
  console.log('✓ localStorage persistence ok')

  const critical = errors.filter((e) => !e.includes('Download is starting'))
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
