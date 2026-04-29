const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
app.use(express.json());

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
      PRIMARY KEY (user_id, expense_id)
    )
  `);
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

app.post('/api/reminder', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB not configured' });
  const { initData, expenseId, expenseName, amount, dayOfMonth, enabled } = req.body;
  const user = validateInitData(initData);
  if (!user) return res.status(403).json({ error: 'Invalid initData' });
  try {
    if (enabled) {
      await pool.query(
        `INSERT INTO reminders (user_id, expense_id, expense_name, amount, day_of_month)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, expense_id) DO UPDATE
         SET expense_name = $3, amount = $4, day_of_month = $5`,
        [user.id, expenseId, expenseName, amount, dayOfMonth]
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

app.get('/api/reminders', async (req, res) => {
  if (!pool) return res.json({ ids: [] });
  const user = validateInitData(req.headers['x-init-data']);
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

async function sendReminders() {
  if (!pool || !BOT_TOKEN) return;
  const target = new Date();
  target.setDate(target.getDate() + 3);
  const targetDay = target.getDate();
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reminders WHERE day_of_month = $1',
      [targetDay]
    );
    for (const row of rows) {
      const text = `🔔 Через 3 дня спишется: ${row.expense_name} — ${Number(row.amount).toLocaleString('ru-RU')} ₽`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: row.user_id, text }),
      }).catch(console.error);
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
}

cron.schedule('0 9 * * *', sendReminders);

app.use(express.static(path.join(__dirname, 'dist')));

initDb().then(() => {
  app.listen(PORT, () => console.log(`Listening on :${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  app.listen(PORT, () => console.log(`Listening on :${PORT} (no DB)`));
});
