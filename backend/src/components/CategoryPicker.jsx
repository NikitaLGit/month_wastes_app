// Дропдаун выбора категории в формах AddSheet / EditSheet.
// Props: value (id категории или null), onChange(id).
import { useState, useRef, useEffect } from 'react';
import { CATEGORIES, getCategoryById } from '../utils/categories';

export default function CategoryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = value ? getCategoryById(value) : null;

  // Закрываем дропдаун при клике/тапе вне компонента
  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  return (
    <div className="cat-dropdown" ref={ref}>
      {/* Кнопка-триггер: показывает цветную точку + название выбранной категории */}
      <button className="cat-dropdown-trigger" onClick={() => setOpen(o => !o)}>
        {selected ? (
          <>
            <span className="cat-dot" style={{ background: selected.color }} />
            <span>{selected.label}</span>
          </>
        ) : (
          <span className="cat-placeholder">Выбрать</span>
        )}
        <span className="cat-dropdown-arrow">{open ? '▴' : '▾'}</span>
      </button>

      {/* Список всех категорий; галочка у активной */}
      {open && (
        <div className="cat-dropdown-list">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className="cat-dropdown-item"
              onClick={() => { onChange(cat.id); setOpen(false); }}
            >
              <span className="cat-dot" style={{ background: cat.color }} />
              <span>{cat.label}</span>
              {value === cat.id && <span className="cat-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
