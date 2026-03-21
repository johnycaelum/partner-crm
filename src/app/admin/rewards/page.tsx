"use client";

import { useEffect, useState } from "react";

interface Reward {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  partner: { name: string; phone: string };
  client: { name: string };
}

const glass: React.CSSProperties = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" };

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRewards(); }, []);

  function loadRewards() {
    fetch("/api/admin/rewards").then(r => r.json()).then(data => { setRewards(Array.isArray(data) ? data : []); setLoading(false); });
  }

  async function markPaid(rewardId: string) {
    await fetch("/api/admin/rewards", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rewardId }) });
    loadRewards();
  }

  if (loading) return null;

  const totalPending = rewards.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const totalPaid = rewards.filter(r => r.status === "paid").reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>Выплаты</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Управление вознаграждениями партнёров</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ ...glass, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>К выплате</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f59e0b" }}>{totalPending.toLocaleString("ru-RU")} ₽</div>
          </div>
          <div style={{ ...glass, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Выплачено</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#4ade80" }}>{totalPaid.toLocaleString("ru-RU")} ₽</div>
          </div>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div style={{ ...glass, padding: 48, textAlign: "center" }}>
          <p style={{ color: "#64748b", margin: 0 }}>Начислений пока нет</p>
        </div>
      ) : (
        <div style={{ ...glass, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 700 }}>
            <thead>
              <tr>
                <th style={thStyle}>Партнёр</th>
                <th style={thStyle}>Клиент</th>
                <th style={thStyle}>Тип</th>
                <th style={thStyle}>Сумма</th>
                <th style={thStyle}>Статус</th>
                <th style={thStyle}>Дата</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {rewards.map(r => (
                <tr key={r.id}>
                  <td style={tdStyle}>
                    <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{r.partner.name}</div>
                    <div style={{ color: "#475569", fontSize: "0.75rem" }}>{r.partner.phone}</div>
                  </td>
                  <td style={{ ...tdStyle, color: "#94a3b8" }}>{r.client.name}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600,
                      ...(r.type === "direct"
                        ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }
                        : { background: "rgba(168,85,247,0.12)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.25)" }),
                    }}>
                      {r.type === "direct" ? "Прямой" : "Пассивный"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#e2e8f0" }}>{r.amount.toLocaleString("ru-RU")} ₽</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600,
                      ...(r.status === "paid"
                        ? { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }
                        : { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }),
                    }}>
                      {r.status === "paid" ? "Выплачено" : "Ожидает"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#475569" }}>{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td style={tdStyle}>
                    {r.status === "pending" && (
                      <button onClick={() => markPaid(r.id)} style={{
                        padding: "6px 14px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                        color: "#4ade80", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
                      }}>
                        Выплатить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
