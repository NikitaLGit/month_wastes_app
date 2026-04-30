// Переключатель периода «Неделя / Месяц» в шапке.
// Props: value ('week'|'month'), onChange(value).
// При смене периода App сбрасывает monthOffset → 0.
export default function PeriodSwitcher({ value, onChange }) {
  return (
    <div className="period-switcher">
      {['week', 'month'].map(p => (
        <button
          key={p}
          className={'period-btn' + (value === p ? ' active' : '')}
          onClick={() => onChange(p)}
        >
          {p === 'week' ? 'Неделя' : 'Месяц'}
        </button>
      ))}
    </div>
  );
}
