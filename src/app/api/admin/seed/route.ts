import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST — create initial admin user
export async function POST() {
  const email = process.env.ADMIN_EMAIL || "nineo1639@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "one92281337";

  // Delete existing admin and recreate
  await prisma.admin.deleteMany();


  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: { email, passwordHash },
  });

  return NextResponse.json({ success: true, message: "Админ создан" });
}
