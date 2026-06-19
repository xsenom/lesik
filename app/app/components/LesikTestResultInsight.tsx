"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type LesikTestResult = {
  score: number;
  maxScore: number;
  days: string;
  label: string;
  desc: string;
  level: string;
  focus: string[];
  updatedAt?: string;
};

export default function LesikTestResultInsight() {
  const pathname = usePathname();
  const [result, setResult] = useState<LesikTestResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lesik_test_result");
      if (!raw) {
        setResult(null);
        return;
      }

      const parsed = JSON.parse(raw) as LesikTestResult;
      if (!parsed?.label) {
        setResult(null);
        return;
      }

      setResult(parsed);
    } catch {
      setResult(null);
    }
  }, [pathname]);

  const isProfile = pathname?.includes("/app/profile");
  const isContentMap =
    pathname?.includes("/app/content-map") ||
    pathname?.includes("/app/map");

  if (!result || (!isProfile && !isContentMap)) return null;

  const title = isProfile ? "Результат теста" : "Акцент карты контента";
  const subtitle = isProfile
    ? "ЛЕСik будет учитывать этот результат при построении системы."
    : "Карта контента строится с учётом результата теста.";

  return (
    <section
      className="lesik-test-result-inline"
      style={{
        width: "min(720px, calc(100vw - 40px))",
        margin: "28px auto 40px",
        borderRadius: 24,
        border: "1px solid rgba(10,92,58,0.16)",
        background: "rgba(255,253,248,0.96)",
        boxShadow: "0 18px 50px rgba(10,92,58,0.14)",
        padding: 22,
        fontFamily: "var(--font-rubik, Rubik, Arial, sans-serif)",
        color: "#0a2e18"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <img
          src="/leaf-icon.png"
          alt=""
          style={{
            width: 18,
            height: 18,
            objectFit: "contain",
            flexShrink: 0
          }}
        />
        <strong style={{ fontSize: 18, fontWeight: 900 }}>{title}</strong>
      </div>

      <div
        style={{
          borderRadius: 18,
          background: "rgba(10,92,58,0.07)",
          padding: "14px 16px",
          marginBottom: 14
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 5 }}>
          {result.label}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: "#395444" }}>
          {result.desc}
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.5, color: "#395444", marginBottom: 12 }}>
        {subtitle}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {result.focus?.map((item) => (
          <span
            key={item}
            style={{
              borderRadius: 999,
              padding: "8px 11px",
              background: "#0a5c3a",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#6b766d" }}>
        Счёт: {result.score} из {result.maxScore} · прогрев: {result.days}
      </div>
    </section>
  );
}
