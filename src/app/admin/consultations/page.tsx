"use client";

import { useEffect, useState } from "react";

interface Consultation {
  id: string;
  name: string;
  phone: string;
  messages: string;
  summary: string;
  status: string;
  createdAt: string;
}

const glass: React.CSSProperties = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20 };

const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new: { label: "Новая", bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  contacted: { label: "Связались", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  closed: { label: "Закрыта", bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
};

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  function load() {
    fetch("/api/admin/consultations").then(r => r.json()).then(data => { setConsultations(Array.isArray(data) ? data : []); setLoading(false); });
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/consultations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  }

  async function deleteConsultation(id: string) {
    if (!confirm("Delete this consultation?")) return;
    await fetch("/api/admin/consultations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  if (loading) return null;

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>Консультации ({consultations.length})</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Заявки с ИИ-консультанта — данные из диалогов</p>
      </div>

      {consultations.length === 0 ? (
        <div style={{ ...glass, padding: 48, textAlign: "center" }}>
          <p style={{ color: "#64748b", margin: 0 }}>Консультаций пока нет</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {consultations.map(c => {
            const msgs = JSON.parse(c.messages || "[]") as { role: string; text: string }[];
            const st = statusMap[c.status] || statusMap.new;
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id} style={{ ...glass, padding: 20 }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f1f5f9" }}>{c.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: 2 }}>{c.phone}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#475569" }}>{new Date(c.createdAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>

                {/* Summary preview */}
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: 12, lineHeight: 1.5 }}>
                  {msgs.length} сообщений в диалоге
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: isExpanded ? 16 : 0 }}>
                  <button onClick={() => setExpanded(isExpanded ? null : c.id)} style={{
                    padding: "6px 14px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                    color: "#60a5fa", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    {isExpanded ? "Скрыть диалог" : "Показать диалог"}
                  </button>
                  {c.status === "new" && (
                    <button onClick={() => updateStatus(c.id, "contacted")} style={{
                      padding: "6px 14px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                      color: "#60a5fa", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                    }}>
                      Связались
                    </button>
                  )}
                  {c.status !== "closed" && (
                    <button onClick={() => updateStatus(c.id, "closed")} style={{
                      padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                      color: "#4ade80", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                    }}>
                      Закрыть
                    </button>
                  )}
                  <button onClick={() => deleteConsultation(c.id)} style={{
                    padding: "6px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    Удалить
                  </button>
                </div>

                {/* Expanded messages */}
                {isExpanded && msgs.length > 0 && (
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                    {msgs.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "80%", padding: "8px 14px", borderRadius: 12, fontSize: "0.82rem", lineHeight: 1.5,
                          ...(m.role === "user"
                            ? { background: "rgba(59,130,246,0.2)", color: "#93c5fd", borderBottomRightRadius: 4 }
                            : { background: "rgba(255,255,255,0.06)", color: "#cbd5e1", borderBottomLeftRadius: 4 }),
                        }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
