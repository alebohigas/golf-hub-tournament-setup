import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[browser ${type}] ${text}`);
  });

  page.on('pageerror', err => {
    console.error(`[pageerror] ${err.toString()}`);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  console.log('loaded root');

  // maybe try a few navigation clicks
  try {
    // click some links if exist
    const links = await page.$$eval('a', els => els.map(a => a.href));
    console.log('found links', links);
  } catch (e) {
    console.error('error extracting links', e);
  }

  // wait a bit
  await page.waitForTimeout(5000);

  await browser.close();
})();
