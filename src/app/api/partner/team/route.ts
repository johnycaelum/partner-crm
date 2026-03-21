import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";

export async function GET() {
  const session = await getPartnerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const team = await prisma.partner.findMany({
    where: { referredById: session.id },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: { select: { clients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(team);
}
