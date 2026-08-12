import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

const EVOLW_EMAIL = `From: hello@evolw.in
Subject: Application update
Date: Thu, 13 Aug 2026 00:20:00 +0530

Hi VISHWAS,
We wanted to let you know that your application for the Software Engineering Interns position is currently under review by our hiring team.

We appreciate the time you took to apply, and we will get back to you as soon as we have an update.


Best regards,

The Evolw Team`

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.addInitScript(() => localStorage.removeItem('job-app-tracker-v1'))
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Paste email' }).click()
  await page.getByRole('heading', { name: /Paste a recruiting email/i }).waitFor()

  // Prefer Try: Evolw if available, else paste manually
  const tryBtn = page.getByRole('button', { name: /Try: Evolw/i })
  if (await tryBtn.count()) {
    await tryBtn.click()
  } else {
    await page.getByPlaceholder(/Paste the full email/i).fill(EVOLW_EMAIL)
    await page.getByRole('button', { name: 'Extract details' }).click()
  }

  await page.getByText(/Confidence:/i).waitFor()
  const company = page.locator('label').filter({ hasText: /^Company$/ }).locator('input')
  const role = page.locator('label').filter({ hasText: /^Role$/ }).locator('input')
  await company.waitFor()

  const companyVal = await company.inputValue()
  const roleVal = await role.inputValue()
  const statusVal = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'))
    const withUnderReviewSelected = selects.find((el) => el.value === 'Under Review')
    if (withUnderReviewSelected) return withUnderReviewSelected.value
    // fallback: draft status select inside email import (has all statuses, not "All statuses")
    const draft = selects.find(
      (el) =>
        Array.from(el.options).some((o) => o.value === 'Under Review') &&
        !Array.from(el.options).some((o) => o.value === ''),
    )
    return draft?.value ?? ''
  })
  console.log('Extracted in UI →', { company: companyVal, role: roleVal, status: statusVal })

  if (companyVal !== 'Evolw') throw new Error(`Expected Evolw, got ${companyVal}`)
  if (!/Software Engineering Intern/i.test(roleVal)) throw new Error(`Unexpected role: ${roleVal}`)
  if (statusVal !== 'Under Review') throw new Error(`Expected Under Review, got ${statusVal}`)

  await page.getByRole('button', { name: 'Add from email' }).click()
  await page.getByText(/Added Evolw/i).waitFor()

  await page.getByRole('button', { name: 'List' }).click()
  await page.getByRole('button', { name: 'Evolw' }).waitFor()
  await page.getByText('Software Engineering Interns').first().waitFor()

  const listStatus = await page.evaluate(() => {
    const rowBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Evolw'),
    )
    const row = rowBtn?.closest('.app-row')
    const select = row?.querySelector('select.status-select')
    return select instanceof HTMLSelectElement ? select.value : ''
  })
  if (listStatus !== 'Under Review') throw new Error(`List status=${listStatus}`)

  console.log('End-to-end OK: Evolw email → Under Review application in list')
  await browser.close()
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
