import { useState, useRef, useEffect } from 'react';
import { parseDate, toDateStr } from '../utils/dates';
import { tg } from '../utils/storage';
import { useSwipeDown } from '../hooks/useSwipeDown';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import Toggle from './Toggle';

export default function EditSheet({ expense, onEdit, onClose }) {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [date, setDate] = useState(expense.date);
  const [hasEnd, setHasEnd] = useState(!!expense.endDate);
  const [months, setMonths] = useState(() => {
    if (!expense.endDate) return '';
    const s = parseDate(expense.date);
    const e = parseDate(expense.endDate);
    return String((e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1);
  });
  const sheetRef = useRef(null);

  useSwipeDown(sheetRef, onClose);
  useKeyboardOffset(sheetRef);

  useEffect(() => {
    const w = tg();
    if (!w) return;
    w.BackButton.show();
    w.BackButton.onClick(onClose);
    return () => { w.BackButton.hide(); w.BackButton.offClick(onClose); };
  }, [onClose]);

  const valid = name.trim() && Number(amount) > 0 && date && (!hasEnd || Number(months) > 0);

  const handleSubmit = () => {
    if (!valid) return;
    let endDate = null;
    if (hasEnd && Number(months) > 0) {
      const base = parseDate(date);
      endDate = toDateStr(new Date(base.getFullYear(), base.getMonth() + Number(months) - 1, base.getDate()));
    }
    onEdit({ ...expense, name: name.trim(), amount: Number(amount), date, endDate });
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="sheet-title">Редактировать</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <div className="form-field">
            <label className="form-label">Название</label>
            <input
              className="form-input"
              placeholder="Аренда, кредит, подписка…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Сумма, ₽</label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Дата первого платежа</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <div className="form-hint">Далее списывается в тот же день каждый месяц</div>
          </div>
          <div className="form-field">
            <div className="form-label-row">
              <label className="form-label">Ограниченное число платежей</label>
              <Toggle checked={hasEnd} onChange={setHasEnd} />
            </div>
            {hasEnd && (
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="Количество месяцев"
                value={months}
                onChange={e => setMonths(e.target.value.replace(/\D/g, ''))}
              />
            )}
          </div>
          <button className="form-submit" disabled={!valid} onClick={handleSubmit}>
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
