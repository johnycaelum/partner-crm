import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calculateAndCreateRewards } from "@/lib/rewards";

// GET — list all clients
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    include: { partner: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// PATCH — update client status (contract/reject)
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { clientId, status } = await req.json();

  if (!clientId || !["contracted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }

  if (client.status !== "pending") {
    return NextResponse.json({ error: "Статус клиента уже изменён" }, { status: 400 });
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      status,
      contractedAt: status === "contracted" ? new Date() : null,
    },
  });

  // Calculate rewards if contracted
  if (status === "contracted") {
    await calculateAndCreateRewards(clientId);
  }

  return NextResponse.json({ success: true });
}

// DELETE — delete client
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  await prisma.reward.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });

  return NextResponse.json({ success: true });
}
