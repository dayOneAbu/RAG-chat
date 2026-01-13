"use client";  // Add this at the top since we need client-side interactivity

import { useSession } from "next-auth/react";
import { ChatInterface } from "~/app/_components/chat/chat-interface";
import { Sidebar } from "~/app/_components/layout/sidebar";
import { cn } from "~/lib/utils";
import Link from "next/link";
import Image from "next/image";


export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      // <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex min-h-screen items-center justify-center ">
        <div className="flex flex-col items-center rounded-lg bg-card p-10 shadow-lg h-90 bg-gradient-to-br from-blue-400 to-darkblue-800 -mt-20">
          <Image
            src="/bank-logo.gif"
            alt="ባንክ አርማ"
            width={160}
            height={160}
            className="mb-15"
            unoptimized
          />
          <div className="flex gap-15 mb-4">
  <Link href="/auth/signin">
   <button className="bg-gray-200 px-10 py-2 rounded-xl border text-sm font-medium 
  text-neutral-800 border-neutral-300 hover:bg-neutral-100 
  dark:text-black dark:border-neutral-700 dark:hover:bg-neutral-600 
  transition duration-200">
  ይግቡ
</button>
  </Link>
  <Link href="/auth/signup">
    <button className="px-6 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-600 transition duration-200">
      ይመዝገቡ
    </button>
  </Link>
</div>
{/*<div className="flex justify-end mt-2">
  <Link href="/auth/forgot-password" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors duration-200">
    የመክፈቻ ቃልዎን እረስተዋል?
  </Link>
</div>*/}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
   
      <div className="flex flex-1">
        <Sidebar />
        <div 
          className={cn(
            "flex-1",
            "pl-[250px]"
          )}
        >
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
