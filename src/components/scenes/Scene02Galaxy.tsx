'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useDevice } from '@/hooks/useDevice';
import { Text, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useAudio } from '@/hooks/useAudio';

function NebulaMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#1a0533') },
      uColor2: { value: new THREE.Color('#0a1628') },
      uColor3: { value: new THREE.Color('#2d1b4e') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} scale={[30, 30, 1]} position={[0, 0, -15]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec2 vUv;

          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = noise(i);
            float b = noise(i + vec2(1.0, 0.0));
            float c = noise(i + vec2(0.0, 1.0));
            float d = noise(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          float fbm(vec2 p) {
            float f = 0.0;
            f += 0.5000 * smoothNoise(p * 1.0); p *= 2.01;
            f += 0.2500 * smoothNoise(p * 1.0); p *= 2.02;
            f += 0.1250 * smoothNoise(p * 1.0); p *= 2.03;
            f += 0.0625 * smoothNoise(p * 1.0);
            return f;
          }

          void main() {
            vec2 uv = vUv;
            float n1 = fbm(uv * 3.0 + uTime * 0.5);
            float n2 = fbm(uv * 5.0 - uTime * 0.3 + 10.0);
            float n3 = fbm(uv * 2.0 + uTime * 0.2 + 20.0);

            vec3 color = mix(uColor1, uColor2, n1);
            color = mix(color, uColor3, n2 * 0.5);

            float alpha = smoothstep(0.1, 0.9, n1 * n2) * 0.6;
            alpha += n3 * 0.15;

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 500;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#fbbf24'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#60a5fa'),
      new THREE.Color('#f9a8d4'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.02;
    pointsRef.current.rotation.x = Math.sin(t * 0.01) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function BirthdayText() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    // Animate camera flying through
    gsap.to(camera.position, {
      z: 5,
      duration: 8,
      ease: 'power1.inOut',
    });

    // Animate text appearing
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 3, delay: 4, ease: 'elastic.out(1, 0.5)' }
      );
      gsap.fromTo(
        groupRef.current,
        { visible: false },
        { visible: true, delay: 4 }
      );
    }
  }, [camera]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <Html transform center position={[0, 0, -2]}>
        <h1 className="text-gradient-gold text-6xl md:text-8xl font-bold whitespace-nowrap drop-shadow-[0_0_20px_rgba(212,168,83,0.5)]">
          Happy Birthday
        </h1>
      </Html>
    </group>
  );
}

function FloatingPhotos() {
  const content = useAuroraStore((s) => s.content);
  
  const allPhotos = useMemo(() => {
    return [
      ...(content?.photos || []),
      ...(content?.timeline || []),
      ...(content?.gallery || []),
    ];
  }, [content]);

  return (
    <group>
      {allPhotos.map((photo, i) => (
        <FloatingPhoto key={photo.id || i} index={i} total={allPhotos.length} photo={photo} />
      ))}
    </group>
  );
}

function FloatingPhoto({ index, total, photo }: { index: number; total: number; photo: any }) {
  const meshRef = useRef<THREE.Group>(null);
  
  const radius = 6 + Math.random() * 4;
  const angle = (index / total) * Math.PI * 2;
  const y = (Math.random() - 0.5) * 8;
  
  const initialPos = useMemo(() => {
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius - 5
    );
  }, [angle, radius, y]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * 0.2;
      meshRef.current.position.x = Math.cos(angle + t) * radius;
      meshRef.current.position.z = Math.sin(angle + t) * radius - 5;
      meshRef.current.position.y = y + Math.sin(t * 2 + index) * 0.5;
      meshRef.current.lookAt(0, 0, -5);
    }
  });

  return (
    <group ref={meshRef} position={initialPos}>
      <Html transform center distanceFactor={12}>
        <div className="w-[160px] h-[160px] rounded-lg overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt="Memory" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-all duration-500 hover:scale-110" />
        </div>
      </Html>
    </group>
  );
}

function CameraAnimation() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 20);
  }, [camera]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.1) * 2;
    camera.position.y = Math.cos(t * 0.15) * 1;
  });

  return null;
}

export default function Scene02Galaxy() {
  const { isMobile } = useDevice();
  const nextScene = useAuroraStore((s) => s.nextScene);
  const content = useAuroraStore((s) => s.content);
  const { playTrack } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content?.music?.scenes?.galaxy) {
      playTrack(content.music.scenes.galaxy, 3000);
    }

    const timer = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 2,
          ease: 'power2.inOut',
          onComplete: nextScene,
        });
      }
    }, 12000);

    return () => clearTimeout(timer);
  }, [content, playTrack, nextScene]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#D4A853" />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />

        <NebulaMesh />
        <FloatingParticles />
        <FloatingPhotos />
        <BirthdayText />
        <CameraAnimation />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0005, 0.0005)}
          />
        </EffectComposer>
      </Canvas>

      {/* Skip button */}
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
