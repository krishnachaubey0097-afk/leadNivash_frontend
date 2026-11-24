import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('frontend/scripts/audit_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const MOBILE_VIEWPORTS = [
  { name: 'iphone_se_320', width: 320, height: 568 },
  { name: 'android_compact_360', width: 360, height: 740 },
  { name: 'iphone_standard_375', width: 375, height: 667 },
  { name: 'iphone_14_390', width: 390, height: 844 },
  { name: 'android_flagship_412', width: 412, height: 915 },
];

async function verify() {
  console.log('📱 Starting Mobile Responsiveness & Layout Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const results = [];

  try {
    for (const vp of MOBILE_VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`Testing Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
      console.log(`======================================================`);

      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });

      // Seed localStorage with test broker user
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const testUser = {
          _id: 'usr_test_broker',
          name: 'Sunny Kumar',
          email: 'sunny@leadnivesh.com',
          phone: '9876543210',
          role: 'broker',
          agency: {
            name: 'Sunny Associates',
            city: 'Panipat',
          },
          plan: {
            tier: 'pro',
            isExpired: false,
            limits: { maxProperties: 50, maxBuyers: 50, maxDeals: 50, maxParsePerMonth: 100 },
          },
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('leadnivesh_user', JSON.stringify(testUser));
        localStorage.setItem('leadnivesh_has_session', 'true');
        localStorage.setItem('ln_theme_mode', 'light');
      });

      // Navigate to /app (Dashboard)
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2', timeout: 10000 }).catch(async () => {
        await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
      });

      await new Promise((r) => setTimeout(r, 1200));

      // 1. Check Horizontal Overflow
      const overflowInfo = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        const hasOverflow = scrollWidth > clientWidth + 1;

        const offendingElements = [];
        if (hasOverflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > clientWidth + 1) {
              offendingElements.push({
                tag: el.tagName,
                className: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
                right: Math.round(rect.right),
                clientWidth,
              });
              if (offendingElements.length >= 3) break;
            }
          }
        }
        return { hasOverflow, scrollWidth, clientWidth, offendingElements };
      });

      // 2. Check Key Elements on Dashboard
      const elementsCheck = await page.evaluate(() => {
        const header = document.querySelector('header');
        const headerLogo = header ? header.querySelector('img[src*="logo"]') : null;
        const brandText = header ? header.innerText.includes('leadNivash') || header.innerText.includes('Nivash') : false;
        const notificationsBtn = header ? header.querySelector('button[aria-label="Notifications"]') : null;
        const settingsBtn = header ? header.querySelector('a[aria-label="Settings"]') : null;
        const avatarBtn = header ? header.querySelector('button[aria-label*="account" i]') : null;

        // Welcome Section
        const welcomeText = document.body.innerText.includes('Welcome back, Sunny');
        const agencyText = document.body.innerText.includes('Sunny Associates');

        // Main Actions
        const addPropertyBtn = Array.from(document.querySelectorAll('button, a')).find((el) =>
          el.innerText.includes('Add Property')
        );
        const findBuyerBtn = Array.from(document.querySelectorAll('button, a')).find((el) =>
          el.innerText.includes('Find a Buyer Match')
        );
        const quickChatEntry = Array.from(document.querySelectorAll('a')).find((el) =>
          el.innerText.includes('Open Quick Chat')
        );

        // Quick Paste Section
        const pasteHeading = document.body.innerText.includes('Paste a WhatsApp message');
        const pasteTextarea = document.querySelector('textarea');

        // Bottom Nav (5 items)
        const bottomNav = document.querySelector('nav.fixed.bottom-0');
        const bottomNavLinks = bottomNav ? Array.from(bottomNav.querySelectorAll('a')) : [];

        // Check for fake charts / sample preview
        const hasFakeChart = document.body.innerText.includes('Sample Preview') ||
          document.body.innerText.includes('PREVIEW') ||
          document.body.innerText.includes('Sample Chart');

        return {
          header: {
            exists: !!header,
            hasLogo: !!headerLogo,
            hasBrandText: brandText,
            hasNotifications: !!notificationsBtn,
            hasSettings: !!settingsBtn,
            hasAvatar: !!avatarBtn,
          },
          welcome: {
            hasGreeting: welcomeText,
            hasAgency: agencyText,
          },
          actions: {
            hasAddProperty: !!addPropertyBtn,
            hasFindBuyer: !!findBuyerBtn,
            hasQuickChat: !!quickChatEntry,
          },
          quickPaste: {
            hasHeading: pasteHeading,
            hasTextarea: !!pasteTextarea,
          },
          bottomNav: {
            exists: !!bottomNav,
            tabCount: bottomNavLinks.length,
            labels: bottomNavLinks.map((l) => l.innerText.trim().replace(/\n/g, ' ')),
          },
          hasFakeChart,
        };
      });

      // Save screenshot
      const ssPath = path.join(SCREENSHOT_DIR, `dashboard_${vp.name}.png`);
      await page.screenshot({ path: ssPath, fullPage: false });

      const checkPass = !overflowInfo.hasOverflow &&
        elementsCheck.header.hasLogo &&
        elementsCheck.actions.hasAddProperty &&
        elementsCheck.actions.hasFindBuyer &&
        elementsCheck.actions.hasQuickChat &&
        elementsCheck.quickPaste.hasHeading &&
        elementsCheck.bottomNav.tabCount === 5 &&
        !elementsCheck.hasFakeChart;

      results.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        overflow: overflowInfo,
        elementsCheck,
        checkPass,
        screenshot: ssPath,
      });

      console.log(`  Horizontal Overflow: ${overflowInfo.hasOverflow ? '❌ LEAK DETECTED' : '✅ None (0px overflow)'}`);
      console.log(`  Header Elements: Logo=${elementsCheck.header.hasLogo}, Settings=${elementsCheck.header.hasSettings}, Avatar=${elementsCheck.header.hasAvatar}`);
      console.log(`  Welcome: ${elementsCheck.welcome.hasGreeting ? '✅ "Welcome back, Sunny"' : '❌ Missing greeting'}`);
      console.log(`  Main Actions: Add Property=${elementsCheck.actions.hasAddProperty}, Find Buyer=${elementsCheck.actions.hasFindBuyer}, Quick Chat=${elementsCheck.actions.hasQuickChat}`);
      console.log(`  Quick Paste Section: ${elementsCheck.quickPaste.hasHeading ? '✅ Present' : '❌ Missing'}`);
      console.log(`  Bottom Nav Tabs: ${elementsCheck.bottomNav.tabCount} tabs (${elementsCheck.bottomNav.labels.join(', ')})`);
      console.log(`  Fake Charts Removed: ${!elementsCheck.hasFakeChart ? '✅ Confirmed 0 fake charts' : '❌ Fake charts found'}`);
      console.log(`  Screenshot: ${ssPath}`);

      await context.close();
    }

    console.log('\n======================================================');
    const allPassed = results.every((r) => r.checkPass);
    if (allPassed) {
      console.log('🎉 ALL MOBILE VIEWPORTS PASSED VERIFICATION WITH ZERO OVERFLOW!');
    } else {
      console.warn('⚠️ Some viewports had issues. See details above.');
    }
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

verify().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
