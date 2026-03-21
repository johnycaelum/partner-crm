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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const nav = [
    { href: "/dashboard", label: "Главная" },
    { href: "/dashboard/clients", label: "Клиенты" },
    { href: "/dashboard/team", label: "Команда" },
    { href: "/dashboard/rewards", label: "Начисления" },
    { href: "/dashboard/profile", label: "Профиль" },
  ];

  const navLink = (href: string, label: string, mobile = false) => {
    const active = pathname === href;
    return (
      <Link key={href} href={href}
        className={`relative rounded-xl text-sm font-medium transition-all duration-200
          ${mobile ? "py-3 block w-full px-3" : "px-3 py-1.5"}
          ${active ? "text-blue-600 bg-blue-50/80" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"}`}>
        {label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg shadow-blue-100/50" : ""}`}
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
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-base font-bold text-slate-800 hidden sm:inline">Центр Банкротства Юрист</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {nav.map(item => navLink(item.href, item.label))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {partner && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
                    {partner.name[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm text-slate-600 max-w-32 truncate">{partner.name}</span>
                </div>
              )}
              <button onClick={logout}
                className="hidden sm:block p-2 rounded-xl text-slate-400 hover:text-red-500 transition-all duration-200"
                title="Выйти">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-500 transition-colors">
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1 border-t" style={{ borderColor: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.95)" }}>
            {nav.map(item => navLink(item.href, item.label, true))}
            <div className="pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500 truncate">{partner?.name}</span>
                <button onClick={logout} className="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Выйти</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
