"use client";
import { use } from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import {
  Loader2,
  Phone,
  Users,
  Headphones,
  MessageCircle,
  CheckCircle,
  Clock,
  BadgeCheck
} from "lucide-react";
import { cn } from "~/lib/utils";

const agentNames = ["ሳራ", "ሚካኤል", "አይሻ", "ዳዊት", "እሌኒ", "ዮሃንስ", "ፋጢማ", "ሳምራዊት", "ማርቆስ", "አሊ"];


export default function TransferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chatId = parseInt(id);

  const { data: session } = useSession();
  const { data: chat } = api.chat.getById.useQuery(
    { id: chatId },
    { enabled: !!chatId }
  );

  const [currentStage, setCurrentStage] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [agentName, setAgentName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [stagesCompleted, setStagesCompleted] = useState<boolean[]>([false, false, false, false]);

  const transferStages = [
    {
      title: "Connecting to Customer Service",
      description: "Searching for available agents...",
      icon: <Phone className="h-6 w-6 text-primary" />,
      completed: stagesCompleted[0]
    },
    {
      title: "Retrieving Your Conversation",
      description: "Loading your chat history...",
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      completed: stagesCompleted[1]
    },
    {
      title: "Assigning Specialist",
      description: "Finding the right agent for your query...",
      icon: <Users className="h-6 w-6 text-primary" />,
      completed: stagesCompleted[2]
    },
    {
      title: "Finalizing Connection",
      description: "Preparing for secure transfer...",
      icon: <BadgeCheck className="h-6 w-6 text-primary" />,
      completed: stagesCompleted[3]
    }
  ];



  useEffect(() => {
    if (isConnected) return;

    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    const stageTimers = [
      setTimeout(() => {
        setStagesCompleted(prev => {
          const updated = [...prev];
          updated[0] = true;
          return updated;
        });
        setCurrentStage(1);
      }, 2000),

      setTimeout(() => {
        setStagesCompleted(prev => {
          const updated = [...prev];
          updated[1] = true;
          return updated;
        });
        setCurrentStage(2);
      }, 5000),

      setTimeout(() => {
        const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)];
        setAgentName(randomAgent ?? "");
        setStagesCompleted(prev => {
          const updated = [...prev];
          updated[2] = true;
          return updated;
        });
        setCurrentStage(3);
      }, 8000),

      setTimeout(() => {
        setStagesCompleted(prev => {
          const updated = [...prev];
          updated[3] = true;
          return updated;
        });
        setIsConnected(true);
        setTimeout(() => {
          setShowConfirmation(true);
        }, 1000);
      }, 11000)
    ];

    return () => {
      clearInterval(timer);
      stageTimers.forEach(clearTimeout);
    };
  }, [isConnected]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 p-3">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading chat details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            <div className={cn(
              "rounded-full p-4 transition-all duration-300",
              isConnected
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-primary/10"
            )}>
              {isConnected ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <Headphones className="h-10 w-10 text-primary" />
              )}
            </div>
            {!isConnected && (
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20" />
            )}
            {!isConnected && (
              <div className="absolute -inset-2 animate-ping rounded-full border-2 border-primary/40" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isConnected ? "ጥያቄዎ ወደ ደንበኞች አገልግሎት ተላልፏል!" : "ወደ ደንበኞች አገልግሎት ማዕከል እየተላለፉ ነው!!! "}
            </h1>
            <p className="text-muted-foreground max-w-[80%]">
              {isConnected
                ? `አሁን እየተነጋገሩ ያሉት ከ ${agentName} ጋር ነው, የደንበኞች አገልግሎት ስፔሻሊስት`
                : "በጥያቄዎ ላይ ሊረዳዎ ከሚችል የቀጥታ ወኪል ጋር እያገናኘንዎት ነው። እባኮትን ጥቂት ሰከንዶች ይጠብቁ።"}
            </p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              {transferStages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2",
                    stage.completed || currentStage > index
                      ? "bg-primary text-primary-foreground"
                      : currentStage === index
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  )}>
                    {stage.completed || currentStage > index ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={cn(
                    "mt-2 text-sm font-medium",
                    stage.completed || currentStage > index
                      ? "text-primary"
                      : currentStage === index
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}>
                    Step {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-muted" />
              <div
                className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
                style={{ width: `${Math.min((currentStage / (transferStages.length - 1)) * 100, 100)}%` }}
              />
            </div>

            <div className="rounded-lg border p-4 text-left">
              <div className="flex items-start gap-3">
                {transferStages[currentStage]?.icon}
                <div>
                  <h3 className="font-semibold">{transferStages[currentStage]?.title}</h3>
                  <p className="text-muted-foreground text-sm">{transferStages[currentStage]?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  የሚገመተው የጥበቃ ጊዜ: {Math.max(5 - Math.floor(waitTime / 3), 0)} ደቂቃ {Math.max(5 - Math.floor(waitTime / 3), 0) !== 1 ? '.' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  ያለው ክፍት ቦታ: {Math.max(2 - Math.floor(waitTime / 4), 1)} ከ 5
                </span>
              </div>
            </div>
          )}

          {showConfirmation && (
            <div className="animate-fade-in rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/30 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    ተሳክቷል ጥያቄዎ ተላልፏል!
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    ንግግርዎ ደህንነቱ በተጠበቀ ሁኔታ ወደ ~ {agentName} ~ ተላልፏል። በቅርቡ ከእርስዎ ጋር ይሆናሉ።
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              ወደ ውይይት ተመለስ
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {isConnected
                ? "በማንኛውም ጊዜ ወደ ውይይት መመለስ ትችላለህ - ወኪልዎን በድጋሚ ማግኘት ይችላሉ።"
                : "ወደ ውይይት ቢመለሱም ከነበሩበት መቀጠል ይችላሉ።"}
            </p>
          </div>

          {!isConnected && (
            <div className="mt-2 rounded-lg border bg-muted/50 p-3 text-left text-sm text-muted-foreground">
              <p className="font-medium mb-1"> በመጠበቅ ላይ እያሉ:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>የሚፈልጉትን ማንኛውንም የጥያቄ ዝርዝሮች እንደገና ይከልሱ</li>
                <li>ለጥያቄዎ እሚያስፈልጉ አባሪ መረጃዎችን ያዘጋጁ</li>
                <li>ጸጥ ባለ አካባቢ ውስጥ መሆንዎን ያረጋግጡ</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "mt-6 flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm",
        isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
      )}>
        <div className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-yellow-500"
        )} />
        <span>
          {isConnected ? "Secure connection established" : "Connecting securely..."}
        </span>
      </div>
    </div>
  );
}