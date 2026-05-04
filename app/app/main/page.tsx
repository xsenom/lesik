"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type CalendarItem = {
  day?: number;
  date?: string;
  date_label?: string;
  platform?: string;
  format?: string;
  topic?: string;
  task?: string;
  goal?: string;
  title?: string;
  description?: string;
  tasks?: { id: string; text: string }[];
};

type CalendarDay = {
  date: string;
  title: string;
  description: string;
  platform: string;
  tasks: { id: string; text: string }[];
};

type VideoItem = {
  id: number;
  title: string;
  description: string;
  url: string;
};

const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/";

function getYouTubeEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
    }
  } catch {}

  return "";
}

function SwipeRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0 });

  return (
    <div
      ref={ref}
      className={className}
      onMouseDown={(e) => {
        if (!ref.current) return;

        drag.current = {
          down: true,
          startX: e.pageX,
          scrollLeft: ref.current.scrollLeft,
        };
      }}
      onMouseLeave={() => {
        drag.current.down = false;
      }}
      onMouseUp={() => {
        drag.current.down = false;
      }}
      onMouseMove={(e) => {
        if (!drag.current.down || !ref.current) return;

        e.preventDefault();
        const walk = (e.pageX - drag.current.startX) * 1.35;
        ref.current.scrollLeft = drag.current.scrollLeft - walk;
      }}
    >
      {children}
    </div>
  );
}

function toLocalKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHumanDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getMonthMatrix(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 35 }).map((_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return d;
  });
}

function buildCalendarDays(calendar: CalendarItem[], startDate: string): CalendarDay[] {
  const base = startDate ? new Date(startDate) : new Date();

  return calendar.map((item, index) => {
    const date = item.date
      ? item.date
      : (() => {
          const d = new Date(base);
          d.setDate(base.getDate() + index);
          return toLocalKey(d);
        })();

    const title = item.title || item.format || item.topic || `День ${index + 1}`;
    const description = item.description || item.goal || item.topic || "Контент-задача";
    const platform = item.platform || "Контент";

    const tasks =
      item.tasks && item.tasks.length
        ? item.tasks
        : [
            {
              id: `task-${index + 1}-1`,
              text: item.task || `Выполнить задачу по теме: ${title}`,
            },
            {
              id: `task-${index + 1}-2`,
              text: "Подготовить материал с одной понятной мыслью",
            },
            {
              id: `task-${index + 1}-3`,
              text: "Опубликовать и собрать реакции аудитории",
            },
          ];

    return {
      date,
      title,
      description,
      platform,
      tasks,
    };
  });
}

function PromoHero() {
  const featureCards = [
    { icon: "⌕", title: "Анализ\nпрофиля" },
    { icon: "◇", title: "Карта\nсмыслов" },
    { icon: "☑", title: "Ежедневные\nдействия" },
    { icon: "↗", title: "Результат:\nклиенты и доход" },
  ];

  const leftChannels = [
    { key: "instagram", label: "Соцсети" },
    { key: "telegram", label: "Telegram" },
    { key: "youtube", label: "YouTube" },
    { key: "pinterest", label: "Pinterest" },
    { key: "threads", label: "Threads" },
  ];

  const rightChannels = [
    { key: "mail", label: "Рассылки" },
    { key: "bot", label: "Чат-боты" },
    { key: "site", label: "Сайт / Лендинг" },
    { key: "crm", label: "CRM / Системы" },
    { key: "pay", label: "Оплата" },
  ];

  const renderIcon = (key: string) => {
    switch (key) {
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="5" />
            <circle cx="12" cy="12" r="3.5" />
            <circle cx="17.2" cy="6.8" r="1" className="hero-final-svg-fill" />
          </svg>
        );

      case "telegram":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 5L4 11.2L10.2 13.3L12.7 19L20 5Z" />
            <path d="M10.2 13.3L20 5" />
          </svg>
        );

      case "youtube":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="6.5" width="17" height="11" rx="4" />
            <path d="M10 9.2L15 12L10 14.8Z" className="hero-final-svg-fill" />
          </svg>
        );

      case "pinterest":
        return <span className="hero-final-icon-letter">P</span>;

      case "threads":
        return <span className="hero-final-icon-letter">@</span>;

      case "mail":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="6" width="16" height="12" rx="2.5" />
            <path d="M5 8L12 13L19 8" />
          </svg>
        );

      case "bot":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="7" width="12" height="10" rx="3" />
            <path d="M12 4V7" />
            <path d="M8 18V20" />
            <path d="M16 18V20" />
            <circle cx="10" cy="12" r="1" className="hero-final-svg-fill" />
            <circle cx="14" cy="12" r="1" className="hero-final-svg-fill" />
          </svg>
        );

      case "site":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="5" width="16" height="14" rx="2.5" />
            <path d="M4 9H20" />
            <circle cx="7" cy="7" r="0.8" className="hero-final-svg-fill" />
            <circle cx="9.5" cy="7" r="0.8" className="hero-final-svg-fill" />
          </svg>
        );

      case "crm":
        return <span className="hero-final-icon-letter hero-final-icon-letter-small">CRM</span>;

      case "pay":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="6.5" width="16" height="11" rx="2.5" />
            <path d="M4 10H20" />
            <path d="M8 14.2H11.8" />
          </svg>
        );

      default:
        return <span className="hero-final-icon-letter">•</span>;
    }
  };

  return (
    <section className="hero-final">
      <div className="hero-final-copy">
        <p className="hero-final-kicker">ЛЕСik · система маленьких шагов</p>

                <h1 className="hero-final-title">
          <span className="hero-final-title-gold">ПРЕВРАТИ ПРОДАЖИ</span>
        </h1>



        <h1 className="hero-final-title hero-final-title-second">
          <span className="hero-final-title-white">В ЕЖЕДНЕВНУЮ ИГРУ</span>
        </h1>

        <p className="hero-final-subtitle">
          Система, которая превращает контент в клиентов:
          <br />
          от <mark>анализа профиля</mark> → к <mark>ежедневным действиям</mark>
        </p>

          <Link href="/app/content-map" className="hero-final-title-cta">
              Построить карту
          </Link>



      </div>

      <div className="hero-final-center">
        <div className="hero-final-socials hero-final-socials-left">
          {leftChannels.map((item) => (
            <div key={item.label} className="hero-final-pill">
              <span className={`hero-final-pill-icon hero-final-pill-icon-${item.key}`}>
                {renderIcon(item.key)}
              </span>
              <span className="hero-final-pill-text">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="hero-final-phone-wrap">
          <div className="hero-final-phone-glow" />
          <img src="/main-phone1.png" alt="Путь клиента" className="hero-final-phone-image" />
        </div>
      </div>

      <div className="hero-final-side">
<p className="hero-final-side-subtitle">Собери свою стратегию продаж</p>

        <div className="hero-final-socials hero-final-socials-right">
          {rightChannels.map((item) => (
            <div key={item.label} className="hero-final-pill">
              <span className={`hero-final-pill-icon hero-final-pill-icon-${item.key}`}>
                {renderIcon(item.key)}
              </span>
              <span className="hero-final-pill-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default function TrendsPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [profileNiche, setProfileNiche] = useState("");
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [goalChecks, setGoalChecks] = useState<Record<string, string[]>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [name, setName] = useState("друг");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [instaCalendarOpen, setInstaCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [notify, setNotify] = useState({
    email: true,
    telegram: false,
    wallet: false,
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("lesik_email") || "";
    const savedStartDate = localStorage.getItem("lesik_calendar_start") || "";
    const savedNotify = localStorage.getItem("lesik_notify");
    const savedChecks = localStorage.getItem(`lesik-goal-checks:${savedEmail}`);

    setEmail(savedEmail);
    setStartDate(savedStartDate);
    setSelectedStartDate(savedStartDate);

    if (savedNotify) {
      try {
        setNotify(JSON.parse(savedNotify));
      } catch {}
    }

    if (savedChecks) {
      try {
        setGoalChecks(JSON.parse(savedChecks));
      } catch {}
    }

    if (!savedEmail) return;

    const load = async () => {
      try {
        const profileRes = await fetch(
          `http://localhost:8000/profiles/by-email?email=${encodeURIComponent(savedEmail)}`
        );
        const profileData = await profileRes.json();

        if (profileData.profile?.name) {
          setName(profileData.profile.name);
        }

        if (profileData.profile) {
          setProfileNiche(profileData.profile.niche || "");
        }

        const mapRes = await fetch(
          `http://localhost:8000/content-map/by-email?email=${encodeURIComponent(savedEmail)}`
        );
        const mapData = await mapRes.json();

        const loadedCalendar = mapData.content_map?.map?.calendar || [];
        setCalendar(loadedCalendar);

        if (loadedCalendar.length) {
          const normalized = buildCalendarDays(loadedCalendar, savedStartDate);
          setCalendarDays(normalized);

          const firstDate = normalized[0].date;
          setSelectedDateKey(firstDate);
          setCalendarMonth(new Date(firstDate));
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch("http://localhost:8000/videos");
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (e) {
        console.error(e);
      }
    };

    loadVideos();
  }, []);

  useEffect(() => {
    if (!calendar.length) return;

    const normalized = buildCalendarDays(calendar, startDate);
    setCalendarDays(normalized);

    if (!selectedDateKey && normalized[0]) {
      setSelectedDateKey(normalized[0].date);
      setCalendarMonth(new Date(normalized[0].date));
    }
  }, [calendar, startDate, selectedDateKey]);

  const confirmCalendarStart = () => {
    if (!selectedStartDate) return;

    localStorage.setItem("lesik_calendar_start", selectedStartDate);
    localStorage.setItem("lesik_notify", JSON.stringify(notify));

    setStartDate(selectedStartDate);
    setCalendarOpen(false);

    if (calendar.length) {
      const normalized = buildCalendarDays(calendar, selectedStartDate);
      setCalendarDays(normalized);

      if (normalized[0]) {
        setSelectedDateKey(normalized[0].date);
        setCalendarMonth(new Date(normalized[0].date));
      }
    }
  };

  const selectedDay =
    calendarDays.find((item) => item.date === selectedDateKey) || null;

  const selectedDayTasks = selectedDay?.tasks || [];
  const monthDays = useMemo(() => getMonthMatrix(calendarMonth), [calendarMonth]);

  const completedForDay = (date: string) => goalChecks[date] || [];
  const isDayCompleted = (date: string) => completedForDay(date).length > 0;
  const hasPlanForDay = (date: string) =>
    calendarDays.some((item) => item.date === date);

  const doneCount = selectedDay ? completedForDay(selectedDay.date).length : 0;
  const allCount = selectedDayTasks.length;

  function toggleTask(date: string, taskId: string) {
    setGoalChecks((prev) => {
      const current = prev[date] || [];
      const next = current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId];

      const updated = { ...prev, [date]: next };

      if (email) {
        localStorage.setItem(`lesik-goal-checks:${email}`, JSON.stringify(updated));
      }

      return updated;
    });
  }

  const futureStartDays = useMemo(() => {
    const base = new Date();

    return Array.from({ length: 35 }).map((_, index) => {
      const d = new Date(base);
      d.setDate(base.getDate() + index);

      return {
        value: toLocalKey(d),
        day: d.getDate(),
        weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }),
        month: d.toLocaleDateString("ru-RU", { month: "short" }),
      };
    });
  }, []);

  return (
    <section className="lesik-home-screen">
      <PromoHero />

      <div className="home-main-grid-ios">
        <section className="ios-glass-card goals-ios-card">
          <div className="ios-card-head">
            <div>
              <p className="home-kicker">Сегодня</p>
              <h2>Цели на день</h2>
            </div>

            {calendarDays.length > 0 && (
              <span>
                {doneCount}/{allCount}
              </span>
            )}
          </div>

          {calendarDays.length === 0 ? (
            <div className="daily-goals-empty">
              Сначала сформируйте карту контента. После этого ЛЕСik покажет цели
              на день, и они будут сформированы ИИ по каждому дню.
            </div>
          ) : !selectedDay ? (
            <div className="daily-goals-empty">Выберите день в календаре.</div>
          ) : (
            <>
              <div className="insta-selected-day-card">
                <div className="insta-selected-day-title">{selectedDay.title}</div>
                <div className="insta-selected-day-subtitle">
                  {formatHumanDate(selectedDay.date)} · {selectedDay.description}
                </div>
              </div>

              <div className="daily-goals-list">
                {selectedDayTasks.map((task) => {
                  const done = completedForDay(selectedDay.date).includes(task.id);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      className={done ? "daily-goal-item is-done" : "daily-goal-item"}
                      onClick={() => toggleTask(selectedDay.date, task.id)}
                    >
                      <span className="daily-goal-check" />
                      <span className="daily-goal-text">{task.text}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>


      </div>

      {calendarDays.length > 0 && (
        <section className="ios-glass-card home-calendar-strip home-calendar-promo">
          <div>
            <p className="home-kicker">План публикаций</p>
            <h2>Ближайшие дни</h2>
            <p className="calendar-promo-text">
              ЛЕСik уже разложил задачи по дням. Откройте календарь, чтобы видеть
              план, выбирать дату и отмечать выполненные цели.
            </p>
          </div>

          <button
            type="button"
            className="open-calendar-button"
            onClick={() => setInstaCalendarOpen(true)}
          >
            Открыть календарь
          </button>
        </section>
      )}

      {!calendarDays.length && (
        <section className="ios-glass-card empty-calendar-card">
          <h2>Карта контента ещё не создана</h2>
          <p>
            Сначала сформируйте карту. После этого появятся календарь, цели на день
            и динамика.
          </p>
          <Link href="/app/content-map">Сформировать карту</Link>
        </section>
      )}

      <section className="ios-glass-card home-video-section">
        <div className="video-head">
          <h2>Видео от Кати</h2>
          <p>Можно листать пальцем или мышкой</p>
        </div>

        <SwipeRow className="video-row">
          {videos.map((video) => (
            <article className="video-card" key={video.id}>
              <div className="video-preview">
                <span>▶</span>
              </div>

              <h3>{video.title}</h3>
              <p>{video.description}</p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:8000/videos/${video.id}/view`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                  } catch (e) {
                    console.error(e);
                  }

                  setActiveVideo(video);
                }}
              >
                ▶ Смотреть
              </button>
            </article>
          ))}
        </SwipeRow>
      </section>

      {activeVideo && (
        <div className="profile-modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div
            className="profile-modal profile-modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Видеоурок</p>
                <h2>{activeVideo.title}</h2>
              </div>

              <button type="button" onClick={() => setActiveVideo(null)}>
                ×
              </button>
            </div>

            {getYouTubeEmbed(activeVideo.url) ? (
              <iframe
                title={activeVideo.title}
                src={getYouTubeEmbed(activeVideo.url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  width: "100%",
                  minHeight: 420,
                  border: 0,
                  borderRadius: 18,
                }}
              />
            ) : (
              <video
                controls
                autoPlay
                src={activeVideo.url}
                style={{ width: "100%", borderRadius: 18, background: "#000" }}
              />
            )}
          </div>
        </div>
      )}

      {instaCalendarOpen && (
        <div
          className="insta-calendar-modal-backdrop"
          onClick={() => setInstaCalendarOpen(false)}
        >
          <div className="insta-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="insta-calendar-modal-head">
              <div>
                <p>Архив задач</p>
                <h2>{formatMonthLabel(calendarMonth)}</h2>
              </div>

              <button type="button" onClick={() => setInstaCalendarOpen(false)}>
                ×
              </button>
            </div>

            <section className="insta-calendar insta-calendar-in-modal">
              <div className="insta-weekdays">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                  <div key={day} className="insta-weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="insta-days-grid">
                {monthDays.map((dateObj) => {
                  const key = toLocalKey(dateObj);
                  const sameMonth = dateObj.getMonth() === calendarMonth.getMonth();

                  return (
                    <div
                      key={key}
                      className={[
                        "insta-day",
                        sameMonth ? "" : "is-empty",
                        hasPlanForDay(key) ? "has-plan" : "",
                        isDayCompleted(key) ? "is-completed" : "",
                        selectedDateKey === key ? "is-selected" : "",
                      ].join(" ")}
                      onClick={() => {
                        if (sameMonth && hasPlanForDay(key)) {
                          setSelectedDateKey(key);
                        }
                      }}
                    >
                      <div className="insta-day-number">{dateObj.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="insta-selected-day-card insta-modal-day-card">
                  <div className="insta-selected-day-title">
                    {formatHumanDate(selectedDay.date)}
                  </div>

                  <div className="insta-selected-day-subtitle">
                    {selectedDay.title} · {selectedDay.description}
                  </div>

                  <div className="insta-modal-day-tasks">
                    {selectedDay.tasks.map((task) => {
                      const done = completedForDay(selectedDay.date).includes(task.id);

                      return (
                        <button
                          key={task.id}
                          type="button"
                          className={done ? "insta-modal-task is-done" : "insta-modal-task"}
                          onClick={() => toggleTask(selectedDay.date, task.id)}
                        >
                          <span className="insta-modal-task-check">{done ? "✓" : ""}</span>
                          <span>{task.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <footer className="home-faq-footer ios-glass-card">
        <div>
          <h2>Вопросы и ответы</h2>
          <p>Здесь будет раздел с подсказками, ответами и быстрыми ссылками.</p>
        </div>

        <Link href="/app/profile">Проверить профиль</Link>
      </footer>

      {calendarOpen && (
        <div className="calendar-modal-backdrop" onClick={() => setCalendarOpen(false)}>
          <div
            className="calendar-modal ios-calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-modal-head">
              <div>
                <p className="calendar-year">2026</p>
                <h2>Календарь</h2>
              </div>

              <button type="button" onClick={() => setCalendarOpen(false)}>
                ×
              </button>
            </div>

            <div className="real-calendar-grid">
              {futureStartDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={selectedStartDate === day.value ? "selected" : ""}
                  onClick={() => setSelectedStartDate(day.value)}
                >
                  <small>{day.weekday}</small>
                  <b>{day.day}</b>
                  <span>{day.month}</span>
                </button>
              ))}
            </div>

            <div className="ios-event-preview">
              <i />
              <div>
                <h3>
                  {selectedStartDate
                    ? `Начать вести с ${formatHumanDate(selectedStartDate)}`
                    : "Выберите день старта"}
                </h3>
                <p>С этого дня начнутся задачи, напоминания и календарь публикаций.</p>
              </div>
            </div>

            <div className="notify-box">
              <h3>Куда присылать уведомления?</h3>

              <label>
                <input
                  type="checkbox"
                  checked={notify.email}
                  onChange={(e) => setNotify((p) => ({ ...p, email: e.target.checked }))}
                />
                <span>Email</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={notify.telegram}
                  onChange={(e) =>
                    setNotify((p) => ({ ...p, telegram: e.target.checked }))
                  }
                />
                <span>Telegram</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={notify.wallet}
                  onChange={(e) => setNotify((p) => ({ ...p, wallet: e.target.checked }))}
                />
                <span>Wallet-карточка</span>
              </label>

              {notify.telegram && (
                <div className="telegram-connect-box">
                  <div>
                    <strong>Подключите Telegram-бота</strong>
                    <p>
                      Перейдите в бота и нажмите Start. После подключения ЛЕСik сможет
                      присылать напоминания по календарю в Telegram.
                    </p>
                  </div>

                  <a href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">
                    Перейти в бота
                  </a>
                </div>
              )}
            </div>

            {selectedStartDate && (
              <button className="calendar-confirm" type="button" onClick={confirmCalendarStart}>
                Начать вести с {formatHumanDate(selectedStartDate)}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}














