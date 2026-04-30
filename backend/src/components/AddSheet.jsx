import { useState, useRef, useEffect } from 'react';
import { today, toDateStr, parseDate, genId } from '../utils/dates';
import { tg } from '../utils/storage';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import Toggle from './Toggle';
import CategoryPicker from './CategoryPicker';

export default function AddSheet({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(() => toDateStr(today()));
  const [hasReminder, setHasReminder] = useState(false);
  const [hasEnd, setHasEnd] = useState(false);
  const [months, setMonths] = useState('');
  const sheetRef = useRef(null);

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
    onAdd({ id: genId(), name: name.trim(), amount: Number(amount), category: category ?? 'other', date, endDate }, hasReminder);
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-header">
          <div className="sheet-title">Новая трата</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <div className="form-field">
            <label className="form-label">Название</label>
            <input
              className="form-input"
              placeholder="Аренда, кредит, подписка …"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field">
            <label className="form-label">Категория</label>
            <CategoryPicker value={category} onChange={setCategory} />
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
            <label className="form-label">Дата платежа</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            {/* <div className="form-hint">Далее списывается в тот же день каждый месяц</div> */}
          </div>
          <div className={'form-field form-field--toggle' + (hasReminder ? ' form-field--toggle-on' : '')}>
            <div className="form-label-row">
              <label className="form-label">Включить напоминание</label>
              <Toggle checked={hasReminder} onChange={setHasReminder} />
            </div>
            <div className="form-hint">По-умолчанию стоит за 3 дня до</div>
          </div>
          <div className={'form-field form-field--toggle' + (hasEnd ? ' form-field--toggle-on' : '')}>
            <div className="form-label-row">
              <label className="form-label">Задать число платежей</label>
              <Toggle checked={hasEnd} onChange={setHasEnd} />
            </div>
            <div className="form-hint">Если не включать трата будет бессрочной</div>
            {hasEnd && (
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="Количество платежей"
                value={months}
                onChange={e => setMonths(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            )}
          </div>
          <button className="form-submit" disabled={!valid} onClick={handleSubmit}>
            Добавить
          </button>
        </div>
      </div>
    </>
  );
}
