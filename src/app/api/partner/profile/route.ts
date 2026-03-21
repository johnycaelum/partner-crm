import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";

export async function GET() {
  const session = await getPartnerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const partner = await prisma.partner.findUnique({
    where: { id: session.id },
  });

  return NextResponse.json(partner);
}

export async function PATCH(req: NextRequest) {
  const session = await getPartnerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { name, paymentInfo, cardNumber, cardHolder, bankName } = await req.json();

  const partner = await prisma.partner.update({
    where: { id: session.id },
    data: {
      ...(name !== undefined && { name }),
      ...(paymentInfo !== undefined && { paymentInfo }),
      ...(cardNumber !== undefined && { cardNumber }),
      ...(cardHolder !== undefined && { cardHolder }),
      ...(bankName !== undefined && { bankName }),
    },
  });

  return NextResponse.json(partner);
}
