"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  name: string;
  balance: number;
  referralCode: string;
  clientCount: number;
  teamCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/partner/team").then((r) => r.json()),
    ]).then(([me, clients, team]) => {
      setData({
        name: me.user.name,
        balance: me.user.balance,
        referralCode: me.user.referralCode,
        clientCount: Array.isArray(clients) ? clients.length : 0,
        teamCount: Array.isArray(team) ? team.length : 0,
      });
    });
  }, []);

  function copyLink() {
    if (!data) return;
    navigator.clipboard.writeText(`${window.location.origin}/ref/${data.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data) return (
    <>
      <div className="mb-8">
        <div className="skeleton" style={{ width: 320, height: 32, borderRadius: 10, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 200, height: 18, borderRadius: 8 }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 9999 }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 140, height: 28, borderRadius: 8 }} />
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div>
            <div className="skeleton" style={{ width: 180, height: 16, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 280, height: 12, borderRadius: 6 }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: "100%", height: 42, borderRadius: 12 }} />
      </div>
    </>
  );

  return (
    <>
      <div className="mb-8 anim-fade-up">
        <h1 className="text-2xl font-bold text-slate-800">Добро пожаловать, {data.name}!</h1>
        <p className="text-slate-500 mt-1">Вот ваш обзор на сегодня</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass rounded-2xl p-6 card-hover anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)" }}>
              <span style={{ color: "#16a34a", fontSize: "18px", fontWeight: 800 }}>₽</span>
            </div>
            <span className="badge-green">{data.balance > 0 ? "Активно" : "0 ₽"}</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Баланс</p>
          <p className="text-2xl font-bold text-slate-800">{data.balance.toLocaleString("ru-RU")} &#8381;</p>
          <p className="text-xs text-slate-400 mt-1">Выплаты в конце месяца</p>
        </div>

        <div className="glass rounded-2xl p-6 card-hover anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="badge-blue">{data.clientCount}</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Клиентов</p>
          <p className="text-2xl font-bold text-slate-800">{data.clientCount} привлечено</p>
        </div>

        <div className="glass rounded-2xl p-6 card-hover anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#9333ea" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="badge-purple">{data.teamCount}</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Команда</p>
          <p className="text-2xl font-bold text-slate-800">{data.teamCount} партнёров</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="glass rounded-2xl p-6 card-hover anim-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Ваша реферальная ссылка</p>
            <p className="text-xs text-slate-500">По ней клиент оставит заявку или зарегистрируется как партнёр</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input type="text" readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/ref/${data.referralCode}`}
            className="input-glass" style={{ flex: 1, fontSize: "0.82rem" }} />
          <button onClick={copyLink} className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            {copied ? "Скопировано!" : "Скопировать"}
          </button>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "12px", lineHeight: 1.5 }}>
          Делитесь этой ссылкой — за клиентов от 10 000 &#8381;, за партнёров 2-го уровня — 1 000 &#8381; с каждого их клиента.
        </p>
      </div>
    </>
  );
}
