import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../utils/categories';

export default function CategoryFilter({ active, onChange, availableIds }) {
  const cats = CATEGORIES.filter(c => availableIds.includes(c.id));
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeCat = active ? CATEGORIES.find(c => c.id === active) : null;

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const select = id => { onChange(id); setOpen(false); };

  return (
    <div className="cat-filter-picker" ref={ref}>
      <button
        className={'cat-filter-btn filter-pill' + (active ? ' filter-pill--active-all' : '')}
        onClick={() => setOpen(o => !o)}
      >
        {activeCat ? activeCat.label : 'Категории'}
        <span className="cat-filter-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="cat-filter-mosaic">
          <button
            className={'filter-pill' + (!active ? ' filter-pill--active-all' : '')}
            onClick={() => select(null)}
          >
            Все
          </button>
          {cats.map(cat => (
            <button
              key={cat.id}
              className={'filter-pill' + (active === cat.id ? ' filter-pill--active' : '')}
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              onClick={() => select(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
