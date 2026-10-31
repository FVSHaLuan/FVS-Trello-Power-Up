// Pure helpers for Fast Reviewer — no Trello globals, so they run under `node --test`.

export const LIST_NAMES = { verify: 'Verify', doing: 'Doing', done: 'Done' };

/** First open list whose name matches exactly (case-sensitive). */
export function findListByName(lists, name) {
  return lists.find((list) => list.name === name) ?? null;
}

/** Cards in board order. Trello usually returns them sorted; sort by `pos` defensively. */
export function orderCards(cards) {
  return [...cards].sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
}

/** Position of `cardId` within `cards` plus its previous/next neighbours (null at the ends). */
export function getNeighbors(cards, cardId) {
  const ordered = orderCards(cards);
  const index = ordered.findIndex((card) => card.id === cardId);
  if (index === -1) return { index: -1, total: ordered.length, prev: null, next: null };
  return {
    index,
    total: ordered.length,
    prev: ordered[index - 1] ?? null,
    next: ordered[index + 1] ?? null,
  };
}

/** Card to open after the current one leaves the list: the next one, else the previous one. */
export function cardAfterRemoval(cards, cardId) {
  const { next, prev } = getNeighbors(cards, cardId);
  return next ?? prev;
}
