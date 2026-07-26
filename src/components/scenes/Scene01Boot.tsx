'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';

export default function Scene01Boot() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);
  const [started, setStarted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const messages = content?.bootMessages || [
    'Searching Memories...',
    'Decrypting Love...',
    'Preparing Magic...',
    'Loading Surprise...',
    'Welcome...',
  ];

  const handleStart = () => {
    setShowPrompt(false);
    setStarted(true);
    if (content?.music?.scenes?.boot) {
      playTrack(content.music.scenes.boot, 3000);
    }
  };

  useEffect(() => {
    if (!started) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1.5,
          delay: 0.5,
          ease: 'power2.inOut',
          onComplete: nextScene,
        });
      },
    });

    linesRef.current.forEach((line, i) => {
      if (!line) return;
      tl.fromTo(
        line,
        { opacity: 0, y: 10, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power2.out',
        },
        i * 1.2
      );

      // Add progress bar animation
      const progressBar = line.querySelector('.boot-progress');
      if (progressBar) {
        tl.fromTo(
          progressBar,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power1.inOut' },
          i * 1.2 + 0.3
        );
      }

      if (i < messages.length - 1) {
        tl.to(
          line,
          { opacity: 0.3, duration: 0.3, ease: 'power1.in' },
          (i + 1) * 1.2
        );
      }
    });
  }, [started, messages, nextScene]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-screen flex-col items-center justify-center bg-[#050505]"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,168,83,0.03) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Click to begin prompt */}
      {showPrompt && (
        <button
          onClick={handleStart}
          className="group flex flex-col items-center gap-6 focus:outline-none"
          aria-label="Begin experience"
        >
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-400/5" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-amber-400/30 group-hover:bg-white/10">
              <svg
                className="ml-1 h-8 w-8 text-white/50 transition-colors duration-500 group-hover:text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          <span className="text-shimmer text-sm tracking-[0.4em] uppercase">
            Begin Experience
          </span>
        </button>
      )}

      {/* Boot sequence */}
      {started && (
        <div className="flex w-full max-w-md flex-col gap-4 px-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="flex flex-col gap-2 opacity-0"
            >
              <div className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(212,168,83,0.6)]" />
                <span className="font-mono text-sm tracking-wider text-white/70">
                  {msg}
                </span>
              </div>
              {i < messages.length - 1 && (
                <div className="ml-4 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="boot-progress h-full origin-left bg-gradient-to-r from-amber-400/60 to-amber-400/20"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scan line effect */}
      {started && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
