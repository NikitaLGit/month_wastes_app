// API-клиент для напоминаний. Зависимости: storage.js (tg() → initData).
// Все запросы идут на /wastes/api/* → nginx стрипает /wastes → Express /api/*.
// Авторизация: initData из Telegram WebApp — сервер проверяет HMAC-SHA256.
//
// fetchReminderIds() — GET /reminders — список expense_id с активными ремайндерами.
// toggleReminder(expense, enabled, days) — POST /reminder — включить/выключить ремайндер;
//   при включении catch-up: если платёж через ≤ days дней — уведомление сразу.
// saveReminderSettings(days) — POST /settings — обновляет days_before для всех ремайндеров пользователя.

import { tg } from './storage';

const BASE = '/wastes/api';

function initData() {
  return tg()?.initData ?? null;
}

export async function saveReminderSettings(daysBeforePayment) {
  const data = initData();
  if (!data) return;
  fetch(`${BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: data, daysBeforePayment }),
  }).catch(console.error);
}

// Returns array of ids on success, null on failure (network/auth error).
export async function fetchReminderIds() {
  const data = initData();
  if (!data) return null;
  try {
    const res = await fetch(`${BASE}/reminders`, {
      headers: { 'x-init-data': data },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.ids ?? [];
  } catch {
    return null;
  }
}

export async function toggleReminder(expense, enabled, daysBeforePayment = 3) {
  const data = initData();
  if (!data) return false;
  const dayOfMonth = parseInt(expense.date.split('-')[2], 10);
  try {
    const res = await fetch(`${BASE}/reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: data,
        expenseId: expense.id,
        expenseName: expense.name,
        amount: expense.amount,
        dayOfMonth,
        enabled,
        daysBeforePayment,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
