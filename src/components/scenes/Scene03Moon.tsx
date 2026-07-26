'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    }
  });

  return (
    <group>
      {/* Main moon sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#e8e0d0"
          roughness={0.8}
          metalness={0.1}
          emissive="#d4c5a0"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} scale={[2.3, 2.3, 2.3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#fef3c7"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={[3.5, 3.5, 3.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#d4a853"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function RecipientName({ name }: { name: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current,
        { visible: false },
        { visible: true, delay: 2 }
      );
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1, y: 1, z: 1,
          delay: 2,
          duration: 2.5,
          ease: 'elastic.out(1, 0.6)',
        }
      );
    }

    if (subtitleRef.current) {
      const letters = subtitleRef.current.children;
      gsap.fromTo(
        letters,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, delay: 3, ease: 'power2.out' }
      );
    }
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} visible={false} position={[0, 0, 2.1]}>
      <Html transform center pointerEvents="none">
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-gradient-gold text-5xl md:text-7xl font-bold whitespace-nowrap drop-shadow-[0_0_15px_rgba(212,168,83,0.8)]">
            {name}
          </h1>
          <div ref={subtitleRef} className="mt-4 flex text-3xl md:text-4xl text-amber-300/80 drop-shadow-[0_0_10px_rgba(212,168,83,0.6)] font-bold">
            {"my life".split('').map((char, i) => (
              <span key={i} className="inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

function CameraZoom() {
  const cameraRef = useRef({ z: 8 });

  useEffect(() => {
    gsap.to(cameraRef.current, {
      z: 4.5,
      duration: 10,
      ease: 'power1.inOut',
    });
  }, []);

  useFrame(({ camera, clock }) => {
    camera.position.z = cameraRef.current.z;
    camera.position.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
    camera.position.y = Math.cos(clock.getElapsedTime() * 0.15) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function MoonDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.5 + Math.random() * 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#fef3c7"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene03Moon() {
  const { isMobile } = useDevice();
  const nextScene = useAuroraStore((s) => s.nextScene);
  const content = useAuroraStore((s) => s.content);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content?.music?.scenes?.moon) {
      playTrack(content.music.scenes.moon, 3000);
    }

    const timer = setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 12000);

    return () => clearTimeout(timer);
  }, [content, playTrack, nextScene]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <ambientLight intensity={0.05} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#fef3c7" />
        <pointLight position={[-3, -2, 3]} intensity={0.3} color="#a78bfa" />

        <Stars
          radius={80}
          depth={40}
          count={3000}
          factor={3}
          saturation={0.3}
          fade
          speed={0.3}
        />

        <Moon />
        <MoonDust />
        <RecipientName name={content?.recipientName || 'My Love'} />
        <CameraZoom />

        <EffectComposer>
          <Bloom
            intensity={2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.95}
          />
        </EffectComposer>
      </Canvas>

      {/* Emotional text overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
        <p className="font-script text-2xl text-white/20 md:text-3xl">
          This night was made for you...
        </p>
      </div>

      <button
        onClick={nextScene}
        className="absolute right-6 bottom-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-widest text-white/30 uppercase backdrop-blur-xl transition-all hover:border-white/20 hover:text-white/60"
        aria-label="Skip to next scene"
      >
        Skip →
      </button>
    </div>
  );
}
