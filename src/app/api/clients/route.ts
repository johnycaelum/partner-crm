import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/telegram";

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
  const commentClean = (comment || "N/A").replace(/[^\x20-\x7E\n]/g, "?");
  const partnerInfo = partner.name || partner.email || "unknown";
  const tgText =
    `<b>New client</b>\n` +
    `<b>Name:</b> ${name}\n` +
    `<b>Phone:</b> ${phone}\n` +
    `<b>Partner:</b> ${partnerInfo}\n` +
    `<b>Info:</b> ${commentClean}`;

  sendTelegramMessage(tgText).catch(() => {});

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
