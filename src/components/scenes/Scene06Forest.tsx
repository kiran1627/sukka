'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types';

/* ── 3D Fireflies ── */
function Fireflies({ count = 40 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      spd[i * 3] = (Math.random() - 0.5) * 0.01;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += Math.sin(t * 0.5 + i) * speeds[i * 3];
      posArr[i * 3 + 1] += Math.cos(t * 0.3 + i * 0.7) * speeds[i * 3 + 1];
      posArr[i * 3 + 2] += Math.sin(t * 0.4 + i * 1.3) * speeds[i * 3 + 2];
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#fbbf24"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── 3D Forest Floor ── */
function ForestFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#0a1a0a" roughness={1} metalness={0} />
    </mesh>
  );
}

/* ── 3D Trees ── */
function Trees() {
  const trees = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 14,
      z: -2 - Math.random() * 6,
      height: 2 + Math.random() * 3,
      scale: 0.8 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <group key={i} position={[tree.x, -1, tree.z]}>
          {/* Trunk */}
          <mesh position={[0, tree.height / 2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, tree.height, 8]} />
            <meshStandardMaterial color="#2d1810" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, tree.height, 0]} scale={tree.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#0d3320"
              roughness={0.8}
              emissive="#0d3320"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Forest Canvas ── */
function ForestCanvas() {
  const { isMobile } = useDevice();
  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }} gl={{ antialias: true }} dpr={isMobile ? [1, 1] : [1, 1.5]}>
      <fog attach="fog" args={['#050505', 5, 18]} />
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 5, 3]} intensity={0.4} color="#fbbf24" />
      <pointLight position={[-4, 3, -2]} intensity={0.2} color="#86efac" />
      <pointLight position={[4, 2, -1]} intensity={0.2} color="#a78bfa" />

      <Trees />
      <ForestFloor />
      <Fireflies />

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
      </EffectComposer>
    </Canvas>
  );
}

/* ── Main Scene ── */
export default function Scene06Forest() {
  const { isMobile } = useDevice();
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showContinue, setShowContinue] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<(HTMLDivElement | null)[]>([]);

  const memories = content?.photos || [];

  useEffect(() => {
    if (content?.music?.scenes?.forest) {
      playTrack(content.music.scenes.forest, 3000);
    }
    
    // Start sequence after a 2-second initial delay
    const startTimer = setTimeout(() => {
      setCurrentIndex(0);
    }, 2000);
    
    return () => clearTimeout(startTimer);
  }, [content, playTrack]);

  // Automated Slideshow Sequence
  useEffect(() => {
    if (currentIndex < 0) return;
    if (currentIndex >= memories.length) {
      // Sequence finished
      setShowContinue(true);
      return;
    }

    const currentEl = photosRef.current[currentIndex];
    if (currentEl) {
      // Cinematic Intro (Fade in, un-blur, scale down)
      gsap.fromTo(
        currentEl,
        { opacity: 0, scale: 1.2, filter: 'blur(20px)', rotation: -2 },
        { opacity: 1, scale: 1.05, filter: 'blur(0px)', rotation: 0, duration: 2.5, ease: 'power2.out' }
      );
      
      // Continuous drift while active
      gsap.to(currentEl, {
        scale: 1,
        x: 20,
        y: -10,
        duration: 5,
        ease: 'none'
      });
      
      // Fade out right before the next one starts
      if (currentIndex < memories.length - 1) {
        gsap.to(currentEl, {
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1.5,
          delay: 3.5, // Total active time = 5s
          ease: 'power2.inOut'
        });
      }
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, memories.length]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505] overflow-hidden">
      {/* 3D Forest Background */}
      <div className="absolute inset-0">
        <ForestCanvas />
      </div>

      {/* Overlay gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 40%, rgba(5,5,5,0.4) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Title */}
      <div className="absolute inset-x-0 top-12 z-10 text-center">
        <h2 className="font-script text-3xl text-amber-300/60 md:text-4xl drop-shadow-lg">
          Memory Garden
        </h2>
      </div>

      {/* Cinematic Photos */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        {memories.map((memory, i) => (
          <div
            key={memory.id}
            ref={(el) => { photosRef.current[i] = el; }}
            className="absolute max-w-lg w-[85%] sm:w-full opacity-0 will-change-transform"
            style={{ display: currentIndex >= i && currentIndex <= i + 1 ? 'block' : 'none' }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={memory.src}
                alt={memory.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                <h3 className="font-serif text-xl sm:text-2xl text-white/90 drop-shadow-xl">{memory.caption}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next button (Appears at end) */}
      <div 
        className={cn(
          "absolute right-6 bottom-24 md:bottom-20 z-40 transition-all duration-1000",
          showContinue ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <button
          onClick={() => {
            if (containerRef.current) gsap.to(containerRef.current, {
              opacity: 0,
              duration: 1.5,
              ease: 'power2.inOut',
              onComplete: nextScene,
            });
          }}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs tracking-widest text-white/40 uppercase backdrop-blur-xl transition-all active:scale-95"
          aria-label="Continue to next scene"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
