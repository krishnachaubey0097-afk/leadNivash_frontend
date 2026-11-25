import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  { name: 'desktop_1024', width: 1024, height: 768, isMobile: false },
  { name: 'desktop_1280', width: 1280, height: 800, isMobile: false },
  { name: 'desktop_1440', width: 1440, height: 900, isMobile: false },
  { name: 'mobile_390', width: 390, height: 844, isMobile: true },
];

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/refund',
  '/cookies',
  '/contact',
  '/login',
  '/register',
  '/forgot-password',
  '/404-missing-page',
];

const APP_ROUTES = [
  '/app',
  '/app/properties',
  '/app/properties/new',
  '/app/buyers',
  '/app/buyers?tab=inquiries',
  '/app/buyers/new',
  '/app/paste',
  '/app/tools',
  '/app/tools/emi',
  '/app/tools/stamp-duty',
  '/app/tools/area',
  '/app/tools/commission',
  '/app/tools/messages',
  '/app/settings',
  '/app/settings?section=subscription',
  '/app/settings?section=regional',
  '/app/settings?section=inboxes',
  '/app/settings?section=help',
  '/app/settings?section=privacy',
  '/app/settings?section=legal',
  '/app/settings?section=appearance',
  '/app/admin',
];

const BROKER_USER = {
  _id: 'demo-broker-id',
  name: 'Sunny Kumar',
  phone: '9876543210',
  email: 'sunny@leadnivash.com',
  role: 'broker',
  agency: { name: 'Sunny Associates', city: 'Panipat' },
  isVerified: false,
  plan: {
    tier: 'trial',
    isExpired: false,
    trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    limits: { maxProperties: 50, maxBuyers: 50, maxDeals: 50, maxParsePerMonth: 100 },
  },
  preferences: { currencyUnit: 'lakh', areaUnit: 'gaj', marlaStandard: 'haryana_30_25' },
  createdAt: new Date().toISOString(),
};

const SEED_PROPERTIES = [
  {
    _id: 'prop-1',
    title: '3 BHK Luxury Builder Floor Sector 13-17',
    type: 'Floor',
    category: 'Residential',
    purpose: 'Sale',
    locality: 'Sector 13-17',
    city: 'Panipat',
    priceDemandPaise: 1450000000,
    size: { value: 250, unit: 'gaj' },
    status: 'available',
    photos: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', publicId: 'demo-1' }],
    createdAt: new Date().toISOString(),
  },
];

const SEED_BUYERS = [
  {
    _id: 'buyer-1',
    name: 'Rajesh Sharma',
    phone: '9812345678',
    urgency: 'hot',
    status: 'active',
    types: ['Floor'],
    purpose: 'Sale',
    budget: { minPaise: 1000000000, maxPaise: 1500000000 },
    localities: ['Sector 13-17'],
    notes: 'Looking for 3 BHK builder floor in Sector 13-17, Panipat',
    createdAt: new Date().toISOString(),
  },
];

async function run() {
  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome not found at ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const summaryByVp = [];

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      });

      const metrics = {
        viewport: vp.name,
        spellingFails: [],
        glassFails: [],
        buttonWrapFails: [],
        glowFails: [],
        iconTileFails: [],
        adminLeakFails: [],
        upgradeModalFails: [],
        marlaClipFails: [],
        hoverFails: [],
        heroContrastFails: [],
        overflowFails: [],
        mobileHeroHoverFails: [],
      };

      // Mock API
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/api/v1/')) {
          if (url.includes('/auth/me')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user: BROKER_USER } }) });
          }
          if (url.includes('/auth/refresh')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accessToken: 'mock-jwt', user: BROKER_USER } }) });
          }
          if (url.includes('/properties')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: SEED_PROPERTIES }) });
          }
          if (url.includes('/buyers')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: SEED_BUYERS }) });
          }
          if (url.includes('/inquiries')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
          }
          if (url.includes('/public/contact')) {
            return req.respond({ status: 403, contentType: 'application/json', body: JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } }) });
          }
          if (url.includes('/deals')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { deals: [], summary: { totalPending: 0, totalEarned: 0 } } }) });
          }
          if (url.includes('/matches') || url.includes('/notifications')) {
            return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
          }
          return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
        }
        req.continue();
      });

      // Seed localStorage & cookie
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((user, props, buyers) => {
        document.cookie = 'leadnivesh_logged_in=true; path=/';
        localStorage.setItem('leadnivesh_user', JSON.stringify(user));
        localStorage.setItem('leadnivesh_has_session', 'true');
        localStorage.setItem('ln_theme_mode', 'light');
        localStorage.setItem('leadnivash_tour_seen_demo-broker-id', 'true');
        localStorage.setItem('leadnivash_tour_seen_v1', 'true');
        localStorage.setItem('leadnivash_cookie_consent', 'essential');
        localStorage.setItem('leadnivash_properties_v1', JSON.stringify(props));
        localStorage.setItem('leadnivash_buyers_v1', JSON.stringify(buyers));
      }, BROKER_USER, SEED_PROPERTIES, SEED_BUYERS);

      const allRoutes = [...PUBLIC_ROUTES, ...APP_ROUTES];

      for (const route of allRoutes) {
        // Test auth pages (/login, /register, /forgot-password) unauthenticated so they don't redirect to /app
        const isPublicAuth = ['/login', '/register', '/forgot-password'].includes(route);
        if (isPublicAuth) {
          await page.evaluate(() => {
            document.cookie = 'leadnivesh_logged_in=; Max-Age=0; path=/';
            localStorage.removeItem('leadnivesh_user');
            localStorage.removeItem('leadnivesh_has_session');
          });
        } else if (route === '/app') {
          await page.evaluate((user) => {
            document.cookie = 'leadnivesh_logged_in=true; path=/';
            localStorage.setItem('leadnivesh_user', JSON.stringify(user));
            localStorage.setItem('leadnivesh_has_session', 'true');
          }, BROKER_USER);
        }
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        await new Promise((r) => setTimeout(r, 220));

        const audit = await page.evaluate(({ route, isMobile }) => {
          const isAppRoute = route.startsWith('/app');
          const res = {
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            spelling: [],
            glass: [],
            btnWraps: [],
            glows: [],
            iconTiles: [],
            adminLeak: false,
            marlaClip: false,
          };

          // 1. Spelling check: anything matching leadnivesh or leadnivash that isn't exact "LeadNivash"
          const skipDomains = /leadniv[ae]sh\.(com|onrender\.com)|@leadniv[ae]sh\.com|why-leadnivash|leadnivesh@okhdfcbank/i;
          const checkSpelling = (str, source) => {
            if (!str) return;
            // Remove domain/email substrings before checking
            const cleaned = str.replace(/[a-z0-9._%+-]*leadniv[ae]sh\.[a-z.]+/gi, '').replace(/#why-leadnivash/gi, '');
            const matches = cleaned.match(/lead\s*niv[ae]sh/gi) || [];
            for (const m of matches) {
              if (m !== 'LeadNivash') {
                res.spelling.push(`${source}: "${m}"`);
              }
            }
          };
          checkSpelling(document.title, 'title');
          document.querySelectorAll('img[alt]').forEach((img) => checkSpelling(img.getAttribute('alt'), 'img[alt]'));
          checkSpelling(document.body.innerText, 'bodyText');

          // 2. Glass effect check (visible elements with backdrop-filter)
          // Allowed on desktop/app: Sidebar (<aside>), TopBar (<header> inside #root AppShell), Dashboard hero card, Settings subscription card.
          // Note: check every visible element
          const isVisible = (el) => {
            const st = getComputedStyle(el);
            if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          };

          document.querySelectorAll('body *').forEach((el) => {
            if (!isVisible(el)) return;
            const st = getComputedStyle(el);
            const bf = st.backdropFilter || st.webkitBackdropFilter || '';
            if (bf && bf !== 'none') {
              const effectivePath = window.location.pathname;
              const inSidebar = Boolean(el.closest('aside'));
              const inAppHeader = isAppRoute && Boolean(el.closest('header'));
              const isDashHero =
                effectivePath === '/app' &&
                el.innerText?.includes('Pending commission') &&
                el.innerText?.includes('View deals');
              const isSettingsSub =
                effectivePath.startsWith('/app/settings') &&
                el.innerText?.includes('Free Trial Plan') &&
                el.innerText?.includes('Upgrade');
              const isLandingBottomBlur = effectivePath === '/' && el.getAttribute('data-bottom-blur') === 'true';
              const inMobileBottomNav = isMobile && Boolean(el.closest('nav.fixed'));
              if (!inSidebar && !inAppHeader && !isDashHero && !isSettingsSub && !isLandingBottomBlur && !inMobileBottomNav) {
                res.glass.push(
                  `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 60)}`
                );
              }
            }
          });

          // 3. Button text wrapping to 2+ lines
          // Inspect text nodes inside visible buttons
          document.querySelectorAll('button, a[role="button"]').forEach((btn) => {
            if (!isVisible(btn)) return;
            // Skip explicit multi-part tiles (e.g. Tool cards, Marla cards, Quick Chat examples chip? No, chips must not wrap! Only cards with distinct block children)
            const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
            let node;
            while ((node = walker.nextNode())) {
              const txt = (node.nodeValue || '').trim();
              if (!txt || txt.length < 3) continue;
              // Skip explicit multi-line description paragraphs inside Tool Hub / Marla radio card buttons
              const parentTag = node.parentElement?.tagName;
              const parentCls = (node.parentElement?.className || '').toString();
              if (
                parentTag === 'P' ||
                parentCls.includes('line-clamp') ||
                (route.startsWith('/app/settings') && txt.includes('Haryana Official Standard')) ||
                (route.startsWith('/app/tools/area') && txt.includes('Haryana Official Standard'))
              ) {
                continue;
              }
              const range = document.createRange();
              range.selectNodeContents(node);
              const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1);
              const distinctTops = [];
              for (const r of rects) {
                if (!distinctTops.some((t) => Math.abs(t - r.top) <= 4)) {
                  distinctTops.push(r.top);
                }
              }
              if (distinctTops.length >= 2) {
                res.btnWraps.push(`"${txt.slice(0, 40)}" (${distinctTops.length} lines)`);
              }
            }
          });

          // 4. Glow effects
          document.querySelectorAll('body *').forEach((el) => {
            if (!isVisible(el)) return;
            const cls = (el.className || '').toString();
            const st = getComputedStyle(el);
            if (cls.includes('animate-trial-glow') || cls.includes('shadow-glow')) {
              res.glows.push(`class:${cls.slice(0, 60)}`);
            }
            if ((cls.includes('blur-2xl') || cls.includes('blur-3xl')) && !el.closest('img')) {
              res.glows.push(`blur-blob:${cls.slice(0, 60)}`);
            }
            // Check green glowing boxShadow with large spread/blur in /app
            if (isAppRoute && st.boxShadow && st.boxShadow !== 'none') {
              if (/rgba?\(\s*(0|5|16)\s*,\s*(135|150|185)\s*,\s*(90|105|129)/.test(st.boxShadow)) {
                res.glows.push(`shadow:${st.boxShadow.slice(0, 60)}`);
              }
            }
          });

          // 5. Icon tiles in /app/* (compact icon containers w-8..w-12 with non-green bg)
          if (isAppRoute) {
            document.querySelectorAll('main div, main span').forEach((el) => {
              if (!isVisible(el)) return;
              const cls = (el.className || '').toString();
              const r = el.getBoundingClientRect();
              const isSquare = Math.abs(r.width - r.height) <= 2 && r.width >= 32 && r.width <= 56;
              if (!isSquare) return;
              const hasSvg = Boolean(el.querySelector(':scope > svg'));
              const hasText = (el.innerText || '').trim().length > 0;
              if (!hasSvg || hasText) return;
              // Exclude explicit semantic error/delete icons or user avatars
              if (cls.includes('bg-rose') || cls.includes('bg-danger') || cls.includes('rounded-full')) return;
              if (/bg-(blue|sky|indigo|purple|violet|amber|orange|teal|cyan)-(50|100)/.test(cls)) {
                res.iconTiles.push(cls.slice(0, 80));
              }
            });
          }

          // 6. Admin leak check
          if (isAppRoute) {
            const text = document.body.innerText || '';
            if (text.includes('Landing Page Leads') || text.includes('Landing Page Contacts')) {
              res.adminLeak = true;
            }
          }

          // 8. Marla option clipping check
          if (route === '/app/tools/area' || route === '/app/settings?section=regional') {
            const marlaEl = Array.from(document.querySelectorAll('main button, main label')).find((b) =>
              b.innerText?.includes('30.25 Gaj / Marla (Haryana Official Standard)')
            );
            if (!marlaEl || marlaEl.scrollWidth > marlaEl.clientWidth + 2) {
              res.marlaClip = true;
            }
          }

          return res;
        }, { route, isMobile: vp.isMobile });

        if (audit.overflow) metrics.overflowFails.push(route);
        if (audit.spelling.length) metrics.spellingFails.push(`${route}: ${[...new Set(audit.spelling)].join(', ')}`);
        if (audit.glass.length) metrics.glassFails.push(`${route}: ${[...new Set(audit.glass)].slice(0, 4).join(' | ')}`);
        if (audit.btnWraps.length) metrics.buttonWrapFails.push(`${route}: ${[...new Set(audit.btnWraps)].slice(0, 4).join(', ')}`);
        if (audit.glows.length) metrics.glowFails.push(`${route}: ${[...new Set(audit.glows)].slice(0, 4).join(', ')}`);
        if (audit.iconTiles.length) metrics.iconTileFails.push(`${route}: ${[...new Set(audit.iconTiles)].join(', ')}`);
        if (audit.adminLeak) metrics.adminLeakFails.push(route);
        if (audit.marlaClip) metrics.marlaClipFails.push(route);
      }

      // Check 7: Upgrade modal centered vs left-edge strip (desktop & mobile)
      await page.goto(`${BASE_URL}/app/settings?section=subscription`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 500));
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('main button')).find((b) =>
          b.innerText?.includes('Upgrade')
        );
        if (btn) btn.click();
      });
      await new Promise((r) => setTimeout(r, 350));
      const modalCheck = await page.evaluate(() => {
        const panel = document.querySelector('[role="dialog"] > div');
        if (!panel) return { ok: false, reason: 'modal not opened' };
        const r = panel.getBoundingClientRect();
        const centerDiff = Math.abs(r.left + r.width / 2 - window.innerWidth / 2);
        return {
          ok: centerDiff <= 24 && r.width <= 490 && r.left >= 12,
          left: Math.round(r.left),
          width: Math.round(r.width),
        };
      });
      if (!modalCheck.ok) {
        metrics.upgradeModalFails.push(JSON.stringify(modalCheck));
      }

      // Check 9 & 10: Hover states & Glass hero contrast on Dashboard + Properties + Buyers + Tools
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 500));
      const dashContrastAndHover = await page.evaluate(() => {
        const hero = Array.from(document.querySelectorAll('main div')).find((el) =>
          el.innerText?.includes('Pending commission') && el.innerText?.includes('View deals') && parseFloat(getComputedStyle(el).borderRadius) >= 18
        );
        if (!hero) return { ok: false, reason: 'missing hero' };
        const label = Array.from(hero.querySelectorAll('p, span, div')).find((e) => e.innerText?.trim() === 'Pending commission');
        const value = Array.from(hero.querySelectorAll('p, span, div')).find((e) => e.innerText?.includes('₹'));
        const parseRgb = (c) => {
          const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
        };
        const lum = ([r, g, b]) => {
          const f = (v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (c1, c2) => {
          const l1 = lum(c1), l2 = lum(c2);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        };
        // Effective background over #F8FAFC is near #eef2f5 (rgba(14,34,53,0.04) over #ffffff/#f8fafc)
        const bgApprox = [238, 242, 245];
        const labelContrast = label ? ratio(parseRgb(getComputedStyle(label).color), bgApprox) : 0;
        const valContrast = value ? ratio(parseRgb(getComputedStyle(value).color), bgApprox) : 0;
        return {
          ok: labelContrast >= 4.5 && valContrast >= 4.5,
          labelContrast: +labelContrast.toFixed(2),
          valContrast: +valContrast.toFixed(2),
          heroHasClassHover: hero.className.includes('rounded-[20px]'),
        };
      });
      if (!dashContrastAndHover.ok) {
        metrics.heroContrastFails.push(`dashboard: ${JSON.stringify(dashContrastAndHover)}`);
      }

      // Check hover states on clickable cards on Properties, Buyers, Tools
      const hoverChecks = [
        { route: '/app/properties', matchText: '3 BHK Luxury Builder Floor' },
        { route: '/app/buyers', matchText: 'Rajesh Sharma' },
        { route: '/app/tools', matchText: 'Home loan EMI' },
      ];
      for (const hc of hoverChecks) {
        await page.goto(`${BASE_URL}${hc.route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(
          (txt) =>
            Array.from(document.querySelectorAll('main .card-grid-desktop > div, main .grid > div, main .grid > button')).some((c) =>
              c.innerText?.includes(txt)
            ),
          { timeout: 3000 },
          hc.matchText
        ).catch(() => {});
        const hoverOk = await page.evaluate((txt) => {
          const cards = Array.from(document.querySelectorAll('main .card-grid-desktop > div, main .grid > div, main .grid > button'));
          const card = cards.find((c) => c.innerText?.includes(txt));
          if (!card) return { found: false };
          const st = getComputedStyle(card);
          const cls = card.className || '';
          return {
            found: true,
            hasPointer: st.cursor === 'pointer',
            hasHoverClass: cls.includes('hover:'),
          };
        }, hc.matchText);
        if (!hoverOk.found || !hoverOk.hasPointer || !hoverOk.hasHoverClass) {
          metrics.hoverFails.push(`${hc.route}: ${JSON.stringify(hoverOk)}`);
        }
      }

      // Mobile hero + bottom nav sanity check
      if (vp.isMobile) {
        await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
        await new Promise((r) => setTimeout(r, 350));
        const mobileOk = await page.evaluate(() => {
          const hasBottomNav = Boolean(document.querySelector('nav.fixed'));
          const hero = Array.from(document.querySelectorAll('main div')).find((el) =>
            el.innerText?.includes('Pending commission')
          );
          return { hasBottomNav, hasHero: Boolean(hero) };
        });
        if (!mobileOk.hasBottomNav || !mobileOk.hasHero) {
          metrics.mobileHeroHoverFails.push(JSON.stringify(mobileOk));
        }
      }

      summaryByVp.push(metrics);
      await context.close();
    }

    const jsonOut = JSON.stringify(summaryByVp, null, 2);
    const outFile = process.argv[2];
    if (outFile) {
      fs.writeFileSync(outFile, jsonOut);
    }
    fs.writeSync(1, jsonOut + '\n');
  } catch (err) {
    console.error('fullQaAudit error:', err);
    process.exitCode = 1;
  } finally {
    const proc = browser.process();
    await Promise.race([browser.close().catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
    if (proc && !proc.killed) {
      try { proc.kill('SIGKILL'); } catch {}
    }
    process.exit(process.exitCode || 0);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
