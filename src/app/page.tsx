"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "linear-gradient(160deg, #dbeafe 0%, #f0f9ff 40%, #ede9fe 100%)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(226,232,240,0.7)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(59,130,246,0.35)", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", letterSpacing: "-0.02em" }}>Центр Банкротства Юрист</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, padding: "8px 16px" }}>
              Войти
            </Link>
            <Link href="/register" style={{ background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", textDecoration: "none", padding: "9px 22px", borderRadius: 12, fontSize: "0.875rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}>
              Стать партнёром
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 9999, padding: "5px 18px", marginBottom: 28, fontSize: "0.8rem", fontWeight: 700, color: "#16a34a" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
            Начните зарабатывать уже сегодня
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.13, marginBottom: 22, letterSpacing: "-0.03em" }}>
            Зарабатывайте, приглашая клиентов на{" "}
            <span style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              банкротство
            </span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: 600, marginBottom: 8 }}>
            Партнёрская программа от{" "}
            <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
              Центра Банкротства Юрист
            </a>
          </p>

          <p style={{ fontSize: "1.15rem", color: "#475569", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 42px" }}>
            Рекомендуйте наши услуги и получайте вознаграждение за каждого клиента, заключившего договор. Двухуровневая реферальная система.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", textDecoration: "none", padding: "16px 36px", borderRadius: 16, fontSize: "1.05rem", fontWeight: 700, boxShadow: "0 8px 32px rgba(59,130,246,0.38)" }}>
              Стать партнёром →
            </Link>
            <a href="#how" style={{ background: "rgba(255,255,255,0.75)", color: "#475569", textDecoration: "none", padding: "16px 36px", borderRadius: 16, fontSize: "1.05rem", fontWeight: 600, border: "1px solid rgba(203,213,225,0.8)", backdropFilter: "blur(12px)" }}>
              Как это работает?
            </a>
          </div>

          <div style={{ marginTop: 48, display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              "От 10 000 ₽ за клиента",
              "Двухуровневая система",
              "Мгновенные начисления",
            ].map(text => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Простой старт</p>
            <h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-0.025em" }}>Как это работает?</h2>
            <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>От регистрации до первого заработка — меньше 5 минут</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { n: "01", title: "Зарегистрируйтесь", desc: "Создайте аккаунт по email и получите личную реферальную ссылку.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { n: "02", title: "Делитесь ссылкой", desc: "Отправляйте ссылку людям с долгами или тем, кто хочет стать партнёром.", icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" },
              { n: "03", title: "Клиент заключает договор", desc: "Мы связываемся с клиентом и заключаем договор на банкротство.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { n: "04", title: "Получаете деньги", desc: "Вознаграждение автоматически начисляется на ваш баланс в личном кабинете.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map(step => (
              <div key={step.n} style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.85)", borderRadius: 20, padding: "28px 24px", position: "relative", boxShadow: "0 4px 20px rgba(59,130,246,0.07)" }}>
                <span style={{ position: "absolute", top: 16, right: 18, fontSize: "0.7rem", fontWeight: 800, color: "#cbd5e1" }}>{step.n}</span>
                <div style={{ marginBottom: 16 }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section style={{ padding: "80px 24px", background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Прозрачные условия</p>
            <h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-0.025em" }}>Сколько вы заработаете</h2>
            <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>Вознаграждение начисляется после подтверждения договора. Выплаты — в конце каждого месяца.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {[
              { amount: "10 000 ₽", label: "За первого клиента", desc: "Ваш первый привлечённый клиент, заключивший договор", highlight: false },
              { amount: "15 000 ₽", label: "За каждого следующего", desc: "Начиная со второго клиента — повышенная ставка навсегда", highlight: true },
              { amount: "1 000 ₽", label: "Пассивный доход", desc: "За каждого клиента ваших приглашённых партнёров (2-й уровень)", highlight: false },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.highlight ? "linear-gradient(135deg, #3b82f6, #818cf8)" : "rgba(255,255,255,0.65)",
                backdropFilter: "blur(16px)",
                border: item.highlight ? "none" : "1px solid rgba(255,255,255,0.9)",
                borderRadius: 20, padding: "32px 24px", textAlign: "center",
                boxShadow: item.highlight ? "0 12px 40px rgba(59,130,246,0.35)" : "0 4px 16px rgba(0,0,0,0.05)",
              }}>
                <p style={{ fontSize: "2.2rem", fontWeight: 900, color: item.highlight ? "white" : "#0f172a", margin: "0 0 4px", letterSpacing: "-0.03em" }}>{item.amount}</p>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: item.highlight ? "rgba(255,255,255,0.9)" : "#1e293b", marginBottom: 8 }}>{item.label}</p>
                <p style={{ fontSize: "0.82rem", color: item.highlight ? "rgba(255,255,255,0.7)" : "#94a3b8", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 28, backdropFilter: "blur(16px)", padding: "64px 40px" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.2} style={{ margin: "0 auto 16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.025em" }}>Начните зарабатывать прямо сейчас</h2>
            <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.7, marginBottom: 36 }}>
              Регистрация за 2 минуты. Получите реферальную ссылку и <span style={{ fontWeight: 700, color: "#16a34a" }}>начните приглашать клиентов</span>.
            </p>
            <Link href="/register" style={{ display: "inline-block", background: "linear-gradient(135deg, #3b82f6, #818cf8)", color: "white", textDecoration: "none", padding: "18px 48px", borderRadius: 18, fontSize: "1.1rem", fontWeight: 800, boxShadow: "0 12px 40px rgba(59,130,246,0.4)" }}>
              Зарегистрироваться →
            </Link>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 18 }}>
              Уже есть аккаунт? <Link href="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>Войти</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(226,232,240,0.5)", padding: "40px 24px 28px", background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b" }}>Центр Банкротства Юрист</span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 6px" }}>Партнёрская программа от Центра Банкротства Юрист</p>
          <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}>cbucompany.ru</a>
        </div>
      </footer>
    </div>
  );
}
