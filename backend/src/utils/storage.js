export const STORAGE_KEY = 'wastes_v1';

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
