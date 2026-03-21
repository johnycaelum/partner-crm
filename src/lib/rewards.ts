import { prisma } from "./prisma";

export async function calculateAndCreateRewards(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { partner: true },
  });

  if (!client || client.status !== "contracted") return;

  const partner = client.partner;

  // Count previously contracted clients (excluding current one)
  const confirmedCount = await prisma.client.count({
    where: {
      partnerId: partner.id,
      status: "contracted",
      id: { not: clientId },
    },
  });

  // Direct reward: 10000 for 1st client, 15000 for 2nd+
  const directAmount = confirmedCount === 0 ? 10000 : 15000;

  await prisma.$transaction(async (tx) => {
    // Create direct reward
    await tx.reward.create({
      data: {
        partnerId: partner.id,
        clientId: clientId,
        amount: directAmount,
        type: "direct",
      },
    });

    // Update partner balance
    await tx.partner.update({
      where: { id: partner.id },
      data: { balance: { increment: directAmount } },
    });

    // Passive reward for parent (level 2)
    if (partner.referredById) {
      await tx.reward.create({
        data: {
          partnerId: partner.referredById,
          clientId: clientId,
          amount: 1000,
          type: "passive",
        },
      });

      await tx.partner.update({
        where: { id: partner.referredById },
        data: { balance: { increment: 1000 } },
      });
    }
  });
}
