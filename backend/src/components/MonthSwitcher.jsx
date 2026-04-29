import { today, capitalize } from '../utils/dates';

export default function MonthSwitcher({ offset, onChange }) {
  const t = today();
  const sel = new Date(t.getFullYear(), t.getMonth() + offset, 1);
  const sameYear = sel.getFullYear() === t.getFullYear();
  const label = offset === 0 ? 'Текущий' : capitalize(sel.toLocaleDateString('ru-RU', {
    month: 'long',
    ...(!sameYear ? { year: 'numeric' } : {}),
  }));
  return (
    <div className="month-switcher">
      <button className="month-arrow" onClick={() => onChange(offset - 1)}>‹</button>
      <div className="month-label">{label}</div>
      <button className="month-arrow" onClick={() => onChange(offset + 1)}>›</button>
    </div>
  );
}
