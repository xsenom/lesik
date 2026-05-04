"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const normalizeEmail = () => email.trim().toLowerCase();

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = normalizeEmail();

    if (!normalizedEmail) {
      alert("Введите email.");
      return;
    }

    setLoggingIn(true);
    localStorage.setItem("lesik_email", normalizedEmail);
    router.push("/app/profile");
  };

  const createProfile = async () => {
    const normalizedEmail = normalizeEmail();

    if (!normalizedEmail) {
      alert("Введите email, чтобы создать тестовый профиль.");
      return;
    }

    setCreatingProfile(true);

    try {
      const profilePayload = {
        name: normalizedEmail.split("@")[0] || "Новый клиент",
        email: normalizedEmail,
        client_type: "Эксперт",
        niche: "",
        platform: "",
        monthly_goal: "",
        blocker: "",
      };

      const profileRes = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      if (!profileRes.ok) {
        throw new Error(await profileRes.text());
      }

      const detailsPayload = {
        email: normalizedEmail,
        notify_email: true,
        notify_telegram: false,
        platforms: [],
        audience_analysis: "",
        product_status: "",
        product_name: "",
        product_description: "",
        why_buy: "",
        why_not_buy: "",
        product_ideas_request: "",
        tariff_plan: "free",
        pro_paid_until: "",
      };

      try {
        await fetch(`${API_BASE}/profile-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsPayload),
        });
      } catch (e) {
        console.warn("profile-details skipped", e);
      }

      localStorage.setItem("lesik_email", normalizedEmail);
      router.push("/app/profile");
    } catch (e) {
      console.error(e);
      alert("Не удалось создать профиль. Проверь, что backend запущен на http://localhost:8000");
    } finally {
      setCreatingProfile(false);
    }
  };

  return (
    <main className="login-v2-page">
      <section className="login-v2-shell">
        <div className="login-v2-card">
          <Link href="/" className="login-v2-logo">
            ЛЕСik
          </Link>

          <p className="login-v2-kicker">Личный кабинет</p>

          <h1>Войдите в систему продаж через контент</h1>

          <p className="login-v2-subtitle">
            Email нужен, чтобы ЛЕСik нашёл ваш профиль, карту смыслов,
            календарь и ежедневные задачи.
          </p>

          <form className="login-v2-form" onSubmit={login}>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                placeholder="your@email.com"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              <span>Пароль</span>
              <input
                type="password"
                value={password}
                placeholder="Можно оставить пустым"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button type="submit" disabled={loggingIn || creatingProfile}>
              {loggingIn ? "Входим..." : "Войти в кабинет"}
            </button>
          </form>

          <div className="login-v2-under login-v2-under-actions">
            <button
              type="button"
              className="login-v2-create-profile"
              onClick={createProfile}
              disabled={creatingProfile || loggingIn}
            >
              {creatingProfile ? "Создаю профиль..." : "Создать профиль"}
            </button>

            <Link href="/">Вернуться на лендинг</Link>
          </div>
        </div>

        <aside className="login-v2-info">
          <p className="login-v2-kicker">Что внутри</p>

          <h2>Кабинет, где контент превращается в ежедневные действия</h2>

          <div className="login-v2-info-list">
            <article>
              <span>01</span>
              <div>
                <h3>Профиль клиента</h3>
                <p>Ниша, аудитория, продукт, цель и текущие площадки в одном месте.</p>
              </div>
            </article>

            <article>
              <span>02</span>
              <div>
                <h3>Карта смыслов</h3>
                <p>Система тем, касаний и маршрута клиента от интереса до оплаты.</p>
              </div>
            </article>

            <article>
              <span>03</span>
              <div>
                <h3>Цели на день</h3>
                <p>Понятные маленькие шаги, которые двигают контент к продажам.</p>
              </div>
            </article>
          </div>

          <div className="login-v2-note">
            <strong>ЛЕСik</strong>
            <p>Система, которая продаёт через маленькие ежедневные действия.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
