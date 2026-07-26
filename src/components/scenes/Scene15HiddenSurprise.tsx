'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import GlassCard from '@/components/ui/GlassCard';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

type SurpriseSection =
  | 'gallery'
  | 'reasons'
  | 'dreams'
  | 'bucketList'
  | 'personalNote'
  | 'coupons'
  | 'promiseWall'
  | 'loveLetter';

const sections: { id: SurpriseSection; title: string; icon: string; description: string }[] = [
  { id: 'gallery', title: 'Secret Gallery', icon: '🖼️', description: 'Our private collection' },
  { id: 'reasons', title: 'Reasons I Love You', icon: '❤️', description: '10 reasons and counting' },
  { id: 'dreams', title: 'Future Dreams', icon: '✨', description: 'What we\'ll do together' },
  { id: 'bucketList', title: 'Bucket List', icon: '📋', description: 'Adventures that await' },
  { id: 'personalNote', title: 'A Special Note', icon: '💌', description: 'A message from my heart' },
  { id: 'coupons', title: 'Love Coupons', icon: '🎟️', description: 'Redeemable for love' },
  { id: 'promiseWall', title: 'Promise Wall', icon: '🤝', description: 'My promises to you' },
  { id: 'loveLetter', title: 'Love Letter', icon: '📜', description: 'My letter to you' },
];

/* ── Section Modals ── */
function SectionModal({
  section,
  onClose,
}: {
  section: SurpriseSection;
  onClose: () => void;
}) {
  const content = useAuroraStore((s) => s.content);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const handleClose = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, y: 20, scale: 0.95, duration: 0.3,
        onComplete: onClose,
      });
    }
  };

  const renderContent = () => {
    switch (section) {
      case 'gallery':
        return (
          <div className="grid grid-cols-2 gap-3">
            {(content?.gallery || []).map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.caption}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="font-serif text-xs text-white/90 drop-shadow-md">
                    {item.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'reasons':
        return (
          <div className="flex flex-col gap-3">
            {(content?.reasonsILoveYou || []).map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-xs text-amber-400">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-white/60">{reason}</p>
              </div>
            ))}
          </div>
        );

      case 'dreams':
        return (
          <div className="flex flex-col gap-3">
            {(content?.futureDreams || []).map((dream, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <span className="text-lg">🌟</span>
                <p className="text-sm text-white/60">{dream}</p>
              </div>
            ))}
          </div>
        );

      case 'bucketList':
        return (
          <div className="flex flex-col gap-2">
            {(content?.bucketList || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <span className={cn('text-lg', item.done ? 'opacity-50' : '')}>
                  {item.done ? '✅' : '⬜'}
                </span>
                <p className={cn('text-sm', item.done ? 'text-white/30 line-through' : 'text-white/60')}>
                  {item.item}
                </p>
              </div>
            ))}
          </div>
        );

      case 'personalNote':
        return (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="font-serif text-sm leading-relaxed text-white/80 whitespace-pre-line">
                {content?.personalNote || "My dearest,\n\nEvery day with you is a gift..."}
              </p>
            </div>
          </div>
        );

      case 'loveLetter':
        return (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="font-serif text-sm leading-relaxed text-white/80 whitespace-pre-line">
                {content?.loveLetter || "My Dearest,\n\nOn this special day..."}
              </p>
            </div>
          </div>
        );

      case 'coupons':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(content?.loveCoupons || []).map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-xl border border-dashed border-amber-400/20 bg-amber-400/[0.03] p-4 text-center"
              >
                <p className="text-2xl">{
                  coupon.icon === 'coffee' ? '☕' :
                  coupon.icon === 'film' ? '🎬' :
                  coupon.icon === 'heart' ? '❤️' :
                  coupon.icon === 'compass' ? '🧭' :
                  coupon.icon === 'sparkles' ? '✨' : '🎟️'
                }</p>
                <p className="mt-2 font-serif text-sm font-medium text-amber-300">{coupon.title}</p>
                <p className="mt-1 text-xs text-white/40">{coupon.description}</p>
              </div>
            ))}
          </div>
        );

      case 'promiseWall':
        return (
          <div className="flex flex-col gap-3">
            {(content?.promiseWall || []).map((promise, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
              >
                <p className="font-serif text-sm leading-relaxed text-white/60 italic">
                  &ldquo;{promise}&rdquo;
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const sectionMeta = sections.find((s) => s.id === section);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="no-scrollbar mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={sectionMeta?.title}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/5 bg-black/90 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sectionMeta?.icon}</span>
              <h3 className="font-serif text-xl text-white/80">{sectionMeta?.title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:text-white/70"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}

export default function Scene15HiddenSurprise() {
  const content = useAuroraStore((s) => s.content);
  const { playTrack } = useAudio();
  const haptics = useHaptics();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SurpriseSection | null>(null);

  useEffect(() => {
    if (content?.music?.scenes?.hiddenSurprise) {
      playTrack(content.music.scenes.hiddenSurprise, 3000);
    }
  }, [content, playTrack]);

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.6,
          delay: 0.5,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-screen bg-[#050505] py-16"
    >
      <ParticleBackground preset="aurora" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.04) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        {/* Title */}
        <div className="mb-12 text-center">
          <h2 className="font-script text-4xl text-amber-300/70 md:text-5xl">
            Hidden Surprises
          </h2>
          <p className="mt-3 text-sm text-white/30">
            A collection of secret treasures, just for you
          </p>
          <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <GlassCard
              key={section.id}
              tilt
              glow
              onClick={() => {
                haptics.trigger('light');
                setActiveSection(section.id);
              }}
              className="group cursor-pointer p-6 transition-all duration-500 hover:border-amber-400/20"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl transition-all duration-500 group-hover:bg-amber-400/10 group-hover:shadow-[0_0_20px_rgba(212,168,83,0.1)]">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-white/70 transition-colors group-hover:text-amber-300">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/30">{section.description}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Final farewell */}
        <div className="mt-16 text-center">
          <p className="font-serif text-lg text-white/20 italic">
            Thank you for being born ❤️
          </p>
        </div>
      </div>

      {/* Section modal */}
      {activeSection && (
        <SectionModal
          section={activeSection}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
}
