import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

test('shop page accurately presents the physical game pre-order offer', async () => {
  const shop = await read('shop.html');
  assert.match(shop, /physical board game with cards/i);
  assert.match(shop, /pre-orders are limited to 1,000 copies/i);
  assert.match(shop, /Pre-order · 120 lei/);
  assert.match(shop, /does not reserve a copy/i);
  assert.match(shop, /no online payment is taken/i);
});

test('shop pre-order buttons lead to the existing checkout form', async () => {
  const shop = await read('shop.html');
  const checkoutLinks = [...shop.matchAll(/<a\b[^>]*href="([^"]*checkout\.html)"[^>]*>([\s\S]*?)<\/a>/gi)];
  assert.equal(checkoutLinks.length, 2, 'both offer buttons should link to checkout');
  for (const [, href, label] of checkoutLinks) {
    assert.equal(href, 'checkout.html');
    assert.match(label, /pre-order request/i);
  }

  const checkout = await read('checkout.html');
  assert.match(checkout, /id="checkout-form"/);
  assert.match(checkout, /physical board game with cards/i);
  assert.match(checkout, /120 lei/);
  assert.match(checkout, /does not reserve a copy/i);
  assert.match(checkout, /No payment has been taken/i);
});

test('checkout display and server order endpoint use the same 120 lei price', async () => {
  const checkoutScript = await read('checkout.js');
  const orderEndpoint = await read('api/orders.mjs');
  assert.match(checkoutScript, /const unitPrice = 120;/);
  assert.match(checkoutScript, /fetch\('\/api\/orders'/);
  assert.match(orderEndpoint, /const UNIT_PRICE_LEI = 120;/);
});
