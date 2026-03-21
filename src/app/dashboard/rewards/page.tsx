"use client";

import { useEffect, useState } from "react";

interface Reward {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  client: { name: string };
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/rewards").then(r => r.json()).then(data => { setRewards(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return null;
  const total = rewards.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="flex justify-between items-center mb-6 anim-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">История начислений</h1>
          <p className="text-slate-500 text-sm mt-1">Все ваши вознаграждения</p>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-right">
          <div className="text-xs text-slate-500">Всего заработано</div>
          <div className="text-lg font-bold text-green-600">{total.toLocaleString("ru-RU")} &#8381;</div>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center anim-fade-up">
          <p className="text-slate-500">Начислений пока нет</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden anim-fade-up">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(241,245,249,0.7)", borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Клиент</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Тип</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Сумма</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Статус</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(226,232,240,0.4)" }}>
                  <td className="px-5 py-3 font-medium text-slate-800">{r.client.name}</td>
                  <td className="px-5 py-3">
                    <span className={r.type === "direct" ? "badge-blue" : "badge-purple"}>
                      {r.type === "direct" ? "Прямой" : "Пассивный"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-green-600">+{r.amount.toLocaleString("ru-RU")} &#8381;</td>
                  <td className="px-5 py-3">
                    <span className={r.status === "paid" ? "badge-green" : "badge-yellow"}>
                      {r.status === "paid" ? "Выплачено" : "Ожидает"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
