'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { cn, randomBetween } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

export default function Scene12Question() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const setQuestionAnswered = useAuroraStore((s) => s.setQuestionAnswered);
  const { playTrack } = useAudio();
  const haptics = useHaptics();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [noAttempts, setNoAttempts] = useState(0);
  const [noButtonText, setNoButtonText] = useState(
    content?.question?.noText || 'NO 🙈'
  );
  const [answered, setAnswered] = useState(false);
  const [noClicked, setNoClicked] = useState(false);

  const questionConfig = content?.question;
  const noMessages = questionConfig?.noMessages || [
    'Are you sure? 🥺',
    'Think again ❤️',
    'Please? 😊',
    'Just teasing 😄',
  ];

  useEffect(() => {
    if (content?.music?.scenes?.question) {
      playTrack(content.music.scenes.question, 2000);
    }
  }, [content, playTrack]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const handleYes = () => {
    setAnswered(true);
    setQuestionAnswered(true);
    haptics.trigger('light');

    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'back.out(3)',
      onComplete: () => {
        gsap.to(cardRef.current, { scale: 1, duration: 0.2 });
      },
    });

    setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 2500);
  };

  const handleNoHover = useCallback(() => {
    if (noAttempts >= 4 || !noButtonRef.current) return;

    const newAttempts = noAttempts + 1;
    setNoAttempts(newAttempts);

    if (newAttempts <= noMessages.length) {
      setNoButtonText(noMessages[newAttempts - 1]);
    }

    // Move button to random position
    const parent = noButtonRef.current.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const btnRect = noButtonRef.current.getBoundingClientRect();
      const maxX = parentRect.width - btnRect.width - 20;
      const maxY = 60;

      gsap.to(noButtonRef.current, {
        x: randomBetween(-maxX / 2, maxX / 2),
        y: randomBetween(-maxY, maxY),
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }
  }, [noAttempts, noMessages]);

  const handleNoClick = () => {
    setNoClicked(true);
    setQuestionAnswered(true);

    // Show the cute message, then continue anyway
    setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 3000);
  };

  return (
    <div ref={containerRef} className="relative flex h-screen w-screen items-center justify-center bg-[#050505]">
      <ParticleBackground preset="sparkles" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249,168,212,0.05) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      {/* Intro text */}
      {!answered && !noClicked && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 text-center">
          <p className="font-serif text-lg text-white/30 md:text-xl animate-[fade-in-up_1s_ease-out]">
            I have one more question...
          </p>
        </div>
      )}

      {/* Question card */}
      <div ref={cardRef} className="relative z-10 mx-4 max-w-md opacity-0">
        <div
          className={cn(
            'rounded-3xl border border-white/10 p-8 backdrop-blur-xl md:p-10',
            'bg-gradient-to-b from-white/[0.04] to-white/[0.01]',
            'shadow-[0_0_80px_rgba(249,168,212,0.05)]'
          )}
          style={{
            boxShadow: answered
              ? '0 0 100px rgba(212,168,83,0.15), 0 0 200px rgba(212,168,83,0.05)'
              : '0 0 80px rgba(249,168,212,0.05)',
          }}
        >
          {!answered && !noClicked ? (
            <>
              <p className="text-center font-serif text-2xl leading-relaxed text-white/80 md:text-3xl">
                {questionConfig?.text || 'Will you always be my favourite person? ❤️'}
              </p>

              <div className="relative mt-10 flex items-center justify-center gap-4">
                {/* YES button */}
                <button
                  onClick={handleYes}
                  className="group rounded-2xl border border-amber-400/30 bg-amber-400/10 px-8 py-4 font-serif text-lg text-amber-300 transition-all duration-500 hover:border-amber-400/50 hover:bg-amber-400/20 hover:shadow-[0_0_30px_rgba(212,168,83,0.2)]"
                >
                  {questionConfig?.yesText || 'YES ❤️'}
                </button>

                {/* NO button */}
                <button
                  ref={noButtonRef}
                  onClick={noAttempts >= 4 ? handleNoClick : undefined}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                  className={cn(
                    'rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-serif text-lg text-white/50 transition-all duration-300',
                    noAttempts < 4 && 'hover:border-white/20'
                  )}
                >
                  {noButtonText}
                </button>
              </div>
            </>
          ) : answered ? (
            <div className="flex flex-col items-center gap-4 text-center animate-[scale-in_0.6s_ease-out]">
              <span className="text-6xl">🥰</span>
              <p className="text-gradient-gold font-script text-3xl md:text-4xl">
                I knew it!
              </p>
              <p className="text-sm text-white/40">
                You just made me the happiest person alive ✨
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center animate-[scale-in_0.6s_ease-out]">
              <span className="text-4xl">💛</span>
              <p className="font-serif text-xl leading-relaxed whitespace-pre-line text-white/60">
                {questionConfig?.noClickMessage ||
                  "That's okay ❤️\nI still hope this birthday makes you smile."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
