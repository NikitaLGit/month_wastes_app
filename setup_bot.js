#!/usr/bin/env node
// One-time setup: registers webhook + menu button in BotFather
// Usage: node setup_bot.js <BOT_TOKEN> <PUBLIC_HTTPS_URL>
// Example: node setup_bot.js 123:abc https://myapp.example.com

const [,, token, publicUrl] = process.argv;

if (!token || !publicUrl) {
  console.error('Usage: node setup_bot.js <BOT_TOKEN> <PUBLIC_HTTPS_URL>');
  process.exit(1);
}

async function api(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!d.ok) throw new Error(`${method}: ${d.description}`);
  return d.result;
}

(async () => {
  await api('setWebhook', { url: `${publicUrl}/webhook` });
  console.log('✓ Webhook:', `${publicUrl}/webhook`);

  await api('setChatMenuButton', {
    menu_button: { type: 'web_app', text: '💸 Траты', web_app: { url: publicUrl } },
  });
  console.log('✓ Menu button set');

  await api('setMyCommands', {
    commands: [{ command: 'start', description: 'Открыть приложение' }],
  });
  console.log('✓ Commands set');

  console.log('\nBot is ready. Open your bot in Telegram.');
})().catch(e => { console.error(e.message); process.exit(1); });
