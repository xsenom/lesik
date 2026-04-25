"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NeuroBackdrop from "@/components/background/NeuroBackdrop";

const nav = [
  { href: "/app/trends", label: "Главная", icon: "home" },
  { href: "/app/profile", label: "Профиль", icon: "profile" },
  { href: "/app/content-map", label: "Карта контента", icon: "map" },
  { href: "/app/admin", label: "Админ", icon: "shield" },
] as const;

function NavIcon({ name }: { name: "profile" | "home" | "map" | "shield" }) {
  return (
    <svg viewBox="0 0 64 64" className="custom-nav-svg" aria-hidden="true">
      {name === "profile" && (
        <>
          <circle cx="32" cy="23" r="10" />
          <path d="M16 52c2.8-11.2 9.2-17 16-17s13.2 5.8 16 17" />
        </>
      )}

      {name === "home" && (
        <>
          <path d="M14 31 32 15l18 16" />
          <path d="M19 29v22h26V29" />
          <path d="M27 51V38h10v13" />
        </>
      )}

      {name === "map" && (
        <>
          <path d="M14 17 27 12l10 5 13-5v35l-13 5-10-5-13 5V17Z" />
          <path d="M27 12v35" />
          <path d="M37 17v35" />
        </>
      )}

      {name === "shield" && (
        <path d="M32 10 50 17v14c0 13-8.2 21.6-18 25-9.8-3.4-18-12-18-25V17l18-7Z" />
      )}
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="lesik-app">
      <NeuroBackdrop />

      <div className="wave-layer wave-one" />
      <div className="wave-layer wave-two" />
      <div className="clean-leaf leaf-a" />
      <div className="clean-leaf leaf-b" />
      <div className="clean-leaf leaf-c" />

      <aside className="lesik-sidebar">
        <div className="lesik-logo">ЛЕС<span>ik</span></div>

        <nav className="lesik-nav">
          {nav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "lesik-nav-item active" : "lesik-nav-item"}
              >
                <span className="lesik-nav-icon">
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="lesik-side-card">
          <span className="tree-emoji">🌲</span>
          <p>Расти системно.<br />Достигай большего.</p>
        </div>
      </aside>

      <main className="lesik-main">{children}</main>
    </div>
  );
}






