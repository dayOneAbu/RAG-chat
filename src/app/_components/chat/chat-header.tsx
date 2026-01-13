"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  chatId: number;
  initialName: string;
}

export function ChatHeader({ chatId, initialName }: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const router = useRouter();
  const utils = api.useUtils();

  const deleteChat = api.chat.delete.useMutation({
    onSuccess: () => {
      void utils.chat.getAll.invalidate();
      router.push('/');
    }
  });

  const renameChat = api.chat.rename.useMutation({
    onSuccess: () => {
      void utils.chat.getAll.invalidate();
      void utils.chat.getById.invalidate({ id: chatId });
      setIsEditing(false);
    }
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteChat.mutateAsync({ chatId });
    }
  };

  const handleRename = async () => {
    if (isEditing && name.trim() && name !== initialName) {
      await renameChat.mutateAsync({ chatId, name: name.trim() });
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleRename();
    } else if (e.key === "Escape") {
      setName(initialName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-[200px]"
            autoFocus
          />
        ) : (
          <h1 className="text-lg font-semibold">{name}</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (isEditing) {
              setName(initialName);
            }
            void handleRename();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => void handleDelete()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 