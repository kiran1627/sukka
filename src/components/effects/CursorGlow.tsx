'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) return;

    const glow = glowRef.current;
    const trail = trailRef.current;
    if (!glow || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.transform = `translate(${mouseX - 16}px, ${mouseY - 16}px)`;
      glow.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      glow.style.opacity = '0';
      trail.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      glow.style.opacity = '1';
      trail.style.opacity = '1';
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;
      trail.style.transform = `translate(${trailX - 100}px, ${trailY - 100}px)`;
      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    const frame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-300"
        aria-hidden="true"
      >
        <div className="h-8 w-8 rounded-full bg-amber-300/30 blur-sm" />
      </div>
      <div
        ref={trailRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] opacity-0 transition-opacity duration-500"
        aria-hidden="true"
      >
        <div
          className="h-[200px] w-[200px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
}
