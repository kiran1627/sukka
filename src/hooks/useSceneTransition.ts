'use client';

import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';

export function useSceneTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setTransitioning } = useAuroraStore();

  const transitionOut = useCallback(
    (onComplete?: () => void) => {
      if (!containerRef.current) return;
      setTransitioning(true);
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          onComplete?.();
        },
      });
    },
    [setTransitioning]
  );

  const transitionIn = useCallback(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 1.02 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          setTransitioning(false);
        },
      }
    );
  }, [setTransitioning]);

  return { containerRef, transitionIn, transitionOut };
}
