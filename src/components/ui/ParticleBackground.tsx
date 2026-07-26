'use client';

import { useEffect, useState } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { tsParticles } from '@tsparticles/engine';
import type { ISourceOptions } from '@tsparticles/engine';
import { useDevice } from '@/hooks/useDevice';

type ParticlePreset = 'stars' | 'fireflies' | 'sparkles' | 'snow' | 'aurora';

interface ParticleBackgroundProps {
  preset?: ParticlePreset;
  className?: string;
  options?: ISourceOptions;
}

const presets: Record<ParticlePreset, ISourceOptions> = {
  stars: {
    fullScreen: false,
    particles: {
      number: { value: 100, density: { enable: true } },
      color: { value: ['#ffffff', '#fbbf24', '#a78bfa', '#60a5fa'] },
      opacity: {
        value: { min: 0.1, max: 0.8 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: {
        value: { min: 0.5, max: 2 },
        animation: { enable: true, speed: 1, sync: false },
      },
      move: {
        enable: true,
        speed: 0.2,
        direction: 'none',
        outModes: 'out',
      },
    },
    detectRetina: true,
  },
  fireflies: {
    fullScreen: false,
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ['#fbbf24', '#f59e0b', '#86efac'] },
      opacity: {
        value: { min: 0.2, max: 1 },
        animation: { enable: true, speed: 1.5, sync: false },
      },
      size: {
        value: { min: 1, max: 4 },
        animation: { enable: true, speed: 2, sync: false },
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        outModes: 'bounce',
        random: true,
      },
      shadow: {
        enable: true,
        color: '#fbbf24',
        blur: 10,
      },
    },
    detectRetina: true,
  },
  sparkles: {
    fullScreen: false,
    particles: {
      number: { value: 60, density: { enable: true } },
      color: { value: ['#fbbf24', '#f9a8d4', '#a78bfa', '#ffffff'] },
      opacity: {
        value: { min: 0, max: 1 },
        animation: { enable: true, speed: 2, sync: false },
      },
      size: {
        value: { min: 0.5, max: 3 },
        animation: { enable: true, speed: 3, sync: false },
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'top',
        outModes: 'out',
      },
      twinkle: {
        particles: { enable: true, frequency: 0.05, color: { value: '#fbbf24' } },
      },
    },
    detectRetina: true,
  },
  snow: {
    fullScreen: false,
    particles: {
      number: { value: 50, density: { enable: true } },
      color: { value: '#ffffff' },
      opacity: { value: { min: 0.1, max: 0.5 } },
      size: { value: { min: 1, max: 4 } },
      move: {
        enable: true,
        speed: 1,
        direction: 'bottom',
        outModes: 'out',
      },
      wobble: { enable: true, distance: 10, speed: 5 },
    },
    detectRetina: true,
  },
  aurora: {
    fullScreen: false,
    particles: {
      number: { value: 40, density: { enable: true } },
      color: { value: ['#60a5fa', '#a78bfa', '#34d399', '#f9a8d4'] },
      opacity: {
        value: { min: 0.05, max: 0.3 },
        animation: { enable: true, speed: 0.3, sync: false },
      },
      size: {
        value: { min: 20, max: 80 },
        animation: { enable: true, speed: 2, sync: false },
      },
      move: {
        enable: true,
        speed: 0.3,
        direction: 'top-right',
        outModes: 'out',
      },
    },
    detectRetina: true,
  },
};

export default function ParticleBackground({
  preset = 'stars',
  className,
  options,
}: ParticleBackgroundProps) {
  const [init, setInit] = useState(false);
  const { isMobile } = useDevice();

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  const baseOptions = options || presets[preset];
  
  // Create a deep copy to avoid mutating the original preset
  const mergedOptions = JSON.parse(JSON.stringify(baseOptions)) as ISourceOptions;
  
  // Reduce particles on mobile for better FPS
  if (isMobile && mergedOptions.particles?.number?.value) {
    // Cast value to number for modification
    const val = mergedOptions.particles.number.value as number;
    mergedOptions.particles.number.value = Math.max(10, Math.floor(val * 0.4));
  }

  if (!init) return null;

  return (
    <Particles
      className={className || 'absolute inset-0 z-0'}
      options={mergedOptions}
    />
  );
}
