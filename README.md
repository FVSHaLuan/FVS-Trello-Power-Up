# FVS Trello Power-Up

A Trello Power-Up that bundles several functions. Plain HTML + ES modules, no build step, hosted as static files.

## Functions

### Fast Reviewer
On any card in the list named exactly **Verify**, adds buttons to the top of the card:

- **◀ Previous / Next ▶** opens the neighbouring card in Verify (hidden at the ends of the list)
- **↩ Doing / ✔ Done** moves the card to the top of that list, then opens the next card in Verify

List names must match exactly (case-sensitive). Moving cards uses the Trello REST API, so each user authorizes the Power-Up once (a popup appears on the first move).

## Setup

1. **Host it.** Push to GitHub and enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). The connector URL becomes `https://<user>.github.io/<repo>/`.
2. **Register the Power-Up** at https://trello.com/power-ups/admin (needs a workspace you administer):
   - *Iframe connector URL*: your hosted URL
   - *Capabilities*: enable **Card detail badges**, **Authorization status** and **Show authorization**
3. **API key.** In the Power-Up's *API key* tab, generate a key. Add your hosting origin (e.g. `https://<user>.github.io`) to its allowed origins, and paste the key into `APP_KEY` in `js/config.js`.
4. **Enable it on a board** from the board's Power-Ups menu (Custom section).

## Development

```sh
npm install
npm run dev      # static server on http://localhost:3000 with CORS
npm test         # unit tests (node:test)
```

Trello only loads HTTPS URLs, so expose the dev server with a tunnel (e.g. `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`). Register a separate "dev" Power-Up pointing at the tunnel URL and add the tunnel origin to the API key's allowed origins.
