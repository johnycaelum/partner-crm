"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const nav = [
    { href: "/admin", label: "Заявки" },
    { href: "/admin/consultations", label: "Консультации" },
    { href: "/admin/partners", label: "Партнёры" },
    { href: "/admin/rewards", label: "Выплаты" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>Админ</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {nav.map(item => (
                  <Link key={item.href} href={item.href} style={{
                    padding: "6px 14px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
                    textDecoration: "none", transition: "all 0.15s ease",
                    color: pathname === item.href ? "#f59e0b" : "#94a3b8",
                    background: pathname === item.href ? "rgba(245,158,11,0.1)" : "transparent",
                  }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <button onClick={logout} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", padding: "6px 14px", borderRadius: 10,
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
            }}>
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {children}
      </main>
    </div>
  );
}
