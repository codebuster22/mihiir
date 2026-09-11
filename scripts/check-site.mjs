import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const base = process.env.SITE_QA_URL || 'http://localhost:3003';
const preview = process.env.SITE_QA_PREVIEW !== 'false';
const cases = JSON.parse(await readFile('content/work/index.json', 'utf8')).map(
  (x) => '/work/' + x.slug,
);
const articles = [
  '/writing/log/sales-engineer-log-2',
  '/writing/technical/when-a-backup-order-book-can-take-over',
];
const core = [
  '/',
  '/work',
  '/writing',
  '/about',
  '/now',
  '/prediction-market-development',
  '/web3-product-engineering',
  '/solidity-engineer',
  '/privacy',
  '/writing/log',
  '/writing/experiments',
  '/writing/technical',
  '/writing/essays',
  '/writing/log/sales-engineer',
];
const records = [];
for (const path of [
  ...core,
  ...cases,
  ...articles,
  '/work/not-a-project',
  '/writing/log/sales-engineer-log-5',
  '/writing/unknown',
  '/not-a-page',
]) {
  const response = await fetch(base + path),
    html = await response.text();
  const expected =
    core.includes(path) || (preview && [...cases, ...articles].includes(path))
      ? 200
      : 404;
  assert.equal(response.status, expected, path);
  if (expected === 200) {
    assert.equal(
      (html.match(/<h1(?:\s|>)/g) || []).length,
      1,
      path + ' single heading',
    );
    assert.equal(
      (html.match(/<main(?:\s|>)/g) || []).length,
      1,
      path + ' single main',
    );
  }
  assert.ok(!/href="(?:#|)"/.test(html), path + ' no empty destination');
  if ([...cases, ...articles].includes(path) && preview)
    assert.match(
      html,
      /<meta name="robots" content="noindex, nofollow"/,
      path + ' draft noindex',
    );
  records.push({ path, status: response.status });
}
for (const path of [
  '/llms.txt',
  '/llms-full.txt',
  '/sitemap.xml',
  '/feed.xml',
]) {
  const response = await fetch(base + path),
    body = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(!body.includes('/work/antigravity'), path + ' no draft');
  assert.ok(!body.includes('knowledgeOS'), path + ' no private sources');
  records.push({
    path,
    status: response.status,
    contentType: response.headers.get('content-type'),
  });
}
for (const [from, to] of [
  ['/logs', '/writing/log'],
  ['/experiments', '/writing/experiments'],
]) {
  const response = await fetch(base + from, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get('location'), base).pathname, to);
}
for (const path of ['/social-preview.png', '/favicon.svg'])
  assert.equal((await fetch(base + path)).status, 200, path);
await mkdir('docs/qa', { recursive: true });
await writeFile(
  `docs/qa/production-${preview ? 'review' : 'public'}-routes.json`,
  JSON.stringify(records, null, 2),
);
console.log(
  `${records.length} route/export checks, redirects and social assets passed (${preview ? 'review' : 'public'} build).`,
);
