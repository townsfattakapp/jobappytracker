import { chromium } from 'playwright'
import fs from 'node:fs'
const base = process.env.BASE_URL || 'http://localhost:3000'
const widths = (process.env.AUDIT_WIDTHS || '280,320,360,390,430,640,768,1024,1440').split(',').map(Number)
const views = ['Command Center', 'Today', 'Goals & Roadmap', 'Explore', 'Job Discovery', 'Enterprise Portals', 'Resume', 'Dashboard', 'Kanban Board', 'Applications', 'Referrals', 'DSA Practice', 'System Design', 'Engineering Labs', 'Mock Interviews', 'Prep Notes', 'Settings']
const dir = 'scratch/responsive-audit'
fs.mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const report = []
async function check(page, width, route) {
  await page.waitForTimeout(250)
  const issues = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const issues = []
    for (const el of document.querySelectorAll('body *')) {
      if (!(el instanceof HTMLElement) || el.closest('nextjs-portal, [aria-hidden="true"], .pointer-events-none')) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue
      // Content inside an actual horizontal scroll region is intentionally wider.
      let scrollable = false
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (['auto', 'scroll'].includes(getComputedStyle(p).overflowX) && p.scrollWidth > p.clientWidth) { scrollable = true; break }
      }
      if (scrollable) continue
      if (r.right > width + 2 || r.left < -2) issues.push({ tag: el.tagName, class: el.className, text: el.textContent?.trim().slice(0, 70), left: Math.round(r.left), right: Math.round(r.right) })
    }
    return issues.slice(0, 15)
  })
  report.push({ width, route, issues })
  console.log(`${issues.length ? 'FAIL' : 'PASS'} ${width} ${route}${issues.length ? ' ' + JSON.stringify(issues.slice(0, 3)) : ''}`)
  if (issues.length || width === 280 || route === 'Command Center') await page.screenshot({ path: `${dir}/${width}-${route.replace(/[^a-z0-9]/gi, '-')}.png` })
}
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: Number(process.env.AUDIT_HEIGHT) || (width < 640 ? 568 : 900) }, hasTouch: width < 768, reducedMotion: 'reduce' })
    const page = await context.newPage()
    for (const route of ['/', '/privacy', '/terms', '/refund', '/contact', '/data-deletion', '/pricing', '/reset-password', '/referrer']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await check(page, width, route)
    }
    await page.goto(base + '/app', { waitUntil: 'networkidle' })
    await check(page, width, 'auth')
    await page.getByRole('button', { name: /Continue offline/i }).click()
    await page.locator('#workspace-content').waitFor()
    for (const view of views) {
      if (width < 768) {
        await page.getByRole('button', { name: 'Open all views drawer', exact: true }).click()
        await page.getByRole('dialog', { name: 'All application views' }).getByRole('button', { name: new RegExp('^' + view.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( Current)?$') }).click()
      } else {
        await page.locator('aside').getByRole('button', { name: new RegExp('^' + view.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( Current)?$') }).click()
      }
      await page.waitForTimeout(600)
      await check(page, width, view)
      if (view === 'Goals & Roadmap') {
        await page.getByRole('button', { name: 'Choose a starting point', exact: true }).click()
        await check(page, width, 'goal-paths')
        await page.getByRole('button', { name: /Software Engineer Interview Preparation/ }).click()
        await page.getByRole('button', { name: 'Customize my plan', exact: true }).click()
        await check(page, width, 'goal-customize')
        await page.getByRole('button', { name: 'Review my plan', exact: true }).click()
        await check(page, width, 'goal-review')
      }
      if (view === 'Applications') {
        await page.getByRole('button', { name: '+ Add application', exact: true }).first().click()
        const dialog = page.getByRole('dialog', { name: 'Add application' }).or(page.locator('form[role="dialog"]'))
        await dialog.waitFor()
        await check(page, width, 'application-form')
        await dialog.getByPlaceholder('Acme Inc.').fill('A very long international company name for a narrow screen')
        await dialog.getByPlaceholder('Frontend Engineer').fill('Senior Software Engineer Platform Infrastructure')
        await dialog.getByRole('tab', { name: 'contacts', exact: true }).click()
        await dialog.getByRole('button', { name: '+ Add contact', exact: true }).click()
        await check(page, width, 'application-contacts')
        await dialog.getByRole('tab', { name: 'interviews', exact: true }).click()
        await dialog.getByRole('button', { name: '+ Add interview round', exact: true }).click()
        await check(page, width, 'application-interviews')
        await dialog.getByRole('button', { name: 'Add application', exact: true }).click()
        await dialog.waitFor({ state: 'hidden' })
        await check(page, width, 'populated-applications')
      }
    }
    if (width < 768) {
      await page.getByRole('button', { name: 'Open all views drawer', exact: true }).click()
      await check(page, width, 'navigation-drawer')
      await page.getByRole('button', { name: 'Close menu' }).click()
      await page.locator('nav[aria-label="Primary"]:visible').getByRole('button', { name: /More/ }).click()
      await check(page, width, 'navigation-sheet')
    }
    await context.close()
  }
} finally {
  fs.writeFileSync(`${dir}/audit-report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}
if (report.some(r => r.issues.length)) process.exitCode = 1
