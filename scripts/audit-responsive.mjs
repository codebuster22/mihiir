import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const base = process.env.SITE_QA_URL || 'http://localhost:3003';
const output = 'docs/qa/responsive';
const sizes = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [600, 960],
  [760, 1024],
  [768, 1024],
  [801, 600],
  [820, 1180],
  [844, 390],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
  [3440, 1340],
  [3840, 2160],
];
const routes = [
  '/',
  '/work',
  '/work/antigravity',
  '/work/titus-intelligence',
  '/writing',
  '/writing/log',
  '/writing/log/sales-engineer-log-2',
  '/writing/technical/when-a-backup-order-book-can-take-over',
  '/about',
  '/now',
  '/prediction-market-development',
  '/web3-product-engineering',
  '/solidity-engineer',
  '/privacy',
];
const cases = JSON.parse(await readFile('content/work/index.json', 'utf8'));
const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
});
await mkdir(output, { recursive: true });
const page = await browser.newPage();
const reports = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

async function inspect(route, width, height) {
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
    isMobile: width < 761,
    hasTouch: width < 761,
  });
  const response = await page.goto(base + route, { waitUntil: 'load' });
  assert.ok(
    [200, 304].includes(response.status()),
    `${route}: ${response.status()}`,
  );
  await page.evaluate(() => document.fonts.ready);
  const record = await page.evaluate(() => {
    const rect = (element) => element?.getBoundingClientRect().toJSON();
    const hero = document.querySelector('[aria-labelledby="home-title"]');
    return {
      route: location.pathname,
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      hero: rect(hero),
      footer: rect(document.querySelector('footer')),
      heading: rect(document.querySelector('h1')),
      header: rect(document.querySelector('header')),
      figure: rect(
        document.querySelector(
          '[aria-label="The story behind this photograph"]',
        ),
      ),
      logos: [
        ...document.querySelectorAll(
          '[aria-label="Companies I have worked with"] img[alt]:not([alt=""])',
        ),
      ].map((img) => img.alt),
    };
  });
  reports.push(record);
  assert.ok(
    record.scrollWidth <= width + 1,
    `${route} overflows at ${width}: ${record.scrollWidth}`,
  );
  assert.ok(
    record.heading.left >= -1 && record.heading.right <= width + 1,
    `${route} heading outside viewport at ${width}`,
  );
  assert.equal(
    Math.round(record.footer.width),
    width,
    `${route} footer is not full width at ${width}`,
  );
  if (route === '/') {
    assert.ok(
      record.heading.left >= 23,
      `Hero copy loses its gutter at ${width}`,
    );
    assert.ok(
      record.header.width <= 1121,
      `Navigation is not bounded at ${width}`,
    );
    assert.ok(
      Math.abs(record.header.left - (width - record.header.width) / 2) < 1,
      `Navigation is not centered at ${width}`,
    );
    assert.equal(
      Math.round(record.hero.width),
      width,
      `Hero width at ${width}`,
    );
    assert.ok(
      record.hero.height >= height - 1,
      `Hero does not fill viewport at ${width}`,
    );
    assert.equal(new Set(record.logos).size, 12, 'Complete company inventory');
    if ([320, 390, 1440, 1920, 3440, 3840].includes(width))
      await page.screenshot({ path: `${output}/home-${width}.png` });
  }
}

try {
  for (const [width, height] of sizes) {
    for (const route of routes) await inspect(route, width, height);
    console.log(`Layout matrix passed at ${width} × ${height}`);
  }
  for (const width of [320, 801]) {
    for (const { slug } of cases) {
      if (!routes.includes('/work/' + slug))
        await inspect('/work/' + slug, width, 900);
    }
    for (const format of ['essays', 'technical', 'experiments'])
      await inspect('/writing/' + format, width, 900);
  }
  // Tablet article diagrams respond to their column, not the outer viewport.
  await inspect('/work/antigravity', 801, 900);
  const game = await page.$('figure[class*="gameFigure"]');
  assert.equal(
    await game.$eval('ol', (e) => getComputedStyle(e).flexDirection),
    'column',
  );
  await game.screenshot({ path: `${output}/tablet-diagram.png` });

  await inspect('/work/titus-intelligence', 1100, 390);
  const sidebar = await page.$eval('[class*="caseSidebar"]', (e) => ({
    height: e.clientHeight,
    overflow: getComputedStyle(e).overflowY,
  }));
  assert.ok(sidebar.height <= 310 && sidebar.overflow === 'auto');

  // Mobile photo note/menu focus and touch strip browsing.
  await inspect('/', 390, 844);
  await page.click('[aria-label="17,000 feet. About this photograph"]');
  await page.waitForSelector('#sar-pass-memory');
  await page.keyboard.press('Escape');
  assert.equal(await page.$('#sar-pass-memory'), null);
  await page.click('[aria-controls="site-menu"]');
  assert.equal(await page.$eval('#site-menu', (e) => e.open), true);
  await page.keyboard.press('Escape');
  assert.equal(
    await page.$eval(
      '[aria-controls="site-menu"]',
      (e) => e === document.activeElement,
    ),
    true,
  );
  const strip = '[aria-label="Companies I have worked with"]';
  const touch = await page.$eval(strip, (e) => {
    e.scrollLeft = e.scrollWidth;
    const last =
      e.querySelector('[aria-hidden]')?.previousElementSibling
        ?.lastElementChild;
    return {
      animation: getComputedStyle(e.firstElementChild).animationName,
      scrollLeft: e.scrollLeft,
      last: last?.getBoundingClientRect().right,
    };
  });
  assert.equal(touch.animation, 'none');
  assert.ok(touch.scrollLeft > 0);

  // Desktop pointer, keyboard and offscreen animation controls.
  await inspect('/', 1920, 1080);
  await page.$eval(strip, (e) =>
    e.scrollIntoView({ behavior: 'instant', block: 'center' }),
  );
  await page.hover(strip);
  assert.equal(
    await page.$eval(
      strip,
      (e) => getComputedStyle(e.firstElementChild).animationPlayState,
    ),
    'paused',
  );
  await page.mouse.move(0, 0);
  await page.$eval(strip, (e) => e.focus());
  assert.equal(
    await page.$eval(
      strip,
      (e) => getComputedStyle(e.firstElementChild).animationPlayState,
    ),
    'paused',
  );
  await page.$eval(strip, (e) => e.blur());
  // Scroll well beyond the strip: a box touching the viewport edge is still
  // intersecting, even when none of its pixels are visible.
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  );
  await page.waitForSelector(`${strip}[data-visible="false"]`);
  assert.equal(
    await page.$eval(
      strip,
      (e) => getComputedStyle(e.firstElementChild).animationPlayState,
    ),
    'paused',
  );
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  assert.equal(
    await page.$eval(
      strip,
      (e) => getComputedStyle(e.firstElementChild).animationName,
    ),
    'none',
  );
  await page.emulateMediaFeatures([]);

  // Reproduce the missing shared width observed in the user's live browser.
  // The critical hero and nav layout must retain its own dimensions.
  await inspect('/', 3440, 1340);
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--page-width', 'initial');
    document.body.style.setProperty('--page-width', 'initial');
  });
  const fallback = await page.evaluate(() => ({
    copy: document.querySelector('h1').getBoundingClientRect().left,
    nav: document.querySelector('header').getBoundingClientRect().width,
    pill: document
      .querySelector('[aria-label="17,000 feet. About this photograph"]')
      .getBoundingClientRect().right,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  assert.ok(fallback.copy >= 900);
  assert.equal(fallback.nav, 1120);
  assert.ok(fallback.pill > 3300 && fallback.pill < 3440);
  assert.equal(fallback.overflow, false);

  // Capture the complete revised footer after loading actual availability.
  for (const [width, height] of [
    [3440, 1340],
    [1440, 1000],
    [390, 844],
  ]) {
    await inspect('/', width, height);
    await page.$eval('#project-conversation', (e) =>
      e.scrollIntoView({ behavior: 'instant', block: 'center' }),
    );
    await page.waitForSelector('[data-calendar-status="ready"]', {
      timeout: 35000,
    });
    const calendarFrame = await page
      .$('#project-conversation iframe')
      .then((frame) => frame?.contentFrame());
    assert.ok(calendarFrame, 'Hosted booking calendar exists');
    // linkReady can arrive while Cal still shows its availability skeleton.
    await calendarFrame.waitForFunction(
      () =>
        [...document.querySelectorAll('button')].some(
          (button) =>
            /^\d{1,2}$/.test(button.textContent.trim()) && !button.disabled,
        ),
      { timeout: 30000 },
    );
    await page.$eval('footer', (e) =>
      e.scrollIntoView({ behavior: 'instant', block: 'start' }),
    );
    await page.screenshot({ path: `${output}/footer-${width}.png` });
    await page
      .$('footer')
      .then((footer) =>
        footer.screenshot({ path: `${output}/footer-full-${width}.png` }),
      );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      width,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      { base, checked: reports.length, reports, errors, passed: true },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${reports.length} layouts; responsive interactions and real calendar verified.`,
  );
} finally {
  await browser.close();
}
