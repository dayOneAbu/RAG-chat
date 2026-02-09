import { useRef } from "react";

interface UseSTTProps {
  onResult: (text: string) => void;
  onError?: (err: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onInterimResult?: (text: string) => void;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

// Support for browser-specific implementations
interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function useSTT({ onResult, onError, onStart, onEnd, onInterimResult }: UseSTTProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = () => {
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      onError?.("Speech recognition not supported");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "am-ET";
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const result = e.results[i];
        if (result) {
          if (result.isFinal) {
            final += result[0]?.transcript ?? "";
          } else {
            interim += result[0]?.transcript ?? "";
          }
        }
      }
      if (interim && onInterimResult) onInterimResult(interim);
      if (final) onResult(final);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
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