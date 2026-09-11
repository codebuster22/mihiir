import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const sharp = createRequire(import.meta.resolve('next/package.json'))('sharp');
const source = ts
  .transpileModule(await readFile('lib/image-lab.ts', 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  })
  .outputText.replaceAll('process.env.NODE_ENV', '"production"');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const assets = [
  [
    'mountaineering',
    'mountaineering-expanded-v2.webp',
    'sar-pass-wide-glyphs-v2',
    3840,
  ],
  [
    'mountain-panorama',
    'panorama-expanded-v2.webp',
    'panorama-glyphs-v2',
    3840,
  ],
  [
    'mountaineering-mobile',
    'mountaineering-mobile-study.png',
    'sar-pass-mobile-glyphs-v2',
    1536,
  ],
];
await mkdir('docs/design/artwork-v2', { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
});
try {
  const page = await browser.newPage();
  for (const [photoId, filename, output, width] of assets) {
    const mime = filename.endsWith('.png') ? 'image/png' : 'image/webp';
    const imageUrl = `data:${mime};base64,${(await readFile(`public/images/${filename}`)).toString('base64')}`;
    const data = await page.evaluate(
      async ({ moduleUrl, imageUrl, photoId, width }) => {
        const { exportGlyphArtwork, photoDefaults } = await import(moduleUrl);
        const img = new Image();
        img.src = imageUrl;
        await img.decode();
        return exportGlyphArtwork(
          img,
          photoDefaults(photoId).glyphs,
          width,
        ).toDataURL('image/png');
      },
      { moduleUrl, imageUrl, photoId, width },
    );
    const png = Buffer.from(data.split(',')[1], 'base64');
    await writeFile(`docs/design/artwork-v2/${output}.png`, png);
    await sharp(png)
      .webp({ quality: 94, effort: 6 })
      .toFile(`public/artwork/${output}.webp`);
    await sharp(png)
      .avif({ quality: 82, chromaSubsampling: '4:4:4', effort: 6 })
      .toFile(`public/artwork/${output}.avif`);
    const meta = await sharp(png).metadata();
    console.log(`${output}: ${meta.width} × ${meta.height}`);
  }
} finally {
  await browser.close();
}
