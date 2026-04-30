import { useState, useEffect } from 'react';
import { tg } from '../utils/storage';

export default function SettingsSheet({ reminderDays, theme, onSave, onClose }) {
  const [days, setDays] = useState(reminderDays);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    const w = tg();
    if (!w) return;
    w.BackButton.show();
    w.BackButton.onClick(onClose);
    return () => { w.BackButton.hide(); w.BackButton.offClick(onClose); };
  }, [onClose]);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="sheet-title">Настройки</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-row-label">Когда напоминать</span>
              <div className="stepper stepper--inline">
                <button
                  className="stepper-btn"
                  onClick={() => setDays(d => Math.max(1, d - 1))}
                  disabled={days <= 1}
                >−</button>
                <span className="stepper-value stepper-value--inline">{days} дн.</span>
                <button
                  className="stepper-btn"
                  onClick={() => setDays(d => Math.min(14, d + 1))}
                  disabled={days >= 14}
                >+</button>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-row-label">Тема</span>
              <div className="theme-switcher">
                <button
                  className={'theme-btn' + (localTheme === 'dark' ? ' theme-btn--active' : '')}
                  onClick={() => setLocalTheme('dark')}
                >Тёмная</button>
                <button
                  className={'theme-btn' + (localTheme === 'light' ? ' theme-btn--active' : '')}
                  onClick={() => setLocalTheme('light')}
                >Светлая</button>
              </div>
            </div>
          </div>
          <button
            className="form-submit"
            style={{ marginTop: 20 }}
            onClick={() => onSave({ reminderDays: days, theme: localTheme })}
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
