// Fast Reviewer: on cards in the "Verify" list, show buttons at the top of the card
// to step through the list and move the card back to "Doing" or on to "Done".
import { LIST_NAMES, findListByName, getNeighbors, cardAfterRemoval } from './logic.js';
import { moveCard, NotAuthorizedError, AUTH_POPUP } from '../../trello-api.js';

async function loadContext(t) {
  const [card, lists] = await Promise.all([
    t.card('id', 'idList'),
    t.lists('id', 'name', 'cards'),
  ]);
  const list = lists.find((l) => l.id === card.idList) ?? null;
  return {
    card,
    lists,
    inVerify: list?.name === LIST_NAMES.verify,
    verifyCards: list?.cards ?? [],
  };
}

async function openNeighbor(t, direction) {
  const ctx = await loadContext(t);
  if (!ctx.inVerify) return;
  const { prev, next } = getNeighbors(ctx.verifyCards, ctx.card.id);
  const target = direction < 0 ? prev : next;
  if (target) await t.showCard(target.id);
}

async function moveTo(t, targetName) {
  const ctx = await loadContext(t);
  if (!ctx.inVerify) return;

  const target = findListByName(ctx.lists, targetName);
  if (!target) {
    return t.alert({ message: `No list named "${targetName}" on this board.`, display: 'error' });
  }

  // Decide which card to open next before the move changes the list.
  const follow = cardAfterRemoval(ctx.verifyCards, ctx.card.id);

  try {
    await moveCard(t, ctx.card.id, target.id, 'top');
  } catch (err) {
    if (err instanceof NotAuthorizedError) return t.popup(AUTH_POPUP);
    console.error('[Fast Reviewer] move failed', err);
    return t.alert({ message: `Move failed: ${err.message}`, display: 'error', duration: 10 });
  }

  if (follow) return t.showCard(follow.id);
  return t.alert({ message: `Moved to ${targetName}. "${LIST_NAMES.verify}" is now empty.`, display: 'success' });
}

async function cardDetailBadges(t) {
  const ctx = await loadContext(t);
  if (!ctx.inVerify) return [];

  const { index, total, prev, next } = getNeighbors(ctx.verifyCards, ctx.card.id);
  const position = `${LIST_NAMES.verify} ${index + 1}/${total}`;
  const badges = [];

  if (prev) badges.push({ title: position, text: '◀ Previous', callback: (t2) => openNeighbor(t2, -1) });
  if (next) badges.push({ title: position, text: 'Next ▶', callback: (t2) => openNeighbor(t2, 1) });
  badges.push(
    { title: 'Move to', text: `↩ ${LIST_NAMES.doing}`, color: 'yellow', callback: (t2) => moveTo(t2, LIST_NAMES.doing) },
    { title: 'Move to', text: `✔ ${LIST_NAMES.done}`, color: 'green', callback: (t2) => moveTo(t2, LIST_NAMES.done) },
  );
  return badges;
}

export default {
  name: 'fast-reviewer',
  capabilities: {
    'card-detail-badges': cardDetailBadges,
  },
};
