import { tg } from './storage';

const BASE = '/api';

function initData() {
  return tg()?.initData ?? null;
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

export async function toggleReminder(expense, enabled) {
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
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
