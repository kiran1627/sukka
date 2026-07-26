'use client';

import { useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { useAuroraStore } from '@/store/useAuroraStore';

interface AudioInstance {
  howl: Howl;
  id?: number;
}

// Global state outside the hook so audio persists across unmounts/scene changes!
const globalTracks = new Map<string, AudioInstance>();
let globalCurrentTrack: string | null = null;

export function useAudio() {
  const {
    audio,
    setAudioPlaying,
    setAudioMuted,
    setAudioVolume,
    setCurrentTrack,
  } = useAuroraStore();

  const getOrCreateHowl = useCallback((src: string, loop = true): AudioInstance => {
    const existing = globalTracks.get(src);
    if (existing) return existing;

    const howl = new Howl({
      src: [src],
      loop,
      volume: 0,
      preload: true,
    });

    const instance: AudioInstance = { howl };
    globalTracks.set(src, instance);
    return instance;
  }, []);

  const fadeIn = useCallback(
    (src: string, duration = 2000, volume?: number) => {
      const targetVolume = volume ?? audio.volume;
      const instance = getOrCreateHowl(src);

      if (!instance.howl.playing()) {
        instance.id = instance.howl.play();
      }
      instance.howl.fade(0, targetVolume, duration, instance.id);
    },
    [audio.volume, getOrCreateHowl]
  );

  const fadeOut = useCallback((src: string, duration = 2000) => {
    const instance = globalTracks.get(src);
    if (instance && instance.howl.playing()) {
      instance.howl.fade(instance.howl.volume(), 0, duration, instance.id);
      setTimeout(() => {
        instance.howl.pause(instance.id);
      }, duration);
    }
  }, []);

  const crossfade = useCallback(
    (fromSrc: string | null, toSrc: string, duration = 2000) => {
      if (fromSrc) {
        fadeOut(fromSrc, duration);
      }
      fadeIn(toSrc, duration);
      globalCurrentTrack = toSrc;
      setCurrentTrack(toSrc);
      setAudioPlaying(true);
    },
    [fadeIn, fadeOut, setCurrentTrack, setAudioPlaying]
  );

  const playTrack = useCallback(
    (src: string, fadeDuration = 2000) => {
      const prev = globalCurrentTrack;
      if (prev === src) return;
      crossfade(prev, src, fadeDuration);
    },
    [crossfade]
  );

  const playSfx = useCallback(
    (src: string, volume = 0.5) => {
      // SFX disabled per user request
    },
    []
  );

  const togglePlay = useCallback(() => {
    if (audio.isPlaying) {
      Howler.mute(true);
      setAudioPlaying(false);
    } else {
      Howler.mute(false);
      setAudioPlaying(true);
    }
  }, [audio.isPlaying, setAudioPlaying]);

  const toggleMute = useCallback(() => {
    const newMuted = !audio.isMuted;
    Howler.mute(newMuted);
    setAudioMuted(newMuted);
  }, [audio.isMuted, setAudioMuted]);

  const changeVolume = useCallback(
    (vol: number) => {
      Howler.volume(vol);
      setAudioVolume(vol);
    },
    [setAudioVolume]
  );

  const stopAll = useCallback(() => {
    globalTracks.forEach((instance) => {
      instance.howl.stop();
    });
    setAudioPlaying(false);
    setCurrentTrack(null);
    globalCurrentTrack = null;
  }, [setAudioPlaying, setCurrentTrack]);

  return {
    playTrack,
    playSfx,
    fadeIn,
    fadeOut,
    crossfade,
    togglePlay,
    toggleMute,
    changeVolume,
    stopAll,
    isPlaying: audio.isPlaying,
    isMuted: audio.isMuted,
    volume: audio.volume,
  };
}
