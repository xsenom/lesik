import Link from "next/link";

const benefits = [
  {
    title: "Анализ профиля",
    text: "ЛЕСik разбирает вашу нишу, продукт, аудиторию и текущую точку, чтобы не делать контент вслепую.",
  },
  {
    title: "Карта смыслов",
    text: "Собирает основу для продаж через контент: темы, смыслы, касания, путь клиента и воронку.",
  },
  {
    title: "Ежедневные действия",
    text: "Показывает, что делать сегодня: какой материал выпустить, что усилить и куда вести аудиторию.",
  },
  {
    title: "Контент-календарь",
    text: "Превращает стратегию в понятный план — без хаоса, ступора и вечного вопроса «что выкладывать?».",
  },
];

const steps = [
  {
    num: "01",
    title: "Заполняете профиль",
    text: "Определяем нишу, площадки, аудиторию, продукт и цель — чтобы система понимала ваш контекст.",
  },
  {
    num: "02",
    title: "Получаете карту продаж",
    text: "ЛЕСik собирает систему смыслов, маршрут клиента и контент-опоры под вашу задачу.",
  },
  {
    num: "03",
    title: "Идёте по шагам",
    text: "Каждый день у вас есть понятные действия, которые ведут к заявкам, доверию и продажам.",
  },
];

const audience = [
  "Экспертам, которые продают через контент",
  "Продюсерам и авторам продуктов",
  "Тем, кто устал вести соцсети без системы",
  "Тем, кому нужен путь: от внимания → к заявке → к оплате",
];

export default function LandingPage() {
  return (
    <main className="sales-landing">
      <section className="sales-hero">
        <div className="sales-hero-copy">
          <p className="sales-kicker">ЛЕСik · система маленьких шагов</p>

          <h1 className="sales-title">
            <span className="sales-title-gold">ПРЕВРАТИ КОНТЕНТ</span>
            <span className="sales-title-white">В КЛИЕНТОВ</span>
          </h1>

          <p className="sales-subtitle">
            ЛЕСik помогает выстроить продажи через контент:
            <br />
            от <mark>анализа профиля</mark> → к <mark>ежедневным действиям</mark> → к <mark>стабильным заявкам</mark>
          </p>

          <div className="sales-hero-points">
            <div>• выстраивает путь клиента от первого касания до оплаты</div>
            <div>• превращает идеи в систему контента и шагов</div>
            <div>• помогает не просто вести соцсети, а управлять потоком клиентов</div>
          </div>

          <div className="sales-hero-actions">
            <Link href="/login" className="sales-primary-btn">
              Начать
            </Link>

            <Link href="/app/main" className="sales-secondary-btn">
              Посмотреть систему
            </Link>
          </div>
        </div>

        <div className="sales-hero-side">
          <div className="sales-hero-panel">
            <div className="sales-mini-card">
              <span>Шаг 1</span>
              <strong>Анализ профиля</strong>
              <p>Кто вы, кому продаёте, через что продаёте и где сейчас теряются заявки.</p>
            </div>

            <div className="sales-mini-card">
              <span>Шаг 2</span>
              <strong>Карта смыслов</strong>
              <p>Смыслы, темы, касания, контент-опоры и маршрут клиента к покупке.</p>
            </div>

            <div className="sales-mini-card">
              <span>Шаг 3</span>
              <strong>Ежедневные действия</strong>
              <p>ЛЕСik показывает, что делать сегодня, чтобы это вело к продаже.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sales-section">
        <div className="sales-section-head">
          <p className="sales-kicker">Что делает ЛЕСik</p>
          <h2>Не просто идеи для постов, а система продаж через контент</h2>
        </div>

        <div className="sales-benefits-grid">
          {benefits.map((item) => (
            <article key={item.title} className="sales-benefit-card">
              <div className="sales-benefit-icon">✦</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sales-section sales-section-soft">
        <div className="sales-section-head">
          <p className="sales-kicker">Как это работает</p>
          <h2>Три шага от хаоса в контенте к системе продаж</h2>
        </div>

        <div className="sales-steps-grid">
          {steps.map((item) => (
            <article key={item.num} className="sales-step-card">
              <span className="sales-step-num">{item.num}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sales-section">
        <div className="sales-for-grid">
          <div className="sales-for-copy">
            <p className="sales-kicker">Для кого</p>
            <h2>ЛЕСik подойдёт тем, кто хочет продавать через контент системно</h2>
            <p>
              Если у вас уже есть экспертность, продукт, блог или желание продавать через
              контент — ЛЕСik помогает собрать это в понятную рабочую систему.
            </p>
          </div>

          <div className="sales-for-list">
            {audience.map((item) => (
              <div key={item} className="sales-for-item">
                <span>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sales-cta-block">
        <p className="sales-kicker">Готов начать?</p>
        <h2>Собери свою систему продаж через контент</h2>
        <p>
          Заполни профиль, задай основу стратегии и получай понятные ежедневные шаги.
        </p>

        <div className="sales-hero-actions sales-hero-actions-center">
          <Link href="/login" className="sales-primary-btn">
            Начать сейчас
          </Link>

          <Link href="/app/profile" className="sales-secondary-btn">
            Перейти в профиль
          </Link>
        </div>
      </section>
    </main>
  );
}
