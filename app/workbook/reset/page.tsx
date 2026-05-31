"use client";

import { Rubik } from "next/font/google";
import styles from "../workbook.module.css";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

export default function WorkbookResetPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a href="/workbook/login" className={styles.backLink}>← Вернуться ко входу</a>

        <p className={styles.eyebrow}>Сброс пароля</p>
        <h1>Восстановить доступ</h1>
        <p className={styles.lead}>
          Введите email, который указывали при оплате. Мы отправим новый пароль на почту.
        </p>

        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();

            const form = event.currentTarget;
            const formData = new FormData(form);
            const button = form.querySelector("button[type='submit']") as HTMLButtonElement | null;

            if (button) {
              button.disabled = true;
              button.textContent = "Отправляем...";
            }

            try {
              const response = await fetch("/api/workbook/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: String(formData.get("email") || ""),
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                alert(data.error || "Не удалось сбросить пароль.");
                if (button) {
                  button.disabled = false;
                  button.textContent = "Отправить новый пароль";
                }
                return;
              }

              alert(data.message || "Новый пароль отправлен на почту.");

              window.location.href = "/workbook/login";
            } catch (error) {
              console.error(error);
              alert("Ошибка сброса пароля.");

              if (button) {
                button.disabled = false;
                button.textContent = "Отправить новый пароль";
              }
            }
          }}
        >
          <label>
            <span>Email</span>
            <input name="email" type="email" required />
          </label>

          <button type="submit">Отправить новый пароль</button>
        </form>
      </section>
    </main>
  );
}
