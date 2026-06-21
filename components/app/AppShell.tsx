"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NeuroBackdrop from "@/components/background/NeuroBackdrop";


const LESIK_ADMIN_EMAIL = "letsikekaterina@gmail.com";

function getLesikStoredEmailForAdmin() {
  if (typeof window === "undefined") return "";

  const keys = [
    "lesik_email",
    "email",
    "user_email",
    "profile_email",
    "lesik_user_email",
  ];

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes("@")) return value.trim().toLowerCase();
  }

  const jsonKeys = [
    "lesik_profile",
    "profile",
    "user",
    "lesik_user",
  ];

  for (const key of jsonKeys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const email = parsed?.email || parsed?.profile?.email || parsed?.user?.email;

      if (email && String(email).includes("@")) {
        return String(email).trim().toLowerCase();
      }
    } catch {}
  }

  return "";
}


const nav = [
  { href: "/app/main", label: "Главная", icon: "home" },
  { href: "/app/content-map", label: "Карта контента", icon: "leaf" },
  { href: "/app/stats", label: "Статистика", icon: "chart" },
  { href: "/app/profile", label: "Профиль", icon: "profile" },
  { href: "/app/admin", label: "Админ", icon: "shield" },
] as const;

const NAV_ITEMS = nav;

function NavIcon({ name }: { name: "profile" | "home" | "map" | "leaf" | "stats" | "chart" | "settings" | "shield" }) {
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

      {name === "stats" && (
        <>
          <path d="M32 12v20h20" />
          <path d="M52 32c0 11-9 20-20 20S12 43 12 32s9-20 20-20" />
          <path d="M32 12c11 0 20 9 20 20" />
        </>
      )}

      {name === "leaf" && (
        <>
          <path d="M48 14C31 14 18 22 16 37c-2 13 10 21 22 14 12-7 14-23 10-37Z" />
          <path d="M17 49C25 37 34 28 47 15" />
          <path d="M25 40c5 0 9-1 13-4" />
        </>
      )}

      {name === "chart" && (
        <>
          <path d="M14 50H52" />
          <path d="M14 50V14" />
          <path d="M20 42 30 31 39 37 50 22" />
          <path d="M44 22h6v6" />
        </>
      )}

      {name === "settings" && (
        <>
          <circle cx="32" cy="32" r="8" />
          <path d="M32 10v8" />
          <path d="M32 46v8" />
          <path d="M10 32h8" />
          <path d="M46 32h8" />
          <path d="M16.5 16.5l5.7 5.7" />
          <path d="M41.8 41.8l5.7 5.7" />
          <path d="M47.5 16.5l-5.7 5.7" />
          <path d="M22.2 41.8l-5.7 5.7" />
          <circle cx="32" cy="32" r="18" />
        </>
      )}

      {name === "shield" && (
        <path d="M32 10 50 17v14c0 13-8.2 21.6-18 25-9.8-3.4-18-12-18-25V17l18-7Z" />
      )}
    </svg>
  );
}


function OnboardingTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  void open;
  void onClose;
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tourOpen, setTourOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem("lesik_onboarded");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const syncAdminAccess = () => {
      const email = getLesikStoredEmailForAdmin();
      const isAdmin = email === LESIK_ADMIN_EMAIL;

      document.body.classList.toggle("lesik-is-admin", isAdmin);

      if (!isAdmin && window.location.pathname.startsWith("/app/admin")) {
        window.location.href = "/app/main";
      }
    };

    syncAdminAccess();

    window.addEventListener("storage", syncAdminAccess);
    window.addEventListener("focus", syncAdminAccess);

    return () => {
      window.removeEventListener("storage", syncAdminAccess);
      window.removeEventListener("focus", syncAdminAccess);
    };
  }, []);
  const closeTour = () => {
    try { localStorage.setItem("lesik_onboarded", "1"); } catch {}
    setTourOpen(false);
  };

  return (
    <div className="lesik-app">
      <NeuroBackdrop />
      <OnboardingTour open={tourOpen} onClose={closeTour} />

      <div className="wave-layer wave-one" />
      <div className="wave-layer wave-two" />

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
          <p>Расти системно<br />Достигай большего</p>
        </div>
      </aside>

      <main className="lesik-main">{children}</main>
    </div>
  );
}





