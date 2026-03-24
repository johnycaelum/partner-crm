import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function sendEmailViaResend(to: string, code: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CBU Partner <noreply@cbupartner.ru>",
      reply_to: "kadmonitoring@gmail.com",
      to,
      subject: `Код подтверждения: ${code}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:440px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(59,130,246,0.1);">
    <div style="background:linear-gradient(135deg,#3b82f6,#818cf8);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:1.3rem;font-weight:800;">Центр Банкротства Юрист</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:0.85rem;">Партнёрская программа</p>
    </div>
    <div style="padding:32px 28px;">
      <p style="color:#475569;font-size:0.9rem;line-height:1.6;margin:0 0 24px;">Для завершения регистрации введите код подтверждения на сайте. Код действителен <b>10 минут</b>.</p>
      <div style="text-align:center;margin:24px 0;padding:20px;background:#f0f9ff;border-radius:14px;border:2px dashed #bfdbfe;">
        <div style="font-size:2.4rem;font-weight:900;letter-spacing:0.25em;color:#3b82f6;">${code}</div>
      </div>
      <p style="color:#94a3b8;font-size:0.8rem;text-align:center;margin:24px 0 0;">Если вы не регистрировались — просто проигнорируйте это письмо.<br>Никому не сообщайте этот код.</p>
    </div>
    <div style="padding:16px 28px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:0.75rem;">&copy; Центр Банкротства Юрист &middot; <a href="https://cbucompany.ru" style="color:#3b82f6;text-decoration:none;">cbucompany.ru</a></p>
    </div>
  </div>
</body></html>`,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, intent } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Введите корректный email" },
        { status: 400 }
      );
    }

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
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await sendEmailViaResend(email, code);
    } catch (e) {
      console.error("Email send error:", e);
    }

    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json({
      success: true,
      message: isDev ? `Код отправлен: ${code}` : "Код отправлен на email",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("send-code error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
