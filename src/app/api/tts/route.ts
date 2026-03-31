import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = "sk_c5d605819d2b4563a7b04e2b1e9c3761fb3a46d6eb869ae9";
const VOICE_ID = "7G0NvIkWRnU0Dqjgz13p";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.9,
          speed: 1.0,
        },
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    },
  });
}
