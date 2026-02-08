"use client";

import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import { MessageCircle, Plus, ChevronLeft } from "lucide-react";
import type { ChatSession } from "~/types/chat";
import { api } from "~/trpc/react";
import { useState, useEffect } from "react";

export function ChatSidebar({
  sessions,
  currentSessionId,
}: {
  sessions: ChatSession[];
  currentSessionId?: number | string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const utils = api.useUtils();
  const createChat = api.chat.create.useMutation({
    onSuccess: (data) => {
      utils.chat.getAll.invalidate();
      window.location.href = `/chat/${data.id}`;
    },
  });

  // Optional: Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-0 overflow-hidden" : "w-[250px] px-4"
      )}
    >
      {/* Sidebar Header with Toggle */}
      <div className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4 transition-colors",
        isCollapsed ? "px-0" : "px-4"
      )}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Chat History</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-transform duration-300",
            isCollapsed ? "rotate-180" : ""
          )}
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea
        className={cn(
          "flex-1 overflow-y-auto px-2 py-2 transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {!isCollapsed && (
          <>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2">No chats yet</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={currentSessionId === session.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 text-left",
                      currentSessionId === session.id && "bg-accent"
                    )}
                    asChild
                  >
                    <Link href={`/chat/${session.id}`}>
                      <MessageCircle className="h-4 w-4" />
                      <span className="truncate">{session.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* New Chat Button */}
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start gap-2 text-left"
              onClick={() => createChat.mutate({ firstMessage: "New Chat" })}
            >
              <Plus className="h-4 w-4" />
              <span className="truncate">New Chat</span>
            </Button>
          </>
        )}
      </ScrollArea>
    </div>
  );
}