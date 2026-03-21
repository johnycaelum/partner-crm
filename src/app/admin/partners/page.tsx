"use client";

import { useEffect, useState } from "react";

interface Partner {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  balance: number;
  paymentInfo: string;
  createdAt: string;
  referredBy: { name: string; phone: string } | null;
  _count: { clients: number; referrals: number };
}

const glass: React.CSSProperties = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" };

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/partners").then(r => r.json()).then(data => { setPartners(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return null;

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>Партнёры ({partners.length})</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Все зарегистрированные партнёры</p>
      </div>

      {partners.length === 0 ? (
        <div style={{ ...glass, padding: 48, textAlign: "center" }}>
          <p style={{ color: "#64748b", margin: 0 }}>Партнёров пока нет</p>
        </div>
      ) : (
        <div style={{ ...glass, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 850 }}>
            <thead>
              <tr>
                <th style={thStyle}>Имя</th>
                <th style={thStyle}>Телефон</th>
                <th style={thStyle}>Пригласил</th>
                <th style={thStyle}>Клиентов</th>
                <th style={thStyle}>Команда</th>
                <th style={thStyle}>Баланс</th>
                <th style={thStyle}>Реквизиты</th>
                <th style={thStyle}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td style={{ ...tdStyle, color: "#e2e8f0", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...tdStyle, color: "#94a3b8" }}>{p.phone}</td>
                  <td style={{ ...tdStyle, color: "#64748b" }}>{p.referredBy ? p.referredBy.name : "—"}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>{p._count.clients}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600, background: "rgba(168,85,247,0.12)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.25)" }}>{p._count.referrals}</span>
                  </td>
                  <td style={{ ...tdStyle, color: "#4ade80", fontWeight: 700 }}>{p.balance.toLocaleString("ru-RU")} ₽</td>
                  <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "0.8rem" }}>{p.paymentInfo || "—"}</td>
                  <td style={{ ...tdStyle, color: "#475569" }}>{new Date(p.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
