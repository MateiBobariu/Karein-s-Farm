import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const visibleText = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

test('shop renders a scannable setup-to-ending guide using confirmed rules', async () => {
  const shop = await read('shop.html');
  const text = visibleText(shop);

  assert.match(shop, /<section class="physical-game-rules[^>]*id="physical-game-rules"/);
  assert.match(text, /4–30 players, plus a separate storyteller/i);
  assert.match(text, /30 cards, instructions, and a notepad in a cardboard box/i);
  assert.match(text, /01 · SET UP[\s\S]*?02 · NIGHT[\s\S]*?03 · DAY[\s\S]*?04 · CHECK THE END/);
  assert.match(text, /each player one secret card/i);
  assert.match(text, /most votes is voted out/i);
  assert.match(text, /all wild animals have been voted out/i);
  assert.match(text, /wild animals remaining equal the farm animals remaining/i);
  assert.match(text, /Raccoon · Prankster[\s\S]*?mutes them or prevents them from voting for one round/i);
  assert.match(text, /Hobbit · Doctor[\s\S]*?save/i);
  assert.match(text, /Blue · Detective[\s\S]*?at night/i);
  assert.match(text, /Wolf · Impostor[\s\S]*?cannot identify the Wolf/i);
  assert.match(text, /Tied vote:[\s\S]*?do not specify a tie-break/i);
});

test('shop navigation jumps to the physical game instructions section', async () => {
  const shop = await read('shop.html');
  const links = [...shop.matchAll(/<a\b[^>]*href="#physical-game-rules"[^>]*>([\s\S]*?)<\/a>/gi)];
  assert.equal(links.length, 1);
  assert.match(links[0][1], /How to play the game/i);
  assert.equal([...shop.matchAll(/id="physical-game-rules"/g)].length, 1);
});
