import puppeteer from 'puppeteer-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Capture only the real website. Action targets are read from a reviewed plan,
// and screenshots plus source timing are retained beside each recording.
const planPath = process.argv[2];
if (!planPath) throw new Error('Usage: node scripts/capture-ux.mjs captures/plan.json');
const plan = JSON.parse(await readFile(planPath, 'utf8'));
const output = resolve(plan.output || 'captures/ux');
await mkdir(output, { recursive: true });
const chrome = process.env.HF_CAPTURE_BROWSER || execFileSync('npx.cmd', ['--yes', 'hyperframes@0.8.33', 'browser', 'path'], { encoding: 'utf8', shell: true }).trim().split(/\r?\n/).at(-1);
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars', '--disable-features=Translate'] });
const results = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(image => image.complete ? undefined : image.decode().catch(() => {})));
  });
  await pause(600);
}

async function installPointer(page, touch) {
  await page.evaluate(touch => {
    const pointer = document.createElement('div');
    pointer.id = 'ux-demo-pointer';
    pointer.style.cssText = `position:fixed;left:0;top:0;width:${touch ? 28 : 23}px;height:${touch ? 28 : 29}px;z-index:2147483647;pointer-events:none;opacity:0;filter:drop-shadow(0 2px 3px #20232630);transform:translate(-100px,-100px);`;
    pointer.innerHTML = touch ? '<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#ffffff99" stroke="#255BD6" stroke-width="2"/></svg>' : '<svg width="23" height="29" viewBox="0 0 23 29"><path d="M2 2v22l5-6 4 9 4-2-4-8h9L2 2Z" fill="#202326" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/></svg>';
    document.body.appendChild(pointer);
    window.__uxDemoMove = (x, y, visible = true) => {
      window.__uxDemoPointerPosition = { x, y };
      pointer.style.opacity = visible ? '1' : '0';
      pointer.style.transform = `translate(${x - (touch ? 14 : 2)}px,${y - (touch ? 14 : 2)}px)`;
    };
    if (!touch) document.addEventListener('mousemove', event => window.__uxDemoMove(event.clientX, event.clientY));
  }, touch);
}

async function pointAt(page, selector, offset, touch = false) {
  const textTarget = selector.startsWith('text=') ? selector.slice(5) : null;
  if (textTarget) await page.waitForFunction(text => [...document.querySelectorAll('button,a')].some(el => el.textContent.trim() === text && el.getBoundingClientRect().width > 0), { timeout: 10000 }, textTarget);
  else await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  const measure = el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x, y, width, height };
  };
  const handle = textTarget ? await page.evaluateHandle(text => [...document.querySelectorAll('button,a')].find(el => el.textContent.trim() === text && el.getBoundingClientRect().width > 0), textTarget) : await page.$(selector);
  const box = await handle.evaluate(measure);
  await handle.dispose();
  const x = box.x + box.width * (offset?.x ?? 0.5);
  const y = box.y + box.height * (offset?.y ?? 0.5);
  if (touch) {
    await page.evaluate(({ x, y }) => window.__uxDemoMove(x, y), { x, y });
    await page.touchscreen.tap(x, y);
    await pause(250);
    await page.evaluate(() => window.__uxDemoMove(0, 0, false));
  } else {
    const from = await page.evaluate(() => window.__uxDemoPointerPosition || { x: innerWidth - 60, y: innerHeight - 60 });
    for (let i = 1; i <= 30; i++) {
      const progress = i / 30;
      const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      await page.mouse.move(from.x + (x - from.x) * ease, from.y + (y - from.y) * ease);
      await pause(12);
    }
  }
  return { ...box, x, y };
}

try {
  for (const shot of plan.shots) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: shot.density || 1, isMobile: Boolean(shot.mobile), hasTouch: Boolean(shot.mobile) });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    const url = new URL(shot.route, plan.baseUrl).toString();
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    if (!response?.ok()) throw new Error(`Cannot capture ${shot.name}: HTTP ${response?.status()}`);
    await settle(page);
    if (shot.prepareScroll) {
      await page.$eval(shot.prepareScroll, el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await settle(page);
    }
    await page.screenshot({ path: join(output, `${shot.name}-before.png`) });
    if (shot.fullPage) await page.screenshot({ path: join(output, `${shot.name}-full.png`), fullPage: true });
    await installPointer(page, shot.mobile);
    const start = performance.now();
    const actionLog = [];
    const recorder = await page.screencast({ path: join(output, `${shot.name}.webm`), fps: 30, quality: 12 });
    for (const action of shot.actions || []) {
      await pause(Math.max(0, (action.at || 0) * 1000 - (performance.now() - start)));
      const at = (performance.now() - start) / 1000;
      let evidence;
      if (action.type === 'hover') evidence = await pointAt(page, action.selector, action.offset);
      else if (action.type === 'click') {
        evidence = await pointAt(page, action.selector, action.offset, shot.mobile);
        if (!shot.mobile) await page.mouse.click(evidence.x, evidence.y);
      } else if (action.type === 'leave') {
        await page.mouse.move(shot.width - 8, 8, { steps: 18 });
        await page.evaluate(() => window.__uxDemoMove(0, 0, false));
      } else if (action.type === 'key') await page.keyboard.press(action.key);
      else if (action.type === 'scroll') {
        await page.evaluate(() => window.__uxDemoMove(0, 0, false));
        if (action.selector) {
          await page.$eval(action.selector, (el, block) => el.scrollIntoView({ behavior: 'smooth', block }), action.block || 'center');
        } else await page.evaluate(y => window.scrollTo({ top: y, behavior: 'smooth' }), action.y);
      } else if (action.type === 'snapshot') await page.screenshot({ path: join(output, `${shot.name}-${action.label}.png`) });
      else throw new Error(`Unsupported capture action ${action.type}`);
      actionLog.push({ ...action, actualTime: at, evidence });
    }
    await pause(Math.max(0, shot.duration * 1000 - (performance.now() - start)));
    await recorder.stop();
    await page.screenshot({ path: join(output, `${shot.name}-after.png`) });
    const metadata = { name: shot.name, url, width: shot.width, height: shot.height, density: shot.density || 1, mobile: Boolean(shot.mobile), durationRecorded: (performance.now() - start) / 1000, actionLog, errors, title: await page.title() };
    await writeFile(join(output, `${shot.name}.json`), JSON.stringify(metadata, null, 2));
    results.push(metadata);
    await page.close();
    console.log(`Captured ${shot.name}: ${shot.width}×${shot.height}, ${shot.duration}s, ${errors.length} page errors`);
    if (errors.length) throw new Error(`Page errors in ${shot.name}; inspect its JSON before using the footage`);
  }
  await writeFile(join(output, 'capture-manifest.json'), JSON.stringify({ source: plan.baseUrl, shots: results }, null, 2));
} finally {
  await browser.close();
}
