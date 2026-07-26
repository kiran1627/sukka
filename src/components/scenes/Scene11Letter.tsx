'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function Scene11Letter() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const [phase, setPhase] = useState<'envelope' | 'letter'>('envelope');

  const letterText = content?.loveLetter || '';

  useEffect(() => {
    if (content?.music?.scenes?.letter) {
      playTrack(content.music.scenes.letter, 3000);
    }
  }, [content, playTrack]);

  const openEnvelope = () => {
    if (phase !== 'envelope') return;

    const tl = gsap.timeline();

    // Envelope flap opens
    const flap = envelopeRef.current?.querySelector('.envelope-flap');
    if (flap) {
      tl.to(flap, {
        rotateX: -180,
        duration: 0.8,
        ease: 'power2.inOut',
      });
    }

    // Letter slides out
    if (envelopeRef.current) {
      tl.to(envelopeRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      });
    }

    tl.call(() => setPhase('letter'));
  };

  useEffect(() => {
    if (phase === 'letter' && letterRef.current) {
      gsap.fromTo(
        letterRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
      );
    }
  }, [phase]);

  // Typewriter effect for letter text
  useEffect(() => {
    if (phase !== 'letter' || !textRef.current) return;

    const text = letterText;
    const el = textRef.current;
    el.textContent = '';
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        // Auto-scroll
        el.parentElement?.scrollTo({ top: el.parentElement.scrollHeight, behavior: 'smooth' });
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, letterText]);

  return (
    <div ref={containerRef} className="relative flex h-screen w-screen items-center justify-center bg-[#050505]">
      <ParticleBackground preset="sparkles" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,168,83,0.04) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Envelope */}
      {phase === 'envelope' && (
        <button
          ref={envelopeRef}
          onClick={openEnvelope}
          className="group relative z-10 flex flex-col items-center gap-6 focus:outline-none"
          aria-label="Open the envelope"
        >
          <div className="relative" style={{ perspective: '800px' }}>
            {/* Envelope body */}
            <div className="relative h-40 w-64 rounded-lg border border-amber-400/20 bg-gradient-to-b from-amber-900/30 to-amber-950/40 shadow-[0_0_40px_rgba(212,168,83,0.1)] transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(212,168,83,0.2)] md:h-48 md:w-80">
              {/* Wax seal */}
              <div className="absolute bottom-4 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-red-900 shadow-lg">
                <span className="text-lg">❤️</span>
              </div>
            </div>

            {/* Envelope flap */}
            <div
              className="envelope-flap absolute -top-0.5 left-0 h-20 w-full origin-top md:h-24"
              style={{
                background: 'linear-gradient(to bottom, rgba(180,130,60,0.3), rgba(120,80,30,0.2))',
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                borderTop: '1px solid rgba(212,168,83,0.2)',
                transformStyle: 'preserve-3d',
              }}
            />
          </div>

          <span className="text-sm tracking-widest text-white/30 uppercase animate-[breathe_3s_ease-in-out_infinite]">
            Click to open
          </span>
        </button>
      )}

      {/* Letter */}
      {phase === 'letter' && (
        <div
          ref={letterRef}
          className="relative z-10 mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-amber-950/20 to-black/40 opacity-0 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="border-b border-white/5 p-6 text-center">
            <h2 className="font-script text-3xl text-amber-300/70 md:text-4xl">
              A Letter For You
            </h2>
            <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          </div>

          {/* Letter body */}
          <div
            className="no-scrollbar max-h-[50vh] overflow-y-auto p-6 md:p-8"
          >
            <p
              ref={textRef}
              className="font-serif text-base leading-relaxed whitespace-pre-line text-white/60 md:text-lg"
            />
            <span className="inline-block h-5 w-0.5 bg-amber-400/50 animate-[blink_0.8s_step-end_infinite]" />
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-6 text-center">
            <button
              onClick={() => {
                if (containerRef.current) gsap.to(containerRef.current, {
                  opacity: 0,
                  duration: 1.5,
                  ease: 'power2.inOut',
                  onComplete: nextScene,
                });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm tracking-widest text-white/40 uppercase transition-all hover:border-amber-400/30 hover:text-amber-300"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (containerRef.current) gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            onComplete: nextScene,
          });
        }}
        className="absolute right-6 bottom-6 z-10 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-widest text-white/30 uppercase backdrop-blur-xl transition-all hover:border-white/20 hover:text-white/60"
        aria-label="Skip to next scene"
      >
        Skip →
      </button>
    </div>
  );
}
