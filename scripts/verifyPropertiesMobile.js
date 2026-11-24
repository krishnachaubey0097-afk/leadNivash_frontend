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
  console.log('📱 Starting Properties Mobile Responsiveness & Layout Verification...\n');

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

      // Enable request interception to mock auth and properties API
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/auth/refresh') || url.includes('/users/me')) {
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                accessToken: 'mock_jwt_token',
                user: {
                  _id: 'usr_test_broker',
                  name: 'Sunny Kumar',
                  email: 'sunny@leadnivesh.com',
                  phone: '9876543210',
                  role: 'broker',
                  agency: { name: 'Sunny Associates', city: 'Panipat' },
                  plan: { tier: 'pro', isExpired: false, limits: { maxProperties: 50, maxBuyers: 50, maxDeals: 50, maxParsePerMonth: 100 } }
                }
              }
            })
          });
        } else if (url.includes('/api/v1/properties')) {
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                _id: 'prop_test_1',
                title: '3 BHK Luxury Builder Floor',
                type: 'Floor',
                category: 'Residential',
                locality: 'Model Town',
                city: 'Panipat',
                size: { value: 250, unit: 'gaj' },
                priceDemandPaise: 1250000000,
                facing: 'North-East',
                status: 'available',
                photos: [
                  { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', publicId: 'p1' },
                  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', publicId: 'p2' }
                ],
                owner: { name: 'Rajinder Gupta', phone: '9812044321' },
                createdAt: new Date().toISOString()
              },
              {
                _id: 'prop_test_2',
                title: '250 Gaj Residential Corner Plot',
                type: 'Plot',
                category: 'Residential',
                locality: 'Ansals Sushant City',
                city: 'Panipat',
                size: { value: 250, unit: 'gaj' },
                priceDemandPaise: 850000000,
                facing: 'North',
                status: 'hold',
                owner: { name: 'Suresh Mittal', phone: '9876543210' },
                createdAt: new Date().toISOString()
              }
            ])
          });
        } else {
          req.continue();
        }
      });

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
        localStorage.setItem('leadnivash_tour_seen_usr_test_broker', 'true');
        localStorage.setItem('leadnivash_tour_seen_v1', 'true');
        localStorage.setItem('ln_theme_mode', 'light');
      });

      // ── TEST 1: /app/properties ──
      await page.goto(`${BASE_URL}/app/properties`, { waitUntil: 'networkidle2', timeout: 10000 }).catch(async () => {
        await page.goto(`${BASE_URL}/app/properties`, { waitUntil: 'domcontentloaded' });
      });

      await new Promise((r) => setTimeout(r, 1200));

      // Check horizontal overflow on list page
      const listOverflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        return { hasOverflow: scrollWidth > clientWidth + 1, scrollWidth, clientWidth };
      });

      // Check element structure on /app/properties
      const listChecks = await page.evaluate(() => {
        const headingText = document.body.innerText.includes('My Properties');
        const supportingText = document.body.innerText.includes('Manage your listings and availability.');
        const addBtn = Array.from(document.querySelectorAll('a, button')).find((el) =>
          el.innerText.includes('Add Property')
        );
        const searchInput = document.querySelector('input[placeholder*="Search by locality"]');
        const filterChips = Array.from(document.querySelectorAll('button')).filter((b) =>
          ['All', 'Available', 'On Hold', 'Sold / Closed'].some((lbl) => b.innerText.includes(lbl))
        );

        // Check if cards leaked owner contact
        const cardsText = document.body.innerText;
        const leakedOwnerPhone = cardsText.includes('9812044321') || cardsText.includes('9876543210');

        return {
          hasHeading: headingText,
          hasSupportingText: supportingText,
          hasAddButton: !!addBtn,
          hasSearchInput: !!searchInput,
          filterChipCount: filterChips.length,
          leakedOwnerPhone,
        };
      });

      const listSsPath = path.join(SCREENSHOT_DIR, `properties_list_${vp.name}.png`);
      await page.screenshot({ path: listSsPath, fullPage: false });

      // ── TEST 2: /app/properties/new (Add Property Flow) ──
      await page.goto(`${BASE_URL}/app/properties/new`, { waitUntil: 'networkidle2', timeout: 10000 }).catch(async () => {
        await page.goto(`${BASE_URL}/app/properties/new`, { waitUntil: 'domcontentloaded' });
      });

      await new Promise((r) => setTimeout(r, 1200));

      const formOverflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        return { hasOverflow: scrollWidth > clientWidth + 1, scrollWidth, clientWidth };
      });

      const formChecks = await page.evaluate(() => {
        const formHeading = document.body.innerText.includes('Add Property') || document.body.innerText.includes('New Listing');
        const hasSaveBtn = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.includes('Save Property')
        );
        const hasCancelBtn = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.includes('Cancel')
        );
        const selectOptions = Array.from(document.querySelectorAll('option')).map((o) => o.innerText);
        const hasHaryanaMarla = selectOptions.some((txt) => txt.includes('Haryana') || txt.includes('225 sq ft'));

        return {
          hasFormHeading: formHeading,
          hasSaveBtn,
          hasCancelBtn,
          hasHaryanaMarla,
          optionsCount: selectOptions.length,
        };
      });

      const formSsPath = path.join(SCREENSHOT_DIR, `properties_new_${vp.name}.png`);
      await page.screenshot({ path: formSsPath, fullPage: false });

      const pass =
        !listOverflow.hasOverflow &&
        !formOverflow.hasOverflow &&
        listChecks.hasHeading &&
        listChecks.hasSupportingText &&
        listChecks.hasAddButton &&
        listChecks.hasSearchInput &&
        listChecks.filterChipCount >= 4 &&
        !listChecks.leakedOwnerPhone &&
        formChecks.hasFormHeading &&
        formChecks.hasSaveBtn &&
        formChecks.hasCancelBtn &&
        formChecks.hasHaryanaMarla;

      results.push({ viewport: vp.name, pass });

      console.log(`  List Overflow: ${listOverflow.hasOverflow ? '❌ LEAK' : '✅ 0px'}`);
      console.log(`  Form Overflow: ${formOverflow.hasOverflow ? '❌ LEAK' : '✅ 0px'}`);
      console.log(`  Heading & Text: ${listChecks.hasHeading && listChecks.hasSupportingText ? '✅ Pass' : '❌ Fail'}`);
      console.log(`  Add Property Button: ${listChecks.hasAddButton ? '✅ Present' : '❌ Missing'}`);
      console.log(`  Search & Filters: Search=${listChecks.hasSearchInput}, Chips=${listChecks.filterChipCount}`);
      console.log(`  Owner Privacy Vault: ${!listChecks.leakedOwnerPhone ? '✅ Protected (No leaks)' : '❌ LEAKED!'}`);
      console.log(`  Add Form: Save=${formChecks.hasSaveBtn}, Cancel=${formChecks.hasCancelBtn}, Haryana Marla=${formChecks.hasHaryanaMarla}`);

      await context.close();
    }

    console.log('\n======================================================');
    const allPassed = results.every((r) => r.pass);
    if (allPassed) {
      console.log('🎉 ALL MOBILE VIEWPORTS PASSED PROPERTIES SCREEN VERIFICATION WITH ZERO OVERFLOW!');
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
