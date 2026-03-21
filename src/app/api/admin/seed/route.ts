import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST — create initial admin user
export async function POST() {
  const email = process.env.ADMIN_EMAIL || "admin@company.ru";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Админ уже существует" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: { email, passwordHash },
  });

  return NextResponse.json({ success: true, message: "Админ создан" });
}
