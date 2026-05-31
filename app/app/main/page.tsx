"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

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
    { icon: "search", title: ["Анализ", "профиля"] },
    { icon: "map", title: ["Карта", "смыслов"] },
    { icon: "tasks", title: ["Ежедневные", "действия"] },
    { icon: "result", title: ["Результат:", "клиенты и доход"] },
  ];

  const leftChannels = [
    { label: "Соцсети", icon: "instagram" },
    { label: "Telegram", icon: "telegram" },
    { label: "YouTube", icon: "youtube" },
    { label: "Pinterest", icon: "pinterest" },
    { label: "Threads", icon: "threads" },
  ];

  const rightChannels = [
    { label: "Рассылки", icon: "mail" },
    { label: "Чат-боты", icon: "bot" },
    { label: "Сайт / Лендинг", icon: "site" },
    { label: "CRM / Системы", icon: "crm" },
    { label: "Оплата", icon: "pay" },
  ];

  const renderIcon = (name: string) => {
    if (name === "search") return (
      <svg viewBox="0 0 64 64"><circle cx="27" cy="27" r="15" /><path d="M39 39L52 52" /></svg>
    );
    if (name === "map") return (
      <svg viewBox="0 0 64 64"><path d="M10 18L24 11L40 18L54 11V47L40 54L24 47L10 54V18Z" /><path d="M24 11V47" /><path d="M40 18V54" /><circle cx="42" cy="18" r="4" /></svg>
    );
    if (name === "tasks") return (
      <svg viewBox="0 0 64 64"><path d="M20 14H15C12.8 14 11 15.8 11 18V52C11 54.2 12.8 56 15 56H49C51.2 56 53 54.2 53 52V18C53 15.8 51.2 14 49 14H44" /><path d="M23 11H41V20H23V11Z" /><path d="M22 32L27 37L36 27" /><path d="M22 45L27 50L38 39" /></svg>
    );
    if (name === "result") return (
      <svg viewBox="0 0 64 64"><path d="M12 52H54" /><path d="M17 52V37" /><path d="M29 52V28" /><path d="M41 52V20" /><path d="M50 13V25H38" /><path d="M19 34C29 29 38 23 50 13" /></svg>
    );
    if (name === "instagram") return (
      <svg viewBox="0 0 64 64"><rect x="17" y="17" width="30" height="30" rx="10" /><circle cx="32" cy="32" r="8" /><circle cx="42" cy="22" r="2.4" /></svg>
    );
    if (name === "telegram") return (
      <svg viewBox="0 0 64 64"><path d="M53 13L11 30L28 36L35 51L53 13Z" /><path d="M28 36L38 27" /></svg>
    );
    if (name === "youtube") return (
      <svg viewBox="0 0 64 64"><rect x="12" y="21" width="40" height="24" rx="8" /><path d="M29 27L39 33L29 39V27Z" /></svg>
    );
    if (name === "pinterest") return (
      <svg viewBox="0 0 64 64"><path d="M29 51C31 43 33 37 34 32" /><path d="M30 35C34 39 45 38 46 28C47 18 39 12 31 12C22 12 15 18 15 27C15 33 18 37 23 39" /><path d="M28 34C25 27 30 21 35 24C40 27 36 36 30 35Z" /></svg>
    );
    if (name === "threads") return (
      <svg viewBox="0 0 64 64"><path d="M45 25C43 16 36 12 29 13C20 14 15 21 15 32C15 44 22 51 33 51C43 51 50 45 50 36C50 28 44 24 35 24C27 24 23 28 23 33C23 39 28 42 34 41C41 40 44 35 42 29" /></svg>
    );
    if (name === "mail") return (
      <svg viewBox="0 0 64 64"><rect x="12" y="18" width="40" height="30" rx="4" /><path d="M14 21L32 35L50 21" /></svg>
    );
    if (name === "bot") return (
      <svg viewBox="0 0 64 64"><rect x="16" y="22" width="32" height="25" rx="9" /><path d="M32 22V13" /><circle cx="25" cy="34" r="2.4" /><circle cx="39" cy="34" r="2.4" /><path d="M26 42H38" /></svg>
    );
    if (name === "site") return (
      <svg viewBox="0 0 64 64"><rect x="12" y="17" width="40" height="32" rx="4" /><path d="M12 26H52" /><path d="M20 36H44" /></svg>
    );
    if (name === "crm") return <strong>CRM</strong>;
    return (
      <svg viewBox="0 0 64 64"><rect x="12" y="21" width="40" height="28" rx="4" /><path d="M12 29H52" /><path d="M20 40H29" /><path d="M35 40H44" /></svg>
    );
  };

  const sparks = Array.from({ length: 90 }).map((_, index) => (
    <i
      key={index}
      style={{
        left: `${40 + ((index * 31) % 24)}%`,
        top: `${5 + ((index * 47) % 86)}%`,
        width: `${2 + (index % 4)}px`,
        height: `${2 + (index % 4)}px`,
        animationDelay: `${(index % 13) * 0.12}s`,
      }}
    />
  ));

  return (
    <section className="refHero">
      <div className="refHeroCopy">
        <p></p>
        <p></p>
        <h1>
          <span>ПРЕВРАТИ ПРОДАЖИ</span>
          <b>В ЕЖЕДНЕВНУЮ ИГРУ</b>
        </h1>

        <div className="refHeroAction">
          <Link href="/app/content-map">Построить карту</Link>
          <p>Собери свою стратегию продаж</p>
        </div>
      </div>

      <div className="refHeroVisual">
        <div className="refHeroSparks" aria-hidden="true">{sparks}</div>

        <svg className="refHeroLines" viewBox="0 0 760 520" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="refHeroLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff9f17" stopOpacity="0.16" />
              <stop offset="50%" stopColor="#fff2a8" />
              <stop offset="100%" stopColor="#ff9f17" />
            </linearGradient>
            <filter id="refHeroGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#refHeroGlow)" stroke="url(#refHeroLine)" strokeWidth="2.6" strokeLinecap="round">
            <path d="M345 94 C280 68 205 56 95 62" />
            <path d="M345 154 C278 137 205 134 95 135" />
            <path d="M345 214 C278 208 205 210 95 210" />
            <path d="M345 274 C278 290 205 292 95 286" />
            <path d="M345 334 C282 372 205 376 95 360" />

            <path d="M430 94 C500 70 570 64 672 82" />
            <path d="M430 154 C508 138 585 138 678 150" />
            <path d="M430 214 C508 210 585 212 678 220" />
            <path d="M430 274 C508 296 585 302 678 296" />
            <path d="M430 334 C504 370 575 386 672 374" />
          </g>
        </svg>

        <div className="refHeroLeftChannels">
          {leftChannels.map((item) => (
            <div key={item.label} className={`refHeroChannel ${item.icon}`}>
              <span>{renderIcon(item.icon)}</span>
              <em>{item.label}</em>
            </div>
          ))}
        </div>

        <div className="refHeroPhone">
          <img src="/main-phone1.png" alt="Путь клиента" />
        </div>

        <div className="refHeroRightChannels">
          {rightChannels.map((item) => (
            <div key={item.label} className="refHeroTool">
              <span>{renderIcon(item.icon)}</span>
              <em>{item.label}</em>
            </div>
          ))}
        </div>
      </div>



      <style jsx global>{`
        .lesik-home-screen {
          width: 100%;
          max-width: 100%;
        }

        .refHero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          width: 100%;
          min-height: 520px;
          margin: 0 auto 22px;
          padding: 34px 34px 30px;
          display: grid;
          grid-template-columns: minmax(420px, 0.86fr) minmax(560px, 1.14fr);
          gap: 24px;
          border-radius: 28px;
          border: 1px solid rgba(112, 255, 98, 0.30);
          background:
            radial-gradient(circle at 17% 17%, rgba(22, 162, 79, 0.24), transparent 36%),
            radial-gradient(circle at 75% 44%, rgba(255, 169, 24, 0.12), transparent 34%),
            linear-gradient(135deg, #06160f 0%, #03100c 52%, #020807 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 204, 83, 0.06), 0 24px 80px rgba(0, 0, 0, 0.30);
        }

        .refHero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 74px 74px;
          opacity: 0.22;
        }

        .refHeroCopy {
          position: relative;
          z-index: 10;
          min-width: 0;
          padding-top: 26px;
          display: flex;
          flex-direction: column;
        }

        .refHeroCopy h1 {
          margin: 0 0 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 0.93;
          letter-spacing: -0.058em;
          font-weight: 950;
        }

        .refHeroCopy h1 span,
        .refHeroCopy h1 b {
          display: block;
          white-space: nowrap;
        }

        .refHeroCopy h1 span {
          font-size: clamp(38px, 3.45vw, 62px);
          background: linear-gradient(180deg, #fff4b8 0%, #ffc63d 48%, #bd7216 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .refHeroCopy h1 b {
          font-size: clamp(36px, 3.2vw, 58px);
          color: #f8fff3;
          font-weight: 950;
        }

        .refHeroSubtitle {
          margin: 0 0 22px;
          color: rgba(255,255,255,0.92);
          font-size: clamp(16px, 1.35vw, 21px);
          line-height: 1.32;
          letter-spacing: -0.035em;
        }

        .refHero mark {
          color: #ffd766;
          background: transparent;
          font-weight: 850;
        }

        .refHeroFeatures {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .refHeroFeatures article {
          position: relative;
          min-width: 0;
        }

        .refHeroFeatures article:not(:last-child)::after {
          content: "";
          position: absolute;
          right: -6px;
          top: 6px;
          width: 1px;
          height: 92px;
          background: linear-gradient(180deg, transparent, rgba(147,255,114,0.42), transparent);
        }

        .refHeroFeatures article div {
          width: 70px;
          height: 60px;
          margin-bottom: 10px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: #ffc94d;
          border: 1px solid rgba(106,255,101,0.36);
          background: linear-gradient(180deg, rgba(5,66,39,0.82), rgba(2,25,18,0.92));
          box-shadow: inset 0 0 18px rgba(83,255,98,0.13);
        }

        .refHeroFeatures svg,
        .refHeroNotes svg,
        .refHeroChannel svg,
        .refHeroTool svg {
          width: 30px;
          height: 30px;
          stroke: currentColor;
          fill: none;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .refHeroFeatures p {
          margin: 0;
          display: flex;
          flex-direction: column;
          color: rgba(255,255,255,0.92);
          font-size: 17px;
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .refHeroNotes {
          display: grid;
          gap: 15px;
        }

        .refHeroNotes > div {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 14px;
          align-items: center;
        }

        .refHeroNotes > div > span {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #62ff74;
          border: 1px solid rgba(82,255,96,0.66);
          background: radial-gradient(circle at 50% 30%, rgba(98,255,116,0.26), rgba(2,38,22,0.86) 66%);
          box-shadow: 0 0 18px rgba(56,255,80,0.24);
        }

        .refHeroNotes p {
          margin: 0;
          color: rgba(255,255,255,0.92);
          font-size: 16px;
          line-height: 1.34;
        }

        .refHeroVisual {
          position: relative;
          z-index: 8;
          height: 450px;
          min-width: 0;
        }

        .refHeroPhone {
          position: absolute;
          z-index: 12;
          left: 50%;
          top: 50%;
          width: clamp(270px, 19vw, 330px);
          transform: translate(-50%, -50%) rotate(7deg);
          filter: drop-shadow(22px 30px 34px rgba(0,0,0,0.58));
        }

        .refHeroPhone img {
          display: block;
          width: 100%;
          height: auto;
        }

        .refHeroLines {
          position: absolute;
          inset: 0;
          z-index: 8;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .refHeroSparks {
          position: absolute;
          inset: 0;
          z-index: 7;
          pointer-events: none;
          filter: drop-shadow(0 0 7px rgba(255,167,31,0.8));
        }

        .refHeroSparks i {
          position: absolute;
          display: block;
          border-radius: 999px;
          background: radial-gradient(circle, #fff8bf 0%, #ffc13a 35%, #ff7a00 68%, transparent 72%);
          opacity: 0;
          animation: refSpark 2.1s infinite ease-out;
        }

        @keyframes refSpark {
          0% { opacity: 0; transform: translate3d(0,0,0) scale(0.35); }
          22% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(18px,-18px,0) scale(1.1); }
        }

        .refHeroLeftChannels,
        .refHeroRightChannels {
          position: absolute;
          z-index: 18;
          display: grid;
        }

        .refHeroLeftChannels {
          left: 0;
          top: 28px;
          width: 104px;
          gap: 9px;
        }

        .refHeroRightChannels {
          right: 0;
          top: 70px;
          width: 245px;
          gap: 14px;
        }

        .refHeroChannel {
          width: 100px;
          display: grid;
          grid-template-rows: 52px auto;
          justify-items: center;
          color: rgba(255,255,255,0.92);
        }

        .refHeroChannel > span,
        .refHeroTool > span {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          color: #fff0a5;
          border: 1px solid rgba(117,255,91,0.62);
          background: radial-gradient(circle at 50% 35%, rgba(112,255,91,0.18), rgba(2,33,22,0.94) 68%);
          box-shadow: inset 0 0 14px rgba(117,255,91,0.14), 0 0 17px rgba(117,255,91,0.30);
        }

        .refHeroChannel em,
        .refHeroTool em {
          margin-top: 3px;
          color: rgba(255,255,255,0.92);
          font-style: normal;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 0 2px 12px rgba(0,0,0,0.65);
        }

        .refHeroTool {
          min-width: 240px;
          display: grid;
          grid-template-columns: 52px 1fr;
          align-items: center;
          gap: 12px;
          padding: 5px 14px 5px 5px;
          border: 1px solid rgba(255,190,35,0.58);
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(4,42,25,0.94), rgba(4,37,23,0.78));
          box-shadow: inset 0 0 18px rgba(87,255,88,0.06), 0 0 18px rgba(0,0,0,0.22);
        }

        .refHeroTool em {
          margin: 0;
          font-size: 15px;
          text-align: left;
        }

        .refHeroTool strong {
          font-size: 17px;
          color: #ffd866;
        }

        .refHeroAction {
          position: relative;
          z-index: 30;
          width: min(100%, 300px);
          margin: clamp(84px, 8vw, 130px) auto 0;
          text-align: center;
        }

        .refHeroAction a {
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          text-decoration: none;
          color: #241500;
          font-size: 19px;
          font-weight: 950;
          background: linear-gradient(180deg, #ffdc67 0%, #ffad19 52%, #e98709 100%);
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.42), inset 0 -4px 12px rgba(143,77,0,0.24), 0 0 32px rgba(255,175,23,0.38);
        }

        .refHeroAction p {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
        }

        @media (max-width: 1180px) {
          .refHero {
            grid-template-columns: 1fr;
          }

          .refHeroAction {
            width: min(100%, 300px);
            margin: 36px auto 0;
            order: 2;
          }

          .refHeroVisual {
            order: 3;
            width: min(100%, 760px);
            margin: 0 auto;
          }
        }

        @media (max-width: 720px) {
          .refHero {
            padding: 24px 16px;
            border-radius: 22px;
          }

          .refHeroCopy h1 span,
          .refHeroCopy h1 b {
            white-space: normal;
          }

          .refHeroFeatures {
            grid-template-columns: repeat(2, 1fr);
          }

          .refHeroFeatures article::after {
            display: none;
          }

          .refHeroVisual {
            height: 760px;
          }

          .refHeroLines {
            display: none;
          }

          .refHeroLeftChannels,
          .refHeroRightChannels {
            position: relative;
            left: auto;
            right: auto;
            top: auto;
            width: 100%;
            grid-template-columns: repeat(2, 1fr);
          }

          .refHeroRightChannels {
            margin-top: 440px;
          }

          .refHeroTool {
            min-width: 0;
            width: 100%;
          }

          .refHeroPhone {
            top: 310px;
            width: 185px;
          }

          .refHeroAction {
            width: min(100%, 280px);
            margin: 28px auto 0;
          }
        }
      `}</style>
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
          `${API_BASE}/profiles/by-email?email=${encodeURIComponent(savedEmail)}`
        );
        const profileData = await profileRes.json();

        if (profileData.profile?.name) {
          setName(profileData.profile.name);
        }

        if (profileData.profile) {
          setProfileNiche(profileData.profile.niche || "");
        }

        const mapRes = await fetch(
          `${API_BASE}/content-map/by-email?email=${encodeURIComponent(savedEmail)}`
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
        const res = await fetch(`${API_BASE}/videos`);
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
                    await fetch(`${API_BASE}/videos/${video.id}/view`, {
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














