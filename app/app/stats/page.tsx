"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StatsState = {
  publishedTotal: number;
  publishedMonth: number;
  activeDays: number;
  lastDate: string;
};

function getStoredEmail() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "lesik_email",
    "email",
    "user_email",
    "profile_email",
    "lesik_user_email",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes("@")) return value.trim().toLowerCase();
  }

  const jsonKeys = ["lesik_profile", "profile", "user", "lesik_user"];

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

function safeJsonParse(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function collectGoalStats(email: string): StatsState {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const keys: string[] = [];

  if (email) {
    keys.push(`lesik-goal-checks:${email}`);
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i) || "";

    if (key.startsWith("lesik-goal-checks") && !keys.includes(key)) {
      keys.push(key);
    }
  }

  let publishedTotal = 0;
  let publishedMonth = 0;
  let activeDays = 0;
  let lastDate = "";

  const seenDates = new Set<string>();

  for (const key of keys) {
    const data = safeJsonParse(window.localStorage.getItem(key));

    if (!data || typeof data !== "object" || Array.isArray(data)) continue;

    for (const [date, value] of Object.entries(data)) {
      if (!Array.isArray(value)) continue;

      const count = value.length;

      if (count <= 0) continue;

      publishedTotal += count;

      if (!seenDates.has(date)) {
        activeDays += 1;
        seenDates.add(date);
      }

      if (date.startsWith(currentMonth)) {
        publishedMonth += count;
      }

      if (!lastDate || date > lastDate) {
        lastDate = date;
      }
    }
  }

  return {
    publishedTotal,
    publishedMonth,
    activeDays,
    lastDate,
  };
}

function formatDate(value: string) {
  if (!value) return "Пока нет данных";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function StatsPage() {
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<StatsState>({
    publishedTotal: 0,
    publishedMonth: 0,
    activeDays: 0,
    lastDate: "",
  });

  useEffect(() => {
    const currentEmail = getStoredEmail();

    setEmail(currentEmail);
    setStats(collectGoalStats(currentEmail));
  }, []);

  const hasStats = stats.publishedTotal > 0;

  const cards = useMemo(
    () => [
      {
        label: "Всего выложено",
        value: stats.publishedTotal,
        hint: "Отмеченные выполненными задачи",
      },
      {
        label: "За этот месяц",
        value: stats.publishedMonth,
        hint: "Контент за текущий месяц",
      },
      {
        label: "Активных дней",
        value: stats.activeDays,
        hint: "Дни, где были выполненные задачи",
      },
    ],
    [stats]
  );

  return (
    <main className="stats-page">
      <section className="stats-hero-card">
        <p className="stats-kicker">Статистика</p>
        <h1>Контент и активность</h1>
        <p>
          Здесь отображается количество контента, который был отмечен выполненным
          в ежедневных целях.
        </p>
      </section>

      <section className="stats-grid">
        {cards.map((card) => (
          <article className="stats-card" key={card.label}>
            <span>{card.label}</span>
            <b>{card.value}</b>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="stats-detail-card">
        <div>
          <span>Последняя активность</span>
          <b>{formatDate(stats.lastDate)}</b>
        </div>

        <div>
          <span>Профиль</span>
          <b>{email || "Email не найден"}</b>
        </div>
      </section>

      {!hasStats && (
        <section className="stats-empty-card">
          <h2>Пока нет выложенного контента</h2>
          <p>
            Сначала сформируйте карту контента, затем отмечайте выполненные задачи
            в блоке «Цели на день». После этого статистика появится здесь.
          </p>

          <Link href="/app/content-map">Сформировать карту контента</Link>
        </section>
      )}
    </main>
  );
}
