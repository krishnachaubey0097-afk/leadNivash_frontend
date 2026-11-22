import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('frontend/scripts/audit_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
];

async function runAudit() {
  console.log('🚀 Starting Comprehensive Multi-Screen UI Audit for LeadNivesh...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const report = {
    summary: { totalPagesTested: 0, issuesFound: [] },
    viewports: {},
  };

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`📱 AUDITING VIEWPORT: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
      console.log(`======================================================`);

      report.viewports[vp.name] = {
        pages: {},
        overflowErrors: [],
        consoleErrors: [],
        brokenButtons: [],
      };

      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport(vp);

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          report.viewports[vp.name].consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (err) => {
        report.viewports[vp.name].consoleErrors.push(err.message);
      });

      // Helper function to inspect page health
      async function inspectPage(pageName, urlPath) {
        console.log(`  Checking [${pageName}] -> ${urlPath}`);
        try {
          await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle2', timeout: 15000 });
        } catch {
          await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        }

        await new Promise((r) => setTimeout(r, 800));

        // 1. Check Horizontal Scroll Leak (Layout Overflow)
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasOverflow = scrollWidth > clientWidth + 2; // tolerance

          // Find offending overflowing elements
          const offending = [];
          if (hasOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > clientWidth + 2) {
                offending.push({
                  tag: el.tagName,
                  id: el.id,
                  className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
                if (offending.length >= 3) break;
              }
            }
          }
          return { hasOverflow, scrollWidth, clientWidth, offending };
        });

        // 2. Check Buttons Interactivity
        const buttonsHealth = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
          const nonFunctional = [];
          for (const b of buttons) {
            const text = (b.innerText || b.getAttribute('title') || b.getAttribute('aria-label') || '').trim();
            const r = b.getBoundingClientRect();
            const isVisible = r.width > 0 && r.height > 0 && getComputedStyle(b).display !== 'none';
            if (isVisible && !text && !b.querySelector('svg') && !b.querySelector('img')) {
              nonFunctional.push({ tag: 'button', issue: 'Empty button without text or icon', outerHTML: b.outerHTML.slice(0, 100) });
            }
          }
          return { totalButtons: buttons.length, nonFunctional };
        });

        // Save screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_${pageName}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        report.viewports[vp.name].pages[pageName] = {
          overflow,
          buttonsHealth,
          screenshotPath,
        };

        if (overflow.hasOverflow) {
          console.warn(`    ⚠️  OVERFLOW DETECTED: scrollWidth (${overflow.scrollWidth}) > clientWidth (${overflow.clientWidth})`);
          report.summary.issuesFound.push({
            viewport: vp.name,
            page: pageName,
            type: 'Horizontal Scroll Leak',
            details: overflow,
          });
        } else {
          console.log(`    ✅ Layout Width: Perfect (${overflow.clientWidth}px, 0 overflow)`);
        }

        report.summary.totalPagesTested++;
      }

      // Step 1: Check Public Landing Page
      await inspectPage('landing', '/');

      // Step 2: Check Login Page
      await inspectPage('login', '/login');

      // Step 3: Perform Login
      console.log('  Logging in as broker@leadnivesh.com...');
      await page.type('input[type="email"], input[type="text"]', 'broker@leadnivesh.com');
      await page.type('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1200));

      // Step 4: Check Dashboard
      await inspectPage('dashboard', '/app');

      // Step 5: Check Properties List & New Property Form
      await inspectPage('properties_list', '/app/properties');
      await inspectPage('property_new', '/app/properties/new');

      // Step 6: Check Buyers List & New Buyer Form
      await inspectPage('buyers_list', '/app/buyers');
      await inspectPage('buyer_new', '/app/buyers/new');

      // Step 7: Check Quick Paste AI Parser
      await inspectPage('quick_paste', '/app/paste');

      // Step 8: Check Tools Hub & Dedicated Standalone Tools
      await inspectPage('tools_hub', '/app/tools');
      await inspectPage('tool_emi', '/app/tools/emi');
      await inspectPage('tool_registry', '/app/tools/registry');
      await inspectPage('tool_area', '/app/tools/area');
      await inspectPage('tool_commission', '/app/tools/commission');
      await inspectPage('tool_templates', '/app/tools/templates');

      // Step 9: Check Inquiries & Settings
      await inspectPage('inquiries', '/app/inquiries');
      await inspectPage('settings', '/app/settings');

      await context.close();
    }

    console.log('\n======================================================');
    console.log('🏁 MULTI-SCREEN AUDIT COMPLETE');
    console.log('======================================================');
    console.log(`Total Page Tests Executed: ${report.summary.totalPagesTested}`);
    console.log(`Total Structural Issues: ${report.summary.issuesFound.length}`);

    fs.writeFileSync(
      path.resolve('frontend/scripts/audit_report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('Report saved to frontend/scripts/audit_report.json\n');
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
