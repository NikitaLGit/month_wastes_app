import { CATEGORIES } from '../utils/categories';

export default function CategoryFilter({ active, onChange, availableIds }) {
  const cats = CATEGORIES.filter(c => availableIds.includes(c.id));
  return (
    <div className="category-filter">
      <button
        className={'filter-pill' + (!active ? ' filter-pill--active-all' : '')}
        onClick={() => onChange(null)}
      >
        Все
      </button>
      {cats.map(cat => (
        <button
          key={cat.id}
          className={'filter-pill' + (active === cat.id ? ' filter-pill--active' : '')}
          style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
          onClick={() => onChange(active === cat.id ? null : cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
