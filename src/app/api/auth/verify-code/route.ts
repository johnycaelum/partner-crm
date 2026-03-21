import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (!phone || !code) {
    return NextResponse.json({ error: "Телефон и код обязательны" }, { status: 400 });
  }

  // Find valid code
  const smsCode = await prisma.smsCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!smsCode) {
    return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 400 });
  }

  // Mark code as used
  await prisma.smsCode.update({
    where: { id: smsCode.id },
    data: { used: true },
  });

  // Find partner
  const partner = await prisma.partner.findUnique({ where: { phone } });

  if (!partner) {
    // Partner not registered yet — return needs_registration
    return NextResponse.json({ needsRegistration: true, phone });
  }

  // Create session
  const token = await signToken({ id: partner.id, phone: partner.phone, type: "partner" });

  const response = NextResponse.json({ success: true, partner: { id: partner.id, name: partner.name } });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
