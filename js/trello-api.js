// Thin wrapper over the Trello REST API for actions the Power-Up client library can't do
// (e.g. moving cards). Uses the per-user token from t.getRestApi(), so no backend is needed.
import { APP_KEY } from './config.js';

export class NotAuthorizedError extends Error {
  constructor() {
    super('Trello authorization required');
    this.name = 'NotAuthorizedError';
  }
}

export const AUTH_POPUP = { title: 'Authorize Power-Up', url: './auth.html', height: 140 };

async function request(t, method, path, body) {
  if (!APP_KEY) throw new Error('APP_KEY is not set in js/config.js');
  const api = t.getRestApi();
  const token = await api.getToken();
  if (!token) throw new NotAuthorizedError();

  const url = `https://api.trello.com/1${path}?key=${encodeURIComponent(APP_KEY)}&token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token expired or revoked: drop it so the next attempt re-prompts.
    await api.clearToken();
    throw new NotAuthorizedError();
  }
  if (!res.ok) throw new Error(`Trello API ${res.status}: ${await res.text()}`);
  return res.json();
}

export function moveCard(t, cardId, idList, pos = 'top') {
  return request(t, 'PUT', `/cards/${cardId}`, { idList, pos });
}
