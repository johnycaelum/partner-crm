"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"email" | "code" | "not-found">("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);
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
      body: JSON.stringify({ email, intent: "login" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      if (data.redirect) { router.push(`${data.redirect}?email=${encodeURIComponent(email)}`); return; }
      setError(data.error); return;
    }
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
      body: JSON.stringify({ email, code }),
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
            <span style={{ color: "white", fontSize: "20px", fontWeight: 800 }}>₽</span>
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
              Email <strong>{email}</strong> не зарегистрирован в системе. Зарегистрируйтесь, чтобы стать партнёром.
            </p>
            <Link href={`/register?email=${encodeURIComponent(email)}`} className="btn-primary" style={{ display: "block", padding: "0.7rem", fontSize: "0.9rem", textDecoration: "none", textAlign: "center" }}>
              Зарегистрироваться
            </Link>
            <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }}
              style={{ width: "100%", padding: "0.5rem", marginTop: "12px", background: "none", border: "none", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer" }}>
              Попробовать другой email
            </button>
          </div>
        ) : step === "email" ? (
          <form onSubmit={sendCode}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="input-glass" style={{ marginBottom: "16px" }} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "0.7rem", fontSize: "0.9rem" }}>
              {loading ? "Отправка..." : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px", textAlign: "center" }}>
              Код отправлен на <strong style={{ color: "#1e293b" }}>{email}</strong>
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
            <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); setDevCode(""); }}
              style={{ width: "100%", padding: "0.5rem", marginTop: "8px", background: "none", border: "none", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer" }}>
              Изменить email
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
