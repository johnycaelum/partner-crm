import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = [
  "You are Anna, a consultant at Center Bankrotstva Yurist in Abakan, Russia.",
  "You call clients who left requests about debt relief and personal bankruptcy.",
  "",
  "Plan: 1) Introduce yourself, ask if they can talk.",
  "2) Ask total debt amount. 3) Ask who they owe (banks, microloans, utilities).",
  "4) Ask about property. 5) Ask about income.",
  "6) Give 2-3 sentence assessment. 7) Offer free consultation.",
  "",
  "Rules: Speak ONLY Russian. Keep answers 1-2 sentences.",
  "Be warm and professional.",
  "NEVER discuss real estate, car sales, mortgages, windows, or anything except debt and bankruptcy.",
  "Bankruptcy from 500k rubles. Takes 6-9 months. Primary residence protected.",
  "Company: 8+ years, 187+ cases. Phone: +7 923 399 25 21.",
  "Address: Abakan, Pushkina 165, 7th floor, office 723.",
].join("\n");

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || "Izvините, повторите пожалуйста.";

  return NextResponse.json({ text });
}
