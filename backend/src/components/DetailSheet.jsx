// Шторка просмотра деталей траты.
// Props: entry, hasReminder (bool), onDelete(id), onEdit(entry),
//        onToggleReminder(), onClose().
import { useRef, useEffect } from 'react';
import { fmtAmount, fmtDate, monthsLeft } from '../utils/dates';
import { tg } from '../utils/storage';
import { getCategoryById } from '../utils/categories';
import Toggle from './Toggle';

export default function DetailSheet({ entry, hasReminder, onDelete, onEdit, onToggleReminder, onClose }) {
  const sheetRef = useRef(null);
  const cat = entry.category ? getCategoryById(entry.category) : null;

  // Год в «Последний платёж» — только если endDate в другом году
  const showEndYear = entry.endDate
    && new Date(entry.endDate.split('-')[0], 0).getFullYear() !== new Date().getFullYear();

  // Кнопка «Назад» Telegram закрывает шторку
  useEffect(() => {
    const w = tg();
    if (!w) return;
    w.BackButton.show();
    w.BackButton.onClick(onClose);
    return () => { w.BackButton.hide(); w.BackButton.offClick(onClose); };
  }, [onClose]);

  const handleDelete = () => {
    tg()?.HapticFeedback?.notificationOccurred('warning');
    onDelete(entry.id);
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-header">
          <div className="sheet-title">{entry.name}</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          {/* Крупная сумма */}
          <div className="detail-amount">
            {fmtAmount(entry.amount)}<span className="detail-currency"> ₽</span>
          </div>

          {/* Строки с деталями */}
          <div className="detail-rows">
            {cat && (
              <div className="detail-row">
                <span className="detail-row-label">Категория</span>
                <span
                  className="expense-category"
                  style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
                >
                  {cat.label}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-row-label">Следующее списание</span>
              <span className="detail-row-value">{fmtDate(entry.nextDate)}</span>
            </div>
            {/* Первый платёж — год всегда */}
            <div className="detail-row">
              <span className="detail-row-label">Первый платёж</span>
              <span className="detail-row-value">{fmtDate(entry.date, true)}</span>
            </div>
            {/* Последний платёж — год только если другой */}
            <div className="detail-row">
              <span className="detail-row-label">Последний платёж</span>
              <span className="detail-row-value">{entry.endDate ? fmtDate(entry.endDate, showEndYear) : 'Бессрочно'}</span>
            </div>
            {entry.endDate && (
              <div className="detail-row">
                <span className="detail-row-label">Осталось платежей</span>
                <span className="detail-row-value">{monthsLeft(entry.endDate)} мес.</span>
              </div>
            )}
          </div>

          {/* Действия: редактировать */}
          <div className="detail-actions">
            <button className="btn-edit" onClick={() => { onEdit(entry); onClose(); }}>Редактировать</button>
          </div>

          {/* Действия: напоминание + удалить */}
          <div className="detail-actions">
            <button
              className={'btn-bell' + (hasReminder ? ' btn-bell--on' : '')}
              onClick={onToggleReminder}
            >
              {hasReminder ? '🔔' : '🔕'}
            </button>
            <button className="btn-delete" onClick={handleDelete}>Удалить трату</button>
          </div>
        </div>
      </div>
    </>
  );
}
