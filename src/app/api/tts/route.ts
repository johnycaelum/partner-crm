import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = "sk_c5d605819d2b4563a7b04e2b1e9c3761fb3a46d6eb869ae9";
const VOICE_ID = "7G0NvIkWRnU0Dqjgz13p";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const body = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.65,
      similarity_boost: 0.9,
    },
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body,
    redirect: "follow",
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    console.error("ElevenLabs error:", res.status, err);
    return NextResponse.json({ error: "TTS failed", status: res.status, detail: err }, { status: 500 });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    },
  });
}
