"use client";

import { Rubik } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import styles from "../page.module.css";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

export default function PaymentSuccessPage() {
  const [accessUntilText, setAccessUntilText] = useState("");

  const paymentData = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        product: "workbook",
        email: "",
      };
    }

    const params = new URLSearchParams(window.location.search);
    const shpProduct = String(params.get("Shp_product") || "").trim();
    const outSum = String(params.get("OutSum") || "").trim();
    const email = String(
      params.get("Shp_email") ||
      params.get("Email") ||
      ""
    ).trim().toLowerCase();

    const product =
      shpProduct === "content_map_full" || outSum.startsWith("2900")
        ? "service"
        : "workbook";

    return {
      product,
      email,
    };
  }, []);

  const isService = paymentData.product === "service";

  useEffect(() => {
    if (!isService || !paymentData.email) return;

    fetch(`/api/service-access/check?email=${encodeURIComponent(paymentData.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.accessUntilText) {
          setAccessUntilText(data.accessUntilText);
        }
      })
      .catch(() => {});
  }, [isService, paymentData.email]);

  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a
          href={isService ? "/app/content-map" : "/lend"}
          className={styles.backLink}
        >
          {isService ? "← Вернуться к карте контента" : "← Вернуться на лендинг"}
        </a>

        <div style={{ textAlign: "center", padding: "40px 0 10px" }}>
          <h1 style={{ marginBottom: 24 }}>
            {isService ? "Спасибо за оплату доступа" : "Спасибо за оплату"}
          </h1>

          <p
            style={{
              width: "100%",
              maxWidth: 720,
              margin: "0 auto 12px",
              textAlign: "center",
              color: "#3f4a43",
              fontSize: 16,
              lineHeight: 1.55,
              display: "block",
            }}
          >
            {isService
              ? "Полный доступ к карте контента активирован. Теперь вам доступны все дни календаря, обсуждение с маркетологом и полное скачивание материалов."
              : "После подтверждения платежа доступ к рабочей тетради будет направлен на указанные контакты."}
          </p>

          {isService && accessUntilText && (
            <p
              style={{
                margin: "0 auto 28px",
                color: "#1a5c35",
                fontSize: 17,
                fontWeight: 900,
                textAlign: "center",
              }}
            >
              Доступ активен до {accessUntilText}
            </p>
          )}

          <a
            href={isService ? "/app/content-map" : "https://t.me/"}
            className={styles.payButton}
            style={{
              width: "auto",
              minWidth: 280,
              maxWidth: 360,
              minHeight: 52,
              padding: "0 28px",
              marginTop: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#009b46",
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              fontWeight: 800,
              borderRadius: 999,
            }}
          >
            {isService ? "Открыть карту контента" : "Написать в Telegram"}
          </a>
        </div>
      </section>
    </main>
  );
}
