"use client";

import { useSession } from "next-auth/react";
import { use } from "react";
import { ChatInterface } from "~/app/_components/chat/chat-interface";
import { Sidebar } from "~/app/_components/layout/sidebar";
import { cn } from "~/lib/utils";

export default function ChatPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { id } = use(params);
  const chatId = parseInt(id);

  return (
    <div className="flex min-h-screen flex-col">
  
      <div className="flex flex-1">
        {session && <Sidebar />}
        <div 
          className={cn(
            "flex-1",
            session 
              ? "pl-[250px]" 
              : "mx-auto w-full max-w-5xl px-4"
          )}
        >
          <ChatInterface chatId={chatId} />
        </div>
      </div>
    </div>
  );
} 