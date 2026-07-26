'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function Scene05Password() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const setPasswordUnlocked = useAuroraStore((s) => s.setPasswordUnlocked);
  const { playTrack, playSfx } = useAudio();

  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const expectedPassword = (content?.password || 'I Love You').toLowerCase().trim();

  useEffect(() => {
    if (content?.music?.scenes?.password) {
      playTrack(content.music.scenes.password, 2000);
    }
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [content, playTrack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.toLowerCase().trim() === expectedPassword) {
      // Correct password
      setUnlocked(true);
      setPasswordUnlocked(true);

      try { playSfx(content?.music?.effects?.unlock || ''); } catch {}

      // Unlock animation
      if (lockRef.current) {
        gsap.to(lockRef.current, {
          scale: 1.2,
          duration: 0.3,
          ease: 'back.out(3)',
          onComplete: () => {
            gsap.to(lockRef.current, {
              rotationY: 180,
              scale: 0,
              opacity: 0,
              duration: 1,
              ease: 'power3.inOut',
            });
          },
        });
      }

      // Golden reveal
      if (containerRef.current) gsap.to(containerRef.current, {
        backgroundColor: 'rgba(212, 168, 83, 0.05)',
        duration: 1,
      });

      // Transition after animation
      setTimeout(() => {
        if (containerRef.current) gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1.5,
          ease: 'power2.inOut',
          onComplete: nextScene,
        });
      }, 2500);
    } else {
      // Wrong password
      setError(true);
      setErrorMessage("Hmm... that's not the magic phrase ❤️");

      // Shake animation
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.08,
            repeat: 5,
            yoyo: true,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.set(formRef.current, { x: 0 });
            },
          }
        );
      }

      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-screen items-center justify-center bg-[#050505]"
    >
      <ParticleBackground preset="sparkles" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(167,139,250,0.05) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Lock icon */}
        <div ref={lockRef} className="flex flex-col items-center gap-4">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl"
            style={{
              boxShadow: unlocked
                ? '0 0 60px rgba(212,168,83,0.3)'
                : '0 0 40px rgba(167,139,250,0.15)',
            }}
          >
            <span className="text-4xl">{unlocked ? '🔓' : '🔒'}</span>
          </div>

          <h2 className="text-gradient-aurora font-serif text-2xl font-semibold md:text-3xl">
            Secret Love Portal
          </h2>

          <p className="max-w-sm text-center text-sm leading-relaxed text-white/40">
            &ldquo;Only someone who knows my heart can enter.&rdquo;
          </p>
        </div>

        {/* Password form */}
        {!unlocked && (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm flex-col gap-4"
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the magic phrase..."
                className={`w-full rounded-xl border bg-white/5 px-5 py-4 text-center text-white/90 placeholder-white/20 backdrop-blur-xl transition-all duration-300 focus:outline-none ${
                  error
                    ? 'border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'border-white/10 focus:border-amber-400/30 focus:shadow-[0_0_30px_rgba(212,168,83,0.1)]'
                }`}
                aria-label="Enter password"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 py-4 font-serif text-sm tracking-widest text-white/70 uppercase backdrop-blur-xl transition-all duration-500 hover:border-amber-400/30 hover:text-amber-300"
            >
              <span className="relative z-10">Enter ✨</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-400/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>

            {/* Error message */}
            {error && (
              <p className="text-center text-sm text-red-400/80 animate-[fade-in-up_0.3s_ease-out]">
                {errorMessage}
              </p>
            )}
          </form>
        )}

        {/* Success message */}
        {unlocked && (
          <div className="flex flex-col items-center gap-4 animate-[fade-in-up_0.5s_ease-out]">
            <p className="text-gradient-gold font-script text-3xl">
              Welcome, my love ✨
            </p>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
