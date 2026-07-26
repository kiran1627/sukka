'use client';

import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.changedTouches[0].screenX,
        y: e.changedTouches[0].screenY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const dx = touchEndX - touchStartRef.current.x;
      const dy = touchEndY - touchStartRef.current.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > threshold) {
        // Horizontal swipe
        if (absDx > absDy) {
          if (dx > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (dx < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        } 
        // Vertical swipe
        else {
          if (dy > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (dy < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold]);
}
