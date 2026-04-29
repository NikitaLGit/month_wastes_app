export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function fmtAmount(n) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export function fmtDate(s) {
  return parseDate(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function daysUntil(s) {
  return Math.round((parseDate(s) - today()) / 86400000);
}

export function dateLabel(s) {
  const d = daysUntil(s);
  if (d === 0) return 'Сегодня';
  if (d === 1) return 'Завтра';
  return fmtDate(s);
}

export function dateCls(s) {
  const d = daysUntil(s);
  if (d <= 0) return 'today';
  if (d <= 3) return 'soon';
  return '';
}

export function monthsLeft(endDateStr) {
  const end = parseDate(endDateStr);
  const now = today();
  return Math.max(0, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function clampToMonth(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

export function getEntries(expenses, from, to) {
  const result = [];

  for (const e of expenses) {
    const start = parseDate(e.date);
    const baseDay = start.getDate();
    const end = e.endDate ? parseDate(e.endDate) : new Date(9999, 11, 31);
    const rangeFrom = start > from ? start : from;

    let occ = clampToMonth(rangeFrom.getFullYear(), rangeFrom.getMonth(), baseDay);
    if (occ < rangeFrom) occ = clampToMonth(rangeFrom.getFullYear(), rangeFrom.getMonth() + 1, baseDay);

    while (occ <= to && occ <= end) {
      result.push({ ...e, nextDate: toDateStr(occ) });
      occ = clampToMonth(occ.getFullYear(), occ.getMonth() + 1, baseDay);
    }
  }

  return result.sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}
