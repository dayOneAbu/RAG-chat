"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Loader2 } from "lucide-react";

export default function TransferPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const chatId = parseInt(params.id);
  const [waitTime, setWaitTime] = useState(0);

  const { data: chat } = api.chat.getById.useQuery(
    { id: chatId },
    { enabled: !!chatId }
  );

  // Simulate waiting time (this will be replaced with actual queue system)
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-semibold">Connecting to an Agent</h1>
          <p className="text-muted-foreground">
            You are being transferred to a live agent. Please wait while we connect you.
          </p>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Estimated wait time: {Math.max(5 - Math.floor(waitTime / 60), 0)} minutes
            </p>
            <p className="text-sm text-muted-foreground">
              Queue position: 2 {/* This will be dynamic in the real implementation */}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Return to Chat
            </Button>
            <p className="text-xs text-muted-foreground">
              You won&apos;t lose your place in queue if you return to chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}