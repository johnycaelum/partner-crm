import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = "APIZj9pKehgT9Aq";
const LIVEKIT_API_SECRET = "6WhOpSiU9qzQjMTAGT7UYySWgtrF4akiLoMRmvmGNqL";

export async function GET() {
  const roomName = "voice-" + Date.now();
  const participantName = "user-" + Math.random().toString(36).slice(2, 8);

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({
    token,
    url: "wss://cbucompany-e7tfq6c3.livekit.cloud",
    roomName,
  });
}
