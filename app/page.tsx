import Link from "next/link";

type Channel = { label: string; icon: string };

const leftChannels: Channel[] = [
  { label: "Telegram", icon: "✈" },
  { label: "YouTube", icon: "▶" },
  { label: "Pinterest", icon: "P" },
  { label: "Threads", icon: "@" },
];

const rightChannels: Channel[] = [
  { label: "Рассылки", icon: "✉" },
  { label: "Чат-боты", icon: "⚙" },
  { label: "Сайт / Лендинг", icon: "▭" },
  { label: "CRM / Системы", icon: "CRM" },
  { label: "Оплата", icon: "◫" },
];

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
            Система, которая превращает контент в клиентов:
            <br />от анализа профиля → к ежедневным действиям
          </p>
          <Link href="/login" className="landing-primary">
            Построить карту
          </Link>
          <small>Собери свою стратегию продаж</small>
        </div>

        <div className="landing-visual" aria-hidden>
          <ul className="landing-rail landing-rail-left">
            {leftChannels.map((channel) => (
              <li key={channel.label}>
                <span>{channel.icon}</span>
                {channel.label}
              </li>
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
              <p>Клиент с нами!</p>
            </div>
          </div>

          <ul className="landing-rail landing-rail-right">
            {rightChannels.map((channel) => (
              <li key={channel.label}>
                <span>{channel.icon}</span>
                {channel.label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
