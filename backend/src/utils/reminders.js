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

export async function fetchReminderIds() {
  const data = initData();
  if (!data) return [];
  try {
    const res = await fetch(`${BASE}/reminders`, {
      headers: { 'x-init-data': data },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.ids ?? [];
  } catch {
    return [];
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
