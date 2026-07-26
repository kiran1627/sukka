'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuroraStore } from '@/store/useAuroraStore';
import { useSwipe } from '@/hooks/useSwipe';

const scenes = [
  lazy(() => import('@/components/scenes/Scene01Boot')),
  lazy(() => import('@/components/scenes/Scene02Galaxy')),
  lazy(() => import('@/components/scenes/Scene03Moon')),
  lazy(() => import('@/components/scenes/Scene04Butterflies')),
  lazy(() => import('@/components/scenes/Scene05Password')),
  lazy(() => import('@/components/scenes/Scene06Forest')),
  lazy(() => import('@/components/scenes/Scene07GiftBox')),
  lazy(() => import('@/components/scenes/Scene08MemoryTunnel')),
  lazy(() => import('@/components/scenes/Scene09Timeline')),
  lazy(() => import('@/components/scenes/Scene10Cake')),
  lazy(() => import('@/components/scenes/Scene11Letter')),
  lazy(() => import('@/components/scenes/Scene12Question')),
  lazy(() => import('@/components/scenes/Scene13Celebration')),
  lazy(() => import('@/components/scenes/Scene14AuroraSky')),
  lazy(() => import('@/components/scenes/Scene15HiddenSurprise')),
];

function SceneLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
        <p className="font-sans text-sm tracking-widest text-white/30 uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function SceneManager() {
  const currentScene = useAuroraStore((s) => s.currentScene);
  const setTransitioning = useAuroraStore((s) => s.setTransitioning);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSceneRef = useRef(currentScene);

  useEffect(() => {
    if (prevSceneRef.current === currentScene) return;
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline();
    tl.to(container, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    }).call(() => {
      prevSceneRef.current = currentScene;
      setTransitioning(false);
    }).fromTo(
      container,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }
    );

    return () => {
      tl.kill();
    };
  }, [currentScene, setTransitioning]);

  useSwipe({
    onSwipeLeft: () => {
      // Swiping left goes to next scene (forward)
      if (currentScene < scenes.length - 1) {
        setTransitioning(true);
        useAuroraStore.getState().nextScene();
      }
    },
    onSwipeRight: () => {
      // Swiping right goes to prev scene (backward)
      if (currentScene > 0) {
        setTransitioning(true);
        useAuroraStore.getState().prevScene();
      }
    }
  });

  const SceneComponent = scenes[currentScene];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
      role="main"
      aria-live="polite"
    >
      <Suspense fallback={<SceneLoader />}>
        <SceneComponent />
      </Suspense>
    </div>
  );
}
