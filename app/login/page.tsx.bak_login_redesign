"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok || !password.trim()) return;

    localStorage.setItem("lesik_auth", "yes");
    localStorage.setItem("lesik_email", email.trim().toLowerCase());
    router.push("/app/main");
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="landing-badge">ЛЕСik</div>
        <h1>Вход в личный кабинет</h1>
        <p>Email — это ключ к профилю клиента.</p>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" />

        <button type="button" onClick={submit}>Войти</button>
        <Link className="login-forgot" href="mailto:support@lesik.ai?subject=Восстановление%20пароля">Забыли пароль?</Link>
      </section>
    </main>
  );
}
