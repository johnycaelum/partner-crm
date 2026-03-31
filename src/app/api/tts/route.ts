import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { readFile, unlink } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const outFile = join("/tmp", `tts-${Date.now()}.mp3`);

  try {
    // Use edge-tts CLI (Python package) on server
    await new Promise<void>((resolve, reject) => {
      exec(
        `/usr/local/bin/edge-tts --voice ru-RU-SvetlanaNeural --text "${text.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --write-media ${outFile}`,
        { timeout: 15000 },
        (err) => (err ? reject(err) : resolve())
      );
    });

    const audio = await readFile(outFile);
    await unlink(outFile).catch(() => {});

    return new NextResponse(audio, {
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
