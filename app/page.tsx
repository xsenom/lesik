import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-badge">ЛЕСik · лес переходов</div>

        <h1>
          Система, которая помогает эксперту расти через контент, цели и ежедневные действия
        </h1>

        <p>
          ЛЕСik собирает профиль клиента, понимает нишу, цели и препятствия,
          а затем помогает построить карту контента, идеи, квесты и план движения.
        </p>

        <div className="landing-actions">
          <Link href="/login" className="landing-primary">
            Войти в личный кабинет
          </Link>
          <a href="#features" className="landing-secondary">
            Что умеет ЛЕСik
          </a>
        </div>
      </section>

      <section className="landing-features" id="features">
        <article>
          <span>01</span>
          <h2>Профиль клиента</h2>
          <p>Собирает email, имя, нишу, площадки, цель и главное препятствие.</p>
        </article>

        <article>
          <span>02</span>
          <h2>Карта контента</h2>
          <p>Помогает разложить продвижение на направления, рубрики и действия.</p>
        </article>

        <article>
          <span>03</span>
          <h2>Квесты роста</h2>
          <p>Превращает цель на месяц в понятные ежедневные шаги.</p>
        </article>
      </section>
    </main>
  );
}
