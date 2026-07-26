'use client';

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const trigger = useCallback((pattern: HapticPattern | number | number[]) => {
    if (typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      if (typeof pattern === 'number' || Array.isArray(pattern)) {
        navigator.vibrate(pattern);
        return;
      }

      // Pre-defined patterns based on iOS guidelines
      switch (pattern) {
        case 'light':
          navigator.vibrate(10); // Very short, subtle pop
          break;
        case 'medium':
          navigator.vibrate(20); // Standard pop
          break;
        case 'heavy':
          navigator.vibrate(30); // Stronger pop
          break;
        case 'success':
          navigator.vibrate([10, 60, 20]); // Double pop
          break;
        case 'warning':
          navigator.vibrate([20, 40, 20, 40, 20]); // Triple pop
          break;
        case 'error':
          navigator.vibrate([30, 40, 30, 40, 40]); // Heavy triple
          break;
      }
    } catch (e) {
      // Ignore vibration errors (e.g. user hasn't interacted with page yet)
    }
  }, []);

  return { trigger };
}
