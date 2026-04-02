import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = [
  "You are Anna (female), a consultant at Center Bankrotstva Yurist in Abakan, Russia.",
  "You are a WOMAN. Always use FEMININE forms in Russian: ya pozvonila, ya rada, ya gotova, etc.",
  "You call clients who left requests about debt relief and personal bankruptcy.",
  "",
  "Ask questions ONE AT A TIME. After each answer, ask the next question.",
  "1) Ask total debt amount. 2) Ask who they owe (banks, microloans, utilities).",
  "3) Ask about property (apartment, car). 4) Ask about official income.",
  "5) Give brief assessment (1-2 sentences MAX). 6) Offer free consultation.",
  "",
  "CRITICAL RULES:",
  "- Speak ONLY Russian.",
  "- MAX 1-2 short sentences per reply. Like a real phone conversation.",
  "- Be warm, caring, professional.",
  "- NEVER discuss real estate sales, car sales, mortgages, windows, or anything except debt and bankruptcy.",
  "- Bankruptcy from 500k rubles. Takes 6-9 months. Primary residence protected.",
  "- Company: 8+ years, 187+ cases. Phone: +7 923 399 25 21.",
  "- Address: Abakan, Pushkina 165, 7th floor, office 723.",
].join("\n");

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const res = await fetch("http://148.253.209.114/anthropic/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
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
