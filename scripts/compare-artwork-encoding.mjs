import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import { stat, writeFile } from 'node:fs/promises';
const names = [
  'mountaineering-print',
  'mountaineering-mobile-print',
  'panorama-print',
];
const comparisons = [];
for (const name of names) {
  const source = `public/artwork/${name}.webp`;
  const destination = `public/artwork/${name}-q85.avif`;
  const metadata = await sharp(source).metadata();
  await sharp(source)
    .avif({ quality: 85, effort: 4, chromaSubsampling: '4:4:4' })
    .toFile(destination);
  const inputBytes = (await stat(source)).size;
  const outputBytes = (await stat(destination)).size;
  const comparison = {
    source,
    destination,
    width: metadata.width,
    height: metadata.height,
    quality: 85,
    chromaSubsampling: '4:4:4',
    inputBytes,
    outputBytes,
    reduction: 1 - outputBytes / inputBytes,
  };
  comparisons.push(comparison);
  console.log(JSON.stringify(comparison));
}
await writeFile(
  'docs/qa/artwork-encoding-comparison.json',
  JSON.stringify(comparisons, null, 2),
);
