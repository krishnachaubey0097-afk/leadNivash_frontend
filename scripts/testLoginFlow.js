import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  // Wait for email input
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'broker@leadnivesh.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 3000));
  console.log('URL AFTER SUBMIT:', page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TITLE / HEADING:', text.split('\n').slice(0, 5));

  // Navigate to tools
  await page.goto('http://localhost:5173/app/tools', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  console.log('TOOLS URL:', page.url());
  const toolsText = await page.evaluate(() => document.body.innerText);
  console.log('TOOLS SNIPPET:', toolsText.split('\n').filter(Boolean).slice(0, 10));

  await browser.close();
}

check().catch(console.error);
