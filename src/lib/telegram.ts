const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const TG_CHAT_ID = process.env.TG_CHAT_ID || "";

export async function sendTelegramMessage(text: string) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;

  try {
    const body = JSON.stringify({
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: "HTML",
    });

    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body,
    });
  } catch (e) {
    console.error("Telegram send error:", e);
  }
}
