import styles from "./BotFunnelScheme.module.css";

const funnelSteps = [
  {
    num: "1",
    title: "ПЕРВОЕ КАСАНИЕ",
    icon: "👋",
    subtitle: "Приветствие и вовлечение",
    items: [
      "Коротко о пользе бота и для кого он",
      "Формируем интерес",
      "Мягкий призыв продолжить",
    ],
    goal: "зацепить и вовлечь человека в диалог",
  },
  {
    num: "2",
    title: "СБОР ДАННЫХ И КВАЛИФИКАЦИЯ",
    icon: "📋",
    subtitle: "Диалог и вопросы",
    items: [
      "Выясняем ситуацию и потребности",
      "Задаём уточняющие вопросы",
      "Сегментируем по ответам",
    ],
    goal: "понять потребности и сегментировать",
  },
  {
    num: "3",
    title: "ЦЕННОСТЬ И ПОЛЬЗА",
    icon: "🎁",
    subtitle: "Даём пользу",
    items: [
      "Выдаём бесплатный подарок / чек-лист / мини-урок",
      "Полезный контент под ситуацию",
      "Показываем экспертность и результат",
    ],
    goal: "дать ценность и вызвать доверие",
  },
  {
    num: "4",
    title: "ПРОГРЕВ И ДОВЕРИЕ",
    icon: "💚",
    subtitle: "Контент прогрева",
    items: [
      "Истории и кейсы",
      "Отзывы и результаты",
      "Ответы на возражения",
      "Экспертный контент",
    ],
    goal: "усилить доверие и прогреть",
  },
  {
    num: "5",
    title: "ПРЕДЛОЖЕНИЕ (ОФФЕР)",
    icon: "🛍️",
    subtitle: "Делаем предложение",
    items: [
      "Предлагаем решение под задачу",
      "Показываем выгоды",
      "Ограничение или бонус",
    ],
    goal: "подвести к решению и действию",
  },
  {
    num: "6",
    title: "ПОКУПКА / ЗАЯВКА",
    icon: "✓",
    subtitle: "Целевое действие",
    items: [
      "Оплата / заявка / запись на консультацию",
      "Подтверждение и инструкции",
      "Сопровождение до результата",
    ],
    goal: "получить оплату или заявку",
  },
  {
    num: "7",
    title: "ПОСЛЕПРОДАЖА И ПОВТОРНЫЕ ПРОДАЖИ",
    icon: "↻",
    subtitle: "Забота и рост LTV",
    items: [
      "Поддержка и ответы",
      "Доп. польза и контент",
      "Сбор обратной связи",
      "Предложение следующих продуктов",
    ],
    goal: "удержать и увеличить ценность клиента",
  },
];

const triggers = [
  {
    icon: "✈️",
    title: "Вход в бот",
    text: "/start, реклама, ссылка, QR-код",
  },
  {
    icon: "❔",
    title: "Ответы пользователя",
    text: "разные ветки сценария по ответам",
  },
  {
    icon: "⏱️",
    title: "Задержки",
    text: "отправка сообщений через время",
  },
  {
    icon: "🔔",
    title: "Напоминания",
    text: "мягкие касания о боте и оффере",
  },
  {
    icon: "🎁",
    title: "Бонусы",
    text: "доп. материалы, скидки, подарки",
  },
  {
    icon: "💬",
    title: "Повторные касания",
    text: "реактивация, новый контент и офферы",
  },
];

export default function BotFunnelScheme() {
  return (
    <section className={styles.section}>
      <div className={styles.top}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            ЛЕС<span>ik</span>
          </div>
          <div className={styles.logoText}>система смыслов и продаж</div>
        </div>

        <div className={styles.heading}>
          <h2>ВОРОНКА В БОТЕ <span>🌿</span></h2>
          <p>Путь клиента внутри чат-бота от первого касания до покупки и повторных продаж</p>
        </div>

        <div className={styles.note}>
          <div className={styles.noteIcon}>💡</div>
          <p>Цель бота — прогреть, выстроить доверие и довести до целевого действия</p>
        </div>
      </div>

      <div className={styles.steps}>
        {funnelSteps.map((step, index) => (
          <div className={styles.stepWrap} key={step.num}>
            <article className={styles.card}>
              <div className={styles.badge}>{step.num}</div>
              <h3>{step.title}</h3>

              <div className={styles.iconCircle}>
                <span>{step.icon}</span>
              </div>

              <h4>{step.subtitle}</h4>

              <ul>
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className={styles.goal}>
                <b>Цель:</b>
                <span>{step.goal}</span>
              </div>
            </article>

            {index < funnelSteps.length - 1 && (
              <div className={styles.arrow}>→</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.automation}>
        <div className={styles.autoTitle}>
          <span>АВТОМАТИЗАЦИЯ</span>
          <span>И ТРИГГЕРЫ</span>
        </div>

        <div className={styles.triggerList}>
          {triggers.map((trigger) => (
            <div className={styles.trigger} key={trigger.title}>
              <div className={styles.triggerIcon}>{trigger.icon}</div>
              <div>
                <b>{trigger.title}</b>
                <p>{trigger.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <div className={styles.resultTitle}>🌱 ИТОГ</div>
        <div className={styles.resultChain}>
          <span>Человек получает пользу и решение</span>
          <i>→</i>
          <span>Выстраивается доверие и контакт</span>
          <i>→</i>
          <span>Клиент совершает целевое действие</span>
          <i>→</i>
          <span>Он остаётся и приносит повторные продажи</span>
        </div>
      </div>

      <div className={styles.forest}>🌲🌲🌲</div>
    </section>
  );
}
