import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const consultations = await prisma.consultation.findMany({
    where: { name: { not: "" } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(consultations);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id, status } = await req.json();

  await prisma.consultation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true });
}
