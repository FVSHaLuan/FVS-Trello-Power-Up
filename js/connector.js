// Single entry point Trello loads. Each feature module exports
// { name, capabilities: { '<capability>': (t, opts) => array | Promise<array> } };
// handlers for the same capability are merged so modules never edit each other.
import { APP_KEY, APP_NAME, APP_AUTHOR } from './config.js';
import { AUTH_POPUP } from './trello-api.js';
import fastReviewer from './modules/fast-reviewer/index.js';

const modules = [fastReviewer];

function mergeHandlers(capability) {
  const owners = modules.filter((m) => m.capabilities[capability]);
  return async (t, opts) => {
    const results = await Promise.all(
      owners.map(async (m) => {
        try {
          return (await m.capabilities[capability](t, opts)) ?? [];
        } catch (err) {
          // One broken module must not hide the others' buttons/badges.
          console.error(`[${m.name}] ${capability} failed`, err);
          return [];
        }
      }),
    );
    return results.flat();
  };
}

const capabilities = {};
for (const name of new Set(modules.flatMap((m) => Object.keys(m.capabilities)))) {
  capabilities[name] = mergeHandlers(name);
}

// Shared REST API authorization (shown in the Power-Up's menu on the board).
capabilities['authorization-status'] = async (t) => ({
  authorized: APP_KEY ? await t.getRestApi().isAuthorized() : false,
});
capabilities['show-authorization'] = (t) => t.popup(AUTH_POPUP);

window.TrelloPowerUp.initialize(capabilities, {
  ...(APP_KEY && { appKey: APP_KEY }),
  appName: APP_NAME,
  appAuthor: APP_AUTHOR,
});
