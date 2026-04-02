"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PartnerData {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  balance: number;
}

const nav = [
  { href: "/dashboard", label: "Главная", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/clients", label: "Клиенты", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/dashboard/team", label: "Команда", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/dashboard/rewards", label: "Выплаты", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/dashboard/profile", label: "Профиль", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.type === "partner") setPartner(data.user);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 72 }}>
      {/* Desktop top nav */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 hidden md:block ${scrolled ? "shadow-lg shadow-blue-100/50" : ""}`}
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.8)",
        }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }}>
                  <span style={{ color: "white", fontSize: "14px", fontWeight: 800 }}>P</span>
                </div>
                <span className="text-base font-bold text-slate-800">CBU Partner</span>
              </Link>
              <div className="flex items-center gap-1">
                {nav.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active ? "text-blue-600 bg-blue-50/80" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"}`}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {partner && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)" }}>
                  <span className="text-sm text-slate-600 truncate max-w-32">{partner.name}</span>
                </div>
              )}
              <button onClick={logout} className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-all" title="Выйти">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar - minimal */}
      <div className="md:hidden sticky top-0 z-50" style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226,232,240,0.5)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #3b82f6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 13, fontWeight: 800 }}>P</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>CBU Partner</span>
        </Link>
        <button onClick={logout} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Выйти
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</main>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden" style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(226,232,240,0.6)",
        display: "flex",
        justifyContent: "space-around",
        padding: "6px 0 env(safe-area-inset-bottom, 8px)",
      }}>
        {nav.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              textDecoration: "none",
              color: active ? "#3b82f6" : "#94a3b8",
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              padding: "4px 8px",
              transition: "color 0.2s",
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
