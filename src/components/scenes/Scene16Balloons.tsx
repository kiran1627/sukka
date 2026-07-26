'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { randomBetween } from '@/lib/utils';
import { useAudio } from '@/hooks/useAudio';

export default function Scene16Balloons() {
  const content = useAuroraStore((s) => s.content);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const balloonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optionally play a special grand finale track if available
    if (content?.music?.scenes?.celebration) {
      playTrack(content.music.scenes.celebration, 2000);
    }
  }, [content, playTrack]);

  useEffect(() => {
    if (!balloonsRef.current) return;
    
    const balloonColors = ['#F9A8D4', '#FBBF24', '#60A5FA', '#34D399', '#A78BFA', '#F87171'];
    
    // Create balloons dynamically
    for (let i = 0; i < 30; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'absolute rounded-full opacity-90 shadow-xl border border-white/20 flex justify-center';
      
      const size = randomBetween(40, 100);
      const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
      
      balloon.style.width = `${size}px`;
      balloon.style.height = `${size * 1.2}px`;
      balloon.style.backgroundColor = color;
      balloon.style.left = `${randomBetween(-10, 110)}%`;
      balloon.style.bottom = `-${size * 2}px`;
      
      // Balloon string
      const string = document.createElement('div');
      string.className = 'absolute top-full w-px h-16 bg-white/30';
      balloon.appendChild(string);
      
      // Balloon knot
      const knot = document.createElement('div');
      knot.className = 'absolute top-full -mt-1 w-2 h-2 rounded-full';
      knot.style.backgroundColor = color;
      balloon.appendChild(knot);
      
      balloonsRef.current.appendChild(balloon);
      
      // Animate balloon
      gsap.to(balloon, {
        y: -window.innerHeight - 300,
        x: `+=${randomBetween(-100, 100)}`,
        rotation: randomBetween(-15, 15),
        duration: randomBetween(10, 20),
        ease: 'power1.inOut',
        delay: randomBetween(0, 5),
        repeat: -1,
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-[#050505] flex items-center justify-center">
      <ParticleBackground preset="aurora" />

      {/* Balloons Container */}
      <div ref={balloonsRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Main Text */}
      <div className="relative z-20 flex flex-col items-center gap-6 text-center animate-[scale-in_2s_ease-out]">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          Happy Birthday
        </h1>
        <h2 className="font-script text-6xl md:text-8xl text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
          {content?.recipientName || 'Sukanya'}
        </h2>
        
        <p className="mt-8 text-lg text-white/40 tracking-widest uppercase animate-pulse">
          To infinity and beyond
        </p>
      </div>
      
    </div>
  );
}
