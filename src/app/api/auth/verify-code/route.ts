import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email и код обязательны" }, { status: 400 });
  }

  // Find valid code
  const smsCode = await prisma.smsCode.findFirst({
    where: {
      email,
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

  // Find partner by email
  const partner = await prisma.partner.findFirst({ where: { email } });

  if (!partner) {
    return NextResponse.json({ needsRegistration: true, email });
  }

  // Create session
  const token = await signToken({ id: partner.id, phone: partner.phone, type: "partner" });

  const response = NextResponse.json({ success: true, partner: { id: partner.id, name: partner.name } });
  const thirtyDays = 30 * 24 * 60 * 60;
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: thirtyDays,
    expires: new Date(Date.now() + thirtyDays * 1000),
    path: "/",
  });

  return response;
}
