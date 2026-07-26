'use client';

import { useAudio } from '@/hooks/useAudio';
import { useAuroraStore } from '@/store/useAuroraStore';
import { cn } from '@/lib/utils';

export default function AudioControls() {
  const { togglePlay, toggleMute, changeVolume, isPlaying, isMuted, volume } =
    useAudio();
  const showControls = useAuroraStore((s) => s.showAudioControls);

  if (!showControls) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-4 py-3',
        'border border-white/10 bg-black/40 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500',
        'hover:border-white/20 hover:bg-black/50'
      )}
      role="toolbar"
      aria-label="Audio controls"
    >
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="group flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-white/10"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg
            className="h-4 w-4 text-white/80 transition-colors group-hover:text-amber-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-white/80 transition-colors group-hover:text-amber-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Volume */}
      <button
        onClick={toggleMute}
        className="group flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-white/10"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg
            className="h-4 w-4 text-white/80 transition-colors group-hover:text-amber-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-white/80 transition-colors group-hover:text-amber-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => changeVolume(parseFloat(e.target.value))}
        className="audio-slider h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-400 transition-all"
        aria-label="Volume"
      />
    </div>
  );
}
