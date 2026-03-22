"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code" | "not-found">("phone");
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    const match = data.message?.match(/\d{4}/);
    if (match) setDevCode(match[0]);
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    if (data.needsRegistration) {
      setStep("not-found");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="glass anim-fade-up" style={{ width: "100%", maxWidth: "400px", borderRadius: "24px", padding: "40px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Вход в кабинет</h1>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>Партнёрская программа от <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>Центра Банкротства Юрист</a></p>
        </div>

        {step === "not-found" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Аккаунт не найден</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              Номер <strong>{phone}</strong> не зарегистрирован в системе. Зарегистрируйтесь, чтобы стать партнёром.
            </p>
            <Link href={`/register?phone=${encodeURIComponent(phone)}`} className="btn-primary" style={{ display: "block", padding: "0.7rem", fontSize: "0.9rem", textDecoration: "none", textAlign: "center" }}>
              Зарегистрироваться
            </Link>
            <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              style={{ width: "100%", padding: "0.5rem", marginTop: "12px", background: "none", border: "none", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer" }}>
              Попробовать другой номер
            </button>
          </div>
        ) : step === "phone" ? (
          <form onSubmit={sendCode}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Номер телефона</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79001234567" className="input-glass" style={{ marginBottom: "16px" }} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.7rem", fontSize: "0.9rem" }}>
              {loading ? "Отправка..." : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px", textAlign: "center" }}>
              Код отправлен на <strong style={{ color: "#1e293b" }}>{phone}</strong>
            </p>
            {devCode && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "12px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#d97706" }}>DEV: Ваш код</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#92400e", letterSpacing: "0.2em" }}>{devCode}</div>
              </div>
            )}
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="1234" maxLength={4}
              className="input-glass" style={{ marginBottom: "16px", textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em", fontWeight: 700 }} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.7rem", fontSize: "0.9rem" }}>
              {loading ? "Проверка..." : "Войти"}
            </button>
            <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); setDevCode(""); }}
              style={{ width: "100%", padding: "0.5rem", marginTop: "8px", background: "none", border: "none", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer" }}>
              Изменить номер
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#94a3b8", marginTop: "24px" }}>
          Нет аккаунта?{" "}
          <Link href="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
