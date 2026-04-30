// Сортировка списка трат. Props: value ('date'|'amount'|'name'), onChange(value).
// Кнопка синяя если сортировка не дефолтная (не 'date').
import { useState, useRef, useEffect } from 'react';

const OPTIONS = [
  { id: 'date',   label: 'По дате' },
  { id: 'amount', label: 'По сумме' },
  { id: 'name',   label: 'По названию' },
];

// Короткие подписи для кнопки-пилюли
const SHORT = { date: 'Дата', amount: 'Сумма', name: 'А-Я' };

export default function SortPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Закрываем дропдаун при тапе вне компонента
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const isActive = value !== 'date';

  return (
    <div className="sort-picker" ref={ref}>
      {/* Кнопка-пилюля; синяя если выбрана не дефолтная сортировка */}
      <button
        className={'filter-pill sort-pill' + (isActive ? ' filter-pill--active-all' : '')}
        onClick={() => setOpen(o => !o)}
      >
        ↕ {SHORT[value]}
      </button>

      {/* Дропдаун с тремя опциями; галочка у текущей */}
      {open && (
        <div className="sort-dropdown">
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              className="sort-option"
              onClick={() => { onChange(opt.id); setOpen(false); }}
            >
              {opt.label}
              {value === opt.id && <span className="sort-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
