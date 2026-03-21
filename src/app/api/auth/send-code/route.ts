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

  // Send SMS via SMSC.ru
  const smscLogin = process.env.SMSC_LOGIN;
  const smscPassword = process.env.SMSC_PASSWORD;

  if (smscLogin && smscPassword) {
    try {
      const smsUrl = `https://smsc.ru/sys/send.php?login=${encodeURIComponent(smscLogin)}&psw=${encodeURIComponent(smscPassword)}&phones=${encodeURIComponent(phone)}&mes=${encodeURIComponent(`Ваш код: ${code}`)}&fmt=3`;
      const smsRes = await fetch(smsUrl);
      const smsData = await smsRes.json();
      console.log(`SMS sent to ${phone}:`, smsData);

      if (smsData.error) {
        console.error(`SMSC error: ${smsData.error}`);
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
