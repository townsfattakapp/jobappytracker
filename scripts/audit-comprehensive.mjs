import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:3000';
const SHOTS_DIR = 'scratch/responsive-audit';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

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

async function detectOverflow(page, routeName, vp) {
  return await page.evaluate(({ routeName, vp }) => {
    const docEl = document.documentElement;
    const body = document.body;
    const winWidth = window.innerWidth;
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    const hasDocOverflow = scrollWidth > winWidth + 1;

    const overflowingElements = [];
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      if (['PRE', 'CODE'].includes(el.tagName)) continue;
      if (el.closest('pre, code, .overflow-x-auto, [data-allow-scroll]')) continue;

      const rect = el.getBoundingClientRect();
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
      overflowingElements: overflowingElements.slice(0, 10),
    };
  }, { routeName, vp });
}

async function main() {
  console.log('=== RUNNING COMPREHENSIVE RESPONSIVE AUDIT ACROSS 9 VIEWPORTS ===\n');

  const browser = await chromium.launch({ headless: true });
  const auditReport = [];
  const failures = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n======================================================================`);
    console.log(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
    });

    const page = await context.newPage();

    // 1. PUBLIC MARKETING & LEGAL ROUTES
    const publicRoutes = [
      { name: 'Landing', path: '/' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Privacy', path: '/privacy' },
      { name: 'Terms', path: '/terms' },
      { name: 'Refund', path: '/refund' },
      { name: 'Contact', path: '/contact' },
      { name: 'DataDeletion', path: '/data-deletion' },
    ];

    for (const r of publicRoutes) {
      try {
        await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(200);

        const res = await detectOverflow(page, r.name, vp);
        auditReport.push({ vp: vp.name, route: r.name, ...res });
        const shotPath = `${SHOTS_DIR}/${vp.name}-${r.name.toLowerCase()}.png`;
        await page.screenshot({ path: shotPath, fullPage: false });

        if (res.hasDocOverflow) {
          console.log(`  [OVERFLOW] ${r.name} at ${vp.width}px: scrollWidth=${res.scrollWidth}px (delta=+${res.overflowDelta}px)`);
          for (const el of res.overflowingElements) {
            console.log(`     -> ${el.identifier} (+${el.delta}px): "${el.textSnippet}"`);
            failures.push({ vp: vp.name, route: r.name, el });
          }
        } else {
          console.log(`  [PASS] ${r.name} at ${vp.width}px (scrollWidth=${res.scrollWidth}px)`);
        }
      } catch (err) {
        console.log(`  [ERROR] ${r.name}: ${err.message}`);
      }
    }

    // 2. LEARNER APP INITIALIZATION (Guest Mode + Dismiss Onboarding)
    try {
      await page.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.evaluate(() => {
        localStorage.setItem('jobappy-guest-mode', '1');
        localStorage.setItem('job-app-onboarding-dismissed', 'true');
        localStorage.setItem('job-app-theme', 'dark');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Dismiss any lingering guest/onboarding modals if present
      const contBtn = page.getByRole('button', { name: /Continue offline|Skip setup/i }).first();
      if (await contBtn.isVisible().catch(() => false)) {
        await contBtn.click();
        await page.waitForTimeout(300);
      }

      // Check App: Today / Command Center
      let res = await detectOverflow(page, 'AppToday', vp);
      auditReport.push({ vp: vp.name, route: 'AppToday', ...res });
      await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-app-today.png`, fullPage: false });
      if (res.hasDocOverflow) {
        console.log(`  [OVERFLOW] AppToday at ${vp.width}px: scrollWidth=${res.scrollWidth}px (delta=+${res.overflowDelta}px)`);
        for (const el of res.overflowingElements) failures.push({ vp: vp.name, route: 'AppToday', el });
      } else {
        console.log(`  [PASS] AppToday at ${vp.width}px`);
      }

      // Check Mobile Navigation Bar and Popup Menus on mobile viewports
      if (vp.width < 768) {
        const mobileNav = page.locator('nav.fixed.bottom-0');
        const isNavVisible = await mobileNav.first().isVisible().catch(() => false);
        console.log(`  [NAV] MobileNav bar visible: ${isNavVisible}`);

        // Test tapping "Career" menu
        const careerBtn = page.getByRole('button', { name: /Career/i }).first();
        if (await careerBtn.isVisible().catch(() => false)) {
          await careerBtn.click();
          await page.waitForTimeout(200);
          const careerSheet = await detectOverflow(page, 'MobileNav-CareerSheet', vp);
          await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-mobilenav-career.png`, fullPage: false });
          if (careerSheet.hasDocOverflow) {
            console.log(`  [OVERFLOW] Career sheet at ${vp.width}px: delta=+${careerSheet.overflowDelta}px`);
            failures.push({ vp: vp.name, route: 'MobileNav-CareerSheet', el: careerSheet.overflowingElements[0] });
          } else {
            console.log(`  [PASS] MobileNav Career sheet at ${vp.width}px`);
          }
          await page.keyboard.press('Escape');
          await page.waitForTimeout(150);
        }

        // Test tapping "Jobs" menu
        const jobsNavBtn = page.getByRole('button', { name: /Jobs/i }).first();
        if (await jobsNavBtn.isVisible().catch(() => false)) {
          await jobsNavBtn.click();
          await page.waitForTimeout(200);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(150);
        }

        // Test tapping "More" menu
        const moreNavBtn = page.getByRole('button', { name: /More/i }).first();
        if (await moreNavBtn.isVisible().catch(() => false)) {
          await moreNavBtn.click();
          await page.waitForTimeout(200);
          const moreSheet = await detectOverflow(page, 'MobileNav-MoreSheet', vp);
          await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-mobilenav-more.png`, fullPage: false });
          if (moreSheet.hasDocOverflow) {
            console.log(`  [OVERFLOW] More sheet at ${vp.width}px: delta=+${moreSheet.overflowDelta}px`);
            failures.push({ vp: vp.name, route: 'MobileNav-MoreSheet', el: moreSheet.overflowingElements[0] });
          } else {
            console.log(`  [PASS] MobileNav More sheet at ${vp.width}px`);
          }
          await page.keyboard.press('Escape');
          await page.waitForTimeout(150);
        }
      } else {
        const desktopSidebar = page.locator('aside');
        const isSidebarVisible = await desktopSidebar.first().isVisible().catch(() => false);
        console.log(`  [NAV] Desktop Sidebar visible: ${isSidebarVisible}`);
      }

      // Check Learner Views Navigation
      const navViews = [
        { name: 'Roadmap', clickTarget: 'Goals & Roadmap', fallbackBtn: '🗺️' },
        { name: 'Tracks', clickTarget: 'Explore', fallbackBtn: 'Curriculum' },
        { name: 'Jobs', clickTarget: 'Job Discovery', fallbackBtn: '🚀' },
        { name: 'Mock', clickTarget: 'Mock Interviews', fallbackBtn: '💻' },
        { name: 'Settings', clickTarget: 'Settings', fallbackBtn: '⚙️' },
      ];

      for (const nv of navViews) {
        try {
          // Attempt navigation via Desktop Sidebar or Mobile Nav
          let clicked = false;
          if (vp.width >= 768) {
            const btn = page.getByRole('button', { name: new RegExp(nv.clickTarget, 'i') }).first();
            if (await btn.isVisible().catch(() => false)) {
              await btn.click();
              clicked = true;
            }
          } else {
            // On mobile, tap MobileNav or navigate via state
            if (nv.name === 'Roadmap' || nv.name === 'Tracks') {
              const carBtn = page.getByRole('button', { name: /Career/i }).first();
              if (await carBtn.isVisible().catch(() => false)) {
                await carBtn.click();
                await page.waitForTimeout(150);
                const subItem = page.getByRole('button', { name: new RegExp(nv.clickTarget, 'i') }).first();
                if (await subItem.isVisible().catch(() => false)) {
                  await subItem.click();
                  clicked = true;
                } else {
                  await page.keyboard.press('Escape');
                }
              }
            } else if (nv.name === 'Jobs') {
              const jb = page.getByRole('button', { name: /Jobs/i }).first();
              if (await jb.isVisible().catch(() => false)) {
                await jb.click();
                clicked = true;
              }
            } else if (nv.name === 'Mock') {
              const engBtn = page.getByRole('button', { name: /Engineer/i }).first();
              if (await engBtn.isVisible().catch(() => false)) {
                await engBtn.click();
                await page.waitForTimeout(150);
                const subItem = page.getByRole('button', { name: /Mock/i }).first();
                if (await subItem.isVisible().catch(() => false)) {
                  await subItem.click();
                  clicked = true;
                } else {
                  await page.keyboard.press('Escape');
                }
              }
            } else if (nv.name === 'Settings') {
              const moreBtn = page.getByRole('button', { name: /More/i }).first();
              if (await moreBtn.isVisible().catch(() => false)) {
                await moreBtn.click();
                await page.waitForTimeout(150);
                const subItem = page.getByRole('button', { name: /Settings/i }).first();
                if (await subItem.isVisible().catch(() => false)) {
                  await subItem.click();
                  clicked = true;
                } else {
                  await page.keyboard.press('Escape');
                }
              }
            }
          }

          await page.waitForTimeout(400);

          const viewRes = await detectOverflow(page, `App-${nv.name}`, vp);
          auditReport.push({ vp: vp.name, route: `App-${nv.name}`, ...viewRes });
          await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-app-${nv.name.toLowerCase()}.png`, fullPage: false });

          if (viewRes.hasDocOverflow) {
            console.log(`  [OVERFLOW] App-${nv.name} at ${vp.width}px: scrollWidth=${viewRes.scrollWidth}px (delta=+${viewRes.overflowDelta}px)`);
            for (const el of viewRes.overflowingElements) failures.push({ vp: vp.name, route: `App-${nv.name}`, el });
          } else {
            console.log(`  [PASS] App-${nv.name} at ${vp.width}px`);
          }
        } catch (err) {
          console.log(`  [NAV ERROR ${nv.name}]: ${err.message}`);
        }
      }

      // Check Job Form Modal
      try {
        const addAppBtn = page.getByRole('button', { name: /\+ Add application|Add role/i }).first();
        if (await addAppBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await addAppBtn.click();
          await page.waitForTimeout(300);
          const modalRes = await detectOverflow(page, 'Modal-AddApplication', vp);
          await page.screenshot({ path: `${SHOTS_DIR}/${vp.name}-modal-add-app.png`, fullPage: false });
          if (modalRes.hasDocOverflow) {
            console.log(`  [OVERFLOW] Add Application Modal at ${vp.width}px: delta=+${modalRes.overflowDelta}px`);
            failures.push({ vp: vp.name, route: 'Modal-AddApplication', el: modalRes.overflowingElements[0] });
          } else {
            console.log(`  [PASS] Add Application Modal at ${vp.width}px`);
          }
          const closeBtn = page.getByRole('button', { name: /Close/i }).first();
          if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
          await page.waitForTimeout(200);
        }
      } catch (err) {
        console.log(`  [MODAL ERROR]: ${err.message}`);
      }

    } catch (err) {
      console.log(`  [APP ERROR]: ${err.message}`);
    }

    await context.close();
  }

  await browser.close();

  // Write report
  const summary = {
    totalChecks: auditReport.length,
    viewportsTested: VIEWPORTS.map(v => `${v.width}x${v.height}`),
    failureCount: failures.length,
    failures,
  };

  fs.writeFileSync(`${SHOTS_DIR}/comprehensive-report.json`, JSON.stringify({ summary, auditReport }, null, 2), 'utf8');

  console.log(`\n======================================================================`);
  console.log(`COMPREHENSIVE AUDIT COMPLETE!`);
  console.log(`Total checks: ${auditReport.length} across ${VIEWPORTS.length} viewports.`);
  console.log(`Total overflow failures: ${failures.length}`);
  console.log(`Screenshots and report saved to: ${SHOTS_DIR}`);
  console.log(`======================================================================\n`);

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
