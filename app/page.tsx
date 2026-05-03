import Link from "next/link";

const benefits = [
  "Анализ профиля и оффера за 10 минут",
  "План контента на 30 дней с задачами",
  "Сценарий прогрева: от касания до оплаты",
];

export default function LandingPage() {
  return (
    <main className="site-landing">
      <section className="site-landing-hero">
        <p className="site-landing-kicker">ЛЕСik • система роста эксперта</p>
        <h1>Приводите клиентов из контента каждый день, а не «время от времени»</h1>
        <p className="site-landing-subtitle">
          Платформа для экспертов, продюсеров и малого бизнеса: строит понятную
          систему продаж через контент, смыслы и ежедневные действия.
        </p>

        <div className="site-landing-actions">
          <Link href="/login" className="landing-primary">Войти в кабинет</Link>
          <Link href="/app/main" className="landing-secondary">Открыть главную</Link>
        </div>

        <ul className="site-landing-benefits">
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
