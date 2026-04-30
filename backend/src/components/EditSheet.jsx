// Шторка редактирования существующей траты.
// Props: expense (объект), hasReminder (bool), onEdit(updated, hasReminder), onClose().
// При сабмите App обновляет запись и синхронизирует состояние ремайндера.
import { useState, useRef, useEffect } from 'react';
import { parseDate, toDateStr } from '../utils/dates';
import { tg } from '../utils/storage';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import Toggle from './Toggle';
import CategoryPicker from './CategoryPicker';

export default function EditSheet({ expense, hasReminder: initialReminder, onEdit, onClose }) {
  // Состояние формы инициализируется из переданного expense
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category ?? null);
  const [date, setDate] = useState(expense.date);
  const [hasReminder, setHasReminder] = useState(initialReminder);
  const [hasEnd, setHasEnd] = useState(!!expense.endDate);

  // Вычисляем число месяцев из разницы дат (первый + последний включительно)
  const [months, setMonths] = useState(() => {
    if (!expense.endDate) return '';
    const s = parseDate(expense.date);
    const e = parseDate(expense.endDate);
    return String((e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1);
  });
  const sheetRef = useRef(null);

  // Поднимаем шторку над клавиатурой на мобильных
  useKeyboardOffset(sheetRef);

  // Кнопка «Назад» Telegram закрывает шторку
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
    // endDate = дата первого платежа + (months - 1) месяцев
    let endDate = null;
    if (hasEnd && Number(months) > 0) {
      const base = parseDate(date);
      endDate = toDateStr(new Date(base.getFullYear(), base.getMonth() + Number(months) - 1, base.getDate()));
    }
    onEdit({ ...expense, name: name.trim(), amount: Number(amount), category: category ?? 'other', date, endDate }, hasReminder);
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-header">
          <div className="sheet-title">Редактировать</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          {/* Основные поля */}
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
          </div>

          {/* Тогл напоминания: сноска пропадает при включении */}
          <div className={'form-field form-field--toggle' + (hasReminder ? ' form-field--toggle-on' : '')}>
            <div className="form-label-row">
              <div className="form-label-col">
                <label className="form-label">Включить напоминание</label>
                {!hasReminder && <div className="form-hint">По-умолчанию стоит за 3 дня до</div>}
              </div>
              <Toggle checked={hasReminder} onChange={setHasReminder} />
            </div>
          </div>

          {/* Тогл срока: при включении появляется поле ввода числа платежей */}
          <div className={'form-field form-field--toggle' + (hasEnd ? ' form-field--toggle-on' : '')}>
            <div className="form-label-row">
              <div className="form-label-col">
                <label className="form-label">Задать число платежей</label>
                {!hasEnd && <div className="form-hint">Если не включать трата будет бессрочной</div>}
              </div>
              <Toggle checked={hasEnd} onChange={setHasEnd} />
            </div>
            {hasEnd && (
              <input
                className="form-input"
                style={{ marginTop: 12 }}
                type="text"
                inputMode="numeric"
                placeholder="Количество платежей"
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
