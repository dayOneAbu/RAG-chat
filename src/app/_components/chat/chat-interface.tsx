"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { api } from "~/trpc/react";
import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ArrowDown, Square } from "lucide-react";
import { type Message } from "~/types/chat";

interface Notification {
  id: string;
  text: string;
  isError: boolean;
}

function TransferModal({ open, onClose, onTransfer }: { open: boolean; onClose: () => void; onTransfer: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card p-8 rounded-lg shadow-lg min-w-[320px] flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">ጥያቄዎ ወደ ደንበኞች አገልግሎት ሰራተኞች ይተላለፋል</h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          ይህ ውይይት ወደ ደንበኞች አገልግሎት ሰራተኞች ይቀየራል። የአይ ውይይት ይቋረጣል። ለቀጣዩ እርዳታ ደንበኞች አገልግሎት ሰራተኞች ይመራዎታል።
        </p>
        <div className="flex gap-4 w-full justify-center">
          <button
            className="bg-black-600 hover:bg-black-700 text-white font-semibold py-2 px-6 rounded shadow"
            onClick={() => {
              onTransfer();
              onClose();
            }}
          >
            ጥያቄዎ ወደ ደንበኞች አገልግሎት ሰራተኞች ይተላለፋል
          </button>
          <button
            className="bg-muted hover:bg-muted/80 text-foreground font-semibold py-2 px-6 rounded border"
            onClick={onClose}
          >
            ይዝጉ
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorFallback({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg m-4">
      ስህተት ተከስቷል: {errorMessage}
    </div>
  );
}

export function ChatInterface({ chatId }: { chatId?: number }) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Array<Notification & { timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<"am-ET-AmehaNeural" | "am-ET-MekdesNeural">("am-ET-MekdesNeural");
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isPausedAudio, setIsPausedAudio] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [inputMode] = useState<"text" | "voice">("text");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const currentMessageId = useRef<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push('/auth/signin');
    },
  });
  const utils = api.useUtils();

  interface CreateChatResponse {
    id: number;
    text: string;
    audioUrl: string;
  }

  interface AddMessageResponse {
    text: string;
    audioUrl: string;
  }

  interface TRPCClientError extends Error {
    data?: { code?: string; httpStatus?: number; path?: string; stack?: string; zodError?: unknown };
    shape?: { message: string; code: number };
  }

  const appendNotification = useCallback((text: string, isError = false) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setNotifications(prev => [...prev, { id, text, isError, timestamp: new Date() }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), isError ? 10000 : 3000);
  }, []);

  const createChatMutation = api.chat.create.useMutation<CreateChatResponse>();
  const addMessageMutation = api.chat.addMessage.useMutation<AddMessageResponse>();




  useEffect(() => {
    if (createChatMutation.error) {
      const err = createChatMutation.error as TRPCClientError;
      appendNotification(err.shape?.message ?? err.message ?? 'Failed to create chat.', true);
    }
  }, [createChatMutation.error, appendNotification]);

  useEffect(() => {
    if (addMessageMutation.error) {
      const err = addMessageMutation.error as TRPCClientError;
      appendNotification(err.shape?.message ?? err.message ?? 'Failed to send message.', true);
    }
  }, [addMessageMutation.error, appendNotification]);

  const { data: currentChat, error: chatError } = api.chat.getById.useQuery(
    { id: chatId! },
    { enabled: !!chatId && !!session?.user }
  );

  useEffect(() => {
    if (chatError) {
      console.error('Failed to load chat:', chatError);
      appendNotification('Failed to load chat.', true);
    }
  }, [chatError, appendNotification]);

  useEffect(() => {
    if (currentChat?.messages) {
      const normalizedMessages = currentChat.messages.map(msg => ({
        ...msg,
        id: msg.role === 'assistant' ? `ai-${msg.chatId}-${new Date(msg.createdAt).getTime()}` : `user-${msg.chatId}-${new Date(msg.createdAt).getTime()}`,
        role: msg.role as 'user' | 'assistant',
        createdAt: new Date(msg.createdAt),
      }));
      setMessages(normalizedMessages);
      console.log('[ChatInterface] Normalized messages:', normalizedMessages.map(m => ({
      id: m.id,
      role: m.role,
      newId: m.role === 'assistant' ? `ai-${m.chatId}-${new Date(m.createdAt).getTime()}` : `user-${m.chatId}-${new Date(m.createdAt).getTime()}`
    })));
    }
  }, [currentChat?.messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, notifications]);

  useEffect(() => {
    return () => {
      if (currentAudio.current) {
        currentAudio.current.pause();
        if (currentAudio.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(currentAudio.current.src);
        }
        currentAudio.current.src = '';
        currentAudio.current.onplay = null;
        currentAudio.current.onended = null;
        currentAudio.current.onerror = null;
        currentAudio.current = null;
      }
      setIsPlayingAudio(null);
      setIsPausedAudio(null);
      setIsAutoPlaying(false);
      currentMessageId.current = null;
      console.log('[cleanup] Cleared audio instance and states');
    };
  }, [messages]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
      setShowScrollToBottom(isScrolledUp);
      isUserScrolledUpRef.current = isScrolledUp;
    };
    chatContainer.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [messages]);



  const stopAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      if (currentAudio.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.current.src);
      }
      currentAudio.current.src = '';
      currentAudio.current.onplay = null;
      currentAudio.current.onended = null;
      currentAudio.current.onerror = null;
      currentAudio.current = null;
      setIsPlayingAudio(null);
      setIsPausedAudio(null);
      setIsAutoPlaying(false);
      currentMessageId.current = null;
      console.log('[stopAudio] Cleared audio instance and states');
    }
  }, []);

  const handlePauseAudio = useCallback((messageId: string | number) => {
    const messageIdStr = String(messageId);
    if (currentAudio.current && currentMessageId.current === messageIdStr && isPlayingAudio === messageIdStr) {
      currentAudio.current.pause();
      setIsPlayingAudio(null);
      setIsPausedAudio(messageIdStr);
      console.log(`[handlePauseAudio] Paused audio for message ${messageIdStr}`);
    }
  }, [isPlayingAudio]);

  const handlePlayAudio = useCallback((
    messageId: string | number,
    audioUrlOrContent: string | undefined | null,
    voice = "am-ET-MekdesNeural",
    isAutoPlay = false
  ) => {
    const messageIdStr = String(messageId);
    console.log(`[handlePlayAudio] Called with messageId: ${messageIdStr}, isAutoPlay: ${isAutoPlay}, messages:`, messages.map(m => ({ id: m.id, role: m.role })));
    
    let contentToSpeak = "";
    if (isAutoPlay && typeof audioUrlOrContent === 'string' && audioUrlOrContent.startsWith("TTS_ON_DEMAND:")) {
      contentToSpeak = audioUrlOrContent.split("TTS_ON_DEMAND:")[1] ?? "";
    } else {
      const message = messages.find(m => String(m.id) === messageIdStr);
      if (!message) {
        appendNotification("Message not found.", true);
        stopAudio();
        return;
      }
      if (!isAutoPlay) {
        const latestAssistantMessage = messages
          .filter(m => m.role === "assistant")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (message.role !== "assistant" || String(message.id) !== String(latestAssistantMessage?.id)) {
          appendNotification("Audio playback is only allowed for the latest assistant message.", true);
          stopAudio();
          return;
        }
      }
      contentToSpeak = message.content;
    }

    if (isPlayingAudio === messageIdStr && !isPausedAudio) {
      appendNotification("Audio is already playing.", true);
      return;
    }

    let actualAudioUrlOrContent = audioUrlOrContent;
    const isReplay = typeof audioUrlOrContent === 'string' && audioUrlOrContent.startsWith("REPLAY:");
    if (isReplay) {
      actualAudioUrlOrContent = audioUrlOrContent.substring(7);
    }

    if (typeof actualAudioUrlOrContent === 'string' && actualAudioUrlOrContent.trim() === "TTS_ON_DEMAND_PLACEHOLDER") {
      actualAudioUrlOrContent = `TTS_ON_DEMAND:${contentToSpeak}`;
    }

    stopAudio();

    if (typeof actualAudioUrlOrContent === 'string' && actualAudioUrlOrContent.startsWith("TTS_ON_DEMAND:")) {
      if (!contentToSpeak.trim()) {
        appendNotification("No content to play.", true);
        stopAudio();
        return;
      }
      const playTTS = async (retryCount = 1) => {
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: contentToSpeak, voice }),
          });
          if (!res.ok) {
            if ((res.status === 429 || res.status >= 500) && retryCount > 0) {
              console.log(`[handlePlayAudio] Retrying TTS request for message ${messageIdStr} after ${res.status} error`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return playTTS(retryCount - 1);
            }
            throw new Error(`TTS API failed: ${res.status} ${res.statusText}`);
          }
          const blob = await res.blob();
          if (!blob || blob.size === 0) {
            throw new Error("Empty audio blob received.");
          }
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          currentAudio.current = audio;
          currentMessageId.current = messageIdStr;

          audio.onended = () => {
            stopAudio();
            console.log(`[handlePlayAudio] Audio ended for message ${messageIdStr}`);
          };
          audio.onerror = (e) => {
            const errorMessage = e instanceof Error ? e.message : (typeof e === 'object' && e !== null && 'message' in e) ? String(e.message) : typeof e === 'string' ? e : 'Unknown audio error';
            stopAudio();
            appendNotification(`Failed to play audio: ${errorMessage}`, true);
            console.error(`[handlePlayAudio] Audio error for message ${messageIdStr}:`, e);
          };
          setIsPlayingAudio(() => {
            console.log(`[handlePlayAudio] Setting isPlayingAudio to ${messageIdStr}`);
            return messageIdStr;
          });
          setIsPausedAudio(null);
          setIsAutoPlaying(isAutoPlay);
          await new Promise(resolve => setTimeout(resolve, 500));
          await audio.play();
          console.log(`[handlePlayAudio] Started TTS for message ${messageIdStr}`);
        } catch (err) {
          console.error(`[handlePlayAudio] TTS Error:`, err);
          appendNotification(`TTS error: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
          stopAudio();
        }
      };
      playTTS().catch(error => {
        console.error(`[handlePlayAudio] Error starting TTS:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        appendNotification(`Failed to start audio: ${errorMessage}`, true);
        stopAudio();
      });
    } else if (typeof actualAudioUrlOrContent === 'string' && actualAudioUrlOrContent.trim() !== "") {
      const audio = new Audio(actualAudioUrlOrContent);
      currentAudio.current = audio;
      currentMessageId.current = messageIdStr;

      audio.onended = () => {
        stopAudio();
        console.log(`[handlePlayAudio] Audio ended for message ${messageIdStr}`);
      };
      audio.onerror = (e) => {
        const errorMessage = e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown audio error';
        stopAudio();
        appendNotification(`Failed to play audio: ${errorMessage}`, true);
        console.error(`[handlePlayAudio] Audio error for message ${messageIdStr}:`, e);
      };
      setIsPlayingAudio(() => {
        console.log(`[handlePlayAudio] Setting isPlayingAudio to ${messageIdStr}`);
        return messageIdStr;
      });
      setIsPausedAudio(null);
      setIsAutoPlaying(isAutoPlay);
      new Promise<void>(resolve => setTimeout(resolve, 500)).then(() => {
        audio.play().then(() => {
          console.log(`[handlePlayAudio] Started audio for message ${messageIdStr}`);
        }).catch(error => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[handlePlayAudio] Error starting audio:`, error);
          appendNotification(`Failed to play audio: ${errorMessage}`, true);
          stopAudio();
        });
      }).catch(err => {
        console.error('Promise error:', err);
      });
    } else {
      appendNotification("No valid audio source available.", true);
      stopAudio();
    }
  }, [messages, stopAudio, appendNotification, isPausedAudio, isPlayingAudio]);

  const handleStopAudio = useCallback((messageId: string | number) => {
    const messageIdStr = String(messageId);
    if (currentMessageId.current === messageIdStr) {
      stopAudio();
      console.log(`[handleStopAudio] Stopped audio for message ${messageIdStr}`);
    }
  }, [stopAudio]);

  const handleSubmit = useCallback(async (text: string, inputMode: "text" | "voice" = "text"): Promise<void> => {
    if (!text.trim() || !session?.user?.id) {
      appendNotification('Please sign in or enter a message.', true);
      return;
    }
    setIsLoading(true);
    try {
      let newChatId = chatId;
      const timestamp = Date.now();
      const userMessageId = `user-${timestamp}-${Math.random().toString(36).slice(2, 9)}`;
      const tempUserMessage: Message = {
        id: userMessageId,
        content: text,
        role: 'user',
        createdAt: new Date(),
        chatId: chatId ?? -1,
        audioUrl: null,
      };
      setMessages(prev => {
        const newMessages = [...prev, tempUserMessage];
        console.log('[handleSubmit] Added temp user message:', newMessages.map(m => ({ id: m.id, role: m.role, content: m.content, audioUrl: m.audioUrl })));
        return newMessages;
      });

      let finalAiMessage: Message | null = null;

      if (chatId) {
        const messageData = {
          chatId,
          content: text,
          role: "user" as const,
          ...(inputMode === "voice" && { voice: selectedVoice }),
        };
        const backendResponse = await addMessageMutation.mutateAsync(messageData);
        if (!backendResponse) throw new Error('Invalid server response.');
        const aiMessageId = `ai-${chatId}-${Date.now()}`;
        const aiAudioUrl = inputMode === "voice" ? "TTS_ON_DEMAND_PLACEHOLDER" : backendResponse.audioUrl || null;
        const aiMessageForUI: Message = {
          id: aiMessageId,
          chatId,
          content: backendResponse.text,
          role: 'assistant',
          audioUrl: aiAudioUrl,
          createdAt: new Date(),
        };
        setMessages(prev => {
          const newMessages = [...prev.filter(m => m.id !== userMessageId), { ...tempUserMessage, id: `user-${chatId}-${timestamp}` }, aiMessageForUI];
          console.log('[handleSubmit] Updated messages:', newMessages.map(m => ({ id: m.id, role: m.role, content: m.content, audioUrl: m.audioUrl })));
          return newMessages;
        });
        finalAiMessage = aiMessageForUI;
      } else {
        const createData = {
          firstMessage: text,
          ...(inputMode === "voice" && { voice: selectedVoice }),
        };
        const createResponse = await createChatMutation.mutateAsync(createData);
        if (!createResponse?.id) throw new Error('Failed to create chat.');
        newChatId = createResponse.id;
        void router.push(`/chat/${newChatId}`);
        const userMessage: Message = {
          id: `user-${newChatId}-${timestamp}`,
          chatId: newChatId,
          content: text,
          role: 'user',
          audioUrl: null,
          createdAt: new Date(),
        };
        const aiMessage: Message = {
          id: `ai-${newChatId}-${timestamp}`,
          chatId: newChatId,
          content: createResponse.text,
          role: 'assistant',
          audioUrl: inputMode === "voice" ? "TTS_ON_DEMAND_PLACEHOLDER" : createResponse.audioUrl || null,
          createdAt: new Date(),
        };
        setMessages([userMessage, aiMessage]);
        console.log('[handleSubmit] Created new chat messages:', [{ id: userMessage.id, role: userMessage.role, content: userMessage.content, audioUrl: userMessage.audioUrl }, { id: aiMessage.id, role: aiMessage.role, content: aiMessage.content, audioUrl: aiMessage.audioUrl }]);
        finalAiMessage = aiMessage;
      }

      await Promise.all([
        utils.chat.getById.invalidate({ id: newChatId ?? chatId }),
        utils.chat.getAll.invalidate(),
      ]);

      if (inputMode === "voice" && finalAiMessage) {
        const cleanContent = finalAiMessage.content
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<strong>(.*?)<\/strong>/g, '$1')
          .replace(/<em>(.*?)<\/em>/g, '$1')
          .replace(/<li>/gi, '• ')
          .replace(/<\/li>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        if (cleanContent && cleanContent.replace(/\s/g, '').length > 0) {
          console.log(`[handleSubmit] Triggering auto-play for message ${finalAiMessage.id}:`, cleanContent.substring(0, 100) + '...');
          setTimeout(() => {
            handlePlayAudio(finalAiMessage.id, `TTS_ON_DEMAND:${cleanContent}`, selectedVoice, true);
          }, 200);
        } else {
          console.warn(`[handleSubmit] No valid content to play for message ${finalAiMessage.id}`);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      appendNotification(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      setInputText("");
      setIsLoading(false);
    }
  }, [chatId, appendNotification, utils, router, createChatMutation, addMessageMutation, session, handlePlayAudio, selectedVoice]);

  const handleAgentTransfer = useCallback(async () => {
    appendNotification("Transferring to a human agent...", false);
    setTimeout(() => appendNotification("Connected to a human agent.", false), 2000);
  }, [appendNotification]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShowScrollToBottom(false);
      isUserScrolledUpRef.current = false;
    }
  }, []);

  if (status === 'loading') return <div>በመጫን ላይ...</div>;
  if (!session?.user?.id) return null;

  console.log('[ChatInterface] Rendered with', { isAutoPlaying, isPlayingAudio, isPausedAudio });

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex flex-col-reverse space-y-reverse space-y-4">
              <ChatMessages
                messages={messages}
                notifications={notifications}
                isPlayingAudio={isPlayingAudio}
                isPausedAudio={isPausedAudio}
                onPlayAudio={handlePlayAudio}
                onPauseAudio={handlePauseAudio}
                onStopAudio={handleStopAudio}
                selectedVoice={selectedVoice}
                inputMode={inputMode}
              />
            </div>
          </div>
          {/* Placeholder when no messages - Placed OUTSIDE the scrollable area, just above buttons/input */}
              {messages.length === 0 && (
                <div className="flex items-center justify-center py-4"> {/* Added py-4 for padding */}
                  <p className="text-center text-sm text-muted-foreground">
                    ምን እንርዳዎት? ውይይቱን ለማስጀመር መልእክት ይላኩ።
                  </p>
                </div>
              )}



          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl animate-bounce"
              aria-label="Scroll to latest messages"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          )}
          {isAutoPlaying && isPlayingAudio && !isPausedAudio && (
            <button
              onClick={() => {
                stopAudio();
                console.log('[FloatingStopButton] Stopped auto-playing audio');
              }}
              className="fixed bottom-24 right-24 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-700 focus:ring-2 focus:ring-red-300"
              aria-label="Stop auto-playing audio"
            >
              <Square className="h-5 w-5" />
            </button>
          )}
          <div className="w-full border-t bg-background p-4">
            <ChatInput
              inputText={inputText}
              setInputText={setInputText}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              chatId={chatId}
              userMessageCount={messages.filter(m => m.role === "user").length}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              appendNotification={appendNotification}
              isStreaming={false}
              onStopStreaming={() => { /* noop */ }}
            />
          </div>
          <TransferModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onTransfer={handleAgentTransfer}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}