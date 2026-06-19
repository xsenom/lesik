"use client";

import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { usePathname } from "next/navigation";

type TestResult = {
  score?: number;
  maxScore?: number;
  days?: string;
  label?: string;
  desc?: string;
  focus?: string[];
};

function TestResultCard() {
  let result: TestResult | null = null;

  try {
    const raw = window.localStorage.getItem("lesik_test_result");
    result = raw ? JSON.parse(raw) : null;
  } catch {
    result = null;
  }

  return (
    <section className="profile-test-result-under-notifications">
      <div className="profile-test-result-head">
        <img src="/leaf-icon.png" alt="" />
        <strong>Результат теста</strong>
      </div>

      {!result?.label ? (
        <p className="profile-test-result-empty">
          Тест ещё не пройден. После прохождения здесь появится результат и акценты для карты контента.
        </p>
      ) : (
        <>
          <div className="profile-test-result-main">
            <div className="profile-test-result-title">{result.label}</div>
            <div className="profile-test-result-desc">{result.desc}</div>
          </div>

          <div className="profile-test-result-note">
            ЛЕСik будет учитывать этот результат при построении профиля и карты контента.
          </div>

          {!!result.focus?.length && (
            <div className="profile-test-result-tags">
              {result.focus.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}

          <div className="profile-test-result-score">
            Счёт: {result.score ?? 0} из {result.maxScore ?? 50} · прогрев: {result.days ?? "—"}
          </div>
        </>
      )}
    </section>
  );
}

let root: Root | null = null;

export default function ProfileTestResultUnderNotifications() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.includes("/app/profile")) return;

    const mount = () => {
      if (document.querySelector(".profile-test-result-under-notifications")) return;

      const all = Array.from(document.querySelectorAll("body *")) as HTMLElement[];

      const title = all.find((el) => {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        return text === "УВЕДОМЛЕНИЯ" || text.includes("УВЕДОМЛЕНИЯ");
      });

      if (!title) return;

      let card: HTMLElement | null = title;

      for (let i = 0; i < 10 && card; i += 1) {
        const text = (card.textContent || "").replace(/\s+/g, " ").trim();
        const rect = card.getBoundingClientRect();

        if (
          text.includes("УВЕДОМЛЕНИЯ") &&
          text.includes("Email") &&
          rect.width > 250 &&
          rect.height > 60 &&
          rect.height < 260
        ) {
          break;
        }

        card = card.parentElement;
      }

      if (!card) return;

      const holder = document.createElement("div");
      holder.className = "profile-test-result-holder";
      card.insertAdjacentElement("afterend", holder);

      root = createRoot(holder);
      root.render(<TestResultCard />);
    };

    mount();

    const timer = window.setInterval(mount, 300);

    return () => {
      window.clearInterval(timer);
      if (root) {
        root.unmount();
        root = null;
      }
      document.querySelectorAll(".profile-test-result-holder").forEach((el) => el.remove());
    };
  }, [pathname]);

  return null;
}
