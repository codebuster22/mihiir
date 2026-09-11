import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { readFile } from 'node:fs/promises';
const photo = (
  await readFile('public/artwork/mountaineering-print.webp')
).toString('base64');
const font = (await readFile('public/fonts/plex-sans-500.ttf')).toString(
  'base64',
);
const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(
  `<style>@font-face{font-family:Plex;src:url(data:font/ttf;base64,${font});font-weight:500}*{box-sizing:border-box}body{margin:0;background:#fff;color:#202326;font-family:Plex,sans-serif}.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:80% 50%}.brand{position:absolute;left:64px;top:40px;font-size:30px;letter-spacing:-1.2px}.copy{position:absolute;left:64px;top:210px;width:800px;isolation:isolate}.copy::before{content:'';position:absolute;inset:-38px -28px -40px -46px;background:white;filter:blur(28px);z-index:-1;border-radius:40px}h1{font-size:50px;line-height:54px;font-weight:500;letter-spacing:-2px;margin:0}.url{position:absolute;bottom:32px;right:40px;font-size:18px;padding:9px 16px;border-radius:30px;background:#fff}</style><img class="photo" src="data:image/webp;base64,${photo}"/><div class="brand">Mihiir</div><div class="copy"><h1>I build products and systems for Web3 and Prediction Markets.</h1></div><div class="url">mihiir.com</div>`,
);
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
await page.screenshot({ path: 'public/social-preview.png' });
await browser.close();
