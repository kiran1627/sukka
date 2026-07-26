'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';

/* ── Aurora Borealis ── */
function AuroraBorealis() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3, -10]} scale={[25, 8, 1]}>
      <planeGeometry args={[1, 1, 64, 32]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        side={THREE.DoubleSide}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x),
              mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x),
              f.y
            );
          }

          float fbm(vec2 p) {
            float f = 0.0;
            f += 0.5000 * smoothNoise(p); p *= 2.01;
            f += 0.2500 * smoothNoise(p); p *= 2.02;
            f += 0.1250 * smoothNoise(p); p *= 2.03;
            f += 0.0625 * smoothNoise(p);
            return f;
          }

          void main() {
            vec2 uv = vUv;

            float n1 = fbm(vec2(uv.x * 4.0 + uTime, uv.y * 2.0));
            float n2 = fbm(vec2(uv.x * 3.0 - uTime * 0.7, uv.y * 3.0 + uTime * 0.5));

            vec3 color1 = vec3(0.37, 0.65, 0.98); // blue
            vec3 color2 = vec3(0.65, 0.55, 0.98); // purple
            vec3 color3 = vec3(0.20, 0.83, 0.60); // green
            vec3 color4 = vec3(0.98, 0.66, 0.83); // pink

            vec3 color = mix(color1, color2, n1);
            color = mix(color, color3, n2 * 0.5);
            color = mix(color, color4, smoothstep(0.4, 0.8, n1 * n2));

            float curtainShape = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);
            float wave = sin(uv.x * 10.0 + uTime * 2.0 + n1 * 5.0) * 0.5 + 0.5;

            float alpha = curtainShape * (0.15 + n1 * 0.2) * (0.8 + wave * 0.2);

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

/* ── Floating Lanterns ── */
function Lanterns({ count = 15 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 6 + 1,
        z: -Math.random() * 15 - 2,
        speed: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    data.forEach((l, i) => {
      dummy.position.set(
        l.x + Math.sin(t * l.speed + l.phase) * 0.5,
        l.y + t * 0.05 + Math.sin(t * 0.3 + l.phase) * 0.3,
        l.z
      );
      dummy.scale.setScalar(0.15);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#fbbf24"
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ── Moon ── */
function GlowingMoon() {
  return (
    <group position={[6, 5, -15]}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#fef3c7" />
      </mesh>
      <mesh scale={[2.2, 2.2, 2.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export default function Scene14AuroraSky() {
  const { isMobile } = useDevice();
  const content = useAuroraStore((s) => s.content);
  const nextScene = useAuroraStore((s) => s.nextScene);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const finalMessage = content?.finalMessage || 'You are the most beautiful part of my life.';

  useEffect(() => {
    if (content?.music?.scenes?.auroraSky) {
      playTrack(content.music.scenes.auroraSky, 3000);
    }

    // Animate text
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 2, delay: 2, ease: 'power2.out' }
      );
    }
  }, [content, playTrack]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60 }}
        gl={{ antialias: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <ambientLight intensity={0.05} />

        <Stars radius={100} depth={50} count={4000} factor={3} saturation={0.3} fade speed={0.2} />

        <AuroraBorealis />
        <Lanterns />
        <GlowingMoon />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.15} luminanceSmoothing={0.95} />
        </EffectComposer>
      </Canvas>

      {/* Message */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div ref={textRef} className="mx-6 max-w-2xl text-center opacity-0">
          <blockquote className="font-serif text-2xl leading-relaxed text-white/60 italic md:text-3xl lg:text-4xl">
            &ldquo;{finalMessage}&rdquo;
          </blockquote>
          <div className="mx-auto mt-8 h-px w-32 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>
      </div>

      {/* Continue */}
      <div className="absolute inset-x-0 bottom-8 z-20 text-center">
        <button
          onClick={() => {
            if (containerRef.current) gsap.to(containerRef.current, {
              opacity: 0,
              duration: 2,
              ease: 'power2.inOut',
              onComplete: nextScene,
            });
          }}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm tracking-widest text-white/30 uppercase backdrop-blur-xl transition-all hover:border-amber-400/30 hover:text-amber-300"
        >
          One More Thing ✨
        </button>
      </div>
    </div>
  );
}
