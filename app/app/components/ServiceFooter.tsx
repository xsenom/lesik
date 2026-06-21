import styles from "./ServiceFooter.module.css";

export default function ServiceFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <b>
            ЛЕС<span className={styles.brandIk}>ik</span>
          </b>
          <p>Сервис для системного роста через контент, смыслы и воронку.</p>
        </div>

        <div className={styles.info}>
          <p><strong>ИП:</strong> Лецик Екатерина Андреевна</p>
          <p><strong>ИНН:</strong> 720414883539</p>
          <p><strong>ОГРНИП:</strong> 324723200018946</p>
          <p><strong>Email:</strong> csenom@gmail.com</p>
        </div>

        <nav className={styles.links} aria-label="Документы">
          <a href="/oferta" target="_blank">Публичная оферта</a>
          <a href="/privacy" target="_blank">Политика обработки персональных данных</a>
          <a href="/agreement" target="_blank">Пользовательское соглашение</a>
        </nav>
      </div>
    </footer>
  );
}
