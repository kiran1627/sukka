'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import { useHaptics } from '@/hooks/useHaptics';

/* ── Firework Canvas ── */
function FireworkCanvas({ texts, triggerHaptic }: { texts: string[], triggerHaptic: (pattern: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const textIndexRef = useRef(0);
  const frameRef = useRef(0);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    gravity: number;
    trail: { x: number; y: number }[];
  }

  const colors = useMemo(
    () => ['#D4A853', '#F5D88E', '#60A5FA', '#A78BFA', '#F9A8D4', '#34D399', '#FBBF24', '#FFFFFF'],
    []
  );

  const createFirework = useCallback(
    (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2,
          gravity: 0.02 + Math.random() * 0.02,
          trail: [],
        });
      }
    },
    [colors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let launchTimer = 0;
    const launchInterval = 80;
    // We cannot easily call hooks inside useEffect unless we pass the trigger function,
    // so we'll pass the haptics trigger down as a prop. Wait, no. We can just use the hook in the component.

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      launchTimer++;
      if (launchTimer % launchInterval === 0) {
        const x = canvas.width * 0.2 + Math.random() * canvas.width * 0.6;
        const y = canvas.height * 0.1 + Math.random() * canvas.height * 0.3;
        createFirework(x, y, 60 + Math.floor(Math.random() * 40));
        triggerHaptic('medium');
      }

      // Display text with fireworks periodically
      if (launchTimer % (launchInterval * 3) === 0 && texts.length > 0) {
        const text = texts[textIndexRef.current % texts.length];
        textIndexRef.current++;

        ctx.save();
        ctx.font = 'bold 48px serif';
        ctx.fillStyle = '#D4A853';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#D4A853';
        ctx.shadowBlur = 30;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.restore();
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.life -= 1 / p.maxLife;

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.life * 0.3;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();

        // Glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        return p.life > 0;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createFirework, texts]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}

/* ── Confetti ── */
function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const confettiColors = ['#D4A853', '#F5D88E', '#60A5FA', '#A78BFA', '#F9A8D4', '#34D399'];

    const createPiece = () => {
      const piece = document.createElement('div');
      const size = 6 + Math.random() * 8;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

      piece.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: ${color};
        left: ${Math.random() * 100}%;
        top: -10px;
        opacity: 0.8;
        border-radius: 1px;
        pointer-events: none;
      `;

      container.appendChild(piece);

      gsap.to(piece, {
        y: window.innerHeight + 100,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720,
        duration: 3 + Math.random() * 4,
        ease: 'none',
        onComplete: () => piece.remove(),
      });
    };

    const interval = setInterval(createPiece, 50);
    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true" />;
}

export default function Scene13Celebration() {
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const setCelebrationTriggered = useAuroraStore((s) => s.setCelebrationTriggered);
  const { playTrack } = useAudio();
  const haptics = useHaptics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false);

  const recipientName = content?.recipientName || 'My Love';
  const celebrationTexts = (content?.celebrationTexts || [
    'Happy Birthday',
    '{recipientName}',
    'I Love You',
    'Forever',
  ]).map((t) => t.replace('{recipientName}', recipientName));

  useEffect(() => {
    setCelebrationTriggered(true);
    if (content?.music?.scenes?.celebration) {
      playTrack(content.music.scenes.celebration, 2000);
    }

    const showTimer = setTimeout(() => setShowText(true), 2000);

    return () => clearTimeout(showTimer);
  }, [content, playTrack, setCelebrationTriggered]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      <FireworkCanvas texts={celebrationTexts} triggerHaptic={haptics.trigger} />
      <Confetti />

      {/* Central text */}
      {showText && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
          <h1
            className="text-gradient-gold font-serif text-5xl font-bold md:text-7xl"
            style={{ animation: 'scale-in 1s ease-out' }}
          >
            Happy Birthday!
          </h1>
          <p
            className="font-script text-3xl text-white/50 md:text-4xl"
            style={{ animation: 'fade-in-up 1s ease-out 0.5s both' }}
          >
            {recipientName}
          </p>
          <p
            className="text-2xl text-amber-300/80 md:text-3xl"
            style={{ animation: 'fade-in-up 1s ease-out 1s both' }}
          >
            My love of my life
          </p>
        </div>
      )}

      {/* Continue button */}
      <div className="absolute inset-x-0 bottom-8 z-30 text-center">
        <button
          onClick={() => {
            if (containerRef.current) gsap.to(containerRef.current, {
              opacity: 0,
              duration: 1.5,
              ease: 'power2.inOut',
              onComplete: nextScene,
            });
          }}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm tracking-widest text-white/40 uppercase backdrop-blur-xl transition-all hover:border-amber-400/30 hover:text-amber-300"
        >
          Continue ✨
        </button>
      </div>
    </div>
  );
}
