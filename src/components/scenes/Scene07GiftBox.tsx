'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import { useHaptics } from '@/hooks/useHaptics';

/* ── Gift Box ── */
function GiftBox({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const boxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  const ribbonTopRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (boxRef.current) {
      gsap.fromTo(
        boxRef.current.rotation,
        { y: -0.3 },
        { y: 0.3, duration: 3, yoyo: true, repeat: -1, ease: 'power1.inOut' }
      );
    }
  }, []);

  useEffect(() => {
    if (opened) {
      // Lid opens
      if (lidRef.current) {
        gsap.to(lidRef.current.rotation, {
          x: -Math.PI * 0.7,
          duration: 1.2,
          ease: 'back.out(1.7)',
        });
        gsap.to(lidRef.current.position, {
          y: 1.8,
          z: -0.8,
          duration: 1.2,
          ease: 'back.out(1.7)',
        });
      }
      // Ribbon flies off
      if (ribbonTopRef.current) {
        gsap.to(ribbonTopRef.current.position, {
          y: 5,
          duration: 1,
          ease: 'power2.out',
        });
        gsap.to(ribbonTopRef.current.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power2.in',
        });
      }
    }
  }, [opened]);

  useFrame(({ clock }) => {
    if (boxRef.current) {
      boxRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
    }
  });

  return (
    <group ref={boxRef} onClick={onOpen} position={[0, 0, 0]}>
      {/* Box base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 1.4, 2]} />
        <meshStandardMaterial
          color="#8b1a1a"
          roughness={0.3}
          metalness={0.5}
          emissive="#3d0808"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Box lid */}
      <mesh ref={lidRef} position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.1, 0.3, 2.1]} />
        <meshStandardMaterial
          color="#8b1a1a"
          roughness={0.3}
          metalness={0.5}
          emissive="#3d0808"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Ribbon horizontal */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.05, 0.15, 0.2]} />
        <meshStandardMaterial
          color="#D4A853"
          roughness={0.2}
          metalness={0.8}
          emissive="#D4A853"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Ribbon vertical */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.2, 0.15, 2.05]} />
        <meshStandardMaterial
          color="#D4A853"
          roughness={0.2}
          metalness={0.8}
          emissive="#D4A853"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Ribbon bow */}
      <group ref={ribbonTopRef} position={[0, 1.1, 0]}>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.25, 0.06, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color="#D4A853"
            roughness={0.2}
            metalness={0.8}
            emissive="#D4A853"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.5]}>
          <torusGeometry args={[0.25, 0.06, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color="#D4A853"
            roughness={0.2}
            metalness={0.8}
            emissive="#D4A853"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Inner glow when opened */}
      {opened && (
        <pointLight position={[0, 0.5, 0]} intensity={3} color="#fbbf24" distance={5} />
      )}
    </group>
  );
}

/* ── Explosion Sparkles ── */
function Sparkles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 150;
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = velocitiesRef.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0.5;
      pos[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.8;
      const speed = 0.03 + Math.random() * 0.08;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.cos(phi) * speed + 0.04;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!active || !pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const vel = velocitiesRef.current;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += vel[i * 3];
      posArr[i * 3 + 1] += vel[i * 3 + 1];
      posArr[i * 3 + 2] += vel[i * 3 + 2];
      vel[i * 3 + 1] -= 0.0006;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
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

export default function Scene07GiftBox() {
  const { isMobile } = useDevice();
  const nextScene = useAuroraStore((s) => s.nextScene);
  const content = useAuroraStore((s) => s.content);
  const { playTrack, playSfx } = useAudio();
  const haptics = useHaptics();
  const [opened, setOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content?.music?.scenes?.giftBox) {
      playTrack(content.music.scenes.giftBox, 2000);
    }
  }, [content, playTrack]);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    haptics.trigger('light');
    try { playSfx(content?.music?.effects?.pop || ''); } catch {}

    // Advance after celebration
    setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 4000);
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        shadows
        gl={{ antialias: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.6}
          color="#fef3c7"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-3, 3, 2]} intensity={0.3} color="#a78bfa" />

        <GiftBox opened={opened} onOpen={handleOpen} />
        <Sparkles active={opened} />

        <ContactShadows
          position={[0, -0.69, 0]}
          opacity={0.4}
          scale={8}
          blur={2}
          far={4}
        />

        <EffectComposer>
          <Bloom intensity={opened ? 2.5 : 1} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>

      {/* Instruction */}
      {!opened && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 text-center animate-[breathe_3s_ease-in-out_infinite]">
          <p className="text-sm tracking-widest text-white/30 uppercase">
            Click the gift to open ✨
          </p>
        </div>
      )}

      {/* Success message */}
      {opened && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <p
            className="text-gradient-gold font-script text-4xl md:text-5xl"
            style={{ animation: 'scale-in 0.8s ease-out' }}
          >
            Surprise! 🎉
          </p>
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
