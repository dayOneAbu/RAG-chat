// src/app/api/tts/route.ts
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "am-ET-AmehaNeural" } = await req.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward request to local TTS server
    const ttsRes = await fetch("http://localhost:5050/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, voice, response_format: "mp3" }),
    });

    if (!ttsRes.ok) {
      throw new Error(`TTS API error: ${ttsRes.status}`);
    }

    // Stream back the raw MP3
    const arrayBuffer = await ttsRes.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate speech" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}