"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Mode = "choose" | "client" | "partner" | "partner-code" | "partner-info" | "success";

interface ChatMsg { role: "user" | "bot"; text: string; }

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 };

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const referralCode = params.code as string;

  const [mode, setMode] = useState<Mode>("choose");

  // Client form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+7");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [hasProperty, setHasProperty] = useState("");

  // Partner form
  const [partnerEmail, setPartnerEmail] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [devCode, setDevCode] = useState("");

  // Chat state
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [sessionId] = useState(() => "ref_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9));
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Init chat when entering client mode
  useEffect(() => {
    if (mode === "client" && chatMsgs.length === 0) {
      setChatMsgs([{ role: "bot", text: "Здравствуйте! Я виртуальный помощник. Задайте любой вопрос о банкротстве и списании долгов — помогу разобраться." }]);
      fetch("/api/consultation", { method: "PUT" }).then(r => r.json()).then(d => setConsultationId(d.id));
    }
  }, [mode]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatMsgs]);

  async function chatSend(text?: string) {
    const msg = text || chatInput.trim();
    if (!msg || chatSending) return;
    setChatInput("");
    setChatSending(true);
    setChatMsgs(prev => [...prev, { role: "user", text: msg }]);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId, consultationId }),
      });
      const data = await res.json();
      setChatMsgs(prev => [...prev, { role: "bot", text: data.response }]);
    } catch {
      setChatMsgs(prev => [...prev, { role: "bot", text: "Ошибка связи. Попробуйте позже." }]);
    }
    setChatSending(false);
  }

  async function submitClient(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const comment = [
      debtAmount && `Сумма долга: ${debtAmount}`,
      debtTypes.length && `Тип долгов: ${debtTypes.join(", ")}`,
      hasProperty && `Имущество: ${hasProperty}`,
    ].filter(Boolean).join("\n");
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: clientName, phone: clientPhone, comment, referralCode }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    // Also save consultation contact
    if (consultationId && clientName && clientPhone) {
      await fetch("/api/consultation", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultationId, name: clientName, phone: clientPhone }) });
    }
    setMode("success");
    setLoading(false);
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: partnerEmail, intent: "register" }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    const match = data.message?.match(/\d{4}/);
    if (match) setDevCode(match[0]);
    setMode("partner-code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: partnerEmail, code: smsCode }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    if (data.needsRegistration) { setMode("partner-info"); return; }
    router.push("/dashboard");
  }

  async function registerPartner(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: partnerEmail, name: partnerName, referralCode }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/dashboard");
  }

  const errorEl = error ? <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: 16, textAlign: "center" }}>{error}</p> : null;
  const backIcon = <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

  const quickBtns = ["Что такое банкротство?", "Какие долги можно списать?", "Сколько стоит?", "Какие документы нужны?"];

  // ===== SUCCESS =====
  if (mode === "success") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div className="ref-card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Заявка отправлена!</h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
        </div>
      </div>
    );
  }

  // ===== CLIENT MODE — two columns =====
  if (mode === "client") {
    return (
      <div style={{ minHeight: "100vh", padding: "20px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => { setMode("choose"); setError(""); }} className="ref-back" style={{ marginBottom: 20 }}>{backIcon} Назад</button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            {/* On desktop: 2 columns */}
            <style>{`@media(min-width:768px){.ref-two-col{grid-template-columns:1fr 1fr !important;}}`}</style>
            <div className="ref-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

              {/* LEFT — form */}
              <div className="ref-card" style={{ maxWidth: "none", height: "fit-content" }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Бесплатная консультация</h2>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 20px", lineHeight: 1.5 }}>Оставьте заявку — юрист свяжется с вами и поможет разобраться в ситуации. Это бесплатно и ни к чему не обязывает.</p>
                </div>

                <form onSubmit={submitClient}>
                  <label style={labelStyle}>Ваше имя *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Иван Иванов" required className="ref-input" />
                  <label style={labelStyle}>Телефон *</label>
                  <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+79001234567" required className="ref-input" />
                  <label style={labelStyle}>Сумма долга *</label>
                  <select value={debtAmount} onChange={e => setDebtAmount(e.target.value)} required className="ref-input" style={{ cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                    <option value="" disabled>Выберите сумму</option>
                    <option value="до 300 000 ₽">до 300 000 ₽</option>
                    <option value="300 000 — 1 000 000 ₽">300 000 — 1 000 000 ₽</option>
                    <option value="1 000 000 — 3 000 000 ₽">1 000 000 — 3 000 000 ₽</option>
                    <option value="более 3 000 000 ₽">более 3 000 000 ₽</option>
                  </select>

                  <label style={labelStyle}>Тип долгов</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {["Кредиты", "Микрозаймы", "ЖКХ", "Налоги", "Штрафы", "Другое"].map(t => {
                      const active = debtTypes.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => setDebtTypes(prev => active ? prev.filter(x => x !== t) : [...prev, t])}
                          style={{
                            padding: "7px 16px", borderRadius: 12, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                            border: active ? "2px solid #3b82f6" : "1px solid rgba(203,213,225,0.6)",
                            background: active ? "rgba(59,130,246,0.08)" : "rgba(241,245,249,0.7)",
                            color: active ? "#3b82f6" : "#64748b",
                            transition: "all .15s ease",
                          }}>
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  <label style={labelStyle}>Есть ли имущество? *</label>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    {[
                      { value: "Нет имущества", label: "Нет" },
                      { value: "Есть квартира/дом", label: "Квартира/дом" },
                      { value: "Есть автомобиль", label: "Автомобиль" },
                      { value: "Есть квартира и авто", label: "И то, и другое" },
                    ].map(opt => {
                      const active = hasProperty === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => setHasProperty(opt.value)}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                            border: active ? "2px solid #3b82f6" : "1px solid rgba(203,213,225,0.6)",
                            background: active ? "rgba(59,130,246,0.08)" : "rgba(241,245,249,0.7)",
                            color: active ? "#3b82f6" : "#64748b",
                            transition: "all .15s ease", textAlign: "center",
                          }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {errorEl}
                  <button type="submit" disabled={loading} className="ref-submit">
                    {loading ? "Отправка..." : "Отправить заявку"}
                  </button>
                </form>

                {/* Benefits */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Бесплатная консультация", "Без обязательств", "Ответ в течение часа"].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748b" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — chat */}
              <div style={{
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.9)", borderRadius: 24, overflow: "hidden",
                display: "flex", flexDirection: "column", height: 580, boxShadow: "0 8px 32px rgba(59,130,246,0.1)",
              }}>
                {/* Chat header */}
                <div style={{ background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>ИИ-Помощник</div>
                    <div style={{ fontSize: "0.72rem", opacity: 0.85, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                      Задавайте вопросы — отвечу мгновенно
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc" }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: "0.85rem", lineHeight: 1.5, wordWrap: "break-word",
                        ...(m.role === "user"
                          ? { background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", borderBottomRightRadius: 4 }
                          : { background: "white", color: "#1e293b", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4 }),
                      }} dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br>") }} />
                    </div>
                  ))}
                  {chatSending && (
                    <div style={{ display: "flex" }}>
                      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, borderBottomLeftRadius: 4, padding: "10px 14px", display: "flex", gap: 4 }}>
                        <span className="chat-dot" /><span className="chat-dot" style={{ animationDelay: ".15s" }} /><span className="chat-dot" style={{ animationDelay: ".3s" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick buttons */}
                {chatMsgs.length <= 2 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 8px", background: "#f8fafc" }}>
                    {quickBtns.map(t => (
                      <button key={t} onClick={() => chatSend(t)} style={{
                        padding: "5px 12px", borderRadius: 14, border: "1px solid #3b82f6",
                        background: "white", color: "#3b82f6", fontSize: "0.75rem", cursor: "pointer", transition: "all .2s",
                      }}>{t}</button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div style={{ padding: "10px 14px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, flexShrink: 0 }}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && chatSend()} placeholder="Ваш вопрос..."
                    style={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 20, padding: "10px 16px", fontSize: "0.85rem", outline: "none" }} />
                  <button onClick={() => chatSend()} disabled={chatSending || !chatInput.trim()} style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: chatInput.trim() ? "linear-gradient(135deg, #3b82f6, #818cf8)" : "#e2e8f0",
                    border: "none", cursor: chatInput.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .chat-dot { width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:dotBounce .8s infinite; }
          @keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        `}</style>
      </div>
    );
  }

  // ===== CHOOSE / PARTNER FLOW (card layout) =====
  const card: React.CSSProperties = {
    width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.9)", borderRadius: 24,
    padding: "32px 24px", boxShadow: "0 8px 32px rgba(59,130,246,0.1)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={card} className="anim-fade-up">

        {/* Choose */}
        {mode === "choose" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 20px rgba(59,130,246,0.35)" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3 }}>Списание долгов через банкротство</h1>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Выберите, что вас интересует</p>
            </div>
            <button onClick={() => setMode("client")} className="ref-btn-main">
              <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4 }}>Мне нужна помощь с долгами</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>Консультация + запись к юристу</div>
            </button>
            <button onClick={() => setMode("partner")} className="ref-btn-alt">
              <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4, color: "#3b82f6" }}>Хочу зарабатывать как партнёр</div>
              <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 400 }}>Приглашать клиентов и получать от 10 000 ₽</div>
            </button>
          </>
        )}

        {/* Partner: phone */}
        {mode === "partner" && (
          <>
            <button onClick={() => { setMode("choose"); setError(""); }} className="ref-back">{backIcon} Назад</button>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Стать партнёром</h1>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Зарабатывайте от 10 000 ₽ за каждого клиента</p>
            </div>
            <form onSubmit={sendCode}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="name@example.com" className="ref-input" />
              {errorEl}
              <button type="submit" disabled={loading} className="ref-submit">{loading ? "Отправка..." : "Получить код"}</button>
            </form>
          </>
        )}

        {/* Partner: code */}
        {mode === "partner-code" && (
          <>
            <button onClick={() => { setMode("partner"); setError(""); setDevCode(""); setSmsCode(""); }} className="ref-back">{backIcon} Назад</button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Введите код</h1>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Код отправлен на <strong style={{ color: "#1e293b" }}>{partnerEmail}</strong></p>
            </div>
            {devCode && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: 12, marginBottom: 16, textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#d97706" }}>DEV: Ваш код</span>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#92400e", letterSpacing: "0.25em" }}>{devCode}</div>
              </div>
            )}
            <form onSubmit={verifyCode}>
              <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="1234" maxLength={4}
                className="ref-input" style={{ textAlign: "center", fontSize: "1.8rem", letterSpacing: "0.3em", fontWeight: 700, padding: 14 }} />
              {errorEl}
              <button type="submit" disabled={loading} className="ref-submit">{loading ? "Проверка..." : "Подтвердить"}</button>
            </form>
          </>
        )}

        {/* Partner: name */}
        {mode === "partner-info" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Почти готово!</h1>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Укажите имя для регистрации</p>
            </div>
            <form onSubmit={registerPartner}>
              <label style={labelStyle}>Ваше имя</label>
              <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Иван Иванов" required className="ref-input" />
              {errorEl}
              <button type="submit" disabled={loading} className="ref-submit">{loading ? "Регистрация..." : "Зарегистрироваться"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
