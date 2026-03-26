import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";

// POST — submit client application (from referral link)
export async function POST(req: NextRequest) {
  const { name, phone, comment, referralCode } = await req.json();

  if (!name || !phone || !referralCode) {
    return NextResponse.json({ error: "Имя, телефон и реферальный код обязательны" }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({
    where: { referralCode },
  });

  if (!partner) {
    return NextResponse.json({ error: "Неверный реферальный код" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name,
      phone,
      comment: comment || "",
      partnerId: partner.id,
    },
  });

  // Send to Telegram (don't await - fire and forget)
  const partnerInfo = partner.name || partner.email || "unknown";
  const tgText = [
    "New client request",
    "",
    "Name: " + name,
    "Phone: " + phone,
    "Partner: " + partnerInfo,
    "",
    comment || "N/A",
  ].join("\n");

  // Send without HTML parse mode to avoid encoding issues
  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
  const TG_CHAT_ID = process.env.TG_CHAT_ID || "";
  if (TG_BOT_TOKEN && TG_CHAT_ID) {
    fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: tgText }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, clientId: client.id });
}

// GET — get partner's clients
export async function GET() {
  const session = await getPartnerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { partnerId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}
