import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { phone, name, referralCode } = await req.json();

  if (!phone || !name) {
    return NextResponse.json({ error: "Телефон и имя обязательны" }, { status: 400 });
  }

  // Check if already exists
  const existing = await prisma.partner.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "Партнёр с этим номером уже зарегистрирован" }, { status: 400 });
  }

  // Find referrer if code provided
  let referredById: string | undefined;
  if (referralCode) {
    const referrer = await prisma.partner.findUnique({
      where: { referralCode },
    });
    if (referrer) {
      referredById = referrer.id;
    }
  }

  const partner = await prisma.partner.create({
    data: {
      phone,
      name,
      referralCode: nanoid(8),
      referredById,
    },
  });

  const token = await signToken({ id: partner.id, phone: partner.phone, type: "partner" });

  const response = NextResponse.json({ success: true, partner: { id: partner.id, name: partner.name } });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
