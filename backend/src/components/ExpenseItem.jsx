// Карточка одной траты в списке «Предстоящие».
// Props: entry (объект с nextDate, name, amount, category, endDate),
//        onClick(entry) — открывает DetailSheet,
//        hasReminder (bool) — показывает 🔔.
import { daysUntil, dateCls, dateLabel, fmtAmount, monthsLeft } from '../utils/dates';
import { getCategoryById } from '../utils/categories';

export default function ExpenseItem({ entry, onClick, hasReminder }) {
  // Текст «· через N дн.» — только если платёж в ближайшие 30 дней
  const days = daysUntil(entry.nextDate);
  const daysText = days > 0 && days <= 30 ? ` · через ${days} дн.` : '';
  const cat = entry.category ? getCategoryById(entry.category) : null;

  return (
    <div className="expense-card" onClick={() => onClick(entry)}>
      {/* Левая колонка: название, бейдж категории, дата следующего платежа */}
      <div className="expense-info">
        <div className="expense-name">{entry.name}</div>
        {cat && (
          <span
            className="expense-category"
            style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
          >
            {cat.label}
          </span>
        )}
        <div className={'expense-date ' + dateCls(entry.nextDate)}>
          {dateLabel(entry.nextDate)}{daysText}
        </div>
      </div>

      {/* Правая колонка: сумма, остаток месяцев (если есть endDate), иконки */}
      <div className="expense-right">
        <div className="expense-amount">{fmtAmount(entry.amount)} ₽</div>
        {entry.endDate && (
          <div className="expense-tag">↻ {monthsLeft(entry.endDate)} мес.</div>
        )}
        <div className="expense-icons">
          {hasReminder && <span className="expense-icon">🔔</span>}
        </div>
      </div>
    </div>
  );
}
