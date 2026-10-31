# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Trello Power-Up that bundles several functions. It is plain HTML + native ES modules with **no build step**: the files in the repo are exactly what gets served (GitHub Pages from `main`). Setup steps for the Trello admin portal are in `README.md`.

## Commands

- `npm run dev`: static server on http://localhost:3000 with CORS (`serve`; `serve.json` disables clean URLs so `auth.html` isn't redirected). Trello only loads HTTPS, so test through a tunnel (cloudflared/ngrok) pointed at a separate "dev" Power-Up.
- `npm test`: runs `node --test`, which finds `tests/**/*.test.js`.
- Single test: `node --test --test-name-pattern="<name regex>" tests/fast-reviewer.test.js`

Only pure logic is unit-tested. Code that touches `t` (the Trello context) can only be verified inside Trello.

## Architecture

- `index.html` → `js/connector.js` is the **only** `TrelloPowerUp.initialize()` call. Each function is a module under `js/modules/<name>/` whose default export is `{ name, capabilities: { '<capability>': handler } }`. The connector merges every module's handlers for the same capability into one flattened array, so several modules can add badges/buttons to the same capability. A module that throws is logged and skipped, and the others still render. To add a function, create the module and append it to the `modules` array in `connector.js`.
- Each capability used must **also be enabled in the Trello admin portal**, or Trello never calls it. Update the capability list in `README.md` when adding one.
- Keep Trello-free logic in a module's `logic.js` (imported by tests under Node). Trello-facing handlers live in `index.js`.
- **Moving or editing cards needs the REST API**, because the Power-Up client library can only read. `js/trello-api.js` calls `api.trello.com` from the browser with the user's token from `t.getRestApi()`, so there is no backend. If there's no token, or the API returns 401 (it clears the token), it throws `NotAuthorizedError`. Callers then open `AUTH_POPUP` (`auth.html`/`js/auth.js`). `authorize()` must run in a popup on a real user click, not in the connector.
- `js/config.js` holds `APP_KEY` (public Trello API key, empty until configured; REST calls fail with a clear error while empty), `APP_NAME` and `APP_AUTHOR`. Every iframe page (`TrelloPowerUp.iframe(...)`) must pass the same `appKey`/`appName` to use the REST API.
- Every HTML page must load `https://p.trellocdn.com/power-up.min.js` before its module script.

## Platform constraints

- Built-in storage (`t.get`/`t.set`, scopes `board|card|member|organization` × `shared|private`) is capped at 4096 characters per scope+visibility.
- Card detail badges (used by Fast Reviewer) are the only Power-Up surface at the top of the card back. Their `callback` makes them act as buttons. Trello re-requests them when the card changes, so handlers should re-read state (`t.card`, `t.lists`) when clicked rather than trust values captured at render time.

## Fast Reviewer specifics

Lists are matched by **exact, case-sensitive name**: `Verify`, `Doing`, `Done` (`LIST_NAMES` in `js/modules/fast-reviewer/logic.js`). Moves go to `pos: 'top'`. After a move, the next card in Verify opens (or the previous one if it was the last).
