import { useEffect } from 'react';

export function useSwipeDown(ref, onClose) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY = 0;
    const onStart = e => { startY = e.touches[0].clientY; };
    const onEnd = e => {
      if (e.changedTouches[0].clientY - startY > 80) onClose();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [ref, onClose]);
}
