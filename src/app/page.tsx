'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuroraStore } from '@/store/useAuroraStore';
import type { AuroraContent } from '@/types';

const SceneManager = dynamic(() => import('@/components/SceneManager'), {
  ssr: false,
});
const CursorGlow = dynamic(() => import('@/components/effects/CursorGlow'), {
  ssr: false,
});
const AudioControls = dynamic(() => import('@/components/ui/AudioControls'), {
  ssr: false,
});

export default function Home() {
  const setContent = useAuroraStore((s) => s.setContent);
  const currentScene = useAuroraStore((s) => s.currentScene);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/content');
        const data: AuroraContent = await res.json();
        setContent(data);
        setLoaded(true);
      } catch {
        // Fallback: try loading directly
        try {
          const mod = await import('../../config/content.json');
          setContent(mod.default as unknown as AuroraContent);
          setLoaded(true);
        } catch {
          console.error('Failed to load content configuration');
        }
      }
    }
    loadContent();
  }, [setContent]);

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
            <div
              className="absolute inset-1 rounded-full border border-purple-400/20 border-t-purple-400"
              style={{ animation: 'spin 1.5s linear infinite reverse' }}
            />
          </div>
          <p className="font-serif text-lg tracking-[0.3em] text-white/30 uppercase">
            Aurora
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SceneManager />
      <CursorGlow />
      {currentScene > 0 && <AudioControls />}
    </>
  );
}
