import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../lib/booking.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const context = { exports: {}, URL };
vm.runInNewContext(source, context);
const { getCalBookingLink } = context.exports;

await test('Cal booking links retain configured event, team and campaign destinations', () => {
  assert.equal(
    getCalBookingLink('https://cal.com/mihiir/30min'),
    'mihiir/30min',
  );
  assert.equal(
    getCalBookingLink('https://www.cal.com/team/studio/intro/?utm_source=site'),
    'team/studio/intro?utm_source=site',
  );
});

await test('Other booking providers and malformed URLs use the external fallback', () => {
  for (const url of [
    'https://calendly.com/mihiir/intro',
    'https://cal.com.evil.example/mihiir/30min',
    'https://cal.com@other.example/mihiir/30min',
    'https://person:secret@cal.com/mihiir/30min',
    'http://cal.com/mihiir/30min',
    'https://cal.com:8080/mihiir/30min',
    'https://cal.com/',
    'not a URL',
  ]) {
    assert.equal(getCalBookingLink(url), null, url);
  }
});
