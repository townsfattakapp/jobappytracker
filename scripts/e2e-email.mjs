import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:3000/app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Continue offline/i }).click()
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()

  // First paste creates Notion.
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('heading', { name: /Paste a recruiting email/i }).waitFor()
  await page.getByRole('button', { name: /Try: Applied/i }).click()
  await page.getByText(/No existing match/i).waitFor()
  await page.getByRole('button', { name: 'Add from email' }).click()
  await page.getByText(/Added Notion/i).waitFor()
  console.log('✓ Applied email creates Notion')

  // Same email again matches the existing application and updates it.
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('button', { name: /Try: Applied/i }).click()
  await page.getByText(/Matching application found/i).waitFor()
  await page.getByRole('button', { name: 'Update from email' }).click()
  await page.getByText(/Updated Notion from email/i).waitFor()
  console.log('✓ Applied email updates Notion')

  // Shortlisted creates Stripe with Interview status.
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('button', { name: /Try: Shortlisted/i }).click()
  await page.getByRole('button', { name: 'Add from email' }).click()
  await page.getByText(/Added Stripe/i).waitFor()
  console.log('✓ Shortlisted email creates Stripe')

  await page.getByRole('button', { name: 'Applications', exact: true }).click()
  const stripe = page.locator('.app-row').filter({ hasText: 'Stripe' }).first()
  if ((await stripe.locator('select').inputValue()) !== 'Interview') throw new Error('Stripe should be in Interview')
  const notion = page.locator('.app-row').filter({ hasText: 'Notion' }).first()
  if ((await notion.locator('select').inputValue()) !== 'Applied') throw new Error('Notion should be Applied')
  console.log('✓ Statuses reflected in list view')

  await browser.close()
  console.log('\nEmail import e2e passed.')
}

main().catch((err) => {
  console.error('\nEMAIL E2E FAILED:', err)
  process.exit(1)
})
