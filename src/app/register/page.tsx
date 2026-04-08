"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"email" | "code" | "info">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [checking, setChecking] = useState(true);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.type === "partner") router.replace("/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const refParam = searchParams.get("ref");
    if (emailParam) { setEmail(emailParam); }
    if (refParam) setReferralCode(refParam);
  }, [searchParams]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, intent: "register" }) });
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
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    if (data.needsRegistration) { setStep("info"); return; }
    router.push("/dashboard");
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, phone, name, referralCode: referralCode || undefined }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/dashboard");
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "rgba(241,245,249,0.7)", border: "1px solid rgba(203,213,225,0.6)", borderRadius: 12, fontSize: "0.875rem", color: "#334155", outline: "none", marginBottom: 16, boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 };
  const btnStyle: React.CSSProperties = { width: "100%", padding: "12px", background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" };

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Загрузка...</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.85)", borderRadius: 24, padding: "40px 32px", boxShadow: "0 4px 20px rgba(59,130,246,0.07)" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Регистрация</h1>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>Партнёрская программа от <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>Центра Банкротства Юрист</a></p>
        </div>

        {step === "email" && (
          <form onSubmit={sendCode}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={inputStyle} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: 16 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
              {loading ? "Отправка..." : "Получить код"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verifyCode}>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 16, textAlign: "center" }}>
              Код отправлен на <strong style={{ color: "#1e293b" }}>{email}</strong>
              <br /><span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Если письма нет во входящих — проверьте папку Спам</span>
            </p>
            {devCode && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: 12, marginBottom: 16, textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#d97706" }}>DEV: Ваш код</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#92400e", letterSpacing: "0.2em" }}>{devCode}</div>
              </div>
            )}
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="1234" maxLength={4}
              style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em", fontWeight: 700 }} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: 16 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
          </form>
        )}

        {step === "info" && (
          <form onSubmit={register}>
            <label style={labelStyle}>Ваше имя</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Иванов" required style={inputStyle} />
            <label style={labelStyle}>Телефон</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79001234567" required style={inputStyle} />
            <label style={labelStyle}>Реферальный код (если есть)</label>
            <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="abc12345" style={inputStyle} />
            {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: 16 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#94a3b8", marginTop: 24 }}>
          Уже есть аккаунт?{" "}
          <Link href="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
