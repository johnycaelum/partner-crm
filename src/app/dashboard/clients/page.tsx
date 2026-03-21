"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  phone: string;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидает", cls: "badge-yellow" },
  contracted: { label: "Договор", cls: "badge-green" },
  rejected: { label: "Отклонён", cls: "badge-red" },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(data => { setClients(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return null;

  return (
    <>
      <div className="mb-6 anim-fade-up">
        <h1 className="text-2xl font-bold text-slate-800">Мои клиенты</h1>
        <p className="text-slate-500 text-sm mt-1">Люди, привлечённые по вашей ссылке</p>
      </div>

      {clients.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center anim-fade-up">
          <p className="text-slate-500 mb-1">У вас пока нет клиентов</p>
          <p className="text-sm text-slate-400">Поделитесь реферальной ссылкой, чтобы привлечь первого</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden anim-fade-up">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(241,245,249,0.7)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Имя</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Телефон</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Статус</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
                  <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                  <td className="px-5 py-3"><span className={statusMap[c.status]?.cls}>{statusMap[c.status]?.label}</span></td>
                  <td className="px-5 py-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
