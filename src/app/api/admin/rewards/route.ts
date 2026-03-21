import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// GET — list all rewards
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const rewards = await prisma.reward.findMany({
    include: {
      partner: { select: { name: true, phone: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rewards);
}

// PATCH — mark reward as paid
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { rewardId } = await req.json();

  await prisma.reward.update({
    where: { id: rewardId },
    data: { status: "paid" },
  });

  return NextResponse.json({ success: true });
}
