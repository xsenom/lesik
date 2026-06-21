"use client";

import { Rubik } from "next/font/google";

const rubik = Rubik({ subsets: ["cyrillic", "latin"], weight: ["400","700","800","900"], display: "swap", variable: "--font-rubik" });

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



function ServiceFooter() {
  return (
    <footer className="service-footer">
      <div className="service-footer-inner">
        <div className="service-footer-brand">
          <b>ЛЕС<span className="brand-ik">ik</span></b>
          <p>Сервис для системного роста через контент, смыслы и воронку.</p>
        </div>

        <div className="service-footer-info">
          <p><strong>ИП:</strong> Лецик Екатерина Андреевна</p>
          <p><strong>ИНН:</strong> 720414883539</p>
          <p><strong>ОГРНИП:</strong> 324723200018946</p>
          <p><strong>Email:</strong> csenom@gmail.com</p>
        </div>

        <nav className="service-footer-links" aria-label="Документы">
          <a href="/oferta" target="_blank">Публичная оферта</a>
          <a href="/privacy" target="_blank">Политика обработки персональных данных</a>
          <a href="/agreement" target="_blank">Пользовательское соглашение</a>
        </nav>
      </div>
    </footer>
  );
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

        <div className="refHeroAction mobile-main-hero-fit">
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

  // LESIK_RESULT_CARD_AFTER_NOTIFICATIONS_FORCE_FINAL
  useEffect(() => {
    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const buildResultHtml = () => {
      let result: any = null;

      try {
        const raw = window.localStorage.getItem("lesik_test_result");
        result = raw ? JSON.parse(raw) : null;
      } catch {
        result = null;
      }

      const hasResult = Boolean(result?.label);

      const label = hasResult ? result.label : "Тест ещё не пройден";
      const desc = hasResult
        ? result.desc
        : "После прохождения теста здесь появится результат и акценты для карты контента.";

      const score = hasResult ? result.score ?? 0 : 0;
      const maxScore = hasResult ? result.maxScore ?? 50 : 50;
      const days = hasResult ? result.days ?? "—" : "—";
      const focus = Array.isArray(result?.focus) ? result.focus : [];

      return `
        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:12px;
        ">
          <img src="/leaf-icon.png" alt="" style="width:18px;height:18px;object-fit:contain;" />
          <strong style="font-size:18px;font-weight:900;color:#0a2e18;">Результат теста</strong>
        </div>

        <div style="
          border-radius:18px;
          background:rgba(10,92,58,0.07);
          padding:14px 16px;
          margin-bottom:12px;
        ">
          <div style="font-size:19px;font-weight:900;color:#0a2e18;margin-bottom:5px;">
            ${escapeHtml(label)}
          </div>
          <div style="font-size:14px;line-height:1.5;color:#395444;">
            ${escapeHtml(desc)}
          </div>
        </div>

        <div style="font-size:14px;line-height:1.5;color:#395444;margin-bottom:12px;">
          ЛЕСik будет учитывать этот результат при построении профиля и карты контента.
        </div>

        ${
          focus.length
            ? `<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;">
                ${focus
                  .map(
                    (item: string) =>
                      `<span style="border-radius:999px;padding:8px 11px;background:#0a5c3a;color:#fff;font-size:12px;font-weight:800;">${escapeHtml(item)}</span>`
                  )
                  .join("")}
              </div>`
            : ""
        }

        <div style="font-size:12px;color:#6b766d;">
          Счёт: ${escapeHtml(score)} из ${escapeHtml(maxScore)} · прогрев: ${escapeHtml(days)}
        </div>
      `;
    };

    const findNotificationsCard = () => {
      const elements = Array.from(document.querySelectorAll("body *")) as HTMLElement[];

      const candidates: HTMLElement[] = [];

      for (const el of elements) {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();

        if (!text.includes("УВЕДОМЛЕНИЯ") || !text.includes("Email")) continue;
        if (text.includes("КТО КЛИЕНТ")) continue;
        if (text.includes("Результат теста")) continue;

        const rect = el.getBoundingClientRect();

        if (rect.width >= 250 && rect.width <= 700 && rect.height >= 60 && rect.height <= 220) {
          candidates.push(el);
        }
      }

      candidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return ar.width * ar.height - br.width * br.height;
      });

      return candidates[0] || null;
    };

    const mountResult = () => {
      const pageText = document.body.innerText || "";

      if (!pageText.includes("КТО КЛИЕНТ") || !pageText.includes("УВЕДОМЛЕНИЯ")) {
        document.querySelectorAll("[data-lesik-profile-result-card='true']").forEach((el) => el.remove());
        return;
      }

      const notificationsCard = findNotificationsCard();
      if (!notificationsCard) return;

      let holder = document.querySelector("[data-lesik-profile-result-card='true']") as HTMLElement | null;

      if (!holder) {
        holder = document.createElement("section");
        holder.setAttribute("data-lesik-profile-result-card", "true");

        holder.style.setProperty("border", "1px solid rgba(10, 92, 58, 0.16)", "important");
        holder.style.setProperty("background", "rgba(255, 253, 248, 0.96)", "important");
        holder.style.setProperty("border-radius", "22px", "important");
        holder.style.setProperty("padding", "20px", "important");
        holder.style.setProperty("margin", "14px 0 0", "important");
        holder.style.setProperty("box-shadow", "0 14px 36px rgba(10, 92, 58, 0.12)", "important");
        holder.style.setProperty("color", "#0a2e18", "important");
        holder.style.setProperty("box-sizing", "border-box", "important");

        notificationsCard.insertAdjacentElement("afterend", holder);
      }

      holder.innerHTML = buildResultHtml();
    };

    mountResult();

    const timer = window.setInterval(mountResult, 300);

    window.addEventListener("storage", mountResult);
    window.addEventListener("focus", mountResult);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", mountResult);
      window.removeEventListener("focus", mountResult);
      document.querySelectorAll("[data-lesik-profile-result-card='true']").forEach((el) => el.remove());
    };
  }, []);


  // LESIK_PROFILE_TEST_RESULT_UNDER_NOTIFICATIONS_DIRECT
  useEffect(() => {
    const renderTestResultCard = () => {
      const pageText = document.body.innerText || "";

      if (!pageText.includes("УВЕДОМЛЕНИЯ") || !pageText.includes("КТО КЛИЕНТ")) {
        return;
      }

      let result: any = null;

      try {
        const raw = window.localStorage.getItem("lesik_test_result");
        result = raw ? JSON.parse(raw) : null;
      } catch {
        result = null;
      }

      const old = document.querySelector("[data-lesik-profile-test-result='true']");
      if (old) old.remove();

      const all = Array.from(document.querySelectorAll("body *")) as HTMLElement[];

      const title = all.find((el) => {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        return text === "УВЕДОМЛЕНИЯ";
      });

      if (!title) return;

      let card: HTMLElement | null = title;

      for (let i = 0; i < 10 && card; i += 1) {
        const text = (card.textContent || "").replace(/\s+/g, " ").trim();
        const rect = card.getBoundingClientRect();

        if (
          text.includes("УВЕДОМЛЕНИЯ") &&
          text.includes("Email") &&
          rect.width > 250 &&
          rect.height > 60 &&
          rect.height < 240
        ) {
          break;
        }

        card = card.parentElement;
      }

      if (!card) return;

      const resultCard = document.createElement("section");
      resultCard.setAttribute("data-lesik-profile-test-result", "true");
      resultCard.className = "profile-test-result-card-inline";

      const label = result?.label || "Тест ещё не пройден";
      const desc = result?.desc || "После прохождения теста здесь появится результат и акценты для карты контента.";
      const score = result?.score ?? 0;
      const maxScore = result?.maxScore ?? 50;
      const days = result?.days || "—";
      const focus = Array.isArray(result?.focus) ? result.focus : [];

      resultCard.innerHTML = `
        <div class="profile-test-result-head">
          <img src="/leaf-icon.png" alt="" />
          <strong>Результат теста</strong>
        </div>

        <div class="profile-test-result-main">
          <div class="profile-test-result-title">${label}</div>
          <div class="profile-test-result-desc">${desc}</div>
        </div>

        <div class="profile-test-result-note">
          ЛЕСik будет учитывать этот результат при построении профиля и карты контента.
        </div>

        ${
          focus.length
            ? `<div class="profile-test-result-tags">${focus.map((item: string) => `<span>${item}</span>`).join("")}</div>`
            : ""
        }

        <div class="profile-test-result-score">
          Счёт: ${score} из ${maxScore} · прогрев: ${days}
        </div>
      `;

      card.insertAdjacentElement("afterend", resultCard);
    };

    renderTestResultCard();

    const timer = window.setInterval(renderTestResultCard, 600);

    return () => {
      window.clearInterval(timer);
      document.querySelectorAll("[data-lesik-profile-test-result='true']").forEach((el) => el.remove());
    };
  }, []);


  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [profileNiche, setProfileNiche] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
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
          setHasProfile(true);
        }
        setProfileLoaded(true);

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
  const selectedDayIndex = selectedDay
    ? calendarDays.findIndex((item) => item.date === selectedDay.date)
    : -1;
  const tomorrowDay =
    selectedDayIndex >= 0 ? calendarDays[selectedDayIndex + 1] || null : null;
  const tomorrowTasks = tomorrowDay?.tasks || [];
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


  // Онбординг — если email не введён
  const [onboardStep, setOnboardStep] = useState<"welcome"|"test"|"result">("welcome");
  const [testStep, setTestStep] = useState(0);
  const [testAnswerError, setTestAnswerError] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testAnswers, setTestAnswers] = useState<number[]>([0, 0, 0, 0, 0]);

  const testQuestions = [
    "Считывается ли в блоге ваша экспертность? Появляется ли у подписчиков чувство «если нужно — только к ней»?",
    "Были ли уже упоминания о продукте или услуге?",
    "Поступают ли вопросы от подписчиков «когда можно купить / заказать»?",
    "Насколько интересно вас смотреть в сторис — реакции, ответы, вовлечённость?",
    "Есть ли у вас понятная система публикаций прямо сейчас?",
  ];

  const testTotal = testAnswers.reduce((a, b) => a + b, 0);

  const testResult = testTotal <= 20
    ? {
        days: "30+ дней",
        label: "Нужен фундамент",
        desc: "Сначала выстроим экспертность и доверие, потом продажи",
        level: "foundation",
        focus: ["экспертность", "доверие", "личные смыслы", "мягкие касания"]
      }
    : testTotal <= 35
    ? {
        days: "14–21 день",
        label: "Почти готова",
        desc: "Есть база — нужна система, регулярность и прогрев",
        level: "warmup",
        focus: ["регулярность", "прогрев", "снятие возражений", "кейсы"]
      }
    : {
        days: "7–14 дней",
        label: "Готова к продажам",
        desc: "Аудитория прогрета — нужен чёткий план и инструменты",
        level: "sales_ready",
        focus: ["офферы", "заявки", "продающие посты", "бот-воронка"]
      };

  const saveLesikTestResult = () => {
    if (typeof window === "undefined") return;

    const payload = {
      score: testTotal,
      maxScore: 50,
      answers: testAnswers,
      days: testResult.days,
      label: testResult.label,
      desc: testResult.desc,
      level: testResult.level,
      focus: testResult.focus,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem("lesik_test_result", JSON.stringify(payload));

    if (email) {
      localStorage.setItem(`lesik_test_result:${email}`, JSON.stringify(payload));
    }
  };

  const showOnboarding = !email || (profileLoaded && !hasProfile);
  if (false) {
    return (
      <section className="lesik-onboarding">
        {onboardStep === "welcome" && (
          <div className="onboard-welcome">
            <div className="onboard-badge">ЛЕС<span>ik</span></div>
            <h1>Система заявок через контент — без суеты и выгорания</h1>
            <p>За 5 минут поймёшь где ты сейчас и что нужно чтобы клиенты приходили сами</p>
            <div className="onboard-features">
              <div className="onboard-feature">
                <span>🗺</span>
                <p>Карта контента под твою нишу и цель</p>
              </div>
              <div className="onboard-feature">
                <span>📅</span>
                <p>Календарь публикаций на 14 дней</p>
              </div>
              <div className="onboard-feature">
                <span>🤖</span>
                <p>ИИ пишет посты и карусели за тебя</p>
              </div>
            </div>
            <button className="onboard-cta profile-green-map-button" onClick={() => setOnboardStep("test")}>
              Пройти тест — узнать свой результат
            </button>
            <p className="onboard-note">Бесплатно · 5 вопросов · 2 минуты</p>
          </div>
        )}

        {onboardStep === "test" && (
          <div className="onboard-test">
            <div className="onboard-badge">ЛЕС<span>ik</span></div>
            <h2>Тест: сколько дней нужно на прогрев?</h2>
            <p className="onboard-test-sub">Оцените каждый пункт от 1 до 10</p>
            {testQuestions.map((q, i) => (
              <div key={i} className="onboard-question">
                <p>{q}</p>
                <div className="onboard-slider-wrap">
                  <span>1</span>
                  <input
                    type="range" min={1} max={10} value={testAnswers[i]}
                    onChange={(e) => {
                      const next = [...testAnswers];
                      next[i] = Number(e.target.value);
                      setTestAnswers(next);
                    }}
                  />
                  <span>{testAnswers[i]}</span>
                </div>
              </div>
            ))}
            <button className="onboard-cta" onClick={() => setOnboardStep("result")}>
              Узнать результат
            </button>
          </div>
        )}

        {onboardStep === "result" && (
          <div className="onboard-result">
            <div className="onboard-badge">ЛЕС<span>ik</span></div>
            <div className="onboard-result-card">
              <p className="onboard-result-days">{testResult.days}</p>
              <h2>{testResult.label}</h2>
              <p>{testResult.desc}</p>
              <div className="onboard-result-score">Твой счёт: {testTotal} из 50</div>
            </div>
            <p className="onboard-result-cta-text">
              ЛЕСik поможет выстроить систему — от стратегии до готовых постов
            </p>
            <Link href="/app/profile" className="onboard-cta">
              Построить свою систему →
            </Link>
            <p className="onboard-note">Заполни профиль — и получишь карту контента под твою нишу</p>
          </div>
        )}

        <style jsx>{`
          .lesik-onboarding {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: linear-gradient(135deg, #f3eee4 0%, #e8f5ee 100%);
          }
          .onboard-welcome, .onboard-test, .onboard-result {
            max-width: 560px;
            width: 100%;
            text-align: center;
          }
          .onboard-badge {
            display: inline-block;
            padding: 6px 18px;
            background: #009b46;
            color: #fff;
            border-radius: 999px;
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 24px;
          }
          .onboard-badge span { color: #ffc238; }
          .onboard-welcome h1 {
            font-size: clamp(24px, 5vw, 36px);
            font-weight: 900;
            color: #1a1a1a;
            line-height: 1.2;
            margin-bottom: 14px;
          }
          .onboard-welcome p, .onboard-test-sub {
            color: #555;
            font-size: 16px;
            margin-bottom: 28px;
            line-height: 1.6;
          }
          .onboard-features {
            display: grid;
            gap: 12px;
            margin-bottom: 32px;
            text-align: left;
          }
          .onboard-feature {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            background: #fff;
            border-radius: 16px;
            border: 1px solid rgba(0,155,70,0.15);
          }
          .onboard-feature span { font-size: 28px; }
          .onboard-feature p { margin: 0; font-size: 15px; color: #333; font-weight: 600; }
          .onboard-cta {
            display: block;
            width: 100%;
            padding: 18px;
            background: #009b46;
            color: #fff;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
            margin-bottom: 12px;
          }
          .onboard-note {
            color: #999;
            font-size: 13px;
            margin: 0;
          }
          .onboard-test h2 {
            font-size: 26px;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .onboard-question {
            text-align: left;
            background: #fff;
            border-radius: 16px;
            padding: 16px 18px;
            margin-bottom: 12px;
            border: 1px solid rgba(0,155,70,0.15);
          }
          .onboard-question p {
            margin: 0 0 12px;
            font-size: 15px;
            color: #333;
            font-weight: 600;
            line-height: 1.5;
          }
          .onboard-slider-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .onboard-slider-wrap span {
            font-size: 13px;
            color: #009b46;
            font-weight: 700;
            min-width: 20px;
          }
          .onboard-slider-wrap input[type=range] {
            flex: 1;
            accent-color: #009b46;
          }
          .onboard-result-card {
            background: #fff;
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 24px;
            border: 2px solid #009b46;
          }
          .onboard-result-days {
            font-size: 48px;
            font-weight: 900;
            color: #009b46;
            margin: 0 0 8px;
          }
          .onboard-result-card h2 {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .onboard-result-card p {
            color: #555;
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 16px;
          }
          .onboard-result-score {
            display: inline-block;
            padding: 6px 16px;
            background: rgba(0,155,70,0.1);
            color: #009b46;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 700;
          }
          .onboard-result-cta-text {
            color: #555;
            font-size: 15px;
            margin-bottom: 16px;
            line-height: 1.6;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className={"lesik-home-screen " + rubik.variable} style={{ fontFamily: "var(--font-rubik, Rubik, Arial, sans-serif)" }}>
      {true && (
        <div style={{
          position: "relative",
          borderRadius: 28,
          background: "#f3efe6",
          border: "1px solid rgba(0,100,50,0.1)",
          padding: "36px 42px 30px",
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "minmax(430px, 0.78fr) minmax(650px, 1.22fr)",
          gap: 54,
          alignItems: "center",
          minHeight: 660,
          overflow: "hidden",
          fontFamily: "var(--font-rubik, Rubik, Arial, sans-serif)"
        }} className="main-hero-mobile-shell">
          {/* Фон деревьев */}
          <img
              src="/trees-bg.png"
              alt=""
              style={{
                position:"absolute",
                inset:0,
                width:"100%",
                height:"100%",
                objectFit:"cover",
                objectPosition:"right bottom",
                opacity:0.52,
                filter:"saturate(0.7) brightness(1.12) contrast(0.88)",
                pointerEvents:"none",
                zIndex:0
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position:"absolute",
                inset:0,
                zIndex:1,
                pointerEvents:"none",
                background:"linear-gradient(90deg, rgba(247,241,229,0.96) 0%, rgba(247,241,229,0.88) 36%, rgba(247,241,229,0.44) 64%, rgba(247,241,229,0.16) 100%)"
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position:"absolute",
                right:"22%",
                top:0,
                width:"34%",
                height:"100%",
                zIndex:1,
                pointerEvents:"none",
                background:"rgba(247,241,229,0.36)",
                transform:"skewX(-18deg)",
                transformOrigin:"top right"
              }}
            />
            <div aria-hidden="true" style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", background:"linear-gradient(90deg, rgba(255,250,240,0.92) 0%, rgba(255,250,240,0.82) 32%, rgba(255,250,240,0.36) 58%, rgba(255,250,240,0.08) 100%)" }} />
            <div aria-hidden="true" style={{ position:"absolute", top:0, right:"20%", width:"34%", height:"100%", zIndex:1, pointerEvents:"none", background:"rgba(255,250,240,0.34)", transform:"skewX(-18deg)", transformOrigin:"top right" }} />

          {/* Левая колонка */}
          
            <div
              aria-hidden="true"
              style={{
                position:"absolute",
                inset:0,
                zIndex:1,
                pointerEvents:"none",
                background:"linear-gradient(90deg, rgba(246,239,224,0.98) 0%, rgba(246,239,224,0.92) 40%, rgba(246,239,224,0.42) 68%, rgba(246,239,224,0.18) 100%)"
              }}
            />

<div className="main-hero-mobile-left" style={{ position:"relative", zIndex:2, paddingBottom:0, paddingRight:0, paddingLeft:0 }}>
            {/* Лого */}
            <div className="main-hero-mobile-logo-row" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <div style={{ width:50, height:50, borderRadius:18, background:"#1a3a2a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <img src="/leaf-icon.png" style={{ width:28, height:28, filter:"brightness(0) invert(1)" }} alt=""/>
              </div>
              <span style={{ fontSize:26, fontWeight:900, color:"#0a2e18", letterSpacing:"-0.02em" }}>ЛЕС<span style={{ color:"#009b46" }}>ik</span></span>
              <span style={{ width:1, height:16, background:"rgba(0,0,0,0.2)", margin:"0 6px" }}/>
              <span className="main-hero-mobile-tagline" style={{ fontSize:18, fontWeight:500, color:"#aaa", letterSpacing:"0.06em", textTransform:"uppercase" }}>КЛИЕНТЫ ИЗ СОЦ СЕТЕЙ</span>
            </div>

            {/* Заголовок */}
            <h1 className="main-hero-mobile-title" style={{ fontSize:"54px", fontWeight:900, lineHeight:1.05, margin:"0 0 6px", letterSpacing:"-0.04em" }}>
              <span style={{ color:"#0a2e18" }}>Собери свою</span><br/>
              <span style={{ color:"#0a5c3a" }}>контент-воронку</span><br/>
              <span style={{ color:"#0a2e18" }}>с ботом</span>
            </h1>

            {/* Волна */}
            <svg style={{ margin:"4px 0 14px", display:"block" }} width="180" height="20" viewBox="0 0 180 20" fill="none">
              <path d="M2 14 C15 4 28 18 45 10 C58 4 70 16 88 10 C102 5 115 15 130 9 C145 4 158 14 175 8" stroke="#0a5c3a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
            </svg>

            {/* Подзаголовок */}
            <p className="main-hero-mobile-subtitle" style={{ fontSize:20, color:"#444", margin:"0 0 22px", lineHeight:1.5, maxWidth:"100%", fontWeight:500 }}>
              Расскажи о себе и продукте —<br/><span className="main-hero-mobile-nowrap-fix" style={{ whiteSpace:"normal" }}><strong style={{ color:"#0a5c3a", fontWeight:800 }}>получи готовую систему:</strong> что писать, куда вести людей</span><br/>и что делать каждый день
            </p>

            {/* Шаги */}
            <div className="main-hero-mobile-steps" style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8, marginBottom:24 }}>
              {([["1","Заполни профиль — расскажи о себе и цели"],["2","ИИ соберёт карту контента под твою нишу"],["3","Получи календарь постов и готовые тексты"]] as [string,string][]).map(([n,t]) => (
                <div key={n} className="main-hero-mobile-step-pill" style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(220,232,222,0.15)", border:"1px solid rgba(10,92,58,0.15)", borderRadius:18, padding:"10px 18px", backdropFilter:"blur(8px)" }}>
                  <b style={{ width:26, height:26, borderRadius:18, background:"#0a5c3a", color:"#fff", fontSize:13, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{n}</b>
                  <span className="step-item" style={{ fontSize:15, fontWeight:400, color:"#1a1a1a" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Кнопки */}
            <div className="main-hero-mobile-actions" style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:14 }}>
              <Link href="/app/profile" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 24px", background:"#0a5c3a", borderRadius:18, fontSize:15, fontWeight:800, textDecoration:"none", boxShadow:"0 4px 16px rgba(10,92,58,0.35)" }} className="funnel-cta-soft-font">
                <img src="/leaf-icon.png" style={{ width:22, height:22, filter:"brightness(0) invert(1)", flexShrink:0 }} alt=""/>
                <span style={{ color:"#ffffff", WebkitTextFillColor:"#ffffff" }}>Собрать свою воронку →</span>
              </Link>
              <button type="button" onClick={() => setTestModalOpen(true)}
                style={{ padding:"14px 24px", background:"transparent", color:"#0a5c3a", border:"2px solid rgba(10,92,58,0.3)", borderRadius:18, fontSize:15, fontWeight:800, cursor:"pointer" }}>
                Пройти тест
              </button>
            </div>

            <p style={{ margin:0, fontSize:12, color:"#888", display:"flex", alignItems:"center", gap:5 }}>
              <img src="/leaf-icon.png" style={{ width:20, height:20, flexShrink:0 }} alt=""/>
              Без сложных настроек. Всё просто и понятно
            </p>
          </div>

          {/* Правая колонка */}
          <div className="main-hero-mobile-right" style={{ position:"relative", zIndex:2, height:620, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:0, paddingBottom:0, paddingRight:8, overflow:"visible" }}>
            {/* Карточки */}
            <div style={{ position:"absolute", left:86, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", justifyContent:"center", gap:22, paddingBottom:0, zIndex:8, overflow:"visible" }}>
              {([
                { icon: "clipboard", title: "Твой план контента" },
                { icon: "calendar", title: "Календарь постов" },
                { icon: "robot", title: "Бот-воронка,\nкоторая ведёт\nк заявке" },
              ] as {icon:string,title:string}[]).map((card, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, overflow:"visible", position:"relative", zIndex:8, transform: i === 2 ? "translateY(18px)" : "none" }}>
                  <div style={{ background:"rgba(255,255,255,0.96)", borderRadius:18, padding:"10px 10px", boxShadow:"0 16px 34px rgba(20,40,25,0.10)", border:"1px solid rgba(180,210,180,0.45)", width:132, minHeight:112, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ marginBottom:8 }}>
                      {card.icon === "clipboard" && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a5c3a" strokeWidth="2" strokeLinecap="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-2"/><path d="M9 12l2 2 4-4"/></svg>}
                      {card.icon === "calendar" && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a5c3a" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="8" cy="15" r="1" fill="#0a5c3a"/><circle cx="12" cy="15" r="1" fill="#0a5c3a"/><circle cx="16" cy="15" r="1" fill="#0a5c3a"/></svg>}
                      {card.icon === "robot" && <svg width="60" height="60" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <circle cx="32" cy="8" r="4" fill="#06452e"/>
  <path d="M32 12V19" stroke="#06452e" strokeWidth="3.4" strokeLinecap="round"/>
  <rect x="12" y="20" width="40" height="32" rx="12" fill="#06452e"/>
  <rect x="18" y="25" width="28" height="22" rx="8" fill="#0f6b45" stroke="#ffffff" strokeWidth="2.4"/>
  <circle cx="27" cy="35" r="3.2" fill="#ffffff"/>
  <circle cx="37" cy="35" r="3.2" fill="#ffffff"/>
  <path d="M25 40 Q32 47 39 40" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" fill="none"/>
  <path d="M12 35H7" stroke="#06452e" strokeWidth="4.4" strokeLinecap="round"/>
  <path d="M57 35H52" stroke="#06452e" strokeWidth="4.4" strokeLinecap="round"/>
</svg>}
                    </div>
                    <div style={{ fontSize:12, fontWeight:500, color:"#1a1a1a", lineHeight:1.2, whiteSpace:"pre-line" }}>{card.title}</div>
                  </div>
                    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" style={{ flexShrink:0, marginLeft:8, marginRight:0, position:"relative", zIndex:9, overflow:"visible" }}>
                      <path d="M4 20 C18 8 34 8 47 17" stroke="#06452e" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 6" fill="none"/>
                      <path d="M44 9L55 17L43 25" stroke="#06452e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>

                </div>
              ))}
            </div>

            {/* Телефон */}
            <div style={{ flexShrink:0, zIndex:3 }}>
              <img src="/phone-mockup.png" alt="ЛЕСik"
                style={{
                  width:365,
                  maxWidth:"none",
                  display:"block",
                  filter:"drop-shadow(0 24px 46px rgba(0,0,0,0.22)) contrast(1.08) saturate(1.04)",
                  transform:"translateX(-42px) perspective(1400px) rotateY(-15deg) rotateZ(5deg) translateZ(0)",
                  transformOrigin:"center bottom",
                  imageRendering:"auto",
                  backfaceVisibility:"hidden",
                  WebkitBackfaceVisibility:"hidden",
                  willChange:"transform",
                  transformStyle:"preserve-3d",
                  position:"relative",
                  zIndex:3
                }} />
            </div>
          </div>
        </div>
      )}
      {testModalOpen && (
        <div className="lesik-test-modal-overlay" style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => { setTestModalOpen(false); setOnboardStep("welcome"); setTestStep(0); }}>
          <div className="lesik-test-modal-shell" style={{ position:"relative", width:"100%", maxWidth:700, borderRadius:18, background:"#f3efe6", overflow:"hidden", padding:"40px 44px 44px", backgroundImage:"url(/trees-bg.png)", backgroundSize:"cover", backgroundPosition:"right center", backgroundRepeat:"no-repeat" }}
            onClick={(e) => e.stopPropagation()}>



            {/* Листья слева */}
            <svg style={{ position:"absolute", left:-10, bottom:20, width:120, pointerEvents:"none", opacity:0.6 }} viewBox="0 0 120 180" fill="none">
              <path d="M30 170 C40 130 30 90 50 50 C65 20 100 15 105 55 C110 90 80 130 30 170Z" fill="#4a8a4a" opacity="0.5"/>
              <path d="M30 170 C55 130 75 90 85 50" stroke="#3a7a3a" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <path d="M55 110 C45 100 40 85 50 75" stroke="#3a7a3a" strokeWidth="1" fill="none" opacity="0.5"/>
              <path d="M70 85 C60 75 58 60 65 52" stroke="#3a7a3a" strokeWidth="1" fill="none" opacity="0.5"/>
            </svg>

            {/* Закрыть */}
            <button type="button" onClick={() => { setTestModalOpen(false); setOnboardStep("welcome"); setTestStep(0); }}
              style={{ position:"absolute", top:16, right:16, width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,0.08)", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#333" }}>×</button>

            {/* Заголовок */}
            
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <h2 style={{ margin:0, fontSize:"clamp(28px,4vw,42px)", fontWeight:950, color:"#0a2e18", letterSpacing:"-0.04em" }}>
                {onboardStep === "result" ? "Твой результат" : `Вопрос ${testStep + 1} из ${testQuestions.length}`}
              </h2>
              <span style={{fontSize:22, opacity:0.7}}>🌿</span>
            </div>
            <svg style={{ margin:"4px 0 24px", display:"block" }} width="100" height="12" viewBox="0 0 100 12" fill="none">
              <path d="M2 8 C18 2 34 10 50 6 C66 2 82 9 98 5" stroke="#0a5c3a" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5"/>
            </svg>

              {onboardStep !== "result" && (
                <div className="lesik-test-question-card" style={{ position:"relative", background:"rgba(255,255,255,0.85)", borderRadius:18, padding:"28px 28px 24px", backdropFilter:"blur(8px)", border:"1px solid rgba(10,92,58,0.1)" }}>
                  <div style={{ display:"flex", gap:6, marginBottom:22 }}>
                    {testQuestions.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex:1,
                          height:4,
                          borderRadius:18,
                          background: i <= testStep ? "#0a5c3a" : "rgba(0,0,0,0.1)",
                          transition:"background 0.2s"
                        }}
                      />
                    ))}
                  </div>

                  <p style={{ fontSize:16, fontWeight:600, color:"#1a1a1a", marginBottom:24, lineHeight:1.55 }}>
                    {testQuestions[testStep]}
                  </p>

                  <div className="lesik-test-rating-grid" style={{ display:"flex", flexWrap:"nowrap", gap:4, marginBottom:28 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          const next = [...testAnswers];
                          next[testStep] = n;
                          setTestAnswers(next);
                          setTestAnswerError("");
                        }}
                        style={{
                          width:54,
                          height:54,
                          borderRadius:18,
                          border:"2px solid",
                          flexShrink:0,
                          borderColor: testAnswers[testStep] === n ? "#0a5c3a" : "rgba(0,0,0,0.12)",
                          background: testAnswers[testStep] === n ? "#0a5c3a" : "rgba(255,255,255,0.9)",
                          color: testAnswers[testStep] === n ? "#fff" : "#1a1a1a",
                          fontSize:16,
                          fontWeight:800,
                          cursor:"pointer",
                          transition:"all 0.15s ease",
                          boxShadow: testAnswers[testStep] === n ? "0 4px 14px rgba(10,92,58,0.35)" : "0 2px 6px rgba(0,0,0,0.06)"
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="modal-test-actions" style={{ display:"flex", gap:10 }}>
                    {testStep > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTestAnswerError("");
                          setTestStep((s) => s - 1);
                        }}
                        style={{
                          flex:1,
                          height:56,
                          border:"2px solid rgba(10,92,58,0.25)",
                          borderRadius:14,
                          background:"rgba(255,255,255,0.85)",
                          color:"#0a5c3a",
                          fontSize:15,
                          fontWeight:800,
                          cursor:"pointer"
                        }}
                      >
                        ← Назад
                      </button>
                    )}

                    <button
                      type="button"
                      className="modal-test-next-btn"
                      onClick={() => {
                        if (!testAnswers[testStep] || testAnswers[testStep] < 1) {
                          alert("Выберите честный ответ — иначе результат будет неточным, а продаж не будет 😈");
                          return;
                        }

                        setTestAnswerError("");

                        if (testStep < testQuestions.length - 1) {
                          setTestStep((s) => s + 1);
                        } else {
                          if (typeof saveLesikTestResult === "function") {
                            saveLesikTestResult();
                          }
                          setOnboardStep("result");
                        }
                      }}
                      style={{
                        flex:1,
                        width:"100%",
                        height:56,
                        minHeight:56,
                        maxHeight:56,
                        display:"inline-flex",
                        alignItems:"center",
                        justifyContent:"center",
                        gap:8,
                        padding:"0 24px",
                        background:"#0a5c3a",
                        color:"#ffffff",
                        border:"none",
                        borderRadius:14,
                        fontSize:15,
                        fontWeight:800,
                        cursor:"pointer",
                        boxShadow:"0 4px 16px rgba(10,92,58,0.25)",
                        visibility:"visible",
                        opacity:1
                      }}
                    >
                      <img
                        src="/leaf-icon.png"
                        alt=""
                        style={{
                          width:18,
                          height:18,
                          maxWidth:18,
                          maxHeight:18,
                          minWidth:18,
                          minHeight:18,
                          display:"inline-block",
                          objectFit:"contain",
                          filter:"brightness(0) invert(1)",
                          flexShrink:0
                        }}
                      />
                      <span style={{ color:"#ffffff", WebkitTextFillColor:"#ffffff" }}>
                        {testStep < testQuestions.length - 1 ? "Следующий вопрос →" : "Узнать результат →"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {onboardStep === "result" && (
              <div style={{ background:"#ffffff", borderRadius:18, padding:"28px", border:"1px solid rgba(10,92,58,0.1)", textAlign:"center" }}>
                <p style={{ fontSize:56, fontWeight:950, color:"#0a5c3a", margin:"0 0 4px", letterSpacing:"-0.04em" }}>{testResult.days}</p>
                <h3 style={{ fontSize:22, fontWeight:800, margin:"0 0 10px", color:"#0a2e18" }}>{testResult.label}</h3>
                <p style={{ color:"#555", lineHeight:1.6, marginBottom:20 }}>{testResult.desc}</p>
                <div style={{ display:"inline-block", padding:"6px 16px", background:"rgba(10,92,58,0.1)", color:"#0a5c3a", borderRadius:18, fontSize:14, fontWeight:700, marginBottom:24 }}>
                  Твой счёт: {testTotal} из 50
                </div>
                <a href="/app/profile" className="profile-green-map-button" onClick={() => setTestModalOpen(false)} style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", background:"#0a5c3a", borderRadius:18, textDecoration:"none", fontSize:16, fontWeight:800, boxShadow:"0 4px 18px rgba(10,92,58,0.4)" }}>
                  <span style={{color:"#ffffff !important" as any, fontWeight:800, WebkitTextFillColor:"#ffffff"}}>Построить свою систему →</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      

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
            <div className="daily-goals-empty-combined">
              <p className="daily-goals-regular-text">
                Сначала сформируйте карту контента. После этого ЛЕС<span className="brand-ik daily-goals-brand-regular">ik</span> покажет цели на день, и они будут сформированы ИИ по каждому дню
              </p>

              <Link href="/app/content-map" className="daily-goals-map-button">
                Сформировать карту
              </Link>
            </div>
          ) : !selectedDay ? (
            <div className="daily-goals-empty daily-goals-empty-clean">Выберите день в календаре.</div>
          ) : (
            <>
              <div className="insta-selected-day-card">
                <div className="insta-selected-day-title">
                  {formatHumanDate(selectedDay.date)} · {selectedDay.title}
                </div>
                <div className="insta-selected-day-subtitle">
                  {selectedDay.description.replace(/\.+$/, "")}
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
              <button
                type="button"
                className="open-calendar-button"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => setInstaCalendarOpen(true)}
              >
                Открыть календарь
              </button>
</>
          )}
        </section>



        {tomorrowDay && (
          <section className="ios-glass-card goals-ios-card tomorrow-ios-card">
            <div className="ios-card-head">
              <div>
                <p className="home-kicker">Завтра</p>
                <h2>На следующий день</h2>
              </div>
            </div>

            <div className="insta-selected-day-card">
              <div className="insta-selected-day-title">
                {formatHumanDate(tomorrowDay.date)} · {tomorrowDay.title}
              </div>
              <div className="insta-selected-day-subtitle">
                {tomorrowDay.description.replace(/\.+$/, "")}
              </div>
            </div>

            <div className="daily-goals-list">
              {tomorrowTasks.map((task) => {
                const done = completedForDay(tomorrowDay.date).includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    className={done ? "daily-goal-item is-done" : "daily-goal-item"}
                    onClick={() => toggleTask(tomorrowDay.date, task.id)}
                  >
                    <span className="daily-goal-check" />
                    <span className="daily-goal-text">{task.text}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      


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
                    {selectedDay.title} · {selectedDay.description.replace(/\.+$/, "")}
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
                      Перейдите в бота и нажмите Start. После подключения ЛЕС<span className="brand-ik">ik</span> сможет
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














