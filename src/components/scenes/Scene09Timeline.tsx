'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function Scene09Timeline() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // Get the first photo from gallery or photos
  const leftImage = content?.gallery?.[0]?.src || content?.photos?.[0]?.src || '';
  const noteText = content?.personalNote || "Happy Birthday!";

  useEffect(() => {
    if (content?.music?.scenes?.timeline) {
      playTrack(content.music.scenes.timeline, 3000);
    }
  }, [content, playTrack]);

  useEffect(() => {
    if (bookRef.current) {
      gsap.fromTo(
        bookRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
      );
    }
  }, []);

  const openBook = () => {
    setIsOpen(true);
  };

  const handleNext = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-screen overflow-hidden bg-[#050505] flex items-center justify-center perspective-[2000px]">
      <ParticleBackground preset="stars" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.1) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-8">
        
        <div className="mb-12 text-center transition-opacity duration-1000" style={{ opacity: isOpen ? 0 : 1 }}>
          <h2 className="font-script text-4xl text-amber-300/70 md:text-5xl">
            A Note For You
          </h2>
          <p className="mt-4 text-sm text-white/30">Click to open</p>
        </div>

        {/* Book Container */}
        <div 
          ref={bookRef}
          className={`relative mx-auto w-full max-w-[800px] aspect-[2/1.2] md:aspect-[2/1] transition-transform duration-1000 transform-style-3d cursor-pointer ${isOpen ? '' : 'hover:scale-105'}`}
          onClick={!isOpen ? openBook : undefined}
          style={{
            transformStyle: 'preserve-3d',
            transform: isOpen ? 'rotateX(5deg)' : 'rotateX(15deg) rotateY(-20deg)',
          }}
        >
          {/* Back Cover */}
          <div className="absolute inset-0 rounded-l-2xl rounded-r-xl bg-[#610000] shadow-2xl border border-[#3b0000]"></div>
          
          {/* Pages Container */}
          <div className="absolute inset-[10px] md:inset-[15px] flex rounded-lg overflow-hidden bg-[#fdf5e6] shadow-inner">
            
            {/* Left Page (Note) */}
            <div className="w-1/2 h-full relative border-r border-[#d4b483]/30 p-6 md:p-12 flex flex-col justify-center text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
              <p className="font-serif text-[#4a2e0e] text-sm md:text-lg leading-relaxed whitespace-pre-line z-10 italic relative">
                <span className="absolute -top-6 -left-4 text-4xl text-[#d4b483]/40">"</span>
                {noteText}
                <span className="absolute -bottom-6 -right-4 text-4xl text-[#d4b483]/40">"</span>
              </p>
              <p className="mt-8 font-script text-2xl md:text-3xl text-[#8b5a2b] z-10">
                by me Kiran
              </p>
            </div>

            {/* Right Page (Image) */}
            <div className="w-1/2 h-full relative flex flex-col p-4 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-l from-black/5 to-transparent"></div>
              {leftImage && (
                <div className="relative h-full w-full rounded-md overflow-hidden shadow-md border border-[#d4b483]/50 p-2 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={leftImage} alt="Memory" className="w-full h-full object-cover rounded-sm" />
                </div>
              )}
            </div>
            
          </div>

          {/* Book Cover (Front) - Animates Open */}
          <div 
            className="absolute top-0 left-1/2 w-1/2 h-full bg-[#8b0000] border-l border-[#5c0000] rounded-r-xl shadow-2xl origin-left transition-transform duration-1500 ease-in-out flex items-center justify-center"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front Cover Front Face */}
            <div 
              className="absolute inset-0 backface-hidden rounded-r-xl bg-gradient-to-r from-[#610000] to-[#8b0000] border-2 border-[#5c0000] flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full border-2 border-dashed border-[#d4b483]/20 rounded-lg flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">📖</span>
                <h3 className="font-serif text-2xl text-[#d4b483] font-bold text-center">Our Story</h3>
              </div>
            </div>
            {/* Front Cover Back Face */}
            <div 
              className="absolute inset-0 backface-hidden rounded-l-xl bg-[#fdf5e6] shadow-inner border-r border-[#d4b483]/30 flex flex-col p-8"
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
              }}
            >
               <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent"></div>
            </div>
          </div>
          
        </div>

        {/* Continue button */}
        {isOpen && (
          <div className="mt-16 text-center animate-[fade-in-up_1s_ease-out_1s_both]">
            <button
              onClick={handleNext}
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm tracking-widest text-white/50 uppercase backdrop-blur-xl transition-all duration-500 hover:border-amber-400/30 hover:text-amber-300"
            >
              Continue
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
