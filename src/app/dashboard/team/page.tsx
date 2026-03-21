"use client";

import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  _count: { clients: number };
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/team").then(r => r.json()).then(data => { setTeam(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return null;

  return (
    <>
      <div className="mb-6 anim-fade-up">
        <h1 className="text-2xl font-bold text-slate-800">Моя команда</h1>
        <p className="text-slate-500 text-sm mt-1">Партнёры, зарегистрировавшиеся по вашей ссылке</p>
      </div>

      {team.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center anim-fade-up">
          <p className="text-slate-500 mb-1">В вашей команде пока нет партнёров</p>
          <p className="text-sm text-slate-400">Приглашайте партнёров и получайте 1 000 &#8381; с каждого их клиента</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden anim-fade-up">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(241,245,249,0.7)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Имя</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Телефон</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Клиентов</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id} style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
                  <td className="px-5 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-5 py-3 text-slate-500">{m.phone}</td>
                  <td className="px-5 py-3"><span className="badge-blue">{m._count.clients}</span></td>
                  <td className="px-5 py-3 text-slate-400">{new Date(m.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
