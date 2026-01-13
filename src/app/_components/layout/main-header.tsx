"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

export function MainHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-sm">
  <img src="/chatbot.gif" alt="AI Assistant" className="w-8 h-8 object-contain" />
  <span className="font-semibold text-lg">የደንበኞች ድጋፍ ማዕከል</span>
</div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {session && (
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut({ redirect: false });
              router.replace("/");
            }}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            ውጣ
          </Button>
        )}
      </div>
    </header>
  );
} 