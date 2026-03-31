import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.vapi.ai/call/web", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 3bd1fd8a-a97c-4757-aea1-32cde5716d40",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId: "cc273cf4-80f8-46c4-a04c-b3c9240be51c",
    }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
