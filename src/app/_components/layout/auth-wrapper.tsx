"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      {session && <Sidebar />}
      <main className={session ? "ml-64 flex-1 p-6" : "flex-1 p-6"}>
        {children}
      </main>
    </div>
  );
} 