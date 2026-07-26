'use client';

import { create } from 'zustand';
import type { AuroraContent, SceneId, } from '@/types';
import { SCENE_ORDER } from '@/types';

interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: string | null;
}

interface AuroraStore {
  // Content
  content: AuroraContent | null;
  setContent: (content: AuroraContent) => void;

  // Scene
  currentScene: number;
  currentSceneId: SceneId;
  isTransitioning: boolean;
  nextScene: () => void;
  prevScene: () => void;
  goToScene: (index: number) => void;
  setTransitioning: (transitioning: boolean) => void;

  // Audio
  audio: AudioState;
  setAudioPlaying: (playing: boolean) => void;
  setAudioMuted: (muted: boolean) => void;
  setAudioVolume: (volume: number) => void;
  setCurrentTrack: (track: string | null) => void;

  // Progress
  passwordUnlocked: boolean;
  setPasswordUnlocked: (unlocked: boolean) => void;
  candlesBlown: boolean;
  setCandlesBlown: (blown: boolean) => void;
  questionAnswered: boolean;
  setQuestionAnswered: (answered: boolean) => void;
  celebrationTriggered: boolean;
  setCelebrationTriggered: (triggered: boolean) => void;

  // Preferences
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;

  // UI
  showAudioControls: boolean;
  setShowAudioControls: (show: boolean) => void;
}

export const useAuroraStore = create<AuroraStore>((set, get) => ({
  // Content
  content: null,
  setContent: (content) => set({ content }),

  // Scene
  currentScene: 0,
  currentSceneId: SCENE_ORDER[0],
  isTransitioning: false,
  nextScene: () => {
    const { currentScene, isTransitioning } = get();
    if (isTransitioning) return;
    const next = Math.min(currentScene + 1, SCENE_ORDER.length - 1);
    set({
      currentScene: next,
      currentSceneId: SCENE_ORDER[next],
      isTransitioning: true,
    });
  },
  prevScene: () => {
    const { currentScene, isTransitioning } = get();
    if (isTransitioning) return;
    const prev = Math.max(currentScene - 1, 0);
    set({
      currentScene: prev,
      currentSceneId: SCENE_ORDER[prev],
      isTransitioning: true,
    });
  },
  goToScene: (index) => {
    const clamped = Math.max(0, Math.min(index, SCENE_ORDER.length - 1));
    set({
      currentScene: clamped,
      currentSceneId: SCENE_ORDER[clamped],
      isTransitioning: true,
    });
  },
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),

  // Audio
  audio: {
    isPlaying: false,
    isMuted: false,
    volume: 0.7,
    currentTrack: null,
  },
  setAudioPlaying: (playing) =>
    set((state) => ({ audio: { ...state.audio, isPlaying: playing } })),
  setAudioMuted: (muted) =>
    set((state) => ({ audio: { ...state.audio, isMuted: muted } })),
  setAudioVolume: (volume) =>
    set((state) => ({ audio: { ...state.audio, volume } })),
  setCurrentTrack: (track) =>
    set((state) => ({ audio: { ...state.audio, currentTrack: track } })),

  // Progress
  passwordUnlocked: false,
  setPasswordUnlocked: (unlocked) => set({ passwordUnlocked: unlocked }),
  candlesBlown: false,
  setCandlesBlown: (blown) => set({ candlesBlown: blown }),
  questionAnswered: false,
  setQuestionAnswered: (answered) => set({ questionAnswered: answered }),
  celebrationTriggered: false,
  setCelebrationTriggered: (triggered) =>
    set({ celebrationTriggered: triggered }),

  // Preferences
  reducedMotion: false,
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

  // UI
  showAudioControls: true,
  setShowAudioControls: (show) => set({ showAudioControls: show }),
}));
