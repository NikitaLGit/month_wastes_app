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
