import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
});
const results = [];
const variant = ['optimized', 'optimized-fonts'].includes(process.argv[2])
  ? process.argv[2]
  : 'baseline';
await mkdir('docs/qa', { recursive: true });
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const cdp = await page.createCDPSession();
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 100,
      downloadThroughput: 625000,
      uploadThroughput: 625000,
      connectionType: 'cellular4g',
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluateOnNewDocument(() => {
      window.__lab = { lcp: null, cls: 0, shifts: [] };
      new PerformanceObserver((list) => {
        const entry = list.getEntries().at(-1);
        window.__lab.lcp = {
          startTime: entry.startTime,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          size: entry.size,
          url: entry.url,
          element: entry.element?.tagName,
          text: entry.element?.textContent?.slice(0, 100),
        };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) {
            window.__lab.cls += entry.value;
            window.__lab.shifts.push({
              value: entry.value,
              time: entry.startTime,
            });
          }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('http://localhost:3003', {
      waitUntil: 'networkidle0',
      timeout: 90000,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const measured = await page.evaluate(() => ({
      ...window.__lab,
      navigation: performance.getEntriesByType('navigation')[0].toJSON(),
      resources: performance
        .getEntriesByType('resource')
        .map((entry) => ({
          name: new URL(entry.name).pathname,
          type: entry.initiatorType,
          bytes: entry.transferSize,
          encoded: entry.encodedBodySize,
          duration: entry.duration,
          start: entry.startTime,
          end: entry.responseEnd,
        })),
      images: [...document.images].map((image) => ({
        currentSrc: image.currentSrc,
        width: image.naturalWidth,
        height: image.naturalHeight,
        loading: image.loading,
      })),
      width: innerWidth,
      dpr: devicePixelRatio,
    }));
    results.push({ run, ...measured });
    console.log(
      JSON.stringify({
        run,
        lcp: measured.lcp,
        cls: measured.cls,
        bytes: measured.resources.reduce(
          (sum, resource) => sum + resource.bytes,
          0,
        ),
        imageResources: measured.resources.filter((resource) =>
          /artwork|brands/.test(resource.name),
        ),
      }),
    );
    if (variant !== 'baseline' && run === 1) {
      await page.screenshot({ path: `docs/qa/${variant}-home-390-above-fold.png` });
      await page.$eval('footer', (footer) => footer.scrollIntoView({ behavior: 'instant', block: 'end' }));
      await page.waitForFunction(() => { const images = [...document.querySelectorAll('footer img')]; return images.length > 0 && images.every(image => image.complete && image.naturalWidth > 0); }, { timeout: 30000 });
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
      const afterScroll = await page.evaluate(() => ({ images: [...document.querySelectorAll('footer img')].map(image => ({ currentSrc: image.currentSrc, complete: image.complete, naturalWidth: image.naturalWidth })), resources: performance.getEntriesByType('resource').filter(entry => /panorama/.test(entry.name)).map(entry => ({ name: new URL(entry.name).pathname, start: entry.startTime, bytes: entry.transferSize, encoded: entry.encodedBodySize })), cls: window.__lab.cls }));
      results.at(-1).afterScroll = afterScroll;
      console.log(JSON.stringify({ afterScroll }));
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `docs/qa/${variant}-home-390-full.png`, fullPage: true });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await mkdir('docs/qa', { recursive: true });
await writeFile(
  variant === 'baseline'
    ? 'docs/qa/mobile-performance-lab.json'
    : `docs/qa/mobile-performance-${variant}-lab.json`,
  JSON.stringify(
    {
      environment: {
        url: 'http://localhost:3003',
        variant,
        width: 390,
        height: 844,
        dpr: 2,
        downloadMbps: 5,
        uploadMbps: 5,
        latencyMs: 100,
        cpuSlowdown: 4,
        cache: 'Disabled; fresh browser context each run',
        scope: 'Local laboratory observations, not field Core Web Vitals',
      },
      results,
    },
    null,
    2,
  ),
);
