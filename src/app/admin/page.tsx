"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  phone: string;
  comment: string;
  status: string;
  createdAt: string;
  partner: { name: string; phone: string };
}

const glass: React.CSSProperties = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" };

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClients(); }, []);

  function loadClients() {
    fetch("/api/admin/clients").then(r => r.json()).then(data => { setClients(Array.isArray(data) ? data : []); setLoading(false); });
  }

  async function updateStatus(clientId: string, status: string) {
    await fetch("/api/admin/clients", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId, status }) });
    loadClients();
  }

  async function deleteClient(clientId: string) {
    if (!confirm("Delete this client?")) return;
    await fetch("/api/admin/clients", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }) });
    loadClients();
  }

  if (loading) return null;

  const pending = clients.filter(c => c.status === "pending");
  const processed = clients.filter(c => c.status !== "pending");

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>Заявки клиентов</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Управление входящими заявками</p>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
            Новые заявки ({pending.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map(client => (
              <div key={client.id} style={{ ...glass, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9" }}>{client.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: 2 }}>{client.phone}</div>
                    {client.comment && <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 6, lineHeight: 1.5 }}>{client.comment}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Партнёр: <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{client.partner.name}</span></div>
                    <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 2 }}>{new Date(client.createdAt).toLocaleDateString("ru-RU")}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => updateStatus(client.id, "contracted")} style={{
                    padding: "8px 20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                    color: "#4ade80", borderRadius: 10, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                    Договор заключён
                  </button>
                  <button onClick={() => updateStatus(client.id, "rejected")} style={{
                    padding: "8px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                    Отклонить
                  </button>
                  <button onClick={() => deleteClient(client.id)} style={{
                    padding: "8px 20px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                    color: "#ef4444", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#94a3b8", marginBottom: 16 }}>Обработанные</h2>
          <div style={{ ...glass, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Клиент</th>
                  <th style={thStyle}>Телефон</th>
                  <th style={thStyle}>Партнёр</th>
                  <th style={thStyle}>Статус</th>
                  <th style={thStyle}>Дата</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {processed.map(c => (
                  <tr key={c.id}>
                    <td style={{ ...tdStyle, color: "#e2e8f0", fontWeight: 600 }}>{c.name}</td>
                    <td style={{ ...tdStyle, color: "#94a3b8" }}>{c.phone}</td>
                    <td style={{ ...tdStyle, color: "#94a3b8" }}>{c.partner.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 600,
                        ...(c.status === "contracted"
                          ? { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }
                          : { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }),
                      }}>
                        {c.status === "contracted" ? "Договор" : "Отклонён"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#475569" }}>{new Date(c.createdAt).toLocaleDateString("ru-RU")}</td>
                    <td style={tdStyle}>
                      <button onClick={() => deleteClient(c.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clients.length === 0 && (
        <div style={{ ...glass, padding: 48, textAlign: "center" }}>
          <p style={{ color: "#64748b", margin: 0 }}>Заявок пока нет</p>
        </div>
      )}
    </>
  );
}
