// src/server/api/routers/chat.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";

// Helper to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

// Fetch response from RAG API
async function getRAGResponse(query: string): Promise<string> {
  try {
    const res = await fetch("http://localhost:8000/rag/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`RAG API error: ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    let fullText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      try {
        const data = JSON.parse(chunk) as { answer?: string; text?: string; message?: string; response?: string };
        fullText += data.answer ?? data.text ?? data.message ?? data.response ?? chunk;
      } catch {
        fullText += chunk; // Fallback for non-JSON chunks
      }
    }
    return fullText.trim() || "ምንም ምላሽ አልተገኘም።";
  } catch (error) {
    console.error("RAG API error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch RAG response: ${getErrorMessage(error)}`,
    });
  }
}

// --- Simplified getTTSAndSave function (Non-Saving Approach) ---
// This function signals that TTS is available on-demand by returning a placeholder.
async function getTTSAndSave({
  input,
  voice: _voice,
  response_format: _response_format = "mp3",
}: {
  input: string;
  voice: string;
  response_format?: string;
}): Promise<string> {
  if (!input?.trim()) {
    console.warn("[getTTSAndSave] Missing or empty input text, returning fallback URL.");
    return "/file_example_MP3_1MG.mp3";
  }
  // --- Key Change: Do not fetch or save audio ---
  // Return a placeholder indicating TTS is available for this message content.
  console.log(`[getTTSAndSave] TTS requested for text (length ${input.length}). Returning placeholder.`);
  // This placeholder tells the frontend: "TTS is available for the associated message content".
  return "TTS_ON_DEMAND_PLACEHOLDER";
}

// Helper to save user and assistant messages
async function saveUserAndAssistantMessages({
  ctx,
  chatId,
  userContent,
  assistantContent,
  userRole = "user",
}: {
  ctx: { db: PrismaClient; session: { user: { id: string } } }; // Include session in ctx type
  chatId: number;
  userContent: string;
  assistantContent: string;
  userRole?: "user" | "assistant";
}) {
  await ctx.db.message.createMany({
    data: [
      { content: userContent, role: userRole, chatId },
      { content: assistantContent, role: "assistant", chatId },
    ],
  });
}

export const chatRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstMessage: z.string().min(1),
        voice: z.enum(["am-ET-AmehaNeural", "am-ET-MekdesNeural"]).default("am-ET-MekdesNeural"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("[create] input:", input);
      const chatName = input.firstMessage.split(" ").slice(0, 3).join(" ");
      const chat = await ctx.db.chatHistory.create({
        data: {
          name: chatName,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      const aiResponse = await getRAGResponse(input.firstMessage);
      // --- Key Change: Call getTTSAndSave to get placeholder ---
      const response_format = "mp3";
      const audioUrl = await getTTSAndSave({
        input: aiResponse,
        voice: input.voice,
        response_format,
      });

      await saveUserAndAssistantMessages({
        ctx: { db: ctx.db, session: ctx.session }, // Pass full ctx
        chatId: chat.id,
        userContent: input.firstMessage,
        assistantContent: aiResponse,
      });

      return {
        id: chat.id,
        text: aiResponse,
        audioUrl, // This will be "TTS_ON_DEMAND_PLACEHOLDER"
      };
    }),

  addMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        content: z.string().min(1),
        role: z.enum(["user", "assistant"]),
        // --- Key Change: Make voice optional ---
        // Only pass 'voice' if TTS is needed for the *response* (e.g., voice input -> AI response)
        voice: z.enum(["am-ET-AmehaNeural", "am-ET-MekdesNeural"]).optional(), // Make optional
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("[addMessage] input:", input);
      const chat = await ctx.db.chatHistory.findFirst({
        where: {
          id: input.chatId,
          createdById: ctx.session.user.id,
        },
      });
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found or unauthorized",
        });
      }

      const aiResponse = await getRAGResponse(input.content);
      let audioUrl = ""; // Default to empty string

      // --- Key Change: Only generate TTS placeholder if voice was specified ---
      // This implies the frontend requested TTS (e.g., because the input was voice)
      if (input.voice) {
        const response_format = "mp3";
        audioUrl = await getTTSAndSave({
          input: aiResponse,
          voice: input.voice,
          response_format,
        });
        // audioUrl will be "TTS_ON_DEMAND_PLACEHOLDER"
      }

      await saveUserAndAssistantMessages({
        ctx: { db: ctx.db, session: ctx.session }, // Pass full ctx
        chatId: input.chatId,
        userContent: input.content,
        assistantContent: aiResponse,
        userRole: input.role,
      });

      return {
        text: aiResponse,
        audioUrl, // Will be "TTS_ON_DEMAND_PLACEHOLDER" or ""
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.chatHistory.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.chatHistory.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found or unauthorized",
        });
      }
      return chat;
    }),

  rename: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chatHistory.findFirst({
        where: {
          id: input.chatId,
          createdById: ctx.session.user.id,
        },
      });
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found or unauthorized",
        });
      }
      return ctx.db.chatHistory.update({
        where: { id: input.chatId },
        data: { name: input.name },
      });
    }),

  deleteChat: protectedProcedure
    .input(z.object({ chatId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chatHistory.findFirst({
        where: {
          id: input.chatId,
          createdById: ctx.session.user.id,
        },
      });
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found or unauthorized",
        });
      }
      await ctx.db.chatHistory.delete({
        where: { id: input.chatId },
      });
      return { success: true };
    }),

});
