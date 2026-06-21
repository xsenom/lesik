import type { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.css";

const rubik = { variable: "" };

export const metadata: Metadata = {
  title: "Схема роста — система заявок через контент и чат-ботов",
  description:
    "Рабочая тетрадь и техническая сборка системы привлечения заявок через контент, чат-ботов, автоворонки и автоматизацию.",
};

const painPoints = [
  "Нет стабильных заявок",
  "Контент не приводит клиентов",
  "Не понимаю, что выкладывать",
  "Боюсь продавать",
  "Нет системы",
  "Не знаю, как выйти в онлайн",
  "Работаю 24/7, но денег нет",
  "Хочу масштабироваться",
];

const systemItems = [
  {
    title: "Контент",
    text: "Что говорить в блоге, чтобы человек понимал вашу ценность и двигался к покупке.",
  },
  {
    title: "Логика воронки",
    text: "Как связать посты, сторис, лид-магнит, рабочую тетрадь, заявки и продажи.",
  },
  {
    title: "Чат-боты",
    text: "Как автоматизировать выдачу материалов, прогрев, сегментацию и дожим.",
  },
  {
    title: "Точки касания",
    text: "Как выстроить маршрут клиента от первого знакомства до заявки на продукт или услугу.",
  },
];

const services = [
  {
    title: "Рабочая тетрадь",
    text: "5 шагов к стабильному потоку заявок через контент и чат-бота. Подойдёт тем, кто хочет сначала собрать систему в голове.",
  },
  {
    title: "Разработка чат-ботов",
    text: "Проектируем и собираем чат-боты, автоворонки, квизы, выдачу материалов, оплаты и уведомления.",
  },
  {
    title: "Техническая сборка системы",
    text: "Соединяем сайт, бота, CRM, рассылки, оплату, таблицы, аналитику и сервисы в рабочую систему.",
  },
];

export default function LendPage() {
  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <header className={styles.header}>
        <a href="#top" className={styles.logo}>
          Екатерина Лецик
        </a>

        <input
          id="lend-menu-toggle"
          className={styles.burgerToggle}
          type="checkbox"
          aria-label="Открыть меню"
        />

        <label className={styles.burgerButton} htmlFor="lend-menu-toggle">
          <span />
          <span />
          <span />
        </label>

        <nav className={styles.nav}>
          <a href="#about">О нас</a>
          <a href="#services">Услуги</a>
          <a href="#cases">Кейсы</a>
          <a href="#reviews">Отзывы</a>
        </nav>

        <a
          href="https://t.me/+-TzbYv73KbUxOWJi"
          className={styles.headerButton}
          target="_blank"
        >
          Связаться с Екатериной
        </a>

        <div className={styles.socials}>
          <a href="https://vk.com/id4439359" aria-label="VK" target="_blank">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.2 17.2c-5.4 0-8.5-3.7-8.6-9.8h2.7c.1 4.5 2.1 6.4 3.6 6.8V7.4h2.6v3.9c1.5-.2 3-2 3.5-3.9h2.6c-.4 2.4-2.2 4.2-3.5 4.9 1.3.6 3.4 2.2 4.2 4.9h-2.9c-.6-1.8-1.9-3.2-3.9-3.5v3.5h-.3Z" />
            </svg>
          </a>

          <a
            href="https://t.me/+-TzbYv73KbUxOWJi"
            aria-label="Telegram"
            target="_blank"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.7 4.3 18.5 19c-.2 1-.8 1.2-1.6.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 12.7 1.4 11.2c-1-.3-1-1 .2-1.5L20.4 2.4c.9-.3 1.7.2 1.3 1.9Z" />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/ekaterina_letsik"
            aria-label="Instagram"
            target="_blank"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7.3A4.7 4.7 0 1 1 12 16.7 4.7 4.7 0 0 1 12 7.3Zm0 2A2.7 2.7 0 1 0 12 14.7 2.7 2.7 0 0 0 12 9.3Zm5-2.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
            </svg>
          </a>
        </div>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroBg} />

        <div className={styles.heroContent}>
          <h1>СХЕМА РОСТА</h1>

          <p className={styles.heroText}>
            выстройте систему стабильного привлечения заявок и продаж через
            контент, чат-ботов
          </p>

          <div className={styles.heroButtons}>
            <a href="/payment" className={styles.primaryButton}>
              ПОЛУЧИТЬ РАБОЧУЮ ТЕТРАДЬ
            </a>
          </div>
        </div>

        <div className={styles.heroVideoWrap}>
          <video
            className={styles.heroVideo}
            src="/images/videos/ekaterina.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>

        <div className={styles.heroBottom}>
          <div>
            Для экспертов, специалистов и предпринимателей, которые устали от
            хаотичного контента
          </div>
          <div>
            От разовых заявок — к многоканальной системе привлечения клиентов
          </div>
          <div>Соберите собственную систему стабильных заявок и продаж</div>
        </div>
      </section>

      <section id="workbook" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Рабочая тетрадь</p>
          <h2>Что внутри системы</h2>
          <p>
            Это не просто гайд. Это маршрут, по которому можно разложить свою
            экспертность, контент, офферы и техническую систему привлечения
            заявок.
          </p>
        </div>

        <div className={styles.systemGrid}>
          {systemItems.map((item, index) => (
            <article className={styles.systemCard} key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.schemeBox}>
          <div className={styles.schemeInfo}>
            <strong>Карта системы</strong>
            <p>
              Блог → лид-магнит → рабочая тетрадь → чат-бот → прогрев → заявка →
              продажа → повторные касания.
            </p>
          </div>

          <div className={styles.schemeOffer}>
            <div className={styles.schemeOfferLabel}>
              Рабочую тетрадь можно купить за
            </div>

            <div className={styles.schemePrices}>
              <span className={styles.oldPrice}>5000 ₽</span>
              <span className={styles.newPrice}>2100 ₽</span>
            </div>

            <a href="/payment" className={styles.primaryButton} target="_blank">
              Приобрести за 2100
            </a>
          </div>
        </div>
      </section>

      <section id="about" className={styles.trustSection}>
        <div className={styles.trustBlock}>
          <div className={styles.sectionHead}>
            <h2>ПОЧЕМУ НАМ ДОВЕРЯЮТ</h2>
            <p className={styles.authorLabel}>Автор рабочей тетради</p>
          </div>

          <div className={styles.trustRow}>
            <figure className={styles.trustPhoto}>
              <div className={styles.trustPhotoRole}>Автор рабочей тетради</div>
              <Image
                src="/images/team/ekaterina-lecik.jpg"
                alt="Екатерина Лецик"
                width={1024}
                height={1280}
              />
              <figcaption>Екатерина Лецик</figcaption>
            </figure>

            <div className={styles.trustCopy}>
              <h3>ЗНАЮ О ВОРОНКАХ НЕ НА СЛОВАХ, А НА ПРАКТИКЕ</h3>

              <p>
                Практикующий специалист по чат-ботам, автоматизации и системам
                продаж через соцсети
              </p>

              <p>
                За последние 4 года реализовала более 500 чат-ботов и воронок
                для экспертов, онлайн-школ и бизнеса
              </p>

              <p>
                Более 10 лет опыта в выстраивании процессов, автоматизации и
                внедрении систем — работала в Сбербанке
              </p>

              <ul>
                <li>
                  Работала с продвижением через VK, Facebook, Instagram,
                  myTarget и SEO
                </li>
                <li>
                  Участвовала в запуске онлайн-школ и образовательных проектов в
                  разных нишах
                </li>
                <li>Работала на запуске 5 потока у Мари Афониной</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.trustBlock}>
          <div className={styles.sectionHead}>
            <h2>ПОЧЕМУ НАМ ДОВЕРЯЮТ</h2>
          </div>

          <div className={`${styles.trustRow} ${styles.trustRowNoAside}`}>
            <figure className={styles.trustPhoto}>
              <Image
                src="/images/team/ilya.jpg"
                alt="Илья Лецик"
                width={1024}
                height={1280}
              />
              <figcaption>Илья Лецик</figcaption>
            </figure>

            <div className={styles.trustCopy}>
              <h3>РАЗРАБАТЫВАЮ ТО, ЧТО ДРУГИЕ СЧИТАЮТ НЕВОЗМОЖНЫМ</h3>

              <p>
                Разработчик, разрабатываю и технически реализую проекты, которые
                становятся полноценными системами продаж
              </p>

              <ul>
                <li>
                  участвовал в разработке приложений для Сбербанка (Сбербанк -
                  онлайн)
                </li>
                <li>разрабатывал сервисы для Роснефти</li>
                <li>разрабатывал чат-ботов для сети «Магнит»</li>
                <li>Создал и технически реализовал сервис для астрологов</li>
                <li>
                  специализируюсь на чат-ботах, автоворонках и системах
                  автоматизации продаж
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>услуги</p>
          <h2>Помогаем не просто придумать систему, а собрать её технически</h2>
          <p>
            Рабочая тетрадь помогает понять, какую систему вы хотите выстроить.
            А разработка помогает превратить эту схему в работающий инструмент.
          </p>
        </div>

        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article className={styles.serviceCard} key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.centerButtons}>
          <a href="#contact" className={styles.primaryButton}>
            Заказать разработку
          </a>
          <a href="#workbook" className={styles.secondaryButton}>
            Купить рабочую тетрадь
          </a>
        </div>
      </section>

      <section id="cases" className={styles.darkSection}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>с какими запросами к нам обращаются</p>
          <h2>Когда блог есть, но системы заявок нет</h2>
        </div>

        <div className={styles.chips}>
          {painPoints.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </div>

        <div className={styles.darkCta}>
          <p>
            Если в одном из этих запросов вы узнали себя — вам нужна не ещё одна
            случайная публикация, а понятная схема касаний и техническая связка.
          </p>
          <a href="#contact" className={styles.lightButton}>
            Разобрать мой запрос
          </a>
        </div>
      </section>

      <section id="reviews" className={styles.clientsSection}>
        <div className={styles.clientsInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>наши клиенты</p>
            <h2>Системы можно адаптировать под разные ниши</h2>
            <p>
              Мы работаем с экспертами, онлайн-школами, астрологами,
              психологами, маркетологами, магазинами, образовательными проектами
              и сервисными бизнесами.
            </p>
          </div>

          <div className={styles.clientsCollageWrap}>
            <Image
              className={styles.clientsCollage}
              src="/images/clients-collage.png"
              alt="Примеры клиентов и проектов"
              width={3000}
              height={1688}
              sizes="(max-width: 900px) 980px, 100vw"
            />
          </div>

          <div className={styles.clientsCaption}>
            <div>
              <strong>Это не просто красивые скрины</strong>
              <p>
                За каждым проектом стоит система: контент, упаковка, чат-бот,
                заявки и понятный путь клиента к покупке.
              </p>
            </div>

            <a href="#contact" className={styles.primaryButton}>
              Хочу такую систему
            </a>
          </div>
        </div>
      </section>

      <section id="payment" className={styles.paymentSection}>
        <div className={styles.paymentInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>тарифы и оплата</p>
            <h2>Рабочая тетрадь — 2100 ₽</h2>
            <p>
              Сейчас доступен один тариф: цифровая рабочая тетрадь «5 шагов к
              стабильным заявкам и продажам через чат-бота».
            </p>
          </div>

          <div className={styles.paymentGrid}>
            <div className={styles.paymentCard}>
              <h3>Тариф</h3>
              <p>Рабочая тетрадь в электронном формате</p>
              <strong>2100 ₽</strong>
            </div>

            <div className={styles.paymentCard}>
              <h3>Оплата</h3>
              <p>
                100% предоплата в рублях РФ по ссылке, счету или платежному
                способу, направленному Исполнителем.
              </p>
            </div>

            <div className={styles.paymentCard}>
              <h3>Возврат</h3>
              <p>
                Возврат возможен до предоставления доступа к цифровому
                материалу. После передачи доступа возврат не производится, если
                материал предоставлен надлежащим образом.
              </p>
            </div>

            <div className={styles.paymentCard}>
              <h3>Реквизиты</h3>
              <p>ИП Лецик Екатерина Андреевна</p>
              <p>ИНН 720414883539</p>
              <p>ОГРНИП 324723200018946</p>
            </div>
          </div>

          <div className={styles.paymentActions}>
            <a href="/payment" className={styles.secondaryButton}>
              Подробнее об оплате и возврате
            </a>
            <a href="/payment" className={styles.primaryButton} target="_blank">
              Приобрести за 2100
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contactSection}>
        <div>
          <p className={styles.eyebrow}>остались вопросы?</p>
          <h2>Оставьте заявку или напишите напрямую в Telegram</h2>
        </div>

        <div className={styles.contactActions}>
          <a
            href="https://t.me/+-TzbYv73KbUxOWJi"
            className={styles.primaryButton}
            target="_blank"
          >
            Оставить заявку
          </a>
          <a
            href="https://t.me/+-TzbYv73KbUxOWJi"
            className={styles.secondaryButton}
            target="_blank"
          >
            Написать в Telegram
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Екатерина Лецик</strong>
          <p>ИП Лецик Е. А.</p>
          <p>ИНН 720414883539</p>
          <p>ОГРНИП 324723200018946</p>
        </div>

        <div>
          <strong>Услуги</strong>
          <a href="#workbook">Рабочая тетрадь</a>
          <a href="#services">Разработка и техническая сборка</a>
          <a href="#tariffs">Тарифы на услуги</a>
        </div>

        <div>
          <strong>Пользователям</strong>
          <a href="/privacy">
            Политика в отношении обработки персональных данных
          </a>
          <a href="/payment">Тарифы, оплата и возврат</a>
          <a href="/oferta">Публичная оферта</a>
          <a href="/agreement">Пользовательское соглашение</a>
        </div>

        <div className={styles.footerBottom}>
          <span>Все права защищены</span>
          <a href="mailto:info@ekaterinaletsik.ru">info@ekaterinaletsik.ru</a>
        </div>
        <div className={styles.metaDisclaimer}>
          *Instagram принадлежит компании Meta Platforms Inc., которая признана
          на территории Российской Федерации экстремистской и запрещена.
        </div>
      </footer>
    </main>
  );
}
