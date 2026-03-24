import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

const AI_API_URL = "https://cbucompany-bot-production.up.railway.app/api/chat";

// POST — send message to AI and save conversation
export async function POST(req: NextRequest) {
  const { message, sessionId, consultationId } = await req.json();

  if (!message || !sessionId) {
    return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 });
  }

  // Send to AI
  let aiResponse = "";
  try {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    const data = await res.json();
    aiResponse = data.response || "Извините, произошла ошибка. Попробуйте позже.";
  } catch {
    aiResponse = "Не удалось связаться с сервером. Попробуйте позже.";
  }

  // Save/update consultation in DB
  if (consultationId) {
    const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
    if (consultation) {
      const messages = JSON.parse(consultation.messages || "[]");
      messages.push({ role: "user", text: message });
      messages.push({ role: "bot", text: aiResponse });
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { messages: JSON.stringify(messages) },
      });
    }
  }

  return NextResponse.json({ response: aiResponse, consultationId });
}

// PATCH — save contact info and send to Telegram
export async function PATCH(req: NextRequest) {
  const { consultationId, name, phone } = await req.json();

  if (!consultationId || !name || !phone) {
    return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 });
  }

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation) {
    return NextResponse.json({ error: "Консультация не найдена" }, { status: 404 });
  }

  // Build summary from messages
  const messages = JSON.parse(consultation.messages || "[]") as { role: string; text: string }[];
  const summary = messages
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.text}`)
    .join("\n\n");

  await prisma.consultation.update({
    where: { id: consultationId },
    data: { name, phone, summary },
  });

  // Send to Telegram
  const tgText = `<b>▸ Заявка с партнёрского сайта</b>\n─────────────\n<b>Имя:</b> ${name}\n<b>Тел:</b> ${phone}\n─────────────\n<b>Диалог:</b>\n${summary}\n─────────────\n${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Krasnoyarsk" })}`;
  await sendTelegramMessage(tgText);

  return NextResponse.json({ success: true });
}

// PUT — create new consultation
export async function PUT() {
  const consultation = await prisma.consultation.create({ data: {} });
  return NextResponse.json({ id: consultation.id });
}
