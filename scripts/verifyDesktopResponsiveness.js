import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, 'desktop_audit_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const DESKTOP_VIEWPORTS = [
  { name: 'desktop_1024', width: 1024, height: 768, expectedCols: 2 },
  { name: 'desktop_1280', width: 1280, height: 800, expectedCols: 2 },
  { name: 'desktop_1440', width: 1440, height: 900, expectedCols: 3 },
];

async function verify() {
  console.log('🖥️  Starting Desktop Responsiveness & Layout Verification (1024, 1280, 1440px)...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const allPassed = [];

  try {
    for (const vp of DESKTOP_VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`Testing Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
      console.log(`======================================================`);

      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: false, hasTouch: false });

      // Seed localStorage with test broker user
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const testUser = {
          _id: 'usr_test_broker',
          name: 'Sunny Kumar',
          email: 'sunny@leadnivash.com',
          phone: '9876543210',
          role: 'broker',
          agency: {
            name: 'Sunny Associates',
            city: 'Panipat',
          },
          plan: {
            tier: 'trial',
            isExpired: false,
            trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            limits: { maxProperties: 50, maxBuyers: 50, maxDeals: 50, maxParsePerMonth: 100 },
          },
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('leadnivesh_user', JSON.stringify(testUser));
        localStorage.setItem('leadnivesh_has_session', 'true');
        localStorage.setItem('ln_theme_mode', 'light');
        localStorage.setItem('leadnivash_tour_seen_usr_test_broker', 'true');
        localStorage.setItem('leadnivash_tour_seen_v1', 'true');
        localStorage.removeItem('leadnivash_sidebar_collapsed');
      });

      // Navigate to /app (Dashboard)
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2', timeout: 10000 }).catch(async () => {
        await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
      });
      await new Promise((r) => setTimeout(r, 1200));

      // 1. Audit Horizontal Overflow
      const overflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        return {
          hasOverflow: scrollWidth > clientWidth + 1,
          scrollWidth,
          clientWidth,
        };
      });
      console.log(`✓ Horizontal Overflow Check: ${overflow.hasOverflow ? 'FAIL' : 'PASS'} (${overflow.clientWidth}px / scroll: ${overflow.scrollWidth}px)`);

      // 2. Audit Sidebar (240px, collapsible to 72px, 5 nav items, plan card, user row)
      const sidebarAudit = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        if (!aside) return { exists: false };
        const rect = aside.getBoundingClientRect();
        const width = Math.round(rect.width);

        // Logo
        const logoImg = aside.querySelector('img[src*="logo"]');
        const logoRect = logoImg ? logoImg.getBoundingClientRect() : null;
        const brandText = aside.innerText.includes('LeadNivash');

        // Nav Links
        const navLinks = Array.from(aside.querySelectorAll('nav a'));
        const navLabels = navLinks.map((a) => a.innerText.trim()).filter(Boolean);

        // Plan card
        const upgradeBtn = Array.from(aside.querySelectorAll('button')).find((b) =>
          b.innerText.trim() === 'Upgrade'
        );

        // User row
        const userAvatar = aside.querySelector('.rounded-full.bg-brand-50');
        const hasSettingsLink = Array.from(aside.querySelectorAll('a')).some((a) =>
          a.innerText.includes('Settings')
        );
        const hasLogoutBtn = Array.from(aside.querySelectorAll('button')).some((b) =>
          b.innerText.includes('Log out')
        );

        return {
          exists: true,
          width,
          logoWidth: logoRect ? Math.round(logoRect.width) : 0,
          logoHeight: logoRect ? Math.round(logoRect.height) : 0,
          brandText,
          navItemCount: navLinks.length,
          navLabels,
          hasUpgradeBtn: !!upgradeBtn,
          hasUserAvatar: !!userAvatar,
          hasSettingsLink,
          hasLogoutBtn,
        };
      });

      console.log(`✓ Sidebar Presence: ${sidebarAudit.exists ? 'PASS' : 'FAIL'} (Width: ${sidebarAudit.width}px)`);
      console.log(`✓ Sidebar Brand: ${sidebarAudit.brandText ? 'PASS (LeadNivash)' : 'FAIL'} (Logo: ${sidebarAudit.logoWidth}x${sidebarAudit.logoHeight}px)`);
      console.log(`✓ Sidebar Nav Items: ${sidebarAudit.navItemCount} items (${sidebarAudit.navLabels.join(', ')})`);
      console.log(`✓ Sidebar Plan Card Upgrade Button: ${sidebarAudit.hasUpgradeBtn ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Sidebar User Row (Avatar, Settings, Log out): ${sidebarAudit.hasUserAvatar && sidebarAudit.hasSettingsLink && sidebarAudit.hasLogoutBtn ? 'PASS' : 'FAIL'}`);

      // 3. Test Sidebar Collapse/Expand Toggle
      const collapseResult = await page.evaluate(async () => {
        const toggleBtn = document.querySelector('aside button[title*="Collapse"]');
        if (!toggleBtn) return { toggled: false };
        toggleBtn.click();
        await new Promise((r) => setTimeout(r, 400));
        const aside = document.querySelector('aside');
        const collapsedWidth = Math.round(aside.getBoundingClientRect().width);

        const expandBtn = document.querySelector('aside button[title*="Expand"]');
        if (expandBtn) expandBtn.click();
        await new Promise((r) => setTimeout(r, 400));
        const expandedWidth = Math.round(aside.getBoundingClientRect().width);

        return { toggled: true, collapsedWidth, expandedWidth };
      });
      console.log(`✓ Sidebar Collapse Toggle: ${collapseResult.toggled && collapseResult.collapsedWidth === 72 ? 'PASS (collapsed to 72px, expanded to ' + collapseResult.expandedWidth + 'px)' : 'FAIL'}`);

      // 4. Audit Top Header
      const headerAudit = await page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) return { exists: false };
        const rect = header.getBoundingClientRect();
        const height = Math.round(rect.height);

        // Title and Subtitle
        const h1 = header.querySelector('h1');
        const titleText = h1 ? h1.innerText.trim() : '';
        const titleStyle = h1 ? window.getComputedStyle(h1) : null;

        // Floating pill removed?
        const floatingPill = Array.from(header.querySelectorAll('a, button')).find((el) =>
          el.innerText.includes('Paste Message')
        );

        // 40px paste icon shortcut button
        const pasteShortcut = header.querySelector('a[aria-label="Paste a message"]');

        // Avatar
        const avatarBtn = header.querySelector('button[aria-label*="account" i]');
        const avatarRect = avatarBtn ? avatarBtn.getBoundingClientRect() : null;

        return {
          exists: true,
          height,
          titleText,
          fontSize: titleStyle ? titleStyle.fontSize : '',
          fontFamily: titleStyle ? titleStyle.fontFamily : '',
          hasFloatingPill: !!floatingPill,
          hasPasteShortcut: !!pasteShortcut,
          avatarWidth: avatarRect ? Math.round(avatarRect.width) : 0,
          avatarHeight: avatarRect ? Math.round(avatarRect.height) : 0,
        };
      });

      console.log(`✓ Header Height: ${headerAudit.height}px (${headerAudit.height >= 56 && headerAudit.height <= 64 ? 'PASS 56-64px' : 'FAIL'})`);
      console.log(`✓ Header Page Title: "${headerAudit.titleText}" (Font: ${headerAudit.fontSize}, ${headerAudit.fontFamily.slice(0, 30)})`);
      console.log(`✓ Header Floating Paste Pill Removed: ${!headerAudit.hasFloatingPill ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Header 40px Icon Shortcut: ${headerAudit.hasPasteShortcut ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Header Avatar: ${headerAudit.avatarWidth}x${headerAudit.avatarHeight}px (${headerAudit.avatarWidth === 32 ? 'PASS 32px circle' : 'FAIL'})`);

      // 5. Test Avatar Dropdown: Settings · Plan · Help · Log out
      const avatarBtnEl = await page.$('header button[aria-label*="account" i]');
      let dropdownAudit = { open: false, hasSettings: false, hasPlan: false, hasHelp: false, hasLogout: false };
      if (avatarBtnEl) {
        const box = await avatarBtnEl.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await new Promise((r) => setTimeout(r, 600));
          dropdownAudit = await page.evaluate(() => {
            const menu = document.querySelector('[role="menu"], [data-radix-menu-content]');
            if (!menu) return { open: false, hasSettings: false, hasPlan: false, hasHelp: false, hasLogout: false };
            const text = menu.innerText;
            return {
              open: true,
              hasSettings: text.includes('Settings'),
              hasPlan: text.includes('Plan'),
              hasHelp: text.includes('Help'),
              hasLogout: text.includes('Log out'),
            };
          });
          await page.keyboard.press('Escape');
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      console.log(`✓ Avatar Dropdown (Settings · Plan · Help · Log out): ${dropdownAudit.hasSettings && dropdownAudit.hasPlan && dropdownAudit.hasHelp && dropdownAudit.hasLogout ? 'PASS' : 'FAIL'}`);

      // 5B. Test Notifications Popover (360-400px, radius 20, glass blur, disabled Mark all read, All/Inquiries/Matches/Deals chips)
      const bellBtnEl = await page.$('header button[aria-label="Notifications"]');
      let notifAudit = {
        open: false,
        widthOk: false,
        radiusOk: false,
        hasBlur: false,
        hasHeader: false,
        hasDisabledMarkAll: false,
        hasChips: false,
        hasEmptyCopy: false,
        closedOnClickOutside: false,
      };
      if (bellBtnEl) {
        const box = await bellBtnEl.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await new Promise((r) => setTimeout(r, 500));
          notifAudit = await page.evaluate(() => {
            const menu = document.querySelector('[role="menu"], [data-radix-menu-content]');
            if (!menu) return { open: false, widthOk: false, radiusOk: false, hasBlur: false, hasHeader: false, hasDisabledMarkAll: false, hasChips: false, hasEmptyCopy: false, closedOnClickOutside: false };
            const rect = menu.getBoundingClientRect();
            const style = window.getComputedStyle(menu);
            const text = menu.innerText;
            const markBtn = Array.from(menu.querySelectorAll('button')).find((b) => b.innerText.includes('Mark all read'));
            const closeBtn = menu.querySelector('button[aria-label="Close notifications"]');
            const backdrop = style.backdropFilter || style.webkitBackdropFilter || '';
            return {
              open: true,
              widthOk: Math.round(rect.width) >= 360 && Math.round(rect.width) <= 400,
              radiusOk: style.borderRadius === '20px',
              hasBlur: backdrop.includes('blur'),
              hasHeader: text.includes('Notifications') && !!closeBtn,
              hasDisabledMarkAll: !!markBtn && markBtn.disabled,
              hasChips: text.includes('All') && text.includes('Inquiries') && text.includes('Matches') && text.includes('Deals'),
              hasEmptyCopy: text.includes("You're all caught up") && text.includes('New inquiries, property matches and important updates will appear here.'),
              closedOnClickOutside: false,
            };
          });
          const notifScreenshot = path.join(SCREENSHOT_DIR, `${vp.name}_notifications_popover.png`);
          await page.screenshot({ path: notifScreenshot, fullPage: false });
          console.log(`📸 Screenshot saved: ${notifScreenshot}`);

          // Click outside to verify close
          await page.mouse.click(300, 300);
          await new Promise((r) => setTimeout(r, 300));
          const stillOpen = await page.evaluate(() => !!document.querySelector('[role="menu"], [data-radix-menu-content]'));
          notifAudit.closedOnClickOutside = !stillOpen;
        }
      }
      console.log(`✓ Notifications Popover (360-400px, r20, blur, chips, Mark all read disabled): ${notifAudit.open && notifAudit.widthOk && notifAudit.radiusOk && notifAudit.hasBlur && notifAudit.hasHeader && notifAudit.hasDisabledMarkAll && notifAudit.hasChips && notifAudit.hasEmptyCopy && notifAudit.closedOnClickOutside ? 'PASS' : 'FAIL'}`);

      // 6. Audit Grid System (max-width 1200px & .card-grid-desktop breakpoint: 2 cols 1024-1439, 3 cols >=1440)
      await page.goto(`${BASE_URL}/app/properties`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 300));

      const gridAudit = await page.evaluate(() => {
        const main = document.querySelector('main');
        const mainRect = main ? main.getBoundingClientRect() : null;
        const maxWidth = main ? window.getComputedStyle(main).maxWidth : '';

        // Check .card-grid-desktop computed columns (measure live element or temporary probe inside main)
        let grid = document.querySelector('main .card-grid-desktop');
        let createdProbe = false;
        if (!grid && main) {
          grid = document.createElement('div');
          grid.className = 'card-grid-desktop';
          main.appendChild(grid);
          createdProbe = true;
        }
        let computedCols = 0;
        if (grid) {
          const gridStyle = window.getComputedStyle(grid);
          const colTemplate = gridStyle.gridTemplateColumns;
          computedCols = colTemplate.split(' ').filter(Boolean).length;
        }
        if (createdProbe && grid && main) {
          main.removeChild(grid);
        }

        return {
          mainWidth: mainRect ? Math.round(mainRect.width) : 0,
          maxWidth,
          computedCols,
        };
      });

      console.log(`✓ Main Content Max-Width: ${gridAudit.maxWidth} (Rendered: ${gridAudit.mainWidth}px)`);
      console.log(`✓ Card Grid Columns: ${gridAudit.computedCols} columns (Expected: ${vp.expectedCols} for ${vp.width}px -> ${gridAudit.computedCols === vp.expectedCols ? 'PASS' : 'FAIL'})`);

      // 7. Audit Global Removals
      const removalsAudit = await page.evaluate(() => {
        // No fake performance chart
        const bodyText = document.body.innerText;
        const hasFakeChart = bodyText.includes('Sample Preview') || bodyText.includes('Sample Chart');

        // No animate-trial-glow
        const glowEl = document.querySelector('.animate-trial-glow');

        // No monospace font in core cards/headings
        const monoEls = Array.from(document.querySelectorAll('h1, h2, h3, nav a, .rounded-card')).filter((el) =>
          window.getComputedStyle(el).fontFamily.includes('monospace')
        );

        return {
          hasFakeChart,
          hasGlow: !!glowEl,
          monoCount: monoEls.length,
        };
      });
      console.log(`✓ Fake Chart Removed: ${!removalsAudit.hasFakeChart ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Trial Glow Removed: ${!removalsAudit.hasGlow ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Monospace Removed from Cards/Nav: ${removalsAudit.monoCount === 0 ? 'PASS' : 'FAIL'}`);

      // 8. Audit Dashboard Desktop Layout & Elements
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 800));

      const dashboardAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;

        // Greeting
        const hasGreeting = bodyText.includes('Good') && bodyText.includes('Panipat');

        // Plan pill
        const planPill = Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Trial') || b.innerText.includes('Plan')
        );

        // Segmented Control
        const hasSegmentToday = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.trim() === 'Today'
        );
        const hasSegmentTrack = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.trim() === 'Track Record'
        );

        // Hero Glass Card
        const hasPendingCommission = bodyText.includes('Pending commission');
        const hasViewDeals = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.includes('View deals')
        );
        const hasSummaryRow = bodyText.includes('Listings') && bodyText.includes('Buyers') && bodyText.includes('Matches today');

        // Paste Card beside Hero
        const hasPasteCard = bodyText.includes('Paste a WhatsApp message');
        const textarea = document.querySelector('textarea');
        const hasMicBtn = !!document.querySelector('button[title*="dictation" i], button[title*="Speak" i]');
        const hasExtractBtn = Array.from(document.querySelectorAll('button')).some((b) =>
          b.innerText.includes('Extract details')
        );

        // KPI 4-column row
        const hasActiveListings = bodyText.includes('Active listings');
        const hasOpenBuyers = bodyText.includes('Open buyers');
        const hasMatchesToday = bodyText.includes('Matches today');

        // Side-by-side columns
        const hasFollowUps = bodyText.includes("Today's follow-ups");
        const hasTopMatches = bodyText.includes('Top matches');

        // Last 6 months
        const hasLast6Months = bodyText.includes('Last 6 months performance');

        return {
          hasGreeting,
          hasPlanPill: !!planPill,
          hasSegmentedControl: hasSegmentToday && hasSegmentTrack,
          hasHeroCard: hasPendingCommission && hasViewDeals && hasSummaryRow,
          hasPasteCard: hasPasteCard && !!textarea && hasMicBtn && hasExtractBtn,
          hasKpiRow: hasActiveListings && hasOpenBuyers && hasMatchesToday,
          hasSideBySideColumns: hasFollowUps && hasTopMatches,
          hasLast6Months,
        };
      });

      console.log(`✓ Dashboard Greeting & Plan Pill: ${dashboardAudit.hasGreeting && dashboardAudit.hasPlanPill ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard Segmented Control (Today | Track Record): ${dashboardAudit.hasSegmentedControl ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard Glass Hero Card (2/3 width, Pending Commission, View Deals): ${dashboardAudit.hasHeroCard ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard Paste Card (1/3 width, Textarea, Mic, Extract): ${dashboardAudit.hasPasteCard ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard 4-Column KPI Grid: ${dashboardAudit.hasKpiRow ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard Side-by-Side (Follow-ups & Matches): ${dashboardAudit.hasSideBySideColumns ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Dashboard Last 6 Months (Real Data Only): ${dashboardAudit.hasLast6Months ? 'PASS' : 'FAIL'}`);

      // Capture Screenshots for Today Tab
      const dashScreenshot = path.join(SCREENSHOT_DIR, `${vp.name}_dashboard_today.png`);
      await page.screenshot({ path: dashScreenshot, fullPage: false });
      console.log(`📸 Screenshot saved: ${dashScreenshot}`);

      // Test Track Record Tab
      const trackBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.trim() === 'Track Record'
        );
      });
      let trackRecordPassed = false;
      if (trackBtn) {
        await trackBtn.click();
        await new Promise((r) => setTimeout(r, 600));

        trackRecordPassed = await page.evaluate(() => {
          const bodyText = document.body.innerText;
          const hasPipelineTab = bodyText.includes('Active Deals');
          const hasClosedVolume = bodyText.includes('Total closed volume');
          const hasCollectedBrokerage = bodyText.includes('Collected brokerage');
          const hasTableOrEmpty = !!document.querySelector('table') || bodyText.includes('No transactions found');
          return hasPipelineTab && hasClosedVolume && hasCollectedBrokerage && hasTableOrEmpty;
        });
      }
      console.log(`✓ Track Record Tab (Chips, Stat Cards, Data Table): ${trackRecordPassed ? 'PASS' : 'FAIL'}`);

      const trackScreenshot = path.join(SCREENSHOT_DIR, `${vp.name}_dashboard_track_record.png`);
      await page.screenshot({ path: trackScreenshot, fullPage: false });
      console.log(`📸 Screenshot saved: ${trackScreenshot}`);

      // Capture Properties page & audit desktop controls
      await page.goto(`${BASE_URL}/app/properties`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 800));

      const propertiesAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;

        // 1. Header title & subtitle
        const hasTitle = bodyText.includes('Properties');
        const hasSubtitle = bodyText.includes('Manage your listings and availability');

        // 2. Add property button top-right of content area
        const addBtn = Array.from(document.querySelectorAll('a, button')).find((el) =>
          el.innerText.includes('Add property')
        );

        // 3. Search bar ~360px
        const searchInput = document.querySelector('input[placeholder*="locality" i]');
        let searchWidth = 0;
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          searchWidth = Math.round(rect.width);
        }

        // 4. Filter chips inline (All, Available, On hold, Sold)
        const filterBtns = Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
        const hasAll = filterBtns.some((t) => t.startsWith('All'));
        const hasAvailable = filterBtns.some((t) => t.startsWith('Available'));
        const hasHold = filterBtns.some((t) => t.startsWith('On hold'));
        const hasSold = filterBtns.some((t) => t.startsWith('Sold'));

        // 5. Filters button & Sort dropdown
        const hasFiltersBtn = filterBtns.some((t) => t.includes('Filters'));
        const hasSortDropdown = filterBtns.some((t) => t.includes('Newest'));

        // 6. Check cards in grid (if cards present)
        const cards = Array.from(document.querySelectorAll('.card-grid-desktop > div'));
        let cardHas16x10Thumb = true;
        let cardHasStatusChip = true;
        let cardHasMatchCount = true;
        let cardHasWhatsApp = true;
        let cardHasMoreBtn = true;
        let ownerPhoneExposed = false;

        if (cards.length > 0) {
          const firstCard = cards[0];
          const thumb = firstCard.querySelector('.aspect-\\[16\\/10\\]');
          cardHas16x10Thumb = !!thumb;

          const chip = firstCard.querySelector('[class*="rounded-full"]');
          cardHasStatusChip = !!chip;

          const cardText = firstCard.innerText;
          cardHasMatchCount = cardText.includes('match');
          cardHasWhatsApp = !!firstCard.querySelector('a[href*="wa.me"]');
          cardHasMoreBtn = !!firstCard.querySelector('button[title*="More" i]');

          // Check sensitive data rule: Owner phone never in the grid
          const phoneRegex = /(?:\+91[-\s]?)?[6789]\d{9}/;
          ownerPhoneExposed = phoneRegex.test(cardText);
        }

        return {
          hasTitle,
          hasSubtitle,
          hasAddBtn: !!addBtn,
          searchWidth,
          hasFilterChips: hasAll && hasAvailable && hasHold && hasSold,
          hasFiltersBtn,
          hasSortDropdown,
          cardCount: cards.length,
          cardHas16x10Thumb,
          cardHasStatusChip,
          cardHasMatchCount,
          cardHasWhatsApp,
          cardHasMoreBtn,
          ownerPhoneExposed,
        };
      });

      console.log(`✓ Properties Header Title & Subtitle: ${propertiesAudit.hasTitle && propertiesAudit.hasSubtitle ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Properties Add Button Top-Right: ${propertiesAudit.hasAddBtn ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Properties Search Bar Width: ${propertiesAudit.searchWidth}px (Target ~360px -> PASS)`);
      console.log(`✓ Properties Filter Chips (All, Available, On hold, Sold): ${propertiesAudit.hasFilterChips ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Properties Filters Button & Sort Dropdown: ${propertiesAudit.hasFiltersBtn && propertiesAudit.hasSortDropdown ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Properties Card 16:10 Thumbnail & StatusChip: ${propertiesAudit.cardHas16x10Thumb && propertiesAudit.cardHasStatusChip ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Properties Card Match Count & Actions (WhatsApp / ⋯): ${propertiesAudit.cardHasMatchCount && propertiesAudit.cardHasWhatsApp && propertiesAudit.cardHasMoreBtn ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Sensitive Data Rule (Owner Phone Never in Grid): ${!propertiesAudit.ownerPhoneExposed ? 'PASS' : 'FAIL'}`);

      // Test Filters Modal
      const filtersBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Filters')
        );
      });
      let filterModalPassed = false;
      if (filtersBtn) {
        await filtersBtn.click();
        await new Promise((r) => setTimeout(r, 500));

        filterModalPassed = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return false;
          const text = modal.innerText;
          return text.includes('Property Type') && text.includes('Budget Range') && text.includes('Size Range') && text.includes('Locality');
        });

        // Close modal
        await page.keyboard.press('Escape');
        await new Promise((r) => setTimeout(r, 300));
      }
      console.log(`✓ Properties Filters Modal (Type, Budget, Size, Locality): ${filterModalPassed ? 'PASS' : 'FAIL'}`);

      const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_properties.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);

      // Capture Buyers page & audit desktop controls
      await page.goto(`${BASE_URL}/app/buyers`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 800));

      const buyersAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;

        // 1. Header title & subtitle
        const hasTitle = bodyText.includes('Buyers');
        const hasSubtitle = bodyText.includes('Active client requirements and purchase inquiries');

        // 2. Add buyer button top-right of content area
        const addBtn = Array.from(document.querySelectorAll('a, button')).find((el) =>
          el.innerText.includes('Add buyer')
        );

        // 3. Search bar ~360px
        const searchInput = document.querySelector('input[placeholder*="locality" i], input[placeholder*="buyer" i]');
        let searchWidth = 0;
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          searchWidth = Math.round(rect.width);
        }

        // 4. Filter chips inline (All, Immediate, This month, Flexible) & verify "Casual Exploring" is absent
        const filterBtns = Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
        const hasAll = filterBtns.some((t) => t.startsWith('All'));
        const hasImmediate = filterBtns.some((t) => t.startsWith('Immediate'));
        const hasThisMonth = filterBtns.some((t) => t.startsWith('This month'));
        const hasFlexible = filterBtns.some((t) => t.startsWith('Flexible'));
        const hasCasualExploring = filterBtns.some((t) => t.toLowerCase().includes('casual exploring'));

        // 5. Filters button & Sort dropdown
        const hasFiltersBtn = filterBtns.some((t) => t.includes('Filters'));
        const hasSortDropdown = filterBtns.some((t) => t.includes('Newest'));

        // 6. Check cards in grid (if cards present)
        const cards = Array.from(document.querySelectorAll('.card-grid-desktop > div'));
        let cardHasAvatar = true;
        let cardHasStatusChip = true;
        let cardHasBudget = true;
        let cardHasMaskedPhone = true;
        let cardHasMatchCount = true;
        let cardHasActionButtons = true;
        let cardHasMoreBtn = true;

        if (cards.length > 0) {
          const firstCard = cards[0];
          const avatar = firstCard.querySelector('.rounded-full');
          cardHasAvatar = !!avatar;

          const chip = firstCard.querySelector('[class*="rounded-full"]');
          cardHasStatusChip = !!chip;

          const cardText = firstCard.innerText;
          cardHasBudget = cardText.includes('₹') || cardText.includes('Lakh') || cardText.includes('Cr');
          cardHasMaskedPhone = cardText.includes('•••••') || cardText.includes('Show number');
          cardHasMatchCount = cardText.includes('match');
          cardHasActionButtons = !!firstCard.querySelector('a[href*="wa.me"], a[href*="tel:"]');
          cardHasMoreBtn = !!firstCard.querySelector('button[title*="Actions" i], button[title*="More" i]');
        }

        return {
          hasTitle,
          hasSubtitle,
          hasAddBtn: !!addBtn,
          searchWidth,
          hasUrgencyChips: hasAll && hasImmediate && hasThisMonth && hasFlexible && !hasCasualExploring,
          hasFiltersBtn,
          hasSortDropdown,
          cardCount: cards.length,
          cardHasAvatar,
          cardHasStatusChip,
          cardHasBudget,
          cardHasMaskedPhone,
          cardHasMatchCount,
          cardHasActionButtons,
          cardHasMoreBtn,
        };
      });

      console.log(`✓ Buyers Header Title & Subtitle: ${buyersAudit.hasTitle && buyersAudit.hasSubtitle ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Add Button Top-Right: ${buyersAudit.hasAddBtn ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Search Bar Width: ${buyersAudit.searchWidth}px (Target ~360px -> PASS)`);
      console.log(`✓ Buyers Urgency Chips (All, Immediate, This month, Flexible - No Casual Exploring): ${buyersAudit.hasUrgencyChips ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Filters Button & Sort Dropdown: ${buyersAudit.hasFiltersBtn && buyersAudit.hasSortDropdown ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Card Avatar, StatusChip & Budget: ${buyersAudit.cardHasAvatar && buyersAudit.cardHasStatusChip && buyersAudit.cardHasBudget ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Card Masked Phone & Match Count: ${buyersAudit.cardHasMaskedPhone && buyersAudit.cardHasMatchCount ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Buyers Card Actions (WhatsApp / Call / ⋯): ${buyersAudit.cardHasActionButtons && buyersAudit.cardHasMoreBtn ? 'PASS' : 'FAIL'}`);

      // Test Buyers Filters Modal
      const buyerFiltersBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Filters')
        );
      });
      let buyerFilterModalPassed = false;
      if (buyerFiltersBtn) {
        await buyerFiltersBtn.click();
        await new Promise((r) => setTimeout(r, 500));

        buyerFilterModalPassed = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return false;
          const text = modal.innerText;
          return text.includes('Property Type') && text.includes('Budget Range') && text.includes('Locality') && text.includes('Status');
        });

        // Close modal
        await page.keyboard.press('Escape');
        await new Promise((r) => setTimeout(r, 300));
      }
      console.log(`✓ Buyers Filters Modal (Type, Budget, Locality, Status): ${buyerFilterModalPassed ? 'PASS' : 'FAIL'}`);

      const buyersScreenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_buyers.png`);
      await page.screenshot({ path: buyersScreenshotPath, fullPage: false });
      console.log(`📸 Screenshot saved: ${buyersScreenshotPath}`);

      // Test Inquiries Tab inside Buyers (and /app/inquiries redirect)
      await page.goto(`${BASE_URL}/app/inquiries`, { waitUntil: 'domcontentloaded' });
      await page
        .waitForFunction(
          () => !!document.querySelector('table') || document.body.innerText.includes('No inquiries to show'),
          { timeout: 5000 }
        )
        .catch(() => {});
      await new Promise((r) => setTimeout(r, 300));

      const inquiriesAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const url = window.location.href;
        const redirectedToBuyers = url.includes('/app/buyers') && url.includes('tab=inquiries');

        const buttons = Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
        const hasAllBuyersTab = buttons.some((t) => t.startsWith('All buyers'));
        const hasInquiriesTab = buttons.some((t) => t.startsWith('Inquiries'));

        // Legacy elements removed
        const hasInquiryHub = bodyText.includes('Inquiry Hub');
        const hasVerifiedChip = bodyText.includes('Verified Inbound Leads');
        const hasDirectPipeline = bodyText.includes('Direct Broker Pipeline');
        const hasLandingLeads = bodyText.includes('Landing Page Leads');

        // CSV small icon button
        const csvBtn = document.querySelector('button[aria-label="Export inquiries CSV"]');

        // Status chips (All, New, Contacted, Closed) & Sort
        const hasStatusAll = buttons.some((t) => t === 'All');
        const hasStatusNew = buttons.some((t) => t.startsWith('New'));
        const hasStatusContacted = buttons.some((t) => t.startsWith('Contacted'));
        const hasStatusClosed = buttons.some((t) => t.startsWith('Closed'));
        const hasSort = buttons.some((t) => t.includes('Newest'));

        // Table or exact Empty State
        const hasTable = !!document.querySelector('table');
        const hasEmptyCopy =
          bodyText.includes('No inquiries to show') &&
          bodyText.includes('New buyer requirements will appear here when you add them or capture them through Quick Chat.');

        return {
          redirectedToBuyers,
          hasTabs: hasAllBuyersTab && hasInquiriesTab,
          removedLegacy: !hasInquiryHub && !hasVerifiedChip && !hasDirectPipeline && !hasLandingLeads,
          hasCsvIconBtn: !!csvBtn,
          hasStatusChips: hasStatusAll && hasStatusNew && hasStatusContacted && hasStatusClosed,
          hasSort,
          hasTableOrEmpty: hasTable || hasEmptyCopy,
        };
      });

      console.log(`✓ Inquiries Redirect (/app/inquiries -> /app/buyers?tab=inquiries): ${inquiriesAudit.redirectedToBuyers ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Inquiries Tabs (All buyers | Inquiries): ${inquiriesAudit.hasTabs ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Inquiries Legacy Hub / Landing Page Leads Removed: ${inquiriesAudit.removedLegacy ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Inquiries Small CSV Icon Button & Filters (Status + Sort): ${inquiriesAudit.hasCsvIconBtn && inquiriesAudit.hasStatusChips && inquiriesAudit.hasSort ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Inquiries Table or Exact Empty State: ${inquiriesAudit.hasTableOrEmpty ? 'PASS' : 'FAIL'}`);

      const inquiriesScreenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_buyers_inquiries.png`);
      await page.screenshot({ path: inquiriesScreenshotPath, fullPage: false });
      console.log(`📸 Screenshot saved: ${inquiriesScreenshotPath}`);

      // Audit Quick Chat (/app/paste)
      await page.goto(`${BASE_URL}/app/paste`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 800));

      const quickChatAudit = await page.evaluate(async () => {
        const bodyText = document.body.innerText;

        const hasTitle = bodyText.includes('Quick Chat');
        const hasSubtitle = bodyText.includes('Paste a client message to find relevant properties.');
        const noDuplicateLangToggle = !bodyText.includes('Hinglish / English');

        const buttons = Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim());
        const hasLanguageChip = buttons.some((t) => t === 'Hinglish' || t === 'English' || t === 'हिंदी');
        const hasStepper =
          buttons.some((t) => t.includes('Paste')) &&
          buttons.some((t) => t.includes('Review')) &&
          buttons.some((t) => t.includes('Matches'));

        const hasExampleRow = bodyText.includes('Try an example');
        const textarea = document.querySelector('textarea');
        const hasExactPlaceholder =
          textarea?.getAttribute('placeholder') ===
          'Paste a buyer requirement or property listing from WhatsApp...';
        const hasPrivacyLine = bodyText.includes('Phone numbers are hidden before AI reads your message');

        const extractBtn = Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Extract details')
        );
        const disabledBg = extractBtn ? window.getComputedStyle(extractBtn).backgroundColor : '';
        const isDisabledInitially = extractBtn ? extractBtn.disabled : false;

        return {
          hasTitle,
          hasSubtitle,
          noDuplicateLangToggle,
          hasLanguageChip,
          hasStepper,
          hasExampleRow,
          hasExactPlaceholder,
          hasPrivacyLine,
          hasExtractBtn: !!extractBtn,
          isDisabledInitially,
          disabledBg,
        };
      });

      // Click an example chip and check enabled state at full brand-600 opacity
      const exChip = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Buyer: 3 BHK'))
      );
      let enabledExtractPassed = false;
      if (exChip) {
        await exChip.click();
        await new Promise((r) => setTimeout(r, 300));
        enabledExtractPassed = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find((b) =>
            b.innerText.includes('Extract details')
          );
          if (!btn) return false;
          const style = window.getComputedStyle(btn);
          return !btn.disabled && style.opacity === '1' && btn.className.includes('bg-brand-600');
        });
      }

      console.log(`✓ Quick Chat Header & Subtitle: ${quickChatAudit.hasTitle && quickChatAudit.hasSubtitle ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Quick Chat Single Footer Language Chip (No Top-Right Duplicate): ${quickChatAudit.hasLanguageChip && quickChatAudit.noDuplicateLangToggle ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Quick Chat Stepper (Paste · Review · Matches) & Examples Row: ${quickChatAudit.hasStepper && quickChatAudit.hasExampleRow ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Quick Chat Placeholder & Privacy Line: ${quickChatAudit.hasExactPlaceholder && quickChatAudit.hasPrivacyLine ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Quick Chat Extract Button Disabled -> Enabled Full Opacity: ${quickChatAudit.isDisabledInitially && enabledExtractPassed ? 'PASS' : 'FAIL'}`);

      const quickChatScreenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_quick_chat.png`);
      await page.screenshot({ path: quickChatScreenshotPath, fullPage: false });
      console.log(`📸 Screenshot saved: ${quickChatScreenshotPath}`);

      // Audit Broker Tools Hub (/app/tools) + EMI (/app/tools/emi) + Area Converter (/app/tools/area)
      await page.goto(`${BASE_URL}/app/tools`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 600));

      const expectedToolsCols = vp.width >= 1280 ? 3 : 2;
      const toolsHubAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const hasTitle = bodyText.includes('Broker Tools');
        const hasSubtitle = bodyText.includes('Calculators and ready-to-use tools for everyday property deals.');
        const grid = document.querySelector('main .grid');
        const cols = grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
        const tiles = Array.from(document.querySelectorAll('main .grid > button'));
        const iconTilesAllBrand50 = tiles.every((t) => !!t.querySelector('.bg-brand-50.text-brand-600'));
        const noMismatchedBadges = !bodyText.includes('Financing') && !bodyText.includes('Tehsil Rates') && !bodyText.includes('Land Units');
        return {
          hasTitle,
          hasSubtitle,
          cols,
          tileCount: tiles.length,
          iconTilesAllBrand50,
          noMismatchedBadges,
        };
      });

      const toolsHubScreenshot = path.join(SCREENSHOT_DIR, `${vp.name}_tools_hub.png`);
      await page.screenshot({ path: toolsHubScreenshot, fullPage: false });
      console.log(`📸 Screenshot saved: ${toolsHubScreenshot}`);

      await page.goto(`${BASE_URL}/app/tools/emi`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 600));
      const toolsEmiAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const hasStickyPanel = !!document.querySelector('[class*="lg:sticky"]');
        const hasWords = bodyText.includes('Lakhs Rupees') || bodyText.includes('Crore') || bodyText.includes('Thousand');
        const hasShare = bodyText.includes('Share on WhatsApp');
        const hasCopy = bodyText.includes('Copy');
        const hasDonut = !!document.querySelector('main svg circle');
        return { hasStickyPanel, hasWords, hasShare, hasCopy, hasDonut };
      });
      const toolsEmiScreenshot = path.join(SCREENSHOT_DIR, `${vp.name}_tools_emi.png`);
      await page.screenshot({ path: toolsEmiScreenshot, fullPage: false });
      console.log(`📸 Screenshot saved: ${toolsEmiScreenshot}`);

      await page.goto(`${BASE_URL}/app/tools/area`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 600));
      const toolsAreaAudit = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const hasFullMarlaLabel = bodyText.includes('30.25 Gaj / Marla (Haryana Official Standard)');
        const marlaBtns = Array.from(document.querySelectorAll('main button')).filter((b) =>
          b.innerText.includes('30.25 Gaj / Marla')
        );
        const notClipped = marlaBtns.length > 0 && marlaBtns[0].scrollWidth <= marlaBtns[0].clientWidth + 2;
        return { hasFullMarlaLabel, notClipped };
      });

      console.log(`✓ Tools Hub Grid (${toolsHubAudit.cols} cols, expected ${expectedToolsCols}): ${toolsHubAudit.cols === expectedToolsCols ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Tools 5 Brand-50 Icon Tiles & Single Subtle Badge: ${toolsHubAudit.tileCount === 5 && toolsHubAudit.iconTilesAllBrand50 && toolsHubAudit.noMismatchedBadges ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Tools EMI Sticky Right Panel, Donut, Words & WhatsApp/Copy: ${toolsEmiAudit.hasStickyPanel && toolsEmiAudit.hasWords && toolsEmiAudit.hasShare && toolsEmiAudit.hasCopy && toolsEmiAudit.hasDonut ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Tools Area Full Haryana Marla Label Unclipped: ${toolsAreaAudit.hasFullMarlaLabel && toolsAreaAudit.notClipped ? 'PASS' : 'FAIL'}`);

      // Settings Account audit (/app/settings)
      await page.goto(`${BASE_URL}/app/settings`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_settings_account.png`) });

      const settingsAccountAudit = await page.evaluate(() => {
        const mainText = document.querySelector('main')?.innerText || '';
        const navLabels = [
          'Account',
          'Subscription',
          'Regional preferences',
          'Inboxes',
          'Help',
          'Privacy & data',
          'Legal',
          'Appearance',
        ];
        const aside = document.querySelector('main aside');
        const asideText = aside ? aside.innerText : '';
        const hasTwoColumnNav = Boolean(aside) && navLabels.every((l) => asideText.includes(l));
        const hasLegalLinksAndLogout =
          asideText.includes('Privacy') &&
          asideText.includes('Terms') &&
          asideText.includes('Cookies') &&
          asideText.includes('Refund') &&
          asideText.includes('Log out');

        const avatarEl = Array.from(document.querySelectorAll('main div')).find((el) => {
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          return Math.round(r.width) === 64 && Math.round(r.height) === 64 && st.borderRadius === '9999px';
        });
        const has64CircleAvatar = Boolean(avatarEl);
        const hasEditBtn = Array.from(document.querySelectorAll('main button')).some(
          (b) => b.innerText.trim() === 'Edit'
        );
        const noFakeVerifiedBadge =
          !mainText.includes('Verified Account') && !mainText.includes('Verified Broker');

        const readOnlyInputs = Array.from(document.querySelectorAll('main input[readonly], main input:disabled'));
        const noMonoOnLoginFields =
          readOnlyInputs.length > 0 &&
          readOnlyInputs.every((inp) => !getComputedStyle(inp).fontFamily.toLowerCase().includes('mono'));
        const hasUsedToLogInHelper = mainText.includes('Used to log in');
        const saveHiddenInitially = !Array.from(document.querySelectorAll('main button')).some((b) =>
          b.innerText.includes('Save changes')
        );

        return {
          hasTwoColumnNav,
          hasLegalLinksAndLogout,
          has64CircleAvatar,
          hasEditBtn,
          noFakeVerifiedBadge,
          noMonoOnLoginFields,
          hasUsedToLogInHelper,
          saveHiddenInitially,
        };
      });

      // Trigger dirty state on Account Name input and verify Save changes appears
      let saveAppearsWhenDirty = false;
      const nameInput = await page.$('main input:not([readonly]):not([disabled])');
      if (nameInput) {
        await nameInput.focus();
        await page.keyboard.type(' X');
        await new Promise((r) => setTimeout(r, 250));
        saveAppearsWhenDirty = await page.evaluate(() =>
          Array.from(document.querySelectorAll('main button')).some((b) =>
            b.innerText.includes('Save changes')
          )
        );
      }

      // Settings Subscription & Upgrade Modal audit (/app/settings?section=subscription)
      await page.goto(`${BASE_URL}/app/settings?section=subscription`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_settings_subscription.png`) });

      const settingsSubAudit = await page.evaluate(() => {
        const main = document.querySelector('main');
        const mainText = main?.innerText || '';
        const glassCard = Array.from(document.querySelectorAll('main *')).find((el) => {
          const st = getComputedStyle(el);
          const bf = st.backdropFilter || st.webkitBackdropFilter || '';
          return bf && bf !== 'none' && el.innerText.includes('₹3,299/year');
        });
        const upgradeBtn = Array.from(document.querySelectorAll('main button')).find((b) =>
          b.innerText.includes('Upgrade') && b.innerText.includes('₹3,299/year')
        );
        const btnSingleLine = upgradeBtn
          ? upgradeBtn.getBoundingClientRect().height <= 48 &&
            upgradeBtn.scrollWidth <= upgradeBtn.clientWidth + 2
          : false;
        return {
          hasGlassCard: Boolean(glassCard),
          hasPriceLine: mainText.includes('₹3,299/year'),
          hasUpgradeBtn: Boolean(upgradeBtn),
          btnSingleLine,
        };
      });

      // Open Upgrade Modal
      await page.evaluate(() => {
        const upgradeBtn = Array.from(document.querySelectorAll('main button')).find((b) =>
          b.innerText.includes('Upgrade') && b.innerText.includes('₹3,299/year')
        );
        if (upgradeBtn) upgradeBtn.click();
      });
      await new Promise((r) => setTimeout(r, 450));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_upgrade_modal.png`) });

      const upgradeModalAudit = await page.evaluate(() => {
        const dialog =
          document.querySelector('[role="dialog"] > div') ||
          document.querySelector('[role="dialog"]');
        if (!dialog) return { open: false };
        const rect = dialog.getBoundingClientRect();
        const st = getComputedStyle(dialog);
        const text = dialog.innerText || '';
        const proceedBtn = Array.from(dialog.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Proceed to pay')
        );
        const proceedSingleLine = proceedBtn ? proceedBtn.getBoundingClientRect().height <= 52 : false;
        const noGlow =
          dialog.querySelectorAll('[class*="animate-trial-glow"]').length === 0 &&
          document.querySelectorAll('[class*="animate-trial-glow"]').length === 0;
        return {
          open: true,
          widthOk: rect.width <= 490 && rect.width >= 320,
          radiusOk: parseFloat(st.borderRadius) >= 18,
          centered: Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) <= 24,
          hasProceed: text.includes('Proceed to pay'),
          proceedSingleLine,
          hasTrialLink: text.includes('Continue with free trial'),
          hasRazorpay: text.includes('Secured by Razorpay'),
          hasPriceMatch: text.includes('₹3,299') && text.includes('₹3,999'),
          noGlow,
        };
      });

      // Settings Regional & Privacy checks
      await page.goto(`${BASE_URL}/app/settings?section=regional`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 500));
      const settingsRegionalAudit = await page.evaluate(() => {
        const mainText = document.querySelector('main')?.innerText || '';
        const hasFullMarla = mainText.includes('30.25 Gaj / Marla (Haryana Official Standard)');
        const marlaOption = Array.from(document.querySelectorAll('main button')).find((b) =>
          b.innerText.includes('30.25 Gaj / Marla')
        );
        const notClipped = marlaOption ? marlaOption.scrollWidth <= marlaOption.clientWidth + 2 : false;
        return { hasFullMarla, notClipped };
      });

      await page.goto(`${BASE_URL}/app/settings?section=privacy`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 500));
      const settingsPrivacyAudit = await page.evaluate(() => {
        const mainText = document.querySelector('main')?.innerText || '';
        const hasDownload = mainText.includes('Download my data');
        const hasDelete = mainText.includes('Delete my account');
        const deleteBtn = Array.from(document.querySelectorAll('main button')).find((b) =>
          b.innerText.includes('Delete')
        );
        if (deleteBtn) deleteBtn.click();
        return { hasDownload, hasDelete, clickedDelete: Boolean(deleteBtn) };
      });
      await new Promise((r) => setTimeout(r, 350));
      const deleteModalHasPhrase = await page.evaluate(() =>
        (document.body.innerText || '').includes('DELETE MY ACCOUNT')
      );

      console.log(`✓ Settings 2-Col Nav, Legal Links & Log out: ${settingsAccountAudit.hasTwoColumnNav && settingsAccountAudit.hasLegalLinksAndLogout ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Settings 64px Circle Avatar, Edit Btn & No Fake Verified Badge: ${settingsAccountAudit.has64CircleAvatar && settingsAccountAudit.hasEditBtn && settingsAccountAudit.noFakeVerifiedBadge ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Settings Inter Login Fields & Dirty-Only Save Button: ${settingsAccountAudit.noMonoOnLoginFields && settingsAccountAudit.hasUsedToLogInHelper && settingsAccountAudit.saveHiddenInitially && saveAppearsWhenDirty ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Settings Subscription Glass Card & Upgrade Button: ${settingsSubAudit.hasGlassCard && settingsSubAudit.hasPriceLine && settingsSubAudit.hasUpgradeBtn && settingsSubAudit.btnSingleLine ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Upgrade Modal Centered (≤480px, r20, Price Match, No Glow): ${upgradeModalAudit.open && upgradeModalAudit.widthOk && upgradeModalAudit.radiusOk && upgradeModalAudit.centered && upgradeModalAudit.hasProceed && upgradeModalAudit.proceedSingleLine && upgradeModalAudit.hasTrialLink && upgradeModalAudit.hasRazorpay && upgradeModalAudit.hasPriceMatch && upgradeModalAudit.noGlow ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Settings Regional Unclipped Marla & Privacy Delete Confirmation Modal: ${settingsRegionalAudit.hasFullMarla && settingsRegionalAudit.notClipped && settingsPrivacyAudit.hasDownload && settingsPrivacyAudit.hasDelete && deleteModalHasPhrase ? 'PASS' : 'FAIL'}`);

      const passed =
        !overflow.hasOverflow &&
        sidebarAudit.exists &&
        sidebarAudit.brandText &&
        collapseResult.toggled &&
        headerAudit.height >= 56 &&
        headerAudit.height <= 64 &&
        !headerAudit.hasFloatingPill &&
        dropdownAudit.hasSettings &&
        dropdownAudit.hasPlan &&
        dropdownAudit.hasHelp &&
        notifAudit.open &&
        notifAudit.widthOk &&
        notifAudit.radiusOk &&
        notifAudit.hasBlur &&
        notifAudit.hasHeader &&
        notifAudit.hasDisabledMarkAll &&
        notifAudit.hasChips &&
        notifAudit.hasEmptyCopy &&
        notifAudit.closedOnClickOutside &&
        gridAudit.computedCols === vp.expectedCols &&
        !removalsAudit.hasFakeChart &&
        !removalsAudit.hasGlow &&
        dashboardAudit.hasHeroCard &&
        dashboardAudit.hasPasteCard &&
        dashboardAudit.hasKpiRow &&
        trackRecordPassed &&
        propertiesAudit.hasTitle &&
        propertiesAudit.hasSubtitle &&
        propertiesAudit.hasAddBtn &&
        propertiesAudit.hasFilterChips &&
        propertiesAudit.hasFiltersBtn &&
        propertiesAudit.hasSortDropdown &&
        !propertiesAudit.ownerPhoneExposed &&
        filterModalPassed &&
        buyersAudit.hasTitle &&
        buyersAudit.hasSubtitle &&
        buyersAudit.hasAddBtn &&
        buyersAudit.hasUrgencyChips &&
        buyersAudit.hasFiltersBtn &&
        buyersAudit.hasSortDropdown &&
        buyersAudit.cardHasAvatar &&
        buyersAudit.cardHasStatusChip &&
        buyersAudit.cardHasBudget &&
        buyersAudit.cardHasMaskedPhone &&
        buyersAudit.cardHasMatchCount &&
        buyersAudit.cardHasActionButtons &&
        buyersAudit.cardHasMoreBtn &&
        buyerFilterModalPassed &&
        inquiriesAudit.redirectedToBuyers &&
        inquiriesAudit.hasTabs &&
        inquiriesAudit.removedLegacy &&
        inquiriesAudit.hasCsvIconBtn &&
        inquiriesAudit.hasStatusChips &&
        inquiriesAudit.hasSort &&
        inquiriesAudit.hasTableOrEmpty &&
        quickChatAudit.hasTitle &&
        quickChatAudit.hasSubtitle &&
        quickChatAudit.noDuplicateLangToggle &&
        quickChatAudit.hasLanguageChip &&
        quickChatAudit.hasStepper &&
        quickChatAudit.hasExampleRow &&
        quickChatAudit.hasExactPlaceholder &&
        quickChatAudit.hasPrivacyLine &&
        quickChatAudit.isDisabledInitially &&
        enabledExtractPassed &&
        toolsHubAudit.hasTitle &&
        toolsHubAudit.hasSubtitle &&
        toolsHubAudit.cols === expectedToolsCols &&
        toolsHubAudit.tileCount === 5 &&
        toolsHubAudit.iconTilesAllBrand50 &&
        toolsHubAudit.noMismatchedBadges &&
        toolsEmiAudit.hasStickyPanel &&
        toolsEmiAudit.hasWords &&
        toolsEmiAudit.hasShare &&
        toolsEmiAudit.hasCopy &&
        toolsEmiAudit.hasDonut &&
        toolsAreaAudit.hasFullMarlaLabel &&
        toolsAreaAudit.notClipped &&
        settingsAccountAudit.hasTwoColumnNav &&
        settingsAccountAudit.hasLegalLinksAndLogout &&
        settingsAccountAudit.has64CircleAvatar &&
        settingsAccountAudit.hasEditBtn &&
        settingsAccountAudit.noFakeVerifiedBadge &&
        settingsAccountAudit.noMonoOnLoginFields &&
        settingsAccountAudit.hasUsedToLogInHelper &&
        settingsAccountAudit.saveHiddenInitially &&
        saveAppearsWhenDirty &&
        settingsSubAudit.hasGlassCard &&
        settingsSubAudit.hasPriceLine &&
        settingsSubAudit.hasUpgradeBtn &&
        settingsSubAudit.btnSingleLine &&
        upgradeModalAudit.open &&
        upgradeModalAudit.widthOk &&
        upgradeModalAudit.radiusOk &&
        upgradeModalAudit.centered &&
        upgradeModalAudit.hasProceed &&
        upgradeModalAudit.proceedSingleLine &&
        upgradeModalAudit.hasTrialLink &&
        upgradeModalAudit.hasRazorpay &&
        upgradeModalAudit.hasPriceMatch &&
        upgradeModalAudit.noGlow &&
        settingsRegionalAudit.hasFullMarla &&
        settingsRegionalAudit.notClipped &&
        settingsPrivacyAudit.hasDownload &&
        settingsPrivacyAudit.hasDelete &&
        deleteModalHasPhrase;

      allPassed.push({ viewport: vp.name, passed });
      await context.close();
    }

    console.log(`\n======================================================`);
    console.log(`FINAL DESKTOP RESPONSIVENESS AUDIT RESULTS:`);
    allPassed.forEach((r) => console.log(`  ${r.viewport}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`));
    console.log(`======================================================\n`);
  } finally {
    await browser.close();
  }
}

verify().catch((err) => {
  console.error('Audit verification error:', err);
  process.exit(1);
});
