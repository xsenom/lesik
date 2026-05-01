import Link from "next/link";

const leftChannels = ["Telegram", "YouTube", "Pinterest", "Threads"];
const rightChannels = ["Рассылки", "Чат-боты", "Сайт / Лендинг", "CRM / Системы", "Оплата"];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <h1>
            <span>ПРЕВРАТИ ПРОДАЖИ</span>
            <br />В ЕЖЕДНЕВНУЮ ИГРУ
          </h1>

          <p>
            Система, которая превращает контент
            <br />в клиентов: от анализа профиля →
            <br />к ежедневным действиям
          </p>

          <div className="landing-actions">
            <Link href="/login" className="landing-primary">
              Построить карту
            </Link>
          </div>

          <small>Собери свою стратегию продаж</small>
        </div>

        <div className="landing-visual" aria-hidden>
          <ul className="landing-rail landing-rail-left">
            {leftChannels.map((channel) => (
              <li key={channel}>{channel}</li>
            ))}
          </ul>

          <div className="landing-phone">
            <div className="landing-phone-screen">
              <h2>Путь клиента</h2>
              <ol>
                <li>Касание</li>
                <li>Интерес</li>
                <li>Доверие</li>
                <li>Решение</li>
                <li>Оплата</li>
              </ol>
              <p>✓ Клиент с нами!</p>
            </div>
          </div>

          <ul className="landing-rail landing-rail-right">
            {rightChannels.map((channel) => (
              <li key={channel}>{channel}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
