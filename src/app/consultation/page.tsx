"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function ConsultationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => "consult_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9));
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create consultation and show greeting
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/consultation", { method: "PUT" });
      const data = await res.json();
      setConsultationId(data.id);
    })();
    setMessages([{
      role: "bot",
      text: "Здравствуйте! Я виртуальный помощник. Помогу разобраться в вопросах банкротства и списания долгов. Задайте вопрос или выберите тему ниже.",
    }]);
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages]);

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);

    setMessages(prev => [...prev, { role: "user", text: msg }]);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId, consultationId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.response }]);

      // After 4+ user messages, suggest leaving contact
      const userMsgCount = messages.filter(m => m.role === "user").length + 1;
      if (userMsgCount >= 3 && !showContactForm && !submitted) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "bot",
            text: "Хотите записаться на бесплатную консультацию с юристом? Оставьте ваши контакты и мы свяжемся с вами в ближайшее время.",
          }]);
          setShowContactForm(true);
        }, 1500);
      }
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Ошибка связи с сервером. Попробуйте позже." }]);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function submitContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !consultationId) return;
    setSubmitting(true);
    await fetch("/api/consultation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultationId, name, phone }),
    });
    setSubmitting(false);
    setSubmitted(true);
    setShowContactForm(false);
    setMessages(prev => [...prev, {
      role: "bot",
      text: "Спасибо, " + name + "! Мы получили ваши данные и свяжемся с вами в ближайшее время. А пока вы можете продолжить задавать вопросы.",
    }]);
  }

  const quickBtns = [
    "Что такое банкротство?",
    "Какие долги можно списать?",
    "Сколько это стоит?",
    "Какие документы нужны?",
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #dbeafe 0%, #f0f9ff 40%, #ede9fe 100%)" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white",
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <a href="/" style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </a>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>ИИ-Консультант</div>
          <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>Центр Банкротства Юрист — cbucompany.ru</div>
          <div style={{ fontSize: "0.72rem", opacity: 0.85, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            Онлайн — отвечаю мгновенно
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "cbu-fade-in .3s ease" }}>
            <div style={{
              maxWidth: "85%", padding: "12px 16px", borderRadius: 16, fontSize: "0.92rem", lineHeight: 1.55, wordWrap: "break-word",
              ...(msg.role === "user"
                ? { background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", borderBottomRightRadius: 4 }
                : { background: "white", color: "#1e293b", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }),
            }} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br>") }} />
          </div>
        ))}

        {sending && (
          <div style={{ display: "flex" }}>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, borderBottomLeftRadius: 4, padding: "12px 16px", display: "flex", gap: 5 }}>
              <span style={{ width: 7, height: 7, background: "#94a3b8", borderRadius: "50%", animation: "cbu-typing .8s infinite" }} />
              <span style={{ width: 7, height: 7, background: "#94a3b8", borderRadius: "50%", animation: "cbu-typing .8s infinite .15s" }} />
              <span style={{ width: 7, height: 7, background: "#94a3b8", borderRadius: "50%", animation: "cbu-typing .8s infinite .3s" }} />
            </div>
          </div>
        )}

        {/* Contact form */}
        {showContactForm && !submitted && (
          <div style={{ background: "white", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(59,130,246,0.08)", animation: "cbu-fade-in .3s ease" }}>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: 4 }}>Записаться на консультацию</div>
            <div style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 16 }}>Оставьте контакты — юрист свяжется с вами бесплатно</div>
            <form onSubmit={submitContact}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" required
                className="ref-input" style={{ marginBottom: 10 }} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79001234567" required
                className="ref-input" style={{ marginBottom: 14 }} />
              <button type="submit" disabled={submitting} className="ref-submit">
                {submitting ? "Отправка..." : "Записаться на консультацию"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Quick buttons */}
      {messages.length <= 2 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 16px 8px" }}>
          {quickBtns.map(text => (
            <button key={text} onClick={() => send(text)} style={{
              padding: "7px 14px", borderRadius: 16, border: "1px solid #3b82f6",
              background: "white", color: "#3b82f6", fontSize: "0.8rem", cursor: "pointer",
              transition: "all .2s",
            }}>
              {text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, flexShrink: 0 }}>
        <input ref={inputRef} type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ваш вопрос..."
          style={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 24, padding: "12px 18px", fontSize: "0.92rem", outline: "none", transition: "border-color .2s" }}
        />
        <button onClick={() => send()} disabled={sending || !input.trim()} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: input.trim() ? "linear-gradient(135deg, #3b82f6, #818cf8)" : "#e2e8f0",
          border: "none", cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          transition: "all .2s",
        }}>
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>

      <style>{`
        @keyframes cbu-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cbu-typing { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}
