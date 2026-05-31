import { Rubik } from "next/font/google";
import styles from "../page.module.css";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-rubik",
});

export default function PaymentSuccessPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a href="/lend" className={styles.backLink}>← Вернуться на лендинг</a>

        <div className={styles.stub}>
          <p className={styles.eyebrow}>Оплата прошла</p>
          <h2>Спасибо за оплату</h2>
          <p>
            После подтверждения платежа доступ к рабочей тетради будет направлен на указанные контакты.
          </p>
          <a href="https://t.me/m/Tt1zpXwvODJi" target="_blank" className={styles.payButton}>
            Написать в Telegram
          </a>
        </div>
      </section>
    </main>
  );
}
