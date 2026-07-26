'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import { cn, formatDate } from '@/lib/utils';
import ParticleBackground from '@/components/ui/ParticleBackground';
import type { TimelineEvent } from '@/types';

const iconMap: Record<string, string> = {
  heart: '❤️',
  phone: '📱',
  gift: '🎁',
  map: '🗺️',
  camera: '📸',
  cake: '🎂',
  star: '⭐',
  music: '🎵',
  ring: '💍',
  home: '🏠',
};

function TimelineItem({
  event,
  index,
  isExpanded,
  onToggle,
}: {
  event: TimelineEvent;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, x: isLeft ? -60 : 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3 + index * 0.2,
          ease: 'power3.out',
        }
      );
    }
  }, [index, isLeft]);

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        gsap.fromTo(
          contentRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    }
  }, [isExpanded]);

  return (
    <div
      ref={itemRef}
      className={cn(
        'group relative flex items-start gap-6 opacity-0',
        'md:w-1/2',
        isLeft ? 'md:pr-12 md:self-start md:text-right' : 'md:pl-12 md:self-end'
      )}
    >
      {/* Connector dot */}
      <div
        className={cn(
          'absolute top-2 hidden h-4 w-4 rounded-full border-2 border-amber-400/50 bg-aurora-bg-deep md:block',
          'shadow-[0_0_12px_rgba(212,168,83,0.3)]',
          isLeft ? '-right-2 md:-right-8' : '-left-2 md:-left-8'
        )}
      />

      <button
        onClick={onToggle}
        className={cn(
          'flex w-full flex-col gap-3 rounded-2xl border border-white/5 p-5 text-left transition-all duration-500',
          'bg-white/[0.02] backdrop-blur-xl',
          'hover:border-amber-400/20 hover:bg-white/[0.04]',
          isExpanded && 'border-amber-400/20 bg-white/[0.04]'
        )}
        aria-expanded={isExpanded}
      >
        <div className={cn('flex items-center gap-3', isLeft && 'md:flex-row-reverse')}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
            {iconMap[event.icon] || '✨'}
          </span>
          <div className={cn('flex flex-col', isLeft && 'md:items-end')}>
            <span className="font-serif text-base font-medium text-white/80">
              {event.title}
            </span>
          </div>
        </div>

        {/* Expanded content */}
        <div ref={contentRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
          <div className="border-t border-white/5 pt-4">
            <p className="text-sm leading-relaxed text-white/50">{event.description}</p>
            {event.image && (
              <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-white/5">
                <div className="flex h-full items-center justify-center text-white/10">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export default function Scene09Timeline() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = content?.timeline || [];

  useEffect(() => {
    if (content?.music?.scenes?.timeline) {
      playTrack(content.music.scenes.timeline, 3000);
    }
  }, [content, playTrack]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-screen bg-[#050505] py-20"
    >
      <ParticleBackground preset="stars" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.05) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Title */}
        <div className="mb-16 text-center">
          <h2 className="font-script text-4xl text-amber-300/70 md:text-5xl">
            Our Journey
          </h2>
          <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <p className="mt-4 text-sm text-white/30">Click any moment to relive it</p>
        </div>

        {/* Timeline line */}
        <div className="relative flex flex-col gap-8">
          {/* Center line (desktop) */}
          <div className="absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent md:block" />

          {events.map((event, i) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={i}
              isExpanded={expandedId === event.id}
              onToggle={() =>
                setExpandedId(expandedId === event.id ? null : event.id)
              }
            />
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => {
              if (containerRef.current) gsap.to(containerRef.current, {
                opacity: 0,
                duration: 1,
                ease: 'power2.inOut',
                onComplete: nextScene,
              });
            }}
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm tracking-widest text-white/50 uppercase backdrop-blur-xl transition-all duration-500 hover:border-amber-400/30 hover:text-amber-300"
          >
            Continue
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
