"use client";
import { useEffect, useRef } from "react";
import { User2, Bot, Play, Pause, Square, RotateCcw, AlertCircle } from "lucide-react";
import { type Message } from "~/types/chat";
import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/ui/button";

interface ChatMessagesProps {
  messages: Message[];
  notifications: Array<{ id: string; text: string; isError: boolean; timestamp: Date }>;
  isPlayingAudio: string | null;
  isPausedAudio: string | null;
  onPlayAudio: (messageId: string | number, audioUrl: string | null, voice?: string) => void;
  onPauseAudio: (messageId: string | number) => void;
  onStopAudio: (messageId: string | number) => void;
  selectedVoice: "am-ET-AmehaNeural" | "am-ET-MekdesNeural";
  inputMode: "text" | "voice";
}

export function ChatMessages({
  messages,
  notifications,
  isPlayingAudio,
  isPausedAudio,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  selectedVoice,
  inputMode,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log("ChatMessages state:", {
    messageIds: messages.map(m => String(m.id)),
    isPlayingAudio,
    isPausedAudio,
  });
  console.log("[ChatMessages] Messages before render:", messages.map(m => ({ id: m.id, role: m.role, content: m.content.substring(0, 50), audioUrl: m.audioUrl })));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, notifications]);

  const formatText = (text: string) =>
    text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^\s*-\s/gm, "• ");

  return (
    <div className="flex h-full flex-col justify-end">
      <div className="flex flex-col-reverse space-y-reverse space-y-4 overflow-y-auto px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
        <div ref={messagesEndRef} />
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={cn(
              "max-w-[75%] px-4 py-2.5 rounded-xl text-sm self-center",
              notification.isError
                ? "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100 border border-red-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-100 border border-yellow-200"
            )}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{notification.text}</span>
            </div>
          </div>
        ))}
        {messages.length === 0 ? (
           <div className="sticky bottom-0 w-full max-w-[80%] mx-auto p-4 text-center text-sm text-muted-foreground z-10 bg-background">
        {/*ምን እንርዳዎት? ውይይቱን ለማስጀመር መልእክት ይላኩ። */}  
        </div>

        ) : (
          <>
            {[...messages].reverse().map(message => {
              const isAudioAvailable =
                !!message.audioUrl ||
                (message.role === 'assistant' && message.content && inputMode === "voice") ||
                (message.role === 'assistant' && message.content && message.content.length > 10);
              const messageIdStr = String(message.id);
              const isCurrentlyPlaying = isPlayingAudio === messageIdStr;
              const isCurrentlyPaused = isPausedAudio === messageIdStr;
              console.log("Message state check:", {
                messageId: messageIdStr,
                isAudioAvailable,
                isCurrentlyPlaying,
                isCurrentlyPaused,
                audioUrl: message.audioUrl,
                isPlayingAudioState: isPlayingAudio,
                isPausedAudioState: isPausedAudio,
              });
              if (message.role === 'assistant' && messageIdStr === isPlayingAudio) {
                console.log(`[DEBUG] AI Message ${messageIdStr} is the one currently playing. isCurrentlyPlaying=${isCurrentlyPlaying}, isCurrentlyPaused=${isCurrentlyPaused}`);
              }
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full max-w-[80%] items-start gap-3",
                    message.role === "assistant" ? "self-start" : "self-end flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
                      message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User2 className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <div
                      className={cn(
                        "flex-1 space-y-2 overflow-hidden rounded-2xl px-4 py-3",
                        message.role === "assistant" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
                        message.role === "assistant" ? "rounded-tl-sm" : "rounded-tr-sm"
                      )}
                      dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
                    />
                    {message.role === "assistant" && isAudioAvailable && (
                      <div className="flex items-center gap-1">
                        {isCurrentlyPlaying && !isCurrentlyPaused ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => onPauseAudio(messageIdStr)}
                              aria-label="Pause audio"
                            >
                              <Pause className="h-4 w-4 mr-1" /> Pause
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => onStopAudio(messageIdStr)}
                              aria-label="Stop audio"
                            >
                              <Square className="h-4 w-4 mr-1" /> Stop
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => onPlayAudio(messageIdStr, message.audioUrl ?? `TTS_ON_DEMAND:${message.content}`, selectedVoice)}
                              aria-label="Play audio"
                            >
                              <Play className="h-4 w-4 mr-1" /> Play
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => onPlayAudio(messageIdStr, `REPLAY:${message.audioUrl ?? `TTS_ON_DEMAND:${message.content}`}`, selectedVoice)}
                              aria-label="Replay audio"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" /> Replay
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}