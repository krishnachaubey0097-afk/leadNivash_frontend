import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LH_CORE = 'file:///C:/Users/HP/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js';
const LH_DESKTOP = 'file:///C:/Users/HP/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/config/desktop-config.js';
const PORT = 9229;

async function main() {
  const { default: lighthouse } = await import(LH_CORE);
  const { default: desktopConfig } = await import(LH_DESKTOP);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      `--remote-debugging-port=${PORT}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ],
  });

  try {
    const outDir = process.argv[2] || '.';
    const tag = process.argv[3] || 'before';

    // Seed auth in the default browser tab so /app can also be audited
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const user = {
        _id: 'demo-broker-id',
        name: 'Sunny Kumar',
        phone: '9876543210',
        email: 'sunny@leadnivash.com',
        role: 'broker',
        agency: { name: 'Sunny Associates', city: 'Panipat' },
        plan: {
          tier: 'trial',
          isExpired: false,
          trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          limits: { maxProperties: 50, maxBuyers: 50, maxDeals: 50, maxParsePerMonth: 100 },
        },
        createdAt: new Date().toISOString(),
      };
      document.cookie = 'leadnivesh_logged_in=true; path=/';
      localStorage.setItem('leadnivesh_user', JSON.stringify(user));
      localStorage.setItem('leadnivesh_has_session', 'true');
      localStorage.setItem('ln_theme_mode', 'light');
      localStorage.setItem('leadnivash_tour_seen_demo-broker-id', 'true');
      localStorage.setItem('leadnivash_tour_seen_v1', 'true');
      localStorage.setItem('leadnivash_cookie_consent', 'essential');
    });
    await page.goto('about:blank');

    const targets = [
      { key: 'home', url: 'http://localhost:5173/', disableStorageReset: true },
      { key: 'app', url: 'http://localhost:5173/app', disableStorageReset: true },
    ];

    for (const target of targets) {
      const runnerResult = await lighthouse(
        target.url,
        {
          port: PORT,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices'],
          disableStorageReset: target.disableStorageReset,
        },
        desktopConfig
      );
      const report = runnerResult.lhr;
      const outPath = `${outDir}/lh_${target.key}_${tag}.json`;
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

      const scores = Object.fromEntries(
        Object.entries(report.categories).map(([k, v]) => [k, Math.round(v.score * 100)])
      );
      console.log(`LIGHTHOUSE ${target.key.toUpperCase()} (${tag}):`, JSON.stringify(scores));
      for (const [k, v] of Object.entries(report.audits)) {
        if (v.score !== null && v.score < 0.9) {
          const weighted = ['performance', 'accessibility', 'best-practices'].some((c) =>
            report.categories[c].auditRefs.some((a) => a.id === k && a.weight > 0)
          );
          if (weighted) {
            console.log(`  [${target.key}] WARN/FAIL ${k} (${Math.round(v.score * 100)}): ${v.title}`);
          }
        }
      }
    }
  } finally {
    const proc = browser.process();
    await Promise.race([browser.close().catch(() => {}), new Promise((r) => setTimeout(r, 1000))]);
    if (proc && !proc.killed) {
      try { proc.kill('SIGKILL'); } catch {}
    }
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
