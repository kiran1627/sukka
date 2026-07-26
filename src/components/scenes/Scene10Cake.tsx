'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useHaptics } from '@/hooks/useHaptics';

/* ── Cake ── */
function Cake() {
  const cakeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cakeRef.current) {
      cakeRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <group ref={cakeRef} position={[0, -0.5, 0]}>
      {/* Bottom tier */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.8, 32]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Bottom frosting edge */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[1.5, 0.06, 8, 32]} />
        <meshStandardMaterial color="#fff5e6" roughness={0.4} emissive="#fef3c7" emissiveIntensity={0.1} />
      </mesh>

      {/* Middle tier */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.7, 32]} />
        <meshStandardMaterial color="#fce7f3" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <torusGeometry args={[1.1, 0.05, 8, 32]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.4} emissive="#f9a8d4" emissiveIntensity={0.1} />
      </mesh>

      {/* Top tier */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.5, 32]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <torusGeometry args={[0.7, 0.04, 8, 32]} />
        <meshStandardMaterial color="#fde68a" roughness={0.4} emissive="#fbbf24" emissiveIntensity={0.2} />
      </mesh>

      {/* Plate */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[2, 2, 0.05, 32]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Candles ── */
function Candles({ lit, count = 5 }: { lit: boolean; count?: number }) {
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.35;
      return [Math.cos(angle) * r, 1.85, Math.sin(angle) * r] as [number, number, number];
    });
  }, [count]);

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Candle stick */}
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>

          {/* Flame */}
          {lit && (
            <group position={[0, 0.2, 0]}>
              <mesh>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
              <pointLight
                intensity={0.3}
                distance={2}
                color="#fbbf24"
                position={[0, 0.05, 0]}
              />
            </group>
          )}

          {/* Smoke when blown out */}
          {!lit && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#9ca3af" transparent opacity={0.3} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/* ── Room Lighting ── */
function RoomLighting({ candlesLit }: { candlesLit: boolean }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mainRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    if (!candlesLit) {
      if (ambientRef.current) {
        gsap.to(ambientRef.current, { intensity: 0.02, duration: 1.5 });
      }
      if (mainRef.current) {
        gsap.to(mainRef.current, { intensity: 0.05, duration: 1.5 });
      }
    }
  }, [candlesLit]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <directionalLight ref={mainRef} position={[3, 5, 5]} intensity={0.4} color="#fef3c7" />
      <pointLight position={[-3, 3, 2]} intensity={0.15} color="#a78bfa" />
    </>
  );
}

export default function Scene10Cake() {
  const { isMobile } = useDevice();
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const setCandlesBlown = useAuroraStore((s) => s.setCandlesBlown);
  const { playTrack, playSfx } = useAudio();
  const haptics = useHaptics();
  const containerRef = useRef<HTMLDivElement>(null);

  const [candlesLit, setCandlesLit] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(true);

  const handleBlow = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setCandlesBlown(true);
    setShowMessage(true);
    haptics.trigger('light');

    try { playSfx(content?.music?.effects?.blow || ''); } catch {}
    setTimeout(() => {
      try { playSfx(content?.music?.effects?.applause || ''); } catch {}
    }, 1500);

    // Auto advance
    setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 5000);
  };

  const { isSupported, startListening } = useMicrophone({
    threshold: 130,
    onBlow: handleBlow,
  });

  useEffect(() => {
    if (content?.music?.scenes?.cake) {
      playTrack(content.music.scenes.cake, 2000);
    }
  }, [content, playTrack]);

  const handleMicPermission = async () => {
    setShowMicPrompt(false);
    if (isSupported) {
      const started = await startListening();
      if (!started) {
        // Fallback to click
      }
    }
  };

  const handleSkipMic = () => {
    setShowMicPrompt(false);
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 2, 4], fov: 45 }}
        gl={{ antialias: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <RoomLighting candlesLit={candlesLit} />
        <Cake />
        <Candles lit={candlesLit} />
        <EffectComposer>
          <Bloom intensity={candlesLit ? 2 : 0.5} luminanceThreshold={0.3} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>

      {/* Microphone permission prompt */}
      {showMicPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl border border-white/10 bg-black/80 p-8 text-center backdrop-blur-xl">
            <span className="text-4xl">🎤</span>
            <h3 className="mt-4 font-serif text-xl text-white/80">
              Blow out the candles!
            </h3>
            <p className="mt-2 text-sm text-white/40">
              Allow microphone access to blow out the candles, or click them instead.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {isSupported && (
                <button
                  onClick={handleMicPermission}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/10 py-3 text-sm text-amber-300 transition-all hover:bg-amber-400/20"
                >
                  Allow Microphone 🎤
                </button>
              )}
              <button
                onClick={handleSkipMic}
                className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/50 transition-all hover:text-white/70"
              >
                I&apos;ll click instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-to-blow fallback */}
      {!showMicPrompt && candlesLit && (
        <div className="absolute inset-x-0 bottom-24 z-10 text-center">
          <button
            onClick={handleBlow}
            className="group inline-flex flex-col items-center gap-2"
            aria-label="Blow out candles"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 animate-[glow-pulse_3s_ease-in-out_infinite]">
              <span className="text-2xl">💨</span>
            </div>
            <span className="text-xs tracking-widest text-white/30 uppercase">
              {isSupported ? 'Blow or click' : 'Click to blow'}
            </span>
          </button>
        </div>
      )}

      {/* Success message */}
      {showMessage && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-[scale-in_0.8s_ease-out]">
            <p className="text-gradient-gold font-script text-4xl md:text-5xl">
              Make a wish! 🌟
            </p>
            <p className="text-lg text-white/30">🎉 Happy Birthday! 🎉</p>
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
