import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  if (session.type === "partner") {
    const partner = await prisma.partner.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, phone: true, referralCode: true, balance: true },
    });
    return NextResponse.json({ type: "partner", user: partner });
  }

  return NextResponse.json({ type: "admin", user: { email: session.email } });
}
