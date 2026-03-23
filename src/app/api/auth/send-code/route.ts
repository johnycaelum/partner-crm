import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !/^\+7\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "Введите корректный номер телефона (+7XXXXXXXXXX)" },
      { status: 400 }
    );
  }

  const smsApiId = process.env.SMSRU_API_ID;
  const phoneDigits = phone.replace("+", "");
  let code: string;
  let method: "call" | "sms" | "dev" = "dev";

  if (smsApiId) {
    // Try voice call first (0.40 rub, works on all operators)
    try {
      const callUrl = `https://sms.ru/code/call?phone=${phoneDigits}&ip=-1&api_id=${smsApiId}&json=1`;
      const callRes = await fetch(callUrl);
      const callData = await callRes.json();
      console.log(`Call auth to ${phone}:`, callData);

      if (callData.status === "OK" && callData.code) {
        code = String(callData.code);
        method = "call";
      } else {
        // Fallback to SMS
        code = String(Math.floor(1000 + Math.random() * 9000));
        const smsUrl = `https://sms.ru/sms/send?api_id=${smsApiId}&to=${phoneDigits}&msg=${encodeURIComponent(`Ваш код: ${code}`)}&json=1`;
        const smsRes = await fetch(smsUrl);
        const smsData = await smsRes.json();
        console.log(`SMS fallback to ${phone}:`, smsData);
        method = "sms";
      }
    } catch (e) {
      console.error("Auth send error:", e);
      code = String(Math.floor(1000 + Math.random() * 9000));
    }
  } else {
    code = String(Math.floor(1000 + Math.random() * 9000));
    console.log(`\nDEV Code for ${phone}: ${code}\n`);
  }

  // Save code to DB
  await prisma.smsCode.create({
    data: {
      phone,
      code: code!,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    success: true,
    method,
    message: isDev
      ? `Код отправлен: ${code!}`
      : method === "call"
        ? "Вам поступит звонок — введите последние 4 цифры номера"
        : "Код отправлен в SMS",
  });
}
