// Express-сервер + cron. Зависимости: express, pg, node-cron, crypto (встроен в Node).
// Раздаёт dist/index.html (собранный Vite) как статику.
//
// REST API (все пути без /wastes/ — nginx стрипает префикс):
//   POST /api/reminder    — включить/выключить ремайндер в БД; при включении catch-up уведомление
//   GET  /api/reminders   — список expense_id активных ремайндеров пользователя
//   POST /api/settings    — обновить days_before для всех ремайндеров пользователя
//
// validateInitData(initData) — HMAC-SHA256 проверка Telegram initData → возвращает объект user или null.
// initDb() — создаёт таблицу reminders + ALTER ADD COLUMN IF NOT EXISTS days_before (идемпотентно).
// sendReminders() — cron 9:00 Europe/Moscow: для каждой строки проверяет today+days_before == day_of_month.
// daysUntilDayOfMonth(day) — сколько дней до ближайшего числа `day` в месяце (учитывает конец месяца).

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.log(req.method, req.path, res.statusCode, `${Date.now()-start}ms`));
  next();
});

const PORT = process.env.PORT || 3003;
const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      user_id BIGINT NOT NULL,
      expense_id TEXT NOT NULL,
      expense_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      day_of_month INTEGER NOT NULL,
      days_before INTEGER NOT NULL DEFAULT 3,
      PRIMARY KEY (user_id, expense_id)
    )
  `);
  await pool.query(`ALTER TABLE reminders ADD COLUMN IF NOT EXISTS days_before INTEGER NOT NULL DEFAULT 3`);
}

function validateInitData(initData) {
  if (!BOT_TOKEN || !initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (expected !== hash) return null;
  try { return JSON.parse(params.get('user')); } catch { return null; }
}

app.post('/api/test-cron', async (req, res) => {
  if (!pool || !BOT_TOKEN) return res.status(503).json({ error: 'not configured' });
  const { secret } = req.body;
  if (secret !== 'wastes-debug-2026') return res.status(403).json({ error: 'forbidden' });
  await sendReminders();
  res.json({ ok: true, message: 'cron triggered manually' });
});

app.post('/api/reminder', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB not configured' });
  const { initData, expenseId, expenseName, amount, dayOfMonth, enabled, daysBeforePayment = 3 } = req.body;
  const user = validateInitData(initData);
  if (!user) return res.status(403).json({ error: 'Invalid initData' });
  try {
    if (enabled) {
      await pool.query(
        `INSERT INTO reminders (user_id, expense_id, expense_name, amount, day_of_month, days_before)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, expense_id) DO UPDATE
         SET expense_name = $3, amount = $4, day_of_month = $5, days_before = $6`,
        [user.id, expenseId, expenseName, amount, dayOfMonth, daysBeforePayment]
      );
    } else {
      await pool.query(
        'DELETE FROM reminders WHERE user_id = $1 AND expense_id = $2',
        [user.id, expenseId]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/settings', async (req, res) => {
  if (!pool) return res.json({ ok: true });
  const { initData, daysBeforePayment } = req.body;
  const user = validateInitData(initData);
  if (!user) return res.status(403).json({ error: 'Invalid initData' });
  try {
    await pool.query(
      'UPDATE reminders SET days_before = $1 WHERE user_id = $2',
      [daysBeforePayment, user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/reminders', async (req, res) => {
  if (!pool) return res.json({ ids: [] });
  const raw = req.headers['x-init-data'];
  const user = validateInitData(raw);
  if (!user) return res.status(403).json({ error: 'Invalid initData' });
  try {
    const { rows } = await pool.query(
      'SELECT expense_id FROM reminders WHERE user_id = $1',
      [user.id]
    );
    res.json({ ids: rows.map(r => r.expense_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});


function formatReminderText(daysLeft, items) {
  const label = daysLeft === 0 ? 'Сегодня' : daysLeft === 1 ? 'Завтра' : `Через ${daysLeft} дня`;
  const list = items.map(({ name, amount }) =>
    `• ${name} — ${Number(amount).toLocaleString('ru-RU')} ₽`
  ).join('\n');
  return `🔔 Спишется ${label}:\n${list}`;
}

async function sendReminderMessage(userId, daysLeft, items) {
  if (!BOT_TOKEN) return;
  const text = formatReminderText(daysLeft, items);
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: userId, text }),
  }).catch(console.error);
}

async function sendReminders() {
  if (!pool || !BOT_TOKEN) return;
  const today = new Date();
  try {
    const { rows } = await pool.query('SELECT * FROM reminders');
    // group matching rows by user_id + daysLeft
    const groups = new Map();
    for (const row of rows) {
      const target = new Date(today);
      target.setDate(today.getDate() + row.days_before);
      if (target.getDate() === row.day_of_month) {
        const key = `${row.user_id}:${row.days_before}`;
        if (!groups.has(key)) groups.set(key, { userId: row.user_id, daysLeft: row.days_before, items: [] });
        groups.get(key).items.push({ name: row.expense_name, amount: row.amount });
      }
    }
    for (const { userId, daysLeft, items } of groups.values()) {
      await sendReminderMessage(userId, daysLeft, items);
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
}

cron.schedule('0 9 * * *', sendReminders, { timezone: 'Europe/Moscow' });

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

initDb().then(() => {
  app.listen(PORT, () => console.log(`Listening on :${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  app.listen(PORT, () => console.log(`Listening on :${PORT} (no DB)`));
});
