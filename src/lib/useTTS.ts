// src/lib/useTTS.ts
import { useCallback, useRef, useState } from "react";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ttsRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string, voice: string = "am-ET-AmehaNeural") => {
      if (!text.trim()) return;
      if (ttsRef.current) {
        ttsRef.current.pause();
        ttsRef.current = null;
      }

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
        });

        if (!res.ok) throw new Error("TTS request failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        ttsRef.current = audio;
        setIsPlaying(true);

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
        };

        await audio.play();
      } catch (err) {
        console.warn("TTS playback error:", err);
        setIsPlaying(false);
      }
    },
    []
  );

  return { speak, isPlaying };
}