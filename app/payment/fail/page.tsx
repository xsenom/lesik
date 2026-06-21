import styles from "../page.module.css";

const rubik = { variable: "" };

export default function PaymentFailPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <a href="/payment" className={styles.backLink}>← Вернуться к оплате</a>

        <div className={styles.stub}>
          <p className={styles.eyebrow}>Оплата не завершена</p>
          <h2>Платеж не прошел</h2>
          <p>
            Попробуйте оплатить еще раз или напишите в Telegram, чтобы мы помогли с оплатой.
          </p>
          <a href="https://t.me/m/Tt1zpXwvODJi" target="_blank" className={styles.payButton}>
            Написать в Telegram
          </a>
        </div>
      </section>
    </main>
  );
}
