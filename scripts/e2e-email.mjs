import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.addInitScript(() => localStorage.removeItem('job-app-tracker-v1'))
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // Notion already exists in sample data — applied email should update it
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('heading', { name: /Paste a recruiting email/i }).waitFor()
  await page.getByRole('button', { name: /Try: Applied/i }).click()
  await page.getByText(/Matching application found/i).waitFor()
  await page.getByRole('button', { name: 'Update from email' }).click()
  await page.getByText(/Updated Notion from email/i).waitFor()
  console.log('✓ Applied email updates Notion')

  // Shortlisted updates Stripe
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('button', { name: /Try: Shortlisted/i }).click()
  await page.getByText(/Matching application found/i).waitFor()
  await page.getByRole('button', { name: 'Update from email' }).click()
  await page.getByText(/Updated Stripe from email/i).waitFor()
  console.log('✓ Shortlisted email updates Stripe')

  // Rejection updates Shopify
  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('button', { name: /Try: Rejected/i }).click()
  await page.getByText(/Matching application found/i).waitFor()
  await page.getByRole('button', { name: 'Update from email' }).click()
  await page.getByText(/Updated Shopify from email/i).waitFor()
  console.log('✓ Rejection email updates Shopify')

  await page.getByRole('button', { name: /^list$/i }).click()
  await page.locator('tr').filter({ hasText: 'Stripe' }).getByText('Interview').first().waitFor()
  await page.locator('tr').filter({ hasText: 'Shopify' }).getByText('Rejected').first().waitFor()
  console.log('✓ Statuses reflected in list view')

  await browser.close()
  console.log('\nEmail import e2e passed.')
}

main().catch((err) => {
  console.error('\nEMAIL E2E FAILED:', err)
  process.exit(1)
})
