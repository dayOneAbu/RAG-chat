// src/app/_components/chat/chat-input.tsx
"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Mic, Send, Square, Headphones, Loader2 ,SquareIcon} from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import VoiceSelect from "./voice-select";
import { cn } from "~/lib/utils";
import { useSTT } from "~/lib/useSTT";
import { useTTS } from "~/lib/useTTS"; // We'll use this for input preview
import { useRouter } from "next/navigation";

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSubmit: (text: string, inputMode: "text" | "voice") => Promise<void>;
  isLoading: boolean;
  chatId?: number;
  userMessageCount?: number;
  // Add these new props for voice selection
  selectedVoice: "am-ET-AmehaNeural" | "am-ET-MekdesNeural";
  setSelectedVoice: (voice: "am-ET-AmehaNeural" | "am-ET-MekdesNeural") => void;
  //setSelectedVoice: (voice: string) => void;
  // Keep existing props
  onAgentClick: () => void;
  appendNotification: (message: string, isError?: boolean) => void;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
}

export default function ChatInput({
  inputText,
  setInputText,
  handleSubmit, // Use the handleSubmit from parent
  isLoading,
  chatId,
  userMessageCount = 0,
  // Add these new props for voice selection
  selectedVoice,
  setSelectedVoice,
  // Keep existing props
  onAgentClick,
  appendNotification,
  isStreaming = false,
  onStopStreaming,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { speak, isPlaying } = useTTS(); // For input preview TTS
  const router = useRouter();

  // --- STT Hook ---
  const { start: startSTT, stop: stopSTT } = useSTT({
    onStart: () => {
      setIsRecording(true);
      appendNotification("በመቅዳት ላይ...", false);
    },
    onEnd: () => {
      setIsRecording(false);
      appendNotification("ቀረጻ ተጠናቋል", false);
    },
    onResult: (text) => {
      if (text.trim()) {
        setInputText(text);
        // --- Submit to parent with 'voice' mode ---
        void handleSubmit(text, "voice");
        setInputText("");
      }
    },
    onInterimResult: (text) => {
      setInputText(text);
    },
    onError: (error) => {
      setIsRecording(false);
      appendNotification(`ስህተት: ${error}`, true);
    },
  });

  // --- Form Submit Handler ---
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isRecording) return;
    // --- Submit to parent with 'text' mode ---
    await handleSubmit(inputText, "text");
    setInputText("");
  };

  // --- Stop TTS Playback (Input Preview) ---
  const stopPlayback = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop browser TTS
    }
  };

  // --- Auto-focus input ---
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <form
        onSubmit={handleFormSubmit}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
          "hover:shadow-md"
        )}
      >
        {/* Voice Controls */}
        <div className="relative flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                isRecording && "bg-destructive/10 text-destructive hover:bg-destructive/20"
              )}
              disabled={isLoading || isRecording}
              onClick={() => {
                // --- Prioritize stopping streaming ---
                if (isStreaming && onStopStreaming) {
                  onStopStreaming();
                } else {
                  isRecording ? stopSTT() : startSTT();
                }
              }}
              title={isStreaming ? "Stop streaming response" : (isRecording ? "Stop recording" : "Start voice input")}
            >
              {isStreaming ? (
                <Square className="h-5 w-5 text-destructive" />
              ) : isRecording ? (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-1 bg-red-500 animate-pulse" style={{ animationDelay: "0s" }}></div>
                  <div className="h-2 w-1 bg-red-500 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                  <div className="h-2 w-1 bg-red-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                </div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <VoiceSelect 
                selectedVoice={selectedVoice} 
                setSelectedVoice={(voice) => setSelectedVoice(voice as "am-ET-AmehaNeural" | "am-ET-MekdesNeural")} 
              />
          </div>
        </div>

        {/* Text Input */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!inputText.trim() || isLoading || isRecording) return;
                void handleSubmit(inputText, "text");
                setInputText("");
              }
            }}
            placeholder="ጥያቄዎን ይጻፉ..."
            className={cn(
              "min-h-[44px] w-full border-0 bg-transparent px-4 py-3 text-sm",
              "placeholder:text-left placeholder:text-muted-foreground/70",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              (isLoading || isRecording) && "cursor-not-allowed opacity-70"
            )}
            disabled={isLoading || isRecording}
            aria-label="Type your message"
            dir="ltr"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground"
              aria-label="Clear message"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
        
           <div className="relative flex items-center">
                    <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-1 rounded-full transition-all duration-300",
              userMessageCount >= 10
                ? "bg-blue-600 text-white animate-bounce shadow-lg hover:bg-blue-700"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
            disabled={userMessageCount < 10 || !chatId} // Disable if no chatId
            onClick={() => chatId && router.push(`/transfer/${chatId}`)} // Use current chatId
            title="ወደ ሰብስ ደንበኛ ተቀይር"
            type="button"
          >
            <Headphones className="h-5 w-5" />
          </Button>
            
          </div>

          {/* Stop TTS Button (Input Preview) */}
          {isPlaying && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-destructive hover:text-destructive/80"
              onClick={stopPlayback}
              title="Stop audio playback"
            >
              <Square className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
              (!inputText.trim() || isLoading || isRecording) && "opacity-50 cursor-not-allowed"
            )}
            disabled={!inputText.trim() || isLoading || isRecording}
          >
            {isLoading || isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}