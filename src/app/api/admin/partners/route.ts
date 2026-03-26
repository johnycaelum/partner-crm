import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const partners = await prisma.partner.findMany({
    include: {
      _count: { select: { clients: true, referrals: true } },
      referredBy: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(partners);
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { partnerId } = await req.json();

  // Delete related records first
  await prisma.reward.deleteMany({ where: { partnerId } });
  await prisma.client.deleteMany({ where: { partnerId } });
  await prisma.partner.delete({ where: { id: partnerId } });

  return NextResponse.json({ success: true });
}
