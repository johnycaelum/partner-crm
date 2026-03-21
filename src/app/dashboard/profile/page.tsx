"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/partner/profile").then(r => r.json()).then(data => {
      setName(data.name || ""); setPhone(data.phone || ""); setPaymentInfo(data.paymentInfo || "");
      setCardNumber(data.cardNumber || ""); setCardHolder(data.cardHolder || ""); setBankName(data.bankName || "");
      setLoading(false);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/partner/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, paymentInfo, cardNumber, cardHolder, bankName }) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return null;

  return (
    <>
      <div className="mb-6 anim-fade-up">
        <h1 className="text-2xl font-bold text-slate-800">Профиль</h1>
        <p className="text-slate-500 text-sm mt-1">Ваши данные и реквизиты для выплат</p>
      </div>

      <div className="glass rounded-2xl p-6 max-w-lg anim-fade-up">
        <form onSubmit={save}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Имя</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-glass" style={{ marginBottom: "16px" }} />

          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Телефон</label>
          <input type="tel" value={phone} disabled className="input-glass" style={{ marginBottom: "16px", opacity: 0.6 }} />

          <div style={{ marginBottom: "20px", padding: "20px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: "16px" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: "16px", marginTop: 0 }}>Реквизиты для выплат</p>

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Номер карты</label>
            <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000"
              maxLength={19} className="input-glass" style={{ marginBottom: "12px" }} />

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>ФИО владельца карты</label>
            <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Иванов Иван Иванович"
              className="input-glass" style={{ marginBottom: "12px" }} />

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Банк</label>
            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Т-Банк, Сбербанк..."
              className="input-glass" style={{ marginBottom: "0" }} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "0.65rem 1.8rem", fontSize: "0.875rem" }}>
            {saving ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить"}
          </button>

          {saved && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, color: "#16a34a", fontSize: "0.82rem", fontWeight: 600 }}>
              Данные успешно сохранены
            </div>
          )}
        </form>
      </div>
    </>
  );
}
