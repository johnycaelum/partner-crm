import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, intent } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Введите корректный email" },
      { status: 400 }
    );
  }

  // Check if partner exists
  const existing = await prisma.partner.findFirst({ where: { email } });

  if (intent === "register" && existing) {
    return NextResponse.json(
      { error: "Этот email уже зарегистрирован", redirect: "/login" },
      { status: 409 }
    );
  }

  if (intent === "login" && !existing) {
    return NextResponse.json(
      { error: "Аккаунт не найден", redirect: "/register" },
      { status: 404 }
    );
  }

  const code = String(Math.floor(1000 + Math.random() * 9000));

  await prisma.smsCode.create({
    data: {
      phone: "",
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Центр Банкротства Юрист <noreply@cbupartner.ru>",
          to: email,
          subject: `Код подтверждения: ${code}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #3b82f6, #818cf8); display: inline-flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 20px; font-weight: bold;">₽</span>
                </div>
              </div>
              <h2 style="text-align: center; color: #0f172a; margin: 0 0 8px;">Ваш код подтверждения</h2>
              <div style="text-align: center; font-size: 36px; font-weight: 900; letter-spacing: 0.2em; color: #3b82f6; margin: 24px 0; padding: 16px; background: #f0f9ff; border-radius: 12px;">${code}</div>
              <p style="text-align: center; color: #64748b; font-size: 14px; margin: 0;">Код действителен 10 минут</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">Партнёрская программа от <a href="https://cbucompany.ru" style="color: #3b82f6;">Центра Банкротства Юрист</a></p>
            </div>
          `,
        }),
      });
      const data = await res.json();
      console.log(`Email sent to ${email}:`, data);
    } catch (e) {
      console.error("Email send error:", e);
    }
  } else {
    console.log(`\nDEV Code for ${email}: ${code}\n`);
  }

  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    success: true,
    message: isDev ? `Код отправлен: ${code}` : "Код отправлен на email",
  });
}
