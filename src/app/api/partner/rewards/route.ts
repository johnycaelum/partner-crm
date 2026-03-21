import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";

export async function GET() {
  const session = await getPartnerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const rewards = await prisma.reward.findMany({
    where: { partnerId: session.id },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rewards);
}
