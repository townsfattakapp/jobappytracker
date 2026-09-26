import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [
  { name: '320x568-mobile-small', width: 320, height: 568 },
  { name: '360x800-mobile-s20', width: 360, height: 800 },
  { name: '375x812-mobile-iphone-x', width: 375, height: 812 },
  { name: '390x844-mobile-iphone-14', width: 390, height: 844 },
  { name: '430x932-mobile-promax', width: 430, height: 932 },
  { name: '768x1024-tablet-portrait', width: 768, height: 1024 },
  { name: '1024x768-tablet-landscape', width: 1024, height: 768 },
  { name: '1280x800-laptop', width: 1280, height: 800 },
  { name: '1440x900-desktop', width: 1440, height: 900 },
];

const SHOTS_DIR = 'scratch/responsive-audit';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

async function detectOverflow(page, routeName, vp) {
  return await page.evaluate(({ routeName, vp }) => {
    const docEl = document.documentElement;
    const body = document.body;
    const winWidth = window.innerWidth;
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    const hasDocOverflow = scrollWidth > winWidth + 1;

    // Scan all visible elements to find which specific elements overflow the viewport
    const overflowingElements = [];
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      // Exclude pre, code, svg paths, or elements explicitly designed to scroll horizontally
      if (['PRE', 'CODE'].includes(el.tagName)) continue;
      if (el.closest('pre, code, .overflow-x-auto, [data-allow-scroll]')) continue;

      const rect = el.getBoundingClientRect();
      // Only check visible elements
      if (rect.width === 0 || rect.height === 0) continue;
      if (window.getComputedStyle(el).display === 'none') continue;
      if (window.getComputedStyle(el).visibility === 'hidden') continue;

      if (rect.right > winWidth + 1) {
        let identifier = el.tagName.toLowerCase();
        if (el.id) identifier += '#' + el.id;
        if (el.className && typeof el.className === 'string') {
          identifier += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
        }
        overflowingElements.push({
          identifier,
          tag: el.tagName,
          rectRight: Math.round(rect.right),
          winWidth,
          delta: Math.round(rect.right - winWidth),
          textSnippet: (el.textContent || '').trim().slice(0, 40),
        });
      }
    }

    return {
      hasDocOverflow,
      scrollWidth,
      winWidth,
      overflowDelta: scrollWidth - winWidth,
      overflowingElements: overflowingElements.slice(0, 10), // cap top 10 per view
    };
  }, { routeName, vp });
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  console.log('=== STARTING RESPONSIVE AUDIT ACROSS VIEWPORTS ===\n');

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    // 1. Landing Page
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    let res = await detectOverflow(page, 'Landing', vp);
    await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-landing.png`, fullPage: false });
    report.push({ vp: vp.name, route: 'Landing', ...res });
    if (res.hasDocOverflow) {
      console.log(`  [OVERFLOW] Landing at ${vp.width}px: scrollWidth=${res.scrollWidth}px (delta=+${res.overflowDelta}px)`);
      for (const el of res.overflowingElements) console.log(`     -> ${el.identifier} (+${el.delta}px): "${el.textSnippet}"`);
    } else {
      console.log(`  [PASS] Landing at ${vp.width}px`);
    }

    // 2. Legal Pages: Privacy, Terms, Refund, Contact, Data-Deletion
    for (const legalRoute of ['privacy', 'terms', 'refund', 'contact', 'data-deletion', 'pricing']) {
      await page.goto(`http://localhost:3000/${legalRoute}`, { waitUntil: 'networkidle' });
      res = await detectOverflow(page, `/${legalRoute}`, vp);
      report.push({ vp: vp.name, route: `/${legalRoute}`, ...res });
      if (res.hasDocOverflow) {
        console.log(`  [OVERFLOW] /${legalRoute} at ${vp.width}px: scrollWidth=${res.scrollWidth}px (delta=+${res.overflowDelta}px)`);
        for (const el of res.overflowingElements) console.log(`     -> ${el.identifier} (+${el.delta}px)`);
      } else {
        console.log(`  [PASS] /${legalRoute} at ${vp.width}px`);
      }
    }

    // 3. App Core (Guest Mode first run)
    await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
    // In guest mode, if auth gate appears, click continue offline
    const continueOffline = page.getByRole('button', { name: /Continue offline/i });
    if (await continueOffline.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueOffline.click();
      await page.waitForTimeout(500);
    }

    // Check Today / Goal view
    res = await detectOverflow(page, '/app:today', vp);
    await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-app-today.png`, fullPage: false });
    report.push({ vp: vp.name, route: '/app:today', ...res });
    if (res.hasDocOverflow) {
      console.log(`  [OVERFLOW] /app:today at ${vp.width}px: scrollWidth=${res.scrollWidth}px (delta=+${res.overflowDelta}px)`);
      for (const el of res.overflowingElements) console.log(`     -> ${el.identifier} (+${el.delta}px): "${el.textSnippet}"`);
    } else {
      console.log(`  [PASS] /app:today at ${vp.width}px`);
    }

    // Check MobileNav visibility and positioning on mobile
    if (vp.width < 768) {
      const navVisible = await page.locator('nav[aria-label="Primary"]').isVisible();
      console.log(`  [NAV] MobileNav visible at ${vp.width}px: ${navVisible}`);
    }

    await context.close();
  }

  await browser.close();

  // Save report
  fs.writeFileSync(`${SHOTS_DIR}/audit-report.json`, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nAudit complete! Saved report to ${SHOTS_DIR}/audit-report.json`);
}

runAudit().catch(console.error);
