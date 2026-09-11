import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
}
const source = compile(
  readFileSync(new URL('../lib/analytics.ts', import.meta.url), 'utf8'),
);
const sdkEntry = import.meta.resolve('@microsoft/clarity');
// Exercise the installed SDK itself in each isolated browser, not an SDK stub.
const sdkSources = new Map([
  ['@microsoft/clarity', compile(readFileSync(new URL(sdkEntry), 'utf8'))],
  [
    './src/utils.js',
    compile(readFileSync(new URL('./src/utils.js', sdkEntry), 'utf8')),
  ],
]);

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function environment({
  hostname = 'mihiir.com',
  enabled = 'true',
  projectId = 'testproject',
  server = false,
} = {}) {
  const scripts = [];
  const testModule = { exports: {} };
  const window = {
    location: { hostname },
    localStorage: storage(),
    sessionStorage: storage(),
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
  };
  const document = {
    getElementById: (id) => scripts.find((script) => script.id === id) ?? null,
    createElement: () => ({}),
    getElementsByTagName: () => [
      { parentNode: { insertBefore: (script) => scripts.push(script) } },
    ],
  };
  const context = vm.createContext({
    ...(server ? {} : { window, document }),
    Event,
    module: testModule,
    exports: testModule.exports,
    process: {
      env: {
        NEXT_PUBLIC_ANALYTICS_ENABLED: enabled,
        NEXT_PUBLIC_CLARITY_PROJECT_ID: projectId,
      },
    },
  });
  const modules = new Map();
  function requireSDK(name) {
    if (modules.has(name)) return modules.get(name).exports;
    const code = sdkSources.get(name);
    if (!code) throw new Error(`Unexpected SDK dependency: ${name}`);
    const sdkModule = { exports: {} };
    modules.set(name, sdkModule);
    const evaluate = vm.runInContext(
      `(function(require, module, exports) { ${code}\n })`,
      context,
    );
    evaluate(requireSDK, sdkModule, sdkModule.exports);
    return sdkModule.exports;
  }
  context.require = requireSDK;
  vm.runInContext(source, context);
  return { api: testModule.exports, scripts, window, document };
}

const queuedCommands = (window) =>
  JSON.parse(
    JSON.stringify(
      Array.from(window.clarity?.q ?? [], (command) => Array.from(command)),
    ),
  );

await test('the SDK and analytics module can load during server rendering without browser globals', () => {
  const { api, scripts } = environment({ server: true });
  assert.equal(api.analyticsEnabled(), false);
  assert.doesNotThrow(() => api.startClarity());
  assert.doesNotThrow(() => api.denyClarityStorage());
  assert.equal(scripts.length, 0);
});

await test('unconfigured sites, previews and localhost never insert Clarity even with stored acceptance', () => {
  for (const config of [
    { enabled: 'false' },
    { projectId: '' },
    { projectId: 'invalid/id' },
    { hostname: 'localhost' },
    { hostname: '127.0.0.1' },
    { hostname: 'mihiir-preview.vercel.app' },
    { hostname: 'mihiir.com.attacker.test' },
  ]) {
    const { api, scripts } = environment(config);
    api.saveAnalyticsPreference('granted');
    api.startClarity();
    assert.equal(scripts.length, 0, JSON.stringify(config));
  }
});

await test('unknown, malformed, outdated and denied preferences send no requests or queued events', () => {
  for (const preference of [
    null,
    '{invalid',
    '{"version":0,"choice":"granted"}',
    '{"version":1,"choice":"denied"}',
  ]) {
    const { api, scripts, window } = environment();
    if (preference !== null)
      window.localStorage.setItem(api.consentStorageKey, preference);
    api.startClarity();
    api.trackAnalyticsEvent('booking_open_home');
    assert.equal(scripts.length, 0);
    assert.equal(window.clarity, undefined);
  }
});

await test('acceptance initializes the SDK once and synchronously queues analytics-only consent', () => {
  const { api, scripts, window } = environment({ hostname: 'www.mihiir.com' });
  assert.equal(api.saveAnalyticsPreference('granted'), true);
  api.startClarity();
  api.startClarity();
  assert.equal(scripts.length, 1);
  assert.equal(Boolean(scripts[0].async), true);
  assert.equal(
    scripts[0].src,
    'https://www.clarity.ms/tag/testproject?ref=npm',
  );
  assert.deepEqual(queuedCommands(window), [
    ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }],
  ]);
});

await test('failed SDK script insertion does not report a started tracker or accept events', () => {
  const { api, window, document, scripts } = environment();
  document.getElementsByTagName = () => [];
  api.saveAnalyticsPreference('granted');
  api.startClarity();
  api.trackAnalyticsEvent('booking_open_home');
  assert.equal(api.clarityHasStarted(), false);
  assert.equal(scripts.length, 0);
  assert.deepEqual(queuedCommands(window), []);
});

await test('event names are allowlisted and accept no arbitrary payload', () => {
  const { api, window } = environment();
  api.saveAnalyticsPreference('granted');
  api.startClarity();
  api.trackAnalyticsEvent('booking_open_practice');
  api.trackAnalyticsEvent('someone@example.com');
  api.trackAnalyticsEvent('booking_open_practice?email=someone@example.com');
  assert.deepEqual(queuedCommands(window).slice(1), [
    ['event', 'booking_open_practice'],
  ]);
});

await test('withdrawal denies both storage categories and immediately prevents further events', () => {
  const { api, window } = environment();
  api.saveAnalyticsPreference('granted');
  api.startClarity();
  api.saveAnalyticsPreference('denied');
  api.denyClarityStorage();
  api.trackAnalyticsEvent('booking_open_footer');
  assert.equal(api.readAnalyticsPreference(), 'denied');
  assert.deepEqual(queuedCommands(window).slice(1), [
    ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
  ]);
  const returning = environment();
  returning.window.localStorage.setItem(
    api.consentStorageKey,
    window.localStorage.getItem(api.consentStorageKey),
  );
  returning.api.startClarity();
  assert.equal(returning.scripts.length, 0);
});

await test('blocked persistent storage cannot authorize analytics and denial falls back for this session', () => {
  const { api, scripts, window } = environment();
  window.localStorage.setItem = () => {
    throw new Error('Storage unavailable');
  };
  assert.equal(api.saveAnalyticsPreference('granted'), false);
  api.startClarity();
  assert.equal(scripts.length, 0);
  assert.equal(api.saveAnalyticsPreference('denied'), true);
  assert.equal(api.readAnalyticsPreference(), 'denied');
});
