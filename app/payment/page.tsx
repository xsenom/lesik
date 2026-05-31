"use client";

import { Rubik } from "next/font/google";
import styles from "./page.module.css";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

export default function PaymentPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a href="/lend" className={styles.backLink}>
          ← Вернуться на лендинг
        </a>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Оплата рабочей тетради</p>
            <h1>Рабочая тетрадь «5 шагов к стабильным заявкам»</h1>
            <p className={styles.lead}>
              Заполните данные для оплаты.
            </p>
          </div>

          <div className={styles.priceBox}>
            <span>Стоимость</span>
            <strong>2100 ₽</strong>
            <p>Оплата в рублях РФ</p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.info}>
            <div className={styles.block}>
              <h2>Реквизиты ИП</h2>
              <p><strong>ИП:</strong> Лецик Екатерина Андреевна</p>
              <p><strong>ИНН:</strong> 720414883539</p>
              <p><strong>ОГРНИП:</strong> 324723200018946</p>
              <p><strong>Email:</strong> csenom@gmail.com</p>
            </div>

            <div className={styles.block}>
              <h2>Что входит</h2>
              <p>
                Цифровая рабочая тетрадь в электронном формате для самостоятельной
                работы по выстраиванию системы привлечения заявок через контент и
                чат-бота.
              </p>
            </div>

            <div className={styles.block}>
              <h2>Оплата и возврат</h2>
              <p>
                Оплата производится в размере 100% предоплаты. Возврат возможен
                до момента предоставления доступа к цифровому материалу.
              </p>
              <p>
                После предоставления доступа к рабочей тетради возврат не
                производится, если материал предоставлен надлежащим образом и
                соответствует описанию.
              </p>
            </div>

            <div className={styles.docs}>
              <a href="/oferta" target="_blank">Публичная оферта</a>
              <a href="/privacy" target="_blank">Политика обработки персональных данных</a>
              <a href="/agreement" target="_blank">Пользовательское соглашение</a>
            </div>
          </div>

          <div className={styles.formCard}>
            <form
              className={styles.form}
              onSubmit={async (event) => {
                event.preventDefault();

                const form = event.currentTarget;
                const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement | null;

                if (submitButton) {
                  submitButton.disabled = true;
                  submitButton.textContent = "Создаем ссылку на оплату...";
                }

                try {
                  const formData = new FormData(form);

                  const response = await fetch("/api/robokassa/init", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: String(formData.get("name") || ""),
                      phone: String(formData.get("phone") || ""),
                      email: String(formData.get("email") || ""),
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok || !data.paymentUrl) {
                    alert(data.error || "Не удалось создать ссылку на оплату.");
                    if (submitButton) {
                      submitButton.disabled = false;
                      submitButton.textContent = "Перейти к оплате 2100 ₽";
                    }
                    return;
                  }

                  window.location.href = data.paymentUrl;
                } catch (error) {
                  console.error(error);
                  alert("Ошибка при создании ссылки на оплату.");

                  if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Перейти к оплате 2100 ₽";
                  }
                }
              }}
            >
              <h2>Заполнение формы</h2>

              <label>
                <span>Имя</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Введите имя"
                  required
                />
              </label>

              <label>
                <span>Телефон</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+7 999 999-99-99"
                  required
                />
              </label>

              <label>
                <span>Email для получения материала</span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.ru"
                  required
                />
              </label>

              <label className={styles.checkbox}>
                <input type="checkbox" required />
                <span>
                  Я принимаю условия{" "}
                  <a href="/oferta" target="_blank">публичной оферты</a>,{" "}
                  <a href="/privacy" target="_blank">политики обработки персональных данных</a>{" "}
                  и{" "}
                  <a href="/agreement" target="_blank">пользовательского соглашения</a>.
                </span>
              </label>

              <button type="submit" className={styles.payButton}>
                Перейти к оплате 2100 ₽
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
