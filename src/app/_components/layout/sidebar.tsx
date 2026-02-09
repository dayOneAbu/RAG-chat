
"use client";

import { ScrollArea } from "~/app/_components/ui/scroll-area";
import { Button } from "~/app/_components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/app/_components/ui/collapsible";
import { api } from "~/trpc/react";
import { Pencil, Trash2, X, Menu } from "lucide-react";
import { useState } from "react";
import { Input } from "~/app/_components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
 



export function Sidebar() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: chats = [] } = api.chat.getAll.useQuery();


  const deleteChat = api.chat.deleteChat.useMutation({
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "fixed inset-y-0 left-0 z-50 mt-[90px] mb-16 flex flex-col h-screen bg-card border-r border-border shadow-2xl transition-all duration-300 ease-in-out",
        isOpen ? "w-[250px]" : "w-[60px]"
      )}
    >
      {/* Toggle Button */}
      <CollapsibleTrigger asChild>
        <div className="p-2 border-b border-border flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </Button>
        </div>
      </CollapsibleTrigger>

      {/* Sidebar Content */}
      <CollapsibleContent className="flex-1 flex flex-col h-full">
        {/* Search bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="የቻት ርዕስ ፈልግ..."
              className="rounded-lg bg-background"
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button
            className="mt-4 w-full bg-black text-white font-medium py-2 px-4 rounded-xl shadow hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition duration-200"
            onClick={() => void router.push("/")}
          >
            አዲስ ውይይት ጀምር
          </Button>
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
                      if (e.key === "Enter") void handleEdit(chat.id);
                    }}
                    className="flex-1 rounded bg-background px-2 py-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 truncate text-sm font-medium">
                    {chat.name.length > 15 ? chat.name.slice(0, 15) + '…' : chat.name}
                  </span>
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
                     void handleDelete(chat.id);
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
      </CollapsibleContent>

      {/* Modal is now handled elsewhere */}
    </Collapsible>
  );
}
