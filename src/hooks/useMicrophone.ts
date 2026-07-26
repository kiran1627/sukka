'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface MicrophoneOptions {
  threshold?: number;
  onBlow?: () => void;
}

export function useMicrophone({ threshold = 140, onBlow }: MicrophoneOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const blowCountRef = useRef(0);
  const onBlowRef = useRef(onBlow);
  onBlowRef.current = onBlow;

  useEffect(() => {
    setIsSupported(
      typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        !!navigator.mediaDevices.getUserMedia
    );
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      blowCountRef.current = 0;

      const detect = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (average > threshold) {
          blowCountRef.current++;
          if (blowCountRef.current > 10) {
            onBlowRef.current?.();
            stopListening();
            return;
          }
        } else {
          blowCountRef.current = Math.max(0, blowCountRef.current - 1);
        }

        animFrameRef.current = requestAnimationFrame(detect);
      };

      setIsListening(true);
      detect();
      return true;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, [isSupported, threshold]);

  const stopListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
  };
}
