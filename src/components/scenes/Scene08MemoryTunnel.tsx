'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';
import type { Photo, Video } from '@/types';

import { Html } from '@react-three/drei';

/* ── Floating Memory Card ── */
function MemoryCard({
  position,
  rotation,
  index,
  memory,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  memory: Photo | Video;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.3 + index * 1.5) * 0.3;
    meshRef.current.rotation.y =
      rotation[1] + Math.sin(t * 0.2 + index) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[1.6, 1.1]} />
      <meshStandardMaterial
        color="#0a0a10"
        transparent
        opacity={0.8}
        roughness={0.2}
        metalness={0.8}
        side={THREE.DoubleSide}
      />
      <Html transform distanceFactor={1.2} position={[0, 0, 0.01]}>
        <div className="w-[320px] h-[220px] rounded-lg shadow-2xl overflow-hidden bg-black flex items-center justify-center relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memory.src}
            alt={memory.caption}
            className="w-full h-full object-cover animate-image-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full p-4 text-left pointer-events-none">
            <h3 className="text-sm font-serif italic tracking-wide text-white/90 drop-shadow-md truncate">{memory.caption}</h3>
          </div>
        </div>
      </Html>
    </mesh>
  );
}

/* ── Tunnel Structure ── */
function Tunnel() {
  const tunnelRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });

  const rings = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      z: -i * 3,
      scale: 1 + i * 0.05,
      opacity: Math.max(0.02, 0.1 - i * 0.004),
    }));
  }, []);

  return (
    <group ref={tunnelRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]}>
          <torusGeometry args={[4 * ring.scale, 0.02, 8, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={ring.opacity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Auto-traveling Camera ── */
function CameraTravel({ totalCards }: { totalCards: number }) {
  const progress = useRef({ z: 5 });
  const targetZ = -(totalCards * 4) - 5;

  useEffect(() => {
    gsap.to(progress.current, {
      z: targetZ,
      duration: totalCards * 4,
      ease: 'none',
    });
  }, [totalCards, targetZ]);

  useFrame(({ camera, clock }) => {
    camera.position.z = progress.current.z;
    camera.position.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.5;
    camera.position.y = Math.cos(clock.getElapsedTime() * 0.1) * 0.3;
    camera.lookAt(0, 0, camera.position.z - 10);
  });

  return null;
}

/* ── Ambient Particles ── */
function TunnelParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 3;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r;
      pos[i * 3 + 2] = -Math.random() * 80;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#fbbf24"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene08MemoryTunnel() {
  const { isMobile } = useDevice();
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  const memories: (Photo | Video)[] = [
    ...(content?.photos || []),
    ...(content?.timeline || []).map((t) => ({
      id: t.id,
      src: t.image,
      caption: t.title,
      date: t.date,
    }) as Photo),
    ...(content?.gallery || []).map((g) => ({
      id: g.id,
      src: g.src,
      caption: g.caption,
      date: '',
    }) as Photo),
    ...(content?.videos || []),
  ];

  const cardPositions = useMemo(() => {
    return memories.map((_, i) => {
      const angle = (i / memories.length) * Math.PI * 2;
      const radius = 2.5;
      return {
        position: [
          Math.cos(angle + i * 0.5) * radius,
          Math.sin(angle + i * 0.5) * radius * 0.5,
          -i * 4 - 5,
        ] as [number, number, number],
        rotation: [0, angle * 0.2, 0] as [number, number, number],
      };
    });
  }, [memories.length]);

  useEffect(() => {
    if (content?.music?.scenes?.memoryTunnel) {
      playTrack(content.music.scenes.memoryTunnel, 3000);
    }

    const totalDuration = memories.length * 4000 + 3000;
    const timer = setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [content, playTrack, nextScene, memories.length]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true }} dpr={isMobile ? [1, 1] : [1, 1.5]}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#a78bfa" />

        <Tunnel />
        <TunnelParticles />

        {memories.map((memory, i) => (
          <MemoryCard
            key={memory.id}
            position={cardPositions[i]?.position || [0, 0, 0]}
            rotation={cardPositions[i]?.rotation || [0, 0, 0]}
            index={i}
            memory={memory}
          />
        ))}

        <CameraTravel totalCards={memories.length} />

        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
        </EffectComposer>
      </Canvas>

      {/* Caption overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 text-center">
        <p className="font-script text-2xl text-white/20 md:text-3xl">
          Through the tunnel of memories...
        </p>
      </div>

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
