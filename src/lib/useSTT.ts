import { useRef } from "react";

interface UseSTTProps {
  onResult: (text: string) => void;
  onError?: (err: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onInterimResult?: (text: string) => void;
}

// We use 'any' for SpeechRecognition because browser support/types are inconsistent
export function useSTT({ onResult, onError, onStart, onEnd, onInterimResult }: UseSTTProps) {
  const recognitionRef = useRef<any>(null);

  const start = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      onError?.("Speech recognition not supported");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "am-ET";
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      if (interim && onInterimResult) onInterimResult(interim);
      if (final) onResult(final);
    };
    recognition.onerror = (e: any) => {
      onError?.(String(e.error));
    };
    recognition.onstart = () => onStart?.();
    recognition.onend = () => onEnd?.();
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return { start, stop };
} 