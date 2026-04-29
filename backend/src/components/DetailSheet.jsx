import { useRef, useEffect } from 'react';
import { fmtAmount, fmtDate, monthsLeft } from '../utils/dates';
import { tg } from '../utils/storage';
import { getCategoryById } from '../utils/categories';

export default function DetailSheet({ entry, hasReminder, onDelete, onEdit, onToggleReminder, onClose }) {
  const sheetRef = useRef(null);
  const cat = entry.category ? getCategoryById(entry.category) : null;

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
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="sheet-title">{entry.name}</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <div className="detail-amount">
            {fmtAmount(entry.amount)}<span className="detail-currency"> ₽</span>
          </div>
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
            <div className="detail-row">
              <span className="detail-row-label">Первый платёж</span>
              <span className="detail-row-value">{fmtDate(entry.date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row-label">Последний платёж</span>
              <span className="detail-row-value">{entry.endDate ? fmtDate(entry.endDate) : 'Бессрочно'}</span>
            </div>
            {entry.endDate && (
              <div className="detail-row">
                <span className="detail-row-label">Осталось платежей</span>
                <span className="detail-row-value">{monthsLeft(entry.endDate)} мес.</span>
              </div>
            )}
          </div>
          <div className="detail-actions">
            <button
              className={'btn-bell' + (hasReminder ? ' btn-bell--on' : '')}
              onClick={onToggleReminder}
              aria-label="Напоминание"
            >
              {hasReminder ? '🔔' : '🔕'}
            </button>
            <button className="btn-edit" onClick={() => { onEdit(entry); onClose(); }}>Редактировать</button>
          </div>
          <button className="btn-delete" onClick={handleDelete}>Удалить трату</button>
        </div>
      </div>
    </>
  );
}
