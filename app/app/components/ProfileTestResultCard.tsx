"use client";

import { useEffect, useState } from "react";

type TestResult = {
  score?: number;
  maxScore?: number;
  days?: string;
  label?: string;
  desc?: string;
  focus?: string[];
};

export default function ProfileTestResultCard() {
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("lesik_test_result");
        if (!raw) {
          setResult(null);
          return;
        }

        const parsed = JSON.parse(raw);
        setResult(parsed?.label ? parsed : null);
      } catch {
        setResult(null);
      }
    };

    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <section className="profile-test-result-card-inline">
      <div className="profile-test-result-head">
        <img src="/leaf-icon.png" alt="" />
        <strong>Результат теста</strong>
      </div>

      {!result ? (
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
