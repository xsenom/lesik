"use client";

import { Rubik } from "next/font/google";
import { useEffect, useState } from "react";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

function normalizeRuKzPhone(value: string) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";

  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("9")) {
    return `+7${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("7")) {
    return `+7${digits}`;
  }

  return value.startsWith("+") ? value : `+${digits}`;
}

function isValidRuKzPhone(value: string) {
  return /^\+7\d{10}$/.test(normalizeRuKzPhone(value));
}

export default function ServicePaymentPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") || "");
  }, []);

  return (
    <main className={rubik.variable} style={{
      minHeight: "100vh",
      background: "#fff8ec",
      padding: "32px 16px",
      fontFamily: "var(--font-rubik)",
    }}>
      <section style={{
        maxWidth: 980,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 28,
        padding: 28,
        boxShadow: "0 20px 70px rgba(37, 63, 44, 0.12)",
        border: "1px solid rgba(31, 61, 43, 0.1)",
      }}>
        <a href="/app/content-map" style={{
          display: "inline-flex",
          marginBottom: 24,
          color: "#1f3d2b",
          fontWeight: 800,
          textDecoration: "none",
        }}>
          ← Вернуться к карте контента
        </a>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 24,
          alignItems: "start",
        }}>
          <div>
            <p style={{
              color: "#009b46",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              Полный доступ к сервису
            </p>

            <h1 style={{
              margin: "0 0 14px",
              color: "#183927",
              fontSize: "clamp(32px, 5vw, 54px)",
              lineHeight: 1,
              fontWeight: 900,
            }}>
              Откройте всю карту контента
            </h1>

            <p style={{
              color: "#4d5d52",
              fontSize: 18,
              lineHeight: 1.55,
              margin: "0 0 24px",
            }}>
              После оплаты откроются все дни календаря, обсуждение с маркетологом и полная выгрузка календаря.
            </p>

            <div style={{
              display: "grid",
              gap: 12,
              marginBottom: 22,
            }}>
              {[
                "Все 14 дней контент-карты без размытия",
                "Кнопка «Обсудить с маркетологом» для доработки постов",
                "Полное скачивание календаря",
                "Работа с уже заполненным профилем и продуктом",
              ].map((text) => (
                <div key={text} style={{
                  display: "flex",
                  gap: 10,
                  color: "#183927",
                  fontWeight: 700,
                }}>
                  <span style={{ color: "#009b46" }}>✔</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();

              const form = event.currentTarget;
              const button = form.querySelector("button[type='submit']") as HTMLButtonElement | null;
              const formData = new FormData(form);

              const normalizedPhone = normalizeRuKzPhone(phone || String(formData.get("phone") || ""));

              if (!isValidRuKzPhone(normalizedPhone)) {
                setPhoneError("Введите корректный номер РФ или Казахстана в формате +7XXXXXXXXXX");
                setPhone(normalizedPhone);
                return;
              }

              setPhoneError("");
              setPhone(normalizedPhone);

              if (button) {
                button.disabled = true;
                button.textContent = "Создаем ссылку на оплату...";
              }

              try {
                const response = await fetch("/api/robokassa/service-init", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: String(formData.get("name") || ""),
                    phone: normalizedPhone,
                    email: String(formData.get("email") || ""),
                  }),
                });

                const data = await response.json();

                if (!response.ok || !data.paymentUrl) {
                  alert(data.error || "Не удалось создать ссылку на оплату.");

                  if (button) {
                    button.disabled = false;
                    button.textContent = "Перейти к оплате 2900 ₽";
                  }

                  return;
                }

                try {
                  window.localStorage.setItem("lesik_service_payment_email", String(formData.get("email") || "").trim().toLowerCase());
                } catch {}

                try {
                  window.localStorage.setItem("lesik_service_payment_email", String(formData.get("email") || "").trim().toLowerCase());
                } catch {}

                window.location.href = data.paymentUrl;
              } catch (error) {
                console.error(error);
                alert("Ошибка при создании ссылки на оплату.");

                if (button) {
                  button.disabled = false;
                  button.textContent = "Перейти к оплате 2900 ₽";
                }
              }
            }}
            style={{
              background: "#f6f1e8",
              borderRadius: 24,
              padding: 22,
              border: "1px solid rgba(31, 61, 43, 0.12)",
            }}
          >
            <div style={{
              background: "#1f3d2b",
              color: "#fff",
              borderRadius: 18,
              padding: 18,
              marginBottom: 18,
            }}>
              <span style={{ opacity: 0.8, fontWeight: 700 }}>Стоимость</span>
              <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>
                2900 ₽
              </div>
            </div>

            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span style={{ fontWeight: 800, color: "#183927" }}>Имя</span>
              <input name="name" required placeholder="Введите имя" style={inputStyle} />
            </label>

            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span style={{ fontWeight: 800, color: "#183927" }}>Телефон</span>
              <input
                name="phone"
                type="tel"
                required
                value={phone}
                placeholder="+7 999 999-99-99"
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                onBlur={(e) => {
                  const normalized = normalizeRuKzPhone(e.target.value);
                  setPhone(normalized);

                  if (normalized && !isValidRuKzPhone(normalized)) {
                    setPhoneError("Введите корректный номер РФ или Казахстана в формате +7XXXXXXXXXX");
                  } else {
                    setPhoneError("");
                  }
                }}
                style={{
                  ...inputStyle,
                  borderColor: phoneError ? "#d93025" : "rgba(31, 61, 43, 0.18)",
                }}
              />
              {phoneError && (
                <span style={{
                  color: "#d93025",
                  fontSize: 12,
                  lineHeight: 1.35,
                  fontWeight: 700,
                }}>
                  {phoneError}
                </span>
              )}
            </label>

            <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
              <span style={{ fontWeight: 800, color: "#183927" }}>Email</span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.ru"
                style={inputStyle}
              />
            </label>

            <label style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 13,
              color: "#4d5d52",
              marginBottom: 16,
              lineHeight: 1.4,
            }}>
              <input type="checkbox" required style={{ marginTop: 2 }} />
              <span>
                Я принимаю условия публичной оферты, политики обработки персональных данных и пользовательского соглашения.
              </span>
            </label>

            <button type="submit" style={{
              width: "100%",
              minHeight: 54,
              border: "none",
              borderRadius: 999,
              background: "#009b46",
              color: "#fff",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(0, 155, 70, 0.24)",
            }}>
              Перейти к оплате 2900 ₽
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 14,
  border: "1px solid rgba(31, 61, 43, 0.18)",
  padding: "0 14px",
  fontSize: 15,
  outline: "none",
  background: "#fff",
};
