// Справочник категорий трат. Зависимостей нет.
// CATEGORIES — массив из 8 категорий с id, русским названием, цветом текста и фоном бейджа.
// getCategoryById(id) — поиск по id, возвращает объект категории или null.
// Используется в: CategoryPicker (выбор в форме), CategoryFilter (фильтр списка),
//   ExpenseItem и DetailSheet (отображение бейджа).

export const CATEGORIES = [
  { id: 'housing',       label: 'Жильё',       color: '#5856d6', bg: 'rgba(88,86,214,0.15)'  },
  { id: 'loans',         label: 'Кредиты',     color: '#ff3b30', bg: 'rgba(255,59,48,0.15)'  },
  { id: 'subscriptions', label: 'Подписки',    color: '#ff9500', bg: 'rgba(255,149,0,0.15)'  },
  { id: 'car',           label: 'Транспорт',   color: '#007aff', bg: 'rgba(0,122,255,0.15)'  },
  { id: 'health',        label: 'Здоровье',    color: '#34c759', bg: 'rgba(52,199,89,0.15)'  },
  { id: 'communications',label: 'Связь',       color: '#5ac8fa', bg: 'rgba(90,200,250,0.15)' },
  { id: 'education',     label: 'Образование', color: '#af52de', bg: 'rgba(175,82,222,0.15)' },
  { id: 'other',         label: 'Прочее',      color: '#8e8e93', bg: 'rgba(142,142,147,0.15)'},
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? null;
}
