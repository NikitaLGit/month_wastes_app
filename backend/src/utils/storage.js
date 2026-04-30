// Хранилище данных. Зависимости: Telegram WebApp SDK (window.Telegram.WebApp).
// STORAGE_KEY ('wastes_v1') — список трат (JSON-массив расходов).
// SETTINGS_KEY ('wastes_settings_v1') — настройки { reminderDays, theme }.
// tg() — геттер объекта Telegram.WebApp; возвращает undefined вне Telegram.
// cloudGet / cloudSet — обёртка над Telegram CloudStorage с fallback на localStorage.
//   CloudStorage привязана к пользователю и боту — данные синхронизируются между устройствами.

export const STORAGE_KEY = 'wastes_v1';
export const SETTINGS_KEY = 'wastes_settings_v1';

export const tg = () => window.Telegram?.WebApp;

export function cloudGet(key) {
  return new Promise(resolve => {
    const cs = tg()?.CloudStorage;
    if (!cs) {
      try { resolve(localStorage.getItem(key) || ''); } catch { resolve(''); }
      return;
    }
    cs.getItem(key, (err, val) => resolve(err ? '' : (val || '')));
  });
}

export function cloudSet(key, value) {
  const cs = tg()?.CloudStorage;
  if (!cs) { try { localStorage.setItem(key, value); } catch {} return; }
  cs.setItem(key, value, () => {});
}
