import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function compile(file) {
  return ts.transpileModule(
    readFileSync(new URL(file, import.meta.url), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
}

const discoverySource = compile('../lib/discovery.ts');
const sitemapSource = compile('../app/sitemap.ts');
const robotsSource = compile('../app/robots.ts');
const fixtureEntries = [
  {
    kind: 'work',
    path: '/work/public-case',
    title: 'Public case',
    summary: 'Delivered prototype; deployment was outside the engagement.',
    draft: false,
  },
  {
    kind: 'writing',
    path: '/writing/log/public-log',
    title: 'Public & useful <log>',
    summary: 'A < B & B > C.',
    draft: false,
    date: '2026-09-01',
    series: 'sales-engineer',
  },
  {
    kind: 'writing',
    path: '/writing/technical/undated',
    title: 'An undated technical piece',
    summary: 'Published without an invented date.',
    draft: false,
  },
  {
    kind: 'work',
    path: '/work/private-draft-case',
    title: 'PRIVATE_DRAFT',
    summary: 'PRIVATE_DRAFT_DETAILS',
    draft: true,
  },
  {
    kind: 'writing',
    path: '/writing/log/private-draft-log',
    title: 'PRIVATE_DRAFT_LOG',
    summary: 'PRIVATE_DRAFT_LOG_DETAILS',
    draft: true,
  },
];

function environment({ indexable = true, preview = false } = {}) {
  const markdownCalls = [];
  const content = {
    getPublishedContent: () => fixtureEntries,
    getPublishedMarkdown: (entry) => {
      assert.equal(
        entry.draft,
        false,
        'A draft was passed to the Markdown export API',
      );
      markdownCalls.push(entry.path);
      return `FULL_BODY_FOR_${entry.path}\n\nThe deployment limitation is preserved.`;
    },
  };
  const site = {
    isIndexable: indexable,
    site: {
      url: 'https://mihiir.com',
      studio: 'https://chainlabs.in',
      booking: 'https://cal.com/mihiir/30min',
    },
  };
  const modules = { '@/lib/content': content, '@/lib/site': site };
  function evaluate(source) {
    const testModule = { exports: {} };
    const context = vm.createContext({
      module: testModule,
      exports: testModule.exports,
      require: (name) => {
        assert.ok(name in modules, `Unexpected dependency ${name}`);
        return modules[name];
      },
      process: { env: { CONTENT_PREVIEW: preview ? 'true' : 'false' } },
      URL,
    });
    vm.runInContext(source, context);
    return testModule.exports;
  }
  const discovery = evaluate(discoverySource);
  modules['@/lib/discovery'] = discovery;
  return {
    discovery,
    sitemap: evaluate(sitemapSource).default,
    robots: evaluate(robotsSource).default,
    markdownCalls,
  };
}

await test('noindex deployments and explicit content previews expose no discovery content', () => {
  for (const config of [
    { indexable: false },
    { indexable: true, preview: true },
  ]) {
    const { discovery, sitemap, robots, markdownCalls } = environment(config);
    assert.equal(sitemap().length, 0);
    assert.equal(robots().rules.disallow, '/');
    assert.equal(robots().sitemap, undefined);
    assert.match(discovery.getLlmsIndex(), /exports are disabled/);
    assert.match(discovery.getLlmsFull(), /exports are disabled/);
    assert.doesNotMatch(discovery.getWritingFeed(), /<item>/);
    assert.equal(
      discovery.discoveryHeaders('text/plain')['X-Robots-Tag'],
      'noindex, nofollow',
    );
    assert.equal(markdownCalls.length, 0);
  }
});

await test('every public export excludes drafts even if the registry mistakenly returns one', () => {
  const { discovery, sitemap, markdownCalls } = environment();
  const outputs = [
    JSON.stringify(sitemap()),
    discovery.getLlmsIndex(),
    discovery.getLlmsFull(),
    discovery.getWritingFeed(),
  ];
  for (const output of outputs) {
    assert.doesNotMatch(output, /PRIVATE_DRAFT|private-draft/);
    assert.doesNotMatch(output, /knowledgeOS|D:\\Codebase|C:\\Users/);
  }
  assert.equal(markdownCalls.length, 3);
});

await test('sitemap includes published articles and their actual collections without fake dates', () => {
  const { sitemap, robots } = environment();
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes('https://mihiir.com/about'));
  assert.ok(urls.includes('https://mihiir.com/prediction-market-development'));
  assert.ok(urls.includes('https://mihiir.com/work/public-case'));
  assert.ok(urls.includes('https://mihiir.com/writing/log'));
  assert.ok(urls.includes('https://mihiir.com/writing/log/sales-engineer'));
  assert.ok(urls.includes('https://mihiir.com/writing/technical'));
  assert.ok(entries.every((entry) => !('lastModified' in entry)));
  assert.equal(robots().sitemap, 'https://mihiir.com/sitemap.xml');
  assert.ok(robots().rules.disallow.includes('/design-lab'));
});

await test('expanded text uses published Markdown and retains its qualifications and canonical source', () => {
  const { discovery } = environment();
  const full = discovery.getLlmsFull();
  assert.match(full, /Source: https:\/\/mihiir\.com\/work\/public-case/);
  assert.match(full, /FULL_BODY_FOR_\/work\/public-case/);
  assert.match(full, /The deployment limitation is preserved\./);
  assert.match(full, /Date: 2026-09-01/);
});

await test('RSS is writing-only, escapes XML and uses dates only when actually supplied', () => {
  const { discovery } = environment();
  const feed = discovery.getWritingFeed();
  assert.equal((feed.match(/<item>/g) ?? []).length, 2);
  assert.doesNotMatch(feed, /\/work\/public-case/);
  assert.match(feed, /Public &amp; useful &lt;log&gt;/);
  assert.match(feed, /A &lt; B &amp; B &gt; C\./);
  assert.equal((feed.match(/<pubDate>/g) ?? []).length, 1);
  assert.match(feed, /Tue, 01 Sep 2026 00:00:00 GMT/);
  assert.match(
    feed,
    /<guid isPermaLink="true">https:\/\/mihiir.com\/writing\/technical\/undated<\/guid>/,
  );
});
