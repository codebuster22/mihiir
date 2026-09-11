import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
});
const page = await browser.newPage();
const base = process.env.SITE_QA_URL || 'http://localhost:3002';
await mkdir('docs/qa', { recursive: true });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const reports = [];
for (const width of [1440, 390, 320, 768, 1024]) {
  await page.setViewport({
    width,
    height: width < 761 ? 844 : 1000,
    deviceScaleFactor: 1,
    isMobile: width < 761,
    hasTouch: width < 761,
  });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  reports.push(
    await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      gutter: getComputedStyle(document.documentElement).getPropertyValue(
        '--gutter',
      ),
      ink: getComputedStyle(document.documentElement).getPropertyValue('--ink'),
      title: document.title,
      h1: document.querySelector('h1').getBoundingClientRect().toJSON(),
      hero: document
        .querySelector('main>section')
        .getBoundingClientRect()
        .toJSON(),
      missingImages: [...document.images]
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.src),
    })),
  );
  await page.screenshot({ path: `docs/qa/home-${width}.png`, fullPage: true });
  if (width === 390) {
    await page.click('button[aria-label="17,000 feet. About this photograph"]');
    await page.screenshot({
      path: 'docs/qa/home-mobile-memory.png',
      fullPage: true,
    });
    await page.keyboard.press('Escape');
    await page.click('button[aria-controls="site-menu"]');
    await page.screenshot({ path: 'docs/qa/home-mobile-menu.png' });
    await page.keyboard.press('Escape');
  }
}
await writeFile(
  'docs/qa/home-report.json',
  JSON.stringify({ reports, errors }, null, 2),
);
console.log(JSON.stringify({ reports, errors }, null, 2));
await browser.close();
