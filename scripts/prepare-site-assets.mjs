import sharp from 'sharp';
import { mkdir, copyFile, readdir, stat } from 'node:fs/promises';
await mkdir('public/artwork', { recursive: true });
await mkdir('public/brands', { recursive: true });
const photos = [
  ['chosen-mountaineering-print.png', 'mountaineering-print.webp'],
  ['chosen-mobile-print.png', 'mountaineering-mobile-print.webp'],
  ['chosen-panorama-print.png', 'panorama-print.webp'],
];
for (const [source, target] of photos) {
  // Preserve the chosen rendered pixels; change encoding only.
  await sharp(`docs/design/${source}`)
    .webp({ lossless: true, effort: 6 })
    .toFile(`public/artwork/${target}`);
  const info = await stat(`public/artwork/${target}`);
  console.log(`${target}: ${Math.round(info.size / 1024)} KB, lossless`);
  // Browser delivery variant: same framing/filter, high-quality lossy AVIF.
  // Keep the lossless master above as the fallback and reference.
  await sharp(`docs/design/${source}`).avif({quality:85,chromaSubsampling:'4:4:4',effort:6}).toFile(`public/artwork/${target.replace('.webp','-q85.avif')}`);
}
for (const file of await readdir('docs/design/brands'))
  if (/\.(svg|png)$/.test(file))
    await copyFile(`docs/design/brands/${file}`, `public/brands/${file}`);
