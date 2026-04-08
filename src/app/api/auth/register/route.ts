import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
  const { email, phone, name, referralCode } = await req.json();

  if (!email || !name || !phone) {
    return NextResponse.json({ error: "Email, имя и телефон обязательны" }, { status: 400 });
  }

  // Check if already exists by email
  const existing = await prisma.partner.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Партнёр с этим email уже зарегистрирован" }, { status: 400 });
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
      phone: phone || "",
      email,
      name,
      referralCode: nanoid(8),
      referredById,
    },
  });

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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("register error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
