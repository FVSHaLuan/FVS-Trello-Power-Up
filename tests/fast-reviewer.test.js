import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findListByName, getNeighbors, cardAfterRemoval } from '../js/modules/fast-reviewer/logic.js';

const cards = [
  { id: 'c', pos: 300 },
  { id: 'a', pos: 100 },
  { id: 'b', pos: 200 },
];

test('getNeighbors orders by pos and finds neighbours', () => {
  const r = getNeighbors(cards, 'b');
  assert.equal(r.index, 1);
  assert.equal(r.total, 3);
  assert.equal(r.prev.id, 'a');
  assert.equal(r.next.id, 'c');
});

test('getNeighbors returns null at the ends', () => {
  assert.equal(getNeighbors(cards, 'a').prev, null);
  assert.equal(getNeighbors(cards, 'c').next, null);
});

test('getNeighbors handles a card not in the list', () => {
  assert.deepEqual(getNeighbors(cards, 'zzz'), { index: -1, total: 3, prev: null, next: null });
});

test('cardAfterRemoval prefers next, falls back to previous, then null', () => {
  assert.equal(cardAfterRemoval(cards, 'a').id, 'b');
  assert.equal(cardAfterRemoval(cards, 'c').id, 'b');
  assert.equal(cardAfterRemoval([{ id: 'only', pos: 1 }], 'only'), null);
});

test('findListByName is an exact, case-sensitive match', () => {
  const lists = [{ id: '1', name: 'Doing' }, { id: '2', name: 'Done' }];
  assert.equal(findListByName(lists, 'Done').id, '2');
  assert.equal(findListByName(lists, 'done'), null);
  assert.equal(findListByName(lists, 'Done '), null);
});
