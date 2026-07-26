'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';

function Butterflies({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      wingSpeed: 3 + Math.random() * 5,
      scale: 0.15 + Math.random() * 0.15,
      color: new THREE.Color().setHSL(
        Math.random() * 0.15 + 0.8, // pinks and golds
        0.6 + Math.random() * 0.4,
        0.5 + Math.random() * 0.3
      ),
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    data.forEach((b, i) => {
      const x = b.position.x + Math.sin(t * b.speed + b.phase) * 2;
      const y = b.position.y + Math.cos(t * b.speed * 0.7 + b.phase) * 1.5 + t * 0.3;
      const z = b.position.z + Math.sin(t * b.speed * 0.5) * 0.5;

      dummy.position.set(x, y % 12 - 6, z);
      const wingFlap = Math.sin(t * b.wingSpeed) * 0.3;
      dummy.scale.set(b.scale * (1 + wingFlap), b.scale, b.scale);
      dummy.rotation.y = Math.atan2(
        Math.cos(t * b.speed + b.phase),
        Math.sin(t * b.speed * 0.7 + b.phase)
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, b.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 0.6, 1, 1]} />
      <meshStandardMaterial
        color="#f9a8d4"
        emissive="#f9a8d4"
        emissiveIntensity={0.4}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function SparkleParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = Math.random() * 0.02 + 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];
      posArr[i * 3 + 2] += velocities[i * 3 + 2];

      if (posArr[i * 3 + 1] > 10) {
        posArr[i * 3 + 1] = -8;
        posArr[i * 3] = (Math.random() - 0.5) * 20;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.05}
        color="#fbbf24"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ExplosionParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = velocitiesRef.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.15;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const vel = velocitiesRef.current;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += vel[i * 3];
      posArr[i * 3 + 1] += vel[i * 3 + 1];
      posArr[i * 3 + 2] += vel[i * 3 + 2];
      vel[i * 3 + 1] -= 0.0005; // gravity
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.08}
        color="#f9a8d4"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene04Butterflies() {
  const { isMobile } = useDevice();
  const nextScene = useAuroraStore((s) => s.nextScene);
  const content = useAuroraStore((s) => s.content);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content?.music?.scenes?.butterflies) {
      playTrack(content.music.scenes.butterflies, 2000);
    }

    const timer = setTimeout(() => {
      if (containerRef.current) gsap.to(containerRef.current, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: nextScene,
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [content, playTrack, nextScene]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 5, 5]} intensity={1} color="#f9a8d4" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#a78bfa" />

        <ExplosionParticles />
        <Butterflies />
        <SparkleParticles />

        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>

      {/* Overlay text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p
          className="font-script text-4xl text-white/10 md:text-6xl"
          style={{ animation: 'breathe 4s ease-in-out infinite' }}
        >
          ✨
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
