"use client";

import { Rubik } from "next/font/google";
import styles from "../workbook.module.css";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

export default function WorkbookLoginPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a href="/lend" className={styles.backLink}>← Вернуться на лендинг</a>

        <p className={styles.eyebrow}>Личный кабинет</p>
        <h1>Вход к рабочей тетради</h1>
        <p className={styles.lead}>
          Введите логин и пароль из письма после оплаты.
        </p>

        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();

            const form = event.currentTarget;
            const formData = new FormData(form);

            const response = await fetch("/api/workbook/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: String(formData.get("email") || ""),
                password: String(formData.get("password") || ""),
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              alert(data.error || "Не удалось войти.");
              return;
            }

            window.location.href = "/workbook/cabinet";
          }}
        >
          <label>
            <span>Email</span>
            <input name="email" type="email" required />
          </label>

          <label>
            <span>Пароль</span>
            <input name="password" type="password" required />
          </label>

          <button type="submit">Войти</button>

          <a href="/workbook/reset" className={styles.resetLink}>
            Сбросить пароль
          </a>
        </form>
      </section>
    </main>
  );
}
