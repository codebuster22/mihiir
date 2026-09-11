import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import puppeteer from '../video-demo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const sharp = createRequire(import.meta.resolve('next/package.json'))('sharp');
const shaderRoot = path.resolve('node_modules/@paper-design/shaders/dist');
const source = ts.transpileModule(await readFile('lib/image-lab.ts', 'utf8'), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const { chosenPrintSettings } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
const settings = chosenPrintSettings.mountaineering;
const assets = [
  ['mountaineering-expanded-v2.webp', 'sar-pass-wide-print-v3', 3840],
  ['mountaineering-mobile-study.png', 'sar-pass-mobile-print-v3', 1536],
];
const outputDirectory = 'docs/design/artwork-v3';
await mkdir(outputDirectory, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.SITE_QA_CHROME ||
    'C:/Users/chaain labs/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Serve only the installed shader's modules to the isolated export page.
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    try {
      const url = new URL(request.url());
      if (url.protocol === 'data:') return request.continue();
      if (url.origin !== 'http://artwork.local') return request.abort();
      if (url.pathname === '/')
        return request.respond({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><html><body style="margin:0"><div id="artwork"></div></body></html>',
        });
      const file = path.resolve(shaderRoot, '.' + url.pathname);
      if (
        path.relative(shaderRoot, file).startsWith('..') ||
        !file.endsWith('.js')
      )
        return request.abort();
      return request.respond({
        status: 200,
        contentType: 'text/javascript',
        body: await readFile(file),
      });
    } catch {
      return request.abort();
    }
  });
  for (const [filename, output, width] of assets) {
    const bytes = await readFile(`public/images/${filename}`);
    const metadata = await sharp(bytes).metadata();
    const height = Math.round((width * metadata.height) / metadata.width);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto('http://artwork.local/');
    const imageUrl = `data:image/${filename.endsWith('.png') ? 'png' : 'webp'};base64,${bytes.toString('base64')}`;
    const data = await page.evaluate(
      async ({ imageUrl, settings, width, height }) => {
        const [
          { ShaderMount },
          { halftoneCmykFragmentShader },
          { getShaderNoiseTexture },
        ] = await Promise.all([
          import('/shader-mount.js'),
          import('/shaders/halftone-cmyk.js'),
          import('/get-shader-noise-texture.js'),
        ]);
        const image = new Image();
        image.src = imageUrl;
        const noise = getShaderNoiseTexture();
        await Promise.all([image.decode(), noise.decode()]);
        const host = document.getElementById('artwork');
        Object.assign(host.style, {
          width: `${width}px`,
          height: `${height}px`,
        });
        // Same uniforms and original/filter blending used in the approved homepage preview.
        const uniforms = {
          u_image: image,
          u_noiseTexture: noise,
          u_colorBack: [1, 1, 1, 1],
          u_colorC: [0, 1, 1, 1],
          u_colorM: [1, 0, 1, 1],
          u_colorY: [1, 1, 0, 1],
          u_colorK: [0, 0, 0, 1],
          u_size: settings.size / 100,
          u_gridNoise: settings.noise / 100,
          u_softness: settings.softness / 100,
          u_grainOverlay: settings.grain / 100,
          u_grainMixer: settings.grain / 500,
          u_grainSize: 0.15,
          u_contrast: settings.contrast / 100,
          u_type: { dots: 0, ink: 1, sharp: 2 }[settings.type],
          u_floodC: 0,
          u_floodM: 0,
          u_floodY: 0,
          u_floodK: 0,
          u_gainC: 0,
          u_gainM: 0,
          u_gainY: 0,
          u_gainK: 0,
          u_fit: 1,
          u_scale: 1,
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0,
        };
        const mount = new ShaderMount(
          host,
          halftoneCmykFragmentShader,
          uniforms,
          { preserveDrawingBuffer: true, alpha: false },
          0,
          0,
          1,
          width * height,
        );
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        mount.setFrame(0);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (
          mount.canvasElement.width !== width ||
          mount.canvasElement.height !== height
        )
          throw new Error('Unexpected artwork dimensions');
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        ctx.globalAlpha = settings.strength / 100;
        ctx.filter = `saturate(${settings.color / 100})`;
        ctx.drawImage(mount.canvasElement, 0, 0);
        const png = canvas.toDataURL('image/png');
        mount.dispose();
        return png;
      },
      { imageUrl, settings, width, height },
    );
    if (errors.length) throw new Error(errors.join('\n'));
    const png = Buffer.from(data.split(',')[1], 'base64');
    await writeFile(`${outputDirectory}/${output}.png`, png);
    await sharp(png)
      .webp({ quality: 94, effort: 6 })
      .toFile(`public/artwork/${output}.webp`);
    await sharp(png)
      .avif({ quality: 82, chromaSubsampling: '4:4:4', effort: 6 })
      .toFile(`public/artwork/${output}.avif`);
    console.log(`${output}: ${width} × ${height}`);
  }
  await writeFile(
    `${outputDirectory}/settings.json`,
    JSON.stringify({ family: 'print', settings, footer: 'original' }, null, 2),
  );
} finally {
  await browser.close();
}
