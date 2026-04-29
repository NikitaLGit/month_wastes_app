import { useEffect } from 'react';
import { tg } from '../utils/storage';

export function useKeyboardOffset(ref) {
  useEffect(() => {
    const w = tg();
    if (!w?.onEvent) return;
    const update = () => {
      if (!ref.current) return;
      const kbHeight = Math.max(0, w.viewportStableHeight - w.viewportHeight);
      ref.current.style.bottom = kbHeight > 0 ? kbHeight + 'px' : '';
    };
    w.onEvent('viewportChanged', update);
    return () => w.offEvent('viewportChanged', update);
  }, [ref]);
}
