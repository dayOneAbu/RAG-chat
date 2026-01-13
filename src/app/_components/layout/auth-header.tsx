"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-end">
        {session ? (
          <Button 
            variant="ghost" 
            onClick={async () => {
              await signOut({ redirect: false });
              router.replace("/");
            }}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout p
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/signin">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signup">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 