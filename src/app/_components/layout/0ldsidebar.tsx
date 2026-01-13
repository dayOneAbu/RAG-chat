"use client";

import { ScrollArea } from "~/app/_components/ui/scroll-area";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { Pencil, Trash2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

// Modal for transfer (placeholder)
function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card p-8 rounded-lg shadow-lg min-w-[300px] flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">ወደ ደንበኞች አገልግሎት ሰራተኞች ይቀይሩ</h2>
        <Button onClick={onClose} className="mt-4">ይዝጉ</Button>
      </div>
    </div>
  );
}

type ChatList = RouterOutputs["chat"]["getAll"];

export function Sidebar() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: chats = [] } = api.chat.getAll.useQuery();

  // Assume current chatId is in the URL as /chat/[id]
  const chatId = useMemo(() => {
    const match = /\/chat\/(\d+)/.exec(pathname);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  // Get current chat's messages
  const { data: currentChat } = api.chat.getById.useQuery(
    { id: chatId! },
    { enabled: !!chatId }
  );
  const userMessageCount = currentChat?.messages.filter(m => m.role === "user").length ?? 0;

  const deleteChat = api.chat.deleteChat.useMutation({   //delete.usemutation
    onSuccess: () => {
      void utils.chat.getAll.invalidate();
      router.push('/');
    }
  });

  const renameChat = api.chat.rename.useMutation({
    onSuccess: () => {
      void utils.chat.getAll.invalidate();
      setEditingId(null);
    }
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      void deleteChat.mutateAsync({ chatId: id });
    }
  };
  const handleEdit = async (id: number) => {
    if (editingId === id) {
      if (editName.trim()) {
        void renameChat.mutateAsync({ chatId: id, name: editName.trim() });
      }
      setEditingId(null);
    } else {
      const chat = chats.find(c => c.id === id);
      if (chat) {
        setEditName(chat.name);
        setEditingId(id);
      }
    }
  };

  // Filter chats by search
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-[250px] h-screen bg-card border-r border-border shadow-2xl">
      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="የቻት ርዕስ ፈልግ..."
          className="rounded-lg bg-background"
        />
        {search && (
          <button
            className="absolute right-6 top-6 text-muted-foreground"
            onClick={() => setSearch("")}
          >
            <X size={16} />
          </button>
        )}
        <button
  className="mt-4 w-full bg-black text-white font-medium py-2 px-4 rounded-xl shadow hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition duration-200"
  onClick={() => void router.push("/")}
>
  አዲስ ውይይት ጀምር
</button>
      </div>
      {/* Chat list */}
      <ScrollArea className="flex-1">
        <ul className="p-2 space-y-1">
          {filteredChats.map(chat => (
            <li
              key={chat.id}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                pathname === `/chat/${chat.id}`
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              {editingId === chat.id ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleEdit(chat.id)}
                  onKeyDown={e => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    if (e.key === "Enter") handleEdit(chat.id);
                  }}
                  className="flex-1 rounded bg-background px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 truncate text-sm font-medium">{chat.name.length > 15 ? chat.name.slice(0, 15) + '…' : chat.name}</span>
              )}
              <div className="flex items-center gap-1 ml-2">
                <button
                  className="p-1 hover:bg-muted rounded"
                  onClick={e => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                  }}
                  title="Rename"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="p-1 hover:bg-muted rounded"
                  onClick={e => {
                    e.stopPropagation();
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    handleDelete(chat.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      {/* Modal is now handled elsewhere */}
    </aside>
  );
} 