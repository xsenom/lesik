import Image from "next/image";
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
            Система, которая превращает контент
            <br />в клиентов: от анализа профиля →
            <br />к ежедневным действиям
          </p>
          <Link href="/login" className="landing-primary">Построить карту</Link>
          <small>Собери свою стратегию продаж</small>
        </div>

        <div className="landing-visual" aria-hidden>
          <ul className="landing-rail landing-rail-left">
            {leftChannels.map((channel) => (
              <li key={channel.label}><span>{channel.icon}</span>{channel.label}</li>
            ))}
          </ul>

          <div className="landing-phone">
            <Image src="/trends/phone-ref.png" alt="Путь клиента" width={360} height={720} priority />
          </div>

          <ul className="landing-rail landing-rail-right">
            {rightChannels.map((channel) => (
              <li key={channel.label}><span>{channel.icon}</span>{channel.label}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
