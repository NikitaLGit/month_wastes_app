import { daysUntil, dateCls, dateLabel, fmtAmount, monthsLeft } from '../utils/dates';

export default function ExpenseItem({ entry, onClick }) {
  const days = daysUntil(entry.nextDate);
  const daysText = days > 0 && days <= 30 ? ` · через ${days} дн.` : '';
  return (
    <div className="expense-card" onClick={() => onClick(entry)}>
      <div className="expense-info">
        <div className="expense-name">{entry.name}</div>
        <div className={'expense-date ' + dateCls(entry.nextDate)}>
          {dateLabel(entry.nextDate)}{daysText}
        </div>
      </div>
      <div className="expense-right">
        <div className="expense-amount">{fmtAmount(entry.amount)} ₽</div>
        {entry.endDate && (
          <div className="expense-tag">↻ {monthsLeft(entry.endDate)} мес.</div>
        )}
      </div>
    </div>
  );
}
