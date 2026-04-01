import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = "sk_c5d605819d2b4563a7b04e2b1e9c3761fb3a46d6eb869ae9";
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah - female
const PROXY_URL = "http://148.253.209.114";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  try {
    const res = await fetch(`${PROXY_URL}/tts/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      console.error("TTS error:", res.status, err);
      return NextResponse.json({ error: "TTS failed" }, { status: 500 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
