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

  // Generate 4-digit code
  const code = String(Math.floor(1000 + Math.random() * 9000));

  // Save code to DB
  await prisma.smsCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  // Send SMS via SMS.ru
  const smsApiId = process.env.SMSRU_API_ID;

  if (smsApiId) {
    try {
      const phoneDigits = phone.replace("+", "");
      const smsUrl = `https://sms.ru/sms/send?api_id=${smsApiId}&to=${phoneDigits}&msg=${encodeURIComponent(`Ваш код: ${code}`)}&json=1`;
      const smsRes = await fetch(smsUrl);
      const smsData = await smsRes.json();
      console.log(`SMS sent to ${phone}:`, smsData);

      if (smsData.status !== "OK") {
        console.error(`SMS.ru error:`, smsData);
      }
    } catch (e) {
      console.error("SMS send error:", e);
    }
  } else {
    console.log(`\nSMS Code for ${phone}: ${code}\n`);
  }

  // В dev-режиме возвращаем код прямо в ответе для тестирования
  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    success: true,
    message: isDev ? `Код отправлен: ${code}` : "Код отправлен",
  });
}
