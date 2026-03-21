"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/admin");
  }

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(160deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Админ-панель</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 4 }}>Управление партнёрской программой</p>
        </div>

        <form onSubmit={submit}>
          <label style={{ ...labelStyle, color: "#94a3b8" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="ref-input"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9" }} />
          <label style={{ ...labelStyle, color: "#94a3b8" }}>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="ref-input"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9" }} />
          {error && <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: 16, textAlign: "center" }}>{error}</p>}
          <button type="submit" disabled={loading} className="ref-submit"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
