import { APP_KEY, APP_NAME } from './config.js';

const t = window.TrelloPowerUp.iframe({ appKey: APP_KEY, appName: APP_NAME });
const button = document.getElementById('authorize');
const status = document.getElementById('status');

button.addEventListener('click', async () => {
  if (!APP_KEY) {
    status.textContent = 'APP_KEY is not set in js/config.js.';
    return;
  }
  try {
    await t.getRestApi().authorize({ scope: 'read,write', expiration: '30days' });
    status.textContent = 'Authorized. Click the button on the card again.';
    setTimeout(() => t.closePopup(), 1200);
  } catch (err) {
    console.error('[auth] authorization failed', err);
    status.textContent = 'Authorization was cancelled or failed.';
  }
});

t.render(() => t.sizeTo('body'));
